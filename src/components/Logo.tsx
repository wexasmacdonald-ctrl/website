type Props = {
  className?: string
  forceExpanded?: boolean
  textClassName?: string
  showUnderline?: boolean
}

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const collapsedClasses = [
    'col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transform-gpu transition-[opacity,transform,filter] duration-500 ease-in-out',
    forceExpanded
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100 translate-x-0 blur-0 group-hover:opacity-0 group-focus-visible:opacity-0 group-hover:translate-x-6 group-focus-visible:translate-x-6 group-hover:blur-[6px] group-focus-visible:blur-[6px]',
  ].join(' ')

  const expandedContainerClasses = [
    'col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transform-gpu transition-[opacity,transform,filter] duration-500 ease-in-out',
    forceExpanded
      ? 'opacity-100 translate-x-0 blur-0'
      : 'pointer-events-none opacity-0 -translate-x-6 blur-[6px] group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-x-0 group-focus-visible:translate-x-0 group-hover:blur-0 group-focus-visible:blur-0',
  ].join(' ')

  const underlineClasses = [
    'absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right transition-transform duration-300',
    forceExpanded ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
  ].join(' ')

  const baseTextClasses = [
    'grid w-full font-extrabold tracking-wider',
    textClassName ?? 'text-[clamp(1.2rem,6.5vw,1.95rem)] md:text-[2.1rem] lg:text-[2.5rem]',
  ].join(' ')

  const macLetters = Array.from('MACDONALD')
  const aiLetters = Array.from('AI')
  const delayStep = 70

  function renderAnimatedLetter(char: string, delayIndex: number, target: 'white' | 'red', key: string) {
    const displayChar = char === ' ' ? '\u00A0' : char
    const targetColorClass = target === 'red' ? 'text-[--color-brand-red]' : 'text-white'

    const classes = [
      'inline-block transform-gpu transition-[opacity,transform,filter,color] duration-500 ease-in-out',
      forceExpanded
        ? `opacity-100 translate-x-0 blur-0 ${targetColorClass}`
        : [
            'opacity-0 translate-x-6 blur-[6px] text-[--color-brand-red]',
            'group-hover:opacity-100 group-focus-visible:opacity-100',
            'group-hover:translate-x-0 group-focus-visible:translate-x-0',
            'group-hover:blur-0 group-focus-visible:blur-0',
            target === 'red'
              ? 'group-hover:text-[--color-brand-red] group-focus-visible:text-[--color-brand-red]'
              : 'group-hover:text-white group-focus-visible:text-white',
          ].join(' '),
    ].join(' ')

    const style = forceExpanded ? undefined : { transitionDelay: `${delayIndex * delayStep}ms` }

    return (
      <span key={key} className={classes} style={style}>
        {displayChar}
      </span>
    )
  }

  return (
    <div className={className}>
      <div className={`relative block w-full leading-none select-none ${forceExpanded ? '' : 'group'}`} aria-hidden="true">
        <span className={baseTextClasses}>
          <span className={collapsedClasses}>
            {'<'}
            <span className="text-[--color-brand-red]">M</span>
            {'>'}
          </span>
          <span className={expandedContainerClasses}>
            {renderAnimatedLetter('<', 0, 'white', 'open-angle')}
            {macLetters.map((letter, index) => renderAnimatedLetter(letter, index + 1, 'white', `mac-${letter}-${index}`))}
            {renderAnimatedLetter(' ', macLetters.length + 1, 'white', 'space')}
            {aiLetters.map((letter, index) =>
              renderAnimatedLetter(letter, macLetters.length + 2 + index, 'red', `ai-${letter}-${index}`),
            )}
            {renderAnimatedLetter('>', macLetters.length + aiLetters.length + 2, 'white', 'close-angle')}
          </span>
        </span>
        {showUnderline && <span className={underlineClasses} />}
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )
}
