type Props = {
  className?: string
}

export default function Logo({ className }: Props) {
  return (
    <div className={className}>
      <div className="relative block w-full leading-none select-none group">
        <span className="block w-full whitespace-nowrap text-[clamp(1.2rem,6.5vw,1.95rem)] font-extrabold tracking-wider md:text-[2.1rem] lg:text-[2.5rem]">
          {'<'}MACDONALD <span className="text-[--color-brand-red]">AI</span>{'>'}
        </span>
        <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </div>
  )
}
