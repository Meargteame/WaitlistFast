import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import db from './db';
import { createUser, loginUser, getUserById, getUserByEmail } from './auth';
import { 
  createWaitlist, 
  getWaitlistBySlug, 
  getWaitlistsByUserId,
  updateWaitlist,
  addSignup,
  getSignupCount,
  getSignups,
  trackAnalytics,
  getAnalytics,
  getCampaigns
} from './waitlist';
import { generateWaitlistContent } from './gemini';
import { authService } from './services/auth.service';
import { emailService } from './services/email.service';
import { paymentService } from './services/payment.service';
import { requireAuth, requireVerifiedEmail } from './middleware/auth.middleware';
import { 
  authLimiter, 
  signupLimiter, 
  apiLimiter, 
  passwordResetLimiter,
  verificationLimiter 
} from './middleware/rateLimit.middleware';
import { canCreateWaitlist, canAcceptSignup } from './middleware/usage.middleware';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Clean up expired tokens periodically
setInterval(() => {
  authService.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Every hour

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/signup
 * Create new user account
 */
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await createUser(email, password);
    
    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.email);
    const refreshToken = authService.generateRefreshToken(user.id);
    
    // Store refresh token
    await authService.storeRefreshToken(user.id, refreshToken);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      accessToken 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await loginUser(email, password);
    
    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.email);
    const refreshToken = authService.generateRefreshToken(user.id);
    
    // Store refresh token
    await authService.storeRefreshToken(user.id, refreshToken);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      accessToken 
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }
    
    // Verify refresh token
    const payload = authService.verifyRefreshToken(refreshToken);
    
    // Check if token exists in database
    const isValid = await authService.verifyRefreshTokenInDb(payload.userId, refreshToken);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Get user
    const user = getUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Generate new access token
    const accessToken = authService.generateAccessToken(user.id, user.email);
    
    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.deleteRefreshToken(refreshToken);
    }
    
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = getUserById(req.userId!);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ user });
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    const success = await authService.verifyEmail(token);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
app.post('/api/auth/resend-verification', requireAuth, verificationLimiter, async (req, res) => {
  try {
    const user = getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Generate new token
    const token = authService.generateVerificationToken();
    await authService.setVerificationToken(user.id, token);
    
    // Send email
    await emailService.sendVerificationEmail(user.email, token);
    
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const user = getUserByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }
    
    // Generate reset token
    const token = authService.generateResetToken();
    await authService.setResetToken(email, token);
    
    // Send email
    await emailService.sendPasswordResetEmail(email, token);
    
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }
    
    // Validate password
    const validation = authService.validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    
    const success = await authService.resetPassword(token, newPassword);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// WAITLIST ENDPOINTS
// ============================================================================

/**
 * POST /api/waitlists/generate
 * Generate waitlist content with AI
 */
app.post('/api/waitlists/generate', requireAuth, apiLimiter, async (req, res) => {
  try {
    const { productName, shortDescription } = req.body;
    
    if (!productName || !shortDescription) {
      return res.status(400).json({ error: 'Product name and description required' });
    }
    
    const content = await generateWaitlistContent(productName, shortDescription);
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

/**
 * POST /api/waitlists
 * Create new waitlist
 */
app.post('/api/waitlists', requireAuth, canCreateWaitlist, apiLimiter, async (req, res) => {
  try {
    const { name, description, slug } = req.body;
    
    if (!name || !description || !slug) {
      return res.status(400).json({ error: 'Name, description, and slug required' });
    }
    
    const waitlist = createWaitlist(req.userId!, name, description, slug);
    res.json(waitlist);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/waitlists
 * Get all waitlists for current user
 */
app.get('/api/waitlists', requireAuth, apiLimiter, (req, res) => {
  const waitlists = getWaitlistsByUserId(req.userId!);
  res.json(waitlists);
});

/**
 * GET /api/waitlists/:slug
 * Get waitlist by slug (public)
 */
app.get('/api/waitlists/:slug', (req, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  const signupCount = getSignupCount((waitlist as any).id);
  trackAnalytics((waitlist as any).id, 'view');
  
  res.json({ waitlist, signupCount });
});

/**
 * PUT /api/waitlists/:slug
 * Update waitlist
 */
app.put('/api/waitlists/:slug', requireAuth, apiLimiter, async (req, res) => {
  try {
    const waitlist = updateWaitlist(req.params.slug, req.userId!, req.body);
    res.json({ waitlist });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/waitlists/:slug/signup
 * Sign up for waitlist (public)
 */
app.post('/api/waitlists/:slug/signup', signupLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const waitlist = getWaitlistBySlug(req.params.slug);
    
    if (!waitlist) {
      return res.status(404).json({ error: 'Waitlist not found' });
    }
    
    // Check if waitlist owner can accept more signups
    const ownerId = (waitlist as any).user_id;
    const usageCheck = paymentService.canAcceptSignup(ownerId);
    
    if (!usageCheck.allowed) {
      return res.status(403).json({
        error: 'Waitlist is full',
        message: usageCheck.reason,
      });
    }
    
    const signup = addSignup((waitlist as any).id, email);
    trackAnalytics((waitlist as any).id, 'signup');
    
    // Send welcome email
    const referralLink = `${process.env.APP_URL || 'http://localhost:3000'}/w/${req.params.slug}?ref=${signup.id}`;
    await emailService.sendWelcomeEmail(
      email,
      (waitlist as any).name,
      signup.position,
      referralLink
    );
    
    res.json(signup);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/waitlists/:slug/signups
 * Get all signups for waitlist
 */
app.get('/api/waitlists/:slug/signups', requireAuth, apiLimiter, (req, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  // Check ownership
  if ((waitlist as any).user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const signups = getSignups((waitlist as any).id);
  res.json(signups);
});

/**
 * GET /api/waitlists/:slug/analytics
 * Get analytics for waitlist
 */
app.get('/api/waitlists/:slug/analytics', requireAuth, apiLimiter, (req, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  // Check ownership
  if ((waitlist as any).user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const analytics = getAnalytics((waitlist as any).id);
  res.json(analytics);
});

// ============================================================================
// EMAIL CAMPAIGN ENDPOINTS
// ============================================================================

/**
 * GET /api/waitlists/:slug/campaigns
 * Get all campaigns for a waitlist
 */
app.get('/api/waitlists/:slug/campaigns', requireAuth, apiLimiter, (req, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  // Check ownership
  if ((waitlist as any).user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const campaigns = getCampaigns((waitlist as any).id);
  res.json(campaigns);
});

/**
 * POST /api/waitlists/:slug/campaigns
 * Send email campaign to all signups
 */
app.post('/api/waitlists/:slug/campaigns', requireAuth, apiLimiter, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message required' });
    }
    
    const waitlist = getWaitlistBySlug(req.params.slug);
    
    if (!waitlist) {
      return res.status(404).json({ error: 'Waitlist not found' });
    }
    
    // Check ownership
    if ((waitlist as any).user_id !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Get all signups
    const signups = getSignups((waitlist as any).id);
    
    if (signups.length === 0) {
      return res.status(400).json({ error: 'No signups to send to' });
    }
    
    // Create campaign record
    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    db.prepare(`
      INSERT INTO email_campaigns (
        id, waitlist_id, subject, html_body, sent_count, 
        delivered_count, failed_count, status, created_at, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campaignId,
      (waitlist as any).id,
      subject,
      message,
      signups.length,
      0,
      0,
      'sending',
      now,
      now
    );
    
    // Send emails in background (simplified - in production use a queue)
    let delivered = 0;
    let failed = 0;
    
    for (const signup of signups) {
      try {
        await emailService.sendSingleCampaignEmail(
          (signup as any).email,
          subject,
          message,
          (waitlist as any).name
        );
        delivered++;
      } catch (error) {
        failed++;
      }
    }
    
    // Update campaign status
    db.prepare(`
      UPDATE email_campaigns 
      SET delivered_count = ?, failed_count = ?, status = ?
      WHERE id = ?
    `).run(delivered, failed, 'sent', campaignId);
    
    res.json({ 
      success: true, 
      campaignId,
      sent: signups.length,
      delivered,
      failed
    });
  } catch (error: any) {
    console.error('Campaign send error:', error);
    res.status(500).json({ error: error.message || 'Failed to send campaign' });
  }
});

// ============================================================================
// BILLING ENDPOINTS
// ============================================================================

/**
 * GET /api/billing/usage
 * Get usage stats for current user
 */
app.get('/api/billing/usage', requireAuth, apiLimiter, (req, res) => {
  const stats = paymentService.getUsageStats(req.userId!);
  res.json(stats);
});

/**
 * POST /api/billing/create-checkout-session
 * Create Stripe Checkout session for Pro subscription
 */
app.post('/api/billing/create-checkout-session', requireAuth, apiLimiter, async (req, res) => {
  try {
    const user = getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get or create Stripe customer
    const customerId = await paymentService.getOrCreateCustomer(user.id, user.email);
    
    // Create checkout session
    const session = await paymentService.createCheckoutSession(
      customerId,
      `${process.env.APP_URL || 'http://localhost:3000'}/billing?success=true`,
      `${process.env.APP_URL || 'http://localhost:3000'}/billing?canceled=true`
    );
    
    res.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/billing/create-portal-session
 * Create Stripe billing portal session
 */
app.post('/api/billing/create-portal-session', requireAuth, apiLimiter, async (req, res) => {
  try {
    const user = getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get Stripe customer ID
    const stmt = require('./db').default.prepare('SELECT stripe_customer_id FROM users WHERE id = ?');
    const result = stmt.get(user.id) as { stripe_customer_id: string | null } | undefined;
    
    if (!result?.stripe_customer_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }
    
    // Create portal session
    const session = await paymentService.createPortalSession(
      result.stripe_customer_id,
      `${process.env.APP_URL || 'http://localhost:3000'}/billing`
    );
    
    res.json({ portalUrl: session.url });
  } catch (error: any) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * GET /api/billing/subscription
 * Get current subscription info
 */
app.get('/api/billing/subscription', requireAuth, apiLimiter, async (req, res) => {
  try {
    const user = getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stmt = require('./db').default.prepare('SELECT stripe_customer_id, subscription_tier FROM users WHERE id = ?');
    const result = stmt.get(user.id) as { stripe_customer_id: string | null; subscription_tier: string } | undefined;
    
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If no customer ID, return free tier info
    if (!result.stripe_customer_id) {
      return res.json({
        tier: 'free',
        status: 'active',
        cancelAtPeriodEnd: false,
      });
    }
    
    // Get subscription from Stripe
    const subscription = await paymentService.getSubscription(result.stripe_customer_id);
    
    if (!subscription) {
      return res.json({
        tier: result.subscription_tier || 'free',
        status: 'active',
        cancelAtPeriodEnd: false,
      });
    }
    
    res.json({
      tier: result.subscription_tier || 'free',
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end * 1000,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error: any) {
    console.error('Subscription info error:', error);
    res.status(500).json({ error: 'Failed to get subscription info' });
  }
});

/**
 * POST /api/billing/webhook
 * Handle Stripe webhooks
 */
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    return res.status(400).json({ error: 'No signature' });
  }
  
  try {
    const event = paymentService.verifyWebhookSignature(req.body, signature);
    
    console.log('Webhook event:', event.type);
    
    switch (event.type) {
      case 'customer.subscription.created':
        await paymentService.handleSubscriptionCreated(event.data.object as any);
        break;
      
      case 'customer.subscription.updated':
        await paymentService.handleSubscriptionUpdated(event.data.object as any);
        break;
      
      case 'customer.subscription.deleted':
        await paymentService.handleSubscriptionDeleted(event.data.object as any);
        break;
      
      case 'invoice.payment_failed':
        await paymentService.handleInvoicePaymentFailed(event.data.object as any);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.type);
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

// ============================================================================
// STATIC FILES & SPA
// ============================================================================

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT Auth: ${process.env.JWT_SECRET ? 'Enabled' : 'Using default (INSECURE)'}`);
  console.log(`Email Service: ${process.env.RESEND_API_KEY ? 'Enabled' : 'Disabled (dev mode)'}`);
});

export default app;
