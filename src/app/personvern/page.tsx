import Link from 'next/link'

export const metadata = {
  title: 'Personvern',
  description: 'Hire2Skill personvern — kort norsk oversikt med lenke til full personvernerklæring.',
}

export default function PersonvernNoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Personvern</h1>
          <p className="text-sm text-gray-500">
            Hire2Skill behandler personopplysninger i tråd med GDPR / personopplysningsloven.
          </p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4 text-sm">
          <h2 className="text-base font-bold text-gray-900">Hva vi samler inn</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kontoopplysninger (navn, e-post, profilbilde, telefon).</li>
            <li>Oppdrags- og meldingsdata når du bruker plattformen.</li>
            <li>Tekniske data som IP-adresse og enhetsinformasjon for sikkerhet.</li>
          </ul>

          <h2 className="text-base font-bold text-gray-900">Hva data brukes til</h2>
          <p>
            Vi bruker data til å drive plattformen (konto, bookinger, meldinger), til å sende viktige e‑postvarsler, og til å ivareta sikkerhet.
            Du kan be om innsyn, retting og sletting i tråd med gjeldende regelverk.
          </p>

          <h2 className="text-base font-bold text-gray-900">Deling og lagring</h2>
          <p>
            Vi selger ikke personopplysninger. Data deles kun med nødvendige databehandlere (for eksempel database og e‑postleverandør) for å levere tjenesten.
            Data lagres så lenge vi har et saklig behov eller plikt etter lov.
          </p>

          <h2 className="text-base font-bold text-gray-900">Dine rettigheter</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Rett til innsyn i hvilke data vi har lagret.</li>
            <li>Rett til retting og sletting.</li>
            <li>Rett til begrensning eller protest i visse tilfeller.</li>
          </ul>

          <p>Kontakt: <strong>privacy@hire2skill.com</strong></p>
          <p>
            Full, juridisk detaljert personvernerklæring (engelsk) finner du her:{' '}
            <Link className="text-blue-600 font-semibold hover:underline" href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
