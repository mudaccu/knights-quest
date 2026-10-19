"use client";

import { useState } from "react";
import { Icon, type IconName } from "../ui/Icon";
import { Popover } from "../ui/Popover";
import { useAuth } from "../providers/AuthProvider";
import { useData } from "../providers/DataProvider";
import { usePrefs, type Prefs } from "../providers/PrefsProvider";
import { PHASE_LABEL } from "../world/palette";
import type { Phase } from "@/lib/types";

const PHASE_ICON: Record<Phase, IconName> = { morning: "sun", afternoon: "sun", sunset: "sunset", night: "moon" };

export function ProfileMenu() {
  const auth = useAuth();
  const { profile, saveProfile, kind } = useData();
  const { prefs, setPref, osReduced } = usePrefs();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const user = auth.state.status === "cloud" ? auth.state.user : null;
  const displayName = profile?.displayName || user?.displayName || "Knight";

  return (
    <Popover
      label="Profile and settings"
      trigger={({ toggle, ...aria }) => (
        <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-white/5 sm:pr-3" onClick={toggle} aria-label="Profile and settings" {...aria}>
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full ring-1 ring-gold/40" />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-crimson/80 font-display text-[0.85rem] font-semibold text-[#f6e3c9] ring-1 ring-gold/40">{displayName.slice(0, 1).toUpperCase()}</span>
          )}
          <span className="max-w-[9rem] truncate text-[0.98rem] max-sm:hidden">{displayName}</span>
        </button>
      )}
    >
      {(close) => (
        <div className="text-mist">
          {editing ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) void saveProfile({ displayName: name.trim().slice(0, 40) });
                setEditing(false);
              }}
            >
              <input autoFocus className="field field-dark !min-h-9" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
              <button className="btn btn-gold !min-h-9 !px-3" type="submit">
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-display text-[1rem] font-semibold">{displayName}</p>
                {user?.email && <p className="truncate text-[0.88rem] opacity-80">{user.email}</p>}
              </div>
              <button
                className="icon-btn icon-btn--sm"
                aria-label="Rename"
                onClick={() => {
                  setName(displayName);
                  setEditing(true);
                }}
              >
                <Icon name="edit" size={15} />
              </button>
            </div>
          )}

          <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[0.88rem] leading-snug ${kind === "cloud" ? "bg-moss/20" : "bg-white/5"}`}>
            <Icon name={kind === "cloud" ? "shield" : "alert"} size={16} className="mt-0.5 shrink-0 opacity-80" />
            {kind === "cloud" ? "Synced to your Google account. Only you can read your journal." : "Local demo — stored only in this browser. Not synced to other devices."}
          </div>

          <p className="mt-4 font-display text-[0.8rem] font-semibold tracking-[0.02em] text-gold">Time of day</p>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {(["auto", "morning", "afternoon", "sunset", "night"] as Prefs["phase"][]).map((p) => (
              <button
                key={p}
                onClick={() => setPref("phase", p)}
                aria-pressed={prefs.phase === p}
                title={p === "auto" ? "Follow my local time" : PHASE_LABEL[p as Phase]}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[0.9rem] transition-colors ${prefs.phase === p ? "bg-gold/20 text-gold-bright" : "opacity-85 hover:bg-white/5 hover:opacity-100"}`}
              >
                <Icon name={p === "auto" ? "clock" : PHASE_ICON[p as Phase]} size={16} />
                {p === "auto" ? "Auto" : PHASE_LABEL[p as Phase]}
              </button>
            ))}
          </div>

          <p className="mt-4 font-display text-[0.8rem] font-semibold tracking-[0.02em] text-gold">Animation</p>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1">
            {(["system", "full", "reduced"] as Prefs["motion"][]).map((m) => (
              <button
                key={m}
                onClick={() => setPref("motion", m)}
                aria-pressed={prefs.motion === m}
                className={`rounded-md py-1 text-[0.85rem] capitalize transition-colors ${prefs.motion === m ? "bg-gold/20 text-gold-bright" : "opacity-85 hover:opacity-100"}`}
              >
                {m === "system" ? "System" : m}
              </button>
            ))}
          </div>
          {prefs.motion === "system" && osReduced && <p className="mt-1.5 text-[0.82rem] leading-snug opacity-80">Your device asks for reduced motion, so the world is calmed. Choose Full to see the knight walk.</p>}

          <div className="mt-4 border-t border-white/10 pt-3">
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[0.98rem] transition-colors hover:bg-white/5"
              onClick={() => {
                close();
                void auth.signOut();
              }}
            >
              <Icon name="logout" size={17} /> {kind === "cloud" ? "Sign out" : "Leave demo mode"}
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
