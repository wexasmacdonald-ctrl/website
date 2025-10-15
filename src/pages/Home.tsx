import Hero from '../components/Hero'

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">What I Build</h2>
        <p className="mt-3 text-white/80 max-w-2xl">
          Smart, simple automation that eliminates repetitive work. Custom agents, data pipelines, and browser automations that turn hours into minutes.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {['Agents', 'Workflows', 'Dashboards'].map((t) => (
            <div key={t} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-white/70">High‑impact, production‑ready systems that scale with you.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

