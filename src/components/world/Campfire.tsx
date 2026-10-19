"use client";

import { memo } from "react";
import { rng } from "./terrain";

const EMBERS = (() => {
  const r = rng(211);
  return Array.from({ length: 16 }, () => ({
    x: -14 + r() * 28,
    dx: -40 + r() * 80,
    rise: 120 + r() * 120,
    d: r() * 4,
    t: 2.4 + r() * 2.2,
    s: 0.9 + r() * 1.3,
  }));
})();

const OUTER = [
  "M-26 0 C-30 -18 -20 -30 -14 -42 C-10 -50 -8 -60 -2 -74 C2 -58 8 -52 14 -42 C20 -32 30 -20 26 0 Z",
  "M-26 0 C-32 -16 -22 -32 -16 -46 C-12 -54 -4 -64 3 -80 C4 -62 10 -50 16 -40 C22 -30 30 -18 26 0 Z",
  "M-26 0 C-28 -20 -18 -28 -12 -40 C-8 -48 -11 -58 -6 -70 C1 -57 6 -50 12 -44 C20 -34 28 -22 26 0 Z",
];
const values = (shift: number) => [...OUTER.slice(shift), ...OUTER.slice(0, shift), OUTER[shift]].join(";");

function CampfireImpl({ animate }: { animate: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="fire-ground" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb05a" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ff8a3a" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ff7a2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c8331f" />
          <stop offset="0.6" stopColor="#ec6a2c" />
          <stop offset="1" stopColor="#f59a3c" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="flame-mid" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f07a2e" />
          <stop offset="1" stopColor="#ffc053" />
        </linearGradient>
        <linearGradient id="flame-core" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd77a" />
          <stop offset="1" stopColor="#fff6cf" />
        </linearGradient>
      </defs>

      <ellipse cx="0" cy="4" rx="190" ry="30" fill="url(#fire-ground)" className="fire-flicker" />

      {/* Kettle resting on a flat stone */}
      <g transform="translate(64 2)">
        <ellipse cx="0" cy="0" rx="15" ry="4" fill="#3c4045" />
        <path d="M-10 -1 C-12 -14 -8 -20 0 -20 C8 -20 12 -14 10 -1 Z" fill="#4a4f55" stroke="#22252a" strokeWidth="0.8" />
        <path d="M-9 -16 C-9 -28 9 -28 9 -16" stroke="#2a2d31" strokeWidth="1.6" fill="none" />
        <path d="M10 -9 L18 -14" stroke="#4a4f55" strokeWidth="3" strokeLinecap="round" />
        <path className="k-rim" d="M-10.5 -4 C-11.8 -10 -10.6 -15 -7 -18" fill="none" strokeWidth="1.2" />
      </g>

      {/* Ring of stones */}
      {[
        [-34, 1, 9, 6],
        [-22, 6, 10, 6.5],
        [-6, 8, 10, 6],
        [10, 8, 10, 6.5],
        [26, 5, 10, 6],
        [36, 0, 8, 5.5],
        [-28, -3, 7, 4.5],
        [30, -3, 7, 4.5],
      ].map(([x, y, rx, ry]) => (
        <ellipse key={`${x}`} cx={x} cy={y} rx={rx} ry={ry} fill="#4e5156" stroke="#2b2d31" strokeWidth="0.8" />
      ))}

      {/* Logs */}
      <rect x="-30" y="-8" width="60" height="10" rx="5" fill="#4b3322" transform="rotate(-14)" />
      <rect x="-30" y="-8" width="60" height="10" rx="5" fill="#5a3d28" transform="rotate(16)" />
      <ellipse cx="-28.6" cy="4" rx="3.4" ry="5" fill="#a07650" transform="rotate(16)" />

      {/* Flames */}
      <g className="flames">
        <path d={OUTER[0]} fill="url(#flame-outer)">
          {animate && <animate attributeName="d" dur="0.9s" repeatCount="indefinite" values={values(0)} />}
        </path>
        <path d={OUTER[1]} fill="url(#flame-mid)" transform="translate(0 0) scale(0.68 0.7)">
          {animate && <animate attributeName="d" dur="0.72s" repeatCount="indefinite" values={values(1)} />}
        </path>
        <path d={OUTER[2]} fill="url(#flame-core)" transform="translate(1 0) scale(0.38 0.42)">
          {animate && <animate attributeName="d" dur="0.55s" repeatCount="indefinite" values={values(2)} />}
        </path>
      </g>
      <ellipse cx="0" cy="-2" rx="22" ry="5" fill="#ffcf7a" opacity="0.55" className="fire-flicker" />

      {/* Embers */}
      {animate &&
        EMBERS.map((e, i) => (
          <circle
            key={i}
            className="ember"
            cx={e.x}
            cy={-18}
            r={e.s}
            style={{ "--dx": `${e.dx}px`, "--rise": `${-e.rise}px`, animationDelay: `${-e.d}s`, animationDuration: `${e.t}s` } as React.CSSProperties}
          />
        ))}
    </g>
  );
}

export const Campfire = memo(CampfireImpl);
