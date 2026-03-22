import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 5

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown'

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check recent attempts for this IP
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('attempted_at', windowStart)

    if (count !== null && count >= MAX_ATTEMPTS) {
      // Calculate retry_after
      const { data: oldestInWindow } = await supabaseAdmin
        .from('login_attempts')
        .select('attempted_at')
        .eq('ip_address', ip)
        .gte('attempted_at', windowStart)
        .order('attempted_at', { ascending: true })
        .limit(1)
        .single()

      const retryAfter = oldestInWindow
        ? Math.ceil((new Date(oldestInWindow.attempted_at).getTime() + WINDOW_MINUTES * 60 * 1000 - Date.now()) / 1000)
        : WINDOW_MINUTES * 60

      return new Response(
        JSON.stringify({
          error: 'Too many login attempts',
          retry_after: Math.max(retryAfter, 1),
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Attempt login
    const { data, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Record failed attempt
      await supabaseAdmin.from('login_attempts').insert({
        ip_address: ip,
        email,
      })

      const remainingAttempts = MAX_ATTEMPTS - ((count ?? 0) + 1)

      return new Response(
        JSON.stringify({
          error: authError.message,
          remaining_attempts: Math.max(remainingAttempts, 0),
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Success — clean up old attempts for this IP
    await supabaseAdmin
      .from('login_attempts')
      .delete()
      .eq('ip_address', ip)

    // Cleanup old records periodically (1% chance per request)
    if (Math.random() < 0.01) {
      await supabaseAdmin.rpc('cleanup_old_login_attempts')
    }

    return new Response(
      JSON.stringify({
        session: data.session,
        user: data.user,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
