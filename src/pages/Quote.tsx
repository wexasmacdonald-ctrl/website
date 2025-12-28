import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLanguage } from '../lib/i18n'
// Email + logging is handled server-side at /api/lead

export default function Quote() {
  const { t } = useLanguage()
  const FRIENDLY_ERROR = t('quote.error')
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
        body: JSON.stringify({ name, email, message, source: 'quote' }),
      })
      if (!resp.ok) {
        console.error('Lead submission failed (quote)', resp.status)
        throw new Error(FRIENDLY_ERROR)
      }
      setStatus('success')
      form.reset()
    } catch (err: any) {
      setStatus('error')
      console.error('Quote form error', err)
      setError(FRIENDLY_ERROR)
    }
  }

  return (
    <main className="page-body w-full px-4 py-16">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-black/70 p-8 shadow-2xl shadow-black/50">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">{t('quote.title')}</h1>
        <p className="mt-3 text-white/80">{t('quote.intro')}</p>
        <form onSubmit={onSubmit} className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">{t('quote.labels.name')}</span>
            <input
              name="name"
              required
              placeholder={t('quote.placeholders.name')}
              className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/70">{t('quote.labels.email')}</span>
            <input
              name="email"
              type="email"
              required
              placeholder={t('quote.placeholders.email')}
              className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-white/70">{t('quote.labels.message')}</span>
            <textarea
              name="message"
              required
              rows={5}
              placeholder={t('quote.placeholders.message')}
              className="rounded-md bg-white/[0.06] border border-white/10 px-3 py-2 outline-none focus:border-[--color-brand-red]/60"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-5 py-2.5 rounded-md bg-[--color-brand-red] text-black font-semibold disabled:opacity-60"
            >
              {status === 'sending' ? t('quote.sending') : t('quote.submit')}
            </button>
          </div>
          {status === 'success' && (
            <p className="text-sm text-emerald-400">{t('quote.success')}</p>
          )}
          {status === 'error' && <p className="text-sm text-red-400">{error}</p>}
        </form>

        <div className="mt-8 text-sm text-white/60">
          {t('quote.preferEmail')}{' '}
          <a className="underline" href="mailto:campbell@macdonaldautomation.com">campbell@macdonaldautomation.com</a>
        </div>
      </div>
    </main>
  )
}
