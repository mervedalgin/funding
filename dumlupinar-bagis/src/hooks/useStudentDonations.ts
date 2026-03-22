import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { StudentDonation } from '../types/donation'

export function useStudentDonations(isAdmin = false) {
  const [donations, setDonations] = useState<StudentDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('student_donations')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('status', 'confirmed')
    }

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setDonations((data as StudentDonation[]) ?? [])
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
