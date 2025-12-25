import Hero from '../components/Hero'
import { useLanguage } from '../lib/i18n'

export default function Home() {
  const { t } = useLanguage()

  return (
    <main>
      <Hero />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center">{t('home.sectionTitle')}</h2>
        <p className="mt-4 text-white/80 text-center">
          {t('home.sectionBody')}
        </p>
      </section>
    </main>
  )
}
