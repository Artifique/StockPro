"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Truck,
  FileText,
  BarChart3,
  X,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  User,
  CreditCard,
  Wallet,
  Star,
  AlertCircle,
  Zap,
  Heart,
  History,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ACTIVITES_RECENTES,
  MOCK_PRODUCTS,
  MOCK_TRANSACTIONS,
  REPARTITION_CA,
  STOCK_EVOLUTION,
  TOP_PRODUITS,
  VENTES_MENSUELLES,
} from "@/data/stock-mock";
import { formatCurrency, formatShortCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import {
  STOCKPRO_WELCOME_DISMISSED_KEY,
  STOCKPRO_WELCOME_RESET_EVENT,
} from "@/lib/stockpro-storage-keys";
import { Alert } from "@/components/stock-pro/primitives";

const KPICard: React.FC<{
  title: string;
  value: React.ReactNode;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  iconBg: string;
  /** Données du mini graphique ; si absent ou vide, la zone graphique est masquée */
  sparklineData?: number[];
  onClick: () => void;
  hint: string;
}> = ({ title, value, change, trend, icon, iconBg, sparklineData = [], onClick, hint }) => {
  const chartData = sparklineData.map((v, i) => ({ i, v }));
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const changeColor =
    trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const lineColor = trend === "up" ? "#10b981" : "#f43f5e";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <Card padding="sm" className="h-full hover:border-indigo-300 dark:hover:border-indigo-600 transition-all overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white truncate">{value}</p>
              <div className={`flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-medium mt-0.5 ${changeColor}`}>
                <TrendIcon className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">· {hint}</span>
              </div>
            </div>
          </div>
          <div className="h-10 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <Line type="monotone" dataKey="v" stroke={lineColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full rounded-md bg-slate-100/80 dark:bg-slate-800/50" aria-hidden />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const DashboardPage: React.FC<{
  onNavigate: (route: string, filter?: string) => void;
  favoriteProducts?: number[];
  recentlyViewedProducts?: number[];
  onToggleFavorite?: (productId: number) => void;
  onViewProduct?: (productId: number) => void;
}> = ({ onNavigate, favoriteProducts = [], recentlyViewedProducts = [], onToggleFavorite, onViewProduct }) => {
  const [welcomeHydrated, setWelcomeHydrated] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setWelcomeDismissed(localStorage.getItem(STOCKPRO_WELCOME_DISMISSED_KEY) === "true");
      } catch {
        /* ignore */
      }
      setWelcomeHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STOCKPRO_WELCOME_DISMISSED_KEY) {
        setWelcomeDismissed(e.newValue === "true");
      }
    };
    const onReset = () => setWelcomeDismissed(false);
    window.addEventListener("storage", onStorage);
    window.addEventListener(STOCKPRO_WELCOME_RESET_EVENT, onReset);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STOCKPRO_WELCOME_RESET_EVENT, onReset);
    };
  }, []);

  const showWelcomeBanner =
    welcomeHydrated &&
    !welcomeDismissed &&
    favoriteProducts.length === 0 &&
    recentlyViewedProducts.length === 0;

  const [alerts, setAlerts] = useState([
    { id: 1, type: "danger" as const, message: "🚨 3 produits en rupture de stock", action: "stock" },
    { id: 2, type: "warning" as const, message: "⚠️ 7 produits sous le seuil minimum", action: "stock" },
    { id: 3, type: "info" as const, message: "📦 2 bons de commande en attente de réception", action: "achats" },
  ]);

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  // Calculate stock stats
  const stockStats = useMemo(() => {
    const rupture = MOCK_PRODUCTS.filter((p) => p.stock === 0).length;
    const critique = MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= p.stockMin).length;
    const totalStock = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stock, 0);
    return { rupture, critique, totalStock };
  }, []);

  // Get favorite products data
  const favoriteProductsData = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => favoriteProducts.includes(p.id));
  }, [favoriteProducts]);

  // Get recently viewed products data
  const recentlyViewedData = useMemo(() => {
    return recentlyViewedProducts
      .map((id) => MOCK_PRODUCTS.find((p) => p.id === id))
      .filter(Boolean) as typeof MOCK_PRODUCTS;
  }, [recentlyViewedProducts]);

  const transactionColumns = [
    { key: "id", label: "#ID", sortable: true },
    { key: "produit", label: "Produit", sortable: true },
    { key: "client", label: "Client", sortable: true },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    { key: "modePaiement", label: "Mode", sortable: true },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (value: unknown) => {
        const statusMap: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
          Payé: { variant: "success", label: "Payé" },
          "En attente": { variant: "warning", label: "En attente" },
          Annulé: { variant: "danger", label: "Annulé" },
        };
        const status = statusMap[value as string] || { variant: "default" as const, label: String(value) };
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    { key: "date", label: "Date", sortable: true },
  ];

  const stockCritiqueColumns = [
    { key: "nom", label: "Produit", sortable: true },
    {
      key: "stock",
      label: "Stock actuel",
      render: (value: unknown) => (
        <span className={value === 0 ? "text-rose-500 font-semibold" : "text-amber-500 font-semibold"}>
          {String(value)}
        </span>
      ),
    },
    { key: "stockMin", label: "Stock min", render: (value: unknown) => String(value) },
    {
      key: "statut",
      label: "Statut",
      render: (_: unknown, row: Record<string, unknown>) => (
        <Badge variant={(row.stock as number) === 0 ? "danger" : "warning"}>
          {(row.stock as number) === 0 ? "Rupture" : "Critique"}
        </Badge>
      ),
    },
  ];

  const produitsCritiques = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.stock <= p.stockMin).map((p) => ({
      nom: p.nom,
      stock: p.stock,
      stockMin: p.stockMin,
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner for new users - shows if no favorites or recently viewed */}
      {showWelcomeBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white"
        >
          {/* Bouton de fermeture explicite pour améliorer l'UX */}
          <button
            onClick={() => {
              setWelcomeDismissed(true);
              try {
                localStorage.setItem(STOCKPRO_WELCOME_DISMISSED_KEY, "true");
              } catch {
                /* ignore */
              }
              showToast("Bannière fermée. Vous pouvez la réafficher dans Paramètres → Notifications.", "info");
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-20"
            title="Fermer cette bannière"
            aria-label="Fermer la bannière de bienvenue"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10 pr-8">
            <h2 className="text-xl font-bold mb-2">Bienvenue sur StockPro Manager ! 🎉</h2>
            <p className="text-white/90 mb-4">
              Commencez par ajouter vos produits ou enregistrez votre première vente.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onNavigate("produits")}
                className="bg-white text-indigo-600 hover:bg-white/90"
                size="sm"
              >
                <Package className="w-4 h-4 mr-2" />
                Ajouter mes produits
              </Button>
              <Button
                onClick={() => onNavigate("pos")}
                variant="outline"
                className="border-white text-white hover:bg-white/20"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Faire une vente
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        </motion.div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type} onDismiss={() => dismissAlert(alert.id)}>
              <span className="flex-1">{alert.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(alert.action === "stock" ? "stock" : "achats")}
              >
                Voir
              </Button>
            </Alert>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card padding="sm" className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20 border-indigo-100 dark:border-indigo-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Actions rapides
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tâches fréquemment utilisées</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("pos")}
              className="bg-white dark:bg-slate-800"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Nouvelle vente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("produits")}
              className="bg-white dark:bg-slate-800"
            >
              <Package className="w-4 h-4 mr-1" />
              Ajouter produit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("clients")}
              className="bg-white dark:bg-slate-800"
            >
              <Users className="w-4 h-4 mr-1" />
              Nouveau client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("rapports")}
              className="bg-white dark:bg-slate-800"
            >
              <FileText className="w-4 h-4 mr-1" />
              Rapport
            </Button>
          </div>
        </div>
      </Card>

      {/* Favorites & Recently Viewed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Produits favoris
            </h3>
            <Badge variant="info">{favoriteProductsData.length}</Badge>
          </div>
          {favoriteProductsData.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {favoriteProductsData.slice(0, 5).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{product.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(product.prixVente)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.stock === 0 ? "danger" : product.stock <= product.stockMin ? "warning" : "success"}>
                      {product.stock} en stock
                    </Badge>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggleFavorite?.(product.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucun produit favori</p>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("produits")} className="mt-2">
                Ajouter des favoris
              </Button>
            </div>
          )}
        </Card>

        {/* Recently Viewed Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Récemment consultés
            </h3>
            <Badge variant="default">{recentlyViewedData.length}</Badge>
          </div>
          {recentlyViewedData.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentlyViewedData.slice(0, 5).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    onViewProduct?.(product.id);
                    onNavigate("produits");
                  }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{product.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{product.categorie}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(product.prixVente)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.stock} unités</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucun produit consulté récemment</p>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("produits")} className="mt-2">
                Parcourir les produits
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="CA du jour"
          value={formatCurrency(284500)}
          change={12.4}
          trend="up"
          icon={<Wallet className="w-6 h-6 text-white" />}
          iconBg="bg-indigo-500"
          sparklineData={[180000, 220000, 195000, 250000, 284500]}
          onClick={() => onNavigate("rapports")}
          hint="Cliquez pour voir"
        />
        <KPICard
          title="Ventes du mois"
          value={formatCurrency(8342000)}
          change={8.1}
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          iconBg="bg-emerald-500"
          sparklineData={[6.2, 6.8, 7.1, 7.5, 8.3]}
          onClick={() => onNavigate("pos")}
          hint="POS"
        />
        <KPICard
          title="Produits en stock"
          value={`${stockStats.totalStock.toLocaleString()} articles`}
          change={-2.3}
          trend="down"
          icon={<Package className="w-6 h-6 text-white" />}
          iconBg="bg-sky-500"
          onClick={() => onNavigate("produits")}
          hint="Voir produits"
        />
        <KPICard
          title="Clients actifs"
          value="342"
          change={5.7}
          trend="up"
          icon={<Users className="w-6 h-6 text-white" />}
          iconBg="bg-amber-500"
          onClick={() => onNavigate("clients")}
          hint="Voir clients"
        />
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("achats")}
          className="cursor-pointer"
        >
          <Card className="flex items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <ShoppingCart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Commandes en cours</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">12</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("stock", "rupture")}
          className="cursor-pointer"
        >
          <Card className="flex items-center gap-4 hover:border-rose-300 dark:hover:border-rose-600 transition-all">
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ruptures de stock</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stockStats.rupture}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("stock", "critique")}
          className="cursor-pointer"
        >
          <Card className="flex items-center gap-4 hover:border-amber-300 dark:hover:border-amber-600 transition-all">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock critique</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stockStats.critique}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("rapports")}
          className="cursor-pointer"
        >
          <Card className="flex items-center gap-4 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">CA annuel</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">96.8M</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Évolution des ventes (12 mois)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={VENTES_MENSUELLES}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAchats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatShortCurrency} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Legend />
                <Area type="monotone" dataKey="ventes" name="Ventes" stroke="#6366f1" fillOpacity={1} fill="url(#colorVentes)" />
                <Area type="monotone" dataKey="achats" name="Achats" stroke="#22c55e" fillOpacity={1} fill="url(#colorAchats)" />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Top 8 produits vendus</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={TOP_PRODUITS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={formatShortCurrency} />
                <YAxis dataKey="nom" type="category" stroke="#94a3b8" fontSize={11} width={120} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "CA"]}
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Bar dataKey="ca" name="CA" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Répartition CA par catégorie</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={REPARTITION_CA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="valeur"
                >
                  {REPARTITION_CA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Part"]}
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Évolution du stock (30 jours)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={STOCK_EVOLUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="jour" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Line type="monotone" dataKey="stock" name="Stock" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", strokeWidth: 2 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Dernières transactions</h3>
        <DataTable onToast={showToast}
          columns={transactionColumns}
          data={MOCK_TRANSACTIONS}
          title="Dernières transactions"
          pageSize={5}
          actions={() => (
            <div className="flex items-center justify-end gap-1">
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Critique */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Produits en stock critique</h3>
          <DataTable onToast={showToast}
            columns={stockCritiqueColumns}
            data={produitsCritiques}
            title="Produits en stock critique"
            pageSize={5}
            searchable={false}
            exportOptions={false}
            actions={() => (
              <Button variant="primary" size="sm" onClick={() => onNavigate("achats")}>
                Commander
              </Button>
            )}
          />
        </Card>

        {/* Activity Timeline */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Activité récente</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {ACTIVITES_RECENTES.map((activity) => {
              const iconMap: Record<string, React.ReactNode> = {
                shopping: <ShoppingCart className="w-4 h-4" />,
                stock: <Boxes className="w-4 h-4" />,
                user: <User className="w-4 h-4" />,
                truck: <Truck className="w-4 h-4" />,
                edit: <Edit className="w-4 h-4" />,
                chart: <BarChart3 className="w-4 h-4" />,
                star: <Star className="w-4 h-4" />,
                alert: <AlertCircle className="w-4 h-4" />,
              };

              const colorMap: Record<string, string> = {
                shopping: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                stock: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                user: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
                truck: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
                edit: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                chart: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
                star: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                alert: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
              };

              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`p-2 rounded-lg ${colorMap[activity.icone]}`}>
                    {iconMap[activity.icone]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">par {activity.utilisateur}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{activity.heure}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PRODUITS PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
