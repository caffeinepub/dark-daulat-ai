import { Link, useRouterState } from "@tanstack/react-router";
import { Calculator, Home, Tag, User, Wallet } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { path: "/", label: "Home", icon: Home, ocid: "nav.home_button" },
  { path: "/deals", label: "AI Deals", icon: Tag, ocid: "nav.deals_button" },
  {
    path: "/calculator",
    label: "Calculator",
    icon: Calculator,
    ocid: "nav.calculator_button",
  },
  {
    path: "/wallet",
    label: "Wallet",
    icon: Wallet,
    ocid: "nav.wallet_button",
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
    ocid: "nav.profile_button",
  },
] as const;

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background:
          "linear-gradient(to top, oklch(0.08 0 0) 0%, oklch(0.10 0.005 85) 100%)",
        borderTop: "1px solid oklch(0.28 0.04 85 / 0.4)",
        backdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around h-[5.5rem] max-w-lg mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon, ocid }) => {
          const isActive = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              data-ocid={ocid}
              className="flex flex-col items-center gap-1.5 flex-1 py-2 group"
            >
              <motion.div
                className="relative flex items-center justify-center"
                whileTap={{ scale: 0.82 }}
                transition={{ duration: 0.15 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, oklch(0.78 0.12 85 / 0.25) 0%, transparent 70%)",
                      width: "54px",
                      height: "54px",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={28}
                  className="relative z-10 transition-colors duration-200"
                  style={{
                    color: isActive
                      ? "oklch(0.86 0.14 85)"
                      : "oklch(0.52 0.01 85)",
                    filter: isActive
                      ? "drop-shadow(0 0 8px oklch(0.78 0.12 85 / 0.7))"
                      : "none",
                  }}
                />
              </motion.div>
              <span
                className="text-xs font-medium transition-colors duration-200 leading-none"
                style={{
                  color: isActive
                    ? "oklch(0.86 0.14 85)"
                    : "oklch(0.52 0.01 85)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
