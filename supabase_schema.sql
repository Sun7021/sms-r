
-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT
);

-- 2. Create Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STAFF',
  name TEXT NOT NULL
);

-- 3. Create Menu Table
CREATE TABLE IF NOT EXISTS menu (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  stock NUMERIC DEFAULT 0,
  popularity INTEGER DEFAULT 0,
  image TEXT,
  description TEXT,
  ingredients JSONB DEFAULT '[]'
);

-- 4. Create Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_stock NUMERIC NOT NULL,
  min_stock NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC NOT NULL
);

-- 5. Create Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'PERCENT' or 'FLAT'
  value NUMERIC NOT NULL,
  min_order NUMERIC
);

-- 6. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  branch_id TEXT REFERENCES branches(id),
  table_number TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  applied_promo TEXT,
  cgst NUMERIC NOT NULL,
  sgst NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  payment_method TEXT
);

-- Enable Realtime for the orders table
-- This allows KDS and POS to update instantly across different devices
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Insert initial data (Optional but helpful for first run)
INSERT INTO branches (id, name, location) VALUES 
('b1', 'Downtown Branch', 'Main St 123'),
('b2', 'Westside Hub', 'Grand Ave 456')
ON CONFLICT (id) DO NOTHING;

INSERT INTO staff (id, username, password, role, name) VALUES
('admin-0', 'suraj', 'Sur@j', 'ADMIN', 'Suraj Admin')
ON CONFLICT (id) DO NOTHING;
