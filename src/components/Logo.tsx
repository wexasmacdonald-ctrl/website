import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

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
const M_LETTER_INDEX = LETTERS.findIndex((letter) => letter.char === 'M')
const CLOSING_TARGET_INDEX = M_LETTER_INDEX === -1 ? 1 : M_LETTER_INDEX
const DEFAULT_CARET_DURATION_MS = 220

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const totalLetters = LETTERS.length
  const closingIndex = totalLetters - 1
  const [hovered, setHovered] = useState(forceExpanded)
  const [visible, setVisible] = useState<boolean[]>(() => Array(totalLetters).fill(forceExpanded))
  const [finalColorApplied, setFinalColorApplied] = useState<boolean[]>(() =>
    LETTERS.map((letter) => (forceExpanded ? letter.finalColor === 'red' ? false : true : false)),
  )
  const timersRef = useRef<number[]>([])
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const caretOffsetRef = useRef(0)
  const [caretOffset, setCaretOffset] = useState(0)
  const [caretTransitionMs, setCaretTransitionMs] = useState(DEFAULT_CARET_DURATION_MS)
  const [hasOpened, setHasOpened] = useState(forceExpanded)
  const updateCaretOffset = useCallback((value: number) => {
    caretOffsetRef.current = value
    setCaretOffset(value)
  }, [])
  const computeCaretOffset = useCallback(
    (letterIndex: number) => {
      const caretEl = lettersRef.current[closingIndex]
      const targetEl = lettersRef.current[letterIndex]
      if (!caretEl || !targetEl) {
        return caretOffsetRef.current
      }

      const caretRect = caretEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      const caretRight = caretRect.left + caretRect.width
      const targetRight = targetRect.left + targetRect.width

      return targetRight - caretRight
    },
    [closingIndex],
  )

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
      updateCaretOffset(0)
      setCaretTransitionMs(DEFAULT_CARET_DURATION_MS)
      setHasOpened(true)
    } else {
      setHovered(false)
      setVisible(Array(totalLetters).fill(false))
      setFinalColorApplied(Array(totalLetters).fill(false))
      updateCaretOffset(0)
      setCaretTransitionMs(DEFAULT_CARET_DURATION_MS)
      setHasOpened(false)
    }
  }, [forceExpanded, totalLetters, updateCaretOffset])

  useEffect(() => {
    if (forceExpanded) return
    if (hovered) {
      setHasOpened(true)
    }
  }, [hovered, forceExpanded])

  useEffect(() => {
    if (forceExpanded) return
    clearTimers()

    if (hovered) {
      updateCaretOffset(0)
      setCaretTransitionMs(DEFAULT_CARET_DURATION_MS)
      setVisible(Array(totalLetters).fill(false))
      setFinalColorApplied(Array(totalLetters).fill(false))
      const revealOrder = [
        0,
        closingIndex,
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
      if (!hasOpened) return
      const hideOrder = [
        ...Array.from({ length: totalLetters - 1 }, (_, idx) => totalLetters - 2 - idx),
        closingIndex,
      ]

      const caretTargetOffset = computeCaretOffset(CLOSING_TARGET_INDEX)
      const closingLetters = hideOrder.filter((letterIndex) => letterIndex >= CLOSING_TARGET_INDEX && letterIndex !== closingIndex)
      const caretDistance = Math.abs(caretTargetOffset)
      const closingDuration = Math.min(Math.max(Math.round((caretDistance || 60) * 6), 420), 900)
      const letterOffsets = new Map<number, number>()
      const closingLetterOrder = new Map<number, number>()

      closingLetters.forEach((letterIndex, idx) => {
        letterOffsets.set(letterIndex, computeCaretOffset(letterIndex))
        closingLetterOrder.set(letterIndex, idx)
      })

      setCaretTransitionMs(closingDuration)
      updateCaretOffset(caretTargetOffset)

      let trailingDelayCursor = 0
      let lastClosingDelay = 0

      hideOrder.forEach((letterIndex, step) => {
        let delay: number
        if (letterIndex >= CLOSING_TARGET_INDEX && letterIndex !== closingIndex) {
          if (closingLetters.length === 0) {
            delay = step * LETTER_DELAY_MS
          } else {
            const offsetForLetter = Math.abs(letterOffsets.get(letterIndex) ?? caretTargetOffset)
            const ratioBase = caretDistance > 1 ? caretDistance : closingLetters.length + 1
            const sequenceIndex = closingLetterOrder.get(letterIndex) ?? 0
            const ratio =
              caretDistance > 1
                ? offsetForLetter / ratioBase
                : (sequenceIndex + 1) / ratioBase
            delay = Math.max(lastClosingDelay, ratio * closingDuration)
            lastClosingDelay = delay
          }
        } else if (letterIndex === closingIndex) {
          delay = closingDuration + 120
        } else {
          trailingDelayCursor += 1
          delay = closingDuration + trailingDelayCursor * LETTER_DELAY_MS
        }

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
  }, [hovered, forceExpanded, totalLetters, hasOpened, closingIndex, computeCaretOffset, updateCaretOffset])

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
                ? 'opacity-100 blur-0'
                : 'opacity-0 blur-[3px]'
              const durationClass =
                !forceExpanded && index === closingIndex ? 'duration-300 ease-out' : 'duration-180 ease-in-out'
              const baseTranslate = isVisible ? 0 : -12
              const caretTranslate = !forceExpanded && index === closingIndex ? caretOffset : 0
              const letterStyle: CSSProperties = {
                transform: `translateX(${baseTranslate + caretTranslate}px)`,
              }
              if (!forceExpanded && index === closingIndex) {
                letterStyle.transitionDuration = `${caretTransitionMs}ms`
                letterStyle.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)'
              }

              return (
                <span
                  key={`${letter.char}-${index}`}
                  ref={(el) => {
                    lettersRef.current[index] = el
                  }}
                  className={`inline-block transform-gpu will-change-transform transition-[opacity,filter,transform] ${durationClass} ${colorClass} ${motionClass}`}
                  style={letterStyle}
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
