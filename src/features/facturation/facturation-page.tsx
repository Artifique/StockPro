"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  FileText,
  X,
  Search,
  Eye,
  Trash2,
  Plus,
  Download,
  Filter,
  Send,
  Check,
  Minus,
} from "lucide-react";
import {
  MOCK_CLIENTS,
  MOCK_FACTURES,
  MOCK_PRODUCTS,
} from "@/data/stock-mock";
import { formatCurrency } from "@/lib/format";
import { loadJsPdf } from "@/lib/pdf";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select } from "@/components/stock-pro/primitives";

type FactureRow = (typeof MOCK_FACTURES)[number];

async function generateInvoicePDF(facture: FactureRow) {
  const jsPDF = await loadJsPdf();
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(16);
  doc.text(`Facture ${facture.id}`, 20, y);
  y += 12;
  doc.setFontSize(11);
  doc.text(`Client: ${facture.client}`, 20, y);
  y += 8;
  doc.text(`Date: ${facture.date}`, 20, y);
  y += 8;
  doc.text(`Echeance: ${facture.echeance}`, 20, y);
  y += 8;
  doc.text(`Statut: ${facture.statut}`, 20, y);
  y += 12;
  doc.text(`Montant TTC: ${formatCurrency(facture.montant)}`, 20, y);
  doc.save(`${facture.id}.pdf`);
}

export const FacturationPage: React.FC = () => {
  const [filterStatut, setFilterStatut] = useState("");
  const newFactureModal = useDisclosure();
  const factureDetailsModal = useDisclosure();
  const productSelectModal = useDisclosure();
  const [selectedFacture, setSelectedFacture] = useState<FactureRow | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<{ product: typeof MOCK_PRODUCTS[0]; quantity: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const closeNewFactureModal = () => {
    newFactureModal.close();
    setInvoiceLines([]);
  };

  const closeProductSelectModal = () => {
    productSelectModal.close();
    setSelectedProductId("");
  };

  const stats = useMemo(() => {
    const total = MOCK_FACTURES.reduce((sum, f) => sum + f.montant, 0);
    const payees = MOCK_FACTURES.filter((f) => f.statut === "Payée").reduce((sum, f) => sum + f.montant, 0);
    const enAttente = MOCK_FACTURES.filter((f) => f.statut === "En attente").reduce((sum, f) => sum + f.montant, 0);
    const enRetard = MOCK_FACTURES.filter((f) => f.statut === "En retard").reduce((sum, f) => sum + f.montant, 0);
    return { total, payees, enAttente, enRetard };
  }, []);

  const filteredFactures = useMemo(() => {
    if (!filterStatut) return MOCK_FACTURES;
    return MOCK_FACTURES.filter((f) => f.statut === filterStatut);
  }, [filterStatut]);

  const columns = [
    { key: "id", label: "N° Facture", sortable: true },
    { key: "client", label: "Client", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "echeance", label: "Échéance", sortable: true },
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
        const statusStyles: Record<string, { variant: "success" | "warning" | "danger" | "default" }> = {
          Payée: { variant: "success" },
          "En attente": { variant: "warning" },
          "En retard": { variant: "danger" },
          Annulée: { variant: "default" },
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
          <h2 className="text-2xl font-bold text-foreground">Facturation</h2>
          <p className="text-muted-foreground">Gérez vos factures et encaissements</p>
        </div>
        <Button onClick={() => newFactureModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.total)}</p>
          <p className="text-sm text-muted-foreground">Total facturé</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{formatCurrency(stats.payees)}</p>
          <p className="text-sm text-muted-foreground">Payées</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-low-fg">{formatCurrency(stats.enAttente)}</p>
          <p className="text-sm text-muted-foreground">En attente</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-stockpro-stock-error-fg">{formatCurrency(stats.enRetard)}</p>
          <p className="text-sm text-muted-foreground">En retard</p>
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
              { value: "Payée", label: "Payée" },
              { value: "En attente", label: "En attente" },
              { value: "En retard", label: "En retard" },
              { value: "Annulée", label: "Annulée" },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <DataTable onToast={showToast}
        columns={columns}
        data={filteredFactures}
        title="Liste des factures"
        pageSize={5}
        exportOptions
        actions={(row) => {
          const facture = MOCK_FACTURES.find((f) => f.id === row.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Voir les détails"
                onClick={() => {
                  setSelectedFacture(facture || null);
                  factureDetailsModal.open();
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-navy dark:text-stockpro-signal hover:bg-stockpro-navy/8 dark:hover:bg-stockpro-signal/10"
                title="Télécharger PDF"
                onClick={() => {
                  if (facture) {
                    generateInvoicePDF(facture);
                    showToast(`PDF ${facture.id} téléchargé !`, "success");
                  }
                }}
              >
                <Download className="w-4 h-4" />
              </button>
              {(row.statut === "En attente" || row.statut === "En retard") && (
                <button
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-ok-fg hover:bg-stockpro-stock-ok-bg dark:hover:bg-stockpro-stock-ok-fg/10"
                  title="Marquer comme payée"
                  onClick={() => showToast(`Facture ${row.id} marquée comme payée !`, "success")}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-error-fg hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
                title="Envoyer par email"
                onClick={() => showToast(`Facture ${row.id} envoyée à ${row.client}`, "success")}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          );
        }}
      />

      {/* New Invoice Modal */}
      <Modal
        isOpen={newFactureModal.isOpen}
        onClose={closeNewFactureModal}
        title="Nouvelle facture"
        size="lg"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (invoiceLines.length === 0) {
              showToast("Veuillez ajouter au moins un produit à la facture", "warning");
              return;
            }
            showToast("Facture créée avec succès !", "success");
            closeNewFactureModal();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Client</label>
              <Select
                value=""
                onChange={() => { }}
                options={MOCK_CLIENTS.map((c) => ({ value: String(c.id), label: c.nom }))}
                placeholder="Sélectionner un client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date de facture</label>
              <Input type="date" required />
            </div>
          </div>

          <div className="border border-dashed border-border dark:border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Lignes de facturation</h4>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => productSelectModal.open()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un produit
              </Button>
            </div>

            {invoiceLines.length === 0 ? (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun produit ajouté</p>
                <p className="text-xs text-muted-foreground">Cliquez sur "Ajouter un produit" pour commencer</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoiceLines.map((line, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{line.product.nom}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(line.product.prixVente)} x {line.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (line.quantity > 1) {
                              setInvoiceLines(invoiceLines.map((l, i) =>
                                i === index ? { ...l, quantity: l.quantity - 1 } : l
                              ));
                            }
                          }}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <span className="w-8 text-center font-medium">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceLines(invoiceLines.map((l, i) =>
                              i === index ? { ...l, quantity: l.quantity + 1 } : l
                            ));
                          }}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="font-semibold text-foreground w-28 text-right">
                        {formatCurrency(line.product.prixVente * line.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setInvoiceLines(invoiceLines.filter((_, i) => i !== index))}
                        className="p-1 rounded text-stockpro-stock-error-fg hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-medium text-foreground">Total TTC</span>
                  <span className="text-xl font-bold text-stockpro-navy dark:text-stockpro-signal">
                    {formatCurrency(invoiceLines.reduce((sum, l) => sum + l.product.prixVente * l.quantity, 0))}
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
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {MOCK_PRODUCTS.filter(p =>
                    p.nom.toLowerCase().includes(selectedProductId.toLowerCase()) ||
                    p.sku.toLowerCase().includes(selectedProductId.toLowerCase())
                  ).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        const existing = invoiceLines.find(l => l.product.id === product.id);
                        if (existing) {
                          setInvoiceLines(invoiceLines.map(l =>
                            l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
                          ));
                        } else {
                          setInvoiceLines([...invoiceLines, { product, quantity: 1 }]);
                        }
                        closeProductSelectModal();
                        showToast(`${product.nom} ajouté à la facture`, "success");
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
                        <p className="font-semibold text-foreground">{formatCurrency(product.prixVente)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date d&apos;échéance</label>
              <Input type="date" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mode de paiement</label>
              <Select
                value=""
                onChange={() => { }}
                options={[
                  { value: "especes", label: "Espèces" },
                  { value: "carte", label: "Carte bancaire" },
                  { value: "virement", label: "Virement" },
                  { value: "mobile", label: "Mobile Money" },
                ]}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Notes ou conditions particulières..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={closeNewFactureModal}>
              Annuler
            </Button>
            <Button type="submit">Créer la facture</Button>
          </div>
        </form>
      </Modal>

      {/* Facture Details Modal */}
      <Modal isOpen={factureDetailsModal.isOpen} onClose={factureDetailsModal.close} title="Détails de la facture" size="lg">
        {selectedFacture && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedFacture.id}</h3>
                <p className="text-muted-foreground">{selectedFacture.client}</p>
              </div>
              <Badge variant={
                selectedFacture.statut === "Payée" ? "success" :
                  selectedFacture.statut === "En attente" ? "warning" :
                    selectedFacture.statut === "En retard" ? "danger" : "default"
              }>
                {selectedFacture.statut}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(selectedFacture.montant)}</p>
                <p className="text-xs text-muted-foreground">Montant TTC</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-foreground">{selectedFacture.date}</p>
                <p className="text-xs text-muted-foreground">Date facture</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-foreground">{selectedFacture.echeance}</p>
                <p className="text-xs text-muted-foreground">Échéance</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-lg font-bold text-foreground">30 jours</p>
                <p className="text-xs text-muted-foreground">Délai paiement</p>
              </Card>
            </div>

            {/* Simulated Lines */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Lignes de facturation</h4>
              <div className="space-y-2">
                {MOCK_PRODUCTS.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.nom}</p>
                        <p className="text-xs text-muted-foreground">Réf: {p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatCurrency(p.prixVente)}</p>
                      <p className="text-xs text-muted-foreground">x{i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="text-foreground">{formatCurrency(selectedFacture.montant * 0.84)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">TVA (18%)</span>
                <span className="text-foreground">{formatCurrency(selectedFacture.montant * 0.16)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span className="text-foreground">Total TTC</span>
                <span className="text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(selectedFacture.montant)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={factureDetailsModal.close}>
                Fermer
              </Button>
              <Button variant="outline" onClick={() => {
                generateInvoicePDF(selectedFacture);
                showToast(`PDF ${selectedFacture.id} téléchargé avec succès !`, "success");
              }}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => {
                showToast(`Facture ${selectedFacture.id} envoyée à ${selectedFacture.client}`, "success");
                factureDetailsModal.close();
              }}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};