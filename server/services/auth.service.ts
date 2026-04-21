import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly SALT_ROUNDS = 10;

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
  }

  /**
   * Verify and decode JWT access token
   */
  verifyAccessToken(token: string): { userId: string; email: string } {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as any;
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return { userId: payload.userId, email: payload.email };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify and decode JWT refresh token
   */
  verifyRefreshToken(token: string): { userId: string } {
    try {
      const payload = jwt.verify(token, this.JWT_REFRESH_SECRET) as any;
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { userId: payload.userId };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const id = this.generateId();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const createdAt = Date.now();

    const stmt = db.prepare(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, userId, tokenHash, expiresAt, createdAt);
  }

  /**
   * Verify refresh token exists in database
   */
  async verifyRefreshTokenInDb(userId: string, token: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stmt = db.prepare(
      'SELECT id FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > ?'
    );
    const result = stmt.get(userId, tokenHash, Date.now());
    return !!result;
  }

  /**
   * Delete refresh token from database
   */
  async deleteRefreshToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stmt = db.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?');
    stmt.run(tokenHash);
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteAllRefreshTokens(userId: string): Promise<void> {
    const stmt = db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?');
    stmt.run(userId);
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    const stmt = db.prepare('DELETE FROM refresh_tokens WHERE expires_at < ?');
    stmt.run(Date.now());
  }

  /**
   * Generate email verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Za-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  }

  /**
   * Generate random ID
   */
  generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Set verification token for user
   */
  async setVerificationToken(userId: string, token: string): Promise<void> {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const stmt = db.prepare(
      'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?'
    );
    stmt.run(token, expiresAt, userId);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    const stmt = db.prepare(
      'SELECT id FROM users WHERE verification_token = ? AND verification_token_expires > ?'
    );
    const user = stmt.get(token, Date.now()) as any;

    if (!user) {
      return false;
    }

    const updateStmt = db.prepare(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?'
    );
    updateStmt.run(user.id);

    return true;
  }

  /**
   * Set password reset token for user
   */
  async setResetToken(email: string, token: string): Promise<boolean> {
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const stmt = db.prepare(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?'
    );
    const result = stmt.run(token, expiresAt, email);
    return result.changes > 0;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const stmt = db.prepare(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?'
    );
    const user = stmt.get(token, Date.now()) as any;

    if (!user) {
      return false;
    }

    const passwordHash = await this.hashPassword(newPassword);
    const updateStmt = db.prepare(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?'
    );
    updateStmt.run(passwordHash, user.id);

    // Invalidate all refresh tokens
    await this.deleteAllRefreshTokens(user.id);

    return true;
  }
}

// Export singleton instance
export const authService = new AuthService();
