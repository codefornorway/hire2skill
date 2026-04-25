import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Personvern',
  description: 'SkillLink personvern — kort norsk oversikt med lenke til full personvernerklæring.',
}

export default function PersonvernNoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Personvern (kortversjon)</h1>
          <p className="text-sm text-gray-500">
            SkillLink behandler personopplysninger i tråd med GDPR / personopplysningsloven. Denne siden er et kort norsk sammendrag.
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4 text-sm">
          <p>
            Vi bruker data til å drive plattformen (konto, bookinger, meldinger), til å sende viktige e‑postvarsler, og til å ivareta sikkerhet.
            Du kan be om innsyn, retting og sletting i tråd med gjeldende regelverk.
          </p>
          <p>
            Full, juridisk detaljert personvernerklæring (engelsk) finner du her:{' '}
            <Link className="text-blue-600 font-semibold hover:underline" href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
