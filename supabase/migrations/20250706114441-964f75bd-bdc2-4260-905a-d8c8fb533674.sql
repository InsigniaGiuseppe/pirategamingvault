-- Insert admin user with default credentials
-- Password hash for 'admin123' (you should change this in production)
INSERT INTO public.custom_users (id, username, password_hash) 
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'admin',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
) ON CONFLICT (username) DO NOTHING;

-- Create user balance for admin
INSERT INTO public.user_balance (user_id, balance)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 1000000)
ON CONFLICT (user_id) DO UPDATE SET balance = 1000000;

-- Add initial admin transaction
INSERT INTO public.transactions (user_id, amount, type, description)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  1000000,
  'admin',
  'Initial admin balance'
);