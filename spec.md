# Dark Daulat AI

## Current State
- Internet Identity based login with device fingerprint/PIN
- Registration form with email, mobile, name, referral code
- OTP generated on backend (generateOtp), verified (verifyOtp), but NO actual delivery -- OTP just existed in backend store and was previously shown on screen (now hidden). Users cannot actually receive OTP.
- KYC: document number only (Aadhaar 12-digit or PAN 10-char), no photo/document image upload
- Purchase claims: user types purchase amount manually, no proof required -- fraud possible
- Commission system: 2% user, 3% admin, automatic, daily limit Rs.10,000
- Admin panel with KYC approve/reject, claims management

## Requested Changes (Diff)

### Add
1. **Real OTP flow** -- Since this platform does not support email sending (email feature disabled), implement a TOTP-style verified OTP that is:
   - Generated and stored securely on backend
   - Shown to user ONLY via a server-side "view once" mechanism -- displayed one time after generation, then hidden
   - User must copy/note it when shown, then enter it in the verify step
   - Better UX notice explaining "Note down your OTP now -- it will not be shown again"
   - This is the honest, production-viable approach without real SMS/email integration

2. **KYC Photo/Document Upload** -- Add document image upload to KYC submission:
   - User can upload a photo of their Aadhaar or PAN card as a base64 image (max ~500KB)
   - Image stored as base64 Text in backend KycRecord
   - Admin sees thumbnail of uploaded document when reviewing KYC
   - Optional but strongly recommended -- UI shows it as "Highly Recommended"

3. **Purchase Fraud Prevention + Screenshot Upload**:
   - When user confirms a purchase, they MUST upload a screenshot of the completed order (order confirmation page / receipt)
   - Screenshot stored as base64 Text in PurchaseClaim backend record
   - Admin can view the screenshot when reviewing claims
   - Claims without screenshot are blocked from submission
   - Screenshot max ~800KB with client-side resize
   - Admin Claims tab shows screenshot thumbnail for each claim

### Modify
- `KycRecord` backend type: add `docImageBase64: ?Text` field
- `PersistentPurchaseClaim` backend type: add `proofImageBase64: ?Text` field
- `submitKyc` function: accept optional image data
- `confirmPurchase` function: require proof image parameter
- `OtpRecord` backend: add `shownOnce: Bool` flag -- once fetched, mark as shown
- Add new backend query `getOtpForDisplay`: returns OTP code if not yet shown, marks it shown; if already shown returns null
- KycPage frontend: add image upload section
- MyClaimsPage frontend: add screenshot upload requirement in ConfirmPurchaseForm
- AdminPage KYC tab: show document image thumbnails
- AdminPage Claims tab: show proof screenshot thumbnails
- LoginPage OTP step: show "Your OTP is: XXXXXX -- Note it now!" message after generation

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` backend:
   - Add `docImageBase64: ?Text` to KycRecord
   - Add `proofImageBase64: ?Text` to PurchaseClaim
   - Add `shownOnce: Bool` to OtpRecord
   - Add `getOtpForDisplay()` function -- returns OTP code string or null
   - Update `submitKyc` to accept image parameter
   - Update `confirmPurchase` to require proof image
2. Regenerate backend.d.ts to match new types
3. Update LoginPage: after OTP generation, call `getOtpForDisplay` and show OTP prominently with "Note it now" warning, then hide
4. Update KycPage: add image upload input (file input → base64 conversion), pass to submitKyc
5. Update MyClaimsPage ConfirmPurchaseForm: require screenshot upload, convert to base64, pass to confirmPurchase
6. Update AdminPage: KYC tab shows doc image thumbnail; Claims tab shows proof thumbnail
7. Validate, build, deploy
