// Inline SVG icon set replacing the `lucide-react` icon components used by the
// original React prototype. Each entry is the *inner* markup of a 24x24,
// stroke-based "currentColor" icon (matches the lucide visual language).
const PATHS = {
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "sliders-horizontal": '<line x1="4" x2="14" y1="6" y2="6"/><line x1="20" x2="16" y1="6" y2="6"/><line x1="4" x2="8" y1="18" y2="18"/><line x1="14" x2="20" y1="18" y2="18"/><line x1="10" x2="20" y1="12" y2="12"/><line x1="4" x2="6" y1="12" y2="12"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="18" r="2"/><circle cx="12" cy="12" r="2"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  "alert-triangle": '<path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
  "credit-card": '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/>',
  "check-circle-2": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  loader: '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
  "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  "refresh-cw": '<path d="M21 12a9 9 0 0 0-15-6.7L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15 6.7L21 16"/><path d="M16 16h5v5"/>',
  phone: '<path d="M13.8 19.5a2 2 0 0 1-2.16.45 16 16 0 0 1-6.59-4.99 16 16 0 0 1-5-6.59A2 2 0 0 1 .5 6.2L3.1 4.6a1.5 1.5 0 0 1 2.1.45l1.7 2.66a1.5 1.5 0 0 1-.18 1.86l-.93.93a12 12 0 0 0 4.85 4.85l.93-.93a1.5 1.5 0 0 1 1.86-.18l2.66 1.7a1.5 1.5 0 0 1 .45 2.1Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  zap: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>',
  droplet: '<path d="M12 2.7s5.5 6.4 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 9.1 12 2.7 12 2.7Z"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/>',
  star: '<path d="m12 2 3.1 6.6 7.1.9-5.2 5 1.3 7.1L12 18l-6.3 3.6 1.3-7.1-5.2-5 7.1-.9L12 2Z"/>',
  "door-open": '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.6v15.74a1 1 0 0 1-1.243.97L5 19.5V5.81a2 2 0 0 1 1.519-1.94l4-1A2 2 0 0 1 13 4.6Z"/>',
  "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  bike: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17 9 7h4l3 5"/><path d="M9 7H7"/><path d="m13 12 3 5"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  sparkles: '<path d="m12 3 1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9l4.4-1.7L12 3Z"/><path d="M5 18.5 5.8 20l1.5.8-1.5.7L5 23l-.8-1.5-1.5-.7 1.5-.8.8-1.5Z"/><path d="M19 14.5 19.8 16l1.5.8-1.5.7-.8 1.5-.8-1.5-1.5-.7 1.5-.8.8-1.5Z"/>',
  "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  "list-checks": '<path d="m3 7 1.5 1.5L7.5 5.5"/><path d="m3 17 1.5 1.5L7.5 15.5"/><path d="M11 6h10"/><path d="M11 12h10"/><path d="M11 18h10"/>',
  "user-cog": '<circle cx="9" cy="8" r="4"/><path d="M3.5 21a6.5 6.5 0 0 1 11-4.7"/><circle cx="18" cy="18" r="3"/><path d="M18 14.6v.9"/><path d="M18 20.5v.9"/><path d="m20.6 16.5-.8.45"/><path d="m16.2 19.05-.8.45"/><path d="m20.6 19.5-.8-.45"/><path d="m16.2 16.95-.8-.45"/>',
  "key-round": '<path d="M2.6 21.4a2 2 0 0 0 2.83 0L9 17.85l1 1a2 2 0 0 0 2.83-2.83l-1-1 .85-.85 1 1a2 2 0 0 0 2.83-2.83l-1-1 1.32-1.32a5 5 0 1 0-3-3L2.6 18.57a2 2 0 0 0 0 2.83Z"/><circle cx="17.5" cy="6.5" r="1.5"/>',
  crown: '<path d="m2 18 2-12 5 5 3-7 3 7 5-5 2 12Z"/><path d="M2 18h20v3H2Z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>',
};

const ALIASES = {
  User: "user", Search: "search", SlidersHorizontal: "sliders-horizontal", Home: "home",
  Plus: "plus", AlertTriangle: "alert-triangle", Wrench: "wrench", CreditCard: "credit-card",
  Lock: "lock", ChevronLeft: "chevron-left", X: "x", MapPin: "map-pin", Camera: "camera",
  CheckCircle2: "check-circle-2", Clock: "clock", Loader2: "loader", LogOut: "log-out",
  RefreshCw: "refresh-cw", Phone: "phone", Users: "users", Zap: "zap", Droplet: "droplet",
  Send: "send", Star: "star", DoorOpen: "door-open", ShieldCheck: "shield-check", Bike: "bike",
  Download: "download", Bell: "bell", Sparkles: "sparkles", MessageCircle: "message-circle",
  ListChecks: "list-checks", UserCog: "user-cog", KeyRound: "key-round", Crown: "crown",
  Award: "award", Gem: "gem",
  // lowercase aliases used internally (e.g. STATUS_CFG)
  "check-circle": "check-circle-2",
};

/**
 * Render an icon as an inline <svg> markup string.
 * @param {string} name  PascalCase (lucide-react) or kebab-case icon name
 * @param {{className?: string, size?: number, strokeWidth?: number, style?: string}} [opts]
 */
export function icon(name, opts = {}) {
  const key = ALIASES[name] || name;
  const inner = PATHS[key];
  if (!inner) return "";
  const size = opts.size ?? 24;
  const strokeWidth = opts.strokeWidth ?? 2;
  const cls = opts.className ? ` class="${opts.className}"` : "";
  const style = opts.style ? ` style="${opts.style}"` : "";
  return `<svg${cls}${style} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
