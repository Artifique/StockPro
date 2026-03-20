"use client";

import React from "react";

type InputProps = {
  error?: string;
  icon?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<"input">, "className"> & { className?: string };

export const Input: React.FC<InputProps> = ({
  type = "text",
  className = "",
  error,
  icon,
  disabled = false,
  ...rest
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          disabled={disabled}
          className={
            "w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed " +
            (icon ? "pl-10 " : "") +
            (error ? "border-rose-500 focus:ring-rose-500 " : "") +
            className
          }
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-rose-500">{error}</p>}
    </div>
  );
};
