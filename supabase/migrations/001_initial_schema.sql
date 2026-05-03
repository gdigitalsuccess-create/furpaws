-- ============================================================
-- FURPAWS — Initial Schema v1
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'b2b', 'admin')),
  b2b_status    TEXT CHECK (b2b_status IN ('pending', 'approved', 'rejected')),
  company_name  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL,
  name_ar     TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en          TEXT NOT NULL,
  name_ar          TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description_en   TEXT,
  description_ar   TEXT,
  price_retail     NUMERIC(10,2) NOT NULL CHECK (price_retail >= 0),
  price_b2b        NUMERIC(10,2) CHECK (price_b2b >= 0),
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand            TEXT,
  images           JSONB NOT NULL DEFAULT '[]',
  specs            JSONB NOT NULL DEFAULT '{}',
  stock_quantity   INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand       ON products(brand);
CREATE INDEX idx_products_is_active   ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  total_amount              NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_amount           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  shipping_address          JSONB NOT NULL,
  stripe_payment_intent_id  TEXT UNIQUE,
  stripe_payment_status     TEXT,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id   ON orders(user_id);
CREATE INDEX idx_orders_status    ON orders(status);
CREATE INDEX idx_orders_stripe_pi ON orders(stripe_payment_intent_id);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name   TEXT NOT NULL,
  product_image  TEXT,
  quantity       INT NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal       NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ─────────────────────────────────────────────────────────────
-- B2B APPLICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS b2b_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name   TEXT NOT NULL,
  contact_name   TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  business_type  TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_b2b_applications_user_id ON b2b_applications(user_id);
CREATE INDEX idx_b2b_applications_status  ON b2b_applications(status);

CREATE TRIGGER b2b_applications_updated_at
  BEFORE UPDATE ON b2b_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product_id  ON reviews(product_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

-- ─────────────────────────────────────────────────────────────
-- NEWSLETTER SUBSCRIBERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ─── Helper: check if current user is admin ───────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── Helper: check if current user is approved B2B ────────────
CREATE OR REPLACE FUNCTION is_b2b()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'b2b' AND b2b_status = 'approved'
  );
$$;

-- ─── PROFILES ─────────────────────────────────────────────────
CREATE POLICY "profiles: user reads own"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles: user updates own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ─── CATEGORIES ───────────────────────────────────────────────
CREATE POLICY "categories: public read"
  ON categories FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "categories: admin write"
  ON categories FOR ALL
  USING (is_admin());

-- ─── PRODUCTS ─────────────────────────────────────────────────
CREATE POLICY "products: public read active"
  ON products FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "products: admin write"
  ON products FOR ALL
  USING (is_admin());

-- ─── ORDERS ───────────────────────────────────────────────────
CREATE POLICY "orders: user reads own"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "orders: user inserts own"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders: admin updates"
  ON orders FOR UPDATE
  USING (is_admin());

-- ─── ORDER ITEMS ──────────────────────────────────────────────
CREATE POLICY "order_items: user reads own"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "order_items: user inserts own"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ─── B2B APPLICATIONS ─────────────────────────────────────────
CREATE POLICY "b2b_applications: user reads own"
  ON b2b_applications FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "b2b_applications: user inserts own"
  ON b2b_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "b2b_applications: admin updates"
  ON b2b_applications FOR UPDATE
  USING (is_admin());

-- ─── REVIEWS ──────────────────────────────────────────────────
CREATE POLICY "reviews: public reads approved"
  ON reviews FOR SELECT
  USING (is_approved = TRUE OR user_id = auth.uid() OR is_admin());

CREATE POLICY "reviews: auth user inserts own"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews: admin updates"
  ON reviews FOR UPDATE
  USING (is_admin());

-- ─── NEWSLETTER ───────────────────────────────────────────────
CREATE POLICY "newsletter: public inserts"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "newsletter: admin reads"
  ON newsletter_subscribers FOR SELECT
  USING (is_admin());

-- ============================================================
-- SEED DATA — Categories
-- ============================================================
INSERT INTO categories (name_en, name_ar, slug, sort_order) VALUES
  ('Dogs',          'الكلاب',             'dogs',          1),
  ('Cats',          'القطط',              'cats',          2),
  ('Small Animals', 'حيوانات صغيرة',      'small-animals', 3),
  ('Veterinary',    'بيطري',              'veterinary',    4),
  ('Brands',        'الماركات',           'brands',        5)
ON CONFLICT (slug) DO NOTHING;
