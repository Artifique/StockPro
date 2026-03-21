"use client";

import React, { useState, useMemo } from "react";
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
import {
  MOCK_MOUVEMENTS,
  MOCK_PRODUCTS,
} from "@/data/stock-mock";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Alert, Select } from "@/components/stock-pro/primitives";
import { getStockLevelTextClass } from "@/lib/stockpro-theme";

export const StockPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("mouvements");
  const ajustementModal = useDisclosure();
  const [alertFilter, setAlertFilter] = useState<"rupture" | "critique" | null>(null);

  const stats = useMemo(() => {
    const total = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stock, 0);
    const rupture = MOCK_PRODUCTS.filter((p) => p.stock === 0).length;
    const critique = MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= p.stockMin).length;
    const valeur = MOCK_PRODUCTS.reduce((sum, p) => sum + p.stock * p.prixAchat, 0);
    return { total, rupture, critique, valeur };
  }, []);

  const mouvementColumns = [
    { key: "date", label: "Date", sortable: true },
    { key: "produit", label: "Produit", sortable: true },
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
    { key: "utilisateur", label: "Utilisateur" },
  ];

  const stockColumns = [
    { key: "nom", label: "Produit", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { key: "categorie", label: "Catégorie", sortable: true },
    {
      key: "stock",
      label: "Stock actuel",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => {
        const stock = value as number;
        const stockMin = row.stockMin as number;
        return (
          <span className={`text-lg font-bold ${getStockLevelTextClass(stock, stockMin)}`}>{stock}</span>
        );
      },
    },
    { key: "stockMin", label: "Stock min" },
    {
      key: "valeur",
      label: "Valeur stock",
      render: (_: unknown, row: Record<string, unknown>) => formatCurrency((row.stock as number) * (row.prixAchat as number)),
    },
    {
      key: "statut",
      label: "Statut",
      render: (_: unknown, row: Record<string, unknown>) => {
        const stock = row.stock as number;
        const stockMin = row.stockMin as number;
        if (stock === 0) return <Badge variant="danger">Rupture</Badge>;
        if (stock <= stockMin) return <Badge variant="warning">Critique</Badge>;
        return <Badge variant="success">OK</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion du Stock</h2>
          <p className="text-muted-foreground">Suivez vos mouvements et alertes stock</p>
        </div>
        <Button onClick={() => ajustementModal.open()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Ajustement stock
        </Button>
      </div>

      {/* Stats Cards */}
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("mouvements")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "mouvements"
            ? "border-b-2 border-stockpro-navy text-stockpro-navy dark:border-stockpro-signal dark:text-stockpro-signal"
            : "text-muted-foreground hover:text-foreground dark:hover:text-foreground"
            }`}
        >
          Mouvements
        </button>
        <button
          onClick={() => setActiveTab("inventaire")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "inventaire"
            ? "border-b-2 border-stockpro-navy text-stockpro-navy dark:border-stockpro-signal dark:text-stockpro-signal"
            : "text-muted-foreground hover:text-foreground dark:hover:text-foreground"
            }`}
        >
          Inventaire
        </button>
        <button
          onClick={() => setActiveTab("alertes")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "alertes" || activeTab === "produits-alertes"
            ? "border-b-2 border-stockpro-navy text-stockpro-navy dark:border-stockpro-signal dark:text-stockpro-signal"
            : "text-muted-foreground hover:text-foreground dark:hover:text-foreground"
            }`}
        >
          Alertes
          {(stats.rupture > 0 || stats.critique > 0) && (
            <span className="ml-2 rounded-full bg-stockpro-stock-error-fg px-1.5 py-0.5 text-xs font-semibold text-white">
              {stats.rupture + stats.critique}
            </span>
          )}
        </button>
        {activeTab === "produits-alertes" && (
          <button
            className="flex items-center gap-1 border-b-2 border-stockpro-navy px-4 py-2 font-medium text-stockpro-navy dark:border-stockpro-signal dark:text-stockpro-signal"
          >
            <ArrowRight className="w-4 h-4" />
            {alertFilter === "rupture" ? "Ruptures" : "Stock faible"}
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "mouvements" && (
        <DataTable onToast={showToast}
          columns={mouvementColumns}
          data={MOCK_MOUVEMENTS}
          title="Mouvements de stock"
          pageSize={5}
          exportOptions
        />
      )}

      {activeTab === "inventaire" && (
        <DataTable onToast={showToast}
          columns={stockColumns}
          data={MOCK_PRODUCTS}
          title="Inventaire du stock"
          pageSize={10}
          exportOptions
          actions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => {
                  ajustementModal.open();
                  showToast(`Ajustement pour: ${row.nom}`, "info");
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-stockpro-signal/10 hover:text-stockpro-navy dark:hover:bg-stockpro-signal/15 dark:hover:text-stockpro-signal"
                title="Ajuster le stock"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      {activeTab === "alertes" && (
        <div className="space-y-4">
          <Alert variant="danger">
            <div className="flex items-center justify-between w-full">
              <span>🚨 {stats.rupture} produits en rupture de stock</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAlertFilter("rupture");
                  setActiveTab("produits-alertes");
                }}
              >
                Voir les produits
              </Button>
            </div>
          </Alert>
          <Alert variant="warning">
            <div className="flex items-center justify-between w-full">
              <span>⚠️ {stats.critique} produits sous le seuil minimum</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAlertFilter("critique");
                  setActiveTab("produits-alertes");
                }}
              >
                Voir les produits
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {activeTab === "produits-alertes" && (
        <div className="space-y-4">
          {/* Filter indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {alertFilter === "rupture" ? (
                <Badge variant="danger" className="text-sm py-1.5 px-3">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  Produits en rupture de stock
                </Badge>
              ) : (
                <Badge variant="warning" className="text-sm py-1.5 px-3">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  Produits sous le seuil minimum
                </Badge>
              )}
              <span className="text-muted-foreground text-sm">
                {alertFilter === "rupture"
                  ? `${MOCK_PRODUCTS.filter(p => p.stock === 0).length} produits`
                  : `${MOCK_PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.stockMin).length} produits`
                }
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAlertFilter(null);
                setActiveTab("alertes");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour aux alertes
            </Button>
          </div>

          {/* Filtered Products Table */}
          <DataTable onToast={showToast}
            columns={[
              {
                key: "nom", label: "Produit", sortable: true, render: (value: unknown, row: Record<string, unknown>) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{String(value)}</p>
                      <p className="text-xs text-muted-foreground">{String(row.sku)}</p>
                    </div>
                  </div>
                )
              },
              { key: "categorie", label: "Catégorie", sortable: true },
              {
                key: "stock",
                label: "Stock",
                sortable: true,
                render: (value: unknown, row: Record<string, unknown>) => (
                  <div className="text-center">
                    <p
                      className={`font-semibold ${getStockLevelTextClass(Number(value), Number(row.stockMin))}`}
                    >
                      {String(value)} {String(row.unite)}
                    </p>
                    <p className="text-xs text-muted-foreground">Min: {String(row.stockMin)}</p>
                  </div>
                )
              },
              {
                key: "prixAchat",
                label: "Prix d'achat",
                sortable: true,
                render: (value: unknown) => formatCurrency(value as number)
              },
              {
                key: "prixVente",
                label: "Prix de vente",
                sortable: true,
                render: (value: unknown) => formatCurrency(value as number)
              },
              {
                key: "statut",
                label: "Statut",
                render: (value: unknown, row: Record<string, unknown>) => {
                  const stock = Number(row.stock);
                  const stockMin = Number(row.stockMin);
                  if (stock === 0) {
                    return <Badge variant="danger">Rupture</Badge>;
                  } else if (stock <= stockMin) {
                    return <Badge variant="warning">Stock faible</Badge>;
                  }
                  return <Badge variant="success">Disponible</Badge>;
                }
              }
            ]}
            data={alertFilter === "rupture"
              ? MOCK_PRODUCTS.filter(p => p.stock === 0)
              : MOCK_PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.stockMin)
            }
            title={alertFilter === "rupture" ? "Produits en rupture de stock" : "Produits avec stock critique"}
            pageSize={5}
            exportOptions
            actions={(row) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    ajustementModal.open();
                    showToast(`Ajustement pour: ${row.nom}`, "info");
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-stockpro-signal/10 hover:text-stockpro-navy dark:hover:bg-stockpro-signal/15 dark:hover:text-stockpro-signal"
                  title="Ajuster le stock"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            )}
          />

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Commande fournisseur suggérée pour ces produits", "info")}
            >
              <Truck className="w-4 h-4 mr-1" />
              Commander ces produits
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast("Liste d'achat exportée", "success")}
            >
              <Download className="w-4 h-4 mr-1" />
              Exporter la liste
            </Button>
          </div>
        </div>
      )}

      {/* Ajustement Modal */}
      <Modal isOpen={ajustementModal.isOpen} onClose={ajustementModal.close} title="Ajustement de stock">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Ajustement de stock enregistré avec succès !", "success");
            ajustementModal.close();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Produit</label>
            <Select
              value=""
              onChange={() => { }}
              options={MOCK_PRODUCTS.map((p) => ({ value: String(p.id), label: `${p.nom} (${p.stock} en stock)` }))}
              placeholder="Sélectionner un produit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Type d&apos;ajustement</label>
            <Select
              value=""
              onChange={() => { }}
              options={[
                { value: "entree", label: "Entrée (réception)" },
                { value: "sortie", label: "Sortie (perte/casse)" },
                { value: "inventaire", label: "Inventaire (correction)" },
              ]}
              placeholder="Sélectionner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quantité</label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Motif</label>
            <textarea
              rows={2}
              placeholder="Raison de l'ajustement..."
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={ajustementModal.close}>
              Annuler
            </Button>
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
