import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  Copy,
  Crown,
  Gift,
  Share2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { LeaderboardEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetLeaderboard,
  useGetMyPurchaseClaims,
  useGetUser,
} from "../hooks/useQueries";

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

function getRankStyle(rank: number) {
  if (rank === 1)
    return {
      bg: "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
      color: "oklch(0.08 0 0)",
      icon: "👑",
    };
  if (rank === 2)
    return {
      bg: "linear-gradient(135deg, oklch(0.70 0 0), oklch(0.85 0 0))",
      color: "oklch(0.12 0 0)",
      icon: "🥈",
    };
  if (rank === 3)
    return {
      bg: "linear-gradient(135deg, oklch(0.55 0.10 55), oklch(0.65 0.12 50))",
      color: "oklch(0.96 0 0)",
      icon: "🥉",
    };
  return {
    bg: "oklch(0.16 0.01 85)",
    color: "oklch(0.82 0.05 85)",
    icon: `#${rank}`,
  };
}

export default function SharePage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: user, isLoading } = useGetUser();
  const { data: leaderboard = [], isLoading: lbLoading } = useGetLeaderboard();
  const { data: myClaims = [] } = useGetMyPurchaseClaims();

  // Count pending claims that need purchase confirmation (purchaseAmount == 0)
  const pendingConfirmCount = myClaims.filter(
    (c) =>
      (c.status as unknown as string) === "pending" && c.purchaseAmount === 0n,
  ).length;

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  const referralCode = user?.referralCode ?? "";
  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copy ho gaya!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copy ho gaya!");
  };

  const shareWhatsApp = () => {
    const message = `🤑 *Dark Daulat AI* se kamayi karo! Products share karo aur commission kamao.\n\n💎 Referral Code: *${referralCode}*\n🔗 Join Karo: ${referralLink}\n\n✅ Har purchase pe 5-20% commission milta hai!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const top5 = leaderboard.slice(0, 5);

  return (
    <div className="min-h-screen pb-8">
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
        <div className="flex items-center gap-2">
          <Share2 size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            Share & Earn
          </h1>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.52 0.01 85)" }}>
          Dosto ko invite karo, 5% lifetime bonus pao
        </p>
      </header>

      <div className="px-4 space-y-5 mt-4">
        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.04 85), oklch(0.18 0.06 85))",
            border: "2px solid oklch(0.78 0.12 85 / 0.5)",
            boxShadow: "0 8px 32px oklch(0.78 0.12 85 / 0.2)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.12 85 / 0.2) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Gift size={20} style={{ color: "oklch(0.86 0.14 85)" }} />
              <span
                className="text-sm font-bold"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                Aapka Referral Code
              </span>
            </div>

            {isLoading ? (
              <div className="animate-shimmer h-14 w-full rounded-xl mb-3" />
            ) : (
              <div
                className="rounded-xl p-4 mb-3 flex items-center justify-between"
                style={{
                  background: "oklch(0.16 0.010 255 / 0.6)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.3)",
                }}
              >
                <span
                  className="text-2xl font-bold tracking-widest"
                  style={{ color: "oklch(0.96 0.02 85)" }}
                  data-ocid="share.referral_input"
                >
                  {referralCode || "—"}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  data-ocid="share.referral_code_button"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                    color: "oklch(0.08 0 0)",
                  }}
                >
                  <Copy size={14} />
                  <span className="text-xs font-bold">Copy</span>
                </button>
              </div>
            )}

            {/* Referral Link */}
            <div
              className="rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 mb-4"
              style={{
                background: "oklch(0.18 0.010 255 / 0.8)",
                border: "1px solid oklch(0.28 0.04 85 / 0.4)",
              }}
            >
              <span
                className="text-xs truncate flex-1"
                style={{ color: "oklch(0.55 0.01 85)" }}
              >
                {referralLink}
              </span>
              <button
                type="button"
                onClick={copyLink}
                data-ocid="share.link_button"
                className="shrink-0 p-1.5 rounded-md"
                style={{
                  background: "oklch(0.22 0.03 85)",
                  color: "oklch(0.78 0.12 85)",
                }}
              >
                <Copy size={12} />
              </button>
            </div>

            {/* WhatsApp Share */}
            <Button
              onClick={shareWhatsApp}
              data-ocid="share.whatsapp_button"
              className="w-full h-12 text-base font-bold rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.50 0.20 155), oklch(0.62 0.22 150))",
                color: "oklch(0.98 0.01 145)",
                border: "none",
                boxShadow: "0 4px 16px oklch(0.55 0.20 150 / 0.4)",
              }}
            >
              <span className="mr-2">📲</span>
              WhatsApp pe Share Karo
            </Button>
          </div>
        </motion.div>

        {/* Meri Claims Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/my-claims" })}
            data-ocid="share.claims_button"
            className="w-full rounded-2xl p-4 text-left transition-all active:scale-98"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.7), oklch(0.18 0.06 85 / 0.5))",
              border: "1px solid oklch(0.78 0.12 85 / 0.4)",
              boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                  }}
                >
                  <ClipboardList
                    size={18}
                    style={{ color: "oklch(0.08 0 0)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.86 0.14 85)" }}
                  >
                    Meri Claims Dekho
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.01 85)" }}
                  >
                    {pendingConfirmCount > 0
                      ? `${pendingConfirmCount} purchase confirm karna baaki hai!`
                      : "Share karo, khareedari track karo"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pendingConfirmCount > 0 && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{
                      background: "oklch(0.75 0.15 80 / 0.25)",
                      color: "oklch(0.88 0.15 80)",
                      border: "1px solid oklch(0.75 0.15 80 / 0.4)",
                    }}
                  >
                    {pendingConfirmCount}
                  </span>
                )}
                <ArrowRight
                  size={18}
                  style={{ color: "oklch(0.62 0.08 85)" }}
                />
              </div>
            </div>
          </button>
        </motion.div>

        {/* 5% Bonus Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.003 85), oklch(0.15 0.01 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} style={{ color: "oklch(0.86 0.14 85)" }} />
            <h3
              className="text-base font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              5% Lifetime Bonus
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: "👤",
                title: "Aap Share Karo",
                desc: "Apna code dosto ko bhejo",
              },
              {
                icon: "💰",
                title: "Woh Kamayein",
                desc: "Jab woh commission kamaayein",
              },
              {
                icon: "🎁",
                title: "Aapko Bonus",
                desc: "Unki kamayi ka 5% aapko",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
                style={{
                  background: "oklch(0.18 0.010 255 / 0.5)",
                  border: "1px solid oklch(0.22 0.02 85 / 0.5)",
                }}
              >
                <span className="text-2xl">{icon}</span>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.82 0.05 85)" }}
                >
                  {title}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "oklch(0.62 0.010 85)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <div
            className="mt-3 rounded-lg px-3 py-2 text-center text-xs"
            style={{
              background: "oklch(0.55 0.18 145 / 0.12)",
              border: "1px solid oklch(0.55 0.18 145 / 0.25)",
              color: "oklch(0.70 0.18 145)",
            }}
          >
            ✅ Lifetime bonus — jab tak woh kamaayein, aap bhi kamaayein!
          </div>
        </motion.div>

        {/* Your Referral Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
              border: "1px solid oklch(0.28 0.04 85 / 0.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} style={{ color: "oklch(0.78 0.12 85)" }} />
              <h3
                className="text-base font-bold"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                Aapki Stats
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: "oklch(0.18 0.010 255 / 0.5)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.2)",
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.86 0.14 85)" }}
                >
                  {Number(user.shareCount)}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.52 0.01 85)" }}>
                  Total Shares
                </p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: "oklch(0.18 0.010 255 / 0.5)",
                  border: "1px solid oklch(0.55 0.18 145 / 0.2)",
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.70 0.18 145)" }}
                >
                  ₹{formatINR(user.totalEarnings)}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.52 0.01 85)" }}>
                  Kul Kamayi
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} style={{ color: "oklch(0.86 0.14 85)" }} />
            <h3
              className="text-base font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              Top Earners Leaderboard
            </h3>
          </div>

          {lbLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                  key={i}
                  className="animate-shimmer h-12 rounded-xl"
                />
              ))}
            </div>
          ) : top5.length === 0 ? (
            <div
              data-ocid="share.leaderboard.empty_state"
              className="py-8 text-center"
            >
              <Crown
                size={32}
                className="mx-auto mb-2"
                style={{ color: "oklch(0.35 0.04 85)" }}
              />
              <p className="text-sm" style={{ color: "oklch(0.58 0.010 85)" }}>
                Abhi koi earnings nahi hui
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.55 0.010 85)" }}
              >
                Pehle earner bano!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {top5.map((entry: LeaderboardEntry, i) => {
                const rankStyle = getRankStyle(i + 1);
                const isCurrentUser = user?.referralCode === entry.referralCode;
                return (
                  <motion.div
                    key={entry.referralCode}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    data-ocid={`share.leaderboard.item.${i + 1}`}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{
                      background: isCurrentUser
                        ? "oklch(0.78 0.12 85 / 0.12)"
                        : "oklch(0.18 0.010 255 / 0.5)",
                      border: isCurrentUser
                        ? "1px solid oklch(0.78 0.12 85 / 0.35)"
                        : "1px solid oklch(0.20 0.01 85 / 0.5)",
                    }}
                  >
                    {/* Rank badge */}
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: rankStyle.bg,
                        color: rankStyle.color,
                      }}
                    >
                      {typeof rankStyle.icon === "string" &&
                      rankStyle.icon.startsWith("#")
                        ? rankStyle.icon
                        : rankStyle.icon}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{
                          color: isCurrentUser
                            ? "oklch(0.86 0.14 85)"
                            : "oklch(0.82 0.05 85)",
                        }}
                      >
                        {entry.name}
                        {isCurrentUser && (
                          <span
                            className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "oklch(0.78 0.12 85 / 0.2)",
                              color: "oklch(0.86 0.14 85)",
                            }}
                          >
                            Aap
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Earnings */}
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{ color: "oklch(0.86 0.14 85)" }}
                    >
                      ₹{formatINR(entry.totalEarnings)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.003 85), oklch(0.14 0.006 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.35)",
          }}
        >
          <h3
            className="text-base font-bold mb-3"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            📋 Referral Kaise Kaam Karta Hai?
          </h3>
          <div className="space-y-2.5">
            {[
              {
                num: "1",
                text: "Apna referral code ya link dosto ko bhejo",
              },
              {
                num: "2",
                text: "Dost signup karta hai aur account verify karta hai",
              },
              {
                num: "3",
                text: "Jab bhi woh commission kamaata hai, aapko 5% lifetime bonus milta hai",
              },
              {
                num: "4",
                text: "Aap jitne zyada log refer karein, utni zyada passive income!",
              },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-start gap-3">
                <div
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                    color: "oklch(0.08 0 0)",
                  }}
                >
                  {num}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.65 0.02 85)" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Anti-fraud note */}
        <div
          className="rounded-xl px-4 py-3 text-xs text-center"
          style={{
            background: "oklch(0.18 0.010 255 / 0.5)",
            border: "1px solid oklch(0.22 0.01 85 / 0.5)",
            color: "oklch(0.58 0.010 85)",
          }}
        >
          ⚠️ Self-referral allowed nahi hai. Fraud detect hone par account
          suspend ho sakta hai.
        </div>
      </div>
    </div>
  );
}
