import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ExternalLink, Info } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    icon: "💰",
    titleHi: "Kamayi ki Guarantee Nahi",
    titleEn: "No Earnings Guarantee",
    hi: "Is platform par dikhaye gaye kamayi ke aanksde sirf illustrative (udaharanarthak) hain. Aapki waastavik kamayi aapki mehnat, network, market conditions, aur doosre factors par depend karti hai. Koi bhi guaranteed income ka vaada nahi kiya jaata. Past performance future results ki guarantee nahi hai.",
    en: "All earning figures shown on this platform are illustrative only. Your actual earnings depend on your effort, network size, market conditions, and other variable factors. No guaranteed income is promised or implied. Past performance is not indicative of future results.",
  },
  {
    icon: "🔗",
    titleHi: "Affiliate Links ka Khulasa",
    titleEn: "Affiliate Link Disclosure",
    hi: "Dark Daulat AI ek affiliate marketing platform hai. Is app mein diye gaye product links affiliate links ho sakte hain — jab aap in links se khareedari karte hain, toh hume (admin/platform) ek commission milti hai. Yeh aapki khareedari ki keemat ko prabhavit nahi karta.",
    en: "Dark Daulat AI is an affiliate marketing platform. Product links on this app may be affiliate links — when you make a purchase through these links, we (admin/platform) may earn a commission at no extra cost to you. This does not affect the price you pay.",
  },
  {
    icon: "🚫",
    titleHi: "Investment Scheme Nahi",
    titleEn: "Not an Investment Scheme",
    hi: "Yeh platform koi investment scheme, MLM (Multi-Level Marketing), ya Ponzi scheme nahi hai. Yeh ek legitimate affiliate marketing aur product referral platform hai. Aapko koi paisa invest karne ki zarurat nahi hai. Platform ka use karना bilkul free hai.",
    en: "This platform is NOT an investment scheme, MLM (Multi-Level Marketing), or Ponzi scheme. It is a legitimate affiliate marketing and product referral platform. You are NOT required to invest any money. Using the platform is completely free.",
  },
  {
    icon: "🌐",
    titleHi: "Third-Party Links",
    titleEn: "Third-Party Links",
    hi: "Is platform par diye gaye links Amazon, Flipkart, AliExpress, Fiverr aur doosri third-party websites par le jaate hain. Hum in websites ke content, products, ya services ke liye zimmedaar nahi hain. Khareedari karte waqt unki apni terms & conditions padhein.",
    en: "Links on this platform lead to Amazon, Flipkart, AliExpress, Fiverr, and other third-party websites. We are not responsible for their content, products, or services. Please read their own terms and conditions when making purchases.",
  },
  {
    icon: "⚠️",
    titleHi: "Jokhim (Risk)",
    titleEn: "Risk Warning",
    hi: "Affiliate marketing mein success ki koi guarantee nahi hoti. Market conditions, platform changes, aur doosre factors aapki kamayi ko affect kar sakte hain. Wisely niraaya lijiye aur sirf woh samay aur energy lagayein jo aap afford kar sakte hain.",
    en: "There is no guarantee of success in affiliate marketing. Market conditions, platform changes, and other factors may affect your earnings. Make wise decisions and only invest the time and energy you can reasonably afford.",
  },
  {
    icon: "📋",
    titleHi: "Platform ki Zimmedari",
    titleEn: "Platform Liability",
    hi: "Dark Daulat AI sirf ek technology platform hai jo affiliate marketing facilitate karta hai. Hum kisi bhi product ki quality, delivery, ya khareedari ke baad ki problems ke liye zimmedaar nahi hain. Product-related issues ke liye seedha concerned e-commerce platform se contact karein.",
    en: "Dark Daulat AI is only a technology platform that facilitates affiliate marketing. We are not responsible for product quality, delivery, or post-purchase issues. For product-related concerns, contact the respective e-commerce platform directly.",
  },
];

export default function DisclaimerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4 shine-sweep"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.07 0 0) 0%, oklch(0.07 0 0 / 0.96) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.30 0.05 85 / 0.35)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/profile" })}
            data-ocid="disclaimer.back_button"
            className="p-2 rounded-xl transition-colors"
            style={{
              background: "oklch(0.80 0.13 85 / 0.1)",
              border: "1px solid oklch(0.80 0.13 85 / 0.3)",
            }}
          >
            <ArrowLeft size={18} style={{ color: "oklch(0.80 0.13 85)" }} />
          </button>
          <div className="flex items-center gap-2">
            <AlertTriangle size={22} style={{ color: "oklch(0.80 0.13 85)" }} />
            <h1 className="text-xl font-bold gold-text-gradient">Disclaimer</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 card-glow"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.9), oklch(0.18 0.06 85 / 0.7))",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.12 80), oklch(0.90 0.16 88))",
              }}
            >
              ⚠️
            </div>
            <div>
              <h2
                className="font-bold text-base mb-1"
                style={{ color: "oklch(0.90 0.16 85)" }}
              >
                Zaroori Soochna / Important Notice
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.72 0.05 85)" }}
              >
                Kripya is platform ka use karne se pehle yeh disclaimer dhyan se
                padhein. Please read this disclaimer carefully before using this
                platform.
              </p>
            </div>
          </div>
          <div
            className="mt-3 pt-3 text-xs"
            style={{
              borderTop: "1px solid oklch(0.80 0.13 85 / 0.2)",
              color: "oklch(0.55 0.05 85)",
            }}
          >
            Last Updated / Aakhri Update: March 2026 | Effective for all users
            of Dark Daulat AI
          </div>
        </motion.div>

        {/* Sections */}
        {sections.map((sec, i) => (
          <motion.div
            key={sec.titleEn}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 + 0.1 }}
            className="rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.005 85), oklch(0.15 0.01 85))",
              border: "1px solid oklch(0.26 0.04 85 / 0.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{sec.icon}</span>
              <div>
                <h3
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.90 0.16 85)" }}
                >
                  {sec.titleHi}
                </h3>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.60 0.08 85)" }}
                >
                  {sec.titleEn}
                </p>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-2 font-semibold"
              style={{ color: "oklch(0.82 0.04 85)" }}
            >
              {sec.hi}
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.58 0.02 85)" }}
            >
              {sec.en}
            </p>
          </motion.div>
        ))}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: "oklch(0.80 0.13 85 / 0.06)",
            border: "1px solid oklch(0.80 0.13 85 / 0.25)",
          }}
        >
          <Info
            size={18}
            style={{ color: "oklch(0.80 0.13 85)" }}
            className="shrink-0 mt-0.5"
          />
          <div>
            <p
              className="font-bold text-sm mb-1"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              Koi Sawaal? / Any Questions?
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.60 0.03 85)" }}
            >
              Koi bhi sawaal ke liye humse sampark karein:{" "}
              <span className="font-semibold text-gold">
                support@darkdaulatai.com
              </span>
              <br />
              For any queries, contact us at: support@darkdaulatai.com
            </p>
          </div>
        </motion.div>

        {/* Policy links */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
          ].map(({ label, to }) => (
            <button
              key={to}
              type="button"
              onClick={() => navigate({ to: to as "/" })}
              className="text-xs underline underline-offset-2 flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: "oklch(0.72 0.10 85)" }}
            >
              <ExternalLink size={11} />
              {label}
            </button>
          ))}
        </div>

        <p
          className="text-center text-[10px] pb-2"
          style={{ color: "oklch(0.30 0.01 85)" }}
        >
          © {new Date().getFullYear()} Dark Daulat AI. Built with ❤️ using{" "}
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
