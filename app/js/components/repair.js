// "Sửa chữa" tab — landlord overview/approval view + tenant report-and-track view.
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";
import { STATUS_CFG } from "../data.js";
import { thoVietBookingModal } from "./ai.js";

const STAT_COLORS = {
  amber:   { bg: "#fff8ed", ring: "#fcd34d", text: "#d97706", active: "#fef3c7" },
  teal:    { bg: "#eaf6ff", ring: "#89D4FF", text: "#44ACFF", active: "#d0edff" },
  emerald: { bg: "#f0fdf4", ring: "#86efac", text: "#16a34a", active: "#dcfce7" },
};

function statusBadge(status) {
  const st = STATUS_CFG[status];
  return `
    <span class="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ring-1 ${st.cls}">
      ${icon(st.icon, { className: `h-3 w-3 ${status === "in_progress" ? "animate-spin" : ""}` })}
      ${st.label}
    </span>`;
}

export function landlordRepairTab(state) {
  const { maintenance, repairFilter: filter } = state;
  const counts = {
    pending: maintenance.filter((m) => m.status === "pending").length,
    in_progress: maintenance.filter((m) => m.status === "in_progress").length,
    resolved: maintenance.filter((m) => m.status === "resolved").length,
  };
  const displayed = filter === "all" ? maintenance : maintenance.filter((m) => m.status === filter);

  const statCard = (label, count, statusKey, color) => {
    const c = STAT_COLORS[color];
    const isActive = filter === statusKey;
    return `
      <button data-action="setRepairFilter" data-filter="${isActive ? "all" : statusKey}"
              class="flex-1 flex flex-col items-center py-3 rounded-xl transition-all active:scale-95"
              style="background:${isActive ? c.active : c.bg}; box-shadow:${isActive ? `0 0 0 2px ${c.ring}` : `0 0 0 1px ${c.ring}80`}">
        <span class="text-2xl font-black leading-none" style="color:${c.text}">${count}</span>
        <span class="text-[10px] font-bold mt-1" style="color:${c.text}">${label}</span>
      </button>`;
  };

  return `
    <div>
      <div class="bg-white rounded-2xl ring-1 ring-slate-200 p-3.5 shadow-sm mb-4">
        <div class="flex items-center justify-between mb-2.5">
          <p class="text-xs font-bold text-slate-500">TỔNG QUAN YÊU CẦU</p>
          ${filter !== "all" ? `<button data-action="setRepairFilter" data-filter="all" class="text-[11px] font-semibold" style="color:#44ACFF">Xem tất cả ›</button>` : ""}
        </div>
        <div class="flex gap-2">
          ${statCard("Chờ duyệt", counts.pending, "pending", "amber")}
          ${statCard("Đang sửa", counts.in_progress, "in_progress", "teal")}
          ${statCard("Đã xong", counts.resolved, "resolved", "emerald")}
        </div>
      </div>

      <p class="text-[11px] font-bold text-slate-400 mb-2">
        ${filter === "all" ? `TẤT CẢ YÊU CẦU (${maintenance.length})` : `${(STATUS_CFG[filter]?.label || "").toUpperCase()} (${displayed.length})`}
      </p>

      <div class="space-y-2.5">
        ${displayed.map((m) => `
          <div class="bg-white rounded-xl shadow-sm overflow-hidden" style="outline:${m.status === "pending" ? "1.5px solid #fcd34d" : "1px solid #e2e8f0"}">
            <div class="p-3">
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full" style="background:#eaf6ff;color:#44ACFF">Phòng ${escapeHtml(m.room)}</span>
                  <span class="text-[10px] text-slate-400 font-medium">${escapeHtml(m.tenant)}</span>
                </div>
                ${statusBadge(m.status)}
              </div>
              <p class="text-sm font-semibold text-slate-800 leading-snug">${escapeHtml(m.title)}</p>
              ${m.desc ? `<p class="text-xs text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(m.desc)}</p>` : ""}
              <div class="flex items-center justify-between mt-2.5">
                <p class="text-[11px] text-slate-400">${escapeHtml(m.date)}</p>
                <div class="flex gap-1.5">
                  ${m.status === "pending" ? `
                    <button data-action="dispatchRepair" data-id="${m.id}"
                            class="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl transition active:scale-95"
                            style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
                      ${icon("CheckCircle2", { className: "h-3.5 w-3.5" })} Duyệt
                    </button>` : ""}
                  ${m.status === "in_progress" ? `
                    <button data-action="completeRepair" data-id="${m.id}"
                            class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition active:scale-95">
                      ${icon("CheckCircle2", { className: "h-3.5 w-3.5" })} Hoàn thành
                    </button>` : ""}
                  ${m.status === "resolved" ? `
                    <span class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      ${icon("CheckCircle2", { className: "h-3.5 w-3.5" })} Đã xử lý xong
                    </span>` : ""}
                </div>
              </div>
            </div>
          </div>`).join("")}
        ${displayed.length === 0 ? `<div class="text-center py-10 text-sm text-slate-400">Không có yêu cầu nào đang trong trạng thái này.</div>` : ""}
      </div>

      ${state.thoVietBooking ? thoVietBookingModal(state) : ""}
    </div>`;
}

export function repairTab(state) {
  const { maintenance } = state;
  const f = state.repairForm;
  return `
    <div>
      <div class="bg-white rounded-2xl ring-1 ring-slate-200 p-3.5 shadow-sm">
        <p class="text-xs font-bold text-slate-500 mb-2">BÁO HỎNG THIẾT BỊ</p>
        <textarea data-action="repairFormText" rows="2" placeholder="Mô tả thiết bị hư hỏng..."
                  class="w-full text-sm p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-teal-400 focus:bg-white resize-none transition">${escapeHtml(f.text)}</textarea>
        ${f.photo ? `
          <div class="mt-2 relative inline-block">
            <img src="${f.photo}" alt="preview" class="h-20 w-20 object-cover rounded-lg ring-1 ring-slate-200" />
            <button data-action="repairFormClearPhoto" class="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 text-white rounded-full grid place-items-center">${icon("X", { className: "h-3 w-3" })}</button>
          </div>` : ""}
        <div class="flex items-center gap-2 mt-2.5">
          <input id="repairFileInput" type="file" accept="image/*" class="hidden" data-action="repairFormPhoto" />
          <button data-action="repairFormPickPhoto" class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition">
            ${icon("Camera", { className: "h-4 w-4" })} Ảnh / Video
          </button>
          <button data-action="repairFormSubmit" ${!f.text.trim() ? "disabled" : ""}
                  class="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 px-3 py-2 rounded-xl transition active:scale-[.99]">
            ${icon("Send", { className: "h-4 w-4" })} Gửi yêu cầu
          </button>
        </div>
      </div>

      <p class="text-xs font-bold text-slate-400 mt-5 mb-2">DANH SÁCH YÊU CẦU (${maintenance.length})</p>
      <div class="space-y-2.5">
        ${maintenance.map((m) => `
          <div class="bg-white rounded-xl ring-1 ring-slate-200 p-3 shadow-sm">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-slate-800 leading-snug">${escapeHtml(m.title)}</p>
              ${statusBadge(m.status)}
            </div>
            ${m.desc ? `<p class="text-xs text-slate-500 mt-1">${escapeHtml(m.desc)}</p>` : ""}
            ${m.photo ? `<img src="${m.photo}" alt="" class="mt-2 h-16 w-16 object-cover rounded-lg ring-1 ring-slate-200" />` : ""}
            <p class="text-[11px] text-slate-400 mt-1.5">${escapeHtml(m.date)}</p>
          </div>`).join("")}
      </div>
    </div>`;
}
