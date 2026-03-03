import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldPersistentUser = {
    name : Text;
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

  type OldActor = {
    users : Map.Map<Principal, OldPersistentUser>;
  };

  type NewPersistentUser = {
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

  type NewActor = {
    users : Map.Map<Principal, NewPersistentUser>;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldPersistentUser, NewPersistentUser>(
      func(_key, oldPersistentUser) {
        {
          oldPersistentUser with
          email = "";
          mobile = "";
        };
      }
    );
    { old with users = newUsers };
  };
};
