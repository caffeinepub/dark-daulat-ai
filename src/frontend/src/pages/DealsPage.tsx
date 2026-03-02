import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  Loader2,
  MapPin,
  Search,
  Share2,
  ShoppingCart,
  Tag,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Deal } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetActiveDeals, useTrackShare } from "../hooks/useQueries";

const SAMPLE_DEALS: Deal[] = [
  {
    id: BigInt(1001),
    title: "boAt Airdopes 141 TWS Earbuds",
    imageUrl: "https://m.media-amazon.com/images/I/61VJvAAQXBL._SX679_.jpg",
    price: BigInt(1299),
    affiliateLink: "https://amzn.to/boatairdopes",
    commissionPercent: BigInt(8),
    trendingTag: "🔥 Hot",
    targetRegion: "Pan India",
    description:
      "True Wireless earbuds, 42hr playtime, IPX4 water resistant. Best seller in earphones.",
    isActive: true,
    shareCount: BigInt(245),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1002),
    title: "Philips HL7756 Mixer Grinder 750W",
    imageUrl: "https://m.media-amazon.com/images/I/71v5GmtAWUL._SX679_.jpg",
    price: BigInt(2495),
    affiliateLink: "https://amzn.to/philipsmixer",
    commissionPercent: BigInt(10),
    trendingTag: "Kitchen",
    targetRegion: "Tier 2 Cities",
    description:
      "750W motor, 3 jars, stainless steel blades. Best selling kitchen appliance for Indian homes.",
    isActive: true,
    shareCount: BigInt(180),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1003),
    title: "Redmi 13C 5G (4GB+128GB)",
    imageUrl: "https://m.media-amazon.com/images/I/71w2bD4JEAL._SX679_.jpg",
    price: BigInt(10999),
    affiliateLink: "https://amzn.to/redmi13c",
    commissionPercent: BigInt(5),
    trendingTag: "📱 Trending",
    targetRegion: "Pan India",
    description:
      "5G smartphone with 50MP camera, 5000mAh battery. Best budget 5G phone under ₹12000.",
    isActive: true,
    shareCount: BigInt(412),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1004),
    title: "Prestige Iris 750W Mixer Grinder",
    imageUrl: "https://m.media-amazon.com/images/I/61WTTt+1iqL._SX679_.jpg",
    price: BigInt(1899),
    affiliateLink: "https://amzn.to/prestigemixer",
    commissionPercent: BigInt(12),
    trendingTag: "Kitchen",
    targetRegion: "North India",
    description:
      "3 speed control, 2 stainless steel jars, overload protection. Perfect for Indian kitchen.",
    isActive: true,
    shareCount: BigInt(156),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1005),
    title: "Campus Women Casual Shoes",
    imageUrl: "https://m.media-amazon.com/images/I/71gHVxgZ3XL._UY695_.jpg",
    price: BigInt(699),
    affiliateLink: "https://amzn.to/campusshoes",
    commissionPercent: BigInt(15),
    trendingTag: "👟 Fashion",
    targetRegion: "Mumbai, Delhi",
    description:
      "Lightweight EVA sole, breathable mesh upper. Trending fashion footwear for women.",
    isActive: true,
    shareCount: BigInt(89),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1006),
    title: "Butterfly Smart Electric Kettle 1.5L",
    imageUrl: "https://m.media-amazon.com/images/I/61hjN1QZWVL._SX679_.jpg",
    price: BigInt(799),
    affiliateLink: "https://amzn.to/butterflykettle",
    commissionPercent: BigInt(18),
    trendingTag: "⚡ 22% Margin",
    targetRegion: "Muzaffarpur, Bihar",
    description:
      "1500W rapid boiling, auto shut-off, food grade SS. Best selling kettle in Tier 2 cities.",
    isActive: true,
    shareCount: BigInt(203),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1007),
    title: "Fire-Boltt Ninja Call Pro Plus",
    imageUrl: "https://m.media-amazon.com/images/I/61v+2AhkdKL._SX679_.jpg",
    price: BigInt(1799),
    affiliateLink: "https://amzn.to/firebolttwatch",
    commissionPercent: BigInt(10),
    trendingTag: "⌚ SmartWatch",
    targetRegion: "Pan India",
    description:
      "Bluetooth calling smartwatch with SpO2, heart rate monitor, 120 sports modes.",
    isActive: true,
    shareCount: BigInt(328),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1008),
    title: "Wakefit Orthopedic Memory Foam Pillow",
    imageUrl: "https://m.media-amazon.com/images/I/71b0p+BSIEL._SX679_.jpg",
    price: BigInt(999),
    affiliateLink: "https://amzn.to/wakefitpillow",
    commissionPercent: BigInt(14),
    trendingTag: "🏠 Home",
    targetRegion: "Bangalore, Pune",
    description:
      "Cervical support, anti-microbial fabric, washable cover. Best for neck pain relief.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
];

const FILTERS = [
  "All",
  "Trending",
  "Electronics",
  "Fashion",
  "Kitchen",
] as const;
type Filter = (typeof FILTERS)[number];

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const trackShare = useTrackShare();

  const handleShare = async () => {
    try {
      await trackShare.mutateAsync(deal.id);
    } catch {
      // Continue even if tracking fails
    }
    const commissionAmt = Math.floor(
      (Number(deal.price) * Number(deal.commissionPercent)) / 100,
    );
    const message = `🔥 *${deal.title}* sirf ₹${formatINR(deal.price)} mein! Mujhe ₹${commissionAmt} commission milega. Abhi kharido: ${deal.affiliateLink} — Dark Daulat AI ke through`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBuy = () => {
    if (deal.affiliateLink && deal.affiliateLink.trim() !== "") {
      window.open(deal.affiliateLink, "_blank");
    } else {
      window.open("https://www.amazon.in", "_blank");
    }
  };

  const commissionAmount = Math.floor(
    (Number(deal.price) * Number(deal.commissionPercent)) / 100,
  );
  const hasImage = deal.imageUrl && deal.imageUrl.trim() !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`deals.item.${index + 1}`}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.14 0.008 85), oklch(0.12 0.003 85))",
        border: "1px solid oklch(0.28 0.04 85 / 0.4)",
        boxShadow: "0 4px 20px oklch(0 0 0 / 0.4)",
      }}
    >
      {/* Image */}
      <div
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
        style={{
          background: hasImage
            ? "oklch(0.10 0 0)"
            : "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
        }}
      >
        {hasImage ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-4xl">🛍️</span>
        )}

        {/* Commission badge */}
        <div
          className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
            color: "oklch(0.08 0 0)",
            boxShadow: "0 2px 8px oklch(0.78 0.12 85 / 0.4)",
          }}
        >
          {Number(deal.commissionPercent)}%
        </div>

        {/* Trending tag */}
        {deal.trendingTag && (
          <div
            className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5"
            style={{
              background: "oklch(0.62 0.22 25 / 0.9)",
              color: "oklch(0.96 0 0)",
            }}
          >
            <TrendingUp size={10} />
            {deal.trendingTag}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3
          className="text-base font-bold leading-tight line-clamp-2"
          style={{ color: "oklch(0.92 0.015 85)" }}
        >
          {deal.title}
        </h3>

        <div className="flex items-center justify-between">
          <span
            className="text-lg font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            ₹{formatINR(deal.price)}
          </span>
          {deal.targetRegion && (
            <div className="flex items-center gap-1">
              <MapPin size={10} style={{ color: "oklch(0.52 0.01 85)" }} />
              <span
                className="text-[10px]"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                {deal.targetRegion}
              </span>
            </div>
          )}
        </div>

        {/* Commission amount */}
        <div
          className="rounded-lg px-2 py-1 flex items-center gap-1.5"
          style={{
            background: "oklch(0.55 0.18 145 / 0.12)",
            border: "1px solid oklch(0.55 0.18 145 / 0.25)",
          }}
        >
          <span
            className="text-xs font-semibold"
            style={{ color: "oklch(0.70 0.18 145)" }}
          >
            ₹{formatINR(commissionAmount)} Commission
          </span>
        </div>

        {deal.description && (
          <p
            className="text-[11px] leading-relaxed line-clamp-2"
            style={{ color: "oklch(0.52 0.01 85)" }}
          >
            {deal.description}
          </p>
        )}

        {/* Buttons row */}
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={handleBuy}
            data-ocid={`deals.buy_button.${index + 1}`}
            className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.18 160), oklch(0.58 0.20 155))",
              color: "oklch(0.96 0.01 145)",
              boxShadow: "0 2px 10px oklch(0.55 0.18 145 / 0.3)",
            }}
          >
            <ShoppingCart size={12} />
            Buy Karo
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={trackShare.isPending}
            data-ocid={`deals.share_button.${index + 1}`}
            className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
              color: "oklch(0.08 0 0)",
              boxShadow: "0 2px 10px oklch(0.78 0.12 85 / 0.3)",
            }}
          >
            {trackShare.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Share2 size={12} />
            )}
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function DealsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: dealsFromBackend = [], isLoading } = useGetActiveDeals();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!identity) {
      navigate({ to: "/login" });
    }
  }, [identity, navigate]);

  // Use sample deals when backend has no deals yet
  const isSampleMode = !isLoading && dealsFromBackend.length === 0;
  const deals = isSampleMode ? SAMPLE_DEALS : dealsFromBackend;

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        !search ||
        deal.title.toLowerCase().includes(search.toLowerCase()) ||
        deal.description.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Trending" && !!deal.trendingTag) ||
        deal.trendingTag.toLowerCase().includes(activeFilter.toLowerCase()) ||
        deal.targetRegion.toLowerCase().includes(activeFilter.toLowerCase()) ||
        deal.title.toLowerCase().includes(activeFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [deals, search, activeFilter]);

  return (
    <div className="min-h-screen">
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
        <div className="flex items-center gap-2 mb-3">
          <Tag size={24} style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            AI Deals
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "oklch(0.52 0.01 85)" }}
          />
          <Input
            placeholder="Best phone under ₹15000 dhundho..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="deals.search_input"
            className="pl-9 h-10 rounded-xl text-sm"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.28 0.04 85 / 0.5)",
              color: "oklch(0.96 0.015 85)",
            }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 mt-3 no-scrollbar">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background:
                  activeFilter === filter
                    ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))"
                    : "oklch(0.14 0.01 85)",
                color:
                  activeFilter === filter
                    ? "oklch(0.08 0 0)"
                    : "oklch(0.62 0.01 85)",
                border:
                  activeFilter === filter
                    ? "1px solid oklch(0.78 0.12 85 / 0.5)"
                    : "1px solid oklch(0.22 0.01 85)",
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                key={i}
                className="rounded-2xl overflow-hidden animate-shimmer"
                style={{ height: "280px" }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Sample mode banner */}
            {isSampleMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2"
                style={{
                  background: "oklch(0.14 0.03 85 / 0.6)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.25)",
                }}
              >
                <span className="text-sm">📦</span>
                <p className="text-xs" style={{ color: "oklch(0.72 0.10 85)" }}>
                  Sample Deals — Admin ne abhi real deals add nahi ki. Ye
                  example products hain.
                </p>
              </motion.div>
            )}

            {filteredDeals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="deals.empty_state"
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.14 0.03 85)",
                    border: "1px solid oklch(0.78 0.12 85 / 0.3)",
                  }}
                >
                  <Tag size={28} style={{ color: "oklch(0.78 0.12 85)" }} />
                </div>
                <p
                  className="text-base font-semibold"
                  style={{ color: "oklch(0.62 0.01 85)" }}
                >
                  Koi deal nahi mili
                </p>
                <p className="text-sm" style={{ color: "oklch(0.45 0.01 85)" }}>
                  Dusra search try karo
                </p>
              </motion.div>
            ) : (
              <>
                <p
                  className="text-xs mb-3"
                  style={{ color: "oklch(0.52 0.01 85)" }}
                >
                  {filteredDeals.length} deal
                  {filteredDeals.length !== 1 ? "s" : ""} mili
                </p>
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredDeals.map((deal, i) => (
                      <DealCard key={Number(deal.id)} deal={deal} index={i} />
                    ))}
                  </div>
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
