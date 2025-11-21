import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | null = null

export function getDatabase() {
  if (supabase) {
    return supabase
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  return supabase
}

// Helper para executar queries SQL diretas (útil para migrations)
export async function executeSQL(query: string) {
  const client = getDatabase()
  // Para executar SQL direto, você pode usar o service role key em um endpoint server-side
  // ou usar RPC functions no Supabase
  const { data, error } = await client.rpc('exec_sql', { query })
  if (error) {
    throw error
  }
  return data
}

// Helper para fechar a conexão (não necessário com Supabase, mas mantido para compatibilidade)
export function closeDatabase() {
  // Supabase gerencia conexões automaticamente
  supabase = null
}
