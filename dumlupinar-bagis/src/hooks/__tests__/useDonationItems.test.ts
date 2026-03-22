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

const mockItem = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  title: 'Akıllı Tahta',
  description: null,
  image_url: null,
  price: 25000,
  custom_amount_min: 10,
  bank_name: null,
  iban: null,
  payment_ref: null,
  payment_url: null,
  internet_banking_url: null,
  impact_text: null,
  donor_count: 0,
  target_amount: 0,
  collected_amount: 0,
  status: 'active',
  sort_order: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

let queryBuilder: ReturnType<typeof createQueryBuilder>

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => queryBuilder),
  },
}))

vi.mock('../../lib/fetchWithRetry', () => ({
  withRetry: (fn: () => Promise<unknown>) => fn(),
}))

describe('useDonationItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryBuilder = createQueryBuilder({
      data: [
        mockItem({ id: '1', title: 'Akıllı Tahta', price: 25000 }),
        mockItem({ id: '2', title: 'Projektör', price: 8500 }),
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

    expect(result.current.error).toBeTruthy()
    expect(result.current.items).toHaveLength(0)
  })
})
