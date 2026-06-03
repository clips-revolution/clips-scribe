import OpenAI, { toFile } from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Disable body parsing so we can receive the raw audio binary in the request body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST and GET requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST or GET.` });
    return;
  }

  // Handle GET request for password validation
  if (req.method === 'GET') {
    const requestPassword = req.headers['x-app-password'] || req.headers['authorization'];
    if (process.env.APP_PASSWORD && requestPassword !== process.env.APP_PASSWORD) {
      res.status(401).json({ error: 'Unauthorized. Incorrect app password.' });
      return;
    }
    res.status(200).json({ success: true });
    return;
  }

  try {
    // 1. Verify App Password protection
    const requestPassword = req.headers['x-app-password'] || req.headers['authorization'];
    if (process.env.APP_PASSWORD && requestPassword !== process.env.APP_PASSWORD) {
      res.status(401).json({ error: 'Unauthorized. Incorrect app password.' });
      return;
    }

    // 2. Verify API Key configuration
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'OPENAI_API_KEY is not configured in environment variables.' });
      return;
    }

    // 2. Read the binary audio data from request stream
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      res.status(400).json({ error: 'Request body is empty. Please send a raw audio file.' });
      return;
    }

    // 3. Determine file extension from Content-Type header to help Whisper recognize the format
    const contentType = req.headers['content-type'] || '';
    let ext = 'mp3'; // default fallback

    if (contentType.includes('audio/wav') || contentType.includes('audio/x-wav')) {
      ext = 'wav';
    } else if (contentType.includes('audio/m4a') || contentType.includes('audio/x-m4a') || contentType.includes('audio/mp4')) {
      ext = 'm4a';
    } else if (contentType.includes('audio/ogg')) {
      ext = 'ogg';
    } else if (contentType.includes('audio/webm')) {
      ext = 'webm';
    } else if (contentType.includes('audio/flac')) {
      ext = 'flac';
    } else if (contentType.includes('audio/aac')) {
      ext = 'aac';
    }

    const filename = `audio.${ext}`;

    // 4. Convert the buffer to a File object for the OpenAI SDK
    const file = await toFile(buffer, filename);

    // 5. Send to OpenAI Whisper API
    // We specify response_format as 'srt' and language as 'he' for Hebrew subtitles
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'srt',
      language: 'he',
    });

    // 6. Return the ready SRT content
    res.setHeader('Content-Type', 'text/srt; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="transcription.srt"');
    res.status(200).send(transcription);

  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).json({
      error: 'Transcription failed.',
      details: error.message || String(error),
    });
  }
}
