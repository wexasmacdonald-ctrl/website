export default function Services() {
  const services = [
    { title: 'AI Agents', desc: 'Task‑specific agents that operate across apps and data.' },
    { title: 'Workflow Automation', desc: 'Browser automation, APIs, and schedulers that save hours.' },
    { title: 'Integrations', desc: 'Supabase, OpenAI, webhooks, spreadsheets — wired cleanly.' },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">Services</h1>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-2 text-white/70 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

