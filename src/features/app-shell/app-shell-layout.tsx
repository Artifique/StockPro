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
import { FloatingHelpButton } from "./floating-help-button";
import { QuickActionsFAB } from "./quick-actions-fab";
import { ScrollToTop } from "./scroll-to-top";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div className="h-4 w-32 mx-auto bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${darkMode ? "dark" : ""}`}>
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
        <div className="p-4 lg:p-6 pb-24 lg:pb-20">
          <AnimatePresence mode="wait">
            <PageTransition key={pathname ?? ""}>{children}</PageTransition>
          </AnimatePresence>
        </div>
      </main>

      <footer
        className={`fixed bottom-0 right-0 h-12 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 hidden lg:flex items-center justify-between px-6 text-sm text-slate-500 dark:text-slate-400 transition-all duration-300 z-20 ${sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"
          } left-0`}
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-500" />
          <span>StockPro Manager v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">© 2024 Tous droits réservés</span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Système actif
          </span>
        </div>
      </footer>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around z-30 px-2">
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
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors relative text-slate-500 dark:text-slate-400"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            }
            const href = routePath(item.id as AppRouteId);
            return (
              <Link
                key={item.id}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors relative ${isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && <span className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />}
              </Link>
            );
          });
        })()}
      </nav>

      <ToastContainer />
      <NetworkStatus />
      <FloatingHelpButton currentPage={activeRoute} />
      <QuickActionsFAB
        userRole={user.role}
        onNavigate={(r) => router.push(routePath(r))}
        onToggleTheme={() => setDarkMode(!darkMode)}
        darkMode={darkMode}
      />
      <ScrollToTop />
      <KeyboardShortcutsHelp />
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
