# Phase 2: Core Features - Starting Implementation

## Goals
Transform the authentication and add email capabilities to make WaitlistFast production-ready.

## Phase 2 Features
1. ✅ Email Service Integration (Resend)
2. ✅ JWT Authentication with refresh tokens
3. ✅ Email Verification
4. ✅ Password Reset Flow
5. ✅ Rate Limiting
6. ✅ Bulk Email Campaigns

## Implementation Order

### Step 1: Install Dependencies
```bash
npm install jsonwebtoken bcrypt resend express-rate-limit
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

### Step 2: Email Service
- Create EmailService class
- Integrate Resend API
- Create email templates
- Send welcome emails on signup

### Step 3: JWT Authentication
- Replace simple sessions with JWT
- Implement access + refresh tokens
- Add token refresh endpoint
- Update auth middleware

### Step 4: Email Verification
- Generate verification tokens
- Send verification emails
- Add verification endpoint
- Block unverified users from creating waitlists

### Step 5: Password Reset
- Add forgot password endpoint
- Generate reset tokens
- Send reset emails
- Add reset password endpoint

### Step 6: Rate Limiting
- Add rate limiters to auth endpoints
- Add rate limiters to signup endpoints
- Add rate limiters to API endpoints

### Step 7: Bulk Email Campaigns
- Create campaigns table
- Add campaign creation endpoint
- Add campaign sending logic
- Track email delivery status

## Estimated Time: 2-3 weeks
