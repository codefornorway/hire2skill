export type TelemetryLevel = 'info' | 'warn' | 'error'

export function logServerEvent(scope: string, level: TelemetryLevel, message: string, meta?: Record<string, unknown>) {
  const payload = { scope, level, message, ...meta }
  if (level === 'error') {
    console.error('[telemetry]', payload)
    return
  }
  if (level === 'warn') {
    console.warn('[telemetry]', payload)
    return
  }
  console.info('[telemetry]', payload)
}

export function logClientEvent(scope: string, level: TelemetryLevel, message: string, meta?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const payload = { scope, level, message, ...meta }
  if (level === 'error') {
    console.error('[telemetry]', payload)
    return
  }
  if (level === 'warn') {
    console.warn('[telemetry]', payload)
    return
  }
  console.info('[telemetry]', payload)
}

