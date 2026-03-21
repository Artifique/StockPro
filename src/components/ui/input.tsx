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
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          type={type}
          disabled={disabled}
          className={
            "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-stockpro-signal disabled:cursor-not-allowed disabled:opacity-50 " +
            (icon ? "pl-10 " : "") +
            className +
            (error ? " !border-stockpro-stock-error-fg focus:!ring-stockpro-stock-error-fg " : "")
          }
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-stockpro-stock-error-fg">{error}</p>}
    </div>
  );
};
