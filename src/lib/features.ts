function readFlag(name: string, fallback: boolean): boolean {
  const raw = process.env[name]
  if (raw == null) return fallback
  const normalized = raw.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

export const FEATURES = {
  enableDemoData: readFlag('NEXT_PUBLIC_ENABLE_DEMO_DATA', process.env.NODE_ENV !== 'production'),
  enableSms2fa: readFlag('NEXT_PUBLIC_ENABLE_SMS_2FA', false),
  enableBankId: readFlag('NEXT_PUBLIC_ENABLE_BANKID', false),
  enablePayments: readFlag('NEXT_PUBLIC_ENABLE_PAYMENTS', false),
} as const

