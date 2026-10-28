// TheMealDB: a free recipe API (no key needed, CORS enabled)
const BASE = 'https://www.themealdb.com/api/json/v1/1'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

// The API's small variant is ~12 KB instead of ~150 KB: right for grid cards
export const thumb = (url) => `${url}/small`

export async function fetchCategories() {
  const data = await get('/categories.php')
  return data.categories.map((c) => c.strCategory)
}

// A search covers every category; otherwise list one category
export async function fetchMeals({ category, query }) {
  const data = query
    ? await get(`/search.php?s=${encodeURIComponent(query)}`)
    : await get(`/filter.php?c=${encodeURIComponent(category)}`)
  return (data.meals ?? []).map((m) => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
    area: m.strArea || m.strCountry || null,
    category: m.strCategory || category || null,
  }))
}

export async function fetchMeal(id) {
  const data = await get(`/lookup.php?i=${encodeURIComponent(id)}`)
  const m = data.meals?.[0]
  if (!m) return null
  return {
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
    area: m.strArea || m.strCountry || null,
    category: m.strCategory,
    tags: m.strTags ? m.strTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    youtube: m.strYoutube || null,
    ingredients: parseIngredients(m),
    steps: parseSteps(m.strInstructions),
  }
}

// The API stores ingredients as strIngredient1..20 + strMeasure1..20; turn them into a clean list
export function parseIngredients(meal) {
  const list = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim()
    if (!name) continue
    list.push({ name, measure: meal[`strMeasure${i}`]?.trim() || '' })
  }
  return list
}

// Instructions arrive as one block of text, sometimes numbered ("STEP 1", "1."); split into steps
export function parseSteps(text = '') {
  return text
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(step\s*\d+[:.)-]?|\d+[.)])\s*/i, '').trim())
    .filter((line) => line.length > 1 && !/^step\s*\d*$/i.test(line))
}
