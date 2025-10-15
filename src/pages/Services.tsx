export default function Services() {
  const services = [
    { title: 'AI Agents', desc: 'Task‑specific agents that operate across apps and data.' },
    { title: 'Workflow Automation', desc: 'Browser automation, APIs, and schedulers that save hours.' },
    { title: 'Integrations', desc: 'Supabase, OpenAI, webhooks, spreadsheets — wired cleanly.' },
    { title: 'Dashboards & Reporting', desc: 'Clear, actionable views of performance with automated updates.' },
    { title: 'Websites & Web Apps', desc: 'Modern, fast, and maintainable frontends with clean backends.' },
  ]

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Services</h1>
      <p className="mt-3 text-white/80">Straightforward, high‑impact deliverables. Built to be reliable, fast, and easy to use.</p>

      <ul className="mt-8 divide-y divide-white/10">
        {services.map((s) => (
          <li key={s.title} className="py-4 flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-[--color-brand-red] shrink-0" />
            <div>
              <h3 className="font-semibold leading-tight">{s.title}</h3>
              <p className="mt-1 text-white/70 text-sm leading-relaxed">{s.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
