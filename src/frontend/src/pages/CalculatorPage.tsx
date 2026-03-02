import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  Calculator,
  IndianRupee,
  Loader2,
  Percent,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ProfitCalculation } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCalculateProfit } from "../hooks/useQueries";

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

export default function CalculatorPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [price, setPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [result, setResult] = useState<ProfitCalculation | null>(null);
  const calcMutation = useCalculateProfit();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!identity) {
      navigate({ to: "/login" });
    }
  }, [identity, navigate]);

  const handleCalculate = async () => {
    const priceNum = Number(price);
    const commissionNum = Number(commission);

    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Sahi price daalo (e.g. 1500)");
      return;
    }
    if (
      !commission ||
      Number.isNaN(commissionNum) ||
      commissionNum <= 0 ||
      commissionNum > 100
    ) {
      toast.error("Commission 1-100 ke beech hona chahiye");
      return;
    }

    try {
      const data = await calcMutation.mutateAsync({
        price: BigInt(Math.floor(priceNum)),
        commission: BigInt(Math.floor(commissionNum)),
      });
      setResult(data);
    } catch {
      toast.error("Calculation fail hui. Dobara try karo.");
    }
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
        <div className="flex items-center gap-2">
          <Calculator size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            Profit Calculator
          </h1>
        </div>
        <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.01 85)" }}>
          Deal share karne se pehle profit check karo
        </p>
      </header>

      <div className="p-4 space-y-4">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 space-y-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.4)",
          }}
        >
          <div>
            <Label
              htmlFor="price"
              className="text-base mb-2 block font-semibold"
              style={{ color: "oklch(0.82 0.05 85)" }}
            >
              Product Price (₹)
            </Label>
            <div className="relative">
              <IndianRupee
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "oklch(0.52 0.01 85)" }}
              />
              <Input
                id="price"
                type="number"
                placeholder="e.g. 15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-ocid="calculator.price_input"
                className="pl-9 h-12 rounded-xl text-base"
                style={{
                  background: "oklch(0.10 0 0)",
                  border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                  color: "oklch(0.96 0.015 85)",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="commission"
              className="text-base mb-2 block font-semibold"
              style={{ color: "oklch(0.82 0.05 85)" }}
            >
              Commission Percentage (%)
            </Label>
            <div className="relative">
              <Percent
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "oklch(0.52 0.01 85)" }}
              />
              <Input
                id="commission"
                type="number"
                placeholder="e.g. 15"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                data-ocid="calculator.commission_input"
                min="1"
                max="100"
                className="pl-9 h-12 rounded-xl text-base"
                style={{
                  background: "oklch(0.10 0 0)",
                  border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                  color: "oklch(0.96 0.015 85)",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calcMutation.isPending}
            data-ocid="calculator.submit_button"
            className="w-full h-12 text-base font-semibold rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88), oklch(0.72 0.11 80))",
              color: "oklch(0.08 0 0)",
              border: "none",
              boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.4)",
            }}
          >
            {calcMutation.isPending ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Calculate ho raha hai...
              </>
            ) : (
              <>
                <Calculator size={18} className="mr-2" />
                Calculate Karo
              </>
            )}
          </Button>
        </motion.div>

        {/* Quick examples */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { price: "999", commission: "10", label: "₹999 | 10%" },
            { price: "5000", commission: "15", label: "₹5k | 15%" },
            { price: "15000", commission: "12", label: "₹15k | 12%" },
            { price: "50000", commission: "8", label: "₹50k | 8%" },
          ].map((ex) => (
            <button
              type="button"
              key={ex.label}
              onClick={() => {
                setPrice(ex.price);
                setCommission(ex.commission);
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: "oklch(0.14 0.01 85)",
                border: "1px solid oklch(0.28 0.04 85 / 0.4)",
                color: "oklch(0.62 0.01 85)",
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              data-ocid="calculator.result_card"
              className="rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.18 0.06 85))",
                border: "1px solid oklch(0.78 0.12 85 / 0.5)",
                boxShadow: "0 8px 32px oklch(0.78 0.12 85 / 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp
                  size={18}
                  style={{ color: "oklch(0.86 0.14 85)" }}
                />
                <h3
                  className="font-bold text-base"
                  style={{ color: "oklch(0.86 0.14 85)" }}
                >
                  Profit Breakdown
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Expected Earnings",
                    value: result.expectedEarnings,
                    color: "oklch(0.82 0.05 85)",
                    note: `(${commission}% of ₹${price})`,
                  },
                  {
                    label: "Referral Bonus",
                    value: result.referralBonus,
                    color: "oklch(0.70 0.18 140)",
                    note: "(5% extra)",
                  },
                  {
                    label: "Admin Cut",
                    value: result.adminCut,
                    color: "oklch(0.62 0.22 25)",
                    note: "(15% fee)",
                    negative: true,
                  },
                ].map(({ label, value, color, note, negative }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "oklch(0.82 0.05 85)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-xs ml-1.5"
                        style={{ color: "oklch(0.45 0.01 85)" }}
                      >
                        {note}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color }}>
                      {negative ? "−" : "+"}₹{formatINR(value)}
                    </span>
                  </div>
                ))}

                <div
                  className="h-px my-2"
                  style={{ background: "oklch(0.78 0.12 85 / 0.3)" }}
                />

                <div className="flex items-center justify-between">
                  <span
                    className="text-base font-bold"
                    style={{ color: "oklch(0.92 0.015 85)" }}
                  >
                    Net Profit
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color: "oklch(0.86 0.14 85)",
                      textShadow: "0 0 20px oklch(0.78 0.12 85 / 0.5)",
                    }}
                  >
                    ₹{formatINR(result.netProfit)}
                  </span>
                </div>
              </div>

              {/* Profit bar visual */}
              <div className="mt-4">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.12 0 0)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (Number(result.netProfit) / Number(result.expectedEarnings)) * 100)}%`,
                    }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                    }}
                  />
                </div>
                <p
                  className="text-xs mt-1.5 text-right"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  Net profit ratio
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info note */}
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.22 0.01 85)",
            color: "oklch(0.52 0.01 85)",
          }}
        >
          <strong style={{ color: "oklch(0.70 0.08 85)" }}>Note:</strong> Yeh
          calculation approximate hai. Admin cut 15% hota hai. Referral bonus
          tab milta hai jab aapne kisi ko refer kiya ho.
        </div>
      </div>
    </div>
  );
}
