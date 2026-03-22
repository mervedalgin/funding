import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key)
}

/**
 * Validate payment callback signature.
 * Each provider has its own hash mechanism.
 */
export async function validatePaymentSignature(
  provider: string,
  body: Record<string, unknown>,
  signature: string | null
): Promise<boolean> {
  if (!signature) return false

  const secretKey = Deno.env.get('PAYMENT_SECRET_KEY')
  if (!secretKey) {
    console.error('PAYMENT_SECRET_KEY not configured')
    return false
  }

  // Build the expected hash based on provider
  let payload: string

  if (provider === 'iyzico') {
    // iyzico: HMAC-SHA256 of iyziEventType + iyziReferenceCode + secretKey
    payload = `${body.iyziEventType}${body.iyziReferenceCode}${secretKey}`
  } else if (provider === 'paytr') {
    // PayTR: HMAC of merchant_oid + merchant_salt + merchant_key
    payload = `${body.merchant_oid}${secretKey}`
  } else {
    return false
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const expectedHash = btoa(String.fromCharCode(...new Uint8Array(mac)))

  return expectedHash === signature
}
