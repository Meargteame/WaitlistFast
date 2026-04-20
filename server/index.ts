import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createUser, loginUser, getUserById } from './auth';
import { 
  createWaitlist, 
  getWaitlistBySlug, 
  getWaitlistsByUserId,
  addSignup,
  getSignupCount,
  getSignups,
  trackAnalytics,
  getAnalytics
} from './waitlist';
import { generateWaitlistContent } from './gemini';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());

// CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-session-id');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Simple session management (in production, use proper session middleware)
const sessions = new Map<string, string>();

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers['x-session-id'];
  const userId = sessions.get(sessionId);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.userId = userId;
  next();
}

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = createUser(email, password);
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, user.id);
    
    res.json({ user, sessionId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = loginUser(email, password);
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, user.id);
    
    res.json({ user, sessionId });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/auth/me', requireAuth, (req: any, res) => {
  const user = getUserById(req.userId);
  res.json({ user });
});

// Waitlist endpoints
app.post('/api/waitlists/generate', requireAuth, async (req: any, res) => {
  try {
    const { productName, shortDescription } = req.body;
    
    if (!productName || !shortDescription) {
      return res.status(400).json({ error: 'Product name and description required' });
    }
    
    const content = await generateWaitlistContent(productName, shortDescription);
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/waitlists', requireAuth, async (req: any, res) => {
  try {
    const { name, description, slug } = req.body;
    
    if (!name || !description || !slug) {
      return res.status(400).json({ error: 'Name, description, and slug required' });
    }
    
    const waitlist = createWaitlist(req.userId, name, description, slug);
    res.json(waitlist);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/waitlists', requireAuth, (req: any, res) => {
  const waitlists = getWaitlistsByUserId(req.userId);
  res.json(waitlists);
});

app.get('/api/waitlists/:slug', (req, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  const signupCount = getSignupCount((waitlist as any).id);
  trackAnalytics((waitlist as any).id, 'view');
  
  res.json({ ...waitlist, signupCount });
});

app.post('/api/waitlists/:slug/signup', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const waitlist = getWaitlistBySlug(req.params.slug);
    
    if (!waitlist) {
      return res.status(404).json({ error: 'Waitlist not found' });
    }
    
    const signup = addSignup((waitlist as any).id, email);
    trackAnalytics((waitlist as any).id, 'signup');
    
    res.json(signup);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/waitlists/:slug/signups', requireAuth, (req: any, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  // Check ownership
  if ((waitlist as any).user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const signups = getSignups((waitlist as any).id);
  res.json(signups);
});

app.get('/api/waitlists/:slug/analytics', requireAuth, (req: any, res) => {
  const waitlist = getWaitlistBySlug(req.params.slug);
  
  if (!waitlist) {
    return res.status(404).json({ error: 'Waitlist not found' });
  }
  
  // Check ownership
  if ((waitlist as any).user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const analytics = getAnalytics((waitlist as any).id);
  res.json(analytics);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
