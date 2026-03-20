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

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeRoute: string;
  user: StockProUser;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}> = ({ collapsed, setCollapsed, activeRoute, user, mobileOpen, setMobileOpen }) => {
  const allMenuItems: { id: AppRouteId; label: string; icon: React.ComponentType<{ className?: string }>; roles: string[] }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock", "Comptable"] },
    { id: "pos", label: "Point de Vente", icon: ShoppingCart, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { id: "produits", label: "Produits", icon: Package, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { id: "stock", label: "Gestion Stock", icon: Boxes, roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { id: "clients", label: "Clients", icon: Users, roles: ["Super Admin", "Gérant", "Caissier"] },
    { id: "fournisseurs", label: "Fournisseurs", icon: Truck, roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { id: "achats", label: "Achats & Commandes", icon: ClipboardList, roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { id: "facturation", label: "Facturation", icon: FileText, roles: ["Super Admin", "Gérant", "Comptable"] },
    { id: "retours", label: "Retours & Échanges", icon: RefreshCw, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { id: "rapports", label: "Rapports", icon: BarChart3, roles: ["Super Admin", "Gérant", "Comptable"] },
    { id: "parametres", label: "Paramètres", icon: Settings, roles: ["Super Admin", "Gérant"] },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(user.role));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-700 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white flex-shrink-0">
          <Package className="w-6 h-6" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-slate-800 dark:text-white">StockPro</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manager v1.0</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          const href = routePath(item.id);

          return (
            <Link
              key={item.id}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 -ml-[3px] pl-[calc(0.75rem+1px)]"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all group relative ${collapsed
            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          type="button"
        >
          {collapsed ? (
            <>
              <ChevronRight className="w-5 h-5" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Agrandir
              </div>
            </>
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40 ${collapsed ? "w-[72px]" : "w-[260px]"
          }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-white dark:bg-slate-800 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
