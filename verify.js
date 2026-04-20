#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying WaitlistFast setup...\n');

let allGood = true;

// Check dependencies
console.log('📦 Checking dependencies...');
const requiredDeps = [
  'express',
  'better-sqlite3',
  'dotenv',
  '@google/generative-ai',
  'react',
  'vite'
];

for (const dep of requiredDeps) {
  try {
    require.resolve(dep);
    console.log(`  ✓ ${dep}`);
  } catch (e) {
    console.log(`  ✗ ${dep} - MISSING`);
    allGood = false;
  }
}

// Check .env.local
console.log('\n⚙️  Checking configuration...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('your_api_key_here') || !envContent.includes('GEMINI_API_KEY=')) {
    console.log('  ⚠️  .env.local exists but API key not configured');
    console.log('     Add your Gemini API key to .env.local');
    allGood = false;
  } else {
    console.log('  ✓ .env.local configured');
  }
} else {
  console.log('  ✗ .env.local not found');
  console.log('     Run: cp .env.example .env.local');
  allGood = false;
}

// Check database
console.log('\n💾 Checking database...');
if (fs.existsSync('waitlist.db')) {
  console.log('  ✓ Database exists');
} else {
  console.log('  ⚠️  Database not found');
  console.log('     Run: npm run seed');
}

// Check server files
console.log('\n📁 Checking server files...');
const serverFiles = [
  'server/index.ts',
  'server/db.ts',
  'server/auth.ts',
  'server/waitlist.ts',
  'server/gemini.ts'
];

for (const file of serverFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    allGood = false;
  }
}

// Check frontend files
console.log('\n🎨 Checking frontend files...');
const frontendFiles = [
  'src/App.tsx',
  'src/Router.tsx',
  'src/pages/Login.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/CreateWaitlist.tsx'
];

for (const file of frontendFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ Everything looks good!');
  console.log('\nNext steps:');
  console.log('  1. Make sure your Gemini API key is in .env.local');
  console.log('  2. Run: npm run seed (if not done)');
  console.log('  3. Run: npm run dev:all');
  console.log('  4. Visit: http://localhost:3000');
} else {
  console.log('⚠️  Some issues found. Please fix them before starting.');
  console.log('\nRun: npm install');
}
console.log('='.repeat(50) + '\n');
