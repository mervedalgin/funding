import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { PaymentChannel } from '../types/donation'

export function usePaymentChannels(skip = false) {
  const [channels, setChannels] = useState<PaymentChannel[]>([])
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState<string | null>(null)

  const fetchChannels = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('payment_channels')
      .select('*')
      .order('sort_order', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setChannels((data as PaymentChannel[]) ?? [])
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
