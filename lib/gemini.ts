// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function askGemini(question: string): Promise<string> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Generate content with Gemini
    const result = await model.generateContent(`
      আপনি একটি বাংলা ভাষায় বিজ্ঞান বট। আপনি শুধু পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, আর গণিতে পারদর্শী। নিম্নলিখিত প্রশ্নের বাংলা ভাষায় উত্তর দিন:
      
      ${question}
    `);
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error querying Gemini API:', error);
    throw new Error('বিজ্ঞান বট এখন উত্তর দিতে পারছে না। কিছুক্ষন পর আবার চেষ্টা করুন।');
  }
}

