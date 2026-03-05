import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  Deal,
  KycRecord,
  LeaderboardEntry,
  Message,
  PersistentAdminAffiliateSettings,
  PersistentPersistentAffiliateAccountDetails,
  ProfitCalculation,
  Transaction,
  User,
} from "../backend.d";
import { KycDocType } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── KYC Status Enum (not in backend.d.ts) ──────────────────────────────────
export enum KycStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export { KycDocType };

// ─── User Queries ───────────────────────────────────────────────────────────

export function useGetUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<User | null>({
    queryKey: ["user", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      if (identity.getPrincipal().isAnonymous()) return null;
      try {
        const result = await actor.getUser();
        if (result === null || result === undefined) return null;
        if (Array.isArray(result)) {
          return result.length > 0 ? (result[0] as User) : null;
        }
        return result as User;
      } catch (err) {
        console.error("getUser error:", err);
        return null;
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      !!identity &&
      !identity.getPrincipal().isAnonymous(),
    retry: 3,
    retryDelay: (attempt) => attempt * 1500,
    staleTime: 0,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      if (identity.getPrincipal().isAnonymous()) return false;
      try {
        // Check user.isAdmin from backend user record
        const result = await actor.getUser();
        if (result === null || result === undefined) return false;
        if (Array.isArray(result)) {
          return result.length > 0
            ? Boolean((result[0] as User).isAdmin)
            : false;
        }
        return Boolean((result as User).isAdmin);
      } catch {
        return false;
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      !!identity &&
      !identity.getPrincipal().isAnonymous(),
    staleTime: 0,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Deal Queries ───────────────────────────────────────────────────────────

export function useGetActiveDeals() {
  const { actor, isFetching } = useActor();
  return useQuery<Deal[]>({
    queryKey: ["activeDeals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveDeals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllDeals() {
  const { actor, isFetching } = useActor();
  return useQuery<Deal[]>({
    queryKey: ["allDeals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDeals();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Transaction Queries ─────────────────────────────────────────────────────

export function useGetTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["allTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Stats ─────────────────────────────────────────────────────────────

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats | null>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Chat Messages ───────────────────────────────────────────────────────────

export function useGetMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useRegister() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      mobile,
      referralCode,
    }: {
      name: string;
      email: string;
      mobile: string;
      referralCode: string | null;
    }) => {
      console.log("[useRegister] mutationFn called", {
        name,
        email,
        mobile,
        referralCode,
      });
      if (!actor) throw new Error("Actor not ready. Dobara try karein.");
      // Backend register() signature: register(name, email, mobile, referralCode: string | null)
      // Pass null directly — the ICP SDK handles optional Text encoding automatically
      // ICP Candid: optional Text must be [] for None, [value] for Some
      // Passing JS null directly causes "Failed to parse Candid" errors
      // Pass referralCode directly as string | null — the ICP SDK encodes ?Text correctly
      const refCode: string | null = referralCode?.trim()
        ? referralCode.trim()
        : null;
      try {
        await actor.register(name, email, mobile, refCode);
      } catch (err) {
        console.error("[useRegister] Backend error:", err);
        // Extract meaningful error from Candid reject
        const msg = String(err);
        if (msg.includes("already registered")) {
          throw new Error("already registered");
        }
        if (msg.includes("Cannot use your own referral")) {
          throw new Error("Aap apna referral code use nahi kar sakte.");
        }
        // Raw candid errors often have "Reject text:" prefix
        const rejectMatch = msg.match(/Reject text: (.+?)(?:\n|$)/);
        if (rejectMatch) throw new Error(rejectMatch[1]);
        const trapMatch = msg.match(/trap: (.+?)(?:\n|$)/i);
        if (trapMatch) throw new Error(trapMatch[1]);
        throw new Error(`Registration fail hui: ${msg.slice(0, 120)}`);
      }
    },
    onSuccess: () => {
      // Invalidate and force re-fetch user data
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.refetchQueries({ queryKey: ["user"] });
    },
  });
}

export function useTrackShare() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dealId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.trackShare(dealId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeDeals"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useCalculateProfit() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      price,
      commission,
    }: {
      price: bigint;
      commission: bigint;
    }): Promise<ProfitCalculation> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.calculateProfit(price, commission);
    },
  });
}

export function useRequestWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.requestWithdrawal(amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addMessage(message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useClearMessages() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.clearMessages();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useAddDeal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      imageUrl: string;
      price: bigint;
      affiliateLink: string;
      commissionPercent: bigint;
      trendingTag: string;
      targetRegion: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addDeal(
        params.title,
        params.imageUrl,
        params.price,
        params.affiliateLink,
        params.commissionPercent,
        params.trendingTag,
        params.targetRegion,
        params.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allDeals"] });
      qc.invalidateQueries({ queryKey: ["activeDeals"] });
    },
  });
}

export function useUpdateDeal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      imageUrl: string;
      price: bigint;
      affiliateLink: string;
      commissionPercent: bigint;
      trendingTag: string;
      targetRegion: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateDeal(
        params.id,
        params.title,
        params.imageUrl,
        params.price,
        params.affiliateLink,
        params.commissionPercent,
        params.trendingTag,
        params.targetRegion,
        params.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allDeals"] });
      qc.invalidateQueries({ queryKey: ["activeDeals"] });
    },
  });
}

export function useDeleteDeal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteDeal(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allDeals"] });
      qc.invalidateQueries({ queryKey: ["activeDeals"] });
    },
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txnId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.approveWithdrawal(txnId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTransactions"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txnId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rejectWithdrawal(txnId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allTransactions"] }),
  });
}

export function useAdjustWalletBalance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: {
      userId: Principal;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adjustWalletBalance(userId, amount);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allUsers"] }),
  });
}

export function useCreditCommission() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      note,
    }: {
      userId: Principal;
      amount: bigint;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.creditCommission(userId, amount, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      qc.invalidateQueries({ queryKey: ["allTransactions"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

// ─── Affiliate Account Queries ───────────────────────────────────────────────

export function useGetAffiliateAccount() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<PersistentPersistentAffiliateAccountDetails | null>({
    queryKey: ["affiliateAccount"],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const result = await actor.getAffiliateAccount(identity.getPrincipal());
      // Handle Candid optional unwrapping — may come as null, undefined, or [details]
      if (result === null || result === undefined) return null;
      if (Array.isArray(result)) return result.length > 0 ? result[0] : null;
      return result;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveAffiliateAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (details: {
      upiId?: string;
      bankAccountNumber?: string;
      ifscCode?: string;
      accountHolderName?: string;
      bankName?: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addOrUpdateAffiliateAccount(details);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["affiliateAccount"] }),
  });
}

export function useGetAllAdminAffiliateSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<PersistentAdminAffiliateSettings[]>({
    queryKey: ["adminAffiliateSettings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAdminAffiliateSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveAdminAffiliateSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: {
      id: bigint;
      platformName: string;
      affiliateId: string;
      websiteUrl: string;
      notes: string;
      username?: string;
      contactEmail?: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveAdminAffiliateSettings({
        ...settings,
        // createdAt is required (Time = bigint), lastUpdated is optional
        createdAt: BigInt(Date.now()) * 1_000_000n,
        lastUpdated: undefined,
      });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminAffiliateSettings"] }),
  });
}

// ─── OTP Mutations ───────────────────────────────────────────────────────────

export function useGenerateOtp() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      email,
      mobile,
    }: {
      email: string;
      mobile: string;
    }): Promise<string> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.generateOtp(email, mobile);
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      email,
      mobile,
      code,
    }: {
      email: string;
      mobile: string;
      code: string;
    }): Promise<boolean> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.verifyOtp(email, mobile, code);
    },
  });
}

// ─── KYC Queries & Mutations ─────────────────────────────────────────────────

export function useGetMyKyc() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<KycRecord | null>({
    queryKey: ["myKyc", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      if (identity.getPrincipal().isAnonymous()) return null;
      try {
        const result = await actor.getMyKyc();
        if (result === null || result === undefined) return null;
        if (Array.isArray(result))
          return result.length > 0 ? (result[0] as KycRecord) : null;
        return result as KycRecord;
      } catch {
        return null;
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      !!identity &&
      !identity.getPrincipal().isAnonymous(),
    staleTime: 0,
  });
}

export function useSubmitKyc() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      docType,
      docNumber,
    }: {
      docType: KycDocType;
      docNumber: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitKyc(docType, docNumber);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myKyc"] }),
  });
}

export function useGetAllKyc() {
  const { actor, isFetching } = useActor();
  return useQuery<KycRecord[]>({
    queryKey: ["allKyc"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKyc();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveKyc() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.approveKyc(userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allKyc"] }),
  });
}

export function useRejectKyc() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: Principal;
      reason: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.rejectKyc(userId, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allKyc"] }),
  });
}
