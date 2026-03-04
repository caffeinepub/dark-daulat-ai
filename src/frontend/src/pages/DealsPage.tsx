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

// Platform detection helper
function getPlatform(deal: Deal): { name: string; color: string; bg: string } {
  const link = deal.affiliateLink.toLowerCase();
  const tag = deal.trendingTag.toLowerCase();
  if (
    link.includes("flipkart") ||
    link.includes("fkrt") ||
    tag.includes("flipkart")
  )
    return {
      name: "Flipkart",
      color: "oklch(0.95 0.01 250)",
      bg: "oklch(0.45 0.22 250)",
    };
  if (
    link.includes("alibaba") ||
    link.includes("aliexpress") ||
    link.includes("s.click.ali") ||
    tag.includes("alibaba") ||
    tag.includes("aliexpress")
  )
    return {
      name: "AliExpress",
      color: "oklch(0.95 0.01 25)",
      bg: "oklch(0.55 0.24 25)",
    };
  if (link.includes("fiverr") || tag.includes("fiverr") || tag.includes("gig"))
    return {
      name: "Fiverr",
      color: "oklch(0.95 0.02 145)",
      bg: "oklch(0.45 0.22 145)",
    };
  // Default: Amazon (amazon.in or amzn.to)
  return {
    name: "Amazon",
    color: "oklch(0.10 0 0)",
    bg: "oklch(0.72 0.18 65)",
  };
}

// 90+ sample Indian affiliate products across Amazon, Flipkart, AliExpress, Fiverr
const SAMPLE_DEALS: Deal[] = [
  // ── AMAZON products ──────────────────────────────────────────────────────
  {
    id: BigInt(1001),
    title: "boAt Airdopes 141 TWS Earbuds",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://www.amazon.in/s?k=boAt+Airdopes+141+TWS",
    commissionPercent: BigInt(8),
    trendingTag: "🔥 Hot",
    targetRegion: "Pan India",
    description: "True Wireless, 42hr playtime, IPX4 water resistant.",
    isActive: true,
    shareCount: BigInt(245),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1002),
    title: "Sony WH-1000XM4 Headphones",
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop",
    price: BigInt(19990),
    affiliateLink: "https://www.amazon.in/s?k=Sony+WH-1000XM4",
    commissionPercent: BigInt(6),
    trendingTag: "⭐ Premium",
    targetRegion: "Metro Cities",
    description: "Industry-leading noise cancelling, 30hr battery, LDAC.",
    isActive: true,
    shareCount: BigInt(182),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1003),
    title: "Noise ColorFit Ultra 3 Smartwatch",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    price: BigInt(2499),
    affiliateLink:
      "https://www.amazon.in/s?k=Noise+ColorFit+Ultra+3+Smartwatch",
    commissionPercent: BigInt(12),
    trendingTag: "⌚ Trending",
    targetRegion: "Pan India",
    description: "1.96 AMOLED, Bluetooth calling, SpO2, 100+ sports modes.",
    isActive: true,
    shareCount: BigInt(310),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1004),
    title: "Redmi 13C 5G (4GB+128GB)",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    price: BigInt(10999),
    affiliateLink: "https://www.amazon.in/s?k=Redmi+13C+5G",
    commissionPercent: BigInt(5),
    trendingTag: "📱 5G",
    targetRegion: "Pan India",
    description: "50MP camera, 5000mAh battery. Best budget 5G phone.",
    isActive: true,
    shareCount: BigInt(412),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1005),
    title: "Samsung Galaxy F15 5G (8GB+128GB)",
    imageUrl:
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop",
    price: BigInt(14999),
    affiliateLink: "https://www.amazon.in/s?k=Samsung+Galaxy+F15+5G",
    commissionPercent: BigInt(5),
    trendingTag: "📱 Samsung",
    targetRegion: "Pan India",
    description: "6.5 Super AMOLED, 6000mAh, 25W fast charge.",
    isActive: true,
    shareCount: BigInt(289),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1006),
    title: "Poco X6 5G (8GB+256GB)",
    imageUrl:
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=400&fit=crop",
    price: BigInt(19999),
    affiliateLink: "https://www.amazon.in/s?k=Poco+X6+5G",
    commissionPercent: BigInt(5),
    trendingTag: "🔥 Best Value",
    targetRegion: "Pan India",
    description: "120Hz AMOLED, Snapdragon 7s Gen 2, 67W turbo charge.",
    isActive: true,
    shareCount: BigInt(356),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1007),
    title: "Philips HL7756 Mixer Grinder 750W",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    price: BigInt(2495),
    affiliateLink: "https://www.amazon.in/s?k=Philips+HL7756+Mixer+Grinder",
    commissionPercent: BigInt(10),
    trendingTag: "🍳 Kitchen",
    targetRegion: "Tier 2 Cities",
    description: "750W motor, 3 jars, stainless steel blades.",
    isActive: true,
    shareCount: BigInt(180),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1008),
    title: "Butterfly Smart Electric Kettle 1.5L",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://www.amazon.in/s?k=Butterfly+Electric+Kettle+1.5L",
    commissionPercent: BigInt(18),
    trendingTag: "⚡ 22% Margin",
    targetRegion: "Muzaffarpur, Bihar",
    description: "1500W rapid boiling, auto shut-off, food grade SS.",
    isActive: true,
    shareCount: BigInt(203),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1009),
    title: "Boldfit Resistance Bands Set (5 Bands)",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    price: BigInt(499),
    affiliateLink: "https://www.amazon.in/s?k=Boldfit+Resistance+Bands",
    commissionPercent: BigInt(22),
    trendingTag: "💪 Fitness",
    targetRegion: "Pan India",
    description: "5 resistance levels, carry bag included, anti-snap latex.",
    isActive: true,
    shareCount: BigInt(334),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1010),
    title: "Rich Dad Poor Dad - Robert Kiyosaki",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    price: BigInt(299),
    affiliateLink:
      "https://www.amazon.in/s?k=Rich+Dad+Poor+Dad+Robert+Kiyosaki",
    commissionPercent: BigInt(10),
    trendingTag: "📚 Bestseller",
    targetRegion: "Students, Professionals",
    description: "Financial literacy classic. #1 personal finance book.",
    isActive: true,
    shareCount: BigInt(421),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1011),
    title: "Ambrane 20000mAh Power Bank (20W)",
    imageUrl:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://www.amazon.in/s?k=Ambrane+20000mAh+Power+Bank",
    commissionPercent: BigInt(14),
    trendingTag: "⚡ Must Have",
    targetRegion: "Travellers",
    description: "20W PD, dual output, LED indicator, 1 year warranty.",
    isActive: true,
    shareCount: BigInt(445),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1012),
    title: "Redgear A-15 RGB Gaming Mouse",
    imageUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://www.amazon.in/s?k=Redgear+A-15+Gaming+Mouse",
    commissionPercent: BigInt(18),
    trendingTag: "🎮 Gaming",
    targetRegion: "Gamers",
    description: "7200 DPI, 7 RGB zones, 1000Hz polling rate.",
    isActive: true,
    shareCount: BigInt(389),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1013),
    title: "Mamaearth Ubtan Face Wash 100ml",
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    price: BigInt(249),
    affiliateLink: "https://www.amazon.in/s?k=Mamaearth+Ubtan+Face+Wash",
    commissionPercent: BigInt(18),
    trendingTag: "🌿 Natural",
    targetRegion: "Pan India",
    description: "Turmeric + Saffron, skin brightening, natural formula.",
    isActive: true,
    shareCount: BigInt(298),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1014),
    title: "Wildcraft Laptop Backpack 30L",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    price: BigInt(1799),
    affiliateLink: "https://www.amazon.in/s?k=Wildcraft+Laptop+Backpack",
    commissionPercent: BigInt(16),
    trendingTag: "🎒 College",
    targetRegion: "Students",
    description: "Water resistant, padded laptop sleeve, USB charging port.",
    isActive: true,
    shareCount: BigInt(198),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1015),
    title: "Wipro 9W LED Smart Bulb (Pack of 2)",
    imageUrl:
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://www.amazon.in/s?k=Wipro+9W+LED+Smart+Bulb",
    commissionPercent: BigInt(20),
    trendingTag: "💡 Smart Home",
    targetRegion: "Urban Homes",
    description: "16 million colours, Alexa & Google Home compatible.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1016),
    title: "Neuherbs True Whey Protein 1kg",
    imageUrl:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop",
    price: BigInt(1499),
    affiliateLink: "https://www.amazon.in/s?k=Neuherbs+True+Whey+Protein",
    commissionPercent: BigInt(18),
    trendingTag: "💪 Protein",
    targetRegion: "Gym Users",
    description: "24g protein per scoop, low sugar, lab tested, FSSAI.",
    isActive: true,
    shareCount: BigInt(456),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1017),
    title: "American Tourister Trolley Bag 55cm",
    imageUrl:
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=400&fit=crop",
    price: BigInt(3999),
    affiliateLink: "https://www.amazon.in/s?k=American+Tourister+Trolley+Bag",
    commissionPercent: BigInt(12),
    trendingTag: "✈️ Travel",
    targetRegion: "Frequent Flyers",
    description: "4-wheel spinner, TSA lock, expandable, lightweight.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1018),
    title: "Cosmic Byte GS430 Gaming Headset",
    imageUrl:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://www.amazon.in/s?k=Cosmic+Byte+GS430+Gaming+Headset",
    commissionPercent: BigInt(16),
    trendingTag: "🎮 Gaming",
    targetRegion: "PC, Console Gamers",
    description: "7.1 surround, retractable mic, LED lighting.",
    isActive: true,
    shareCount: BigInt(312),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1019),
    title: "Pigeon Healthifry Digital Air Fryer 4.2L",
    imageUrl:
      "https://images.unsplash.com/photo-1648146894073-0c9b0d52a3b4?w=400&h=400&fit=crop",
    price: BigInt(3499),
    affiliateLink: "https://www.amazon.in/s?k=Pigeon+Healthifry+Air+Fryer",
    commissionPercent: BigInt(14),
    trendingTag: "🥗 Healthy",
    targetRegion: "Metro Cities",
    description: "360° air circulation, 8 preset menus, non-stick basket.",
    isActive: true,
    shareCount: BigInt(267),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1020),
    title: "GoPro HERO11 Black Action Camera",
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    price: BigInt(34990),
    affiliateLink: "https://www.amazon.in/s?k=GoPro+HERO11+Black",
    commissionPercent: BigInt(5),
    trendingTag: "📸 Adventure",
    targetRegion: "Travellers, Vloggers",
    description: "5.3K60, 27MP, HyperSmooth 5.0, waterproof to 10m.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },

  // ── FLIPKART products ──────────────────────────────────────────────────────
  {
    id: BigInt(2001),
    title: "Realme Narzo 70 Pro 5G",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    price: BigInt(18999),
    affiliateLink: "https://www.flipkart.com/search?q=Realme+Narzo+70+Pro+5G",
    commissionPercent: BigInt(6),
    trendingTag: "📱 Flipkart Exclusive",
    targetRegion: "Pan India",
    description: "5G, 50MP OIS camera, MediaTek Dimensity 7050.",
    isActive: true,
    shareCount: BigInt(312),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2002),
    title: "OnePlus Nord CE 4 Lite 5G",
    imageUrl:
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop",
    price: BigInt(17499),
    affiliateLink:
      "https://www.flipkart.com/search?q=OnePlus+Nord+CE+4+Lite+5G",
    commissionPercent: BigInt(5),
    trendingTag: "📱 Flipkart 5G",
    targetRegion: "Pan India",
    description: "5G, 50MP camera, 5500mAh battery, 80W charging.",
    isActive: true,
    shareCount: BigInt(278),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2003),
    title: "Boat Rockerz 450 Bluetooth Headphones",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    price: BigInt(899),
    affiliateLink: "https://www.flipkart.com/search?q=Boat+Rockerz+450",
    commissionPercent: BigInt(10),
    trendingTag: "🎧 Flipkart Deal",
    targetRegion: "Youth",
    description: "15hr playtime, 40mm drivers, padded earcups.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2004),
    title: "Redmi Note 13 5G (Flipkart)",
    imageUrl:
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=400&fit=crop",
    price: BigInt(16999),
    affiliateLink: "https://www.flipkart.com/search?q=Redmi+Note+13+5G",
    commissionPercent: BigInt(5),
    trendingTag: "📱 Flipkart Sale",
    targetRegion: "Pan India",
    description: "5G, 108MP camera, 5000mAh, 33W fast charge.",
    isActive: true,
    shareCount: BigInt(423),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2005),
    title: "Allen Solly Men Formal Shirt",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://www.flipkart.com/search?q=Allen+Solly+Formal+Shirt",
    commissionPercent: BigInt(18),
    trendingTag: "👔 Flipkart Fashion",
    targetRegion: "Working Professionals",
    description: "Slim fit, premium cotton, easy iron fabric.",
    isActive: true,
    shareCount: BigInt(167),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2006),
    title: "Fastrack Analog Watch",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    price: BigInt(1295),
    affiliateLink: "https://www.flipkart.com/search?q=Fastrack+Analog+Watch",
    commissionPercent: BigInt(15),
    trendingTag: "⌚ Flipkart Watch",
    targetRegion: "Youth",
    description: "Stainless steel case, leather strap, water resistant.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2007),
    title: "Pigeon Electric Kettle 1.5L",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://www.flipkart.com/search?q=Pigeon+Electric+Kettle",
    commissionPercent: BigInt(16),
    trendingTag: "🍳 Flipkart Kitchen",
    targetRegion: "Pan India",
    description: "1500W, auto shut-off, cool touch body, 1.5L capacity.",
    isActive: true,
    shareCount: BigInt(312),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2008),
    title: "Noise ColorFit Pro 4 GPS Watch",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    price: BigInt(3999),
    affiliateLink: "https://www.flipkart.com/search?q=Noise+ColorFit+Pro+4+GPS",
    commissionPercent: BigInt(8),
    trendingTag: "⌚ Flipkart GPS",
    targetRegion: "Pan India",
    description: "GPS tracking, AMOLED, Bluetooth calling, 7-day battery.",
    isActive: true,
    shareCount: BigInt(198),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2009),
    title: "Mi 43 inch 4K Smart TV",
    imageUrl:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&h=400&fit=crop",
    price: BigInt(32999),
    affiliateLink: "https://www.flipkart.com/search?q=Mi+43+inch+4K+Smart+TV",
    commissionPercent: BigInt(4),
    trendingTag: "📺 Flipkart TV",
    targetRegion: "Families",
    description: "4K UHD, Android TV, Dolby Audio, 20W speakers.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2010),
    title: "Puma Men Running Shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    price: BigInt(2499),
    affiliateLink: "https://www.flipkart.com/search?q=Puma+Running+Shoes",
    commissionPercent: BigInt(20),
    trendingTag: "👟 Flipkart Sports",
    targetRegion: "Pan India",
    description: "Lightweight EVA sole, mesh upper, breathable design.",
    isActive: true,
    shareCount: BigInt(289),
    createdAt: BigInt(0),
  },

  // ── ALIEXPRESS / ALIBABA products ─────────────────────────────────────────
  {
    id: BigInt(3001),
    title: "LED Strip Lights 5M RGB Waterproof",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(299),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=LED+Strip+Lights+5M+RGB",
    commissionPercent: BigInt(25),
    trendingTag: "💡 Alibaba Wholesale",
    targetRegion: "Pan India",
    description: "5M RGB LEDs, remote control, music sync, waterproof IP65.",
    isActive: true,
    shareCount: BigInt(567),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3002),
    title: "Portable Mini USB Fan (Desk Fan)",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    price: BigInt(199),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Portable+Mini+USB+Fan",
    commissionPercent: BigInt(30),
    trendingTag: "🌬️ AliExpress Best",
    targetRegion: "Office Workers",
    description: "USB powered, 3 speed settings, ultra-quiet motor, portable.",
    isActive: true,
    shareCount: BigInt(423),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3003),
    title: "Tempered Glass Screen Protector (Pack of 10)",
    imageUrl:
      "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop",
    price: BigInt(149),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Tempered+Glass+Screen+Protector+Pack",
    commissionPercent: BigInt(35),
    trendingTag: "📱 AliExpress Bulk",
    targetRegion: "Resellers",
    description: "9H hardness, oleophobic coating, bubble-free, universal fit.",
    isActive: true,
    shareCount: BigInt(345),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3004),
    title: "Smart Watch DT7 Ultra (Calling)",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=DT7+Ultra+Smart+Watch",
    commissionPercent: BigInt(22),
    trendingTag: "⌚ AliExpress Smart",
    targetRegion: "Pan India",
    description: "2.05 inch HD screen, Bluetooth calling, health monitoring.",
    isActive: true,
    shareCount: BigInt(412),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3005),
    title: "Wireless Earbuds i12 TWS (Budget)",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    price: BigInt(349),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=i12+TWS+Wireless+Earbuds",
    commissionPercent: BigInt(28),
    trendingTag: "🎧 AliExpress Value",
    targetRegion: "Pan India",
    description: "Touch control, 5.0 Bluetooth, 3hr playtime + 12hr case.",
    isActive: true,
    shareCount: BigInt(289),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3006),
    title: "Electric Toothbrush Sonic (Waterproof)",
    imageUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
    price: BigInt(499),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Sonic+Electric+Toothbrush+Waterproof",
    commissionPercent: BigInt(25),
    trendingTag: "🦷 AliExpress Health",
    targetRegion: "Pan India",
    description:
      "40,000 vibrations/min, 5 modes, USB charging, 1 month battery.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3007),
    title: "Magnetic Phone Holder (Car Dashboard)",
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop",
    price: BigInt(299),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Magnetic+Car+Phone+Holder",
    commissionPercent: BigInt(30),
    trendingTag: "🚗 AliExpress Car",
    targetRegion: "Car Owners",
    description: "360° rotation, strong magnet, dashboard + vent mount.",
    isActive: true,
    shareCount: BigInt(378),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3008),
    title: "Solar Garden Lights (Pack of 4)",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(399),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Solar+Garden+Lights+Pack",
    commissionPercent: BigInt(22),
    trendingTag: "☀️ AliExpress Green",
    targetRegion: "Garden Lovers",
    description: "Auto on/off, 8hr illumination, IP65 waterproof, 4 pack.",
    isActive: true,
    shareCount: BigInt(156),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3009),
    title: "Stainless Steel Water Bottle 1L (Vacuum)",
    imageUrl:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop",
    price: BigInt(249),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Stainless+Steel+Vacuum+Bottle+1L",
    commissionPercent: BigInt(30),
    trendingTag: "🥤 AliExpress Eco",
    targetRegion: "Pan India",
    description: "24hr cold, 12hr hot, leak-proof lid, food grade steel.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3010),
    title: "Phone Case Bulk Pack (50 Mixed Cases)",
    imageUrl:
      "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop",
    price: BigInt(1999),
    affiliateLink:
      "https://www.aliexpress.com/wholesale?SearchText=Phone+Case+Bulk+Wholesale",
    commissionPercent: BigInt(20),
    trendingTag: "📦 Alibaba Resell",
    targetRegion: "Resellers, Shops",
    description:
      "50 mixed phone cases — silicone, hard back, transparent. Resell for ₹80-150 each!",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },

  // ── FIVERR services ────────────────────────────────────────────────────────
  {
    id: BigInt(4001),
    title: "Professional Logo Design",
    imageUrl:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=400&fit=crop",
    price: BigInt(999),
    affiliateLink: "https://www.fiverr.com/search/gigs?query=logo+design+india",
    commissionPercent: BigInt(15),
    trendingTag: "🎨 Fiverr Gig",
    targetRegion: "Business Owners",
    description:
      "Custom logo with 3 concepts, unlimited revisions, all file formats.",
    isActive: true,
    shareCount: BigInt(456),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4002),
    title: "WordPress Website Development",
    imageUrl:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=400&fit=crop",
    price: BigInt(4999),
    affiliateLink:
      "https://www.fiverr.com/search/gigs?query=wordpress+website+development",
    commissionPercent: BigInt(12),
    trendingTag: "💻 Fiverr Dev",
    targetRegion: "Businesses",
    description:
      "5-page professional website, mobile responsive, SEO optimized.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4003),
    title: "Social Media Marketing Posts (10 posts)",
    imageUrl:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop",
    price: BigInt(1499),
    affiliateLink:
      "https://www.fiverr.com/search/gigs?query=social+media+marketing+posts",
    commissionPercent: BigInt(14),
    trendingTag: "📱 Fiverr Social",
    targetRegion: "Brands, Startups",
    description:
      "10 branded posts for Instagram/Facebook, custom graphics, captions.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4004),
    title: "SEO Optimization Complete Package",
    imageUrl:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=400&fit=crop",
    price: BigInt(2999),
    affiliateLink: "https://www.fiverr.com/search/gigs?query=seo+optimization",
    commissionPercent: BigInt(12),
    trendingTag: "🔍 Fiverr SEO",
    targetRegion: "Website Owners",
    description: "On-page + off-page SEO, 20 backlinks, monthly report.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4005),
    title: "YouTube Video Editing (Professional)",
    imageUrl:
      "https://images.unsplash.com/photo-1536240478700-b869ad10e2d1?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink:
      "https://www.fiverr.com/search/gigs?query=youtube+video+editing",
    commissionPercent: BigInt(15),
    trendingTag: "🎬 Fiverr Video",
    targetRegion: "YouTubers",
    description:
      "10-min video edit, color grading, subtitles, intro/outro, thumbnail.",
    isActive: true,
    shareCount: BigInt(312),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4006),
    title: "Hindi Article Writing (1000 words)",
    imageUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop",
    price: BigInt(349),
    affiliateLink:
      "https://www.fiverr.com/search/gigs?query=hindi+article+writing",
    commissionPercent: BigInt(20),
    trendingTag: "✍️ Fiverr Hindi",
    targetRegion: "Hindi Bloggers",
    description:
      "SEO-friendly Hindi article, research included, plagiarism free.",
    isActive: true,
    shareCount: BigInt(178),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4007),
    title: "Business Card Design (Premium)",
    imageUrl:
      "https://images.unsplash.com/photo-1578926288207-a90a5366e9bf?w=400&h=400&fit=crop",
    price: BigInt(599),
    affiliateLink:
      "https://www.fiverr.com/search/gigs?query=business+card+design",
    commissionPercent: BigInt(18),
    trendingTag: "🎨 Fiverr Design",
    targetRegion: "Business Owners",
    description: "Front + back design, print-ready files, 2 concepts.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4008),
    title: "Voice Over Recording (Hindi)",
    imageUrl:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://www.fiverr.com/search/gigs?query=hindi+voice+over",
    commissionPercent: BigInt(16),
    trendingTag: "🎙️ Fiverr Voice",
    targetRegion: "Advertisers",
    description:
      "Professional Hindi voice over, studio quality, 24hr delivery.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4009),
    title: "Data Entry Services (1000 rows)",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    price: BigInt(499),
    affiliateLink:
      "https://www.fiverr.com/search/gigs?query=data+entry+services",
    commissionPercent: BigInt(18),
    trendingTag: "📊 Fiverr Data",
    targetRegion: "Businesses",
    description: "Accurate data entry, Excel/Google Sheets, 99.9% accuracy.",
    isActive: true,
    shareCount: BigInt(267),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4010),
    title: "Virtual Assistant (10 Hours/Week)",
    imageUrl:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop",
    price: BigInt(1999),
    affiliateLink: "https://www.fiverr.com/search/gigs?query=virtual+assistant",
    commissionPercent: BigInt(12),
    trendingTag: "💼 Fiverr VA",
    targetRegion: "Entrepreneurs",
    description:
      "Email management, scheduling, research, social media — 10hrs/week.",
    isActive: true,
    shareCount: BigInt(198),
    createdAt: BigInt(0),
  },
];

const FILTERS = [
  "All",
  "Amazon",
  "Flipkart",
  "AliExpress",
  "Fiverr",
  "Electronics",
  "Fashion",
  "Kitchen",
  "Fitness",
  "Home",
  "Gaming",
  "Beauty",
] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_KEYWORDS: Record<Filter, string[]> = {
  All: [],
  Amazon: ["amazon.in", "amzn.to"],
  Flipkart: ["flipkart.com", "fkrt.it", "flipkart"],
  AliExpress: [
    "aliexpress.com",
    "aliexpress",
    "s.click.ali",
    "alibaba",
    "wholesale",
    "bulk",
  ],
  Fiverr: [
    "fiverr.com",
    "gig",
    "freelance",
    "design",
    "development",
    "writing",
    "voice",
    "va",
  ],
  Electronics: [
    "earbuds",
    "headphones",
    "smartwatch",
    "phone",
    "5g",
    "tablet",
    "camera",
    "router",
    "smart bulb",
    "charger",
    "power bank",
    "fan",
    "tv",
  ],
  Fashion: [
    "shoes",
    "t-shirt",
    "backpack",
    "shorts",
    "luggage",
    "sunglasses",
    "formal",
    "shirt",
    "watch",
  ],
  Kitchen: ["mixer", "grinder", "kettle", "air fryer", "cooker"],
  Fitness: ["resistance", "yoga", "skipping", "protein", "gym", "running"],
  Home: [
    "pillow",
    "storage",
    "fan",
    "heater",
    "mattress",
    "detergent",
    "led",
    "solar",
    "bulb",
  ],
  Gaming: ["gaming", "mouse", "headset"],
  Beauty: ["toner", "face wash", "hair dryer", "mamaearth", "toothbrush"],
};

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const trackShare = useTrackShare();
  const [imgError, setImgError] = useState(false);

  const platform = getPlatform(deal);

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

  const handleBuy = async () => {
    const targetUrl =
      deal.affiliateLink && deal.affiliateLink.trim() !== ""
        ? deal.affiliateLink
        : "https://www.amazon.in";
    window.open(targetUrl, "_blank");

    try {
      await trackShare.mutateAsync(deal.id);
      toast.success("Deal khul gayi! Commission track ho raha hai 📊", {
        duration: 2000,
      });
    } catch {
      // Don't fail the buy flow if tracking fails
    }
  };

  const commissionAmount = Math.floor(
    (Number(deal.price) * Number(deal.commissionPercent)) / 100,
  );
  const hasImage = deal.imageUrl && deal.imageUrl.trim() !== "" && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
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
          background:
            "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
        }}
      >
        {hasImage ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-4xl">🛍️</span>
          </div>
        )}

        {/* Commission badge (top-right) */}
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

        {/* Trending tag (top-left) */}
        {deal.trendingTag && (
          <div
            className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5"
            style={{
              background: "oklch(0.62 0.22 25 / 0.9)",
              color: "oklch(0.96 0 0)",
            }}
          >
            <TrendingUp size={9} />
            {deal.trendingTag}
          </div>
        )}

        {/* Platform badge (bottom-left) */}
        <div
          className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold"
          style={{
            background: platform.bg,
            color: platform.color,
            boxShadow: "0 1px 4px oklch(0 0 0 / 0.4)",
          }}
        >
          {platform.name}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3
          className="text-sm font-bold leading-tight line-clamp-2"
          style={{ color: "oklch(0.92 0.015 85)" }}
        >
          {deal.title}
        </h3>

        <div className="flex items-center justify-between">
          <span
            className="text-base font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            ₹{formatINR(deal.price)}
          </span>
          {deal.targetRegion && (
            <div className="flex items-center gap-1">
              <MapPin size={9} style={{ color: "oklch(0.52 0.01 85)" }} />
              <span
                className="text-[9px]"
                style={{ color: "oklch(0.52 0.01 85)" }}
              >
                {deal.targetRegion.split(",")[0]}
              </span>
            </div>
          )}
        </div>

        {/* Commission amount */}
        <div
          className="rounded-lg px-2 py-1 flex items-center gap-1"
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

        {/* Buttons row */}
        <div className="mt-auto flex gap-1.5">
          <button
            type="button"
            onClick={handleBuy}
            data-ocid={`deals.buy_button.${index + 1}`}
            className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold transition-all active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.18 160), oklch(0.58 0.20 155))",
              color: "oklch(0.96 0.01 145)",
              boxShadow: "0 2px 10px oklch(0.55 0.18 145 / 0.3)",
            }}
          >
            <ShoppingCart size={11} />
            Buy
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={trackShare.isPending}
            data-ocid={`deals.share_button.${index + 1}`}
            className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold transition-all active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))",
              color: "oklch(0.08 0 0)",
              boxShadow: "0 2px 10px oklch(0.78 0.12 85 / 0.3)",
            }}
          >
            {trackShare.isPending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Share2 size={11} />
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
  const { identity, isInitializing } = useInternetIdentity();
  const { data: dealsFromBackend = [], isLoading } = useGetActiveDeals();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  // Merge backend deals on top of sample deals (backend deals appear first)
  const isSampleMode = !isLoading && dealsFromBackend.length === 0;
  const allDeals =
    dealsFromBackend.length > 0
      ? [...dealsFromBackend, ...SAMPLE_DEALS]
      : SAMPLE_DEALS;

  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      const titleLower = deal.title.toLowerCase();
      const descLower = deal.description.toLowerCase();
      const tagLower = deal.trendingTag.toLowerCase();
      const linkLower = deal.affiliateLink.toLowerCase();

      const matchesSearch =
        !search ||
        titleLower.includes(search.toLowerCase()) ||
        descLower.includes(search.toLowerCase()) ||
        tagLower.includes(search.toLowerCase());

      let matchesFilter = true;
      if (activeFilter !== "All") {
        const keywords = FILTER_KEYWORDS[activeFilter];
        matchesFilter = keywords.some(
          (kw) =>
            titleLower.includes(kw) ||
            descLower.includes(kw) ||
            tagLower.includes(kw) ||
            linkLower.includes(kw),
        );
      }

      return matchesSearch && matchesFilter;
    });
  }, [allDeals, search, activeFilter]);

  // Platform color map for filter badges
  const platformColors: Record<string, string> = {
    Amazon: "oklch(0.72 0.18 65)",
    Flipkart: "oklch(0.45 0.22 250)",
    AliExpress: "oklch(0.55 0.24 25)",
    Fiverr: "oklch(0.45 0.22 145)",
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.08 0 0) 0%, oklch(0.08 0 0 / 0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.28 0.04 85 / 0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Tag size={22} style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            AI Deals
          </h1>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              background: "oklch(0.72 0.11 80 / 0.2)",
              color: "oklch(0.86 0.14 85)",
              border: "1px solid oklch(0.78 0.12 85 / 0.3)",
            }}
          >
            {allDeals.length}+ Products
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
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
        <div className="flex gap-2 overflow-x-auto pb-0.5 mt-2.5 no-scrollbar">
          {FILTERS.map((filter) => {
            const isPlatform = filter in platformColors;
            const platformColor = platformColors[filter];
            const isActive = activeFilter === filter;
            return (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                data-ocid="deals.filter.tab"
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: isActive
                    ? isPlatform
                      ? platformColor
                      : "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88))"
                    : "oklch(0.14 0.01 85)",
                  color: isActive
                    ? isPlatform && filter !== "Amazon"
                      ? "oklch(0.96 0.01 0)"
                      : "oklch(0.08 0 0)"
                    : "oklch(0.62 0.01 85)",
                  border: isActive
                    ? `1px solid ${isPlatform ? platformColor : "oklch(0.78 0.12 85 / 0.5)"}`
                    : "1px solid oklch(0.22 0.01 85)",
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
                key={i}
                className="rounded-2xl overflow-hidden animate-shimmer"
                style={{ height: "260px" }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Earn Kaise Karen info card */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-3 mb-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.6), oklch(0.16 0.06 85 / 0.4))",
                border: "1px solid oklch(0.78 0.12 85 / 0.3)",
              }}
            >
              <p
                className="text-xs font-bold mb-2"
                style={{ color: "oklch(0.86 0.14 85)" }}
              >
                💡 Earn Kaise Karen?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    icon: "🛒",
                    label: "Buy Karo",
                    desc: "Link pe jao, khareedari karo → commission milegi",
                  },
                  {
                    icon: "📢",
                    label: "Share Karo",
                    desc: "Deal share karo, koi bhi khareedeta hai → aapko commission",
                  },
                  {
                    icon: "💰",
                    label: "Admin 2%",
                    desc: "Platform maintain karne ke liye 2% admin ko",
                  },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="text-center">
                    <div className="text-lg mb-0.5">{icon}</div>
                    <p
                      className="text-[10px] font-semibold"
                      style={{ color: "oklch(0.82 0.08 85)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[9px] mt-0.5 leading-tight"
                      style={{ color: "oklch(0.52 0.01 85)" }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Platform legend */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {(
                [
                  {
                    name: "Amazon",
                    bg: "oklch(0.72 0.18 65)",
                    color: "oklch(0.08 0 0)",
                  },
                  {
                    name: "Flipkart",
                    bg: "oklch(0.45 0.22 250)",
                    color: "oklch(0.96 0.01 250)",
                  },
                  {
                    name: "AliExpress",
                    bg: "oklch(0.55 0.24 25)",
                    color: "oklch(0.96 0.01 25)",
                  },
                  {
                    name: "Fiverr",
                    bg: "oklch(0.45 0.22 145)",
                    color: "oklch(0.96 0.02 145)",
                  },
                ] as const
              ).map((p) => (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: p.bg, color: p.color }}
                >
                  {p.name}
                </span>
              ))}
              <span
                className="text-[9px]"
                style={{ color: "oklch(0.45 0.01 85)", alignSelf: "center" }}
              >
                — Platform badges dikhte hain har deal par
              </span>
            </div>

            {/* Info banner for sample mode */}
            {isSampleMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-3 py-2 mb-3 flex items-center gap-2"
                style={{
                  background: "oklch(0.14 0.03 85 / 0.6)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.25)",
                }}
              >
                <span className="text-sm">📦</span>
                <p className="text-xs" style={{ color: "oklch(0.72 0.10 85)" }}>
                  {allDeals.length} Sample Deals (Amazon, Flipkart, AliExpress,
                  Fiverr) — Admin real affiliate deals add kar sakta hai.
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
                  className="text-xs mb-2.5"
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
