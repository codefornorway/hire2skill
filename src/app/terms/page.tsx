export const metadata = {
  title: 'Terms of Service',
  description: 'Hire2Skill Terms of Service — the rules and conditions for using the Hire2Skill platform.',
}

const LAST_UPDATED = '1 April 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. About these terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of the Hire2Skill platform operated by Hire2Skill AS,
              a company registered in Norway. By creating an account or using Hire2Skill, you agree to these Terms.
              If you do not agree, do not use the platform.
            </p>
            <p className="mt-3">
              These Terms are governed by Norwegian law. Any disputes will be subject to the exclusive jurisdiction of the Oslo District Court.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. The Hire2Skill platform</h2>
            <p>
              Hire2Skill is an online marketplace that connects individuals seeking help with tasks (&quot;Posters&quot;)
              with individuals offering their skills and services (&quot;Helpers&quot;). Hire2Skill is a platform only —
              we do not employ Helpers and are not a party to the service contract formed between a Poster and a Helper.
            </p>
            <p className="mt-3">
              Helpers are independent contractors, not employees of Hire2Skill. Hire2Skill does not guarantee the quality,
              safety, or legality of tasks posted or services offered.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Account registration</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You must provide accurate, current, and complete information during registration.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You may not create accounts for others or use another person&apos;s account without permission.</li>
              <li>One person may not hold multiple active accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Posting tasks and bookings</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Task posts must be accurate, lawful, and not misleading.</li>
              <li>You may not post tasks that are illegal, discriminatory, or that require a licensed professional where one is legally required (e.g. gas fitting, certain electrical work).</li>
              <li>When a Helper accepts your booking, a contract is formed directly between you and the Helper. Hire2Skill is not a party to this contract.</li>
              <li>Payments made through Hire2Skill are held in escrow and released to the Helper once the task is marked complete.</li>
              <li>Cancellations are subject to the cancellation policy displayed at the time of booking.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Helper responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Helpers must ensure they have the necessary skills, qualifications, and (where required by law) licences to perform tasks they accept.</li>
              <li>Helpers are responsible for declaring income earned through Hire2Skill to the Norwegian tax authority (Skatteetaten) in accordance with applicable law.</li>
              <li>Helpers must not misrepresent their skills, qualifications, or experience.</li>
              <li>Helpers must treat Posters with respect and perform tasks as agreed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Prohibited conduct</h2>
            <p>You may not use Hire2Skill to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
              <li>Post false, fraudulent, or misleading content</li>
              <li>Harass, threaten, or intimidate any user</li>
              <li>Circumvent the platform&apos;s payment system by arranging off-platform transactions with users you first met on Hire2Skill</li>
              <li>Collect or store other users&apos; personal data without their consent</li>
              <li>Use automated tools to scrape, copy, or misuse platform content</li>
              <li>Violate any applicable Norwegian or EU law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Reviews and ratings</h2>
            <p>
              Reviews may only be submitted by users who have completed a booking. Reviews must be honest and based on genuine experience.
              Hire2Skill may remove reviews that violate these Terms or that appear to be fraudulent.
              We do not modify the content of genuine reviews.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by Norwegian law, Hire2Skill&apos;s total liability for any claim arising
              from use of the platform is limited to the fees paid by you to Hire2Skill in the 12 months preceding the claim.
              Hire2Skill is not liable for any indirect, incidental, or consequential damages.
            </p>
            <p className="mt-3">
              Hire2Skill does not guarantee that the platform will be available at all times or free from errors.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Intellectual property</h2>
            <p>
              All content, trademarks, logos, and software on the Hire2Skill platform are the property of Hire2Skill AS
              or its licensors. You may not copy, reproduce, or distribute any part of the platform without our prior
              written consent.
            </p>
            <p className="mt-3">
              By posting content (task descriptions, profile information, reviews) on Hire2Skill, you grant us a
              non-exclusive, royalty-free licence to display and use that content for operating and promoting the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Account termination</h2>
            <p>
              You may close your account at any time via Settings &gt; Delete Account.
              We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity,
              or if required by law. We will provide notice where reasonably possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you by email at least 30 days before material changes take effect.
              Continued use of the platform after the effective date constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Contact</h2>
            <p>
              Questions about these Terms? Email us at <strong>legal@hire2skill.com</strong> or use the{' '}
              <a href="/contact" className="text-blue-600 hover:underline">Contact page</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
