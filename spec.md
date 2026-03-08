# Dark Daulat AI

## Current State

App mein `trackShare` backend function har share par ₹5 fixed commission deta hai, chahe koi purchase ho ya na ho. Yeh galat hai aur fraud ka rasta hai. DealsPage mein "Earn Kaise Karen" card mein bhi "Admin 2%" description galat hai.

## Requested Changes (Diff)

### Add
- Kuch nahi add karna

### Modify
- **Backend `trackShare` function**: ₹5 fixed commission hatao. Sirf deal shareCount aur user shareCount badhao. Koi earning nahi, koi transaction nahi. Earning sirf `confirmPurchase` ke baad milegi (product price ka 2%).
- **Frontend DealsPage "Earn Kaise Karen" card**: Commission split description sahi karo -- "User 2%" aur "Admin 3%", "Admin 2%" nahi.

### Remove
- Backend mein share transaction entry aur share commission logic (₹5)

## Implementation Plan

1. Generate new Motoko backend with fixed `trackShare` -- no commission on share, only shareCount increment
2. Update DealsPage "Earn Kaise Karen" card to show correct commission split (User 2%, Admin 3%)
