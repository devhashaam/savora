import { useEffect, useRef, useState } from 'react'
import { useLocation, useOutlet, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import Hero from '../components/Hero.jsx'
import CategoryBar from '../components/CategoryBar.jsx'
import MealGrid, { GridSkeleton } from '../components/MealGrid.jsx'
import useDebounce from '../hooks/useDebounce.js'
import { fetchCategories, fetchMeals } from '../lib/api.js'
import { useFavorites } from '../state/favorites.jsx'
import snapshot from '../data/snapshot.json'

export const DEFAULT_CATEGORY = 'Dessert'
const SNAPSHOT_TIME = Date.parse(snapshot.savedAt)
const SNAPSHOT_ALL = [...new Map(Object.values(snapshot.meals).flat().map((m) => [m.id, m])).values()]

export function searchSnapshot(query) {
  const q = query.toLowerCase()
  return SNAPSHOT_ALL.filter((m) => m.name.toLowerCase().includes(q))
}

// True once `active` has stayed true for `ms`: used to explain a slow network instead of spinning forever
function useSlowFlag(active, ms) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    setSlow(false)
    if (!active) return
    const timer = setTimeout(() => setSlow(true), ms)
    return () => clearTimeout(timer)
  }, [active, ms])
  return slow
}

export default function Home() {
  const [params, setParams] = useSearchParams()
  const category = params.get('c') || DEFAULT_CATEGORY
  const query = params.get('q') || ''
  const { favorites } = useFavorites()
  const outlet = useOutlet()
  const { pathname } = useLocation()

  // ----- Search box: instant typing, debounced URL update -----
  const [text, setText] = useState(query)
  const debounced = useDebounce(text.trim(), 400)
  useEffect(() => {
    if (debounced === query) return
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      debounced ? next.set('q', debounced) : next.delete('q')
      return next
    }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  useEffect(() => setText(query), [query])

  const selectCategory = (c) => {
    setText('')
    setParams(c === DEFAULT_CATEGORY ? {} : { c })
  }

  // The recipe API can be slow, so start loading a category as soon as the user hovers its chip
  const queryClient = useQueryClient()
  const prefetchCategory = (c) => {
    if (c === 'saved') return
    queryClient.prefetchQuery({ queryKey: ['meals', { category: c }], queryFn: () => fetchMeals({ category: c }) })
  }

  // ----- Data (React Query caches each category/search, so switching back is instant) -----
  // The bundled snapshot is shown instantly; because it is older than staleTime, React Query
  // refreshes it from the (sometimes slow) API in the background
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
    initialData: snapshot.categories,
  })
  const showSaved = category === 'saved' && !query
  const meals = useQuery({
    queryKey: ['meals', query ? { query } : { category }],
    queryFn: () => fetchMeals({ category, query }),
    enabled: !showSaved,
    initialData: () => (query ? undefined : snapshot.meals[category]),
    initialDataUpdatedAt: SNAPSHOT_TIME,
    // Searching: show instant name matches from the snapshot until the server answers.
    // Changing category: keep the old cards on screen (dimmed) while the next set loads.
    placeholderData: (previous) => (query ? searchSnapshot(query) : previous),
  })
  const list = showSaved ? favorites : meals.data ?? []
  const waiting = !showSaved && (meals.isLoading || meals.isPlaceholderData)
  const slow = useSlowFlag(waiting, 5000)

  // ----- Overlay: lock page scroll while open, and return focus to the card when it closes -----
  const lastOpened = useRef(null)
  const openId = pathname.match(/\/recipe\/([^/]+)/)?.[1]
  useEffect(() => {
    if (openId) {
      lastOpened.current = openId
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      if (lastOpened.current) {
        document.querySelector(`[data-card-id="${lastOpened.current}"] a`)?.focus({ preventScroll: true })
      }
    }
  }, [openId])

  const heading = query ? `Results for "${query}"` : showSaved ? 'Your saved recipes' : category

  return (
    <main id="main" className="container">
      <Hero />

      <div className="toolbar">
        <label className="search">
          <span className="visually-hidden">Search all recipes</span>
          <span aria-hidden="true" className="search-icon">⌕</span>
          <input
            type="search"
            placeholder="Search all recipes… try “curry”"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      </div>

      {/* LayoutGroup: chips and cards share one layout context, so they animate together */}
      <LayoutGroup>
        {categories.data && (
          <CategoryBar
            categories={categories.data}
            active={query ? null : category}
            onSelect={selectCategory}
            onIntent={prefetchCategory}
            savedCount={favorites.length}
          />
        )}

        <div className="results-head">
          <h2>{heading}</h2>
          <p className="muted" aria-live="polite">
            {!meals.isLoading && `${list.length} recipe${list.length === 1 ? '' : 's'}`}
            {meals.isPlaceholderData && !showSaved && (query ? ' · quick matches, checking for more…' : ' · loading…')}
          </p>
        </div>
        {slow && (
          <p className="slow-note" role="status">
            {query
              ? 'The recipe service is slow right now. These are quick matches; more may appear.'
              : 'The recipe service is responding slowly right now. Still trying…'}
          </p>
        )}

        {meals.isLoading && !showSaved ? (
          <GridSkeleton />
        ) : meals.isError && !showSaved ? (
          <div className="state" role="alert">
            <p className="state-title">We couldn't load recipes.</p>
            <button type="button" className="btn" onClick={() => meals.refetch()}>Try again</button>
          </div>
        ) : list.length === 0 ? (
          <div className="state">
            <p className="state-title">{showSaved ? 'Nothing saved yet.' : 'No recipes found.'}</p>
            <p className="muted">{showSaved ? 'Tap the ♡ on any recipe to keep it here.' : 'Try another word or category.'}</p>
          </div>
        ) : (
          // While the next list loads, the previous one stays visible but dimmed (no flash of skeletons)
          <div className={`grid-wrap${meals.isPlaceholderData && !showSaved && !query ? ' is-stale' : ''}`} aria-busy={meals.isPlaceholderData}>
            <MealGrid meals={list} />
          </div>
        )}

        {/* The overlay route renders here, on top of the grid; AnimatePresence plays its exit.
            Wait for the grid first: in a shared layout the last element to mount "leads", so if a
            card mounted after the panel (direct link to a recipe), the card would take over and hide it. */}
        <AnimatePresence>{outlet && (showSaved || !meals.isLoading) && <div key={openId}>{outlet}</div>}</AnimatePresence>
      </LayoutGroup>
    </main>
  )
}
