import db from './db';
import { authService } from './services/auth.service';
import { emailService } from './services/email.service';

export function generateId(): string {
  return authService.generateId();
}

export async function createUser(email: string, password: string) {
  // Validate password
  const validation = authService.validatePassword(password);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const id = generateId();
  const passwordHash = await authService.hashPassword(password);
  const createdAt = Date.now();
  const updatedAt = Date.now();

  const stmt = db.prepare(
    'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  );
  
  try {
    stmt.run(id, email, passwordHash, createdAt, updatedAt);
    
    // Generate and send verification email
    const verificationToken = authService.generateVerificationToken();
    await authService.setVerificationToken(id, verificationToken);
    await emailService.sendVerificationEmail(email, verificationToken);
    
    return { id, email, emailVerified: false };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const stmt = db.prepare(
    'SELECT id, email, password_hash, email_verified FROM users WHERE email = ?'
  );
  
  const user = stmt.get(email) as { id: string; email: string; password_hash: string; email_verified: number } | undefined;
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await authService.verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  return { 
    id: user.id, 
    email: user.email,
    emailVerified: user.email_verified === 1
  };
}

export function getUserById(id: string) {
  const stmt = db.prepare('SELECT id, email, email_verified, subscription_tier FROM users WHERE id = ?');
  const user = stmt.get(id) as any;
  
  if (!user) {
    return undefined;
  }
  
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.email_verified === 1,
    subscriptionTier: user.subscription_tier || 'free',
  };
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT id, email FROM users WHERE email = ?');
  return stmt.get(email) as { id: string; email: string } | undefined;
}
