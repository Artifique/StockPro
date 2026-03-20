"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  X,
  Search,
  Eye,
  Trash2,
  Plus,
  Filter,
  Check,
  Minus,
} from "lucide-react";
import {
  MOCK_COMMANDES,
  MOCK_FOURNISSEURS,
  MOCK_PRODUCTS,
} from "@/data/stock-mock";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";

export const AchatsPage: React.FC = () => {
  const newCommandeModal = useDisclosure();
  const commandeDetailsModal = useDisclosure();
  const productSelectModal = useDisclosure();
  const [selectedCommande, setSelectedCommande] = useState<typeof MOCK_COMMANDES[0] | null>(null);
  const [filterStatut, setFilterStatut] = useState("");
  const [orderLines, setOrderLines] = useState<{ product: typeof MOCK_PRODUCTS[0]; quantity: number; prixAchat: number }[]>([]);
  const [searchProduct, setSearchProduct] = useState("");

  const closeNewCommandeModal = () => {
    newCommandeModal.close();
    setOrderLines([]);
  };

  const closeProductSelectModal = () => {
    productSelectModal.close();
    setSearchProduct("");
  };

  const stats = useMemo(() => {
    const total = MOCK_COMMANDES.reduce((sum, c) => sum + c.montant, 0);
    const enAttente = MOCK_COMMANDES.filter((c) => c.statut === "En attente" || c.statut === "En transit").length;
    const recues = MOCK_COMMANDES.filter((c) => c.statut === "Reçue").length;
    return { total, enAttente, recues };
  }, []);

  const filteredCommandes = useMemo(() => {
    if (!filterStatut) return MOCK_COMMANDES;
    return MOCK_COMMANDES.filter((c) => c.statut === filterStatut);
  }, [filterStatut]);

  const columns = [
    { key: "id", label: "N° Commande", sortable: true },
    { key: "fournisseur", label: "Fournisseur", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "produits", label: "Produits", render: (value: unknown) => `${value} articles` },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (value: unknown) => {
        const statusStyles: Record<string, { variant: "success" | "warning" | "info" | "danger" }> = {
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
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{MOCK_COMMANDES.length}</p>
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
        data={filteredCommandes}
        title="Liste des commandes"
        pageSize={5}
        actions={(row) => {
          const commande = MOCK_COMMANDES.find((c) => c.id === row.id);
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
              options={MOCK_FOURNISSEURS.filter((f) => f.statut === "actif").map((f) => ({ value: String(f.id), label: f.nom }))}
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

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-600">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Total</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(orderLines.reduce((sum, l) => sum + l.prixAchat * l.quantity, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection Modal */}
          {productSelectModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800 dark:text-white">Sélectionner un produit</h4>
                  <button type="button" onClick={closeProductSelectModal} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <Input
                    placeholder="Rechercher un produit..."
                    icon={<Search className="w-4 h-4" />}
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {MOCK_PRODUCTS.filter(p =>
                    p.nom.toLowerCase().includes(searchProduct.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
                  ).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        const existing = orderLines.find(l => l.product.id === product.id);
                        if (existing) {
                          setOrderLines(orderLines.map(l =>
                            l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
                          ));
                        } else {
                          setOrderLines([...orderLines, { product, quantity: 1, prixAchat: product.prixAchat }]);
                        }
                        closeProductSelectModal();
                        showToast(`${product.nom} ajouté à la commande`, "success");
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 dark:text-white">{product.nom}</p>
                        <p className="text-xs text-slate-500">{product.sku} • {product.categorie}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800 dark:text-white">{formatCurrency(product.prixAchat)}</p>
                        <p className="text-xs text-slate-500">Prix d'achat</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de commande</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de livraison prévue</label>
              <Input type="date" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Instructions spéciales..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={closeNewCommandeModal}>
              Annuler
            </Button>
            <Button type="submit">Créer la commande</Button>
          </div>
        </form>
      </Modal>

      {/* Commande Details Modal */}
      <Modal isOpen={commandeDetailsModal.isOpen} onClose={commandeDetailsModal.close} title="Détails de la commande" size="lg">
        {selectedCommande && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{selectedCommande.id}</h3>
                <p className="text-slate-500 dark:text-slate-400">{selectedCommande.fournisseur}</p>
              </div>
              <Badge variant={
                selectedCommande.statut === "Reçue" ? "success" :
                  selectedCommande.statut === "En transit" ? "info" :
                    selectedCommande.statut === "En attente" ? "warning" : "danger"
              }>
                {selectedCommande.statut}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedCommande.produits}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Articles</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedCommande.montant)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Montant</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white">{selectedCommande.date}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Date commande</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white">{selectedCommande.statut === "Reçue" ? "Livrée" : "En cours"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Statut livraison</p>
              </Card>
            </div>

            {/* Progress */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progression</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedCommande.statut === "Reçue" ? "100%" : selectedCommande.statut === "En transit" ? "75%" : "25%"}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: selectedCommande.statut === "Reçue" ? "100%" : selectedCommande.statut === "En transit" ? "75%" : "25%" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Commandée</span>
                <span>En transit</span>
                <span>Reçue</span>
              </div>
            </div>

            {/* Simulated Products */}
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-3">Produits commandés</h4>
              <div className="space-y-2">
                {MOCK_PRODUCTS.slice(0, selectedCommande.produits).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{formatCurrency(p.prixAchat)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">x{((i + p.id) % 10) + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" onClick={commandeDetailsModal.close}>
                Fermer
              </Button>
              {selectedCommande.statut !== "Reçue" && selectedCommande.statut !== "Annulée" && (
                <Button onClick={() => {
                  if (confirm(`Confirmer la réception de ${selectedCommande.id} ?\n\nLes produits seront ajoutés au stock.`)) {
                    showToast(`✅ Commande ${selectedCommande.id} marquée comme reçue ! Stock mis à jour.`, "success");
                    commandeDetailsModal.close();
                  }
                }}>
                  <Check className="w-4 h-4 mr-2" />
                  Marquer comme reçue
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
