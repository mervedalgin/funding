import { describe, it, expect } from 'vitest'
import { groupDonorsByName } from '../useDonations'
import type { PublicDonorWithItem } from '../../types/donation'

describe('groupDonorsByName', () => {
  it('groups donors by name and sums amounts', () => {
    const donors = [
      { donor_name: 'Ali', amount: 100, created_at: '2026-03-20', item_id: '1', donation_items: { title: 'Tahta' } },
      { donor_name: 'Ali', amount: 200, created_at: '2026-03-21', item_id: '2', donation_items: { title: 'Projektör' } },
      { donor_name: 'Ayşe', amount: 500, created_at: '2026-03-22', item_id: '1', donation_items: { title: 'Tahta' } },
    ] as unknown as PublicDonorWithItem[]

    const result = groupDonorsByName(donors)

    expect(result.size).toBe(2)
    expect(result.get('Ali')!.totalAmount).toBe(300)
    expect(result.get('Ali')!.donations).toHaveLength(2)
    expect(result.get('Ayşe')!.totalAmount).toBe(500)
    expect(result.get('Ayşe')!.donations).toHaveLength(1)
  })

  it('handles empty array', () => {
    const result = groupDonorsByName([])
    expect(result.size).toBe(0)
  })

  it('handles single donor', () => {
    const donors = [
      { donor_name: 'Mehmet', amount: 1000, created_at: '2026-03-22', item_id: '1', donation_items: { title: 'Bilgisayar' } },
    ] as unknown as PublicDonorWithItem[]

    const result = groupDonorsByName(donors)
    expect(result.size).toBe(1)
    expect(result.get('Mehmet')!.totalAmount).toBe(1000)
  })
})
