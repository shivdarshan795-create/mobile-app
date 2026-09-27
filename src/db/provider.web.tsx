import type { ReactNode } from 'react';

/**
 * Web build-only stand-in for provider.tsx: `expo-sqlite`'s web implementation (a Web Worker running
 * a WASM SQLite build) doesn't currently bundle cleanly under this Metro/SDK combination (a chunk-
 * splitting assertion fails inside @expo/metro-config). Metro picks this .web.tsx file over provider.tsx
 * automatically on web builds, so the real `expo-sqlite` import is never reached there at all.
 *
 * Every db/*.ts repository file has a matching *.web.ts sibling that talks to `web-store.ts`
 * (an in-memory store mirrored to localStorage) instead of SQL, using the same exported function
 * names — so hooks and screens are unchanged. This is a visual/interactive preview path only;
 * the real target is Android/iOS via Expo Go, where provider.tsx (real SQLite) is used.
 */
export function useDb(): unknown {
  return undefined;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
