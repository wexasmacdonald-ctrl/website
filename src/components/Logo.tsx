import { useEffect, useRef, useState } from 'react'

type Props = {
  className?: string
  forceExpanded?: boolean
  textClassName?: string
  showUnderline?: boolean
}

type LetterSpec = {
  char: string
  finalColor: 'white' | 'red'
}

const LETTERS: LetterSpec[] = [
  { char: '<', finalColor: 'white' },
  ...'MACDONALD'.split('').map<LetterSpec>((char) => ({ char, finalColor: 'white' })),
  { char: ' ', finalColor: 'white' },
  ...'AI'.split('').map<LetterSpec>((char) => ({ char, finalColor: 'red' })),
  { char: '>', finalColor: 'white' },
]

const LETTER_DELAY_MS = 55
const COLOR_DELAY_MS = 140

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const totalLetters = LETTERS.length
  const [hovered, setHovered] = useState(forceExpanded)
  const [visible, setVisible] = useState<boolean[]>(() => Array(totalLetters).fill(forceExpanded))
  const [finalColorApplied, setFinalColorApplied] = useState<boolean[]>(() =>
    LETTERS.map((letter) => (forceExpanded ? letter.finalColor === 'red' ? false : true : false)),
  )
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  useEffect(() => {
    clearTimers()
    if (forceExpanded) {
      setHovered(true)
      setVisible(Array(totalLetters).fill(true))
      setFinalColorApplied(LETTERS.map((letter) => letter.finalColor === 'red' ? false : true))
    } else {
      setHovered(false)
      setVisible(Array(totalLetters).fill(false))
      setFinalColorApplied(Array(totalLetters).fill(false))
    }
  }, [forceExpanded, totalLetters])

  useEffect(() => {
    if (forceExpanded) return
    clearTimers()

    if (hovered) {
      setVisible(Array(totalLetters).fill(false))
      setFinalColorApplied(Array(totalLetters).fill(false))
      const revealOrder = [
        0,
        totalLetters - 1,
        ...Array.from({ length: totalLetters - 2 }, (_, idx) => idx + 1),
      ]

      revealOrder.forEach((letterIndex, step) => {
        const delay = step * LETTER_DELAY_MS
        const timeout = window.setTimeout(() => {
          setVisible((prev) => {
            if (prev[letterIndex]) return prev
            const next = [...prev]
            next[letterIndex] = true
            return next
          })

          const letter = LETTERS[letterIndex]
          if (letter.finalColor === 'white') {
            const colorTimeout = window.setTimeout(() => {
              setFinalColorApplied((prev) => {
                if (prev[letterIndex]) return prev
                const next = [...prev]
                next[letterIndex] = true
                return next
              })
            }, COLOR_DELAY_MS)
            timersRef.current.push(colorTimeout)
          }
        }, delay)
        timersRef.current.push(timeout)
      })
    } else {
      const hideOrder = Array.from({ length: totalLetters }, (_, idx) => totalLetters - 1 - idx)
      hideOrder.forEach((letterIndex, step) => {
        const delay = step * LETTER_DELAY_MS
        const timeout = window.setTimeout(() => {
          setVisible((prev) => {
            if (!prev[letterIndex]) return prev
            const next = [...prev]
            next[letterIndex] = false
            return next
          })
          const letter = LETTERS[letterIndex]
          if (letter.finalColor === 'white') {
            setFinalColorApplied((prev) => {
              if (!prev[letterIndex]) return prev
              const next = [...prev]
              next[letterIndex] = false
              return next
            })
          }
        }, delay)
        timersRef.current.push(timeout)
      })
    }

    return () => {
      clearTimers()
    }
  }, [hovered, forceExpanded, totalLetters])

  const sizeClasses =
    textClassName ??
    'text-[clamp(0.95rem,4.2vw,1.5rem)] sm:text-[clamp(1.1rem,3.8vw,1.8rem)] md:text-[2rem] lg:text-[2.45rem]'

  const baseTextClasses = `grid w-fit font-extrabold leading-none tracking-[0.025em] ${sizeClasses}`

  const collapsedClasses = [
    'col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transform-gpu transition-all duration-220 ease-in-out',
    forceExpanded
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100 translate-x-0 group-hover:opacity-0 group-focus-visible:opacity-0 group-hover:-translate-x-4 group-focus-visible:-translate-x-4',
  ].join(' ')

  const underlineClasses = [
    'absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right transition-transform duration-250',
    forceExpanded || hovered ? 'scale-x-100' : 'scale-x-0',
  ].join(' ')

  const handlers = forceExpanded
    ? {}
    : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocusCapture: () => setHovered(true),
        onBlurCapture: () => setHovered(false),
      }

  return (
    <div className={className}>
      <div className={`relative block w-full select-none ${forceExpanded ? '' : 'group'}`} aria-hidden="true" {...handlers}>
        <span className={baseTextClasses}>
          {!forceExpanded && (
            <span className={collapsedClasses}>
              {'<'}
              <span className="text-[--color-brand-red]">M</span>
              {'>'}
            </span>
          )}
          <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap">
            {LETTERS.map((letter, index) => {
              const isVisible = forceExpanded || visible[index]
              const shouldBeWhite = forceExpanded
                ? letter.finalColor === 'white'
                : letter.finalColor === 'white' && finalColorApplied[index]
              const colorClass =
                letter.finalColor === 'red'
                  ? 'text-[--color-brand-red]'
                  : shouldBeWhite
                    ? 'text-white'
                    : 'text-[--color-brand-red]'

      const motionClass = isVisible
        ? 'opacity-100 translate-x-0 blur-0'
        : 'opacity-0 translate-x-3 blur-[3px]'

              return (
                <span
                  key={`${letter.char}-${index}`}
                  className={`inline-block transform-gpu transition-all duration-180 ease-in-out ${colorClass} ${motionClass}`}
                >
                  {letter.char === ' ' ? '\u00A0' : letter.char}
                </span>
              )
            })}
          </span>
        </span>
        {showUnderline && <span className={underlineClasses} />}
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }
}
