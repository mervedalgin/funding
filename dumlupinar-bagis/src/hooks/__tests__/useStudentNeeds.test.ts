import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStudentNeeds } from '../useStudentNeeds'

function createQueryBuilder(resolvedValue: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single', 'not', 'gte', 'lte', 'neq']
  for (const method of methods) {
    builder[method] = vi.fn(() => builder)
  }
  builder.then = (resolve: (val: unknown) => void) => {
    resolve(resolvedValue)
    return builder
  }
  return builder
}

const mockStudentNeed = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  title: 'Kışlık Mont',
  description: null,
  image_url: null,
  price: 500,
  student_count: 1,
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

describe('useStudentNeeds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryBuilder = createQueryBuilder({
      data: [
        mockStudentNeed({ id: '1', title: 'Kışlık Mont', price: 500 }),
        mockStudentNeed({ id: '2', title: 'Okul Çantası', price: 300 }),
      ],
      error: null,
    })
  })

  it('fetches student needs on mount', async () => {
    const { result } = renderHook(() => useStudentNeeds())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('filters active items by default', async () => {
    const { result } = renderHook(() => useStudentNeeds(false))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(queryBuilder.eq).toHaveBeenCalledWith('status', 'active')
  })

  it('does not filter when includeAll is true', async () => {
    const { result } = renderHook(() => useStudentNeeds(true))

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

    const { result } = renderHook(() => useStudentNeeds())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.items).toHaveLength(0)
  })
})
