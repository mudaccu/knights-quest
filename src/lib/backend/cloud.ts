/**
 * Firebase Auth + Firestore. Imported dynamically, and only when a Firebase
 * config is present, so demo-mode visitors never download the SDK.
 */
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  increment,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config";
import type { Backend, DataSnapshot } from "./types";
import type { Note, Profile, Quest, Reflection } from "../types";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function ensure() {
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig);
  if (!auth) auth = getAuth(app);
  if (!db) {
    try {
      db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    } catch {
      // Already initialised (e.g. hot reload) or persistence unsupported.
      db = initializeFirestore(app, {});
    }
  }
  return { auth: auth!, db: db! };
}

export interface CloudUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

const toCloudUser = (u: User): CloudUser => ({
  uid: u.uid,
  displayName: u.displayName ?? "",
  email: u.email ?? "",
  photoURL: u.photoURL ?? "",
});

export function watchAuth(cb: (user: CloudUser | null) => void, onError: (e: Error) => void) {
  const { auth } = ensure();
  return onAuthStateChanged(auth, (u) => cb(u ? toCloudUser(u) : null), onError);
}

export async function signInWithGoogle() {
  const { auth } = ensure();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const code = (e as { code?: string }).code ?? "";
    // Mobile browsers often block popups — fall back to a full redirect.
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}

export async function signOut() {
  const { auth } = ensure();
  await fbSignOut(auth);
}

export function describeAuthError(e: unknown): string {
  const code = (e as { code?: string }).code ?? "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The sign-in window was closed before finishing.";
    case "auth/network-request-failed":
      return "No connection to the realm's ravens. Check your network and try again.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorised in Firebase Authentication settings.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled for this Firebase project.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export function createCloudBackend(uid: string): Backend {
  const { db } = ensure();
  const userDoc = doc(db, "users", uid);
  const col = (name: string) => collection(db, "users", uid, name);

  return {
    kind: "cloud",
    subscribe(onData, onError) {
      const fail = (e: Error) => onError(e);
      const unsubs = [
        onSnapshot(userDoc, (s) => onData({ profile: s.exists() ? (s.data() as Profile) : null }), fail),
        onSnapshot(col("quests"), (s) => onData({ quests: s.docs.map((d) => d.data() as Quest) }), fail),
        onSnapshot(col("notes"), (s) => onData({ notes: s.docs.map((d) => d.data() as Note) }), fail),
        onSnapshot(col("reflections"), (s) => onData({ reflections: s.docs.map((d) => d.data() as Reflection) }), fail),
      ];
      return () => unsubs.forEach((u) => u());
    },
    saveQuest: (q) => setDoc(doc(col("quests"), q.id), q),
    deleteQuest: (id) => deleteDoc(doc(col("quests"), id)),
    saveNote: (n) => setDoc(doc(col("notes"), n.id), n),
    deleteNote: (id) => deleteDoc(doc(col("notes"), id)),
    saveReflection: (r) => setDoc(doc(col("reflections"), r.date), r),
    saveProfile: (patch) => setDoc(userDoc, patch, { merge: true }),
    adjustXp: (day, xp, completed) =>
      setDoc(
        userDoc,
        { totalXp: increment(xp), days: { [day]: { completed: increment(completed), xp: increment(xp) } } },
        { merge: true },
      ),
  };
}

export type { DataSnapshot };
