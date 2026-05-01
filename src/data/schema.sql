-- Schéma de base de données SQL pour StockPro
-- Compatible avec PostgreSQL / Supabase

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⚙️ CONFIGURATION & EXTENSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Activer l'extension pour les UUID si nécessaire
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 👥 UTILISATEURS & AUTHENTIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des profils utilisateurs (complète Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Caissier',
    nom TEXT NOT NULL,
    avatar TEXT,
    color TEXT DEFAULT '#1a2b6d',
    statut TEXT NOT NULL DEFAULT 'actif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📦 PRODUITS & STOCK
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6dc13a',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des unités de mesure
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL,
    abreviation TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    prix_achat NUMERIC(15, 2) NOT NULL DEFAULT 0,
    prix_vente NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_min INTEGER NOT NULL DEFAULT 10,
    unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    description TEXT,
    tva NUMERIC(5, 2) DEFAULT 18,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Entrée', 'Sortie', 'Ajustement'
    quantite INTEGER NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    motif TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🤝 CLIENTS & FOURNISSEURS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    type TEXT DEFAULT 'Particulier', -- 'VIP', 'Grossiste', 'Détaillant', 'Particulier'
    solde NUMERIC(15, 2) DEFAULT 0,
    statut TEXT DEFAULT 'actif',
    newsletter_opt_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    contact_person TEXT,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    statut TEXT DEFAULT 'actif',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 💰 VENTES & FACTURATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des transactions (Ventes)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY, -- Format TRX-XXX
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    total_ht NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_tva NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_rate NUMERIC(5, 2) DEFAULT 0,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    total_ttc NUMERIC(15, 2) NOT NULL DEFAULT 0,
    mode_paiement TEXT NOT NULL, -- 'Espèces', 'Carte', 'Mobile Money', 'Chèque', 'Virement', 'Crédit'
    statut TEXT NOT NULL, -- 'Payé', 'En attente', 'Annulé'
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes de transaction (Détails de vente)
CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantite INTEGER NOT NULL,
    prix_unitaire NUMERIC(15, 2) NOT NULL,
    tva_rate NUMERIC(5, 2) DEFAULT 18,
    total_ligne NUMERIC(15, 2) NOT NULL
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY, -- Format FAC-YYYY-XXX
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
    montant_total NUMERIC(15, 2) NOT NULL,
    statut TEXT NOT NULL, -- 'Payée', 'En attente', 'En retard', 'Annulée'
    date_echeance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔄 RETOURS & ÉCHANGES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des retours
CREATE TABLE IF NOT EXISTS returns (
    id TEXT PRIMARY KEY, -- Format RET-YYYY-XXX
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantite INTEGER NOT NULL,
    prix_unitaire NUMERIC(15, 2) NOT NULL,
    montant_total NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL, -- 'retour', 'echange'
    motif_id TEXT, -- ID du motif (ex: 'defectueux')
    motif_description TEXT,
    statut TEXT NOT NULL, -- 'demande', 'en_attente', 'valide', 'rembourse', 'echange', 'refuse', 'annule'
    date_validation TIMESTAMP WITH TIME ZONE,
    product_echange_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    montant_rembourse NUMERIC(15, 2) DEFAULT 0,
    processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📦 COMMANDES FOURNISSEURS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des commandes fournisseurs
CREATE TABLE IF NOT EXISTS supplier_orders (
    id TEXT PRIMARY KEY, -- Format CMD-XXX
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    montant_total NUMERIC(15, 2) NOT NULL,
    statut TEXT NOT NULL, -- 'Reçue', 'En transit', 'En attente', 'Annulée'
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes de commande fournisseur
CREATE TABLE IF NOT EXISTS supplier_order_items (
    id SERIAL PRIMARY KEY,
    order_id TEXT REFERENCES supplier_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantite INTEGER NOT NULL,
    prix_unitaire_achat NUMERIC(15, 2) NOT NULL,
    total_ligne NUMERIC(15, 2) NOT NULL
);

-- Table des notifications système
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'warning', 'success', 'danger'
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📋 SYSTÈME DE LOGS & AUDIT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table des journaux d'activité (Logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- Ex: 'LOGIN', 'SALE_CREATE', etc.
    category TEXT NOT NULL, -- Ex: 'auth', 'stock', etc.
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    details TEXT,
    ip_address TEXT,
    metadata JSONB,
    severity TEXT DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⚙️ PARAMÈTRES SYSTÈME
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
