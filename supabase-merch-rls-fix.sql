-- Fix RLS policies for merch system
-- Run this in Supabase SQL Editor if you're having permission issues

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can insert their own products" ON products;
DROP POLICY IF EXISTS "Artists can update their own products" ON products;
DROP POLICY IF EXISTS "Artists can delete their own products" ON products;
DROP POLICY IF EXISTS "Labels can insert their own products" ON products;
DROP POLICY IF EXISTS "Labels can update their own products" ON products;
DROP POLICY IF EXISTS "Labels can delete their own products" ON products;

-- Recreate with better logic
CREATE POLICY "Artists can manage their own products" ON products
  FOR ALL USING (
    artist_id = auth.uid()
  )
  WITH CHECK (
    artist_id = auth.uid()
  );

CREATE POLICY "Labels can manage their own products" ON products
  FOR ALL USING (
    label_id = auth.uid()
  )
  WITH CHECK (
    label_id = auth.uid()
  );

-- Also update variants policy
DROP POLICY IF EXISTS "Product owners can manage variants" ON product_variants;

CREATE POLICY "Product owners can manage variants" ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND (products.artist_id = auth.uid() OR products.label_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND (products.artist_id = auth.uid() OR products.label_id = auth.uid())
    )
  );

-- Update shipping policy
DROP POLICY IF EXISTS "Product owners can manage shipping" ON product_shipping;

CREATE POLICY "Product owners can manage shipping" ON product_shipping
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_shipping.product_id 
      AND (products.artist_id = auth.uid() OR products.label_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_shipping.product_id 
      AND (products.artist_id = auth.uid() OR products.label_id = auth.uid())
    )
  );
