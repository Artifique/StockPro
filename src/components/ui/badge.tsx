"use client";

import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    outline: "border border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
