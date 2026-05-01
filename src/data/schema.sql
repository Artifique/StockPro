-- =====================================================
-- 🔷 STOCKPRO - SCHEMA + SECURITY (SUPABASE READY)
-- =====================================================

-- =====================================================
-- 🧹 NETTOYAGE (VIDER LA BASE)
-- =====================================================
-- ATTENTION: Cette section supprime TOUTES les données. 
-- Décommentez la ligne DELETE FROM auth.users si vous voulez aussi vider les comptes.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS get_user_role CASCADE;

DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- DELETE FROM auth.users; -- A utiliser avec prudence pour vider les comptes auth

-- 🔹 Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
DECLARE
  is_first_user BOOLEAN;
BEGIN
  -- Vérifier s'il s'agit du tout premier utilisateur
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

  INSERT INTO public.profiles (id, email, nom, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      CASE WHEN LOWER(NEW.email) = 'admin@stockpro.com' OR is_first_user THEN 'Administrateur' ELSE 'Utilisateur' END
    ),
    CASE 
      WHEN LOWER(NEW.email) = 'admin@stockpro.com' OR is_first_user THEN 'Admin' 
      ELSE 'Caissier' 
    END
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    role = EXCLUDED.role, 
    nom = EXCLUDED.nom,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà pour éviter les doublons
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
-- 🛠 SEED: Création de l'Admin par défaut
-- =====================================================
-- Email: admin@stockpro.com | Password: adminpassword123

DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- 1. Création de l'utilisateur dans Auth (si inexistant)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@stockpro.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, email_change, 
      email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 
      'admin@stockpro.com', crypt('adminpassword123', gen_salt('bf')), 
      now(), '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Administrateur StockPro"}', 
      now(), now(), '', '', '', ''
    );
  END IF;

  -- 2. On s'assure que le profil a bien le rôle Admin
  UPDATE public.profiles 
  SET role = 'Admin' 
  WHERE email = 'admin@stockpro.com';
END $$;
