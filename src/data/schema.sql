-- =====================================================
-- 🔷 STOCKPRO - SCHEMA + SECURITY (SUPABASE READY)
-- =====================================================

-- 🔹 Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 👥 PROFILES
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Caissier',
    nom TEXT NOT NULL,
    avatar TEXT,
    color TEXT DEFAULT '#1a2b6d',
    statut TEXT DEFAULT 'actif',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 📦 CORE TABLES
-- =====================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6dc13a',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    nom TEXT UNIQUE NOT NULL,
    abreviation TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id INT REFERENCES categories(id),
    prix_achat NUMERIC DEFAULT 0,
    prix_vente NUMERIC DEFAULT 0,
    stock INT DEFAULT 0,
    stock_min INT DEFAULT 10,
    unit_id INT REFERENCES units(id),
    description TEXT,
    tva NUMERIC DEFAULT 18,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    type TEXT,
    quantite INT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    nom TEXT,
    telephone TEXT,
    email TEXT,
    solde NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    nom TEXT,
    telephone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 💰 SALES
-- =====================================================

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    client_id INT REFERENCES clients(id),
    total_ttc NUMERIC,
    statut TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantite INT,
    prix_unitaire NUMERIC
);

-- =====================================================
-- 🔔 SYSTEM
-- =====================================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    action TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- =====================================================
-- 🔐 FUNCTION ROLE
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- =====================================================
-- 🔐 TRIGGER AUTO PROFILE
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nom)
  VALUES (NEW.id, NEW.email, 'User');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 🔐 ENABLE RLS
-- =====================================================

DO $$
DECLARE t RECORD;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public'
  LOOP
    EXECUTE 'ALTER TABLE ' || t.tablename || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- =====================================================
-- 🔐 POLICIES
-- =====================================================

-- Profiles
CREATE POLICY "profile_select"
ON profiles FOR SELECT
USING (auth.uid() = id OR get_user_role() = 'Admin');

CREATE POLICY "profile_update"
ON profiles FOR UPDATE
USING (auth.uid() = id OR get_user_role() = 'Admin');

-- Global read
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'categories','units','products','clients','suppliers'
  ])
  LOOP
    EXECUTE format('
      CREATE POLICY "%s_read"
      ON %I FOR SELECT
      USING (auth.role() = ''authenticated'');
    ', t, t);
  END LOOP;
END $$;

-- Admin / Manager CRUD
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'categories','units','products','clients','suppliers'
  ])
  LOOP
    EXECUTE format('
      CREATE POLICY "%s_insert"
      ON %I FOR INSERT
      WITH CHECK (get_user_role() IN (''Admin'',''Manager''));
    ', t, t);

    EXECUTE format('
      CREATE POLICY "%s_update"
      ON %I FOR UPDATE
      USING (get_user_role() IN (''Admin'',''Manager''));
    ', t, t);

    EXECUTE format('
      CREATE POLICY "%s_delete"
      ON %I FOR DELETE
      USING (get_user_role() = ''Admin'');
    ', t, t);
  END LOOP;
END $$;

-- Transactions
CREATE POLICY "transactions_all"
ON transactions FOR ALL
USING (get_user_role() IN ('Admin','Manager','Caissier'));

-- Transaction items
CREATE POLICY "items_all"
ON transaction_items FOR ALL
USING (auth.role() = 'authenticated');

-- Stock
CREATE POLICY "stock_read"
ON stock_movements FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "stock_insert"
ON stock_movements FOR INSERT
WITH CHECK (get_user_role() IN ('Admin','Manager'));

-- Notifications
CREATE POLICY "notif_read"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "notif_insert"
ON notifications FOR INSERT
WITH CHECK (true);

-- Logs
CREATE POLICY "logs_admin"
ON activity_logs FOR SELECT
USING (get_user_role() = 'Admin');

-- =====================================================
-- 🛠 SEED: Admin par défaut
-- =====================================================
-- NOTE: Remplacez '00000000-0000-0000-0000-000000000000' par l'UUID de l'utilisateur créé dans auth.users
-- INSERT INTO profiles (id, email, role, nom) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@stockpro.com', 'Admin', 'Administrateur');