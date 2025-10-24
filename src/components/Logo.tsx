type Props = {
  className?: string
}

export default function Logo({ className }: Props) {
  return (
    <div className={className}>
      <div className="relative block w-full leading-none select-none group" aria-hidden="true">
        <span className="grid w-full text-[clamp(1.2rem,6.5vw,1.95rem)] font-extrabold tracking-wider md:text-[2.1rem] lg:text-[2.5rem]">
          <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap transition-opacity duration-200 ease-out group-hover:opacity-0 group-focus-visible:opacity-0">
            {'<'}
            <span className="text-[--color-brand-red]">M</span>
            {'>'}
          </span>
          <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
            {'<'}
            <span className="text-white">MacDonald</span>
            <span className="text-[--color-brand-red]">AI</span>
            {'>'}
          </span>
        </span>
        <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
      <span className="sr-only">MacDonald AI</span>
    </div>
  )
}
