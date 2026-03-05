# Dark Daulat AI

## Current State
Full-stack affiliate earning web app with:
- Internet Identity login
- User registration (name, email, mobile, referral code)
- Deals page (60+ products from multiple platforms)
- Wallet with withdrawal requests
- Referral system with leaderboard
- Admin panel (deals, users, withdrawals, affiliate settings)
- PWA support (manifest, service worker, install banner)

## Requested Changes (Diff)

### Add
- **OTP Verification**: After filling registration form, a 6-digit OTP is generated and stored on-chain (backend). User must enter OTP to confirm identity before registration completes. OTP has 10-minute expiry. "Resend OTP" option after expiry.
- **KYC System**: Backend stores KYC submissions (Aadhaar or PAN card number + document type). User must complete KYC before withdrawal is allowed. Admin can approve/reject KYC from Admin Panel. KYC status tracked per user (pending/approved/rejected).
- **New Logo**: Premium generated logo displayed on Login page, loading screens, and app header.
- **KYC Page** (`/kyc`): Dedicated page where users can submit Aadhaar (12 digits) or PAN card (10 chars). Shows current KYC status.
- **Admin KYC Tab**: Admin Panel gets a "KYC" tab to approve/reject pending KYC submissions.

### Modify
- **Backend `register` function**: Now requires an OTP to be verified before registration completes. Two-step: (1) `generateOtp(email, mobile)` stores OTP, (2) `register(name, email, mobile, otp, referralCode)` validates OTP then registers.
- **LoginPage**: Add OTP step between form fill and registration submit.
- **WalletPage**: Block withdrawal if KYC not approved. Show KYC prompt.
- **ProfilePage**: Show KYC status card with link to KYC page.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `main.mo` backend:
   - Add `PersistentOtp` type with code, email, mobile, expiry, used flag
   - Add `otpStore` map (Principal -> OtpRecord)
   - Add `generateOtp(email, mobile)` function -- generates 6-digit code, stores it, returns it (demo mode: returns OTP so frontend can show it)
   - Add `verifyOtp(email, mobile, otp)` function -- checks code, expiry, marks used
   - Add `PersistentKyc` type: docType (Aadhaar/PAN), docNumber, status (pending/approved/rejected), submittedAt, reviewedAt
   - Add `kycStore` map (Principal -> KycRecord)
   - Add `submitKyc(docType, docNumber)` function
   - Add `getMyKyc()` function
   - Add `getAllKyc()` admin function
   - Add `approveKyc(userId)` admin function
   - Add `rejectKyc(userId, reason)` admin function
   - Modify `register()` to accept `otp` parameter and validate before registering
   - Modify `requestWithdrawal()` to check KYC approved status

2. Update frontend:
   - Show new logo image on LoginPage, loading screens
   - Add OTP step to registration flow (after form fill, before submit)
   - Add `/kyc` route and KYcPage component
   - Add KYC status card on ProfilePage
   - Add KYC tab in AdminPage
   - Update useQueries.ts with new hooks (useGenerateOtp, useVerifyOtp, useSubmitKyc, useGetMyKyc, useGetAllKyc, useApproveKyc, useRejectKyc)
   - Block wallet withdrawal if KYC not approved
