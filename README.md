# WaitlistFast

Launch a startup waitlist in 30 seconds and validate your idea before building.

## Features

- 🚀 Create waitlist pages in seconds with AI
- 📧 Collect and manage email signups
- 📊 Real-time analytics and conversion tracking
- 🔐 User authentication
- 💾 SQLite database
- 🤖 Gemini AI integration for content generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key to `.env.local`

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

### Development

Run both frontend and backend:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1 - Backend API
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Demo Credentials

After seeding:
- Email: `demo@waitlistfast.com`
- Password: `demo123`
- Example page: http://localhost:3000/w/study-ai

## Project Structure

```
├── src/
│   ├── pages/          # React pages
│   ├── lib/            # API client
│   ├── App.tsx         # Landing page
│   └── Router.tsx      # Client-side routing
├── server/
│   ├── index.ts        # Express API server
│   ├── db.ts           # Database setup
│   ├── auth.ts         # Authentication logic
│   ├── waitlist.ts     # Waitlist CRUD
│   ├── gemini.ts       # AI content generation
│   └── seed.ts         # Database seeding
└── waitlist.db         # SQLite database (created on first run)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Waitlists
- `POST /api/waitlists/generate` - Generate content with AI
- `POST /api/waitlists` - Create waitlist
- `GET /api/waitlists` - List user's waitlists
- `GET /api/waitlists/:slug` - Get waitlist by slug
- `POST /api/waitlists/:slug/signup` - Add email signup
- `GET /api/waitlists/:slug/signups` - Get all signups (auth required)
- `GET /api/waitlists/:slug/analytics` - Get analytics (auth required)

## Building for Production

```bash
npm run build
npm run build:server
npm start
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend**: Express, Node.js
- **Database**: better-sqlite3
- **AI**: Google Gemini API
- **Build**: Vite

## License

MIT
