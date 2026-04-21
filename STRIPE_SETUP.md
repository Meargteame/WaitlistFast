# Stripe Setup Guide for WaitlistFast

## Quick Start (5 minutes)

### Step 1: Get Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Sign up with email
3. Skip business details for now (test mode works without verification)

### Step 2: Get API Keys
1. In Stripe Dashboard, click "Developers" in top right
2. Click "API keys" in left sidebar
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (click "Reveal test key", starts with `sk_test_`)

### Step 3: Create Product & Price
```bash
# Option A: Using Stripe CLI (recommended)
stripe login
stripe products create --name="WaitlistFast Pro" --description="Unlimited waitlists and signups"
# Copy the product ID (prod_xxxxx)

stripe prices create --product=prod_xxxxx --unit-amount=1900 --currency=usd --recurring[interval]=month
# Copy the price ID (price_xxxxx)

# Option B: Using Dashboard
# 1. Go to Products > Add product
# 2. Name: "WaitlistFast Pro"
# 3. Price: $19.00 USD
# 4. Billing period: Monthly
# 5. Click "Save product"
# 6. Copy the Price ID from the product page
```

### Step 4: Setup Webhook (for local testing)
```bash
# Install Stripe CLI if not installed
brew install stripe/stripe-cli/stripe  # macOS
# or download from: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Forward webhooks to local server (keep this running)
stripe listen --forward-to localhost:3001/api/billing/webhook

# Copy the webhook signing secret (whsec_xxxxx)
```

### Step 5: Update .env.local
```env
# Add these lines to .env.local:
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
```

### Step 6: Create .env for Vite
Vite needs a separate file for frontend environment variables:
```bash
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx" > .env
```

### Step 7: Restart Servers
```bash
# Stop current servers (Ctrl+C)
npm run dev:all
```

## Testing the Integration

### Test 1: View Billing Page
1. Open http://localhost:3000/login
2. Login with: demo@waitlistfast.com / demo123
3. Click "Billing" in sidebar
4. Should see Free plan with usage stats

### Test 2: Upgrade Flow
1. Click "Upgrade to Pro" button
2. Should redirect to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., 12/34)
5. CVC: Any 3 digits (e.g., 123)
6. Name: Any name
7. Click "Subscribe"
8. Should redirect back to /billing
9. Plan should now show "Pro" with green badge

### Test 3: Manage Billing
1. Click "Manage Billing" button
2. Should open Stripe Customer Portal
3. Can view invoices, update payment method, cancel subscription

### Test 4: Usage Limits (Free Tier)
1. Logout and create new account
2. Create 1st waitlist → Should succeed
3. Try to create 2nd waitlist → Should show error "Upgrade to Pro"
4. This proves usage enforcement is working!

## Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | Requires 3D Secure authentication |
| 4000 0000 0000 9995 | Declined - insufficient funds |
| 4000 0000 0000 0002 | Declined - generic decline |

## Troubleshooting

### "Invalid API Key"
- Make sure you copied the full key (starts with `sk_test_` or `pk_test_`)
- Check for extra spaces or newlines
- Restart server after updating .env.local

### "No such price"
- Make sure you created the price in Stripe Dashboard
- Copy the price ID (starts with `price_`)
- Update STRIPE_PRO_PRICE_ID in .env.local

### Webhook not receiving events
- Make sure `stripe listen` is running in a separate terminal
- Check that webhook secret (whsec_) is in .env.local
- Restart server after updating webhook secret

### Checkout page shows error
- Check browser console for errors
- Make sure VITE_STRIPE_PUBLISHABLE_KEY is in .env file (not .env.local)
- Restart Vite dev server

### "Cannot find module '@stripe/stripe-js'"
```bash
npm install @stripe/stripe-js stripe
```

## Production Setup

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle "Test mode" to OFF (top right)
2. Go to Developers > API keys
3. Get live keys (pk_live_..., sk_live_...)

### 2. Create Live Product
1. Go to Products
2. Create same product in live mode
3. Copy live price ID

### 3. Setup Production Webhook
1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/billing/webhook`
4. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
   - invoice.payment_succeeded
5. Copy signing secret

### 4. Update Production Environment
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Test Cards: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks

## Security Notes

- Never commit .env.local or .env to git
- Use environment variables in production
- Validate webhook signatures (already implemented)
- Use HTTPS in production
- Keep Stripe keys secure
