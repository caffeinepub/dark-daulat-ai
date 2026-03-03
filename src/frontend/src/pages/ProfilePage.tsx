import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  BanknoteIcon,
  ChevronRight,
  Copy,
  Crown,
  Loader2,
  LogOut,
  Settings,
  Share2,
  Trophy,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { LeaderboardEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAffiliateAccount,
  useGetLeaderboard,
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
            "linear-gradient(180deg, oklch(0.08 0 0) 0%, oklch(0.08 0 0 / 0.95) 100%)",
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
              }}
            >
              <Settings size={12} />
              Admin
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
                "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
              border: "1px solid oklch(0.28 0.04 85 / 0.4)",
            }}
          >
            <h3
              className="font-bold text-base mb-3"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              🎁 Aapka Referral Code
            </h3>

            <div
              className="rounded-xl p-3 flex items-center justify-between gap-3 mb-3"
              style={{
                background: "oklch(0.10 0 0)",
                border: "1px solid oklch(0.28 0.04 85 / 0.4)",
              }}
            >
              <span
                className="text-xl font-bold font-mono tracking-widest"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                {user.referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                data-ocid="profile.copy_button"
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: "oklch(0.78 0.12 85 / 0.15)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.3)",
                }}
              >
                <Copy size={15} style={{ color: "oklch(0.86 0.14 85)" }} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleShareReferral}
              className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
                boxShadow: "0 3px 12px oklch(0.78 0.12 85 / 0.3)",
              }}
            >
              <Share2 size={15} />
              WhatsApp pe Share Karo
            </button>

            <p
              className="text-xs mt-2 text-center"
              style={{ color: "oklch(0.45 0.01 85)" }}
            >
              Refer karo aur 5% lifetime bonus pao 🎁
            </p>
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
                    background: "oklch(0.10 0 0)",
                    border: "1px solid oklch(0.28 0.04 85 / 0.5)",
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
                    background: "oklch(0.10 0 0)",
                    border: "1px solid oklch(0.28 0.04 85 / 0.5)",
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
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.28 0.04 85 / 0.5)",
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
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.28 0.04 85 / 0.5)",
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
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.22 0.01 85)",
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
                            : "oklch(0.18 0 0)",
                        color:
                          rank <= 3 ? "oklch(0.08 0 0)" : "oklch(0.52 0.01 85)",
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
                        {entry.referralCode}
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

        {/* Footer */}
        <div className="text-center pt-2">
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
