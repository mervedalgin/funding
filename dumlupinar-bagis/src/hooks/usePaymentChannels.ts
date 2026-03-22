import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { PaymentChannel } from '../types/donation'
import { parseArray, PaymentChannelSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function usePaymentChannels(skip = false) {
  const [channels, setChannels] = useState<PaymentChannel[]>([])
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)

  const fetchChannels = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        const { data, error: err } = await supabase
          .from('payment_channels')
          .select('*')
          .order('sort_order', { ascending: true })

        if (err) throw err
        return data
      })

      setChannels(parseArray(PaymentChannelSchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!skip) {
      fetchChannels()
    }
  }, [fetchChannels, skip])

  const createChannel = async (channel: Partial<PaymentChannel>) => {
    const { error } = await supabase.from('payment_channels').insert(channel)
    if (error) throw error
    await fetchChannels()
  }

  const updateChannel = async (id: string, updates: Partial<PaymentChannel>) => {
    const { error } = await supabase.from('payment_channels').update(updates).eq('id', id)
    if (error) throw error
    await fetchChannels()
  }

  const deleteChannel = async (id: string) => {
    const { error } = await supabase.from('payment_channels').delete().eq('id', id)
    if (error) throw error
    await fetchChannels()
  }

  return { channels, loading, error, fetchChannels, createChannel, updateChannel, deleteChannel }
}
