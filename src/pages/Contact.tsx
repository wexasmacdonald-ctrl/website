import { useState } from 'react'
import type { FormEvent } from 'react'
// Email + logging is handled server-side at /api/lead

export default function Contact() {
  const FRIENDLY_ERROR = 'We could not send your message right now. Please try again shortly.'
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '')
    const email = String(formData.get('email') || '')
    const message = String(formData.get('message') || '')

    try {
      const resp = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, source: 'contact' }),
      })
      if (!resp.ok) {
        console.error('Lead submission failed (contact)', resp.status)
        throw new Error(FRIENDLY_ERROR)
      }
      setStatus('success')
      form.reset()
    } catch (err: any) {
      setStatus('error')
      console.error('Contact form error', err)
      setError(FRIENDLY_ERROR)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Get a Quote</h1>
      <p className="mt-3 text-white/80">Tell me what you want to automate. I’ll reply fast.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-white/70">Name</span>
          <input
            name="name"
            required
            placeholder="Your name"
            className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-white/70">Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-white/70">Message</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="What do you want to automate?"
            className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-5 py-2.5 rounded-md bg-[--color-brand-red] text-black font-semibold disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Submit'}
          </button>
        </div>
        {status === 'success' && (
          <p className="text-sm text-emerald-400">Thanks — we received your request. We’ll reply shortly.</p>
        )}
        {status === 'error' && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <div className="mt-8 text-sm text-white/60">
        Prefer email? <a className="underline" href="mailto:campbell@macdonaldautomation.com">campbell@macdonaldautomation.com</a>
      </div>
    </main>
  )
}
