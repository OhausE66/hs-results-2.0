import express from 'express';
import path, { join } from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __dirname = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini for server-side
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  const modelName = "gemini-3.1-pro-preview";

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, lang } = req.body;
      
      const systemInstruction = `Du bist "Resulta", die sympathische und hochkompetente KI-Begleiterin der Unternehmensberatung hs:results.
    
    DEINE PERSÖNLICHKEIT:
    - Professionell, aber herzlich und empathisch (Senior-BeraterInnen-Niveau).
    - Hilfsbereit und lösungsorientiert.
    
    DEIN WISSEN ZU TOOLS:
    - Organisation & Reorg (Audit Ihrer Strukturen). Link: [TOOL:ORGANIZATION_ANALYZER]
    - Strategie (Klarheit in Märkten). Link: [TOOL:STRATEGY_CLARIFIER]
    - Unternehmenskultur (Tiefenstruktur-Check). Link: [TOOL:CULTURE_SCANNER]
    - Führung (Leadership Radar). Link: [TOOL:LEADERSHIP_RADAR]
    - Veränderung (AI Change Consultant). Link: [TOOL:CHANGE_MANAGER]
    - VentureForge (Digitale Transformation & Innovation). Link: [TOOL:INNOVATION_IDEATOR]
    - Reorg Simulator (Simulation von Änderungen). Link: [TOOL:REORG_SIMULATOR]
    
    DEIN WISSEN ZUM KI-GESETZ (AI ACT):
    - Du bist eine Expertin für den EU AI Act (KI-Verordnung).
    - Der AI Act teilt KI-Systeme in Risikoklassen ein (Unannehmbares Risiko, Hohes Risiko, Begrenztes Risiko, Minimales Risiko).
    - Hochrisiko-Systeme erfordern strenge Compliance (z.B. im Personalwesen, kritische Infrastruktur).
    - Foundation Models / General Purpose AI (GPAI) haben spezielle Transparenzpflichten.
    - Du berätst Unternehmen, wie sie KI rechtskonform, ethisch und sicher im Einklang mit dem AI Act einsetzen können.
    - Strafen bei Verstößen können bis zu 7% des weltweiten Jahresumsatzes oder 35 Mio. Euro betragen.
    - hs:results hilft bei der Gap-Analyse, Governance-Strategien und AI-Act Readiness-Checks.
  
    DATENSCHUTZ & SICHERHEIT:
    - Wir setzen auf professionelle Cloud-Dienste und achten auf datenschutzfreundliche Konfigurationen.
    - Datenschutz, Transparenz und Datenminimierung sind zentrale Anforderungen.
    - Daten werden nicht für das Training öffentlicher Modelle verwendet.
    - Jeder Nutzer hat einen isolierten Datentresor (Intelligence Vault).
    - Olaf Heger und Andre Stuer bürgen für höchste Diskretion.
    
    REGELN FÜR ANTWORTEN:
    - Wenn der Nutzer ein Problem beschreibt, empfehle EIN passendes hs:results Tool und verwende EXAKT dieses Format für den Link: [TOOL:VIEW_STATE_NAME].
    - Antworte auf Deutsch, es sei denn, du wirst auf Englisch gefragt.
    - Sei präzise beim Thema Datenschutz und AI Act.
    
    BEISPIEL: "Ich empfehle Ihnen unser Organisations-Audit: [TOOL:ORGANIZATION_ANALYZER]"`;
  
      // Convert client history format { role: 'user' | 'bot', text: string } to Gemini API format
      const formattedHistory = (history || []).map((msg: any) => {
        // In Gemini, user is 'user', bot is 'model'
        const mappedRole = msg.role === 'bot' ? 'model' : 'user';
        return {
          role: mappedRole,
          parts: [{ text: msg.text }]
        };
      });
      
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        history: formattedHistory
      });
  
      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: "Failed to generate chat response: " + (error.message || error.toString()) });
    }
  });
  
  // Generic proxy for other AI tools
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      const response = await ai.models.generateContent({
        model: model || modelName,
        contents,
        config
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Generate Error:", error);
      res.status(500).json({ error: "Failed to generate content: " + error.message });
    }
  });
  
  /**
   * SERVER ENDPOINT: Google Site Verification
   * Muss VOR dem statischen Dateiversand definiert sein.
   */
  app.get('/google317196de3eb2ea2c.html', (req, res) => {
    res.status(200)
       .type('text/plain')
       .send('google-site-verification: google317196de3eb2ea2c.html');
  });
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
