"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Truck,
  Edit,
  Download,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Alert, Select } from "@/components/stock-pro/primitives";
import { getStockLevelTextClass } from "@/lib/stockpro-theme";
import { ProductService } from "@/services/product.service";
import { Product, StockMovement, Category } from "@/models/product.model";

export const StockPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("mouvements");
  const ajustementModal = useDisclosure();
  const [alertFilter, setAlertFilter] = useState<"rupture" | "critique" | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, m] = await Promise.all([
        ProductService.getAll(),
        ProductService.getMovements()
      ]);
      setProducts(p);
      setMovements(m);
    } catch (error) {
      showToast("Erreur lors du chargement", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = products.reduce((sum, p) => sum + p.stock, 0);
    const rupture = products.filter((p) => p.stock === 0).length;
    const critique = products.filter((p) => p.stock > 0 && p.stock <= p.stock_min).length;
    const valeur = products.reduce((sum, p) => sum + p.stock * p.prix_achat, 0);
    return { total, rupture, critique, valeur };
  }, [products]);

  const mouvementColumns = [
    { 
      key: "created_at", 
      label: "Date", 
      sortable: true,
      render: (v: unknown) => v ? new Date(v as string).toLocaleString() : "-"
    },
    { 
      key: "product", 
      label: "Produit", 
      sortable: true,
      render: (v: unknown) => (v as Product)?.nom || "-"
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: unknown) => {
        const typeStyles: Record<string, { variant: "success" | "warning" | "info"; icon: React.ReactNode }> = {
          Entrée: { variant: "success", icon: <ArrowUp className="w-3 h-3 mr-1" /> },
          Sortie: { variant: "warning", icon: <ArrowDown className="w-3 h-3 mr-1" /> },
          Ajustement: { variant: "info", icon: <RefreshCw className="w-3 h-3 mr-1" /> },
        };
        const style = typeStyles[String(value)] || { variant: "default" as const, icon: null };
        return (
          <Badge variant={style.variant}>
            <span className="flex items-center">
              {style.icon}
              {String(value)}
            </span>
          </Badge>
        );
      },
    },
    {
      key: "quantite",
      label: "Quantité",
      sortable: true,
      render: (value: unknown) => (
        <span className={Number(value) >= 0 ? "text-stockpro-stock-ok-fg font-semibold" : "text-stockpro-stock-error-fg font-semibold"}>
          {Number(value) >= 0 ? "+" : ""}{String(value)}
        </span>
      ),
    },
    { key: "motif", label: "Motif" },
  ];

  const stockColumns = [
    { key: "nom", label: "Produit", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { 
      key: "category", 
      label: "Catégorie", 
      sortable: true,
      render: (v: unknown) => (v as Category)?.nom || "-"
    },
    {
      key: "stock",
      label: "Stock actuel",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => {
        const stock = value as number;
        const stockMin = row.stock_min as number;
        return (
          <span className={`text-lg font-bold ${getStockLevelTextClass(stock, stockMin)}`}>{stock}</span>
        );
      },
    },
    { key: "stock_min", label: "Stock min" },
    {
      key: "valeur",
      label: "Valeur stock",
      render: (_: unknown, row: Record<string, unknown>) => formatCurrency((row.stock as number) * (row.prix_achat as number)),
    },
    {
      key: "statut",
      label: "Statut",
      render: (_: unknown, row: Record<string, unknown>) => {
        const stock = row.stock as number;
        const stockMin = row.stock_min as number;
        if (stock === 0) return <Badge variant="danger">Rupture</Badge>;
        if (stock <= stockMin) return <Badge variant="warning">Critique</Badge>;
        return <Badge variant="success">OK</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion du Stock</h2>
          <p className="text-muted-foreground">Suivez vos mouvements et alertes stock</p>
        </div>
        <Button onClick={() => ajustementModal.open()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Ajustement stock
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Articles en stock</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-error-fg">{stats.rupture}</p>
          <p className="text-sm text-muted-foreground">Ruptures</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-low-fg">{stats.critique}</p>
          <p className="text-sm text-muted-foreground">Stock critique</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(stats.valeur)}</p>
          <p className="text-sm text-muted-foreground">Valeur totale</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-border">
        {["mouvements", "inventaire", "alertes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === tab || (activeTab === "produits-alertes" && tab === "alertes")
              ? "border-b-2 border-stockpro-navy text-stockpro-navy dark:border-stockpro-signal dark:text-stockpro-signal"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "mouvements" && (
        <DataTable onToast={showToast} columns={mouvementColumns} data={movements} title="Historique" pageSize={10} isLoading={isLoading} />
      )}

      {activeTab === "inventaire" && (
        <DataTable onToast={showToast} columns={stockColumns} data={products} title="Inventaire" pageSize={10} isLoading={isLoading} />
      )}

      {activeTab === "alertes" && (
        <div className="space-y-4">
          <Alert variant="danger">
            <div className="flex items-center justify-between w-full">
              <span>🚨 {stats.rupture} produits en rupture de stock</span>
              <Button variant="ghost" size="sm" onClick={() => { setAlertFilter("rupture"); setActiveTab("produits-alertes"); }}>Voir</Button>
            </div>
          </Alert>
          <Alert variant="warning">
            <div className="flex items-center justify-between w-full">
              <span>⚠️ {stats.critique} produits sous le seuil minimum</span>
              <Button variant="ghost" size="sm" onClick={() => { setAlertFilter("critique"); setActiveTab("produits-alertes"); }}>Voir</Button>
            </div>
          </Alert>
        </div>
      )}

      {activeTab === "produits-alertes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={alertFilter === "rupture" ? "danger" : "warning"}>
              {alertFilter === "rupture" ? "Ruptures" : "Stock critique"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => { setAlertFilter(null); setActiveTab("alertes"); }}><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Button>
          </div>
          <DataTable onToast={showToast} columns={stockColumns} data={alertFilter === "rupture" ? products.filter(p => p.stock === 0) : products.filter(p => p.stock > 0 && p.stock <= p.stock_min)} title="Détails alertes" pageSize={10} isLoading={isLoading} />
        </div>
      )}

      <Modal isOpen={ajustementModal.isOpen} onClose={ajustementModal.close} title="Ajustement de stock">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); showToast("Fonctionnalité en cours...", "info"); }}>
          <div>
            <label className="block text-sm font-medium mb-1">Produit</label>
            <Select value="" onChange={() => { }} options={products.map((p) => ({ value: String(p.id), label: `${p.nom} (${p.stock})` }))} placeholder="Choisir" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={ajustementModal.close}>Annuler</Button>
            <Button type="submit">Valider</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚚 PAGE FOURNISSEURS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
