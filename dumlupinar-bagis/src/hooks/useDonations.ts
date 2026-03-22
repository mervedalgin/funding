import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Donation, StudentDonation, PublicDonor, PublicDonorWithItem } from '../types/donation'
import { parseArray, DonationSchema, StudentDonationSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export interface UnifiedDonation {
  id: string
  type: 'school' | 'student'
  item_id: string | null
  donor_name: string | null
  donor_email: string | null
  donor_phone: string | null
  amount: number
  payment_method: string
  payment_ref: string | null
  status: string
  notes: string | null
  receipt_url: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}

export interface DonationStats {
  pending: { count: number; total: number }
  confirmedThisMonth: { count: number; total: number }
  confirmedAll: { count: number; total: number }
  averageDonation: number
  approvalRate: number
}

function toDonationUnified(d: Donation): UnifiedDonation {
  return { ...d, type: 'school', item_id: d.item_id }
}

function toStudentUnified(d: StudentDonation): UnifiedDonation {
  return { ...d, type: 'student', item_id: d.student_need_id }
}

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

export function computeStats(donations: UnifiedDonation[]): DonationStats {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const pending = donations.filter(d => d.status === 'pending')
  const confirmed = donations.filter(d => d.status === 'confirmed')
  const rejected = donations.filter(d => d.status === 'rejected')
  const confirmedThisMonth = confirmed.filter(d => d.confirmed_at && d.confirmed_at >= monthStart)

  const sum = (arr: UnifiedDonation[]) => arr.reduce((s, d) => s + d.amount, 0)

  return {
    pending: { count: pending.length, total: sum(pending) },
    confirmedThisMonth: { count: confirmedThisMonth.length, total: sum(confirmedThisMonth) },
    confirmedAll: { count: confirmed.length, total: sum(confirmed) },
    averageDonation: confirmed.length > 0 ? sum(confirmed) / confirmed.length : 0,
    approvalRate: confirmed.length + rejected.length > 0
      ? (confirmed.length / (confirmed.length + rejected.length)) * 100
      : 0,
  }
}

export function useDonations(isAdmin = false) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [studentDonations, setStudentDonations] = useState<StudentDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [schoolData, studentData] = await Promise.all([
        withRetry(async () => {
          let query = supabase.from('donations').select('*').order('created_at', { ascending: false })
          if (!isAdmin) query = query.eq('status', 'confirmed')
          const { data, error: err } = await query
          if (err) throw err
          return data
        }),
        withRetry(async () => {
          let query = supabase.from('student_donations').select('*').order('created_at', { ascending: false })
          if (!isAdmin) query = query.eq('status', 'confirmed')
          const { data, error: err } = await query
          if (err) throw err
          return data
        }),
      ])

      setDonations(parseArray(DonationSchema, schoolData))
      setStudentDonations(parseArray(StudentDonationSchema, studentData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [isAdmin])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  // Unified list for admin
  const allDonations: UnifiedDonation[] = [
    ...donations.map(toDonationUnified),
    ...studentDonations.map(toStudentUnified),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const fetchPublicDonors = useCallback(async (): Promise<PublicDonor[]> => {
    return withRetry(async () => {
      const { data, error: err } = await supabase
        .from('donations')
        .select('donor_name, amount, created_at')
        .eq('status', 'confirmed')
        .not('donor_name', 'is', null)
        .order('created_at', { ascending: false })
      if (err) throw err
      return (data as PublicDonor[]) ?? []
    })
  }, [])

  const fetchPublicDonorsWithItems = useCallback(async (): Promise<PublicDonorWithItem[]> => {
    return withRetry(async () => {
      const { data, error: err } = await supabase
        .from('donations')
        .select('donor_name, amount, created_at, item_id, donation_items(title)')
        .eq('status', 'confirmed')
        .not('donor_name', 'is', null)
        .order('created_at', { ascending: false })
      if (err) throw err
      return (data as PublicDonorWithItem[]) ?? []
    })
  }, [])

  const createDonation = async (donation: {
    donor_name?: string; donor_email?: string; donor_phone?: string
    amount: number; item_id?: string; payment_method?: string; payment_ref?: string; notes?: string
  }) => {
    const { data, error: err } = await supabase.from('donations').insert(donation).select().single()
    if (err) throw err
    await fetchDonations()
    return data as Donation
  }

  const confirmDonation = async (id: string, table: 'donations' | 'student_donations' = 'donations') => {
    const { error: err } = await supabase
      .from(table)
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    await fetchDonations()
  }

  const rejectDonation = async (id: string, table: 'donations' | 'student_donations' = 'donations', reason?: string) => {
    const updateData: Record<string, unknown> = { status: 'rejected' }
    if (reason) updateData.notes = reason
    const { error: err } = await supabase.from(table).update(updateData).eq('id', id)
    if (err) throw err
    await fetchDonations()
  }

  const updateDonationNotes = async (id: string, table: 'donations' | 'student_donations', notes: string) => {
    const { error: err } = await supabase.from(table).update({ notes }).eq('id', id)
    if (err) throw err
    await fetchDonations()
  }

  const bulkConfirm = async (items: { id: string; table: 'donations' | 'student_donations' }[]) => {
    const now = new Date().toISOString()
    await Promise.all(
      items.map(({ id, table }) =>
        supabase.from(table).update({ status: 'confirmed', confirmed_at: now }).eq('id', id)
      )
    )
    await fetchDonations()
  }

  const bulkReject = async (items: { id: string; table: 'donations' | 'student_donations' }[], reason?: string) => {
    const updateData: Record<string, unknown> = { status: 'rejected' }
    if (reason) updateData.notes = reason
    await Promise.all(
      items.map(({ id, table }) =>
        supabase.from(table).update(updateData).eq('id', id)
      )
    )
    await fetchDonations()
  }

  return {
    donations, studentDonations, allDonations,
    loading, error,
    fetchDonations,
    fetchPublicDonors, fetchPublicDonorsWithItems,
    createDonation, confirmDonation, rejectDonation,
    updateDonationNotes, bulkConfirm, bulkReject,
  }
}
