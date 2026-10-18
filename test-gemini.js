import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.1-pro-preview',
  contents: 'say hello'
}).then(() => console.log('Gemini test completed')).catch(() => console.error('Gemini test failed'));
