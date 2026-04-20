// Quick test to verify server dependencies
console.log('Testing server dependencies...\n');

try {
  console.log('✓ express');
  require('express');
  
  console.log('✓ better-sqlite3');
  require('better-sqlite3');
  
  console.log('✓ dotenv');
  require('dotenv');
  
  console.log('✓ @google/generative-ai');
  require('@google/generative-ai');
  
  console.log('\n✅ All dependencies installed correctly!');
  console.log('\nYou can now run:');
  console.log('  npm run dev:all');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\nPlease run: npm install');
}
