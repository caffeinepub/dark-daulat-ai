import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  Shield,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KycDocType } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { KycStatus, useGetMyKyc, useSubmitKyc } from "../hooks/useQueries";

export default function KycPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: kyc, isLoading: kycLoading } = useGetMyKyc();
  const submitKycMutation = useSubmitKyc();

  const [selectedDoc, setSelectedDoc] = useState<KycDocType | null>(null);
  const [docNumber, setDocNumber] = useState("");
  const [docError, setDocError] = useState("");

  // ── Document photo upload state ──
  const [docImage, setDocImage] = useState<string | null>(null); // base64
  const [docImageName, setDocImageName] = useState("");

  // Auth guard
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  const validateDocNumber = (type: KycDocType, value: string): string => {
    if (type === KycDocType.aadhaar) {
      if (!/^\d{12}$/.test(value)) {
        return "Aadhaar number 12 digits ka hona chahiye";
      }
    } else if (type === KycDocType.pan) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
        return "PAN card format galat hai (Jaise: ABCDE1234F)";
      }
    }
    return "";
  };

  // ── Image compress and convert to base64 ──
  const handleDocImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size 2MB se zyada nahi hona chahiye");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Sirf image files allowed hain");
      return;
    }
    setDocImageName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 800;
        const maxH = 600;
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
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setDocImage(compressed);

        // Save to localStorage keyed by principal
        const principal = identity?.getPrincipal().toString() ?? "anonymous";
        localStorage.setItem(`kyc_doc_image_${principal}`, compressed);
        toast.success(
          "Document photo save ho gayi! Admin review ke liye tayyar hai.",
        );
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedDoc) {
      toast.error("Pehle document type select karo");
      return;
    }
    const err = validateDocNumber(selectedDoc, docNumber);
    if (err) {
      setDocError(err);
      return;
    }
    setDocError("");

    try {
      await submitKycMutation.mutateAsync({
        docType: selectedDoc,
        docNumber:
          selectedDoc === KycDocType.pan ? docNumber.toUpperCase() : docNumber,
      });
      toast.success("KYC submit ho gayi! Admin review karega. 24-48 ghante.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`KYC submit fail hui: ${msg.slice(0, 80)}`);
    }
  };

  // ── KYC already approved ──────────────────────────────────────────────────
  const kycStatus = kyc ? (kyc.status as unknown as string) : null;

  const isApproved =
    kycStatus === KycStatus.approved || kycStatus === "approved";
  const isPending = kycStatus === KycStatus.pending || kycStatus === "pending";
  const isRejected =
    kycStatus === KycStatus.rejected || kycStatus === "rejected";

  const maskDocNumber = (doc: string) =>
    doc.length > 4 ? `****${doc.slice(-4)}` : doc;

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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/profile" })}
            data-ocid="kyc.back_button"
            className="p-2 rounded-xl transition-colors"
            style={{
              background: "oklch(0.22 0.012 255)",
              border: "1px solid oklch(0.28 0.04 85 / 0.4)",
            }}
          >
            <ArrowLeft size={18} style={{ color: "oklch(0.78 0.12 85)" }} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={22} style={{ color: "oklch(0.78 0.12 85)" }} />
            <h1
              className="text-xl font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              KYC Verification
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Loading state */}
        {kycLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer h-16 rounded-xl" />
            ))}
          </div>
        )}

        {!kycLoading && (
          <AnimatePresence mode="wait">
            {/* ── Approved ─────────────────────────────────────────────── */}
            {isApproved && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-ocid="kyc.approved_card"
                className="rounded-2xl p-6 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.12 0.03 145), oklch(0.16 0.05 145))",
                  border: "1px solid oklch(0.55 0.18 145 / 0.5)",
                  boxShadow: "0 4px 24px oklch(0.55 0.18 145 / 0.15)",
                }}
              >
                <CheckCircle2
                  size={48}
                  className="mx-auto mb-3"
                  style={{ color: "oklch(0.70 0.18 145)" }}
                />
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "oklch(0.80 0.18 145)" }}
                >
                  KYC Approved ✅
                </h2>
                <p
                  className="text-sm mb-4"
                  style={{ color: "oklch(0.62 0.12 145)" }}
                >
                  Aapki KYC verify ho gayi hai. Ab aap withdrawal kar sakte ho!
                </p>
                {kyc && (
                  <div
                    className="rounded-xl p-3 text-left space-y-1"
                    style={{
                      background: "oklch(0.10 0.01 145 / 0.5)",
                      border: "1px solid oklch(0.55 0.18 145 / 0.3)",
                    }}
                  >
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "oklch(0.52 0.05 145)" }}>
                        Document:
                      </span>
                      <span
                        className="font-semibold capitalize"
                        style={{ color: "oklch(0.75 0.15 145)" }}
                      >
                        {kyc.docType === KycDocType.aadhaar
                          ? "Aadhaar Card"
                          : "PAN Card"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "oklch(0.52 0.05 145)" }}>
                        Number:
                      </span>
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "oklch(0.75 0.15 145)" }}
                      >
                        {maskDocNumber(kyc.docNumber)}
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => navigate({ to: "/wallet" })}
                  data-ocid="kyc.go_to_wallet_button"
                  className="mt-4 w-full h-11 font-semibold rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.45 0.18 145), oklch(0.60 0.22 150))",
                    color: "oklch(0.96 0.015 85)",
                    border: "none",
                  }}
                >
                  Wallet Pe Jaao 💰
                </Button>
              </motion.div>
            )}

            {/* ── Pending ──────────────────────────────────────────────── */}
            {isPending && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-ocid="kyc.pending_card"
                className="rounded-2xl p-6 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.13 0.04 70), oklch(0.17 0.06 70))",
                  border: "1px solid oklch(0.65 0.15 75 / 0.5)",
                  boxShadow: "0 4px 24px oklch(0.65 0.15 75 / 0.12)",
                }}
              >
                <Clock
                  size={48}
                  className="mx-auto mb-3"
                  style={{ color: "oklch(0.78 0.15 75)" }}
                />
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "oklch(0.85 0.15 75)" }}
                >
                  KYC Review Mein Hai ⏳
                </h2>
                <p
                  className="text-sm mb-3"
                  style={{ color: "oklch(0.65 0.12 75)" }}
                >
                  Aapki KYC request admin ke paas hai. 24-48 ghante mein update
                  milega.
                </p>
                {kyc && (
                  <div
                    className="rounded-xl p-3 text-left space-y-1"
                    style={{
                      background: "oklch(0.10 0.02 75 / 0.5)",
                      border: "1px solid oklch(0.65 0.15 75 / 0.3)",
                    }}
                  >
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "oklch(0.52 0.05 75)" }}>
                        Document:
                      </span>
                      <span
                        className="font-semibold capitalize"
                        style={{ color: "oklch(0.78 0.15 75)" }}
                      >
                        {kyc.docType === KycDocType.aadhaar
                          ? "Aadhaar Card"
                          : "PAN Card"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "oklch(0.52 0.05 75)" }}>
                        Number:
                      </span>
                      <span
                        className="font-mono font-semibold"
                        style={{ color: "oklch(0.78 0.15 75)" }}
                      >
                        {maskDocNumber(kyc.docNumber)}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Rejected / No KYC: Show Form ─────────────────────────── */}
            {(!kyc || isRejected) && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Rejection notice */}
                {isRejected && kyc && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    data-ocid="kyc.rejected_card"
                    className="rounded-xl p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.12 0.04 25), oklch(0.15 0.06 25))",
                      border: "1px solid oklch(0.62 0.22 25 / 0.5)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle
                        size={18}
                        style={{ color: "oklch(0.68 0.22 25)" }}
                      />
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "oklch(0.72 0.22 25)" }}
                      >
                        KYC Rejected
                      </span>
                    </div>
                    {kyc.rejectionReason && (
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.62 0.18 25)" }}
                      >
                        Reason: {kyc.rejectionReason}
                      </p>
                    )}
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.52 0.12 25)" }}
                    >
                      Neeche sahi document ke saath dobara submit karo.
                    </p>
                  </motion.div>
                )}

                {/* Info card */}
                {!kyc && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.6), oklch(0.18 0.06 85 / 0.4))",
                      border: "1px solid oklch(0.78 0.12 85 / 0.35)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield
                        size={16}
                        style={{ color: "oklch(0.78 0.12 85)" }}
                      />
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "oklch(0.86 0.14 85)" }}
                      >
                        KYC Kyun Zaroori Hai?
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        "💰 Withdrawal ke liye KYC must hai",
                        "🔒 Aapka account secure rehta hai",
                        "✅ Ek baar approve hone ke baad lifetime valid",
                      ].map((text) => (
                        <p
                          key={text}
                          className="text-xs"
                          style={{ color: "oklch(0.62 0.01 85)" }}
                        >
                          {text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document type selector */}
                <div>
                  <p
                    className="text-sm font-semibold mb-3"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    Document Type Select Karo *
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Aadhaar Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoc(KycDocType.aadhaar);
                        setDocNumber("");
                        setDocError("");
                      }}
                      data-ocid="kyc.aadhaar_select_button"
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background:
                          selectedDoc === KycDocType.aadhaar
                            ? "linear-gradient(135deg, oklch(0.14 0.04 85), oklch(0.18 0.06 85))"
                            : "oklch(0.18 0.010 255)",
                        border: `2px solid ${selectedDoc === KycDocType.aadhaar ? "oklch(0.78 0.12 85 / 0.7)" : "oklch(0.28 0.012 255)"}`,
                        boxShadow:
                          selectedDoc === KycDocType.aadhaar
                            ? "0 4px 16px oklch(0.78 0.12 85 / 0.2)"
                            : "none",
                      }}
                    >
                      <FileText
                        size={24}
                        className="mb-2"
                        style={{
                          color:
                            selectedDoc === KycDocType.aadhaar
                              ? "oklch(0.86 0.14 85)"
                              : "oklch(0.52 0.01 85)",
                        }}
                      />
                      <p
                        className="font-bold text-sm"
                        style={{
                          color:
                            selectedDoc === KycDocType.aadhaar
                              ? "oklch(0.86 0.14 85)"
                              : "oklch(0.72 0.03 85)",
                        }}
                      >
                        Aadhaar Card
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "oklch(0.58 0.010 85)" }}
                      >
                        12-digit number
                      </p>
                    </button>

                    {/* PAN Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoc(KycDocType.pan);
                        setDocNumber("");
                        setDocError("");
                      }}
                      data-ocid="kyc.pan_select_button"
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background:
                          selectedDoc === KycDocType.pan
                            ? "linear-gradient(135deg, oklch(0.14 0.04 85), oklch(0.18 0.06 85))"
                            : "oklch(0.18 0.010 255)",
                        border: `2px solid ${selectedDoc === KycDocType.pan ? "oklch(0.78 0.12 85 / 0.7)" : "oklch(0.28 0.012 255)"}`,
                        boxShadow:
                          selectedDoc === KycDocType.pan
                            ? "0 4px 16px oklch(0.78 0.12 85 / 0.2)"
                            : "none",
                      }}
                    >
                      <CreditCard
                        size={24}
                        className="mb-2"
                        style={{
                          color:
                            selectedDoc === KycDocType.pan
                              ? "oklch(0.86 0.14 85)"
                              : "oklch(0.52 0.01 85)",
                        }}
                      />
                      <p
                        className="font-bold text-sm"
                        style={{
                          color:
                            selectedDoc === KycDocType.pan
                              ? "oklch(0.86 0.14 85)"
                              : "oklch(0.72 0.03 85)",
                        }}
                      >
                        PAN Card
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "oklch(0.58 0.010 85)" }}
                      >
                        10-char (ABCDE1234F)
                      </p>
                    </button>
                  </div>
                </div>

                {/* Document number input */}
                <AnimatePresence>
                  {selectedDoc && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Label
                        htmlFor="docNumber"
                        className="text-sm mb-1.5 block"
                        style={{ color: "oklch(0.82 0.05 85)" }}
                      >
                        {selectedDoc === KycDocType.aadhaar
                          ? "Aadhaar Number *"
                          : "PAN Card Number *"}
                      </Label>
                      <Input
                        id="docNumber"
                        type={
                          selectedDoc === KycDocType.aadhaar ? "tel" : "text"
                        }
                        inputMode={
                          selectedDoc === KycDocType.aadhaar
                            ? "numeric"
                            : "text"
                        }
                        placeholder={
                          selectedDoc === KycDocType.aadhaar
                            ? "123456789012"
                            : "ABCDE1234F"
                        }
                        maxLength={selectedDoc === KycDocType.aadhaar ? 12 : 10}
                        value={docNumber}
                        onChange={(e) => {
                          const val =
                            selectedDoc === KycDocType.aadhaar
                              ? e.target.value.replace(/\D/g, "").slice(0, 12)
                              : e.target.value.toUpperCase().slice(0, 10);
                          setDocNumber(val);
                          if (docError) setDocError("");
                        }}
                        data-ocid="kyc.doc_number_input"
                        className="h-12 rounded-xl text-lg font-mono tracking-wider"
                        style={{
                          background: "oklch(0.20 0.010 255)",
                          border: `1px solid ${docError ? "oklch(0.62 0.22 25 / 0.7)" : "oklch(0.28 0.04 85 / 0.5)"}`,
                          color: "oklch(0.96 0.015 85)",
                        }}
                      />
                      {docError && (
                        <p
                          data-ocid="kyc.doc_error_state"
                          className="text-xs mt-1.5"
                          style={{ color: "oklch(0.68 0.22 25)" }}
                        >
                          ⚠️ {docError}
                        </p>
                      )}
                      <p
                        className="text-[10px] mt-1.5"
                        style={{ color: "oklch(0.58 0.010 85)" }}
                      >
                        {selectedDoc === KycDocType.aadhaar
                          ? "Aadhaar card pe 12-digit number hota hai"
                          : "PAN card format: AAAAA9999A (5 letters + 4 digits + 1 letter)"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Document Photo Upload ─────────────────────── */}
                <div className="space-y-2">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    📷 Document ki Photo Upload Karo (Recommended)
                  </p>

                  {/* Warning if no image */}
                  {!docImage && (
                    <div
                      data-ocid="kyc.photo_warning"
                      className="rounded-xl p-3 flex items-start gap-2.5"
                      style={{
                        background: "oklch(0.68 0.18 75 / 0.12)",
                        border: "1px solid oklch(0.68 0.18 75 / 0.5)",
                      }}
                    >
                      <AlertTriangle
                        size={15}
                        className="shrink-0 mt-0.5"
                        style={{ color: "oklch(0.80 0.18 75)" }}
                      />
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "oklch(0.78 0.15 75)" }}
                      >
                        Document photo upload karene se KYC jaldi approve hoti
                        hai
                      </p>
                    </div>
                  )}

                  {/* Upload area */}
                  <label
                    htmlFor="kyc-doc-photo"
                    data-ocid="kyc.upload_button"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 cursor-pointer transition-all"
                    style={{
                      border: `2px dashed ${docImage ? "oklch(0.55 0.18 145 / 0.6)" : "oklch(0.78 0.12 85 / 0.5)"}`,
                      background: docImage
                        ? "oklch(0.55 0.18 145 / 0.06)"
                        : "oklch(0.18 0.010 255 / 0.5)",
                    }}
                  >
                    <Camera
                      size={22}
                      style={{
                        color: docImage
                          ? "oklch(0.68 0.18 145)"
                          : "oklch(0.68 0.10 85)",
                      }}
                    />
                    <p
                      className="text-xs font-semibold"
                      style={{
                        color: docImage
                          ? "oklch(0.72 0.18 145)"
                          : "oklch(0.72 0.08 85)",
                      }}
                    >
                      {docImage
                        ? `✅ ${docImageName} — uploaded`
                        : "Photo Upload Karo"}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "oklch(0.58 0.010 85)" }}
                    >
                      JPG, PNG — max 2MB
                    </p>
                    <input
                      id="kyc-doc-photo"
                      type="file"
                      accept="image/*"
                      onChange={handleDocImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Thumbnail preview */}
                  {docImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <img
                        src={docImage}
                        alt="Document preview"
                        className="w-full max-h-32 object-contain rounded-xl"
                        style={{
                          border: "1px solid oklch(0.55 0.18 145 / 0.4)",
                          background: "oklch(0.20 0.010 255)",
                        }}
                      />
                      <p
                        className="text-xs text-center"
                        style={{ color: "oklch(0.65 0.15 145)" }}
                      >
                        ✅ Document photo uploaded. Admin review ke liye save ho
                        gayi.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitKycMutation.isPending ||
                    !selectedDoc ||
                    !docNumber.trim()
                  }
                  data-ocid="kyc.submit_button"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  style={{
                    background:
                      selectedDoc && docNumber
                        ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88), oklch(0.72 0.11 80))"
                        : "oklch(0.18 0.01 85)",
                    color:
                      selectedDoc && docNumber
                        ? "oklch(0.08 0 0)"
                        : "oklch(0.42 0.01 85)",
                    border: "none",
                    boxShadow:
                      selectedDoc && docNumber
                        ? "0 4px 20px oklch(0.78 0.12 85 / 0.4)"
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {submitKycMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submit ho raha hai...
                    </>
                  ) : (
                    "🛡️ KYC Submit Karo"
                  )}
                </Button>

                {/* Security note */}
                <div
                  className="rounded-xl p-3 flex items-start gap-2"
                  style={{
                    background: "oklch(0.18 0.010 255 / 0.8)",
                    border: "1px solid oklch(0.22 0.01 85)",
                  }}
                >
                  <Lock
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "oklch(0.52 0.01 85)" }}
                  />
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.58 0.010 85)" }}
                  >
                    🔒 Aapka data completely secure hai. Sirf Admin verify karta
                    hai. Koi bhi third party ko share nahi hoga.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
