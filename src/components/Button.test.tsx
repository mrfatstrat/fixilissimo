import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick} disabled>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies primary variant classes by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-600', 'hover:bg-gray-700', 'text-white')
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-gray-300', 'bg-white', 'text-gray-700')
  })

  it('applies medium size classes by default', () => {
    render(<Button>Medium Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'text-base')
  })

  it('applies small size classes', () => {
    render(<Button size="small">Small Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  it('applies large size classes', () => {
    render(<Button size="large">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('applies disabled classes when disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    expect(button).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('renders with correct button type', () => {
    render(<Button type="submit">Submit Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('defaults to button type', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('has accessible focus styles', () => {
    render(<Button>Focus Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
  })

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Keyboard Button</Button>)
    const button = screen.getByRole('button')

    button.focus()
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)

    // Clear previous calls and test Space separately
    handleClick.mockClear()
    await user.keyboard(' ')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('maintains all base classes across variants', () => {
    render(<Button>Base Classes</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'rounded-lg',
      'transition-colors',
      'duration-200'
    )
  })

  // Integration test with multiple props
  it('handles complex prop combinations correctly', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button
        variant="outline"
        size="large"
        type="submit"
        className="custom-test-class"
        onClick={handleClick}
      >
        Complex Button
      </Button>
    )

    const button = screen.getByRole('button')

    // Check all applied classes
    expect(button).toHaveClass('border', 'border-gray-300') // outline variant
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg') // large size
    expect(button).toHaveClass('custom-test-class') // custom class
    expect(button).toHaveAttribute('type', 'submit')

    // Test functionality
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})