// Lead intake API: logs submissions to Supabase and notifies via Resend
// POST /api/lead with JSON: { name, email, message, source? }
// Env (Production in Vercel):
// - SUPABASE_URL (required)
// - SUPABASE_SERVICE_ROLE (required; service role key, NOT anon)
// - RESEND_API_KEY (required; secret key from https://resend.com)
// - EMAIL_TO (optional; default canpbell@macdonaldautomations.com)
// - EMAIL_FROM or RESEND_FROM (required; must match a verified Resend domain, e.g. "MacDonald AI <team@macdonaldautomation.com>")
// - EMAIL_AUTOREPLY or RESEND_AUTOREPLY (optional; default true)

import { createClient } from '@supabase/supabase-js'

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = { status: (n: number) => Res; json: (b: any) => void; setHeader: (k: string, v: string) => void; send: (b: any) => void; end: () => void }

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); return res.status(405).send('Method Not Allowed') }

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
  const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim()
  const EMAIL_TO = (process.env.EMAIL_TO || 'canpbell@macdonaldautomations.com').trim()
  const EMAIL_FROM = (process.env.EMAIL_FROM || process.env.RESEND_FROM || '').trim()
  const EMAIL_AUTOREPLY = normalizeBool(process.env.EMAIL_AUTOREPLY ?? process.env.RESEND_AUTOREPLY ?? 'true')

  if (!SUPABASE_URL) return res.status(500).json({ error: 'Missing SUPABASE_URL' })
  if (!SUPABASE_SERVICE_ROLE) return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE' })
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
  if (!EMAIL_TO) return res.status(500).json({ error: 'Missing EMAIL_TO' })
  if (!EMAIL_FROM) return res.status(500).json({ error: 'Missing EMAIL_FROM (set to a verified sender email)' })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    const { error: insertError } = await supabase.from('leads').insert({ name, email, message, source })
    if (insertError) {
      console.error('Supabase lead insert failed', insertError)
      return res.status(500).json({ error: insertError.message || 'Failed to log lead' })
    }

    const subject = `New lead from ${name}`
    const notifyText = `New Lead\n\nName: ${name}\nEmail: ${email}\nSource: ${source}\n\nMessage:\n${message}`
    const notifyHtml = htmlWrap(`
      <h2 style="margin:0 0 8px 0;">New Lead</h2>
      <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:4px 0;"><strong>Source:</strong> ${escapeHtml(source)}</p>
      <p style="margin:8px 0 4px 0;"><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
    `)

    const notifyPayload = {
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      reply_to: email,
      subject,
      text: notifyText,
      html: notifyHtml,
    }

    const notifyResult = await sendResendEmail(RESEND_API_KEY, notifyPayload)
    if (!notifyResult.ok) {
      console.error('Resend notification failed', notifyResult)
      return res.status(502).json({ error: notifyResult.error || 'Failed to send notification email' })
    }

    if (EMAIL_AUTOREPLY) {
      const ackSubject = 'Thanks - we received your message'
      const safeName = escapeHtml(name) || 'there'
      const ackText = `Hi ${name},\n\nThanks for reaching out. We received your message and will get back to you shortly.\n\n- MacDonald AI\n`
      const ackHtml = htmlWrap(`
        <p>Hi ${safeName},</p>
        <p>Thanks for reaching out. We received your message and will get back to you shortly.</p>
        <p style="margin:16px 0 4px 0;color:#666;">For your records:</p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
        <p style="margin-top:16px;">- MacDonald AI</p>
      `)
      ;(async () => {
        try {
          const ackPayload = {
            from: notifyResult.usedFrom || EMAIL_FROM,
            to: [email],
            reply_to: EMAIL_TO,
            subject: ackSubject,
            text: ackText,
            html: ackHtml,
          }
          const ackResult = await sendResendEmail(RESEND_API_KEY, ackPayload)
          if (!ackResult.ok) {
            console.error('Resend auto-reply failed', ackResult)
          }
        } catch (ackError) {
          console.error('Resend auto-reply threw', ackError)
        }
      })()
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('Lead handler threw', err)
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
function htmlWrap(inner: string) {
  return `<div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">${inner}</div>`
}

async function sendResendEmail(apiKey: string, payload: Record<string, any>) {
  const primary = await postResendEmail(apiKey, payload)
  if (primary.ok) return { ok: true, usedFrom: payload.from }

  return { ok: false, status: primary.status, error: primary.error, usedFrom: payload.from }
}

async function postResendEmail(apiKey: string, body: Record<string, any>) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const raw = await resp.text().catch(() => '')
  let json: any = null
  try { json = raw ? JSON.parse(raw) : null } catch { /* ignore */ }
  return {
    ok: resp.ok,
    status: resp.status,
    error: json?.message || raw || null,
    json,
  }
}
