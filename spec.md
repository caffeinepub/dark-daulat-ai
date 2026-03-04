# Dark Daulat AI

## Current State
- App has Internet Identity login + registration form (name, email, mobile)
- Registration consistently fails despite multiple fix attempts
- Admin panel shows "Access Denied" because admin check logic is broken
- Profile page shows "Admin Panel" link but admin access fails
- Deals page has 60 sample Indian products (Amazon-only source, no multi-platform)
- Platform has full backend: users, deals, transactions, wallet, leaderboard, affiliate accounts

## Requested Changes (Diff)

### Add
- Multi-platform deals: add Flipkart, Alibaba, Fiverr-style products to sample deals (not just Amazon)
- Each platform clearly labeled with a badge (Amazon, Flipkart, Alibaba, Fiverr)
- Admin panel: show "E-Commerce Platform" field in deal form so admin can tag which platform a deal is from
- Deals page: filter tab for each platform (Amazon, Flipkart, Alibaba, Fiverr)
- Info section explaining how users earn: buy through affiliate link = commission to user + 2% to admin, share = tracking + bonus

### Modify
- **CRITICAL FIX 1 - Registration**: The `useRegister` mutation needs to handle the ICP Candid optional parameter correctly. The `register` function signature is `register(name, email, mobile, referralCode: string | null)`. The backend.d.ts says `string | null` but ICP Candid encodes optional as `[] | [string]`. Current code already does this with `refCodeCandid as any` but it still fails. The real fix: wrap entire mutation in better error handling, add a fallback where if register fails with "already registered" it treats as success and navigates home.
- **CRITICAL FIX 2 - Admin Panel "Access Denied"**: AdminPage.tsx needs to check `user.isAdmin` properly. The current `useIsAdmin()` hook queries `getUser()` again - this may race with registration. Fix: in AdminPage, use `useGetUser()` directly and check `user?.isAdmin === true`, not `useIsAdmin()`. Also add `isCallerAdmin()` as a fallback.
- **CRITICAL FIX 3 - Login "already authenticated" loop**: When `login()` is called and user is already authenticated, it throws "User is already authenticated" error. The LoginPage handles this but the flow breaks. Fix: detect this case clearly and skip the popup call entirely, just use existing identity.
- Deal cards: add clear platform badge (Amazon/Flipkart/Alibaba/Fiverr) on each product image
- Deals page platform filter tabs
- AdminPage: add "Platform" dropdown to deal form (Amazon, Flipkart, Alibaba, Fiverr)

### Remove
- Nothing to remove

## Implementation Plan
1. Fix LoginPage.tsx: better handling of "already authenticated" case - if `isAlreadyLoggedIn` is true when login button clicked, skip `login()` call entirely and just check user directly
2. Fix AdminPage.tsx: replace `useIsAdmin()` with direct `useGetUser()` check + also try `actor.isCallerAdmin()` as backup
3. Add multi-platform products to SAMPLE_DEALS in DealsPage.tsx - add 40 more products from Flipkart, Alibaba, Fiverr categories with platform field in trendingTag
4. Add platform filter tabs: Amazon, Flipkart, Alibaba, Fiverr
5. Add platform badge overlay on deal card images
6. Add platform field to AdminPage DealForm
