// AI assistant features: reply generator, floating "Unire AI" chat (Explore),
// in-modal "AI Assistant" (household summary), and the Thợ Việt booking modal.
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";
import { THOVIET_LOGO } from "../data.js";

const fmtTrieu = (n) => {
  const t = n / 1000000;
  return (Number.isInteger(t) ? t : t.toFixed(1)) + " triệu";
};

/* ---------------------------------------------------------------------- *
 * Reply generator — pure function, ported as-is from the React prototype. *
 * ---------------------------------------------------------------------- */
export function generateReply(query, households) {
  const q = query.toLowerCase();

  let area = null;
  if (/bình thạnh|binh thanh|b\.?thạnh/.test(q)) area = "Bình Thạnh";
  else if (/quận 1|quan 1|district 1|\bq1\b|trung tâm/.test(q)) area = "District 1";

  let budget = null;
  const bm = q.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr\b|tr\.|củ)/);
  if (bm) budget = parseFloat(bm[1].replace(",", ".")) * 1000000;

  let people = null;
  const pm = q.match(/(\d+)\s*(người|ng\b|bạn|đứa)/);
  if (pm) people = parseInt(pm[1], 10);

  const hasCommute = /\d+\s*km|cách (nhà|chỗ|công ty|trường)|phút (chạy|đi|xe)|giờ cao điểm|gần (chỗ làm|công ty)/.test(q);

  const kwMap = {
    "rẻ": "giá rẻ", "giá rẻ": "giá rẻ", "tiết kiệm": "giá rẻ", "sinh viên": "giá rẻ",
    "yên tĩnh": "yên tĩnh", "an ninh": "an ninh tốt", "an toàn": "an ninh tốt",
    "rộng": "rộng rãi", "share": "cho share", "ở ghép": "cho share", "ở chung": "cho share",
    "gác": "có gác lửng", "gác lửng": "có gác lửng",
    "gần trường": "gần trường", "đại học": "gần trường",
    "mới": "mới xây", "cao cấp": "cao cấp", "sang": "cao cấp", "đẹp": "cao cấp",
    "ban công": "ban công",
  };
  const wantedTags = [];
  Object.entries(kwMap).forEach(([k, v]) => {
    if (q.includes(k) && !wantedTags.includes(v)) wantedTags.push(v);
  });

  const ranked = households
    .map((h) => {
      const avail = h.totalRooms - h.occupied;
      let score = h.rating;
      const reasons = [];
      if (area && h.area === area) { score += 4; reasons.push(`đúng khu ${h.area}`); }
      if (budget) {
        if (h.price <= budget * 1.05) { score += 3; reasons.push(`${fmtTrieu(h.price)}/tháng — hợp ngân sách`); }
        else { score -= 2.5; }
      }
      if (people) {
        if (h.capacity >= people) { score += 3; reasons.push(`ở thoải mái ${h.capacity} người`); }
        else { score -= 3; }
      }
      wantedTags.forEach((t) => { if (h.tags.includes(t)) { score += 2; reasons.push(t); } });
      if (avail > 0) score += 1; else score -= 6;
      return { h, score, reasons, avail };
    })
    .filter((r) => r.avail > 0)
    .sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, 2);

  const totalReviews = households.reduce((s, h) => s + h.reviews, 0);
  let text = `Mình đã xem bản đồ khu vực, lọc phòng còn trống và tóm tắt ${totalReviews} review của người thuê trước`;
  const crit = [];
  if (area) crit.push(`khu vực ${area}`);
  if (budget) crit.push(`ngân sách ~${fmtTrieu(budget)}`);
  if (people) crit.push(`${people} người ở`);
  if (wantedTags.length) crit.push(wantedTags.join(", "));
  if (crit.length) text += `, lọc theo: ${crit.join(" · ")}`;
  text += top.length
    ? ". Dưới đây là lựa chọn khớp nhất:"
    : ". Hiện chưa có nơi nào còn trống khớp tiêu chí — bạn thử nới ngân sách hoặc khu vực nhé.";
  if (hasCommute) {
    text += " (Mình đã ưu tiên trọ gần khu vực bạn đề cập — bật chia sẻ vị trí để mình tính chính xác quãng đường & thời gian di chuyển giờ cao điểm.)";
  }

  return {
    role: "ai",
    text,
    suggestions: top.map((r, i) => ({
      ...r.h,
      reasons: r.reasons.length ? r.reasons : [`đánh giá ${r.h.rating}★`, `${r.avail} phòng trống`],
      match: Math.round(Math.min(97, 68 + r.reasons.length * 8 + (i === 0 ? 4 : 0))),
    })),
  };
}

export const FLOATING_AI_CHIPS = [
  "Trọ Bình Thạnh dưới 3 triệu",
  "Trọ cách trường 2km, đi 5 phút",
  "Phòng cho 3 người ở share",
  "Nơi nào review chủ dễ tính?",
];
export const ASSISTANT_AI_CHIPS = [
  "Trọ Bình Thạnh dưới 3 triệu",
  "Phòng cho 3 người share",
  "Chỗ yên tĩnh, an ninh tốt",
];
export const FLOATING_AI_INTRO =
  "Xin chào! Mình là Unire AI — trợ lý tìm trọ thông minh 3-trong-1: 🗺️ xem bản đồ & đo khoảng cách tới trường, 💬 tóm tắt review người thuê trước thành ưu/nhược, 🔍 lọc phòng hợp ý. Chỉ cần 1 câu chat, mình lo hết!";

/* ---------------------------------------------------------------------- *
 * Suggestion-card renderers (shared shape, two slightly different skins)  *
 * ---------------------------------------------------------------------- */
function floatingSuggestionCard(s) {
  return `
    <div class="bg-white rounded-xl overflow-hidden" style="box-shadow:0 0 0 1px #aadeff">
      <div class="flex gap-2.5 p-2.5">
        <div class="h-14 w-14 rounded-lg overflow-hidden shrink-0" style="background:#d4eeff">
          ${s.photo ? `<img src="${s.photo}" alt="${escapeHtml(s.name)}" class="w-full h-full object-cover" />` : ""}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-1">
            <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(s.name)}</p>
            <span class="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style="background:#d4eeff;color:#44ACFF">${s.match}% hợp</span>
          </div>
          <p class="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
            ${icon("MapPin", { className: "h-2.5 w-2.5" })}${escapeHtml(s.area)} · ${escapeHtml(s.roomType)}
          </p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] font-bold" style="color:#44ACFF">${fmtTrieu(s.price)}/th</span>
            <span class="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">${icon("Star", { className: "h-2.5 w-2.5 fill-amber-400 text-amber-400" })}${s.rating}</span>
          </div>
        </div>
      </div>
      ${s.nearby ? `
        <div class="px-2.5 py-2 border-t border-slate-100" style="background:#f7fbff">
          <p class="text-[9px] font-bold flex items-center gap-1 mb-1" style="color:#44ACFF">${icon("MapPin", { className: "h-2.5 w-2.5" })} THỔ ĐỊA — TIỆN ÍCH XUNG QUANH</p>
          <div class="flex flex-wrap gap-1">
            ${s.nearby.map((n) => `<span class="text-[9px] text-slate-600 bg-white px-1.5 py-0.5 rounded" style="box-shadow:0 0 0 1px #e2e8f0">📍 ${escapeHtml(n)}</span>`).join("")}
          </div>
        </div>` : ""}
      ${s.review ? `
        <div class="px-2.5 py-2 border-t border-slate-100" style="background:#fffdf5">
          <p class="text-[9px] font-bold flex items-center gap-1 mb-1 text-amber-600">${icon("MessageCircle", { className: "h-2.5 w-2.5" })} TÓM TẮT REVIEW NGƯỜI THUÊ</p>
          <p class="text-[10px] text-emerald-700 leading-snug"><span class="font-bold">Ưu:</span> ${escapeHtml(s.review.pros)}</p>
          <p class="text-[10px] text-rose-600 leading-snug mt-0.5"><span class="font-bold">Nhược:</span> ${escapeHtml(s.review.cons)}</p>
          <p class="text-[10px] text-slate-700 leading-snug mt-1 pt-1 border-t border-amber-100"><span class="font-bold" style="color:#44ACFF">💡 Unire khuyên:</span> ${escapeHtml(s.review.verdict)}</p>
        </div>` : ""}
      <div class="flex flex-wrap gap-1 px-2.5 py-2 border-t border-slate-100">
        ${s.reasons.slice(0, 3).map((r) => `<span class="text-[9px] px-1.5 py-0.5 rounded" style="color:#44ACFF;background:#eaf6ff;box-shadow:0 0 0 1px #d4eeff">✓ ${escapeHtml(r)}</span>`).join("")}
      </div>
    </div>`;
}

function assistantSuggestionCard(s) {
  return `
    <div class="bg-white ring-1 ring-teal-200 rounded-xl overflow-hidden">
      <div class="flex gap-2.5 p-2.5">
        <div class="h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-teal-100">
          ${s.photo ? `<img src="${s.photo}" alt="${escapeHtml(s.name)}" class="w-full h-full object-cover" />` : ""}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-1">
            <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(s.name)}</p>
            <span class="shrink-0 text-[9px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-full">${s.match}% hợp</span>
          </div>
          <p class="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">${icon("MapPin", { className: "h-2.5 w-2.5" })}${escapeHtml(s.area)} · ${escapeHtml(s.roomType)}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] font-bold text-teal-700">${fmtTrieu(s.price)}/th</span>
            <span class="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">${icon("Star", { className: "h-2.5 w-2.5 fill-amber-400 text-amber-400" })}${s.rating}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-1 px-2.5 pb-2.5">
        ${s.reasons.slice(0, 3).map((r) => `<span class="text-[9px] text-teal-700 bg-teal-50 ring-1 ring-teal-100 px-1.5 py-0.5 rounded">✓ ${escapeHtml(r)}</span>`).join("")}
      </div>
    </div>`;
}

function thinkingDots(extraClass, color) {
  const style = (delay) => `animation:aiDot 1s infinite${delay ? `;animation-delay:${delay}` : ""}${color ? `;background:${color}` : ""}`;
  return `
    <span class="h-1.5 w-1.5 rounded-full ${extraClass}" style="${style("")}"></span>
    <span class="h-1.5 w-1.5 rounded-full ${extraClass}" style="${style(".2s")}"></span>
    <span class="h-1.5 w-1.5 rounded-full ${extraClass}" style="${style(".4s")}"></span>`;
}

/* ---------------------------------------------------------------------- *
 * FloatingUnireAI — draggable global assistant button + chat panel        *
 * ---------------------------------------------------------------------- */
export function floatingUnireAI(state) {
  const ai = state.floatingAI;
  const SZ = 60;

  if (ai.open) {
    return `
      <div class="absolute inset-0 z-50 flex flex-col" id="floatingAIPanel">
        <div class="flex-1 bg-slate-900/50" data-action="floatingAIClose"></div>
        <div class="bg-white rounded-t-3xl shadow-2xl flex flex-col" style="height:84%;animation:popIn .25s ease-out">
          <div class="rounded-t-3xl px-4 py-3" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
            <div class="flex items-center gap-2.5">
              <div class="h-9 w-9 rounded-xl bg-white/20 grid place-items-center">${icon("Sparkles", { className: "h-5 w-5 text-white" })}</div>
              <div class="leading-tight flex-1">
                <p class="text-sm font-extrabold text-white">Unire AI</p>
                <p class="text-[10px] text-white/85 flex items-center gap-1">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-300 inline-block"></span>
                  Trợ lý tìm trọ thông minh 3-trong-1
                </p>
              </div>
              <button data-action="floatingAIClose" class="h-8 w-8 grid place-items-center bg-white/15 hover:bg-white/25 rounded-full transition">${icon("X", { className: "h-4 w-4 text-white" })}</button>
            </div>
            <div class="flex gap-1.5 mt-2.5">
              ${[["MapPin", "Bản đồ thổ địa"], ["MessageCircle", "Tóm tắt review"], ["Search", "Lọc phòng"]].map(([ic, label]) => `
                <div class="flex-1 flex items-center gap-1 bg-white/15 rounded-lg px-1.5 py-1">
                  ${icon(ic, { className: "h-3 w-3 text-white shrink-0" })}
                  <span class="text-[8.5px] font-semibold text-white truncate">${label}</span>
                </div>`).join("")}
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50" data-scroll="floatingAI">
            ${ai.messages.map((m) => floatingMessage(m)).join("")}
            ${ai.thinking ? `
              <div class="flex gap-2">
                <div class="h-7 w-7 rounded-lg grid place-items-center shrink-0" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">${icon("Sparkles", { className: "h-3.5 w-3.5 text-white" })}</div>
                <div class="bg-white ring-1 ring-slate-200 px-3 py-2.5 rounded-2xl rounded-tl-md">
                  <div class="flex items-center gap-1.5">
                    ${thinkingDots("", "#44ACFF")}
                    <span class="text-[10px] text-slate-400 ml-1">Đang xem bản đồ &amp; đọc review...</span>
                  </div>
                </div>
              </div>` : ""}
          </div>

          ${ai.messages.length <= 1 ? `
            <div class="flex flex-wrap gap-1.5 px-3 pt-2 bg-slate-50">
              ${FLOATING_AI_CHIPS.map((c) => `<button data-action="floatingAISendChip" data-chip="${escapeHtml(c)}" class="text-[10px] font-medium px-2 py-1 rounded-full bg-white transition" style="color:#44ACFF;box-shadow:0 0 0 1px #aadeff">${escapeHtml(c)}</button>`).join("")}
            </div>` : ""}

          <div class="flex items-center gap-2 p-3 bg-slate-50 border-t border-slate-100">
            <input data-action="floatingAIInput" data-enter-action="floatingAISend" value="${escapeHtml(ai.input)}"
                   placeholder="Nhập 1 câu — AI tự xem bản đồ, lọc phòng, dịch review..."
                   class="flex-1 text-xs bg-white ring-1 ring-slate-200 rounded-full px-3.5 py-2.5 outline-none transition" />
            <button data-action="floatingAISend" ${!ai.input.trim() || ai.thinking ? "disabled" : ""}
                    class="h-9 w-9 grid place-items-center rounded-full transition shrink-0 active:scale-95 disabled:opacity-40" style="background:#44ACFF">
              ${icon("Send", { className: "h-4 w-4 text-white" })}
            </button>
          </div>
        </div>
      </div>`;
  }

  const teaserAbove = ai.pos.y > 130;
  return `
    ${ai.teaser ? `
      <div class="absolute z-40 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 p-3 pr-7"
           style="left:${Math.min(ai.pos.x, 180)}px; top:${teaserAbove ? ai.pos.y - 78 : ai.pos.y + SZ + 12}px; max-width:224px; animation:popIn .3s ease-out">
        <button data-action="floatingAITeaserClose" class="absolute top-1.5 right-1.5 h-5 w-5 grid place-items-center hover:bg-slate-100 rounded-full">${icon("X", { className: "h-3 w-3 text-slate-400" })}</button>
        <p class="text-xs text-slate-700 leading-relaxed">
          <span class="font-bold" style="color:#44ACFF">Xin chào!</span> Tôi là trợ thủ tìm nhà đắc lực Unire 👋
        </p>
      </div>` : ""}
    <button id="floatingAIBtn" data-action="floatingAIOpen"
            class="absolute z-40 rounded-full grid place-items-center shadow-2xl select-none"
            style="left:${ai.pos.x}px; top:${ai.pos.y}px; width:${SZ}px; height:${SZ}px;
                   background:linear-gradient(135deg,#44ACFF,#89D4FF);
                   cursor:${ai.dragging ? "grabbing" : "grab"}; touch-action:none;
                   transform:${ai.dragging ? "scale(1.08)" : "scale(1)"};
                   transition:${ai.dragging ? "transform .1s" : "transform .15s"};
                   animation:${ai.teaser && !ai.dragging ? "aiPulse 2s infinite" : "none"}">
      ${icon("Sparkles", { className: "h-7 w-7 text-white pointer-events-none" })}
      ${ai.teaser ? `<span class="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full grid place-items-center text-[9px] font-black text-white pointer-events-none" style="background:#FE9EC7">1</span>` : ""}
      <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400 whitespace-nowrap pointer-events-none">
        ${ai.dragging ? "Thả để đặt" : "Kéo để di chuyển"}
      </span>
    </button>`;
}

function floatingMessage(m) {
  if (m.role === "user") {
    return `
      <div class="flex justify-end">
        <div class="max-w-[82%] text-white text-xs leading-relaxed px-3 py-2 rounded-2xl rounded-br-md" style="background:#44ACFF">${escapeHtml(m.text)}</div>
      </div>`;
  }
  return `
    <div class="flex gap-2">
      <div class="h-7 w-7 rounded-lg grid place-items-center shrink-0" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">${icon("Sparkles", { className: "h-3.5 w-3.5 text-white" })}</div>
      <div class="flex-1 min-w-0">
        <div class="bg-white ring-1 ring-slate-200 text-xs leading-relaxed text-slate-700 px-3 py-2 rounded-2xl rounded-tl-md">${escapeHtml(m.text)}</div>
        ${m.suggestions && m.suggestions.length ? `<div class="mt-2 space-y-2.5">${m.suggestions.map(floatingSuggestionCard).join("")}</div>` : ""}
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------- *
 * AIAssistant — embedded chat inside the household summary modal          *
 * ---------------------------------------------------------------------- */
export function aiAssistant(state, currentHousehold) {
  const ai = state.assistantAI;
  if (!ai.open) {
    return `
      <button data-action="assistantAIOpen" class="mt-3 w-full flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 ring-1 ring-teal-200 hover:ring-teal-300 transition group">
        <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 grid place-items-center shrink-0 shadow group-hover:scale-105 transition-transform">${icon("Sparkles", { className: "h-4.5 w-4.5 text-white" })}</div>
        <div class="text-left">
          <p class="text-sm font-bold text-teal-800">Trợ lý AI tìm trọ</p>
          <p class="text-[11px] text-teal-600">Mô tả nhu cầu — AI gợi ý nơi phù hợp</p>
        </div>
        ${icon("MessageCircle", { className: "h-4 w-4 text-teal-400 ml-auto" })}
      </button>`;
  }

  return `
    <div class="mt-3 rounded-2xl ring-1 ring-teal-200 overflow-hidden bg-white">
      <div class="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500">
        <div class="h-7 w-7 rounded-lg bg-white/20 grid place-items-center">${icon("Sparkles", { className: "h-4 w-4 text-white" })}</div>
        <div class="leading-tight">
          <p class="text-sm font-bold text-white">Trợ lý AI UNIRE</p>
          <p class="text-[10px] text-white/80">Quét review · ảnh thật · từ khóa</p>
        </div>
        <button data-action="assistantAIClose" class="ml-auto h-6 w-6 grid place-items-center bg-white/15 hover:bg-white/25 rounded-full transition">${icon("X", { className: "h-3.5 w-3.5 text-white" })}</button>
      </div>

      <div class="px-3 py-3 space-y-3 overflow-y-auto bg-slate-50" style="max-height:260px" data-scroll="assistantAI">
        ${ai.messages.map((m) => assistantMessage(m)).join("")}
        ${ai.thinking ? `
          <div class="flex gap-2">
            <div class="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 grid place-items-center shrink-0">${icon("Sparkles", { className: "h-3 w-3 text-white" })}</div>
            <div class="bg-white ring-1 ring-slate-200 px-3 py-2.5 rounded-2xl rounded-tl-md flex items-center gap-1">${thinkingDots("bg-teal-400")}</div>
          </div>` : ""}
      </div>

      ${ai.messages.length <= 1 ? `
        <div class="flex flex-wrap gap-1.5 px-3 pt-2 bg-slate-50">
          ${ASSISTANT_AI_CHIPS.map((c) => `<button data-action="assistantAISendChip" data-chip="${escapeHtml(c)}" class="text-[10px] font-medium text-teal-700 bg-white ring-1 ring-teal-200 px-2 py-1 rounded-full hover:bg-teal-50 transition">${escapeHtml(c)}</button>`).join("")}
        </div>` : ""}

      <div class="flex items-center gap-2 p-2.5 bg-slate-50 border-t border-slate-100">
        <input data-action="assistantAIInput" data-enter-action="assistantAISend" value="${escapeHtml(ai.input)}"
               placeholder="VD: trọ Bình Thạnh 3 triệu, 2 người..."
               class="flex-1 text-xs bg-white ring-1 ring-slate-200 rounded-full px-3 py-2 outline-none focus:ring-teal-400 transition" />
        <button data-action="assistantAISend" ${!ai.input.trim() || ai.thinking ? "disabled" : ""}
                class="h-8 w-8 grid place-items-center bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 rounded-full transition shrink-0 active:scale-95">
          ${icon("Send", { className: "h-3.5 w-3.5 text-white" })}
        </button>
      </div>
    </div>`;
}

function assistantMessage(m) {
  if (m.role === "user") {
    return `
      <div class="flex justify-end">
        <div class="max-w-[80%] bg-teal-600 text-white text-xs leading-relaxed px-3 py-2 rounded-2xl rounded-br-md">${escapeHtml(m.text)}</div>
      </div>`;
  }
  return `
    <div class="flex gap-2">
      <div class="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 grid place-items-center shrink-0">${icon("Sparkles", { className: "h-3 w-3 text-white" })}</div>
      <div class="flex-1 min-w-0">
        <div class="bg-white ring-1 ring-slate-200 text-xs leading-relaxed text-slate-700 px-3 py-2 rounded-2xl rounded-tl-md">${escapeHtml(m.text)}</div>
        ${m.suggestions && m.suggestions.length ? `<div class="mt-2 space-y-2">${m.suggestions.map(assistantSuggestionCard).join("")}</div>` : ""}
      </div>
    </div>`;
}

export function aiIntroFor(currentHousehold) {
  return `Chào bạn! Mình là trợ lý AI của UNIRE. Bạn đang xem ${escapeHtml(currentHousehold.name)} — mình có thể tư vấn thêm hoặc gợi ý nơi khác. Cho mình biết khu vực, ngân sách & số người ở nhé!`;
}

/* ---------------------------------------------------------------------- *
 * ThoVietBookingModal                                                     *
 * ---------------------------------------------------------------------- */
export function thoVietBookingModal(state) {
  const b = state.thoVietBooking;
  if (!b) return "";
  const { request } = b;
  return `
    <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/60" data-action="thoVietClose"></div>
      <div class="relative w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" style="max-height:92%;animation:popIn .25s ease-out">
        <div class="px-4 pt-3 pb-3 flex items-center justify-between" style="background:#FFE100">
          <img src="${THOVIET_LOGO}" alt="Thợ Việt" style="height:38px;width:auto" />
          <button data-action="thoVietClose" class="h-8 w-8 grid place-items-center bg-black/10 hover:bg-black/20 rounded-full transition">${icon("X", { className: "h-4 w-4 text-slate-800" })}</button>
        </div>

        ${b.sent ? `
          <div class="flex flex-col items-center py-12 px-6 text-center">
            <div class="h-16 w-16 rounded-full grid place-items-center mb-4" style="background:#16a34a">${icon("CheckCircle2", { className: "h-9 w-9 text-white" })}</div>
            <p class="font-extrabold text-slate-800 text-lg">Đã gửi tới Thợ Việt!</p>
            <p class="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Thợ Việt sẽ liên hệ <b>${escapeHtml(b.phone)}</b> trong ít phút để xác nhận lịch sửa <b>${escapeHtml(b.job)}</b> tại ${escapeHtml(b.addr)}.
            </p>
            <div class="mt-3 text-[11px] text-slate-400">Mã yêu cầu: TV-${String(request.id).padStart(4, "0")}${b.code}</div>
          </div>` : `
          <div class="px-5 pt-4 pb-1">
            <p class="text-center font-black text-slate-800 text-lg tracking-tight">ĐẶT LỊCH SỬA CHỮA</p>
            <p class="text-center text-[11px] text-slate-400 mb-1">Gửi yêu cầu trực tiếp tới đối tác Thợ Việt</p>
            <div class="flex items-center justify-center gap-1.5 mt-1.5 mb-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:#dcfce7;color:#16a34a">✓ Bảo hành</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:#eaf6ff;color:#44ACFF">⚡ Phản hồi nhanh</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:#fef3c7;color:#d97706">★ Đối tác RoomieHub</span>
            </div>
          </div>
          <div class="px-5 py-2 space-y-2.5 overflow-y-auto" style="max-height:46vh">
            <div class="flex items-center gap-2 rounded-xl p-2.5" style="background:#f8fafc;outline:1px solid #e2e8f0">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md text-white" style="background:#44ACFF">Phòng ${escapeHtml(request.room)}</span>
              <span class="text-xs text-slate-500">Báo bởi: <b class="text-slate-700">${escapeHtml(request.tenant)}</b></span>
            </div>
            <label class="block">
              <span class="text-xs font-bold text-slate-500 mb-1 block">Yêu cầu công việc <span class="text-rose-500">*</span></span>
              <input data-action="thoVietField" data-field="job" value="${escapeHtml(b.job)}" class="tvfield" />
            </label>
            <label class="block">
              <span class="text-xs font-bold text-slate-500 mb-1 block">Mô tả chi tiết</span>
              <textarea data-action="thoVietField" data-field="note" rows="2" class="tvfield" style="resize:none">${escapeHtml(b.note)}</textarea>
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label class="block">
                <span class="text-xs font-bold text-slate-500 mb-1 block">Người liên hệ</span>
                <input data-action="thoVietField" data-field="name" value="${escapeHtml(b.name)}" class="tvfield" />
              </label>
              <label class="block">
                <span class="text-xs font-bold text-slate-500 mb-1 block">Số điện thoại</span>
                <input data-action="thoVietField" data-field="phone" value="${escapeHtml(b.phone)}" class="tvfield" inputmode="tel" />
              </label>
            </div>
            <label class="block">
              <span class="text-xs font-bold text-slate-500 mb-1 block">Địa chỉ</span>
              <input data-action="thoVietField" data-field="addr" value="${escapeHtml(b.addr)}" class="tvfield" />
            </label>
          </div>
          <div class="px-5 py-3 border-t border-slate-100 space-y-2">
            <button data-action="thoVietSend" ${!b.job.trim() ? "disabled" : ""}
                    class="w-full font-extrabold py-3 rounded-xl transition active:scale-[.99] disabled:opacity-40 flex items-center justify-center gap-2"
                    style="background:#FFE100;color:#166534">
              ${icon("Wrench", { className: "h-4 w-4" })} Gửi yêu cầu tới Thợ Việt
            </button>
            <div class="flex gap-2">
              <button data-action="thoVietHotline" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl text-white" style="background:#16a34a">${icon("Phone", { className: "h-3.5 w-3.5" })} 1800 8122</button>
              <button data-action="thoVietZalo" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl text-white" style="background:#0068FF">${icon("MessageCircle", { className: "h-3.5 w-3.5" })} Chat Zalo</button>
            </div>
          </div>`}
      </div>
      <style>.tvfield{width:100%;font-size:13px;padding:9px 11px;border-radius:10px;background:#f8fafc;outline:none;border:1px solid #e2e8f0}.tvfield:focus{border-color:#FFE100;background:#fffdf0}</style>
    </div>`;
}
