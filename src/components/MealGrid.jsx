import { AnimatePresence, motion } from 'framer-motion'
import MealCard from './MealCard.jsx'

export function GridSkeleton() {
  return (
    <ul className="grid" aria-busy="true" aria-label="Loading recipes">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="card skeleton" />
      ))}
    </ul>
  )
}

export default function MealGrid({ meals }) {
  return (
    // popLayout: exiting cards leave the layout at once, so remaining cards glide into place
    <motion.ul layout className="grid">
      <AnimatePresence mode="popLayout">
        {meals.map((meal, i) => (
          <MealCard key={meal.id} meal={meal} index={i} />
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
