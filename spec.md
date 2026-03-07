# Dark Daulat AI

## Current State
Full-stack affiliate earning app with deals, wallet, referral system, KYC, purchase claim tracking, and admin panel. Backend is in Motoko, frontend in React/TypeScript. Security fixes have been applied for admin protection, share spam, and daily commission limits.

## Requested Changes (Diff)

### Add
- In `confirmPurchase`: cap purchase amount to max `deal.price * 2` (to allow minor price variation) with clear error message
- In `confirmPurchase`: absolute per-claim max of ₹50,000 with clear error message
- Both caps checked BEFORE commission calculation and daily limit check

### Modify
- `confirmPurchase` function: add two validation checks at the top after deal lookup -- (1) `purchaseAmount > deal.price * 2` trap, (2) `purchaseAmount > 50000` trap

### Remove
- Nothing removed

## Implementation Plan
1. In `confirmPurchase`, after confirming the deal is active, add:
   - Check: if `purchaseAmount > deal.price * 2`, trap with message "Purchase amount deal ki actual price se zyada nahi ho sakta. Maximum: ₹{deal.price * 2}"
   - Check: if `purchaseAmount > 50000`, trap with message "Ek claim mein maximum ₹50,000 tak ki purchase amount allowed hai"
2. Keep all existing logic (daily limit, commission calculation, auto-approve) unchanged
3. No frontend changes needed -- existing error display already handles backend error messages
