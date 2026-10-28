import { describe, expect, it } from 'vitest'
import { searchSnapshot } from './Home.jsx'
import snapshot from '../data/snapshot.json'

describe('searchSnapshot', () => {
  it('finds recipes by name in the bundled snapshot, case-insensitively', () => {
    const results = searchSnapshot('CHICKEN')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((m) => m.name.toLowerCase().includes('chicken'))).toBe(true)
  })

  it('never returns the same recipe twice', () => {
    const ids = searchSnapshot('a').map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has data for every category in the snapshot', () => {
    for (const c of snapshot.categories) expect(snapshot.meals[c]?.length).toBeGreaterThan(0)
  })
})
