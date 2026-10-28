import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { useFavorites } from '../state/favorites.jsx'

export default function Header() {
  const { favorites } = useFavorites()
  const { search } = useLocation()
  // Scroll progress bar: scrollYProgress (0 → 1) drives the bar's scaleX through a spring
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })

  const savedLink = new URLSearchParams(search)
  savedLink.set('c', 'saved')
  savedLink.delete('q')

  return (
    <header className="header">
      <motion.div className="progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="Savora home">
          <motion.span
            className="logo-mark"
            aria-hidden="true"
            whileHover={{ rotate: [0, -12, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            🍲
          </motion.span>
          Savora
        </Link>
        <Link to={{ pathname: '/', search: `?${savedLink}` }} className="saved-link">
          <span aria-hidden="true">♥</span> Saved
          {/* key = count: a new count mounts a new badge, so it pops every time */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={favorites.length}
              className="badge"
              initial={{ scale: 0.4, opacity: 0, y: -6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.4, opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              aria-label={`${favorites.length} saved`}
            >
              {favorites.length}
            </motion.span>
          </AnimatePresence>
        </Link>
      </div>
    </header>
  )
}
