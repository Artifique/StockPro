"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingCart,
  X,
  Search,
  Trash2,
  Plus,
  CreditCard,
  Wallet,
  AlertCircle,
  Check,
  Minus,
  HelpCircle,
  Zap,
  Smartphone,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Input } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { Select } from "@/components/stock-pro/primitives";
import { ProductService } from "@/services/product.service";
import { ClientService } from "@/services/partner.service";
import { SaleService } from "@/services/sale.service";
import { Product } from "@/models/product.model";
import { Client } from "@/models/partner.model";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

export const POSPage: React.FC = () => {
  const { user } = useAppShellSession();
  const [posCatalog, setPosCatalog] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const barcodeBufferRef = useRef("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, c] = await Promise.all([
        ProductService.getAll(),
        ClientService.getAll()
      ]);
      setPosCatalog(p);
      setClients(c);
    } catch (error) {
      showToast("Erreur de chargement", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscountChange = (value: number) => {
    if (value < 0) {
      setDiscount(0);
      setDiscountError("La remise ne peut pas être négative");
    } else if (value > 100) {
      setDiscount(100);
      setDiscountError("La remise ne peut pas dépasser 100%");
    } else {
      setDiscount(value);
      setDiscountError("");
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchProduct) return posCatalog.filter((p) => p.stock > 0);
    return posCatalog.filter(
      (p) => p.stock > 0 && (p.nom.toLowerCase().includes(searchProduct.toLowerCase()) || p.sku.toLowerCase().includes(searchProduct.toLowerCase()))
    );
  }, [searchProduct, posCatalog]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      showToast(`${product.nom} est en rupture de stock`, "error");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
          showToast(`Stock maximum atteint pour ${product.nom}`, "warning");
          return prevCart;
        }
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isScanning) return;
      if (e.key === "Enter" && barcodeBufferRef.current) {
        const product = posCatalog.find((p) => p.sku.toLowerCase() === barcodeBufferRef.current.toLowerCase() && p.stock > 0);
        if (product) {
          addToCart(product);
          showToast(`Produit scanné: ${product.nom}`, "success");
        } else {
          showToast(`Produit non trouvé: ${barcodeBufferRef.current}`, "error");
        }
        barcodeBufferRef.current = "";
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBufferRef.current += e.key;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScanning, posCatalog, addToCart]);

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = posCatalog.find((p) => p.id === productId);
    if (product && quantity > 0 && quantity <= product.stock) {
      setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
    } else if (product && quantity > product.stock) {
      showToast(`Stock insuffisant. Maximum: ${product.stock}`, "error");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.prix_vente * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleValidateSale = async () => {
    if (cart.length === 0) {
      showToast("Le panier est vide", "warning");
      return;
    }

    try {
      const saleId = `TRX-${Date.now().toString().slice(-6)}`;
      const total_ht = subtotal; // Simplified
      const total_tva = subtotal * 0.18; // Example
      
      const transaction = {
        id: saleId,
        client_id: selectedClientId ? parseInt(selectedClientId) : null,
        total_ht,
        total_tva,
        discount_rate: discount,
        discount_amount: discountAmount,
        total_ttc: total,
        mode_paiement: paymentMethod as any,
        statut: 'Payé' as const,
        user_id: user?.id?.toString() || null,
      };

      const items = cart.map(item => ({
        product_id: item.product.id,
        quantite: item.quantity,
        prix_unitaire: item.product.prix_vente,
        tva_rate: 18,
        total_ligne: item.product.prix_vente * item.quantity
      }));

      await SaleService.createTransaction(transaction, items);

      // Decrement local stock
      setPosCatalog(prev => prev.map(p => {
        const item = cart.find(c => c.product.id === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      }));

      showToast(`✅ Vente enregistrée !`, "success", 5000);
      setCart([]);
      setDiscount(0);
      setSelectedClientId("");
      loadData(); // Refresh all
    } catch (error) {
      showToast("Erreur lors de la validation", "error");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un produit (nom ou SKU)..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsScanning(!isScanning);
              showToast(isScanning ? "Scanner désactivé" : "Scanner activé - Tapez un SKU puis Entrée", "info");
            }}
            className={`relative px-4 py-2 rounded-lg border transition-colors group flex items-center gap-2 ${isScanning
              ? "bg-stockpro-stock-low-fg text-white border-stockpro-stock-low-fg shadow-lg shadow-stockpro-stock-low-fg/20"
              : "bg-card border-border text-muted-foreground"
              }`}
          >
            <Zap className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">{isScanning ? "Scanner ON" : "Scanner"}</span>
          </motion.button>
        </div>

        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 border border-stockpro-stock-low-fg bg-stockpro-stock-low-bg rounded-lg">
            <div className="flex items-center gap-2 text-stockpro-stock-low-fg text-sm">
              <div className="w-2 h-2 bg-stockpro-stock-low-fg rounded-full animate-pulse" />
              <span className="font-medium">Scanner actif - Tapez un SKU + Entrée</span>
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">Chargement...</div>
          ) : (
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.03 } } }}>
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(product)}
                  className="p-3 bg-card rounded-xl border border-border hover:border-stockpro-navy/35 hover:shadow-lg transition-all text-left"
                >
                  <div className="w-full h-16 bg-muted rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <p className="font-medium text-sm text-foreground truncate">{product.nom}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(product.prix_vente)}</p>
                    <Badge variant={product.stock > product.stock_min ? "success" : "warning"}>{product.stock}</Badge>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h3>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-stockpro-stock-error-fg">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Panier vide</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div key={item.product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.product.nom}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.product.prix_vente)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded-md bg-muted"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded-md bg-muted"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-stockpro-stock-error-fg"><X className="w-4 h-4" /></button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <Select
            value={selectedClientId}
            onChange={setSelectedClientId}
            placeholder="Sélectionner un client"
            options={clients.map((c) => ({ value: c.id.toString(), label: c.nom }))}
          />

          <div className="flex gap-2">
            {["Espèces", "Carte", "Mobile Money"].map((m) => (
              <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2 rounded-lg border text-xs ${paymentMethod === m ? "bg-stockpro-navy text-white" : "border-border text-muted-foreground"}`}>
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Remise (%):</span>
            <input type="number" value={discount} onChange={(e) => handleDiscountChange(Number(e.target.value))} className="w-16 px-2 py-1 rounded border bg-transparent text-center" />
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sous-total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button onClick={handleValidateSale} className="w-full mt-2" size="lg" disabled={cart.length === 0}>
            Valider la vente
          </Button>
        </div>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PAGE GESTION DU STOCK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
