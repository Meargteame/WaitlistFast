import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'waitlist.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    verification_token_expires INTEGER,
    reset_token TEXT,
    reset_token_expires INTEGER,
    subscription_tier TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS waitlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    template TEXT DEFAULT 'minimal',
    primary_color TEXT DEFAULT '#18181b',
    font_family TEXT DEFAULT 'inter',
    background_type TEXT DEFAULT 'solid',
    background_value TEXT DEFAULT '#FAFAFA',
    cta_text TEXT DEFAULT 'Join the waitlist',
    show_counter INTEGER DEFAULT 1,
    custom_css TEXT,
    custom_domain TEXT,
    features_json TEXT,
    social_links_json TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS signups (
    id TEXT PRIMARY KEY,
    waitlist_id TEXT NOT NULL,
    email TEXT NOT NULL,
    position INTEGER NOT NULL,
    referral_code TEXT,
    referred_by TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE,
    UNIQUE(waitlist_id, email)
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    waitlist_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    metadata TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS email_campaigns (
    id TEXT PRIMARY KEY,
    waitlist_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    sent_at INTEGER,
    FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_signups_waitlist ON signups(waitlist_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_waitlist ON analytics(waitlist_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
  CREATE INDEX IF NOT EXISTS idx_email_campaigns_waitlist ON email_campaigns(waitlist_id);
  CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
  CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
`);

export default db;
