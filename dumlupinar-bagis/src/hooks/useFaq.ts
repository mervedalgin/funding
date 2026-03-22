import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { FaqItem } from '../types/donation'
import { parseArray, FaqItemSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function useFaq(includeAll = false) {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        let query = supabase
          .from('faq_items')
          .select('*')
          .order('sort_order', { ascending: true })

        if (!includeAll) {
          query = query.eq('is_active', true)
        }

        const { data, error: err } = await query
        if (err) throw err
        return data
      })

      setItems(parseArray(FaqItemSchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [includeAll])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (item: Partial<FaqItem>) => {
    const { data, error: err } = await supabase
      .from('faq_items')
      .insert(item)
      .select()
      .single()

    if (err) throw err
    await fetchItems()
    return data as FaqItem
  }

  const updateItem = async (id: string, updates: Partial<FaqItem>) => {
    const { error: err } = await supabase
      .from('faq_items')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem }
}
