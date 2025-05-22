// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const apiKey = process.env.GEMINI_API_KEY;
const api = "AIzaSyBILbj0xgrqcFbuqk8Wcz0CR5fPTPYRFBI";
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function askGemini(question: string): Promise<string> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Generate content with Gemini
    const result = await model.generateContent(`
      আপনি একটি বাংলা ভাষায় বিজ্ঞান বট। নিম্নলিখিত প্রশ্নের বাংলা ভাষায় উত্তর দিন:
      
      ${question}
    `);
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error querying Gemini API:', error);
    throw new Error('বিজ্ঞান বট এখন উত্তর দিতে পারছে না। কিছুক্ষন পর আবার চেষ্টা করুন।');
  }
}

