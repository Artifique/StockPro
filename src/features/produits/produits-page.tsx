"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  X,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Heart,
} from "lucide-react";
import {
  CATEGORIES,
  MOCK_PRODUCTS,
  UNITES_MESURE,
} from "@/data/stock-mock";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select, ConfirmDialog } from "@/components/stock-pro/primitives";

export const ProduitsPage: React.FC<{
  favoriteProducts?: number[];
  onToggleFavorite?: (productId: number) => void;
  onViewProduct?: (productId: number) => void;
}> = ({ favoriteProducts = [], onToggleFavorite, onViewProduct }) => {
  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const detailsModal = useDisclosure();
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedStatut, setSelectedStatut] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [produits, setProduits] = useState(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [editFormData, setEditFormData] = useState({
    nom: "", categorie: "", prixAchat: 0, prixVente: 0, stock: 0, stockMin: 0, unite: "", description: "", tva: 18
  });

  // Form state for new product
  const [newProductCategorie, setNewProductCategorie] = useState("");
  const [newProductUnite, setNewProductUnite] = useState("");

  // Form validation state for new product - amélioration UX
  const [newProductFormTouched, setNewProductFormTouched] = useState(false);
  const [newProductNom, setNewProductNom] = useState("");
  const [newProductPrixAchat, setNewProductPrixAchat] = useState("");
  const [newProductPrixVente, setNewProductPrixVente] = useState("");
  const [newProductStock, setNewProductStock] = useState("");

  // Calculer la progression du formulaire
  const formProgress = useMemo(() => {
    const requiredFields = [
      newProductNom,
      newProductCategorie,
      newProductPrixAchat,
      newProductPrixVente,
      newProductStock,
      newProductUnite
    ];
    const filledFields = requiredFields.filter(field => field && field.toString().trim() !== "");
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }, [newProductNom, newProductCategorie, newProductPrixAchat, newProductPrixVente, newProductStock, newProductUnite]);

  const columns = [
    {
      key: "checkbox",
      label: "",
      render: () => null,
    },
    {
      key: "image",
      label: "Image",
      render: () => (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Package className="w-5 h-5 text-muted-foreground" />
        </div>
      ),
    },
    { key: "nom", label: "Nom", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { key: "categorie", label: "Catégorie", sortable: true },
    {
      key: "prixAchat",
      label: "Prix achat",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "prixVente",
      label: "Prix vente",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => {
        const stock = value as number;
        const stockMin = row.stockMin as number;
        let color = "text-stockpro-stock-ok-fg";
        if (stock === 0) color = "text-stockpro-stock-error-fg";
        else if (stock <= stockMin) color = "text-stockpro-stock-low-fg";
        return <span className={`font-semibold ${color}`}>{stock}</span>;
      },
    },
    {
      key: "statut",
      label: "Statut",
      render: (_: unknown, row: Record<string, unknown>) => {
        const stock = row.stock as number;
        const stockMin = row.stockMin as number;
        if (stock === 0) return <Badge variant="danger">Rupture</Badge>;
        if (stock <= stockMin) return <Badge variant="warning">Stock faible</Badge>;
        return <Badge variant="success">Disponible</Badge>;
      },
    },
  ];

  const filteredProduits = useMemo(() => {
    let result = [...produits];
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.nom.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.categorie.toLowerCase().includes(query)
      );
    }
    // Category filter
    if (selectedCategorie) {
      result = result.filter((p) => p.categorie === selectedCategorie);
    }
    // Status filter
    if (selectedStatut) {
      if (selectedStatut === "rupture") {
        result = result.filter((p) => p.stock === 0);
      } else if (selectedStatut === "critique") {
        result = result.filter((p) => p.stock > 0 && p.stock <= p.stockMin);
      } else if (selectedStatut === "disponible") {
        result = result.filter((p) => p.stock > p.stockMin);
      }
    }
    return result;
  }, [produits, searchQuery, selectedCategorie, selectedStatut]);

  const activeFiltersCount = [searchQuery, selectedCategorie, selectedStatut].filter(Boolean).length;

  const handleAddProduct = (data: Record<string, unknown>) => {
    const newProduct = {
      id: produits.length + 1,
      nom: data.nom as string,
      sku: `PRD-${String(produits.length + 1).padStart(3, "0")}`,
      categorie: data.categorie as string,
      prixAchat: data.prixAchat as number,
      prixVente: data.prixVente as number,
      stock: data.stock as number,
      stockMin: data.stockMin as number,
      unite: data.unite as string,
      description: data.description as string,
      tva: data.tva as number,
      image: null,
    };
    setProduits([...produits, newProduct]);
    addModal.close();
    showToast(`Produit "${newProduct.nom}" ajouté avec succès`, "success");
  };

  const resetNewProductForm = () => {
    setNewProductCategorie("");
    setNewProductUnite("");
    setNewProductNom("");
    setNewProductPrixAchat("");
    setNewProductPrixVente("");
    setNewProductStock("");
    setNewProductFormTouched(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Produits</h2>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <Button onClick={() => addModal.open()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Row */}
          <div className="flex flex-wrap gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Rechercher par nom, SKU ou catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                value={selectedCategorie}
                onChange={setSelectedCategorie}
                placeholder="Toutes les catégories"
                options={CATEGORIES.map((c) => ({ value: c.nom, label: c.nom }))}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                value={selectedStatut}
                onChange={setSelectedStatut}
                placeholder="Tous les statuts"
                options={[
                  { value: "disponible", label: "Disponible" },
                  { value: "critique", label: "Stock faible" },
                  { value: "rupture", label: "Rupture" },
                ]}
              />
            </div>
          </div>
          {/* Active Filters & Clear Button */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>{activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""} actif{activeFiltersCount > 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-stockpro-navy dark:text-stockpro-signal">{filteredProduits.length} produit{filteredProduits.length > 1 ? "s" : ""}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategorie("");
                  setSelectedStatut("");
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <DataTable onToast={showToast}
        columns={columns}
        data={filteredProduits.map((p) => ({ ...p, checkbox: null, statut: null }))}
        title="Liste des produits"
        pageSize={10}
        emptyMessage={
          activeFiltersCount > 0
            ? `Aucun produit ne correspond à vos filtres`
            : "Aucun produit dans le catalogue"
        }
        selectable
        actions={(row) => {
          const product = produits.find((p) => p.nom === row.nom);
          const isFavorite = product ? favoriteProducts.includes(product.id) : false;
          return (
            <div className="flex items-center justify-end gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`rounded-lg p-1.5 transition-colors ${isFavorite
                  ? "bg-stockpro-stock-error-bg text-stockpro-stock-error-fg dark:bg-stockpro-stock-error-fg/12"
                  : "text-muted-foreground hover:bg-stockpro-stock-error-bg hover:text-stockpro-stock-error-fg dark:hover:bg-stockpro-stock-error-fg/12"
                  }`}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                onClick={() => {
                  if (product) {
                    onToggleFavorite?.(product.id);
                    onViewProduct?.(product.id);
                  }
                }}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
              </motion.button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Voir les détails"
                onClick={() => {
                  setSelectedProduct(product || null);
                  detailsModal.open();
                  if (product) {
                    onViewProduct?.(product.id);
                  }
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-stockpro-signal/10 hover:text-stockpro-navy dark:hover:bg-stockpro-signal/15 dark:hover:text-stockpro-signal"
                title="Modifier le produit"
                onClick={() => {
                  if (product) {
                    setSelectedProduct(product);
                    setEditFormData({
                      nom: product.nom,
                      categorie: product.categorie,
                      prixAchat: product.prixAchat,
                      prixVente: product.prixVente,
                      stock: product.stock,
                      stockMin: product.stockMin,
                      unite: product.unite,
                      description: product.description,
                      tva: product.tva,
                    });
                    editModal.open();
                  }
                }}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-stockpro-stock-error-fg hover:bg-stockpro-stock-error-bg dark:hover:bg-stockpro-stock-error-fg/12"
                title="Supprimer le produit"
                onClick={() => {
                  setSelectedProduct(product || null);
                  deleteDialog.open();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }}
      />

      {/* Add Product Modal */}
      <Modal isOpen={addModal.isOpen} onClose={() => {
        addModal.close();
        resetNewProductForm();
      }} title="Nouveau produit" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNewProductFormTouched(true);
            if (!newProductNom || !newProductCategorie || !newProductPrixAchat || !newProductPrixVente || !newProductStock || !newProductUnite) {
              showToast("Veuillez remplir tous les champs obligatoires", "error");
              return;
            }
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            handleAddProduct({
              ...data,
              nom: newProductNom,
              categorie: newProductCategorie,
              unite: newProductUnite,
              prixAchat: Number(newProductPrixAchat),
              prixVente: Number(newProductPrixVente),
              stock: Number(newProductStock),
              stockMin: Number(data.stockMin) || 0,
              tva: Number(data.tva) || 18,
            });
            resetNewProductForm();
          }}
          className="space-y-4"
        >
          {/* Indicateur de progression du formulaire - Amélioration UX */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Progression du formulaire
              </span>
              <span className={`text-xs font-bold ${formProgress === 100 ? 'text-stockpro-stock-ok-fg' : 'text-muted-foreground'}`}>
                {formProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                className={`h-full rounded-full transition-colors ${formProgress === 100
                  ? 'bg-stockpro-signal'
                  : formProgress >= 50
                    ? 'bg-stockpro-stock-low-fg'
                    : 'bg-stockpro-stock-error-fg'
                  }`}
              />
            </div>
            {formProgress < 100 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {6 - Math.round(formProgress / 16.67)} champ(s) obligatoire(s) restant(s)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nom du produit <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input
                name="nom"
                placeholder="Ex: Riz Premium 5kg"
                value={newProductNom}
                onChange={(e) => {
                  setNewProductNom(e.target.value);
                  setNewProductFormTouched(true);
                }}
                error={newProductFormTouched && !newProductNom ? "Le nom est requis" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Catégorie <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Select
                value={newProductCategorie}
                onChange={(v) => {
                  setNewProductCategorie(v);
                  setNewProductFormTouched(true);
                }}
                options={CATEGORIES.map((c) => ({ value: c.nom, label: c.nom }))}
                placeholder="Sélectionner une catégorie"
                required
              />
              {newProductFormTouched && !newProductCategorie && (
                <p className="text-xs text-stockpro-stock-error-fg mt-1">La catégorie est requise</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prix d&apos;achat (FCFA) <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input
                name="prixAchat"
                type="number"
                placeholder="Ex: 3500"
                min={0}
                value={newProductPrixAchat}
                onChange={(e) => {
                  setNewProductPrixAchat(e.target.value);
                  setNewProductFormTouched(true);
                }}
                error={newProductFormTouched && !newProductPrixAchat ? "Le prix d'achat est requis" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prix de vente (FCFA) <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input
                name="prixVente"
                type="number"
                placeholder="Ex: 4500"
                min={0}
                value={newProductPrixVente}
                onChange={(e) => {
                  setNewProductPrixVente(e.target.value);
                  setNewProductFormTouched(true);
                }}
                error={newProductFormTouched && !newProductPrixVente ? "Le prix de vente est requis" : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Stock initial <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Input
                name="stock"
                type="number"
                placeholder="Ex: 100"
                min={0}
                value={newProductStock}
                onChange={(e) => {
                  setNewProductStock(e.target.value);
                  setNewProductFormTouched(true);
                }}
                error={newProductFormTouched && !newProductStock ? "Le stock est requis" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Stock minimum <span className="text-muted-foreground text-xs">(alerte)</span>
              </label>
              <Input name="stockMin" type="number" placeholder="Ex: 10" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Unité <span className="text-stockpro-stock-error-fg">*</span>
              </label>
              <Select
                value={newProductUnite}
                onChange={(v) => {
                  setNewProductUnite(v);
                  setNewProductFormTouched(true);
                }}
                options={UNITES_MESURE.map((u) => ({ value: u.nom, label: `${u.nom} (${u.abreviation})` }))}
                placeholder="Sélectionner"
                required
              />
              {newProductFormTouched && !newProductUnite && (
                <p className="text-xs text-stockpro-stock-error-fg mt-1">L'unité est requise</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description <span className="text-muted-foreground text-xs">(optionnel)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Description du produit..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { addModal.close(); resetNewProductForm(); }}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={editModal.isOpen} onClose={() => editModal.close()} title="Modifier le produit" size="lg">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedProduct) {
              setProduits(produits.map((p) =>
                p.id === selectedProduct.id
                  ? { ...p, ...editFormData, prixAchat: Number(editFormData.prixAchat), prixVente: Number(editFormData.prixVente), stock: Number(editFormData.stock), stockMin: Number(editFormData.stockMin), tva: Number(editFormData.tva) }
                  : p
              ));
              showToast(`Produit "${editFormData.nom}" modifié avec succès`, "success");
              editModal.close();
            }
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom du produit</label>
              <Input
                value={editFormData.nom}
                onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
              <Select
                value={editFormData.categorie}
                onChange={(v) => setEditFormData({ ...editFormData, categorie: v })}
                options={CATEGORIES.map((c) => ({ value: c.nom, label: c.nom }))}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix d&apos;achat (FCFA)</label>
              <Input
                type="number"
                value={editFormData.prixAchat}
                onChange={(e) => setEditFormData({ ...editFormData, prixAchat: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix de vente (FCFA)</label>
              <Input
                type="number"
                value={editFormData.prixVente}
                onChange={(e) => setEditFormData({ ...editFormData, prixVente: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <Input
                type="number"
                value={editFormData.stock}
                onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock minimum</label>
              <Input
                type="number"
                value={editFormData.stockMin}
                onChange={(e) => setEditFormData({ ...editFormData, stockMin: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unité</label>
              <Select
                value={editFormData.unite}
                onChange={(v) => setEditFormData({ ...editFormData, unite: v })}
                options={UNITES_MESURE.map((u) => ({ value: u.nom, label: `${u.nom} (${u.abreviation})` }))}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => editModal.close()}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => deleteDialog.close()}
        onConfirm={() => {
          if (selectedProduct) {
            setProduits(produits.filter((p) => p.id !== selectedProduct.id));
            showToast(`Produit "${selectedProduct.nom}" supprimé avec succès`, "success");
          }
        }}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedProduct?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
      />

      {/* Product Details Modal */}
      <Modal isOpen={detailsModal.isOpen} onClose={() => detailsModal.close()} title="Détails du produit" size="lg">
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedProduct.nom}</h3>
                <p className="text-muted-foreground">SKU: {selectedProduct.sku}</p>
                <Badge variant={selectedProduct.stock > selectedProduct.stockMin ? "success" : selectedProduct.stock === 0 ? "danger" : "warning"} className="mt-2">
                  {selectedProduct.stock > selectedProduct.stockMin ? "Disponible" : selectedProduct.stock === 0 ? "Rupture" : "Stock faible"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-foreground">{selectedProduct.stock}</p>
                <p className="text-xs text-muted-foreground">Stock actuel</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-stock-low-fg">{selectedProduct.stockMin}</p>
                <p className="text-xs text-muted-foreground">Stock min.</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedProduct.prixAchat)}</p>
                <p className="text-xs text-muted-foreground">Prix achat</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{formatCurrency(selectedProduct.prixVente)}</p>
                <p className="text-xs text-muted-foreground">Prix vente</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Catégorie</p>
                <p className="font-medium text-foreground">{selectedProduct.categorie}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Unité</p>
                <p className="font-medium text-foreground">{selectedProduct.unite}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">TVA</p>
                <p className="font-medium text-foreground">{selectedProduct.tva}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Marge</p>
                <p className="font-medium text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">
                  {(((selectedProduct.prixVente - selectedProduct.prixAchat) / selectedProduct.prixAchat) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {selectedProduct.description && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{selectedProduct.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => detailsModal.close()}>
                Fermer
              </Button>
              <Button onClick={() => {
                detailsModal.close();
                setEditFormData({
                  nom: selectedProduct.nom,
                  categorie: selectedProduct.categorie,
                  prixAchat: selectedProduct.prixAchat,
                  prixVente: selectedProduct.prixVente,
                  stock: selectedProduct.stock,
                  stockMin: selectedProduct.stockMin,
                  unite: selectedProduct.unite,
                  description: selectedProduct.description,
                  tva: selectedProduct.tva,
                });
                editModal.open();
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 CLIENTS PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
