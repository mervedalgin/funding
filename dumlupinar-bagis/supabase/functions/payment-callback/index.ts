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
    const body = await req.json()

    // TODO: Validate callback signature from payment gateway
    // For iyzico: verify the hash using your secret key
    // For PayTR: verify the merchant_oid and hash match

    const { donation_id, status: paymentStatus } = body

    if (!donation_id || !paymentStatus) {
      return new Response(
        JSON.stringify({ error: 'donation_id and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const newStatus = paymentStatus === 'success' ? 'confirmed' : 'rejected'

    // Update donation status
    const updateData: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from('donations')
      .update(updateData)
      .eq('id', donation_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update donation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If confirmed, update collected_amount and donor_count on the item
    if (newStatus === 'confirmed') {
      const { data: donation } = await supabaseAdmin
        .from('donations')
        .select('item_id, amount')
        .eq('id', donation_id)
        .single()

      if (donation?.item_id) {
        await supabaseAdmin.rpc('increment_donation_stats', {
          p_item_id: donation.item_id,
          p_amount: donation.amount,
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
