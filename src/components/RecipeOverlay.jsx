import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { fetchMeal, thumb } from '../lib/api.js'
import { useFavorites } from '../state/favorites.jsx'
import HeartButton from './HeartButton.jsx'
import IngredientList from './IngredientList.jsx'

const content = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.06 } }),
}

export default function RecipeOverlay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { search, state } = useLocation()
  const closeRef = useRef(null)
  const { isFavorite, toggle } = useFavorites()
  const { data: meal, isLoading, isError, refetch } = useQuery({ queryKey: ['meal', id], queryFn: () => fetchMeal(id) })
  // Until the full recipe arrives, show the card's summary so the image and title can morph straight in
  const preview = state?.preview?.id === id ? state.preview : null
  const shown = meal ?? preview

  const close = () => navigate({ pathname: '/', search })

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (meal) document.title = `${meal.name} | Savora`
    return () => {
      document.title = 'Savora | Animated Recipe Explorer'
    }
  }, [meal])

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="recipe-title">
      <motion.div
        className="backdrop"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Same layoutId as the card frame: the card expands into this panel */}
      <motion.article
        layoutId={`card-${id}`}
        className="panel"
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >
        <div className="panel-scroll">
          {/* The small card image (already cached) sits behind the full-size one while it downloads */}
          <motion.div
            layoutId={`media-${id}`}
            className="panel-media"
            style={shown ? { backgroundImage: `url(${thumb(shown.image)})` } : undefined}
          >
            {shown ? <img src={shown.image} alt={shown.name} width="700" height="700" /> : <div className="panel-media-fallback" />}
          </motion.div>

          <motion.button
            ref={closeRef}
            type="button"
            className="close"
            onClick={close}
            aria-label="Close recipe"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ rotate: 90 }}
          >
            ✕
          </motion.button>

          <div className="panel-body">
            {!meal && preview && (
              <motion.h2 layoutId={`title-${id}`} id="recipe-title" className="panel-title">
                {preview.name}
              </motion.h2>
            )}
            {isLoading && <p className="muted">Loading recipe…</p>}
            {isError && (
              <div className="state" role="alert">
                <p className="state-title">We couldn't load this recipe.</p>
                <button type="button" className="btn" onClick={() => refetch()}>Try again</button>
              </div>
            )}
            {meal === null && <p className="state-title">Recipe not found.</p>}

            {meal && (
              <>
                <div className="panel-title-row">
                  <motion.h2 layoutId={`title-${id}`} id="recipe-title" className="panel-title">
                    {meal.name}
                  </motion.h2>
                  <HeartButton active={isFavorite(meal.id)} onToggle={() => toggle(meal)} label={meal.name} />
                </div>

                <motion.ul className="pills" variants={content} custom={0} initial="hidden" animate="show">
                  {[meal.category, meal.area, ...meal.tags].filter(Boolean).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </motion.ul>

                <motion.section variants={content} custom={1} initial="hidden" animate="show">
                  <h3>Ingredients</h3>
                  <IngredientList ingredients={meal.ingredients} />
                </motion.section>

                <motion.section variants={content} custom={2} initial="hidden" animate="show">
                  <h3>Method</h3>
                  <ol className="steps">
                    {meal.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  {meal.youtube && (
                    <a className="btn btn-ghost" href={meal.youtube} target="_blank" rel="noreferrer">
                      ▶ Watch the video
                    </a>
                  )}
                </motion.section>
              </>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  )
}
