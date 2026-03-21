"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  User,
  Key,
  LogOut,
  Package,
  Users,
  Truck,
} from "lucide-react";
import {
  MOCK_CLIENTS,
  MOCK_FOURNISSEURS,
  MOCK_PRODUCTS,
  type StockProUser,
} from "@/data/stock-mock";
import { formatCurrency } from "@/lib/format";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { NotificationPanel, Avatar } from "@/components/stock-pro/primitives";
import { routePath, type AppRouteId } from "@/lib/stock-pro-routes";

export const Header: React.FC<{
  user: StockProUser;
  sidebarCollapsed: boolean;
  setMobileOpen: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: string;
  setLanguage: (v: string) => void;
  onLogout: () => void;
  pageTitle: string;
  globalSearch?: string;
  setGlobalSearch?: (v: string) => void;
  searchResults?: { type: string; items: unknown[] }[];
}> = ({
  user,
  sidebarCollapsed,
  setMobileOpen,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  onLogout,
  pageTitle,
  globalSearch = "",
  setGlobalSearch,
  searchResults = [],
}) => {
  const router = useRouter();
  const notificationsPanel = useDisclosure();
  const userMenu = useDisclosure();
  const searchPanel = useDisclosure();

  const go = (id: AppRouteId) => {
    router.push(routePath(id));
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        notificationsPanel.close();
        userMenu.close();
        searchPanel.close();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [notificationsPanel.close, userMenu.close, searchPanel.close]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notifications-dropdown") && !target.closest(".notifications-button")) {
        notificationsPanel.close();
      }
      if (!target.closest(".user-menu-dropdown") && !target.closest(".user-menu-button")) {
        userMenu.close();
      }
      if (!target.closest(".search-dropdown") && !target.closest(".search-button")) {
        searchPanel.close();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [notificationsPanel.close, userMenu.close, searchPanel.close]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b border-border bg-white shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-stockpro-rail ${sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"
        } left-0`}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="app-shell-title hidden sm:block">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => searchPanel.toggle()}
            className="search-button rounded-lg p-2 text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted"
            title="Rechercher"
            type="button"
          >
            <Search className="w-5 h-5" />
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="hidden rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-muted-foreground sm:block"
          >
            <option value="fr">🇫🇷 FR</option>
            <option value="en">🇬🇧 EN</option>
            <option value="ar">🇸🇦 AR</option>
          </select>

          <button
            onClick={() => {
              setDarkMode(!darkMode);
              showToast(darkMode ? "Mode clair activé" : "Mode sombre activé", "info");
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted"
            title={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => notificationsPanel.toggle()}
              className="notifications-button relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/80 dark:hover:bg-muted"
            >
              <Bell className="w-5 h-5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-stockpro-stock-error-fg"
              />
            </button>
            <div className="notifications-dropdown">
              <NotificationPanel isOpen={notificationsPanel.isOpen} onClose={notificationsPanel.close} />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => userMenu.toggle()}
              className="user-menu-button flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted/80 dark:hover:bg-muted"
            >
              <Avatar initials={user.avatar} color={user.color} size="sm" />
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            {userMenu.isOpen && (
              <div className="user-menu-dropdown absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="border-b border-border px-4 py-3 dark:border-border">
                  <p className="app-shell-menu-heading">{user.nom}</p>
                  <p className="app-shell-menu-meta mt-0.5">{user.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      go("profil");
                      userMenu.close();
                    }}
                    className="app-shell-menu-item flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted/70 dark:hover:bg-muted/80"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    Mon profil
                  </button>
                  <button
                    onClick={() => {
                      go("profil");
                      userMenu.close();
                    }}
                    className="app-shell-menu-item flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted/70 dark:hover:bg-muted/80"
                  >
                    <Key className="h-4 w-4 shrink-0" />
                    Changer mot de passe
                  </button>
                  <hr className="my-2 border-border" />
                  <button
                    onClick={onLogout}
                    className="app-shell-menu-item flex w-full items-center gap-3 px-4 py-2 text-left font-medium text-stockpro-stock-error-fg hover:bg-muted/70 dark:hover:bg-muted/80"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {searchPanel.isOpen && (
        <div className="search-dropdown absolute inset-x-4 top-full z-50 mt-2 flex max-h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher produits, clients, fournisseurs..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch?.(e.target.value)}
              className="app-shell-control w-full rounded-lg border border-border bg-muted py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal dark:border-border dark:bg-background dark:text-white"
              autoFocus
            />
          </div>

          {globalSearch.trim() && (
            <div className="mt-4 flex-1 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="app-shell-menu-heading">Aucun résultat pour &quot;{globalSearch}&quot;</p>
                  <div className="app-shell-menu-meta mt-4">
                    <p className="mb-2 text-muted-foreground">Suggestions :</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Riz", "Huile", "Café", "Smartphone"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setGlobalSearch?.(suggestion)}
                          className="app-shell-control rounded-full bg-muted px-3 py-1 transition-colors hover:bg-muted/80 dark:hover:bg-muted/80"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    <p className="app-shell-caption mt-3 text-muted-foreground">
                      💡 Essayez de rechercher par nom, SKU, ou catégorie
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((group, idx) => (
                    <div key={idx}>
                      <h4 className="app-shell-overline mb-2">{group.type}</h4>
                      <div className="space-y-1">
                        {group.type === "Produits" && (group.items as typeof MOCK_PRODUCTS).map((item: (typeof MOCK_PRODUCTS)[0]) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              go("produits");
                              searchPanel.close();
                              setGlobalSearch?.("");
                            }}
                            className="app-shell-menu-item hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
                          >
                            <Package className="h-4 w-4 shrink-0 text-stockpro-navy dark:text-stockpro-signal" />
                            <div className="min-w-0">
                              <p className="app-shell-nav text-foreground">{item.nom}</p>
                              <p className="app-shell-caption text-muted-foreground">{item.sku} • {formatCurrency(item.prixVente)}</p>
                            </div>
                          </button>
                        ))}
                        {group.type === "Clients" && (group.items as typeof MOCK_CLIENTS).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              go("clients");
                              searchPanel.close();
                              setGlobalSearch?.("");
                            }}
                            className="app-shell-menu-item hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
                          >
                            <Users className="h-4 w-4 shrink-0 text-stockpro-signal" />
                            <div className="min-w-0">
                              <p className="app-shell-nav text-foreground">{item.nom}</p>
                              <p className="app-shell-caption text-muted-foreground">{item.email}</p>
                            </div>
                          </button>
                        ))}
                        {group.type === "Fournisseurs" && (group.items as typeof MOCK_FOURNISSEURS).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              go("fournisseurs");
                              searchPanel.close();
                              setGlobalSearch?.("");
                            }}
                            className="app-shell-menu-item hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
                          >
                            <Truck className="h-4 w-4 shrink-0 text-stockpro-stock-low-fg" />
                            <div className="min-w-0">
                              <p className="app-shell-nav text-foreground">{item.nom}</p>
                              <p className="app-shell-caption text-muted-foreground">{item.contact}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end border-t border-border pt-3 dark:border-border">
            <button
              type="button"
              onClick={() => {
                searchPanel.close();
                setGlobalSearch?.("");
              }}
              className="app-shell-caption font-medium text-stockpro-navy hover:text-stockpro-navy-hover dark:text-stockpro-signal dark:hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
