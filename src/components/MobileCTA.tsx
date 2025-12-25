import { useLanguage } from '../lib/i18n'

type Props = {
  hideWhenNearBottom: boolean
}

export default function MobileCTA({ hideWhenNearBottom }: Props) {
  const { t } = useLanguage()
  if (hideWhenNearBottom) {
    return <div className="md:hidden" aria-hidden="true" />
  }

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 md:hidden">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('open-assistant-chat'))}
        className="pointer-events-auto rounded-full bg-[--color-brand-red] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black shadow-lg shadow-black/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-brand-red]/80 hover:scale-105 active:scale-95 sm:text-sm"
      >
        {t('cta.aiChatbot')}
      </button>
    </div>
  )
}
