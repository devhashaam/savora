// Saves categories + every category's recipe list to src/data/snapshot.json.
// The app shows this instantly on first load, then React Query refreshes it from the API in the background.
// Re-run any time with: node scripts/snapshot.mjs
import { writeFile, mkdir } from 'node:fs/promises'

const BASE = 'https://www.themealdb.com/api/json/v1/1'
const get = async (path) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(45000) })
      if (res.ok) return await res.json() // await here so a slow body read is caught and retried
    } catch (e) {
      console.warn(`  retry ${attempt} for ${path}: ${e.message}`)
    }
  }
  throw new Error(`Failed: ${path}`)
}

const categories = (await get('/categories.php')).categories.map((c) => c.strCategory)
const meals = {}
for (const c of categories) {
  const data = await get(`/filter.php?c=${encodeURIComponent(c)}`)
  // Same shape as fetchMeals() in src/lib/api.js
  meals[c] = (data.meals ?? []).map((m) => ({
    id: m.idMeal,
    name: m.strMeal,
    image: m.strMealThumb,
    area: m.strArea || m.strCountry || null,
    category: c,
  }))
  console.log(`${c}: ${meals[c].length}`)
}

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true })
await writeFile(
  new URL('../src/data/snapshot.json', import.meta.url),
  JSON.stringify({ savedAt: new Date().toISOString(), categories, meals })
)
console.log('Saved src/data/snapshot.json')
