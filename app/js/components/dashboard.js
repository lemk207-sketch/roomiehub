// Personal household dashboard: header + 3-tab switcher + tab body router.
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";
import { landlordRepairTab, repairTab } from "./repair.js";
import { landlordPaymentsTab, paymentsTab } from "./payments.js";
import { internalTab } from "./internal.js";
import { userChoreTab } from "./chores.js";

export function dashboard(state) {
  const { household, user, dashboardTab: tab } = state;
  if (!household) return "";

  const tabs = [
    { id: "repair", label: "Sửa chữa", icon: "Wrench" },
    { id: "payments", label: "Thanh toán", icon: "CreditCard" },
    { id: "internal", label: user.role === "LANDLORD" ? "Nội bộ" : "Việc nhà", icon: user.role === "LANDLORD" ? "Lock" : "ListChecks" },
  ];

  return `
    <div class="flex flex-col">
      <div class="px-5 pt-4 pb-3 bg-white border-b border-slate-100">
        <button data-action="backToExplore" class="flex items-center gap-1 text-sm text-teal-700 font-medium hover:gap-2 transition-all">
          ${icon("ChevronLeft", { className: "h-4 w-4" })} Khám phá
        </button>
        <h2 class="font-extrabold text-lg text-slate-800 mt-2">${escapeHtml(household.name)}</h2>
        <p class="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
          ${icon("MapPin", { className: "h-3 w-3" })}${escapeHtml(household.address)}
        </p>
      </div>
      <div class="flex bg-white border-b border-slate-100 sticky top-0 z-10">
        ${tabs.map(({ id, label, icon: ic }) => `
          <button data-action="setDashboardTab" data-tab="${id}"
                  class="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${tab === id ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-600"}">
            ${icon(ic, { className: "h-4 w-4" })}${label}
          </button>`).join("")}
      </div>
      <div class="p-4">
        ${tab === "repair" ? (user.role === "LANDLORD" ? landlordRepairTab(state) : repairTab(state)) : ""}
        ${tab === "payments" ? (user.role === "LANDLORD" ? landlordPaymentsTab(state) : paymentsTab(state)) : ""}
        ${tab === "internal" ? (user.role === "LANDLORD" ? internalTab(state) : userChoreTab(state)) : ""}
      </div>
    </div>`;
}
