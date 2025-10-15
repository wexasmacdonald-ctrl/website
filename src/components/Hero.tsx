import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-20"
             style={{ background: 'radial-gradient(60% 60% at 50% 50%, var(--color-brand-red) 0%, transparent 60%)' }} />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-10"
             style={{ background: 'radial-gradient(60% 60% at 50% 50%, white 0%, transparent 60%)' }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 grid md:grid-cols-2 items-center gap-12">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight"
          >
            I'VE DONE THIS BEFORE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-5 text-lg md:text-xl text-white/80 max-w-xl"
          >
            I turn your computer into a 20‑person workforce. Automation isn't the future — it's your unfair advantage.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="tel:+18195767856"
              className="px-5 py-3 rounded-md bg-[--color-brand-red] text-black font-semibold hover:opacity-90"
            >
              Call Now
            </a>
            <Link
              to="/contact"
              className="px-5 py-3 rounded-md border border-white/20 hover:border-white/40 text-white"
            >
              Get a Quote
            </Link>
            <a
              href="https://wa.me/18195767856"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-md border border-white/10 text-white/80 hover:text-white"
            >
              WhatsApp
            </a>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative aspect-[4/3] rounded-xl border border-white/10 bg-white/[0.02] red-glow overflow-hidden"
        >
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-px p-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-black/50 backdrop-blur-[1px] border border-white/[0.04]" />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}

