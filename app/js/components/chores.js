// "Việc nhà" tab — tenant view: weekly rotation grid + today's chore checklist.
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";
import { ROOMMATES, WEEK_SCHEDULE } from "../data.js";

const DAY_COLS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getColor(name) { return ROOMMATES.find((r) => r.name === name)?.color || "#94a3b8"; }
function getInitial(name) { return ROOMMATES.find((r) => r.name === name)?.initial || "?"; }
function lastName(name) { return name.split(" ").pop(); }

export function userChoreTab(state) {
  const { chores } = state;
  const f = state.choreForm;
  const doneCount = chores.filter((c) => c.done).length;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const isOverdue = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m < nowMins;
  };
  const allDone = doneCount === chores.length;

  return `
    <div>
      <div class="bg-white rounded-2xl ring-1 ring-slate-200 p-3 shadow-sm mb-3">
        <p class="text-[10px] font-bold text-slate-400 tracking-widest mb-2">LỊCH PHÂN CÔNG TUẦN NÀY</p>
        <div class="overflow-x-auto">
          <table class="w-full text-center text-[10px]" style="min-width:280px">
            <thead>
              <tr>
                <td class="pb-1.5 text-left font-semibold text-slate-500 pr-2" style="width:80px"></td>
                ${DAY_COLS.map((d, i) => `
                  <td class="pb-1.5 font-bold ${i === todayIdx ? "text-slate-800" : "text-slate-400"}">
                    ${i === todayIdx ? `<span class="inline-block px-1.5 py-0.5 rounded-full" style="background:#44ACFF;color:white">${d}</span>` : d}
                  </td>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${ROOMMATES.map((rm) => `
                <tr>
                  <td class="py-1 text-left pr-2">
                    <span class="inline-flex items-center gap-1">
                      <span class="h-4 w-4 rounded-full grid place-items-center text-[8px] font-black text-white shrink-0" style="background:${rm.color}">${rm.initial}</span>
                      <span class="font-medium text-slate-700 truncate" style="max-width:60px">${escapeHtml(lastName(rm.name))}</span>
                    </span>
                  </td>
                  ${(WEEK_SCHEDULE[rm.name] || []).map((on, i) => `
                    <td class="py-1">
                      ${on
                        ? `<span class="inline-block h-3 w-3 rounded-full" style="background:${i === todayIdx ? rm.color : rm.color + "60"}"></span>`
                        : `<span class="inline-block h-3 w-3 rounded-full bg-slate-100"></span>`}
                    </td>`).join("")}
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-xs font-bold text-slate-800">Việc nhà hôm nay</p>
          <p class="text-[11px] text-slate-400">${escapeHtml(now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" }))}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background:${allDone ? "#dcfce7" : "#eaf6ff"};color:${allDone ? "#16a34a" : "#44ACFF"}">
            ${doneCount}/${chores.length} xong
          </span>
          <button data-action="toggleChoreAdd" class="h-8 w-8 rounded-full grid place-items-center text-white active:scale-95 transition" style="background:#44ACFF">
            ${icon("Plus", { className: "h-4 w-4" })}
          </button>
        </div>
      </div>

      ${f.show ? `
        <div class="bg-white rounded-2xl ring-1 ring-slate-200 p-3.5 shadow-sm mb-3" style="animation:popIn .2s ease-out">
          <p class="text-xs font-bold text-slate-500 mb-2">THÊM VIỆC NHÀ MỚI</p>
          <input data-action="choreFormTask" value="${escapeHtml(f.task)}" placeholder="VD: Lau sàn, Rửa bát, Đổ rác..."
                 class="w-full text-sm p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-teal-400 mb-2" />
          <div class="flex gap-2 mb-2.5">
            <select data-action="choreFormWho" class="flex-1 text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none">
              ${ROOMMATES.map((r) => `<option value="${escapeHtml(r.name)}" ${f.who === r.name ? "selected" : ""}>${escapeHtml(r.name)}</option>`).join("")}
            </select>
            <input data-action="choreFormTime" type="time" value="${escapeHtml(f.time)}" class="w-24 text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none" />
          </div>
          <div class="flex gap-2">
            <button data-action="cancelChoreAdd" class="flex-1 text-xs font-semibold text-slate-500 bg-slate-100 py-2 rounded-xl">Hủy</button>
            <button data-action="submitChoreAdd" ${!f.task.trim() ? "disabled" : ""}
                    class="flex-1 text-xs font-bold text-white py-2 rounded-xl disabled:opacity-40 transition active:scale-[.99]" style="background:#44ACFF">
              Thêm việc
            </button>
          </div>
        </div>` : ""}

      <div class="space-y-2">
        ${chores.map((c) => {
          const color = getColor(c.assignee);
          const initial = getInitial(c.assignee);
          const overdue = !c.done && isOverdue(c.time);
          return `
          <div class="bg-white rounded-xl p-3 shadow-sm flex items-start gap-3 transition ${c.done ? "opacity-60" : ""}"
               style="border-left:3px solid ${c.done ? "#d1d5db" : color}; outline:${overdue ? "1px solid #fcd34d" : "1px solid #e2e8f0"}">
            <button data-action="toggleChore" data-id="${c.id}"
                    class="mt-0.5 h-6 w-6 rounded-lg border-2 grid place-items-center shrink-0 transition active:scale-90"
                    style="border-color:${c.done ? "#16a34a" : color}; background:${c.done ? "#dcfce7" : "transparent"}">
              ${c.done ? icon("CheckCircle2", { className: "h-4 w-4 text-emerald-600" }) : ""}
            </button>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold leading-snug ${c.done ? "line-through text-slate-400" : "text-slate-800"}">${escapeHtml(c.task)}</p>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <span class="inline-flex items-center gap-1">
                  <span class="h-5 w-5 rounded-full grid place-items-center text-[9px] font-black text-white" style="background:${color}">${initial}</span>
                  <span class="text-[10px] text-slate-500 font-medium">${escapeHtml(lastName(c.assignee))}</span>
                </span>
                <span class="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">${icon("Clock", { className: "h-3 w-3" })} ${escapeHtml(c.time)}</span>
                ${overdue ? `<span class="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">⏰ Quá giờ</span>` : ""}
                ${c.reminded && !c.done ? `<span class="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">${icon("Bell", { className: "h-2.5 w-2.5" })} Đã nhắc</span>` : ""}
              </div>
            </div>
            ${!c.done && !c.reminded && overdue ? `
              <button data-action="remindChore" data-id="${c.id}"
                      class="shrink-0 flex items-center gap-1 text-[10px] font-bold text-white px-2 py-1.5 rounded-lg active:scale-95 transition"
                      style="background:linear-gradient(135deg,#FE9EC7,#fe7ab5)">
                ${icon("Bell", { className: "h-3 w-3" })} Nhắc
              </button>` : ""}
          </div>`;
        }).join("")}
      </div>

      <div class="mt-4 rounded-xl p-3.5 text-center" style="background:${allDone ? "linear-gradient(135deg,#34d399,#6ee7b7)" : "#f8fafc"}; outline:1px solid #e2e8f0">
        ${allDone ? `
          <p class="text-white font-extrabold text-sm">🎉 Tất cả việc nhà đã xong!</p>
          <p class="text-white/80 text-[11px] mt-0.5">Phòng trọ sạch sẽ — teamwork tuyệt vời!</p>` : `
          <p class="text-slate-500 text-xs font-semibold">Còn ${chores.length - doneCount} việc chưa xong</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Tick ✓ khi bạn cùng phòng hoàn thành nhé</p>`}
      </div>
    </div>`;
}
