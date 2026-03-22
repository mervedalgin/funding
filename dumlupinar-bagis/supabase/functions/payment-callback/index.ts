import { getCorsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin, validatePaymentSignature } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()

    // Validate callback signature from payment gateway
    const provider = body.provider || 'unknown'
    const signature = req.headers.get('x-signature')
      || req.headers.get('x-iy-hash')
      || body.hash || null

    const isValid = await validatePaymentSignature(provider, body, signature)
    if (!isValid) {
      console.error('Invalid payment callback signature', { provider, donation_id: body.donation_id })
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const { donation_id, status: paymentStatus } = body

    if (!donation_id || !paymentStatus) {
      return new Response(
        JSON.stringify({ error: 'donation_id and status are required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

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
      .eq('status', 'pending') // Only update if still pending (idempotency)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update donation' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // If confirmed, update collected_amount and donor_count atomically via RPC
    if (newStatus === 'confirmed') {
      const { data: donation } = await supabaseAdmin
        .from('donations')
        .select('item_id, amount')
        .eq('id', donation_id)
        .single()

      if (donation?.item_id) {
        const { error: rpcError } = await supabaseAdmin.rpc('increment_donation_stats', {
          p_item_id: donation.item_id,
          p_amount: donation.amount,
        })
        if (rpcError) {
          console.error('Failed to increment stats, rolling back', rpcError)
          // Rollback: revert donation status to pending
          await supabaseAdmin
            .from('donations')
            .update({ status: 'pending', confirmed_at: null })
            .eq('id', donation_id)

          return new Response(
            JSON.stringify({ error: 'Failed to update stats, donation reverted to pending' }),
            { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
