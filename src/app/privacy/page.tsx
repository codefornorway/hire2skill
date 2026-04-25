export const metadata = {
  title: 'Privacy Policy',
  description: 'Hire2Skill Privacy Policy — how we collect, use, and protect your personal data under GDPR.',
}

const LAST_UPDATED = '1 April 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Who we are</h2>
            <p>
              Hire2Skill AS (&quot;Hire2Skill&quot;, &quot;we&quot;, &quot;our&quot;) is the controller of your personal data.
              We operate the Hire2Skill platform at hire2skill.com, which connects task posters with local helpers across Norway.
              We are based in Oslo, Norway and process personal data in accordance with the General Data Protection Regulation (GDPR)
              as implemented in Norwegian law through the Personal Data Act (<em>personopplysningsloven</em>).
            </p>
            <p className="mt-3">
              You can contact us at: <strong>privacy@hire2skill.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Data we collect</h2>
            <p>We collect personal data in the following categories:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li><strong>Account data:</strong> name, email address, password (hashed), profile photo, phone number</li>
              <li><strong>Profile data:</strong> bio, skills, service categories, location (city level), hourly rate</li>
              <li><strong>Booking data:</strong> task descriptions, booking history, messages exchanged through the platform</li>
              <li><strong>Verification data:</strong> identity document images submitted for helper verification (stored encrypted)</li>
              <li><strong>Usage data:</strong> IP address, device type, pages visited, session duration (via server logs)</li>
              <li><strong>Payment data:</strong> billing information processed by our payment provider — we do not store card details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Why we use your data</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">To provide and operate the platform (Contract)</p>
                <p className="text-gray-500 mt-1">Account management, task booking, messaging between users, payment processing.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">For safety and trust (Legitimate interest)</p>
                <p className="text-gray-500 mt-1">Identity verification, fraud prevention, review moderation, platform security.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">Legal compliance (Legal obligation)</p>
                <p className="text-gray-500 mt-1">Tax records, response to lawful requests from Norwegian authorities.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">Marketing communications (Consent)</p>
                <p className="text-gray-500 mt-1">Email newsletters and promotional messages — only if you opt in. Withdrawable at any time.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Who we share data with</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li><strong>Other platform users:</strong> your public profile (name, bio, photo, rating) is visible to other users. Your contact details are never shared without your consent.</li>
              <li><strong>Supabase (data storage):</strong> our database and authentication provider, operating in EU/EEA data centres.</li>
              <li><strong>Resend (email delivery):</strong> used to send transactional emails. Processes only recipient email addresses.</li>
              <li><strong>Payment processors:</strong> handle payment transactions under their own GDPR-compliant terms.</li>
              <li><strong>Norwegian authorities:</strong> when required by law (e.g. Datatilsynet, tax authority, court orders).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. How long we keep your data</h2>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li>Account data: retained while your account is active, plus 2 years after deletion for legal compliance</li>
              <li>Booking and message history: 5 years (Norwegian accounting requirements)</li>
              <li>Verification documents: deleted within 30 days of verification decision</li>
              <li>Server logs: 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Your rights (GDPR)</h2>
            <p>As a resident of the EEA, you have the right to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Rectify</strong> inaccurate data</li>
              <li><strong>Erase</strong> your data (&quot;right to be forgotten&quot;), subject to legal retention requirements</li>
              <li><strong>Restrict</strong> processing in certain circumstances</li>
              <li><strong>Object</strong> to processing based on legitimate interests</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Withdraw consent</strong> at any time for consent-based processing</li>
              <li><strong>Lodge a complaint</strong> with Datatilsynet (datatilsynet.no) if you believe we have breached GDPR</li>
            </ul>
            <p className="mt-3 text-sm">To exercise any of these rights, email <strong>privacy@hire2skill.com</strong>. We respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              We use cookies for authentication, session management, and usage analytics.
              See our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a> for full details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify registered users by email of any material changes
              at least 30 days before they take effect. Continued use of the platform after changes take effect constitutes acceptance.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
