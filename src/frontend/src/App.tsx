import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
import BottomNav from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import CalculatorPage from "./pages/CalculatorPage";
import ChatPage from "./pages/ChatPage";
import DealsPage from "./pages/DealsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";

// ─── Root Layout ─────────────────────────────────────────────────────────────
function RootLayout() {
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

// ─── App Layout (with Bottom Nav) ────────────────────────────────────────────
function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-nav overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
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

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    homeRoute,
    dealsRoute,
    calculatorRoute,
    walletRoute,
    profileRoute,
    chatRoute,
  ]),
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App with Auth Guard ──────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    if (!isInitializing && !identity) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/admin") {
        window.location.href = "/login";
      }
    }
  }, [identity, isInitializing]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthGuard>
      <RouterProvider router={router} />
    </AuthGuard>
  );
}
