-- Shree Ram Mandir / Khambhadiya Dham Super Admin CMS Schema Update

-- 1. Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_gu VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  seo_title_en VARCHAR(255),
  seo_title_gu VARCHAR(255),
  seo_title_hi VARCHAR(255),
  seo_description_en TEXT,
  seo_description_gu TEXT,
  seo_description_hi TEXT,
  seo_keywords TEXT[],
  published_status VARCHAR(20) DEFAULT 'published' CHECK (published_status IN ('published', 'draft', 'scheduled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  role_visibility VARCHAR(50)[] DEFAULT ARRAY['guest', 'member', 'admin'],
  device_visibility VARCHAR(50)[] DEFAULT ARRAY['desktop', 'mobile', 'tablet'],
  language_visibility VARCHAR(50)[] DEFAULT ARRAY['en', 'gu', 'hi'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Page Sections Table (for section visibility engine & reordering)
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_key VARCHAR(100) NOT NULL,
  title_en VARCHAR(255),
  title_gu VARCHAR(255),
  title_hi VARCHAR(255),
  content JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  device_visibility VARCHAR(50)[] DEFAULT ARRAY['desktop', 'mobile', 'tablet'],
  role_visibility VARCHAR(50)[] DEFAULT ARRAY['guest', 'member', 'admin'],
  language_visibility VARCHAR(50)[] DEFAULT ARRAY['en', 'gu', 'hi'],
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  festival_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, section_key)
);

-- 3. Menus Table
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key VARCHAR(50) UNIQUE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Forms Table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key VARCHAR(100) UNIQUE NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_gu VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255) NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Form Submissions Table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Redirects Table
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path VARCHAR(255) UNIQUE NOT NULL,
  to_path VARCHAR(255) NOT NULL,
  status_code INTEGER DEFAULT 301,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en TEXT NOT NULL,
  question_gu TEXT NOT NULL,
  question_hi TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_gu TEXT NOT NULL,
  answer_hi TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Media Table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size_bytes BIGINT,
  type VARCHAR(50) DEFAULT 'image',
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  target_id VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Data
-- Seed Pages
INSERT INTO pages (slug, title_en, title_gu, title_hi, is_active) VALUES
('home', 'Home', 'હોમ', 'होम', true),
('about', 'About Us', 'અમારા વિશે', 'हमारे बारे में', true),
('events', 'Events', 'કાર્યક્રમો', 'कार्यक्रम', true),
('gallery', 'Gallery', 'ગેલેરી', 'गैलरी', true),
('donate', 'Donate', 'દાન કરો', 'दान करें', true),
('services', 'Services', 'સેવાઓ', 'सेवाएं', true),
('contact', 'Contact', 'સંપર્ક', 'संपर्क', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed Page Sections for Home
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'hero', 'Hero Section', 'હેરો વિભાગ', 'हीरो सेक्शन', 1 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'stats', 'Temple Stats', 'મંદિર આંકડા', 'मंदिर आँकड़े', 2 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'aarti', 'Aarti Timings', 'આરતી સમયપત્રક', 'आरती समय सारणी', 3 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'events', 'Featured Events', 'મુખ્ય કાર્યક્રમો', 'मुख्य कार्यक्रम', 4 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'donate', 'Donation Call to Action', 'દાન અપીલ', 'दान अपील', 5 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'history', 'Temple History', 'મંદિરનો ઇતિહાસ', 'मंदिर का इतिहास', 6 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;
INSERT INTO page_sections (page_id, section_key, title_en, title_gu, title_hi, sort_order)
SELECT id, 'testimonials', 'Devotee Testimonials', 'શ્રદ્ધાળુઓના પ્રતિભાવો', 'श्रद्धालुओं की समीक्षाएं', 7 FROM pages WHERE slug = 'home' ON CONFLICT DO NOTHING;

-- Seed Forms
INSERT INTO forms (form_key, title_en, title_gu, title_hi, fields) VALUES
('contact', 'Contact Form', 'સંપર્ક પત્રક', 'संपर्क फ़ॉर्म', '[
  {"name": "name", "type": "text", "label_en": "Your Name", "label_gu": "તમારું નામ", "label_hi": "आपका नाम", "required": true},
  {"name": "email", "type": "email", "label_en": "Your Email", "label_gu": "તમારો ઇમેઇલ", "label_hi": "आपका ईमेल", "required": true},
  {"name": "subject", "type": "text", "label_en": "Subject", "label_gu": "વિષય", "label_hi": "विषय", "required": false},
  {"name": "message", "type": "textarea", "label_en": "Message", "label_gu": "સંદેશ", "label_hi": "संदेश", "required": true}
]'::jsonb),
('volunteer', 'Volunteer Registration', 'સ્વયંસેવક નોંધણી', 'स्वयंसेवक पंजीकरण', '[
  {"name": "name", "type": "text", "label_en": "Full Name", "label_gu": "પૂરેપૂરું નામ", "label_hi": "पूरा नाम", "required": true},
  {"name": "phone", "type": "tel", "label_en": "Phone Number", "label_gu": "ફોન નંબર", "label_hi": "फ़ोन नंबर", "required": true},
  {"name": "email", "type": "email", "label_en": "Email Address", "label_gu": "ઇમેઇલ સરનામું", "label_hi": "ईमेल पता", "required": false},
  {"name": "skills", "type": "text", "label_en": "Special Skills", "label_gu": "ખાસ કૌશલ્ય", "label_hi": "विशेष कौशल", "required": false},
  {"name": "availability", "type": "select", "label_en": "Availability", "label_gu": "સમય ઉપલબ્ધતા", "label_hi": "समय उपलब्धता", "options": ["Weekends", "Weekdays", "Festivals", "Anytime"], "required": true}
]'::jsonb)
ON CONFLICT (form_key) DO NOTHING;

-- Seed Menus
INSERT INTO menus (menu_key, items) VALUES
('header', '[
  {"label_en": "Home", "label_gu": "હોમ", "label_hi": "होम", "path": "/"},
  {"label_en": "About", "label_gu": "અમારા વિશે", "label_hi": "हमारे बारे में", "path": "/about"},
  {"label_en": "Services", "label_gu": "સેવાઓ", "label_hi": "सेवाएं", "path": "/services"},
  {"label_en": "Events", "label_gu": "કાર્યક્રમો", "label_hi": "कार्यक्रम", "path": "/events"},
  {"label_en": "Gallery", "label_gu": "ગેલેરી", "label_hi": "गैलरी", "path": "/gallery"},
  {"label_en": "Donate", "label_gu": "દાન કરો", "label_hi": "दान करें", "path": "/donate"},
  {"label_en": "Contact", "label_gu": "સંપર્ક", "label_hi": "संपर्क", "path": "/contact"}
]'::jsonb),
('footer', '[
  {"label_en": "About Us", "label_gu": "અમારા વિશે", "label_hi": "हमारे बारे में", "path": "/about"},
  {"label_en": "Bhajan Sandhya", "label_gu": "ભજન સંધ્યા", "label_hi": "भजन संध्या", "path": "/events"},
  {"label_en": "Online Donations", "label_gu": "ઓનલાઈન દાન", "label_hi": "ऑनलाइन दान", "path": "/donate"},
  {"label_en": "Services & Pujas", "label_gu": "સેવાઓ અને પૂજા", "label_hi": "सेवाएं और पूजा", "path": "/services"},
  {"label_en": "Contact Support", "label_gu": "સંપર્ક મદદ", "label_hi": "संपर्क सहायता", "path": "/contact"}
]'::jsonb)
ON CONFLICT (menu_key) DO NOTHING;
