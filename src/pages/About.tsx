import { useState } from 'react'

export default function About() {
  const [src, setSrc] = useState<string>('/me.jpeg')

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">About</h1>
      <div className="mt-8 grid md:grid-cols-[240px,1fr] items-start gap-8">
        {src ? (
          <img
            src={src}
            onError={() => {
              if (src === '/me.jpeg') setSrc('/me.jpg')
              else setSrc('')
            }}
            alt="Joseph MacDonald"
            className="aspect-square w-[240px] rounded-xl border border-white/10 object-cover bg-white/[0.04]"
          />
        ) : (
          <div className="aspect-square w-[240px] rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50">
            Put your photo at <code className="text-white/80">public/me.jpeg</code> (or <code className="text-white/80">me.jpg</code>)
          </div>
        )}

        <div>
          <p className="text-white/80">
            I'm Joseph MacDonald, a developer, builder, and entrepreneur from Ottawa. I run MacDonald AI, where we use AI and software to create systems that make (or save) real money: automation for ops, custom software, integrations, data pipelines, and agents where they actually help. We don't just add a chatbot to your site—we build the underlying workflows and tools that move the business.
          </p>
          <p className="mt-4 text-white/70">
            Big company or small team, the goal is the same: design and ship reliable automation that saves time, boosts performance, and pays for itself fast.
          </p>
        </div>
      </div>
    </main>
  )
}
