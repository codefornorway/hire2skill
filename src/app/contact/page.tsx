import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Hire2Skill team. We\'re here to help with any questions about bookings, accounts, or your experience on the platform.',
}

const FAQ = [
  { q: 'How do I cancel a booking?', a: 'Go to your Dashboard, find the booking, and click Cancel. Cancellation policies are set per-helper — check before booking.' },
  { q: 'How do I report a problem with a helper?', a: 'Use the Contact form and select "Report a problem". Our trust & safety team responds within 24 hours.' },
  { q: 'How do I reset my password?', a: 'On the login page, click "Forgot password" and we\'ll send a reset link to your email.' },
  { q: 'When do I get paid as a helper?', a: 'Payments are released within 48 hours of a task being marked complete. Check your Account Balance in Settings.' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Get in touch</h1>
          <p className="text-gray-500 text-lg max-w-xl">
            We usually reply within a few hours on business days. For urgent help, include your booking ID.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 grid lg:grid-cols-2 gap-10">

        {/* Contact form */}
        <ContactForm />

        {/* Info panel */}
        <div className="space-y-8">

          {/* Contact details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Other ways to reach us</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email</p>
                  <p className="text-sm text-gray-500">support@hire2skill.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Response time</p>
                  <p className="text-sm text-gray-500">Mon–Fri, usually within 4 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Registered address</p>
                  <p className="text-sm text-gray-500">Hire2Skill AS, Oslo, Norway</p>
                </div>
              </div>
            </div>
          </div>

          {/* Common questions */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Common questions</h2>
            <div className="space-y-3">
              {FAQ.map(f => (
                <div key={f.q} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{f.q}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
