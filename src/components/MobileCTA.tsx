import { Link } from 'react-router-dom'

export default function MobileCTA() {
  return (
    <div className="fixed bottom-3 inset-x-0 px-4 md:hidden">
      <div className="mx-auto max-w-md rounded-xl bg-white/5 backdrop-blur border border-white/10 shadow-lg">
        <div className="p-3 flex items-center gap-2">
          <a
            href="tel:+18195767856"
            className="flex-1 text-center rounded-md bg-[--color-brand-red] text-black font-semibold py-2"
          >
            Call
          </a>
          <a
            href="https://wa.me/18195767856"
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center rounded-md border border-white/10 py-2 text-white"
          >
            WhatsApp
          </a>
          <Link
            to="/contact"
            className="flex-1 text-center rounded-md border border-white/10 py-2 text-white"
          >
            Quote
          </Link>
        </div>
      </div>
    </div>
  )
}

