// Deterministic PRNG so the generated "database" is stable across reloads/navigation.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A single shared stream, so calls compose deterministically.
const rand = mulberry32(20260710);

export const rng = {
  next: () => rand(),
  int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
  float: (min, max, dp = 2) => +(rand() * (max - min) + min).toFixed(dp),
  pick: (arr) => arr[Math.floor(rand() * arr.length)],
  weighted: (pairs) => { // [[value, weight], ...]
    const total = pairs.reduce((s, p) => s + p[1], 0);
    let r = rand() * total;
    for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; }
    return pairs[pairs.length - 1][0];
  },
  bool: (p = 0.5) => rand() < p,
  shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  // Gaussian-ish via central limit, clamped to [min,max]
  normal: (mean, sd, min, max) => {
    let s = 0; for (let i = 0; i < 4; i++) s += rand();
    let v = mean + (s / 4 - 0.5) * 2 * sd * 2;
    return Math.max(min, Math.min(max, v));
  },
};
