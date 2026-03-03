import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  Fingerprint,
  Info,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUser, useRegister } from "../hooks/useQueries";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, identity, isLoggingIn, isInitializing, isLoginError } =
    useInternetIdentity();
  const {
    data: user,
    isLoading: userLoading,
    isSuccess: userQueryDone,
  } = useGetUser();
  const registerMutation = useRegister();

  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // After auth, check if registered — handle both cases: fresh login and existing session
  useEffect(() => {
    if (!identity) return; // Not logged in yet, nothing to do
    if (userLoading) return; // Wait for user query to settle

    // Once query is done (isSuccess = true), decide what to show
    if (userQueryDone) {
      if (user) {
        // Existing registered user — go to home
        navigate({ to: "/" });
      } else {
        // user is null = not registered yet
        setShowRegister(true);
      }
    }
  }, [identity, user, userLoading, userQueryDone, navigate]);

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error("Naam daalna zaroori hai!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error("Sahi email address daalna zaroori hai!");
      return;
    }
    const mobileRegex = /^\d{10}$/;
    if (!mobile.trim() || !mobileRegex.test(mobile.trim())) {
      toast.error("10 digit ka sahi mobile number daalna zaroori hai!");
      return;
    }
    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        referralCode: referralCode.trim() || null,
      });
      toast.success("Registration ho gayi! Welcome to Dark Daulat AI 🎉");
      navigate({ to: "/" });
    } catch {
      toast.error("Registration fail hui. Dobara try karo.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="animate-spin"
            size={32}
            style={{ color: "oklch(0.78 0.12 85)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "oklch(0.06 0 0)" }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.78 0.12 85 / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, oklch(0.78 0.12 85 / 0.06) 0%, transparent 50%)",
        }}
      />
      {/* Geometric lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.78 0.12 85 / 0.5), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.78 0.12 85 / 0.3), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 animate-pulse-gold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
              border: "2px solid oklch(0.78 0.12 85 / 0.5)",
              boxShadow:
                "0 0 30px oklch(0.78 0.12 85 / 0.3), 0 0 60px oklch(0.78 0.12 85 / 0.1)",
            }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              ₹
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold gold-text-gradient mb-1"
          >
            Dark Daulat AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm"
            style={{ color: "oklch(0.52 0.01 85)" }}
          >
            Smart Affiliate Earning Platform
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl p-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.005 85), oklch(0.15 0.01 85))",
            border: "1px solid oklch(0.28 0.04 85 / 0.5)",
            boxShadow: "0 20px 60px oklch(0 0 0 / 0.6)",
          }}
        >
          {!showRegister ? (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Secure Login
                </h2>
                <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
                  Password ki zarurat nahi — sirf ek click!
                </p>
              </div>

              {/* How it works */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "oklch(0.78 0.12 85 / 0.06)",
                  border: "1px solid oklch(0.78 0.12 85 / 0.18)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={15} style={{ color: "oklch(0.78 0.12 85)" }} />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.86 0.14 85)" }}
                  >
                    Kaise kaam karta hai?
                  </p>
                </div>
                {[
                  {
                    icon: Lock,
                    text: "Aapke device fingerprint ya PIN se secure login",
                  },
                  {
                    icon: Sparkles,
                    text: "Password yaad karne ki zarurat nahi",
                  },
                  {
                    icon: Info,
                    text: "Pehli baar login par account automatically ban jaata hai",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <Icon
                      size={13}
                      className="shrink-0 mt-0.5"
                      style={{ color: "oklch(0.68 0.10 85)" }}
                    />
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "oklch(0.62 0.01 85)" }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="login.login_button"
                className="w-full h-12 text-base font-semibold rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88), oklch(0.72 0.11 80))",
                  color: "oklch(0.08 0 0)",
                  border: "none",
                  boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.4)",
                }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Login ho raha hai...
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} className="mr-2" />
                    Login / Register Karo
                  </>
                )}
              </Button>

              {/* Login error message */}
              {isLoginError && (
                <p
                  data-ocid="login.error_state"
                  className="text-center text-xs rounded-lg px-3 py-2"
                  style={{
                    color: "oklch(0.70 0.20 25)",
                    background: "oklch(0.62 0.22 25 / 0.1)",
                    border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                  }}
                >
                  ⚠️ Login fail hua. Dobara try karo ya browser popup allow karo.
                </p>
              )}

              <p
                className="text-center text-xs"
                style={{
                  color: "oklch(0.45 0.01 85)",
                  background: "oklch(0.78 0.12 85 / 0.05)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  border: "1px solid oklch(0.78 0.12 85 / 0.1)",
                }}
              >
                💡 Pehli baar? Login dabao — popup khulega, wahan fingerprint ya
                PIN se verify karo, automatically account ban jaega!
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{
                    background: "oklch(0.55 0.18 145 / 0.15)",
                    border: "1px solid oklch(0.55 0.18 145 / 0.35)",
                    color: "oklch(0.72 0.18 145)",
                  }}
                >
                  ✅ Device Verify Ho Gaya
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Naya Account Banao
                </h2>
                <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
                  Step 2: Apni details daalo
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm mb-1.5 block"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    Aapka Naam *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Jaise: Rahul Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="login.name_input"
                    className="h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                      color: "oklch(0.96 0.015 85)",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm mb-1.5 block"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="aapka@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="login.email_input"
                    className="h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                      color: "oklch(0.96 0.015 85)",
                    }}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="mobile"
                    className="text-sm mb-1.5 block"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    Mobile Number *
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    data-ocid="login.mobile_input"
                    className="h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                      color: "oklch(0.96 0.015 85)",
                    }}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="referral"
                    className="text-sm mb-1.5 block"
                    style={{ color: "oklch(0.82 0.05 85)" }}
                  >
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="referral"
                    placeholder="Kisi ne bheja ho to daalo"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    data-ocid="login.referral_input"
                    className="h-11 rounded-xl"
                    style={{
                      background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                      color: "oklch(0.96 0.015 85)",
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                data-ocid="login.register_button"
                className="w-full h-12 text-base font-semibold rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88), oklch(0.72 0.11 80))",
                  color: "oklch(0.08 0 0)",
                  border: "none",
                  boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.4)",
                }}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Register ho raha hai...
                  </>
                ) : (
                  "Register Karo & Shuru Karo 🚀"
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "oklch(0.35 0.01 85)" }}
        >
          © {new Date().getFullYear()} Dark Daulat AI. Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:opacity-80"
            style={{ color: "oklch(0.52 0.01 85)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
