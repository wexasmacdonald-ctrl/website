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
    const to = process.env.EMAIL_TO || 'wexasmacdonald@gmail.com'

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

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MacDonald AI <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    })

    const data = await resp.json()
    if (!resp.ok) {
      return res.status(500).json({ error: data?.message || 'Failed to send email' })
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

