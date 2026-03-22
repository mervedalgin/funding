import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { DonationItem } from '../types/donation'
import { parseArray, DonationItemSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function useDonationItems(includeAll = false) {
  const [items, setItems] = useState<DonationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        let query = supabase
          .from('donation_items')
          .select('*')
          .order('sort_order', { ascending: true })

        if (!includeAll) {
          query = query.eq('status', 'active')
        }

        const { data, error: err } = await query
        if (err) throw err
        return data
      })

      setItems(parseArray(DonationItemSchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [includeAll])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (item: Partial<DonationItem>) => {
    const { data, error: err } = await supabase
      .from('donation_items')
      .insert(item)
      .select()
      .single()

    if (err) throw err
    await fetchItems()
    return data as DonationItem
  }

  const updateItem = async (id: string, updates: Partial<DonationItem>) => {
    const { error: err } = await supabase
      .from('donation_items')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase
      .from('donation_items')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem }
}
