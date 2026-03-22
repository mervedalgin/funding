import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { DonationStory } from '../types/donation'
import { parseArray, DonationStorySchema } from '../lib/schemas'
import { withRetry } from '../lib/fetchWithRetry'

export function useStories(includeAll = false) {
  const [items, setItems] = useState<DonationStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await withRetry(async () => {
        let query = supabase
          .from('donation_stories')
          .select('*')
          .order('sort_order', { ascending: true })

        if (!includeAll) {
          query = query.eq('is_published', true)
        }

        const { data, error: err } = await query
        if (err) throw err
        return data
      })

      setItems(parseArray(DonationStorySchema, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hikayeler yüklenirken bir sorun oluştu')
    }
    setLoading(false)
  }, [includeAll])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const fetchStory = useCallback(async (slug: string): Promise<DonationStory | null> => {
    const { data, error: err } = await supabase
      .from('donation_stories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (err || !data) return null
    return DonationStorySchema.parse(data)
  }, [])

  const incrementViewCount = useCallback(async (id: string) => {
    await supabase.rpc('increment_story_view', { p_story_id: id })
  }, [])

  const createItem = async (item: Partial<DonationStory>) => {
    const { data, error: err } = await supabase
      .from('donation_stories')
      .insert(item)
      .select()
      .single()

    if (err) throw err
    await fetchItems()
    return data as DonationStory
  }

  const updateItem = async (id: string, updates: Partial<DonationStory>) => {
    const { error: err } = await supabase
      .from('donation_stories')
      .update(updates)
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase
      .from('donation_stories')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchItems()
  }

  return { items, loading, error, fetchItems, fetchStory, incrementViewCount, createItem, updateItem, deleteItem }
}

// Re-export slugify from shared utility
export { slugify } from '../lib/slugify'

/** Estimate reading time from HTML content */
export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '')
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}
