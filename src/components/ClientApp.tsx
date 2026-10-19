"use client";

import dynamic from "next/dynamic";

/** The app depends on the local clock, localStorage and Web Audio, so it renders client-side only. */
const KnightsQuest = dynamic(() => import("./KnightsQuest"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0b0e14]" />,
});

export default function ClientApp() {
  return <KnightsQuest />;
}
