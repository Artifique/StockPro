"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { MOCK_USERS, type StockProUser } from "@/data/stock-mock";
import { Button, Card, Input } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { Alert, Avatar } from "@/components/stock-pro/primitives";

export const LoginPage: React.FC<{
  onLogin: (user: StockProUser) => void;
}> = ({ onLogin }) => {
  // State - initialize with defaults for SSR consistency
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

  // Load saved email after mount (client-side only)
  useEffect(() => {
    // Defer setState calls to avoid synchronous updates in effect
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

  // Caps lock detection
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

  const persistUserPreference = useCallback((user: StockProUser) => {
    if (rememberMe) {
      localStorage.setItem("stockpro_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("stockpro_user");
    }
  }, [rememberMe]);

  // Quick login for demo accounts (cookie httpOnly + profil public)
  const handleQuickLogin = useCallback(
    async (user: (typeof MOCK_USERS)[0]) => {
      setLoading(true);
      setErrors({});
      try {
        const res = await fetch("/api/auth/quick-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: user.id }),
        });
        const data = (await res.json()) as { user?: StockProUser; error?: string };
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
      const data = (await res.json()) as { user?: StockProUser; error?: string };
      if (!mountedRef.current) return;
      if (!res.ok || !data.user) {
        const emailExists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (res.status === 401) {
          setErrors({
            general: emailExists
              ? "Mot de passe incorrect. Vérifiez votre saisie ou utilisez 'Mot de passe oublié'."
              : "Aucun compte trouvé avec cet email. Vérifiez votre adresse ou demandez un accès.",
          });
        } else {
          setErrors({ general: data.error ?? "Erreur de connexion" });
        }
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

  // Keyboard shortcuts for quick login (Ctrl+1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= 5) {
          e.preventDefault();
          const user = MOCK_USERS[key - 1];
          if (user) {
            handleQuickLogin(user);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleQuickLogin]);

  // Show loading skeleton during hydration to prevent mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 animate-pulse">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div className="h-8 w-48 mx-auto bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="bg-slate-800/95 rounded-xl p-6 space-y-6 animate-pulse">
            <div className="h-10 bg-slate-700 rounded-lg" />
            <div className="h-10 bg-slate-700 rounded-lg" />
            <div className="h-12 bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">StockPro Manager</h1>
          <p className="mt-2 text-slate-400">Gestion de stock pour commerçants</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-lg bg-white/95 dark:bg-slate-800/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <Alert variant="danger">
                {errors.general}
              </Alert>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Adresse email
              </label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Caps Lock Warning */}
              <AnimatePresence>
                {capsLockOn && focusedField === "password" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-400 text-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Verrouillage majuscules activé</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => showToast("Fonctionnalité en cours de développement. Contactez l'administrateur.", "info")}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Se connecter
            </Button>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => showToast("Contactez l'administrateur pour créer un compte", "info")}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  Demander un accès
                </button>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 Comptes de démonstration
                </p>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Connexion rapide
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {MOCK_USERS.map((user) => (
                  <div key={user.id} className="relative group/card">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      disabled={loading}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 border border-transparent transition-all text-left group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Avatar initials={user.avatar} color={user.color} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {user.role}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                    {/* Secondary button to fill form only - maintenant plus visible */}
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(user.email);
                        showToast(`Email rempli pour ${user.role}. Saisissez le mot de passe ou utilisez la connexion rapide.`, "info");
                      }}
                      className="absolute -right-1 -top-1 px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-[9px] font-medium opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1"
                      title="Remplir uniquement l'email"
                    >
                      <Mail className="w-2.5 h-2.5" />
                      Email
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Connexion rapide sécurisée (session serveur) • Mots de passe non affichés
              </p>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 text-center">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[10px]">Ctrl+1-5</kbd> connexion rapide • <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-[10px]">Tab</kbd> navigation
              </p>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          © 2024 StockPro Manager. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};