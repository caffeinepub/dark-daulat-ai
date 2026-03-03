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
import Migration "migration";

(with migration = Migration.run)
actor {
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
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };
  };

  // getUser (no authorization check)
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
    // Users can only view their own account, admins can view any account
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

  public query func getActiveDeals() : async [Deal] {
    deals.values().toArray().filter<Deal>(func(d) { d.isActive });
  };

  public query func getAllDeals() : async [Deal] {
    deals.values().toArray();
  };

  public shared ({ caller }) func trackShare(dealId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track shares");
    };

    // Update deal share count
    switch (deals.get(dealId)) {
      case (?deal) {
        let updatedDeal : PersistentDeal = {
          deal with shareCount = deal.shareCount + 1
        };
        deals.add(dealId, updatedDeal);

        // Update user share count and add small commission
        switch (users.get(caller)) {
          case (?user) {
            let shareCommission : Nat = 5; // Small commission for sharing
            let updatedUser : PersistentUser = {
              user with
              shareCount = user.shareCount + 1;
              pendingEarnings = user.pendingEarnings + shareCommission;
            };
            users.add(caller, updatedUser);

            // Create share transaction
            let txn : PersistentTransaction = {
              id = nextTransactionId;
              userId = caller;
              amount = shareCommission;
              transactionType = #share;
              status = #approved;
              note = "Share commission for deal: " # dealId.toText();
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

  // Transaction / Wallet Functions
  public shared ({ caller }) func requestWithdrawal(amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };

    if (amount < 200) {
      Runtime.trap("Minimum withdrawal amount is 200");
    };

    switch (users.get(caller)) {
      case (?user) {
        if (user.walletBalance < amount) {
          Runtime.trap("Insufficient balance");
        };

        // Deduct from wallet balance
        let updatedUser : PersistentUser = {
          user with walletBalance = user.walletBalance - amount
        };
        users.add(caller, updatedUser);

        // Create pending transaction
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

        // Update user withdrawn amount
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

        // Refund amount to wallet balance
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

        // Create commission transaction
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

        // Credit referral bonus to referrer if exists
        switch (user.referredBy) {
          case (?referralCode) {
            // Find referrer by referral code
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

                // Create referral transaction
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

  // Referral Leaderboard
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

  // Admin Functions
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

  // Chatbot Functions
  public shared ({ caller }) func addMessage(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let userMessage : PersistentMessage = {
      message;
      role = #user;
      timestamp = Time.now();
    };

    // Simple rule-based assistant reply in Hindi
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

  // Admin Affiliate Settings
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

  // Admin Commission Summary
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

  // Affiliate Account Stats
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

  // Transaction Status Summary
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

        // Create adjustment transaction
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
};
