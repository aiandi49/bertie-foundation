-- ============================================================
-- Bertie Foundation - Supabase Setup SQL
-- Run this in your Supabase SQL Editor
-- ============================================================

-- contact_requests
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    category TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'received'
);

-- volunteer_applications
CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    interests JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    availability TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'active',
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating INTEGER,
    comment TEXT,
    category TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- form_submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    id TEXT PRIMARY KEY,
    form_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB DEFAULT '{}'
);

-- success_stories
CREATE TABLE IF NOT EXISTS success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    story TEXT,
    program TEXT,
    impact TEXT,
    name TEXT,
    email TEXT,
    image_url TEXT,
    tags JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    author TEXT,
    image_url TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]',
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    goal_amount NUMERIC DEFAULT 0,
    current_amount NUMERIC DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    recent_donations JSONB DEFAULT '[]',
    impact_metrics JSONB DEFAULT '{}'
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT,
    component TEXT,
    action TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- albums
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    image_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- image_metadata
CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT,
    category TEXT,
    title TEXT,
    description TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    url TEXT,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL
);

-- moderation_submissions
CREATE TABLE IF NOT EXISTS moderation_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    moderated_at TIMESTAMPTZ,
    email TEXT,
    name TEXT,
    data JSONB DEFAULT '{}',
    admin_notes TEXT
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    customer JSONB,
    items JSONB DEFAULT '[]',
    total_amount NUMERIC,
    appointment JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    conversation_id TEXT
);

-- donation_orders
CREATE TABLE IF NOT EXISTS donation_orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    items JSONB DEFAULT '[]',
    total_amount NUMERIC,
    donation_type TEXT DEFAULT 'one-time',
    message TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- processed_transcripts
CREATE TABLE IF NOT EXISTS processed_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE,
    summary TEXT,
    categories JSONB DEFAULT '[]',
    sentiment TEXT,
    customer_info JSONB,
    order_details JSONB DEFAULT '[]',
    appointment_info JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security (recommended)
-- ============================================================
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_transcripts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (your backend uses the service key)
CREATE POLICY "service_role_all" ON contact_requests FOR ALL USING (true);
CREATE POLICY "service_role_all" ON volunteer_applications FOR ALL USING (true);
CREATE POLICY "service_role_all" ON newsletter_subscribers FOR ALL USING (true);
CREATE POLICY "service_role_all" ON feedback FOR ALL USING (true);
CREATE POLICY "service_role_all" ON form_submissions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON success_stories FOR ALL USING (true);
CREATE POLICY "service_role_all" ON blog_posts FOR ALL USING (true);
CREATE POLICY "service_role_all" ON campaigns FOR ALL USING (true);
CREATE POLICY "service_role_all" ON notifications FOR ALL USING (true);
CREATE POLICY "service_role_all" ON analytics_events FOR ALL USING (true);
CREATE POLICY "service_role_all" ON albums FOR ALL USING (true);
CREATE POLICY "service_role_all" ON image_metadata FOR ALL USING (true);
CREATE POLICY "service_role_all" ON moderation_submissions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON orders FOR ALL USING (true);
CREATE POLICY "service_role_all" ON donation_orders FOR ALL USING (true);
CREATE POLICY "service_role_all" ON processed_transcripts FOR ALL USING (true);

-- Storage bucket for images (run in Supabase dashboard Storage tab, or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
