import { useLanguage } from '../lib/i18n'

type ServiceItem = { title: string; desc: string }

export default function Services() {
  const { t, get } = useLanguage()
  const services = (get('services.items') as ServiceItem[]) || []

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">{t('services.title')}</h1>
      <p className="mt-3 text-white/80">{t('services.intro')}</p>

      <ul className="mt-8 divide-y divide-white/10">
        {services.map((service) => (
          <li key={service.title} className="py-4 flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-[--color-brand-red] shrink-0" />
            <div>
              <h3 className="font-semibold leading-tight">{service.title}</h3>
              <p className="mt-1 text-white/70 text-sm leading-relaxed">{service.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
