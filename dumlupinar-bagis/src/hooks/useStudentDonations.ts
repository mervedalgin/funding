import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { StudentDonation } from '../types/donation'
import { parseArray, StudentDonationSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function useStudentDonations(isAdmin = false) {
  const [donations, setDonations] = useState<StudentDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        let query = supabase
          .from('student_donations')
          .select('*')
          .order('created_at', { ascending: false })

        if (!isAdmin) {
          query = query.eq('status', 'confirmed')
        }

        const { data, error: err } = await query
        if (err) throw err
        return data
      })

      setDonations(parseArray(StudentDonationSchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [isAdmin])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const confirmDonation = async (id: string) => {
    const { error: err } = await supabase
      .from('student_donations')
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
      .from('student_donations')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (err) throw err
    await fetchDonations()
  }

  return { donations, loading, error, fetchDonations, confirmDonation, rejectDonation }
}
