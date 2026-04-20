import crypto from 'crypto';
import db from './db';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function createUser(email: string, password: string) {
  const id = generateId();
  const passwordHash = hashPassword(password);
  const createdAt = Date.now();

  const stmt = db.prepare(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)'
  );
  
  try {
    stmt.run(id, email, passwordHash, createdAt);
    return { id, email };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export function loginUser(email: string, password: string) {
  const passwordHash = hashPassword(password);
  const stmt = db.prepare(
    'SELECT id, email FROM users WHERE email = ? AND password_hash = ?'
  );
  
  const user = stmt.get(email, passwordHash) as { id: string; email: string } | undefined;
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  return user;
}

export function getUserById(id: string) {
  const stmt = db.prepare('SELECT id, email FROM users WHERE id = ?');
  return stmt.get(id) as { id: string; email: string } | undefined;
}
