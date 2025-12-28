import Hero from '../components/Hero'
import { useLanguage } from '../lib/i18n'

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="page-body">
      <Hero />
      <section className="w-full px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center">{t('home.sectionTitle')}</h2>
          <p className="mt-4 text-white/80 text-center">
            {t('home.sectionBody')}
          </p>
        </div>
      </section>
    </main>
  )
}
