import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { Check, Zap, Crown, TrendingUp, Users, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export function Billing() {
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadData();
    
    // Check for success/cancel params
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      alert('Subscription activated! Welcome to Pro! 🎉');
      window.history.replaceState({}, '', '/billing');
    } else if (params.get('canceled') === 'true') {
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  async function loadData() {
    try {
      const [usageData, subData] = await Promise.all([
        api.billing.getUsage(),
        api.billing.getSubscription(),
      ]);
      setUsage(usageData);
      setSubscription(subData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const { sessionId } = await api.billing.createCheckoutSession();
      const stripe = await stripePromise;
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start checkout');
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    try {
      const { portalUrl } = await api.billing.createPortalSession();
      window.location.href = portalUrl;
    } catch (error: any) {
      alert(error.message || 'Failed to open billing portal');
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const isPro = subscription?.tier === 'pro';
  const usagePercent = usage?.limits.signups
    ? (usage.signupCount / usage.limits.signups) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Billing & Usage</h1>
          <p className="text-zinc-600">Manage your subscription and view usage</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {isPro ? (
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-zinc-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <p className="text-zinc-600">
                  {isPro ? '$19/month' : 'Limited features'}
                </p>
              </div>
            </div>

            {isPro ? (
              <button
                onClick={handleManageBilling}
                className="px-6 py-3 border border-zinc-200 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
              >
                Manage Billing
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                  </>
                )}
              </button>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <p className="text-amber-800">
                Your subscription will cancel on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Usage Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-zinc-600" />
                <h3 className="font-semibold text-zinc-900">Waitlists</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-zinc-900">
                  {usage?.waitlistCount || 0}
                </span>
                <span className="text-zinc-600">
                  / {usage?.limits.waitlists || '∞'}
                </span>
              </div>
              {usage?.limits.waitlists && (
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-zinc-900 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (usage.waitlistCount / usage.limits.waitlists) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-zinc-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-zinc-600" />
                <h3 className="font-semibold text-zinc-900">Total Signups</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-zinc-900">
                  {usage?.signupCount || 0}
                </span>
                <span className="text-zinc-600">
                  / {usage?.limits.signups || '∞'}
                </span>
              </div>
              {usage?.limits.signups && (
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usagePercent >= 80 ? 'bg-red-500' : 'bg-zinc-900'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {!isPro && usagePercent >= 80 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ⚠️ You're approaching your signup limit. Upgrade to Pro for unlimited signups!
              </p>
            </div>
          )}
        </div>

        {/* Pricing Comparison */}
        {!isPro && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-zinc-200 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-zinc-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-700">1 waitlist</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-700">100 signups</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-700">All templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-700">Basic customization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-700">Email collection</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-3 border border-zinc-200 rounded-xl font-medium text-zinc-400 cursor-not-allowed"
              >
                Current Plan
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 relative"
            >
              <div className="absolute top-4 right-4 bg-amber-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-zinc-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">Unlimited waitlists</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">Unlimited signups</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">All templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">Full customization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">Email campaigns</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-amber-600" />
                  <span className="text-zinc-900 font-medium">Priority support</span>
                </li>
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50"
              >
                {upgrading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
