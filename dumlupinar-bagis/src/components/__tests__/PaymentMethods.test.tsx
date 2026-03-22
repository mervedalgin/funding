import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaymentMethods from '../PaymentMethods'
import type { PaymentChannel } from '../../types/donation'

// Mock import.meta.env
vi.stubEnv('VITE_WHATSAPP_PHONE', '905001234567')

const mockChannels: PaymentChannel[] = [
  {
    id: 'ch-1',
    label: 'Banka Havalesi (Ziraat)',
    icon_name: 'Building2',
    bank_name: 'Ziraat Bankası',
    iban: 'TR00 0001 0000 0000 0000 0000 00',
    description: 'Açıklama kısmına malzeme kodunu yazınız',
    url: null,
    is_active: true,
    sort_order: 1,
  },
]

describe('PaymentMethods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders nothing when no channels', () => {
    const { container } = render(
      <PaymentMethods channels={[]} paymentRef="OKUL-001" selectedAmount={5000} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders channel info', () => {
    render(
      <PaymentMethods channels={mockChannels} paymentRef="OKUL-001" selectedAmount={5000} />
    )

    expect(screen.getByText('Banka Havalesi (Ziraat)')).toBeInTheDocument()
    expect(screen.getByText('Ziraat Bankası')).toBeInTheDocument()
    expect(screen.getByText('TR00 0001 0000 0000 0000 0000 00')).toBeInTheDocument()
  })

  it('shows IBAN copy button', () => {
    render(
      <PaymentMethods channels={mockChannels} paymentRef="OKUL-001" selectedAmount={5000} />
    )

    expect(screen.getByText("IBAN'ı Kopyala")).toBeInTheDocument()
  })

  it('copies IBAN to clipboard on click', async () => {
    render(
      <PaymentMethods channels={mockChannels} paymentRef="OKUL-001" selectedAmount={5000} />
    )

    await userEvent.click(screen.getByText("IBAN'ı Kopyala"))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TR00 0001 0000 0000 0000 0000 00')
    expect(screen.getByText('Kopyalandı!')).toBeInTheDocument()
  })

  it('shows transfer description when itemTitle provided', () => {
    render(
      <PaymentMethods channels={mockChannels} paymentRef="OKUL-001" selectedAmount={5000} itemTitle="Akıllı Tahta" donationType="school" />
    )

    expect(screen.getByText('Havale Açıklaması')).toBeInTheDocument()
    expect(screen.getByText('Açıklamayı Kopyala')).toBeInTheDocument()
  })

  it('shows selected amount', () => {
    render(
      <PaymentMethods channels={mockChannels} paymentRef="OKUL-001" selectedAmount={5000} />
    )

    expect(screen.getByText('₺5.000')).toBeInTheDocument()
  })

  it('shows donor name input', () => {
    render(
      <PaymentMethods channels={mockChannels} paymentRef="OKUL-001" selectedAmount={5000} />
    )

    expect(screen.getByPlaceholderText('Bağışçı olarak görünecek isminiz')).toBeInTheDocument()
  })
})
