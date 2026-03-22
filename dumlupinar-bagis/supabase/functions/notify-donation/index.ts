import { corsHeaders } from '../_shared/cors.ts'

const ADMIN_EMAIL = 'bozkurt@dumlupinar.edu.tr'

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
    const { record } = await req.json()

    if (!record) {
      return new Response(
        JSON.stringify({ error: 'No record provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set, skipping email notification')
      return new Response(
        JSON.stringify({ warning: 'Email notifications not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const donorName = record.donor_name || 'Anonim'
    const amount = record.amount
    const paymentRef = record.payment_ref || '-'
    const createdAt = new Date(record.created_at).toLocaleString('tr-TR')

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0d9488;">Yeni Bağış Bildirimi</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Bağışçı:</td><td style="padding: 8px 0; font-weight: bold;">${donorName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tutar:</td><td style="padding: 8px 0; font-weight: bold;">₺${amount.toLocaleString('tr-TR')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Referans:</td><td style="padding: 8px 0; font-family: monospace;">${paymentRef}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tarih:</td><td style="padding: 8px 0;">${createdAt}</td></tr>
          ${record.donor_email ? `<tr><td style="padding: 8px 0; color: #666;">E-posta:</td><td style="padding: 8px 0;">${record.donor_email}</td></tr>` : ''}
          ${record.donor_phone ? `<tr><td style="padding: 8px 0; color: #666;">Telefon:</td><td style="padding: 8px 0;">${record.donor_phone}</td></tr>` : ''}
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Bu bağışı onaylamak için yönetim paneline giriş yapın.
        </p>
      </div>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dumlupınar Bağış <noreply@dumlupinar.edu.tr>',
        to: [ADMIN_EMAIL],
        subject: `Yeni Bağış: ${donorName} - ₺${amount.toLocaleString('tr-TR')}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errText = await emailResponse.text()
      console.error('Resend API error:', errText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
