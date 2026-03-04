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
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUser, useRegister } from "../hooks/useQueries";

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

  const [showRegister, setShowRegister] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [showRawError, setShowRawError] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const registerShownRef = useRef(false); // Prevent re-triggering form show

  // If identity is already available (non-anonymous), we don't need the login button
  const isAlreadyLoggedIn =
    !!identity && !identity.getPrincipal().isAnonymous();

  // Is "already authenticated" error (happens when login() called while already logged in)
  const isAlreadyAuthError =
    isLoginError &&
    (loginError?.message?.includes("already authenticated") ||
      loginError?.message?.includes("User is already authenticated"));

  // Show loading while initializing OR while identity confirmed but user query running
  const isCheckingUser = isAlreadyLoggedIn && (userLoading || !userFetched);

  // Core effect: when identity + user query are ready, decide what to show
  useEffect(() => {
    if (!isAlreadyLoggedIn) return; // Not logged in yet, nothing to do
    if (userLoading || !userFetched) return; // Wait for user query to settle

    // If already shown register (prevent loop from re-renders)
    if (registerShownRef.current && showRegister) return;

    if (user && typeof user === "object" && "name" in user) {
      // Registered user → go home
      console.log("[LoginPage] User found, navigating to home");
      navigate({ to: "/" });
    } else {
      // Not registered → show registration form
      console.log("[LoginPage] No user found, showing register form");
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

  const handleRegister = async () => {
    console.log("[LoginPage] handleRegister called", {
      name,
      email,
      mobile,
      referralCode,
    });
    setRegisterError("");
    setShowRawError(false);

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
      console.log("[LoginPage] Calling registerMutation.mutateAsync...");
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        referralCode: referralCode.trim() || null,
      });
      console.log("[LoginPage] Registration success!");
      toast.success("Registration ho gayi! Welcome to Dark Daulat AI! 🎉");
      // Small delay to let backend propagate before navigating
      setTimeout(() => navigate({ to: "/" }), 500);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[LoginPage] Registration error:", errMsg);

      // Check if already registered
      if (errMsg.includes("already registered")) {
        toast.success("Aap already registered hain! Home pe ja rahe hain...");
        setTimeout(() => navigate({ to: "/" }), 500);
        return;
      }

      // Show prominent error message
      const displayMsg =
        errMsg.length > 200 ? `${errMsg.substring(0, 200)}...` : errMsg;
      setRegisterError(displayMsg);
    }
  };

  const handleLoginButtonClick = () => {
    console.log(
      "[LoginPage] Login button clicked, isAlreadyLoggedIn:",
      isAlreadyLoggedIn,
    );

    // CRITICAL: If already logged in, NEVER call login() — it causes "already authenticated" error
    if (isAlreadyLoggedIn) {
      if (user && typeof user === "object" && "name" in user) {
        navigate({ to: "/" });
      } else if (userFetched) {
        // User query done, not registered → show form
        registerShownRef.current = true;
        setShowRegister(true);
      } else {
        // Trigger user refetch
        refetchUser();
      }
      return;
    }

    // User is not logged in → open II popup
    login();
  };

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.06 0 0)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
              border: "2px solid oklch(0.78 0.12 85 / 0.4)",
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              ₹
            </span>
          </div>
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
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
              border: "2px solid oklch(0.78 0.12 85 / 0.4)",
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: "oklch(0.86 0.14 85)" }}
            >
              ₹
            </span>
          </div>
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
                    text: "Pehli baar login par naam, email, mobile bharkar account banao",
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

              {/* Real login errors only (not "already authenticated") */}
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
                💡 Pehli baar? Login dabao — popup khulega, wahan fingerprint ya
                PIN se verify karo, phir details bhar kar account banao!
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

                  {/* Expandable raw error detail */}
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

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setRegisterError("");
                        setShowRawError(false);
                      }}
                      data-ocid="login.retry_button"
                      variant="outline"
                      className="flex-1 h-9 text-sm rounded-xl"
                      style={{
                        background: "oklch(0.14 0.01 85)",
                        border: "1px solid oklch(0.78 0.12 85 / 0.4)",
                        color: "oklch(0.86 0.14 85)",
                      }}
                    >
                      🔄 Dobara Try Karo
                    </Button>
                  </div>
                </div>
              )}

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
                  "Register Karo & Shuru Karo"
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
