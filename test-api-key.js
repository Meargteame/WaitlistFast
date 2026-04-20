// Test if the API key works
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPIKey() {
  console.log('🔑 Testing Gemini API Key...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ No API key found in .env.local');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('⏳ Sending test request...\n');
    
    const result = await model.generateContent('Say "Hello from Gemini!" in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! API Key is working!\n');
    console.log('Response:', text);
    console.log('\n✅ Your Gemini API is configured correctly!');
    
  } catch (error) {
    console.error('\n❌ API Key Error:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Verify your API key at: https://aistudio.google.com/app/apikey');
    console.log('2. Make sure the Gemini API is enabled for your key');
    console.log('3. Check if you have API quota remaining');
    console.log('4. Try generating a new API key');
    console.log('\n📝 Error details:');
    console.log('Status:', error.status);
    console.log('Message:', error.message);
  }
}

testAPIKey();
