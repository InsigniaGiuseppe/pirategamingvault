-- Add sample users for testing admin dashboard
INSERT INTO public.custom_users (username, password_hash) VALUES
('testuser1', '$2b$10$hashexample1'),
('testuser2', '$2b$10$hashexample2'),
('testuser3', '$2b$10$hashexample3');

-- Add sample balances
INSERT INTO public.user_balance (user_id, balance) 
SELECT id, 50 + (random() * 950)::int
FROM public.custom_users 
WHERE username IN ('testuser1', 'testuser2', 'testuser3');

-- Add sample transactions
INSERT INTO public.transactions (user_id, amount, type, description)
SELECT 
  cu.id,
  (10 + random() * 90)::int,
  (ARRAY['earn', 'spend', 'admin'])[floor(random() * 3) + 1],
  'Sample transaction for ' || cu.username
FROM public.custom_users cu
WHERE cu.username IN ('testuser1', 'testuser2', 'testuser3');