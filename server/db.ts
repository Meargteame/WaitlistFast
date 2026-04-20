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
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS waitlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#18181b',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS signups (
    id TEXT PRIMARY KEY,
    waitlist_id TEXT NOT NULL,
    email TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE,
    UNIQUE(waitlist_id, email)
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    waitlist_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_signups_waitlist ON signups(waitlist_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_waitlist ON analytics(waitlist_id);
`);

export default db;
