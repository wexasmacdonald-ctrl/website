import { Link, NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
        <Link to="/" className="relative group select-none">
          <span className="text-xl font-extrabold tracking-wider">
            {'<'}MACDONALD <span className="text-[--color-brand-red]">AI</span>{'>'}
          </span>
          <span className="absolute left-0 -bottom-1 h-0.5 w-1/2 bg-[--color-brand-red] group-hover:w-4/5 transition-all duration-300" />
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <a
            href="tel:+18195767856"
            className="text-sm px-3 py-2 rounded-md border border-[--color-brand-red]/40 text-white bg-[--color-brand-red]/10 hover:bg-[--color-brand-red]/20"
          >
            Call Now
          </a>
          <Link
            to="/contact"
            className="text-sm px-3 py-2 rounded-md bg-[--color-brand-red] text-black font-semibold hover:opacity-90"
          >
            Get a Quote
          </Link>
        </nav>
        <div className="md:hidden ml-auto flex items-center gap-3">
          <a
            href="tel:+18195767856"
            aria-label="Call Now"
            className="px-3 py-2 rounded-md bg-[--color-brand-red] text-black font-semibold"
          >
            Call
          </a>
        </div>
      </div>
    </header>
  )
}

