"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Boxes,
  X,
  Eye,
  Plus,
  Download,
  Filter,
  Check,
  Trash2,
} from "lucide-react";
import { Button, Card, DataTable, Input, Modal, Badge } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";
import { formatCurrency } from "@/lib/format";
import { useEffect, useCallback } from "react";
import { InventoryService } from "@/services/inventory.service";
import { SupplierService } from "@/services/partner.service";
import { ProductService } from "@/services/product.service";
import { SupplierOrder } from "@/models/inventory.model";
import { Supplier } from "@/models/partner.model";
import { Product } from "@/models/product.model";
import { Minus } from "lucide-react";

export const AchatsPage: React.FC = () => {
  const newCommandeModal = useDisclosure();
  const commandeDetailsModal = useDisclosure();
  const productSelectModal = useDisclosure();
  const [selectedCommande, setSelectedCommande] = useState<SupplierOrder | null>(null);
  const [filterStatut, setFilterStatut] = useState("");
  const [orderLines, setOrderLines] = useState<{ product: Product; quantity: number; prixAchat: number }[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [commandes, setCommandes] = useState<SupplierOrder[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cmds, supps, prods] = await Promise.all([
        InventoryService.getAllSupplierOrders(),
        SupplierService.getAll(),
        ProductService.getAll()
      ]);
      setCommandes(cmds);
      setFournisseurs(supps);
      setProducts(prods);
    } catch (err) {
      showToast("Erreur lors du chargement des données", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeNewCommandeModal = () => {
    newCommandeModal.close();
    setOrderLines([]);
  };

  const closeProductSelectModal = () => {
    productSelectModal.close();
    setSearchProduct("");
  };

  const stats = useMemo(() => {
    const total = commandes.reduce((sum, c) => sum + c.montant_total, 0);
    const enAttente = commandes.filter((c) => c.statut === "En attente" || c.statut === "En transit").length;
    const recues = commandes.filter((c) => c.statut === "Reçue").length;
    return { total, enAttente, recues };
  }, [commandes]);

  const filteredCommandes = useMemo(() => {
    if (!filterStatut) return commandes;
    return commandes.filter((c) => c.statut === filterStatut);
  }, [filterStatut, commandes]);

  const columns = [
    { key: "id", label: "N° Commande", sortable: true },
    { key: "supplier_id", label: "Fournisseur", sortable: true, render: (v: unknown, row: any) => row.supplier?.nom || "Inconnu" },
    { key: "created_at", label: "Date", sortable: true, render: (v: unknown) => v ? new Date(v as string).toLocaleDateString() : "-" },
    { key: "items", label: "Produits", render: (value: unknown) => `${Array.isArray(value) ? value.length : 0} articles` },
    {
      key: "montant_total",
      label: "Montant",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (value: unknown) => {
        const statusStyles: Record<string, { variant: "success" | "warning" | "info" | "danger" | "default" }> = {
          Reçue: { variant: "success" },
          "En transit": { variant: "info" },
          "En attente": { variant: "warning" },
          Annulée: { variant: "danger" },
        };
        const style = statusStyles[String(value)] || { variant: "default" as const };
        return <Badge variant={style.variant}>{String(value)}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Achats & Commandes</h2>
          <p className="text-slate-500 dark:text-slate-400">Gérez vos commandes fournisseurs</p>
        </div>
        <Button onClick={() => newCommandeModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{commandes.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total commandes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.enAttente}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">En attente</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.recues}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Reçues</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(stats.total)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Montant total</p>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <Select
            value={filterStatut}
            onChange={setFilterStatut}
            placeholder="Tous les statuts"
            options={[
              { value: "En attente", label: "En attente" },
              { value: "En transit", label: "En transit" },
              { value: "Reçue", label: "Reçue" },
              { value: "Annulée", label: "Annulée" },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <DataTable onToast={showToast}
        columns={columns}
        data={filteredCommandes as any[]}
        title="Liste des commandes"
        pageSize={5}
        actions={(row) => {
          const commande = commandes.find((c) => c.id === row.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Voir les détails"
                onClick={() => {
                  setSelectedCommande(commande || null);
                  commandeDetailsModal.open();
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              {row.statut === "En attente" && (
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  title="Marquer comme reçue"
                  onClick={() => showToast(`Commande ${row.id} marquée comme reçue !`, "success")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {row.statut !== "Reçue" && row.statut !== "Annulée" && (
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  title="Annuler la commande"
                  onClick={() => {
                    if (confirm(`⚠️ Annuler la commande ${row.id} ?\n\nCette action est irréversible.`)) {
                      showToast(`Commande ${row.id} annulée`, "warning");
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        }}
      />

      {/* Add Modal */}
      <Modal
        isOpen={newCommandeModal.isOpen}
        onClose={closeNewCommandeModal}
        title="Nouvelle commande"
        size="lg"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (orderLines.length === 0) {
              showToast("Veuillez ajouter au moins un produit à la commande", "warning");
              return;
            }
            showToast("Commande créée avec succès !", "success");
            closeNewCommandeModal();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fournisseur</label>
            <Select
              value=""
              onChange={() => { }}
              options={fournisseurs.filter((f) => f.statut === "actif").map((f) => ({ value: String(f.id), label: f.nom }))}
              placeholder="Sélectionner un fournisseur"
            />
          </div>

          <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Produits à commander</h4>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => productSelectModal.open()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {orderLines.length === 0 ? (
              <div className="text-center py-4">
                <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun produit ajouté</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderLines.map((line, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{line.product.nom}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(line.prixAchat)} x {line.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (line.quantity > 1) {
                              setOrderLines(orderLines.map((l, i) =>
                                i === index ? { ...l, quantity: l.quantity - 1 } : l
                              ));
                            }
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          <Minus className="w-4 h-4 text-slate-400" />
                        </button>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            setOrderLines(orderLines.map((l, i) =>
                              i === index ? { ...l, quantity: qty } : l
                            ));
                          }}
                          className="w-16 text-center border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setOrderLines(orderLines.map((l, i) =>
                              i === index ? { ...l, quantity: l.quantity + 1 } : l
                            ));
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          <Plus className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-white w-28 text-right">
                        {formatCurrency(line.prixAchat * line.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOrderLines(orderLines.filter((_, i) => i !== index))}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={closeNewCommandeModal}>
              Annuler
            </Button>
            <Button type="submit">Créer la commande</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
