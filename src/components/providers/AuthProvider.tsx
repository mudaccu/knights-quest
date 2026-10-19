"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cloudAvailable } from "@/lib/firebase-config";
import { LocalBackend } from "@/lib/backend/local";
import type { Backend } from "@/lib/backend/types";
import type { CloudUser } from "@/lib/backend/cloud";

type CloudModule = typeof import("@/lib/backend/cloud");

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut"; error?: string }
  | { status: "demo" }
  | { status: "cloud"; user: CloudUser };

interface Ctx {
  state: AuthState;
  backend: Backend | null;
  cloudAvailable: boolean;
  busy: boolean;
  signInWithGoogle: () => Promise<void>;
  enterDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<Ctx | null>(null);
const MODE_KEY = "knightsquest.mode";

const loadCloud = (): Promise<CloudModule> => import("@/lib/backend/cloud");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const cloud = useRef<CloudModule | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    const demoChosen = (() => {
      try {
        return localStorage.getItem(MODE_KEY) === "demo";
      } catch {
        return false;
      }
    })();

    if (!cloudAvailable) {
      setState(demoChosen ? { status: "demo" } : { status: "signedOut" });
      return;
    }

    loadCloud()
      .then((mod) => {
        if (cancelled) return;
        cloud.current = mod;
        unsub = mod.watchAuth(
          (user) => {
            if (user) setState({ status: "cloud", user });
            else setState(demoChosen ? { status: "demo" } : { status: "signedOut" });
          },
          () => setState({ status: "signedOut", error: "Could not reach the authentication service." }),
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "signedOut", error: "Could not load the sign-in service." });
      });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!cloudAvailable) return;
    setBusy(true);
    try {
      const mod = cloud.current ?? (await loadCloud());
      cloud.current = mod;
      await mod.signInWithGoogle();
      try {
        localStorage.removeItem(MODE_KEY);
      } catch {}
    } catch (e) {
      const message = cloud.current?.describeAuthError(e) ?? "Sign-in failed.";
      setState({ status: "signedOut", error: message });
    } finally {
      setBusy(false);
    }
  }, []);

  const enterDemo = useCallback(() => {
    try {
      localStorage.setItem(MODE_KEY, "demo");
    } catch {}
    setState({ status: "demo" });
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(MODE_KEY);
    } catch {}
    if (state.status === "cloud" && cloud.current) {
      setBusy(true);
      try {
        await cloud.current.signOut();
      } finally {
        setBusy(false);
      }
    }
    setState({ status: "signedOut" });
  }, [state.status]);

  const uid = state.status === "cloud" ? state.user.uid : null;
  const backend = useMemo<Backend | null>(() => {
    if (state.status === "demo") return new LocalBackend();
    if (uid && cloud.current) return cloud.current.createCloudBackend(uid);
    return null;
  }, [state.status, uid]);

  return (
    <AuthContext.Provider value={{ state, backend, cloudAvailable, busy, signInWithGoogle, enterDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
