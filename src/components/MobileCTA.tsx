import { Link } from 'react-router-dom'

export default function MobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 px-4 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md mb-3 rounded-xl bg-white/5 backdrop-blur border border-white/10 shadow-lg">
        <div className="p-3 flex items-center gap-2">
          <Link to="/call" className="flex-1 text-center rounded-md bg-[--color-brand-red] text-black font-semibold py-2">Call</Link>
          <Link to="/quote" className="flex-1 text-center rounded-md border border-white/10 py-2 text-white">Quote</Link>
        </div>
      </div>
    </div>
  )
}
