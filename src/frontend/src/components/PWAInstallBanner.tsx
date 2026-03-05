import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled || !showBanner || !installPrompt) return null;

  const handleInstall = async () => {
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  return (
    <div
      data-ocid="pwa.banner"
      className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl p-4 flex items-center gap-3 shadow-2xl"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.18 0.05 85))",
        border: "1px solid oklch(0.78 0.12 85 / 0.4)",
        boxShadow: "0 8px 32px oklch(0.78 0.12 85 / 0.25)",
      }}
    >
      {/* App Icon */}
      <div
        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold"
        style={{
          background: "oklch(0.78 0.12 85 / 0.2)",
          border: "1px solid oklch(0.78 0.12 85 / 0.3)",
          color: "oklch(0.86 0.14 85)",
        }}
      >
        ₹
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: "oklch(0.86 0.14 85)" }}
        >
          Dark Daulat AI Install Karo
        </p>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.62 0.04 85)" }}>
          Home screen pe add karo – bilkul app jaisa!
        </p>
      </div>

      {/* Install Button */}
      <button
        type="button"
        data-ocid="pwa.install_button"
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.78 0.12 85), oklch(0.68 0.16 55))",
          color: "oklch(0.08 0 0)",
        }}
      >
        <Download size={14} />
        Install
      </button>

      {/* Close */}
      <button
        type="button"
        data-ocid="pwa.dismiss_button"
        onClick={handleDismiss}
        className="p-1 rounded-lg flex-shrink-0"
        style={{ color: "oklch(0.52 0.02 85)" }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
