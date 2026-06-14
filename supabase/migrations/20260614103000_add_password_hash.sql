ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Insert default admin user if not exists
INSERT INTO users (email, full_name, role, language, is_active, password_hash)
VALUES ('admin@temple.com', 'Super Admin', 'super_admin', 'en', true, 'a8f5d02b37c8e961ef0a48b30dcf91f1:2869344d259a64228aa2ab6136d8d7f3df9373078adf67490a558abab5a7ca0a173e7d1336ecfb262a2f9cc121135a7aebe123cc717fd159fba281087c3abb9e')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
