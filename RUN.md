# 🎉 Ready to Launch!

Your API key has been configured and everything is set up.

## Start the App Now

Run this command:

```bash
npm run dev:all
```

This will start:
- **Backend API** on http://localhost:3001
- **Frontend** on http://localhost:3000

## Login Credentials

```
Email: demo@waitlistfast.com
Password: demo123
```

## What to Do Next

1. Open http://localhost:3000 in your browser
2. Click "Login" and use the demo credentials above
3. Click "Create Waitlist"
4. Enter a product name and description
5. Watch the AI generate your waitlist page!
6. Test the signup flow
7. Check analytics

## Example Waitlist

Visit: http://localhost:3000/w/study-ai

This is a pre-made example you can test.

## Stop the Servers

Press `Ctrl+C` in the terminal to stop both servers.

---

**Note:** If you see any port conflicts, run:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

Then try `npm run dev:all` again.

Happy building! 🚀
