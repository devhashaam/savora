import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HeartButton from './HeartButton.jsx'
import CategoryBar from './CategoryBar.jsx'
import IngredientList from './IngredientList.jsx'
import MealCard from './MealCard.jsx'
import { FavoritesProvider } from '../state/favorites.jsx'
import { ROUTER_FUTURE } from '../lib/router.js'

describe('HeartButton', () => {
  it('exposes its state to screen readers and calls onToggle', async () => {
    const onToggle = vi.fn()
    const { rerender } = render(<HeartButton active={false} onToggle={onToggle} label="Apple Pie" />)
    const button = screen.getByRole('button', { name: 'Save Apple Pie' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)

    rerender(<HeartButton active onToggle={onToggle} label="Apple Pie" />)
    expect(screen.getByRole('button', { name: 'Remove Apple Pie from saved' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('CategoryBar', () => {
  it('marks the active category and reports clicks', async () => {
    const onSelect = vi.fn()
    render(<CategoryBar categories={['Beef', 'Dessert']} active="Dessert" onSelect={onSelect} savedCount={3} />)

    expect(screen.getByRole('button', { name: 'Dessert' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Beef' })).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(screen.getByRole('button', { name: '♥ Saved (3)' }))
    expect(onSelect).toHaveBeenCalledWith('saved')
  })
})

describe('IngredientList', () => {
  it('ticks ingredients off and counts how many are ready', async () => {
    render(<IngredientList ingredients={[{ name: 'Flour', measure: '200g' }, { name: 'Eggs', measure: '2' }]} />)
    expect(screen.getByText('0 of 2 ready')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /flour/i }))
    expect(screen.getByRole('button', { name: /flour/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('1 of 2 ready')).toBeInTheDocument()
  })
})

describe('MealCard', () => {
  const meal = { id: '52772', name: 'Teriyaki Chicken', image: 'https://x.test/t.jpg', area: 'Japanese', category: 'Chicken' }
  const renderCard = () =>
    render(
      <FavoritesProvider initial={[]}>
        <MemoryRouter initialEntries={['/?c=Chicken']} future={ROUTER_FUTURE}>
          <ul>
            <MealCard meal={meal} index={0} />
          </ul>
        </MemoryRouter>
      </FavoritesProvider>
    )

  it('links to the recipe overlay and keeps the current filters in the URL', () => {
    renderCard()
    expect(screen.getByRole('link', { name: /teriyaki chicken/i })).toHaveAttribute('href', '/recipe/52772?c=Chicken')
    expect(screen.getByText('Chicken · Japanese')).toBeInTheDocument()
  })

  it('saves the recipe without following the link', async () => {
    renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Save Teriyaki Chicken' }))
    expect(screen.getByRole('button', { name: 'Remove Teriyaki Chicken from saved' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('savora-favorites'))).toHaveLength(1)
  })
})
