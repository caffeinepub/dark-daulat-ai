import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldActor = {
    // Existing types and state from previous version
    users : Map.Map<Principal, {
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
    }>;
    // Add other existing state as needed
    // ... deals, transactions, etc.
  };

  type NewActor = {
    users : Map.Map<Principal, {
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
    }>;
    kycStore : Map.Map<Principal, {
      userId : Principal;
      docType : {
        #aadhaar;
        #pan;
      };
      docNumber : Text;
      status : {
        #pending;
        #approved;
        #rejected;
      };
      rejectionReason : ?Text;
      submittedAt : Time.Time;
      reviewedAt : ?Time.Time;
    }>;
    otpStore : Map.Map<Principal, {
      code : Text;
      email : Text;
      mobile : Text;
      expiresAt : Time.Time;
      used : Bool;
    }>;
    // Add other updated state as needed
    // ... deals, transactions, etc.
  };

  public func run(old : OldActor) : NewActor {
    let kycStore = Map.empty<Principal, {
      userId : Principal;
      docType : {
        #aadhaar;
        #pan;
      };
      docNumber : Text;
      status : {
        #pending;
        #approved;
        #rejected;
      };
      rejectionReason : ?Text;
      submittedAt : Time.Time;
      reviewedAt : ?Time.Time;
    }>();

    let otpStore = Map.empty<Principal, {
      code : Text;
      email : Text;
      mobile : Text;
      expiresAt : Time.Time;
      used : Bool;
    }>();

    {
      old with
      kycStore;
      otpStore;
    };
  };
};
