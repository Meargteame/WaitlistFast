// Quick test for Gemini API
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('❌ API key not configured in .env.local');
    return;
  }
  
  console.log('✓ API key found');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('✓ Model initialized');
    console.log('⏳ Generating test content...\n');
    
    const result = await model.generateContent('Say "Hello from Gemini!" in JSON format with a "message" field');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Response:');
    console.log(text);
    console.log('\n✅ Gemini API is working correctly!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nPossible issues:');
    console.log('- Invalid API key');
    console.log('- API quota exceeded');
    console.log('- Network connectivity');
  }
}

testGemini();
