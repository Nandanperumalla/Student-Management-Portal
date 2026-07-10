// ============================================================
// Page renderers: Dashboard, Students (+profile drawer), and
// real module pages (Faculty, Fees, Placements, Attendance…).
// Each page = { render(ctx) -> html, mounted?(root, ctx) }.
// ============================================================
import { fmt, DEPARTMENTS } from "./data.js";
import { icon } from "./icons.js";
import { areaChart, barChart, donutChart, sparkline, heatmap, animateCharts } from "./charts.js";
import { rng } from "./rng.js";

const avatar = (s, size = "sm") =>
  `<div class="avatar avatar--${size}" style="background:linear-gradient(135deg,${s.avatar[0]},${s.avatar[1]})">${s.initials}</div>`;

const gradeBadge = (g) => {
  const map = { O: "success", "A+": "success", A: "info", "B+": "info", B: "warning", C: "danger" };
  return `<span class="badge badge--${map[g] || "muted"}">${g}</span>`;
};
const feeBadge = (st) => {
  const map = { Paid: "success", Partial: "warning", Overdue: "danger" };
  return `<span class="badge badge--${map[st]}">${st}</span>`;
};
const riskBadge = (b) => {
  const map = { Low: "success", Medium: "warning", High: "danger" };
  return `<span class="badge badge--${map[b]}">${b}</span>`;
};

// ============================================================
// DASHBOARD
// ============================================================
function statCard(o) {
  const dir = o.delta >= 0 ? "up" : "down";
  return `<div class="card stat is-hoverable">
    <div class="card__glow"></div>
    <div class="stat__top">
      <div class="stat__icon">${icon(o.icon)}</div>
      <span class="stat__delta ${dir}">${dir === "up" ? "▲" : "▼"} ${Math.abs(o.delta)}%</span>
    </div>
    <div class="stat__val num" data-count="${o.raw}" data-suffix="${o.suffix || ""}" data-prefix="${o.prefix || ""}">${o.value}</div>
    <div class="stat__label">${o.label}</div>
    ${sparkline(o.spark, o.color || "var(--accent)")}
  </div>`;
}

export const Dashboard = {
  render({ db }) {
    const s = db.stats;
    const spark = () => Array.from({ length: 12 }, () => rng.int(30, 100));
    const cards = [
      { icon: "students", label: "Total Students", value: fmt.num(s.total), raw: s.total, delta: 4.2, color: "var(--accent)" },
      { icon: "faculty", label: "Faculty Members", value: fmt.num(s.faculty), raw: s.faculty, delta: 2.1, color: "var(--info)" },
      { icon: "attendance", label: "Avg Attendance", value: s.avgAtt + "%", raw: s.avgAtt, suffix: "%", delta: 1.4, color: "var(--success)" },
      { icon: "fees", label: "Revenue Collected", value: fmt.inr(s.revenue), raw: s.revenue, delta: 6.8, color: "var(--success)" },
      { icon: "clock", label: "Pending Fees", value: fmt.inr(s.pending), raw: s.pending, delta: -3.5, color: "var(--danger)" },
      { icon: "award", label: "Average CGPA", value: s.avgCgpa, raw: s.avgCgpa, delta: 0.9, color: "var(--accent-2)" },
      { icon: "placement", label: "Placement Rate", value: s.placementRate + "%", raw: s.placementRate, suffix: "%", delta: 5.3, color: "var(--info)" },
      { icon: "sparkles", label: "Scholarships", value: fmt.num(s.scholarships), raw: s.scholarships, delta: 3.0, color: "var(--warning)" },
    ].map((c) => statCard({ ...c, spark: spark() })).join("");

    const deptBars = s.byDept.map((d) => ({ x: d.code, y: d.count, color: d.color, sub: d.avgCgpa + " cgpa", label: d.name })).sort((a, b) => b.y - a.y);
    const gradeSegs = s.grades.map((g, i) => ({ label: "Grade " + g.g, value: g.n, color: ["#34e0a1", "#45c8ff", "#5b8cff", "#ffce4d", "#ff9d4d", "#ff6084"][i] }));
    const feeSegs = [
      { label: "Collected", value: Math.round(s.revenue / 1e5), color: "var(--success)" },
      { label: "Pending", value: Math.round(s.pending / 1e5), color: "var(--danger)" },
    ];

    return `<div class="page-enter">
      ${pageHead("Overview", "Command Center", "Real-time academic intelligence across all departments, updated live.", `
        <button class="btn btn--ghost" data-toast="Report queued for generation">${icon("download")}<span class="lbl-hide">Export</span></button>
        <button class="btn btn--primary" data-nav="students">${icon("plus")}<span class="lbl-hide">Add Student</span></button>`)}

      <div class="stat-grid rise" style="margin-bottom:22px">${cards}</div>

      <div class="grid grid-3" style="margin-bottom:22px">
        <div class="card col-span-2 is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div><div class="card__title">Attendance Trend</div><div class="card__sub">Institution-wide, last 10 months</div></div>
            <span class="chip">${icon("trend")} +1.4% MoM</span></div>
          ${areaChart(s.attTrend, { unit: "%", min: 70, max: 96 })}
        </div>
        <div class="card is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div class="card__title">Grade Distribution</div></div>
          ${donutChart(gradeSegs, { label: "Students" })}
          <div class="legend">${gradeSegs.map((g) => `<span class="legend__i"><span class="legend__dot" style="background:${g.color}"></span>${g.label.replace("Grade ", "")} · ${g.value}</span>`).join("")}</div>
        </div>
      </div>

      <div class="grid grid-3" style="margin-bottom:22px">
        <div class="card col-span-2 is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div><div class="card__title">Students by Department</div><div class="card__sub">Enrollment & average CGPA</div></div></div>
          ${barChart(deptBars, {})}
        </div>
        <div class="card is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div class="card__title">Fee Collection</div><div class="card__sub">₹ lakhs</div></div>
          ${donutChart(feeSegs, { label: "₹ Lakhs" })}
          <div class="legend">${feeSegs.map((g) => `<span class="legend__i"><span class="legend__dot" style="background:${g.color}"></span>${g.label}</span>`).join("")}</div>
        </div>
      </div>

      <div class="grid grid-2" style="margin-bottom:22px">
        <div class="card is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div class="card__title">${icon("award")} Top Performers</div><button class="btn btn--sm btn--ghost" data-nav="students">View all</button></div>
          ${leaderList(s.topPerformers, (p) => `${p.cgpa} CGPA`)}
        </div>
        <div class="card is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div class="card__title" style="color:var(--danger)">${icon("shield")} AI Risk Radar</div><span class="badge badge--danger">${s.highRisk} high-risk</span></div>
          ${leaderList(s.riskStudents, (p) => `${p.riskScore}% risk`, true)}
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div><div class="card__title">Attendance Heatmap</div><div class="card__sub">Daily presence density</div></div></div>
          ${heatmap(20, { rng: () => rng.next() })}
        </div>
        <div class="card is-hoverable"><div class="card__glow"></div>
          <div class="card__head"><div class="card__title">Enrollment Growth</div><div class="card__sub">New admissions / year</div></div>
          ${barChart(s.enrollTrend.map((d) => ({ x: d.x.slice(2), y: d.y })), {})}
        </div>
      </div>
    </div>`;
  },
  mounted(root, ctx) { runCounters(root); animateCharts(root); },
};

function leaderList(items, meta, risk = false) {
  return `<div style="display:flex;flex-direction:column;gap:4px">${items.map((p, i) =>
    `<div class="palette__item" data-student="${p.id}" style="cursor:pointer">
      <div style="width:26px;text-align:center;font-family:var(--font-mono);font-weight:700;color:${i < 3 ? "var(--accent)" : "var(--text-3)"}">${i + 1}</div>
      ${avatar(p, "sm")}
      <div class="t"><b>${p.name}</b><small>${p.rollNo} · ${p.deptCode}</small></div>
      <span class="badge badge--${risk ? (p.riskBand === "High" ? "danger" : "warning") : "success"}">${meta(p)}</span>
    </div>`).join("")}</div>`;
}

// ============================================================
// STUDENTS
// ============================================================
const STU = { page: 1, per: 12, q: "", dept: "", year: "", fee: "", risk: "", sort: "rank", dir: 1 };

export const Students = {
  render({ db }) {
    return `<div class="page-enter">
      ${pageHead("Directory", "Students", `${db.students.length} enrolled students across ${DEPARTMENTS.length} departments — search, filter, sort, export.`, `
        <button class="btn btn--ghost" id="stuExport">${icon("download")}<span class="lbl-hide">Export CSV</span></button>
        <button class="btn btn--primary" data-toast="Admissions form opening…">${icon("plus")}<span class="lbl-hide">Add Student</span></button>`)}
      <div class="card card--pad0">
        <div class="toolbar" style="padding:16px 16px 0">
          <div class="field field--grow">${icon("search")}<input id="stuSearch" placeholder="Search name, roll no, email or department…" value="${STU.q}"/></div>
          <select class="select" id="stuDept">${optList("All Departments", DEPARTMENTS.map((d) => [d.code, d.code]), STU.dept)}</select>
          <select class="select" id="stuYear">${optList("All Years", [[1, "Year 1"], [2, "Year 2"], [3, "Year 3"], [4, "Year 4"]], STU.year)}</select>
          <select class="select" id="stuFee">${optList("All Fees", [["Paid", "Paid"], ["Partial", "Partial"], ["Overdue", "Overdue"]], STU.fee)}</select>
          <select class="select" id="stuRisk">${optList("All Risk", [["Low", "Low risk"], ["Medium", "Medium"], ["High", "High risk"]], STU.risk)}</select>
        </div>
        <div id="stuTable"></div>
      </div>
    </div>`;
  },
  mounted(root, ctx) {
    const draw = () => renderStuTable(root, ctx);
    const bind = (id, key, num) => {
      const el = root.querySelector(id);
      el.addEventListener("input", () => { STU[key] = num ? (el.value ? +el.value : "") : el.value; STU.page = 1; draw(); });
      el.addEventListener("change", () => { STU[key] = num ? (el.value ? +el.value : "") : el.value; STU.page = 1; draw(); });
    };
    bind("#stuSearch", "q");
    bind("#stuDept", "dept");
    bind("#stuYear", "year", true);
    bind("#stuFee", "fee");
    bind("#stuRisk", "risk");
    root.querySelector("#stuExport").addEventListener("click", () => exportCsv(filterStudents(ctx.db.students), ctx));
    draw();
  },
};

function filterStudents(all) {
  const q = STU.q.trim().toLowerCase();
  let list = all.filter((s) => {
    if (STU.dept && s.deptCode !== STU.dept) return false;
    if (STU.year && s.year !== STU.year) return false;
    if (STU.fee && s.feeStatus !== STU.fee) return false;
    if (STU.risk && s.riskBand !== STU.risk) return false;
    if (q && !(`${s.name} ${s.rollNo} ${s.email} ${s.deptCode} ${s.deptName}`.toLowerCase().includes(q))) return false;
    return true;
  });
  const s = STU.sort, d = STU.dir;
  list.sort((a, b) => {
    let A = a[s], B = b[s];
    if (typeof A === "string") return A.localeCompare(B) * d;
    return (A - B) * d;
  });
  return list;
}

function renderStuTable(root, ctx) {
  const all = filterStudents(ctx.db.students);
  const totalPages = Math.max(1, Math.ceil(all.length / STU.per));
  STU.page = Math.min(STU.page, totalPages);
  const start = (STU.page - 1) * STU.per;
  const rows = all.slice(start, start + STU.per);
  const th = (label, key, cls = "") => `<th class="${cls} ${STU.sort === key ? "sorted" : ""}" data-sort="${key}">${label}<span class="sort-ind">${STU.sort === key ? (STU.dir === 1 ? "▲" : "▼") : "↕"}</span></th>`;

  const html = `<div class="table-wrap"><table class="table">
    <thead><tr>
      ${th("Student", "name")}${th("Dept", "deptCode")}${th("Year", "year")}
      ${th("CGPA", "cgpa")}${th("Attendance", "attendance")}
      <th class="no-sort">Fees</th>${th("Risk", "riskScore")}
      <th class="no-sort" style="text-align:right">Actions</th>
    </tr></thead>
    <tbody>${rows.length ? rows.map((s) => `
      <tr data-student="${s.id}">
        <td><div class="cell-user">${avatar(s)}<div><div class="cell-user__name">${s.name}</div><div class="cell-user__meta">${s.rollNo}</div></div></div></td>
        <td><span class="chip" style="border-color:${s.deptColor}55">${s.deptCode}</span></td>
        <td class="dim">Y${s.year} · ${s.section}</td>
        <td><span class="num" style="font-weight:600">${s.cgpa}</span> ${gradeBadge(s.grade)}</td>
        <td><div style="display:flex;align-items:center;gap:8px"><div class="meter ${s.attendance >= 85 ? "meter--good" : s.attendance < 75 ? "meter--warn" : ""}"><span style="width:${s.attendance}%"></span></div><span class="num muted" style="font-size:12px">${s.attendance}%</span></div></td>
        <td>${feeBadge(s.feeStatus)}</td>
        <td>${riskBadge(s.riskBand)}</td>
        <td><div class="row-actions">
          <button class="mini-ic" data-view="${s.id}" title="View">${icon("eye")}</button>
          <button class="mini-ic" data-edit="${s.id}" title="Edit">${icon("edit")}</button>
        </div></td>
      </tr>`).join("") : `<tr><td colspan="8"><div class="empty"><div class="empty__ic">🔍</div>No students match your filters.</div></td></tr>`}
    </tbody></table></div>
    ${pager(start, rows.length, all.length, STU.page, totalPages)}`;

  const mount = root.querySelector("#stuTable");
  mount.innerHTML = html;

  mount.querySelectorAll("th[data-sort]").forEach((el) => el.addEventListener("click", () => {
    const k = el.dataset.sort;
    if (STU.sort === k) STU.dir *= -1; else { STU.sort = k; STU.dir = 1; }
    renderStuTable(root, ctx);
  }));
  mount.querySelectorAll("[data-student]").forEach((el) => el.addEventListener("click", (e) => {
    if (e.target.closest("[data-edit]")) return;
    openStudentDrawer(ctx.db.students.find((s) => s.id === +el.dataset.student), ctx);
  }));
  mount.querySelectorAll("[data-edit]").forEach((el) => el.addEventListener("click", (e) => {
    e.stopPropagation();
    openStudentDrawer(ctx.db.students.find((s) => s.id === +el.dataset.edit), ctx, true);
  }));
  mount.querySelectorAll("[data-page]").forEach((el) => el.addEventListener("click", () => { STU.page = +el.dataset.page; renderStuTable(root, ctx); }));
}

// ---- Student profile / edit drawer ----
export function openStudentDrawer(s, ctx, edit = false) {
  if (!s) return;
  const ring = (val, label, color, max = 100) => `<div style="text-align:center">
    <div class="ring" style="--p:${(val / max) * 100};--accent:${color}"><span class="ring__val num">${val}${max === 100 ? "%" : ""}</span></div>
    <div class="muted" style="font-size:12px;margin-top:8px">${label}</div></div>`;

  const view = () => `
    <div style="position:sticky;top:0;z-index:2;padding:18px 22px;display:flex;align-items:center;gap:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border-1)">
      <button class="icon-btn" data-close style="width:38px;height:38px">${icon("close")}</button>
      <div style="font-weight:700;font-family:var(--font-display)">Student Profile</div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn btn--sm btn--ghost" data-editbtn>${icon("edit")} Edit</button>
        <button class="btn btn--sm btn--ghost" data-toast="ID card generated (PDF)">${icon("qr")} ID Card</button>
      </div>
    </div>
    <div style="padding:24px 22px">
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        ${avatar(s, "lg")}
        <div style="flex:1;min-width:160px">
          <h2 style="margin-bottom:4px">${s.name}</h2>
          <div class="muted" style="font-family:var(--font-mono)">${s.rollNo}</div>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <span class="chip" style="border-color:${s.deptColor}66">${s.deptName}</span>
            ${gradeBadge(s.grade)} ${feeBadge(s.feeStatus)} ${riskBadge(s.riskBand)}
            ${s.scholarship ? '<span class="badge badge--info">Scholarship</span>' : ""}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:18px;justify-content:center;margin:26px 0 6px;flex-wrap:wrap">
        ${ring(s.attendance, "Attendance", "var(--success)")}
        ${ring(s.cgpa, "CGPA", "var(--accent)", 10)}
        ${ring(s.riskScore, "AI Risk", s.riskBand === "High" ? "var(--danger)" : s.riskBand === "Medium" ? "var(--warning)" : "var(--success)")}
      </div>

      <div class="card" style="margin-top:18px;background:linear-gradient(120deg,var(--accent-soft),transparent)">
        <div class="card__title" style="display:flex;align-items:center;gap:8px;color:var(--accent)">${icon("sparkles")} AI Academic Insight</div>
        <p class="dim" style="margin-top:8px;font-size:14px;line-height:1.6">${aiInsight(s)}</p>
      </div>

      <div class="section-title">Personal</div>
      <dl class="kv">
        <dt>Gender</dt><dd>${s.gender === "M" ? "Male" : "Female"}</dd>
        <dt>Date of Birth</dt><dd>${s.dob}</dd>
        <dt>Blood Group</dt><dd>${s.bloodGroup}</dd>
        <dt>Email</dt><dd>${s.email}</dd>
        <dt>Phone</dt><dd>${s.phone}</dd>
        <dt>Address</dt><dd>${s.address}, ${s.state}</dd>
        <dt>Category</dt><dd>${s.category} · ${s.quota} quota</dd>
      </dl>

      <div class="section-title">Academic</div>
      <dl class="kv">
        <dt>Department</dt><dd>${s.deptName}</dd>
        <dt>Year / Sem</dt><dd>Year ${s.year} · Semester ${s.semester} · Sec ${s.section}</dd>
        <dt>CGPA / SGPA</dt><dd>${s.cgpa} / ${s.sgpa}</dd>
        <dt>Class Rank</dt><dd>#${s.rank} of ${700}</dd>
        <dt>Backlogs</dt><dd>${s.backlogs || "None"}</dd>
        <dt>AI Predicted CGPA</dt><dd>${s.predictedCgpa} <span class="badge badge--${s.predictedCgpa >= s.cgpa ? "success" : "warning"}">${s.predictedCgpa >= s.cgpa ? "▲ improving" : "▼ watch"}</span></dd>
      </dl>

      <div class="section-title">Fees</div>
      <dl class="kv">
        <dt>Total Fee</dt><dd>${fmt.inrFull(s.feeTotal)}</dd>
        <dt>Paid</dt><dd style="color:var(--success)">${fmt.inrFull(s.feePaid)}</dd>
        <dt>Due</dt><dd style="color:${s.feeDue ? "var(--danger)" : "var(--text-2)"}">${fmt.inrFull(s.feeDue)}</dd>
      </dl>

      <div class="section-title">Guardian & Contact</div>
      <dl class="kv">
        <dt>${s.guardianRelation}</dt><dd>${s.guardianName}</dd>
        <dt>Guardian Phone</dt><dd>${s.guardianPhone}</dd>
      </dl>

      <div class="section-title">Residence & Transport</div>
      <dl class="kv">
        <dt>Hostel</dt><dd>${s.hostel ? `Block ${s.hostelBlock}, Room ${s.hostelRoom}` : "Day Scholar"}</dd>
        <dt>Transport</dt><dd>${s.transport ? s.route : "—"}</dd>
      </dl>

      <div class="section-title">Placement</div>
      <dl class="kv">
        <dt>Status</dt><dd><span class="badge badge--${s.placement.status === "Placed" ? "success" : "info"}">${s.placement.status}</span></dd>
        ${s.placement.company ? `<dt>Company</dt><dd>${s.placement.company}</dd><dt>Package</dt><dd>${s.placement.ctc} LPA</dd>` : ""}
      </dl>

      ${s.achievements.length ? `<div class="section-title">Achievements</div><div style="display:flex;gap:8px;flex-wrap:wrap">${s.achievements.map((a) => `<span class="chip">${icon("award")} ${a}</span>`).join("")}</div>` : ""}
    </div>`;

  const form = () => `
    <div style="position:sticky;top:0;z-index:2;padding:18px 22px;display:flex;align-items:center;gap:12px;background:var(--bg-elevated);border-bottom:1px solid var(--border-1)">
      <button class="icon-btn" data-close style="width:38px;height:38px">${icon("close")}</button>
      <div style="font-weight:700;font-family:var(--font-display)">Edit Student</div>
    </div>
    <form id="stuForm" style="padding:24px 22px;display:flex;flex-direction:column;gap:14px">
      ${editField("Full Name", "name", s.name)}
      ${editField("Email", "email", s.email, "email")}
      ${editField("Phone", "phone", s.phone)}
      <div style="display:flex;gap:12px">
        ${editField("Section", "section", s.section)}
        ${editField("CGPA", "cgpa", s.cgpa, "number")}
      </div>
      ${editField("Attendance %", "attendance", s.attendance, "number")}
      ${editField("Address", "address", s.address)}
      <div style="display:flex;gap:10px;margin-top:6px">
        <button type="submit" class="btn btn--primary">${icon("check")} Save Changes</button>
        <button type="button" class="btn btn--ghost" data-cancel>Cancel</button>
      </div>
    </form>`;

  ctx.openDrawer(edit ? form() : view());
  wireDrawer(s, ctx);

  function wireDrawer(s, ctx) {
    const panel = document.getElementById("drawerPanel");
    panel.querySelector("[data-editbtn]")?.addEventListener("click", () => { panel.innerHTML = form(); wireDrawer(s, ctx); });
    panel.querySelector("[data-cancel]")?.addEventListener("click", () => { panel.innerHTML = view(); wireDrawer(s, ctx); });
    panel.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => ctx.closeDrawer()));
    const f = panel.querySelector("#stuForm");
    if (f) f.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      s.name = fd.get("name"); s.email = fd.get("email"); s.phone = fd.get("phone");
      s.section = fd.get("section"); s.address = fd.get("address");
      s.cgpa = +(+fd.get("cgpa")).toFixed(2); s.attendance = Math.round(+fd.get("attendance"));
      s.initials = s.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      ctx.toast("Student updated successfully", "success");
      panel.innerHTML = view(); wireDrawer(s, ctx);
      ctx.refresh?.();
    });
  }
}
function editField(label, name, val, type = "text") {
  return `<label style="display:flex;flex-direction:column;gap:6px;flex:1"><span class="muted" style="font-size:12px">${label}</span>
    <div class="field"><input name="${name}" type="${type}" ${type === "number" ? 'step="0.01"' : ""} value="${String(val).replace(/"/g, "&quot;")}" required/></div></label>`;
}

function aiInsight(s) {
  const bits = [];
  if (s.riskBand === "High") bits.push(`flagged <b>high-risk</b> — attendance at ${s.attendance}% and ${s.backlogs} backlog(s) need intervention`);
  else if (s.attendance < 78) bits.push(`attendance (${s.attendance}%) is trending below the 78% safe zone`);
  else bits.push(`consistent performer with ${s.attendance}% attendance`);
  if (s.cgpa >= 8.5) bits.push(`top-decile CGPA of ${s.cgpa} — strong placement candidate`);
  else if (s.predictedCgpa > s.cgpa) bits.push(`model predicts CGPA rising to ${s.predictedCgpa} next semester`);
  else bits.push(`projected CGPA ${s.predictedCgpa}; recommend mentoring in core subjects`);
  return `${s.first} is ${bits.join(", and ")}.`;
}

// ============================================================
// Shared: page head, pager, options, counters, CSV
// ============================================================
function pageHead(eyebrow, title, sub, actions = "") {
  return `<div class="page-head">
    <div><div class="page-head__eyebrow">${eyebrow}</div>
      <div class="page-head__title"><h1>${title}</h1></div>
      <div class="page-head__sub">${sub}</div></div>
    <div class="page-head__actions">${actions}</div>
  </div>`;
}
function optList(all, pairs, sel) {
  return `<option value="">${all}</option>` + pairs.map(([v, l]) => `<option value="${v}" ${String(sel) === String(v) ? "selected" : ""}>${l}</option>`).join("");
}
function pager(start, shown, total, page, totalPages) {
  const btn = (p, label, active, dis) => `<button class="pager__btn ${active ? "is-active" : ""}" ${dis ? "disabled" : ""} data-page="${p}">${label}</button>`;
  let nums = "";
  const range = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) range.push(i);
  if (range[0] > 1) nums += btn(1, "1") + (range[0] > 2 ? '<span class="muted">…</span>' : "");
  range.forEach((i) => (nums += btn(i, i, i === page)));
  if (range[range.length - 1] < totalPages) nums += (range[range.length - 1] < totalPages - 1 ? '<span class="muted">…</span>' : "") + btn(totalPages, totalPages);
  return `<div class="pager"><div class="pager__info">Showing <b>${total ? start + 1 : 0}–${start + shown}</b> of <b>${total}</b></div>
    <div class="pager__nav">${btn(page - 1, "‹ Prev", false, page === 1)}${nums}${btn(page + 1, "Next ›", false, page === totalPages)}</div></div>`;
}
function runCounters(root) {
  root.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.dataset.count; if (!isFinite(target)) return;
    const suf = el.dataset.suffix || "", pre = el.dataset.prefix || "";
    const dur = 900, t0 = performance.now();
    const isInt = Number.isInteger(target);
    const orig = el.textContent;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = target * e;
      el.textContent = pre + (isInt ? Math.round(v).toLocaleString("en-IN") : v.toFixed(2)) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = orig;
    })(t0);
  });
}
function exportCsv(list, ctx) {
  const cols = ["rollNo", "name", "gender", "email", "phone", "deptCode", "year", "section", "cgpa", "attendance", "feeStatus", "feeDue", "riskBand", "rank"];
  const head = cols.join(",");
  const rows = list.map((s) => cols.map((c) => `"${String(s[c]).replace(/"/g, '""')}"`).join(","));
  const blob = new Blob([head + "\n" + rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `students_${list.length}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  ctx.toast(`Exported ${list.length} students to CSV`, "success");
}

// ============================================================
// Real secondary module pages (built from the same live data)
// ============================================================
export const Faculty = {
  render({ db }) {
    const f = db.faculty;
    const byDept = DEPARTMENTS.map((d) => ({ x: d.code, y: f.filter((x) => x.dept === d.code).length, color: d.color }));
    const avgRating = (f.reduce((s, x) => s + x.rating, 0) / f.length).toFixed(2);
    const papers = f.reduce((s, x) => s + x.papers, 0);
    return `<div class="page-enter">
      ${pageHead("Human Capital", "Faculty", `${f.length} faculty members · ${papers} research papers · ${avgRating}★ avg rating.`, "")}
      <div class="stat-grid rise" style="margin-bottom:22px">
        ${statCard({ icon: "faculty", label: "Total Faculty", value: fmt.num(f.length), raw: f.length, delta: 2.1, spark: Array.from({ length: 12 }, () => rng.int(40, 90)) })}
        ${statCard({ icon: "award", label: "Avg Rating", value: avgRating, raw: +avgRating, delta: 1.2, spark: Array.from({ length: 12 }, () => rng.int(40, 90)) })}
        ${statCard({ icon: "reports", label: "Research Papers", value: fmt.num(papers), raw: papers, delta: 8.4, spark: Array.from({ length: 12 }, () => rng.int(40, 90)) })}
        ${statCard({ icon: "exam", label: "Professors", value: fmt.num(f.filter((x) => x.designation === "Professor").length), raw: f.filter((x) => x.designation === "Professor").length, delta: 0.8, spark: Array.from({ length: 12 }, () => rng.int(40, 90)) })}
      </div>
      <div class="grid grid-3" style="margin-bottom:22px">
        <div class="card col-span-2 is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Faculty by Department</div></div>${barChart(byDept, {})}</div>
        <div class="card is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Top Rated</div></div>
          ${f.slice().sort((a, b) => b.rating - a.rating).slice(0, 6).map((x, i) => `<div class="palette__item"><div style="width:24px;font-weight:700;color:var(--accent)">${i + 1}</div><div class="t"><b>${x.name}</b><small>${x.dept} · ${x.designation}</small></div><span class="badge badge--success">${x.rating}★</span></div>`).join("")}
        </div>
      </div>
      <div class="card card--pad0"><div class="table-wrap"><table class="table">
        <thead><tr><th>Faculty</th><th>Department</th><th>Designation</th><th>Experience</th><th>Papers</th><th>Rating</th></tr></thead>
        <tbody>${f.slice(0, 40).map((x) => `<tr><td><div class="cell-user"><div class="avatar avatar--sm" style="background:linear-gradient(135deg,var(--accent),var(--accent-2))">${x.name.split(" ")[1][0]}${x.name.split(" ")[2][0]}</div><div class="cell-user__name">${x.name}</div></div></td><td><span class="chip">${x.dept}</span></td><td class="dim">${x.designation}</td><td class="num">${x.experience} yrs</td><td class="num">${x.papers}</td><td><span class="badge badge--success">${x.rating}★</span></td></tr>`).join("")}</tbody>
      </table></div></div>
    </div>`;
  },
  mounted(root) { runCounters(root); animateCharts(root); },
};

export const Fees = {
  render({ db }) {
    const s = db.stats, all = db.students;
    const defaulters = all.filter((x) => x.feeStatus === "Overdue").sort((a, b) => b.feeDue - a.feeDue).slice(0, 25);
    const segs = [
      { label: "Paid", value: all.filter((x) => x.feeStatus === "Paid").length, color: "var(--success)" },
      { label: "Partial", value: all.filter((x) => x.feeStatus === "Partial").length, color: "var(--warning)" },
      { label: "Overdue", value: all.filter((x) => x.feeStatus === "Overdue").length, color: "var(--danger)" },
    ];
    return `<div class="page-enter">
      ${pageHead("Finance", "Fees & Revenue", `${fmt.inr(s.revenue)} collected · ${fmt.inr(s.pending)} outstanding · ${s.defaulters} defaulters.`, `<button class="btn btn--ghost" data-toast="Revenue report exported">${icon("download")}<span class="lbl-hide">Report</span></button>`)}
      <div class="stat-grid rise" style="margin-bottom:22px">
        ${statCard({ icon: "fees", label: "Total Collected", value: fmt.inr(s.revenue), raw: s.revenue, delta: 6.8, color: "var(--success)", spark: Array.from({ length: 12 }, () => rng.int(40, 95)) })}
        ${statCard({ icon: "clock", label: "Outstanding", value: fmt.inr(s.pending), raw: s.pending, delta: -3.5, color: "var(--danger)", spark: Array.from({ length: 12 }, () => rng.int(20, 70)) })}
        ${statCard({ icon: "sparkles", label: "Scholarships", value: fmt.num(s.scholarships), raw: s.scholarships, delta: 3.0, color: "var(--info)", spark: Array.from({ length: 12 }, () => rng.int(30, 80)) })}
        ${statCard({ icon: "shield", label: "Defaulters", value: fmt.num(s.defaulters), raw: s.defaulters, delta: -1.2, color: "var(--warning)", spark: Array.from({ length: 12 }, () => rng.int(20, 60)) })}
      </div>
      <div class="grid grid-3" style="margin-bottom:22px">
        <div class="card col-span-2 is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Monthly Collection</div><div class="card__sub">₹ lakhs / month</div></div>${barChart(s.feeTrend.map((d) => ({ x: d.x, y: d.y })), { unit: "L" })}</div>
        <div class="card is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Payment Status</div></div>${donutChart(segs, { label: "Students" })}<div class="legend">${segs.map((g) => `<span class="legend__i"><span class="legend__dot" style="background:${g.color}"></span>${g.label} · ${g.value}</span>`).join("")}</div></div>
      </div>
      <div class="card card--pad0"><div class="card__head" style="padding:16px 16px 0"><div class="card__title" style="color:var(--danger)">${icon("shield")} AI Fee Defaulter Watchlist</div></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Dept</th><th>Due Amount</th><th>Paid</th><th>Risk</th></tr></thead>
      <tbody>${defaulters.map((s) => `<tr data-student="${s.id}"><td><div class="cell-user">${avatar(s)}<div><div class="cell-user__name">${s.name}</div><div class="cell-user__meta">${s.rollNo}</div></div></div></td><td><span class="chip">${s.deptCode}</span></td><td class="num" style="color:var(--danger);font-weight:600">${fmt.inrFull(s.feeDue)}</td><td class="num muted">${fmt.inrFull(s.feePaid)}</td><td>${riskBadge(s.riskBand)}</td></tr>`).join("")}</tbody></table></div></div>
    </div>`;
  },
  mounted(root, ctx) {
    runCounters(root); animateCharts(root);
    root.querySelectorAll("[data-student]").forEach((el) => el.addEventListener("click", () => openStudentDrawer(ctx.db.students.find((s) => s.id === +el.dataset.student), ctx)));
  },
};

export const Placements = {
  render({ db }) {
    const s = db.stats, all = db.students;
    const placed = all.filter((x) => x.placement.status === "Placed");
    const avg = placed.length ? (placed.reduce((a, x) => a + x.placement.ctc, 0) / placed.length).toFixed(1) : 0;
    const high = placed.reduce((m, x) => Math.max(m, x.placement.ctc), 0);
    const byDept = s.byDept.map((d) => ({ x: d.code, y: d.placed, color: d.color }));
    return `<div class="page-enter">
      ${pageHead("Careers", "Placements", `${placed.length} offers · ${s.placementRate}% placement rate · ${avg} LPA average · ${high} LPA highest.`, "")}
      <div class="stat-grid rise" style="margin-bottom:22px">
        ${statCard({ icon: "placement", label: "Total Offers", value: fmt.num(placed.length), raw: placed.length, delta: 5.3, color: "var(--success)", spark: Array.from({ length: 12 }, () => rng.int(30, 90)) })}
        ${statCard({ icon: "trend", label: "Placement Rate", value: s.placementRate + "%", raw: s.placementRate, suffix: "%", delta: 4.1, color: "var(--info)", spark: Array.from({ length: 12 }, () => rng.int(40, 95)) })}
        ${statCard({ icon: "award", label: "Avg Package", value: avg + " LPA", raw: +avg, delta: 7.2, color: "var(--accent-2)", spark: Array.from({ length: 12 }, () => rng.int(40, 90)) })}
        ${statCard({ icon: "sparkles", label: "Highest", value: high + " LPA", raw: high, delta: 12, color: "var(--warning)", spark: Array.from({ length: 12 }, () => rng.int(40, 100)) })}
      </div>
      <div class="grid grid-3" style="margin-bottom:22px">
        <div class="card col-span-2 is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Offers by Department</div></div>${barChart(byDept, {})}</div>
        <div class="card is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Top Recruiters</div></div>${s.topRecruiters.map((r, i) => `<div class="palette__item"><div style="width:24px;font-weight:700;color:var(--accent)">${i + 1}</div><div class="t"><b>${r.name}</b></div><span class="badge badge--info">${r.n} hires</span></div>`).join("")}</div>
      </div>
      <div class="card card--pad0"><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Dept</th><th>Company</th><th>Package</th><th>CGPA</th></tr></thead>
      <tbody>${placed.sort((a, b) => b.placement.ctc - a.placement.ctc).slice(0, 30).map((s) => `<tr data-student="${s.id}"><td><div class="cell-user">${avatar(s)}<div><div class="cell-user__name">${s.name}</div><div class="cell-user__meta">${s.rollNo}</div></div></div></td><td><span class="chip">${s.deptCode}</span></td><td>${s.placement.company}</td><td class="num" style="color:var(--success);font-weight:600">${s.placement.ctc} LPA</td><td class="num">${s.cgpa}</td></tr>`).join("")}</tbody></table></div></div>
    </div>`;
  },
  mounted(root, ctx) {
    runCounters(root); animateCharts(root);
    root.querySelectorAll("[data-student]").forEach((el) => el.addEventListener("click", () => openStudentDrawer(ctx.db.students.find((s) => s.id === +el.dataset.student), ctx)));
  },
};

export const Attendance = {
  render({ db }) {
    const s = db.stats, all = db.students;
    const low = all.filter((x) => x.attendance < 75).sort((a, b) => a.attendance - b.attendance).slice(0, 25);
    return `<div class="page-enter">
      ${pageHead("Presence", "Attendance", `Institution average ${s.avgAtt}% · ${all.filter((x) => x.attendance < 75).length} students below the 75% threshold.`, `<button class="btn btn--primary" data-toast="QR attendance session started">${icon("qr")}<span class="lbl-hide">Start QR Session</span></button>`)}
      <div class="grid grid-3" style="margin-bottom:22px">
        <div class="card col-span-2 is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">Attendance Trend</div><div class="card__sub">Monthly average</div></div>${areaChart(s.attTrend, { unit: "%", min: 70, max: 96 })}</div>
        <div class="card is-hoverable"><div class="card__glow"></div><div class="card__head"><div class="card__title">By Department</div></div>${barChart(s.byDept.map((d) => ({ x: d.code, y: Math.round(rng.normal(84, 5, 72, 94)), color: d.color })), { unit: "%" })}</div>
      </div>
      <div class="card is-hoverable" style="margin-bottom:22px"><div class="card__head"><div><div class="card__title">Presence Heatmap</div><div class="card__sub">Daily density over the semester</div></div></div>${heatmap(26, { rng: () => rng.next() })}</div>
      <div class="card card--pad0"><div class="card__head" style="padding:16px 16px 0"><div class="card__title" style="color:var(--warning)">${icon("shield")} Shortage Alert (&lt; 75%)</div></div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Dept</th><th>Attendance</th><th>Risk</th></tr></thead>
      <tbody>${low.map((s) => `<tr data-student="${s.id}"><td><div class="cell-user">${avatar(s)}<div><div class="cell-user__name">${s.name}</div><div class="cell-user__meta">${s.rollNo}</div></div></div></td><td><span class="chip">${s.deptCode}</span></td><td><div style="display:flex;align-items:center;gap:8px"><div class="meter meter--warn"><span style="width:${s.attendance}%"></span></div><span class="num">${s.attendance}%</span></div></td><td>${riskBadge(s.riskBand)}</td></tr>`).join("")}</tbody></table></div></div>
    </div>`;
  },
  mounted(root, ctx) {
    animateCharts(root);
    root.querySelectorAll("[data-student]").forEach((el) => el.addEventListener("click", () => openStudentDrawer(ctx.db.students.find((s) => s.id === +el.dataset.student), ctx)));
  },
};

// Generic module overview for the remaining nav entries — real KPIs, not empty stubs.
export function ModulePage(meta) {
  return {
    render({ db }) {
      return `<div class="page-enter">
        ${pageHead(meta.eyebrow, meta.title, meta.sub, "")}
        <div class="stat-grid rise" style="margin-bottom:22px">
          ${meta.stats.map((st) => statCard({ ...st, spark: Array.from({ length: 12 }, () => rng.int(30, 90)) })).join("")}
        </div>
        <div class="card" style="text-align:center;padding:50px 24px">
          <div style="font-size:44px;margin-bottom:14px">${meta.emoji}</div>
          <h2>${meta.title} module</h2>
          <p class="dim" style="max-width:52ch;margin:10px auto 0">${meta.body}</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap">
            ${meta.chips.map((c) => `<span class="chip">${c}</span>`).join("")}
          </div>
        </div>
      </div>`;
    },
    mounted(root) { runCounters(root); },
  };
}
