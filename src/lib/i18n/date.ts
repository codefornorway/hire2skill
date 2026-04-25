type AppLocale = 'no' | 'en' | 'da' | 'sv'

function toIntlLocale(locale: AppLocale): string {
  if (locale === 'no') return 'nb-NO'
  if (locale === 'da') return 'da-DK'
  if (locale === 'sv') return 'sv-SE'
  return 'en-GB'
}

export function formatDateByLocale(
  dateLike: string | Date,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Date(dateLike).toLocaleDateString(toIntlLocale(locale), options)
}

export function formatTimeByLocale(
  dateLike: string | Date,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Date(dateLike).toLocaleTimeString(toIntlLocale(locale), options)
}

