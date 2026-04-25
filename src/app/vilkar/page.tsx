import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vilkår',
  description: 'SkillLink vilkår — kort norsk oversikt med lenke til full terms of service.',
}

export default function VilkarNoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Vilkår (kortversjon)</h1>
          <p className="text-sm text-gray-500">
            Ved å bruke SkillLink godtar du plattformens regler for oppførsel, betaling/oppgjør mellom parter, innhold i meldinger, og at vi kan oppdatere vilkår med varsel der loven krever det.
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4 text-sm">
          <p>
            SkillLink er en markedsplass som kobler oppdragsgivere og hjelpere. Du er ansvarlig for å avtale omfang, pris (NOK), tilgang og sikkerhet på stedet — og for å følge norsk lov.
          </p>
          <p>
            Full terms of service (engelsk) finner du her:{' '}
            <Link className="text-blue-600 font-semibold hover:underline" href="/terms">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
