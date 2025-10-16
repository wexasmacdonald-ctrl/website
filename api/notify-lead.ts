// Vercel Serverless Function: sends email on new lead
// Configure env vars in Vercel: RESEND_API_KEY, EMAIL_TO (optional)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).send('Method Not Allowed')
  }

  try {
    const { name, email, message } = req.body || {}

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.EMAIL_TO || 'campbell@macdonaldautomation.com'
    const from = process.env.RESEND_FROM || 'MacDonald AI <onboarding@resend.dev>'
    const replyTo = email && String(email).includes('@') ? String(email) : undefined
    const autoReplyEnabled = (process.env.RESEND_AUTOREPLY ?? 'true').toLowerCase() !== 'false' && (process.env.RESEND_AUTOREPLY ?? 'true') !== '0'

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
    }

    const subject = `New lead from ${name || 'Website'}`
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">
        <h2 style="margin:0 0 8px 0;">New Lead</h2>
        <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:8px 0 4px 0;"><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
      </div>
    `

    // 1) Internal notification
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    })

    const data = await resp.json()
    if (!resp.ok) {
      return res.status(500).json({ error: data?.message || 'Failed to send email' })
    }

    // 2) Auto-reply to lead (best UX), non-blocking
    if (autoReplyEnabled && replyTo) {
      const ackSubject = `Thanks — we received your message`
      const safeName = escapeHtml(name) || 'there'
      const ackText = `Hi ${safeName},\n\nThanks for reaching out to MacDonald AI. We received your message and will get back to you shortly.\n\n— MacDonald AI\n`
      const ackHtml = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">
          <p>Hi ${safeName},</p>
          <p>Thanks for reaching out to <strong>MacDonald AI</strong>. We received your message and will get back to you shortly.</p>
          <p style="margin:16px 0 4px 0;color:#666;">For your records:</p>
          <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
          <p style="margin-top:16px;">— MacDonald AI</p>
        </div>
      `
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [String(email)],
            subject: ackSubject,
            html: ackHtml,
            text: ackText,
            reply_to: to, // replies go to your inbox
          }),
        })
      } catch {
        // ignore auto-reply errors to not block lead creation/notify
      }
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error' })
  }
}

function escapeHtml(input: any) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
