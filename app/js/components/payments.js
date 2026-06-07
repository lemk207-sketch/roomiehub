// "Thanh toán" tab — landlord room-by-room collection view (+ export sheet)
// and tenant invoice/QR-payment view (+ spreadsheet preview).
import { icon } from "../icons.js";
import { escapeHtml } from "../util.js";
import { formatVND } from "../data.js";
import { mockQR } from "./shell.js";

const fmtDong = (n) => n.toLocaleString("vi-VN") + "đ";
const fmtVND = (n) => n.toLocaleString("vi-VN") + "₫";

const COPY_ICON = `<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>`;

function downloadXls(filename, html, ping, okMsg, failMsg) {
  try {
    const blob = new Blob(["﻿" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ping(okMsg);
  } catch (e) {
    ping(failMsg);
  }
}

/* ---------------------------------------------------------------------- *
 * LandlordPaymentsTab + LandlordSheetModal                                *
 * ---------------------------------------------------------------------- */
export function landlordPaymentsTab(state) {
  const { household } = state;
  const rooms = state.landlordRooms;
  const reminded = state.landlordReminded;
  const paid = rooms.filter((r) => r.status === "paid");
  const unpaid = rooms.filter((r) => r.status === "unpaid");
  const collected = paid.reduce((s, r) => s + r.amount, 0);
  const outstanding = unpaid.reduce((s, r) => s + r.amount, 0);
  const total = collected + outstanding;

  return `
    <div>
      <div class="rounded-2xl p-3.5 mb-3 text-white" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
        <p class="text-xs font-semibold opacity-90">KỲ THU TIỀN</p>
        <p class="text-lg font-extrabold leading-tight">Tháng 5 / 2026</p>
        <div class="flex items-center gap-3 mt-1.5 text-xs">
          <span class="bg-white/20 rounded-full px-2 py-0.5 font-semibold">${paid.length}/${rooms.length} phòng đã đóng</span>
        </div>
      </div>

      <p class="text-[11px] font-bold text-emerald-600 mb-2 flex items-center gap-1.5">${icon("CheckCircle2", { className: "h-3.5 w-3.5" })} ĐÃ THANH TOÁN (${paid.length})</p>
      <div class="space-y-2 mb-4">
        ${paid.map((r) => `
          <div class="bg-white rounded-xl p-3 shadow-sm" style="outline:1px solid #d1fae5">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full" style="background:#dcfce7;color:#16a34a">Phòng ${escapeHtml(r.room)}</span>
                  <span class="text-xs font-semibold text-slate-700 truncate">${escapeHtml(r.tenant)}</span>
                </div>
                <p class="text-[11px] text-slate-400 flex items-center gap-1 mt-1">${icon("Phone", { className: "h-3 w-3" })}${escapeHtml(r.phone)}</p>
              </div>
              <div class="text-right shrink-0"><p class="text-sm font-extrabold text-slate-800">${formatVND(r.amount)}</p></div>
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              ${r.confirmed ? `
                <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">${icon("CheckCircle2", { className: "h-3.5 w-3.5" })} Chủ trọ đã xác nhận</span>` : `
                <span class="text-[11px] font-bold text-amber-600 flex items-center gap-1">${icon("Clock", { className: "h-3.5 w-3.5" })} Chờ chủ trọ xác nhận</span>
                <button data-action="confirmRoomPayment" data-room="${escapeHtml(r.room)}"
                        class="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition active:scale-95" style="background:linear-gradient(135deg,#44ACFF,#89D4FF)">
                  Xác nhận
                </button>`}
            </div>
          </div>`).join("")}
      </div>

      <p class="text-[11px] font-bold text-rose-500 mb-2 flex items-center gap-1.5">${icon("Bell", { className: "h-3.5 w-3.5" })} CHƯA THANH TOÁN (${unpaid.length})</p>
      <div class="space-y-2 mb-4">
        ${unpaid.map((r) => {
          const wasReminded = reminded.includes(r.room);
          return `
          <div class="bg-white rounded-xl p-3 shadow-sm" style="outline:1px solid #fecdd3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full" style="background:#ffe4e6;color:#e11d48">Phòng ${escapeHtml(r.room)}</span>
                  <span class="text-xs font-semibold text-slate-700 truncate">${escapeHtml(r.tenant)}</span>
                </div>
                <p class="text-[11px] text-slate-400 flex items-center gap-1 mt-1">${icon("Phone", { className: "h-3 w-3" })}${escapeHtml(r.phone)}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-extrabold text-slate-800">${formatVND(r.amount)}</p>
                <p class="text-[10px] text-rose-500 font-semibold">Chưa thu</p>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-slate-100">
              <button data-action="remindRoomPayment" data-room="${escapeHtml(r.room)}" data-tenant="${escapeHtml(r.tenant)}" ${wasReminded ? "disabled" : ""}
                      class="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition active:scale-[.99] ${wasReminded ? "bg-slate-100 text-slate-400" : "text-white"}"
                      style="${wasReminded ? "" : "background:linear-gradient(135deg,#FE9EC7,#fe7ab5)"}">
                ${wasReminded
                  ? `${icon("CheckCircle2", { className: "h-3.5 w-3.5" })} Đã gửi nhắc nhở`
                  : `${icon("Bell", { className: "h-3.5 w-3.5" })} Gửi thông báo nhắc nhở`}
              </button>
            </div>
          </div>`;
        }).join("")}
      </div>

      <div class="rounded-2xl overflow-hidden shadow-sm mb-3" style="outline:1.5px solid #44ACFF">
        <div class="px-4 py-2.5 text-white" style="background:#44ACFF"><p class="text-sm font-extrabold">Tổng thu tháng 5 / 2026</p></div>
        <div class="bg-white p-4 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-1.5 text-emerald-600 font-semibold">${icon("CheckCircle2", { className: "h-4 w-4" })} Đã thu (${paid.length} phòng)</span>
            <span class="font-bold text-emerald-600">${formatVND(collected)}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-1.5 text-rose-500 font-semibold">${icon("Clock", { className: "h-4 w-4" })} Chưa thu (${unpaid.length} phòng)</span>
            <span class="font-bold text-rose-500">${formatVND(outstanding)}</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t-2 border-slate-100">
            <span class="font-extrabold text-slate-800">TỔNG CỘNG</span>
            <span class="text-lg font-black" style="color:#44ACFF">${formatVND(total)}</span>
          </div>
        </div>
      </div>

      <button data-action="openLandlordSheet" class="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition active:scale-[.99] bg-white" style="color:#44ACFF;box-shadow:0 0 0 1px #89D4FF">
        ${icon("Download", { className: "h-4 w-4" })} Xuất bảng tổng thu (.xls)
      </button>

      ${state.showLandlordSheet ? landlordSheetModal(state, { rooms, household }) : ""}
    </div>`;
}

export function landlordSheetModal(state, { rooms, household }) {
  const paid = rooms.filter((r) => r.status === "paid");
  const unpaid = rooms.filter((r) => r.status === "unpaid");
  const collected = paid.reduce((s, r) => s + r.amount, 0);
  const outstanding = unpaid.reduce((s, r) => s + r.amount, 0);
  const total = collected + outstanding;
  const cell = (bg, extra = "") => `background:${bg};border:1px solid #999;padding:4px 8px${extra}`;

  return `
    <div class="absolute inset-0 z-50 flex items-end justify-center">
      <div class="absolute inset-0 bg-slate-900/60" data-action="closeLandlordSheet"></div>
      <div class="relative w-full bg-white rounded-t-3xl shadow-2xl overflow-hidden" style="max-height:88%">
        <div class="flex items-center justify-between bg-slate-800 px-4 py-3">
          <span class="text-white text-sm font-semibold">Tổng thu trọ - Tháng 5/2026</span>
          <button data-action="closeLandlordSheet" class="h-7 w-7 grid place-items-center bg-white/10 hover:bg-white/20 rounded-full transition">${icon("X", { className: "h-4 w-4 text-white" })}</button>
        </div>
        <div class="overflow-y-auto p-3" style="max-height:380px">
          <table class="w-full text-xs mb-3" style="border-collapse:collapse;font-family:Arial">
            <tbody>
              <tr><td colspan="2" style="background:#FFFF00;font-weight:bold;padding:6px 8px;border:1px solid #999">Tổng thu nhập tháng 5 (đã đóng)</td></tr>
              <tr>
                <td style="background:#d9d9d9;font-weight:bold;border:1px solid #000;padding:4px 8px">Phòng số</td>
                <td style="background:#d9d9d9;font-weight:bold;border:1px solid #000;padding:4px 8px;text-align:right">Số tiền (VND)</td>
              </tr>
              ${paid.map((r) => `<tr><td style="${cell("#d9ead3")}">${escapeHtml(r.room)}</td><td style="${cell("#d9ead3", ";text-align:right")}">${fmtDong(r.amount)}</td></tr>`).join("")}
              <tr><td style="font-weight:bold;border:1px solid #000;padding:4px 8px">Đã thu</td><td style="font-weight:bold;border:1px solid #000;padding:4px 8px;text-align:right">${fmtDong(collected)}</td></tr>
            </tbody>
          </table>
          <table class="w-full text-xs mb-3" style="border-collapse:collapse;font-family:Arial">
            <tbody>
              <tr><td colspan="2" style="background:#FFFF00;font-weight:bold;padding:6px 8px;border:1px solid #999">Tổng thu nhập tháng 5 (chưa đóng)</td></tr>
              <tr>
                <td style="background:#d9d9d9;font-weight:bold;border:1px solid #000;padding:4px 8px">Phòng số</td>
                <td style="background:#d9d9d9;font-weight:bold;border:1px solid #000;padding:4px 8px;text-align:right">Số tiền (VND)</td>
              </tr>
              ${unpaid.map((r) => `<tr><td style="${cell("#f4cccc")}">${escapeHtml(r.room)}</td><td style="${cell("#f4cccc", ";text-align:right")}">${fmtDong(r.amount)}</td></tr>`).join("")}
              <tr><td style="font-weight:bold;border:1px solid #000;padding:4px 8px">Chưa thu</td><td style="font-weight:bold;border:1px solid #000;padding:4px 8px;text-align:right">${fmtDong(outstanding)}</td></tr>
            </tbody>
          </table>
          <div class="text-center font-black text-sm py-2.5 rounded" style="background:#FFFF00;border:1px solid #999">TỔNG THU: ${fmtDong(total)}</div>
        </div>
        <div class="flex gap-2.5 p-4 bg-slate-50 border-t border-slate-200">
          <button data-action="copyLandlordSheet" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-white ring-1 ring-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition active:scale-[.99]">
            ${COPY_ICON} Copy (Google Sheets)
          </button>
          <button data-action="downloadLandlordSheet" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white py-2.5 rounded-xl transition active:scale-[.99]" style="background:#44ACFF">
            ${icon("Download", { className: "h-4 w-4" })} Tải xuống .xls
          </button>
        </div>
      </div>
    </div>`;
}

export function downloadLandlordSheet(rooms, ping) {
  const paid = rooms.filter((r) => r.status === "paid");
  const unpaid = rooms.filter((r) => r.status === "unpaid");
  const collected = paid.reduce((s, r) => s + r.amount, 0);
  const outstanding = unpaid.reduce((s, r) => s + r.amount, 0);
  const total = collected + outstanding;
  const maxLen = Math.max(paid.length, unpaid.length);
  let bodyRows = "";
  for (let i = 0; i < maxLen; i++) {
    const p = paid[i], u = unpaid[i];
    bodyRows += `<tr>
      <td class="gd">${p ? p.room : ""}</td><td class="gn">${p ? fmtDong(p.amount) : ""}</td>
      <td class="gap"></td>
      <td class="rd">${u ? u.room : ""}</td><td class="rn">${u ? fmtDong(u.amount) : ""}</td></tr>`;
  }
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;font-size:10pt}table{border-collapse:collapse}
    .yh{background:#FFFF00;font-weight:bold;padding:6px 10px;border:1px solid #999}
    .th{background:#d9d9d9;font-weight:bold;border:1px solid #000;padding:5px 8px}
    .gd{background:#d9ead3;border:1px solid #999;padding:5px 8px}
    .gn{background:#d9ead3;border:1px solid #999;padding:5px 8px;text-align:right}
    .rd{background:#f4cccc;border:1px solid #999;padding:5px 8px}
    .rn{background:#f4cccc;border:1px solid #999;padding:5px 8px;text-align:right}
    .gap{width:24px;border:none}
    .tot{font-weight:bold;border:1px solid #000;padding:5px 8px}
    .grand{background:#FFFF00;font-weight:bold;font-size:13pt;padding:8px 12px;border:1px solid #999}
    </style></head><body><table>
    <tr><td colspan="2" class="yh">Tổng thu nhập tháng 5 (đã đóng)</td><td class="gap"></td>
        <td colspan="2" class="yh">Tổng thu nhập tháng 5 (chưa đóng)</td></tr>
    <tr><td class="th">Phòng số</td><td class="th">Số tiền (VND)</td><td class="gap"></td>
        <td class="th">Phòng số</td><td class="th">Số tiền (VND)</td></tr>
    ${bodyRows}
    <tr><td class="tot">Đã thu</td><td class="tot" style="text-align:right">${fmtDong(collected)}</td>
        <td class="gap"></td>
        <td class="tot">Chưa thu</td><td class="tot" style="text-align:right">${fmtDong(outstanding)}</td></tr>
    <tr><td colspan="5" style="height:10px"></td></tr>
    <tr><td colspan="5" class="grand">TỔNG THU: ${fmtDong(total)}</td></tr>
    </table></body></html>`;
  downloadXls("Tong_thu_tro_Thang_5_2026.xls", html, ping, "Đã tải xuống bảng tổng thu .xls", "Dùng nút Copy để lấy dữ liệu");
}

export function copyLandlordSheet(rooms, ping) {
  const paid = rooms.filter((r) => r.status === "paid");
  const unpaid = rooms.filter((r) => r.status === "unpaid");
  const collected = paid.reduce((s, r) => s + r.amount, 0);
  const outstanding = unpaid.reduce((s, r) => s + r.amount, 0);
  const total = collected + outstanding;
  const lines = ["PHÒNG ĐÃ ĐÓNG\tSỐ TIỀN\t\tPHÒNG CHƯA ĐÓNG\tSỐ TIỀN"];
  const maxLen = Math.max(paid.length, unpaid.length);
  for (let i = 0; i < maxLen; i++) {
    const p = paid[i], u = unpaid[i];
    lines.push(`${p ? p.room : ""}\t${p ? p.amount : ""}\t\t${u ? u.room : ""}\t${u ? u.amount : ""}`);
  }
  lines.push(`Đã thu\t${collected}\t\tChưa thu\t${outstanding}`);
  lines.push(`TỔNG THU\t${total}`);
  navigator.clipboard?.writeText(lines.join("\n")).then(() => ping("Đã copy — paste vào Google Sheets!"));
}

/* ---------------------------------------------------------------------- *
 * PaymentsTab (tenant) + SpreadsheetModal                                 *
 * ---------------------------------------------------------------------- */
export function paymentsTab(state) {
  const { invoices, household } = state;
  const now = new Date();
  const dueDay = 29;
  let dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (now.getDate() > dueDay) dueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  const msLeft = dueDate - now;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const isToday = daysLeft === 0;
  const isUrgent = daysLeft <= 3;
  const dueDateStr = `${String(dueDate.getDate()).padStart(2, "0")}/${String(dueDate.getMonth() + 1).padStart(2, "0")}/${dueDate.getFullYear()}`;

  const bannerCls = isToday ? "bg-rose-50 ring-rose-300" : isUrgent ? "bg-amber-50 ring-amber-300" : "bg-teal-50 ring-teal-200";
  const iconBg = isToday ? "bg-rose-500" : isUrgent ? "bg-amber-400" : "bg-teal-500";
  const titleCls = isToday ? "text-rose-700" : isUrgent ? "text-amber-700" : "text-teal-700";
  const numCls = isToday ? "text-rose-500" : isUrgent ? "text-amber-500" : "text-teal-500";

  return `
    <div>
      <div class="flex items-center justify-between gap-3 p-3.5 rounded-2xl mb-4 ring-1 ${bannerCls}">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="h-8 w-8 rounded-xl grid place-items-center shrink-0 ${iconBg}">${icon("Bell", { className: "h-4 w-4 text-white" })}</div>
          <div class="min-w-0">
            <p class="text-xs font-bold ${titleCls}">${isToday ? "Hôm nay là ngày đóng tiền!" : `Còn ${daysLeft} ngày đến hạn nộp tiền`}</p>
            <p class="text-[11px] text-slate-500 truncate">Ngày 29 hàng tháng · Hạn: ${dueDateStr}</p>
          </div>
        </div>
        <span class="text-2xl font-black shrink-0 tabular-nums ${numCls}">${isToday ? "!" : daysLeft}</span>
      </div>

      <button data-action="openSpreadsheet" class="w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-700 bg-white hover:bg-teal-50 ring-1 ring-teal-200 py-2.5 rounded-xl transition mb-4 active:scale-[.99]">
        ${icon("Download", { className: "h-4 w-4" })} Xem &amp; Xuất bảng tính
      </button>

      ${state.showSpreadsheet ? spreadsheetModal(state, { invoices, household }) : ""}

      <div class="space-y-3">
        ${invoices.map((iv) => {
          const total = iv.rent + iv.electricity + iv.water;
          const pending = iv.status === "pending";
          return `
          <div class="bg-white rounded-2xl ring-1 shadow-sm overflow-hidden ${pending ? "ring-amber-300" : "ring-slate-200"}">
            <div class="flex items-center justify-between px-4 py-3">
              <div>
                <p class="font-bold text-sm text-slate-800">${escapeHtml(iv.month)}</p>
                <p class="text-[11px] text-slate-400">Hạn đóng: ${escapeHtml(iv.due)}</p>
              </div>
              <div class="text-right">
                <p class="font-extrabold text-base text-slate-800">${formatVND(total)}</p>
                <span class="text-[10px] font-bold ${pending ? "text-amber-600" : "text-emerald-600"}">${pending ? "● Chưa thanh toán" : "● Đã thanh toán"}</span>
              </div>
            </div>
            ${pending ? `
              <div class="px-4 pb-4 border-t border-slate-100 pt-3">
                <div class="space-y-1.5 text-xs text-slate-600">
                  <div class="flex items-center justify-between"><span class="flex items-center gap-1.5">${icon("Home", { className: "h-3.5 w-3.5 text-slate-400" })}Tiền phòng</span><span class="font-medium">${formatVND(iv.rent)}</span></div>
                  <div class="flex items-center justify-between"><span class="flex items-center gap-1.5">${icon("Zap", { className: "h-3.5 w-3.5 text-slate-400" })}Tiền điện</span><span class="font-medium">${formatVND(iv.electricity)}</span></div>
                  <div class="flex items-center justify-between"><span class="flex items-center gap-1.5">${icon("Droplet", { className: "h-3.5 w-3.5 text-slate-400" })}Tiền nước</span><span class="font-medium">${formatVND(iv.water)}</span></div>
                </div>
                <div class="mt-3 flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div class="rounded-lg overflow-hidden ring-1 ring-slate-200 shrink-0">${mockQR({ seed: total, size: 88 })}</div>
                  <div class="text-[11px] text-slate-500 leading-relaxed">
                    <p class="font-semibold text-slate-700">Quét QR để thanh toán</p>
                    <p>Số tiền &amp; nội dung CK đã điền sẵn.</p>
                    <p class="mt-1 text-slate-400">ND: ${escapeHtml(household.name)} ${escapeHtml(iv.month)}</p>
                  </div>
                </div>
                <button data-action="payInvoice" data-id="${escapeHtml(iv.id)}" class="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition active:scale-[.99]">
                  Xác nhận đã thanh toán
                </button>
              </div>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>`;
}

export function spreadsheetModal(state, { invoices, household }) {
  const pendingInv = invoices.find((iv) => iv.status === "pending") || invoices[0];
  const paidInvs = invoices.filter((iv) => iv.status === "paid");
  const total = pendingInv.rent + pendingInv.electricity + pendingInv.water;
  const td = (extra = "") => `border:1px solid #999;padding:5px 8px${extra}`;
  return `
    <div class="absolute inset-0 z-50 flex items-end justify-center">
      <div class="absolute inset-0 bg-slate-900/60" data-action="closeSpreadsheet"></div>
      <div class="relative w-full bg-white rounded-t-3xl shadow-2xl overflow-hidden" style="max-height:88%">
        <div class="flex items-center justify-between bg-slate-800 px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="h-5 w-5 rounded grid place-items-center" style="background:#0F9D58">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/>
                <rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/>
              </svg>
            </div>
            <span class="text-white text-sm font-semibold">Tiền trọ ${escapeHtml(pendingInv.month)}</span>
          </div>
          <button data-action="closeSpreadsheet" class="h-7 w-7 grid place-items-center bg-white/10 hover:bg-white/20 rounded-full transition">${icon("X", { className: "h-4 w-4 text-white" })}</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm" style="font-family:Arial, sans-serif;border-collapse:collapse">
            <tbody>
              <tr><td colspan="3" style="background:#FFFF00;font-weight:bold;font-size:13px;padding:8px 12px;border:1px solid #999">Khách phòng A206 &nbsp; ${escapeHtml(household.name)}</td></tr>
              <tr style="height:10px"><td colspan="3"></td></tr>
              <tr>
                <td style="border:1px solid #000;font-weight:bold;padding:5px 8px;background:#f2f2f2;width:36px"></td>
                <td style="border:1px solid #000;font-weight:bold;padding:5px 8px;background:#f2f2f2;min-width:160px">Mục chi phí</td>
                <td style="border:1px solid #000;font-weight:bold;padding:5px 8px;background:#f2f2f2;text-align:right;min-width:130px">Số tiền (VNĐ)</td>
              </tr>
              <tr><td style="${td(";text-align:center")}">1</td><td style="${td()}">Tiền phòng</td><td style="${td(";text-align:right")}">${fmtVND(pendingInv.rent)}</td></tr>
              <tr><td style="${td(";text-align:center")}">2</td><td style="${td()}">Tiền điện</td><td style="${td(";text-align:right")}">${fmtVND(pendingInv.electricity)}</td></tr>
              <tr><td style="${td(";text-align:center")}">3</td><td style="${td()}">Tiền nước</td><td style="${td(";text-align:right")}">${fmtVND(pendingInv.water)}</td></tr>
              <tr>
                <td style="padding:5px 8px"></td>
                <td style="border:1px solid #000;font-weight:bold;padding:5px 8px">Tổng cộng</td>
                <td style="border:1px solid #000;font-weight:bold;padding:5px 8px;text-align:right">${fmtVND(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${paidInvs.length > 0 ? `
          <div class="px-4 py-2 border-t border-slate-100">
            <p class="text-[11px] font-bold text-slate-400 mb-1.5">LỊCH SỬ ĐÃ THANH TOÁN</p>
            ${paidInvs.map((iv) => `
              <div class="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <span class="text-slate-600">${escapeHtml(iv.month)}</span>
                <span class="font-semibold text-emerald-600">${fmtVND(iv.rent + iv.electricity + iv.water)}</span>
              </div>`).join("")}
          </div>` : ""}

        <div class="flex gap-2.5 p-4 bg-slate-50 border-t border-slate-200">
          <button data-action="copySpreadsheet" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-white ring-1 ring-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition active:scale-[.99]">
            ${COPY_ICON} Copy CSV (Google Sheets)
          </button>
          <button data-action="downloadSpreadsheet" class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 py-2.5 rounded-xl transition active:scale-[.99]">
            ${icon("Download", { className: "h-4 w-4" })} Tải xuống .xls
          </button>
        </div>
      </div>
    </div>`;
}

export function downloadSpreadsheet(invoices, household, ping) {
  const pendingInv = invoices.find((iv) => iv.status === "pending") || invoices[0];
  const total = pendingInv.rent + pendingInv.electricity + pendingInv.water;
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;font-size:10pt}
  table{border-collapse:collapse}
  .hdr{background:#FFFF00;font-weight:bold;font-size:13pt;padding:6px 10px;border:1px solid #999}
  .th{border:1px solid #000;font-weight:bold;padding:5px 8px;background:#f2f2f2}
  .td{border:1px solid #999;padding:5px 8px}
  .num{border:1px solid #999;padding:5px 8px;text-align:right}
  .tot{border:1px solid #000;font-weight:bold;padding:5px 8px}
  .totn{border:1px solid #000;font-weight:bold;padding:5px 8px;text-align:right}
  .idx{border:1px solid #999;padding:5px 8px;text-align:center}
</style></head><body><table>
  <tr><td colspan="3" class="hdr">Khách phòng A206 — ${household.name}</td></tr>
  <tr><td colspan="3" style="height:8px"></td></tr>
  <tr><td class="th"></td><td class="th">Mục chi phí</td><td class="th">Số tiền (VNĐ)</td></tr>
  <tr><td class="idx">1</td><td class="td">Tiền phòng</td><td class="num">${fmtVND(pendingInv.rent)}</td></tr>
  <tr><td class="idx">2</td><td class="td">Tiền điện</td><td class="num">${fmtVND(pendingInv.electricity)}</td></tr>
  <tr><td class="idx">3</td><td class="td">Tiền nước</td><td class="num">${fmtVND(pendingInv.water)}</td></tr>
  <tr><td></td><td class="tot">Tổng cộng</td><td class="totn">${fmtVND(total)}</td></tr>
</table></body></html>`;
  downloadXls(`Tien_tro_${pendingInv.month.replace(/\s*\/\s*/g, "_")}.xls`, html, ping, "Đã tải xuống file .xls", "Dùng nút Copy CSV để lấy dữ liệu");
}

export function copySpreadsheet(invoices, ping) {
  const rows = [
    ["Tháng", "Tiền phòng", "Tiền điện", "Tiền nước", "Tổng", "Trạng thái"],
    ...invoices.map((iv) => [
      iv.month, iv.rent, iv.electricity, iv.water,
      iv.rent + iv.electricity + iv.water,
      iv.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán",
    ]),
  ];
  const csv = rows.map((r) => r.join("\t")).join("\n");
  navigator.clipboard?.writeText(csv).then(() => ping("Đã copy — paste vào Google Sheets!"));
}
