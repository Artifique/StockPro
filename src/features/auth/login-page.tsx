"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Profile } from "@/models/system.model";
import { Button, Input } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { Alert, Avatar } from "@/components/stock-pro/primitives";

const DEMO_PROFILES: Profile[] = [
  { id: "1", email: "admin@stockpro.com", role: "Super Admin", nom: "Karim Benali", avatar: "KB", color: "#1a2b6d", statut: "actif" },
  { id: "2", email: "gerant@stockpro.com", role: "Gérant", nom: "Fatima Ndiaye", avatar: "FN", color: "#6dc13a", statut: "actif" },
  { id: "3", email: "caisse@stockpro.com", role: "Caissier", nom: "Youssef Diallo", avatar: "YD", color: "#d93f3f", statut: "actif" },
];

/** Champs : fond clair, accent vert signal au focus (charte StockPro). */
const fieldClass =
  "h-11 rounded-xl border-border bg-card text-[15px] text-foreground shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-stockpro-signal/60 focus:ring-2 focus:ring-stockpro-signal/25 dark:bg-card/80 dark:focus:border-stockpro-signal/50 dark:focus:ring-stockpro-signal/20";

export const LoginPage: React.FC<{
  onLogin: (user: Profile) => void;
}> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [hydrated, setHydrated] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem("stockpro_user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setEmail(userData.email || "");
          setRememberMe(true);
        } catch {
          localStorage.removeItem("stockpro_user");
        }
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setCapsLockOn(e.getModifierState("CapsLock"));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setCapsLockOn(e.getModifierState("CapsLock"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const persistUserPreference = useCallback((user: Profile) => {
    if (rememberMe) {
      localStorage.setItem("stockpro_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("stockpro_user");
    }
  }, [rememberMe]);

  const handleQuickLogin = useCallback(
    async (user: Profile) => {
      setLoading(true);
      setErrors({});
      try {
        const res = await fetch("/api/auth/quick-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: parseInt(user.id) }),
        });
        const data = (await res.json()) as { user?: Profile; error?: string };
        if (!mountedRef.current) return;
        if (!res.ok || !data.user) {
          setErrors({ general: data.error ?? "Connexion refusée" });
          return;
        }
        persistUserPreference(data.user);
        onLogin(data.user);
      } catch {
        if (mountedRef.current) {
          setErrors({ general: "Erreur réseau. Réessayez." });
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [onLogin, persistUserPreference]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= DEMO_PROFILES.length) {
        e.preventDefault();
        const u = DEMO_PROFILES[n - 1];
        if (u) void handleQuickLogin(u);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleQuickLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { user?: Profile; error?: string };
      if (!mountedRef.current) return;
      if (!res.ok || !data.user) {
        setErrors({ general: data.error ?? "Erreur de connexion" });
        return;
      }
      persistUserPreference(data.user);
      onLogin(data.user);
    } catch {
      if (mountedRef.current) {
        setErrors({ general: "Erreur réseau. Réessayez." });
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const shell = (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stockpro-page via-white to-stockpro-page dark:from-[#060a14] dark:via-stockpro-navy-night dark:to-[#0a0e1a]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-5%,rgba(109,193,58,0.16),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_45%_at_50%_-8%,rgba(109,193,58,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-20 h-[min(70vw,420px)] w-[min(70vw,420px)] rounded-full bg-stockpro-signal/20 blur-[90px] dark:bg-stockpro-signal/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-[min(65vw,380px)] w-[min(65vw,380px)] rounded-full bg-stockpro-navy/20 blur-[90px] dark:bg-stockpro-navy-night/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:36px_36px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
        aria-hidden
      />
    </>
  );

  if (!hydrated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-5 sm:p-8">
        {shell}
        <div className="relative z-10 w-full max-w-[420px]">
          <div className="animate-pulse rounded-2xl border border-border/90 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-border dark:bg-background dark:shadow-black/40">
            <div className="mx-auto mb-8 h-16 w-72 max-w-full rounded-xl bg-muted sm:h-20 sm:w-80" />
            <div className="space-y-5">
              <div className="h-11 rounded-xl bg-muted" />
              <div className="h-11 rounded-xl bg-muted" />
              <div className="h-12 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const linkClass =
    "text-sm font-medium text-stockpro-navy underline-offset-4 transition-colors hover:text-stockpro-signal hover:underline dark:text-stockpro-signal dark:hover:text-white";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-5 sm:p-8">
      {shell}

      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/90 bg-white shadow-xl shadow-slate-300/40 ring-1 ring-slate-100/80 sm:rounded-[1.35rem] dark:border-border dark:bg-background dark:shadow-black/50 dark:ring-card/80">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-stockpro-signal to-transparent opacity-90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-stockpro-signal/[0.08] blur-2xl dark:bg-stockpro-signal/10"
            aria-hidden
          />

          <div className="relative px-8 pb-9 pt-10 sm:px-10 sm:pt-11">
            <h1 className="sr-only">Connexion</h1>

            <div className="mb-10 flex justify-center">
              <img
                src="/logo-stockpro.png"
                alt="StockPro"
                width={360}
                height={144}
                className="h-16 w-auto max-w-[min(100%,340px)] object-contain object-center select-none sm:h-20 sm:max-w-[min(100%,380px)]"
                decoding="async"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && <Alert variant="danger">{errors.general}</Alert>}

              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Adresse email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  icon={<Mail className="h-5 w-5 text-muted-foreground" />}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    icon={<Lock className="h-5 w-5 text-muted-foreground" />}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className={`${fieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/80"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {capsLockOn && focusedField === "password" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2 pt-1 text-sm text-stockpro-stock-low-fg dark:text-stockpro-stock-low-fg"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Verrouillage majuscules activé</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-card text-stockpro-signal focus:ring-2 focus:ring-stockpro-signal/40 focus:ring-offset-0"
                  />
                  <span className="text-sm text-muted-foreground">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    showToast("Fonctionnalité en cours de développement. Contactez l'administrateur.", "info")
                  }
                  className={linkClass}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="mt-1 w-full rounded-xl !bg-stockpro-navy py-3.5 text-[15px] font-semibold !text-white shadow-md shadow-slate-400/25 transition-[transform,box-shadow] hover:!bg-stockpro-navy-hover hover:shadow-lg hover:shadow-slate-400/30 focus-visible:!ring-2 focus-visible:!ring-stockpro-signal focus-visible:!ring-offset-2 focus-visible:!ring-offset-white dark:!bg-stockpro-signal dark:!text-stockpro-navy-night dark:hover:brightness-110 dark:shadow-black/40 dark:focus-visible:!ring-offset-background"
              >
                Se connecter
              </Button>

              <div className="border-t border-border pt-5">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground outline-none transition-colors hover:text-stockpro-navy dark:hover:text-stockpro-signal [&::-webkit-details-marker]:hidden">
                    <span>Comptes démo</span>
                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 dark:text-muted-foreground"
                      aria-hidden
                    />
                  </summary>
                  <div className="pt-3">
                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-x-visible [&::-webkit-scrollbar]:hidden">
                      {DEMO_PROFILES.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          disabled={loading}
                          title={`${user.role} — ${user.email}`}
                          onClick={() => handleQuickLogin(user)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/60 py-1 pl-1 pr-2 text-left transition-[border-color,background-color,transform] hover:border-stockpro-signal/50 hover:bg-stockpro-signal/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 dark:bg-card/60 dark:hover:border-stockpro-signal/40 dark:hover:bg-stockpro-signal/10"
                        >
                          <Avatar initials={user.avatar || ""} color={user.color} size="xs" />
                          <span className="max-w-[5.75rem] truncate text-[11px] font-medium text-foreground">
                            {user.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </details>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={() => showToast("Contactez l'administrateur pour créer un compte", "info")}
                    className={linkClass}
                  >
                    Demander un accès
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
