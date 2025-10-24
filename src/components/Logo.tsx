import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  className?: string
  forceExpanded?: boolean
  textClassName?: string
  showUnderline?: boolean
}

const LETTERS = 'MACDONALD AI'.split('')
const MIN_VISIBLE_LETTERS = 1
const OPEN_TOTAL_MS = 700
const CLOSE_TOTAL_MS = 800
const COLOR_SETTLE_DELAY_MS = 220
const LETTER_FINAL_COLOR = LETTERS.map((_, idx) => (idx >= LETTERS.length - 2 ? 'red' : 'white'))
const DYNAMIC_LETTER_COUNT = Math.max(LETTERS.length - MIN_VISIBLE_LETTERS, 1)
const OPEN_STEP_DELAY_MS = OPEN_TOTAL_MS / DYNAMIC_LETTER_COUNT
const CLOSE_STEP_DELAY_MS = CLOSE_TOTAL_MS / DYNAMIC_LETTER_COUNT
const SCROLL_CLOSE_THRESHOLD = 28

function createVisibilityArray(expanded: boolean) {
  return LETTERS.map((_, idx) => (expanded ? true : idx < MIN_VISIBLE_LETTERS))
}

function createSettledArray(expanded: boolean) {
  return LETTERS.map((_, idx) => (expanded ? true : idx < MIN_VISIBLE_LETTERS))
}

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const [hovered, setHovered] = useState(forceExpanded)
  const [visibleLetters, setVisibleLetters] = useState<boolean[]>(() => createVisibilityArray(forceExpanded))
  const [letterSettled, setLetterSettled] = useState<boolean[]>(() => createSettledArray(forceExpanded))
  const timersRef = useRef<number[]>([])
  const hasInteractedRef = useRef(forceExpanded)
  const lastScrollYRef = useRef(0)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const ensureBaseLetterVisible = useCallback(() => {
    setVisibleLetters((prev) => {
      if (prev[0]) return prev
      const next = [...prev]
      next[0] = true
      return next
    })
    setLetterSettled((prev) => {
      if (prev[0]) return prev
      const next = [...prev]
      next[0] = true
      return next
    })
  }, [])

  const openLetters = useCallback(() => {
    ensureBaseLetterVisible()
    clearTimers()
    hasInteractedRef.current = true

    LETTERS.forEach((_, idx) => {
      if (idx < MIN_VISIBLE_LETTERS) return
      const delay = (idx - (MIN_VISIBLE_LETTERS - 1)) * OPEN_STEP_DELAY_MS
      const revealTimeout = window.setTimeout(() => {
        setVisibleLetters((prev) => {
          if (prev[idx]) return prev
          const next = [...prev]
          next[idx] = true
          return next
        })

        const colorTimeout = window.setTimeout(() => {
          setLetterSettled((prev) => {
            if (prev[idx]) return prev
            const next = [...prev]
            next[idx] = true
            return next
          })
        }, COLOR_SETTLE_DELAY_MS)
        timersRef.current.push(colorTimeout)
      }, delay)

      timersRef.current.push(revealTimeout)
    })
  }, [clearTimers, ensureBaseLetterVisible])

  const closeLetters = useCallback(() => {
    ensureBaseLetterVisible()
    clearTimers()
    if (!hasInteractedRef.current) {
      setVisibleLetters(createVisibilityArray(false))
      setLetterSettled(createSettledArray(false))
      return
    }

    LETTERS.slice().reverse().forEach((_, reverseIdx) => {
      const idx = LETTERS.length - 1 - reverseIdx
      if (idx < MIN_VISIBLE_LETTERS) return
      const delay = reverseIdx * CLOSE_STEP_DELAY_MS

      const hideTimeout = window.setTimeout(() => {
        let letterWasVisible = false
        setVisibleLetters((prev) => {
          if (!prev[idx]) return prev
          letterWasVisible = true
          const next = [...prev]
          next[idx] = false
          return next
        })
        if (!letterWasVisible) {
          return
        }

        setLetterSettled((prev) => {
          if (!prev[idx]) return prev
          const next = [...prev]
          next[idx] = false
          return next
        })
      }, delay)

      timersRef.current.push(hideTimeout)
    })
  }, [clearTimers, ensureBaseLetterVisible])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  useEffect(() => {
    clearTimers()
    if (forceExpanded) {
      setHovered(true)
      setVisibleLetters(createVisibilityArray(true))
      setLetterSettled(createSettledArray(true))
      return
    }

    setHovered(false)
    hasInteractedRef.current = false
    setVisibleLetters(createVisibilityArray(false))
    setLetterSettled(createSettledArray(false))
  }, [forceExpanded, clearTimers])

  useEffect(() => {
    if (forceExpanded) return
    if (hovered) {
      openLetters()
    } else {
      closeLetters()
    }

    return clearTimers
  }, [hovered, forceExpanded, openLetters, closeLetters, clearTimers])

  useEffect(() => {
    if (forceExpanded) return
    lastScrollYRef.current = window.scrollY || 0
    const handleScroll = () => {
      const currentY = window.scrollY || 0
      if (Math.abs(currentY - lastScrollYRef.current) < SCROLL_CLOSE_THRESHOLD) {
        return
      }
      lastScrollYRef.current = currentY
      setHovered(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [forceExpanded])

  const sizeClasses =
    textClassName ??
    'text-[clamp(1.1rem,4.8vw,1.7rem)] sm:text-[clamp(1.25rem,4vw,2rem)] md:text-[2rem] lg:text-[2.45rem]'

  const baseTextClasses = `inline-flex items-baseline font-extrabold leading-none tracking-[0.025em] px-0.5 ${sizeClasses}`

  const accentClasses = [
    'pointer-events-none absolute inset-0 -z-10 flex items-center justify-center transition-all duration-250 ease-out',
    forceExpanded || hovered ? 'opacity-100 scale-100' : 'opacity-70 scale-95',
  ].join(' ')

  const handlers = forceExpanded
    ? {}
    : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocusCapture: () => setHovered(true),
        onBlurCapture: () => setHovered(false),
        onTouchStart: () => setHovered(true),
      }

  const collapsedOnly = !forceExpanded && visibleLetters.slice(1).every((vis) => !vis)

  return (
    <div className={className}>
      <div className={`relative block w-full select-none ${forceExpanded ? '' : 'group'}`} aria-hidden="true" {...handlers}>
        <span className={baseTextClasses}>
          <span className="text-white">{'<'}</span>
          {LETTERS.map((letter, index) => {
            const isVisible = forceExpanded || visibleLetters[index]
            const isSettled = forceExpanded || letterSettled[index]
            const finalColor = LETTER_FINAL_COLOR[index]
            const isCollapsedAccent = collapsedOnly && index === 0
            const wrapperClasses = [
              'inline-flex min-w-0 overflow-hidden transition-[max-width,opacity] duration-220 ease-out',
              isVisible ? 'max-w-[2ch] opacity-100' : 'max-w-0 opacity-0',
            ].join(' ')
            const colorClass = isCollapsedAccent
              ? 'text-[--color-brand-red]'
              : !isSettled
                ? 'text-[--color-brand-red]'
                : finalColor === 'red'
                  ? 'text-[--color-brand-red]'
                  : 'text-white'
            const innerClasses = [
              'inline-block transform-gpu transition-[transform,color] duration-220 ease-out',
              isVisible ? 'translate-x-0' : '-translate-x-1',
              colorClass,
            ].join(' ')

            return (
              <span key={`${letter}-${index}`} className={wrapperClasses}>
                <span className={innerClasses}>{letter === ' ' ? '\u00A0' : letter}</span>
              </span>
            )
          })}
          <span className="text-white ml-[0.08em]">{'>'}</span>
        </span>
        {showUnderline && (
          <span className={accentClasses} aria-hidden="true">
            <span className="h-[0.55rem] w-[82%] max-w-[520px] rounded-full bg-gradient-to-r from-[--color-brand-red]/90 via-[--color-brand-red]/40 to-transparent blur-[2px]" />
          </span>
        )}
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )
}
