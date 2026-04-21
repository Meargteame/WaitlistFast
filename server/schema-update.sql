-- Add customization fields to waitlists table
ALTER TABLE waitlists ADD COLUMN template TEXT DEFAULT 'minimal';
ALTER TABLE waitlists ADD COLUMN primary_color TEXT DEFAULT '#18181b';
ALTER TABLE waitlists ADD COLUMN font_family TEXT DEFAULT 'inter';
ALTER TABLE waitlists ADD COLUMN background_type TEXT DEFAULT 'solid';
ALTER TABLE waitlists ADD COLUMN background_value TEXT DEFAULT '#FAFAFA';
ALTER TABLE waitlists ADD COLUMN cta_text TEXT DEFAULT 'Join the waitlist';
ALTER TABLE waitlists ADD COLUMN show_counter INTEGER DEFAULT 1;
ALTER TABLE waitlists ADD COLUMN custom_css TEXT;
ALTER TABLE waitlists ADD COLUMN custom_domain TEXT;
ALTER TABLE waitlists ADD COLUMN features_json TEXT;
ALTER TABLE waitlists ADD COLUMN social_links_json TEXT;
