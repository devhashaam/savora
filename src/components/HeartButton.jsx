import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)

export default function HeartButton({ active, onToggle, label, size = 'md' }) {
  const [burst, setBurst] = useState(0)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation() // don't open the recipe when the heart on a card is clicked
    if (!active) setBurst((n) => n + 1)
    onToggle()
  }

  return (
    <motion.button
      type="button"
      className={`heart heart-${size}${active ? ' heart-on' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from saved` : `Save ${label}`}
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
    >
      <motion.span
        aria-hidden="true"
        className="heart-icon"
        animate={active ? { scale: [1, 1.45, 0.9, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        {active ? '♥' : '♡'}
      </motion.span>

      {/* Particle burst: 8 dots fly outward and fade, then unmount */}
      <AnimatePresence>
        {burst > 0 &&
          PARTICLES.map((angle, i) => (
            <motion.span
              key={`${burst}-${i}`}
              className="particle"
              aria-hidden="true"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angle) * 26, y: Math.sin(angle) * 26, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onAnimationComplete={() => i === 0 && setBurst(0)}
            />
          ))}
      </AnimatePresence>
    </motion.button>
  )
}
