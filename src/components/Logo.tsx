type Props = {
  className?: string
  forceExpanded?: boolean
  textClassName?: string
  showUnderline?: boolean
}

const letters = [
  { char: '<', finalColor: 'white' as const },
  ...'MACDONALD'.split('').map((char) => ({ char, finalColor: 'white' as const })),
  { char: ' ', finalColor: 'white' as const },
  ...'AI'.split('').map((char) => ({ char, finalColor: 'red' as const })),
  { char: '>', finalColor: 'white' as const },
]

const LETTER_DELAY_MS = 55

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const sizeClasses =
    textClassName ??
    'text-[clamp(1rem,4.5vw,1.6rem)] sm:text-[clamp(1.15rem,4vw,1.85rem)] md:text-[2rem] lg:text-[2.45rem]'

  const baseTextClasses = `grid w-fit font-extrabold leading-none tracking-[0.025em] ${sizeClasses}`

  const collapsedClasses = [
    'col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transform-gpu transition-all duration-250 ease-in-out',
    forceExpanded
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100 translate-x-0 group-hover:opacity-0 group-focus-visible:opacity-0 group-hover:translate-x-4 group-focus-visible:translate-x-4',
  ].join(' ')

  function renderLetter(char: string, index: number, finalColor: 'white' | 'red') {
    if (forceExpanded) {
      return (
        <span
          key={`${char}-${index}`}
          className={`inline-block transform-gpu ${
            finalColor === 'red' ? 'text-[--color-brand-red]' : 'text-white'
          }`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      )
    }

    const appearDelay = index * LETTER_DELAY_MS
    const colorDelay = finalColor === 'red' ? appearDelay : appearDelay + 140

    const transitions = [
      `opacity 220ms ease ${appearDelay}ms`,
      `transform 220ms ease ${appearDelay}ms`,
      `filter 220ms ease ${appearDelay}ms`,
      `color 160ms ease ${colorDelay}ms`,
    ].join(', ')

    const baseClasses = [
      'inline-block transform-gpu text-[--color-brand-red] opacity-0 translate-x-3 blur-[3px]',
      'group-hover:opacity-100 group-focus-visible:opacity-100',
      'group-hover:translate-x-0 group-focus-visible:translate-x-0',
      'group-hover:blur-0 group-focus-visible:blur-0',
      finalColor === 'white' ? 'group-hover:text-white group-focus-visible:text-white' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <span key={`${char}-${index}`} className={baseClasses} style={{ transition: transitions }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    )
  }

  const underlineClasses = [
    'absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right transition-transform duration-300',
    forceExpanded ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
  ].join(' ')

  return (
    <div className={className}>
      <div
        className={`relative block w-full select-none ${forceExpanded ? '' : 'group'}`}
        aria-hidden="true"
      >
        <span className={baseTextClasses}>
          {!forceExpanded && (
            <span className={collapsedClasses}>
              {'<'}
              <span className="text-[--color-brand-red]">M</span>
              {'>'}
            </span>
          )}
          <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap">
            {letters.map((letter, index) => renderLetter(letter.char, index, letter.finalColor))}
          </span>
        </span>
        {showUnderline && <span className={underlineClasses} />}
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )
}
