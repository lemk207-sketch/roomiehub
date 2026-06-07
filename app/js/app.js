// App entry point: initial state, top-level render (header/body/nav/modals/toast),
// and the central click/input dispatcher wired through one delegated listener set.
import { initStore, getState, setState } from "./store.js";
import { delegate, qs } from "./util.js";
import { icon } from "./icons.js";
import {
  INITIAL_HOUSEHOLDS, INITIAL_MAINTENANCE, INITIAL_INVOICES, RESIDENTS,
  ROOM_PAYMENTS, ROOMMATES, INITIAL_CHORES, RH_LOGO, UNIRE_LOGO,
} from "./data.js";

import { profileDropdown, toast } from "./components/shell.js";
import {
  explorePage, householdSummaryModal, newHouseholdModal,
} from "./components/explore.js";
import { dashboard } from "./components/dashboard.js";
import {
  aboutUsPage, subscriptionModal, personalInfoModal, reviewModal,
} from "./components/modals.js";
import {
  floatingUnireAI, generateReply, aiIntroFor, FLOATING_AI_INTRO,
} from "./components/ai.js";
import {
  downloadLandlordSheet as exportLandlordXls, copyLandlordSheet as copyLandlordCsv,
  downloadSpreadsheet as exportInvoiceXls, copySpreadsheet as copyInvoiceCsv,
} from "./components/payments.js";

const root = document.getElementById("root");

/* ---------------------------------------------------------------------- *
 * Initial state — mirrors every useState() in the original App component  *
 * plus the namespaced sub-states ported from each tab/modal component.    *
 * ---------------------------------------------------------------------- */
function personalInfoFormFor(user, residents) {
  const me = residents.find((r) => r.name === user.name) || residents[0];
  return {
    phone: me.phone || "", cccd: me.cccd || "", job: me.job || "",
    emName: me.emergency?.name || "", emPhone: me.emergency?.phone || "", emRel: me.emergency?.relation || "",
    expiry: me.residenceExpiry || "", cccdPhoto: null, done: false,
  };
}

const initialUser = { name: "Ngoại Thị Thương", role: "USER", householdId: 1 };

const initialState = {
  view: "explore",
  user: initialUser,
  households: INITIAL_HOUSEHOLDS,
  maintenance: INITIAL_MAINTENANCE,
  invoices: INITIAL_INVOICES,
  residents: RESIDENTS,

  showProfile: false,
  showNewModal: false,
  showReviewModal: false,
  showAbout: false,
  showPersonalInfo: false,
  showSubscribe: false,

  selectedHouseholdId: null,
  dashboardTab: "repair",
  query: "",
  toast: { msg: "", type: "ok" },

  repairFilter: "all",
  repairForm: { text: "", photo: null },
  thoVietBooking: null,

  landlordRooms: ROOM_PAYMENTS,
  landlordReminded: [],
  showLandlordSheet: false,
  showSpreadsheet: false,

  chores: INITIAL_CHORES,
  choreForm: { show: false, task: "", who: ROOMMATES[0].name, time: "18:00" },
  internalExpanded: null,

  newHouseholdForm: { name: "", address: "", area: "Bình Thạnh", rooms: "" },
  subscriptionTier: 0,
  personalInfoForm: personalInfoFormFor(initialUser, RESIDENTS),
  reviewForm: { stars: 0, hovered: 0, comment: "", photos: [], done: false },

  floatingAI: { open: false, teaser: false, pos: { x: 16, y: 560 }, dragging: false, messages: [{ role: "ai", text: FLOATING_AI_INTRO }], input: "", thinking: false },
  assistantAI: { open: false, messages: [], input: "", thinking: false },
};

/* ---------------------------------------------------------------------- *
 * ping() — toast helper, ported 1:1 (2800ms auto-clear)                   *
 * ---------------------------------------------------------------------- */
function ping(msg, type = "ok") {
  setState({ toast: { msg, type } });
  setTimeout(() => setState({ toast: { msg: "", type: "ok" } }), 2800);
}

/* ---------------------------------------------------------------------- *
 * Top-level render                                                        *
 * ---------------------------------------------------------------------- */
function app(state) {
  const household = state.households.find((h) => h.id === state.user.householdId);
  const view = { ...state, household };
  const isLandlord = state.user.role === "LANDLORD";

  return `
    <div class="min-h-screen w-full bg-slate-50 font-sans">
      <div class="relative w-full bg-slate-50 flex flex-col" style="min-width:320px;max-width:480px;margin:0 auto;min-height:100vh">
        <header class="relative bg-gradient-to-br from-teal-500 to-teal-700 px-5 pt-6 pb-7 rounded-b-3xl shadow-lg z-30">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <img src="${RH_LOGO}" alt="RoomieHub" class="object-contain drop-shadow-lg" style="height:68px;width:auto;max-width:240px" />
            </div>
            <div class="relative flex flex-col items-center">
              <button data-action="toggleProfile"
                      class="h-12 w-12 rounded-full transition-transform grid place-items-center ring-2 ring-white/50 shadow-md active:scale-95 hover:scale-105"
                      style="background:${isLandlord ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "#F9F6C4"}">
                ${isLandlord
                  ? icon("KeyRound", { className: "h-6 w-6 text-white", strokeWidth: 2.4 })
                  : icon("User", { className: "h-6 w-6 text-teal-900", strokeWidth: 2.4 })}
              </button>
              <span class="mt-1 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full"
                    style="background:${isLandlord ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)"};color:${isLandlord ? "#44ACFF" : "#ffffff"}">
                ${state.user.role}
              </span>
              ${state.showProfile ? profileDropdown(state.user) : ""}
            </div>
          </div>
        </header>

        <main class="flex-1 relative">
          ${state.view === "explore" ? explorePage(view) : dashboard(view)}
        </main>

        ${state.view === "explore" ? `
          <nav class="relative bg-teal-600 px-4 py-3 flex items-center justify-between z-20" style="min-height:96px">
            <button data-action="openAbout" class="flex flex-col items-center gap-1 w-20 group">
              <div class="h-9 w-9 rounded-full bg-white grid place-items-center shadow ring-1 ring-white/50 group-hover:scale-105 transition-transform">
                <img src="${UNIRE_LOGO}" alt="Unire" class="h-8 w-8 object-contain rounded-full" />
              </div>
              <span class="text-white text-[10px] font-bold leading-tight tracking-wide group-hover:text-amber-200 transition-colors">ABOUT US</span>
            </button>

            <button data-action="goToDashboard" class="h-20 w-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 grid place-items-center shadow-2xl ring-4 ring-white/50 hover:from-amber-200 hover:to-amber-300 transition-all active:scale-95 shrink-0">
              ${icon("Home", { className: "h-12 w-12 text-teal-900", strokeWidth: 2 })}
            </button>

            <div class="flex flex-col items-end gap-1.5 w-20">
              ${isLandlord ? `
                <button data-action="openNewHousehold" class="flex items-center gap-1 bg-white text-teal-800 text-xs font-bold px-2.5 py-1.5 rounded-full shadow hover:bg-amber-100 transition-colors active:scale-95">
                  ${icon("Plus", { className: "h-3.5 w-3.5", strokeWidth: 3 })} New
                </button>` : `
                <button data-action="openReview" class="flex items-center gap-1 bg-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow active:scale-95 transition-all" style="color:#FE9EC7">
                  ${icon("Star", { className: "h-3.5 w-3.5 fill-current", strokeWidth: 0 })} Đánh giá
                </button>`}
              <button data-action="contactSupport" class="text-white text-xs font-bold hover:text-amber-300 transition-colors">CONTACT</button>
            </div>
          </nav>` : ""}

        ${state.showAbout ? aboutUsPage() : ""}
        ${state.showSubscribe ? subscriptionModal(state) : ""}
        ${state.showPersonalInfo ? personalInfoModal(state) : ""}
        ${state.view === "explore" ? floatingUnireAI(state) : ""}

        ${state.selectedHouseholdId ? householdSummaryModal(state) : ""}
        ${state.showReviewModal ? reviewModal(view) : ""}
        ${state.showNewModal ? newHouseholdModal(state) : ""}

        ${toast(state.toast)}
      </div>
    </div>`;
}

let aiButtonPlaced = false;

function renderApp(state) {
  root.innerHTML = app(state);

  const floatingScroll = qs(root, '[data-scroll="floatingAI"]');
  if (floatingScroll) floatingScroll.scrollTop = floatingScroll.scrollHeight;
  const assistantScroll = qs(root, '[data-scroll="assistantAI"]');
  if (assistantScroll) assistantScroll.scrollTop = assistantScroll.scrollHeight;

  if (!aiButtonPlaced) {
    const btn = qs(root, "#floatingAIBtn");
    if (btn && btn.offsetParent) {
      aiButtonPlaced = true;
      const parent = btn.offsetParent;
      setState((s) => ({ floatingAI: { ...s.floatingAI, pos: { x: 16, y: Math.max(90, parent.clientHeight - 180) } } }));
    }
  }
}

/* ---------------------------------------------------------------------- *
 * AI send helpers — port of FloatingUnireAI.send / AIAssistant.send       *
 * (1400ms / 1300ms "thinking" delays, ported as-is)                       *
 * ---------------------------------------------------------------------- */
function sendFloatingAI(raw) {
  const s = getState();
  const ai = s.floatingAI;
  const text = (raw ?? ai.input).trim();
  if (!text || ai.thinking) return;
  setState((s2) => ({ floatingAI: { ...s2.floatingAI, messages: [...s2.floatingAI.messages, { role: "user", text }], input: "", thinking: true } }));
  setTimeout(() => {
    const cur = getState();
    setState((s2) => ({ floatingAI: { ...s2.floatingAI, messages: [...s2.floatingAI.messages, generateReply(text, cur.households)], thinking: false } }));
  }, 1400);
}

function sendAssistantAI(raw) {
  const s = getState();
  const ai = s.assistantAI;
  const text = (raw ?? ai.input).trim();
  if (!text || ai.thinking) return;
  setState((s2) => ({ assistantAI: { ...s2.assistantAI, messages: [...s2.assistantAI.messages, { role: "user", text }], input: "", thinking: true } }));
  setTimeout(() => {
    const cur = getState();
    setState((s2) => ({ assistantAI: { ...s2.assistantAI, messages: [...s2.assistantAI.messages, generateReply(text, cur.households)], thinking: false } }));
  }, 1300);
}

/* ---------------------------------------------------------------------- *
 * Action map — every data-action name referenced across the components.   *
 * Click handlers receive (target, event); field handlers receive the      *
 * input/select/textarea/file element as `target`.                         *
 * ---------------------------------------------------------------------- */
const actions = {
  /* ---- Header / profile / shell ---- */
  toggleProfile: () => setState((s) => ({ showProfile: !s.showProfile })),
  closeProfile: () => setState({ showProfile: false }),
  closeModal: () => {},
  openEditInfo: () => {
    const s = getState();
    setState({ showProfile: false, showPersonalInfo: true, personalInfoForm: personalInfoFormFor(s.user, s.residents) });
  },
  openSubscribe: () => setState({ showProfile: false, showSubscribe: true }),
  switchRole: () => {
    setState((s) => ({ showProfile: false, user: { ...s.user, role: s.user.role === "USER" ? "LANDLORD" : "USER" } }));
    ping("Đã chuyển vai trò");
  },
  logout: () => { setState({ showProfile: false }); ping("Đăng xuất (mô phỏng)"); },

  /* ---- Bottom nav / view routing ---- */
  openAbout: () => setState({ showAbout: true }),
  closeAbout: () => setState({ showAbout: false }),
  goToDashboard: () => setState({ view: "dashboard", dashboardTab: "repair" }),
  backToExplore: () => setState({ view: "explore" }),
  openNewHousehold: () => setState({ showNewModal: true }),
  closeNewHousehold: () => setState({ showNewModal: false }),
  openReview: () => setState({ showReviewModal: true, reviewForm: { stars: 0, hovered: 0, comment: "", photos: [], done: false } }),
  closeReview: () => setState({ showReviewModal: false }),
  contactSupport: () => ping("Liên hệ hỗ trợ: 1900 0000"),

  /* ---- Explore ---- */
  setQuery: (t) => setState({ query: t.value }),
  clearQuery: () => setState({ query: "" }),
  setQueryChip: (t) => {
    const c = t.dataset.chip;
    setState({ query: c.includes("Bình") || c.includes("District") ? c : "" });
  },
  openHousehold: (t) => {
    const id = Number(t.dataset.id);
    const h = getState().households.find((x) => x.id === id);
    setState({
      selectedHouseholdId: id,
      assistantAI: { open: false, messages: [{ role: "ai", text: aiIntroFor(h) }], input: "", thinking: false },
    });
  },
  closeHouseholdSummary: () => setState({ selectedHouseholdId: null }),
  newHouseholdField: (t) => setState((s) => ({ newHouseholdForm: { ...s.newHouseholdForm, [t.dataset.field]: t.value } })),
  createHousehold: () => {
    const s = getState();
    const f = s.newHouseholdForm;
    if (!(f.name.trim() && f.address.trim() && Number(f.rooms) > 0)) return;
    const h = {
      id: Date.now(), name: f.name.trim(), address: `${f.address.trim()}, ${f.area}`, area: f.area,
      landlord: s.user.name, phone: "Chưa cập nhật", totalRooms: Number(f.rooms), occupied: 0,
      rating: 0, reviews: 0, photo: null,
    };
    setState({ households: [h, ...s.households], showNewModal: false, newHouseholdForm: { name: "", address: "", area: "Bình Thạnh", rooms: "" } });
    ping("Đã tạo household mới");
  },

  /* ---- Repair (landlord + tenant) ---- */
  setRepairFilter: (t) => setState({ repairFilter: t.dataset.filter }),
  dispatchRepair: (t) => {
    const id = Number(t.dataset.id);
    const m = getState().maintenance.find((x) => x.id === id);
    if (!m) return;
    setState({
      thoVietBooking: {
        request: m, job: m.title || "", note: m.desc || "",
        name: "Chủ trọ Sunrise House", phone: "0901 234 567",
        addr: `Phòng ${m.room} · 12 Nguyễn Hữu Cảnh, Bình Thạnh`,
        sent: false, code: "",
      },
    });
  },
  completeRepair: (t) => {
    const id = Number(t.dataset.id);
    setState((s) => ({ maintenance: s.maintenance.map((m) => (m.id === id ? { ...m, status: "resolved" } : m)) }));
    ping("Đã đánh dấu hoàn thành");
  },
  repairFormText: (t) => setState((s) => ({ repairForm: { ...s.repairForm, text: t.value } })),
  repairFormClearPhoto: () => setState((s) => ({ repairForm: { ...s.repairForm, photo: null } })),
  repairFormPickPhoto: () => qs(root, "#repairFileInput")?.click(),
  repairFormPhoto: (t) => {
    const f = t.files?.[0];
    if (f) setState((s) => ({ repairForm: { ...s.repairForm, photo: URL.createObjectURL(f) } }));
  },
  repairFormSubmit: () => {
    const s = getState();
    const f = s.repairForm;
    if (!f.text.trim()) return;
    setState({
      maintenance: [{ id: Date.now(), title: f.text.trim(), desc: "", status: "pending", date: "Vừa xong", photo: f.photo }, ...s.maintenance],
      repairForm: { text: "", photo: null },
    });
    ping("Đã gửi yêu cầu sửa chữa");
  },

  /* ---- Thợ Việt booking modal ---- */
  thoVietClose: () => setState({ thoVietBooking: null }),
  thoVietField: (t) => setState((s) => ({ thoVietBooking: { ...s.thoVietBooking, [t.dataset.field]: t.value } })),
  thoVietSend: () => {
    const b = getState().thoVietBooking;
    if (!b || !b.job.trim()) return;
    const code = Date.now().toString().slice(-3);
    setState({ thoVietBooking: { ...b, sent: true, code } });
    setTimeout(() => {
      const cur = getState();
      const id = cur.thoVietBooking?.request.id;
      setState((s2) => ({
        maintenance: s2.maintenance.map((m) => (m.id === id ? { ...m, status: "in_progress" } : m)),
        thoVietBooking: null,
      }));
      ping("Đã duyệt — đang tiến hành sửa chữa");
      ping("Đã gửi yêu cầu tới Thợ Việt ✓");
    }, 2000);
  },
  thoVietHotline: () => ping("Hotline Thợ Việt: 1800 8122"),
  thoVietZalo: () => ping("Mở Zalo Thợ Việt..."),

  /* ---- Payments (landlord) ---- */
  confirmRoomPayment: (t) => {
    const room = t.dataset.room;
    setState((s) => ({ landlordRooms: s.landlordRooms.map((r) => (r.room === room ? { ...r, confirmed: true } : r)) }));
    ping(`Đã xác nhận thanh toán phòng ${room}`);
  },
  remindRoomPayment: (t) => {
    const { room, tenant } = t.dataset;
    setState((s) => ({ landlordReminded: [...s.landlordReminded, room] }));
    ping(`Đã gửi nhắc nhở đến ${tenant} (${room})`);
  },
  openLandlordSheet: () => setState({ showLandlordSheet: true }),
  closeLandlordSheet: () => setState({ showLandlordSheet: false }),
  copyLandlordSheet: () => copyLandlordCsv(getState().landlordRooms, ping),
  downloadLandlordSheet: () => exportLandlordXls(getState().landlordRooms, ping),

  /* ---- Payments (tenant) ---- */
  openSpreadsheet: () => setState({ showSpreadsheet: true }),
  closeSpreadsheet: () => setState({ showSpreadsheet: false }),
  payInvoice: (t) => {
    const id = t.dataset.id;
    setState((s) => ({ invoices: s.invoices.map((iv) => (iv.id === id ? { ...iv, status: "paid" } : iv)) }));
    ping("Đã ghi nhận thanh toán");
  },
  copySpreadsheet: () => copyInvoiceCsv(getState().invoices, ping),
  downloadSpreadsheet: () => {
    const s = getState();
    exportInvoiceXls(s.invoices, s.households.find((h) => h.id === s.user.householdId), ping);
  },

  /* ---- Chores (tenant) ---- */
  toggleChoreAdd: () => setState((s) => ({ choreForm: { ...s.choreForm, show: !s.choreForm.show } })),
  choreFormTask: (t) => setState((s) => ({ choreForm: { ...s.choreForm, task: t.value } })),
  choreFormWho: (t) => setState((s) => ({ choreForm: { ...s.choreForm, who: t.value } })),
  choreFormTime: (t) => setState((s) => ({ choreForm: { ...s.choreForm, time: t.value } })),
  cancelChoreAdd: () => setState((s) => ({ choreForm: { ...s.choreForm, show: false, task: "" } })),
  submitChoreAdd: () => {
    const s = getState();
    const f = s.choreForm;
    if (!f.task.trim()) return;
    setState({
      chores: [{ id: Date.now(), task: f.task.trim(), assignee: f.who, time: f.time, done: false, reminded: false }, ...s.chores],
      choreForm: { show: false, task: "", who: f.who, time: f.time },
    });
    ping("Đã thêm việc nhà mới");
  },
  toggleChore: (t) => {
    const id = Number(t.dataset.id);
    const ch = getState().chores.find((c) => c.id === id);
    setState((s) => ({ chores: s.chores.map((c) => (c.id === id ? { ...c, done: !c.done } : c)) }));
    ping(ch?.done ? "Đã bỏ đánh dấu" : "Đã hoàn thành ✓");
  },
  remindChore: (t) => {
    const id = Number(t.dataset.id);
    const ch = getState().chores.find((c) => c.id === id);
    setState((s) => ({ chores: s.chores.map((c) => (c.id === id ? { ...c, reminded: true } : c)) }));
    ping(`Đã gửi nhắc nhở đến ${ch?.assignee}`);
  },

  /* ---- Internal / residents (landlord) ---- */
  toggleResident: (t) => setState((s) => ({ internalExpanded: s.internalExpanded === t.dataset.room ? null : t.dataset.room })),
  contactResident: (t) => ping(`Đang gọi ${t.dataset.name}: ${t.dataset.phone}...`),

  /* ---- Dashboard ---- */
  setDashboardTab: (t) => setState({ dashboardTab: t.dataset.tab }),

  /* ---- Floating Unire AI (Explore) ---- */
  floatingAIOpen: () => {}, // opening on tap-without-drag is handled by the pointerup listener below
  floatingAIClose: () => setState((s) => ({ floatingAI: { ...s.floatingAI, open: false } })),
  floatingAITeaserClose: () => setState((s) => ({ floatingAI: { ...s.floatingAI, teaser: false } })),
  floatingAIInput: (t) => setState((s) => ({ floatingAI: { ...s.floatingAI, input: t.value } })),
  floatingAISend: () => sendFloatingAI(),
  floatingAISendChip: (t) => sendFloatingAI(t.dataset.chip),

  /* ---- AI Assistant (household summary) ---- */
  assistantAIOpen: () => setState((s) => ({ assistantAI: { ...s.assistantAI, open: true } })),
  assistantAIClose: () => setState((s) => ({ assistantAI: { ...s.assistantAI, open: false } })),
  assistantAIInput: (t) => setState((s) => ({ assistantAI: { ...s.assistantAI, input: t.value } })),
  assistantAISend: () => sendAssistantAI(),
  assistantAISendChip: (t) => sendAssistantAI(t.dataset.chip),

  /* ---- About / Subscription ---- */
  setSubscriptionTier: (t) => setState({ subscriptionTier: Number(t.dataset.tier) }),
  choosePlan: (t) => {
    const contactOnly = t.dataset.contact === "1";
    ping(contactOnly ? "Đội ngũ sẽ liên hệ tư vấn riêng" : `Đã chọn ${t.dataset.plan}`);
  },
  closeSubscribe: () => setState({ showSubscribe: false }),

  /* ---- Personal info (USER) ---- */
  closePersonalInfo: () => setState({ showPersonalInfo: false }),
  piField: (t) => setState((s) => ({ personalInfoForm: { ...s.personalInfoForm, [t.dataset.field]: t.value } })),
  pickCccdPhoto: () => qs(root, "#cccdFileInput")?.click(),
  cccdPhotoPicked: (t) => {
    const f = t.files?.[0];
    if (f) setState((s) => ({ personalInfoForm: { ...s.personalInfoForm, cccdPhoto: URL.createObjectURL(f) } }));
  },
  clearCccdPhoto: () => setState((s) => ({ personalInfoForm: { ...s.personalInfoForm, cccdPhoto: null } })),
  submitPersonalInfo: () => {
    const s = getState();
    const f = s.personalInfoForm;
    if (!(f.phone.trim() && f.cccd.trim())) return;
    setState({
      residents: s.residents.map((r) => (r.name === s.user.name ? {
        ...r, phone: f.phone, cccd: f.cccd, job: f.job,
        emergency: { name: f.emName, phone: f.emPhone, relation: f.emRel },
        residenceExpiry: f.expiry,
      } : r)),
      personalInfoForm: { ...f, done: true },
    });
    setTimeout(() => {
      setState({ showPersonalInfo: false });
      ping("Thông tin đã gửi tới chủ trọ ✓");
    }, 2200);
  },

  /* ---- Review (USER) ---- */
  setReviewStars: (t) => setState((s) => ({ reviewForm: { ...s.reviewForm, stars: Number(t.dataset.star) } })),
  removeReviewPhoto: (t) => {
    const idx = Number(t.dataset.idx);
    setState((s) => ({ reviewForm: { ...s.reviewForm, photos: s.reviewForm.photos.filter((_, i) => i !== idx) } }));
  },
  pickReviewPhotos: () => qs(root, "#reviewFileInput")?.click(),
  reviewPhotosPicked: (t) => {
    const s = getState();
    const room = 4 - s.reviewForm.photos.length;
    const added = Array.from(t.files || []).slice(0, room).map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    if (added.length) setState((s2) => ({ reviewForm: { ...s2.reviewForm, photos: [...s2.reviewForm.photos, ...added] } }));
  },
  reviewComment: (t) => setState((s) => ({ reviewForm: { ...s.reviewForm, comment: t.value } })),
  submitReview: () => {
    const f = getState().reviewForm;
    if (!f.stars || !f.comment.trim()) return;
    setState((s) => ({ reviewForm: { ...s.reviewForm, done: true } }));
    setTimeout(() => {
      setState({ showReviewModal: false });
      ping("Đánh giá đã được ghi nhận — cảm ơn bạn!");
    }, 2200);
  },
};

/* ---------------------------------------------------------------------- *
 * Wire up delegated listeners (bound once on #root — survive re-renders). *
 * ---------------------------------------------------------------------- */
function dispatch(target, e) {
  const handler = actions[target.dataset.action];
  if (handler) handler(target, e);
}

delegate(root, "click", "[data-action]", dispatch);
delegate(root, "change", "[data-action]", dispatch);
delegate(root, "input", "input[data-action], textarea[data-action], select[data-action]", dispatch);

delegate(root, "keydown", "[data-enter-action]", (target, e) => {
  if (e.key !== "Enter") return;
  const handler = actions[target.dataset.enterAction];
  if (handler) handler(target, e);
});

delegate(root, "mouseover", ".review-star", (target) => {
  setState((s) => ({ reviewForm: { ...s.reviewForm, hovered: Number(target.dataset.star) } }));
});
delegate(root, "mouseout", ".review-star", () => {
  setState((s) => ({ reviewForm: { ...s.reviewForm, hovered: 0 } }));
});

/* ---- Floating Unire AI button: drag-to-move + tap-to-open (pointer events) ---- */
const FAB_SIZE = 60;
const drag = { active: false, moved: false, dx: 0, dy: 0 };

delegate(root, "pointerdown", "#floatingAIBtn", (target, e) => {
  const r = target.getBoundingClientRect();
  drag.active = true;
  drag.moved = false;
  drag.dx = e.clientX - r.left;
  drag.dy = e.clientY - r.top;
  setState((s) => ({ floatingAI: { ...s.floatingAI, dragging: true } }));
  try { target.setPointerCapture(e.pointerId); } catch (_) {}
});

document.addEventListener("pointermove", (e) => {
  if (!drag.active) return;
  const btn = qs(root, "#floatingAIBtn");
  if (!btn || !btn.offsetParent) return;
  const parent = btn.offsetParent.getBoundingClientRect();
  let nx = e.clientX - parent.left - drag.dx;
  let ny = e.clientY - parent.top - drag.dy;
  nx = Math.max(8, Math.min(nx, parent.width - FAB_SIZE - 8));
  ny = Math.max(8, Math.min(ny, parent.height - FAB_SIZE - 8));
  drag.moved = true;
  setState((s) => ({ floatingAI: { ...s.floatingAI, pos: { x: nx, y: ny } } }));
});

document.addEventListener("pointerup", () => {
  if (!drag.active) return;
  const wasMove = drag.moved;
  drag.active = false;
  setState((s) => ({
    floatingAI: { ...s.floatingAI, dragging: false, ...(wasMove ? {} : { open: true, teaser: false }) },
  }));
});

/* teaser bubble pops up 2s after load, same as the original useEffect */
setTimeout(() => setState((s) => ({ floatingAI: { ...s.floatingAI, teaser: true } })), 2000);

initStore(initialState, renderApp);
renderApp(initialState);
