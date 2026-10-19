/**
 * Procedural, seamlessly tiling vector terrain. Every layer is a 1600×900 tile
 * whose left and right edges match (integer-period sine sums), so three copies
 * side by side can scroll forever without a visible seam.
 */
export const TILE = 1600;
export const SCENE_H = 900;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Wave = [amp: number, period: number, sharp?: number];

export interface Ridge {
  ys: number[];
  step: number;
  at: (x: number) => number;
}

export function ridge(seed: number, base: number, waves: Wave[], step = 10): Ridge {
  const r = rng(seed);
  const phases = waves.map(() => r() * Math.PI * 2);
  const f = (x: number) => {
    let y = base;
    waves.forEach(([amp, k, sharp], i) => {
      const s = Math.sin((2 * Math.PI * k * x) / TILE + phases[i]);
      y -= sharp ? amp * Math.pow((s + 1) / 2, sharp) : amp * s;
    });
    return y;
  };
  const ys: number[] = [];
  for (let x = 0; x <= TILE; x += step) ys.push(f(x));
  return { ys, step, at: f };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function ridgePath(rd: Ridge, bottom = SCENE_H): string {
  let d = `M0 ${bottom} L0 ${r1(rd.ys[0])}`;
  rd.ys.forEach((y, i) => {
    if (i) d += ` L${i * rd.step} ${r1(y)}`;
  });
  return `${d} L${TILE} ${bottom} Z`;
}

/** Closed band between two ridges (used for the dirt road). */
export function bandPath(top: Ridge, bottom: Ridge): string {
  let d = `M0 ${r1(top.ys[0])}`;
  top.ys.forEach((y, i) => {
    if (i) d += ` L${i * top.step} ${r1(y)}`;
  });
  for (let i = bottom.ys.length - 1; i >= 0; i--) d += ` L${i * bottom.step} ${r1(bottom.ys[i])}`;
  return `${d} Z`;
}

/* ───────────── Trees ───────────── */

export function conifer(x: number, baseY: number, h: number, w = h * 0.42): string {
  // Three stacked tiers with slightly ragged edges.
  const tiers = 3;
  let d = "";
  for (let i = 0; i < tiers; i++) {
    const tTop = baseY - h + (h * i) / (tiers + 0.6);
    const tBot = baseY - h * 0.12 - (h * (tiers - 1 - i)) / (tiers + 2.4);
    const half = (w / 2) * (0.62 + (i * 0.38) / (tiers - 1));
    d += `M${r1(x)} ${r1(tTop)} L${r1(x + half)} ${r1(tBot)} L${r1(x + half * 0.35)} ${r1(tBot - h * 0.03)} L${r1(x)} ${r1(tBot + h * 0.015)} L${r1(x - half * 0.35)} ${r1(tBot - h * 0.03)} L${r1(x - half)} ${r1(tBot)} Z `;
  }
  d += `M${r1(x - w * 0.05)} ${r1(baseY - h * 0.14)} h${r1(w * 0.1)} V${r1(baseY)} h${r1(-w * 0.1)} Z`;
  return d;
}

/** Rounded deciduous canopy built from overlapping circles. */
export function roundTree(seed: number, x: number, baseY: number, h: number) {
  const r = rng(seed);
  const crown = h * 0.62;
  const cy = baseY - h + crown * 0.55;
  const blobs: { cx: number; cy: number; r: number }[] = [];
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r();
    const dist = crown * 0.28 * (0.6 + r() * 0.5);
    blobs.push({ cx: x + Math.cos(a) * dist * 1.2, cy: cy + Math.sin(a) * dist * 0.75, r: crown * (0.28 + r() * 0.14) });
  }
  blobs.push({ cx: x, cy, r: crown * 0.4 });
  return { blobs, trunk: { x: x - h * 0.03, y: cy + crown * 0.2, w: h * 0.06, h: baseY - (cy + crown * 0.2) } };
}

/* ───────────── Layer content (memoised once per module) ───────────── */

function scatter(seed: number, count: number, margin: number) {
  const r = rng(seed);
  const xs: number[] = [];
  const span = TILE - margin * 2;
  for (let i = 0; i < count; i++) xs.push(margin + ((i + r() * 0.8) / count) * span);
  return { xs, r };
}

// Far mountains
export const farRidge = ridge(11, 646, [[132, 3, 2.4], [56, 7, 1.6], [22, 13]], 8);
export const farRidgeBack = ridge(29, 590, [[120, 2, 2], [44, 5, 1.5], [14, 17]], 10);

// Hills with ruins and sparse pines
export const hillRidge = ridge(41, 668, [[34, 2], [20, 5], [8, 11]], 10);
export const hillTrees = (() => {
  const { xs, r } = scatter(47, 26, 60);
  return xs
    .filter((x) => x < 940 || x > 1180)
    .map((x) => ({ x, y: hillRidge.at(x) + 4, h: 26 + r() * 30 }));
})();
export const ruinsX = 1060;

// Mid forest band
export const forestRidge = ridge(53, 742, [[16, 3], [9, 7]], 10);
export const forestTrees = (() => {
  const { xs, r } = scatter(59, 70, 50);
  return xs.map((x, i) => ({
    x,
    y: forestRidge.at(x) + 10,
    h: 70 + r() * 90,
    round: r() < 0.28,
    seed: 100 + i,
    deep: r() < 0.5,
  }));
})();

// Ground and road
export const groundRidge = ridge(61, 768, [[6, 4], [3, 9]], 16);
export const roadTop = ridge(67, 792, [[4, 3], [2, 8]], 16);
export const roadBottom = ridge(71, 842, [[5, 2], [3, 7]], 16);

export const groundStones = (() => {
  const { xs, r } = scatter(73, 16, 40);
  return xs.map((x) => {
    const onRoadEdge = r() < 0.45;
    const y = onRoadEdge ? roadBottom.at(x) + 4 + r() * 10 : 860 + r() * 30;
    return { x, y, rx: 5 + r() * 9, ry: 3 + r() * 5 };
  });
})();

export const flowers = (() => {
  const { xs, r } = scatter(79, 44, 30);
  const colors = ["#e9d8a6", "#d9675a", "#f2efe6", "#b9a4d8", "#e7b04f"];
  return xs.map((x) => {
    const far = r() < 0.45;
    return {
      x,
      y: far ? groundRidge.at(x) + 8 + r() * 14 : roadBottom.at(x) + 14 + r() * 36,
      s: far ? 1.6 + r() * 1.2 : 2.4 + r() * 1.8,
      c: colors[Math.floor(r() * colors.length)],
    };
  });
})();

export const roadsideTufts = (() => {
  const { xs, r } = scatter(83, 38, 30);
  return xs.map((x) => ({ x, y: r() < 0.5 ? roadTop.at(x) + 2 : roadBottom.at(x) + 3, h: 8 + r() * 12, flip: r() < 0.5 }));
})();

export const bigTrees = [
  { ...roundTree(301, 430, 780, 380), x: 430 },
  { ...roundTree(307, 1240, 776, 300), x: 1240 },
];

export const foregroundClumps = (() => {
  const { xs, r } = scatter(97, 30, 40);
  return xs.map((x, i) => ({
    x,
    h: 22 + r() * 40,
    blades: 3 + Math.floor(r() * 3),
    spread: 10 + r() * 14,
    variant: i % 3,
  }));
})();

/** A curved grass blade as a filled sliver. */
export function bladePath(x: number, base: number, h: number, lean: number, w = 3): string {
  const tipX = x + lean;
  const tipY = base - h;
  return `M${r1(x - w)} ${base} Q${r1(x - w * 0.4 + lean * 0.3)} ${r1(base - h * 0.55)} ${r1(tipX)} ${r1(tipY)} Q${r1(x + w * 0.6 + lean * 0.3)} ${r1(base - h * 0.5)} ${r1(x + w)} ${base} Z`;
}

/* ───────────── Sky ───────────── */

export const stars = (() => {
  const r = rng(131);
  return Array.from({ length: 140 }, (_, i) => ({
    x: r() * TILE,
    y: r() * 520,
    s: r() < 0.08 ? 1.9 : 0.6 + r() * 1.1,
    v: i % 4,
    d: r() * 6,
  }));
})();

export const fireflySeeds = (() => {
  const r = rng(151);
  return Array.from({ length: 22 }, (_, i) => ({ x: 120 + r() * 1360, y: 640 + r() * 200, v: i % 3, d: r() * 9, s: 1.6 + r() * 1.6 }));
})();
