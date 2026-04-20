# 🔑 Fix Gemini API Key Issue

## The Problem

Your API key is showing a **403 Forbidden** error, which means:
- The API key might not be activated
- The Gemini API might not be enabled for this key
- The key might have expired or been revoked

## Solution: Get a New API Key

### Step 1: Go to Google AI Studio
Visit: https://aistudio.google.com/app/apikey

### Step 2: Create a New API Key
1. Click "Create API Key"
2. Select "Create API key in new project" (or use existing project)
3. Copy the new API key

### Step 3: Update Your .env.local File

Open `.env.local` and replace the current key:

```env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

### Step 4: Restart the Backend Server

Stop the current backend (Ctrl+C) and restart:

```bash
npm run dev:server
```

### Step 5: Test Again

1. Refresh your browser
2. Try creating a waitlist again
3. The AI generation should now work!

## Alternative: Use Mock Data (For Testing)

If you want to test without AI, I can create a version that uses mock data instead of calling the Gemini API.

## Verify Your API Key

You can test if your API key works by visiting:
https://aistudio.google.com/app/prompts/new_chat

If you can chat with Gemini there, your key should work in the app too.

## Common Issues

### "API key not found"
- Make sure `.env.local` exists in the project root
- Check there are no extra spaces around the API key
- Restart the backend server after changing the key

### "Quota exceeded"
- You've hit the free tier limit
- Wait 24 hours or upgrade to paid tier
- Create a new project with a new API key

### "Invalid API key"
- The key format is wrong
- Generate a new key from AI Studio
- Make sure you copied the entire key

## Need Help?

1. Check your API key at: https://aistudio.google.com/app/apikey
2. Make sure "Generative Language API" is enabled
3. Try the test chat to verify it works
4. Generate a fresh API key if needed

Once you have a working API key, the app will generate beautiful waitlist content automatically! 🚀
