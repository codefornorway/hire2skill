import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { error } = await supabase.from('_test_connection').select('*').limit(1)

  // 42P01 = table doesn't exist but DB is reachable = connected
  const knownMissingTable = ['42P01', 'PGRST116', 'PGRST205'].includes(error?.code ?? '')
  const connected = !error || knownMissingTable
  const errorMsg = error && !knownMissingTable
    ? `${error.code}: ${error.message}`
    : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="rounded-2xl bg-white dark:bg-zinc-800 p-10 shadow-lg text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">SkillLink</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Connecting people with local opportunities</p>
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
          connected
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          {connected ? 'Supabase connected' : 'Supabase not connected'}
        </div>
        {errorMsg && (
          <p className="mt-4 text-xs text-red-400 font-mono break-all">{errorMsg}</p>
        )}
        {!connected && !errorMsg && (
          <p className="mt-4 text-xs text-zinc-400">Check your .env.local credentials</p>
        )}
      </div>
    </div>
  )
}
