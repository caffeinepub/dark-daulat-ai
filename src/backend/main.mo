import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type PersistentUser = {
    name : Text;
    email : Text;
    mobile : Text;
    referralCode : Text;
    referredBy : ?Text;
    walletBalance : Nat;
    totalEarnings : Nat;
    pendingEarnings : Nat;
    withdrawnAmount : Nat;
    shareCount : Nat;
    isAdmin : Bool;
    createdAt : Time.Time;
  };

  public type User = PersistentUser;
  module User {
    type StoreEntry = {
      principal : Principal;
      user : PersistentUser;
    };

    public func compare(u1 : StoreEntry, u2 : StoreEntry) : Order.Order {
      Nat.compare(u2.user.totalEarnings, u1.user.totalEarnings);
    };
  };

  let users = Map.empty<Principal, PersistentUser>();

  public type PersistentDeal = {
    id : Nat;
    title : Text;
    imageUrl : Text;
    price : Nat;
    affiliateLink : Text;
    commissionPercent : Nat;
    trendingTag : Text;
    targetRegion : Text;
    description : Text;
    isActive : Bool;
    shareCount : Nat;
    createdAt : Time.Time;
  };

  public type Deal = PersistentDeal;
  let deals = Map.empty<Nat, PersistentDeal>();

  public type TransactionType = {
    #commission;
    #referral;
    #share;
    #adjustment;
    #withdrawal;
  };

  public type TransactionStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type PersistentTransaction = {
    id : Nat;
    userId : Principal;
    amount : Nat;
    transactionType : TransactionType;
    status : TransactionStatus;
    note : Text;
    timestamp : Time.Time;
  };

  public type Transaction = PersistentTransaction;
  let transactions = Map.empty<Nat, PersistentTransaction>();

  public type ProfitCalculation = {
    expectedEarnings : Nat;
    referralBonus : Nat;
    adminCut : Nat;
    netProfit : Nat;
  };

  public type LeaderboardEntry = {
    name : Text;
    referralCode : Text;
    totalEarnings : Nat;
  };

  public type AdminStats = {
    totalUsers : Nat;
    totalDeals : Nat;
    totalCommissionPaid : Nat;
    totalPendingWithdrawals : Nat;
    totalApprovedWithdrawals : Nat;
  };

  public type PersistentPersistentAffiliateAccountDetails = {
    upiId : ?Text;
    bankAccountNumber : ?Text;
    ifscCode : ?Text;
    accountHolderName : ?Text;
    bankName : ?Text;
    accountType : ?Text;
    branchName : ?Text;
    accountCreationDate : ?Text;
    validTillDate : ?Text;
    verificationStatus : ?Text;
  };

  public type PersistentAdminAffiliateSettings = {
    id : Nat;
    platformName : Text;
    affiliateId : Text;
    websiteUrl : Text;
    notes : Text;
    username : ?Text;
    apiKey : ?Text;
    contactEmail : ?Text;
    supportPhone : ?Text;
    createdBy : ?Principal;
    lastUpdatedBy : ?Principal;
    createdAt : Time.Time;
    lastUpdated : ?Time.Time;
  };

  public type AdminAffiliateSettings = PersistentAdminAffiliateSettings;

  public type AdminCommissionSummary = {
    adminTotal : Nat;
    lastUpdated : Time.Time;
  };

  public type AffiliateAccountStats = {
    totalAccounts : Nat;
    verifiedAccounts : Nat;
    unverifiedAccounts : Nat;
    activeAccounts : Nat;
    inactiveAccounts : Nat;
    validAccounts : Nat;
    expiredAccounts : Nat;
  };

  public type TransactionStatusSummary = {
    totalTransactions : Nat;
    pendingCount : Nat;
    approvedCount : Nat;
    rejectedCount : Nat;
    lastUpdated : Time.Time;
  };

  let affiliateAccounts = Map.empty<Principal, PersistentPersistentAffiliateAccountDetails>();
  let adminSettings = Map.empty<Text, PersistentAdminAffiliateSettings>();
  let adminCommissionSummary = Map.empty<Text, AdminCommissionSummary>();
  let affiliateAccountStats = Map.empty<Text, AffiliateAccountStats>();
  let transactionStatusSummary = Map.empty<Text, TransactionStatusSummary>();

  var nextDealId : Nat = 1;
  var nextTransactionId : Nat = 1;
  var nextAdminSettingsId : Nat = 1;
  var nextAffiliateAccountId : Nat = 1;

  public type MessageRole = {
    #user;
    #assistant;
  };

  public type PersistentMessage = {
    message : Text;
    role : MessageRole;
    timestamp : Time.Time;
  };

  public type Message = PersistentMessage;
  let messages = Map.empty<Principal, [PersistentMessage]>();

  // KYC Verfication
  public type KycDocType = {
    #aadhaar;
    #pan;
  };

  public type KycStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type KycRecord = {
    userId : Principal;
    docType : KycDocType;
    docNumber : Text;
    status : KycStatus;
    rejectionReason : ?Text;
    submittedAt : Time.Time;
    reviewedAt : ?Time.Time;
  };

  public type PersistentKyc = KycRecord;
  let kycStore = Map.empty<Principal, PersistentKyc>();

  // OTP verification
  public type OtpRecord = {
    code : Text;
    email : Text;
    mobile : Text;
    expiresAt : Time.Time;
    used : Bool;
  };

  public type PersistentOtp = OtpRecord;
  let otpStore = Map.empty<Principal, PersistentOtp>();

  // New Purchase Claim System
  public type PurchaseClaimStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type PersistentPurchaseClaim = {
    id : Nat;
    userId : Principal;
    dealId : Nat;
    trackingCode : Text;
    purchaseAmount : Nat;
    commissionAmount : Nat;
    userCommissionAmount : Nat;
    adminCommissionAmount : Nat;
    status : PurchaseClaimStatus;
    rejectionReason : ?Text;
    createdAt : Time.Time;
    confirmedAt : ?Time.Time;
    reviewedAt : ?Time.Time;
  };

  var nextPurchaseClaimId : Nat = 1;
  let purchaseClaims = Map.empty<Nat, PersistentPurchaseClaim>();

  // NEW state variable for admin earnings pool
  var adminEarningsPool : Nat = 0;

  // Required User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?User {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // FIX 1: saveCallerUserProfile protection
  public shared ({ caller }) func saveCallerUserProfile(profile : User) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingUser = users.get(caller);
    let protectedProfile : PersistentUser = {
      profile with
      isAdmin = switch (existingUser) {
        case (?existing) { existing.isAdmin };
        case (null) { false };
      };
      walletBalance = switch (existingUser) {
        case (?existing) { existing.walletBalance };
        case (null) { 0 };
      };
      totalEarnings = switch (existingUser) {
        case (?existing) { existing.totalEarnings };
        case (null) { 0 };
      };
      pendingEarnings = switch (existingUser) {
        case (?existing) { existing.pendingEarnings };
        case (null) { 0 };
      };
      withdrawnAmount = switch (existingUser) {
        case (?existing) { existing.withdrawnAmount };
        case (null) { 0 };
      };
      referralCode = switch (existingUser) {
        case (?existing) { existing.referralCode };
        case (null) { caller.toText() };
      };
    };

    users.add(caller, protectedProfile);
  };

  // OTP Functions
  public shared ({ caller }) func generateOtp(email : Text, mobile : Text) : async Text {
    let seed = (Time.now() / 1_000_000) % 1_000_000;
    let code = (if (seed < 100_000) { 100_000 + seed } else { seed }).toText();

    let internalOtp : PersistentOtp = {
      code = code;
      email;
      mobile;
      expiresAt = Time.now() + 10 * 60 * 1_000_000_000;
      used = false;
    };
    otpStore.add(caller, internalOtp);

    code;
  };

  public shared ({ caller }) func verifyOtp(email : Text, mobile : Text, code : Text) : async Bool {
    switch (otpStore.get(caller)) {
      case (null) { false };
      case (?otp) {
        if (otp.used or Time.now() > otp.expiresAt) {
          false;
        } else if (
          otp.email == email and otp.mobile == mobile and otp.code == code
        ) {
          let updatedOtp : PersistentOtp = {
            otp with used = true
          };
          otpStore.add(caller, updatedOtp);

          true;
        } else {
          false;
        };
      };
    };
  };

  // User Functions
  public shared ({ caller }) func register(name : Text, email : Text, mobile : Text, referralCode : ?Text) : async () {
    // Allow guests to register - no authorization check needed
    if (users.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    // Anti-self-referral check
    switch (referralCode) {
      case (?code) {
        if (code == caller.toText()) {
          Runtime.trap("Cannot use your own referral code");
        };
      };
      case (null) {};
    };

    let isFirstUser = users.isEmpty();

    let newUser : PersistentUser = {
      name;
      email;
      mobile;
      referralCode = caller.toText();
      referredBy = referralCode;
      walletBalance = 0;
      totalEarnings = 0;
      pendingEarnings = 0;
      withdrawnAmount = 0;
      shareCount = 0;
      isAdmin = isFirstUser;
      createdAt = Time.now();
    };
    users.add(caller, newUser);

    // Assign admin role to first user
    if (isFirstUser) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
    } else {
      accessControlState.userRoles.add(caller, #user);
    };
  };

  public query ({ caller }) func getUser() : async ?User {
    users.get(caller);
  };

  public shared ({ caller }) func updateUser(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    switch (users.get(caller)) {
      case (?user) {
        let updatedUser : PersistentUser = {
          user with name
        };
        users.add(caller, updatedUser);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  // Affiliate Account Functions
  public shared ({ caller }) func getAffiliateAccount(accountId : Principal) : async ?PersistentPersistentAffiliateAccountDetails {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be a user");
    };
    if (caller != accountId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own affiliate account");
    };
    affiliateAccounts.get(accountId);
  };

  public shared ({ caller }) func addOrUpdateAffiliateAccount(details : PersistentPersistentAffiliateAccountDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be a user");
    };

    let existingDetails = affiliateAccounts.get(caller);
    let updatedDetails : PersistentPersistentAffiliateAccountDetails = {
      upiId = switch (details.upiId, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.upiId };
        case (null, null) { null };
      };
      bankAccountNumber = switch (details.bankAccountNumber, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.bankAccountNumber };
        case (null, null) { null };
      };
      ifscCode = switch (details.ifscCode, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.ifscCode };
        case (null, null) { null };
      };
      accountHolderName = switch (details.accountHolderName, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.accountHolderName };
        case (null, null) { null };
      };
      bankName = switch (details.bankName, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.bankName };
        case (null, null) { null };
      };
      accountType = switch (details.accountType, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.accountType };
        case (null, null) { null };
      };
      branchName = switch (details.branchName, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.branchName };
        case (null, null) { null };
      };
      accountCreationDate = switch (details.accountCreationDate, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.accountCreationDate };
        case (null, null) { null };
      };
      validTillDate = switch (details.validTillDate, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.validTillDate };
        case (null, null) { null };
      };
      verificationStatus = switch (details.verificationStatus, existingDetails) {
        case (?v, _) { ?v };
        case (null, ?e) { e.verificationStatus };
        case (null, null) { null };
      };
    };
    affiliateAccounts.add(caller, updatedDetails);
  };

  public query ({ caller }) func getAllAffiliateAccounts() : async [PersistentPersistentAffiliateAccountDetails] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all affiliate accounts");
    };
    affiliateAccounts.values().toArray();
  };

  // Deal Functions
  public shared ({ caller }) func addDeal(
    title : Text,
    imageUrl : Text,
    price : Nat,
    affiliateLink : Text,
    commissionPercent : Nat,
    trendingTag : Text,
    targetRegion : Text,
    description : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add deals");
    };

    let deal : PersistentDeal = {
      id = nextDealId;
      title;
      imageUrl;
      price;
      affiliateLink;
      commissionPercent;
      trendingTag;
      targetRegion;
      description;
      isActive = true;
      shareCount = 0;
      createdAt = Time.now();
    };
    deals.add(nextDealId, deal);
    nextDealId += 1;
    deal.id;
  };

  public shared ({ caller }) func updateDeal(
    id : Nat,
    title : Text,
    imageUrl : Text,
    price : Nat,
    affiliateLink : Text,
    commissionPercent : Nat,
    trendingTag : Text,
    targetRegion : Text,
    description : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update deals");
    };

    switch (deals.get(id)) {
      case (?deal) {
        let updatedDeal : PersistentDeal = {
          deal with
          title;
          imageUrl;
          price;
          affiliateLink;
          commissionPercent;
          trendingTag;
          targetRegion;
          description;
        };
        deals.add(id, updatedDeal);
      };
      case (null) { Runtime.trap("Deal not found") };
    };
  };

  public shared ({ caller }) func deleteDeal(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete deals");
    };

    switch (deals.get(id)) {
      case (?deal) {
        let updatedDeal : PersistentDeal = {
          deal with isActive = false
        };
        deals.add(id, updatedDeal);
      };
      case (null) { Runtime.trap("Deal not found") };
    };
  };

  public query ({ caller }) func getActiveDeals() : async [Deal] {
    deals.values().toArray().filter<Deal>(func(d) { d.isActive });
  };

  public query ({ caller }) func getAllDeals() : async [Deal] {
    deals.values().toArray();
  };

  // FIX 3: trackShare per-deal-per-user once
  public shared ({ caller }) func trackShare(dealId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track shares");
    };

    let dealIdText = dealId.toText();
    let notePattern = "deal: " # dealIdText;
    let allTxns = transactions.values().toArray();
    for (txn in allTxns.vals()) {
      if (txn.userId == caller and txn.transactionType == #share and txn.note.contains(#text notePattern)) {
        Runtime.trap("Aap pehle se is deal ko share kar chuke hain aur share commission le chuke hain.");
      };
    };

    switch (deals.get(dealId)) {
      case (?deal) {
        let updatedDeal : PersistentDeal = {
          deal with shareCount = deal.shareCount + 1
        };
        deals.add(dealId, updatedDeal);

        switch (users.get(caller)) {
          case (?user) {
            let shareCommission : Nat = 5;
            let updatedUser : PersistentUser = {
              user with
              shareCount = user.shareCount + 1;
              pendingEarnings = user.pendingEarnings + shareCommission;
            };
            users.add(caller, updatedUser);

            let txn : PersistentTransaction = {
              id = nextTransactionId;
              userId = caller;
              amount = shareCommission;
              transactionType = #share;
              status = #approved;
              note = "Share commission for deal: " # dealIdText;
              timestamp = Time.now();
            };
            transactions.add(nextTransactionId, txn);
            nextTransactionId += 1;
          };
          case (null) { Runtime.trap("User not found") };
        };
      };
      case (null) { Runtime.trap("Deal not found") };
    };
  };

  public query func calculateProfit(productPrice : Nat, commissionPercent : Nat) : async ProfitCalculation {
    let expectedEarnings = (productPrice * commissionPercent) / 100;
    let referralBonus = (expectedEarnings * 5) / 100;
    let adminCut = (expectedEarnings * 15) / 100;
    let netProfit = expectedEarnings - referralBonus - adminCut;

    {
      expectedEarnings;
      referralBonus;
      adminCut;
      netProfit;
    };
  };

  public shared ({ caller }) func requestWithdrawal(amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };

    switch (kycStore.get(caller)) {
      case (null) { Runtime.trap("KYC complete karna zaroori hai withdrawal se pehle") };
      case (?kyc) {
        if (kyc.status != #approved) {
          Runtime.trap("KYC approved hona zaroori hai withdrawal ke liye");
        };
      };
    };

    if (amount < 200) {
      Runtime.trap("Minimum withdrawal amount is 200");
    };

    switch (users.get(caller)) {
      case (?user) {
        if (user.walletBalance < amount) {
          Runtime.trap("Insufficient balance");
        };

        let updatedUser : PersistentUser = {
          user with walletBalance = user.walletBalance - amount
        };
        users.add(caller, updatedUser);

        let txn : PersistentTransaction = {
          id = nextTransactionId;
          userId = caller;
          amount;
          transactionType = #withdrawal;
          status = #pending;
          note = "Withdrawal request";
          timestamp = Time.now();
        };
        transactions.add(nextTransactionId, txn);
        nextTransactionId += 1;
        txn.id;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func approveWithdrawal(transactionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    switch (transactions.get(transactionId)) {
      case (?txn) {
        if (txn.status != #pending) {
          Runtime.trap("Transaction is not pending");
        };

        let updatedTxn : PersistentTransaction = {
          txn with status = #approved
        };
        transactions.add(transactionId, updatedTxn);

        switch (users.get(txn.userId)) {
          case (?user) {
            let updatedUser : PersistentUser = {
              user with withdrawnAmount = user.withdrawnAmount + txn.amount
            };
            users.add(txn.userId, updatedUser);
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("Transaction not found") };
    };
  };

  public shared ({ caller }) func rejectWithdrawal(transactionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };

    switch (transactions.get(transactionId)) {
      case (?txn) {
        if (txn.status != #pending) {
          Runtime.trap("Transaction is not pending");
        };

        let updatedTxn : PersistentTransaction = {
          txn with status = #rejected
        };
        transactions.add(transactionId, updatedTxn);

        switch (users.get(txn.userId)) {
          case (?user) {
            let updatedUser : PersistentUser = {
              user with walletBalance = user.walletBalance + txn.amount
            };
            users.add(txn.userId, updatedUser);
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("Transaction not found") };
    };
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their transactions");
    };

    transactions.values().toArray().filter<Transaction>(func(t) { t.userId == caller });
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    transactions.values().toArray();
  };

  public shared ({ caller }) func createTrackingLink(dealId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sirf registered users hi tracking link create kar sakte hain");
    };

    switch (deals.get(dealId)) {
      case (null) { Runtime.trap("Deal nahi mili"); };
      case (?deal) {
        if (not deal.isActive) {
          Runtime.trap("Deal abhi inactive hai");
        };

        let trackingCode = "TRK-" # (Time.now() % 1_000_000).toText() # "-" # dealId.toText();
        let claim : PersistentPurchaseClaim = {
          id = nextPurchaseClaimId;
          userId = caller;
          dealId;
          trackingCode;
          purchaseAmount = 0;
          commissionAmount = 0;
          userCommissionAmount = 0;
          adminCommissionAmount = 0;
          status = #pending;
          rejectionReason = null;
          createdAt = Time.now();
          confirmedAt = null;
          reviewedAt = null;
        };

        purchaseClaims.add(nextPurchaseClaimId, claim);
        nextPurchaseClaimId += 1;

        trackingCode;
      };
    };
  };

  // FIX 2: confirmPurchase daily limit + price cap
  public shared ({ caller }) func confirmPurchase(trackingCode : Text, purchaseAmount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sirf registered users hi purchase confirm kar sakte hain");
    };

    let allClaims = purchaseClaims.entries().toArray();
    let filteredClaims = allClaims.filter(
      func((_, claim)) {
        claim.trackingCode == trackingCode and claim.userId == caller and claim.status == #pending and claim.purchaseAmount == 0
      }
    );

    if (filteredClaims.isEmpty()) {
      Runtime.trap("Tracking code nahi mila ya already confirmed hai");
    };

    let (claimId, claim) = filteredClaims[0];
    switch (deals.get(claim.dealId)) {
      case (null) { Runtime.trap("Deal nahi mili"); };
      case (?deal) {
        if (not deal.isActive) {
          Runtime.trap("Deal abhi inactive hai");
        };

        // === NEW: Price cap checks ===
        let maxAllowedAmount = deal.price * 2;
        if (purchaseAmount > maxAllowedAmount) {
          Runtime.trap("Purchase amount deal ki actual price se zyada nahi ho sakta. Maximum allowed: " # maxAllowedAmount.toText());
        };
        // Cap 2: Absolute maximum Rs.50,000 per claim
        if (purchaseAmount > 50000) {
          Runtime.trap("Ek claim mein maximum Rs.50,000 tak ki purchase amount allowed hai.");
        };

        let commissionAmount = (purchaseAmount * deal.commissionPercent) / 100;
        let userCommissionAmount = (purchaseAmount * 2) / 100;
        let adminCommissionAmount = (purchaseAmount * 3) / 100;

        // Check daily limit: count commission received today (last 24 hours)
        let now = Time.now();
        let oneDayAgo = now - (24 * 60 * 60 * 1_000_000_000);
        let allTxns = transactions.values().toArray();
        var totalTodayCommission : Nat = 0;
        for (txn in allTxns.vals()) {
          if (txn.userId == caller and txn.transactionType == #commission and txn.timestamp >= oneDayAgo) {
            totalTodayCommission += txn.amount;
          };
        };

        if (totalTodayCommission + userCommissionAmount > 10000) {
          Runtime.trap("Aaj ka daily limit (Rs.10,000) poora ho gaya. Kal dobara try karein.");
        };

        let updatedClaim : PersistentPurchaseClaim = {
          claim with
          purchaseAmount;
          commissionAmount;
          userCommissionAmount;
          adminCommissionAmount;
          status = #approved;
          confirmedAt = ?Time.now();
          reviewedAt = ?Time.now();
        };
        purchaseClaims.add(claimId, updatedClaim);

        switch (users.get(claim.userId)) {
          case (null) { Runtime.trap("User nahi mila"); };
          case (?user) {
            let updatedUser : PersistentUser = {
              user with
              walletBalance = user.walletBalance + userCommissionAmount;
              totalEarnings = user.totalEarnings + userCommissionAmount;
            };
            users.add(claim.userId, updatedUser);

            adminEarningsPool += adminCommissionAmount;

            let txn : PersistentTransaction = {
              id = nextTransactionId;
              userId = claim.userId;
              amount = userCommissionAmount;
              transactionType = #commission;
              status = #approved;
              note = "Purchase claim approved for deal: " # claim.dealId.toText();
              timestamp = Time.now();
            };
            transactions.add(nextTransactionId, txn);
            nextTransactionId += 1;

            switch (user.referredBy) {
              case (null) {};
              case (?referralCode) {
                let allUsers = users.entries().toArray();
                for ((principal, refUser) in allUsers.vals()) {
                  if (refUser.referralCode == referralCode) {
                    let referralBonus = (userCommissionAmount * 5) / 100;
                    let updatedReferrer : PersistentUser = {
                      refUser with
                      walletBalance = refUser.walletBalance + referralBonus;
                      totalEarnings = refUser.totalEarnings + referralBonus;
                    };
                    users.add(principal, updatedReferrer);

                    let refTxn : PersistentTransaction = {
                      id = nextTransactionId;
                      userId = principal;
                      amount = referralBonus;
                      transactionType = #referral;
                      status = #approved;
                      note = "Referral bonus from " # user.name;
                      timestamp = Time.now();
                    };
                    transactions.add(nextTransactionId, refTxn);
                    nextTransactionId += 1;
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func approvePurchaseClaim(claimId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Sirf admin hi purchase claim approve kar sakte hain");
    };

    switch (purchaseClaims.get(claimId)) {
      case (null) { Runtime.trap("Claim nahi mili"); };
      case (?claim) {
        if (claim.status != #pending or claim.purchaseAmount == 0) {
          Runtime.trap("Claim approve nahi ho sakti");
        };

        let updatedClaim : PersistentPurchaseClaim = {
          claim with
          status = #approved;
          reviewedAt = ?Time.now();
        };
        purchaseClaims.add(claimId, updatedClaim);

        switch (users.get(claim.userId)) {
          case (null) { Runtime.trap("User nahi mila"); };
          case (?user) {
            let updatedUser : PersistentUser = {
              user with
              walletBalance = user.walletBalance + claim.userCommissionAmount;
              totalEarnings = user.totalEarnings + claim.userCommissionAmount;
            };
            users.add(claim.userId, updatedUser);

            adminEarningsPool += claim.adminCommissionAmount;

            let txn : PersistentTransaction = {
              id = nextTransactionId;
              userId = claim.userId;
              amount = claim.userCommissionAmount;
              transactionType = #commission;
              status = #approved;
              note = "Purchase claim approved for deal: " # claim.dealId.toText();
              timestamp = Time.now();
            };
            transactions.add(nextTransactionId, txn);
            nextTransactionId += 1;

            switch (user.referredBy) {
              case (null) {};
              case (?referralCode) {
                let allUsers = users.entries().toArray();
                for ((principal, refUser) in allUsers.vals()) {
                  if (refUser.referralCode == referralCode) {
                    let referralBonus = (claim.userCommissionAmount * 5) / 100;
                    let updatedReferrer : PersistentUser = {
                      refUser with
                      walletBalance = refUser.walletBalance + referralBonus;
                      totalEarnings = refUser.totalEarnings + referralBonus;
                    };
                    users.add(principal, updatedReferrer);

                    let refTxn : PersistentTransaction = {
                      id = nextTransactionId;
                      userId = principal;
                      amount = referralBonus;
                      transactionType = #referral;
                      status = #approved;
                      note = "Referral bonus from " # user.name;
                      timestamp = Time.now();
                    };
                    transactions.add(nextTransactionId, refTxn);
                    nextTransactionId += 1;
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getAdminEarningsPool() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin earnings pool");
    };
    adminEarningsPool;
  };

  public shared ({ caller }) func rejectPurchaseClaim(claimId : Nat, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Sirf admin hi purchase claim reject kar sakte hain");
    };

    switch (purchaseClaims.get(claimId)) {
      case (null) { Runtime.trap("Claim nahi mili"); };
      case (?claim) {
        if (claim.status != #pending) {
          Runtime.trap("Claim reject nahi ho sakti");
        };

        let updatedClaim : PersistentPurchaseClaim = {
          claim with
          status = #rejected;
          rejectionReason = ?reason;
          reviewedAt = ?Time.now();
        };
        purchaseClaims.add(claimId, updatedClaim);
      };
    };
  };

  public query ({ caller }) func getMyPurchaseClaims() : async [PersistentPurchaseClaim] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sirf registered users hi apne claims dekh sakte hain");
    };

    purchaseClaims.values().toArray().filter<PersistentPurchaseClaim>(
      func(claim) { claim.userId == caller }
    );
  };

  public query ({ caller }) func getAllPurchaseClaims() : async [PersistentPurchaseClaim] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Sirf admin hi sab claims dekh sakte hain");
    };
    purchaseClaims.values().toArray();
  };

  public shared ({ caller }) func creditCommission(userId : Principal, amount : Nat, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can credit commission");
    };

    switch (users.get(userId)) {
      case (?user) {
        let updatedUser : PersistentUser = {
          user with
          walletBalance = user.walletBalance + amount;
          totalEarnings = user.totalEarnings + amount;
        };
        users.add(userId, updatedUser);

        let txn : PersistentTransaction = {
          id = nextTransactionId;
          userId;
          amount;
          transactionType = #commission;
          status = #approved;
          note;
          timestamp = Time.now();
        };
        transactions.add(nextTransactionId, txn);
        nextTransactionId += 1;

        switch (user.referredBy) {
          case (?referralCode) {
            let allUsers = users.entries().toArray();
            for ((principal, u) in allUsers.vals()) {
              if (u.referralCode == referralCode) {
                let referralBonus = (amount * 5) / 100;
                let updatedReferrer : PersistentUser = {
                  u with
                  walletBalance = u.walletBalance + referralBonus;
                  totalEarnings = u.totalEarnings + referralBonus;
                };
                users.add(principal, updatedReferrer);

                let refTxn : PersistentTransaction = {
                  id = nextTransactionId;
                  userId = principal;
                  amount = referralBonus;
                  transactionType = #referral;
                  status = #approved;
                  note = "Referral bonus from " # user.name;
                  timestamp = Time.now();
                };
                transactions.add(nextTransactionId, refTxn);
                nextTransactionId += 1;
              };
            };
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query func getLeaderboard() : async [LeaderboardEntry] {
    let allUsers = users.entries().toArray();
    let sorted = allUsers.sort(
      func(a, b) { Nat.compare(b.1.totalEarnings, a.1.totalEarnings) }
    );
    let len = sorted.size();
    let takeSize = if (len < 10) { len } else { 10 };
    let top10 = sorted.sliceToArray(0, takeSize);
    top10.map<(Principal, PersistentUser), LeaderboardEntry>(
      func(entry) {
        {
          name = entry.1.name;
          referralCode = entry.1.referralCode;
          totalEarnings = entry.1.totalEarnings;
        };
      }
    );
  };

  public shared ({ caller }) func setAdmin(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set other admins");
    };

    AccessControl.assignRole(accessControlState, caller, user, #admin);

    switch (users.get(user)) {
      case (?u) {
        let updatedUser : PersistentUser = {
          u with isAdmin = true
        };
        users.add(user, updatedUser);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };

    let allTxns = transactions.values().toArray();
    var totalCommissionPaid : Nat = 0;
    var totalPendingWithdrawals : Nat = 0;
    var totalApprovedWithdrawals : Nat = 0;

    for (txn in allTxns.vals()) {
      switch (txn.transactionType) {
        case (#commission) {
          if (txn.status == #approved) {
            totalCommissionPaid += txn.amount;
          };
        };
        case (#withdrawal) {
          if (txn.status == #pending) {
            totalPendingWithdrawals += txn.amount;
          };
          if (txn.status == #approved) {
            totalApprovedWithdrawals += txn.amount;
          };
        };
        case (_) {};
      };
    };

    {
      totalUsers = users.size();
      totalDeals = deals.size();
      totalCommissionPaid;
      totalPendingWithdrawals;
      totalApprovedWithdrawals;
    };
  };

  public shared ({ caller }) func addMessage(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let userMessage : PersistentMessage = {
      message;
      role = #user;
      timestamp = Time.now();
    };

    let assistantReply = if (message.contains(#text "help")) {
      "मैं आपकी कैसे मदद कर सकता हूं?";
    } else if (message.contains(#text "deal")) {
      "डील्स देखने के लिए डील्स सेक्शन में जाएं।";
    } else if (message.contains(#text "withdraw")) {
      "निकासी के लिए न्यूनतम राशि 200 है।";
    } else {
      "धन्यवाद! मैं आपकी मदद के लिए यहां हूं।";
    };

    let assistantMessage : PersistentMessage = {
      message = assistantReply;
      role = #assistant;
      timestamp = Time.now();
    };

    let existingMessages = switch (messages.get(caller)) {
      case (?msgs) { msgs };
      case (null) { [] };
    };

    messages.add(
      caller,
      existingMessages.concat([userMessage, assistantMessage])
    );
  };

  public query ({ caller }) func getMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their messages");
    };

    switch (messages.get(caller)) {
      case (?msgs) { msgs };
      case (null) { [] : [PersistentMessage] };
    };
  };

  public shared ({ caller }) func clearMessages() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their messages");
    };

    messages.remove(caller);
  };

  public shared ({ caller }) func saveAdminAffiliateSettings(settings : PersistentAdminAffiliateSettings) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save affiliate settings");
    };

    let id = nextAdminSettingsId;
    let newSettings : PersistentAdminAffiliateSettings = {
      settings with
      id;
      createdBy = ?caller;
      createdAt = Time.now();
      lastUpdated = ?Time.now();
      lastUpdatedBy = ?caller;
    };
    adminSettings.add(id.toText(), newSettings);
    nextAdminSettingsId += 1;
    id;
  };

  public query ({ caller }) func getAllAdminAffiliateSettings() : async [PersistentAdminAffiliateSettings] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all settings");
    };
    adminSettings.values().toArray();
  };

  public shared ({ caller }) func updateAdminCommissionSummary(adminName : Text, adminTotal : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update commission summary");
    };

    let summary : AdminCommissionSummary = {
      adminTotal;
      lastUpdated = Time.now();
    };
    adminCommissionSummary.add(adminName, summary);
  };

  public query ({ caller }) func getAdminCommissionSummary(adminName : Text) : async ?AdminCommissionSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view commission summary");
    };
    adminCommissionSummary.get(adminName);
  };

  public shared ({ caller }) func updateAffiliateAccountStats(
    statsId : Text,
    totalAccounts : Nat,
    verifiedAccounts : Nat,
    unverifiedAccounts : Nat,
    activeAccounts : Nat,
    inactiveAccounts : Nat,
    validAccounts : Nat,
    expiredAccounts : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update account stats");
    };

    let stats : AffiliateAccountStats = {
      totalAccounts;
      verifiedAccounts;
      unverifiedAccounts;
      activeAccounts;
      inactiveAccounts;
      validAccounts;
      expiredAccounts;
    };
    affiliateAccountStats.add(statsId, stats);
  };

  public query ({ caller }) func getAffiliateAccountStats(statsId : Text) : async ?AffiliateAccountStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view account stats");
    };
    affiliateAccountStats.get(statsId);
  };

  public shared ({ caller }) func updateTransactionStatusSummary(
    summaryId : Text,
    totalTransactions : Nat,
    pendingCount : Nat,
    approvedCount : Nat,
    rejectedCount : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update transaction summary");
    };

    let summary : TransactionStatusSummary = {
      totalTransactions;
      pendingCount;
      approvedCount;
      rejectedCount;
      lastUpdated = Time.now();
    };
    transactionStatusSummary.add(summaryId, summary);
  };

  public query ({ caller }) func getTransactionStatusSummary(summaryId : Text) : async ?TransactionStatusSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view transaction summary");
    };
    transactionStatusSummary.get(summaryId);
  };

  public shared ({ caller }) func adjustWalletBalance(userId : Principal, amount : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can adjust wallet balance");
    };

    switch (users.get(userId)) {
      case (?user) {
        let newBalance = if (amount >= 0) {
          user.walletBalance + Int.abs(amount);
        } else {
          if (user.walletBalance >= Int.abs(amount)) {
            user.walletBalance - Int.abs(amount);
          } else {
            0;
          };
        };
        let updatedUser : PersistentUser = {
          user with walletBalance = newBalance
        };
        users.add(userId, updatedUser);

        let txn : PersistentTransaction = {
          id = nextTransactionId;
          userId;
          amount = Int.abs(amount);
          transactionType = #adjustment;
          status = #approved;
          note = "Admin adjustment";
          timestamp = Time.now();
        };
        transactions.add(nextTransactionId, txn);
        nextTransactionId += 1;
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func submitKyc(docType : KycDocType, docNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit KYC");
    };

    switch (docType) {
      case (#aadhaar) {
        if (docNumber.size() != 12) {
          Runtime.trap("Aadhaar number must be 12 digits");
        };
      };
      case (#pan) {
        if (docNumber.size() != 10) {
          Runtime.trap("PAN number must be 10 characters");
        };
      };
    };

    switch (kycStore.get(caller)) {
      case (?existing) {
        if (existing.status == #approved) {
          Runtime.trap("KYC already approved hai");
        };
      };
      case (null) {};
    };

    let newKyc : PersistentKyc = {
      docType;
      docNumber;
      status = #pending;
      userId = caller;
      rejectionReason = null;
      submittedAt = Time.now();
      reviewedAt = null;
    };
    kycStore.add(caller, newKyc);
  };

  public query ({ caller }) func getMyKyc() : async ?KycRecord {
    kycStore.get(caller);
  };

  public query ({ caller }) func getAllKyc() : async [KycRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all KYC");
    };
    kycStore.values().toArray();
  };

  public shared ({ caller }) func approveKyc(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve KYC");
    };

    switch (kycStore.get(userId)) {
      case (?kyc) {
        let updatedKyc : PersistentKyc = {
          kyc with status = #approved;
          reviewedAt = ?Time.now();
          rejectionReason = null;
        };
        kycStore.add(userId, updatedKyc);
      };
      case (null) { Runtime.trap("KYC record not found") };
    };
  };

  public shared ({ caller }) func rejectKyc(userId : Principal, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject KYC");
    };

    switch (kycStore.get(userId)) {
      case (?kyc) {
        let updatedKyc : PersistentKyc = {
          kyc with status = #rejected;
          rejectionReason = ?reason;
          reviewedAt = ?Time.now();
        };
        kycStore.add(userId, updatedKyc);
      };
      case (null) { Runtime.trap("KYC record not found") };
    };
  };
};
