import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { CALENDLY_URL } from '../lib/calendly'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Close menu on route change
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6 relative">
        <Link to="/" className="group">
          <Logo className="[&>div>span:last-child]:group-hover:w-4/5" />
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
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-2 rounded-md border border-[--color-brand-red]/40 text-white bg-[--color-brand-red]/10 hover:bg-[--color-brand-red]/20"
          >
            Book a Call
          </a>
          <Link
            to="/quote"
            className="text-sm px-3 py-2 rounded-md bg-[--color-brand-red] text-black font-semibold hover:opacity-90"
          >
            Get a Quote
          </Link>
        </nav>
        <div className="md:hidden ml-auto flex items-center gap-2">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Book a Call"
            className="px-3 py-2 rounded-md bg-[--color-brand-red] text-black font-semibold"
          >
            Book
          </a>
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-2 rounded-md border border-white/10 text-white/80 hover:text-white"
          >
            <span className="block w-5 h-[2px] bg-white mb-1" />
            <span className="block w-5 h-[2px] bg-white mb-1" />
            <span className="block w-5 h-[2px] bg-white" />
          </button>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-full bg-black/95 border-b border-white/10 md:hidden">
            <nav className="px-4 py-4 grid gap-3">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `py-2 text-base ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link
                to="/quote"
                className="mt-2 text-center px-3 py-2 rounded-md bg-[--color-brand-red] text-black font-semibold"
              >
                Get a Quote
              </Link>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                className="text-center px-3 py-2 rounded-md border border-white/10 text-white/90 hover:text-white"
              >
                Book a Call
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
