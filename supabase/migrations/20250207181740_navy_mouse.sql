/*
  # Initial Schema Setup for PesaPap

  1. New Tables
    - `users`
      - `id` (text, primary key) - Maps to Clerk user ID
      - `full_name` (text)
      - `phone_number` (text)
      - `business_name` (text)
      - `created_at` (timestamp)
    
    - `payment_links`
      - `id` (uuid, primary key)
      - `user_id` (text, foreign key)
      - `amount` (numeric)
      - `description` (text)
      - `recipient_phone` (text)
      - `status` (text)
      - `created_at` (timestamp)
      
    - `transactions`
      - `id` (uuid, primary key)
      - `payment_link_id` (uuid, foreign key)
      - `amount` (numeric)
      - `status` (text)
      - `payer_phone` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id text PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  business_name text,
  created_at timestamptz DEFAULT now()
);

-- Payment links table
CREATE TABLE payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) NOT NULL,
  amount numeric NOT NULL,
  description text,
  recipient_phone text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id uuid REFERENCES payment_links(id) NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  payer_phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own payment links"
  ON payment_links
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payment links"
  ON payment_links
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (payment_link_id IN (
    SELECT id FROM payment_links WHERE user_id = auth.uid()
  ));