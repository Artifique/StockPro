"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    loading = false,
    type = "button",
    ...rest
  } = props;

  const variantClass =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      : variant === "secondary"
        ? "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        : variant === "ghost"
          ? "text-slate-600 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-700"
          : variant === "danger"
            ? "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500"
            : variant === "success"
              ? "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700";

  const sizeClass = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";

  return (
    <button
      type={type}
      className={
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed " +
        variantClass +
        " " +
        sizeClass +
        " " +
        className
      }
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
