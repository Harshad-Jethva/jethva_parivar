-- Create sequence first
CREATE SEQUENCE IF NOT EXISTS donation_seq START 1;

-- Temple Users (Admin, Members, Volunteers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'trustee', 'member', 'volunteer', 'donor')),
  avatar_url TEXT,
  language VARCHAR(10) DEFAULT 'gu' CHECK (language IN ('gu', 'hi', 'en')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth.uid()::text = id::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);
CREATE POLICY "users_insert_admin" ON users FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en VARCHAR(255) NOT NULL,
  title_gu VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_gu TEXT,
  description_hi TEXT,
  category VARCHAR(50) DEFAULT 'religious' CHECK (category IN ('religious', 'festival', 'yatra', 'bhajan', 'puja', 'community')),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue VARCHAR(255),
  image_url TEXT,
  registration_required BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  current_registrations INTEGER DEFAULT 0,
  donation_target DECIMAL(12,2),
  donation_collected DECIMAL(12,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all" ON events FOR SELECT USING (true);
CREATE POLICY "events_manage_admin" ON events FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Event Registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  attendees_count INTEGER DEFAULT 1,
  special_requests TEXT,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending'))
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registrations_select_own" ON event_registrations FOR SELECT TO authenticated 
  USING (user_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "registrations_insert" ON event_registrations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "registrations_manage_admin" ON event_registrations FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'annadan', 'gaushala', 'festival', 'development', 'education')),
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255),
  donor_phone VARCHAR(20),
  donor_address TEXT,
  pan_number VARCHAR(20),
  is_anonymous BOOLEAN DEFAULT false,
  payment_method VARCHAR(20) CHECK (payment_method IN ('upi', 'card', 'netbanking', 'cash')),
  payment_id VARCHAR(255),
  receipt_number VARCHAR(50) UNIQUE DEFAULT 'DON-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('donation_seq')::text, 5, '0'),
  receipt_sent BOOLEAN DEFAULT false,
  donation_date TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donations_select_own" ON donations FOR SELECT TO authenticated 
  USING (user_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "donations_insert_all" ON donations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "donations_manage_admin" ON donations FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Gallery
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en VARCHAR(255),
  title_gu VARCHAR(255),
  title_hi VARCHAR(255),
  type VARCHAR(20) DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(50) DEFAULT 'festival' CHECK (category IN ('festival', 'daily', 'historic', 'drone', 'architecture', 'prasad')),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_select_all" ON gallery FOR SELECT USING (true);
CREATE POLICY "gallery_manage_admin" ON gallery FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Aarti Timings
CREATE TABLE aarti_timings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(100) NOT NULL,
  name_gu VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100) NOT NULL,
  time VARCHAR(20) NOT NULL,
  description_en TEXT,
  description_gu TEXT,
  description_hi TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO aarti_timings (name_en, name_gu, name_hi, time, sort_order) VALUES
('Mangala Aarti', 'મંગળા આરતી', 'मंगला आरती', '05:00', 1),
('Shringar Aarti', 'શૃંગાર આરતી', 'श्रृंगार आरती', '07:30', 2),
('Rajbhog Aarti', 'રાજભોગ આરતી', 'राजभोग आरती', '12:00', 3),
('Sandhya Aarti', 'સંધ્યા આરતી', 'संध्या आरती', '19:00', 4),
('Shayan Aarti', 'શયન આરતી', 'शयन आरती', '21:00', 5);

ALTER TABLE aarti_timings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aarti_select_all" ON aarti_timings FOR SELECT USING (true);

-- Blog Posts
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en VARCHAR(255) NOT NULL,
  title_gu VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content_en TEXT,
  content_gu TEXT,
  content_hi TEXT,
  excerpt_en TEXT,
  excerpt_gu TEXT,
  excerpt_hi TEXT,
  author_id UUID REFERENCES users(id),
  category VARCHAR(50) DEFAULT 'article' CHECK (category IN ('article', 'news', 'festival', 'spiritual', 'community')),
  image_url TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blogs_select_published" ON blogs FOR SELECT USING (published = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "blogs_manage_admin" ON blogs FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Volunteers
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  department VARCHAR(50),
  skills TEXT[],
  availability VARCHAR(100),
  joined_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  hours_contributed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "volunteers_select_own" ON volunteers FOR SELECT TO authenticated 
  USING (user_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "volunteers_insert_all" ON volunteers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "volunteers_manage_admin" ON volunteers FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Temple Services (Puja bookings)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(255) NOT NULL,
  name_gu VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_gu TEXT,
  description_hi TEXT,
  category VARCHAR(50) DEFAULT 'puja' CHECK (category IN ('puja', 'yagna', 'abhishek', 'prasad', 'hall')),
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  is_available BOOLEAN DEFAULT true,
  booking_advance_days INTEGER DEFAULT 3
);

INSERT INTO services (name_en, name_gu, name_hi, category, price, duration_minutes) VALUES
('Rudrabhishek Puja', 'રુદ્રાભિષેક પૂજા', 'रुद्राभिषेक पूजा', 'abhishek', 1100, 60),
('Satyanarayan Katha', 'સત્યનારાયણ કથા', 'सत्यनारायण कथा', 'puja', 3100, 120),
('Lakshmi Puja', 'લક્ષ્મી પૂજા', 'लक्ष्मी पूजा', 'puja', 1100, 45),
('Ganesh Yagna', 'ગણેશ યજ્ઞ', 'गणेश यज्ञ', 'yagna', 5100, 180);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_all" ON services FOR SELECT USING (true);
CREATE POLICY "services_manage_admin" ON services FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Service Bookings
CREATE TABLE service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME,
  devotee_name VARCHAR(255) NOT NULL,
  devotee_email VARCHAR(255),
  devotee_phone VARCHAR(20) NOT NULL,
  purpose TEXT,
  attendees INTEGER DEFAULT 1,
  amount DECIMAL(10,2),
  payment_id VARCHAR(255),
  receipt_number VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_own" ON service_bookings FOR SELECT TO authenticated 
  USING (user_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "bookings_insert_all" ON service_bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "bookings_manage_admin" ON service_bookings FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  content_en TEXT NOT NULL,
  content_gu TEXT,
  content_hi TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  video_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select_approved" ON testimonials FOR SELECT USING (is_approved = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
CREATE POLICY "testimonials_insert_all" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "testimonials_manage_admin" ON testimonials FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Site Settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
('temple_name_en', 'Shree Ram Mandir'),
('temple_name_gu', 'શ્રી રામ મંદિર'),
('temple_name_hi', 'श्री राम मंदिर'),
('tagline_en', 'A Sacred Place of Worship'),
('tagline_gu', 'એક પવિત્ર પૂજા સ્થળ'),
('tagline_hi', 'एक पवित्र पूजा स्थल'),
('address', '123 Temple Street, Ahmedabad, Gujarat 380001'),
('phone', '+91 98765 43210'),
('email', 'info@shreerammandir.com'),
('whatsapp', '+91 98765 43210'),
('youtube_live_url', ''),
('facebook_page', ''),
('instagram_page', ''),
('opening_time', '05:00'),
('closing_time', '21:30');

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_all" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_manage_admin" ON site_settings FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Trustees
CREATE TABLE trustees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  position_en VARCHAR(100),
  position_gu VARCHAR(100),
  position_hi VARCHAR(100),
  bio_en TEXT,
  bio_gu TEXT,
  bio_hi TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE trustees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trustees_select_all" ON trustees FOR SELECT USING (true);
CREATE POLICY "trustees_manage_admin" ON trustees FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title_en VARCHAR(255) NOT NULL,
  title_gu VARCHAR(255),
  title_hi VARCHAR(255),
  message_en TEXT,
  message_gu TEXT,
  message_hi TEXT,
  type VARCHAR(50) DEFAULT 'general',
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid()::uuid);
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role IN ('super_admin', 'admin')));
