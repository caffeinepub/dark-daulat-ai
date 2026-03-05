import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  Edit2,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Deal, KycRecord, Transaction, User } from "../backend.d";
import { KycDocType } from "../backend.d";
import {
  TransactionStatus as TxStatus,
  TransactionType as TxType,
} from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  KycStatus,
  useAddDeal,
  useApproveKyc,
  useApproveWithdrawal,
  useCreditCommission,
  useDeleteDeal,
  useGetAdminStats,
  useGetAffiliateAccount,
  useGetAllAdminAffiliateSettings,
  useGetAllDeals,
  useGetAllKyc,
  useGetAllTransactions,
  useGetAllUsers,
  useGetUser,
  useRejectKyc,
  useRejectWithdrawal,
  useSaveAdminAffiliateSettings,
  useSaveAffiliateAccount,
  useUpdateDeal,
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

interface DealFormData {
  title: string;
  imageUrl: string;
  price: string;
  affiliateLink: string;
  commissionPercent: string;
  trendingTag: string;
  targetRegion: string;
  description: string;
}

const emptyForm: DealFormData = {
  title: "",
  imageUrl: "",
  price: "",
  affiliateLink: "",
  commissionPercent: "",
  trendingTag: "",
  targetRegion: "",
  description: "",
};

function DealForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  isEdit,
}: {
  initial?: DealFormData;
  onSubmit: (d: DealFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit?: boolean;
}) {
  const [form, setForm] = useState<DealFormData>(initial ?? emptyForm);
  const set =
    (k: keyof DealFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const inputStyle = {
    background: "oklch(0.10 0 0)",
    border: "1px solid oklch(0.28 0.04 85 / 0.5)",
    color: "oklch(0.96 0.015 85)",
    fontSize: "14px",
  };

  return (
    <div
      className="space-y-3 p-4 rounded-xl"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.28 0.04 85 / 0.3)",
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Title *
          </Label>
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="Deal title"
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Price (₹) *
          </Label>
          <Input
            type="number"
            value={form.price}
            onChange={set("price")}
            placeholder="1999"
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Commission % *
          </Label>
          <Input
            type="number"
            value={form.commissionPercent}
            onChange={set("commissionPercent")}
            placeholder="15"
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div className="col-span-2">
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Affiliate Link *
          </Label>
          <Input
            value={form.affiliateLink}
            onChange={set("affiliateLink")}
            placeholder="https://..."
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div className="col-span-2">
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Image URL
          </Label>
          <Input
            value={form.imageUrl}
            onChange={set("imageUrl")}
            placeholder="https://image.jpg"
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Trending Tag
          </Label>
          <Input
            value={form.trendingTag}
            onChange={set("trendingTag")}
            placeholder="Hot Deal"
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Target Region
          </Label>
          <Input
            value={form.targetRegion}
            onChange={set("targetRegion")}
            placeholder="Pan India"
            className="h-9 rounded-lg"
            style={inputStyle}
          />
        </div>
        <div className="col-span-2">
          <Label
            className="text-xs mb-1 block"
            style={{ color: "oklch(0.62 0.01 85)" }}
          >
            Description
          </Label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Deal description..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
            style={inputStyle}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          onClick={() => onSubmit(form)}
          disabled={isPending}
          data-ocid="admin.add_deal_button"
          className="flex-1 h-9 text-xs rounded-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
            color: "oklch(0.08 0 0)",
            border: "none",
          }}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin mr-1" />
          ) : null}
          {isEdit ? "Update Deal" : "Add Deal"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 h-9 text-xs rounded-lg"
          style={{
            background: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.28 0 0)",
            color: "oklch(0.62 0.01 85)",
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Quick Affiliate Link Import ─────────────────────────────────────────────
interface ParsedProduct {
  title: string;
  price: string;
  commissionPercent: string;
  affiliateLink: string;
  imageUrl: string;
  trendingTag: string;
  targetRegion: string;
  description: string;
  platform: string;
}

function detectPlatform(url: string): string {
  if (
    url.includes("amazon.in") ||
    url.includes("amzn.in") ||
    url.includes("amazon.com")
  )
    return "Amazon";
  if (url.includes("flipkart.com")) return "Flipkart";
  if (url.includes("aliexpress.com")) return "AliExpress";
  if (url.includes("fiverr.com")) return "Fiverr";
  if (url.includes("meesho.com")) return "Meesho";
  if (url.includes("myntra.com")) return "Myntra";
  if (url.includes("snapdeal.com")) return "Snapdeal";
  return "Other";
}

function getDefaultCommission(platform: string): string {
  switch (platform) {
    case "Amazon":
      return "8";
    case "Flipkart":
      return "10";
    case "AliExpress":
      return "12";
    case "Fiverr":
      return "20";
    case "Meesho":
      return "15";
    default:
      return "10";
  }
}

function extractProductTitleFromUrl(url: string, platform: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    if (platform === "Amazon") {
      // Amazon URLs: /dp/ASIN or /product-name/dp/ASIN
      const parts = pathname.split("/").filter(Boolean);
      const dpIndex = parts.findIndex((p) => p === "dp");
      if (dpIndex > 0) {
        return parts[dpIndex - 1]
          .replace(/-/g, " ")
          .replace(/[+_]/g, " ")
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
          .slice(0, 80);
      }
    }
    if (platform === "Flipkart") {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[0]
          .replace(/-/g, " ")
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
          .slice(0, 80);
      }
    }
    if (platform === "Fiverr") {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return parts[parts.length - 1]
          .replace(/-/g, " ")
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
          .slice(0, 80);
      }
    }
  } catch {
    // ignore
  }
  return "";
}

function QuickImportSection({
  onImported,
}: { onImported: (data: DealFormData) => void }) {
  const [url, setUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedProduct | null>(null);
  const [editableTitle, setEditableTitle] = useState("");
  const [editablePrice, setEditablePrice] = useState("");
  const [editableComm, setEditableComm] = useState("");
  const [editableDesc, setEditableDesc] = useState("");

  const inputStyle = {
    background: "oklch(0.10 0 0)",
    border: "1px solid oklch(0.28 0.04 85 / 0.5)",
    color: "oklch(0.96 0.015 85)",
    fontSize: "14px",
  };

  const handleParse = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Pehle URL paste karo");
      return;
    }
    // Basic URL check
    try {
      new URL(trimmed);
    } catch {
      toast.error("Sahi URL nahi hai. https:// se shuru karo");
      return;
    }

    setParsing(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate parsing

    const platform = detectPlatform(trimmed);
    const defaultComm = getDefaultCommission(platform);
    const extractedTitle = extractProductTitleFromUrl(trimmed, platform);
    const title = extractedTitle || `${platform} Product`;

    // Platform-specific tag suggestions
    const platformTags: Record<string, string> = {
      Amazon: "Amazon Deal",
      Flipkart: "Flipkart Sale",
      AliExpress: "AliExpress Offer",
      Fiverr: "Fiverr Service",
      Meesho: "Meesho Deal",
      Myntra: "Fashion Deal",
    };

    const result: ParsedProduct = {
      title,
      price: "999",
      commissionPercent: defaultComm,
      affiliateLink: trimmed,
      imageUrl: "",
      trendingTag: platformTags[platform] ?? "Hot Deal",
      targetRegion: "Pan India",
      description: `${platform} se best deal -- affiliate link ke zariye khareedne par ${defaultComm}% commission milegi.`,
      platform,
    };

    setParsed(result);
    setEditableTitle(result.title);
    setEditablePrice(result.price);
    setEditableComm(result.commissionPercent);
    setEditableDesc(result.description);
    setParsing(false);
    toast.success(
      `${platform} link detect hua! Details fill karo aur add karo.`,
    );
  };

  const handleAddDeal = () => {
    if (!parsed) return;
    if (!editableTitle.trim() || !editablePrice || !editableComm) {
      toast.error("Title, price aur commission zaroori hain");
      return;
    }
    onImported({
      title: editableTitle,
      price: editablePrice,
      commissionPercent: editableComm,
      affiliateLink: parsed.affiliateLink,
      imageUrl: parsed.imageUrl,
      trendingTag: parsed.trendingTag,
      targetRegion: parsed.targetRegion,
      description: editableDesc,
    });
    // Reset
    setUrl("");
    setParsed(null);
    setEditableTitle("");
    setEditablePrice("");
    setEditableComm("");
    setEditableDesc("");
  };

  const platformColors: Record<string, { bg: string; text: string }> = {
    Amazon: { bg: "oklch(0.75 0.15 50 / 0.15)", text: "oklch(0.85 0.15 50)" },
    Flipkart: {
      bg: "oklch(0.55 0.22 260 / 0.15)",
      text: "oklch(0.70 0.20 260)",
    },
    AliExpress: {
      bg: "oklch(0.65 0.22 28 / 0.15)",
      text: "oklch(0.75 0.20 28)",
    },
    Fiverr: { bg: "oklch(0.60 0.22 155 / 0.15)", text: "oklch(0.72 0.20 155)" },
    Meesho: { bg: "oklch(0.68 0.22 330 / 0.15)", text: "oklch(0.78 0.18 330)" },
    Myntra: { bg: "oklch(0.65 0.22 340 / 0.15)", text: "oklch(0.75 0.20 340)" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 space-y-3 mb-3"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.6), oklch(0.12 0.02 85 / 0.4))",
        border: "1px solid oklch(0.78 0.12 85 / 0.4)",
        boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.1)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap size={15} style={{ color: "oklch(0.86 0.14 85)" }} />
        <p
          className="text-sm font-bold"
          style={{ color: "oklch(0.86 0.14 85)" }}
        >
          Quick Affiliate Link Import
        </p>
        <span
          className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: "oklch(0.55 0.18 145 / 0.2)",
            color: "oklch(0.70 0.18 145)",
            border: "1px solid oklch(0.55 0.18 145 / 0.3)",
          }}
        >
          NEW
        </span>
      </div>
      <p className="text-xs" style={{ color: "oklch(0.55 0.01 85)" }}>
        Amazon, Flipkart, AliExpress, Fiverr ya kisi bhi e-commerce site ka
        affiliate link paste karo -- details automatically fill ho jaayengi
      </p>

      {/* URL Input Row */}
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          data-ocid="admin.quick_import_url_input"
          placeholder="https://www.amazon.in/dp/... ya koi bhi affiliate link"
          className="h-10 rounded-xl text-xs flex-1"
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleParse();
          }}
        />
        <Button
          onClick={handleParse}
          disabled={parsing || !url.trim()}
          data-ocid="admin.quick_import_parse_button"
          className="h-10 px-4 rounded-xl text-xs font-semibold shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
            color: "oklch(0.08 0 0)",
            border: "none",
          }}
        >
          {parsing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Sparkles size={14} className="mr-1" /> Import
            </>
          )}
        </Button>
      </div>

      {/* Platform examples */}
      {!parsed && (
        <div className="flex flex-wrap gap-1.5">
          {["Amazon", "Flipkart", "AliExpress", "Fiverr", "Meesho"].map((p) => (
            <span
              key={p}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: platformColors[p]?.bg ?? "oklch(0.14 0 0)",
                color: platformColors[p]?.text ?? "oklch(0.62 0.01 85)",
                border: `1px solid ${platformColors[p]?.text ?? "oklch(0.28 0.01 85)"}/0.3`,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Parsed Result */}
      {parsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 pt-2 border-t"
          style={{ borderColor: "oklch(0.28 0.04 85 / 0.3)" }}
        >
          {/* Platform badge + link preview */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{
                background:
                  platformColors[parsed.platform]?.bg ?? "oklch(0.14 0 0)",
                color:
                  platformColors[parsed.platform]?.text ??
                  "oklch(0.62 0.01 85)",
              }}
            >
              {parsed.platform} ✓
            </span>
            <a
              href={parsed.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] underline"
              style={{ color: "oklch(0.55 0.01 85)" }}
            >
              Link preview <ExternalLink size={10} />
            </a>
          </div>

          <p
            className="text-xs font-semibold"
            style={{ color: "oklch(0.78 0.12 85)" }}
          >
            Neeche details check karo aur zarurat ho to edit karo:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {/* Title */}
            <div className="col-span-2">
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Product Title *
              </Label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                data-ocid="admin.quick_import_title_input"
                placeholder="Product ka naam"
                className="h-9 rounded-lg"
                style={inputStyle}
              />
            </div>

            {/* Price */}
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Price (₹) *
              </Label>
              <Input
                type="number"
                value={editablePrice}
                onChange={(e) => setEditablePrice(e.target.value)}
                data-ocid="admin.quick_import_price_input"
                placeholder="999"
                className="h-9 rounded-lg"
                style={inputStyle}
              />
            </div>

            {/* Commission */}
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Commission % *
              </Label>
              <Input
                type="number"
                value={editableComm}
                onChange={(e) => setEditableComm(e.target.value)}
                data-ocid="admin.quick_import_commission_input"
                placeholder="8"
                className="h-9 rounded-lg"
                style={inputStyle}
              />
            </div>

            {/* Image URL */}
            <div className="col-span-2">
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Product Image URL (Optional)
              </Label>
              <Input
                value={parsed.imageUrl}
                onChange={(e) =>
                  setParsed((prev) =>
                    prev ? { ...prev, imageUrl: e.target.value } : null,
                  )
                }
                data-ocid="admin.quick_import_image_input"
                placeholder="https://image.jpg"
                className="h-9 rounded-lg"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Description
              </Label>
              <textarea
                value={editableDesc}
                onChange={(e) => setEditableDesc(e.target.value)}
                placeholder="Deal description..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-xs resize-none outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Commission info box */}
          <div
            className="rounded-lg p-2.5 text-xs"
            style={{
              background: "oklch(0.55 0.18 145 / 0.08)",
              border: "1px solid oklch(0.55 0.18 145 / 0.25)",
              color: "oklch(0.70 0.18 145)",
            }}
          >
            <p className="font-semibold mb-0.5">Commission Flow:</p>
            <p style={{ color: "oklch(0.55 0.01 85)" }}>
              {parsed.platform} aapko {editableComm || "?"}% dega → Aap user ko
              commission credit karoge → 2% admin pool mein jayega
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddDeal}
              data-ocid="admin.quick_import_add_button"
              className="flex-1 h-10 text-sm rounded-xl font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
                border: "none",
              }}
            >
              <Plus size={15} className="mr-1.5" />
              Ye Deal App Mein Add Karo
            </Button>
            <Button
              onClick={() => {
                setParsed(null);
                setUrl("");
              }}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.22 0.01 85)",
                color: "oklch(0.52 0.01 85)",
              }}
            >
              Reset
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Deals Tab ────────────────────────────────────────────────────────────────
function DealsTab() {
  const { data: deals = [], isLoading } = useGetAllDeals();
  const addDeal = useAddDeal();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);

  const handleAdd = async (form: DealFormData) => {
    if (
      !form.title ||
      !form.price ||
      !form.commissionPercent ||
      !form.affiliateLink
    ) {
      toast.error("Title, price, commission, aur link required hain");
      return;
    }
    try {
      await addDeal.mutateAsync({
        title: form.title,
        imageUrl: form.imageUrl,
        price: BigInt(Math.floor(Number(form.price))),
        affiliateLink: form.affiliateLink,
        commissionPercent: BigInt(Math.floor(Number(form.commissionPercent))),
        trendingTag: form.trendingTag,
        targetRegion: form.targetRegion,
        description: form.description,
      });
      toast.success("Deal add ho gayi!");
      setShowForm(false);
    } catch {
      toast.error("Deal add fail hui");
    }
  };

  const handleUpdate = async (form: DealFormData, id: bigint) => {
    try {
      await updateDeal.mutateAsync({
        id,
        title: form.title,
        imageUrl: form.imageUrl,
        price: BigInt(Math.floor(Number(form.price))),
        affiliateLink: form.affiliateLink,
        commissionPercent: BigInt(Math.floor(Number(form.commissionPercent))),
        trendingTag: form.trendingTag,
        targetRegion: form.targetRegion,
        description: form.description,
      });
      toast.success("Deal update ho gayi!");
      setEditingId(null);
    } catch {
      toast.error("Update fail hua");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Kya aap sure hain?")) return;
    try {
      await deleteDeal.mutateAsync(id);
      toast.success("Deal delete ho gayi");
    } catch {
      toast.error("Delete fail hua");
    }
  };

  const handleImportedDeal = async (form: DealFormData) => {
    if (
      !form.title ||
      !form.price ||
      !form.commissionPercent ||
      !form.affiliateLink
    ) {
      toast.error("Title, price, commission, aur link required hain");
      return;
    }
    try {
      await addDeal.mutateAsync({
        title: form.title,
        imageUrl: form.imageUrl,
        price: BigInt(Math.floor(Number(form.price))),
        affiliateLink: form.affiliateLink,
        commissionPercent: BigInt(Math.floor(Number(form.commissionPercent))),
        trendingTag: form.trendingTag,
        targetRegion: form.targetRegion,
        description: form.description,
      });
      toast.success("Deal successfully add ho gayi! ✅");
    } catch {
      toast.error("Deal add fail hui");
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick Import Section -- always visible */}
      {!editingId && <QuickImportSection onImported={handleImportedDeal} />}

      {/* Divider */}
      {!editingId && (
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{ background: "oklch(0.22 0.01 85)" }}
          />
          <span
            className="text-[10px]"
            style={{ color: "oklch(0.40 0.01 85)" }}
          >
            YA MANUALLY ADD KARO
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "oklch(0.22 0.01 85)" }}
          />
        </div>
      )}

      {!showForm && !editingId && (
        <Button
          onClick={() => setShowForm(true)}
          data-ocid="admin.add_deal_button"
          className="w-full h-10 text-sm rounded-xl"
          style={{
            background: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.28 0.04 85 / 0.5)",
            color: "oklch(0.78 0.12 85)",
          }}
        >
          <Plus size={16} className="mr-1.5" /> Manually Deal Add Karo
        </Button>
      )}

      {showForm && (
        <DealForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          isPending={addDeal.isPending}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
            <div key={i} className="animate-shimmer h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-xl"
          data-ocid="admin.deal_table"
          style={{ border: "1px solid oklch(0.22 0.01 85)" }}
        >
          <table className="w-full text-xs">
            <thead>
              <tr
                style={{
                  background: "oklch(0.14 0.005 85)",
                  borderBottom: "1px solid oklch(0.22 0.01 85)",
                }}
              >
                {["Title", "Price", "Comm%", "Shares", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold"
                    style={{ color: "oklch(0.62 0.01 85)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deals.map((deal: Deal) =>
                editingId === deal.id ? (
                  <tr key={Number(deal.id)}>
                    <td colSpan={5} className="p-2">
                      <DealForm
                        initial={{
                          title: deal.title,
                          imageUrl: deal.imageUrl,
                          price: String(Number(deal.price)),
                          affiliateLink: deal.affiliateLink,
                          commissionPercent: String(
                            Number(deal.commissionPercent),
                          ),
                          trendingTag: deal.trendingTag,
                          targetRegion: deal.targetRegion,
                          description: deal.description,
                        }}
                        onSubmit={(form) => handleUpdate(form, deal.id)}
                        onCancel={() => setEditingId(null)}
                        isPending={updateDeal.isPending}
                        isEdit
                      />
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={Number(deal.id)}
                    style={{ borderBottom: "1px solid oklch(0.16 0 0)" }}
                  >
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "oklch(0.82 0.05 85)" }}
                    >
                      <span className="line-clamp-1 max-w-[120px] block">
                        {deal.title}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "oklch(0.78 0.12 85)" }}
                    >
                      ₹{formatINR(deal.price)}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "oklch(0.62 0.01 85)" }}
                    >
                      {Number(deal.commissionPercent)}%
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "oklch(0.62 0.01 85)" }}
                    >
                      {Number(deal.shareCount)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(deal.id)}
                          className="p-1.5 rounded-lg"
                          style={{
                            background: "oklch(0.78 0.12 85 / 0.15)",
                            border: "1px solid oklch(0.78 0.12 85 / 0.3)",
                          }}
                        >
                          <Edit2
                            size={11}
                            style={{ color: "oklch(0.78 0.12 85)" }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(deal.id)}
                          className="p-1.5 rounded-lg"
                          style={{
                            background: "oklch(0.62 0.22 25 / 0.15)",
                            border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                          }}
                        >
                          <Trash2
                            size={11}
                            style={{ color: "oklch(0.68 0.22 25)" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {deals.length === 0 && (
            <p
              className="text-center py-6 text-xs"
              style={{ color: "oklch(0.45 0.01 85)" }}
            >
              Koi deal nahi hai
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users = [], isLoading } = useGetAllUsers();
  const creditCommission = useCreditCommission();
  const [creditUserId, setCreditUserId] = useState<Principal | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");

  const handleCredit = async () => {
    if (!creditUserId || !creditAmount) return;
    try {
      await creditCommission.mutateAsync({
        userId: creditUserId,
        amount: BigInt(Math.floor(Number(creditAmount))),
        note: creditNote || "Admin credit",
      });
      toast.success("Credit ho gaya!");
      setCreditUserId(null);
      setCreditAmount("");
      setCreditNote("");
    } catch {
      toast.error("Credit fail hua");
    }
  };

  return (
    <div
      className="overflow-x-auto rounded-xl"
      data-ocid="admin.users_table"
      style={{ border: "1px solid oklch(0.22 0.01 85)" }}
    >
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
            <div key={i} className="animate-shimmer h-10 rounded-lg" />
          ))}
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr
              style={{
                background: "oklch(0.14 0.005 85)",
                borderBottom: "1px solid oklch(0.22 0.01 85)",
              }}
            >
              {["Name", "Code", "Balance", "Earnings", "Admin", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold"
                    style={{ color: "oklch(0.62 0.01 85)" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr
                key={user.referralCode}
                style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}
              >
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.82 0.05 85)" }}
                >
                  {user.name}
                </td>
                <td
                  className="px-3 py-2.5 font-mono"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  {user.referralCode}
                </td>
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.78 0.12 85)" }}
                >
                  ₹{formatINR(user.walletBalance)}
                </td>
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  ₹{formatINR(user.totalEarnings)}
                </td>
                <td className="px-3 py-2.5">
                  {user.isAdmin ? (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.78 0.12 85 / 0.15)",
                        color: "oklch(0.86 0.14 85)",
                      }}
                    >
                      Admin
                    </span>
                  ) : (
                    <span style={{ color: "oklch(0.38 0.01 85)" }}>—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCreditUserId(user as unknown as Principal)
                    }
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                    style={{
                      background: "oklch(0.78 0.12 85 / 0.15)",
                      color: "oklch(0.86 0.14 85)",
                      border: "1px solid oklch(0.78 0.12 85 / 0.3)",
                    }}
                  >
                    Credit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Credit dialog */}
      {creditUserId !== null && (
        <div
          className="p-4 border-t"
          style={{ borderColor: "oklch(0.22 0.01 85)" }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            Credit Commission
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount ₹"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="h-9 rounded-lg text-xs"
              style={{
                background: "oklch(0.10 0 0)",
                border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                color: "oklch(0.96 0.015 85)",
              }}
            />
            <Input
              placeholder="Note"
              value={creditNote}
              onChange={(e) => setCreditNote(e.target.value)}
              className="h-9 rounded-lg text-xs"
              style={{
                background: "oklch(0.10 0 0)",
                border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                color: "oklch(0.96 0.015 85)",
              }}
            />
            <button
              type="button"
              onClick={handleCredit}
              disabled={creditCommission.isPending}
              className="px-3 h-9 rounded-lg text-xs font-bold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
                color: "oklch(0.08 0 0)",
              }}
            >
              {creditCommission.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                "Add"
              )}
            </button>
            <button
              type="button"
              onClick={() => setCreditUserId(null)}
              className="px-3 h-9 rounded-lg text-xs shrink-0"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.22 0.01 85)",
                color: "oklch(0.62 0.01 85)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab() {
  const { data: transactions = [], isLoading } = useGetAllTransactions();
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();

  return (
    <div
      className="overflow-x-auto rounded-xl"
      data-ocid="admin.transactions_table"
      style={{ border: "1px solid oklch(0.22 0.01 85)" }}
    >
      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
            <div key={i} className="animate-shimmer h-10 rounded-lg" />
          ))}
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr
              style={{
                background: "oklch(0.14 0.005 85)",
                borderBottom: "1px solid oklch(0.22 0.01 85)",
              }}
            >
              {["ID", "Type", "Amount", "Status", "Date", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold"
                    style={{ color: "oklch(0.62 0.01 85)" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: Transaction) => (
              <tr
                key={Number(tx.id)}
                style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}
              >
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  #{Number(tx.id)}
                </td>
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.82 0.05 85)" }}
                >
                  {tx.transactionType}
                </td>
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.78 0.12 85)" }}
                >
                  ₹{formatINR(tx.amount)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      background:
                        tx.status === TxStatus.approved
                          ? "oklch(0.70 0.18 140 / 0.15)"
                          : tx.status === TxStatus.rejected
                            ? "oklch(0.62 0.22 25 / 0.15)"
                            : "oklch(0.75 0.15 80 / 0.15)",
                      color:
                        tx.status === TxStatus.approved
                          ? "oklch(0.75 0.18 140)"
                          : tx.status === TxStatus.rejected
                            ? "oklch(0.68 0.22 25)"
                            : "oklch(0.85 0.15 80)",
                    }}
                  >
                    {tx.status}
                  </span>
                </td>
                <td
                  className="px-3 py-2.5"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  {formatDate(tx.timestamp)}
                </td>
                <td className="px-3 py-2.5">
                  {tx.status === TxStatus.pending &&
                    tx.transactionType === TxType.withdrawal && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await approve.mutateAsync(tx.id);
                              toast.success("Approved!");
                            } catch {
                              toast.error("Failed");
                            }
                          }}
                          disabled={approve.isPending}
                          className="p-1.5 rounded-lg"
                          style={{
                            background: "oklch(0.70 0.18 140 / 0.15)",
                            border: "1px solid oklch(0.70 0.18 140 / 0.3)",
                          }}
                        >
                          <Check
                            size={11}
                            style={{ color: "oklch(0.75 0.18 140)" }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await reject.mutateAsync(tx.id);
                              toast.success("Rejected");
                            } catch {
                              toast.error("Failed");
                            }
                          }}
                          disabled={reject.isPending}
                          className="p-1.5 rounded-lg"
                          style={{
                            background: "oklch(0.62 0.22 25 / 0.15)",
                            border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                          }}
                        >
                          <X
                            size={11}
                            style={{ color: "oklch(0.68 0.22 25)" }}
                          />
                        </button>
                      </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isLoading && transactions.length === 0 && (
        <p
          className="text-center py-6 text-xs"
          style={{ color: "oklch(0.45 0.01 85)" }}
        >
          Koi transaction nahi hai
        </p>
      )}
    </div>
  );
}

// ─── Admin Earnings Tab ───────────────────────────────────────────────────────
function AdminEarningsTab() {
  const { data: stats, isLoading } = useGetAdminStats();
  const { data: allTxns = [] } = useGetAllTransactions();

  // Calculate admin earnings from platform fee (2% of all approved withdrawals)
  const totalWithdrawn = allTxns
    .filter(
      (t) =>
        t.transactionType === TxType.withdrawal &&
        t.status === TxStatus.approved,
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const platformFeeEarned = Math.floor(totalWithdrawn * 0.02);

  // 2% commission from all credited commissions
  const totalCommissionPaid = stats ? Number(stats.totalCommissionPaid) : 0;
  const adminCommissionEarned = Math.floor(totalCommissionPaid * 0.02);

  const totalAdminEarnings = platformFeeEarned + adminCommissionEarned;

  // Pending withdrawals (admin can withdraw their earnings)
  const pendingWithdrawals = allTxns.filter(
    (t) =>
      t.transactionType === TxType.withdrawal && t.status === TxStatus.pending,
  );

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleAdminWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) < 200) {
      toast.error("Minimum withdrawal ₹200 hai");
      return;
    }
    if (!upiId.trim()) {
      toast.error("UPI ID ya account details daalo");
      return;
    }
    if (Number(withdrawAmount) > totalAdminEarnings) {
      toast.error("Insufficient admin earnings");
      return;
    }
    setWithdrawLoading(true);
    // Simulate processing - in production this would call a dedicated admin withdrawal API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setWithdrawLoading(false);
    toast.success(
      `₹${withdrawAmount} withdrawal request submit ho gayi! UPI: ${upiId}`,
    );
    setWithdrawAmount("");
    setUpiId("");
  };

  const earningCards = [
    {
      label: "Kul Admin Kamaai",
      value: `₹${formatINR(totalAdminEarnings)}`,
      icon: "💰",
      gold: true,
    },
    {
      label: "Platform Fee (2% withdrawals)",
      value: `₹${formatINR(platformFeeEarned)}`,
      icon: "📊",
      gold: false,
    },
    {
      label: "Commission Share (2%)",
      value: `₹${formatINR(adminCommissionEarned)}`,
      icon: "🤝",
      gold: false,
    },
    {
      label: "Total Users",
      value: stats ? String(Number(stats.totalUsers)) : "0",
      icon: "👥",
      gold: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Earnings Overview */}
      <div className="grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <div key={i} className="animate-shimmer h-20 rounded-xl" />
            ))
          : earningCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl p-3"
                style={{
                  background: card.gold
                    ? "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.8), oklch(0.18 0.06 85 / 0.6))"
                    : "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.16 0.01 85))",
                  border: card.gold
                    ? "1px solid oklch(0.78 0.12 85 / 0.5)"
                    : "1px solid oklch(0.28 0.04 85 / 0.4)",
                  boxShadow: card.gold
                    ? "0 4px 16px oklch(0.78 0.12 85 / 0.15)"
                    : "none",
                }}
              >
                <div className="text-lg mb-1">{card.icon}</div>
                <p
                  className="text-base font-bold"
                  style={{
                    color: card.gold
                      ? "oklch(0.86 0.14 85)"
                      : "oklch(0.82 0.05 85)",
                  }}
                >
                  {card.value}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  {card.label}
                </p>
              </motion.div>
            ))}
      </div>

      {/* How Admin Earns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <p
          className="text-xs font-bold mb-3"
          style={{ color: "oklch(0.86 0.14 85)" }}
        >
          📈 Admin ki Kamaai kaise hoti hai?
        </p>
        <div className="space-y-2">
          {[
            {
              icon: "💸",
              title: "2% Platform Fee",
              desc: "Har user withdrawal par 2% admin ko milta hai",
            },
            {
              icon: "🤝",
              title: "2% Commission Share",
              desc: "Jab bhi admin kisi user ko commission credit karta hai, 2% admin pool mein jaata hai",
            },
            {
              icon: "📢",
              title: "Affiliate Earnings",
              desc: "Admin ke affiliate links se jo bhi sell hoga, directly affiliate account mein jaayega",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-2.5 p-2 rounded-lg"
              style={{ background: "oklch(0.10 0 0 / 0.6)" }}
            >
              <span className="text-base shrink-0">{icon}</span>
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

      {/* Admin Withdrawal Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl p-4 space-y-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.5), oklch(0.18 0.06 85 / 0.3))",
          border: "1px solid oklch(0.78 0.12 85 / 0.35)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={16} style={{ color: "oklch(0.86 0.14 85)" }} />
          <p
            className="text-sm font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            Admin Withdrawal
          </p>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "oklch(0.55 0.18 145 / 0.2)",
              color: "oklch(0.70 0.18 145)",
              border: "1px solid oklch(0.55 0.18 145 / 0.35)",
            }}
          >
            Available: ₹{formatINR(totalAdminEarnings)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Amount (Min ₹200)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            data-ocid="admin.earnings_withdraw_amount_input"
            className="h-9 rounded-lg text-xs col-span-2"
            style={{
              background: "oklch(0.10 0 0)",
              border: "1px solid oklch(0.28 0.04 85 / 0.5)",
              color: "oklch(0.96 0.015 85)",
            }}
          />
          <Input
            placeholder="UPI ID (e.g. name@paytm)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            data-ocid="admin.earnings_upi_input"
            className="h-9 rounded-lg text-xs col-span-2"
            style={{
              background: "oklch(0.10 0 0)",
              border: "1px solid oklch(0.28 0.04 85 / 0.5)",
              color: "oklch(0.96 0.015 85)",
            }}
          />
        </div>

        <Button
          onClick={handleAdminWithdraw}
          disabled={withdrawLoading}
          data-ocid="admin.earnings_withdraw_button"
          className="w-full h-10 text-sm rounded-xl font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
            color: "oklch(0.08 0 0)",
            border: "none",
          }}
        >
          {withdrawLoading ? (
            <>
              <Loader2 size={15} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowUpRight size={15} className="mr-2" />
              Apni Kamaai Withdraw Karo
            </>
          )}
        </Button>

        <p
          className="text-[10px] text-center"
          style={{ color: "oklch(0.42 0.01 85)" }}
        >
          Min ₹200 • 2% platform fee aapki earnings se already calculate hoti
          hai
        </p>
      </motion.div>

      {/* Pending User Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{
            background: "oklch(0.75 0.15 80 / 0.08)",
            border: "1px solid oklch(0.75 0.15 80 / 0.3)",
          }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "oklch(0.85 0.15 80)" }}
          >
            ⏳ {pendingWithdrawals.length} User Withdrawal Requests Pending
          </p>
          <p className="text-[10px]" style={{ color: "oklch(0.62 0.01 85)" }}>
            Transactions tab mein jaake approve ya reject karo
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { data: stats, isLoading } = useGetAdminStats();

  const statCards = stats
    ? [
        { label: "Total Users", value: Number(stats.totalUsers), icon: "👥" },
        { label: "Total Deals", value: Number(stats.totalDeals), icon: "🛍️" },
        {
          label: "Commission Paid",
          value: `₹${formatINR(stats.totalCommissionPaid)}`,
          icon: "💰",
        },
        {
          label: "Pending Withdrawals",
          value: Number(stats.totalPendingWithdrawals),
          icon: "⏳",
        },
        {
          label: "Approved Withdrawals",
          value: Number(stats.totalApprovedWithdrawals),
          icon: "✅",
        },
      ]
    : [];

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
            <div key={i} className="animate-shimmer h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl p-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.16 0.01 85))",
                border: "1px solid oklch(0.28 0.04 85 / 0.4)",
              }}
            >
              <div className="text-xl mb-1.5">{card.icon}</div>
              <p
                className="text-base font-bold"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                {card.value}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Affiliate Settings Tab ───────────────────────────────────────────────────
function AffiliateTab() {
  const { data: allSettings = [], isLoading } =
    useGetAllAdminAffiliateSettings();
  const saveSettings = useSaveAdminAffiliateSettings();

  // Admin's own payout account (UPI)
  const { data: affiliateAccount, isLoading: payoutLoading } =
    useGetAffiliateAccount();
  const savePayoutMutation = useSaveAffiliateAccount();

  const existing = allSettings[0];

  const [platformName, setPlatformName] = useState(
    existing?.platformName ?? "",
  );
  const [affiliateId, setAffiliateId] = useState(existing?.affiliateId ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(existing?.websiteUrl ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [contactEmail, setContactEmail] = useState(
    existing?.contactEmail ?? "",
  );
  const [saved, setSaved] = useState(false);

  // Admin payout account state
  const [adminUpiId, setAdminUpiId] = useState("");
  const [adminAccountHolder, setAdminAccountHolder] = useState("");
  const [adminBankAccount, setAdminBankAccount] = useState("");
  const [adminIfscCode, setAdminIfscCode] = useState("");
  const [payoutSaved, setPayoutSaved] = useState(false);

  // Pre-fill when data loads
  const [prefilled, setPrefilled] = useState(false);
  if (!prefilled && existing) {
    setPlatformName(existing.platformName);
    setAffiliateId(existing.affiliateId);
    setWebsiteUrl(existing.websiteUrl);
    setNotes(existing.notes);
    setContactEmail(existing.contactEmail ?? "");
    setPrefilled(true);
  }

  // Pre-fill payout account
  const [payoutPrefilled, setPayoutPrefilled] = useState(false);
  if (!payoutPrefilled && affiliateAccount) {
    setAdminUpiId(affiliateAccount.upiId ?? "");
    setAdminAccountHolder(affiliateAccount.accountHolderName ?? "");
    setAdminBankAccount(affiliateAccount.bankAccountNumber ?? "");
    setAdminIfscCode(affiliateAccount.ifscCode ?? "");
    setPayoutPrefilled(true);
  }

  const inputStyle = {
    background: "oklch(0.10 0 0)",
    border: "1px solid oklch(0.28 0.04 85 / 0.5)",
    color: "oklch(0.96 0.015 85)",
    fontSize: "14px",
  };

  const handleSave = async () => {
    if (!platformName || !affiliateId || !websiteUrl) {
      toast.error("Platform name, Affiliate ID aur Website URL zaroori hain");
      return;
    }
    try {
      await saveSettings.mutateAsync({
        id: existing?.id ?? BigInt(1),
        platformName,
        affiliateId,
        websiteUrl,
        notes,
        contactEmail: contactEmail || undefined,
      });
      setSaved(true);
      toast.success("Affiliate settings save ho gayi! ✅");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Save fail hua");
    }
  };

  const handleSavePayout = async () => {
    if (!adminUpiId.trim()) {
      toast.error("UPI ID daalna zaroori hai");
      return;
    }
    try {
      await savePayoutMutation.mutateAsync({
        upiId: adminUpiId.trim(),
        accountHolderName: adminAccountHolder.trim() || undefined,
        bankAccountNumber: adminBankAccount.trim() || undefined,
        ifscCode: adminIfscCode.trim() || undefined,
      });
      setPayoutSaved(true);
      toast.success("Admin payout account save ho gaya! ✅");
      setTimeout(() => setPayoutSaved(false), 3000);
    } catch {
      toast.error("Payout account save fail hua");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Admin Payout Account (TOP PRIORITY) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 space-y-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.7), oklch(0.18 0.06 85 / 0.5))",
          border: "1px solid oklch(0.78 0.12 85 / 0.5)",
          boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.12)",
        }}
      >
        <div className="flex items-center gap-2">
          <Wallet size={16} style={{ color: "oklch(0.86 0.14 85)" }} />
          <p
            className="text-sm font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            💳 Admin Ka Payout Account
          </p>
          {affiliateAccount?.upiId && (
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "oklch(0.55 0.18 145 / 0.2)",
                color: "oklch(0.70 0.18 145)",
                border: "1px solid oklch(0.55 0.18 145 / 0.35)",
              }}
            >
              ✅ Saved
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: "oklch(0.62 0.01 85)" }}>
          Yahan apna UPI ID ya bank account save karo jahan admin ki kamaai
          aayegi.
        </p>

        {payoutLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-shimmer h-9 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                UPI ID * (Jaise: admin@upi)
              </Label>
              <Input
                value={adminUpiId}
                onChange={(e) => setAdminUpiId(e.target.value)}
                data-ocid="admin.payout_upi_input"
                placeholder="yourname@paytm / @gpay / @upi"
                className="h-9 rounded-lg"
                style={inputStyle}
              />
            </div>
            <div>
              <Label
                className="text-xs mb-1 block"
                style={{ color: "oklch(0.62 0.01 85)" }}
              >
                Account Holder Name (Optional)
              </Label>
              <Input
                value={adminAccountHolder}
                onChange={(e) => setAdminAccountHolder(e.target.value)}
                data-ocid="admin.payout_holder_input"
                placeholder="Aapka poora naam"
                className="h-9 rounded-lg"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Bank Account (Optional)
                </Label>
                <Input
                  value={adminBankAccount}
                  onChange={(e) => setAdminBankAccount(e.target.value)}
                  data-ocid="admin.payout_bank_input"
                  placeholder="Account number"
                  className="h-9 rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  IFSC Code (Optional)
                </Label>
                <Input
                  value={adminIfscCode}
                  onChange={(e) =>
                    setAdminIfscCode(e.target.value.toUpperCase())
                  }
                  data-ocid="admin.payout_ifsc_input"
                  placeholder="SBIN0001234"
                  className="h-9 rounded-lg"
                  style={inputStyle}
                />
              </div>
            </div>

            <Button
              onClick={handleSavePayout}
              disabled={savePayoutMutation.isPending}
              data-ocid="admin.payout_save_button"
              className="w-full h-10 text-sm rounded-lg font-semibold"
              style={
                payoutSaved
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
              {savePayoutMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Save ho raha hai...
                </>
              ) : payoutSaved ? (
                "✅ Admin Payout Account Saved!"
              ) : (
                "Admin Payout Account Save Karo"
              )}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Admin Commission Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
          border: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <p
          className="text-sm font-bold mb-2"
          style={{ color: "oklch(0.86 0.14 85)" }}
        >
          💰 Admin Commission Pool
        </p>
        <div className="space-y-1.5">
          {[
            "Har withdrawal par 2% platform fee automatically admin pool mein jaati hai",
            "User ke affiliate account se jo bhi buy/sell hoga, uska 2% admin ko milega",
            "Ye commission admin ke kharch cover karne ke liye hai (hosting, marketing, etc.)",
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <span
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.78 0.12 85)" }}
              >
                •
              </span>
              <p className="text-xs" style={{ color: "oklch(0.62 0.01 85)" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings Form */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <p
          className="text-xs font-semibold mb-1"
          style={{ color: "oklch(0.86 0.14 85)" }}
        >
          🛒 Affiliate Platform Settings (Amazon/Flipkart)
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <div key={i} className="animate-shimmer h-9 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Platform Name * (Jaise: Amazon Associates)
                </Label>
                <Input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  data-ocid="admin.affiliate_platform_input"
                  placeholder="Amazon Associates"
                  className="h-9 rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Affiliate ID *
                </Label>
                <Input
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                  data-ocid="admin.affiliate_id_input"
                  placeholder="yourname-21"
                  className="h-9 rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Contact Email (Optional)
                </Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  data-ocid="admin.affiliate_email_input"
                  placeholder="admin@email.com"
                  className="h-9 rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div className="col-span-2">
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Website URL *
                </Label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  data-ocid="admin.affiliate_website_input"
                  placeholder="https://affiliate.amazon.in"
                  className="h-9 rounded-lg"
                  style={inputStyle}
                />
              </div>
              <div className="col-span-2">
                <Label
                  className="text-xs mb-1 block"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Notes
                </Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-ocid="admin.affiliate_notes_textarea"
                  placeholder="Koi aur info yahan likhein..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saveSettings.isPending}
              data-ocid="admin.affiliate_save_button"
              className="w-full h-9 text-xs rounded-lg"
              style={
                saved
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
                    }
              }
            >
              {saveSettings.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              {saved ? "✅ Saved!" : "Settings Save Karo"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── KYC Tab ─────────────────────────────────────────────────────────────────
function KycTab() {
  const { data: kycList = [], isLoading } = useGetAllKyc();
  const approveKyc = useApproveKyc();
  const rejectKyc = useRejectKyc();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const total = kycList.length;
  const pending = kycList.filter((k) => {
    const s = k.status as unknown as string;
    return s === KycStatus.pending || s === "pending";
  }).length;
  const approved = kycList.filter((k) => {
    const s = k.status as unknown as string;
    return s === KycStatus.approved || s === "approved";
  }).length;
  const rejected = kycList.filter((k) => {
    const s = k.status as unknown as string;
    return s === KycStatus.rejected || s === "rejected";
  }).length;

  const maskDocNumber = (doc: string) =>
    doc.length > 4 ? `****${doc.slice(-4)}` : doc;

  const formatDate = (ts: bigint) => {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: unknown) => {
    const s = status as string;
    if (s === "approved")
      return {
        bg: "oklch(0.70 0.18 140 / 0.15)",
        border: "oklch(0.70 0.18 140 / 0.4)",
        color: "oklch(0.75 0.18 140)",
      };
    if (s === "rejected")
      return {
        bg: "oklch(0.62 0.22 25 / 0.15)",
        border: "oklch(0.62 0.22 25 / 0.4)",
        color: "oklch(0.68 0.22 25)",
      };
    return {
      bg: "oklch(0.75 0.15 80 / 0.15)",
      border: "oklch(0.75 0.15 80 / 0.4)",
      color: "oklch(0.85 0.15 80)",
    };
  };

  const handleApprove = async (kyc: KycRecord) => {
    try {
      await approveKyc.mutateAsync(kyc.userId);
      toast.success("KYC Approved!");
    } catch {
      toast.error("Approve fail hua");
    }
  };

  const handleReject = async (kyc: KycRecord) => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason daalo");
      return;
    }
    try {
      await rejectKyc.mutateAsync({
        userId: kyc.userId,
        reason: rejectReason.trim(),
      });
      toast.success("KYC Rejected");
      setRejectingId(null);
      setRejectReason("");
    } catch {
      toast.error("Reject fail hua");
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: total, color: "oklch(0.82 0.05 85)" },
          { label: "Pending", value: pending, color: "oklch(0.85 0.15 80)" },
          { label: "Approved", value: approved, color: "oklch(0.75 0.18 140)" },
          { label: "Rejected", value: rejected, color: "oklch(0.68 0.22 25)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.22 0.01 85)",
            }}
          >
            <p className="text-lg font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[10px]" style={{ color: "oklch(0.45 0.01 85)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* KYC List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <div key={i} className="animate-shimmer h-20 rounded-xl" />
          ))}
        </div>
      ) : kycList.length === 0 ? (
        <div
          data-ocid="admin.kyc_empty_state"
          className="rounded-xl p-6 text-center"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.22 0.01 85)",
          }}
        >
          <p className="text-sm" style={{ color: "oklch(0.45 0.01 85)" }}>
            Abhi koi KYC submission nahi hai
          </p>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-xl"
          data-ocid="admin.kyc_table"
          style={{ border: "1px solid oklch(0.22 0.01 85)" }}
        >
          <table className="w-full text-xs">
            <thead>
              <tr
                style={{
                  background: "oklch(0.14 0.005 85)",
                  borderBottom: "1px solid oklch(0.22 0.01 85)",
                }}
              >
                {["User", "Type", "Number", "Status", "Date", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold"
                      style={{ color: "oklch(0.62 0.01 85)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {kycList.map((kyc: KycRecord, idx) => {
                const kycId = `${kyc.userId.toString()}_${idx}`;
                const statusStyle = getStatusStyle(kyc.status);
                const statusStr = kyc.status as unknown as string;
                const isPending =
                  statusStr === KycStatus.pending || statusStr === "pending";

                return (
                  <>
                    <tr
                      key={kycId}
                      style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}
                    >
                      <td
                        className="px-3 py-2.5 font-mono"
                        style={{ color: "oklch(0.62 0.01 85)" }}
                      >
                        {kyc.userId.toString().slice(0, 10)}...
                      </td>
                      <td
                        className="px-3 py-2.5"
                        style={{ color: "oklch(0.82 0.05 85)" }}
                      >
                        {kyc.docType === KycDocType.aadhaar ? "Aadhaar" : "PAN"}
                      </td>
                      <td
                        className="px-3 py-2.5 font-mono"
                        style={{ color: "oklch(0.62 0.01 85)" }}
                      >
                        {maskDocNumber(kyc.docNumber)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background: statusStyle.bg,
                            border: `1px solid ${statusStyle.border}`,
                            color: statusStyle.color,
                          }}
                        >
                          {statusStr}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5"
                        style={{ color: "oklch(0.52 0.01 85)" }}
                      >
                        {formatDate(kyc.submittedAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        {isPending && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(kyc)}
                              disabled={approveKyc.isPending}
                              data-ocid={`admin.kyc_approve_button.${idx + 1}`}
                              className="p-1.5 rounded-lg"
                              style={{
                                background: "oklch(0.70 0.18 140 / 0.15)",
                                border: "1px solid oklch(0.70 0.18 140 / 0.3)",
                              }}
                              title="Approve"
                            >
                              <Check
                                size={11}
                                style={{ color: "oklch(0.75 0.18 140)" }}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(kycId);
                                setRejectReason("");
                              }}
                              data-ocid={`admin.kyc_reject_button.${idx + 1}`}
                              className="p-1.5 rounded-lg"
                              style={{
                                background: "oklch(0.62 0.22 25 / 0.15)",
                                border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                              }}
                              title="Reject"
                            >
                              <X
                                size={11}
                                style={{ color: "oklch(0.68 0.22 25)" }}
                              />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Inline rejection reason input */}
                    {rejectingId === kycId && (
                      <tr
                        key={`${kycId}_reject`}
                        style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}
                      >
                        <td
                          colSpan={6}
                          className="px-3 py-2"
                          style={{ background: "oklch(0.10 0 0 / 0.5)" }}
                        >
                          <div className="flex gap-2 items-center">
                            <Input
                              placeholder="Rejection reason daalo..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              data-ocid="admin.kyc_reject_reason_input"
                              className="h-8 rounded-lg text-xs flex-1"
                              style={{
                                background: "oklch(0.10 0 0)",
                                border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                                color: "oklch(0.96 0.015 85)",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleReject(kyc)}
                              disabled={rejectKyc.isPending}
                              data-ocid="admin.kyc_reject_confirm_button"
                              className="px-3 h-8 rounded-lg text-[10px] font-bold shrink-0"
                              style={{
                                background: "oklch(0.62 0.22 25)",
                                color: "oklch(0.96 0.01 25)",
                              }}
                            >
                              {rejectKyc.isPending ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                "Reject"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingId(null)}
                              data-ocid="admin.kyc_reject_cancel_button"
                              className="px-3 h-8 rounded-lg text-[10px] shrink-0"
                              style={{
                                background: "oklch(0.16 0 0)",
                                border: "1px solid oklch(0.22 0.01 85)",
                                color: "oklch(0.62 0.01 85)",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: user, isLoading: userLoading } = useGetUser();

  // Rely solely on user.isAdmin — isCallerAdmin() can fail for unregistered users
  const isAdminUser = user?.isAdmin === true;
  const adminLoading = userLoading;

  if (!identity) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 gap-4"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.14 0.01 85)",
              border: "1px solid oklch(0.28 0.04 85 / 0.5)",
              color: "oklch(0.96 0.015 85)",
            },
          }}
        />
        <ShieldCheck size={40} style={{ color: "oklch(0.62 0.22 25)" }} />
        <h2 className="text-xl font-bold text-foreground">Login Required</h2>
        <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
          Admin panel access ke liye login karo
        </p>
        <a
          href="/login"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
            color: "oklch(0.08 0 0)",
          }}
        >
          Login Page
        </a>
      </div>
    );
  }

  // Show loading spinner WHILE checks are in progress — never show "Access Denied" prematurely
  if (adminLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "oklch(0.78 0.12 85)" }}
        />
        <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
          Admin access check ho raha hai...
        </p>
      </div>
    );
  }

  if (!isAdminUser) {
    // If user is null — not yet registered
    const isNotRegistered = user === null || user === undefined;
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 gap-4"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.14 0.01 85)",
              border: "1px solid oklch(0.28 0.04 85 / 0.5)",
              color: "oklch(0.96 0.015 85)",
            },
          }}
        />
        <ShieldCheck size={40} style={{ color: "oklch(0.62 0.22 25)" }} />
        <h2 className="text-xl font-bold text-foreground">
          {isNotRegistered ? "Registration Zaroori Hai" : "Access Denied"}
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
          {isNotRegistered
            ? "Pehle registration complete karo — phir admin panel access milega"
            : "Aapko admin access nahi hai"}
        </p>
        <a
          href={isNotRegistered ? "/login" : "/"}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{
            background: isNotRegistered
              ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))"
              : "oklch(0.14 0 0)",
            border: isNotRegistered ? "none" : "1px solid oklch(0.22 0.01 85)",
            color: isNotRegistered ? "oklch(0.08 0 0)" : "oklch(0.62 0.01 85)",
          }}
        >
          <ArrowLeft size={14} />
          {isNotRegistered ? "Register / Login Karo" : "Home pe jao"}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.07 0 0)" }}>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.01 85)",
            border: "1px solid oklch(0.28 0.04 85 / 0.5)",
            color: "oklch(0.96 0.015 85)",
          },
        }}
      />

      {/* Header */}
      <header
        className="px-4 py-4 sticky top-0 z-40"
        style={{
          background: "oklch(0.08 0 0)",
          borderBottom: "1px solid oklch(0.28 0.04 85 / 0.3)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-1.5 rounded-lg"
              style={{
                background: "oklch(0.14 0 0)",
                border: "1px solid oklch(0.22 0.01 85)",
              }}
            >
              <ArrowLeft size={16} style={{ color: "oklch(0.62 0.01 85)" }} />
            </a>
            <div>
              <h1 className="text-base font-bold gold-text-gradient">
                Admin Dashboard
              </h1>
              <p
                className="text-[10px]"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                Dark Daulat AI
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
            style={{
              background: "oklch(0.78 0.12 85 / 0.1)",
              border: "1px solid oklch(0.78 0.12 85 / 0.3)",
              color: "oklch(0.86 0.14 85)",
            }}
          >
            <Settings size={11} />
            Admin
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="earnings">
          <TabsList
            className="w-full h-10 grid grid-cols-7 rounded-xl mb-4"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.22 0.01 85)",
            }}
          >
            {[
              { value: "earnings", icon: TrendingUp, label: "Earn" },
              { value: "deals", icon: Tag, label: "Deals" },
              { value: "users", icon: Users, label: "Users" },
              { value: "transactions", icon: Receipt, label: "TXNs" },
              { value: "kyc", icon: ShieldCheck, label: "KYC" },
              { value: "analytics", icon: BarChart3, label: "Stats" },
              { value: "affiliate", icon: Link2, label: "Affl." },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                data-ocid={`admin.${value}_tab`}
                className="rounded-lg text-[10px] flex items-center gap-0.5 data-[state=active]:text-foreground px-0.5"
                style={{
                  color: "oklch(0.52 0.01 85)",
                }}
              >
                <Icon size={11} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="earnings">
            <AdminEarningsTab />
          </TabsContent>
          <TabsContent value="deals">
            <DealsTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>
          <TabsContent value="kyc">
            <KycTab />
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
          <TabsContent value="affiliate">
            <AffiliateTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
