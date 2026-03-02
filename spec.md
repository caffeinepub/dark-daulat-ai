# Dark Daulat AI

## Current State
- Internet Identity based login/signup (ICP's secure auth - no email/password, uses device fingerprint)
- Registration form collects name, email, mobile (stored in localStorage only)
- First registered user becomes admin automatically
- Deals system: admin adds deals with affiliate links, users share and earn commission
- Wallet system: track earnings, request withdrawals (min ₹200)
- Referral system: 5% lifetime bonus from referred user's earnings
- Share tracking: ₹5 commission per share
- Admin dashboard: manage deals, users, withdrawals, analytics
- Sample deals shown when backend has no deals yet
- Profit calculator

## Requested Changes (Diff)

### Add
- **Affiliate Account Management**: Users can save their own affiliate account details (UPI ID, bank account number, IFSC, account holder name) to the backend. This is used by admin to send payouts.
- **Admin Affiliate Account**: Admin can set their own affiliate details (Flipkart/Amazon affiliate account info like affiliate ID, website, payout info). Shown on admin dashboard.
- **2% Withdrawal Commission for Admin**: When any user requests a withdrawal, 2% of the withdrawal amount is automatically deducted as admin commission. User receives 98% of requested amount. The 2% goes to a separate admin earnings pool.
- **2% User Affiliate Earnings → Admin**: When a user earns from their own affiliate account (i.e., when admin credits commission to a user), 2% of that credited amount is automatically added to admin's commission pool.
- **Admin Commission Tracker**: Admin can see total collected withdrawal commissions and affiliate commissions in analytics tab.
- **Deals - "Buy" button**: Each deal card should have both "Share" and "Buy" buttons. Buy button opens the affiliate link directly so user can purchase.
- **Deals - Commission clarity**: Show clearly how much ₹ the user will earn if they share this deal (commission amount in rupees, not just %).

### Modify
- **Login Page**: Add clearer explanation that Internet Identity is a secure passwordless login (like fingerprint/PIN). Make the UX smoother - show a "How to Login" guide for new users. The login button should clearly say "Login / Register karein".
- **Withdrawal flow**: Deduct 2% admin commission at withdrawal time. Show user the deduction clearly ("2% platform fee: ₹X", "Aapko milega: ₹Y").
- **Profile Page**: Add "Mera Affiliate Account" section where user can save/update their payout details (UPI ID required, bank details optional).
- **Admin Dashboard**: Add "Affiliate Settings" tab where admin can enter their affiliate platform details. Add commission pool stats to analytics.

### Remove
- Nothing to remove

## Implementation Plan
1. Update Motoko backend:
   - Add `affiliateAccount` field to User (UPI ID, bank account, IFSC, account name)  
   - Add `saveAffiliateAccount` and `getAffiliateAccount` functions
   - Modify `requestWithdrawal` to deduct 2% admin commission, credit it to admin earnings pool
   - Add `adminCommissionPool` stable var to track total admin commissions collected
   - Modify `creditCommission` to take 2% for admin when crediting user
   - Add `getAdminCommissionStats` function for admin
   - Add admin affiliate settings storage

2. Update frontend:
   - LoginPage: improve UX, clearer Internet Identity explanation, step-by-step guide
   - DealsPage: add "Buy" button alongside "Share", show commission in ₹ amount
   - ProfilePage: add "Mera Affiliate Account" section with UPI/bank details form
   - WalletPage: show 2% fee deduction preview before withdrawal confirmation
   - AdminPage: add affiliate settings tab, show commission pool in analytics
