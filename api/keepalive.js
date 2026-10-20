/**
 * Vercel Serverless Function: Supabase Database Keep-Alive
 * 
 * Automatically queried by Vercel Cron (or external uptime monitors)
 * to prevent Supabase Free Tier from pausing due to 7 days of inactivity.
 */

export default async function handler(req, res) {
  // Allow cross-origin requests & uptime monitors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hvjociwmylpkmjybcfmy.supabase.co';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2am9jaXdteWxwa21qeWJjZm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODYxOTIsImV4cCI6MjEwNjI2MjE5Mn0.NAUndpZNMViq1_Drgvd28gBh84UWjlE1RQ778NENe3s';

  try {
    const startTime = Date.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/event_settings?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    const durationMs = Date.now() - startTime;
    const isOk = response.ok;
    const status = response.status;
    const data = isOk ? await response.json() : null;

    return res.status(200).json({
      status: 'active',
      supabaseConnected: isOk,
      supabaseHttpStatus: status,
      responseTimeMs: durationMs,
      dataReceived: data ? data.length : 0,
      timestamp: new Date().toISOString(),
      message: isOk
        ? 'Database keep-alive ping successful. Supabase inactivity timer refreshed.'
        : `Database returned status ${status}.`,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Database ping error',
      timestamp: new Date().toISOString(),
    });
  }
}
