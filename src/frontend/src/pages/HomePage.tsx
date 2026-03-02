import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, MessageCircle, Tag, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUser } from "../hooks/useQueries";

const AI_TIPS = [
  "🔥 Muzaffarpur users ke liye electric kettle trending – 22% profit margin possible!",
  "💡 Delhi NCR mein gaming accessories ka demand 40% badhaa – abhi share karo!",
  "📱 Flipkart sale aane waali hai – electronics deals share karne ka best time!",
  "👟 Mumbai aur Pune mein sneakers ka craze – fashion deals pe focus karo!",
  "🏠 Tier-2 cities mein home appliances 35% growth – kitchen deals best hain!",
];

const WEEKLY_DATA = [
  { day: "Mon", amount: 450 },
  { day: "Tue", amount: 820 },
  { day: "Wed", amount: 380 },
  { day: "Thu", amount: 1200 },
  { day: "Fri", amount: 950 },
  { day: "Sat", amount: 1680 },
  { day: "Sun", amount: 720 },
];

const maxAmount = Math.max(...WEEKLY_DATA.map((d) => d.amount));

function formatINR(value: number | bigint) {
  return Number(value).toLocaleString("en-IN");
}

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: user, isLoading } = useGetUser();
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!identity) {
      navigate({ to: "/login" });
    }
  }, [identity, navigate]);

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % AI_TIPS.length);
        setTipVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    {
      label: "Kul Kamaai",
      value: user ? formatINR(user.totalEarnings) : "0",
      prefix: "₹",
      ocid: "home.earnings_card",
      gold: true,
    },
    {
      label: "Aaj ki Kamaai",
      value: user ? formatINR(user.pendingEarnings) : "0",
      prefix: "₹",
      ocid: "home.earnings_card",
      gold: false,
    },
    {
      label: "Wallet Balance",
      value: user ? formatINR(user.walletBalance) : "0",
      prefix: "₹",
      ocid: "home.wallet_card",
      gold: true,
    },
  ];

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0 0) 0%, oklch(0.08 0 0 / 0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold gold-text-gradient leading-none">
            Dark Daulat AI
          </h1>
          {user && (
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.52 0.01 85)" }}
            >
              Namaste, {user.name} 👋
            </p>
          )}
        </div>
        <button
          type="button"
          className="relative p-2 rounded-xl transition-colors"
          style={{
            background: "oklch(0.14 0.01 85)",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <Bell size={20} style={{ color: "oklch(0.78 0.12 85)" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "oklch(0.62 0.22 25)" }}
          />
        </button>
      </header>

      <div className="px-4 space-y-5 mt-4">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          {statsCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              data-ocid={card.ocid}
              className="rounded-xl p-3 flex flex-col"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.015 85))",
                border: `1px solid ${card.gold ? "oklch(0.78 0.12 85 / 0.4)" : "oklch(0.28 0.04 85 / 0.4)"}`,
                boxShadow: card.gold
                  ? "0 4px 16px oklch(0.78 0.12 85 / 0.15)"
                  : "none",
              }}
            >
              {isLoading ? (
                <div className="animate-shimmer h-4 w-12 rounded mb-1" />
              ) : (
                <span
                  className="text-base font-bold leading-tight"
                  style={{
                    color: card.gold
                      ? "oklch(0.86 0.14 85)"
                      : "oklch(0.82 0.05 85)",
                  }}
                >
                  {card.prefix}
                  {card.value}
                </span>
              )}
              <span
                className="text-[10px] mt-1 leading-none"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                {card.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Chart */}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                Weekly Earnings
              </h3>
              <p className="text-xs" style={{ color: "oklch(0.52 0.01 85)" }}>
                Is hafte ki kamaai
              </p>
            </div>
            <TrendingUp size={18} style={{ color: "oklch(0.78 0.12 85)" }} />
          </div>

          <div className="flex items-end gap-2 h-20">
            {WEEKLY_DATA.map((d, i) => (
              <motion.div
                key={d.day}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
                style={{ transformOrigin: "bottom" }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${(d.amount / maxAmount) * 64}px`,
                    background:
                      i === 5
                        ? "linear-gradient(180deg, oklch(0.88 0.15 88), oklch(0.72 0.11 80))"
                        : "linear-gradient(180deg, oklch(0.50 0.08 85), oklch(0.30 0.05 85))",
                    boxShadow:
                      i === 5 ? "0 0 8px oklch(0.78 0.12 85 / 0.4)" : "none",
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{ color: "oklch(0.45 0.01 85)" }}
                >
                  {d.day}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          data-ocid="home.tip_card"
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.18 0.05 85))",
            border: "1px solid oklch(0.78 0.12 85 / 0.4)",
            boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.15)",
          }}
        >
          <div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.12 85 / 0.15) 0%, transparent 70%)",
            }}
          />
          <div className="flex items-start gap-3 relative z-10">
            <div
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(0.78 0.12 85 / 0.2)",
                border: "1px solid oklch(0.78 0.12 85 / 0.4)",
              }}
            >
              <span className="text-base">🤖</span>
            </div>
            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                AI Tip
              </p>
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: tipVisible ? 1 : 0, y: tipVisible ? 0 : 5 }}
                transition={{ duration: 0.3 }}
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.82 0.05 85)" }}
              >
                {AI_TIPS[tipIndex]}
              </motion.p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3 justify-end">
            {AI_TIPS.map((tip, i) => (
              <div
                key={tip.slice(0, 15)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === tipIndex ? "16px" : "6px",
                  height: "6px",
                  background:
                    i === tipIndex
                      ? "oklch(0.86 0.14 85)"
                      : "oklch(0.35 0.05 85)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* How to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          data-ocid="home.how_to_earn_card"
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.12 0.003 85), oklch(0.14 0.006 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <h3
            className="text-sm font-bold mb-3"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            💡 Kaise Kamayein?
          </h3>
          <div className="space-y-2">
            {[
              {
                step: "1",
                icon: "🛍️",
                title: "Deals Browse Karo",
                desc: "AI Deals mein trending products dekho",
              },
              {
                step: "2",
                icon: "📤",
                title: "WhatsApp pe Share Karo",
                desc: "Apne contacts aur groups mein bhejo",
              },
              {
                step: "3",
                icon: "💰",
                title: "Commission Kamao",
                desc: "Har purchase pe 5-20% commission milta hai",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="flex items-center gap-3 p-2 rounded-xl"
                style={{ background: "oklch(0.10 0 0 / 0.5)" }}
              >
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                    color: "oklch(0.08 0 0)",
                  }}
                >
                  {step}
                </div>
                <span className="text-base">{icon}</span>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "oklch(0.52 0.01 85)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            {
              icon: Tag,
              label: "Deals Dekho",
              to: "/deals",
              primary: true,
            },
            {
              icon: Wallet,
              label: "Meri Wallet",
              to: "/wallet",
              primary: false,
            },
            {
              icon: MessageCircle,
              label: "AI Chat",
              to: "/chat",
              primary: false,
            },
          ].map(({ icon: Icon, label, to, primary }) => (
            <Link key={to} to={to}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={{
                  background: primary
                    ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))"
                    : "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.16 0.01 85))",
                  border: primary
                    ? "1px solid oklch(0.78 0.12 85 / 0.5)"
                    : "1px solid oklch(0.28 0.04 85 / 0.4)",
                  boxShadow: primary
                    ? "0 4px 16px oklch(0.78 0.12 85 / 0.3)"
                    : "none",
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: primary ? "oklch(0.08 0 0)" : "oklch(0.78 0.12 85)",
                  }}
                />
                <span
                  className="text-xs font-semibold text-center"
                  style={{
                    color: primary ? "oklch(0.08 0 0)" : "oklch(0.82 0.05 85)",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Share Count Stat */}
        {user && Number(user.shareCount) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.22 0.01 85)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.78 0.12 85 / 0.15)" }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                {Number(user.shareCount)}
              </span>
            </div>
            <div>
              <p
                className="text-xs font-semibold"
                style={{ color: "oklch(0.82 0.05 85)" }}
              >
                Total Shares
              </p>
              <p
                className="text-[10px]"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                Aapne itne deals share kiye hain
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-2">
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
  );
}
