import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

export function useAuditLog(limit = 50) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableFilter, setTableFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter)
      }
      if (actionFilter !== 'all') {
        query = query.ilike('action', actionFilter)
      }

      const { data, error: err } = await query
      if (err) throw err
      setEntries((data as AuditLogEntry[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit log yüklenemedi')
    }
    setLoading(false)
  }, [limit, tableFilter, actionFilter])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    loading,
    error,
    tableFilter,
    setTableFilter,
    actionFilter,
    setActionFilter,
    refetch: fetchEntries,
  }
}
