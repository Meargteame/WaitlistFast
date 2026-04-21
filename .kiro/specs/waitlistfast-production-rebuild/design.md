# Design Document: WaitlistFast Production Rebuild

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │  Mobile Web  │  │  API Client  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   CDN/Proxy     │
                    │  (Cloudflare)   │
                    └────────┬────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
┌─────────▼─────────┐              ┌───────────▼──────────┐
│  Frontend Server  │              │   Backend API        │
│   (Vite/React)    │              │   (Express.js)       │
│                   │              │                      │
│  - React Router   │              │  - Auth Service      │
│  - State Mgmt     │              │  - Waitlist Service  │
│  - UI Components  │              │  - Email Service     │
└───────────────────┘              │  - Payment Service   │
                                   │  - Analytics Service │
                                   └──────────┬───────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
          ┌─────────▼────────┐    ┌──────────▼─────────┐   ┌──────────▼─────────┐
          │    Database      │    │  External Services  │   │   File Storage     │
          │  (SQLite/PG)     │    │                     │   │   (Local/S3)       │
          │                  │    │  - Stripe           │   │                    │
          │  - Users         │    │  - Resend/SendGrid  │   │  - Logos           │
          │  - Waitlists     │    │  - Let's Encrypt    │   │  - Backgrounds     │
          │  - Signups       │    │  - Gemini AI        │   │  - Exports         │
          │  - Analytics     │    └─────────────────────┘   └────────────────────┘
          │  - Sessions      │
          └──────────────────┘
```

### 1.2 Component Architecture

**Frontend Components:**
- Presentation Layer: React components
- State Management: React Context + hooks
- Routing: React Router v6
- Styling: Tailwind CSS v4
- Animations: Framer Motion

**Backend Services:**
- API Layer: Express.js REST endpoints
- Business Logic: Service modules
- Data Access: Repository pattern
- Authentication: JWT middleware
- Rate Limiting: express-rate-limit

## 2. Data Models and Database Schema

### 2.1 Enhanced Database Schema


```sql
-- Users table (enhanced for Phase 2)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  verification_token_expires INTEGER,
  reset_token TEXT,
  reset_token_expires INTEGER,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  stripe_customer_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Refresh tokens table (Phase 2)
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Waitlists table (enhanced for Phase 1 & 4)
CREATE TABLE waitlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  
  -- Template & Customization (Phase 1)
  template TEXT DEFAULT 'minimal', -- 'minimal' | 'startup' | 'bold' | 'product' | 'coming-soon'
  primary_color TEXT DEFAULT '#18181b',
  font_family TEXT DEFAULT 'inter',
  background_type TEXT DEFAULT 'solid', -- 'solid' | 'gradient' | 'image'
  background_value TEXT DEFAULT '#FAFAFA',
  cta_text TEXT DEFAULT 'Join the waitlist',
  show_counter INTEGER DEFAULT 1,
  custom_css TEXT,
  features_json TEXT, -- JSON array of features
  social_links_json TEXT, -- JSON array of social links
  
  -- Custom Domain (Phase 4)
  custom_domain TEXT,
  domain_verified INTEGER DEFAULT 0,
  ssl_certificate_id TEXT,
  
  -- Settings
  webhook_url TEXT,
  webhook_secret TEXT,
  api_key_hash TEXT,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Signups table (enhanced for Phase 4)
CREATE TABLE signups (
  id TEXT PRIMARY KEY,
  waitlist_id TEXT NOT NULL,
  email TEXT NOT NULL,
  position INTEGER NOT NULL,
  
  -- Referral system (Phase 4)
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT, -- referral_code of referrer
  referral_count INTEGER DEFAULT 0,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Status
  unsubscribed INTEGER DEFAULT 0,
  unsubscribe_token TEXT,
  
  created_at INTEGER NOT NULL,
  FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE,
  UNIQUE(waitlist_id, email)
);

-- Analytics events table (enhanced for Phase 4)
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  waitlist_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'view' | 'signup' | 'referral' | 'email_open' | 'email_click'
  metadata TEXT, -- JSON with additional data
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE
);

-- Email campaigns table (Phase 2)
CREATE TABLE email_campaigns (
  id TEXT PRIMARY KEY,
  waitlist_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'draft' | 'sending' | 'sent' | 'failed'
  created_at INTEGER NOT NULL,
  sent_at INTEGER,
  FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE
);

-- Team members table (Phase 5)
CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- account owner
  member_email TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin' | 'member'
  invitation_token TEXT,
  invitation_expires INTEGER,
  accepted INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, member_email)
);

-- Webhook deliveries table (Phase 4)
CREATE TABLE webhook_deliveries (
  id TEXT PRIMARY KEY,
  waitlist_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 0,
  next_retry_at INTEGER,
  delivered INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (waitlist_id) REFERENCES waitlists(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_signups_waitlist ON signups(waitlist_id);
CREATE INDEX idx_signups_referral ON signups(referral_code);
CREATE INDEX idx_analytics_waitlist ON analytics(waitlist_id);
CREATE INDEX idx_analytics_created ON analytics(created_at);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) WHERE delivered = 0;
```

### 2.2 TypeScript Type Definitions

```typescript
// Core domain types
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  subscriptionTier: 'free' | 'pro';
  stripeCustomerId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Waitlist {
  id: string;
  userId: string;
  slug: string;
  name: string;
  description: string;
  logoUrl?: string;
  
  // Customization
  template: 'minimal' | 'startup' | 'bold' | 'product' | 'coming-soon';
  primaryColor: string;
  fontFamily: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundValue: string;
  ctaText: string;
  showCounter: boolean;
  customCss?: string;
  features?: Feature[];
  socialLinks?: SocialLink[];
  
  // Custom domain
  customDomain?: string;
  domainVerified: boolean;
  
  // Settings
  webhookUrl?: string;
  
  createdAt: number;
  updatedAt: number;
}

export interface Signup {
  id: string;
  waitlistId: string;
  email: string;
  position: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  unsubscribed: boolean;
  createdAt: number;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'github';
  url: string;
}

export interface AnalyticsEvent {
  id: string;
  waitlistId: string;
  eventType: 'view' | 'signup' | 'referral' | 'email_open' | 'email_click';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  createdAt: number;
}

export interface EmailCampaign {
  id: string;
  waitlistId: string;
  subject: string;
  htmlBody: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  createdAt: number;
  sentAt?: number;
}
```

## 3. API Endpoint Specifications

### 3.1 Authentication Endpoints (Phase 2)


```typescript
// POST /api/auth/signup
interface SignupRequest {
  email: string;
  password: string;
}
interface SignupResponse {
  user: User;
  accessToken: string;
  refreshToken: string; // HTTP-only cookie
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string; // HTTP-only cookie
}

// POST /api/auth/refresh
interface RefreshResponse {
  accessToken: string;
}

// POST /api/auth/verify-email
interface VerifyEmailRequest {
  token: string;
}
interface VerifyEmailResponse {
  success: boolean;
}

// POST /api/auth/resend-verification
interface ResendVerificationResponse {
  success: boolean;
}

// POST /api/auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}
interface ForgotPasswordResponse {
  success: boolean;
}

// POST /api/auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
interface ResetPasswordResponse {
  success: boolean;
}

// POST /api/auth/logout
interface LogoutResponse {
  success: boolean;
}

// GET /api/auth/me
interface MeResponse {
  user: User;
}
```

### 3.2 Waitlist Endpoints (Phase 1 & 4)

```typescript
// POST /api/waitlists/generate (AI content generation)
interface GenerateRequest {
  productName: string;
  shortDescription: string;
}
interface GenerateResponse {
  name: string;
  description: string;
  suggestedSlug: string;
}

// POST /api/waitlists
interface CreateWaitlistRequest {
  name: string;
  description: string;
  slug: string;
  template?: string;
  primaryColor?: string;
  fontFamily?: string;
  backgroundType?: string;
  backgroundValue?: string;
  ctaText?: string;
  showCounter?: boolean;
  features?: Feature[];
  socialLinks?: SocialLink[];
}
interface CreateWaitlistResponse {
  waitlist: Waitlist;
}

// GET /api/waitlists
interface ListWaitlistsResponse {
  waitlists: Waitlist[];
  usage: {
    waitlistCount: number;
    signupCount: number;
    limits: {
      waitlists: number | null; // null = unlimited
      signups: number | null;
    };
  };
}

// GET /api/waitlists/:slug
interface GetWaitlistResponse {
  waitlist: Waitlist;
  signupCount: number;
}

// PUT /api/waitlists/:slug
interface UpdateWaitlistRequest {
  name?: string;
  description?: string;
  template?: string;
  primaryColor?: string;
  fontFamily?: string;
  backgroundType?: string;
  backgroundValue?: string;
  ctaText?: string;
  showCounter?: boolean;
  customCss?: string;
  features?: Feature[];
  socialLinks?: SocialLink[];
  webhookUrl?: string;
}
interface UpdateWaitlistResponse {
  waitlist: Waitlist;
}

// DELETE /api/waitlists/:slug
interface DeleteWaitlistResponse {
  success: boolean;
}

// POST /api/waitlists/:slug/logo
// Content-Type: multipart/form-data
interface UploadLogoResponse {
  logoUrl: string;
}

// POST /api/waitlists/:slug/signup (public endpoint)
interface SignupRequest {
  email: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
interface SignupResponse {
  signup: Signup;
  position: number;
  referralLink: string;
}

// GET /api/waitlists/:slug/signups (authenticated)
interface GetSignupsResponse {
  signups: Signup[];
  total: number;
}

// GET /api/waitlists/:slug/analytics (authenticated)
interface GetAnalyticsResponse {
  views: number;
  signups: number;
  conversionRate: number;
  referrals: number;
  timeSeriesData: {
    date: string;
    views: number;
    signups: number;
  }[];
  trafficSources: {
    source: string;
    count: number;
  }[];
  geographicData: {
    country: string;
    count: number;
  }[];
}

// POST /api/waitlists/:slug/export (authenticated)
interface ExportRequest {
  format: 'csv' | 'json';
  startDate?: number;
  endDate?: number;
}
interface ExportResponse {
  downloadUrl: string;
}
```

### 3.3 Email Campaign Endpoints (Phase 2)

```typescript
// POST /api/waitlists/:slug/campaigns
interface CreateCampaignRequest {
  subject: string;
  htmlBody: string;
}
interface CreateCampaignResponse {
  campaign: EmailCampaign;
}

// GET /api/waitlists/:slug/campaigns
interface ListCampaignsResponse {
  campaigns: EmailCampaign[];
}

// POST /api/waitlists/:slug/campaigns/:campaignId/send
interface SendCampaignResponse {
  success: boolean;
  estimatedDeliveryTime: number;
}

// GET /api/waitlists/:slug/campaigns/:campaignId/stats
interface CampaignStatsResponse {
  campaign: EmailCampaign;
  openRate: number;
  clickRate: number;
}
```

### 3.4 Payment Endpoints (Phase 3)

```typescript
// POST /api/billing/create-checkout-session
interface CreateCheckoutRequest {
  tier: 'pro';
  successUrl: string;
  cancelUrl: string;
}
interface CreateCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

// POST /api/billing/create-portal-session
interface CreatePortalResponse {
  portalUrl: string;
}

// GET /api/billing/subscription
interface GetSubscriptionResponse {
  tier: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
}

// POST /api/billing/webhook (Stripe webhook)
// Handles: customer.subscription.created, customer.subscription.updated,
//          customer.subscription.deleted, invoice.payment_failed
```

### 3.5 Custom Domain Endpoints (Phase 4)

```typescript
// POST /api/waitlists/:slug/domain
interface AddDomainRequest {
  domain: string;
}
interface AddDomainResponse {
  domain: string;
  dnsRecords: {
    type: string;
    name: string;
    value: string;
  }[];
}

// POST /api/waitlists/:slug/domain/verify
interface VerifyDomainResponse {
  verified: boolean;
  sslProvisioned: boolean;
}

// DELETE /api/waitlists/:slug/domain
interface RemoveDomainResponse {
  success: boolean;
}
```

## 4. Service Layer Architecture

### 4.1 Authentication Service (Phase 2)

```typescript
// server/services/auth.service.ts

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  
  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  
  /**
   * Verify a password against a hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * Generate JWT access token
   * @param userId - User ID
   * @param email - User email
   * @returns JWT access token
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
   * @param userId - User ID
   * @returns JWT refresh token
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
   * @param token - JWT token
   * @returns Decoded token payload
   */
  verifyAccessToken(token: string): { userId: string; email: string } {
    const payload = jwt.verify(token, this.JWT_SECRET) as any;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId, email: payload.email };
  }
  
  /**
   * Verify and decode JWT refresh token
   * @param token - JWT token
   * @returns Decoded token payload
   */
  verifyRefreshToken(token: string): { userId: string } {
    const payload = jwt.verify(token, this.JWT_REFRESH_SECRET) as any;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId };
  }
  
  /**
   * Generate email verification token
   * @returns Random token string
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Generate password reset token
   * @returns Random token string
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns True if password meets requirements
   */
  validatePassword(password: string): boolean {
    // At least 8 characters, one letter, one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  }
}
```

### 4.2 Email Service (Phase 2)

```typescript
// server/services/email.service.ts

import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;
  private readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@waitlistfast.com';
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  /**
   * Send welcome email to new signup
   * @param email - Recipient email
   * @param waitlistName - Name of waitlist
   * @param position - Position in waitlist
   * @param referralLink - Unique referral link
   */
  async sendWelcomeEmail(
    email: string,
    waitlistName: string,
    position: number,
    referralLink: string
  ): Promise<void> {
    const html = this.renderWelcomeTemplate({
      waitlistName,
      position,
      referralLink,
    });
    
    await this.resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject: `You're on the ${waitlistName} waitlist!`,
      html,
    });
  }
  
  /**
   * Send email verification email
   * @param email - Recipient email
   * @param verificationUrl - Verification URL with token
   */
  async sendVerificationEmail(
    email: string,
    verificationUrl: string
  ): Promise<void> {
    const html = this.renderVerificationTemplate({ verificationUrl });
    
    await this.resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject: 'Verify your email address',
      html,
    });
  }
  
  /**
   * Send password reset email
   * @param email - Recipient email
   * @param resetUrl - Reset URL with token
   */
  async sendPasswordResetEmail(
    email: string,
    resetUrl: string
  ): Promise<void> {
    const html = this.renderPasswordResetTemplate({ resetUrl });
    
    await this.resend.emails.send({
      from: this.FROM_EMAIL,
      to: email,
      subject: 'Reset your password',
      html,
    });
  }
  
  /**
   * Send bulk campaign email
   * @param emails - Array of recipient emails
   * @param subject - Email subject
   * @param htmlBody - Email HTML body
   * @param unsubscribeUrl - Unsubscribe URL
   */
  async sendCampaignEmail(
    emails: string[],
    subject: string,
    htmlBody: string,
    unsubscribeUrl: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    
    // Send in batches of 100
    for (let i = 0; i < emails.length; i += 100) {
      const batch = emails.slice(i, i + 100);
      
      try {
        await Promise.all(
          batch.map(email =>
            this.resend.emails.send({
              from: this.FROM_EMAIL,
              to: email,
              subject,
              html: htmlBody + `<p><a href="${unsubscribeUrl}">Unsubscribe</a></p>`,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
              },
            })
          )
        );
        sent += batch.length;
      } catch (error) {
        failed += batch.length;
      }
      
      // Rate limiting: wait 1 second between batches
      if (i + 100 < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { sent, failed };
  }
  
  private renderWelcomeTemplate(data: any): string {
    // Template rendering logic
    return `<html>...</html>`;
  }
  
  private renderVerificationTemplate(data: any): string {
    return `<html>...</html>`;
  }
  
  private renderPasswordResetTemplate(data: any): string {
    return `<html>...</html>`;
  }
}
```

### 4.3 Payment Service (Phase 3)


```typescript
// server/services/payment.service.ts

import Stripe from 'stripe';

export class PaymentService {
  private stripe: Stripe;
  private readonly PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }
  
  /**
   * Create or retrieve Stripe customer
   * @param userId - User ID
   * @param email - User email
   * @returns Stripe customer ID
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if customer exists in database
    const existingCustomerId = await this.getCustomerIdFromDb(userId);
    if (existingCustomerId) {
      return existingCustomerId;
    }
    
    // Create new customer
    const customer = await this.stripe.customers.create({
      email,
      metadata: { userId },
    });
    
    // Save to database
    await this.saveCustomerIdToDb(userId, customer.id);
    
    return customer.id;
  }
  
  /**
   * Create Stripe Checkout session for Pro subscription
   * @param customerId - Stripe customer ID
   * @param successUrl - Redirect URL on success
   * @param cancelUrl - Redirect URL on cancel
   * @returns Checkout session
   */
  async createCheckoutSession(
    customerId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: this.PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }
  
  /**
   * Create Stripe billing portal session
   * @param customerId - Stripe customer ID
   * @param returnUrl - Return URL after portal
   * @returns Portal session
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
  
  /**
   * Handle subscription created webhook
   * @param subscription - Stripe subscription object
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    await this.updateUserSubscription(userId, 'pro', 'active');
  }
  
  /**
   * Handle subscription updated webhook
   * @param subscription - Stripe subscription object
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    const status = subscription.status;
    
    if (status === 'active') {
      await this.updateUserSubscription(userId, 'pro', 'active');
    } else if (status === 'canceled' || status === 'unpaid') {
      await this.updateUserSubscription(userId, 'free', status);
    }
  }
  
  /**
   * Handle subscription deleted webhook
   * @param subscription - Stripe subscription object
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    await this.updateUserSubscription(userId, 'free', 'canceled');
  }
  
  /**
   * Verify webhook signature
   * @param payload - Raw request body
   * @param signature - Stripe signature header
   * @returns Stripe event
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }
  
  private async getCustomerIdFromDb(userId: string): Promise<string | null> {
    // Database query implementation
    return null;
  }
  
  private async saveCustomerIdToDb(userId: string, customerId: string): Promise<void> {
    // Database update implementation
  }
  
  private async updateUserSubscription(
    userId: string,
    tier: 'free' | 'pro',
    status: string
  ): Promise<void> {
    // Database update implementation
  }
}
```

### 4.4 Analytics Service (Phase 4)

```typescript
// server/services/analytics.service.ts

export class AnalyticsService {
  /**
   * Track analytics event
   * @param waitlistId - Waitlist ID
   * @param eventType - Type of event
   * @param metadata - Additional event data
   */
  async trackEvent(
    waitlistId: string,
    eventType: 'view' | 'signup' | 'referral' | 'email_open' | 'email_click',
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      referrerUrl?: string;
      [key: string]: any;
    }
  ): Promise<void> {
    // Insert into analytics table
  }
  
  /**
   * Get analytics summary for waitlist
   * @param waitlistId - Waitlist ID
   * @param startDate - Start date (timestamp)
   * @param endDate - End date (timestamp)
   * @returns Analytics summary
   */
  async getAnalyticsSummary(
    waitlistId: string,
    startDate?: number,
    endDate?: number
  ): Promise<{
    views: number;
    signups: number;
    conversionRate: number;
    referrals: number;
  }> {
    // Query analytics table with date filters
    return {
      views: 0,
      signups: 0,
      conversionRate: 0,
      referrals: 0,
    };
  }
  
  /**
   * Get time series data for charts
   * @param waitlistId - Waitlist ID
   * @param startDate - Start date
   * @param endDate - End date
   * @param interval - 'day' | 'week' | 'month'
   * @returns Time series data
   */
  async getTimeSeriesData(
    waitlistId: string,
    startDate: number,
    endDate: number,
    interval: 'day' | 'week' | 'month'
  ): Promise<Array<{ date: string; views: number; signups: number }>> {
    // Group by date interval and count events
    return [];
  }
  
  /**
   * Get traffic sources breakdown
   * @param waitlistId - Waitlist ID
   * @returns Traffic sources with counts
   */
  async getTrafficSources(
    waitlistId: string
  ): Promise<Array<{ source: string; count: number }>> {
    // Parse referrer URLs and group by domain
    return [];
  }
  
  /**
   * Get geographic distribution
   * @param waitlistId - Waitlist ID
   * @returns Geographic data
   */
  async getGeographicData(
    waitlistId: string
  ): Promise<Array<{ country: string; count: number }>> {
    // Use IP geolocation to determine country
    return [];
  }
}
```

### 4.5 Webhook Service (Phase 4)

```typescript
// server/services/webhook.service.ts

import crypto from 'crypto';

export class WebhookService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [60, 300, 900]; // 1min, 5min, 15min
  
  /**
   * Deliver webhook event
   * @param waitlistId - Waitlist ID
   * @param eventType - Event type
   * @param payload - Event payload
   */
  async deliverWebhook(
    waitlistId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    const waitlist = await this.getWaitlist(waitlistId);
    
    if (!waitlist.webhookUrl) {
      return; // No webhook configured
    }
    
    const deliveryId = this.generateId();
    const signature = this.generateSignature(payload, waitlist.webhookSecret);
    
    // Store delivery record
    await this.createDeliveryRecord(deliveryId, waitlistId, eventType, payload);
    
    // Attempt delivery
    await this.attemptDelivery(deliveryId, waitlist.webhookUrl, payload, signature);
  }
  
  /**
   * Attempt webhook delivery with retries
   * @param deliveryId - Delivery record ID
   * @param url - Webhook URL
   * @param payload - Event payload
   * @param signature - HMAC signature
   */
  private async attemptDelivery(
    deliveryId: string,
    url: string,
    payload: any,
    signature: string
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      await this.updateDeliveryRecord(deliveryId, {
        responseStatus: response.status,
        responseBody: await response.text(),
        delivered: response.ok,
      });
      
      if (!response.ok) {
        // Schedule retry
        await this.scheduleRetry(deliveryId);
      }
    } catch (error: any) {
      await this.updateDeliveryRecord(deliveryId, {
        responseStatus: 0,
        responseBody: error.message,
        delivered: false,
      });
      
      // Schedule retry
      await this.scheduleRetry(deliveryId);
    }
  }
  
  /**
   * Schedule webhook retry with exponential backoff
   * @param deliveryId - Delivery record ID
   */
  private async scheduleRetry(deliveryId: string): Promise<void> {
    const delivery = await this.getDeliveryRecord(deliveryId);
    
    if (delivery.attemptCount >= this.MAX_RETRIES) {
      // Max retries reached, notify user
      await this.notifyWebhookFailure(delivery.waitlistId);
      return;
    }
    
    const nextRetryAt = Date.now() + this.RETRY_DELAYS[delivery.attemptCount] * 1000;
    
    await this.updateDeliveryRecord(deliveryId, {
      attemptCount: delivery.attemptCount + 1,
      nextRetryAt,
    });
  }
  
  /**
   * Generate HMAC signature for webhook payload
   * @param payload - Event payload
   * @param secret - Webhook secret
   * @returns HMAC signature
   */
  private generateSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }
  
  /**
   * Process pending webhook retries
   * Called by background job every minute
   */
  async processPendingRetries(): Promise<void> {
    const pendingDeliveries = await this.getPendingDeliveries();
    
    for (const delivery of pendingDeliveries) {
      const waitlist = await this.getWaitlist(delivery.waitlistId);
      const signature = this.generateSignature(
        JSON.parse(delivery.payload),
        waitlist.webhookSecret
      );
      
      await this.attemptDelivery(
        delivery.id,
        waitlist.webhookUrl,
        JSON.parse(delivery.payload),
        signature
      );
    }
  }
  
  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
  
  private async getWaitlist(id: string): Promise<any> {
    // Database query
    return {};
  }
  
  private async createDeliveryRecord(
    id: string,
    waitlistId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    // Database insert
  }
  
  private async updateDeliveryRecord(id: string, updates: any): Promise<void> {
    // Database update
  }
  
  private async getDeliveryRecord(id: string): Promise<any> {
    // Database query
    return {};
  }
  
  private async getPendingDeliveries(): Promise<any[]> {
    // Query deliveries where delivered = 0 and nextRetryAt <= now
    return [];
  }
  
  private async notifyWebhookFailure(waitlistId: string): Promise<void> {
    // Send email to user about webhook failure
  }
}
```

## 5. Frontend Architecture

### 5.1 Component Hierarchy

```
App
├── Router
│   ├── PublicRoutes
│   │   ├── LandingPage
│   │   ├── LoginPage
│   │   ├── SignupPage
│   │   ├── ForgotPasswordPage
│   │   ├── ResetPasswordPage
│   │   ├── VerifyEmailPage
│   │   └── WaitlistPage (public)
│   │       ├── MinimalTemplate
│   │       ├── StartupTemplate
│   │       ├── BoldTemplate
│   │       ├── ProductTemplate
│   │       └── ComingSoonTemplate
│   └── ProtectedRoutes (requires auth)
│       ├── DashboardLayout
│       │   ├── Sidebar
│       │   ├── Header
│       │   └── Content
│       │       ├── Dashboard
│       │       │   ├── StatsCard
│       │       │   ├── WaitlistCard
│       │       │   └── QuickActions
│       │       ├── CreateWaitlist
│       │       │   ├── Step1: BasicInfo
│       │       │   ├── Step2: TemplateSelector
│       │       │   └── Step3: Customize
│       │       ├── CustomizePage
│       │       │   ├── TemplateSelector
│       │       │   ├── ColorPicker
│       │       │   ├── LogoUploader
│       │       │   ├── FontSelector
│       │       │   ├── BackgroundPicker
│       │       │   ├── FeatureEditor
│       │       │   ├── SocialLinksEditor
│       │       │   └── LivePreview
│       │       ├── AnalyticsPage
│       │       │   ├── MetricsOverview
│       │       │   ├── TimeSeriesChart
│       │       │   ├── TrafficSourcesChart
│       │       │   └── GeographicMap
│       │       ├── EmailCampaignsPage
│       │       │   ├── CampaignList
│       │       │   ├── CreateCampaign
│       │       │   └── CampaignStats
│       │       ├── SettingsPage
│       │       │   ├── ProfileSettings
│       │       │   ├── SecuritySettings
│       │       │   ├── NotificationSettings
│       │       │   ├── TeamSettings
│       │       │   └── DangerZone
│       │       └── BillingPage
│       │           ├── CurrentPlan
│       │           ├── UsageMetrics
│       │           ├── UpgradeCard
│       │           └── InvoiceHistory
└── GlobalComponents
    ├── ErrorModal
    ├── LoadingSpinner
    ├── Toast
    └── ConfirmDialog
```

### 5.2 State Management

```typescript
// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated on mount
    refreshAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    const { user, accessToken } = await api.auth.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };
  
  const signup = async (email: string, password: string) => {
    const { user, accessToken } = await api.auth.signup(email, password);
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };
  
  const logout = async () => {
    await api.auth.logout();
    localStorage.removeItem('accessToken');
    setUser(null);
  };
  
  const refreshAuth = async () => {
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 5.3 Template Rendering Engine

```typescript
// src/lib/templateRenderer.tsx

import { MinimalTemplate } from '../components/templates/MinimalTemplate';
import { StartupTemplate } from '../components/templates/StartupTemplate';
import { BoldTemplate } from '../components/templates/BoldTemplate';
import { ProductTemplate } from '../components/templates/ProductTemplate';
import { ComingSoonTemplate } from '../components/templates/ComingSoonTemplate';

export interface TemplateProps {
  waitlist: Waitlist;
  signupCount: number;
  onSignup: (email: string) => Promise<void>;
}

/**
 * Render the appropriate template based on waitlist configuration
 * @param waitlist - Waitlist configuration
 * @param signupCount - Current signup count
 * @param onSignup - Signup handler function
 * @returns Template component
 */
export function renderTemplate(
  waitlist: Waitlist,
  signupCount: number,
  onSignup: (email: string) => Promise<void>
): JSX.Element {
  const props: TemplateProps = { waitlist, signupCount, onSignup };
  
  switch (waitlist.template) {
    case 'minimal':
      return <MinimalTemplate {...props} />;
    case 'startup':
      return <StartupTemplate {...props} />;
    case 'bold':
      return <BoldTemplate {...props} />;
    case 'product':
      return <ProductTemplate {...props} />;
    case 'coming-soon':
      return <ComingSoonTemplate {...props} />;
    default:
      return <MinimalTemplate {...props} />;
  }
}

/**
 * Apply custom styling to template
 * @param waitlist - Waitlist configuration
 * @returns CSS variables object
 */
export function getTemplateStyles(waitlist: Waitlist): React.CSSProperties {
  const palette = generatePalette(waitlist.primaryColor);
  
  return {
    '--color-primary': palette.primary,
    '--color-primary-light': palette.primaryLight,
    '--color-primary-dark': palette.primaryDark,
    '--color-background': palette.background,
    '--color-text': palette.text,
    '--font-family': waitlist.fontFamily,
  } as React.CSSProperties;
}
```

## 6. Key Algorithms

### 6.1 Color Palette Generation

```typescript
// src/lib/colors.ts

import chroma from 'chroma-js';

/**
 * Generate a complete color palette from a primary color
 * Uses color theory to create harmonious complementary colors
 * 
 * @param primaryColor - Hex color code
 * @returns Complete color palette
 */
export function generatePalette(primaryColor: string): ColorPalette {
  const primary = chroma(primaryColor);
  
  // Generate shades (lighter and darker versions)
  const primaryLight = primary.brighten(1.5).hex();
  const primaryDark = primary.darken(1.5).hex();
  
  // Generate complementary color (opposite on color wheel)
  const complementary = primary.set('hsl.h', '+180').hex();
  
  // Generate analogous colors (adjacent on color wheel)
  const analogous1 = primary.set('hsl.h', '+30').hex();
  const analogous2 = primary.set('hsl.h', '-30').hex();
  
  // Neutral colors based on primary
  const background = primary.luminance() > 0.5
    ? '#FAFAFA' // Light background for dark primary
    : '#18181b'; // Dark background for light primary
    
  const text = primary.luminance() > 0.5
    ? '#18181b' // Dark text for light primary
    : '#FAFAFA'; // Light text for dark primary
  
  return {
    primary: primaryColor,
    primaryLight,
    primaryDark,
    complementary,
    analogous: [analogous1, analogous2],
    background,
    backgroundDark: chroma(background).darken(0.2).hex(),
    text,
    textSecondary: chroma(text).alpha(0.7).hex(),
    border: chroma(background).darken(0.5).hex(),
  };
}

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  complementary: string;
  analogous: string[];
  background: string;
  backgroundDark: string;
  text: string;
  textSecondary: string;
  border: string;
}
```

### 6.2 Referral Tracking Algorithm


```typescript
// server/services/referral.service.ts

import crypto from 'crypto';

export class ReferralService {
  /**
   * Generate unique referral code
   * @returns 8-character alphanumeric code
   */
  generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  
  /**
   * Process referral signup and update positions
   * 
   * Algorithm:
   * 1. Find referrer by referral code
   * 2. Increment referrer's referral count
   * 3. Move referrer up one position
   * 4. Update all affected positions
   * 
   * @param waitlistId - Waitlist ID
   * @param referralCode - Referrer's code
   * @param newSignupId - New signup ID
   */
  async processReferral(
    waitlistId: string,
    referralCode: string,
    newSignupId: string
  ): Promise<void> {
    // Find referrer
    const referrer = await this.findSignupByReferralCode(waitlistId, referralCode);
    
    if (!referrer) {
      return; // Invalid referral code
    }
    
    // Prevent self-referral
    const newSignup = await this.getSignup(newSignupId);
    if (newSignup.email === referrer.email) {
      return;
    }
    
    // Start transaction
    await this.db.transaction(async () => {
      // Increment referrer's count
      await this.incrementReferralCount(referrer.id);
      
      // Move referrer up one position
      const newPosition = Math.max(1, referrer.position - 1);
      
      // Update positions: everyone between newPosition and referrer.position moves down
      await this.shiftPositions(
        waitlistId,
        newPosition,
        referrer.position - 1,
        1 // shift down by 1
      );
      
      // Update referrer position
      await this.updatePosition(referrer.id, newPosition);
      
      // Link new signup to referrer
      await this.linkReferral(newSignupId, referralCode);
      
      // Track analytics event
      await this.trackReferralEvent(waitlistId, referrer.id, newSignupId);
    });
  }
  
  /**
   * Calculate viral coefficient
   * K = (number of invites sent) × (conversion rate)
   * K > 1 means viral growth
   * 
   * @param waitlistId - Waitlist ID
   * @returns Viral coefficient
   */
  async calculateViralCoefficient(waitlistId: string): Promise<number> {
    const totalSignups = await this.getTotalSignups(waitlistId);
    const referralSignups = await this.getReferralSignups(waitlistId);
    
    if (totalSignups === 0) {
      return 0;
    }
    
    // Average referrals per user
    const avgReferrals = referralSignups / totalSignups;
    
    // Conversion rate (signups / views)
    const conversionRate = await this.getConversionRate(waitlistId);
    
    // Viral coefficient
    return avgReferrals * conversionRate;
  }
  
  private async findSignupByReferralCode(
    waitlistId: string,
    referralCode: string
  ): Promise<any> {
    // Database query
    return null;
  }
  
  private async getSignup(id: string): Promise<any> {
    return {};
  }
  
  private async incrementReferralCount(signupId: string): Promise<void> {
    // UPDATE signups SET referral_count = referral_count + 1 WHERE id = ?
  }
  
  private async shiftPositions(
    waitlistId: string,
    startPosition: number,
    endPosition: number,
    shift: number
  ): Promise<void> {
    // UPDATE signups SET position = position + shift
    // WHERE waitlist_id = ? AND position >= ? AND position <= ?
  }
  
  private async updatePosition(signupId: string, position: number): Promise<void> {
    // UPDATE signups SET position = ? WHERE id = ?
  }
  
  private async linkReferral(signupId: string, referralCode: string): Promise<void> {
    // UPDATE signups SET referred_by = ? WHERE id = ?
  }
  
  private async trackReferralEvent(
    waitlistId: string,
    referrerId: string,
    newSignupId: string
  ): Promise<void> {
    // Insert analytics event
  }
  
  private async getTotalSignups(waitlistId: string): Promise<number> {
    return 0;
  }
  
  private async getReferralSignups(waitlistId: string): Promise<number> {
    return 0;
  }
  
  private async getConversionRate(waitlistId: string): Promise<number> {
    return 0;
  }
}
```

### 6.3 Usage Enforcement Algorithm

```typescript
// server/middleware/usageLimit.middleware.ts

/**
 * Middleware to enforce subscription tier limits
 * 
 * Free tier limits:
 * - 1 waitlist
 * - 100 signups total across all waitlists
 * 
 * Pro tier: unlimited
 */
export async function enforceUsageLimits(
  req: any,
  res: any,
  next: any
): Promise<void> {
  const userId = req.userId;
  const user = await getUserById(userId);
  
  // Pro users have no limits
  if (user.subscriptionTier === 'pro') {
    return next();
  }
  
  // Check limits for free tier
  const action = req.route.path;
  
  if (action.includes('/waitlists') && req.method === 'POST') {
    // Creating new waitlist
    const waitlistCount = await getWaitlistCount(userId);
    
    if (waitlistCount >= 1) {
      return res.status(403).json({
        error: 'Waitlist limit reached',
        message: 'Free tier allows 1 waitlist. Upgrade to Pro for unlimited waitlists.',
        upgradeUrl: '/billing/upgrade',
      });
    }
  }
  
  if (action.includes('/signup') && req.method === 'POST') {
    // New signup
    const totalSignups = await getTotalSignupCount(userId);
    
    if (totalSignups >= 100) {
      return res.status(403).json({
        error: 'Signup limit reached',
        message: 'Free tier allows 100 signups. Upgrade to Pro for unlimited signups.',
        upgradeUrl: '/billing/upgrade',
      });
    }
  }
  
  next();
}

/**
 * Get total waitlist count for user
 */
async function getWaitlistCount(userId: string): Promise<number> {
  // SELECT COUNT(*) FROM waitlists WHERE user_id = ?
  return 0;
}

/**
 * Get total signup count across all user's waitlists
 */
async function getTotalSignupCount(userId: string): Promise<number> {
  // SELECT COUNT(*) FROM signups s
  // JOIN waitlists w ON s.waitlist_id = w.id
  // WHERE w.user_id = ?
  return 0;
}
```

### 6.4 Rate Limiting Implementation

```typescript
// server/middleware/rateLimit.middleware.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

/**
 * Rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for signup endpoints
 * 10 requests per hour per IP
 */
export const signupLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:signup:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many signup attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for API endpoints
 * 100 requests per hour per user
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  keyGenerator: (req) => req.userId || req.ip,
  message: 'API rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset
 * 3 requests per hour per email
 */
export const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:reset:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => req.body.email,
  message: 'Too many password reset attempts',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 7. Deployment Architecture

### 7.1 Production Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare CDN                          │
│  - DDoS protection                                           │
│  - SSL/TLS termination                                       │
│  - Static asset caching                                      │
│  - Custom domain routing                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
┌─────────▼─────────┐  ┌────────▼────────┐
│  Frontend (Vercel) │  │  Backend (Fly.io)│
│  - React SPA       │  │  - Express API   │
│  - SSR for SEO     │  │  - Auto-scaling  │
│  - Edge functions  │  │  - Multi-region  │
└────────────────────┘  └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
          ┌─────────▼────┐  ┌───▼────┐  ┌───▼────────┐
          │  PostgreSQL  │  │ Redis  │  │  S3/R2     │
          │  (Supabase)  │  │(Upstash)│  │(Cloudflare)│
          │              │  │        │  │            │
          │  - Primary   │  │- Cache │  │- Logos     │
          │  - Replicas  │  │- Sessions│ │- Exports  │
          │  - Backups   │  │- Rate  │  │- Backups   │
          └──────────────┘  │  limit │  └────────────┘
                            └────────┘
```

### 7.2 Environment Configuration

```bash
# .env.production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/waitlistfast
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://user:pass@host:6379

# JWT
JWT_SECRET=<random-256-bit-secret>
JWT_REFRESH_SECRET=<random-256-bit-secret>

# Email
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@waitlistfast.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx

# Gemini AI
GEMINI_API_KEY=AIzaSyxxxxx

# Storage
S3_BUCKET=waitlistfast-assets
S3_REGION=us-east-1
S3_ACCESS_KEY=xxxxx
S3_SECRET_KEY=xxxxx

# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://waitlistfast.com
API_URL=https://api.waitlistfast.com

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 7.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 8. Security Considerations

### 8.1 Security Headers

```typescript
// server/middleware/security.middleware.ts

import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.waitlistfast.com'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
});
```

### 8.2 Input Validation

```typescript
// server/middleware/validation.middleware.ts

import { z } from 'zod';

export const schemas = {
  signup: z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain letters and numbers'),
  }),
  
  createWaitlist: z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    slug: z.string().min(3).max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    template: z.enum(['minimal', 'startup', 'bold', 'product', 'coming-soon']).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  
  waitlistSignup: z.object({
    email: z.string().email().max(255),
    referralCode: z.string().length(8).optional(),
  }),
};

export function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}
```

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// server/services/__tests__/auth.service.test.ts

import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    authService = new AuthService();
  });
  
  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'testpass123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
  });
  
  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpass123';
      const hash = await authService.hashPassword(password);
      
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
    
    it('should reject incorrect password', async () => {
      const password = 'testpass123';
      const hash = await authService.hashPassword(password);
      
      const isValid = await authService.verifyPassword('wrongpass', hash);
      expect(isValid).toBe(false);
    });
  });
  
  describe('generateAccessToken', () => {
    it('should generate valid JWT', () => {
      const token = authService.generateAccessToken('user123', 'test@example.com');
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      const decoded = authService.verifyAccessToken(token);
      expect(decoded.userId).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
    });
  });
  
  describe('validatePassword', () => {
    it('should accept valid password', () => {
      expect(authService.validatePassword('testpass123')).toBe(true);
    });
    
    it('should reject short password', () => {
      expect(authService.validatePassword('test1')).toBe(false);
    });
    
    it('should reject password without number', () => {
      expect(authService.validatePassword('testpassword')).toBe(false);
    });
    
    it('should reject password without letter', () => {
      expect(authService.validatePassword('12345678')).toBe(false);
    });
  });
});
```

### 9.2 Integration Tests

```typescript
// server/__tests__/auth.integration.test.ts

import request from 'supertest';
import app from '../index';
import db from '../db';

describe('Auth API', () => {
  beforeEach(() => {
    // Clear database
    db.exec('DELETE FROM users');
  });
  
  describe('POST /api/auth/signup', () => {
    it('should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.accessToken).toBeDefined();
    });
    
    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        });
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'testpass456',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        });
    });
    
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
    });
    
    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpass',
        });
      
      expect(response.status).toBe(401);
    });
  });
});
```

### 9.3 E2E Tests

```typescript
// e2e/waitlist-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Waitlist Creation Flow', () => {
  test('should create waitlist with customization', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    
    // Navigate to create waitlist
    await page.click('text=Create Waitlist');
    
    // Fill basic info
    await page.fill('[name="name"]', 'My Product');
    await page.fill('[name="description"]', 'An amazing product');
    await page.fill('[name="slug"]', 'my-product');
    await page.click('text=Next');
    
    // Select template
    await page.click('[data-template="startup"]');
    await page.click('text=Next');
    
    // Customize
    await page.click('[data-color="#3b82f6"]');
    await page.selectOption('[name="fontFamily"]', 'inter');
    await page.click('text=Create');
    
    // Verify creation
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=My Product')).toBeVisible();
  });
});
```

## 10. Migration Strategy

### 10.1 Database Migrations

```typescript
// server/migrations/001_add_customization_fields.ts

export async function up(db: Database) {
  db.exec(`
    ALTER TABLE waitlists ADD COLUMN template TEXT DEFAULT 'minimal';
    ALTER TABLE waitlists ADD COLUMN primary_color TEXT DEFAULT '#18181b';
    ALTER TABLE waitlists ADD COLUMN font_family TEXT DEFAULT 'inter';
    ALTER TABLE waitlists ADD COLUMN background_type TEXT DEFAULT 'solid';
    ALTER TABLE waitlists ADD COLUMN background_value TEXT DEFAULT '#FAFAFA';
    ALTER TABLE waitlists ADD COLUMN cta_text TEXT DEFAULT 'Join the waitlist';
    ALTER TABLE waitlists ADD COLUMN show_counter INTEGER DEFAULT 1;
    ALTER TABLE waitlists ADD COLUMN custom_css TEXT;
    ALTER TABLE waitlists ADD COLUMN features_json TEXT;
    ALTER TABLE waitlists ADD COLUMN social_links_json TEXT;
  `);
}

export async function down(db: Database) {
  // Rollback logic
}
```

## 11. Performance Optimization

### 11.1 Database Indexing

```sql
-- Critical indexes for query performance
CREATE INDEX idx_signups_waitlist_position ON signups(waitlist_id, position);
CREATE INDEX idx_analytics_waitlist_created ON analytics(waitlist_id, created_at);
CREATE INDEX idx_analytics_event_type ON analytics(event_type, created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_waitlists_slug ON waitlists(slug);
CREATE INDEX idx_waitlists_user_created ON waitlists(user_id, created_at);
```

### 11.2 Caching Strategy

```typescript
// server/services/cache.service.ts

import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  /**
   * Cache waitlist data for 5 minutes
   */
  async cacheWaitlist(slug: string, data: any): Promise<void> {
    await this.redis.setex(`waitlist:${slug}`, 300, JSON.stringify(data));
  }
  
  /**
   * Get cached waitlist data
   */
  async getCachedWaitlist(slug: string): Promise<any | null> {
    const data = await this.redis.get(`waitlist:${slug}`);
    return data ? JSON.parse(data) : null;
  }
  
  /**
   * Invalidate waitlist cache
   */
  async invalidateWaitlist(slug: string): Promise<void> {
    await this.redis.del(`waitlist:${slug}`);
  }
}
```

---

## Summary

This design document provides a comprehensive technical blueprint for the WaitlistFast Production Rebuild. The architecture is designed to be:

- **Scalable**: Supports growth from MVP to enterprise scale
- **Secure**: Implements industry-standard security practices
- **Maintainable**: Clear separation of concerns and modular design
- **Performant**: Optimized database queries, caching, and CDN usage
- **Testable**: Comprehensive testing strategy at all levels

The phased approach allows for incremental delivery while maintaining system stability and backward compatibility.
