import Stripe from 'stripe';
import db from '../db';

export class PaymentService {
  private stripe: Stripe;
  private readonly PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_test';
  private readonly WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.warn('STRIPE_SECRET_KEY not set. Payment functionality will be disabled.');
    }
    this.stripe = new Stripe(apiKey || 'sk_test_dummy', {
      apiVersion: '2024-11-20.acacia',
    });
  }

  /**
   * Get or create Stripe customer for user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if customer exists in database
    const stmt = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?');
    const user = stmt.get(userId) as { stripe_customer_id: string | null } | undefined;

    if (user?.stripe_customer_id) {
      return user.stripe_customer_id;
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email,
      metadata: { userId },
    });

    // Save to database
    const updateStmt = db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?');
    updateStmt.run(customer.id, userId);

    return customer.id;
  }

  /**
   * Create Stripe Checkout session for Pro subscription
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
      allow_promotion_codes: true,
    });
  }

  /**
   * Create Stripe billing portal session
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
   * Get subscription for customer
   */
  async getSubscription(customerId: string): Promise<Stripe.Subscription | null> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    return subscriptions.data[0] || null;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Handle subscription created webhook
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    
    // Find user by customer ID
    const stmt = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?');
    const user = stmt.get(customerId) as { id: string } | undefined;

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Update subscription tier
    const updateStmt = db.prepare(
      'UPDATE users SET subscription_tier = ?, updated_at = ? WHERE id = ?'
    );
    updateStmt.run('pro', Date.now(), user.id);

    console.log(`User ${user.id} upgraded to Pro`);
  }

  /**
   * Handle subscription updated webhook
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const status = subscription.status;

    const stmt = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?');
    const user = stmt.get(customerId) as { id: string } | undefined;

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Update tier based on status
    let tier = 'free';
    if (status === 'active' || status === 'trialing') {
      tier = 'pro';
    }

    const updateStmt = db.prepare(
      'UPDATE users SET subscription_tier = ?, updated_at = ? WHERE id = ?'
    );
    updateStmt.run(tier, Date.now(), user.id);

    console.log(`User ${user.id} subscription updated: ${tier}`);
  }

  /**
   * Handle subscription deleted webhook
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;

    const stmt = db.prepare('SELECT id FROM users WHERE stripe_customer_id = ?');
    const user = stmt.get(customerId) as { id: string } | undefined;

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Downgrade to free
    const updateStmt = db.prepare(
      'UPDATE users SET subscription_tier = ?, updated_at = ? WHERE id = ?'
    );
    updateStmt.run('free', Date.now(), user.id);

    console.log(`User ${user.id} downgraded to Free`);
  }

  /**
   * Handle invoice payment failed webhook
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;

    const stmt = db.prepare('SELECT id, email FROM users WHERE stripe_customer_id = ?');
    const user = stmt.get(customerId) as { id: string; email: string } | undefined;

    if (!user) {
      return;
    }

    // TODO: Send payment failed email
    console.log(`Payment failed for user ${user.id}`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, this.WEBHOOK_SECRET);
  }

  /**
   * Get usage stats for user
   */
  getUsageStats(userId: string): {
    waitlistCount: number;
    signupCount: number;
    limits: { waitlists: number | null; signups: number | null };
  } {
    // Get subscription tier
    const userStmt = db.prepare('SELECT subscription_tier FROM users WHERE id = ?');
    const user = userStmt.get(userId) as { subscription_tier: string } | undefined;

    const tier = user?.subscription_tier || 'free';

    // Count waitlists
    const waitlistStmt = db.prepare('SELECT COUNT(*) as count FROM waitlists WHERE user_id = ?');
    const waitlistResult = waitlistStmt.get(userId) as { count: number };
    const waitlistCount = waitlistResult.count;

    // Count total signups across all waitlists
    const signupStmt = db.prepare(`
      SELECT COUNT(*) as count FROM signups s
      JOIN waitlists w ON s.waitlist_id = w.id
      WHERE w.user_id = ?
    `);
    const signupResult = signupStmt.get(userId) as { count: number };
    const signupCount = signupResult.count;

    // Set limits based on tier
    const limits = tier === 'pro'
      ? { waitlists: null, signups: null } // null = unlimited
      : { waitlists: 1, signups: 100 };

    return { waitlistCount, signupCount, limits };
  }

  /**
   * Check if user can create waitlist
   */
  canCreateWaitlist(userId: string): { allowed: boolean; reason?: string } {
    const stats = this.getUsageStats(userId);

    if (stats.limits.waitlists === null) {
      return { allowed: true };
    }

    if (stats.waitlistCount >= stats.limits.waitlists) {
      return {
        allowed: false,
        reason: `Free tier allows ${stats.limits.waitlists} waitlist. Upgrade to Pro for unlimited waitlists.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if waitlist can accept more signups
   */
  canAcceptSignup(userId: string): { allowed: boolean; reason?: string } {
    const stats = this.getUsageStats(userId);

    if (stats.limits.signups === null) {
      return { allowed: true };
    }

    if (stats.signupCount >= stats.limits.signups) {
      return {
        allowed: false,
        reason: `Free tier allows ${stats.limits.signups} signups. Upgrade to Pro for unlimited signups.`,
      };
    }

    return { allowed: true };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
