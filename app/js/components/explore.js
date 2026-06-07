// Explore tab: search, household grid, summary modal, "create household" modal.
import { icon } from "../icons.js";
import { escapeHtml, cls } from "../util.js";
import { modalShell } from "./shell.js";
import { aiAssistant } from "./ai.js";

const SUGGEST_CHIPS = ["Bình Thạnh", "District 1", "Còn phòng trống", "Đánh giá cao"];

export function explorePage(state) {
  const { query, households: allHouseholds } = state;
  const q = query.toLowerCase();
  const households = allHouseholds.filter(
    (h) => h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
  );
  return `
    <div class="px-5 pt-5 pb-6">
      <div class="flex items-center gap-2">
        <div class="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm ring-1 ring-slate-200 focus-within:ring-teal-400 transition">
          ${icon("Search", { className: "h-4 w-4 text-slate-400 shrink-0" })}
          <input
            value="${escapeHtml(query)}"
            data-action="setQuery"
            placeholder="Tìm khu vực, tên trọ..."
            class="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
          ${query ? `<button data-action="clearQuery" class="text-slate-400 hover:text-slate-600">${icon("X", { className: "h-3.5 w-3.5" })}</button>` : ""}
        </div>
        <button class="h-10 w-10 grid place-items-center bg-white rounded-full shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition">
          ${icon("SlidersHorizontal", { className: "h-4 w-4 text-slate-500" })}
        </button>
      </div>

      <div class="mt-3">
        <p class="text-[11px] font-semibold text-slate-400 mb-1.5">GỢI Ý</p>
        <div class="flex flex-wrap gap-2">
          ${SUGGEST_CHIPS.map((c) => `
            <button data-action="setQueryChip" data-chip="${escapeHtml(c)}"
                    class="text-xs font-medium text-slate-600 bg-white ring-1 ring-slate-200 px-3 py-1.5 rounded-full hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-200 transition">
              ${escapeHtml(c)}
            </button>`).join("")}
        </div>
      </div>

      <p class="text-[11px] font-semibold text-slate-400 mt-5 mb-2">${households.length} HOUSEHOLD</p>
      <div class="grid grid-cols-2 gap-3">
        ${households.map(householdCard).join("")}
        ${households.length === 0 ? `<p class="col-span-2 text-center text-sm text-slate-400 py-10">Không tìm thấy household nào.</p>` : ""}
      </div>
    </div>`;
}

function householdCard(h) {
  const available = h.totalRooms - h.occupied;
  const full = available === 0;
  return `
    <button data-action="openHousehold" data-id="${h.id}"
            class="group text-left bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:ring-teal-300 hover:-translate-y-0.5 transition-all">
      <div class="relative h-36 overflow-hidden bg-teal-100">
        ${h.photo
          ? `<img src="${h.photo}" alt="${escapeHtml(h.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" style="display:block" />`
          : `<div class="w-full h-full grid place-items-center bg-gradient-to-br from-teal-100 to-cyan-200">${icon("Home", { className: "h-9 w-9 text-teal-400" })}</div>`}
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <span class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${full ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"}">
          ${h.occupied}/${h.totalRooms}
        </span>
      </div>
      <div class="p-2.5">
        <p class="font-bold text-sm text-slate-800 truncate">${escapeHtml(h.name)}</p>
        <p class="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
          ${icon("MapPin", { className: "h-3 w-3 shrink-0" })}${escapeHtml(h.area)}
        </p>
        <div class="flex items-center justify-between mt-1.5">
          <span class="flex items-center gap-0.5 text-[11px] text-amber-600 font-semibold">
            ${icon("Star", { className: "h-3 w-3 fill-amber-400 text-amber-400" })}${h.rating}
          </span>
          <span class="text-[10px] font-bold ${full ? "text-rose-500" : "text-emerald-600"}">
            ${full ? "Hết phòng" : `${available} trống`}
          </span>
        </div>
      </div>
    </button>`;
}

export function householdSummaryModal(state) {
  const h = state.households.find((x) => x.id === state.selectedHouseholdId);
  if (!h) return "";
  const available = h.totalRooms - h.occupied;
  return modalShell(`
    <div class="relative h-36 overflow-hidden">
      ${h.photo
        ? `<img src="${h.photo}" alt="${escapeHtml(h.name)}" class="w-full h-full object-cover" style="display:block" />`
        : `<div class="w-full h-full bg-gradient-to-br from-teal-600 to-teal-600 grid place-items-center">${icon("Home", { className: "h-12 w-12 text-white/80" })}</div>`}
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <button data-action="closeHouseholdSummary" class="absolute top-3 right-3 h-8 w-8 grid place-items-center bg-black/30 hover:bg-black/50 rounded-full transition">
        ${icon("X", { className: "h-4 w-4 text-white" })}
      </button>
      <div class="absolute bottom-3 left-4">
        <p class="font-extrabold text-white text-lg leading-tight">${escapeHtml(h.name)}</p>
      </div>
    </div>
    <div class="p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="flex items-center gap-0.5 text-sm text-amber-600 font-bold">
          ${icon("Star", { className: "h-4 w-4 fill-amber-400 text-amber-400" })}${h.rating}
          <span class="text-slate-400 font-medium text-xs ml-1">(${h.reviews} đánh giá)</span>
        </span>
      </div>
      <div class="space-y-2 text-sm text-slate-600">
        <p class="flex items-center gap-2">${icon("MapPin", { className: "h-4 w-4 text-teal-500 shrink-0" })}${escapeHtml(h.address)}</p>
        <p class="flex items-center gap-2">${icon("User", { className: "h-4 w-4 text-teal-500 shrink-0" })}Chủ trọ: ${escapeHtml(h.landlord)}</p>
        <p class="flex items-center gap-2">${icon("Phone", { className: "h-4 w-4 text-teal-500 shrink-0" })}${escapeHtml(h.phone)}</p>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-4">
        ${stat({ icon: "Users", label: "Đang ở", value: `${h.occupied} người`, tone: "blue" })}
        ${stat({ icon: "DoorOpen", label: "Phòng trống", value: available === 0 ? "Hết phòng" : `${available} phòng`, tone: available === 0 ? "rose" : "emerald" })}
      </div>
      <p class="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
        ${icon("ShieldCheck", { className: "h-3.5 w-3.5" })}
        Đánh giá chỉ từ người thuê đã xác thực.
      </p>
      <button data-action="closeHouseholdSummary" class="mt-4 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-xl transition active:scale-[.99]">
        Liên hệ chủ trọ
      </button>

      ${aiAssistant(state, h)}
    </div>
  `, { closeAction: "closeHouseholdSummary" });
}

function stat({ icon: iconName, label, value, tone }) {
  const tones = { blue: "bg-teal-50 text-teal-700", emerald: "bg-emerald-50 text-emerald-700", rose: "bg-rose-50 text-rose-700" };
  return `
    <div class="rounded-xl p-3 ${tones[tone]}">
      ${icon(iconName, { className: "h-4 w-4 mb-1" })}
      <p class="text-[11px] opacity-70">${label}</p>
      <p class="font-bold text-sm">${escapeHtml(value)}</p>
    </div>`;
}

export function newHouseholdModal(state) {
  const f = state.newHouseholdForm;
  const valid = f.name.trim() && f.address.trim() && Number(f.rooms) > 0;
  return modalShell(`
    <div class="p-5">
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-extrabold text-lg text-slate-800">Tạo Household mới</h3>
        <button data-action="closeNewHousehold" class="h-8 w-8 grid place-items-center hover:bg-slate-100 rounded-full transition">
          ${icon("X", { className: "h-4 w-4 text-slate-500" })}
        </button>
      </div>
      <p class="text-xs text-slate-400 mb-4">Dành cho chủ trọ. Household sẽ xuất hiện công khai.</p>

      ${state.user.role !== "LANDLORD" ? `
        <div class="mb-4 flex items-start gap-2 bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-xs p-2.5 rounded-lg">
          ${icon("AlertTriangle", { className: "h-4 w-4 shrink-0 mt-px" })}
          Bạn đang ở vai trò USER. Demo vẫn cho tạo — thực tế cần vai trò LANDLORD.
        </div>` : ""}

      <label class="block mb-3">
        <span class="text-xs font-semibold text-slate-500 mb-1 block">Tên household</span>
        <input data-action="newHouseholdField" data-field="name" value="${escapeHtml(f.name)}" placeholder="VD: Sunrise House" class="field" />
      </label>
      <label class="block mb-3">
        <span class="text-xs font-semibold text-slate-500 mb-1 block">Địa chỉ</span>
        <input data-action="newHouseholdField" data-field="address" value="${escapeHtml(f.address)}" placeholder="Số nhà, tên đường" class="field" />
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block mb-3">
          <span class="text-xs font-semibold text-slate-500 mb-1 block">Khu vực</span>
          <select data-action="newHouseholdField" data-field="area" class="field">
            ${["Bình Thạnh", "District 1", "Quận 3", "Thủ Đức"].map((a) => `<option ${f.area === a ? "selected" : ""}>${a}</option>`).join("")}
          </select>
        </label>
        <label class="block mb-3">
          <span class="text-xs font-semibold text-slate-500 mb-1 block">Tổng số phòng</span>
          <input data-action="newHouseholdField" data-field="rooms" type="number" value="${escapeHtml(f.rooms)}" placeholder="VD: 10" class="field" />
        </label>
      </div>
      <button data-action="createHousehold" ${valid ? "" : "disabled"}
              class="mt-2 w-full bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition active:scale-[.99]">
        Tạo Household
      </button>
    </div>
  `, { closeAction: "closeNewHousehold" });
}

export function householdById(state, id) {
  return state.households.find((h) => h.id === id);
}

export const SUGGEST_CHIP_LIST = SUGGEST_CHIPS;
