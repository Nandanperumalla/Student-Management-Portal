// ============================================================
// Hand-built animated SVG charts. Theme-aware (uses currentColor
// / passed CSS vars). Interactive tooltips via a shared handler.
// ============================================================

let tipEl;
function ensureTip() {
  if (!tipEl) {
    tipEl = document.createElement("div");
    tipEl.className = "chart-tip";
    document.body.appendChild(tipEl);
  }
  return tipEl;
}
// Global delegated tooltip for any [data-tip] element.
document.addEventListener("mousemove", (e) => {
  const hit = e.target.closest?.("[data-tip]");
  const t = ensureTip();
  if (hit) {
    t.innerHTML = hit.getAttribute("data-tip");
    t.classList.add("show");
    t.style.left = e.clientX + 14 + "px";
    t.style.top = e.clientY - 12 + "px";
  } else {
    t.classList.remove("show");
  }
});

const uid = () => "c" + Math.random().toString(36).slice(2, 8);

// ---------- Area / line chart ----------
export function areaChart(data, opt = {}) {
  const w = 640, h = 220, pad = { t: 16, r: 12, b: 26, l: 34 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const ys = data.map((d) => d.y);
  const min = opt.min ?? Math.min(...ys) * 0.94;
  const max = opt.max ?? Math.max(...ys) * 1.06;
  const X = (i) => pad.l + (i / (data.length - 1)) * iw;
  const Y = (v) => pad.t + ih - ((v - min) / (max - min)) * ih;
  const id = uid();

  const pts = data.map((d, i) => [X(i), Y(d.y)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L${X(data.length - 1)} ${pad.t + ih} L${pad.l} ${pad.t + ih} Z`;
  const gridY = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const y = pad.t + ih * f;
    const val = Math.round(max - (max - min) * f);
    return `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="var(--border-1)"/><text x="${pad.l - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-3)" font-size="10">${val}</text>`;
  }).join("");
  const xlab = data.map((d, i) => `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" fill="var(--text-3)" font-size="10">${d.x}</text>`).join("");
  const dots = data.map((d, i) => `<circle class="ch-dot" cx="${X(i)}" cy="${Y(d.y)}" r="9" fill="transparent" data-tip="${d.x} · <b>${d.y}${opt.unit || ""}</b>"/><circle cx="${X(i)}" cy="${Y(d.y)}" r="3.5" fill="var(--accent)" stroke="var(--bg-elevated)" stroke-width="2" class="ch-node"/>`).join("");

  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="height:220px">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity=".38"/>
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${gridY}${xlab}
    <path d="${area}" fill="url(#${id})" class="ch-area"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ch-line"/>
    ${dots}
  </svg>`;
}

// ---------- Bar chart ----------
export function barChart(data, opt = {}) {
  const w = 640, h = 240, pad = { t: 14, r: 10, b: 34, l: 34 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.y)) * 1.08;
  const bw = (iw / data.length) * 0.56;
  const gap = iw / data.length;
  const grid = [0, 0.5, 1].map((f) => { const y = pad.t + ih * f; return `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="var(--border-1)"/><text x="${pad.l - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-3)" font-size="10">${Math.round(max - max * f)}</text>`; }).join("");
  const bars = data.map((d, i) => {
    const x = pad.l + gap * i + (gap - bw) / 2;
    const bh = (d.y / max) * ih;
    const y = pad.t + ih - bh;
    const col = d.color || "var(--accent)";
    return `<g class="ch-bar" style="--i:${i}">
      <rect x="${x}" y="${pad.t}" width="${bw}" height="${ih}" rx="7" fill="var(--glass-2)" opacity=".5"/>
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="7" fill="${col}" data-tip="${d.label || d.x} · <b>${d.y}${opt.unit || ""}</b>" style="transform-origin:${x}px ${pad.t + ih}px"/>
      <text x="${x + bw / 2}" y="${h - 16}" text-anchor="middle" fill="var(--text-2)" font-size="11" font-weight="600">${d.x}</text>
      <text x="${x + bw / 2}" y="${h - 4}" text-anchor="middle" fill="var(--text-3)" font-size="9">${d.sub || ""}</text>
    </g>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="height:240px">${grid}${bars}</svg>`;
}

// ---------- Donut ----------
export function donutChart(segs, opt = {}) {
  const size = 200, r = 74, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  const total = segs.reduce((s, d) => s + d.value, 0) || 1;
  let off = 0;
  const arcs = segs.map((d, i) => {
    const frac = d.value / total;
    const len = frac * C;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="20" stroke-linecap="round"
      stroke-dasharray="${len - 3} ${C - len + 3}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"
      class="ch-arc" style="--i:${i}" data-tip="${d.label} · <b>${d.value}</b> (${Math.round(frac * 100)}%)"/>`;
    off += len;
    return el;
  }).join("");
  const center = opt.center || `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--text-1)" font-size="26" font-weight="700" font-family="var(--font-mono)">${total}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="var(--text-3)" font-size="11">${opt.label || "Total"}</text>`;
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" style="height:200px;overflow:visible">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--glass-2)" stroke-width="20"/>${arcs}${center}</svg>`;
}

// ---------- Sparkline (stat cards) ----------
export function sparkline(values, color = "var(--accent)") {
  const w = 220, h = 42;
  const min = Math.min(...values), max = Math.max(...values) || 1;
  const X = (i) => (i / (values.length - 1)) * w;
  const Y = (v) => h - 4 - ((v - min) / (max - min || 1)) * (h - 10);
  const line = values.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  const id = uid();
  return `<svg class="stat__spark chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${line} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

// ---------- Heatmap (attendance calendar) ----------
export function heatmap(weeks = 20, opt = {}) {
  const cell = 15, gap = 4, rows = 7;
  const w = weeks * (cell + gap), h = rows * (cell + gap);
  let cells = "";
  const rand = opt.rng || (() => Math.random());
  for (let x = 0; x < weeks; x++) {
    for (let y = 0; y < rows; y++) {
      const v = rand();
      const op = 0.12 + v * 0.88;
      cells += `<rect x="${x * (cell + gap)}" y="${y * (cell + gap)}" width="${cell}" height="${cell}" rx="4" fill="var(--accent)" fill-opacity="${op.toFixed(2)}" class="ch-cell" style="--d:${(x * rows + y) * 0.006}s" data-tip="${Math.round(op * 100)}% present"/>`;
    }
  }
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="height:${h}px;max-width:${w}px">${cells}</svg>`;
}

// Trigger entrance animations (dash-draw / grow) after insertion.
export function animateCharts(root) {
  root.querySelectorAll(".ch-line").forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    p.getBoundingClientRect();
    p.style.transition = "stroke-dashoffset 1.1s var(--ease)";
    requestAnimationFrame(() => (p.style.strokeDashoffset = 0));
  });
}
