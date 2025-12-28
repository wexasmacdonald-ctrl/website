import { useState } from 'react'
import { useLanguage } from '../lib/i18n'

export default function About() {
  const [src, setSrc] = useState<string>('/me-480.jpg')
  const { t } = useLanguage()

  return (
    <main className="page-body w-full px-4 py-16">
      <div className="mx-auto md:max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">{t('about.title')}</h1>
      </div>
      <div className="mt-8 grid md:grid-cols-[240px,1fr] items-start gap-8 mx-auto md:justify-center md:max-w-4xl">
        {src ? (
          <img
            src={src}
            onError={() => {
              if (src === '/me-480.jpg') setSrc('/me.jpeg')
              else if (src === '/me.jpeg') setSrc('/me.jpg')
              else setSrc('')
            }}
            alt={t('about.photoAlt')}
            loading="lazy"
            decoding="async"
            width={240}
            height={240}
            className="aspect-square w-[240px] rounded-xl border border-white/10 object-cover bg-white/[0.04]"
          />
        ) : (
          <div className="aspect-square w-[240px] rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50">
            {t('about.photoFallback')}
          </div>
        )}

        <div className="max-w-2xl">
          <p className="text-white/80">{t('about.p1')}</p>
          <p className="mt-4 text-white/70">{t('about.p2')}</p>
        </div>
      </div>
    </main>
  )
}
