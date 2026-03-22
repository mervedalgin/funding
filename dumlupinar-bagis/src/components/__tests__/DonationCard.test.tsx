import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DonationCard from '../DonationCard'
import type { DonationItem } from '../../types/donation'

const mockItem: DonationItem = {
  id: 'test-1',
  title: 'Akıllı Tahta',
  description: '5. sınıf dersliği için interaktif akıllı tahta',
  image_url: null,
  price: 25000,
  custom_amount_min: 100,
  bank_name: 'Ziraat',
  iban: 'TR00 0001 0000 0000 0000 0000 00',
  payment_ref: 'OKUL-001',
  payment_url: null,
  internet_banking_url: null,
  impact_text: '35 öğrenci bu akıllı tahtadan faydalanacak',
  donor_count: 2,
  target_amount: 25000,
  collected_amount: 5000,
  status: 'active',
  sort_order: 1,
  created_at: '2026-03-20T00:00:00Z',
  updated_at: '2026-03-20T00:00:00Z',
}

const renderCard = (item: DonationItem = mockItem) =>
  render(
    <MemoryRouter>
      <DonationCard item={item} />
    </MemoryRouter>
  )

describe('DonationCard', () => {
  it('renders title and price', () => {
    renderCard()

    expect(screen.getByText('Akıllı Tahta')).toBeInTheDocument()
    // Price appears in both the card and the progress bar, use getAllByText
    const priceElements = screen.getAllByText(/₺25.000/)
    expect(priceElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders description', () => {
    renderCard()

    expect(screen.getByText('5. sınıf dersliği için interaktif akıllı tahta')).toBeInTheDocument()
  })

  it('renders "Destek Ol" button for active items', () => {
    renderCard()

    expect(screen.getByText('Destek Ol')).toBeInTheDocument()
  })

  it('shows "Tamamlandı" badge for completed items', () => {
    renderCard({ ...mockItem, status: 'completed' })

    expect(screen.getByText('Tamamlandı')).toBeInTheDocument()
    expect(screen.queryByText('Destek Ol')).not.toBeInTheDocument()
  })

  it('shows urgency badge when near goal', () => {
    renderCard({
      ...mockItem,
      collected_amount: 22000,
      target_amount: 25000,
    })

    expect(screen.getByText('Hedefe Yakın!')).toBeInTheDocument()
  })

  it('shows first donor badge when no donors yet', () => {
    renderCard({
      ...mockItem,
      donor_count: 0,
    })

    expect(screen.getByText('İlk Sen Ol!')).toBeInTheDocument()
  })

  it('renders impact text', () => {
    renderCard()

    expect(screen.getByText('35 öğrenci bu akıllı tahtadan faydalanacak')).toBeInTheDocument()
  })

  it('links to item detail page', () => {
    renderCard()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/item/test-1')
  })
})
