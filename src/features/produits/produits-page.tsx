"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Card, DataTable, Input, Modal } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Select, ConfirmDialog } from "@/components/stock-pro/primitives";
import { ProductService } from "@/services/product.service";
import { Product, Category, Unit } from "@/models/product.model";

export const ProduitsPage: React.FC<{
  favoriteProducts?: number[];
  onToggleFavorite?: (productId: number) => void;
  onViewProduct?: (productId: number) => void;
}> = ({ favoriteProducts = [], onToggleFavorite, onViewProduct }) => {
  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteDialog = useDisclosure();
  const detailsModal = useDisclosure();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [produits, setProduits] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedStatut, setSelectedStatut] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});

  // Form state for new product
  const [newProductFormTouched, setNewProductFormTouched] = useState(false);
  const [newProductNom, setNewProductNom] = useState("");
  const [newProductCategorieId, setNewProductCategorieId] = useState("");
  const [newProductUniteId, setNewProductUniteId] = useState("");
  const [newProductPrixAchat, setNewProductPrixAchat] = useState("");
  const [newProductPrixVente, setNewProductPrixVente] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductStockMin, setNewProductStockMin] = useState("10");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductTva, setNewProductTva] = useState("18");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, c, u] = await Promise.all([
        ProductService.getAll(),
        ProductService.getCategories(),
        ProductService.getUnits()
      ]);
      setProduits(p);
      setCategories(c);
      setUnits(u);
    } catch (error) {
      showToast("Erreur lors du chargement des données", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formProgress = useMemo(() => {
    const requiredFields = [
      newProductNom,
      newProductCategorieId,
      newProductPrixAchat,
      newProductPrixVente,
      newProductStock,
      newProductUniteId
    ];
    const filledFields = requiredFields.filter(field => field && field.toString().trim() !== "");
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }, [newProductNom, newProductCategorieId, newProductPrixAchat, newProductPrixVente, newProductStock, newProductUniteId]);

  const columns = [
    { key: "checkbox", label: "", render: () => null },
    {
      key: "image_url",
      label: "Image",
      render: (value: unknown) => (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {value ? (
            <img src={value as string} alt="Produit" className="w-full h-full object-cover" />
          ) : (
            <Package className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      ),
    },
    { key: "nom", label: "Nom", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { 
      key: "category", 
      label: "Catégorie", 
      sortable: true,
      render: (value: unknown) => (value as Category)?.nom || "-"
    },
    {
      key: "prix_achat",
      label: "Prix achat",
      sortable: true,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: "prix_vente",
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
        const stockMin = row.stock_min as number;
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
        const stockMin = row.stock_min as number;
        if (stock === 0) return <Badge variant="danger">Rupture</Badge>;
        if (stock <= stockMin) return <Badge variant="warning">Stock faible</Badge>;
        return <Badge variant="success">Disponible</Badge>;
      },
    },
  ];

  const filteredProduits = useMemo(() => {
    let result = [...produits];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.nom.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category?.nom.toLowerCase().includes(query)
      );
    }
    if (selectedCategorie) {
      result = result.filter((p) => p.category_id?.toString() === selectedCategorie);
    }
    if (selectedStatut) {
      if (selectedStatut === "rupture") result = result.filter((p) => p.stock === 0);
      else if (selectedStatut === "critique") result = result.filter((p) => p.stock > 0 && p.stock <= p.stock_min);
      else if (selectedStatut === "disponible") result = result.filter((p) => p.stock > p.stock_min);
    }
    return result;
  }, [produits, searchQuery, selectedCategorie, selectedStatut]);

  const activeFiltersCount = [searchQuery, selectedCategorie, selectedStatut].filter(Boolean).length;

  const handleAddProduct = async () => {
    setNewProductFormTouched(true);
    if (!newProductNom || !newProductCategorieId || !newProductPrixAchat || !newProductPrixVente || !newProductStock || !newProductUniteId) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    try {
      const sku = `PRD-${Date.now().toString().slice(-6)}`;
      await ProductService.create({
        nom: newProductNom,
        sku,
        category_id: parseInt(newProductCategorieId),
        unit_id: parseInt(newProductUniteId),
        prix_achat: parseFloat(newProductPrixAchat),
        prix_vente: parseFloat(newProductPrixVente),
        stock: parseInt(newProductStock),
        stock_min: parseInt(newProductStockMin),
        tva: parseFloat(newProductTva),
        description: newProductDescription,
        image_url: null,
      });
      showToast(`Produit "${newProductNom}" ajouté avec succès`, "success");
      addModal.close();
      resetNewProductForm();
      loadData();
    } catch (error) {
      showToast("Erreur lors de l'ajout du produit", "error");
      console.error(error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      await ProductService.update(selectedProduct.id, {
        nom: editFormData.nom,
        category_id: editFormData.category_id,
        unit_id: editFormData.unit_id,
        prix_achat: editFormData.prix_achat,
        prix_vente: editFormData.prix_vente,
        stock: editFormData.stock,
        stock_min: editFormData.stock_min,
        tva: editFormData.tva,
        description: editFormData.description,
      });
      showToast(`Produit "${editFormData.nom}" modifié avec succès`, "success");
      editModal.close();
      loadData();
    } catch (error) {
      showToast("Erreur lors de la modification", "error");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await ProductService.delete(selectedProduct.id);
      showToast(`Produit "${selectedProduct.nom}" supprimé`, "success");
      loadData();
    } catch (error) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const resetNewProductForm = () => {
    setNewProductCategorieId("");
    setNewProductUniteId("");
    setNewProductNom("");
    setNewProductPrixAchat("");
    setNewProductPrixVente("");
    setNewProductStock("");
    setNewProductStockMin("10");
    setNewProductTva("18");
    setNewProductDescription("");
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
          <div className="flex flex-wrap gap-4">
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
                options={categories.map((c) => ({ value: c.id.toString(), label: c.nom }))}
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
        isLoading={isLoading}
        emptyMessage={
          activeFiltersCount > 0
            ? `Aucun produit ne correspond à vos filtres`
            : "Aucun produit dans le catalogue"
        }
        selectable
        actions={(row) => {
          const product = produits.find((p) => p.id === (row as any).id);
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
                      category_id: product.category_id,
                      prix_achat: product.prix_achat,
                      prix_vente: product.prix_vente,
                      stock: product.stock,
                      stock_min: product.stock_min,
                      unit_id: product.unit_id,
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
            handleAddProduct();
          }}
          className="space-y-4"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Progression du formulaire</span>
              <span className={`text-xs font-bold ${formProgress === 100 ? 'text-stockpro-stock-ok-fg' : 'text-muted-foreground'}`}>
                {formProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                className={`h-full rounded-full transition-colors ${formProgress === 100 ? 'bg-stockpro-signal' : 'bg-stockpro-stock-low-fg'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom du produit *</label>
              <Input
                placeholder="Ex: Riz Premium 5kg"
                value={newProductNom}
                onChange={(e) => setNewProductNom(e.target.value)}
                error={newProductFormTouched && !newProductNom ? "Le nom est requis" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Catégorie *</label>
              <Select
                value={newProductCategorieId}
                onChange={setNewProductCategorieId}
                options={categories.map((c) => ({ value: c.id.toString(), label: c.nom }))}
                placeholder="Sélectionner une catégorie"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix d&apos;achat (FCFA) *</label>
              <Input
                type="number"
                placeholder="Ex: 3500"
                value={newProductPrixAchat}
                onChange={(e) => setNewProductPrixAchat(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix de vente (FCFA) *</label>
              <Input
                type="number"
                placeholder="Ex: 4500"
                value={newProductPrixVente}
                onChange={(e) => setNewProductPrixVente(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock initial *</label>
              <Input
                type="number"
                placeholder="Ex: 100"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock minimum</label>
              <Input 
                type="number" 
                value={newProductStockMin}
                onChange={(e) => setNewProductStockMin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unité *</label>
              <Select
                value={newProductUniteId}
                onChange={setNewProductUniteId}
                options={units.map((u) => ({ value: u.id.toString(), label: `${u.nom} (${u.abreviation})` }))}
                placeholder="Sélectionner"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              rows={3}
              value={newProductDescription}
              onChange={(e) => setNewProductDescription(e.target.value)}
              placeholder="Description du produit..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { addModal.close(); resetNewProductForm(); }}>Annuler</Button>
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
            handleUpdateProduct();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom du produit</label>
              <Input
                value={editFormData.nom || ""}
                onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
              <Select
                value={editFormData.category_id?.toString() || ""}
                onChange={(v) => setEditFormData({ ...editFormData, category_id: parseInt(v) })}
                options={categories.map((c) => ({ value: c.id.toString(), label: c.nom }))}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix d&apos;achat (FCFA)</label>
              <Input
                type="number"
                value={editFormData.prix_achat || 0}
                onChange={(e) => setEditFormData({ ...editFormData, prix_achat: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix de vente (FCFA)</label>
              <Input
                type="number"
                value={editFormData.prix_vente || 0}
                onChange={(e) => setEditFormData({ ...editFormData, prix_vente: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <Input
                type="number"
                value={editFormData.stock || 0}
                onChange={(e) => setEditFormData({ ...editFormData, stock: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock minimum</label>
              <Input
                type="number"
                value={editFormData.stock_min || 0}
                onChange={(e) => setEditFormData({ ...editFormData, stock_min: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unité</label>
              <Select
                value={editFormData.unit_id?.toString() || ""}
                onChange={(v) => setEditFormData({ ...editFormData, unit_id: parseInt(v) })}
                options={units.map((u) => ({ value: u.id.toString(), label: `${u.nom} (${u.abreviation})` }))}
                placeholder="Sélectionner"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editFormData.description || ""}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-stockpro-signal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => editModal.close()}>Annuler</Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => deleteDialog.close()}
        onConfirm={handleDeleteProduct}
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
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt="Produit" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedProduct.nom}</h3>
                <p className="text-muted-foreground">SKU: {selectedProduct.sku}</p>
                <Badge variant={selectedProduct.stock > selectedProduct.stock_min ? "success" : selectedProduct.stock === 0 ? "danger" : "warning"} className="mt-2">
                  {selectedProduct.stock > selectedProduct.stock_min ? "Disponible" : selectedProduct.stock === 0 ? "Rupture" : "Stock faible"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-foreground">{selectedProduct.stock}</p>
                <p className="text-xs text-muted-foreground">Stock actuel</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-stock-low-fg">{selectedProduct.stock_min}</p>
                <p className="text-xs text-muted-foreground">Stock min.</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedProduct.prix_achat)}</p>
                <p className="text-xs text-muted-foreground">Prix achat</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">{formatCurrency(selectedProduct.prix_vente)}</p>
                <p className="text-xs text-muted-foreground">Prix vente</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Catégorie</p>
                <p className="font-medium text-foreground">{selectedProduct.category?.nom || "-"}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Unité</p>
                <p className="font-medium text-foreground">{selectedProduct.unit?.nom || "-"}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">TVA</p>
                <p className="font-medium text-foreground">{selectedProduct.tva}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Marge</p>
                <p className="font-medium text-stockpro-stock-ok-fg dark:text-stockpro-stock-ok-fg">
                  {(((selectedProduct.prix_vente - selectedProduct.prix_achat) / selectedProduct.prix_achat) * 100).toFixed(1)}%
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
              <Button variant="outline" onClick={() => detailsModal.close()}>Fermer</Button>
              <Button onClick={() => {
                detailsModal.close();
                setEditFormData({
                  nom: selectedProduct.nom,
                  category_id: selectedProduct.category_id,
                  prix_achat: selectedProduct.prix_achat,
                  prix_vente: selectedProduct.prix_vente,
                  stock: selectedProduct.stock,
                  stock_min: selectedProduct.stock_min,
                  unit_id: selectedProduct.unit_id,
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
