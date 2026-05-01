"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Users,
  Truck,
  FileText,
  BarChart3,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
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
const REPARTITION_CA = [{ name: "N/A", valeur: 0, color: "#1a2b6d" }];
const STOCK_EVOLUTION = [{ jour: "1", stock: 0 }];
const VENTES_MENSUELLES = [{ mois: "Jan", ventes: 0 }];
import { formatCurrency, formatShortCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import {
  STOCKPRO_WELCOME_DISMISSED_KEY,
} from "@/lib/stockpro-storage-keys";
import { Alert } from "@/components/stock-pro/primitives";
import { ProductService } from "@/services/product.service";
import { ClientService } from "@/services/partner.service";
import { SaleService } from "@/services/sale.service";
import { InventoryService } from "@/services/inventory.service";
import { SystemService } from "@/services/system.service";
import { Product } from "@/models/product.model";
import { Transaction } from "@/models/sale.model";
import { ActivityLog } from "@/models/system.model";

const KPICard: React.FC<{
  title: string;
  value: React.ReactNode;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  iconBg: string;
  sparklineData?: number[];
  onClick: () => void;
  hint: string;
}> = ({ title, value, change, trend, icon, iconBg, sparklineData = [], onClick, hint }) => {
  const chartData = sparklineData.map((v, i) => ({ i, v }));
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const changeColor = trend === "up" ? "text-stockpro-stock-ok-fg" : "text-stockpro-stock-error-fg";
  const lineColor = trend === "up" ? "#6dc13a" : "#d93f3f";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card padding="sm" className="h-full hover:border-stockpro-signal/40">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">{title}</p>
              <p className="text-xl font-bold text-foreground truncate">{value}</p>
              <div className={`flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-medium mt-0.5 ${changeColor}`}>
                <TrendIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{change > 0 ? "+" : ""}{change}%</span>
                <span className="text-muted-foreground font-normal">· {hint}</span>
              </div>
            </div>
          </div>
          <div className="h-10 w-full">
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
                  <Line type="monotone" dataKey="v" stroke={lineColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
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
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  const [welcomeHydrated, setWelcomeHydrated] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    loadData();
    const id = requestAnimationFrame(() => {
      try {
        setWelcomeDismissed(localStorage.getItem(STOCKPRO_WELCOME_DISMISSED_KEY) === "true");
      } catch { /* ignore */ }
      setWelcomeHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, t, l, c, o] = await Promise.all([
        ProductService.getAll(),
        SaleService.getAllTransactions(),
        SystemService.getLogs(10),
        ClientService.getAll(),
        InventoryService.getAllSupplierOrders()
      ]);
      setProducts(p);
      setTransactions(t);
      setActivityLogs(l);
      setClientCount(c.length);
      setPendingOrders(o.filter(ord => ["En attente", "En transit"].includes(ord.statut)).length);
    } catch (error) {
      showToast("Erreur de chargement du dashboard", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcomeBanner = welcomeHydrated && !welcomeDismissed && favoriteProducts.length === 0 && recentlyViewedProducts.length === 0;

  const stockStats = useMemo(() => {
    const rupture = products.filter((p) => p.stock === 0).length;
    const critique = products.filter((p) => p.stock > 0 && p.stock <= p.stock_min).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    return { rupture, critique, totalStock };
  }, [products]);

  const favoriteProductsData = useMemo(() => products.filter((p) => favoriteProducts.includes(p.id)), [products, favoriteProducts]);
  const recentlyViewedData = useMemo(() => recentlyViewedProducts.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[], [products, recentlyViewedProducts]);

  const salesStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const caJour = transactions.filter(t => t.created_at?.startsWith(today)).reduce((sum, t) => sum + t.total_ttc, 0);
    return { caJour };
  }, [transactions]);

  const transactionColumns = [
    { key: "id", label: "#ID", sortable: true },
    { 
      key: "client", 
      label: "Client", 
      sortable: true,
      render: (v: unknown) => (v as any)?.nom || "Particulier"
    },
    {
      key: "total_ttc",
      label: "Montant",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    { key: "mode_paiement", label: "Mode", sortable: true },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (value: unknown) => (
        <Badge variant={value === "Payé" ? "success" : value === "En attente" ? "warning" : "danger"}>
          {String(value)}
        </Badge>
      ),
    },
    { 
      key: "created_at", 
      label: "Date", 
      sortable: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleDateString() : "-"
    },
  ];

  const produitsCritiques = useMemo(() => products.filter((p) => p.stock <= p.stock_min).slice(0, 5), [products]);

  return (
    <div className="space-y-6">
      {showWelcomeBanner && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-stockpro-navy via-stockpro-navy-mid to-stockpro-signal p-6 text-white">
          <button onClick={() => { setWelcomeDismissed(true); localStorage.setItem(STOCKPRO_WELCOME_DISMISSED_KEY, "true"); }} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 z-20"><X className="w-4 h-4" /></button>
          <div className="relative z-10 pr-8">
            <h2 className="text-xl font-bold mb-2">Bienvenue sur StockPro Manager ! 🎉</h2>
            <p className="text-white/90 mb-4">Commencez par ajouter vos produits ou enregistrez votre première vente.</p>
            <div className="flex gap-3">
              <Button onClick={() => onNavigate("produits")} className="bg-white text-stockpro-navy hover:bg-white/90" size="sm"><Package className="w-4 h-4 mr-2" />Ajouter mes produits</Button>
              <Button onClick={() => onNavigate("pos")} variant="outline" className="border-white text-white hover:bg-white/20" size="sm"><ShoppingCart className="w-4 h-4 mr-2" />Faire une vente</Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="CA du jour" value={formatCurrency(salesStats.caJour)} change={12} trend="up" icon={<Wallet className="w-6 h-6 text-white" />} iconBg="bg-stockpro-navy" onClick={() => onNavigate("rapports")} hint="Aujourd'hui" />
        <KPICard title="Clients" value={clientCount} change={5} trend="up" icon={<Users className="w-6 h-6 text-white" />} iconBg="bg-stockpro-signal" onClick={() => onNavigate("clients")} hint="Actifs" />
        <KPICard title="Stock total" value={stockStats.totalStock} change={-2} trend="down" icon={<Package className="w-6 h-6 text-white" />} iconBg="bg-stockpro-navy" onClick={() => onNavigate("produits")} hint="Articles" />
        <KPICard title="Commandes" value={pendingOrders} change={0} trend="up" icon={<Truck className="w-6 h-6 text-white" />} iconBg="bg-stockpro-stock-low-fg" onClick={() => onNavigate("achats")} hint="En cours" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-stockpro-stock-error-fg" />Produits favoris</h3>
            <Badge variant="info">{favoriteProductsData.length}</Badge>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {favoriteProductsData.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-stockpro-navy/10"><Package className="w-5 h-5 text-stockpro-navy" /></div>
                  <div><p className="text-sm font-medium">{p.nom}</p><p className="text-xs text-muted-foreground">{formatCurrency(p.prix_vente)}</p></div>
                </div>
                <Badge variant={p.stock === 0 ? "danger" : p.stock <= p.stock_min ? "warning" : "success"}>{p.stock} en stock</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><History className="w-5 h-5" />Récents</h3>
            <Badge>{recentlyViewedData.length}</Badge>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentlyViewedData.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer" onClick={() => { onViewProduct?.(p.id); onNavigate("produits"); }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Package className="w-5 h-5" /></div>
                  <div><p className="text-sm font-medium">{p.nom}</p><p className="text-xs text-muted-foreground">{formatCurrency(p.prix_vente)}</p></div>
                </div>
                <p className="text-xs font-semibold">{p.stock} unités</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Dernières transactions</h3>
        <DataTable onToast={showToast} columns={transactionColumns} data={transactions.slice(0, 5) as any[]} title="Ventes" pageSize={5} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Stock critique</h3>
          <DataTable onToast={showToast} columns={[{ key: "nom", label: "Produit" }, { key: "stock", label: "Stock" }, { key: "stock_min", label: "Min" }]} data={produitsCritiques as any[]} title="Alertes" pageSize={5} />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-stockpro-navy/10"><BarChart3 className="w-4 h-4 text-stockpro-navy" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.details}</p>
                  <p className="text-xs text-muted-foreground">par {log.profile?.nom || "Système"}</p>
                </div>
                <span className="text-xs text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleTimeString() : "-"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">Évolution des ventes (12 mois)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={VENTES_MENSUELLES}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a2b6d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1a2b6d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatShortCurrency} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
                <Legend />
                <Area type="monotone" dataKey="ventes" name="Ventes" stroke="#1a2b6d" fillOpacity={1} fill="url(#colorVentes)" />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">Évolution du stock (30 jours)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={STOCK_EVOLUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="jour" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="stock" name="Stock" stroke="#6dc13a" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
