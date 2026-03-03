# Dark Daulat AI

## Current State
Full-stack affiliate earning app with:
- Internet Identity authentication
- User registration with name (email/mobile stored only in frontend state, NOT in backend)
- Deals marketplace with admin CRUD
- Wallet with withdrawal requests
- Referral system with 5% lifetime bonus
- Profit calculator
- AI chatbot
- Admin dashboard

**Critical Bug:** `getUser()` backend function has `AccessControl.hasPermission(caller, #user)` check which traps/throws for unregistered users. When a new user logs in for the first time, `getUser()` is called to determine if they need to register — but since they are not registered, they have no `#user` role, so the backend throws an error. The frontend never receives `null` (not registered), so `userQueryDone` stays false and the registration form never shows. Result: **registration is permanently broken for new users.**

Also: email and mobile number are collected in the frontend registration form but are NOT saved to the backend User record — they are only used for local validation.

## Requested Changes (Diff)

### Add
- `email` field to `PersistentUser` type stored in backend
- `mobile` field to `PersistentUser` type stored in backend
- `register()` function updated to accept `email` and `mobile` as parameters

### Modify
- `getUser()` — REMOVE the `AccessControl.hasPermission` authorization check entirely. Any caller (including anonymous/unregistered) must be able to call `getUser()` and receive `null` if not registered. This is the root cause fix.
- `register(name, referralCode)` → `register(name, email, mobile, referralCode)` — accept and store email and mobile
- `User` / `PersistentUser` type: add `email: Text` and `mobile: Text` fields

### Remove
- Nothing removed

## Implementation Plan
1. Update `PersistentUser` type to add `email: Text` and `mobile: Text`
2. Update `register()` to accept `email: Text` and `mobile: Text` parameters and store them
3. Fix `getUser()` to have NO authorization check — simply return `?User` for any caller (null if not registered)
4. Update frontend `useRegister` mutation to pass email and mobile
5. Update frontend `LoginPage` `handleRegister` to pass email and mobile to the mutation
