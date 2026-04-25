export const metadata = {
  title: 'Cookie Policy',
  description: 'Hire2Skill Cookie Policy — what cookies we use, why, and how to control them.',
}

const LAST_UPDATED = '1 April 2026'

const COOKIES = [
  {
    name: 'sb-auth-token',
    type: 'Essential',
    provider: 'Supabase',
    purpose: 'Keeps you logged in between page loads. Required for the platform to function.',
    duration: 'Session / 1 week (if \'Remember me\' selected)',
  },
  {
    name: 'sb-refresh-token',
    type: 'Essential',
    provider: 'Supabase',
    purpose: 'Refreshes your session automatically without requiring you to log in again.',
    duration: '1 week',
  },
  {
    name: '__skilllink_lang',
    type: 'Functional',
    provider: 'Hire2Skill',
    purpose: 'Remembers your language preference (Norwegian / English).',
    duration: '1 year',
  },
  {
    name: '_vercel_*',
    type: 'Performance',
    provider: 'Vercel',
    purpose: 'Infrastructure cookies used by our hosting provider to route requests efficiently.',
    duration: 'Session',
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device by your browser when you visit a website.
              They allow us to recognise your device on return visits and provide features like staying logged in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How we use cookies</h2>
            <p>Hire2Skill uses cookies in the following categories:</p>
            <div className="mt-4 space-y-3">
              {[
                { type: 'Essential', color: '#16A34A', bg: '#F0FDF4', desc: 'Required for the platform to work. Cannot be disabled.' },
                { type: 'Functional', color: '#2563EB', bg: '#EFF6FF', desc: 'Remember your preferences (language, settings). Can be disabled, but may affect your experience.' },
                { type: 'Performance', color: '#7C3AED', bg: '#F5F3FF', desc: 'Help us understand how the platform is used so we can improve it. Analytics are anonymised.' },
                { type: 'Marketing', color: '#D97706', bg: '#FFFBEB', desc: 'Used to show relevant ads on other platforms. We currently do not use marketing cookies.' },
              ].map(c => (
                <div key={c.type} className="flex gap-3 p-4 rounded-xl border"
                  style={{ borderColor: c.color + '30', background: c.bg }}>
                  <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-full text-white h-fit"
                    style={{ background: c.color }}>{c.type}</span>
                  <p className="text-sm text-gray-600">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cookies we set</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Cookie</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200 hidden sm:table-cell">Purpose</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-200 hidden sm:table-cell">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c, i) => (
                    <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 align-top">{c.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 align-top">{c.type}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 align-top hidden sm:table-cell">{c.purpose}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 align-top hidden sm:table-cell whitespace-nowrap">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Managing cookies</h2>
            <p>You can control cookies through your browser settings:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
            <p className="mt-4">
              Note: disabling essential cookies will prevent you from logging in to Hire2Skill.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Third-party cookies</h2>
            <p>
              We do not allow third-party advertising cookies on Hire2Skill. Our infrastructure providers (Supabase, Vercel)
              may set cookies as part of service delivery. These providers are GDPR-compliant and operate within the EEA.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Legal basis</h2>
            <p>
              We use essential cookies based on our <strong>legitimate interest</strong> in providing a functioning service.
              Functional cookies are used on the basis of your <strong>consent</strong>, which you can withdraw at any time
              by clearing cookies in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p>
              Questions about our use of cookies? Email <strong>privacy@hire2skill.com</strong> or see our full{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
