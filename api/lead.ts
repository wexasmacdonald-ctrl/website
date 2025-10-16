// Lead intake API: logs to Supabase and sends emails via Resend
// POST /api/lead with JSON: { name, email, message }
// Env (Production in Vercel):
// - SUPABASE_URL (required)
// - SUPABASE_SERVICE_ROLE (required; service role key, NOT anon)
// - RESEND_API_KEY (required)
// - EMAIL_TO (required; your inbox, e.g. campbell@macdonaldautomation.com)
// - EMAIL_FROM (required; verified sender, e.g. "MacDonald AI <campbell@macdonaldautomation.com>")
// - EMAIL_AUTOREPLY (optional: "true" | "false", default true)

import { createClient } from '@supabase/supabase-js'

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = { status: (n: number) => Res; json: (b: any) => void; setHeader: (k: string, v: string) => void; send: (b: any) => void; end: () => void }

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); return res.status(405).send('Method Not Allowed') }

  // Parse JSON body
  let body = req.body
  if (Buffer.isBuffer(body)) body = body.toString('utf8')
  if (!body || typeof body === 'string') { try { body = body ? JSON.parse(body) : {} } catch { body = {} } }
  const name = trim(body?.name)
  const email = trim(body?.email)
  const message = trim(body?.message)
  const source = trim(body?.source) || 'web'

  if (!name || !email || !message) return res.status(400).json({ error: 'name, email, and message are required' })
  if (!isEmail(email)) return res.status(400).json({ error: 'invalid email' })

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const EMAIL_TO = process.env.EMAIL_TO || 'campbell@macdonaldautomation.com'
  const PRIMARY_FROM = (process.env.EMAIL_FROM || 'MacDonald AI <onboarding@resend.dev>').trim()
  const EMAIL_AUTOREPLY = normalizeBool(process.env.EMAIL_AUTOREPLY ?? 'true')

  if (!SUPABASE_URL) return res.status(500).json({ error: 'Missing SUPABASE_URL' })
  if (!SUPABASE_SERVICE_ROLE) return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE' })
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
  if (!EMAIL_TO) return res.status(500).json({ error: 'Missing EMAIL_TO' })

  try {
    // 1) Log to Supabase (server-side, service role)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    const { error: insertError } = await supabase.from('leads').insert({ name, email, message, source })
    if (insertError) return res.status(500).json({ error: insertError.message || 'Failed to log lead' })

    // 2) Notify you
    const subject = `New lead from ${name}`
    const notifyText = `New Lead\n\nName: ${name}\nEmail: ${email}\nSource: ${source}\n\nMessage:\n${message}`
    const notifyHtml = wrapHtml(`
      <h2 style="margin:0 0 8px 0;">New Lead</h2>
      <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:4px 0;"><strong>Source:</strong> ${escapeHtml(source)}</p>
      <p style="margin:8px 0 4px 0;"><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
    `)
    let currentFrom = PRIMARY_FROM
    let notifyResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: currentFrom, to: [EMAIL_TO], subject, html: notifyHtml, text: notifyText, reply_to: email }),
    })
    if (!notifyResp.ok) {
      const detail = await notifyResp.json().catch(() => ({}))
      // Retry with Resend onboarding sender as a safe fallback
      const fallbackFrom = 'MacDonald AI <onboarding@resend.dev>'
      if (currentFrom !== fallbackFrom) {
        notifyResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fallbackFrom, to: [EMAIL_TO], subject, html: notifyHtml, text: notifyText, reply_to: email }),
        })
        currentFrom = fallbackFrom
      }
      if (!notifyResp.ok) {
        const retryDetail = await notifyResp.json().catch(() => ({}))
        return res.status(502).json({ error: 'Failed to send notification', detail: detail || retryDetail })
      }
    }

    // 3) Auto-confirmation to client (non-blocking)
    if (EMAIL_AUTOREPLY) {
      const ackSubject = 'Thanks — we received your message'
      const ackText = `Hi ${name},\n\nThanks for reaching out. We received your message and will get back to you shortly.\n\n- MacDonald AI\n`
      const ackHtml = wrapHtml(`
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for reaching out. We received your message and will get back to you shortly.</p>
        <p style="margin:16px 0 4px 0;color:#666;">For your records:</p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
        <p style="margin-top:16px;">- MacDonald AI</p>
      `)
      ;(async () => {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentFrom, to: [email], subject: ackSubject, html: ackHtml, text: ackText, reply_to: EMAIL_TO }),
          })
        } catch {}
      })()
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unexpected error' })
  }
}

function trim(v: any) { return typeof v === 'string' ? v.trim() : '' }
function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function normalizeBool(v: any) { const s = String(v).toLowerCase(); return !(s === 'false' || s === '0' || s === '') }
function escapeHtml(input: any) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
function wrapHtml(inner: string) {
  return `<div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">${inner}</div>`
}
