export default function Call() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Call Now</h1>
      <p className="mt-3 text-white/80">Talk directly with our team.</p>
      <div className="mt-8">
        <a
          href="tel:+18195767856"
          className="inline-block px-6 py-3 rounded-md bg-[--color-brand-red] text-black font-semibold hover:opacity-90 shadow-sm"
        >
          +1 (819) 576‑7856
        </a>
      </div>
      <p className="mt-6 text-sm text-white/60">Prefer email? Visit the <a className="underline" href="/contact">Contact</a> page.</p>
    </main>
  )
}
