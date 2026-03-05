import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import BottomNav from "./components/BottomNav";
import PWAInstallBanner from "./components/PWAInstallBanner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import CalculatorPage from "./pages/CalculatorPage";
import ChatPage from "./pages/ChatPage";
import DealsPage from "./pages/DealsPage";
import HomePage from "./pages/HomePage";
import KycPage from "./pages/KycPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SharePage from "./pages/SharePage";
import WalletPage from "./pages/WalletPage";

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.06 0 0)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.03 85), oklch(0.20 0.05 85))",
            border: "2px solid oklch(0.78 0.12 85 / 0.4)",
            boxShadow: "0 0 24px oklch(0.78 0.12 85 / 0.2)",
          }}
        >
          <img
            src="/assets/generated/dark-daulat-logo-icon.dim_512x512.png"
            className="w-14 h-14 object-contain rounded-xl"
            alt="Dark Daulat AI Logo"
          />
        </div>
        <Loader2
          className="animate-spin"
          size={28}
          style={{ color: "oklch(0.78 0.12 85)" }}
        />
        <p className="text-sm" style={{ color: "oklch(0.52 0.01 85)" }}>
          Dark Daulat AI...
        </p>
      </div>
    </div>
  );
}

// ─── Root Layout ─────────────────────────────────────────────────────────────
function RootLayout() {
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.01 85)",
            border: "1px solid oklch(0.28 0.04 85 / 0.5)",
            color: "oklch(0.96 0.015 85)",
          },
        }}
      />
    </div>
  );
}

// ─── App Layout (with Bottom Nav + Auth Guard) ────────────────────────────────
function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  // Guard: redirect to login if not authenticated (after initializing)
  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: "/login" });
    }
  }, [identity, isInitializing, navigate]);

  // Show nothing while redirecting to avoid flash
  if (!isInitializing && !identity) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-nav overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <PWAInstallBanner />
    </div>
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: HomePage,
});

const dealsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/deals",
  component: DealsPage,
});

const calculatorRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/calculator",
  component: CalculatorPage,
});

const shareRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/share",
  component: SharePage,
});

const walletRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/wallet",
  component: WalletPage,
});

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const chatRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/chat",
  component: ChatPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const kycRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/kyc",
  component: KycPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    homeRoute,
    dealsRoute,
    calculatorRoute,
    shareRoute,
    walletRoute,
    profileRoute,
    chatRoute,
    kycRoute,
  ]),
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
