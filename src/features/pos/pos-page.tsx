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
import { CATEGORIES, MOCK_CLIENTS, MOCK_PRODUCTS } from "@/data/stock-mock";
import { addLogWithCurrentUser } from "@/lib/app-logs";
import { formatCurrency } from "@/lib/format";
import { Badge, Button, Input } from "@/components/ui";
import { showToast } from "@/lib/app-toast";
import { Select } from "@/components/stock-pro/primitives";

export const POSPage: React.FC = () => {
  const [posCatalog, setPosCatalog] = useState(() => MOCK_PRODUCTS.map((p) => ({ ...p })));
  const [cart, setCart] = useState<{ product: typeof MOCK_PRODUCTS[0]; quantity: number }[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  /** Buffer code-barres (non affiché : ref uniquement pour éviter re-rendus et réabonnements clavier) */
  const barcodeBufferRef = useRef("");
  const [isScanning, setIsScanning] = useState(false);
  const [, setStockErrors] = useState<{ [key: number]: string }>({});

  // Handle discount input with validation
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

  const addToCart = useCallback((product: typeof MOCK_PRODUCTS[0]) => {
    // Check if product is in stock
    if (product.stock <= 0) {
      showToast(`${product.nom} est en rupture de stock`, "error");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          // Clear any previous stock error for this product
          setStockErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[product.id];
            return newErrors;
          });
          return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
          // Show stock limit reached error
          setStockErrors((prev) => ({ ...prev, [product.id]: `Stock maximum atteint (${product.stock} disponibles)` }));
          showToast(`Stock maximum atteint pour ${product.nom}`, "warning");
          return prevCart;
        }
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  // Barcode scanner simulation (buffer en ref → listener stable)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const input = barcodeBufferRef.current;
      if (e.key === "Enter" && input) {
        const product = posCatalog.find((p) => p.sku.toLowerCase() === input.toLowerCase() && p.stock > 0);
        if (product) {
          addToCart(product);
          showToast(`Produit scanné: ${product.nom}`, "success");
        } else {
          showToast(`Produit non trouvé: ${input}`, "error");
        }
        barcodeBufferRef.current = "";
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addToCart, posCatalog]);

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = posCatalog.find((p) => p.id === productId);
    if (product && quantity > 0 && quantity <= product.stock) {
      setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
      // Clear stock error for this product
      setStockErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    } else if (product && quantity > product.stock) {
      showToast(`Stock insuffisant. Maximum: ${product.stock}`, "error");
      setStockErrors((prev) => ({ ...prev, [productId]: `Stock maximum: ${product.stock}` }));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.prixVente * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  // Validate sale and decrement stock
  const handleValidateSale = useCallback(() => {
    if (cart.length === 0) {
      showToast("Le panier est vide", "warning");
      return;
    }

    const stockIssues = cart.filter((item) => {
      const live = posCatalog.find((p) => p.id === item.product.id);
      return !live || item.quantity > live.stock;
    });
    if (stockIssues.length > 0) {
      showToast(`Stock insuffisant pour: ${stockIssues.map((i) => i.product.nom).join(", ")}`, "error");
      return;
    }

    setPosCatalog((prev) =>
      prev.map((p) => {
        const line = cart.find((c) => c.product.id === p.id);
        if (!line) return p;
        return { ...p, stock: p.stock - line.quantity };
      })
    );

    const saleDetails = cart.map((item) => `${item.product.nom} x${item.quantity}`).join(", ");
    const articlesCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const saleId = `TRX-${Date.now().toString().slice(-6)}`;

    addLogWithCurrentUser("SALE_CREATE",
      `Vente ${saleId}: ${saleDetails} → ${formatCurrency(total)}`,
      { saleId, amount: total, client: selectedClient || "Non spécifié", paymentMethod, articlesCount }
    );

    cart.forEach((item) => {
      const before = posCatalog.find((p) => p.id === item.product.id);
      const newStock = before ? before.stock - item.quantity : item.product.stock - item.quantity;
      addLogWithCurrentUser("STOCK_EXIT",
        `Sortie stock: ${item.product.nom} (-${item.quantity})`,
        { product: item.product.nom, productId: item.product.id, quantity: -item.quantity, newStock, saleId }
      );
    });

    // Show success message with longer duration for better feedback
    showToast(`✅ Vente enregistrée ! ${articlesCount} article${articlesCount > 1 ? 's' : ''} vendu${articlesCount > 1 ? 's' : ''} pour ${formatCurrency(total)}`, "success", 5000);
    setCart([]);
    setDiscount(0);
    setDiscountError("");
    setSelectedClient("");
    setStockErrors({});
  }, [cart, total, selectedClient, paymentMethod, posCatalog]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search and Scanner */}
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
            title="Activer/Désactiver le scan code-barres (tapez un SKU puis Entrée)"
          >
            <Zap className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">
              {isScanning ? "Scanner ON" : "Scanner"}
            </span>
            {isScanning && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-stockpro-signal rounded-full border-2 border-white"
              />
            )}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 z-50 mb-2 whitespace-nowrap rounded-lg bg-stockpro-navy-night px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
              {isScanning ? "Cliquer pour désactiver" : "Scanner code-barres (tapez SKU + Entrée)"}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stockpro-navy-night" />
            </div>
          </motion.button>
        </div>

        {/* Indicateur de scanner actif */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 border border-stockpro-stock-low-fg/30 bg-stockpro-stock-low-bg dark:border-stockpro-stock-low-fg/40 dark:bg-stockpro-stock-low-fg/10 rounded-lg"
          >
            <div className="flex items-center gap-2 text-stockpro-stock-low-fg text-sm">
              <div className="w-2 h-2 bg-stockpro-stock-low-fg rounded-full animate-pulse" />
              <span className="font-medium">Scanner actif</span>
              <span className="text-stockpro-stock-low-fg">- Tapez un code SKU puis appuyez sur Entrée</span>
            </div>
          </motion.div>
        )}

        {/* Category Quick Filters */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSearchProduct("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${searchProduct === ""
              ? "bg-stockpro-navy/80 text-white"
              : "bg-muted text-muted-foreground"
              }`}
          >
            Tous
          </motion.button>
          {CATEGORIES.slice(0, 4).map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchProduct(cat.nom)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${searchProduct === cat.nom
                ? "bg-stockpro-navy/80 text-white"
                : "bg-muted text-muted-foreground"
                }`}
            >
              {cat.nom}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03 },
              },
            }}
          >
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(product)}
                className="p-3 bg-card rounded-xl border border-border hover:border-stockpro-navy/35 dark:hover:border-stockpro-signal/40 hover:shadow-lg transition-all text-left"
              >
                <div className="w-full h-16 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm text-foreground truncate">{product.nom}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-semibold text-stockpro-navy dark:text-stockpro-signal">{formatCurrency(product.prixVente)}</p>
                  <Badge variant={product.stock > product.stockMin ? "success" : "warning"}>{product.stock}</Badge>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)} articles)
          </h3>
          {/* Bouton Vider le panier - visible uniquement si le panier n'est pas vide */}
          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir vider le panier ? Cette action est irréversible.")) {
                  setCart([]);
                  setDiscount(0);
                  setDiscountError("");
                  setStockErrors({});
                  showToast("Panier vidé avec succès", "success");
                }
              }}
              className="text-stockpro-stock-error-fg hover:bg-stockpro-stock-error-bg hover:opacity-90 dark:hover:bg-stockpro-stock-error-fg/12"
              title="Vider le panier"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Panier vide</p>
                <p className="text-sm mb-4">Cliquez sur un produit pour l&apos;ajouter</p>
                {/* Guide pour les nouveaux utilisateurs */}
                <div className="bg-muted/50 rounded-lg p-3 text-left text-xs space-y-2">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Comment ajouter des produits ?
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-stockpro-navy/10 dark:bg-stockpro-signal/12 text-stockpro-navy dark:text-stockpro-signal flex items-center justify-center text-[10px] font-bold">1</span>
                      Cliquez sur un produit à gauche
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-stockpro-navy/10 dark:bg-stockpro-signal/12 text-stockpro-navy dark:text-stockpro-signal flex items-center justify-center text-[10px] font-bold">2</span>
                      Ou utilisez le scanner code-barres
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stockpro-navy/10 text-[10px] font-bold text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal">3</span>
                      Validez avec le bouton « Valider la vente »
                    </li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              cart.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.product.nom}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.product.prixVente)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="w-8 text-center font-medium text-foreground"
                    >
                      {item.quantity}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-stockpro-stock-error-fg hover:text-stockpro-stock-error-fg">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Client & Payment */}
        <div className="p-4 border-t border-border space-y-3">
          <Select
            value={selectedClient}
            onChange={setSelectedClient}
            placeholder="Sélectionner un client"
            options={MOCK_CLIENTS.map((c) => ({ value: c.nom, label: c.nom }))}
          />

          <div className="flex gap-2">
            {[
              { id: "especes", label: "Espèces", icon: <Wallet className="w-4 h-4" /> },
              { id: "carte", label: "Carte", icon: <CreditCard className="w-4 h-4" /> },
              { id: "mobile", label: "Mobile", icon: <Smartphone className="w-4 h-4" /> },
            ].map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-1 ${paymentMethod === method.id
                  ? "border-primary bg-stockpro-navy/8 text-stockpro-navy dark:bg-stockpro-signal/12 dark:text-stockpro-signal"
                  : "border-border text-muted-foreground"
                  }`}
              >
                {method.icon}
                <span className="hidden sm:inline">{method.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Remise (%):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(Number(e.target.value))}
                className={`w-20 px-2 py-1 rounded-lg border bg-card text-foreground text-center ${discountError ? "border-stockpro-stock-error-fg ring-1 ring-stockpro-stock-error-fg" : "border-border"
                  }`}
                min={0}
                max={100}
              />
            </div>
            {discountError && (
              <p className="text-xs text-stockpro-stock-error-fg flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {discountError}
              </p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sous-total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-stockpro-stock-error-fg">
              <span>Remise ({discount}%)</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <motion.div
            key={total}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border"
          >
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </motion.div>

          {/* Validation Button - More prominent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <Button
              onClick={handleValidateSale}
              className={`w-full relative overflow-hidden group ${cart.length > 0
                ? "bg-gradient-to-r from-stockpro-signal to-stockpro-navy hover:brightness-95 dark:to-stockpro-navy-night"
                : ""
                }`}
              size="lg"
              disabled={cart.length === 0}
            >
              {cart.length > 0 ? (
                <>
                  <Check className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Valider la vente</span>
                  <span className="ml-2 relative z-10 opacity-90">• {formatCurrency(total)}</span>
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-stockpro-signal to-stockpro-navy"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ opacity: 0.3 }}
                  />
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Panier vide
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 PAGE GESTION DU STOCK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
