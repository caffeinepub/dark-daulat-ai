# Dark Daulat AI

## Current State
- App uses Internet Identity (device fingerprint/PIN) for authentication via ICP
- Login page shows Internet Identity button, then registration form with name/email/mobile
- **Bug**: `useGetUser` hook calls `actor.getUser()` even on anonymous actor (when user is not logged in), causing "Unauthorized" error which breaks the registration flow -- user stays stuck on login page
- **Bug**: `getUser` backend function requires `#user` permission -- anonymous callers get a trap, which React Query treats as an error (not null), so `user === null` check never triggers `setShowRegister(true)`
- Security: email and mobile stored only in `localStorage` (not in backend) -- data is per-device only, easily lost
- BottomNav icons are size 22 -- small on mobile screens
- Pages work but have dense/small UI elements that are hard to read

## Requested Changes (Diff)

### Add
- `useGetUser` hook: guard so it only runs when identity is present (authenticated user only)
- LoginPage: improved error handling so when `getUser` throws (anonymous), it correctly shows registration form
- Backend: store email and mobile in `User` type so data persists on-chain (secure, not device-local)
- All pages: larger touch targets, clearer section headings, better spacing

### Modify
- `useGetUser` in `useQueries.ts`: add `enabled: !!actor && !isFetching && !!identity` so anonymous actor never calls `getUser`
- `LoginPage.tsx`: fix `useEffect` logic -- handle the case where `user` is `undefined` (query not yet run) vs `null` (user not registered) -- only show register form when `user` is explicitly `null` after identity is confirmed
- `BottomNav.tsx`: increase icon size from 22 to 28, increase nav height, bigger labels
- `HomePage.tsx`, `DealsPage.tsx`, `WalletPage.tsx`, `ProfilePage.tsx`, `CalculatorPage.tsx`, `ChatPage.tsx`: improve clarity -- larger text, clearer cards, better section separation
- Backend `register` function: accept email and mobile as parameters and store them in `PersistentUser`
- Backend `getUser` / `User` type: include `email` and `mobile` fields

### Remove
- localStorage usage for email/mobile contact info (replaced by on-chain storage)

## Implementation Plan
1. Fix `useGetUser` hook -- only enable when identity exists
2. Fix `LoginPage` useEffect -- properly distinguish `undefined` vs `null` user state
3. Update backend `PersistentUser` to include `email` and `mobile` fields
4. Update `register` function signature to accept email and mobile
5. Update `useRegister` mutation in `useQueries.ts` to pass email and mobile
6. Update `LoginPage` `handleRegister` to pass email and mobile to backend (remove localStorage)
7. Increase BottomNav icon sizes and touch areas
8. Polish all pages for clarity and readability
