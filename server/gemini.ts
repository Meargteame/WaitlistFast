import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateWaitlistContent(productName: string, shortDescription: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback to mock data if no API key or API fails
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.log('⚠️  No valid API key, using mock data');
      return generateMockContent(productName, shortDescription);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a landing page copywriter. Generate compelling waitlist page content for a startup product.

Product Name: ${productName}
Short Description: ${shortDescription}

Generate ONLY a JSON response with this exact structure (no markdown, no code blocks):
{
  "tagline": "A catchy one-liner (max 80 characters)",
  "description": "A compelling 2-3 sentence description that explains the value proposition",
  "slug": "a-url-friendly-slug-based-on-product-name"
}

Make it exciting, clear, and conversion-focused. The slug should be lowercase with hyphens.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from various formats
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    // Parse and validate
    const parsed = JSON.parse(jsonText);
    
    // Ensure all required fields exist
    if (!parsed.tagline || !parsed.description || !parsed.slug) {
      throw new Error('Invalid response format from AI');
    }
    
    return parsed;
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Fallback to mock data on any error
    console.log('⚠️  API failed, using mock data as fallback');
    return generateMockContent(productName, shortDescription);
  }
}

function generateMockContent(productName: string, shortDescription: string) {
  // Generate a slug from product name
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Create a simple tagline
  const tagline = `${productName} - ${shortDescription.split('.')[0].substring(0, 60)}`;
  
  return {
    tagline: tagline.length > 80 ? tagline.substring(0, 77) + '...' : tagline,
    description: shortDescription,
    slug: slug
  };
}
