import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGenerateOtp,
  useGetUser,
  useRegister,
  useVerifyOtp,
} from "../hooks/useQueries";

// ─── Shared logo component ────────────────────────────────────────────────────
function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20" };
  return (
    <div
      className={`${dims[size]} rounded-2xl flex items-center justify-center overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
        border: "2px solid oklch(0.78 0.12 85 / 0.4)",
        boxShadow: "0 0 24px oklch(0.78 0.12 85 / 0.2)",
      }}
    >
      <img
        src="/assets/generated/dark-daulat-logo-transparent.dim_512x512.png"
        className="w-full h-full object-contain"
        alt="Dark Daulat AI Logo"
      />
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    identity,
    isLoggingIn,
    isInitializing,
    isLoginError,
    loginError,
  } = useInternetIdentity();
  const {
    data: user,
    isLoading: userLoading,
    isFetched: userFetched,
    refetch: refetchUser,
  } = useGetUser();
  const registerMutation = useRegister();
  const generateOtpMutation = useGenerateOtp();
  const verifyOtpMutation = useVerifyOtp();

  // ── Registration form state ──
  const [showRegister, setShowRegister] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [showRawError, setShowRawError] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const registerShownRef = useRef(false);

  // ── OTP state ──
  type OtpStep = "form" | "otp";
  const [otpStep, setOtpStep] = useState<OtpStep>("form");
  const [otpCode, setOtpCode] = useState(""); // what user types
  const [generatedOtp, setGeneratedOtp] = useState(""); // returned from backend (demo)
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0); // countdown for resend

  // ── Countdown timer for OTP ──
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // If identity is already available (non-anonymous), we don't need the login button
  const isAlreadyLoggedIn =
    !!identity && !identity.getPrincipal().isAnonymous();

  // Is "already authenticated" error
  const isAlreadyAuthError =
    isLoginError &&
    (loginError?.message?.includes("already authenticated") ||
      loginError?.message?.includes("User is already authenticated"));

  // Show loading while initializing OR while identity confirmed but user query running
  const isCheckingUser = isAlreadyLoggedIn && (userLoading || !userFetched);

  // Core effect: when identity + user query are ready, decide what to show
  useEffect(() => {
    if (!isAlreadyLoggedIn) return;
    if (userLoading || !userFetched) return;
    if (registerShownRef.current && showRegister) return;

    if (user && typeof user === "object" && "name" in user) {
      navigate({ to: "/" });
    } else {
      registerShownRef.current = true;
      setShowRegister(true);
      setRegisterError("");
    }
  }, [
    isAlreadyLoggedIn,
    user,
    userLoading,
    userFetched,
    navigate,
    showRegister,
  ]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setRegisterError("");
    setOtpError("");

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

    setOtpLoading(true);
    try {
      const otp = await generateOtpMutation.mutateAsync({
        email: email.trim(),
        mobile: mobile.trim(),
      });
      setGeneratedOtp(otp);
      setOtpStep("otp");
      setOtpCode("");
      setOtpCountdown(600); // 10 minutes
      toast.success("OTP generate ho gaya! Neeche dikh raha hai.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`OTP generate karne mein error: ${msg.slice(0, 80)}`);
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Step 2: Verify OTP + Register ────────────────────────────────────────
  const handleVerifyAndRegister = async () => {
    setOtpError("");
    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpError("6-digit OTP daalo");
      return;
    }

    setOtpLoading(true);
    try {
      const isValid = await verifyOtpMutation.mutateAsync({
        email: email.trim(),
        mobile: mobile.trim(),
        code: otpCode.trim(),
      });

      if (!isValid) {
        setOtpError("OTP galat hai ya expire ho gaya. Dobara bhejein.");
        setOtpLoading(false);
        return;
      }

      // OTP valid → register now
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        referralCode: referralCode.trim() || null,
      });

      toast.success("Registration ho gayi! Welcome to Dark Daulat AI! 🎉");
      setTimeout(() => navigate({ to: "/" }), 500);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("already registered")) {
        toast.success("Aap already registered hain! Home pe ja rahe hain...");
        setTimeout(() => navigate({ to: "/" }), 500);
        return;
      }
      const displayMsg =
        errMsg.length > 200 ? `${errMsg.substring(0, 200)}...` : errMsg;
      setRegisterError(displayMsg);
      // Go back to form on non-OTP errors
      if (!errMsg.toLowerCase().includes("otp")) {
        setOtpStep("form");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setOtpError("");
    setOtpLoading(true);
    try {
      const otp = await generateOtpMutation.mutateAsync({
        email: email.trim(),
        mobile: mobile.trim(),
      });
      setGeneratedOtp(otp);
      setOtpCode("");
      setOtpCountdown(600);
      toast.success("Naya OTP generate ho gaya!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`OTP bhejne mein error: ${msg.slice(0, 80)}`);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLoginButtonClick = () => {
    if (isAlreadyLoggedIn) {
      if (user && typeof user === "object" && "name" in user) {
        navigate({ to: "/" });
      } else if (userFetched) {
        registerShownRef.current = true;
        setShowRegister(true);
      } else {
        refetchUser();
      }
      return;
    }
    login();
  };

  // ── Loading screens ───────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Logo size="md" />
          <Loader2
            className="animate-spin"
            size={28}
            style={{ color: "oklch(0.78 0.12 85)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isCheckingUser && !showRegister) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Logo size="md" />
          <Loader2
            className="animate-spin"
            size={28}
            style={{ color: "oklch(0.78 0.12 85)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
            Account check ho raha hai...
          </p>
        </div>
      </div>
    );
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

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
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 animate-pulse-gold overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
              border: "2px solid oklch(0.78 0.12 85 / 0.5)",
              boxShadow:
                "0 0 30px oklch(0.78 0.12 85 / 0.3), 0 0 60px oklch(0.78 0.12 85 / 0.1)",
            }}
          >
            <img
              src="/assets/generated/dark-daulat-logo-transparent.dim_512x512.png"
              className="w-20 h-20 object-contain"
              alt="Dark Daulat AI Logo"
            />
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

        {/* Main Card */}
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
          {/* ── Step 0: Login ─────────────────────────────────────────── */}
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
                    text: "Pehli baar login par naam, email, mobile + OTP verify karke account banao",
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
                onClick={handleLoginButtonClick}
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
                ) : isAlreadyLoggedIn ? (
                  <>
                    <Fingerprint size={18} className="mr-2" />
                    Dashboard Kholein
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} className="mr-2" />
                    Login / Register Karo
                  </>
                )}
              </Button>

              {isLoginError && !isAlreadyAuthError && (
                <p
                  data-ocid="login.error_state"
                  className="text-center text-xs rounded-lg px-3 py-2"
                  style={{
                    color: "oklch(0.70 0.20 25)",
                    background: "oklch(0.62 0.22 25 / 0.1)",
                    border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                  }}
                >
                  ⚠️ Login popup band ho gaya ya block hua. Browser mein popup
                  allow karo phir dobara "Login Karo" dabao.
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
                💡 Pehli baar? Login dabao — popup khulega, fingerprint ya PIN
                se verify karo, phir OTP verification ke saath account banao!
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ── Step 1: Registration Form ─────────────────────── */}
              {otpStep === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
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
                    <p
                      className="text-sm"
                      style={{ color: "oklch(0.52 0.01 85)" }}
                    >
                      Step 2: Apni details daalo, fir OTP verify karo
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
                          setMobile(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
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

                  {registerError && (
                    <div
                      data-ocid="login.register_error_state"
                      className="rounded-xl p-4 space-y-3"
                      style={{
                        background: "oklch(0.62 0.22 25 / 0.12)",
                        border: "1px solid oklch(0.62 0.22 25 / 0.4)",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base shrink-0">⚠️</span>
                        <div className="flex-1">
                          <p
                            className="text-sm font-semibold mb-0.5"
                            style={{ color: "oklch(0.75 0.22 25)" }}
                          >
                            Registration fail hui
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "oklch(0.68 0.18 25)" }}
                          >
                            {registerError}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRawError(!showRawError)}
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: "oklch(0.55 0.12 25)" }}
                      >
                        {showRawError ? (
                          <ChevronUp size={11} />
                        ) : (
                          <ChevronDown size={11} />
                        )}
                        {showRawError ? "Error chhupao" : "Poora error dekho"}
                      </button>
                      {showRawError && (
                        <p
                          className="text-[10px] p-2 rounded-lg font-mono break-all"
                          style={{
                            background: "oklch(0.08 0 0)",
                            color: "oklch(0.52 0.01 85)",
                            border: "1px solid oklch(0.18 0 0)",
                          }}
                        >
                          {registerError}
                        </p>
                      )}
                      <Button
                        type="button"
                        onClick={() => {
                          setRegisterError("");
                          setShowRawError(false);
                        }}
                        data-ocid="login.retry_button"
                        variant="outline"
                        className="w-full h-9 text-sm rounded-xl"
                        style={{
                          background: "oklch(0.14 0.01 85)",
                          border: "1px solid oklch(0.78 0.12 85 / 0.4)",
                          color: "oklch(0.86 0.14 85)",
                        }}
                      >
                        🔄 Dobara Try Karo
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleSendOtp}
                    disabled={otpLoading || generateOtpMutation.isPending}
                    data-ocid="login.send_otp_button"
                    className="w-full h-12 text-base font-semibold rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88), oklch(0.72 0.11 80))",
                      color: "oklch(0.08 0 0)",
                      border: "none",
                      boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.4)",
                    }}
                  >
                    {otpLoading || generateOtpMutation.isPending ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        OTP bheja ja raha hai...
                      </>
                    ) : (
                      "OTP Bhejo & Verify Karo 📱"
                    )}
                  </Button>

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
                    🔐 Email aur Mobile verify karke account secure hoga
                  </p>
                </motion.div>
              )}

              {/* ── Step 2: OTP Verification ──────────────────────── */}
              {otpStep === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                      style={{
                        background: "oklch(0.55 0.14 250 / 0.15)",
                        border: "1px solid oklch(0.55 0.14 250 / 0.35)",
                        color: "oklch(0.72 0.14 250)",
                      }}
                    >
                      📱 OTP Verification
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      OTP Daalo
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: "oklch(0.52 0.01 85)" }}
                    >
                      Step 3: OTP verify karke account confirm karo
                    </p>
                  </div>

                  {/* OTP Display Card (demo mode) */}
                  {generatedOtp && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl p-4 text-center"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.14 0.04 85 / 0.8), oklch(0.18 0.06 85 / 0.6))",
                        border: "1px solid oklch(0.78 0.12 85 / 0.5)",
                        boxShadow: "0 4px 20px oklch(0.78 0.12 85 / 0.15)",
                      }}
                    >
                      <p
                        className="text-xs mb-2"
                        style={{ color: "oklch(0.62 0.01 85)" }}
                      >
                        🔐 Aapka OTP (Demo Mode):
                      </p>
                      <p
                        className="text-3xl font-bold font-mono tracking-[0.4em]"
                        style={{
                          color: "oklch(0.86 0.14 85)",
                          textShadow: "0 0 20px oklch(0.78 0.12 85 / 0.5)",
                        }}
                      >
                        {generatedOtp}
                      </p>
                      <p
                        className="text-[10px] mt-2"
                        style={{ color: "oklch(0.52 0.01 85)" }}
                      >
                        Yeh OTP 10 minutes mein expire ho jaayega
                      </p>
                      {otpCountdown > 0 && (
                        <p
                          className="text-xs mt-1 font-mono"
                          style={{ color: "oklch(0.72 0.14 250)" }}
                        >
                          ⏱ {formatCountdown(otpCountdown)} baaki hai
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* OTP Input */}
                  <div>
                    <Label
                      htmlFor="otp"
                      className="text-sm mb-1.5 block"
                      style={{ color: "oklch(0.82 0.05 85)" }}
                    >
                      6-Digit OTP Daalo *
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="______"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      data-ocid="login.otp_input"
                      className="h-14 rounded-xl text-center text-2xl font-bold font-mono tracking-[0.5em]"
                      style={{
                        background: "oklch(0.10 0 0)",
                        border: `1px solid ${otpError ? "oklch(0.62 0.22 25 / 0.7)" : "oklch(0.28 0.04 85 / 0.5)"}`,
                        color: "oklch(0.96 0.015 85)",
                        letterSpacing: "0.5em",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVerifyAndRegister();
                      }}
                    />
                    {otpError && (
                      <p
                        data-ocid="login.otp_error_state"
                        className="text-xs mt-1.5 flex items-center gap-1"
                        style={{ color: "oklch(0.68 0.22 25)" }}
                      >
                        ⚠️ {otpError}
                      </p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={handleVerifyAndRegister}
                    disabled={
                      otpLoading ||
                      verifyOtpMutation.isPending ||
                      registerMutation.isPending ||
                      otpCode.length !== 6
                    }
                    data-ocid="login.verify_otp_button"
                    className="w-full h-12 text-base font-semibold rounded-xl"
                    style={{
                      background:
                        otpCode.length === 6
                          ? "linear-gradient(135deg, oklch(0.72 0.11 80), oklch(0.88 0.15 88), oklch(0.72 0.11 80))"
                          : "oklch(0.20 0.02 85)",
                      color:
                        otpCode.length === 6
                          ? "oklch(0.08 0 0)"
                          : "oklch(0.45 0.01 85)",
                      border: "none",
                      boxShadow:
                        otpCode.length === 6
                          ? "0 4px 20px oklch(0.78 0.12 85 / 0.4)"
                          : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {otpLoading ||
                    verifyOtpMutation.isPending ||
                    registerMutation.isPending ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Verify ho raha hai...
                      </>
                    ) : (
                      "✅ OTP Verify Karo & Register"
                    )}
                  </Button>

                  {/* Resend + Back */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading || otpCountdown > 540} // allow resend after 1 min
                      data-ocid="login.resend_otp_button"
                      className="flex-1 h-10 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-40"
                      style={{
                        background: "oklch(0.14 0.01 85)",
                        border: "1px solid oklch(0.28 0.04 85 / 0.5)",
                        color: "oklch(0.82 0.05 85)",
                      }}
                    >
                      <RefreshCw size={12} />
                      Dobara OTP Bhejo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep("form");
                        setOtpCode("");
                        setOtpError("");
                      }}
                      data-ocid="login.back_to_form_button"
                      className="flex-1 h-10 text-xs font-semibold rounded-xl flex items-center justify-center transition-opacity"
                      style={{
                        background: "oklch(0.12 0 0)",
                        border: "1px solid oklch(0.22 0.01 85)",
                        color: "oklch(0.52 0.01 85)",
                      }}
                    >
                      ← Wapas Jaao
                    </button>
                  </div>

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
                    📧 OTP {email} aur 📱 {mobile} ke liye generate hua
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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
