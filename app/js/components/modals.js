// Misc full-screen / sheet modals: About Us, Subscription plans,
// Personal Info editor (USER → syncs to landlord's resident roster), Review form.
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";
import { UNIRE_LOGO_LARGE, RH_LOGO } from "../data.js";
import { modalShell } from "./shell.js";

/* ---------------------------------------------------------------------- *
 * AboutUsPage                                                             *
 * ---------------------------------------------------------------------- */
export function aboutUsPage() {
  const STEPS = [
    { step: "01", label: "Empathize", color: "#FE9EC7" },
    { step: "02", label: "Define", color: "#89D4FF" },
    { step: "03", label: "Ideate", color: "#44ACFF" },
    { step: "04", label: "Prototype", color: "#a78bfa" },
    { step: "05", label: "Test", color: "#34d399" },
  ];
  return `
    <div class="absolute inset-0 z-50 flex flex-col bg-white" style="animation:popIn .25s ease-out">
      <div class="px-5 pt-6 pb-5 text-white" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
        <button data-action="closeAbout" class="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-semibold mb-3 transition-colors">
          ${icon("ChevronLeft", { className: "h-4 w-4" })} RoomieHub
        </button>
        <h1 class="text-2xl font-extrabold tracking-tight">About Us</h1>
        <p class="text-white/80 text-xs mt-0.5">UNIRE — Design Thinking Project</p>
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div class="flex items-center justify-center gap-5 py-3">
          <div class="flex flex-col items-center gap-2">
            <div class="h-20 w-20 rounded-full bg-blue-100 grid place-items-center shadow-lg ring-2 ring-blue-200">
              <img src="${UNIRE_LOGO_LARGE}" alt="UNIRE" class="h-16 w-16 object-contain" />
            </div>
            <span class="text-[10px] font-bold text-slate-500 tracking-widest">UNIRE</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="w-px h-10 bg-slate-200"></div>
            <span class="text-[9px] text-slate-400 font-medium">×</span>
            <div class="w-px h-10 bg-slate-200"></div>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="h-20 rounded-xl overflow-hidden bg-blue-100 shadow-lg ring-2 ring-blue-200 grid place-items-center px-3">
              <img src="${RH_LOGO}" alt="RoomieHub" class="h-16 object-contain" />
            </div>
            <span class="text-[10px] font-bold text-slate-500 tracking-widest">PROJECT</span>
          </div>
        </div>

        <div class="text-center py-2">
          <p class="text-xs font-bold tracking-widest text-slate-400 uppercase">FAIR FOR RENTERS · SMART FOR LANDLORDS</p>
        </div>

        <div class="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

        <div class="space-y-4">
          <div class="rounded-2xl p-4" style="background:linear-gradient(135deg,#eaf6ff,#f0f9ff)">
            <p class="text-xs font-black text-slate-500 tracking-widest mb-1.5">CHÚNG TÔI LÀ AI?</p>
            <p class="text-sm text-slate-700 leading-relaxed">
              <span class="font-bold" style="color:#44ACFF">UNIRE</span> là nhóm tư vấn đến từ lớp học Design Thinking tại
              <span class="font-semibold text-slate-800">Trường Đại học Ngoại thương</span>, tập trung vào việc quan sát vấn đề từ góc nhìn người dùng, khai thác insight thực tế và ứng dụng tư duy sáng tạo để đề xuất những giải pháp mang tính thực tiễn và giá trị.
            </p>
          </div>

          <div>
            <p class="text-xs font-black text-slate-500 tracking-widest mb-2.5">PHƯƠNG PHÁP TIẾP CẬN</p>
            <p class="text-xs text-slate-600 leading-relaxed mb-3">
              Với định hướng lấy con người làm trung tâm, UNIRE ứng dụng mô hình Design Thinking với 5 bước cốt lõi nhằm xây dựng những giải pháp đổi mới, có tính ứng dụng cao và tạo tác động tích cực cho cộng đồng.
            </p>
            <div class="flex gap-1.5">
              ${STEPS.map(({ step, label, color }) => `
                <div class="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl" style="background:${color}18;outline:1px solid ${color}40">
                  <span class="text-[8px] font-black" style="color:${color}">${step}</span>
                  <span class="text-[8px] font-bold text-slate-700 text-center leading-tight">${label}</span>
                </div>`).join("")}
            </div>
          </div>

          <div>
            <p class="text-xs font-black text-slate-500 tracking-widest mb-2">VẤN ĐỀ CHÚNG TÔI PHÁT HIỆN</p>
            <p class="text-xs text-slate-600 leading-relaxed">
              Từ quá trình nghiên cứu thị trường thuê và vận hành phòng trọ, UNIRE nhận thấy cả người thuê lẫn chủ trọ đều gặp nhiều khó khăn. Người thuê mất nhiều thời gian tìm phòng phù hợp do thông tin thiếu minh bạch, trong khi chủ trọ gặp áp lực quản lý hợp đồng, thanh toán, điện nước và vận hành tổng thể.
            </p>
            <div class="grid grid-cols-2 gap-2 mt-2.5">
              <div class="rounded-xl p-3" style="background:#fff0f5;outline:1px solid #fecdd3">
                <p class="text-[10px] font-bold text-rose-600 mb-1">🏠 Người thuê</p>
                <p class="text-[10px] text-slate-600 leading-relaxed">Thông tin ảo, giá không minh bạch, khó tìm phòng phù hợp</p>
              </div>
              <div class="rounded-xl p-3" style="background:#eaf6ff;outline:1px solid #aadeff">
                <p class="text-[10px] font-bold mb-1" style="color:#44ACFF">👤 Chủ trọ</p>
                <p class="text-[10px] text-slate-600 leading-relaxed">Quản lý thủ công, quá tải nhiều nhà, thu tiền mất thời gian</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-4 text-white" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
            <p class="text-[10px] font-black tracking-widest mb-1.5 text-white/80">GIẢI PHÁP CỦA CHÚNG TÔI</p>
            <p class="text-sm font-bold mb-1.5">RoomieHub</p>
            <p class="text-xs leading-relaxed text-white/90">
              Ứng dụng hỗ trợ quản lý và vận hành phòng trọ thông minh. Giúp người thuê dễ dàng tìm kiếm phòng trọ phù hợp với thông tin minh bạch, đồng thời hỗ trợ chủ trọ tối ưu quy trình quản lý trên một nền tảng tập trung, hiện đại và hiệu quả.
            </p>
            <p class="text-[10px] text-white/70 mt-2 italic">"FAIR FOR RENTERS. SMART FOR LANDLORDS."</p>
          </div>
        </div>

        <div class="text-center pt-2 pb-4">
          <p class="text-[10px] text-slate-400">UNIRE · Design Thinking · ĐH Ngoại thương</p>
          <p class="text-[9px] text-slate-300 mt-0.5">We form a bond to reach far beyond</p>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------- *
 * SubscriptionModal                                                       *
 * ---------------------------------------------------------------------- */
const ROOM_TIERS = ["1-5 phòng", "6-10 phòng", "11-20 phòng", "21-50 phòng", "> 50 phòng"];
const PLANS = [
  { id: "basic", name: "Gói Cơ bản", icon: "Sparkles", color: "#64748b", bg: "#f8fafc", prices: [99000, 199000, 349000, 649000, null] },
  { id: "count", name: "Gói Bá tước", icon: "Award", color: "#44ACFF", bg: "#eaf6ff", prices: [249000, 399000, 649000, 1099000, null] },
  { id: "lord", name: "Gói Lãnh chúa", icon: "Gem", color: "#a78bfa", bg: "#f5f3ff", prices: [599000, 849000, 1299000, 2199000, null] },
  { id: "king", name: "Gói Quân vương", icon: "Crown", color: "#f59e0b", bg: "#fffbeb", lifetime: 24900000 },
];
const fmtDong = (n) => n.toLocaleString("vi-VN") + "đ";

export function subscriptionModal(state) {
  const tier = state.subscriptionTier;
  return `
    <div class="absolute inset-0 z-50 flex items-end justify-center">
      <div class="absolute inset-0 bg-slate-900/60" data-action="closeSubscribe"></div>
      <div class="relative w-full bg-white rounded-t-3xl shadow-2xl flex flex-col" style="max-height:90%;animation:popIn .25s ease-out">
        <div class="px-5 pt-5 pb-4 rounded-t-3xl text-white" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              ${icon("Crown", { className: "h-6 w-6" })}
              <div>
                <p class="font-extrabold text-base leading-tight">Nâng cấp RoomieHub</p>
                <p class="text-[11px] text-white/85">Quản lý nhiều phòng hơn, mạnh mẽ hơn</p>
              </div>
            </div>
            <button data-action="closeSubscribe" class="h-8 w-8 grid place-items-center bg-white/20 hover:bg-white/30 rounded-full transition">${icon("X", { className: "h-4 w-4 text-white" })}</button>
          </div>
        </div>

        <div class="px-4 pt-3 pb-1 bg-white border-b border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 mb-2">QUY MÔ (SỐ PHÒNG QUẢN LÝ)</p>
          <div class="flex gap-1.5 overflow-x-auto pb-1">
            ${ROOM_TIERS.map((t, i) => `
              <button data-action="setSubscriptionTier" data-tier="${i}"
                      class="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition"
                      style="background:${tier === i ? "#f59e0b" : "#f1f5f9"};color:${tier === i ? "white" : "#64748b"}">
                ${t}
              </button>`).join("")}
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 bg-slate-50">
          ${PLANS.map((p) => {
            const isKing = p.id === "king";
            const price = isKing ? p.lifetime : p.prices[tier];
            const contactOnly = !isKing && price === null;
            return `
            <div class="rounded-2xl overflow-hidden shadow-sm" style="outline:${isKing ? "2px solid #f59e0b" : "1px solid #e2e8f0"};background:white">
              ${isKing ? `<div class="text-center text-[10px] font-black text-white py-1" style="background:linear-gradient(90deg,#f59e0b,#fbbf24)">⭐ TỐT NHẤT · TRỌN ĐỜI</div>` : ""}
              <div class="p-3.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="h-10 w-10 rounded-xl grid place-items-center shrink-0" style="background:${p.bg}">
                      ${icon(p.icon, { className: "h-5 w-5", style: `color:${p.color}` })}
                    </div>
                    <div>
                      <p class="font-extrabold text-sm text-slate-800">${escapeHtml(p.name)}</p>
                      <p class="text-[10px] text-slate-400">${isKing ? "Không giới hạn phòng" : escapeHtml(ROOM_TIERS[tier])}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    ${contactOnly
                      ? `<span class="text-sm font-bold text-slate-500">Liên hệ riêng</span>`
                      : `<p class="text-lg font-black" style="color:${p.color}">${fmtDong(price)}</p>
                         <p class="text-[10px] text-slate-400 -mt-0.5">${isKing ? "trọn đời" : "/ tháng"}</p>`}
                  </div>
                </div>
                <button data-action="choosePlan" data-plan="${escapeHtml(p.name)}" data-contact="${contactOnly ? "1" : "0"}"
                        class="w-full mt-3 text-xs font-bold py-2.5 rounded-xl transition active:scale-[.99]"
                        style="${isKing ? "background:linear-gradient(135deg,#f59e0b,#fbbf24);color:white" : `background:${p.bg};color:${p.color};box-shadow:0 0 0 1px ${p.color}40`}">
                  ${contactOnly ? "Liên hệ tư vấn" : isKing ? "Mua trọn đời" : "Chọn gói này"}
                </button>
              </div>
            </div>`;
          }).join("")}
          <p class="text-[10px] text-slate-400 text-center pt-1 pb-2">Giá đã bao gồm VAT · Hủy bất cứ lúc nào · Hỗ trợ 24/7</p>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------- *
 * PersonalInfoModal                                                       *
 * ---------------------------------------------------------------------- */
function field2(label, inner) {
  return `<label class="block"><span class="text-xs font-bold text-slate-500 mb-1 block">${escapeHtml(label)}</span>${inner}</label>`;
}

export function personalInfoModal(state) {
  const { user, residents } = state;
  const me = residents.find((r) => r.name === user.name) || residents[0];
  const f = state.personalInfoForm;
  const valid = f.phone.trim() && f.cccd.trim();

  return modalShell(`
    <div class="px-5 pt-5 pb-4 border-b border-slate-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-extrabold text-slate-800 text-base">Thông tin cá nhân</p>
          <p class="text-xs text-slate-500 mt-0.5">${escapeHtml(user.name)} · Phòng ${escapeHtml(me.room)}</p>
        </div>
        <button data-action="closePersonalInfo" class="h-8 w-8 grid place-items-center hover:bg-slate-100 rounded-full transition">${icon("X", { className: "h-4 w-4 text-slate-500" })}</button>
      </div>
      <div class="mt-3 flex items-start gap-2 text-[11px] text-slate-600 rounded-lg px-2.5 py-2" style="background:#eaf6ff">
        ${icon("RefreshCw", { className: "h-3.5 w-3.5 shrink-0 mt-px", style: "color:#44ACFF" })}
        Thông tin bạn cập nhật sẽ <b>tự động chuyển tới mục quản lý cư dân</b> của chủ trọ.
      </div>
    </div>

    ${f.done ? `
      <div class="flex flex-col items-center py-10 px-6 text-center">
        <div class="h-16 w-16 rounded-full grid place-items-center mb-4" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">${icon("RefreshCw", { className: "h-8 w-8 text-white" })}</div>
        <p class="font-extrabold text-slate-800 text-lg">Đã gửi tới chủ trọ!</p>
        <p class="text-sm text-slate-500 mt-1 leading-relaxed">
          Thông tin của bạn đã được đồng bộ sang mục <b>Nội bộ</b> của chủ trọ. Bạn có thể kiểm tra bằng cách chuyển vai trò sang LANDLORD.
        </p>
      </div>` : `
      <div class="px-5 py-4 space-y-3.5 overflow-y-auto" style="max-height:55vh">
        <div>
          <p class="text-xs font-bold text-slate-500 mb-1.5">ẢNH CĂN CƯỚC CÔNG DÂN</p>
          ${f.cccdPhoto ? `
            <div class="relative inline-block">
              <img src="${f.cccdPhoto}" alt="CCCD" class="h-24 w-40 object-cover rounded-xl ring-1 ring-slate-200" />
              <button data-action="clearCccdPhoto" class="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 text-white rounded-full grid place-items-center">${icon("X", { className: "h-3 w-3" })}</button>
            </div>` : `
            <input id="cccdFileInput" type="file" accept="image/*" class="hidden" data-action="cccdPhotoPicked" />
            <button data-action="pickCccdPhoto" class="h-24 w-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-400 grid place-items-center text-slate-400 hover:text-teal-500 transition">
              <div class="text-center">${icon("Camera", { className: "h-6 w-6 mx-auto" })}<span class="text-[10px] mt-1 block">Tải ảnh CCCD</span></div>
            </button>`}
        </div>

        ${field2("Số CCCD", `<input data-action="piField" data-field="cccd" value="${escapeHtml(f.cccd)}" placeholder="079xxxxxxxxx" class="pifield" inputmode="numeric" />`)}
        ${field2("Số điện thoại chính chủ", `<input data-action="piField" data-field="phone" value="${escapeHtml(f.phone)}" placeholder="09xx xxx xxx" class="pifield" inputmode="tel" />`)}
        ${field2("Nghề nghiệp", `<input data-action="piField" data-field="job" value="${escapeHtml(f.job)}" placeholder="VD: Sinh viên, Nhân viên..." class="pifield" />`)}

        <div class="rounded-xl p-3" style="background:#fff0f5;outline:1px solid #fecdd3">
          <p class="text-xs font-bold text-rose-600 mb-2">LIÊN HỆ KHẨN CẤP (NGƯỜI THÂN)</p>
          <div class="grid grid-cols-2 gap-2">
            <input data-action="piField" data-field="emName" value="${escapeHtml(f.emName)}" placeholder="Họ tên" class="pifield" />
            <input data-action="piField" data-field="emRel" value="${escapeHtml(f.emRel)}" placeholder="Quan hệ (Bố/Mẹ...)" class="pifield" />
          </div>
          <input data-action="piField" data-field="emPhone" value="${escapeHtml(f.emPhone)}" placeholder="SĐT người thân" class="pifield mt-2" inputmode="tel" />
        </div>

        ${field2("Thời hạn tạm trú (hết hạn)", `<input data-action="piField" data-field="expiry" type="date" value="${escapeHtml(f.expiry)}" class="pifield" />`)}

        <button data-action="submitPersonalInfo" ${valid ? "" : "disabled"}
                class="w-full text-white font-bold py-3 rounded-xl transition active:scale-[.99] disabled:opacity-40 mt-1"
                style="background:${valid ? "linear-gradient(135deg,#44ACFF,#89D4FF)" : "#cbd5e1"}">
          Gửi thông tin tới chủ trọ
        </button>
      </div>`}
    <style>.pifield{width:100%;font-size:13px;padding:9px 11px;border-radius:10px;background:#f8fafc;outline:none;border:1px solid #e2e8f0}.pifield:focus{border-color:#44ACFF;background:#fff}</style>
  `, { closeAction: "closePersonalInfo" });
}

/* ---------------------------------------------------------------------- *
 * ReviewModal                                                             *
 * ---------------------------------------------------------------------- */
export function reviewModal(state) {
  const { household } = state;
  const f = state.reviewForm;
  const stars = f.stars, hovered = f.hovered;
  const starLabel = ["", "Tệ", "Tạm được", "Ổn", "Tốt", "Xuất sắc"][stars] || "";

  return modalShell(`
    <div class="px-5 pt-5 pb-4 border-b border-slate-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-extrabold text-slate-800 text-base">Đánh giá nhà trọ</p>
          <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-1">${icon("MapPin", { className: "h-3 w-3" })}${escapeHtml(household?.name || "Nhà trọ của bạn")}</p>
        </div>
        <button data-action="closeReview" class="h-8 w-8 grid place-items-center hover:bg-slate-100 rounded-full transition">${icon("X", { className: "h-4 w-4 text-slate-500" })}</button>
      </div>
      <div class="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-lg px-2.5 py-1.5">
        ${icon("ShieldCheck", { className: "h-3.5 w-3.5 shrink-0" })}
        Đánh giá được xác thực — chỉ người thuê thật mới gửi được
      </div>
    </div>

    ${f.done ? `
      <div class="flex flex-col items-center py-10 px-6 text-center">
        <div class="h-16 w-16 rounded-full grid place-items-center mb-4" style="background:linear-gradient(135deg,#FE9EC7,#89D4FF)">${icon("CheckCircle2", { className: "h-8 w-8 text-white" })}</div>
        <p class="font-extrabold text-slate-800 text-lg">Cảm ơn bạn!</p>
        <p class="text-sm text-slate-500 mt-1 leading-relaxed">Đánh giá của bạn đã được ghi nhận và sẽ hiển thị công khai để hỗ trợ người tìm trọ.</p>
        <div class="flex mt-3 gap-0.5">
          ${[1, 2, 3, 4, 5].map((s) => icon("Star", { className: `h-6 w-6 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-slate-200"}` })).join("")}
        </div>
      </div>` : `
      <div class="px-5 py-4 space-y-4">
        <div>
          <p class="text-xs font-bold text-slate-500 mb-2">XẾP HẠNG TỔNG THỂ</p>
          <div class="flex items-center gap-1">
            ${[1, 2, 3, 4, 5].map((s) => `
              <button data-action="setReviewStars" data-star="${s}" class="review-star transition-transform active:scale-90 hover:scale-110">
                ${icon("Star", { className: `h-9 w-9 transition-colors ${s <= (hovered || stars) ? "fill-amber-400 text-amber-400" : "text-slate-200"}` })}
              </button>`).join("")}
            ${(hovered || stars) > 0 ? `<span class="ml-2 text-sm font-bold text-amber-600">${starLabel}</span>` : ""}
          </div>
        </div>

        <div>
          <p class="text-xs font-bold text-slate-500 mb-2">ẢNH THỰC TẾ <span class="text-slate-400 font-normal">(tối đa 4 ảnh)</span></p>
          <div class="flex flex-wrap gap-2">
            ${f.photos.map((p, i) => `
              <div class="relative h-20 w-20 rounded-xl overflow-hidden ring-1 ring-slate-200">
                <img src="${p.url}" alt="" class="w-full h-full object-cover" />
                <button data-action="removeReviewPhoto" data-idx="${i}" class="absolute top-1 right-1 h-5 w-5 grid place-items-center bg-black/60 rounded-full">${icon("X", { className: "h-3 w-3 text-white" })}</button>
              </div>`).join("")}
            ${f.photos.length < 4 ? `
              <input id="reviewFileInput" type="file" accept="image/*" multiple class="hidden" data-action="reviewPhotosPicked" />
              <button data-action="pickReviewPhotos" class="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-400 grid place-items-center text-slate-400 hover:text-teal-500 transition-colors group">
                <div class="text-center">${icon("Camera", { className: "h-6 w-6 mx-auto group-hover:scale-110 transition-transform" })}<span class="text-[10px] mt-0.5 block">Thêm ảnh</span></div>
              </button>` : ""}
          </div>
        </div>

        <div>
          <p class="text-xs font-bold text-slate-500 mb-2">NHẬN XÉT CỦA BẠN</p>
          <textarea data-action="reviewComment" rows="3" placeholder="Chia sẻ trải nghiệm thực tế: chủ trọ có nhiệt tình không? Tiện ích xung quanh? Môi trường sống?..."
                    class="w-full text-sm p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-teal-400 focus:bg-white resize-none transition leading-relaxed">${escapeHtml(f.comment)}</textarea>
          <p class="text-[11px] mt-1 text-right ${f.comment.length > 200 ? "text-rose-500" : "text-slate-400"}">${f.comment.length}/250</p>
        </div>

        <button data-action="submitReview" ${!stars || !f.comment.trim() ? "disabled" : ""}
                class="w-full text-white font-bold py-3 rounded-xl transition active:scale-[.99] disabled:opacity-40 disabled:cursor-not-allowed"
                style="background:${stars && f.comment.trim() ? "linear-gradient(135deg,#44ACFF,#89D4FF)" : "#e2e8f0"}">
          Gửi đánh giá công khai
        </button>
        <p class="text-[11px] text-slate-400 text-center -mt-1">Đánh giá sẽ hiển thị công khai trong hồ sơ nhà trọ</p>
      </div>`}
  `, { closeAction: "closeReview" });
}
