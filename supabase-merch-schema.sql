-- Merchandise system for artistrax
-- Run this in Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('apparel', 'vinyl', 'cd', 'poster', 'sticker', 'other')),
  base_price DECIMAL(10, 2) NOT NULL,
  images TEXT[], -- Array of image URLs
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((artist_id IS NOT NULL) OR (label_id IS NOT NULL))
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Small Black", "Large White", "Standard"
  sku TEXT,
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Add to base price
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping rates per product
CREATE TABLE IF NOT EXISTS product_shipping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  region TEXT NOT NULL, -- 'US', 'International', etc.
  rate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_id UUID, -- Optional: if logged in
  shipping_address JSONB NOT NULL, -- {street, city, state, zip, country}
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_total DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL, -- 5%
  total DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  product_title TEXT NOT NULL,
  variant_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_artist_id ON products(artist_id);
CREATE INDEX IF NOT EXISTS idx_products_label_id ON products(label_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_artist_id ON order_items(artist_id);
CREATE INDEX IF NOT EXISTS idx_order_items_label_id ON order_items(label_id);

-- Triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Products: public read, artists/labels can manage their own
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Artists can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update their own products" ON products FOR UPDATE USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete their own products" ON products FOR DELETE USING (auth.uid() = artist_id);
CREATE POLICY "Labels can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = label_id);
CREATE POLICY "Labels can update their own products" ON products FOR UPDATE USING (auth.uid() = label_id);
CREATE POLICY "Labels can delete their own products" ON products FOR DELETE USING (auth.uid() = label_id);

-- Variants: similar to products
CREATE POLICY "Variants are viewable by everyone" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Product owners can manage variants" ON product_variants FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND (products.artist_id = auth.uid() OR products.label_id = auth.uid())
    )
  );

-- Shipping: similar to variants
CREATE POLICY "Shipping rates are viewable by everyone" ON product_shipping FOR SELECT USING (true);
CREATE POLICY "Product owners can manage shipping" ON product_shipping FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_shipping.product_id 
      AND (products.artist_id = auth.uid() OR products.label_id = auth.uid())
    )
  );

-- Orders: buyers and sellers can view their own
CREATE POLICY "Orders are viewable by buyer" ON orders FOR SELECT 
  USING (auth.uid() = buyer_id OR buyer_email = auth.email());
CREATE POLICY "Orders are viewable by seller" ON orders FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM order_items 
      WHERE order_items.order_id = orders.id 
      AND (order_items.artist_id = auth.uid() OR order_items.label_id = auth.uid())
    )
  );
CREATE POLICY "Orders can be created" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Sellers can update order status" ON orders FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM order_items 
      WHERE order_items.order_id = orders.id 
      AND (order_items.artist_id = auth.uid() OR order_items.label_id = auth.uid())
    )
  );

-- Order items: similar visibility to orders
CREATE POLICY "Order items are viewable by buyer" ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.buyer_email = auth.email())
    )
  );
CREATE POLICY "Order items are viewable by seller" ON order_items FOR SELECT 
  USING (artist_id = auth.uid() OR label_id = auth.uid());
CREATE POLICY "Order items can be created" ON order_items FOR INSERT WITH CHECK (true);
