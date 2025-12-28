import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const navigate = useNavigate()
  const { t } = useLanguage()
  const hideCTA = ['/quote'].includes(location.pathname)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const autoScrollingRef = useRef(false)
  const [isNearFooter, setIsNearFooter] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const scrollThreshold = 280
  const pages = useMemo(
    () => [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/quote', element: <Quote /> },
    ],
    []
  )
  const activeIndex = useMemo(() => pages.findIndex((page) => page.path === location.pathname), [pages, location.pathname])

  useEffect(() => {
    const panel = panelRefs.current[activeIndex]
    if (!panel) return

    function updateProximity() {
      const scrollTop = panel.scrollTop
      const innerHeight = panel.clientHeight
      const docHeight = panel.scrollHeight
      const canScrollNow = docHeight - innerHeight > 1
      const hasScrolled = scrollTop > 0
      const isClose = canScrollNow && hasScrolled && innerHeight + scrollTop >= docHeight - scrollThreshold
      setCanScroll(canScrollNow)
      setIsNearFooter(isClose)
    }

    updateProximity()
    panel.addEventListener('scroll', updateProximity, { passive: true })
    window.addEventListener('resize', updateProximity)
    return () => {
      panel.removeEventListener('scroll', updateProximity)
      window.removeEventListener('resize', updateProximity)
    }
  }, [activeIndex])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const gtag = (window as { gtag?: (...args: any[]) => void }).gtag
    if (typeof gtag === 'function') {
      const pagePath = `${location.pathname}${location.search}${location.hash}`
      gtag('event', 'page_view', { page_path: pagePath })
    }
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    const track = trackRef.current
    if (!track || activeIndex < 0) return
    const targetLeft = track.clientWidth * activeIndex
    if (Math.abs(track.scrollLeft - targetLeft) < 2) return
    autoScrollingRef.current = true
    track.scrollTo({ left: targetLeft, behavior: 'smooth' })
    const timer = window.setTimeout(() => {
      autoScrollingRef.current = false
    }, 500)
    return () => window.clearTimeout(timer)
  }, [activeIndex])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let accumulatedX = 0
    let resetTimer: number | null = null
    const THRESHOLD = 180
    let cooldown = false
    let raf = 0

    function handleWheel(event: WheelEvent) {
      const deltaX = event.deltaX
      const deltaY = event.deltaY
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return
      event.preventDefault()
      if (cooldown || autoScrollingRef.current) return

      accumulatedX += deltaX
      if (resetTimer) window.clearTimeout(resetTimer)
      resetTimer = window.setTimeout(() => {
        accumulatedX = 0
      }, 140)

      if (Math.abs(accumulatedX) < THRESHOLD) return
      event.preventDefault()
      accumulatedX = 0

      const nextIndex = deltaX > 0 ? activeIndex + 1 : activeIndex - 1
      const nextPage = pages[nextIndex]
      if (!nextPage) return

      autoScrollingRef.current = true
      cooldown = true
      navigate(nextPage.path)
      const targetLeft = track.clientWidth * nextIndex
      track.scrollTo({ left: targetLeft, behavior: 'smooth' })
      window.setTimeout(() => {
        autoScrollingRef.current = false
        cooldown = false
      }, 500)
    }

    function handleScroll() {
      if (autoScrollingRef.current) return
      if (raf) window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => {
        const width = track.clientWidth || 1
        const nextIndex = Math.round(track.scrollLeft / width)
        const nextPage = pages[nextIndex]
        if (nextPage && nextPage.path !== location.pathname) {
          navigate(nextPage.path, { replace: true })
        }
      })
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      track.removeEventListener('wheel', handleWheel)
      track.removeEventListener('scroll', handleScroll)
      if (raf) window.cancelAnimationFrame(raf)
      if (resetTimer) window.clearTimeout(resetTimer)
    }
  }, [activeIndex, navigate, pages, location.pathname])

  return (
    <div className="grain text-soft-outline min-h-dvh flex flex-col pb-[calc(env(safe-area-inset-bottom)+84px)] md:pb-0">
      <Header />
      <div ref={trackRef} className="page-track flex-1">
        {pages.map((page, index) => (
          <section
            key={page.path}
            ref={(el) => {
              panelRefs.current[index] = el
            }}
            className="page-panel"
            data-path={page.path}
          >
            <div className="page-panel-inner">
              {page.element}
              <Footer />
            </div>
          </section>
        ))}
      </div>
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
      <AssistantChat avoidFooter scrollContainer={panelRefs.current[activeIndex] ?? null} />
    </div>
  )
}
