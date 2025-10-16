// Email notify endpoint (clean slate)
// Set these env vars in Vercel Project Settings → Environment Variables:
// - RESEND_API_KEY (required)
// - EMAIL_TO (required, e.g. you@yourdomain.com)
// - EMAIL_FROM (required, verified sender, e.g. "Your Name <you@yourdomain.com>")
// - EMAIL_AUTOREPLY (optional: "true" | "false", default true)

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = {
  status: (n: number) => Res
  json: (b: any) => void
  setHeader: (k: string, v: string) => void
  send: (b: any) => void
  end: () => void
}

export default async function handler(req: Req, res: Res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).send('Method Not Allowed')
  }

  try {
    // Parse JSON body safely
    let body = req.body
    if (!body || typeof body === 'string') {
      try { body = body ? JSON.parse(body) : {} } catch { body = {} }
    }
    const name = trimToString(body?.name)
    const email = trimToString(body?.email)
    const message = trimToString(body?.message)

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' })
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'invalid email' })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const EMAIL_TO = process.env.EMAIL_TO
    const EMAIL_FROM = process.env.EMAIL_FROM
    const EMAIL_AUTOREPLY = (process.env.EMAIL_AUTOREPLY ?? 'true').toLowerCase() !== 'false' && (process.env.EMAIL_AUTOREPLY ?? 'true') !== '0'

    if (!RESEND_API_KEY) return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
    if (!EMAIL_TO) return res.status(500).json({ error: 'Missing EMAIL_TO' })
    if (!EMAIL_FROM) return res.status(500).json({ error: 'Missing EMAIL_FROM' })

    // Internal notification
    const subject = `New lead from ${name}`
    const notifyText = `New Lead\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    const notifyHtml = htmlWrap(`
      <h2 style="margin:0 0 8px 0;">New Lead</h2>
      <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:8px 0 4px 0;"><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
    `)

    const notifyResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [EMAIL_TO],
        subject,
        html: notifyHtml,
        text: notifyText,
        reply_to: email,
      }),
    })
    if (!notifyResp.ok) {
      const data = await notifyResp.json().catch(() => ({}))
      return res.status(502).json({ error: data?.message || 'Failed to send notification' })
    }

    // Auto-reply (optional, non-blocking)
    if (EMAIL_AUTOREPLY) {
      const ackSubject = 'Thanks — we received your message'
      const ackText = `Hi ${name},\n\nThanks for reaching out. We received your message and will get back to you shortly.\n\n- MacDonald AI\n`
      const ackHtml = htmlWrap(`
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for reaching out. We received your message and will get back to you shortly.</p>
        <p style=\"margin:16px 0 4px 0;color:#666;\">For your records:</p>
        <pre style=\"white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;\">${escapeHtml(message)}</pre>
        <p style=\"margin-top:16px;\">- MacDonald AI</p>
      `)
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: [email],
            subject: ackSubject,
            html: ackHtml,
            text: ackText,
            reply_to: EMAIL_TO,
          }),
        })
      } catch {
        // ignore auto-reply errors
      }
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error' })
  }
}

function trimToString(v: any) {
  return typeof v === 'string' ? v.trim() : ''
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function escapeHtml(input: any) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function htmlWrap(inner: string) {
  return `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">
    ${inner}
  </div>`
}

