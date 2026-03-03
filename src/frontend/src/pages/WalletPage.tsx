import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  Loader2,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../backend.d";
import {
  TransactionStatus as TxStatus,
  TransactionType as TxType,
} from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetTransactions,
  useGetUser,
  useRequestWithdrawal,
} from "../hooks/useQueries";

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

function formatDate(ts: bigint) {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = {
    [TxStatus.pending]: {
      label: "Pending",
      icon: Clock,
      bg: "oklch(0.75 0.15 80 / 0.15)",
      border: "oklch(0.75 0.15 80 / 0.4)",
      color: "oklch(0.85 0.15 80)",
    },
    [TxStatus.approved]: {
      label: "Approved",
      icon: CheckCircle,
      bg: "oklch(0.70 0.18 140 / 0.15)",
      border: "oklch(0.70 0.18 140 / 0.4)",
      color: "oklch(0.75 0.18 140)",
    },
    [TxStatus.rejected]: {
      label: "Rejected",
      icon: XCircle,
      bg: "oklch(0.62 0.22 25 / 0.15)",
      border: "oklch(0.62 0.22 25 / 0.4)",
      color: "oklch(0.68 0.22 25)",
    },
  };

  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      <Icon size={9} />
      {c.label}
    </span>
  );
}

function TypeLabel({ type }: { type: TransactionType }) {
  const labels: Record<string, string> = {
    [TxType.referral]: "Referral",
    [TxType.commission]: "Commission",
    [TxType.share]: "Share Bonus",
    [TxType.withdrawal]: "Withdrawal",
    [TxType.adjustment]: "Adjustment",
  };
  const icons: Record<string, string> = {
    [TxType.referral]: "👥",
    [TxType.commission]: "💰",
    [TxType.share]: "📤",
    [TxType.withdrawal]: "🏦",
    [TxType.adjustment]: "⚙️",
  };
  return (
    <span className="text-xs" style={{ color: "oklch(0.62 0.01 85)" }}>
      {icons[type]} {labels[type] || type}
    </span>
  );
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: user, isLoading: userLoading } = useGetUser();
  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactions();
  const withdrawMutation = useRequestWithdrawal();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Redirect to login if not authenticated (wait for initialization first)
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  const withdrawAmountNum = Number(withdrawAmount);
  const isValidAmount =
    !Number.isNaN(withdrawAmountNum) && withdrawAmountNum >= 200;
  const platformFee = isValidAmount ? Math.floor(withdrawAmountNum * 0.02) : 0;
  const youGetAmount = isValidAmount ? withdrawAmountNum - platformFee : 0;

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!withdrawAmount || Number.isNaN(amount) || amount < 200) {
      toast.error("Minimum withdrawal ₹200 hai");
      return;
    }
    if (user && amount > Number(user.walletBalance)) {
      toast.error("Balance nahi hai itna withdraw karne ke liye");
      return;
    }
    try {
      await withdrawMutation.mutateAsync(BigInt(Math.floor(amount)));
      toast.success("Withdrawal request bhej di gayi! Admin approve karega.");
      setWithdrawAmount("");
    } catch {
      toast.error("Withdrawal fail hui. Dobara try karo.");
    }
  };

  const balanceCards = [
    {
      label: "Kul Kamaai",
      value: user ? formatINR(user.totalEarnings) : "0",
      gold: false,
    },
    {
      label: "Pending",
      value: user ? formatINR(user.pendingEarnings) : "0",
      gold: false,
    },
    {
      label: "Withdrawn",
      value: user ? formatINR(user.withdrawnAmount) : "0",
      gold: false,
    },
    {
      label: "Wallet Balance",
      value: user ? formatINR(user.walletBalance) : "0",
      gold: true,
    },
  ];

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
        <div className="flex items-center gap-2">
          <Wallet size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            Meri Wallet
          </h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Balance Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {balanceCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-4"
              style={{
                background: card.gold
                  ? "linear-gradient(135deg, oklch(0.14 0.04 85), oklch(0.20 0.07 85))"
                  : "linear-gradient(135deg, oklch(0.13 0.003 85), oklch(0.15 0.008 85))",
                border: `1px solid ${card.gold ? "oklch(0.78 0.12 85 / 0.5)" : "oklch(0.28 0.04 85 / 0.4)"}`,
                boxShadow: card.gold
                  ? "0 4px 20px oklch(0.78 0.12 85 / 0.2)"
                  : "none",
              }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                {card.label}
              </p>
              {userLoading ? (
                <div className="animate-shimmer h-5 w-16 rounded" />
              ) : (
                <p
                  className="text-lg font-bold"
                  style={{
                    color: card.gold
                      ? "oklch(0.86 0.14 85)"
                      : "oklch(0.82 0.05 85)",
                  }}
                >
                  ₹{card.value}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Zero Balance Earning Guide */}
        {user &&
          Number(user.walletBalance) === 0 &&
          Number(user.totalEarnings) === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="wallet.zero_balance_guide"
              className="rounded-xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.03 85 / 0.6), oklch(0.18 0.05 85 / 0.4))",
                border: "1px solid oklch(0.78 0.12 85 / 0.3)",
              }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                🚀 Earning Shuru Karo!
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Abhi aapka balance ₹0 hai. AI Deals mein jaao, products WhatsApp
                pe share karo, aur commission kamana shuru karo. Minimum
                withdrawal ₹200 hai.
              </p>
            </motion.div>
          )}

        {/* Withdrawal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownCircle
              size={18}
              style={{ color: "oklch(0.78 0.12 85)" }}
            />
            <h3
              className="font-bold text-base"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              Withdrawal Request
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label
                className="text-xs mb-1.5 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Amount (Min ₹200)
              </Label>
              <div className="relative">
                <IndianRupee
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                />
                <Input
                  type="number"
                  placeholder="Kitna withdraw karna hai?"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  data-ocid="wallet.withdrawal_input"
                  min="200"
                  className="pl-9 h-11 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.10 0 0)",
                    border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                    color: "oklch(0.96 0.015 85)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleWithdraw()}
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2">
              {[200, 500, 1000, 2000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setWithdrawAmount(String(amt))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: "oklch(0.12 0 0)",
                    border: "1px solid oklch(0.22 0.01 85)",
                    color: "oklch(0.62 0.01 85)",
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* 2% fee preview */}
            {isValidAmount && (
              <div
                className="rounded-xl p-3 space-y-2"
                style={{
                  background: "oklch(0.12 0.005 85)",
                  border: "1px solid oklch(0.28 0.04 85 / 0.3)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.52 0.01 85)" }}
                  >
                    Platform fee (2%):
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.68 0.22 25)" }}
                  >
                    -₹{formatINR(platformFee)}
                  </span>
                </div>
                <div
                  className="h-px"
                  style={{ background: "oklch(0.28 0.04 85 / 0.2)" }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    Aapko milega:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.78 0.18 145)" }}
                  >
                    ₹{formatINR(youGetAmount)}
                  </span>
                </div>
                <p
                  className="text-[10px]"
                  style={{ color: "oklch(0.42 0.01 85)" }}
                >
                  2% platform fee automatically kati jaati hai withdrawal par
                </p>
              </div>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              data-ocid="wallet.withdrawal_submit_button"
              className="w-full h-11 text-sm font-semibold rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
                border: "none",
                boxShadow: "0 4px 16px oklch(0.78 0.12 85 / 0.3)",
              }}
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Request bhej raha hai...
                </>
              ) : (
                "Withdrawal Request Karo"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-ocid="wallet.transaction_list"
        >
          <h3
            className="font-bold text-base mb-3"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            Transaction History
          </h3>

          {txLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                <div key={i} className="animate-shimmer h-16 rounded-xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.22 0.01 85)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
                Abhi koi transaction nahi hai
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: Transaction, i) => (
                <motion.div
                  key={Number(tx.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-3 flex items-center justify-between gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.13 0.003 85), oklch(0.14 0.005 85))",
                    border: "1px solid oklch(0.22 0.01 85)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeLabel type={tx.transactionType} />
                      <StatusBadge status={tx.status} />
                    </div>
                    {tx.note && (
                      <p
                        className="text-xs truncate"
                        style={{ color: "oklch(0.45 0.01 85)" }}
                      >
                        {tx.note}
                      </p>
                    )}
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.38 0.01 85)" }}
                    >
                      {formatDate(tx.timestamp)}
                    </p>
                  </div>
                  <span
                    className="font-bold text-sm shrink-0"
                    style={{
                      color:
                        tx.transactionType === TxType.withdrawal
                          ? "oklch(0.62 0.22 25)"
                          : "oklch(0.75 0.18 140)",
                    }}
                  >
                    {tx.transactionType === TxType.withdrawal ? "-" : "+"}₹
                    {formatINR(tx.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
