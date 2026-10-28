import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeartButton from './HeartButton.jsx'
import { thumb } from '../lib/api.js'
import { useFavorites } from '../state/favorites.jsx'

// forwardRef: AnimatePresence mode="popLayout" needs a ref to measure the card while it exits
const MealCard = forwardRef(function MealCard({ meal, index }, ref) {
  const { search } = useLocation()
  const { isFavorite, toggle } = useFavorites()

  return (
    <motion.li
      ref={ref}
      layout
      className="card"
      data-card-id={meal.id}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      // Stagger the first rows, then cap the delay so long lists don't feel slow
      transition={{ type: 'spring', stiffness: 260, damping: 26, delay: Math.min(index, 12) * 0.035 }}
      whileHover={{ y: -6 }}
    >
      {/* layoutId on the frame, image and title lets them morph into the recipe overlay */}
      <motion.div layoutId={`card-${meal.id}`} className="card-frame">
        {/* state: the overlay can show this card's image and name instantly while details load */}
        <Link to={{ pathname: `/recipe/${meal.id}`, search }} state={{ preview: meal }} className="card-link">
          <motion.div layoutId={`media-${meal.id}`} className="card-media">
            <img src={thumb(meal.image)} alt="" width="250" height="250" loading="lazy" decoding="async" />
          </motion.div>
          <div className="card-body">
            {(meal.area || meal.category) && (
              <p className="card-meta">{[meal.category, meal.area].filter(Boolean).join(' · ')}</p>
            )}
            <motion.h3 layoutId={`title-${meal.id}`} className="card-title">
              {meal.name}
            </motion.h3>
          </div>
        </Link>
      </motion.div>
      <div className="card-heart">
        <HeartButton active={isFavorite(meal.id)} onToggle={() => toggle(meal)} label={meal.name} size="sm" />
      </div>
    </motion.li>
  )
})

export default MealCard
