# Phase 3 Quick Start - 5 Minute Setup

## Prerequisites
- WaitlistFast running (npm run dev:all)
- Stripe account (free, no verification needed for test mode)

## Setup Steps

### 1. Get Stripe Keys (2 min)
```
1. Go to: https://dashboard.stripe.com/register
2. Sign up with email
3. Click "Developers" → "API keys"
4. Copy both keys:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
```

### 2. Create Product (1 min)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create product
stripe products create --name="WaitlistFast Pro"
# Copy product ID: prod_xxxxx

# Create price
stripe prices create --product=prod_xxxxx --unit-amount=1900 --currency=usd --recurring[interval]=month
# Copy price ID: price_xxxxx
```

### 3. Setup Webhook (1 min)
```bash
# In a new terminal, run:
stripe listen --forward-to localhost:3001/api/billing/webhook

# Copy webhook secret: whsec_xxxxx
# Keep this terminal running!
```

### 4. Update Config (1 min)
Edit `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
```

Edit `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 5. Restart (30 sec)
```bash
# Stop servers (Ctrl+C)
npm run dev:all
```

## Test It (1 min)

```
1. Open: http://localhost:3000/login
2. Login: demo@waitlistfast.com / demo123
3. Click: "Billing" in sidebar
4. Click: "Upgrade to Pro"
5. Card: 4242 4242 4242 4242
6. Expiry: 12/34
7. CVC: 123
8. Complete checkout
9. ✅ You should see "Pro" plan!
```

## Verify Usage Limits

```
1. Logout
2. Create new account
3. Create 1st waitlist → ✅ Success
4. Try 2nd waitlist → ❌ Blocked (Upgrade to Pro)
5. ✅ Usage enforcement working!
```

## Troubleshooting

### "Invalid API Key"
- Check for spaces in .env.local
- Restart server after editing .env.local

### "No such price"
- Make sure you created the price in Stripe
- Copy the full price ID (price_xxxxx)

### Checkout page error
- Make sure .env has VITE_STRIPE_PUBLISHABLE_KEY
- Restart Vite (npm run dev:all)

### Webhook not working
- Make sure `stripe listen` is running
- Check webhook secret in .env.local

## What You Get

✅ Free Tier: 1 waitlist, 100 signups
✅ Pro Tier: Unlimited waitlists, unlimited signups
✅ Usage enforcement
✅ Stripe Checkout integration
✅ Billing dashboard
✅ Subscription management
✅ Webhook sync

## Next Steps

- Test upgrade flow
- Test usage limits
- Test subscription cancellation
- Add real pricing
- Deploy to production

## Need Help?

- Full docs: `PHASE_3_COMPLETE.md`
- Setup guide: `STRIPE_SETUP.md`
- Summary: `PHASE_3_SUMMARY.md`
- Stripe docs: https://stripe.com/docs
