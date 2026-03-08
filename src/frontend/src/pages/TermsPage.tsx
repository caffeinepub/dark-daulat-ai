import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    icon: "👤",
    titleHi: "Patrta (Eligibility)",
    titleEn: "Eligibility",
    items: [
      {
        hi: "Is platform ka use karne ke liye aapki umar 18 saal ya usse zyada honi chahiye",
        en: "You must be 18 years of age or older to use this platform",
      },
      {
        hi: "Aapko India ka niwasi hona chahiye (Indian resident)",
        en: "You must be a resident of India",
      },
      {
        hi: "Ek vyakti sirf ek hi account bana sakta hai — multiple accounts allowed nahi hain",
        en: "Each individual may register only one account — multiple accounts are strictly prohibited",
      },
      {
        hi: "Valid email address aur mobile number zaroori hai registration ke liye",
        en: "A valid email address and mobile number are required for registration",
      },
    ],
  },
  {
    icon: "📜",
    titleHi: "Platform ke Niyam",
    titleEn: "Platform Rules",
    items: [
      {
        hi: "Fraud ya fake purchases bilkul allowed nahi — iska pata chalne par account suspend kiya jaayega",
        en: "Fraud or fake purchase claims are strictly prohibited — accounts found violating this will be suspended",
      },
      {
        hi: "Spam sharing — ek hi link ko baar baar share karke commission lena allowed nahi",
        en: "Spam sharing — repeatedly sharing the same link to claim multiple commissions is not allowed",
      },
      {
        hi: "Self-referral — apna khud ka referral code apne kisi doosre account mein use karna prohibited hai",
        en: "Self-referral — using your own referral code in another account you control is strictly prohibited",
      },
      {
        hi: "Platform ki security ya other users ke accounts se chhekhaad karna illegal hai",
        en: "Attempting to compromise platform security or tamper with other users' accounts is illegal and will result in permanent ban",
      },
      {
        hi: "Admin ke decisions final hain — platform rules par unka faisla maanana hoga",
        en: "Admin decisions are final — compliance with admin rulings regarding platform rules is mandatory",
      },
    ],
  },
  {
    icon: "💸",
    titleHi: "Withdrawal ke Niyam",
    titleEn: "Withdrawal Terms",
    items: [
      {
        hi: "Minimum withdrawal amount: ₹200",
        en: "Minimum withdrawal amount: ₹200",
      },
      {
        hi: "Withdrawal ke liye KYC (Aadhaar ya PAN) complete aur approved hona zaroori hai",
        en: "KYC verification (Aadhaar or PAN) must be completed and approved before any withdrawal",
      },
      {
        hi: "Har withdrawal par 2% platform fee kati jaayegi",
        en: "A 2% platform fee will be deducted from every withdrawal",
      },
      {
        hi: "Processing time: 3-7 business days (UPI ya bank transfer)",
        en: "Processing time: 3-7 business days via UPI or bank transfer",
      },
      {
        hi: "Fraudulent claims ya violation hone par withdrawal reject ya hold kiya ja sakta hai",
        en: "Withdrawals may be rejected or put on hold if fraudulent activity or rule violations are detected",
      },
    ],
  },
  {
    icon: "🤝",
    titleHi: "Commission aur Kamayi",
    titleEn: "Commission and Earnings",
    items: [
      {
        hi: "Commission rates platform pe dikhaye gaye rates ke hisaab se hoti hain aur change ho sakti hain",
        en: "Commission rates are as displayed on the platform and are subject to change",
      },
      {
        hi: "Affiliate commission sirf valid purchases par milti hai — fake ya reversed transactions par nahi",
        en: "Affiliate commission is paid only on valid purchases — not on fake or reversed transactions",
      },
      {
        hi: "Purchase verify karne ke liye screenshot ya proof submit karna zaroori hai",
        en: "Screenshot or proof of purchase must be submitted for commission verification",
      },
      {
        hi: "Daily maximum claim limit: ₹10,000 per user",
        en: "Daily maximum claim limit: ₹10,000 per user",
      },
      {
        hi: "Platform commission split: User ko 2%, Admin pool ko 3% (total 5% of claimed amount)",
        en: "Platform commission split: User receives 2%, Admin pool receives 3% (total 5% of claimed purchase amount)",
      },
    ],
  },
  {
    icon: "🚫",
    titleHi: "Prohibited Activities",
    titleEn: "Prohibited Activities",
    items: [
      {
        hi: "Bot ya automated tools se fake activity generate karna",
        en: "Generating fake activity using bots or automated tools",
      },
      {
        hi: "False purchase amounts claim karna",
        en: "Claiming false or inflated purchase amounts",
      },
      {
        hi: "Platform ka intellectual property copy ya misuse karna",
        en: "Copying or misusing the platform's intellectual property",
      },
      {
        hi: "Doosre users ko mislead karna ya unke accounts hack karne ki koshish karna",
        en: "Misleading other users or attempting to access their accounts",
      },
      {
        hi: "Platform ke against defamatory ya false content publish karna",
        en: "Publishing defamatory or false content against the platform",
      },
    ],
  },
  {
    icon: "⚖️",
    titleHi: "Account Termination",
    titleEn: "Account Termination",
    items: [
      {
        hi: "Admin kisi bhi account ko terminate kar sakta hai agar platform rules ka ullanghan hota hai",
        en: "Admin reserves the right to terminate any account that violates platform rules",
      },
      {
        hi: "Suspended accounts ke pending earnings hold ki ja sakti hain investigation ke dauran",
        en: "Pending earnings of suspended accounts may be held during investigation",
      },
      {
        hi: "User apna account khud bhi band kar sakta hai (support@darkdaulatai.com par email se)",
        en: "Users may self-terminate their account by emailing support@darkdaulatai.com",
      },
    ],
  },
  {
    icon: "🇮🇳",
    titleHi: "Kanoon (Governing Law)",
    titleEn: "Governing Law",
    items: [
      {
        hi: "Yeh platform Indian law ke under operate karta hai — Income Tax Act, IT Act 2000, aur related regulations ke anusaar",
        en: "This platform operates under Indian law — in accordance with the Income Tax Act, IT Act 2000, and related regulations",
      },
      {
        hi: "Koi bhi vivad (dispute) Indian courts mein suna jaayega",
        en: "Any disputes shall be subject to the jurisdiction of Indian courts",
      },
      {
        hi: "Affiliate earnings pe applicable taxes ka zimma user ka apna hai",
        en: "Users are solely responsible for paying applicable taxes on their affiliate earnings",
      },
    ],
  },
];

export default function TermsPage() {
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
            data-ocid="terms.back_button"
            className="p-2 rounded-xl transition-colors"
            style={{
              background: "oklch(0.80 0.13 85 / 0.1)",
              border: "1px solid oklch(0.80 0.13 85 / 0.3)",
            }}
          >
            <ArrowLeft size={18} style={{ color: "oklch(0.80 0.13 85)" }} />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={22} style={{ color: "oklch(0.80 0.13 85)" }} />
            <h1 className="text-xl font-bold gold-text-gradient">
              Terms of Service
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
              📜
            </div>
            <div>
              <h2
                className="font-bold text-base mb-1"
                style={{ color: "oklch(0.90 0.16 85)" }}
              >
                Terms of Service — Dark Daulat AI
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.72 0.05 85)" }}
              >
                Is platform ka use karke aap in terms ko accept karte hain.
                Kripya inhe dhyan se padhein.
              </p>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "oklch(0.55 0.03 85)" }}
              >
                By using this platform, you agree to these terms. Please read
                them carefully before proceeding.
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
              18+ Only | India Residents
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
                    className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
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

        {/* Agreement box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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
            📌 Samjhauta (Agreement)
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.60 0.03 85)" }}
          >
            Is platform ka use karke aap sweekar karte hain ki aapne yeh Terms
            of Service padhi hain, samjhi hain, aur inse agree karte hain.
          </p>
          <p
            className="text-xs leading-relaxed mt-1"
            style={{ color: "oklch(0.50 0.02 85)" }}
          >
            By using this platform, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service.
          </p>
          <p
            className="text-xs mt-2 font-semibold"
            style={{ color: "oklch(0.65 0.08 85)" }}
          >
            Contact: support@darkdaulatai.com
          </p>
        </motion.div>

        {/* Policy links */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { label: "Disclaimer", to: "/disclaimer" },
            { label: "Privacy Policy", to: "/privacy" },
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
