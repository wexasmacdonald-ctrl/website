// Lightweight assistant endpoint using OpenAI Responses API.
// POST /api/assist with JSON: { messages: [{ role: 'user' | 'assistant', content: string }] }
// Environment variable: OPENAI_API_KEY (stored securely on Vercel; never exposed client-side).

type Req = { method: string; headers: any; body?: any } & Record<string, any>
type Res = { status: (n: number) => Res; json: (b: any) => void; setHeader: (k: string, v: string) => void; end: () => void }

const SYSTEM_PROMPT = [
  "You are MacDonald Automation's assistant.",
  "Answer only questions related to the company's automation services.",
  "Politely refuse anything unrelated.",
  "Format every reply in Markdown so it is easy to read (use headings, bullet lists, and code blocks when helpful).",
].join(' ')

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
      model: 'gpt-5-mini',
      input: [
        { role: 'system', content: [{ type: 'input_text', text: SYSTEM_PROMPT }] },
        ...normalizedMessages.map((msg) => ({
          role: msg.role,
          content: [{ type: 'input_text', text: msg.content }],
        })),
      ],
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
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

    const assistantText = extractText(data)
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

function extractText(data: any) {
  try {
    const outputs = data?.output ?? data?.outputs ?? []
    for (const item of outputs) {
      const content = item?.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block?.type === 'output_text' && typeof block?.text === 'string' && block.text.trim()) {
            return block.text.trim()
          }
        }
      }
      if (typeof item?.output_text === 'string' && item.output_text.trim()) {
        return item.output_text.trim()
      }
    }
  } catch (err) {
    console.error('assist extractText error', err)
  }
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim()
  return null
}
