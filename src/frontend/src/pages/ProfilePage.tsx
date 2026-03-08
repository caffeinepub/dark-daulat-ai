import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  BanknoteIcon,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Loader2,
  LogOut,
  Settings,
  Share2,
  Shield,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { LeaderboardEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  KycStatus,
  useGetAffiliateAccount,
  useGetLeaderboard,
  useGetMyKyc,
  useGetUser,
  useSaveAffiliateAccount,
} from "../hooks/useQueries";

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clear, identity, isInitializing } = useInternetIdentity();
  const { data: user, isLoading } = useGetUser();

  // Redirect to login if not authenticated (wait for initialization first)
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);
  const { data: leaderboard = [], isLoading: lbLoading } = useGetLeaderboard();
  const { data: affiliateAccount, isLoading: affiliateLoading } =
    useGetAffiliateAccount();
  const { data: kyc, isLoading: kycLoading } = useGetMyKyc();
  const saveAffiliateMutation = useSaveAffiliateAccount();

  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [affiliateSaved, setAffiliateSaved] = useState(false);

  // Pre-fill form when affiliate account loads
  useEffect(() => {
    if (affiliateAccount) {
      setUpiId(affiliateAccount.upiId ?? "");
      setBankAccount(affiliateAccount.bankAccountNumber ?? "");
      setIfscCode(affiliateAccount.ifscCode ?? "");
      setAccountHolder(affiliateAccount.accountHolderName ?? "");
    }
  }, [affiliateAccount]);

  const handleSaveAffiliate = async () => {
    if (!upiId.trim()) {
      toast.error("UPI ID daalna zaroori hai");
      return;
    }
    try {
      await saveAffiliateMutation.mutateAsync({
        upiId: upiId.trim(),
        bankAccountNumber: bankAccount.trim() || undefined,
        ifscCode: ifscCode.trim() || undefined,
        accountHolderName: accountHolder.trim() || undefined,
      });
      setAffiliateSaved(true);
      toast.success("Payout account save ho gaya! ✅");
      setTimeout(() => setAffiliateSaved(false), 3000);
    } catch {
      toast.error("Save fail hua. Dobara try karo.");
    }
  };

  const handleCopyReferral = async () => {
    if (!user?.referralCode) return;
    const link = `${window.location.origin}/login?ref=${user.referralCode}`;
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copy ho gayi! 📋");
  };

  const handleShareReferral = () => {
    if (!user?.referralCode) return;
    const link = `${window.location.origin}/login?ref=${user.referralCode}`;
    const message = `🤑 Dark Daulat AI join karo aur paisa kamao! Mere referral link se register karo:\n${link}\n\nMera referral code: ${user.referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleLogout = () => {
    clear();
    navigate({ to: "/login" });
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.16 0.010 255) 0%, oklch(0.16 0.010 255 / 0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
            <h1
              className="text-xl font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              Profile
            </h1>
          </div>
          {user?.isAdmin && (
            <a
              href="/admin"
              data-ocid="profile.admin_panel_link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
              }}
            >
              <Settings size={12} />
              Admin Panel
            </a>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.04 85), oklch(0.18 0.06 85))",
            border: "1px solid oklch(0.78 0.12 85 / 0.4)",
            boxShadow: "0 8px 32px oklch(0.78 0.12 85 / 0.15)",
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.12 85) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-center gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
                boxShadow: "0 4px 16px oklch(0.78 0.12 85 / 0.4)",
              }}
            >
              {isLoading ? "?" : userInitials || "U"}
            </div>
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-1.5">
                  <div className="animate-shimmer h-5 w-24 rounded" />
                  <div className="animate-shimmer h-4 w-16 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg text-foreground truncate">
                      {user?.name || "User"}
                    </h2>
                    {user?.isAdmin && (
                      <Crown
                        size={14}
                        style={{ color: "oklch(0.86 0.14 85)" }}
                      />
                    )}
                  </div>
                  <p
                    className="text-xs font-mono"
                    style={{ color: "oklch(0.52 0.01 85)" }}
                  >
                    {identity?.getPrincipal().toString().slice(0, 24)}...
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          {!isLoading && user && (
            <div
              className="grid grid-cols-3 gap-2 mt-4 pt-4"
              style={{ borderTop: "1px solid oklch(0.78 0.12 85 / 0.2)" }}
            >
              {[
                { label: "Share Count", value: Number(user.shareCount) },
                {
                  label: "Kul Kamaai",
                  value: `₹${formatINR(user.totalEarnings)}`,
                },
                {
                  label: "Referral Bonus",
                  value: `₹${formatINR(user.pendingEarnings)}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p
                    className="font-bold text-base"
                    style={{ color: "oklch(0.86 0.14 85)" }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.52 0.01 85)" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* KYC Status Card */}
        {!kycLoading &&
          (() => {
            const kycStatus = kyc ? (kyc.status as unknown as string) : null;
            const isApproved =
              kycStatus === KycStatus.approved || kycStatus === "approved";
            const isPending =
              kycStatus === KycStatus.pending || kycStatus === "pending";
            const isRejected =
              kycStatus === KycStatus.rejected || kycStatus === "rejected";

            if (isApproved) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  data-ocid="profile.kyc_approved_card"
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.03 145), oklch(0.15 0.05 145))",
                    border: "1px solid oklch(0.55 0.18 145 / 0.4)",
                  }}
                >
                  <CheckCircle2
                    size={22}
                    style={{ color: "oklch(0.70 0.18 145)" }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.78 0.18 145)" }}
                    >
                      KYC Approved ✅
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.58 0.12 145)" }}
                    >
                      Ab Aap Withdraw Kar Sakte Ho
                    </p>
                  </div>
                </motion.div>
              );
            }

            if (isPending) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  data-ocid="profile.kyc_pending_card"
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.13 0.04 70), oklch(0.16 0.05 70))",
                    border: "1px solid oklch(0.65 0.15 75 / 0.4)",
                  }}
                >
                  <Clock size={22} style={{ color: "oklch(0.78 0.15 75)" }} />
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.82 0.15 75)" }}
                    >
                      KYC Review Mein Hai ⏳
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.12 75)" }}
                    >
                      24-48 ghante mein update milega
                    </p>
                  </div>
                </motion.div>
              );
            }

            if (isRejected) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  data-ocid="profile.kyc_rejected_card"
                  className="rounded-xl p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.12 0.04 25), oklch(0.15 0.06 25))",
                    border: "1px solid oklch(0.62 0.22 25 / 0.4)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle
                      size={22}
                      style={{ color: "oklch(0.68 0.22 25)" }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.72 0.22 25)" }}
                    >
                      KYC Rejected ❌
                    </p>
                  </div>
                  {kyc?.rejectionReason && (
                    <p
                      className="text-xs mb-3 pl-8"
                      style={{ color: "oklch(0.58 0.18 25)" }}
                    >
                      Reason: {kyc.rejectionReason}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/kyc" })}
                    data-ocid="profile.kyc_resubmit_button"
                    className="w-full h-9 rounded-xl text-xs font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.20 25), oklch(0.65 0.22 28))",
                      color: "oklch(0.96 0.01 25)",
                      border: "none",
                    }}
                  >
                    Dobara Submit Karo
                  </button>
                </motion.div>
              );
            }

            // No KYC yet
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                data-ocid="profile.kyc_required_card"
                className="rounded-xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.13 0.03 85 / 0.7), oklch(0.17 0.05 85 / 0.5))",
                  border: "1px solid oklch(0.78 0.12 85 / 0.35)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Shield size={20} style={{ color: "oklch(0.78 0.12 85)" }} />
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.86 0.14 85)" }}
                    >
                      KYC Zaruri Hai 🛡️
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.52 0.01 85)" }}
                    >
                      Withdrawal ke liye KYC complete karo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/kyc" })}
                  data-ocid="profile.kyc_complete_button"
                  className="w-full h-10 rounded-xl text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                    color: "oklch(0.08 0 0)",
                    border: "none",
                    boxShadow: "0 3px 12px oklch(0.78 0.12 85 / 0.3)",
                  }}
                >
                  KYC Complete Karo →
                </button>
              </motion.div>
            );
          })()}

        {/* Referral Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            data-ocid="profile.referral_code_card"
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.6), oklch(0.18 0.06 85 / 0.4))",
              border: "1px solid oklch(0.78 0.12 85 / 0.35)",
              boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.10)",
            }}
          >
            <h3
              className="font-bold text-base mb-1"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              🎁 Aapka Referral Code
            </h3>
            <p
              className="text-xs mb-3"
              style={{ color: "oklch(0.62 0.01 85)" }}
            >
              Dosto ko share karo, har purchase par 5% lifetime bonus pao!
            </p>

            {/* Short code display */}
            <div
              className="rounded-xl p-3 flex items-center justify-between gap-3 mb-2"
              style={{
                background: "oklch(0.16 0.010 255)",
                border: "1px solid oklch(0.78 0.12 85 / 0.4)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] mb-0.5"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  Referral Code
                </p>
                <span
                  className="text-base font-bold font-mono tracking-wider block truncate"
                  style={{ color: "oklch(0.86 0.14 85)" }}
                >
                  {user.referralCode.length > 16
                    ? `${user.referralCode.slice(0, 12)}...`
                    : user.referralCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyReferral}
                data-ocid="profile.copy_button"
                className="p-2 rounded-lg shrink-0 transition-colors"
                style={{
                  background: "oklch(0.78 0.12 85 / 0.15)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.4)",
                }}
                title="Copy referral link"
              >
                <Copy size={15} style={{ color: "oklch(0.86 0.14 85)" }} />
              </button>
            </div>

            {/* Full link preview */}
            <div
              className="rounded-lg px-3 py-2 mb-3 flex items-center gap-2"
              style={{
                background: "oklch(0.20 0.010 255)",
                border: "1px solid oklch(0.30 0.015 255)",
              }}
            >
              <span
                className="text-[10px] shrink-0"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                Link:
              </span>
              <span
                className="text-[10px] font-mono truncate flex-1"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                {`${window.location.origin}/login?ref=${user.referralCode.slice(0, 12)}...`}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                data-ocid="profile.copy_link_button"
                className="text-[10px] shrink-0 font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: "oklch(0.78 0.12 85 / 0.15)",
                  color: "oklch(0.86 0.14 85)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.3)",
                }}
              >
                Copy
              </button>
            </div>

            <button
              type="button"
              onClick={handleShareReferral}
              data-ocid="profile.share_button"
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
                boxShadow: "0 3px 16px oklch(0.78 0.12 85 / 0.35)",
              }}
            >
              <Share2 size={16} />
              WhatsApp pe Share Karo
            </button>
          </motion.div>
        )}

        {/* Affiliate / Payout Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          data-ocid="profile.affiliate_card"
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BanknoteIcon size={20} style={{ color: "oklch(0.78 0.12 85)" }} />
            <h3
              className="font-bold text-base"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              💳 Mera Payout Account
            </h3>
          </div>

          {affiliateLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <div key={i} className="animate-shimmer h-9 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label
                  className="text-xs mb-1.5 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  UPI ID * (Jaise: yourname@upi)
                </Label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  data-ocid="profile.upi_input"
                  className="h-9 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.20 0.010 255)",
                    border: "1px solid oklch(0.30 0.015 255)",
                    color: "oklch(0.96 0.015 85)",
                  }}
                />
              </div>
              <div>
                <Label
                  className="text-xs mb-1.5 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Account Holder Name (Optional)
                </Label>
                <Input
                  placeholder="Jaise: Rahul Kumar"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  data-ocid="profile.account_holder_input"
                  className="h-9 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.20 0.010 255)",
                    border: "1px solid oklch(0.30 0.015 255)",
                    color: "oklch(0.96 0.015 85)",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label
                    className="text-xs mb-1.5 block"
                    style={{ color: "oklch(0.62 0.01 85)" }}
                  >
                    Bank Account (Optional)
                  </Label>
                  <Input
                    placeholder="Account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    data-ocid="profile.bank_account_input"
                    className="h-9 rounded-xl text-sm"
                    style={{
                      background: "oklch(0.20 0.010 255)",
                      border: "1px solid oklch(0.30 0.015 255)",
                      color: "oklch(0.96 0.015 85)",
                    }}
                  />
                </div>
                <div>
                  <Label
                    className="text-xs mb-1.5 block"
                    style={{ color: "oklch(0.62 0.01 85)" }}
                  >
                    IFSC Code (Optional)
                  </Label>
                  <Input
                    placeholder="SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    data-ocid="profile.ifsc_input"
                    className="h-9 rounded-xl text-sm"
                    style={{
                      background: "oklch(0.20 0.010 255)",
                      border: "1px solid oklch(0.30 0.015 255)",
                      color: "oklch(0.96 0.015 85)",
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveAffiliate}
                disabled={saveAffiliateMutation.isPending}
                data-ocid="profile.save_affiliate_button"
                className="w-full h-10 text-sm font-semibold rounded-xl"
                style={
                  affiliateSaved
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.45 0.18 160), oklch(0.58 0.20 155))",
                        color: "oklch(0.96 0.01 145)",
                        border: "none",
                      }
                    : {
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                        color: "oklch(0.08 0 0)",
                        border: "none",
                        boxShadow: "0 4px 16px oklch(0.78 0.12 85 / 0.3)",
                      }
                }
              >
                {saveAffiliateMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Save ho raha hai...
                  </>
                ) : affiliateSaved ? (
                  "✅ Saved!"
                ) : (
                  "Payout Account Save Karo"
                )}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-ocid="profile.leaderboard_list"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={20} style={{ color: "oklch(0.78 0.12 85)" }} />
            <h3
              className="font-bold text-base"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              🏆 Top Earners Leaderboard
            </h3>
          </div>

          {lbLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                <div key={i} className="animate-shimmer h-14 rounded-xl" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: "oklch(0.18 0.010 255)",
                border: "1px solid oklch(0.28 0.012 255)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
                Abhi koi leaderboard data nahi hai
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry: LeaderboardEntry, i) => {
                const isMe = user?.referralCode === entry.referralCode;
                const rank = i + 1;
                return (
                  <motion.div
                    key={entry.referralCode}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{
                      background: isMe
                        ? "linear-gradient(135deg, oklch(0.14 0.04 85), oklch(0.18 0.06 85))"
                        : "linear-gradient(135deg, oklch(0.12 0.002 85), oklch(0.14 0.005 85))",
                      border: `1px solid ${isMe ? "oklch(0.78 0.12 85 / 0.4)" : "oklch(0.22 0.01 85)"}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base font-bold"
                      style={{
                        background:
                          rank <= 3
                            ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))"
                            : "oklch(0.24 0.010 255)",
                        color:
                          rank <= 3 ? "oklch(0.08 0 0)" : "oklch(0.65 0.01 85)",
                      }}
                    >
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm truncate"
                          style={{
                            color: isMe
                              ? "oklch(0.86 0.14 85)"
                              : "oklch(0.82 0.05 85)",
                          }}
                        >
                          {entry.name}
                        </span>
                        {isMe && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0"
                            style={{
                              background: "oklch(0.78 0.12 85 / 0.2)",
                              color: "oklch(0.86 0.14 85)",
                              border: "1px solid oklch(0.78 0.12 85 / 0.4)",
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: "oklch(0.45 0.01 85)" }}
                      >
                        {entry.referralCode.length > 8
                          ? `${entry.referralCode.slice(0, 8)}...`
                          : entry.referralCode}
                      </span>
                    </div>
                    <span
                      className="font-bold text-sm shrink-0"
                      style={{
                        color:
                          rank <= 3
                            ? "oklch(0.86 0.14 85)"
                            : "oklch(0.62 0.01 85)",
                      }}
                    >
                      ₹{formatINR(entry.totalEarnings)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="w-full rounded-xl p-4 flex items-center justify-between transition-colors"
          style={{
            background: "oklch(0.62 0.22 25 / 0.08)",
            border: "1px solid oklch(0.62 0.22 25 / 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} style={{ color: "oklch(0.68 0.22 25)" }} />
            <span
              className="font-medium text-sm"
              style={{ color: "oklch(0.68 0.22 25)" }}
            >
              Logout
            </span>
          </div>
          <ChevronRight size={16} style={{ color: "oklch(0.68 0.22 25)" }} />
        </motion.button>

        {/* Policy Links */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1">
          {[
            { label: "Disclaimer", to: "/disclaimer" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
          ].map(({ label, to }) => (
            <button
              key={to}
              type="button"
              onClick={() => navigate({ to: to as "/" })}
              data-ocid={`profile.${label.toLowerCase().replace(/ /g, "_")}_link`}
              className="text-[11px] underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: "oklch(0.62 0.09 85)" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-1 pb-2">
          <p className="text-[10px]" style={{ color: "oklch(0.30 0.01 85)" }}>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
