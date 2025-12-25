import { useState } from 'react'
import { useLanguage } from '../lib/i18n'

export default function About() {
  const [src, setSrc] = useState<string>('/me.jpeg')
  const { t } = useLanguage()

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">{t('about.title')}</h1>
      <div className="mt-8 grid md:grid-cols-[240px,1fr] items-start gap-8">
        {src ? (
          <img
            src={src}
            onError={() => {
              if (src === '/me.jpeg') setSrc('/me.jpg')
              else setSrc('')
            }}
            alt={t('about.photoAlt')}
            className="aspect-square w-[240px] rounded-xl border border-white/10 object-cover bg-white/[0.04]"
          />
        ) : (
          <div className="aspect-square w-[240px] rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50">
            {t('about.photoFallback')}
          </div>
        )}

        <div>
          <p className="text-white/80">{t('about.p1')}</p>
          <p className="mt-4 text-white/70">{t('about.p2')}</p>
        </div>
      </div>
    </main>
  )
}
