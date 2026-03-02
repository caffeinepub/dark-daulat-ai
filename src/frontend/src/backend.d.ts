import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PersistentPersistentAffiliateAccountDetails {
    bankAccountNumber?: string;
    validTillDate?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
    accountType?: string;
    accountCreationDate?: string;
    upiId?: string;
    branchName?: string;
    verificationStatus?: string;
}
export interface LeaderboardEntry {
    referralCode: string;
    name: string;
    totalEarnings: bigint;
}
export type Time = bigint;
export interface User {
    referralCode: string;
    name: string;
    createdAt: Time;
    pendingEarnings: bigint;
    shareCount: bigint;
    referredBy?: string;
    totalEarnings: bigint;
    isAdmin: boolean;
    withdrawnAmount: bigint;
    walletBalance: bigint;
}
export interface PersistentAdminAffiliateSettings {
    id: bigint;
    username?: string;
    websiteUrl: string;
    createdAt: Time;
    createdBy?: Principal;
    lastUpdated?: Time;
    lastUpdatedBy?: Principal;
    apiKey?: string;
    notes: string;
    affiliateId: string;
    contactEmail?: string;
    supportPhone?: string;
    platformName: string;
}
export interface AdminCommissionSummary {
    adminTotal: bigint;
    lastUpdated: Time;
}
export interface Transaction {
    id: bigint;
    status: TransactionStatus;
    transactionType: TransactionType;
    userId: Principal;
    note: string;
    timestamp: Time;
    amount: bigint;
}
export interface AdminStats {
    totalPendingWithdrawals: bigint;
    totalCommissionPaid: bigint;
    totalUsers: bigint;
    totalDeals: bigint;
    totalApprovedWithdrawals: bigint;
}
export interface AffiliateAccountStats {
    validAccounts: bigint;
    unverifiedAccounts: bigint;
    inactiveAccounts: bigint;
    expiredAccounts: bigint;
    verifiedAccounts: bigint;
    activeAccounts: bigint;
    totalAccounts: bigint;
}
export interface Deal {
    id: bigint;
    title: string;
    createdAt: Time;
    description: string;
    isActive: boolean;
    shareCount: bigint;
    imageUrl: string;
    commissionPercent: bigint;
    trendingTag: string;
    targetRegion: string;
    affiliateLink: string;
    price: bigint;
}
export interface Message {
    role: MessageRole;
    message: string;
    timestamp: Time;
}
export interface ProfitCalculation {
    adminCut: bigint;
    expectedEarnings: bigint;
    referralBonus: bigint;
    netProfit: bigint;
}
export interface TransactionStatusSummary {
    pendingCount: bigint;
    approvedCount: bigint;
    lastUpdated: Time;
    totalTransactions: bigint;
    rejectedCount: bigint;
}
export interface UserProfile {
    referralCode: string;
    name: string;
    createdAt: Time;
    pendingEarnings: bigint;
    shareCount: bigint;
    referredBy?: string;
    totalEarnings: bigint;
    isAdmin: boolean;
    withdrawnAmount: bigint;
    walletBalance: bigint;
}
export enum MessageRole {
    user = "user",
    assistant = "assistant"
}
export enum TransactionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum TransactionType {
    adjustment = "adjustment",
    referral = "referral",
    commission = "commission",
    share = "share",
    withdrawal = "withdrawal"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDeal(title: string, imageUrl: string, price: bigint, affiliateLink: string, commissionPercent: bigint, trendingTag: string, targetRegion: string, description: string): Promise<bigint>;
    addMessage(message: string): Promise<void>;
    addOrUpdateAffiliateAccount(details: PersistentPersistentAffiliateAccountDetails): Promise<void>;
    adjustWalletBalance(userId: Principal, amount: bigint): Promise<void>;
    approveWithdrawal(transactionId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateProfit(productPrice: bigint, commissionPercent: bigint): Promise<ProfitCalculation>;
    clearMessages(): Promise<void>;
    creditCommission(userId: Principal, amount: bigint, note: string): Promise<void>;
    deleteDeal(id: bigint): Promise<void>;
    getActiveDeals(): Promise<Array<Deal>>;
    getAdminAffiliateSettings(settingsId: string): Promise<PersistentAdminAffiliateSettings | null>;
    getAdminCommissionSummary(adminName: string): Promise<AdminCommissionSummary | null>;
    getAdminStats(): Promise<AdminStats>;
    getAffiliateAccount(callerId: Principal): Promise<PersistentPersistentAffiliateAccountDetails | null>;
    getAffiliateAccountStats(statsId: string): Promise<AffiliateAccountStats | null>;
    getAffiliateAccountsByStatus(status: string): Promise<Array<PersistentPersistentAffiliateAccountDetails>>;
    getAllAdminAffiliateSettings(): Promise<Array<PersistentAdminAffiliateSettings>>;
    getAllAffiliateAccounts(): Promise<Array<PersistentPersistentAffiliateAccountDetails>>;
    getAllDeals(): Promise<Array<Deal>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getAllUsers(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMessages(): Promise<Array<Message>>;
    getTransactionStatusSummary(summaryId: string): Promise<TransactionStatusSummary | null>;
    getTransactions(): Promise<Array<Transaction>>;
    getUser(): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminQuery(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    register(name: string, referralCode: string | null): Promise<void>;
    rejectWithdrawal(transactionId: bigint): Promise<void>;
    requestWithdrawal(amount: bigint): Promise<bigint>;
    saveAdminAffiliateSettings(settings: PersistentAdminAffiliateSettings): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdmin(user: Principal): Promise<void>;
    trackShare(dealId: bigint): Promise<void>;
    updateAdminCommissionSummary(adminName: string, adminTotal: bigint): Promise<void>;
    updateAffiliateAccountStats(statsId: string, totalAccounts: bigint, verifiedAccounts: bigint, unverifiedAccounts: bigint, activeAccounts: bigint, inactiveAccounts: bigint, validAccounts: bigint, expiredAccounts: bigint): Promise<void>;
    updateDeal(id: bigint, title: string, imageUrl: string, price: bigint, affiliateLink: string, commissionPercent: bigint, trendingTag: string, targetRegion: string, description: string): Promise<void>;
    updateTransactionStatusSummary(summaryId: string, totalTransactions: bigint, pendingCount: bigint, approvedCount: bigint, rejectedCount: bigint): Promise<void>;
    updateUser(name: string): Promise<void>;
    verifyAffiliateAccount(callerId: Principal, status: string): Promise<void>;
}
