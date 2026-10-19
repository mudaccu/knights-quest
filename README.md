# Knights Quest — A Living Journal

A fantasy productivity app. You manage real quests, notes and reflections while a fully
armoured knight travels a living vector world: walking the road by day, resting at a
campfire by night, with the scene following your local clock.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Firebase settings the app runs in **local demo mode**:
everything is kept in this browser's `localStorage` and is **not** synced to other devices.

## Features

- **Quests**: title, fantasy title (suggested automatically, rerollable), notes, category
  (Study / Work / Health / Personal / Custom), due date and time, priority, reminder and repeat
  schedule. You can create, edit, complete, reopen and delete them (deleting asks first).
  Views: Today / Upcoming / Overdue / Fulfilled, with category and priority filters and a
  summary of the day.
- **The Chronicle**: notes with tags, pin, important, reminders, quick-add and full-text search.
- **Journey**: XP (Low 10 / Normal 20 / High 35), levels and ranks, a winding road of
  milestones, evening reflection, and a calendar history of each day. Missed quests never
  remove progress. Reopening a quest takes back its XP. Deleting a quest you already finished
  keeps the XP you earned.
- **Reminders** run while the app is open: an in-app toast, plus a system notification if
  you allow it.
- **Sound**: ambience made live in the Web Audio API (a slow D-minor lute and strings, wind,
  birds, crickets, fire). It is **off by default**, starts only when you click it, and has
  volume, music and ambience controls.
- **Motion**: Profile menu → Animation → System / Full / Reduced. "System" follows the OS
  reduced-motion setting. If your OS asks for reduced motion, choose *Full* to see the knight walk.
- **Time of day**: Profile menu → Time of day lets you preview Morning, Afternoon, Sunset or
  Night, or follow your clock (Auto).
- Keyboard shortcuts: `Q` new quest · `N` new note · `J` journey. Esc closes any dialog.

## Connect Firebase (Google sign-in + Firestore)

1. Create a Firebase project and add a **Web app**.
2. Under **Authentication → Sign-in method**, enable **Google**. Add your domains (for example
   `localhost` and your Vercel domain) under **Authorized domains**.
3. Create a **Cloud Firestore** database.
4. Copy `.env.example` to `.env.local` and fill in the web config values.
5. Deploy the security rules: `npx firebase-tools deploy --only firestore:rules`
6. Restart `npm run dev`. The welcome screen now offers **Continue with Google**.

Data layout: `users/{uid}` holds the profile (name, XP, per-day ledger), with the
subcollections `quests`, `notes` and `reflections`. `firestore.rules` only lets each user
read and write their own tree, and it checks the shape and size of every write. The
`NEXT_PUBLIC_FIREBASE_*` values identify the project and are meant to be public; the rules
are what protect the data. The Firebase SDK only loads when a config is present.

## Deploy to Vercel

Import the repository, set the project root to `knights-quest/`, add the same
`NEXT_PUBLIC_FIREBASE_*` environment variables, and deploy. Add the Vercel domain to the
authorized domains in Firebase.

## Architecture

```
src/
  app/                 layout, fonts (Cinzel + EB Garamond), global + world styles
  components/
    world/             World (parallax scene), Knight (rigged SVG), Campfire, terrain, palettes
    providers/         Prefs, Sound, Toast, Auth, Data, UI state
    quests/ notes/ journey/ hud/ ui/ effects/
  lib/
    backend/           Backend interface → LocalBackend (demo) | cloud (Firestore)
    audio/engine.ts    procedural music + ambience
    progress.ts lore.ts dates.ts quests.ts
firestore.rules
```

- **Art direction**: one vector style throughout. Layered silhouettes with atmospheric depth,
  recoloured per time of day by a palette, with fills cross-fading as the day turns.
- **Parallax**: every landscape layer is a 1600×900 tile whose terrain is generated from
  integer-period waves, so the edges always match. Three copies scroll on the compositor
  (`translate3d`), and each layer's speed is a fraction of the walking speed. The ground layer
  moves at the knight's stride speed, so his feet don't slide.
- **Knight rig**: hips, knees, shoulders, elbows, neck, plume and sword are separate SVG
  groups with real pivots. CSS keyframes drive a walk cycle with leg swing, knee bend, arm
  counter-swing, bob and lean. SMIL morphs the cloak, and the same rig eases into a seated
  pose at night. To use better art later, swap the paths in `Knight.tsx` and keep the class
  names and pivots.
- **Storage** goes through one `Backend` interface, so components never know whether data is
  local or in the cloud.

## Assets & licensing

All artwork (knight, landscape, campfire, icons, crest) is original SVG drawn in code. All
audio is synthesised at runtime. No third-party images or sound files are included. The
fonts are Cinzel and EB Garamond from Google Fonts (SIL Open Font License).
