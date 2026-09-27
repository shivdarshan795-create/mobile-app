# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

The commands and rules above (imported from AGENTS.md) cover install/start/lint/typecheck. Two gaps to know about:

- **Lint**: `package.json` has a `lint` script (`expo lint`), but ESLint itself isn't installed yet — running it for the first time will prompt to install `eslint-config-expo`. Accept that prompt rather than trying to hand-configure ESLint.
- **Tests**: no test framework is set up (no `jest`, no test script). If tests are needed, follow the Expo unit-testing guide referenced in `README.md` rather than assuming a runner already exists.

## Local Dev Gotchas

Two environment issues cost real time this session — check these before assuming something's broken in the code:

- **Typed routes can get corrupted.** After adding/removing/renaming a file under `src/app/`, `.expo/types/router.d.ts` needs to regenerate. If that regeneration happens via `npx expo start --web` while a web bundle error is occurring, `router.d.ts` can end up polluted with bogus entries (e.g. `"/../lib/date"`, `"/../hooks/use-habits"`), which then breaks `tsc` on every `router.push()`/`Href` call with confusing union-type errors. Fix: `rm -rf .expo`, regenerate with a **plain** `npx expo start` (no `--web` flag), give it ~10s, stop it, then re-run `tsc --noEmit`. Don't try to hand-edit `router.d.ts` — it's generated.
- **Only one dev server at a time on port 8081.** A backgrounded/killed `expo start` can leave the port held by an orphaned process; the next `expo start` then silently prompts to use a different port and hangs in a non-interactive shell. Check for and kill anything still bound to 8081 before starting a new one.

## Architecture

Local-first Expo Router habit tracker with real auth, SQLite persistence, and a rewards system. Everything under `src/app/` is a route; everything else in `src/` is plain code, organized by layer:

- `src/db/` — SQLite for habit data only (schema, migrations, one repository module per table: `habits.ts`, `entries.ts`, `rewards.ts`, `achievements.ts`). `provider.tsx` wraps `SQLiteProvider` (`expo-sqlite`, `useSuspense`) and re-exports `useDb` (= `useSQLiteContext`). Every repository function takes `db: SQLiteDatabase` as its first argument rather than importing a singleton — call sites get `db` from `useDb()`. This layer is still local-first/offline; only auth talks to the network (see below).
- `src/auth/` — accounts live in **Supabase Auth**, not locally. `AuthService` (`types.ts`) is the interface; `supabase-auth-service.ts` is the only implementation, backed by `src/lib/supabase.ts` (reads `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env` — copy `.env.example`, never commit `.env`). Profile fields (`name`, `goal`, `onboardingComplete`, `weekStartsOn`) live in Supabase's user metadata (`options.data` on signUp, `supabase.auth.updateUser({ data })` after) — there's no Postgres schema/migrations for this, by design, since habit data intentionally stayed local. `auth-context.tsx`'s `AuthProvider` calls `getSession()` once on mount and subscribes to `onChange` (wraps `supabase.auth.onAuthStateChange`) so token refresh/sign-out elsewhere stays in sync. "Forgot password" is a real two-step flow: `sendPasswordResetEmail` emails a link; completing the reset happens on Supabase's own hosted page (no in-app deep-link handling yet — that'd be the next step if wanted). A signed-in user changing their own password uses `updatePassword` directly, no email involved. **Note:** if the Supabase project has "Confirm email" on (the default), `signUp` won't return a session until the user clicks the confirmation email — the service surfaces this as a `success: false` result with an explanatory message rather than a hard error.
- `src/lib/rewards-processor.ts` — the single entry point for "the user changed today's value for a habit" (`recordHabitProgress`). Persists the entry, then awards completion/streak/perfect-day/weekly-goal points and checks achievements, each gated by `hasRewardForDate`/`unlockAchievement`'s own uniqueness so re-tapping never double-awards. `computeAchievementContext` (also used by the Profile stats hook) derives total completions, best current streak, and perfect-day counts by scanning entries — nothing is cached in a separate stats table, per the project's "derive, don't duplicate" preference.
- `src/lib/streaks.ts` / `src/lib/habit-schedule.ts` — pure functions (no DB access) for streak math and "is this habit scheduled on date X" (daily / specific weekdays / X-times-per-week). A habit entry counts as completed when `value >= targetValue` (quantity/duration) or `value === 1` (yes/no).
- `src/hooks/` — one hook per screen's data needs (`use-today`, `use-insights`, `use-rewards`, `use-habits`, `use-habit-detail`, `use-profile-stats`), each reloading via `useFocusEffect` (from `expo-router`) rather than only on mount — this is what keeps multiple tabs/screens consistent despite each holding its own copy of query results (there is no shared in-memory store; SQLite is the single source of truth, and focus-triggered reloads are how staleness is avoided).

**Navigation (`src/app/`):** root `_layout.tsx` uses `Stack.Protected` guards (not manual redirects) keyed on `!!user`, `user.onboardingComplete`, and `!user` to switch between `(auth)`, top-level `onboarding.tsx`, and `(app)`. `(app)/_layout.tsx` is a plain Stack with `(tabs)` as the initial route plus `habit/new` and `habit/[id]/edit` as modals and `habit/[id]/index` as a pushed detail screen. `(app)/(tabs)/_layout.tsx` uses `NativeTabs` (`expo-router/unstable-native-tabs`, `sf`/`md` icon props — no image assets needed) for the 4 tabs; `_layout.web.tsx` is the platform override using `expo-router/ui`'s `Tabs`, since `NativeTabs` is native-only.

**Web preview:** the real target is Android/iOS via Expo Go (`npx expo export --platform android`/`ios` validates a bundle without a device), but `npm run web` also works, as a preview-only path — with two things that make it work, both worth knowing before touching either:
- `expo-sqlite`'s web build doesn't bundle cleanly under this Metro/SDK combo (`Worker chunk not found for .../wa-sqlite.wasm`). Every file in `src/db/` has a `*.web.ts` sibling (`habits.web.ts`, `entries.web.ts`, `rewards.web.ts`, `achievements.web.ts`, `reset.web.ts`, `provider.web.tsx`) that Metro picks automatically on web builds instead — same exported function names, backed by `web-store.ts` (an in-memory store mirrored to `localStorage` via AsyncStorage) rather than SQL. Data entered in the browser is separate from a phone's SQLite data and isn't "real" in the production sense. If you add a new file to `src/db/`, decide whether it needs a `.web.ts` counterpart the same way.
- `app.json`'s `web.output` is `"single"` (SPA), not `"static"`. Static mode pre-renders every route in a Node.js pass with no `window`, which crashes as soon as Supabase's session-recovery code (in `supabase-auth-service.ts`, via AsyncStorage) touches `localStorage`. Don't switch it back without also handling that.

**Theming:** `src/constants/theme.ts` defines the premium palette (`Colors` light/dark), `Spacing`, `Radius`, and per-category accent colors (`CategoryColors`, used sparingly — see MVP principles below). `src/hooks/use-theme.ts` resolves `Colors[light|dark]`, but the actual scheme comes from `src/hooks/use-theme-preference.tsx` (a System/Light/Dark override stored in AsyncStorage, settable from Profile) falling back to the device scheme — don't read `useColorScheme()` directly for anything user-visible, go through `useTheme()`. `src/components/themed-text.tsx` / `themed-view.tsx` wrap RN's `Text`/`View` accordingly; `src/components/ui/` holds the shared primitives (`Card`, `Button`, `Chip`, `ProgressRing`, `BarChart`, `LineChart`, `Heatmap`, etc.) every screen is built from.

## MVP Scoping Principles

Before adding a feature, run it through this funnel (Raw idea → Shippable MVP). Treat these as guidance to bias decisions toward a lean, working loop — not hard gates that block otherwise-reasonable engineering work.

1. **Core Function** — the one thing this app does, statable in one sentence: "track recurring personal habits and show progress over time." If a proposed feature doesn't serve this, question it before building it.
2. **Core Loop** — the action → reward cycle. Ours: open app → tap/increment a habit → points + haptic + ring update, in under 5 seconds. Don't add friction (extra confirmation steps, full-screen modals on every completion) to this path.
3. **Accessory Features** — add only what supports the Core Loop or the stated reward system (categories, habit types, streaks, points, levels, achievements, reminders). If it doesn't serve those, cut it or defer it.
4. **Surface Area Check** — 4 tabs (Today, Insights, Rewards, Profile) plus habit create/edit (modals) and habit detail (pushed screen). Treat a 5th tab or a new top-level screen as a signal to reconsider, not a default next step.
5. **Retention Hook** — streaks/points/levels/achievements are the *investment* hooks ("don't break the chain"); per-habit local notification reminders (`src/lib/notifications.ts`) are the *trigger* that pulls the user back. Both exist now — don't rebuild either from scratch without checking what's there.

### Outside the funnel, still worth tracking
- **Success metric** — define what "the loop is working" means (e.g. day-7 return rate, average streak length) before investing further in features.
- **Validate before iterating** — prefer using the app for real days over speculatively adding features nobody's asked for.

### Scope of this checklist
This is a product-scoping heuristic for a personal, engagement-style app — not a universal rule for every project. Don't use it to block clearly necessary engineering work (bug fixes, accessibility, type safety, security) just because it doesn't fit the "loop" framing.

**Explicit product rule (from the original spec):** do not add social feeds, friends, chat, an AI coach, a marketplace, complex subscription screens, team habits, public profiles, leaderboards, or additional gamification beyond what's already here — unless the user explicitly asks for it later. This is a single-player, personal habit tracker; keep it that way.
