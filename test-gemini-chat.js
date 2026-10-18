import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chat = ai.chats.create({
  model: 'gemini-3.1-pro-preview',
  config: {
    systemInstruction: "You are a helpful assistant",
    temperature: 0.7
  },
  history: []
});
chat.sendMessage({ message: 'hello' }).then(() => console.log('Gemini chat test completed')).catch(() => console.error('Gemini chat test failed'));
