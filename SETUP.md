# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Environment
1. Open `.env.local` file
2. Replace `your_api_key_here` with your actual Gemini API key
   - Get one at: https://aistudio.google.com/app/apikey

## Step 3: Seed Database (Optional)
```bash
npm run seed
```

This creates:
- Demo user: `demo@waitlistfast.com` / `demo123`
- Example waitlist at `/w/study-ai`

## Step 4: Start Development

### Option A: Run everything together
```bash
npm run dev:all
```

### Option B: Run separately (recommended for debugging)

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Example Waitlist**: http://localhost:3000/w/study-ai

## Test the Flow

1. Go to http://localhost:3000
2. Click "Get Started" or "Login"
3. Create an account or use demo credentials
4. Click "Create Waitlist"
5. Enter product details and generate with AI
6. View your waitlist page
7. Test signup flow
8. Check analytics

## Troubleshooting

### Port already in use
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database locked
```bash
# Remove database and reseed
rm waitlist.db
npm run seed
```

### Gemini API errors
- Verify your API key in `.env.local`
- Check quota at https://aistudio.google.com/

## Production Build

```bash
npm run build
npm run build:server
npm start
```
