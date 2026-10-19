"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";
import type { Phase } from "@/lib/types";
import { celebrations } from "@/lib/events";
import { Knight, type KnightPose } from "./Knight";
import { Campfire } from "./Campfire";
import { PALETTES, PHASES, type Palette } from "./palette";
import {
  SCENE_H,
  TILE,
  bandPath,
  bigTrees,
  bladePath,
  conifer,
  farRidge,
  farRidgeBack,
  fireflySeeds,
  flowers,
  foregroundClumps,
  forestRidge,
  forestTrees,
  groundRidge,
  groundStones,
  hillRidge,
  hillTrees,
  rng,
  ridgePath,
  roadBottom,
  roadTop,
  roadsideTufts,
  roundTree,
  ruinsX,
  stars,
} from "./terrain";

/* Scene geometry: everything is authored in a 1600×900 scene, scaled to cover
   the viewport and anchored to the bottom (like preserveAspectRatio xMidYMax slice). */
interface Metrics {
  vw: number;
  vh: number;
  s: number;
  ox: number;
  oy: number;
}

/** lift: pixels at the bottom kept clear (e.g. the mobile nav); the ground extends beneath it. */
function measure(lift: number): Metrics {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s = Math.max(vw / TILE, (vh - lift) / SCENE_H);
  return { vw, vh, s, ox: (vw - TILE * s) / 2, oy: vh - lift - SCENE_H * s };
}

function useMetrics(lift: number) {
  const [m, setM] = useState<Metrics>(() => measure(lift));
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setM(measure(lift)));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [lift]);
  return m;
}

/** Ground speed in scene units/s — matched to the knight's stride so his feet don't slide. */
const WALK_SPEED = 132;
const FEET_Y = 815;
const KNIGHT_SCALE = 1;

const tint = "tint";

/* ───────────── Scrolling strip ───────────── */

function Strip({
  m,
  factor,
  moving,
  className,
  defs,
  children,
}: {
  m: Metrics;
  factor: number;
  moving: boolean;
  className?: string;
  defs?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`strip ${className ?? ""}`}
      style={{
        left: m.ox - TILE * m.s,
        top: m.oy,
        width: TILE * 3 * m.s,
        height: SCENE_H * m.s,
        animationDuration: `${TILE / (WALK_SPEED * factor)}s`,
        animationPlayState: moving ? "running" : "paused",
      }}
      aria-hidden
    >
      <svg viewBox={`0 0 ${TILE * 3} ${SCENE_H}`} width="100%" height="100%" preserveAspectRatio="none">
        {defs && <defs>{defs}</defs>}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * TILE} 0)`}>
            {children}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Static({ m, className, children }: { m: Metrics; className?: string; children: React.ReactNode }) {
  return (
    <svg
      className={`static-layer ${className ?? ""}`}
      style={{ left: m.ox, top: m.oy, width: TILE * m.s, height: SCENE_H * m.s }}
      viewBox={`0 0 ${TILE} ${SCENE_H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* ───────────── Layer art ───────────── */

const farPath = ridgePath(farRidge);
const farBackPath = ridgePath(farRidgeBack);
const snowClip = (() => {
  const r = rng(17);
  let d = "M0 0 H1600 V516";
  for (let x = 1600 - 40; x > 0; x -= 40) d += ` L${x} ${510 + r() * 16 - (x % 80 === 0 ? 10 : 0)}`;
  return `${d} L0 516 Z`;
})();

const castleSpot = (() => {
  let best = 1000;
  for (let x = 980; x <= 1320; x += 10) if (farRidgeBack.at(x) < farRidgeBack.at(best)) best = x;
  return { x: best, y: farRidgeBack.at(best) + 8 };
})();

const FarLayer = memo(function FarLayer({ p }: { p: Palette }) {
  return (
    <>
      <path d={farPath} className={tint} style={{ fill: p.far }} />
      <g clipPath="url(#snow-clip)">
        <path d={farPath} className={tint} style={{ fill: p.snow }} opacity={0.9} />
      </g>
      <path d={farPath} fill="none" className={tint} style={{ stroke: p.snow }} strokeWidth={1} opacity={0.25} />
    </>
  );
});

function Castle({ p }: { p: Palette }) {
  const { x, y } = castleSpot;
  const win = (wx: number, wy: number) => <rect x={wx} y={wy} width="3" height="5" rx="1.4" className={tint} style={{ fill: p.castleLight }} />;
  return (
    <g transform={`translate(${x} ${y}) scale(0.9)`}>
      <g className={tint} style={{ fill: p.castle }}>
        <rect x="-46" y="-40" width="92" height="40" />
        <path d="M-46 -40 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6" />
        <rect x="-58" y="-70" width="18" height="70" />
        <path d="M-61 -70 L-49 -96 L-37 -70 Z" />
        <rect x="40" y="-62" width="18" height="62" />
        <path d="M37 -62 L49 -86 L61 -62 Z" />
        <rect x="-12" y="-96" width="24" height="96" />
        <path d="M-15 -96 L0 -128 L15 -96 Z" />
        <rect x="-0.8" y="-146" width="1.6" height="20" />
      </g>
      <path className="banner" d="M0.8 -146 L16 -143 L0.8 -138 Z" style={{ fill: "#9a2f2a" }} />
      <g className="castle-lights" style={{ opacity: p === PALETTES.night ? 1 : p === PALETTES.sunset ? 0.75 : 0 }}>
        {win(-2, -80)}
        {win(-2, -60)}
        {win(-51, -52)}
        {win(47, -46)}
        {win(-30, -24)}
        {win(24, -24)}
      </g>
    </g>
  );
}

const HillLayer = memo(function HillLayer({ p }: { p: Palette }) {
  const ry = hillRidge.at(ruinsX);
  return (
    <>
      <path d={ridgePath(hillRidge)} className={tint} style={{ fill: p.hills }} />
      <g className={tint} style={{ fill: p.hillsShade }}>
        {hillTrees.map((t, i) => (
          <path key={i} d={conifer(t.x, t.y, t.h)} />
        ))}
        {/* Ruins of an old chapel */}
        <g transform={`translate(${ruinsX} ${ry + 6})`}>
          <path d="M-46 0 V-38 h4 v-6 h5 v6 h4 V-30 h6 V0 Z" />
          <path d="M-20 0 V-52 C-20 -66 10 -66 10 -52 V0 H3 V-46 C3 -55 -13 -55 -13 -46 V0 Z" />
          <path d="M16 0 V-34 l5 -4 l4 6 V0 Z" />
          <path d="M30 0 V-18 h10 l2 6 V0 Z" />
        </g>
      </g>
    </>
  );
});

const ForestLayer = memo(function ForestLayer({ p }: { p: Palette }) {
  return (
    <>
      <path d={ridgePath(forestRidge)} className={tint} style={{ fill: p.forestDeep }} />
      {forestTrees.map((t, i) => {
        const fill = t.deep ? p.forestDeep : p.forest;
        if (t.round) {
          const rt = roundTree(t.seed, t.x, t.y, t.h * 0.8);
          return (
            <g key={i} className={tint} style={{ fill }}>
              <rect x={rt.trunk.x} y={rt.trunk.y} width={rt.trunk.w} height={rt.trunk.h} />
              {rt.blobs.map((b, j) => (
                <circle key={j} cx={b.cx} cy={b.cy} r={b.r} />
              ))}
            </g>
          );
        }
        return <path key={i} d={conifer(t.x, t.y, t.h)} className={tint} style={{ fill }} />;
      })}
      <rect x="0" y="770" width={TILE} height="130" className={tint} style={{ fill: p.forestDeep }} />
    </>
  );
});

const groundPath = ridgePath(groundRidge);
const road = bandPath(roadTop, roadBottom);
const rut = (offset: number) => {
  let d = "";
  for (let x = 0; x <= TILE; x += 16) d += `${x ? " L" : "M"}${x} ${(roadTop.at(x) * (1 - offset) + roadBottom.at(x) * offset).toFixed(1)}`;
  return d;
};
const ruts = [rut(0.32), rut(0.7)];

const GroundLayer = memo(function GroundLayer({ p }: { p: Palette }) {
  return (
    <>
      <path d={groundPath} className={tint} style={{ fill: p.ground }} />
      {bigTrees.map((t, i) => (
        <g key={i}>
          <path
            d={`M${t.trunk.x - 6} ${t.trunk.y + t.trunk.h} C${t.trunk.x + 2} ${t.trunk.y + t.trunk.h - 18} ${t.trunk.x + 4} ${t.trunk.y + 40} ${t.trunk.x + 2} ${t.trunk.y} h${t.trunk.w + 4} C${t.trunk.x + t.trunk.w + 4} ${t.trunk.y + 40} ${t.trunk.x + t.trunk.w + 6} ${t.trunk.y + t.trunk.h - 18} ${t.trunk.x + t.trunk.w + 16} ${t.trunk.y + t.trunk.h} Z`}
            className={tint}
            style={{ fill: p.trunk }}
          />
          {t.blobs.map((b, j) => (
            <circle key={j} cx={b.cx} cy={b.cy} r={b.r} className={tint} style={{ fill: p.canopy }} />
          ))}
          {t.blobs.slice(0, 4).map((b, j) => (
            <circle key={`h${j}`} cx={b.cx - b.r * 0.22} cy={b.cy - b.r * 0.26} r={b.r * 0.55} className={tint} style={{ fill: p.canopyLight }} opacity={0.55} />
          ))}
        </g>
      ))}
      <path d={road} className={tint} style={{ fill: p.path }} />
      {ruts.map((d, i) => (
        <path key={i} d={d} fill="none" className={tint} style={{ stroke: p.pathShade }} strokeWidth={2.2} strokeDasharray="60 22 30 40" opacity={0.6} />
      ))}
      <rect x="0" y="872" width={TILE} height="28" className={tint} style={{ fill: p.groundShade }} opacity={0.6} />
      {groundStones.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} className={tint} style={{ fill: p.stone }} />
      ))}
      {roadsideTufts.map((t, i) => (
        <g key={i} className={tint} style={{ fill: p.grassDeep }}>
          <path d={bladePath(t.x, t.y, t.h, t.flip ? -5 : 5, 2)} />
          <path d={bladePath(t.x + 4, t.y, t.h * 0.75, t.flip ? -2 : 7, 1.8)} />
          <path d={bladePath(t.x - 4, t.y, t.h * 0.6, t.flip ? -7 : 2, 1.6)} />
        </g>
      ))}
      {flowers.map((f, i) => (
        <g key={i}>
          <path d={`M${f.x} ${f.y} v${f.s * 2.6}`} className={tint} style={{ stroke: p.grassDeep }} strokeWidth={0.9} />
          <circle cx={f.x} cy={f.y} r={f.s} fill={f.c} opacity={p === PALETTES.night ? 0.35 : 0.95} className={tint} />
        </g>
      ))}
    </>
  );
});

const ForegroundLayer = memo(function ForegroundLayer({ p }: { p: Palette }) {
  return (
    <>
      {foregroundClumps.map((c, i) => (
        <g key={i} className={`sway sway-${c.variant}`} style={{ transformOrigin: `${c.x}px 900px` }}>
          {Array.from({ length: c.blades }, (_, b) => {
            const off = (b - (c.blades - 1) / 2) * (c.spread / c.blades);
            return (
              <path
                key={b}
                d={bladePath(c.x + off, 902, c.h * (0.7 + ((b * 37) % 10) / 30), off * 0.9 + 4, 3.2)}
                className={tint}
                style={{ fill: b % 2 ? p.grass : p.grassDeep }}
              />
            );
          })}
        </g>
      ))}
    </>
  );
});

/* ───────────── Sky ───────────── */

const SUN: Record<Phase, { x: number; y: number; r: number; o: number }> = {
  morning: { x: 330, y: 250, r: 44, o: 1 },
  afternoon: { x: 840, y: 130, r: 38, o: 1 },
  sunset: { x: 1180, y: 520, r: 64, o: 1 },
  night: { x: 1240, y: 980, r: 60, o: 0 },
};

const CLOUDS = (() => {
  const r = rng(5);
  return Array.from({ length: 7 }, (_, i) => ({
    y: 90 + r() * 260,
    scale: 0.6 + r() * 0.9,
    dur: 160 + r() * 140,
    delay: -r() * 300,
    v: i % 3,
  }));
})();

function Cloud({ v }: { v: number }) {
  if (v === 0)
    return (
      <>
        <ellipse cx="0" cy="0" rx="90" ry="20" />
        <ellipse cx="-30" cy="-14" rx="40" ry="22" />
        <ellipse cx="22" cy="-18" rx="46" ry="26" />
      </>
    );
  if (v === 1)
    return (
      <>
        <ellipse cx="0" cy="0" rx="130" ry="14" />
        <ellipse cx="30" cy="-10" rx="60" ry="16" />
      </>
    );
  return (
    <>
      <ellipse cx="0" cy="0" rx="70" ry="16" />
      <ellipse cx="-12" cy="-12" rx="34" ry="18" />
      <ellipse cx="22" cy="-8" rx="30" ry="14" />
    </>
  );
}

function Sky({ m, phase, p, motionOn }: { m: Metrics; phase: Phase; p: Palette; motionOn: boolean }) {
  const sun = SUN[phase];
  const night = phase === "night";
  return (
    <Static m={m} className="sky-layer">
      <defs>
        <radialGradient id="sun-glow">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#ffe4a8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd08a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-glow">
          <stop offset="0" stopColor="#dfe6ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#9fb0e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shoot" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <g className="stars" style={{ opacity: night ? 1 : phase === "sunset" ? 0.15 : 0 }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#f4f1ff" className={`twinkle twinkle-${s.v}`} style={{ animationDelay: `${-s.d}s` }} />
        ))}
        {motionOn && night && <path className="shooting-star" d="M0 0 L140 0" stroke="url(#shoot)" strokeWidth="1.6" strokeLinecap="round" />}
      </g>

      <g className="celestial" style={{ transform: `translate(${sun.x}px, ${sun.y}px)`, opacity: sun.o }}>
        <circle r={sun.r * 5} fill="url(#sun-glow)" opacity={phase === "sunset" ? 1 : 0.7} />
        <circle r={sun.r} fill={phase === "sunset" ? "#ffcf8c" : "#fff8e4"} className={tint} />
      </g>

      <g className="celestial" style={{ transform: `translate(900px, ${night ? 150 : -120}px)`, opacity: night ? 1 : 0 }}>
        <circle r="150" fill="url(#moon-glow)" />
        <mask id="moon-cut">
          <rect x="-40" y="-40" width="80" height="80" fill="#fff" />
          <circle cx="13" cy="-9" r="26" fill="#000" />
        </mask>
        <g mask="url(#moon-cut)">
          <circle r="30" fill="#eef0f8" />
          <circle cx="-16" cy="8" r="3.2" fill="#cfd5e6" />
          <circle cx="-9" cy="19" r="2.2" fill="#cfd5e6" />
        </g>
      </g>

      <g style={{ opacity: p.cloudOpacity }} className={tint}>
        {CLOUDS.map((c, i) => (
          <g key={i} className="cloud" style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
            <g transform={`translate(0 ${c.y}) scale(${c.scale})`} className={tint} style={{ fill: p.cloud }}>
              <Cloud v={c.v} />
            </g>
          </g>
        ))}
      </g>
    </Static>
  );
}

const SKY_GRADIENT = (p: Palette) => `linear-gradient(180deg, ${p.sky[0]} 0%, ${p.sky[1]} 38%, ${p.sky[2]} 66%, ${p.sky[3]} 82%)`;

/* ───────────── Particles ───────────── */

const LEAVES = (() => {
  const r = rng(91);
  return Array.from({ length: 7 }, () => ({ x: 400 + r() * 1300, dur: 13 + r() * 9, delay: -r() * 22, s: 0.7 + r() * 0.6, hue: r() < 0.5 ? "#a8b356" : "#c98d3c" }));
})();

function Particles({ m, phase }: { m: Metrics; phase: Phase }) {
  const night = phase === "night";
  const dusk = phase === "sunset";
  return (
    <Static m={m} className="particles">
      <defs>
        <radialGradient id="firefly">
          <stop offset="0" stopColor="#fff7c2" />
          <stop offset="0.3" stopColor="#f2e27a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#d6c94a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g style={{ opacity: night ? 1 : dusk ? 0.6 : 0 }} className="fade-slow">
        {fireflySeeds.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.s * 3} fill="url(#firefly)" className={`firefly firefly-${f.v}`} style={{ animationDelay: `${-f.d}s` }} />
        ))}
      </g>
      <g style={{ opacity: night ? 0 : 1 }} className="fade-slow">
        {LEAVES.map((l, i) => (
          <g key={i} className="leaf" style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s`, "--x0": `${l.x}px` } as React.CSSProperties}>
            <path className="leaf-spin" d="M0 0 C4 -6 12 -6 14 0 C12 6 4 6 0 0 Z" fill={l.hue} transform={`scale(${l.s})`} style={{ animationDuration: `${l.dur / 5}s` }} />
          </g>
        ))}
      </g>
    </Static>
  );
}

/* ───────────── Celebration burst on the knight ───────────── */

function Burst({ x, y, size }: { x: number; y: number; size: number }) {
  const sparks = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2 + 0.3, d: 0.55 + (i % 3) * 0.12 })), []);
  return (
    <motion.div className="pointer-events-none absolute" style={{ left: x, top: y, width: 0, height: 0 }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.2, duration: 0.8 }}>
      <motion.div
        className="absolute rounded-full"
        style={{ left: -size / 2, top: -size / 2, width: size, height: size, background: "radial-gradient(circle, rgba(255,226,150,.55), rgba(255,200,90,0) 65%)" }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1.25, opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
      {sparks.map((s, i) => (
        <motion.svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left: -7, top: -7 }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: Math.cos(s.a) * size * s.d * 0.6, y: Math.sin(s.a) * size * s.d * 0.6 - 10, scale: [0, 1.2, 0.6], opacity: [1, 1, 0] }}
          transition={{ duration: 1.3, ease: "easeOut", delay: i * 0.02 }}
        >
          <path d="M12 2c.8 5.6 3.4 8.2 10 10-6.6 1.8-9.2 4.4-10 10-.8-5.6-3.4-8.2-10-10 6.6-1.8 9.2-4.4 10-10z" fill="#ffe3a0" />
        </motion.svg>
      ))}
    </motion.div>
  );
}

/* ───────────── World ───────────── */

export interface WorldProps {
  phase: Phase;
  /** Where the knight should stand, as a fraction of the unobstructed width. */
  anchor: number;
  /** Pixels on the right covered by UI (e.g. the quest panel). */
  reserveRight?: number;
  /** Pixels at the bottom covered by UI; the scene sits above them. */
  lift?: number;
  motionOn: boolean;
}

export function World({ phase, anchor, reserveRight = 0, lift = 0, motionOn }: WorldProps) {
  const m = useMetrics(lift);
  const p = PALETTES[phase];
  const night = phase === "night";
  // Let dusk settle before the knight stops and sits; he stands as soon as day returns.
  const [pose, setPose] = useState<KnightPose>(night ? "sit" : "walk");
  useEffect(() => {
    const t = window.setTimeout(() => setPose(night ? "sit" : "walk"), motionOn && night ? 1600 : 0);
    return () => window.clearTimeout(t);
  }, [night, motionOn]);
  const moving = motionOn && pose === "walk";
  const [burst, setBurst] = useState(0);

  useEffect(() => celebrations.on(() => setBurst((b) => b + 1)), []);

  // Convert the desired screen position into scene units, kept inside the visible slice.
  const visMin = -m.ox / m.s + 110;
  const visMax = (m.vw - m.ox) / m.s - (night ? 260 : 110);
  const knightX = Math.min(Math.max((anchor * (m.vw - reserveRight) - m.ox) / m.s, visMin), Math.max(visMin, visMax));
  const fireX = knightX + 150;

  const kLeft = m.ox + (knightX - 80 * KNIGHT_SCALE) * m.s;
  const kTop = m.oy + (FEET_Y - 208 * KNIGHT_SCALE) * m.s;
  const kW = 160 * KNIGHT_SCALE * m.s;
  const kH = 220 * KNIGHT_SCALE * m.s;

  const style = {
    "--kq-rim": p.rim,
    "--kq-rim-o": p.rimOpacity,
    "--kq-grade": p.knightGrade,
  } as React.CSSProperties;

  return (
    <div className={`world world--${phase}`} style={style} aria-hidden>
      {PHASES.map((ph) => (
        <div key={ph} className="sky-fill" style={{ background: SKY_GRADIENT(PALETTES[ph]), opacity: ph === phase ? 1 : 0 }} />
      ))}
      <Sky m={m} phase={phase} p={p} motionOn={motionOn} />

      <Static m={m}>
        <path d={farBackPath} className={tint} style={{ fill: p.far }} opacity={0.5} />
        <Castle p={p} />
      </Static>

      <Strip
        m={m}
        factor={0.05}
        moving={moving}
        defs={
          <clipPath id="snow-clip">
            <path d={snowClip} />
          </clipPath>
        }
      >
        <FarLayer p={p} />
      </Strip>

      <Static m={m}>
        <defs>
          <linearGradient id="mist-high" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.fog} stopOpacity="0" className={tint} />
            <stop offset="0.6" stopColor={p.fog} stopOpacity="0.85" className={tint} />
            <stop offset="1" stopColor={p.fog} stopOpacity="0" className={tint} />
          </linearGradient>
        </defs>
        <rect x="0" y="540" width={TILE} height="170" fill="url(#mist-high)" opacity={p.fogOpacity} className={`${tint} mist`} />
      </Static>

      <Strip m={m} factor={0.14} moving={moving}>
        <HillLayer p={p} />
      </Strip>

      <Strip m={m} factor={0.34} moving={moving}>
        <ForestLayer p={p} />
      </Strip>

      <Static m={m}>
        <defs>
          <linearGradient id="mist-low" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.fog} stopOpacity="0" className={tint} />
            <stop offset="0.7" stopColor={p.fog} stopOpacity="0.7" className={tint} />
            <stop offset="1" stopColor={p.fog} stopOpacity="0" className={tint} />
          </linearGradient>
        </defs>
        <rect x="-200" y="680" width={TILE + 400} height="110" fill="url(#mist-low)" opacity={p.fogOpacity * 0.9} className={`${tint} mist mist--drift`} />
      </Static>

      <Strip m={m} factor={1} moving={moving}>
        <GroundLayer p={p} />
      </Strip>

      <Static m={m} className="camp-layer">
        <AnimatePresence>
          {night && (
            <motion.g key="camp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2.4 }}>
              <g className="camp-pos" style={{ transform: `translate(${fireX}px, ${FEET_Y - 4}px)` }}>
                <Campfire animate={motionOn} />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </Static>

      <div className="knight-wrap" style={{ left: kLeft, top: kTop, width: kW, height: kH }} data-light={night ? "fire" : "sun"}>
        <Knight pose={pose} animate={motionOn} />
      </div>

      <Strip m={m} factor={1.32} moving={moving} className="foreground">
        <ForegroundLayer p={p} />
      </Strip>

      {lift > 0 && <div className="absolute inset-x-0 bottom-0 transition-colors duration-[4500ms]" style={{ top: m.oy + SCENE_H * m.s - 1, background: p.groundShade }} />}

      <Particles m={m} phase={phase} />

      <div
        className="firelight"
        style={{
          left: m.ox + fireX * m.s,
          top: m.oy + (FEET_Y - 40) * m.s,
          width: 900 * m.s,
          height: 900 * m.s,
          opacity: night ? 1 : 0,
        }}
      >
        <div className="firelight__glow" />
      </div>
      <div className="grade" style={{ opacity: phase === "sunset" ? 1 : phase === "morning" ? 0.45 : 0 }} />
      <div className="vignette" style={{ opacity: night ? 1 : 0.55 }} />

      <AnimatePresence>
        {burst > 0 && <Burst key={burst} x={kLeft + kW / 2} y={kTop + kH * 0.42} size={kH * 1.4} />}
      </AnimatePresence>
    </div>
  );
}
