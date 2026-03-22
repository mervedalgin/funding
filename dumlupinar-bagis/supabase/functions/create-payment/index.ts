import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
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
    const { item_id, amount, donor_name, donor_email, donor_phone, provider } = await req.json()

    if (!item_id || !amount || !provider) {
      return new Response(
        JSON.stringify({ error: 'item_id, amount, and provider are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create donation record with pending status
    const { data: donation, error: donationError } = await supabaseAdmin
      .from('donations')
      .insert({
        item_id,
        amount,
        donor_name: donor_name || null,
        donor_email: donor_email || null,
        donor_phone: donor_phone || null,
        payment_method: `online_${provider}`,
        status: 'pending',
      })
      .select()
      .single()

    if (donationError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create donation record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: In production, call the actual payment gateway API here
    // For iyzico: POST to https://api.iyzipay.com/payment/iyzipos/initialize3ds/ecom
    // For PayTR: POST to https://www.paytr.com/odeme/api/get-token
    //
    // For now, return a mock checkout URL for development
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173'
    const mockCheckoutUrl = `${baseUrl}/odeme-sonucu?token=${donation.id}&status=success`

    return new Response(
      JSON.stringify({
        checkout_url: mockCheckoutUrl,
        payment_token: donation.id,
        donation_id: donation.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
