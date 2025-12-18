import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(60% 60% at 50% 50%, var(--color-brand-red) 0%, transparent 60%)' }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-20 pb-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight"
        >
          We turn your computer into a 20-person workforce.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-5 text-lg md:text-xl text-white/80"
        >
          Building powerful automation that does the boring work for you—data entry, client follow-ups, reports, websites, and more—while you focus on the stuff that actually makes money.
        </motion.p>
      </div>
    </section>
  )
}
