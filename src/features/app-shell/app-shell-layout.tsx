"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Menu,
} from "lucide-react";
import { ToastContainer } from "@/lib/app-toast";
import { PageTransition } from "@/components/stock-pro/primitives";
import { routePath, type AppRouteId } from "@/lib/stock-pro-routes";
import { AppShellProvider, useAppShellSession, useAppShellUI } from "./app-shell-context";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { OnboardingModal } from "./onboarding-modal";
import { NetworkStatus } from "./network-status";
import { QuickActionsFAB } from "./quick-actions-fab";
import { ScrollToTop } from "./scroll-to-top";

function AppShellLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    activeRoute,
    handleLogout,
    pageTitle,
    isLoading,
  } = useAppShellSession();
  const {
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    globalSearch,
    setGlobalSearch,
    searchResults,
    onboardingModal,
  } = useAppShellUI();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stockpro-page dark:bg-background">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-stockpro-navy dark:bg-stockpro-signal">
            <Package className="h-8 w-8 text-white dark:text-stockpro-navy-night" />
          </div>
          <div className="h-4 w-32 mx-auto bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-stockpro-page dark:bg-background ${darkMode ? "dark" : ""}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeRoute={activeRoute}
        user={user}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <Header
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        setMobileOpen={setMobileMenuOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        onLogout={handleLogout}
        pageTitle={pageTitle}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        searchResults={searchResults}
      />

      {onboardingModal.isOpen && (
        <OnboardingModal
          user={user}
          onClose={() => {
            onboardingModal.close();
            localStorage.setItem("stockpro_onboarding_seen", "true");
          }}
        />
      )}

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
          }`}
      >
        <div className="p-4 pb-24 pt-4 lg:p-6 lg:pb-6">
          <AnimatePresence mode="wait">
            <PageTransition key={pathname ?? ""}>{children}</PageTransition>
          </AnimatePresence>
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-white px-2 dark:border-white/10 dark:bg-stockpro-rail lg:hidden"
        aria-label="Navigation mobile"
      >
        {(() => {
          const allMobileItems: {
            id: AppRouteId | "menu";
            icon: React.ComponentType<{ className?: string }>;
            label: string;
            roles: string[];
          }[] = [
              { id: "dashboard", icon: LayoutDashboard, label: "Accueil", roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock", "Comptable"] },
              { id: "pos", icon: ShoppingCart, label: "POS", roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
              { id: "produits", icon: Package, label: "Produits", roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
              { id: "clients", icon: Users, label: "Clients", roles: ["Super Admin", "Gérant", "Caissier"] },
              { id: "menu", icon: Menu, label: "Menu", roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock", "Comptable"] },
            ];
          const mobileItems = allMobileItems.filter((item) => item.roles.includes(user.role));
          return mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            if (item.id === "menu") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="relative flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors dark:text-muted-foreground"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="app-shell-tab-label text-muted-foreground">{item.label}</span>
                </button>
              );
            }
            const href = routePath(item.id as AppRouteId);
            return (
              <Link
                key={item.id}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors ${isActive
                  ? "text-stockpro-navy dark:text-stockpro-signal"
                  : "text-muted-foreground"
                  }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={`app-shell-tab-label ${isActive ? "text-stockpro-navy dark:text-stockpro-signal" : ""}`}>
                  {item.label}
                </span>
                {isActive && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-stockpro-navy dark:bg-stockpro-signal" />}
              </Link>
            );
          });
        })()}
      </nav>

      <ToastContainer />
      <NetworkStatus />
      <QuickActionsFAB
        userRole={user.role}
        onNavigate={(r) => router.push(routePath(r))}
        onToggleTheme={() => setDarkMode(!darkMode)}
        darkMode={darkMode}
      />
      <ScrollToTop />
    </div>
  );
}

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <AppShellLayoutInner>{children}</AppShellLayoutInner>
    </AppShellProvider>
  );
}
