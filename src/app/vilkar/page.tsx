import Link from 'next/link'

export const metadata = {
  title: 'Vilkår',
  description: 'Hire2Skill vilkår — kort norsk oversikt med lenke til full terms of service.',
}

export default function VilkarNoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Vilkår</h1>
          <p className="text-sm text-gray-500">
            Ved å bruke Hire2Skill godtar du plattformens regler for oppførsel, betaling/oppgjør mellom parter, innhold i meldinger, og at vi kan oppdatere vilkår med varsel der loven krever det.
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4 text-sm">
          <h2 className="text-base font-bold text-gray-900">Plattformrolle</h2>
          <p>
            Hire2Skill er en markedsplass som kobler oppdragsgivere og hjelpere. Du er ansvarlig for å avtale omfang, pris (NOK), tilgang og sikkerhet på stedet — og for å følge norsk lov.
          </p>

          <h2 className="text-base font-bold text-gray-900">Brukeransvar</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gi korrekt informasjon i profil og kommunikasjon.</li>
            <li>Ikke del ulovlig, diskriminerende eller skadelig innhold.</li>
            <li>Følg avtaler om tid, pris og omfang i god tro.</li>
          </ul>

          <h2 className="text-base font-bold text-gray-900">Betaling og tvister</h2>
          <p>
            Pris avtales mellom partene. For næringsdrivende kan MVA/faktura gjelde. Ved uenighet bør partene forsøke å løse saken i chat først; alvorlige brudd kan føre til suspensjon.
          </p>

          <h2 className="text-base font-bold text-gray-900">Endringer</h2>
          <p>
            Vi kan oppdatere vilkårene ved behov. Vesentlige endringer varsles i app eller e‑post.
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
