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

// 60 sample Indian affiliate products across categories
const SAMPLE_DEALS: Deal[] = [
  // Electronics - Earbuds/Headphones
  {
    id: BigInt(1001),
    title: "boAt Airdopes 141 TWS Earbuds",
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://amzn.to/boatairdopes",
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
    affiliateLink: "https://amzn.to/sonywh",
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
    affiliateLink: "https://amzn.to/noisewatch",
    commissionPercent: BigInt(12),
    trendingTag: "⌚ Trending",
    targetRegion: "Pan India",
    description: "1.96 AMOLED, Bluetooth calling, SpO2, 100+ sports modes.",
    isActive: true,
    shareCount: BigInt(310),
    createdAt: BigInt(0),
  },
  // Smartphones
  {
    id: BigInt(1004),
    title: "Redmi 13C 5G (4GB+128GB)",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    price: BigInt(10999),
    affiliateLink: "https://amzn.to/redmi13c",
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
    affiliateLink: "https://amzn.to/samsungf15",
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
    affiliateLink: "https://amzn.to/pocox6",
    commissionPercent: BigInt(5),
    trendingTag: "🔥 Best Value",
    targetRegion: "Pan India",
    description: "120Hz AMOLED, Snapdragon 7s Gen 2, 67W turbo charge.",
    isActive: true,
    shareCount: BigInt(356),
    createdAt: BigInt(0),
  },
  // Kitchen
  {
    id: BigInt(1007),
    title: "Philips HL7756 Mixer Grinder 750W",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    price: BigInt(2495),
    affiliateLink: "https://amzn.to/philipsmixer",
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
    title: "Prestige Iris 750W Mixer Grinder",
    imageUrl:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    price: BigInt(1899),
    affiliateLink: "https://amzn.to/prestigemixer",
    commissionPercent: BigInt(12),
    trendingTag: "🍳 Kitchen",
    targetRegion: "North India",
    description: "3 speed, 2 SS jars, overload protection.",
    isActive: true,
    shareCount: BigInt(156),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1009),
    title: "Butterfly Smart Electric Kettle 1.5L",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://amzn.to/butterflykettle",
    commissionPercent: BigInt(18),
    trendingTag: "⚡ 22% Margin",
    targetRegion: "Muzaffarpur, Bihar",
    description: "1500W rapid boiling, auto shut-off, food grade SS.",
    isActive: true,
    shareCount: BigInt(203),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1010),
    title: "Pigeon Healthifry Digital Air Fryer 4.2L",
    imageUrl:
      "https://images.unsplash.com/photo-1648146894073-0c9b0d52a3b4?w=400&h=400&fit=crop",
    price: BigInt(3499),
    affiliateLink: "https://amzn.to/pigeonairfryer",
    commissionPercent: BigInt(14),
    trendingTag: "🥗 Healthy",
    targetRegion: "Metro Cities",
    description: "360° air circulation, 8 preset menus, non-stick basket.",
    isActive: true,
    shareCount: BigInt(267),
    createdAt: BigInt(0),
  },
  // Fashion
  {
    id: BigInt(1011),
    title: "Campus Women Casual Shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://amzn.to/campusshoes",
    commissionPercent: BigInt(15),
    trendingTag: "👟 Fashion",
    targetRegion: "Mumbai, Delhi",
    description: "Lightweight EVA sole, breathable mesh upper.",
    isActive: true,
    shareCount: BigInt(89),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1012),
    title: "Puma Men Sports T-Shirt (Pack of 2)",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    price: BigInt(1199),
    affiliateLink: "https://amzn.to/pumatshirt",
    commissionPercent: BigInt(20),
    trendingTag: "👕 Trending",
    targetRegion: "Pan India",
    description: "Dri-FIT technology, anti-odor, quick dry fabric.",
    isActive: true,
    shareCount: BigInt(142),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1013),
    title: "Wildcraft Laptop Backpack 30L",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    price: BigInt(1799),
    affiliateLink: "https://amzn.to/wildcraftbag",
    commissionPercent: BigInt(16),
    trendingTag: "🎒 College",
    targetRegion: "Students",
    description: "Water resistant, padded laptop sleeve, USB charging port.",
    isActive: true,
    shareCount: BigInt(198),
    createdAt: BigInt(0),
  },
  // Home & Furniture
  {
    id: BigInt(1014),
    title: "Wakefit Orthopedic Memory Foam Pillow",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    price: BigInt(999),
    affiliateLink: "https://amzn.to/wakefitpillow",
    commissionPercent: BigInt(14),
    trendingTag: "🏠 Home",
    targetRegion: "Bangalore, Pune",
    description: "Cervical support, anti-microbial fabric, washable cover.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1015),
    title: "Cello Homeware Jumbo Storage Box (Set of 3)",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(849),
    affiliateLink: "https://amzn.to/cellobox",
    commissionPercent: BigInt(18),
    trendingTag: "🏠 Home",
    targetRegion: "Tier 2 Cities",
    description: "Multi-purpose boxes, airtight lids, stackable design.",
    isActive: true,
    shareCount: BigInt(121),
    createdAt: BigInt(0),
  },
  // Fitness
  {
    id: BigInt(1016),
    title: "Boldfit Resistance Bands Set (5 Bands)",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    price: BigInt(499),
    affiliateLink: "https://amzn.to/boldfitbands",
    commissionPercent: BigInt(22),
    trendingTag: "💪 Fitness",
    targetRegion: "Pan India",
    description: "5 resistance levels, carry bag included, anti-snap latex.",
    isActive: true,
    shareCount: BigInt(334),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1017),
    title: "Strauss Yoga Mat 6mm with Bag",
    imageUrl:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://amzn.to/straussyoga",
    commissionPercent: BigInt(20),
    trendingTag: "🧘 Yoga",
    targetRegion: "Metro Cities",
    description: "Anti-slip surface, eco-friendly TPE, includes carry bag.",
    isActive: true,
    shareCount: BigInt(276),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1018),
    title: "Cultsport Skipping Rope (Adjustable)",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    price: BigInt(399),
    affiliateLink: "https://amzn.to/cultsportrope",
    commissionPercent: BigInt(25),
    trendingTag: "🏃 Cardio",
    targetRegion: "Pan India",
    description: "Adjustable length, ball bearing handles, anti-tangle.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  // Books/Education
  {
    id: BigInt(1019),
    title: "Rich Dad Poor Dad - Robert Kiyosaki",
    imageUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    price: BigInt(299),
    affiliateLink: "https://amzn.to/richdadpoordad",
    commissionPercent: BigInt(10),
    trendingTag: "📚 Bestseller",
    targetRegion: "Students, Professionals",
    description: "Financial literacy classic. #1 personal finance book.",
    isActive: true,
    shareCount: BigInt(421),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1020),
    title: "Atomic Habits - James Clear (Hindi)",
    imageUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop",
    price: BigInt(249),
    affiliateLink: "https://amzn.to/atomichabits",
    commissionPercent: BigInt(10),
    trendingTag: "📚 Self-Help",
    targetRegion: "Hindi Belt",
    description: "1% better every day. Habit stacking framework.",
    isActive: true,
    shareCount: BigInt(367),
    createdAt: BigInt(0),
  },
  // Electronics - Tablets
  {
    id: BigInt(1021),
    title: "Redmi Pad SE (6GB+128GB) WiFi Tablet",
    imageUrl:
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop",
    price: BigInt(17999),
    affiliateLink: "https://amzn.to/redmipadse",
    commissionPercent: BigInt(6),
    trendingTag: "📱 Tablet",
    targetRegion: "Students, Families",
    description: "11 90Hz display, Dolby Atmos, 8000mAh battery.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  // Beauty & Personal Care
  {
    id: BigInt(1022),
    title: "Biotique Bio Cucumber Pore Tightening Toner",
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    price: BigInt(299),
    affiliateLink: "https://amzn.to/biotiquetoner",
    commissionPercent: BigInt(20),
    trendingTag: "💄 Beauty",
    targetRegion: "Women 18-35",
    description: "Natural ingredients, alcohol-free, minimizes pores.",
    isActive: true,
    shareCount: BigInt(156),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1023),
    title: "Mamaearth Ubtan Face Wash 100ml",
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    price: BigInt(249),
    affiliateLink: "https://amzn.to/mamaearthfacewash",
    commissionPercent: BigInt(18),
    trendingTag: "🌿 Natural",
    targetRegion: "Pan India",
    description: "Turmeric + Saffron, skin brightening, natural formula.",
    isActive: true,
    shareCount: BigInt(298),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1024),
    title: "Havells Hair Dryer 1800W with 2 Speed",
    imageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://amzn.to/havellsdryer",
    commissionPercent: BigInt(12),
    trendingTag: "💆 Hair Care",
    targetRegion: "Women",
    description: "Concentrator + diffuser nozzle, cool shot button.",
    isActive: true,
    shareCount: BigInt(167),
    createdAt: BigInt(0),
  },
  // Electronics - Power & Charging
  {
    id: BigInt(1025),
    title: "Ambrane 20000mAh Power Bank (20W Fast Charge)",
    imageUrl:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://amzn.to/ambranepowerbank",
    commissionPercent: BigInt(14),
    trendingTag: "⚡ Must Have",
    targetRegion: "Travellers",
    description: "20W PD, dual output, LED indicator, 1 year warranty.",
    isActive: true,
    shareCount: BigInt(445),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1026),
    title: "Portronics Tornado 66W GaN Charger (2 USB-C)",
    imageUrl:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
    price: BigInt(1499),
    affiliateLink: "https://amzn.to/portronicsgan",
    commissionPercent: BigInt(16),
    trendingTag: "⚡ Fast Charge",
    targetRegion: "Tech Users",
    description: "66W GaN technology, 2 USB-C ports, compact design.",
    isActive: true,
    shareCount: BigInt(312),
    createdAt: BigInt(0),
  },
  // Stationery / Office
  {
    id: BigInt(1027),
    title: "Classmate Pulse Pen (Pack of 20)",
    imageUrl:
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop",
    price: BigInt(180),
    affiliateLink: "https://amzn.to/classmatepen",
    commissionPercent: BigInt(25),
    trendingTag: "✏️ Students",
    targetRegion: "Schools, Colleges",
    description: "Smooth flow blue ink, rubber grip, 0.7mm tip.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1028),
    title: "Sakura A4 Printer Paper 500 Sheets 75gsm",
    imageUrl:
      "https://images.unsplash.com/photo-1613387275674-cb92af1c29d1?w=400&h=400&fit=crop",
    price: BigInt(449),
    affiliateLink: "https://amzn.to/sakurapaper",
    commissionPercent: BigInt(15),
    trendingTag: "📄 Office",
    targetRegion: "Offices, Homes",
    description: "75gsm, dual-sided printing, acid-free, ISO certified.",
    isActive: true,
    shareCount: BigInt(134),
    createdAt: BigInt(0),
  },
  // Baby & Kids
  {
    id: BigInt(1029),
    title: "Mee Mee Infant Car Seat (0-15 months)",
    imageUrl:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
    price: BigInt(3999),
    affiliateLink: "https://amzn.to/meemeecarseat",
    commissionPercent: BigInt(12),
    trendingTag: "👶 Baby",
    targetRegion: "Young Parents",
    description: "5-point safety harness, EPS foam, washable cover.",
    isActive: true,
    shareCount: BigInt(156),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1030),
    title: "Lego Classic Creative Bricks 484pcs",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    price: BigInt(2999),
    affiliateLink: "https://amzn.to/legoclassic",
    commissionPercent: BigInt(10),
    trendingTag: "🧸 Kids",
    targetRegion: "Parents",
    description: "484 colourful bricks, ages 4+, boosts creativity.",
    isActive: true,
    shareCount: BigInt(223),
    createdAt: BigInt(0),
  },
  // Grocery/Food
  {
    id: BigInt(1031),
    title: "Tata Sampann Chana Dal 1kg (Unpolished)",
    imageUrl:
      "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=400&fit=crop",
    price: BigInt(149),
    affiliateLink: "https://amzn.to/tatasampann",
    commissionPercent: BigInt(5),
    trendingTag: "🌾 Grocery",
    targetRegion: "Tier 2, 3 Cities",
    description: "100% unpolished, high protein, no artificial additives.",
    isActive: true,
    shareCount: BigInt(98),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1032),
    title: "Yoga Bar Oats Breakfast Cereal 400g",
    imageUrl:
      "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop",
    price: BigInt(299),
    affiliateLink: "https://amzn.to/yogabaroats",
    commissionPercent: BigInt(15),
    trendingTag: "🥣 Health Food",
    targetRegion: "Health Conscious",
    description: "Whole grain oats, no added sugar, high fibre.",
    isActive: true,
    shareCount: BigInt(187),
    createdAt: BigInt(0),
  },
  // Electronics - Cameras
  {
    id: BigInt(1033),
    title: "GoPro HERO11 Black Action Camera",
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    price: BigInt(34990),
    affiliateLink: "https://amzn.to/gopro11",
    commissionPercent: BigInt(5),
    trendingTag: "📸 Adventure",
    targetRegion: "Travellers, Vloggers",
    description: "5.3K60, 27MP, HyperSmooth 5.0, waterproof to 10m.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1034),
    title: "Canon EOS 250D DSLR Camera (18-55mm lens)",
    imageUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
    price: BigInt(49990),
    affiliateLink: "https://amzn.to/canoneos250d",
    commissionPercent: BigInt(4),
    trendingTag: "📸 DSLR",
    targetRegion: "Photographers",
    description: "24.1MP, 4K video, 9-point AF, vari-angle touchscreen.",
    isActive: true,
    shareCount: BigInt(112),
    createdAt: BigInt(0),
  },
  // Smart Home
  {
    id: BigInt(1035),
    title: "Wipro 9W LED Smart Bulb (Pack of 2)",
    imageUrl:
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://amzn.to/wipledo",
    commissionPercent: BigInt(20),
    trendingTag: "💡 Smart Home",
    targetRegion: "Urban Homes",
    description: "16 million colours, Alexa & Google Home compatible.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1036),
    title: "TP-Link Tapo Mini Smart Plug (Wi-Fi)",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(1199),
    affiliateLink: "https://amzn.to/tapoplug",
    commissionPercent: BigInt(18),
    trendingTag: "💡 Smart Home",
    targetRegion: "Tech Enthusiasts",
    description: "Schedule timer, energy monitoring, Alexa/Google compatible.",
    isActive: true,
    shareCount: BigInt(178),
    createdAt: BigInt(0),
  },
  // Sports & Outdoors
  {
    id: BigInt(1037),
    title: "Decathlon Domyos Sport Shorts Men",
    imageUrl:
      "https://images.unsplash.com/photo-1556442806-3b3b3b3b3b3b?w=400&h=400&fit=crop",
    price: BigInt(599),
    affiliateLink: "https://amzn.to/decathlonshorts",
    commissionPercent: BigInt(22),
    trendingTag: "🏋️ Sports",
    targetRegion: "Gym Goers",
    description: "Lightweight, moisture wicking, side pockets.",
    isActive: true,
    shareCount: BigInt(203),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1038),
    title: "Cosco Champion Badminton Racket Set",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop",
    price: BigInt(899),
    affiliateLink: "https://amzn.to/coscobadminton",
    commissionPercent: BigInt(20),
    trendingTag: "🏸 Sports",
    targetRegion: "Families, Schools",
    description: "2 rackets + 3 shuttles + carry bag. Ideal for beginners.",
    isActive: true,
    shareCount: BigInt(167),
    createdAt: BigInt(0),
  },
  // PC / Gaming
  {
    id: BigInt(1039),
    title: "Redgear A-15 RGB Gaming Mouse",
    imageUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://amzn.to/redgearmouse",
    commissionPercent: BigInt(18),
    trendingTag: "🎮 Gaming",
    targetRegion: "Gamers",
    description: "7200 DPI, 7 RGB zones, 1000Hz polling rate.",
    isActive: true,
    shareCount: BigInt(389),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1040),
    title: "Cosmic Byte GS430 Gaming Headset",
    imageUrl:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop",
    price: BigInt(1299),
    affiliateLink: "https://amzn.to/cosmicbyte",
    commissionPercent: BigInt(16),
    trendingTag: "🎮 Gaming",
    targetRegion: "PC, Console Gamers",
    description: "7.1 surround, retractable mic, LED lighting.",
    isActive: true,
    shareCount: BigInt(312),
    createdAt: BigInt(0),
  },
  // Appliances
  {
    id: BigInt(1041),
    title: "Havells Instanio 3L Instant Water Heater",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(2999),
    affiliateLink: "https://amzn.to/havellsheater",
    commissionPercent: BigInt(10),
    trendingTag: "🚿 Home",
    targetRegion: "North India",
    description: "3 litre, 3kW instant heating, 5 star BEE rating.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1042),
    title: "Crompton Optimus 3L Table Fan",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    price: BigInt(1499),
    affiliateLink: "https://amzn.to/cromptonoptimus",
    commissionPercent: BigInt(12),
    trendingTag: "🌬️ Summer",
    targetRegion: "Pan India",
    description: "High speed, 3-blade, 3 speed settings, 1 year warranty.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  // Bags & Luggage
  {
    id: BigInt(1043),
    title: "American Tourister Trolley Bag 55cm (Cabin)",
    imageUrl:
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=400&fit=crop",
    price: BigInt(3999),
    affiliateLink: "https://amzn.to/americantourister",
    commissionPercent: BigInt(12),
    trendingTag: "✈️ Travel",
    targetRegion: "Frequent Flyers",
    description: "4-wheel spinner, TSA lock, expandable, lightweight.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1044),
    title: "Safari Polycarbonate 26 inch Check-in Luggage",
    imageUrl:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop",
    price: BigInt(5999),
    affiliateLink: "https://amzn.to/safariluggage",
    commissionPercent: BigInt(10),
    trendingTag: "✈️ Travel",
    targetRegion: "Travel Enthusiasts",
    description: "Hard case, 8-wheel 360°, combination lock, 5 year warranty.",
    isActive: true,
    shareCount: BigInt(178),
    createdAt: BigInt(0),
  },
  // Pharma / Health
  {
    id: BigInt(1045),
    title: "Neuherbs True Whey Protein 1kg (Chocolate)",
    imageUrl:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop",
    price: BigInt(1499),
    affiliateLink: "https://amzn.to/neuherbs",
    commissionPercent: BigInt(18),
    trendingTag: "💪 Protein",
    targetRegion: "Gym Users",
    description: "24g protein per scoop, low sugar, lab tested, FSSAI.",
    isActive: true,
    shareCount: BigInt(456),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1046),
    title: "Dr. Morepen Glucometer BG-03 + 50 Strips",
    imageUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
    price: BigInt(599),
    affiliateLink: "https://amzn.to/drmorepen",
    commissionPercent: BigInt(15),
    trendingTag: "🏥 Health",
    targetRegion: "Diabetics, Families",
    description: "Fast 5-second reading, memory 300 results, no coding.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  // Pet Supplies
  {
    id: BigInt(1047),
    title: "Pedigree Adult Dog Food Chicken & Vegetables 3kg",
    imageUrl:
      "https://images.unsplash.com/photo-1601758123927-196f8c8a3a0b?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://amzn.to/pedigreedogfood",
    commissionPercent: BigInt(10),
    trendingTag: "🐕 Pets",
    targetRegion: "Pet Owners",
    description: "Complete nutrition, omega 6 fatty acids, dental care.",
    isActive: true,
    shareCount: BigInt(167),
    createdAt: BigInt(0),
  },
  // Toys & Games
  {
    id: BigInt(1048),
    title: "Funskool Monopoly Classic Board Game",
    imageUrl:
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=400&fit=crop",
    price: BigInt(799),
    affiliateLink: "https://amzn.to/monopoly",
    commissionPercent: BigInt(15),
    trendingTag: "🎲 Family Game",
    targetRegion: "Families",
    description: "Classic property trading game, 2-8 players, ages 8+.",
    isActive: true,
    shareCount: BigInt(289),
    createdAt: BigInt(0),
  },
  // Musical Instruments
  {
    id: BigInt(1049),
    title: "Kadence Beginner Acoustic Guitar (Natural)",
    imageUrl:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
    price: BigInt(3499),
    affiliateLink: "https://amzn.to/kadenceguitar",
    commissionPercent: BigInt(12),
    trendingTag: "🎸 Music",
    targetRegion: "Students, Beginners",
    description: "Linden wood top, rosewood fingerboard, 3-month warranty.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  // Automotive
  {
    id: BigInt(1050),
    title: "Voxpop Universal Car Phone Mount (Dashboard)",
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop",
    price: BigInt(449),
    affiliateLink: "https://amzn.to/voxpopcarmont",
    commissionPercent: BigInt(25),
    trendingTag: "🚗 Car",
    targetRegion: "Car Owners",
    description: "360° rotation, strong suction, compatible all phones.",
    isActive: true,
    shareCount: BigInt(378),
    createdAt: BigInt(0),
  },
  {
    id: BigInt(1051),
    title: "3M Car Tinting Window Film (Black)",
    imageUrl:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop",
    price: BigInt(2499),
    affiliateLink: "https://amzn.to/3mcartint",
    commissionPercent: BigInt(10),
    trendingTag: "🚗 Car Accessories",
    targetRegion: "Car Owners",
    description: "Heat rejection 79%, UV protection 99%, 5 year warranty.",
    isActive: true,
    shareCount: BigInt(134),
    createdAt: BigInt(0),
  },
  // Lighting
  {
    id: BigInt(1052),
    title: "Syska 20W LED Panel Light (Pack of 2)",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(699),
    affiliateLink: "https://amzn.to/syskaled",
    commissionPercent: BigInt(22),
    trendingTag: "💡 LED",
    targetRegion: "Homes, Offices",
    description: "Cool white 6500K, 1600lm, 3 year warranty, flicker free.",
    isActive: true,
    shareCount: BigInt(198),
    createdAt: BigInt(0),
  },
  // Networking
  {
    id: BigInt(1053),
    title: "TP-Link Archer C6 AC1200 Dual-Band Wi-Fi Router",
    imageUrl:
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=400&fit=crop",
    price: BigInt(2499),
    affiliateLink: "https://amzn.to/tplinkrouter",
    commissionPercent: BigInt(10),
    trendingTag: "📶 Internet",
    targetRegion: "Home, WFH",
    description: "1200 Mbps, MU-MIMO, beamforming, 4 antennas.",
    isActive: true,
    shareCount: BigInt(267),
    createdAt: BigInt(0),
  },
  // Mattress
  {
    id: BigInt(1054),
    title: "Sleepwell Ortho Pro 4 inch Foam Mattress (Queen)",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
    price: BigInt(12999),
    affiliateLink: "https://amzn.to/sleepwell",
    commissionPercent: BigInt(8),
    trendingTag: "😴 Sleep",
    targetRegion: "Families",
    description: "High-density foam, ortho support, 5 year warranty.",
    isActive: true,
    shareCount: BigInt(156),
    createdAt: BigInt(0),
  },
  // Detergent / Cleaning
  {
    id: BigInt(1055),
    title: "Surf Excel Matic Liquid Detergent 2L",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    price: BigInt(399),
    affiliateLink: "https://amzn.to/surfexcel",
    commissionPercent: BigInt(8),
    trendingTag: "🧺 Household",
    targetRegion: "Pan India",
    description: "Front load formula, deep clean, stain removal.",
    isActive: true,
    shareCount: BigInt(112),
    createdAt: BigInt(0),
  },
  // Tools
  {
    id: BigInt(1056),
    title: "Bosch GSB 500W Electric Drill Machine",
    imageUrl:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
    price: BigInt(1999),
    affiliateLink: "https://amzn.to/boschdrillmachine",
    commissionPercent: BigInt(12),
    trendingTag: "🔧 Tools",
    targetRegion: "Men 25-50",
    description: "500W, 2800RPM, 13mm chuck, 2 speed settings.",
    isActive: true,
    shareCount: BigInt(189),
    createdAt: BigInt(0),
  },
  // Art Supplies
  {
    id: BigInt(1057),
    title: "Camlin 12 Shade Watercolour Cake Set",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    price: BigInt(349),
    affiliateLink: "https://amzn.to/camlinwatercolor",
    commissionPercent: BigInt(20),
    trendingTag: "🎨 Art",
    targetRegion: "Students, Artists",
    description: "Vivid colours, portable kit with brush, beginner friendly.",
    isActive: true,
    shareCount: BigInt(145),
    createdAt: BigInt(0),
  },
  // Footwear
  {
    id: BigInt(1058),
    title: "Bata Men Formal Leather Shoes (Black)",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    price: BigInt(1999),
    affiliateLink: "https://amzn.to/bataformals",
    commissionPercent: BigInt(14),
    trendingTag: "👞 Formal",
    targetRegion: "Working Men",
    description: "Genuine leather upper, cushioned insole, anti-slip sole.",
    isActive: true,
    shareCount: BigInt(234),
    createdAt: BigInt(0),
  },
  // Sunglasses
  {
    id: BigInt(1059),
    title: "Vincent Chase UV400 Polarized Sunglasses",
    imageUrl:
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&h=400&fit=crop",
    price: BigInt(999),
    affiliateLink: "https://amzn.to/vcsunglasses",
    commissionPercent: BigInt(22),
    trendingTag: "😎 Fashion",
    targetRegion: "Youth",
    description: "UV400, polarized lens, lightweight TR90 frame.",
    isActive: true,
    shareCount: BigInt(178),
    createdAt: BigInt(0),
  },
  // Digital Vouchers
  {
    id: BigInt(1060),
    title: "Amazon Pay Gift Card ₹500 (Instant Email)",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    price: BigInt(500),
    affiliateLink: "https://amzn.to/amazonpaygiftcard",
    commissionPercent: BigInt(3),
    trendingTag: "🎁 Gift Card",
    targetRegion: "Pan India",
    description: "Instant delivery on email, never expires, use anywhere.",
    isActive: true,
    shareCount: BigInt(456),
    createdAt: BigInt(0),
  },
];

const FILTERS = [
  "All",
  "Electronics",
  "Fashion",
  "Kitchen",
  "Fitness",
  "Books",
  "Home",
  "Gaming",
  "Beauty",
  "Travel",
] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_KEYWORDS: Record<Filter, string[]> = {
  All: [],
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
  ],
  Fashion: [
    "shoes",
    "t-shirt",
    "backpack",
    "shorts",
    "luggage",
    "sunglasses",
    "formal",
    "sneakers",
  ],
  Kitchen: ["mixer", "grinder", "kettle", "air fryer", "cooker"],
  Fitness: ["resistance", "yoga", "skipping", "protein", "gym", "sports"],
  Books: ["book", "habits", "rich dad"],
  Home: ["pillow", "storage", "fan", "heater", "mattress", "detergent", "led"],
  Gaming: ["gaming", "mouse", "headset"],
  Beauty: ["toner", "face wash", "hair dryer", "mamaearth"],
  Travel: ["trolley", "luggage", "car", "mount"],
};

function formatINR(val: bigint | number) {
  return Number(val).toLocaleString("en-IN");
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const trackShare = useTrackShare();
  const [imgError, setImgError] = useState(false);

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
            <TrendingUp size={9} />
            {deal.trendingTag}
          </div>
        )}
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
            tagLower.includes(kw),
        );
      }

      return matchesSearch && matchesFilter;
    });
  }, [allDeals, search, activeFilter]);

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
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              data-ocid="deals.filter.tab"
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
            {/* Info banner */}
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
                  {allDeals.length} Sample Deals — Admin real affiliate deals
                  add kar sakta hai.
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
