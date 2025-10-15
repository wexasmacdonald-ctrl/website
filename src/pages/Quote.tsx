import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function Quote() {
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
      const { error: insertError } = await supabase.from('leads').insert({ name, email, message, source: 'quote' })
      if (insertError) throw insertError
      setStatus('success')
      form.reset()
      try {
        await fetch('/api/notify-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        })
      } catch {}
    } catch (err: any) {
      setStatus('error')
      setError(err?.message || 'Something went wrong')
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Get a Quote</h1>
      <p className="mt-3 text-white/80">Tell me what you want to build or automate.</p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-white/70">Name</span>
          <input name="name" required placeholder="Your name" className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-white/70">Email</span>
          <input name="email" type="email" required placeholder="you@example.com" className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-white/70">Message</span>
          <textarea name="message" required rows={5} placeholder="What do you want to build or automate?" className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60" />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={status === 'sending'} className="px-5 py-2.5 rounded-md bg-[--color-brand-red] text-black font-semibold disabled:opacity-60">
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
        </div>
        {status === 'success' && <p className="text-sm text-emerald-400">Thanks — I received your request. I’ll reply shortly.</p>}
        {status === 'error' && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  )
}

