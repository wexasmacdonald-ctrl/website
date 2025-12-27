import { Route, Routes, useLocation, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileCTA from './components/MobileCTA'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Quote from './pages/Quote'
import AssistantChat from './components/AssistantChat'
import { CALENDLY_URL } from './lib/calendly'
import { useLanguage } from './lib/i18n'

export default function App() {
  const location = useLocation()
  const { t } = useLanguage()
  const hideCTA = ['/quote'].includes(location.pathname)
  const [isNearFooter, setIsNearFooter] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const scrollThreshold = 280

  useEffect(() => {
    function updateProximity() {
      if (typeof window === 'undefined') return
      const doc = document.documentElement
      const scrollY = window.scrollY || window.pageYOffset
      const innerHeight = window.innerHeight || doc.clientHeight
      const docHeight = doc.scrollHeight
      const canScrollNow = docHeight - innerHeight > 1
      const hasScrolled = scrollY > 0
      const isClose = canScrollNow && hasScrolled && innerHeight + scrollY >= docHeight - scrollThreshold
      setCanScroll(canScrollNow)
      setIsNearFooter(isClose)
    }

    updateProximity()
    window.addEventListener('scroll', updateProximity, { passive: true })
    window.addEventListener('resize', updateProximity)
    return () => {
      window.removeEventListener('scroll', updateProximity)
      window.removeEventListener('resize', updateProximity)
    }
  }, [location.pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const gtag = (window as { gtag?: (...args: any[]) => void }).gtag
    if (typeof gtag === 'function') {
      const pagePath = `${location.pathname}${location.search}${location.hash}`
      gtag('event', 'page_view', { page_path: pagePath })
    }
  }, [location.pathname, location.search, location.hash])

  return (
    <div className="grain min-h-dvh flex flex-col pb-[calc(env(safe-area-inset-bottom)+84px)] md:pb-0">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Navigate to="/quote" replace />} />
          <Route path="/quote" element={<Quote />} />
        </Routes>
      </div>
      <Footer />
      {!hideCTA && <MobileCTA hideWhenNearBottom={isNearFooter && canScroll} />}
      {!hideCTA && isNearFooter && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] transition-opacity duration-200 md:hidden">
          <div className="pointer-events-auto flex w-full max-w-lg flex-wrap items-center justify-center gap-3 text-sm text-white">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[--color-brand-red] px-5 py-2 font-semibold text-black transition hover:opacity-90"
            >
              {t('cta.bookCall')}
            </a>
          </div>
        </div>
      )}
      <AssistantChat avoidFooter />
    </div>
  )
}
