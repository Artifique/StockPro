"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
  Truck,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { type StockProUser } from "@/data/stock-mock";
import { routePath, type AppRouteId } from "@/lib/stock-pro-routes";

const navTooltip =
  "app-shell-tooltip pointer-events-none absolute left-full z-50 ml-2 -translate-x-0.5 whitespace-nowrap rounded-lg border border-border/90 bg-card px-2.5 py-1.5 opacity-0 shadow-lg shadow-stockpro-navy/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:border-stockpro-signal/25 dark:bg-stockpro-rail-elevated dark:text-sidebar-foreground dark:shadow-black/50";

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeRoute: string;
  user: StockProUser;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}> = ({ collapsed, setCollapsed, activeRoute, user, mobileOpen, setMobileOpen }) => {
  const allMenuItems: { id: AppRouteId; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; roles: string[] }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock", "Comptable"] },
    { id: "pos", label: "Point de Vente", icon: ShoppingCart, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { id: "produits", label: "Produits", icon: Package, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { id: "stock", label: "Stock", icon: Boxes, roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { id: "clients", label: "Clients", icon: Users, roles: ["Super Admin", "Gérant", "Caissier"] },
    { id: "fournisseurs", label: "Fournisseurs", icon: Truck, roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { id: "achats", label: "Achats & Commandes", icon: ClipboardList, roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { id: "facturation", label: "Facturation", icon: FileText, roles: ["Super Admin", "Gérant", "Comptable"] },
    { id: "retours", label: "Retours & Échanges", icon: RefreshCw, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { id: "rapports", label: "Rapports", icon: BarChart3, roles: ["Super Admin", "Gérant", "Comptable"] },
    { id: "parametres", label: "Paramètres", icon: Settings, roles: ["Super Admin", "Gérant"] },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(user.role));

  /* Clair : rail clair (fond page). Sombre : navy nuit #0F1A45, pas de dégradé fantôme. */
  const asideSurface =
    "flex h-full flex-col border-border/90 bg-gradient-to-b from-stockpro-page via-white to-stockpro-page/90 dark:border-white/10 dark:bg-stockpro-rail dark:[background-image:none]";

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      {/* En-tête logo — dark : fonds 100 % opaques (plus de transparence / blur qui laisse « voir à travers ») */}
      <div
        className={`relative isolate flex w-full shrink-0 items-center justify-center overflow-hidden border-b border-border/80 bg-white py-4 dark:border-stockpro-signal/20 dark:bg-stockpro-rail sm:py-5 ${collapsed ? "px-1 py-3" : "px-3"}`}
      >
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-stockpro-signal/50 to-transparent dark:via-stockpro-signal/40"
          aria-hidden
        />
        <div
          className={`flex min-w-0 items-center justify-center overflow-hidden rounded-xl bg-muted/60 ring-1 ring-border/80 dark:bg-stockpro-page dark:ring-stockpro-signal/30 dark:shadow-[inset_0_1px_0_0_rgba(109,193,58,0.12)] ${collapsed ? "mx-auto w-full max-w-[52px] px-1 py-1.5" : "w-full max-w-[min(100%,236px)] px-3 py-2.5"}`}
        >
          <img
            src="/logo-stockpro.png"
            alt="StockPro"
            width={280}
            height={112}
            decoding="async"
            className={
              collapsed
                ? "mx-auto h-8 max-h-8 w-auto max-w-[44px] object-contain object-center sm:h-9 sm:max-h-9 sm:max-w-[48px]"
                : "mx-auto h-12 w-auto max-w-full object-contain object-center sm:h-14 md:h-16"
            }
          />
        </div>
      </div>

      {/* Navigation — même teinte que le rail (pas de héritage d’un fond clair) */}
      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto bg-muted/40 px-2.5 py-4 dark:bg-stockpro-rail [scrollbar-color:rgba(109,193,58,0.35)_transparent] [scrollbar-width:thin]"
        aria-label="Navigation principale"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          const href = routePath(item.id);

          const base =
            "app-shell-nav group relative flex items-center rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stockpro-signal/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stockpro-rail";
          const inactive =
            "text-muted-foreground hover:bg-muted/90 hover:text-foreground dark:text-[#b4c4e0] dark:hover:bg-stockpro-signal/[0.14] dark:hover:text-stockpro-signal";
          const active =
            "bg-stockpro-navy text-white shadow-md shadow-stockpro-navy/25 dark:bg-stockpro-signal dark:text-stockpro-navy-night dark:shadow-stockpro-signal/25";
          const layout = collapsed
            ? "mx-auto h-11 w-11 shrink-0 justify-center p-0"
            : "min-h-[2.75rem] gap-3 px-3 py-2";

          return (
            <Link
              key={item.id}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`${base} ${layout} ${isActive ? active : inactive}`}
            >
              <Icon
                className={`app-shell-nav-icon ${isActive ? "text-white dark:text-stockpro-navy-night" : "text-muted-foreground group-hover:text-foreground dark:text-[#8fa3c4] dark:group-hover:text-stockpro-signal"}`}
                strokeWidth={isActive ? 2.25 : 2}
              />
              {!collapsed && (
                <span className="min-w-0 flex-1 truncate leading-snug text-inherit">{item.label}</span>
              )}
              {collapsed && <span className={navTooltip}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Réduire / agrandir */}
      <div className="hidden shrink-0 border-t border-border/80 bg-stockpro-page p-3 dark:border-stockpro-signal/20 dark:bg-stockpro-rail lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`app-shell-nav group relative flex w-full items-center justify-center gap-2 rounded-xl border border-transparent py-2.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stockpro-signal/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stockpro-rail ${collapsed
            ? "text-stockpro-navy hover:border-border/80 hover:bg-white hover:shadow-sm dark:text-stockpro-signal dark:hover:border-stockpro-signal/30 dark:hover:bg-stockpro-rail-elevated"
            : "text-muted-foreground hover:border-border/80 hover:bg-muted/80 hover:text-foreground dark:text-[#9eb0d0] dark:hover:border-stockpro-signal/25 dark:hover:bg-stockpro-signal/[0.12] dark:hover:text-[#dce4f5]"
            }`}
          title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          type="button"
        >
          {collapsed ? (
            <>
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
              <span className={navTooltip}>Agrandir le menu</span>
            </>
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0 opacity-70" strokeWidth={2} />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-full border-r transition-[width] duration-300 ease-out lg:flex ${asideSurface} ${collapsed ? "w-[72px]" : "w-[260px]"}`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stockpro-navy-night/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          />
          <aside
            className={`absolute left-0 top-0 h-full w-[min(100%,280px)] rounded-r-2xl border-r border-border/90 shadow-2xl shadow-stockpro-navy/20 dark:border-stockpro-signal/20 ${asideSurface}`}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
