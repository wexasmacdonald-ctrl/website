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
            Im Joseph MacDonald, a developer, builder, and entrepreneur from Ottawa. Im driven by one thing: making technology work harder so people dont have to. Thats what led me to create MacDonald AI, a company that builds intelligent automation systems, AI agents, and custom software that handle the heavy lifting for any business, big or small.
          </p>
          <p className="mt-4 text-white/70">
            Whether its streamlining operations for a large company or giving a smaller team the tools to compete at that level, my goal is the same  to build systems that save time, boost performance, and make work feel effortless.
          </p>
        </div>
      </div>
    </main>
  )
}
