// Minimal email handler: requires only RESEND_API_KEY.
// Uses defaults so you can just deploy.
// POST /api/notify-lead with JSON: { name, email, message }

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = { status: (n: number) => Res; json: (b: any) => void; setHeader: (k: string, v: string) => void; send: (b: any) => void; end: () => void }

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); return res.status(405).send('Method Not Allowed') }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const EMAIL_FROM = process.env.EMAIL_FROM
  const EMAIL_TO = process.env.EMAIL_TO
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
  if (!EMAIL_FROM) return res.status(500).json({ error: 'Missing EMAIL_FROM' })
  if (!EMAIL_TO) return res.status(500).json({ error: 'Missing EMAIL_TO' })

  try {
    let body = req.body
    if (!body || typeof body === 'string') { try { body = body ? JSON.parse(body) : {} } catch { body = {} } }
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!email || !message) return res.status(400).json({ error: 'email and message are required' })

    const subject = `New lead from ${name || 'Website'}`
    const html = wrapHtml(`
      <h2 style="margin:0 0 8px 0;">New Lead</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:8px 0 4px 0;"><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
    `)

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [EMAIL_TO],
        subject,
        html,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        reply_to: email,
      }),
    })
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      return res.status(502).json({ error: data?.message || 'Failed to send email' })
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error' })
  }
}

function escapeHtml(input: any) {
  return String(input || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}
function wrapHtml(inner: string) {
  return `<div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">${inner}</div>`
}
