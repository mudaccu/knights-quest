/** Hand-drawn line icon set (24px grid, 1.6 stroke) so every glyph shares one voice. */
const PATHS = {
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.2 4.2L19 7",
  chevron: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  sword: "M14.5 3.5H20.5V9.5L9.5 20.5L6.5 17.5ZM4 14l6 6M3.5 20.5l2.5-2.5",
  shield: "M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6L12 3zM12 3v18M4.5 10.5h15",
  scroll:
    "M7 4h11a2 2 0 012 2v1.5h-4M7 4a2 2 0 00-2 2v12a2 2 0 002 2h9a2 2 0 002-2V7.5M7 4a2 2 0 012 2v12a2 2 0 01-2 2M11.5 9h3.5M11.5 12.5h3.5M11.5 16h2",
  quill: "M20 4c-6 0-11.5 4.5-13 11.5L5.5 20M20 4c0 6-4 10.5-9.5 11.5M9 11.5h5M20 4l-6.5 6.5",
  book: "M4 5.5c2.5-1.3 5.5-1.3 8 0v14c-2.5-1.3-5.5-1.3-8 0zM12 5.5c2.5-1.3 5.5-1.3 8 0v14c-2.5-1.3-5.5-1.3-8 0z",
  hammer: "M14 4l6 6-2.5 2.5-6-6zM11.5 6.5L8 10l2 2M10 12L3.5 18.5l2 2L12 14",
  heart: "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z",
  hearth: "M4 20h16M5.5 20V10L12 4.5 18.5 10V20M10 20v-4.5a2 2 0 014 0V20",
  banner: "M6 3v18M6 4h11l-2.5 4L17 12H6",
  undo: "M9 7L5 11l4 4M5 11h9a5 5 0 010 10h-2",
  trash: "M4.5 7h15M10 4h4M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  pin: "M9 4h6M10 4v5.5L7 13h10l-3-3.5V4M12 13v7",
  star: "M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z",
  bell: "M6.5 16V11a5.5 5.5 0 0111 0v5l1.5 2h-14zM10 20.5a2 2 0 004 0",
  search: "M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM15.5 15.5L20 20",
  sound: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11",
  mute: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5",
  music: "M9 18V6l10-2v12M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM19 16a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  leaf: "M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l7-7",
  flame: "M12 21c-3.6 0-6-2.5-6-5.8 0-3.3 2.6-5 3.2-8.2 1.9 1.2 2.8 3 2.8 4.5 1-1 1.6-2.6 1.6-4.3 2.4 1.8 4.4 4.6 4.4 8 0 3.3-2.4 5.8-6 5.8z",
  moon: "M19 14.5A7.5 7.5 0 019.5 5 7.5 7.5 0 1019 14.5z",
  sun: "M12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  sunset: "M3 18h18M6 18a6 6 0 0112 0M12 6.5v2.5M4.6 10.6l1.8 1.3M19.4 10.6l-1.8 1.3M7 21.5h10",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20.5c1-3.8 4-5.5 7.5-5.5s6.5 1.7 7.5 5.5",
  logout: "M14 4h4.5a1.5 1.5 0 011.5 1.5v13a1.5 1.5 0 01-1.5 1.5H14M10 8l-4 4 4 4M6 12h10",
  map: "M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13",
  calendar: "M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4",
  clock: "M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17zM12 7.5V12l3 2",
  repeat: "M17 3.5l3 3-3 3M4 11V9.5a3 3 0 013-3h13M7 20.5l-3-3 3-3M20 13v1.5a3 3 0 01-3 3H4",
  sparkle: "M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7zM19 16.5c.2 1.5 1 2.3 2.5 2.5-1.5.2-2.3 1-2.5 2.5-.2-1.5-1-2.3-2.5-2.5 1.5-.2 2.3-1 2.5-2.5z",
  alert: "M12 4l9 16H3zM12 10v4.5M12 17.5v.5",
  filter: "M4 6h16M7 12h10M10 18h4",
  dice: "M5 5h14v14H5zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01",
  menu: "M4 7h16M4 12h16M4 17h16",
  google: "",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className, strokeWidth = 1.6 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  if (name === "google") {
    return (
      <svg width={`${size / 16}rem`} height={`${size / 16}rem`} viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z" />
        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8A11 11 0 0012 23z" />
        <path fill="#FBBC05" d="M5.9 14.1a6.6 6.6 0 010-4.2V7.1H2.2a11 11 0 000 9.8z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 002.2 7.1l3.7 2.8C6.8 7.3 9.2 5.4 12 5.4z" />
      </svg>
    );
  }
  return (
    <svg
      width={`${size / 16}rem`}
      height={`${size / 16}rem`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
