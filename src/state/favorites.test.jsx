import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { FavoritesProvider, favoritesReducer, useFavorites } from './favorites.jsx'

const pie = { id: '1', name: 'Apple Pie', image: 'pie.jpg', area: 'British', category: 'Dessert', ingredients: ['x'] }
const curry = { id: '2', name: 'Curry', image: 'curry.jpg', area: 'Indian', category: 'Chicken' }

describe('favoritesReducer', () => {
  it('adds a meal to the front, storing only summary fields', () => {
    const state = favoritesReducer([curry], { type: 'toggle', meal: pie })
    expect(state.map((m) => m.id)).toEqual(['1', '2'])
    expect(state[0]).not.toHaveProperty('ingredients')
  })

  it('removes a meal that is already saved', () => {
    expect(favoritesReducer([pie, curry], { type: 'toggle', meal: pie })).toEqual([curry])
  })
})

describe('useFavorites', () => {
  it('toggles favourites and persists them to localStorage', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })

    act(() => result.current.toggle(pie))
    expect(result.current.isFavorite('1')).toBe(true)
    expect(JSON.parse(localStorage.getItem('savora-favorites'))[0].name).toBe('Apple Pie')

    act(() => result.current.toggle(pie))
    expect(result.current.isFavorite('1')).toBe(false)
  })

  it('restores saved favourites on the next visit', () => {
    localStorage.setItem('savora-favorites', JSON.stringify([curry]))
    const { result } = renderHook(() => useFavorites(), { wrapper: FavoritesProvider })
    expect(result.current.favorites).toEqual([curry])
  })

  it('throws a helpful error when used outside the provider', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {}) // React logs the expected error
    expect(() => renderHook(() => useFavorites())).toThrow(/inside <FavoritesProvider>/)
    silence.mockRestore()
  })
})
