import type { Phase } from "@/lib/types";

export interface Palette {
  sky: [string, string, string, string];
  far: string;
  snow: string;
  castle: string;
  castleLight: string;
  hills: string;
  hillsShade: string;
  forest: string;
  forestDeep: string;
  ground: string;
  groundShade: string;
  path: string;
  pathShade: string;
  grass: string;
  grassDeep: string;
  trunk: string;
  canopy: string;
  canopyLight: string;
  stone: string;
  fog: string;
  fogOpacity: number;
  cloud: string;
  cloudOpacity: number;
  /** CSS filter applied to the knight for colour grading. */
  knightGrade: string;
  /** Rim light colour on the knight's armour. */
  rim: string;
  rimOpacity: number;
}

export const PALETTES: Record<Phase, Palette> = {
  morning: {
    sky: ["#6fa6d3", "#a9cde6", "#e3ecdf", "#f6e7c4"],
    far: "#93acc2",
    snow: "#eef2f5",
    castle: "#7d93a7",
    castleLight: "#f6e3a8",
    hills: "#7a9a77",
    hillsShade: "#6a8a69",
    forest: "#4b7454",
    forestDeep: "#355c40",
    ground: "#5f8443",
    groundShade: "#4e7037",
    path: "#b9a172",
    pathShade: "#9f875c",
    grass: "#76a24c",
    grassDeep: "#4f7a34",
    trunk: "#5b4431",
    canopy: "#4f8045",
    canopyLight: "#7fae58",
    stone: "#9b9a8f",
    fog: "#f4f1e6",
    fogOpacity: 0.55,
    cloud: "#ffffff",
    cloudOpacity: 0.85,
    knightGrade: "saturate(1.02) brightness(1.02)",
    rim: "#fff2cf",
    rimOpacity: 0.35,
  },
  afternoon: {
    sky: ["#4f8fcc", "#86bce3", "#c4e0ee", "#e8efe0"],
    far: "#86a2bd",
    snow: "#f3f6f8",
    castle: "#768ca1",
    castleLight: "#f0dfa6",
    hills: "#6f9469",
    hillsShade: "#5f845b",
    forest: "#406c4a",
    forestDeep: "#2f553a",
    ground: "#5a7f3d",
    groundShade: "#4a6b32",
    path: "#bea676",
    pathShade: "#a48c5f",
    grass: "#6f9c45",
    grassDeep: "#4a7430",
    trunk: "#574130",
    canopy: "#4a7a40",
    canopyLight: "#78a852",
    stone: "#a19f94",
    fog: "#eef3f1",
    fogOpacity: 0.35,
    cloud: "#ffffff",
    cloudOpacity: 0.95,
    knightGrade: "none",
    rim: "#ffffff",
    rimOpacity: 0.25,
  },
  sunset: {
    sky: ["#2f3561", "#8a4f74", "#e0855e", "#f7c98a"],
    far: "#8c6a87",
    snow: "#f6cfae",
    castle: "#6b5573",
    castleLight: "#ffc76e",
    hills: "#71595b",
    hillsShade: "#5f4a4f",
    forest: "#463a43",
    forestDeep: "#332b36",
    ground: "#56493a",
    groundShade: "#473c31",
    path: "#b08460",
    pathShade: "#93694c",
    grass: "#77703e",
    grassDeep: "#524c2e",
    trunk: "#3d2c25",
    canopy: "#4c4436",
    canopyLight: "#8a7a45",
    stone: "#8f7a70",
    fog: "#f2b48b",
    fogOpacity: 0.4,
    cloud: "#f6a98a",
    cloudOpacity: 0.85,
    knightGrade: "sepia(0.28) saturate(1.25) hue-rotate(-12deg) brightness(0.92)",
    rim: "#ffb766",
    rimOpacity: 0.9,
  },
  night: {
    sky: ["#060a1a", "#0d1530", "#18234a", "#2b3760"],
    far: "#27325a",
    snow: "#7f8bb3",
    castle: "#1f2846",
    castleLight: "#ffcf7a",
    hills: "#1d2842",
    hillsShade: "#172137",
    forest: "#131d2e",
    forestDeep: "#0e1624",
    ground: "#1a2826",
    groundShade: "#152120",
    path: "#3a3d3a",
    pathShade: "#2e312f",
    grass: "#21372d",
    grassDeep: "#172921",
    trunk: "#191715",
    canopy: "#15241f",
    canopyLight: "#21362c",
    stone: "#40464d",
    fog: "#5d6d9a",
    fogOpacity: 0.28,
    cloud: "#3b4670",
    cloudOpacity: 0.45,
    knightGrade: "brightness(0.62) saturate(0.75) hue-rotate(8deg)",
    rim: "#ff9a45",
    rimOpacity: 1,
  },
};

export const PHASES: Phase[] = ["morning", "afternoon", "sunset", "night"];

export const PHASE_LABEL: Record<Phase, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  sunset: "Sunset",
  night: "Night",
};

export function phaseForHour(h: number): Phase {
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "sunset";
  return "night";
}
