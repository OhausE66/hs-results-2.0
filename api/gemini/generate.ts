import { GoogleGenAI } from '@google/genai';

const defaultModel = 'gemini-3.1-pro-preview';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const { model, contents, config } = req.body || {};
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || defaultModel,
      contents,
      config,
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('Generate Error:', error);
    return res.status(500).json({
      error: 'Failed to generate content: ' + (error.message || error.toString()),
    });
  }
}
