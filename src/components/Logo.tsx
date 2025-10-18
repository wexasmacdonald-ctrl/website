type Props = {
  className?: string
}

export default function Logo({ className }: Props) {
  return (
    <div className={className}>
      <div className="relative inline-block leading-none select-none group">
        <span className="whitespace-nowrap text-sm font-extrabold tracking-wider sm:text-base md:text-xl lg:text-2xl">{'<'}MACDONALD <span className="text-[--color-brand-red]">AI</span>{'>'}</span>
        <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[--color-brand-red] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </div>
  )
}
