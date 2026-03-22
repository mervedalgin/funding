import { getCorsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/auth.ts'

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
    const { item_id, item_type, amount, donor_name, donor_email, donor_phone, provider } = await req.json()

    // Validate required fields
    if (!item_id || !amount || !provider) {
      return new Response(
        JSON.stringify({ error: 'item_id, amount, and provider are required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Validate amount range
    if (typeof amount !== 'number' || amount <= 0 || amount > 999999) {
      return new Response(
        JSON.stringify({ error: 'Amount must be between 0.01 and 999,999' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Validate provider
    if (!['iyzico', 'paytr'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Provider must be iyzico or paytr' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format if provided
    if (donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor_email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Determine which table to use based on item_type
    const tableName = item_type === 'student_need' ? 'student_donations' : 'donations'
    const fkField = item_type === 'student_need' ? 'student_need_id' : 'item_id'

    // Create donation record with pending status
    const { data: donation, error: donationError } = await supabaseAdmin
      .from(tableName)
      .insert({
        [fkField]: item_id,
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
      console.error('Failed to create donation record', donationError)
      return new Response(
        JSON.stringify({ error: 'Failed to create donation record' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // --- Payment gateway integration ---
    // TODO: Replace with actual API calls when gateway credentials are ready
    //
    // For iyzico:
    //   const iyzicoApiKey = Deno.env.get('IYZICO_API_KEY')
    //   const iyzicoSecretKey = Deno.env.get('IYZICO_SECRET_KEY')
    //   POST https://api.iyzipay.com/payment/iyzipos/initialize3ds/ecom
    //
    // For PayTR:
    //   const paytrMerchantId = Deno.env.get('PAYTR_MERCHANT_ID')
    //   const paytrMerchantKey = Deno.env.get('PAYTR_MERCHANT_KEY')
    //   POST https://www.paytr.com/odeme/api/get-token
    //
    // Until gateway is configured, return error in production
    const isDevMode = Deno.env.get('ENVIRONMENT') === 'development'

    if (!isDevMode) {
      // In production, check if gateway credentials exist
      const hasGateway = provider === 'iyzico'
        ? !!Deno.env.get('IYZICO_API_KEY')
        : !!Deno.env.get('PAYTR_MERCHANT_ID')

      if (!hasGateway) {
        // Clean up the pending donation
        await supabaseAdmin.from(tableName).delete().eq('id', donation.id)
        return new Response(
          JSON.stringify({ error: 'Online payment is not configured yet' }),
          { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Dev mode: return mock URL (only accessible in development)
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173'
    const checkoutUrl = `${baseUrl}/odeme-sonucu?token=${donation.id}&status=success`

    return new Response(
      JSON.stringify({
        checkout_url: checkoutUrl,
        payment_token: donation.id,
        donation_id: donation.id,
      }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
