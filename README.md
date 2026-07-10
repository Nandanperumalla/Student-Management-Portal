# 🎓 ERP — The Future of Academic Management

A world-class **Student Management ERP** prototype with a premium, futuristic UI — glassmorphism, aurora lighting, 8 instant-switch themes, animated SVG charts, a ⌘K command palette with AI-style natural-language search, and a fully functional Students module driven by **700 procedurally-generated realistic students**.

Built as a **zero-dependency, zero-build** browser app — it runs with nothing but Python (or any static server). No Node, no database, no install step.

---

## ✨ Run it

```bash
cd "Student mangament portal"
python3 serve.py 4173
```

Then open **http://localhost:4173**.

> Any static server works, e.g. `npx serve`, VS Code Live Server, etc. The app uses native ES modules, so it must be served over `http://` (opening `index.html` via `file://` will be blocked by the browser).

---

## 🧭 What works right now

| Area | Status |
|------|--------|
| **App shell** | Floating glass sidebar (collapsible), top bar, boot splash, aurora background, mobile drawer nav |
| **8 Themes** | Midnight Cyber · Aurora Blue · Royal Purple · Emerald Neon · Ocean Glass · Crimson Tech · Cyber Black · Arctic White — instant switch, persisted to `localStorage` |
| **Dark / Light** | One-tap toggle |
| **Command Palette** | `⌘K` / `Ctrl+K` — search pages, students, actions + **natural-language search** (e.g. *"CSE students with CGPA above 9"*, *"high risk ECE"*, *"fee overdue"*) |
| **Dashboard** | 8 animated stat cards with count-up + sparklines, area / bar / donut charts, attendance heatmap, top performers, AI risk radar |
| **Students** | Searchable / filterable / sortable / paginated table, real **CSV export**, and a full profile drawer with rings, AI insight, and **inline editing** that persists in-session |
| **Faculty / Fees / Placements / Attendance** | Real analytics pages built from the same live dataset |
| **Settings** | Theme picker + functional preference toggles |
| **Micro-interactions** | Ripple buttons, hover glows, page transitions, skeleton loaders, animated counters, chart draw-in |

---

## 🗂️ Structure

```
Student mangament portal/
├── index.html          # App shell markup
├── serve.py            # Tiny static server (sandbox-safe)
├── css/
│   ├── base.css        # Reset, design tokens, typography
│   ├── themes.css      # All 8 theme palettes (CSS variables)
│   └── app.css         # Layout, components, animations
└── js/
    ├── rng.js          # Deterministic seeded PRNG
    ├── data.js         # Generates 700 students, 80 faculty, aggregates
    ├── icons.js        # Inline Lucide-style SVG icon set
    ├── charts.js       # Animated SVG charts (area/bar/donut/spark/heatmap)
    ├── pages.js        # Dashboard, Students, Faculty, Fees, Placements…
    └── app.js          # Shell: routing, themes, palette, notifications, toasts
```

## 🧠 Data model

The "database" is generated deterministically (seeded), so the same 700 students appear on every reload — realistic Indian names, roll numbers, emails, 8 departments, CGPA/attendance distributions, fee status, hostel/transport, placements, achievements, and an **AI risk score** derived from attendance, CGPA, backlogs and fee status.

---

## 🛣️ Roadmap (next phases)

This is **Phase 1** — the shell + Dashboard + Students, plus real analytics for Faculty, Fees, Placements and Attendance. Planned next:

- Exams (marks entry, transcripts, result PDFs), Library catalogue, Hostel room-map, Transport GPS view
- Real backend option: **Next.js + Prisma + PostgreSQL** with JWT auth, role-based access, and a seed script mirroring this dataset
- PDF / Excel report generation and an AI chat assistant

---

Built with vanilla ES modules, modern CSS, and hand-crafted animated SVG — no framework, no build tooling.
