import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * SERVER ENDPOINT: Google Site Verification
 * Muss VOR dem statischen Dateiversand definiert sein.
 */
app.get('/google317196de3eb2ea2c.html', (req, res) => {
  res.status(200)
     .type('text/plain')
     .send('google-site-verification: google317196de3eb2ea2c.html');
});

// Statische Dateien aus dem Root-Verzeichnis servieren
// Fix: Removed explicit path '/' and used the single-argument version to resolve TypeScript overload mismatch for app.use()
app.use(express.static(__dirname));

// Fallback für Single Page Application (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
