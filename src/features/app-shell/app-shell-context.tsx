"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MOCK_CLIENTS,
  MOCK_FOURNISSEURS,
  MOCK_PRODUCTS,
  type StockProUser,
} from "@/data/stock-mock";
import { addLog } from "@/lib/app-logs";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  APP_ROUTE_IDS,
  PAGE_TITLES,
  pathnameToRouteId,
  routePath,
  type AppRouteId,
} from "@/lib/stock-pro-routes";
import type { DisclosureApi } from "@/hooks/use-disclosure";

type AppShellSessionValue = {
  user: StockProUser | null;
  setUser: React.Dispatch<React.SetStateAction<StockProUser | null>>;
  navigate: (id: string, filter?: string) => void;
  activeRoute: AppRouteId;
  favoriteProducts: number[];
  toggleFavorite: (productId: number) => void;
  addToRecentlyViewed: (productId: number) => void;
  recentlyViewedProducts: number[];
  isLoading: boolean;
  handleLogout: () => void;
  pageTitle: string;
};

type AppShellUIValue = {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
  setGlobalSearch: React.Dispatch<React.SetStateAction<string>>;
  searchResults: { type: string; items: unknown[] }[];
  onboardingModal: DisclosureApi;
};

const SessionContext = createContext<AppShellSessionValue | null>(null);
const UIContext = createContext<AppShellUIValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StockProUser | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const onboardingModal = useDisclosure();
  const [globalSearch, setGlobalSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<number[]>([]);

  const activeRoute = pathnameToRouteId(pathname || "/dashboard");

  useEffect(() => {
    let cancelled = false;

    const loadSavedData = async () => {
      let userResolved = false;
      const savedUser = localStorage.getItem("stockpro_user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser) as StockProUser;
          if (!cancelled) setUser(userData);
          userResolved = true;
        } catch {
          localStorage.removeItem("stockpro_user");
        }
      }
      if (!userResolved && !cancelled) {
        try {
          const res = await fetch("/api/auth/session", { credentials: "include" });
          if (res.ok) {
            const data = (await res.json()) as { user: StockProUser | null };
            if (data.user && !cancelled) setUser(data.user);
          }
        } catch {
          /* ignore */
        }
      }

      const savedDarkMode = localStorage.getItem("stockpro_darkMode");
      if (savedDarkMode !== null && !cancelled) {
        setDarkMode(savedDarkMode === "true");
      }
      const savedSidebarCollapsed = localStorage.getItem("stockpro_sidebar_collapsed");
      if (savedSidebarCollapsed !== null && !cancelled) {
        setSidebarCollapsed(savedSidebarCollapsed === "true");
      }
      const savedFavorites = localStorage.getItem("stockpro_favorites");
      if (savedFavorites) {
        try {
          if (!cancelled) setFavoriteProducts(JSON.parse(savedFavorites));
        } catch {
          localStorage.removeItem("stockpro_favorites");
        }
      }
      const savedRecentlyViewed = localStorage.getItem("stockpro_recently_viewed");
      if (savedRecentlyViewed) {
        try {
          if (!cancelled) setRecentlyViewedProducts(JSON.parse(savedRecentlyViewed));
        } catch {
          localStorage.removeItem("stockpro_recently_viewed");
        }
      }
      if (!cancelled) setIsLoading(false);
    };

    void loadSavedData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("stockpro_darkMode", darkMode.toString());
    }
  }, [darkMode, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("stockpro_sidebar_collapsed", sidebarCollapsed.toString());
    }
  }, [sidebarCollapsed, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("stockpro_favorites", JSON.stringify(favoriteProducts));
    }
  }, [favoriteProducts, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("stockpro_recently_viewed", JSON.stringify(recentlyViewedProducts));
    }
  }, [recentlyViewedProducts, isLoading]);

  const toggleFavorite = useCallback((productId: number) => {
    setFavoriteProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const addToRecentlyViewed = useCallback((productId: number) => {
    setRecentlyViewedProducts((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem("stockpro_onboarding_seen");
      if (!hasSeenOnboarding) {
        const t = setTimeout(() => onboardingModal.open(), 300);
        return () => clearTimeout(t);
      }
    }
    return undefined;
  }, [user, onboardingModal.open]);

  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const query = globalSearch.toLowerCase();
    const results: { type: string; items: unknown[] }[] = [];
    const productResults = MOCK_PRODUCTS.filter(
      (p) => p.nom.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
    ).slice(0, 5);
    if (productResults.length > 0) results.push({ type: "Produits", items: productResults });
    const clientResults = MOCK_CLIENTS.filter(
      (c) => c.nom.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
    ).slice(0, 5);
    if (clientResults.length > 0) results.push({ type: "Clients", items: clientResults });
    const supplierResults = MOCK_FOURNISSEURS.filter(
      (f) => f.nom.toLowerCase().includes(query) || f.contact.toLowerCase().includes(query)
    ).slice(0, 3);
    if (supplierResults.length > 0) results.push({ type: "Fournisseurs", items: supplierResults });
    return results;
  }, [globalSearch]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navigate = useCallback(
    (id: string, _filter?: string) => {
      if ((APP_ROUTE_IDS as readonly string[]).includes(id)) {
        router.push(routePath(id as AppRouteId));
      }
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    if (user) {
      addLog("LOGOUT", user.nom, user.role, "Déconnexion", {});
    }
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    localStorage.removeItem("stockpro_user");
    setUser(null);
    router.push("/login");
    showToast("Déconnexion réussie", "success");
  }, [user, router]);

  const pageTitle = PAGE_TITLES[activeRoute] ?? "Dashboard";

  const sessionValue = useMemo<AppShellSessionValue>(
    () => ({
      user,
      setUser,
      navigate,
      activeRoute,
      favoriteProducts,
      toggleFavorite,
      addToRecentlyViewed,
      recentlyViewedProducts,
      isLoading,
      handleLogout,
      pageTitle,
    }),
    [
      user,
      navigate,
      activeRoute,
      favoriteProducts,
      toggleFavorite,
      addToRecentlyViewed,
      recentlyViewedProducts,
      isLoading,
      handleLogout,
      pageTitle,
    ]
  );

  const uiValue = useMemo<AppShellUIValue>(
    () => ({
      darkMode,
      setDarkMode,
      language,
      setLanguage,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileMenuOpen,
      setMobileMenuOpen,
      globalSearch,
      setGlobalSearch,
      searchResults,
      onboardingModal,
    }),
    [
      darkMode,
      language,
      sidebarCollapsed,
      mobileMenuOpen,
      globalSearch,
      searchResults,
      onboardingModal,
    ]
  );

  return (
    <SessionContext.Provider value={sessionValue}>
      <UIContext.Provider value={uiValue}>{children}</UIContext.Provider>
    </SessionContext.Provider>
  );
}

export function useAppShellSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useAppShellSession must be used within AppShellProvider");
  }
  return ctx;
}

export function useAppShellUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useAppShellUI must be used within AppShellProvider");
  }
  return ctx;
}
