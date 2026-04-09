-- ============================================================
-- Admin Features Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- Events table (displayed on storefront calendar)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  end_date date,
  location text,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);

-- Newsletters table
CREATE TABLE IF NOT EXISTS public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body_html text NOT NULL,
  sent_at timestamptz,
  recipient_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Newsletter subscribers (collected from storefront forms)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

-- Admin inbox messages (contact form + vendor notifications)
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('contact', 'vendor_request')),
  from_name text,
  from_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_messages_type ON public.admin_messages(type);
CREATE INDEX IF NOT EXISTS idx_admin_messages_read ON public.admin_messages(is_read) WHERE is_read = false;

-- RLS: only admins can access these tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Events: public read for published events, admin full access
CREATE POLICY "published events are public" ON public.events
  FOR SELECT USING (is_published = true);

CREATE POLICY "admins manage events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Newsletters: admin only
CREATE POLICY "admins manage newsletters" ON public.newsletters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Subscribers: insert allowed for anyone, read/delete for admin
CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admins manage subscribers" ON public.newsletter_subscribers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin messages: insert for anyone, read/update for admin
CREATE POLICY "anyone can send contact message" ON public.admin_messages
  FOR INSERT WITH CHECK (type = 'contact');

CREATE POLICY "admins manage messages" ON public.admin_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- ADMIN USER SETUP
-- After creating the auth user in Supabase Dashboard
-- (Authentication > Users > Add user):
--   Email: greenmarketfarms1@gmail.com
--   Password: GreenMarketFarms2006
-- Then run:
-- ============================================================

INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'greenmarketfarms1@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
