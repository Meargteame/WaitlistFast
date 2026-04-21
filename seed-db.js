// Simple seed script using fetch API
const API_URL = 'http://localhost:3001/api';

async function seed() {
  try {
    console.log('Seeding database...\n');

    // 1. Create demo user
    console.log('Creating demo user...');
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@waitlistfast.com',
        password: 'demo123'
      })
    });

    if (!signupRes.ok) {
      const error = await signupRes.json();
      if (error.error?.includes('already exists')) {
        console.log('✓ Demo user already exists');
      } else {
        throw new Error(error.error || 'Failed to create user');
      }
    } else {
      console.log('✓ Created demo user: demo@waitlistfast.com');
    }

    // 2. Login to get token
    console.log('\nLogging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@waitlistfast.com',
        password: 'demo123'
      })
    });

    if (!loginRes.ok) {
      throw new Error('Failed to login');
    }

    const { accessToken } = await loginRes.json();
    console.log('✓ Logged in successfully');

    // 3. Create example waitlist
    console.log('\nCreating example waitlist...');
    const waitlistRes = await fetch(`${API_URL}/waitlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: 'StudyAI',
        description: 'AI that summarizes university lectures in real-time. Join the waitlist for early access.',
        slug: 'study-ai'
      })
    });

    if (!waitlistRes.ok) {
      const error = await waitlistRes.json();
      if (error.error?.includes('already exists')) {
        console.log('✓ Waitlist already exists');
      } else {
        throw new Error(error.error || 'Failed to create waitlist');
      }
    } else {
      console.log('✓ Created waitlist: study-ai');
    }

    // 4. Add example signups
    console.log('\nAdding example signups...');
    const emails = [
      'alice@example.com',
      'bob@example.com',
      'charlie@example.com',
      'diana@example.com',
      'evan@example.com',
    ];

    for (const email of emails) {
      try {
        const signupRes = await fetch(`${API_URL}/waitlists/study-ai/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (signupRes.ok) {
          console.log(`  ✓ Added ${email}`);
        }
      } catch (err) {
        // Ignore duplicate errors
      }
    }

    // 5. Track some analytics
    console.log('\nGenerating analytics data...');
    for (let i = 0; i < 20; i++) {
      await fetch(`http://localhost:3000/w/study-ai`);
    }
    console.log('✓ Generated 20 page views');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo credentials:');
    console.log('  Email: demo@waitlistfast.com');
    console.log('  Password: demo123\n');
    console.log('Example waitlist:');
    console.log('  http://localhost:3000/w/study-ai\n');
    console.log('Dashboard:');
    console.log('  http://localhost:3000/dashboard\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
