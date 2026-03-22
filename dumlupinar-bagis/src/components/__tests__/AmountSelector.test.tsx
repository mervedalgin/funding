import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AmountSelector from '../AmountSelector'

describe('AmountSelector', () => {
  const defaultProps = {
    price: 10000,
    customAmountMin: 50,
    onSelect: vi.fn(),
  }

  it('renders three amount options', () => {
    render(<AmountSelector {...defaultProps} />)

    expect(screen.getByText('Tamamını Karşıla')).toBeInTheDocument()
    expect(screen.getByText('Yarısını Üstlen')).toBeInTheDocument()
    expect(screen.getByText('Dilediğin Kadar')).toBeInTheDocument()
  })

  it('selects full amount by default and calls onSelect', () => {
    render(<AmountSelector {...defaultProps} />)

    // Full is selected by default
    expect(screen.getByText('₺10.000')).toBeInTheDocument()
  })

  it('calls onSelect with full price when full is clicked', async () => {
    const onSelect = vi.fn()
    render(<AmountSelector {...defaultProps} onSelect={onSelect} />)

    const fullButton = screen.getByText('Tamamını Karşıla').closest('button')!
    await userEvent.click(fullButton)

    expect(onSelect).toHaveBeenCalledWith(10000, 'full')
  })

  it('calls onSelect with half price when half is clicked', async () => {
    const onSelect = vi.fn()
    render(<AmountSelector {...defaultProps} onSelect={onSelect} />)

    const halfButton = screen.getByText('Yarısını Üstlen').closest('button')!
    await userEvent.click(halfButton)

    expect(onSelect).toHaveBeenCalledWith(5000, 'half')
  })

  it('shows custom input when custom is clicked', async () => {
    render(<AmountSelector {...defaultProps} />)

    const customButton = screen.getByText('Dilediğin Kadar').closest('button')!
    await userEvent.click(customButton)

    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('validates minimum custom amount', async () => {
    render(<AmountSelector {...defaultProps} />)

    const customButton = screen.getByText('Dilediğin Kadar').closest('button')!
    await userEvent.click(customButton)

    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '10')

    expect(screen.getByText('Minimum katkı tutarı ₺50')).toBeInTheDocument()
  })

  it('calls onSelect with valid custom amount', async () => {
    const onSelect = vi.fn()
    render(<AmountSelector {...defaultProps} onSelect={onSelect} />)

    const customButton = screen.getByText('Dilediğin Kadar').closest('button')!
    await userEvent.click(customButton)

    const input = screen.getByRole('spinbutton')
    await userEvent.type(input, '200')

    expect(onSelect).toHaveBeenCalledWith(200, 'custom')
  })
})
