// Lead intake API: logs submissions to Supabase and notifies via Google Workspace SMTP
// POST /api/lead with JSON: { name, email, message, source? }
// Env (Production in Vercel):
// - SUPABASE_URL (required)
// - SUPABASE_SERVICE_ROLE (required; service role key, NOT anon)
// - EMAIL_TO (optional; default campbell@macdonaldautomation.com)
// - EMAIL_FROM (optional; default SMTP_USER)
// - EMAIL_AUTOREPLY (optional; default true)
// - SMTP_HOST (optional; default smtp.gmail.com)
// - SMTP_PORT (optional; default 465)
// - SMTP_SECURE (optional; default true if port 465 else false)
// - SMTP_USER (required; Google Workspace address with app password)
// - SMTP_PASS (required; app password or SMTP relay password)

import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = { status: (n: number) => Res; json: (b: any) => void; setHeader: (k: string, v: string) => void; send: (b: any) => void; end: () => void }

const FRIENDLY_ERROR = 'We could not process your request right now. Please try again shortly.'

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

  if (!name || !email || !message) return res.status(400).json({ error: 'Please include your name, email, and message.' })
  if (!isEmail(email)) return res.status(400).json({ error: 'Please use a valid email address.' })

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
  const EMAIL_TO = (process.env.EMAIL_TO || 'campbell@macdonaldautomation.com').trim()
  const EMAIL_FROM = (process.env.EMAIL_FROM || process.env.SMTP_USER || '').trim()
  const EMAIL_AUTOREPLY = normalizeBool(process.env.EMAIL_AUTOREPLY ?? 'true')
  const SMTP_HOST = (process.env.SMTP_HOST || 'smtp.gmail.com').trim()
  const SMTP_PORT_RAW = (process.env.SMTP_PORT || '').trim()
  const SMTP_PORT = Number(SMTP_PORT_RAW || '465')
  const SMTP_SECURE = normalizeBool(process.env.SMTP_SECURE ?? (SMTP_PORT === 465 ? 'true' : 'false'))
  const SMTP_USER = (process.env.SMTP_USER || '').trim()
  const SMTP_PASS = (process.env.SMTP_PASS || '').trim()

  if (!SUPABASE_URL) { console.error('lead: missing SUPABASE_URL'); return res.status(503).json({ error: FRIENDLY_ERROR }) }
  if (!SUPABASE_SERVICE_ROLE) { console.error('lead: missing SUPABASE_SERVICE_ROLE'); return res.status(503).json({ error: FRIENDLY_ERROR }) }
  if (!EMAIL_TO) { console.error('lead: missing EMAIL_TO'); return res.status(503).json({ error: FRIENDLY_ERROR }) }
  if (!EMAIL_FROM) { console.error('lead: missing EMAIL_FROM'); return res.status(503).json({ error: FRIENDLY_ERROR }) }
  if (!SMTP_USER) { console.error('lead: missing SMTP_USER'); return res.status(503).json({ error: FRIENDLY_ERROR }) }
  if (!SMTP_PASS) { console.error('lead: missing SMTP_PASS'); return res.status(503).json({ error: FRIENDLY_ERROR }) }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    const { error: insertError } = await supabase.from('leads').insert({ name, email, message, source })
    if (insertError) {
      console.error('Supabase lead insert failed', insertError)
      return res.status(500).json({ error: FRIENDLY_ERROR })
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number.isNaN(SMTP_PORT) ? 465 : SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

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
      to: EMAIL_TO,
      replyTo: email,
      subject,
      text: notifyText,
      html: notifyHtml,
    }

    try {
      await transporter.sendMail(notifyPayload)
    } catch (mailError: any) {
      console.error('SMTP notification failed', mailError)
      return res.status(502).json({ error: FRIENDLY_ERROR })
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
      try {
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: email,
          replyTo: EMAIL_TO,
          subject: ackSubject,
          text: ackText,
          html: ackHtml,
        })
      } catch (ackError) {
        console.error('SMTP auto-reply failed', ackError)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (err: any) {
    console.error('Lead handler threw', err)
    return res.status(500).json({ error: FRIENDLY_ERROR })
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
