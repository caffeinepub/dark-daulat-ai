import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  Deal,
  LeaderboardEntry,
  Message,
  PersistentAdminAffiliateSettings,
  PersistentPersistentAffiliateAccountDetails,
  ProfitCalculation,
  Transaction,
  User,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── User Queries ───────────────────────────────────────────────────────────

export function useGetUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getUser();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
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
      if (!actor) throw new Error("Actor not ready");
      return actor.register(name, email, mobile, referralCode);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),
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
      return actor.getAffiliateAccount(identity.getPrincipal());
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
        createdAt: BigInt(0),
        lastUpdated: BigInt(0),
      });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminAffiliateSettings"] }),
  });
}
