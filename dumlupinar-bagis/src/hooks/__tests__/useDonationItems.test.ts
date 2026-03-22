import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDonationItems } from '../useDonationItems'

// Create a proper chainable mock that mirrors Supabase's PostgREST builder
function createQueryBuilder(resolvedValue: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single', 'not', 'gte', 'lte', 'neq']

  for (const method of methods) {
    builder[method] = vi.fn(() => builder)
  }

  // Make the builder thenable (awaitable)
  builder.then = (resolve: (val: unknown) => void) => {
    resolve(resolvedValue)
    return builder
  }

  return builder
}

let queryBuilder: ReturnType<typeof createQueryBuilder>

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => queryBuilder),
  },
}))

describe('useDonationItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryBuilder = createQueryBuilder({
      data: [
        { id: '1', title: 'Akıllı Tahta', status: 'active', price: 25000 },
        { id: '2', title: 'Projektör', status: 'active', price: 8500 },
      ],
      error: null,
    })
  })

  it('fetches items on mount', async () => {
    const { result } = renderHook(() => useDonationItems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('filters active items by default', async () => {
    const { result } = renderHook(() => useDonationItems(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(queryBuilder.eq).toHaveBeenCalledWith('status', 'active')
  })

  it('does not filter when includeAll is true', async () => {
    const { result } = renderHook(() => useDonationItems(true))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(queryBuilder.eq).not.toHaveBeenCalled()
  })

  it('handles fetch errors', async () => {
    queryBuilder = createQueryBuilder({
      data: null,
      error: { message: 'Network error' },
    })

    const { result } = renderHook(() => useDonationItems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.items).toHaveLength(0)
  })
})
