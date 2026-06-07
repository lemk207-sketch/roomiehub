// "Nội bộ" tab — landlord view: resident roster with secure details (CCCD, expiry, contacts).
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";

function getDaysLeft(dateStr) {
  const exp = new Date(dateStr);
  const now = new Date();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

export function internalTab(state) {
  const { residents } = state;
  const expanded = state.internalExpanded;
  const warnings = residents.filter((r) => getDaysLeft(r.residenceExpiry) <= 30);

  return `
    <div>
      <div class="flex items-center gap-2 mb-3">
        ${icon("ShieldCheck", { className: "h-4 w-4", style: "color:#44ACFF" })}
        <p class="text-xs font-bold text-slate-500">QUẢN LÝ CƯ DÂN — THÔNG TIN BẢO MẬT</p>
      </div>

      ${warnings.length ? `
        <div class="mb-3 p-3 rounded-xl flex items-start gap-2.5" style="background:#fff0f0;outline:1px solid #fecdd3">
          ${icon("Bell", { className: "h-4 w-4 text-rose-500 shrink-0 mt-0.5" })}
          <div>
            <p class="text-xs font-bold text-rose-600">Sắp hết hạn tạm trú!</p>
            ${warnings.map((w) => `
              <p class="text-[11px] text-rose-500 mt-0.5">${escapeHtml(w.name)} (Phòng ${escapeHtml(w.room)}) — còn <b>${getDaysLeft(w.residenceExpiry)} ngày</b></p>`).join("")}
          </div>
        </div>` : ""}

      <div class="space-y-3">
        ${residents.map((r) => {
          const days = getDaysLeft(r.residenceExpiry);
          const isOpen = expanded === r.room;
          const expiryColor = days <= 30 ? "#ef4444" : days <= 60 ? "#f59e0b" : "#16a34a";
          const expiryBg = days <= 30 ? "#fef2f2" : days <= 60 ? "#fffbeb" : "#f0fdf4";
          const expiryLabel = days <= 0 ? "Đã hết hạn!" : `Còn ${days} ngày`;
          return `
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden" style="outline:1px solid #e2e8f0">
            <button data-action="toggleResident" data-room="${escapeHtml(r.room)}"
                    class="w-full flex items-center gap-3 p-3.5 text-left hover:bg-slate-50 transition-colors">
              <div class="h-12 w-12 rounded-full overflow-hidden shrink-0 shadow-sm ring-2" style="border-color:${r.color};background:${r.color}">
                ${r.photo
                  ? `<img src="${r.photo}" alt="${escapeHtml(r.name)}" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full grid place-items-center text-lg font-black text-white">${escapeHtml(r.initial)}</div>`}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-slate-800 truncate">${escapeHtml(r.name)}</p>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style="background:#eaf6ff;color:#44ACFF">Phòng ${escapeHtml(r.room)}</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(r.job)}</p>
              </div>
              ${icon("ChevronLeft", { className: `h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "-rotate-90" : ""}` })}
            </button>

            ${isOpen ? `
              <div class="px-3.5 pb-3.5 space-y-2.5 border-t border-slate-100 pt-3" style="animation:popIn .15s ease-out">
                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-7 rounded-lg grid place-items-center bg-slate-100">${icon("ShieldCheck", { className: "h-3.5 w-3.5 text-slate-500" })}</div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-semibold">CĂN CƯỚC CÔNG DÂN</p>
                    <p class="text-xs font-mono font-bold text-slate-700 tracking-wider">${escapeHtml(r.cccd)}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="h-7 w-7 rounded-lg grid place-items-center bg-slate-100">${icon("Phone", { className: "h-3.5 w-3.5 text-slate-500" })}</div>
                    <div>
                      <p class="text-[10px] text-slate-400 font-semibold">SĐT CHÍNH CHỦ</p>
                      <p class="text-xs font-semibold text-slate-700">${escapeHtml(r.phone)}</p>
                    </div>
                  </div>
                  <button data-action="contactResident" data-name="${escapeHtml(r.name)}" data-phone="${escapeHtml(r.phone)}"
                          class="flex items-center gap-1.5 text-[11px] font-bold text-white px-3 py-1.5 rounded-lg active:scale-95 transition"
                          style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
                    ${icon("Phone", { className: "h-3.5 w-3.5" })} Liên hệ
                  </button>
                </div>

                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-7 rounded-lg grid place-items-center bg-slate-100">${icon("Bike", { className: "h-3.5 w-3.5 text-slate-500" })}</div>
                  <div>
                    <p class="text-[10px] text-slate-400 font-semibold">PHƯƠNG TIỆN</p>
                    <p class="text-xs text-slate-700"><span class="font-mono font-bold">${escapeHtml(r.plate)}</span> · ${escapeHtml(r.vehicle)}</p>
                  </div>
                </div>

                <div class="rounded-xl p-2.5" style="background:#fff8ed;outline:1px solid #fde68a">
                  <p class="text-[10px] font-bold text-amber-600 flex items-center gap-1 mb-1">${icon("AlertTriangle", { className: "h-3 w-3" })} LIÊN HỆ KHẨN CẤP</p>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs font-semibold text-slate-700">${escapeHtml(r.emergency.name)} (${escapeHtml(r.emergency.relation)})</p>
                      <p class="text-[11px] text-slate-500">${escapeHtml(r.emergency.phone)}</p>
                    </div>
                    <button data-action="contactResident" data-name="${escapeHtml(r.emergency.name)}" data-phone="${escapeHtml(r.emergency.phone)}"
                            class="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg active:scale-95">
                      📞 Gọi
                    </button>
                  </div>
                </div>

                <div class="rounded-xl p-2.5 flex items-center justify-between" style="background:${expiryBg};outline:1px solid ${expiryColor}30">
                  <div>
                    <p class="text-[10px] font-bold flex items-center gap-1" style="color:${expiryColor}">${icon("Clock", { className: "h-3 w-3" })} HẠN TẠM TRÚ</p>
                    <p class="text-xs font-semibold text-slate-700 mt-0.5">
                      ${escapeHtml(new Date(r.residenceExpiry).toLocaleDateString("vi-VN"))} — <span style="color:${expiryColor}">${expiryLabel}</span>
                    </p>
                  </div>
                  ${days <= 30 ? `<span class="text-[9px] font-black px-2 py-1 rounded-full text-white" style="background:${expiryColor}">NHẮC GIA HẠN</span>` : ""}
                </div>
              </div>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>`;
}
