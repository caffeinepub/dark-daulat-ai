import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardList,
  Copy,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PersistentPurchaseClaim } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useConfirmPurchase,
  useGetActiveDeals,
  useGetMyPurchaseClaims,
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(0.55 0.18 145 / 0.18)",
          border: "1px solid oklch(0.55 0.18 145 / 0.4)",
          color: "oklch(0.72 0.18 145)",
        }}
      >
        <CheckCircle2 size={10} />
        Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(0.62 0.22 25 / 0.15)",
          border: "1px solid oklch(0.62 0.22 25 / 0.4)",
          color: "oklch(0.70 0.22 25)",
        }}
      >
        <XCircle size={10} />
        Rejected
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: "oklch(0.75 0.15 80 / 0.15)",
        border: "1px solid oklch(0.75 0.15 80 / 0.4)",
        color: "oklch(0.88 0.15 80)",
      }}
    >
      <Loader2 size={10} className="animate-spin" />
      Pending
    </span>
  );
}

function ConfirmPurchaseForm({
  claim,
  dealTitle,
  onDone,
}: {
  claim: PersistentPurchaseClaim;
  dealTitle: string;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const confirmPurchase = useConfirmPurchase();
  const [submitted, setSubmitted] = useState(false);
  const [finalUserCommission, setFinalUserCommission] = useState(0);
  const [isLargeClaim, setIsLargeClaim] = useState(false);

  // ── Proof screenshot state ──
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofImageName, setProofImageName] = useState("");
  const [proofError, setProofError] = useState("");

  // Commission split: user gets 2%, admin gets 3% of purchaseAmount
  const userCommission = amount ? Math.floor((Number(amount) * 2) / 100) : 0;
  const adminCommission = amount ? Math.floor((Number(amount) * 3) / 100) : 0;

  // ── Image compress helper ──
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size 3MB se zyada nahi hona chahiye");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Sirf image files allowed hain");
      return;
    }
    setProofImageName(file.name);
    setProofError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 1024;
        const maxH = 768;
        let { width, height } = img;
        if (width > maxW) {
          height = Math.floor((height * maxW) / width);
          width = maxW;
        }
        if (height > maxH) {
          width = Math.floor((width * maxH) / height);
          height = maxH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        setProofImage(compressed);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt) || amt < 1) {
      toast.error("Sahi amount daalo (₹1 se zyada hona chahiye)");
      return;
    }
    // Proof is required
    if (!proofImage) {
      setProofError(
        "Order ka screenshot zaroori hai -- fraud prevention ke liye",
      );
      return;
    }
    // Warn for large claims
    if (amt > 5000) {
      toast.warning(
        "₹5000 se zyada ke claims ke liye admin approval zaroori hai. Commission pending rahega.",
      );
    }
    const largeClaim = amt > 5000;
    setIsLargeClaim(largeClaim);

    // Store proof screenshot in localStorage keyed by tracking code
    localStorage.setItem(`claim_proof_${claim.trackingCode}`, proofImage);

    try {
      await confirmPurchase.mutateAsync({
        trackingCode: claim.trackingCode,
        purchaseAmount: BigInt(Math.floor(amt)),
      });
      setFinalUserCommission(Math.floor((amt * 2) / 100));
      setSubmitted(true);
      if (largeClaim) {
        toast.success(
          "Claim submit ho gayi! ₹5000 se zyada hai, admin approval ke baad wallet mein aayega.",
        );
      } else {
        toast.success("🎉 Commission turant wallet mein jama ho gayi!");
      }
    } catch (err) {
      toast.error(`Confirm fail hua: ${String(err).slice(0, 80)}`);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="rounded-xl p-5 text-center space-y-3"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.55 0.18 145 / 0.12), oklch(0.55 0.18 145 / 0.06))",
          border: "1px solid oklch(0.55 0.18 145 / 0.45)",
          boxShadow: "0 4px 24px oklch(0.55 0.18 145 / 0.15)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 18,
            delay: 0.1,
          }}
        >
          <CheckCircle2
            size={36}
            className="mx-auto"
            style={{ color: "oklch(0.68 0.20 145)" }}
          />
        </motion.div>
        <div>
          <p
            className="text-base font-bold"
            style={{
              color: isLargeClaim
                ? "oklch(0.82 0.15 75)"
                : "oklch(0.72 0.20 145)",
            }}
          >
            {isLargeClaim
              ? "Claim Submit Ho Gayi! ⏳"
              : "🎉 Commission Wallet Mein Aa Gayi!"}
          </p>
          {isLargeClaim ? (
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.62 0.01 85)" }}
            >
              Admin review ke baad wallet mein credit hoga
            </p>
          ) : (
            <p
              className="text-sm mt-1 font-semibold"
              style={{ color: "oklch(0.82 0.05 85)" }}
            >
              ₹{formatINR(finalUserCommission)} aapke wallet mein jama ho gaya!
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: "oklch(0.52 0.01 85)" }}>
            {isLargeClaim
              ? "72 ghante ke andar update milega."
              : "Wallet page pe check karo."}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            onClick={() => navigate({ to: "/wallet" })}
            data-ocid="claims.wallet_button"
            className="h-9 px-4 text-xs rounded-xl font-semibold flex items-center gap-1.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
              color: "oklch(0.08 0 0)",
              border: "none",
            }}
          >
            <Wallet size={13} />
            Wallet Dekho
          </Button>
          <button
            type="button"
            onClick={onDone}
            className="h-9 px-4 text-xs rounded-xl"
            style={{
              background: "oklch(0.22 0.012 255)",
              border: "1px solid oklch(0.28 0.01 85)",
              color: "oklch(0.55 0.01 85)",
            }}
          >
            Theek hai
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl p-4 space-y-3 overflow-hidden"
      style={{
        background: "oklch(0.18 0.010 255 / 0.7)",
        border: "1px solid oklch(0.78 0.12 85 / 0.3)",
      }}
    >
      <p className="text-xs font-bold" style={{ color: "oklch(0.86 0.14 85)" }}>
        ✅ Purchase Amount Batao
      </p>
      <p className="text-xs" style={{ color: "oklch(0.52 0.01 85)" }}>
        Deal: <span style={{ color: "oklch(0.82 0.05 85)" }}>{dealTitle}</span>
      </p>

      <div>
        <label
          htmlFor="purchase-amount-input"
          className="text-xs block mb-1"
          style={{ color: "oklch(0.62 0.01 85)" }}
        >
          Kitne mein khareedaa? (₹) *
        </label>
        <Input
          id="purchase-amount-input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          data-ocid="claims.purchase_amount_input"
          placeholder="Jaise: 1299"
          className="h-10 rounded-xl text-sm"
          style={{
            background: "oklch(0.20 0.010 255)",
            border: "1px solid oklch(0.28 0.04 85 / 0.5)",
            color: "oklch(0.96 0.015 85)",
          }}
        />
      </div>

      {amount && Number(amount) > 0 && (
        <div
          className="rounded-lg px-3 py-2 text-xs space-y-1"
          style={{
            background: "oklch(0.55 0.18 145 / 0.08)",
            border: "1px solid oklch(0.55 0.18 145 / 0.3)",
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ color: "oklch(0.70 0.18 145)" }}>
              💰 Aapko milega (2%)
            </span>
            <strong style={{ color: "oklch(0.72 0.18 145)" }}>
              ₹{formatINR(userCommission)}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "oklch(0.52 0.01 85)" }}>🏢 Admin (3%)</span>
            <span style={{ color: "oklch(0.48 0.01 85)" }}>
              ₹{formatINR(adminCommission)}
            </span>
          </div>
          <div
            className="border-t pt-1 flex items-center justify-between font-semibold"
            style={{
              borderColor: "oklch(0.55 0.18 145 / 0.25)",
              color: "oklch(0.62 0.01 85)",
            }}
          >
            <span>Total (5%)</span>
            <span>₹{formatINR(userCommission + adminCommission)}</span>
          </div>
        </div>
      )}

      {/* ── Fraud Prevention Banner ── */}
      <div
        className="rounded-xl p-3 space-y-2"
        style={{
          background: "oklch(0.55 0.14 250 / 0.10)",
          border: "1px solid oklch(0.55 0.14 250 / 0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={15}
            className="shrink-0"
            style={{ color: "oklch(0.65 0.14 250)" }}
          />
          <p
            className="text-xs font-bold"
            style={{ color: "oklch(0.72 0.14 250)" }}
          >
            🛡️ Fraud Prevention — Zaroori Shuroot
          </p>
        </div>
        <ul
          className="text-xs space-y-1.5 pl-1"
          style={{ color: "oklch(0.65 0.10 250)" }}
        >
          <li className="flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5">📸</span>
            <span>
              Order confirm hone ka{" "}
              <strong style={{ color: "oklch(0.75 0.12 250)" }}>
                screenshot zaroori hai
              </strong>{" "}
              — bina proof ke commission nahi milega.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5">🚫</span>
            <span>
              Purchase amount{" "}
              <strong style={{ color: "oklch(0.75 0.12 250)" }}>
                deal ki actual price se 2 guna se zyada nahi ho sakta
              </strong>
              .
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5">💰</span>
            <span>
              Ek claim mein{" "}
              <strong style={{ color: "oklch(0.75 0.12 250)" }}>
                maximum ₹50,000
              </strong>{" "}
              tak hi allowed hai.
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5">📅</span>
            <span>
              Roz ka daily commission limit{" "}
              <strong style={{ color: "oklch(0.75 0.12 250)" }}>₹10,000</strong>{" "}
              hai — is se zyada claim same din nahi hoga.
            </span>
          </li>
        </ul>
      </div>

      {/* ── Order Screenshot Upload ── */}
      <div className="space-y-2">
        <label
          htmlFor={`proof-upload-${claim.trackingCode}`}
          className="text-xs font-semibold block"
          style={{ color: "oklch(0.82 0.05 85)" }}
        >
          📸 Order Screenshot Upload Karo *
        </label>

        <label
          htmlFor={`proof-upload-${claim.trackingCode}`}
          data-ocid="claims.upload_button"
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 cursor-pointer transition-all"
          style={{
            border: `2px dashed ${proofError ? "oklch(0.62 0.22 25 / 0.7)" : proofImage ? "oklch(0.55 0.18 145 / 0.7)" : "oklch(0.78 0.12 85 / 0.5)"}`,
            background: proofImage
              ? "oklch(0.55 0.18 145 / 0.07)"
              : "oklch(0.18 0.010 255 / 0.5)",
          }}
        >
          <Camera
            size={18}
            style={{
              color: proofImage
                ? "oklch(0.68 0.18 145)"
                : "oklch(0.68 0.10 85)",
            }}
          />
          <p
            className="text-xs font-semibold"
            style={{
              color: proofImage
                ? "oklch(0.72 0.18 145)"
                : "oklch(0.68 0.08 85)",
            }}
          >
            {proofImage
              ? `✅ ${proofImageName}`
              : "Order Screenshot Upload Karo"}
          </p>
          <p className="text-[10px]" style={{ color: "oklch(0.45 0.01 85)" }}>
            JPG, PNG — max 3MB
          </p>
          <input
            id={`proof-upload-${claim.trackingCode}`}
            type="file"
            accept="image/*"
            onChange={handleProofUpload}
            className="hidden"
          />
        </label>

        {/* Error */}
        {proofError && (
          <p
            data-ocid="claims.proof_error_state"
            className="text-xs flex items-center gap-1"
            style={{ color: "oklch(0.68 0.22 25)" }}
          >
            ⚠️ {proofError}
          </p>
        )}

        {/* Thumbnail preview */}
        {proofImage && (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={proofImage}
            alt="Order screenshot preview"
            className="w-full max-h-32 object-contain rounded-xl"
            style={{
              border: "1px solid oklch(0.55 0.18 145 / 0.4)",
              background: "oklch(0.20 0.010 255)",
            }}
          />
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={confirmPurchase.isPending}
          data-ocid="claims.submit_button"
          className="flex-1 h-9 text-xs rounded-xl font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
            color: "oklch(0.08 0 0)",
            border: "none",
          }}
        >
          {confirmPurchase.isPending ? (
            <Loader2 size={13} className="animate-spin mr-1.5" />
          ) : null}
          Submit Karo
        </Button>
        <Button
          onClick={onDone}
          variant="outline"
          className="h-9 px-4 text-xs rounded-xl"
          style={{
            background: "oklch(0.22 0.012 255)",
            border: "1px solid oklch(0.28 0.01 85)",
            color: "oklch(0.55 0.01 85)",
          }}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
}

function ActiveTrackingCard({
  claim,
  index,
}: {
  claim: PersistentPurchaseClaim;
  index: number;
}) {
  const { data: deals = [] } = useGetActiveDeals();
  const [showForm, setShowForm] = useState(false);

  const deal = deals.find((d) => d.id === claim.dealId);
  const dealTitle = deal?.title ?? `Deal #${Number(claim.dealId)}`;

  const copyCode = () => {
    navigator.clipboard.writeText(claim.trackingCode);
    toast.success("Tracking code copy ho gaya!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      data-ocid={`claims.item.${index + 1}`}
      className="rounded-2xl p-4 space-y-3"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.14 0.008 85), oklch(0.12 0.003 85))",
        border: "1px solid oklch(0.28 0.04 85 / 0.4)",
      }}
    >
      {/* Deal title + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold line-clamp-2"
            style={{ color: "oklch(0.92 0.015 85)" }}
          >
            <ShoppingBag
              size={13}
              className="inline mr-1.5"
              style={{ color: "oklch(0.78 0.12 85)" }}
            />
            {dealTitle}
          </p>
        </div>
        <StatusBadge status="pending" />
      </div>

      {/* Tracking code */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5"
        style={{
          background: "oklch(0.16 0.010 255 / 0.7)",
          border: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <div>
          <p
            className="text-[9px] mb-0.5"
            style={{ color: "oklch(0.45 0.01 85)" }}
          >
            Tracking Code
          </p>
          <span
            className="text-sm font-bold font-mono tracking-wider"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            {claim.trackingCode}
          </span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          data-ocid={`claims.copy_button.${index + 1}`}
          className="p-2 rounded-lg transition-all active:scale-90"
          style={{
            background: "oklch(0.78 0.12 85 / 0.15)",
            border: "1px solid oklch(0.78 0.12 85 / 0.3)",
          }}
        >
          <Copy size={13} style={{ color: "oklch(0.86 0.14 85)" }} />
        </button>
      </div>

      {/* Created date */}
      <p className="text-[10px]" style={{ color: "oklch(0.58 0.010 85)" }}>
        Banaya: {formatDate(claim.createdAt)}
      </p>

      {/* Confirm form or button */}
      <AnimatePresence>
        {showForm ? (
          <ConfirmPurchaseForm
            key="form"
            claim={claim}
            dealTitle={dealTitle}
            onDone={() => setShowForm(false)}
          />
        ) : (
          <motion.button
            key="btn"
            type="button"
            onClick={() => setShowForm(true)}
            data-ocid={`claims.confirm_button.${index + 1}`}
            className="w-full h-10 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
              color: "oklch(0.08 0 0)",
            }}
          >
            ✅ Purchase Confirm Karo
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ClaimHistoryCard({
  claim,
  index,
}: {
  claim: PersistentPurchaseClaim;
  index: number;
}) {
  const { data: deals = [] } = useGetActiveDeals();
  const deal = deals.find((d) => d.id === claim.dealId);
  const dealTitle = deal?.title ?? `Deal #${Number(claim.dealId)}`;
  const statusStr = claim.status as unknown as string;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`claims.history.item.${index + 1}`}
      className="rounded-xl p-3.5"
      style={{
        background: "oklch(0.18 0.010 255)",
        border: `1px solid ${
          statusStr === "approved"
            ? "oklch(0.55 0.18 145 / 0.3)"
            : statusStr === "rejected"
              ? "oklch(0.62 0.22 25 / 0.3)"
              : "oklch(0.28 0.04 85 / 0.25)"
        }`,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className="text-xs font-semibold line-clamp-1 flex-1"
          style={{ color: "oklch(0.82 0.05 85)" }}
        >
          {dealTitle}
        </p>
        <StatusBadge status={statusStr} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs mb-2">
        <span style={{ color: "oklch(0.52 0.01 85)" }}>
          Code:{" "}
          <span className="font-mono" style={{ color: "oklch(0.72 0.10 85)" }}>
            {claim.trackingCode}
          </span>
        </span>
      </div>

      {claim.purchaseAmount > 0n && (
        <div className="flex items-center gap-4 text-xs mb-2">
          <span style={{ color: "oklch(0.52 0.01 85)" }}>
            Khareedari:{" "}
            <strong style={{ color: "oklch(0.86 0.14 85)" }}>
              ₹{formatINR(claim.purchaseAmount)}
            </strong>
          </span>
          <span style={{ color: "oklch(0.52 0.01 85)" }}>
            Aapko:{" "}
            <strong style={{ color: "oklch(0.70 0.18 145)" }}>
              ₹
              {formatINR(
                claim.userCommissionAmount > 0n
                  ? claim.userCommissionAmount
                  : claim.commissionAmount,
              )}
            </strong>
            <span style={{ color: "oklch(0.45 0.01 85)" }}> (2%)</span>
          </span>
        </div>
      )}

      {/* Admin share secondary info */}
      {claim.purchaseAmount > 0n && claim.adminCommissionAmount > 0n && (
        <div
          className="text-[10px] mb-2"
          style={{ color: "oklch(0.58 0.010 85)" }}
        >
          Admin ka hissa: ₹{formatINR(claim.adminCommissionAmount)} (3%)
        </div>
      )}

      {/* Approved special message */}
      {statusStr === "approved" &&
        (claim.userCommissionAmount > 0n || claim.commissionAmount > 0n) && (
          <div
            className="rounded-lg px-2.5 py-1.5 text-xs mb-2"
            style={{
              background: "oklch(0.55 0.18 145 / 0.12)",
              border: "1px solid oklch(0.55 0.18 145 / 0.3)",
              color: "oklch(0.72 0.18 145)",
            }}
          >
            🎉 ₹
            {formatINR(
              claim.userCommissionAmount > 0n
                ? claim.userCommissionAmount
                : claim.commissionAmount,
            )}{" "}
            wallet mein aa gaya!
          </div>
        )}

      {/* Proof submitted note for confirmed claims */}
      {claim.purchaseAmount > 0n && (
        <div
          className="text-[10px] mb-2 flex items-center gap-1"
          style={{ color: "oklch(0.62 0.14 145)" }}
        >
          ✅ Proof submitted
        </div>
      )}

      {/* Rejected reason */}
      {statusStr === "rejected" && claim.rejectionReason && (
        <div
          className="rounded-lg px-2.5 py-1.5 text-xs mb-2"
          style={{
            background: "oklch(0.62 0.22 25 / 0.1)",
            border: "1px solid oklch(0.62 0.22 25 / 0.3)",
            color: "oklch(0.70 0.22 25)",
          }}
        >
          Wajah: {claim.rejectionReason}
        </div>
      )}

      <p className="text-[10px]" style={{ color: "oklch(0.58 0.010 85)" }}>
        {formatDate(claim.createdAt)}
      </p>
    </motion.div>
  );
}

export default function MyClaimsPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: claims = [], isLoading } = useGetMyPurchaseClaims();

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  // Active = pending claims where purchaseAmount == 0 (not yet confirmed)
  const activeClaims = claims.filter(
    (c) =>
      (c.status as unknown as string) === "pending" && c.purchaseAmount === 0n,
  );

  // History = all others (confirmed pending, approved, rejected)
  const historyClaims = claims.filter(
    (c) =>
      !(
        (c.status as unknown as string) === "pending" && c.purchaseAmount === 0n
      ),
  );

  return (
    <div className="min-h-screen pb-10">
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/share" })}
            data-ocid="claims.back_button"
            className="p-2 rounded-xl transition-all active:scale-90"
            style={{
              background: "oklch(0.22 0.012 255)",
              border: "1px solid oklch(0.22 0.01 85)",
            }}
          >
            <ArrowLeft size={16} style={{ color: "oklch(0.62 0.01 85)" }} />
          </button>
          <div className="flex items-center gap-2">
            <ClipboardList size={22} style={{ color: "oklch(0.78 0.12 85)" }} />
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                Meri Claims
              </h1>
              <p
                className="text-[10px]"
                style={{ color: "oklch(0.45 0.01 85)" }}
              >
                Share track karo, purchase confirm karo
              </p>
            </div>
          </div>
          {claims.length > 0 && (
            <span
              className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold"
              style={{
                background: "oklch(0.72 0.11 80 / 0.2)",
                color: "oklch(0.86 0.14 85)",
                border: "1px solid oklch(0.78 0.12 85 / 0.3)",
              }}
            >
              {claims.length} Claims
            </span>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6">
        {/* How it works banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.6), oklch(0.16 0.06 85 / 0.3))",
            border: "1px solid oklch(0.78 0.12 85 / 0.25)",
          }}
        >
          <p
            className="text-xs font-bold mb-2"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            ⚡ Kaise Kaam Karta Hai?
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { num: "1", text: "Deal share karo" },
              { num: "2", text: "Koi khareedne ke baad yahan aao" },
              {
                num: "3",
                text: "Amount confirm karo → commission turant wallet mein!",
              },
            ].map(({ num, text }) => (
              <div key={num}>
                <div
                  className="w-5 h-5 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                    color: "oklch(0.08 0 0)",
                  }}
                >
                  {num}
                </div>
                <p
                  className="text-[9px] leading-tight"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section A: Active Tracking Links */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2
              className="text-sm font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              🔗 Active Tracking Links
            </h2>
            {activeClaims.length > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: "oklch(0.75 0.15 80 / 0.2)",
                  color: "oklch(0.88 0.15 80)",
                  border: "1px solid oklch(0.75 0.15 80 / 0.35)",
                }}
              >
                {activeClaims.length} Pending
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-shimmer h-36 rounded-2xl" />
              ))}
            </div>
          ) : activeClaims.length === 0 ? (
            <div
              data-ocid="claims.active.empty_state"
              className="rounded-2xl p-6 text-center"
              style={{
                background: "oklch(0.16 0.010 255)",
                border: "1px solid oklch(0.22 0.01 85 / 0.5)",
              }}
            >
              <ShoppingBag
                size={32}
                className="mx-auto mb-2"
                style={{ color: "oklch(0.32 0.04 85)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                Koi active tracking link nahi
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.58 0.010 85)" }}
              >
                Deals page se koi deal share karo — link yahan dikhega
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/deals" })}
                data-ocid="claims.goto_deals_button"
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                  color: "oklch(0.08 0 0)",
                }}
              >
                Deals Dekho →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeClaims.map((claim, i) => (
                <ActiveTrackingCard
                  key={Number(claim.id)}
                  claim={claim}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section B: Claim History */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2
              className="text-sm font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              📋 Claim History
            </h2>
            {historyClaims.length > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.26 0.012 255)",
                  color: "oklch(0.55 0.01 85)",
                }}
              >
                {historyClaims.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-shimmer h-24 rounded-xl" />
              ))}
            </div>
          ) : historyClaims.length === 0 ? (
            <div
              data-ocid="claims.history.empty_state"
              className="rounded-xl p-5 text-center"
              style={{
                background: "oklch(0.16 0.010 255)",
                border: "1px solid oklch(0.20 0.01 85 / 0.5)",
              }}
            >
              <p className="text-sm" style={{ color: "oklch(0.45 0.01 85)" }}>
                Abhi tak koi deal share nahi ki.
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.55 0.010 85)" }}
              >
                Deals page se share karo aur yahan track karo!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyClaims.map((claim, i) => (
                <ClaimHistoryCard
                  key={Number(claim.id)}
                  claim={claim}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
