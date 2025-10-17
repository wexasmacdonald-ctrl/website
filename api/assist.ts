// Lightweight assistant endpoint using OpenAI Responses API.
// POST /api/assist with JSON: { messages: [{ role: 'user' | 'assistant', content: string }] }
// Environment variable: OPENAI_API_KEY (stored securely on Vercel; never exposed client-side).

import { readFileSync } from 'fs'
import { join } from 'path'

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = { status: (n: number) => Res; json: (b: any) => void; setHeader: (k: string, v: string) => void; end: () => void }

const catalogPath = join(process.cwd(), 'src/lib/services.md')
const servicesCatalog = (() => {
  try {
    return readFileSync(catalogPath, 'utf8')
  } catch (err) {
    console.error('assist: unable to load services catalog', err)
    return ''
  }
})()

const systemPrompt = [
  "You are MacDonald Automation's assistant.",
  "Answer only questions related to the company's automation services.",
  "Politely refuse anything unrelated.",
  "Format every reply in Markdown so it is easy to read (use headings, bullet lists, and code blocks when helpful).",
  "Reference the detailed services catalog below when answering:",
].join(' ')

const SYSTEM_PROMPT = servicesCatalog
  ? `${systemPrompt}\n\n${servicesCatalog}`
  : ''

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  if (!SYSTEM_PROMPT) return res.status(500).json({ error: 'Services catalog unavailable' })

  let body = req.body
  if (Buffer.isBuffer(body)) body = body.toString('utf8')
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }

  const rawMessages: Array<{ role: string; content: string }> = Array.isArray(body?.messages) ? body.messages : []
  if (!rawMessages.length) return res.status(400).json({ error: 'messages array is required' })

  const normalizedMessages = rawMessages
    .map((msg) => ({
      role: normalizeRole(msg.role),
      content: typeof msg.content === 'string' ? msg.content.trim() : '',
    }))
    .filter((msg) => msg.role && msg.content)

  if (!normalizedMessages.length) return res.status(400).json({ error: 'No valid messages provided' })

  try {
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...normalizedMessages.map((msg) => ({ role: msg.role, content: msg.content })),
      ],
      temperature: 0.4,
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || 'OpenAI request failed'
      return res.status(response.status).json({ error: errorMessage })
    }

    const assistantText = extractChatText(data)
    if (!assistantText) return res.status(500).json({ error: 'Empty response from model' })

    return res.status(200).json({ message: assistantText })
  } catch (err: any) {
    console.error('assist endpoint error', err)
    return res.status(500).json({ error: err?.message || 'Unexpected error' })
  }
}

function normalizeRole(role: any) {
  if (role === 'user' || role === 'assistant') return role
  return null
}

function extractChatText(data: any) {
  try {
    const text = data?.choices?.[0]?.message?.content
    if (typeof text === 'string' && text.trim()) return text.trim()
  } catch (err) {
    console.error('assist extractChatText error', err)
  }
  return null
}
