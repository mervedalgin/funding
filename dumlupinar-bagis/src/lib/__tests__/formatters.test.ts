import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatCurrency, formatRelativeTime } from '../formatters'

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₺0')
  })

  it('formats small numbers', () => {
    expect(formatCurrency(50)).toBe('₺50')
    expect(formatCurrency(999)).toBe('₺999')
  })

  it('formats thousands with dot separator', () => {
    expect(formatCurrency(1000)).toBe('₺1.000')
    expect(formatCurrency(25000)).toBe('₺25.000')
    expect(formatCurrency(150000)).toBe('₺150.000')
  })

  it('formats large numbers', () => {
    expect(formatCurrency(1000000)).toBe('₺1.000.000')
  })

  it('rounds decimal values', () => {
    expect(formatCurrency(99.7)).toBe('₺100')
    expect(formatCurrency(1234.4)).toBe('₺1.234')
  })
})

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "az önce" for recent times', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('az önce')
  })

  it('returns minutes', () => {
    vi.useFakeTimers()
    const base = new Date('2026-03-22T12:00:00Z')
    vi.setSystemTime(base)

    const fiveMinAgo = new Date('2026-03-22T11:55:00Z')
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe('5 dakika önce')
  })

  it('returns hours', () => {
    vi.useFakeTimers()
    const base = new Date('2026-03-22T12:00:00Z')
    vi.setSystemTime(base)

    const threeHoursAgo = new Date('2026-03-22T09:00:00Z')
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe('3 saat önce')
  })

  it('returns days', () => {
    vi.useFakeTimers()
    const base = new Date('2026-03-22T12:00:00Z')
    vi.setSystemTime(base)

    const twoDaysAgo = new Date('2026-03-20T12:00:00Z')
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('2 gün önce')
  })

  it('returns months', () => {
    vi.useFakeTimers()
    const base = new Date('2026-06-22T12:00:00Z')
    vi.setSystemTime(base)

    // ~90 days ago = 3 months (Math.floor(90/30) = 3)
    const threeMonthsAgo = new Date('2026-03-22T12:00:00Z')
    expect(formatRelativeTime(threeMonthsAgo.toISOString())).toBe('3 ay önce')
  })

  it('returns years', () => {
    vi.useFakeTimers()
    const base = new Date('2026-03-22T12:00:00Z')
    vi.setSystemTime(base)

    const twoYearsAgo = new Date('2024-03-22T12:00:00Z')
    expect(formatRelativeTime(twoYearsAgo.toISOString())).toBe('2 yıl önce')
  })
})
