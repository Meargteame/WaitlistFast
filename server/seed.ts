import { createUser } from './auth';
import { createWaitlist, addSignup } from './waitlist';

console.log('Seeding database...');

try {
  // Create demo user
  const user = createUser('demo@waitlistfast.com', 'demo123');
  console.log('✓ Created demo user:', user.email);

  // Create example waitlist
  const waitlist = createWaitlist(
    user.id,
    'StudyAI',
    'AI that summarizes university lectures in real-time. Join the waitlist for early access.',
    'study-ai'
  );
  console.log('✓ Created example waitlist:', waitlist.slug);

  // Add some example signups
  const emails = [
    'alice@example.com',
    'bob@example.com',
    'charlie@example.com',
    'diana@example.com',
    'evan@example.com',
  ];

  for (const email of emails) {
    addSignup(waitlist.id, email);
  }
  console.log(`✓ Added ${emails.length} example signups`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('Email: demo@waitlistfast.com');
  console.log('Password: demo123');
  console.log('\nExample waitlist: http://localhost:3000/w/study-ai');
} catch (error: any) {
  console.error('❌ Seeding failed:', error.message);
}
