import db from './db';
import { generateId } from './auth';

export function createWaitlist(userId: string, name: string, description: string, slug: string) {
  const id = generateId();
  const createdAt = Date.now();

  const stmt = db.prepare(
    'INSERT INTO waitlists (id, user_id, slug, name, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  try {
    stmt.run(id, userId, slug, name, description, createdAt);
    return { id, slug, name, description, createdAt };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Slug already taken');
    }
    throw error;
  }
}

export function getWaitlistBySlug(slug: string) {
  const stmt = db.prepare(
    'SELECT id, user_id, slug, name, description, logo_url, primary_color, created_at FROM waitlists WHERE slug = ?'
  );
  return stmt.get(slug);
}

export function getWaitlistsByUserId(userId: string) {
  const stmt = db.prepare(
    'SELECT id, slug, name, description, created_at FROM waitlists WHERE user_id = ? ORDER BY created_at DESC'
  );
  return stmt.all(userId);
}

export function addSignup(waitlistId: string, email: string) {
  const id = generateId();
  const createdAt = Date.now();
  
  // Get current position
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM signups WHERE waitlist_id = ?');
  const { count } = countStmt.get(waitlistId) as { count: number };
  const position = count + 1;

  const stmt = db.prepare(
    'INSERT INTO signups (id, waitlist_id, email, position, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  
  try {
    stmt.run(id, waitlistId, email, position, createdAt);
    return { id, email, position, createdAt };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Email already signed up');
    }
    throw error;
  }
}

export function getSignupCount(waitlistId: string): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM signups WHERE waitlist_id = ?');
  const result = stmt.get(waitlistId) as { count: number };
  return result.count;
}

export function getSignups(waitlistId: string) {
  const stmt = db.prepare(
    'SELECT id, email, position, created_at FROM signups WHERE waitlist_id = ? ORDER BY position ASC'
  );
  return stmt.all(waitlistId);
}

export function trackAnalytics(waitlistId: string, eventType: 'view' | 'signup') {
  const id = generateId();
  const createdAt = Date.now();
  
  const stmt = db.prepare(
    'INSERT INTO analytics (id, waitlist_id, event_type, created_at) VALUES (?, ?, ?, ?)'
  );
  
  stmt.run(id, waitlistId, eventType, createdAt);
}

export function getAnalytics(waitlistId: string) {
  const viewsStmt = db.prepare(
    'SELECT COUNT(*) as count FROM analytics WHERE waitlist_id = ? AND event_type = "view"'
  );
  const signupsStmt = db.prepare(
    'SELECT COUNT(*) as count FROM analytics WHERE waitlist_id = ? AND event_type = "signup"'
  );
  
  const views = (viewsStmt.get(waitlistId) as { count: number }).count;
  const signups = (signupsStmt.get(waitlistId) as { count: number }).count;
  
  const conversionRate = views > 0 ? (signups / views) * 100 : 0;
  
  return { views, signups, conversionRate: conversionRate.toFixed(2) };
}
