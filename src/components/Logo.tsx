type Props = {
  className?: string
  forceExpanded?: boolean
  textClassName?: string
  showUnderline?: boolean
}

export default function Logo({ className, forceExpanded = false, textClassName, showUnderline = true }: Props) {
  const collapsedClasses = [
    'col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transition-opacity duration-200 ease-out',
    forceExpanded ? 'opacity-0' : 'opacity-100 group-hover:opacity-0 group-focus-visible:opacity-0',
  ].join(' ')

  const expandedClasses = [
    'col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transition-opacity duration-200 ease-out',
    forceExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
  ].join(' ')

  const underlineClasses = [
    'absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right transition-transform duration-300',
    forceExpanded ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
  ].join(' ')

  const baseTextClasses = [
    'grid w-full font-extrabold tracking-wider',
    textClassName ?? 'text-[clamp(1.2rem,6.5vw,1.95rem)] md:text-[2.1rem] lg:text-[2.5rem]',
  ].join(' ')

  return (
    <div className={className}>
      <div className={`relative block w-full leading-none select-none ${forceExpanded ? '' : 'group'}`} aria-hidden="true">
        <span className={baseTextClasses}>
          <span className={collapsedClasses}>
            {'<'}
            <span className="text-[--color-brand-red]">M</span>
            {'>'}
          </span>
          <span className={expandedClasses}>
            {'<'}
            <span className="text-white">MacDonald</span>
            <span className="text-[--color-brand-red]">AI</span>
            {'>'}
          </span>
        </span>
        {showUnderline && <span className={underlineClasses} />}
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )
}
