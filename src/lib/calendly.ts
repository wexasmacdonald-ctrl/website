const rawCalendlyUrl = (import.meta.env.VITE_CALENDLY_URL || '').trim()

if (!rawCalendlyUrl) {
  console.warn('Missing VITE_CALENDLY_URL. Set it to your Calendly booking link in .env.local and Vercel env.')
}

export const CALENDLY_URL = rawCalendlyUrl || 'https://calendly.com/your-account'
