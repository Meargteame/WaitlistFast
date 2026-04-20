# 🚀 Starting WaitlistFast - Two Servers Required

## The Issue

You're seeing a CORS error because the **backend server isn't running**.

WaitlistFast needs TWO servers:
1. **Frontend** (Vite) - Port 3000
2. **Backend** (Express API) - Port 3001

## Solution: Start Both Servers

### Option 1: One Command (Recommended)

Open ONE terminal and run:

```bash
npm run dev:all
```

This starts both servers together.

### Option 2: Separate Terminals (Better for Debugging)

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

Wait until you see: `Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Wait until you see: `Local: http://localhost:3000/`

## Verify Both Are Running

You should see:
- ✅ Backend: `Server running on port 3001`
- ✅ Frontend: `Local: http://localhost:3000/`

## Test the Backend

Open a new terminal and run:
```bash
curl http://localhost:3001/api/waitlists/study-ai
```

You should see JSON data. If you get "Connection refused", the backend isn't running.

## Common Issues

### "Port already in use"
```bash
# Kill processes on both ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Backend crashes immediately
Check for errors in the terminal. Common causes:
- Missing dependencies: `npm install`
- Database locked: `rm waitlist.db && npm run seed`
- Wrong Node version: Need Node 18+

### Frontend works but API calls fail
- Backend isn't running
- Check backend terminal for errors
- Verify port 3001 is accessible

## Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] No CORS errors in browser console
- [ ] Can login with demo@waitlistfast.com

Once both servers are running, visit http://localhost:3000 and login!
