// api/env.js — Vercel Serverless Function
// Returns the GROQ_API_KEY from Vercel's secure environment variables
// as a JavaScript snippet that sets window.__ENV__.
// Called by index.html as <script src="/api/env"></script>

export default function handler(req, res) {
  const key = process.env.GROQ_API_KEY || '';
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  // Never expose the key in logs — only send it to the browser
  res.send(`window.__ENV__ = window.__ENV__ || {}; window.__ENV__.GROQ_API_KEY = ${JSON.stringify(key)};`);
}
