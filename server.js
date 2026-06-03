import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/transcribe.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount the Vercel Serverless Function handler at /api/transcribe
// Note: We do NOT use express body parsers for this route because the handler 
// reads the raw request stream directly to parse the audio binary.
app.post('/api/transcribe', handler);
app.get('/api/transcribe', handler);

// Serve static frontend files from the root directory
app.use(express.static(__dirname));

// Start listening
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
