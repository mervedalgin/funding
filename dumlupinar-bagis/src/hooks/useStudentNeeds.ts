import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { StudentNeed } from '../types/donation'

export function useStudentNeeds(includeAll = false) {
  const [items, setItems] = useState<StudentNeed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('student_needs')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!includeAll) {
      query = query.eq('status', 'active')
    }

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setItems((data as StudentNeed[]) ?? [])
    }
    setLoading(false)
  }, [includeAll])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (item: Partial<StudentNeed>) => {
    const { data, error: err } = await supabase
      .from('student_needs')
      .insert(item)
      .select()
      .single()

    if (err) throw err
    await fetchItems()
    return data as StudentNeed
  }

  const updateItem = async (id: string, updates: Partial<StudentNeed>) => {
    const { error: err } = await supabase
      .from('student_needs')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase
      .from('student_needs')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem }
}
