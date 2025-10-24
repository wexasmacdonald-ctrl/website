import { useEffect, useMemo, useState, type CSSProperties, type HTMLAttributes } from 'react'

type Props = {
  className?: string
  forceExpanded?: boolean
  textClassName?: string
  showUnderline?: boolean
}

type LetterEntry = {
  char: string
  finalColor: 'white' | 'red'
  key: string
}

type LetterStyle = CSSProperties & {
  '--logo-final-color'?: string
}

const LETTER_DELAY_MS = 65

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const [activeState, setActiveState] = useState(forceExpanded)
  const [hasInteracted, setHasInteracted] = useState(forceExpanded)

  useEffect(() => {
    if (forceExpanded) {
      setActiveState(true)
      setHasInteracted(true)
    }
  }, [forceExpanded])

  const letters = useMemo<LetterEntry[]>(() => {
    const base: LetterEntry[] = [{ char: '<', finalColor: 'white', key: 'open-angle' }]
    'MACDONALD'.split('').forEach((char, index) => {
      base.push({ char, finalColor: 'white', key: `mac-${index}` })
    })
    base.push({ char: ' ', finalColor: 'white', key: 'space' })
    'AI'.split('').forEach((char, index) => {
      base.push({ char, finalColor: 'red', key: `ai-${index}` })
    })
    base.push({ char: '>', finalColor: 'white', key: 'close-angle' })
    return base
  }, [])

  const totalLetters = letters.length
  const isActive = forceExpanded || activeState
  const baseReturnDelay = totalLetters * LETTER_DELAY_MS + 160

  function handleActivate() {
    if (forceExpanded) return
    setHasInteracted(true)
    setActiveState(true)
  }

  function handleDeactivate() {
    if (forceExpanded) return
    setActiveState(false)
  }

  function getLetterStyle(entry: LetterEntry, index: number): LetterStyle {
    const finalColor = entry.finalColor === 'red' ? 'var(--color-brand-red)' : '#ffffff'

    if (forceExpanded) {
      return {
        color: finalColor,
      }
    }

    if (!hasInteracted && !isActive) {
      return {
        color: 'var(--color-brand-red)',
        opacity: 0,
        transform: 'translateX(-0.5rem)',
      }
    }

    const delay = (isActive ? index + 1 : totalLetters - index) * LETTER_DELAY_MS

    const style: LetterStyle = {
      '--logo-final-color': finalColor,
      animation: `${isActive ? 'logo-letter-in' : 'logo-letter-out'} 0.42s ease-in-out forwards`,
      animationDelay: `${delay}ms`,
    }

    return style
  }

  const collapsedStyle: CSSProperties | undefined = forceExpanded
    ? { display: 'none' }
    : {
        animation: `${isActive ? 'logo-mark-out' : 'logo-mark-in'} 0.34s ease-in-out forwards`,
        animationDelay: isActive ? '0ms' : `${baseReturnDelay}ms`,
      }

  const baseTextClasses = [
    'grid w-fit font-extrabold leading-none tracking-[0.02em]',
    'text-[clamp(1rem,4.6vw,1.6rem)] sm:text-[clamp(1.15rem,4.2vw,1.9rem)] md:text-[2.1rem] lg:text-[2.5rem]',
    textClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const interactiveHandlers: Partial<HTMLAttributes<HTMLDivElement>> = forceExpanded
    ? {}
    : {
        onMouseEnter: handleActivate,
        onMouseLeave: handleDeactivate,
        onFocusCapture: handleActivate,
        onBlurCapture: handleDeactivate,
      }

  return (
    <div className={className}>
      <div className="relative block w-full select-none" aria-hidden="true" {...interactiveHandlers}>
        <span className={baseTextClasses}>
          {!forceExpanded && (
            <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap" style={collapsedStyle}>
              {'<'}
              <span className="text-[--color-brand-red]">M</span>
              {'>'}
            </span>
          )}
          <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap">
            {letters.map((entry, index) => (
              <span
                key={entry.key}
                className="relative inline-block will-change-transform"
                style={getLetterStyle(entry, index)}
              >
                {entry.char === ' ' ? '\u00A0' : entry.char}
              </span>
            ))}
          </span>
        </span>
        {showUnderline && (
          <span
            className={[
              'absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right transition-transform duration-300',
              isActive ? 'scale-x-100' : 'scale-x-0',
            ].join(' ')}
          />
        )}
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )
}
