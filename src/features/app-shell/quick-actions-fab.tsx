"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, Users, Sun, Moon, X, Plus } from "lucide-react";
import { useDisclosure } from "@/hooks/use-disclosure";
import { showToast } from "@/lib/app-toast";
import type { AppRouteId } from "@/lib/stock-pro-routes";

export const QuickActionsFAB: React.FC<{
  userRole: string;
  onNavigate: (route: AppRouteId) => void;
  onToggleTheme: () => void;
  darkMode: boolean;
}> = ({ userRole, onNavigate, onToggleTheme, darkMode }) => {
  const fabMenu = useDisclosure();
  const actions = [
    { icon: ShoppingCart, label: "Nouvelle vente", color: "bg-stockpro-signal", action: () => onNavigate("pos"), roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock"] },
    { icon: Package, label: "Ajouter produit", color: "bg-stockpro-navy", action: () => onNavigate("produits"), roles: ["Super Admin", "Gérant", "Responsable Stock"] },
    { icon: Users, label: "Nouveau client", color: "bg-stockpro-navy", action: () => onNavigate("clients"), roles: ["Super Admin", "Gérant", "Caissier"] },
    { icon: darkMode ? Sun : Moon, label: darkMode ? "Mode clair" : "Mode sombre", color: "bg-stockpro-navy-mid", action: onToggleTheme, roles: ["Super Admin", "Gérant", "Caissier", "Responsable Stock", "Comptable"] },
  ];
  const visible = actions.filter((a) => a.roles.includes(userRole));
  return (
    <div className="fixed bottom-20 left-4 lg:bottom-6 z-40 hidden lg:block">
      <AnimatePresence>
        {fabMenu.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-14 left-0 space-y-2">
            {visible.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    action.action();
                    fabMenu.close();
                    showToast(action.label, "info");
                  }}
                  className={`flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg text-white text-sm font-medium hover:scale-105 transition-transform ${action.color}`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => fabMenu.toggle()}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${fabMenu.isOpen ? "bg-stockpro-navy-night text-white" : "bg-stockpro-signal text-stockpro-navy-night hover:brightness-95"}`}
      >
        {fabMenu.isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};
