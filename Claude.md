I am not a developer, no CS knowledge
Keep question simple

# Project status — RoomieHub conversion (updated 2026-06-07)

**The task**: turn the big single-file React prototype `HouseManagementApp (9).jsx`
into a plain HTML/CSS/JS website (no React, no build step) that looks and works
exactly the same — folder is `app/`.

**Where things stand: the conversion is DONE.** All files exist and the page
loads without errors:

```
app/index.html              — loads Tailwind from CDN + app/js/app.js
app/css/styles.css          — custom animations/colors
app/js/store.js             — tiny state container (replaces React state)
app/js/util.js              — small helpers (escapeHtml, delegate, qs/qsa)
app/js/icons.js             — hand-drawn icon set (replaces lucide-react icons)
app/js/data.js              — all the seed data (households, residents, logos…)
app/js/components/*.js      — one file per screen/section (explore, dashboard,
                              repair, payments, chores, internal, ai, modals, shell)
app/js/app.js               — the file that wires everything together: starting
                              data, all the click/typing actions, and the toast
                              messages — this was the last missing piece and is
                              now written and syntax-checked
```

**How to view it**: open `app/index.html` with the VS Code "Live Server"
extension (right-click the file → "Open with Live Server"). Opening the file
directly by double-clicking will NOT work — browsers block module scripts
(`<script type="module">`) from `file://` paths, it must be served over
`http://localhost`.

**What to check when testing in the browser** (click through each, in Vietnamese
since that's the app's language):
- Explore page: search/filter chips, opening a household card, the floating
  "Unire AI" bubble (drag it around vs. tap it to open chat)
- Switch role (USER ↔ LANDLORD) from the profile menu — the dashboard tabs
  change meaning depending on role
- Dashboard tabs: Sửa chữa (repairs incl. "Thợ Việt" booking flow), Thanh toán
  (payments incl. Excel/CSV export), Nội bộ / Việc nhà (residents or chores)
- Modals: About Us, gói nâng cấp (subscription), thông tin cá nhân (personal
  info incl. photo upload), đánh giá (star rating review with photo upload)
- Toast pop-ups (small message banner) should appear after most actions and
  disappear after ~3 seconds

**If something looks broken**: open the browser's DevTools console (F12) and
read the red error text — it will usually name the exact file and line.

# Paused — do NOT bring up unless the user does
GitHub push is on hold: git needs a name/email configured first
(`git config user.name` / `user.email`) before any commit can be made in
`d:\roomie_dev`. The user previously asked me to STOP and wait — do not
re-prompt about this.