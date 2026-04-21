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
    `SELECT id, user_id, slug, name, description, logo_url, template, primary_color, 
     font_family, background_type, background_value, cta_text, show_counter, 
     custom_css, features_json, social_links_json, created_at 
     FROM waitlists WHERE slug = ?`
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


export function updateWaitlist(slug: string, userId: string, updates: {
  template?: string;
  primaryColor?: string;
  fontFamily?: string;
  backgroundType?: string;
  backgroundValue?: string;
  ctaText?: string;
  showCounter?: boolean;
  logoUrl?: string;
  customCss?: string;
  features?: any[];
  socialLinks?: any[];
}) {
  // First verify ownership
  const waitlist = getWaitlistBySlug(slug) as any;
  if (!waitlist || waitlist.user_id !== userId) {
    throw new Error('Waitlist not found or unauthorized');
  }

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.template !== undefined) {
    fields.push('template = ?');
    values.push(updates.template);
  }
  if (updates.primaryColor !== undefined) {
    fields.push('primary_color = ?');
    values.push(updates.primaryColor);
  }
  if (updates.fontFamily !== undefined) {
    fields.push('font_family = ?');
    values.push(updates.fontFamily);
  }
  if (updates.backgroundType !== undefined) {
    fields.push('background_type = ?');
    values.push(updates.backgroundType);
  }
  if (updates.backgroundValue !== undefined) {
    fields.push('background_value = ?');
    values.push(updates.backgroundValue);
  }
  if (updates.ctaText !== undefined) {
    fields.push('cta_text = ?');
    values.push(updates.ctaText);
  }
  if (updates.showCounter !== undefined) {
    fields.push('show_counter = ?');
    values.push(updates.showCounter ? 1 : 0);
  }
  if (updates.logoUrl !== undefined) {
    fields.push('logo_url = ?');
    values.push(updates.logoUrl);
  }
  if (updates.customCss !== undefined) {
    fields.push('custom_css = ?');
    values.push(updates.customCss);
  }
  if (updates.features !== undefined) {
    fields.push('features_json = ?');
    values.push(JSON.stringify(updates.features));
  }
  if (updates.socialLinks !== undefined) {
    fields.push('social_links_json = ?');
    values.push(JSON.stringify(updates.socialLinks));
  }

  if (fields.length === 0) {
    return waitlist;
  }

  values.push(slug);

  const stmt = db.prepare(
    `UPDATE waitlists SET ${fields.join(', ')} WHERE slug = ?`
  );

  stmt.run(...values);

  return getWaitlistBySlug(slug);
}
