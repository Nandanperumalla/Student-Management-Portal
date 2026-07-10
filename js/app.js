// ============================================================
// ERP — application shell: boot, routing, themes, command
// palette (with natural-language search), notifications, toasts.
// ============================================================
import { buildDatabase, fmt, DEPARTMENTS } from "./data.js";
import { icon, icons } from "./icons.js";
import { Dashboard, Students, Faculty, Fees, Placements, Attendance, ModulePage, openStudentDrawer } from "./pages.js";

const db = buildDatabase();

// ---- Route table ----
const ROUTES = {
  dashboard: { title: "Dashboard", icon: "dashboard", page: Dashboard, section: "Overview" },
  students:  { title: "Students",  icon: "students",  page: Students,  section: "Academics", badge: fmt.num(db.students.length) },
  faculty:   { title: "Faculty",   icon: "faculty",   page: Faculty,   section: "Academics" },
  attendance:{ title: "Attendance",icon: "attendance",page: Attendance,section: "Academics" },
  exams:     { title: "Examination", icon: "exam", section: "Academics", page: ModulePage({ eyebrow: "Assessment", title: "Examination", emoji: "📝", sub: "Internal, semester, practical & project assessment with grades, SGPA/CGPA, rank and transcripts.", body: "Marks entry, grade computation, rank lists, result PDFs and transcripts are driven by the same 700-student dataset. Deep exam analytics arrive in the next build phase.", chips: ["Internal & Semester", "SGPA / CGPA", "Rank Lists", "Transcripts", "Result PDFs"], stats: [
    { icon: "exam", label: "Exams Scheduled", value: "48", raw: 48, delta: 3 },
    { icon: "award", label: "Avg CGPA", value: String(db.stats.avgCgpa), raw: db.stats.avgCgpa, delta: 0.9 },
    { icon: "reports", label: "Results Published", value: "42", raw: 42, delta: 5 },
    { icon: "shield", label: "Backlogs", value: fmt.num(db.students.reduce((s, x) => s + x.backlogs, 0)), raw: db.students.reduce((s, x) => s + x.backlogs, 0), delta: -4 },
  ] }) },
  fees:      { title: "Fees",      icon: "fees",      page: Fees,      section: "Operations" },
  placements:{ title: "Placements",icon: "placement", page: Placements,section: "Operations" },
  library:   { title: "Library",   icon: "library",   section: "Operations", page: ModulePage({ eyebrow: "Resources", title: "Library", emoji: "📚", sub: "5,000-title catalogue with issue/return, reservations, fines and AI recommendations.", body: "Circulation, reservations, fine tracking and reading analytics for the digital + physical catalogue. Full catalogue browser lands next phase.", chips: ["5,000 Titles", "Issue / Return", "Reservations", "Fines", "AI Recommendations"], stats: [
    { icon: "library", label: "Total Books", value: "5,000", raw: 5000, delta: 4 },
    { icon: "bookOpen", label: "Issued", value: "3,120", raw: 3120, delta: 6 },
    { icon: "clock", label: "Overdue", value: "84", raw: 84, delta: -2 },
    { icon: "sparkles", label: "Reservations", value: "212", raw: 212, delta: 9 },
  ] }) },
  hostel:    { title: "Hostel",    icon: "hostel",    section: "Operations", page: ModulePage({ eyebrow: "Residence", title: "Hostel", emoji: "🏨", sub: "Room allocation, mess, visitor logs, complaints and hostel fees.", body: "Occupancy, mess management, visitor logs and complaint resolution across all blocks. Room-map view arrives next phase.", chips: ["Room Allocation", "Mess", "Visitors", "Complaints", "Hostel Fees"], stats: [
    { icon: "hostel", label: "Residents", value: fmt.num(db.stats.hostel), raw: db.stats.hostel, delta: 2 },
    { icon: "dashboard", label: "Occupancy", value: "88%", raw: 88, suffix: "%", delta: 3 },
    { icon: "bell", label: "Complaints", value: "17", raw: 17, delta: -5 },
    { icon: "shield", label: "Blocks", value: "4", raw: 4, delta: 0 },
  ] }) },
  transport: { title: "Transport", icon: "transport", section: "Operations", page: ModulePage({ eyebrow: "Logistics", title: "Transport", emoji: "🚌", sub: "Bus routes, drivers, GPS tracking and transport fees.", body: "18 routes covering the metro region with driver management and fee tracking. Live GPS map view lands next phase.", chips: ["18 Routes", "GPS Tracking", "Drivers", "Bus Fees"], stats: [
    { icon: "transport", label: "Commuters", value: fmt.num(db.stats.transport), raw: db.stats.transport, delta: 1 },
    { icon: "dashboard", label: "Routes", value: "18", raw: 18, delta: 0 },
    { icon: "faculty", label: "Drivers", value: "22", raw: 22, delta: 2 },
    { icon: "fees", label: "Fees Collected", value: "₹41 L", raw: 4100000, delta: 5 },
  ] }) },
  reports:   { title: "Reports",   icon: "reports",   section: "System", page: ModulePage({ eyebrow: "Insights", title: "Reports", emoji: "📊", sub: "Generate PDF, Excel & CSV reports across every module.", body: "Student, faculty, attendance, fee, placement and department reports — the Students module already exports live CSV. One-click PDF/Excel generation expands next phase.", chips: ["PDF", "Excel", "CSV", "Scheduled", "Custom Builder"], stats: [
    { icon: "reports", label: "Templates", value: "24", raw: 24, delta: 3 },
    { icon: "download", label: "Generated (mo)", value: "318", raw: 318, delta: 12 },
    { icon: "clock", label: "Scheduled", value: "9", raw: 9, delta: 1 },
    { icon: "shield", label: "Data Sources", value: "13", raw: 13, delta: 0 },
  ] }) },
  ai:        { title: "AI Assistant", icon: "ai",     section: "System", page: ModulePage({ eyebrow: "Intelligence", title: "AI Assistant", emoji: "🤖", sub: "Natural-language search, predictions and academic insights.", body: "Try the command palette (⌘K) and type a natural query like “CSE students with CGPA above 9” — the AI parser is live. Risk prediction and defaulter detection already power the dashboards.", chips: ["Natural Language Search", "Performance Prediction", "Risk Detection", "Report Generator", "Recommendations"], stats: [
    { icon: "ai", label: "Predictions Run", value: "700", raw: 700, delta: 8 },
    { icon: "shield", label: "At-Risk Flagged", value: fmt.num(db.stats.highRisk), raw: db.stats.highRisk, delta: -3 },
    { icon: "sparkles", label: "Insights", value: "1,240", raw: 1240, delta: 15 },
    { icon: "trend", label: "Accuracy", value: "94%", raw: 94, suffix: "%", delta: 2 },
  ] }) },
};

const ctx = {
  db,
  go: navigate,
  toast,
  openDrawer, closeDrawer,
  refresh: () => render(current),
};

let current = "dashboard";

// ============================================================
// Boot
// ============================================================
window.addEventListener("DOMContentLoaded", () => {
  buildNav();
  restoreTheme();
  wireShell();
  wirePalette();
  const initial = location.hash.replace("#/", "") || "dashboard";
  render(ROUTES[initial] ? initial : "dashboard");

  setTimeout(() => {
    document.getElementById("boot").classList.add("is-done");
    document.getElementById("app").hidden = false;
    setTimeout(() => (document.getElementById("boot").hidden = true), 500);
  }, 1350);
});

// ============================================================
// Navigation / routing
// ============================================================
function buildNav() {
  const nav = document.getElementById("nav");
  let html = "", lastSection = "";
  for (const [key, r] of Object.entries(ROUTES)) {
    if (r.section !== lastSection) { html += `<div class="nav__section">${r.section}</div>`; lastSection = r.section; }
    html += `<a class="nav__item" href="#/${key}" data-route="${key}">
      <span class="ic">${icon(r.icon)}</span><span class="lbl">${r.title}</span>
      ${r.badge ? `<span class="badge-mini">${r.badge}</span>` : ""}</a>`;
  }
  html += `<div class="nav__section">Preferences</div>
    <a class="nav__item" href="#/settings" data-route="settings"><span class="ic">${icon("settings")}</span><span class="lbl">Settings</span></a>`;
  nav.innerHTML = html;
  nav.querySelectorAll("[data-route]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault(); navigate(el.dataset.route);
  }));

  document.getElementById("miniProfile").innerHTML = `
    <div class="avatar avatar--sm" style="background:linear-gradient(135deg,var(--accent),var(--accent-2))">NP</div>
    <div class="mini-profile__meta"><div class="mini-profile__name">Nandan P.</div><div class="mini-profile__role">Super Admin</div></div>`;
  document.getElementById("profileBtn").textContent = "NP";
}

function navigate(key) {
  if (key === "settings") { renderSettings(); setActive(key); return; }
  if (!ROUTES[key]) return;
  render(key);
  closeDrawer();
  document.getElementById("app").classList.remove("nav-open");
}

function render(key) {
  current = key;
  const r = ROUTES[key];
  const view = document.getElementById("view");
  location.hash = "#/" + key;
  setActive(key);
  // skeleton flash for perceived performance
  view.innerHTML = skeleton();
  requestAnimationFrame(() => {
    view.innerHTML = r.page.render(ctx);
    r.page.mounted?.(view, ctx);
    wireDelegates(view);
    view.scrollTo?.(0, 0);
    window.scrollTo(0, 0);
  });
}

function setActive(key) {
  document.querySelectorAll(".nav__item").forEach((el) => el.classList.toggle("is-active", el.dataset.route === key));
}

function skeleton() {
  return `<div style="padding-top:20px"><div class="skel" style="height:34px;width:220px;margin-bottom:24px"></div>
    <div class="stat-grid" style="margin-bottom:22px">${Array.from({ length: 4 }, () => '<div class="skel" style="height:150px;border-radius:22px"></div>').join("")}</div>
    <div class="grid grid-3"><div class="skel col-span-2" style="height:280px;border-radius:22px"></div><div class="skel" style="height:280px;border-radius:22px"></div></div></div>`;
}

// Delegated handlers for data-nav / data-toast / data-student inside any view
function wireDelegates(root) {
  root.querySelectorAll("[data-nav]").forEach((el) => el.addEventListener("click", () => navigate(el.dataset.nav)));
  root.querySelectorAll("[data-toast]").forEach((el) => el.addEventListener("click", () => toast(el.dataset.toast, "success")));
  root.querySelectorAll("[data-student]").forEach((el) => el.addEventListener("click", (e) => {
    if (el.closest("table")) return; // tables wire their own richer handler
    openStudentDrawer(db.students.find((s) => s.id === +el.dataset.student), ctx);
  }));
  // ripple on buttons
  root.querySelectorAll(".btn").forEach(addRipple);
}

function addRipple(btn) {
  btn.addEventListener("click", (e) => {
    const r = document.createElement("span");
    r.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + "px";
    r.style.left = e.clientX - rect.left - size / 2 + "px";
    r.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
}

// ============================================================
// Shell wiring
// ============================================================
function wireShell() {
  document.getElementById("sidebarToggle").addEventListener("click", () =>
    document.getElementById("app").classList.toggle("is-collapsed"));
  document.getElementById("mobileMenu").addEventListener("click", () =>
    document.getElementById("app").classList.toggle("nav-open"));

  document.getElementById("searchTrigger").addEventListener("click", openPalette);

  // Icon buttons content
  document.getElementById("themeMenuBtn").innerHTML = icons.palette;
  document.getElementById("modeToggle").innerHTML = icons.moon;
  document.getElementById("notifBtn").innerHTML = icons.bell;
  document.getElementById("mobileMenu").innerHTML = icons.menu;

  document.getElementById("themeMenuBtn").addEventListener("click", (e) => toggleThemeMenu(e));
  document.getElementById("modeToggle").addEventListener("click", toggleMode);
  document.getElementById("notifBtn").addEventListener("click", (e) => toggleNotif(e));
  document.getElementById("profileBtn").addEventListener("click", (e) => toggleProfile(e));
  document.getElementById("miniProfile").addEventListener("click", () => navigate("settings"));

  // Global keyboard
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
    if (e.key === "Escape") { closeAllPopovers(); closePalette(); closeDrawer(); }
  });

  // Close popovers on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".popover") && !e.target.closest("#themeMenuBtn") && !e.target.closest("#notifBtn") && !e.target.closest("#profileBtn"))
      closeAllPopovers();
  });

  // Backdrops
  document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", () => { closePalette(); closeDrawer(); }));
}

// ============================================================
// Themes
// ============================================================
const THEMES = [
  { id: "midnight", name: "Midnight Cyber", c: ["#5b8cff", "#8b5cff"], dark: true },
  { id: "aurora", name: "Aurora Blue", c: ["#22a7ff", "#22e0d6"], dark: true },
  { id: "royal", name: "Royal Purple", c: ["#a86bff", "#ff6bd6"], dark: true },
  { id: "emerald", name: "Emerald Neon", c: ["#1fe08a", "#7cff5c"], dark: true },
  { id: "ocean", name: "Ocean Glass", c: ["#1fd6d0", "#3aa8ff"], dark: true },
  { id: "crimson", name: "Crimson Tech", c: ["#ff4d6d", "#ff9d4d"], dark: true },
  { id: "cyber", name: "Cyber Black", c: ["#d4ff3a", "#00e0ff"], dark: true },
  { id: "arctic", name: "Arctic White", c: ["#4667ff", "#8b5cff"], dark: false },
];
let lastDarkTheme = "midnight";

function applyTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
  const t = THEMES.find((x) => x.id === id);
  document.documentElement.setAttribute("data-mode", t.dark ? "dark" : "light");
  document.getElementById("modeToggle").innerHTML = t.dark ? icons.moon : icons.sun;
  if (t.dark) lastDarkTheme = id;
  try { localStorage.setItem("erp-theme", id); } catch {}
}
function restoreTheme() {
  let saved;
  try { saved = localStorage.getItem("erp-theme"); } catch {}
  applyTheme(saved && THEMES.some((t) => t.id === saved) ? saved : "midnight");
}
function toggleMode() {
  const cur = document.documentElement.getAttribute("data-theme");
  applyTheme(cur === "arctic" ? lastDarkTheme : "arctic");
  toast(document.documentElement.getAttribute("data-mode") === "dark" ? "Dark mode" : "Light mode");
}
function toggleThemeMenu(e) {
  const m = document.getElementById("themeMenu");
  if (!m.hidden) { m.hidden = true; return; }
  closeAllPopovers();
  const cur = document.documentElement.getAttribute("data-theme");
  m.innerHTML = `<div class="popover__title">Choose theme</div>` + THEMES.map((t) => `
    <div class="theme-opt ${t.id === cur ? "is-active" : ""}" data-theme-id="${t.id}">
      <span class="theme-opt__sw" style="background:linear-gradient(135deg,${t.c[0]},${t.c[1]})"></span>
      <span class="theme-opt__name">${t.name}</span>
      <span class="check">${icon("check")}</span>
    </div>`).join("");
  positionPopover(m, e.currentTarget);
  m.hidden = false;
  m.querySelectorAll("[data-theme-id]").forEach((el) => el.addEventListener("click", () => {
    applyTheme(el.dataset.themeId); toggleThemeMenu({ currentTarget: e.currentTarget }); toast(el.querySelector(".theme-opt__name").textContent);
  }));
}
function toggleNotif(e) {
  const m = document.getElementById("notifPanel");
  if (!m.hidden) { m.hidden = true; return; }
  closeAllPopovers();
  const dot = { info: "var(--info)", success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" };
  m.innerHTML = `<div class="popover__title" style="display:flex;justify-content:space-between"><span>Notifications</span><span class="badge badge--danger">${db.notifications.length} new</span></div>` +
    db.notifications.map((n) => `<div class="notif"><span class="notif__dot" style="background:${dot[n.type]}"></span><div><div class="notif__t">${n.title}</div><div class="notif__d">${n.desc}</div><div class="notif__time">${n.time} ago</div></div></div>`).join("") +
    `<div class="menu-sep"></div><div class="menu-item" style="justify-content:center;color:var(--accent)" data-clear>Mark all as read</div>`;
  positionPopover(m, e.currentTarget);
  m.hidden = false;
  m.querySelector("[data-clear]").addEventListener("click", () => { m.hidden = true; document.getElementById("notifBtn").classList.remove("has-dot"); toast("All notifications marked read", "success"); });
}
function toggleProfile(e) {
  const m = document.getElementById("notifPanel");
  if (!m.hidden) { m.hidden = true; return; }
  closeAllPopovers();
  m.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;padding:10px 10px 12px">
      <div class="avatar avatar--md" style="background:linear-gradient(135deg,var(--accent),var(--accent-2))">NP</div>
      <div><div style="font-weight:700">Nandan Perumalla</div><div class="muted" style="font-size:12px">nandanperumalla15@gmail.com</div><span class="badge badge--info" style="margin-top:4px">Super Admin</span></div>
    </div><div class="menu-sep"></div>
    <div class="menu-item" data-p="profile">${icons.user} My Profile</div>
    <div class="menu-item" data-p="settings">${icons.settings} Settings</div>
    <div class="menu-item" data-p="activity">${icons.clock} Activity Logs</div>
    <div class="menu-sep"></div>
    <div class="menu-item" data-p="logout" style="color:var(--danger)">${icons.logout} Sign out</div>`;
  positionPopover(m, e.currentTarget);
  m.hidden = false;
  m.querySelectorAll("[data-p]").forEach((el) => el.addEventListener("click", () => {
    m.hidden = true;
    if (el.dataset.p === "settings") navigate("settings");
    else if (el.dataset.p === "logout") toast("Signed out (demo)", "success");
    else toast(el.textContent.trim() + " — coming soon");
  }));
}
function positionPopover(m, anchor) {
  const r = anchor.getBoundingClientRect();
  m.style.visibility = "hidden"; m.hidden = false;
  const w = m.offsetWidth;
  m.hidden = true; m.style.visibility = "";
  m.style.top = r.bottom + 10 + "px";
  m.style.left = Math.max(12, r.right - w) + "px";
}
function closeAllPopovers() {
  document.getElementById("themeMenu").hidden = true;
  document.getElementById("notifPanel").hidden = true;
}

// ============================================================
// Command palette + natural language search
// ============================================================
let paletteItems = [], paletteIndex = 0;
function wirePalette() {
  const input = document.getElementById("paletteInput");
  input.addEventListener("input", () => renderPalette(input.value));
  document.querySelectorAll("#palette [data-close]").forEach((el) => el.addEventListener("click", closePalette));
  document.addEventListener("keydown", (e) => {
    if (document.getElementById("palette").hidden) return;
    if (e.key === "ArrowDown") { e.preventDefault(); paletteIndex = Math.min(paletteItems.length - 1, paletteIndex + 1); highlightPalette(); }
    if (e.key === "ArrowUp") { e.preventDefault(); paletteIndex = Math.max(0, paletteIndex - 1); highlightPalette(); }
    if (e.key === "Enter") { e.preventDefault(); paletteItems[paletteIndex]?.run(); }
  });
}
function openPalette() {
  const p = document.getElementById("palette");
  p.hidden = false;
  const input = document.getElementById("paletteInput");
  input.value = ""; input.focus();
  renderPalette("");
}
function closePalette() { document.getElementById("palette").hidden = true; }

// Natural language parser: e.g. "CSE students with CGPA above 9", "high risk ECE", "fee overdue"
function nlSearch(q) {
  const t = q.toLowerCase();
  let list = db.students, applied = [];
  const dept = DEPARTMENTS.find((d) => t.includes(d.code.toLowerCase()) || t.includes(d.name.toLowerCase().split(" ")[0]));
  if (dept) { list = list.filter((s) => s.deptCode === dept.code); applied.push(dept.code); }
  let m = t.match(/cgpa\s*(above|over|greater than|>|below|under|less than|<)?\s*([0-9.]+)/);
  if (m) { const op = m[1] || "above", v = +m[2]; const below = /below|under|less|</.test(op); list = list.filter((s) => below ? s.cgpa < v : s.cgpa > v); applied.push(`CGPA ${below ? "<" : ">"} ${v}`); }
  m = t.match(/attendance\s*(above|over|below|under|>|<)?\s*([0-9]+)/);
  if (m) { const below = /below|under|</.test(m[1] || ""); const v = +m[2]; list = list.filter((s) => below ? s.attendance < v : s.attendance > v); applied.push(`Attendance ${below ? "<" : ">"} ${v}%`); }
  if (/high[- ]?risk|at.?risk/.test(t)) { list = list.filter((s) => s.riskBand === "High"); applied.push("High risk"); }
  if (/overdue|defaulter|pending fee/.test(t)) { list = list.filter((s) => s.feeStatus === "Overdue"); applied.push("Fee overdue"); }
  if (/placed/.test(t)) { list = list.filter((s) => s.placement.status === "Placed"); applied.push("Placed"); }
  if (/scholarship/.test(t)) { list = list.filter((s) => s.scholarship); applied.push("Scholarship"); }
  if (/topper|top performer|rank/.test(t)) { list = list.slice().sort((a, b) => a.rank - b.rank); applied.push("By rank"); }
  return { list, applied };
}

function renderPalette(q) {
  const box = document.getElementById("paletteResults");
  paletteItems = []; paletteIndex = 0;
  const query = q.trim();
  let html = "";

  // Natural language answer
  const looksNL = /cgpa|attendance|risk|overdue|placed|scholarship|topper|students|above|below/.test(query.toLowerCase()) && query.length > 3;
  if (looksNL) {
    const { list, applied } = nlSearch(query);
    if (applied.length) {
      html += `<div class="ai-answer"><div class="ai-answer__head">${icon("sparkles")} AI understood your query</div>
        <div style="font-size:13px">Filters: ${applied.map((a) => `<span class="chip" style="margin:2px">${a}</span>`).join("")}</div>
        <div style="margin-top:8px;font-weight:700;font-family:var(--font-mono)">${list.length} students matched</div></div>`;
      list.slice(0, 6).forEach((s) => paletteItems.push({
        label: s.name, sub: `${s.rollNo} · ${s.deptCode} · CGPA ${s.cgpa}`, ic: "students",
        run: () => { closePalette(); openStudentDrawer(s, ctx); },
      }));
    }
  }

  // Pages
  const pageMatches = Object.entries(ROUTES).filter(([k, r]) => !query || r.title.toLowerCase().includes(query.toLowerCase()));
  pageMatches.slice(0, 6).forEach(([k, r]) => paletteItems.push({ label: r.title, sub: `${r.section} · Page`, ic: r.icon, run: () => { closePalette(); navigate(k); } }));

  // Direct student lookup by name/roll
  if (query.length > 1) {
    db.students.filter((s) => `${s.name} ${s.rollNo}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
      .forEach((s) => { if (!paletteItems.find((i) => i.label === s.name && i.sub?.includes(s.rollNo))) paletteItems.push({ label: s.name, sub: `${s.rollNo} · ${s.deptCode}`, ic: "students", run: () => { closePalette(); openStudentDrawer(s, ctx); } }); });
  }

  // Quick actions
  if (!query) {
    [["Toggle theme", "palette", () => document.getElementById("themeMenuBtn").click()],
     ["Toggle dark / light", "moon", toggleMode],
     ["Export students CSV", "download", () => { navigate("students"); setTimeout(() => document.getElementById("stuExport")?.click(), 400); }]]
      .forEach(([label, ic, run]) => paletteItems.push({ label, sub: "Action", ic, run: () => { closePalette(); run(); } }));
  }

  if (!paletteItems.length && !html) { box.innerHTML = `<div class="palette__empty">No results for “${query}”.<br><span class="muted" style="font-size:12px">Try “CSE CGPA above 9” or a student name.</span></div>`; return; }

  const groups = {};
  paletteItems.forEach((it, i) => { const g = it.sub?.includes("Page") ? "Pages" : it.sub === "Action" ? "Actions" : "Students"; (groups[g] ||= []).push([it, i]); });
  for (const [g, arr] of Object.entries(groups)) {
    html += `<div class="palette__group">${g}</div>`;
    arr.forEach(([it, i]) => { html += `<div class="palette__item" data-i="${i}"><div class="ic">${icon(it.ic)}</div><div class="t"><b>${it.label}</b><small>${it.sub}</small></div><span class="go">${icon("chevronRight")}</span></div>`; });
  }
  box.innerHTML = html;
  box.querySelectorAll("[data-i]").forEach((el) => { el.addEventListener("click", () => paletteItems[+el.dataset.i].run()); el.addEventListener("mouseenter", () => { paletteIndex = +el.dataset.i; highlightPalette(); }); });
  highlightPalette();
}
function highlightPalette() {
  const items = document.querySelectorAll("#paletteResults .palette__item");
  items.forEach((el) => el.classList.toggle("is-active", +el.dataset.i === paletteIndex));
  items[paletteIndex]?.scrollIntoView({ block: "nearest" });
}

// ============================================================
// Drawer + toasts
// ============================================================
function openDrawer(html) {
  const d = document.getElementById("drawer");
  document.getElementById("drawerPanel").innerHTML = html;
  d.hidden = false;
  d.querySelector(".drawer__backdrop").onclick = closeDrawer;
}
function closeDrawer() { document.getElementById("drawer").hidden = true; }

let toastN = 0;
function toast(msg, type = "info") {
  const wrap = document.getElementById("toasts");
  const t = document.createElement("div");
  const col = { info: "var(--info)", success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)" }[type];
  const ic = { success: "check", danger: "close", warning: "bell", info: "sparkles" }[type];
  t.className = "toast";
  t.innerHTML = `<span class="toast__ic" style="background:color-mix(in srgb,${col} 18%,transparent);color:${col}">${icon(ic)}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  const id = ++toastN;
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2600);
}

// ============================================================
// Settings page (theme + preferences, all functional)
// ============================================================
function renderSettings() {
  current = "settings";
  location.hash = "#/settings";
  const view = document.getElementById("view");
  const cur = document.documentElement.getAttribute("data-theme");
  view.innerHTML = `<div class="page-enter">
    <div class="page-head"><div><div class="page-head__eyebrow">Preferences</div><div class="page-head__title"><h1>Settings</h1></div><div class="page-head__sub">Personalize your ERP workspace. Changes apply instantly.</div></div></div>
    <div class="grid grid-2">
      <div class="card"><div class="card__head"><div class="card__title">${icon("palette")} Appearance</div></div>
        <div class="muted" style="font-size:13px;margin-bottom:14px">Choose from 8 curated themes.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
          ${THEMES.map((t) => `<button class="theme-opt ${t.id === cur ? "is-active" : ""}" data-theme-id="${t.id}" style="border:1px solid var(--border-1)">
            <span class="theme-opt__sw" style="background:linear-gradient(135deg,${t.c[0]},${t.c[1]})"></span>
            <span class="theme-opt__name">${t.name}</span><span class="check">${icon("check")}</span></button>`).join("")}
        </div>
      </div>
      <div class="card"><div class="card__head"><div class="card__title">${icon("user")} Profile</div></div>
        <dl class="kv"><dt>Name</dt><dd>Nandan Perumalla</dd><dt>Email</dt><dd>nandanperumalla15@gmail.com</dd><dt>Role</dt><dd><span class="badge badge--info">Super Admin</span></dd><dt>Access</dt><dd>All 13 modules</dd></dl>
        <div class="section-title">Security</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${toggleRow("Two-factor authentication", true)}
          ${toggleRow("Session timeout (30 min)", true)}
          ${toggleRow("Login activity alerts", false)}
        </div>
      </div>
      <div class="card"><div class="card__head"><div class="card__title">${icon("bell")} Notifications</div></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${toggleRow("Attendance risk alerts", true)}
          ${toggleRow("Fee reminders", true)}
          ${toggleRow("Placement updates", true)}
          ${toggleRow("Weekly digest email", false)}
        </div>
      </div>
      <div class="card"><div class="card__head"><div class="card__title">${icon("shield")} System</div></div>
        <dl class="kv"><dt>Version</dt><dd>ERP v1.0.0</dd><dt>Records</dt><dd>${fmt.num(db.students.length)} students · ${db.faculty.length} faculty</dd><dt>Data source</dt><dd>Procedural (deterministic)</dd><dt>Theme engine</dt><dd>8 themes · instant switch</dd></dl>
      </div>
    </div></div>`;
  view.querySelectorAll("[data-theme-id]").forEach((el) => el.addEventListener("click", () => { applyTheme(el.dataset.themeId); renderSettings(); toast("Theme applied", "success"); }));
  view.querySelectorAll(".tgl").forEach((el) => el.addEventListener("click", () => { el.classList.toggle("on"); toast(el.dataset.label + (el.classList.contains("on") ? " enabled" : " disabled")); }));
}
function toggleRow(label, on) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
    <span style="font-size:14px">${label}</span>
    <button class="tgl ${on ? "on" : ""}" data-label="${label}" aria-label="${label}"></button></div>`;
}
