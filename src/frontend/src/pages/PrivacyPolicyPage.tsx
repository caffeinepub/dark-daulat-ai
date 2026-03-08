import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Shield } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    icon: "📋",
    titleHi: "Hum Kya Data Collect Karte Hain",
    titleEn: "What Data We Collect",
    items: [
      {
        hi: "Naam, email address, aur mobile number (registration ke waqt)",
        en: "Name, email address, and mobile number (at registration)",
      },
      {
        hi: "KYC documents: Aadhaar number ya PAN card number (withdrawal verification ke liye)",
        en: "KYC documents: Aadhaar number or PAN card number (for withdrawal verification)",
      },
      {
        hi: "Transaction history: purchases, commissions, withdrawals",
        en: "Transaction history: purchases, commissions, and withdrawal records",
      },
      {
        hi: "Platform usage data: shares, deals clicked, referral activity",
        en: "Platform usage data: shares, deals clicked, referral activity",
      },
      {
        hi: "Device identity (Internet Computer Principal ID — anonymous identifier)",
        en: "Device identity (Internet Computer Principal ID — an anonymous cryptographic identifier)",
      },
    ],
  },
  {
    icon: "🎯",
    titleHi: "Hum Data Kaise Use Karte Hain",
    titleEn: "How We Use Your Data",
    items: [
      {
        hi: "Platform ko operate karna aur aapka account manage karna",
        en: "To operate the platform and manage your account",
      },
      {
        hi: "Withdrawal requests process karna aur identity verify karna",
        en: "To process withdrawal requests and verify your identity",
      },
      {
        hi: "Commission aur referral earnings calculate karna",
        en: "To calculate commissions and referral earnings accurately",
      },
      {
        hi: "Fraud prevention aur platform security maintain karna",
        en: "To prevent fraud and maintain platform security",
      },
      {
        hi: "Important updates aur notifications bhejne ke liye",
        en: "To send important updates and platform notifications",
      },
    ],
  },
  {
    icon: "🔒",
    titleHi: "Data Security",
    titleEn: "Data Security",
    items: [
      {
        hi: "Aapka data Internet Computer blockchain par store hota hai — yeh highly secure aur decentralized hai",
        en: "Your data is stored on the Internet Computer blockchain — a highly secure, decentralized, tamper-proof storage system",
      },
      {
        hi: "KYC documents encrypted form mein store kiye jaate hain",
        en: "KYC documents are stored in encrypted form",
      },
      {
        hi: "Koi bhi unauthorized third party aapka data access nahi kar sakta",
        en: "No unauthorized third party can access your data",
      },
      {
        hi: "Internet Identity cryptographic login — koi password store nahi hota",
        en: "Internet Identity uses cryptographic authentication — no passwords are stored",
      },
    ],
  },
  {
    icon: "👥",
    titleHi: "Data Sharing",
    titleEn: "Data Sharing",
    items: [
      {
        hi: "Hum aapka personal data kisi bhi third party ko sell nahi karte",
        en: "We do not sell your personal data to any third parties",
      },
      {
        hi: "Affiliate platforms (Amazon, Flipkart) ke saath sirf transaction data share hota hai jo unke platform par hua",
        en: "Only transaction-relevant data is shared with affiliate platforms (Amazon, Flipkart) for commission tracking",
      },
      {
        hi: "Leaderboard par sirf naam aur aapka short referral code publicly dikhta hai",
        en: "Only your name and short referral code are publicly visible on the leaderboard",
      },
      {
        hi: "Legal requirement hone par government authorities ke saath data share kiya ja sakta hai",
        en: "Data may be shared with government authorities when legally required",
      },
    ],
  },
  {
    icon: "✅",
    titleHi: "Aapke Adhikar (Your Rights)",
    titleEn: "Your Rights",
    items: [
      {
        hi: "Access: Aap apna data kabhi bhi dekh sakte hain (Profile page se)",
        en: "Access: You can view your data at any time via the Profile page",
      },
      {
        hi: "Correction: Galat information ko correct karne ke liye humse contact karein",
        en: "Correction: Contact us to correct any incorrect information",
      },
      {
        hi: "Deletion: Account delete karne ke liye support@darkdaulatai.com par email karein",
        en: "Deletion: Email support@darkdaulatai.com to request account deletion",
      },
      {
        hi: "Portability: Aapke data ki copy request kar sakte hain",
        en: "Portability: You can request a copy of your stored data",
      },
    ],
  },
  {
    icon: "🍪",
    titleHi: "Cookies aur Local Storage",
    titleEn: "Cookies and Local Storage",
    items: [
      {
        hi: "Hum sirf zaruri session data store karte hain — marketing cookies use nahi karte",
        en: "We only store essential session data — no marketing or tracking cookies are used",
      },
      {
        hi: "Internet Identity ka session data aapke browser mein locally store hota hai",
        en: "Internet Identity session data is stored locally in your browser for seamless re-authentication",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            data-ocid="privacy.back_button"
            className="p-2 rounded-xl transition-colors"
            style={{
              background: "oklch(0.80 0.13 85 / 0.1)",
              border: "1px solid oklch(0.80 0.13 85 / 0.3)",
            }}
          >
            <ArrowLeft size={18} style={{ color: "oklch(0.80 0.13 85)" }} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={22} style={{ color: "oklch(0.80 0.13 85)" }} />
            <h1 className="text-xl font-bold gold-text-gradient">
              Privacy Policy
            </h1>
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
              🛡️
            </div>
            <div>
              <h2
                className="font-bold text-base mb-1"
                style={{ color: "oklch(0.90 0.16 85)" }}
              >
                Privacy Policy — Dark Daulat AI
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.72 0.05 85)" }}
              >
                Aapki privacy hamari sabse badi zimmedari hai. Yeh policy batati
                hai ki hum aapka data kaise collect, use, aur protect karte
                hain.
              </p>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "oklch(0.55 0.03 85)" }}
              >
                Your privacy is our top priority. This policy explains how we
                collect, use, and protect your data.
              </p>
            </div>
          </div>
          <div
            className="mt-3 pt-3 flex items-center justify-between"
            style={{
              borderTop: "1px solid oklch(0.80 0.13 85 / 0.2)",
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.65 0.08 85)" }}
            >
              📅 Effective: March 2026
            </span>
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 85)" }}>
              Governed by Indian Law
            </span>
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
            <ul className="space-y-2.5">
              {sec.items.map((item) => (
                <li key={item.en} className="flex items-start gap-2">
                  <span
                    className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.80 0.13 85)" }}
                  />
                  <div>
                    <p
                      className="text-sm leading-snug font-semibold"
                      style={{ color: "oklch(0.82 0.04 85)" }}
                    >
                      {item.hi}
                    </p>
                    <p
                      className="text-xs leading-snug mt-0.5"
                      style={{ color: "oklch(0.55 0.02 85)" }}
                    >
                      {item.en}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-4"
          style={{
            background: "oklch(0.80 0.13 85 / 0.06)",
            border: "1px solid oklch(0.80 0.13 85 / 0.25)",
          }}
        >
          <p
            className="font-bold text-sm mb-2"
            style={{ color: "oklch(0.86 0.14 85)" }}
          >
            📬 Data Officer / Privacy Contact
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.60 0.03 85)" }}
          >
            Privacy se related koi bhi sawaal ya request ke liye:
            <span className="block mt-1 font-semibold text-gold">
              support@darkdaulatai.com
            </span>
            <span className="block mt-1">
              For any privacy-related queries or data requests, contact us at:
              support@darkdaulatai.com
            </span>
            <span className="block mt-1">
              We will respond within 7 business days.
            </span>
          </p>
        </motion.div>

        {/* Policy links */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { label: "Disclaimer", to: "/disclaimer" },
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
