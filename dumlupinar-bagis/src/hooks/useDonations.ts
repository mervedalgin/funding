import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Donation, PublicDonor, PublicDonorWithItem } from '../types/donation'
import { parseArray, DonationSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function groupDonorsByName(donors: PublicDonorWithItem[]) {
  const grouped = new Map<string, { donations: PublicDonorWithItem[]; totalAmount: number }>()
  donors.forEach((d) => {
    const existing = grouped.get(d.donor_name) || { donations: [], totalAmount: 0 }
    existing.donations.push(d)
    existing.totalAmount += d.amount
    grouped.set(d.donor_name, existing)
  })
  return grouped
}

export function useDonations(isAdmin = false) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        let query = supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })

        if (!isAdmin) {
          query = query.eq('status', 'confirmed')
        }

        const { data, error: err } = await query
        if (err) throw err
        return data
      })

      setDonations(parseArray(DonationSchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [isAdmin])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const fetchPublicDonors = useCallback(async (): Promise<PublicDonor[]> => {
    const { data, error: err } = await supabase
      .from('donations')
      .select('donor_name, amount, created_at')
      .eq('status', 'confirmed')
      .not('donor_name', 'is', null)
      .order('created_at', { ascending: false })

    if (err) throw err
    return (data as PublicDonor[]) ?? []
  }, [])

  const fetchPublicDonorsWithItems = useCallback(async (): Promise<PublicDonorWithItem[]> => {
    const { data, error: err } = await supabase
      .from('donations')
      .select('donor_name, amount, created_at, item_id, donation_items(title)')
      .eq('status', 'confirmed')
      .not('donor_name', 'is', null)
      .order('created_at', { ascending: false })

    if (err) throw err
    return (data as PublicDonorWithItem[]) ?? []
  }, [])

  const createDonation = async (donation: {
    donor_name?: string
    donor_email?: string
    donor_phone?: string
    amount: number
    item_id?: string
    payment_method?: string
    payment_ref?: string
    notes?: string
  }) => {
    const { data, error: err } = await supabase
      .from('donations')
      .insert(donation)
      .select()
      .single()

    if (err) throw err
    await fetchDonations()
    return data as Donation
  }

  const confirmDonation = async (id: string) => {
    const { error: err } = await supabase
      .from('donations')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (err) throw err
    await fetchDonations()
  }

  const rejectDonation = async (id: string) => {
    const { error: err } = await supabase
      .from('donations')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (err) throw err
    await fetchDonations()
  }

  return {
    donations,
    loading,
    error,
    fetchDonations,
    fetchPublicDonors,
    fetchPublicDonorsWithItems,
    createDonation,
    confirmDonation,
    rejectDonation,
  }
}
