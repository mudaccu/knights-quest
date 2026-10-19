"use client";

import { Icon } from "../ui/Icon";
import { Popover } from "../ui/Popover";
import { useSound } from "../providers/SoundProvider";

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div>
        <p className="text-[0.98rem]">{label}</p>
        <p className="text-[0.82rem] opacity-80">{hint}</p>
      </div>
      <button role="switch" aria-checked={checked} aria-label={label} className="switch switch--dark" onClick={() => onChange(!checked)} />
    </div>
  );
}

export function SoundControl() {
  const { settings, pending, setEnabled, update } = useSound();
  const on = settings.enabled;

  return (
    <Popover
      label="Sound settings"
      trigger={({ toggle, ...aria }) => (
        <div className="flex items-center">
          <button
            className={`icon-btn relative ${on ? "text-gold-bright" : ""}`}
            onClick={() => setEnabled(!on)}
            aria-label={on ? "Mute sound" : "Play ambient music and sounds"}
            title={on ? "Mute" : "Play music"}
          >
            <Icon name={on ? "sound" : "mute"} />
            {on && pending && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-gold-bright" />}
          </button>
          <button className="icon-btn !w-6 opacity-80 max-sm:hidden" onClick={toggle} aria-label="Sound options" {...aria}>
            <Icon name="chevronDown" size={14} />
          </button>
        </div>
      )}
    >
      {() => (
        <div className="text-mist">
          <p className="font-display text-[0.9rem] font-semibold tracking-[0.02em] text-gold">Sound</p>
          <div className="mt-2 flex items-center gap-3">
            <button className="icon-btn icon-btn--sm" onClick={() => setEnabled(!on)} aria-label={on ? "Mute" : "Unmute"}>
              <Icon name={on ? "sound" : "mute"} size={18} />
            </button>
            <input
              type="range"
              className="range"
              min={0}
              max={100}
              value={Math.round(settings.volume * 100)}
              style={{ "--v": `${settings.volume * 100}%` } as React.CSSProperties}
              aria-label="Volume"
              onChange={(e) => {
                update({ volume: Number(e.target.value) / 100 });
                if (!on) setEnabled(true);
              }}
            />
          </div>
          <div className="mt-2 divide-y divide-white/5">
            <Toggle label="Music" hint="A slow lute and strings" checked={settings.music} onChange={(v) => update({ music: v })} />
            <Toggle label="Ambience" hint="Wind, birds, crickets, fire" checked={settings.ambience} onChange={(v) => update({ ambience: v })} />
          </div>
          {pending && <p className="mt-2 text-[0.85rem] opacity-85">Click anywhere to resume sound.</p>}
        </div>
      )}
    </Popover>
  );
}
