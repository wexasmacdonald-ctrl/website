export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>Ac {new Date().getFullYear()} MacDonald AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/in/joseph-macdonald-6a0a2638a/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            Joseph MacDonald
          </a>
          <a href="/quote" className="hover:text-white">Get a Quote</a>
        </div>
      </div>
    </footer>
  )
}
