# RentalOS Owner – Phase 1.1 (NativeWind Refactor)

This is the **full Next.js + Expo monorepo**, based on the provided `Archive.zip`.
The **mobile Owner Portal UI** has been refactored to NativeWind 4 while retaining
mock data and the existing product behavior. Next.js web is untouched.

## Setup on macOS

At the repository root:

```bash
corepack enable
corepack install --global pnpm@12.11.2
pnpm install
pnpm --filter @starter/mobile exec expo install --check
pnpm --filter @starter/mobile typecheck
pnpm --filter @starter/mobile exec expo start --clear --web
```

To run in Expo Go / compatible development build, omit `--web` and open the
QR code. If native dependencies need rebuilding, follow Expo's SDK 57 instructions.

Mock sign-in: **demo@example.com** / **Password123!**. Demo auth does **not**
authenticate against a real server. Do not use demo tokens in production.

### Workspace structure

- `apps/mobile`: Expo SDK 57, Expo Router, React Native 0.86, NativeWind v4.2.7
- `apps/web`: Next.js frontend preserved from original archive
- `packages/shared`: Zod schemas, domain types, mock data, Zustand session store
- `apps/mobile/src/features/rentals/store/rental.store.ts`: Phase 1.1 mock business state

## Exact prototype theme

`apps/mobile/design-tokens.json` is the **single color source**.
Both `apps/mobile/tailwind.config.js` and
`apps/mobile/src/components/ui/theme.ts` load those same values.

| Token | Hex | Original HTML prototype |
|---|---|---|
| brand | `#186956` | `--brand` |
| brand-soft | `#E4F3ED` | `--brandsoft` |
| canvas | `#F5F7FB` | `--bg` |
| surface | `#FFFFFF` | `--paper` |
| ink | `#1D2E42` | `--ink` |
| muted | `#74849A` | `--muted` |
| line | `#E6EBF1` | `--line` |
| warning | `#CA7B21` | `--warn` |

The Dashboard's hero and property thumbnails use gradient PNG assets with
pixel colors matching the prototype. Red is reserved for destructive/error UI.
To change palette, edit **only** `apps/mobile/design-tokens.json`, restart Expo.

## Source fixes included beyond NativeWind

- Expo Router: one explicit `/` route, `/login`, `/register`, `/dashboard`; removed
  the colliding nested `index.tsx` files that caused `Unmatched Route`.
- Auth: `restoreMobileSession()` has a 5-second safety fallback instead of
  an infinite startup spinner; Web demo storage does not call native-only SecureStore.
- Zustand v5: selector outputs remain referentially stable (no `.filter()` inside
  a store selector), preventing `Maximum update depth exceeded`.
- Occupancy: select and move in several residents **atomically** with capacity
  and resident availability validation.
- Utilities: Settings catalogue with one-time or quantity-based fees;
  inline create-and-auto-select from the room form without losing draft values.
- Room history: tracks price, amenities, utilities, occupants and status;
  old lost historical changes cannot be reconstructed.
- Web actions: confirmation dialogs work in browser and on iOS/Android.
- Persisted mock data remains under key `rentalos-demo-rentals-v1`, using store
  migrations for older local data. To reset: Settings → Restore demo data.

## Validation

```bash
pnpm check:source
pnpm --filter @starter/mobile typecheck
pnpm --filter @starter/mobile exec expo install --check
```

`check:source` checks TS/TSX syntax, local module paths, route uniqueness, the
prototype palette and smoke tests for the Zustand business actions.

**Limits:** This package was checked statically and the mock store actions were
exercised in isolation. The environment used to prepare it could not reach the
npm registry, so a full `pnpm install`, `expo export`, device render and complete
TypeScript typecheck **have not been confirmed here**. Run the above commands in
your local development environment before using it as a release build.

## Security & future backend

Expo Web localStorage is for **demo credentials only**. For production auth use
HttpOnly Secure cookies on Web. Room-history entries here live in AsyncStorage,
not in a server-side immutable audit trail. Move them to PostgreSQL transactions
when integrating with NestJS.
