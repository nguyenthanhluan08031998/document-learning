"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Soft gate for the interview area on a static site: only a SHA-256 of "username:password" ships,
// but the page content itself is still in the bundle, so this hides rather than protects.
const CREDENTIAL_HASH = "2b2c40a6706d9e5f320d553628313833e3668d8b0c8f5b0a25a2ca7d926df6d4";
const STORAGE_KEY = "interview-unlock";
const EVENT = "interview-unlock-change";

function read() {
  try { return localStorage.getItem(STORAGE_KEY) === CREDENTIAL_HASH; } catch { return false; }
}

// Fallback for when storage is blocked: stays unlocked for this page load only
let memoryUnlocked = false;

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}

export function useUnlocked() {
  return useSyncExternalStore(subscribe, () => memoryUnlocked || read(), () => false);
}

/** False during server render and hydration, true once running in the browser */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("");
}

export type UnlockResult = "ok" | "wrong" | "unsupported";

export async function unlock(user: string, pass: string): Promise<UnlockResult> {
  if (!globalThis.crypto?.subtle) return "unsupported";
  if (await sha256(`${user.trim()}:${pass}`) !== CREDENTIAL_HASH) return "wrong";
  memoryUnlocked = true;
  try { localStorage.setItem(STORAGE_KEY, CREDENTIAL_HASH); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT));
  return "ok";
}

export function lock() {
  memoryUnlocked = false;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT));
}
