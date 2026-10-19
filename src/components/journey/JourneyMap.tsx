"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { MILESTONES, journeyPosition, type MilestoneKind } from "@/lib/progress";

const W = 640;
const H = 150;
const ROAD = "M24 112 C90 112 96 52 160 52 S238 116 300 104 S372 34 440 44 S520 118 572 96 S610 54 620 40";

function Landmark({ kind, reached }: { kind: MilestoneKind; reached: boolean }) {
  const c = reached ? "#3a2c1d" : "#a08c68";
  switch (kind) {
    case "forest":
      return <path d="M0 -26 L8 -10 H4 L10 0 H-10 L-4 -10 H-8 Z" fill={c} />;
    case "ruins":
      return <path d="M-11 0 V-16 h4 v-4 h3 v20 Z M2 0 V-22 C2 -28 11 -28 11 -22 V0 H8 V-20 C8 -23 5 -23 5 -20 V0 Z" fill={c} />;
    case "river":
      return <path d="M-13 -6 C-8 -10 -4 -2 0 -6 S8 -10 13 -6 M-13 -1 C-8 -5 -4 3 0 -1 S8 -5 13 -1" stroke={c} strokeWidth="2" fill="none" />;
    case "tower":
      return <path d="M-5 0 V-20 h-2 v-4 h3 v2 h2 v-2 h4 v2 h2 v-2 h3 v4 h-2 V0 Z" fill={c} />;
    case "mountain":
      return <path d="M-14 0 L-4 -20 L1 -12 L5 -17 L14 0 Z" fill={c} />;
    case "castle":
      return <path d="M-14 0 V-14 h4 v-4 h3 v4 h2 V-24 L0 -30 L5 -24 V-14 h2 v-4 h3 v4 h4 V0 Z" fill={c} />;
    default:
      return <path d="M0 -24 V0 M0 -22 L10 -18 L0 -14 M0 -18 L-9 -15 L0 -12" stroke={c} strokeWidth="1.8" fill="none" />;
  }
}

/** Winding road with the knight's marker placed by total XP. */
export function JourneyMap({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [marker, setMarker] = useState({ x: 24, y: 112 });
  const pos = journeyPosition(xp);

  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    setPoints(MILESTONES.map((_, i) => p.getPointAtLength((len * i) / (MILESTONES.length - 1))));
    const m = p.getPointAtLength(len * pos.overall);
    setMarker({ x: m.x, y: m.y });
  }, [pos.overall]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Journey progress: ${Math.round(pos.overall * 100)}% of the known road, at ${pos.current.name}`}>
      <path d={ROAD} fill="none" stroke="rgba(110,82,40,.22)" strokeWidth={compact ? 9 : 11} strokeLinecap="round" />
      <path ref={pathRef} d={ROAD} fill="none" stroke="rgba(110,82,40,.45)" strokeWidth="1.6" strokeDasharray="5 6" strokeLinecap="round" />
      <motion.path
        d={ROAD}
        fill="none"
        stroke="#8c2c28"
        strokeWidth="2.6"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: Math.max(0.001, pos.overall) }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {points.map((pt, i) => {
        const m = MILESTONES[i];
        const reached = xp >= m.xp;
        return (
          <g key={m.name} transform={`translate(${pt.x} ${pt.y})`}>
            <g transform="translate(0 -9)">
              <Landmark kind={m.kind} reached={reached} />
            </g>
            <circle r="4" fill={reached ? "#8c2c28" : "#e9dcc0"} stroke={reached ? "#5e1c19" : "#a08c68"} strokeWidth="1.4" />
            {!compact && (i === pos.index || i === pos.index + 1) && (
              <text
                y={i === pos.index ? 22 : -45}
                x={i === 0 ? -6 : i === MILESTONES.length - 1 ? 6 : 0}
                textAnchor={i === 0 ? "start" : i === MILESTONES.length - 1 ? "end" : "middle"} className="font-display" fontSize="10.5" fill={reached ? "#3a2c1d" : "#8a7860"} letterSpacing="0.4">
                {m.name.replace(/^The /, "")}
              </text>
            )}
          </g>
        );
      })}
      <motion.g initial={false} animate={{ x: marker.x, y: marker.y }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}>
        <g transform="translate(0 -4)">
          <circle r="11" fill="#f3e9cf" stroke="#3a2c1d" strokeWidth="1.4" />
          <path d="M-5.5 4 V-2 C-5.5 -6 -3 -7.5 0 -7.5 S5.5 -6 5.5 -2 V4 Z" fill="#8f9ba7" stroke="#2a2f35" strokeWidth="0.9" />
          <path d="M-5.5 -2.5 H5.5" stroke="#c9a24a" strokeWidth="1.4" />
          <rect x="-1" y="-1.6" width="6" height="1.6" rx="0.6" fill="#111" />
        </g>
      </motion.g>
    </svg>
  );
}
