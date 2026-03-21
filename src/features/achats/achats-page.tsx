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
          <h2 className="text-2xl font-bold text-foreground">Achats & Commandes</h2>
          <p className="text-muted-foreground">Gérez vos commandes fournisseurs</p>
        </div>
        <Button onClick={() => newCommandeModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">{MOCK_COMMANDES.length}</p>
          <p className="text-sm text-muted-foreground">Total commandes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-low-fg">{stats.enAttente}</p>
          <p className="text-sm text-muted-foreground">En attente</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{stats.recues}</p>
          <p className="text-sm text-muted-foreground">Reçues</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(stats.total)}</p>
          <p className="text-sm text-muted-foreground">Montant total</p>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
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
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-ok-fg hover:bg-stockpro-stock-ok-bg dark:hover:bg-stockpro-stock-ok-fg/10"
                  title="Marquer comme reçue"
                  onClick={() => showToast(`Commande ${row.id} marquée comme reçue !`, "success")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {row.statut !== "Reçue" && row.statut !== "Annulée" && (
                <button
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-error-fg hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
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
            <label className="block text-sm font-medium text-foreground mb-1">Fournisseur</label>
            <Select
              value=""
              onChange={() => { }}
              options={MOCK_FOURNISSEURS.filter((f) => f.statut === "actif").map((f) => ({ value: String(f.id), label: f.nom }))}
              placeholder="Sélectionner un fournisseur"
            />
          </div>

          <div className="border border-dashed border-border dark:border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Produits à commander</h4>
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
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun produit ajouté</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderLines.map((line, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{line.product.nom}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(line.prixAchat)} x {line.quantity}</p>
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
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Minus className="w-4 h-4 text-muted-foreground" />
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
                          className="w-16 text-center border border-border rounded px-2 py-1 text-sm bg-card"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setOrderLines(orderLines.map((l, i) =>
                              i === index ? { ...l, quantity: l.quantity + 1 } : l
                            ));
                          }}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="font-semibold text-foreground w-28 text-right">
                        {formatCurrency(line.prixAchat * line.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOrderLines(orderLines.filter((_, i) => i !== index))}
                        className="p-1 rounded text-stockpro-stock-error-fg hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-lg font-bold text-stockpro-navy dark:text-stockpro-signal">
                    {formatCurrency(orderLines.reduce((sum, l) => sum + l.prixAchat * l.quantity, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection Modal */}
          {productSelectModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">Sélectionner un produit</h4>
                  <button type="button" onClick={closeProductSelectModal} className="p-1 rounded hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 border-b border-border">
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
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left border-b border-border last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{product.nom}</p>
                        <p className="text-xs text-muted-foreground">{product.sku} • {product.categorie}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(product.prixAchat)}</p>
                        <p className="text-xs text-muted-foreground">Prix d'achat</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date de commande</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date de livraison prévue</label>
              <Input type="date" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Instructions spéciales..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                <h3 className="text-xl font-semibold text-foreground">{selectedCommande.id}</h3>
                <p className="text-muted-foreground">{selectedCommande.fournisseur}</p>
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
                <p className="text-2xl font-bold text-foreground">{selectedCommande.produits}</p>
                <p className="text-xs text-muted-foreground">Articles</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(selectedCommande.montant)}</p>
                <p className="text-xs text-muted-foreground">Montant</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-foreground">{selectedCommande.date}</p>
                <p className="text-xs text-muted-foreground">Date commande</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-foreground">{selectedCommande.statut === "Reçue" ? "Livrée" : "En cours"}</p>
                <p className="text-xs text-muted-foreground">Statut livraison</p>
              </Card>
            </div>

            {/* Progress */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progression</span>
                <span className="text-sm text-muted-foreground">
                  {selectedCommande.statut === "Reçue" ? "100%" : selectedCommande.statut === "En transit" ? "75%" : "25%"}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-stockpro-signal transition-all duration-500"
                  style={{ width: selectedCommande.statut === "Reçue" ? "100%" : selectedCommande.statut === "En transit" ? "75%" : "25%" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Commandée</span>
                <span>En transit</span>
                <span>Reçue</span>
              </div>
            </div>

            {/* Simulated Products */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Produits commandés</h4>
              <div className="space-y-2">
                {MOCK_PRODUCTS.slice(0, selectedCommande.produits).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.nom}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatCurrency(p.prixAchat)}</p>
                      <p className="text-xs text-muted-foreground">x{((i + p.id) % 10) + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
