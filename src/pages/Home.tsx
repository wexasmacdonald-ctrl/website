import Hero from '../components/Hero'

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center">What I Build</h2>
        <p className="mt-4 text-white/80 text-center">
          Custom software—from AI agents and automation systems to full websites, web apps, and desktop apps. Every project is designed to save time, scale your business, and create an unfair advantage.
        </p>
      </section>
    </main>
  )
}
