export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} MacDonald AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="https://wa.me/18195767856" className="hover:text-white" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href="mailto:j.campbellmacdonald@gmail.com" className="hover:text-white">
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}

