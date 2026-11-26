/**
 * Lightweight Queue Status & Admin Endpoint (Vercel / Node.js Serverless).
 * Exposes current rolling batch counts (Batch 1 Today vs Batch 2 +24h vs Paused)
 * so the storefront and /admin dashboard stay synchronized in production.
 */

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({
      batch1Cap: 5,
      batch2Cap: 5,
      state: 'open',
      message: 'Connect your database (Supabase / Cloudflare D1) here for multi-device sync.',
    })
  }

  res.setHeader('Allow', 'GET')
  return res.status(405).json({ error: 'Method Not Allowed' })
}
