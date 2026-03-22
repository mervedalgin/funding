import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { LegalBasisItem } from '../types/donation'
import { parseArray, LegalBasisItemSchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function useLegalBasis(includeAll = false) {
  const [items, setItems] = useState<LegalBasisItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        let query = supabase
          .from('legal_basis_items')
          .select('*')
          .order('sort_order', { ascending: true })

        if (!includeAll) {
          query = query.eq('is_active', true)
        }

        const { data, error: err } = await query
        if (err) throw err
        return data
      })

      setItems(parseArray(LegalBasisItemSchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [includeAll])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (item: Partial<LegalBasisItem>) => {
    const { data, error: err } = await supabase
      .from('legal_basis_items')
      .insert(item)
      .select()
      .single()

    if (err) throw err
    await fetchItems()
    return data as LegalBasisItem
  }

  const updateItem = async (id: string, updates: Partial<LegalBasisItem>) => {
    const { error: err } = await supabase
      .from('legal_basis_items')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase
      .from('legal_basis_items')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem }
}
