// Shared chrome: modal shell wrapper, profile dropdown, toast, and the
// deterministic fake-QR-code generator (all originally tiny presentational
// React components — here just template-string functions).
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";

/** Wrap inner HTML in the same translucent-backdrop card used by every modal. */
export function modalShell(innerHtml, { closeAction = "closeModal" } = {}) {
  return `
    <div class="absolute inset-0 z-50 flex items-center justify-center p-5">
      <div class="absolute inset-0 bg-slate-900/50" data-action="${closeAction}"></div>
      <div class="relative w-full max-w-[340px] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-pop">
        ${innerHtml}
      </div>
    </div>`;
}

export function profileDropdown(user) {
  const isLandlord = user.role === "LANDLORD";
  return `
    <div class="fixed inset-0 z-40" data-action="closeProfile"></div>
    <div class="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 z-50 overflow-hidden" style="animation: popIn .15s ease-out">
      <div class="bg-slate-50 px-4 py-4 flex items-center gap-3 border-b border-slate-100">
        <div class="h-11 w-11 rounded-full grid place-items-center shadow-sm"
             style="background:${isLandlord ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "linear-gradient(135deg,#44ACFF,#89D4FF)"}">
          ${isLandlord ? icon("KeyRound", { className: "h-5 w-5 text-white" }) : icon("User", { className: "h-5 w-5 text-white" })}
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-slate-800 text-sm truncate">${escapeHtml(user.name)}</p>
          <span class="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${isLandlord ? "bg-teal-100 text-teal-700" : "bg-emerald-100 text-emerald-700"}">${user.role}</span>
          <p class="text-[10px] text-slate-400 mt-0.5">${isLandlord ? "Chủ trọ" : "Người thuê"}</p>
        </div>
      </div>
      ${user.role === "USER" ? `
        <button data-action="openEditInfo" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100">
          <span style="color:#44ACFF">${icon("UserCog", { className: "h-4 w-4" })}</span>
          Chỉnh sửa thông tin cá nhân
        </button>` : ""}
      ${isLandlord ? `
        <button data-action="openSubscribe" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-amber-50 transition-colors border-b border-slate-100" style="color:#d97706">
          <span style="color:#f59e0b">${icon("Crown", { className: "h-4 w-4" })}</span>
          Đăng ký gói nâng cấp
        </button>` : ""}
      <button data-action="switchRole" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <span class="text-slate-400">${icon("RefreshCw", { className: "h-4 w-4" })}</span>
        Chuyển vai trò
      </button>
      <button data-action="logout" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100">
        ${icon("LogOut", { className: "h-4 w-4" })} Đăng xuất
      </button>
    </div>`;
}

export function toast(t) {
  if (!t || !t.msg) return "";
  const warn = t.type === "warn";
  return `
    <div class="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 whitespace-nowrap ${warn ? "bg-amber-600" : "bg-slate-900"}"
         style="animation: fadeInToast .2s ease-out">
      ${warn ? icon("Bell", { className: "h-4 w-4 text-amber-200" }) : icon("CheckCircle2", { className: "h-4 w-4 text-emerald-400" })}
      ${escapeHtml(t.msg)}
    </div>`;
}

/** A deterministic fake QR code, rendered as an inline SVG string (port of MockQR). */
export function mockQR({ seed = 7, size = 148 } = {}) {
  const cells = 25;
  const unit = size / cells;
  let s = (seed * 9973 + 1) >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);

  let dots = "";
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (!isFinder(r, c) && rand() > 0.5) {
        dots += `<rect x="${c * unit}" y="${r * unit}" width="${unit}" height="${unit}" rx="${unit * 0.2}"/>`;
      }
    }
  }
  const finder = (x, y) => `
    <g transform="translate(${x},${y})">
      <rect width="${unit * 7}" height="${unit * 7}" rx="${unit}" fill="currentColor"/>
      <rect x="${unit}" y="${unit}" width="${unit * 5}" height="${unit * 5}" rx="${unit * 0.7}" fill="#fff"/>
      <rect x="${unit * 2}" y="${unit * 2}" width="${unit * 3}" height="${unit * 3}" rx="${unit * 0.5}" fill="currentColor"/>
    </g>`;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="text-slate-900">
      <rect width="${size}" height="${size}" fill="#fff"/>
      <g fill="currentColor">${dots}</g>
      ${finder(0, 0)}
      ${finder(size - unit * 7, 0)}
      ${finder(0, size - unit * 7)}
    </svg>`;
}
