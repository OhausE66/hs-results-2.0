import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import chatHandler from './api/chat';
import websiteContextHandler from './api/website-context';
import geminiGenerateHandler from './api/gemini/generate';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Keep local development aligned with Vercel's per-route 64 KB API limit.
  app.use(express.json({ limit: '64kb' }));
  app.post('/api/chat', (req, res) => chatHandler(req, res));
  app.post('/api/website-context', (req, res) => websiteContextHandler(req, res));
  app.all('/api/gemini/generate', (req, res) => geminiGenerateHandler(req, res));

  app.get('/google317196de3eb2ea2c.html', (req, res) => {
    res.status(200).type('text/plain').send('google-site-verification: google317196de3eb2ea2c.html');
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));
}

startServer();
