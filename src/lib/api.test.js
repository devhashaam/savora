import { describe, expect, it } from 'vitest'
import { parseIngredients, parseSteps, thumb } from './api.js'

describe('parseIngredients', () => {
  it('pairs strIngredientN with strMeasureN and skips empty slots', () => {
    const meal = {
      strIngredient1: 'Flour', strMeasure1: '200g',
      strIngredient2: ' Sugar ', strMeasure2: ' 50g ',
      strIngredient3: '', strMeasure3: '',
      strIngredient4: null, strMeasure4: null,
      strIngredient5: 'Salt', strMeasure5: '',
    }
    expect(parseIngredients(meal)).toEqual([
      { name: 'Flour', measure: '200g' },
      { name: 'Sugar', measure: '50g' },
      { name: 'Salt', measure: '' },
    ])
  })
})

describe('parseSteps', () => {
  it('splits on line breaks and strips "STEP n" and "1." prefixes', () => {
    const text = 'STEP 1\r\nPreheat the oven.\r\n\r\nSTEP 2\r\n2. Mix the flour and sugar.\n3) Bake for 20 minutes.'
    expect(parseSteps(text)).toEqual(['Preheat the oven.', 'Mix the flour and sugar.', 'Bake for 20 minutes.'])
  })

  it('returns an empty list for missing instructions', () => {
    expect(parseSteps(undefined)).toEqual([])
  })
})

describe('thumb', () => {
  it('requests the small (~12 KB) image variant', () => {
    expect(thumb('https://x.test/a.jpg')).toBe('https://x.test/a.jpg/small')
  })
})
