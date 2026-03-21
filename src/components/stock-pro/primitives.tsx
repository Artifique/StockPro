"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Bell,
  TrendingUp,
  TrendingDown,
  Filter,
  Trash2,
} from "lucide-react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Button, Card } from "@/components/ui";
import { showToast } from "@/lib/app-toast";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 UI COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Skeleton Component for Loading States
const Skeleton: React.FC<{
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}> = ({
  className = "",
  variant = "text",
  width,
  height,
  animation = "pulse"
}) => {
    const variantStyles = {
      text: "rounded",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    const animationStyles = {
      pulse: "animate-pulse",
      wave: "skeleton-wave",
      none: "",
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;

    return (
      <div
        className={`bg-muted ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
        style={style}
      />
    );
  };

// Skeleton Card for Dashboard Loading
const _SkeletonCard: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={100} height={16} />
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        <Skeleton width="60%" height={32} className="mb-2" />
        <Skeleton width="40%" height={14} />
      </Card>
    ))}
  </div>
);

// Skeleton Table for Data Tables
const _SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <Card className="overflow-hidden">
    <div className="p-4 border-b border-border">
      <Skeleton width={150} height={20} />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton width={i === 0 ? 120 : 80} height={14} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-4">
                  <Skeleton
                    width={colIndex === 0 ? 140 : colIndex === cols - 1 ? 60 : 80}
                    height={14}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);


// Page Transition Wrapper
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Stagger Children Animation Container
const _StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: delay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Stagger Item
const _StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Pulse Animation Component
const _PulseDot: React.FC<{
  color?: string;
  size?: "sm" | "md" | "lg";
}> = ({ color = "bg-stockpro-signal", size = "md" }) => {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full ${sizes[size]} ${color}`}></span>
    </span>
  );
};

// Empty State Component
const _EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className = "" }) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    {icon && (
      <div className="mb-4 p-4 rounded-full bg-muted/50">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
    )}
    {action}
  </div>
);

// Notification Panel Component
export const NotificationPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Stock critique", message: "Thé Vert 250g - Stock: 5 unités", time: "Il y a 5 min", type: "warning", read: false },
    { id: 2, title: "Nouvelle vente", message: "Vente de 45 000 FCFA par Youssef", time: "Il y a 15 min", type: "success", read: false },
    { id: 3, title: "Rupture de stock", message: "Café Torréfié 500g en rupture", time: "Il y a 30 min", type: "danger", read: false },
    { id: 4, title: "Commande reçue", message: "CMD-001 reçue avec 15 produits", time: "Il y a 1h", type: "info", read: true },
    { id: 5, title: "Paiement reçu", message: "Facture FAC-2024-001 payée", time: "Il y a 2h", type: "success", read: true },
    { id: 6, title: "Nouveau client", message: "Mariam Cissé ajoutée à la base", time: "Il y a 3h", type: "info", read: true },
    { id: 7, title: "Prix mis à jour", message: "Smartphone Android: 110 000 FCFA", time: "Hier", type: "info", read: true },
  ]);

  const typeStyles = {
    warning:
      "bg-stockpro-stock-low-bg text-stockpro-stock-low-fg dark:bg-stockpro-stock-low-fg/15 dark:text-stockpro-stock-low-fg",
    success:
      "bg-stockpro-stock-ok-bg text-stockpro-stock-ok-fg dark:bg-stockpro-stock-ok-fg/15 dark:text-stockpro-stock-ok-fg",
    danger:
      "bg-stockpro-stock-error-bg text-stockpro-stock-error-fg dark:bg-stockpro-stock-error-fg/15 dark:text-stockpro-stock-error-fg",
    info: "bg-stockpro-navy/10 text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal",
  };

  const typeIcons = {
    warning: <AlertTriangle className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    danger: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast("Toutes les notifications marquées comme lues", "success");
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
    showToast("Notification supprimée", "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-stockpro-navy px-2 py-0.5 text-xs font-medium text-white dark:bg-stockpro-signal dark:text-stockpro-navy-night">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-stockpro-navy hover:text-stockpro-navy-hover dark:text-stockpro-signal dark:hover:text-white"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(notif.id)}
                    className={`group flex cursor-pointer gap-3 border-b border-border p-4 transition-colors hover:bg-muted/80 dark:border-border dark:hover:bg-muted/50 ${!notif.read ? "bg-stockpro-navy/[0.06] dark:bg-stockpro-signal/10" : ""}`}
                  >
                    <div className={`p-2 rounded-lg ${typeStyles[notif.type]}`}>
                      {typeIcons[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium text-sm ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <span className="h-2 w-2 rounded-full bg-stockpro-navy dark:bg-stockpro-signal" />
                          )}
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity"
                            title="Supprimer"
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.time}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/50 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:text-foreground"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setNotifications([]);
                  showToast("Toutes les notifications effacées", "success");
                }}
                className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-stockpro-stock-error-fg transition-colors hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
              >
                Effacer tout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Quick Stats Widget
const _StatCard: React.FC<{
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "neutral";
  hint?: string;
  sparklineData?: number[];
  onClick?: () => void;
  animate?: boolean;
}> = ({ label, value, change, icon, color, trend, hint, sparklineData, onClick, animate = true }) => {
  const isClickable = !!onClick;

  const content = (
    <Card
      padding="sm"
      className={isClickable ? "cursor-pointer hover:border-stockpro-navy/35 dark:hover:border-stockpro-signal/40" : ""}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {hint && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {hint}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {(change !== undefined || trend) && (
            <div className={`mt-1 flex items-center text-sm ${(trend === "up" || (change !== undefined && change >= 0)) ? "text-stockpro-stock-ok-fg" :
              (trend === "down" || (change !== undefined && change < 0)) ? "text-stockpro-stock-error-fg" : "text-muted-foreground"
              }`}>
              {(trend === "up" || (change !== undefined && change >= 0)) ? <TrendingUp className="w-3 h-3 mr-1" /> :
                (trend === "down" || (change !== undefined && change < 0)) ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
              {change !== undefined && `${change >= 0 ? "+" : ""}${change}%`}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>

      {sparklineData && (
        <div className="mt-4 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={sparklineData.map((v, i) => ({ value: v, index: i }))}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={trend === "down" ? "#d93f3f" : "#1a2b6d"}
                fill={trend === "down" ? "rgba(217, 63, 63, 0.1)" : "rgba(26, 43, 109, 0.1)"}
                strokeWidth={2}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );

  if (animate) {
    return (
      <motion.div
        whileHover={isClickable ? { scale: 1.02, y: -2 } : { scale: 1.01 }}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

const _StatGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {children}
  </div>
);

// Floating Action Button
const _FloatingActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  variant?: "primary" | "secondary";
}> = ({ onClick, icon, label, variant = "primary" }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors ${variant === "primary"
      ? "bg-stockpro-navy text-white hover:bg-stockpro-navy-hover dark:bg-stockpro-signal dark:text-stockpro-navy-night dark:hover:brightness-110"
      : "bg-card text-foreground border border-border hover:bg-muted"
      }`}
  >
    {icon}
    {label && <span className="hidden sm:inline font-medium">{label}</span>}
  </motion.button>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 ADVANCED SEARCH FILTER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const _AdvancedSearchFilter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: {
    id: string;
    label: string;
    type: "text" | "select" | "range" | "date";
    options?: { value: string; label: string }[];
    value: string | { min: string; max: string };
    placeholder?: string;
  }[];
  onFilterChange: (id: string, value: string | { min: string; max: string }) => void;
  onReset: () => void;
  onApply: () => void;
}> = ({ isOpen, onClose, filters, onFilterChange, onReset, onApply }) => {
  const activeFiltersCount = filters.filter((f) => {
    if (typeof f.value === "string") return f.value !== "";
    return f.value.min !== "" || f.value.max !== "";
  }).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <Card className="mb-4" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-stockpro-navy dark:text-stockpro-signal" />
              <h3 className="font-semibold text-foreground">
                Filtres avancés
              </h3>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-stockpro-navy/10 px-2 py-0.5 text-xs font-medium text-stockpro-navy dark:bg-stockpro-signal/15 dark:text-stockpro-signal">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Fermer les filtres"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {filter.label}
                </label>
                {filter.type === "text" && (
                  <input
                    type="text"
                    value={filter.value as string}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
                    aria-label={filter.label}
                  />
                )}
                {filter.type === "select" && (
                  <select
                    value={filter.value as string}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
                    aria-label={filter.label}
                  >
                    <option value="">{filter.placeholder || "Sélectionner"}</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === "range" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={(filter.value as { min: string; max: string }).min}
                      onChange={(e) => onFilterChange(filter.id, { ...(filter.value as { min: string; max: string }), min: e.target.value })}
                      placeholder="Min"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
                      aria-label={`${filter.label} minimum`}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      value={(filter.value as { min: string; max: string }).max}
                      onChange={(e) => onFilterChange(filter.id, { ...(filter.value as { min: string; max: string }), max: e.target.value })}
                      placeholder="Max"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
                      aria-label={`${filter.label} maximum`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
            <Button variant="ghost" onClick={onReset}>
              Réinitialiser
            </Button>
            <Button onClick={() => { onApply(); onClose(); }}>
              Appliquer les filtres
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// Active Filter Tags Component
const _ActiveFilterTags: React.FC<{
  filters: { id: string; label: string; value: string | { min: string; max: string } }[];
  onRemove: (id: string) => void;
}> = ({ filters, onRemove }) => {
  const activeFilters = filters.filter((f) => {
    if (typeof f.value === "string") return f.value !== "";
    return f.value.min !== "" || f.value.max !== "";
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <motion.span
          key={filter.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stockpro-navy/10 dark:bg-stockpro-signal/12 text-stockpro-navy dark:text-stockpro-signal text-sm"
        >
          <span>{filter.label}: </span>
          <span className="font-medium">
            {typeof filter.value === "string"
              ? filter.value
              : `${filter.value.min || "∞"} - ${filter.value.max || "∞"}`}
          </span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-stockpro-navy/15 dark:hover:bg-stockpro-signal/20"
            aria-label={`Supprimer le filtre ${filter.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </motion.span>
      ))}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ♿ ACCESSIBILITY COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Skip Link for Keyboard Navigation
const _SkipLink: React.FC<{ targetId: string }> = ({ targetId }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-stockpro-navy focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
  >
    Aller au contenu principal
  </a>
);

// Screen Reader Only Text
const _VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Live Region for Announcements
const _LiveRegion: React.FC<{
  children: React.ReactNode;
  ariaLive?: "polite" | "assertive" | "off";
}> = ({ children, ariaLive = "polite" }) => (
  <div aria-live={ariaLive} aria-atomic="true" className="sr-only">
    {children}
  </div>
);

// Alert Component
export const Alert: React.FC<{
  children: React.ReactNode;
  variant?: "info" | "warning" | "danger" | "success";
  onDismiss?: () => void;
  className?: string;
}> = ({ children, variant = "info", onDismiss, className = "" }) => {
  const variants = {
    info: "border border-stockpro-navy/20 bg-stockpro-navy/5 text-stockpro-navy dark:border-stockpro-signal/30 dark:bg-stockpro-signal/8 dark:text-stockpro-signal",
    warning:
      "bg-stockpro-stock-low-bg border-stockpro-stock-low-fg/30 text-stockpro-stock-low-fg dark:bg-stockpro-stock-low-fg/10 dark:border-stockpro-stock-low-fg/40 dark:text-stockpro-stock-low-fg",
    danger:
      "bg-stockpro-stock-error-bg border-stockpro-stock-error-fg/30 text-stockpro-stock-error-fg dark:bg-stockpro-stock-error-fg/10 dark:border-stockpro-stock-error-fg/40 dark:text-stockpro-stock-error-fg",
    success:
      "bg-stockpro-stock-ok-bg border-stockpro-stock-ok-fg/30 text-stockpro-stock-ok-fg dark:bg-stockpro-stock-ok-fg/10 dark:border-stockpro-stock-ok-fg/40 dark:text-stockpro-stock-ok-fg",
  };

  const icons = {
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    danger: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
  };

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg animate-in slide-in-from-top duration-300 ${variants[variant]} ${className}`}>
      {icons[variant]}
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};


// Select Component
type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
} & Omit<React.ComponentPropsWithoutRef<"select">, "value" | "onChange" | "className" | "children"> & {
  className?: string;
};

export const Select: React.FC<SelectProps> = ({ value, onChange, options, placeholder = "Sélectionner", className = "", ...rest }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal focus:border-transparent transition-all duration-200 ${className}`}
      {...rest}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};


// Confirm Dialog Component
export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmer", cancelText = "Annuler", variant = "danger" }) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: { icon: <Trash2 className="w-6 h-6" />, iconBg: "bg-stockpro-stock-error-bg dark:bg-stockpro-stock-error-fg/12", iconColor: "text-stockpro-stock-error-fg", btnVariant: "danger" as const },
    warning: { icon: <AlertTriangle className="w-6 h-6" />, iconBg: "bg-stockpro-stock-low-bg dark:bg-stockpro-stock-low-fg/12", iconColor: "text-stockpro-stock-low-fg", btnVariant: "primary" as const },
    info: { icon: <Info className="w-6 h-6" />, iconBg: "bg-stockpro-navy/10 dark:bg-stockpro-signal/12", iconColor: "text-stockpro-navy dark:text-stockpro-signal", btnVariant: "primary" as const },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${style.iconBg} ${style.iconColor}`}>
              {style.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-muted/50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={style.btnVariant} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Avatar Component
export const Avatar: React.FC<{
  initials: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}> = ({ initials, color = "#1a2b6d", size = "md", className = "" }) => {
  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};