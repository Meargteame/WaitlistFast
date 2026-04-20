# 🚀 Quick Start - 3 Minutes to Launch

## ✅ Package Fixed!
The correct Gemini package is now installed: `@google/generative-ai`

## 1️⃣ Install (30 seconds)
```bash
npm install
```

## 2️⃣ Configure (30 seconds)
Open `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_key_here
```

Get a free key: https://aistudio.google.com/app/apikey

## 3️⃣ Seed Demo Data (30 seconds)
```bash
npm run seed
```

## 4️⃣ Start Everything (30 seconds)

### Option A: Run both together
```bash
npm run dev:all
```

### Option B: Run separately (better for debugging)
Terminal 1:
```bash
npm run dev:server
```

Terminal 2:
```bash
npm run dev
```

## 5️⃣ Open & Test (60 seconds)

Visit: **http://localhost:3000**

### Try the Demo:
1. Click "Login"
2. Use credentials:
   - Email: `demo@waitlistfast.com`
   - Password: `demo123`
3. Click "Create Waitlist"
4. Enter any product idea
5. Watch AI generate your page!

### Or Create Your Own:
1. Click "Get Started"
2. Sign up with your email
3. Create your first waitlist
4. Share the link!

## 📊 View Example
http://localhost:3000/w/study-ai

## 🎯 What You Can Do

✅ Create unlimited waitlists
✅ AI-generated content
✅ Collect email signups
✅ Track analytics
✅ Export to CSV
✅ Share public pages

## 🆘 Need Help?

See `SETUP.md` for detailed instructions or `PROJECT_SUMMARY.md` for architecture details.

## 🐛 Common Issues

**Port in use?**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Database error?**
```bash
rm waitlist.db
npm run seed
```

**Module not found?**
```bash
npm install
```

That's it! You're ready to validate startup ideas. 🎉
