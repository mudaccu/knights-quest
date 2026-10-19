"use client";

import { memo } from "react";

export type KnightPose = "walk" | "sit";

/*
 * A rigged vector knight. Each limb is its own group with a pivot (hip, knee,
 * shoulder, elbow, neck) so CSS keyframes in world.css drive a real walk cycle,
 * and the same rig eases into a seated pose by the campfire at night.
 *
 * Rig coordinates (viewBox 160×220): hip 80,118 · knee 81,160 · shoulder 80,72 ·
 * elbow 80,98 · neck 80,62 · sole line y=208.
 */

const C = {
  edge: "#262b31",
  steelLight: "#c9d1d8",
  steelDark: "#4b545e",
  slit: "#0a0c0f",
  goldPip: "#f0d48a",
  leather: "#6b4a2d",
  leatherDark: "#3d2a1a",
  grip: "#3a271a",
  bark: "#5a3f2b",
  barkDark: "#3e2a1c",
  wood: "#b88d5d",
};

function Leg({ side }: { side: "front" | "back" }) {
  const steel = side === "front" ? "url(#kq-steel)" : "url(#kq-steel-back)";
  return (
    <g className={`kp k-thigh k-thigh--${side}`}>
      <g transform="matrix(1.2 0 0 1 -16 0)">
      <path d="M71 116 C71 111.5 90 111.5 90.5 116 L89.5 152 C89 156.5 72.5 156.5 72 152 Z" fill={steel} stroke={C.edge} strokeWidth="0.8" />
      <rect x="83" y="118" width="3" height="31" rx="1.5" fill="#f2f6f9" opacity={side === "front" ? 0.38 : 0.16} />
      <g className={`kp k-shin k-shin--${side}`}>
        <path d="M73.5 163 H88.5 C89.6 172 89.6 184 88 195 H74.5 C73 184 72.8 172 73.5 163 Z" fill={steel} stroke={C.edge} strokeWidth="0.8" />
        <rect x="83.4" y="166" width="2.6" height="25" rx="1.3" fill="#f2f6f9" opacity={side === "front" ? 0.36 : 0.14} />
        <path
          d="M72 192.5 H88.5 C94 194 99.5 199 101.5 205 L101.5 208.5 H71.5 Z"
          fill={steel}
          stroke={C.edge}
          strokeWidth="0.8"
        />
        <path d="M86 196.2 C90.5 197 94.6 199.4 97 202.6 M80 194.6 C84 195 87 196 89.5 197.6" stroke={C.steelDark} strokeWidth="0.9" fill="none" />
        <path d="M71.5 208.5 H101.5" stroke="#1d2126" strokeWidth="2" />
        {side === "front" && <path className="k-rim" d="M89.2 166 C89.8 176 89.5 186 88 194.5 M95 196.5 C98 199 100.4 202 101.4 205.5" fill="none" strokeWidth="1.4" strokeLinecap="round" />}
      </g>
      {/* Poleyn (knee cop) */}
      <ellipse cx="81.5" cy="159.5" rx="9.4" ry="7.4" fill={steel} stroke={C.edge} strokeWidth="0.8" />
      <path d="M72.6 157 C70.4 161 71 165.4 74.4 167.2" stroke={C.edge} strokeWidth="0.8" fill={side === "front" ? C.steelLight : C.steelDark} />
      <circle cx="83" cy="159" r="1.1" fill={side === "front" ? C.goldPip : "#9b8150"} />
      {side === "front" && <path className="k-rim" d="M90.3 120 L89.3 151 M90.6 157 C91 160 90.6 162.4 89.6 164" fill="none" strokeWidth="1.4" strokeLinecap="round" />}
      </g>
    </g>
  );
}

function Arm({ side }: { side: "front" | "back" }) {
  const steel = side === "front" ? "url(#kq-steel)" : "url(#kq-steel-back)";
  const front = side === "front";
  return (
    <g className={`kp k-arm k-arm--${side}`}>
      <g transform="matrix(1.16 0 0 1 -12.8 0)">
      <rect x="74.5" y="76" width="11" height="22" rx="4.5" fill={steel} stroke={C.edge} strokeWidth="0.8" />
      <g className={`kp k-forearm k-forearm--${side}`}>
        <path d="M74.8 100 H85.6 L85 117.5 H75.5 Z" fill={steel} stroke={C.edge} strokeWidth="0.8" />
        <path d="M73.6 115.6 H86.8 L88 121.2 H72.8 Z" fill={front ? C.steelLight : "#7b8691"} stroke={C.edge} strokeWidth="0.8" />
        <path
          d="M74 121 H87.4 C89 125 88 130.2 83.2 131.8 C78.4 132.4 74.6 129.6 74 125 Z"
          fill={front ? "#5c6671" : "#3c444d"}
          stroke={C.edge}
          strokeWidth="0.8"
        />
        <path d="M77 124.6 H86.4 M77.4 127.6 H85.6" stroke={front ? "#8c97a2" : "#59626c"} strokeWidth="0.8" />
        {front && <path className="k-rim" d="M85.4 102 L84.9 116.5 M87.8 122.5 C88.6 125.6 87.8 129 85 131" fill="none" strokeWidth="1.3" strokeLinecap="round" />}
      </g>
      <circle cx="80" cy="98" r="5.6" fill={steel} stroke={C.edge} strokeWidth="0.8" />
      <circle cx="81.4" cy="97.4" r="1" fill={front ? C.goldPip : "#9b8150"} />
      {/* Pauldron */}
      <path
        d="M65 69 C65 61 74 58 82 59.5 C90.5 61 95 67 94 75 C93.6 78 91 79.5 88 79.5 C80 80.5 71 80 66.5 77 Z"
        fill={steel}
        stroke={C.edge}
        strokeWidth="0.8"
      />
      <path d="M66.8 70.6 C75 73.2 86 73.6 94 70.6 M66.6 74.4 C74 77.2 86 77.6 93.7 74.4" stroke={front ? "#59636d" : "#3a424a"} strokeWidth="0.9" fill="none" />
      <path d="M66.5 77 C71 80 80 80.5 88 79.5 C91 79.5 93.6 78 94 75" stroke="url(#kq-gold)" strokeWidth="1.7" fill="none" opacity={front ? 1 : 0.55} />
      <path d="M71 63.5 C76 61 84 61 89 63.5" stroke="#f4f8fb" strokeWidth="1.6" fill="none" opacity={front ? 0.6 : 0.2} strokeLinecap="round" />
      {front && <path className="k-rim" d="M90.5 62.4 C93.6 65.4 94.6 70 94 75" fill="none" strokeWidth="1.4" strokeLinecap="round" />}
      </g>
    </g>
  );
}

function Cloak({ animate }: { animate: boolean }) {
  const d1 = "M72 63 C63 63 57 67 55 76 C50 108 44 146 37 184 L45 180 L52 188 L60 181 L67 188 L74 180 C77 150 79 112 80 66 Z";
  const d2 = "M72 63 C62 63 56 68 53 78 C46 110 38 146 30 182 L39 179 L46 187 L55 180 L63 186 L71 179 C75 150 79 112 80 66 Z";
  const d3 = "M72 63 C63 64 58 68 56 77 C52 108 47 146 41 186 L48 181 L55 189 L62 182 L69 189 L75 181 C78 150 79 112 80 66 Z";
  const f1 = "M68 74 C64 106 58 144 52 183";
  const f2 = "M68 74 C62 106 51 143 43 181";
  const f3 = "M68 74 C65 106 60 144 56 185";
  const spline = "0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1";
  return (
    <g className="kp k-cloak k-cloak--walk">
      <path d={d1} fill="url(#kq-cloak)" stroke="#3a1013" strokeWidth="0.8">
        {animate && <animate attributeName="d" dur="2.4s" repeatCount="indefinite" values={`${d1};${d2};${d3};${d1}`} calcMode="spline" keySplines={spline} />}
      </path>
      <path d={f1} stroke="#4a1417" strokeWidth="2.2" fill="none" opacity="0.55" strokeLinecap="round">
        {animate && <animate attributeName="d" dur="2.4s" repeatCount="indefinite" values={`${f1};${f2};${f3};${f1}`} calcMode="spline" keySplines={spline} />}
      </path>
    </g>
  );
}

function SeatedCloak({ animate }: { animate: boolean }) {
  const d1 = "M72 63 C62 63 56 69 54 79 C49 100 42 118 30 128 L40 129 L46 134 L56 130 L64 134 L72 128 C76 114 79 92 80 66 Z";
  const d2 = "M72 63 C62 63 56 69 53.5 79 C48 100 40 118 28 127 L38.5 128.5 L45 133.5 L55.5 130 L63.5 133.5 L72 128 C76 114 79 92 80 66 Z";
  return (
    <g className="kp k-cloak k-cloak--sit">
      <path d={d1} fill="url(#kq-cloak)" stroke="#3a1013" strokeWidth="0.8">
        {animate && <animate attributeName="d" dur="5s" repeatCount="indefinite" values={`${d1};${d2};${d1}`} calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />}
      </path>
      <path d="M67 74 C63 94 56 112 46 126" stroke="#4a1417" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
    </g>
  );
}

function Pack() {
  return (
    <g transform="translate(-4.5 0)">
      <rect x="55" y="72" width="14" height="32" rx="4" fill="url(#kq-leather)" stroke={C.leatherDark} strokeWidth="0.8" />
      <path d="M56 86 H68.5 M58 78 V102" stroke={C.leatherDark} strokeWidth="1" opacity="0.7" />
      <rect x="60.8" y="84.4" width="3.4" height="3.4" rx="0.6" fill="none" stroke="url(#kq-gold)" strokeWidth="0.9" />
      {/* Bedroll */}
      <circle cx="61.5" cy="68.5" r="8.4" fill="#7c6a50" stroke="#4c3f2e" strokeWidth="0.8" />
      <circle cx="61.5" cy="68.5" r="5.3" fill="none" stroke="#5f513d" strokeWidth="0.9" />
      <circle cx="61.5" cy="68.5" r="2.3" fill="none" stroke="#5f513d" strokeWidth="0.9" />
      <path d="M55 74.5 L74 66.5" stroke="#36261a" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Torso() {
  return (
    <g transform="matrix(1.22 0 0 1 -17.6 0)">
      <path
        d="M66 70 C66 64 72 62 80 62 C90 62 96 66 97.5 74 C99.5 86 97.5 99 93.5 109 L68 109 C64.5 97 64 82 66 70 Z"
        fill="url(#kq-steel)"
        stroke={C.edge}
        strokeWidth="0.8"
      />
      <path d="M89 67.5 C95 73.5 96.6 87 92.6 100" stroke="#f4f8fb" strokeWidth="2.2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M70 92 C78 89.2 88 89.2 95.4 92 M69.2 99.4 C78 96.6 88 96.6 94.6 99.4" stroke="#4c555f" strokeWidth="0.9" fill="none" />
      <path d="M80.5 64 C80 76 80.6 88 81.6 92" stroke="#e9eef2" strokeWidth="0.9" fill="none" opacity="0.4" />
      <path d="M69 66 C75 63 86 63 93 67" stroke="url(#kq-gold)" strokeWidth="2" fill="none" />
      {/* Belt */}
      <rect x="66.5" y="105.5" width="30.5" height="6.2" rx="1.5" fill="url(#kq-leather)" stroke={C.leatherDark} strokeWidth="0.7" />
      <rect x="87.8" y="104.6" width="6.6" height="8" rx="1" fill="none" stroke="url(#kq-gold)" strokeWidth="1.6" />
      {/* Fauld lames */}
      <path d="M66.5 112 H96.8 L97.6 118.8 H65.6 Z" fill="url(#kq-steel)" stroke={C.edge} strokeWidth="0.7" />
      <path d="M65.6 118.4 H97.6 L96.6 125 H66.6 Z" fill="url(#kq-steel-back)" stroke={C.edge} strokeWidth="0.7" />
      {/* Tasset over the thigh */}
      <path d="M75 120 H93 L92 135.5 C88 138.6 79 138.6 75.6 135.5 Z" fill="url(#kq-steel)" stroke={C.edge} strokeWidth="0.8" />
      <path d="M75.8 135.3 C79 138.4 88 138.4 91.9 135.3" stroke="url(#kq-gold)" strokeWidth="1.4" fill="none" />
      {/* Gorget */}
      <path d="M68 59.5 C72 65.5 90 65.5 94 59.5 L95 65.5 C90 69.5 72 69.5 67 65.5 Z" fill="url(#kq-steel)" stroke={C.edge} strokeWidth="0.7" />
      <path className="k-rim" d="M97.4 74 C99.4 86 97.4 99 93.4 109 M97.4 113 L97.8 118.5 M92.6 121 L92 134.5" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function Sword() {
  return (
    <g className="kp k-sword">
      <g transform="translate(93 111) rotate(56)">
        <path d="M-3.2 2 H3.2 L2.6 64 L0 71 L-2.6 64 Z" fill="url(#kq-leather)" stroke={C.leatherDark} strokeWidth="0.7" />
        <rect x="-3.8" y="1.2" width="7.6" height="5" rx="1" fill="url(#kq-gold)" />
        <rect x="-3.4" y="33" width="6.8" height="2.6" rx="0.8" fill="url(#kq-gold)" opacity="0.9" />
        <path d="M-2.7 61 H2.7 L0 71 Z" fill="url(#kq-gold)" />
        <rect x="-10.5" y="-3.2" width="21" height="3.4" rx="1.5" fill="url(#kq-gold)" stroke="#6e5220" strokeWidth="0.5" />
        <rect x="-1.9" y="-17.5" width="3.8" height="14.6" rx="1.4" fill={C.grip} />
        <path d="M-1.9 -15 L1.9 -13 M-1.9 -11 L1.9 -9 M-1.9 -7 L1.9 -5" stroke="#5c4330" strokeWidth="0.8" />
        <circle cx="0" cy="-20" r="3.3" fill="url(#kq-gold)" stroke="#6e5220" strokeWidth="0.5" />
      </g>
    </g>
  );
}

function Helm() {
  return (
    <g className="kp k-head">
      <g className="kp k-plume">
        <path
          d="M75 25 C69 11 55 6.5 44.5 13.5 C40.5 16.5 38.4 21.5 39.2 26 C46 20.4 56 19.4 64 25 C67 27 70.6 28.4 73 28.4 Z"
          fill="url(#kq-cloak)"
          stroke="#3a1013"
          strokeWidth="0.7"
        />
        <path d="M71 23 C63 15 53 13.5 46 17 M66 25 C59 21 51 21 45 23.4" stroke="#b44a40" strokeWidth="0.9" fill="none" opacity="0.7" />
      </g>
      <g transform="matrix(1.07 0 0 1.03 -5.6 -1.8)">
      <path
        d="M66 58 V33 C66 24 72 19 81 19 C90 19 96 24 97 32 L97 57 C97 60 95 62 92 62 H70 C67.5 62 66 60.5 66 58 Z"
        fill="url(#kq-steel)"
        stroke={C.edge}
        strokeWidth="0.8"
      />
      <path d="M85 23.2 C90.4 23.8 95 26.6 96.5 31.4 L97 57 C97 60 95 62 92 62 H86 Z" fill="#c4ccd4" opacity="0.45" />
      <path d="M72.5 23.5 C76 21 80 20.2 84 20.4" stroke="#f6f9fb" strokeWidth="1.8" fill="none" opacity="0.65" strokeLinecap="round" />
      <path d="M70.5 30 V56" stroke="#f6f9fb" strokeWidth="1.6" opacity="0.28" strokeLinecap="round" />
      <path d="M66 35.6 H97" stroke="url(#kq-gold)" strokeWidth="2.6" />
      <rect x="83" y="38.3" width="14.6" height="3.4" rx="1.2" fill={C.slit} />
      <rect x="86.2" y="43.7" width="11.4" height="1.8" rx="0.9" fill={C.slit} opacity="0.85" />
      <rect x="91.2" y="35" width="2.3" height="24.5" rx="1" fill="url(#kq-gold)" />
      {[
        [87.6, 50],
        [87.6, 54],
        [95.6, 50],
        [95.6, 54],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.95" fill="#14171b" />
      ))}
      {[69.5, 74.5, 79.5].map((x) => (
        <circle key={x} cx={x} cy="35.6" r="0.8" fill={C.goldPip} />
      ))}
      <path d="M66 58 C66 60.5 67.5 62 70 62 H92 C95 62 97 60 97 57" stroke="#353c44" strokeWidth="1.1" fill="none" />
      <path className="k-rim" d="M96.4 28 C97 30 97 31.5 97 33 L97 57" fill="none" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </g>
  );
}

function CampSeat() {
  return (
    <g className="kp k-seat">
      <ellipse cx="72" cy="208.5" rx="58" ry="5.5" fill="#000" opacity="0.28" />
      <rect x="24" y="159.5" width="96" height="28" rx="13.5" fill={C.bark} stroke={C.barkDark} strokeWidth="0.9" />
      <path d="M34 166 C50 164 66 167 84 165 M30 174 C48 172 70 176 96 173 M36 182 C52 180 72 183 90 181" stroke={C.barkDark} strokeWidth="1" fill="none" opacity="0.8" />
      <ellipse cx="113.5" cy="173.5" rx="8.2" ry="13.6" fill={C.wood} stroke={C.barkDark} strokeWidth="0.9" />
      <ellipse cx="113.5" cy="173.5" rx="5" ry="8.8" fill="none" stroke="#8d6a43" strokeWidth="0.8" />
      <ellipse cx="113.5" cy="173.5" rx="2.2" ry="3.8" fill="none" stroke="#8d6a43" strokeWidth="0.8" />
      <path d="M44 159.8 C42 153 44 149 48.5 147 C48 151 47.5 155 46.4 159.8 Z" fill="#4f6b3a" />
      <path className="k-rim" d="M121.6 166 C122.4 171 122.4 176 121.6 181" fill="none" strokeWidth="1.4" />
    </g>
  );
}

function KnightImpl({ pose, animate }: { pose: KnightPose; animate: boolean }) {
  return (
    <svg className="knight" data-pose={pose} viewBox="0 0 160 220" overflow="visible" role="img" aria-label={pose === "walk" ? "A knight walking along the road" : "A knight resting beside a campfire"}>
      <defs>
        <linearGradient id="kq-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b6671" />
          <stop offset="0.38" stopColor="#97a3af" />
          <stop offset="0.6" stopColor="#d3dbe2" />
          <stop offset="0.8" stopColor="#a4afba" />
          <stop offset="1" stopColor="#6c7783" />
        </linearGradient>
        <linearGradient id="kq-steel-back" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b434c" />
          <stop offset="0.45" stopColor="#66727e" />
          <stop offset="0.65" stopColor="#8f9aa5" />
          <stop offset="1" stopColor="#4a535d" />
        </linearGradient>
        <linearGradient id="kq-cloak" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#4d1518" />
          <stop offset="0.55" stopColor="#8b2a27" />
          <stop offset="1" stopColor="#64201f" />
        </linearGradient>
        <linearGradient id="kq-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8c6826" />
          <stop offset="0.5" stopColor="#e2bd62" />
          <stop offset="1" stopColor="#a07830" />
        </linearGradient>
        <linearGradient id="kq-leather" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a321e" />
          <stop offset="1" stopColor="#7a5532" />
        </linearGradient>
      </defs>

      <ellipse className="kp k-shadow" cx="84" cy="209" rx="30" ry="4.6" fill="#000" opacity="0.3" />
      <CampSeat />

      <g className="kp k-body">
        <g className="kp k-lean">
          <Cloak animate={animate && pose === "walk"} />
          <SeatedCloak animate={animate && pose === "sit"} />
          <Pack />
        </g>
        <g className="kp k-lean">
          <g transform="translate(-4.5 1)">
            <Arm side="back" />
          </g>
        </g>
        <g transform="translate(-6 -1)">
          <Leg side="back" />
        </g>
        <Leg side="front" />
        <g className="kp k-lean">
          <Torso />
          <Sword />
        </g>
        <g className="kp k-lean">
          <Helm />
        </g>
        <g className="kp k-lean">
          <Arm side="front" />
        </g>
      </g>
    </svg>
  );
}

export const Knight = memo(KnightImpl);
