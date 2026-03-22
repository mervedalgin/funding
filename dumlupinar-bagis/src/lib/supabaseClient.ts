import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase yapilandirmasi eksik: VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ortam degiskenleri .env.local dosyasinda tanimlanmalidir.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
