import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const WORDS = ['comforting', 'colourful', 'spicy', 'fresh', 'sweet']

// Parent/child variants: the parent staggers its children's entrance automatically
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const word = {
  hidden: { opacity: 0, y: 24, rotateX: -40 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function Hero() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2200)
    return () => clearInterval(timer)
  }, [reduceMotion])

  return (
    <section className="hero">
      <motion.h1 variants={container} initial="hidden" animate="show">
        {['Cook', 'something'].map((w) => (
          <motion.span key={w} variants={word} className="word">
            {w}
          </motion.span>
        ))}
        <span className="rotator" aria-live="off">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={WORDS[index]}
              className="rotating-word"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {WORDS[index]}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span variants={word} className="word">
          tonight.
        </motion.span>
      </motion.h1>
      <motion.p
        className="hero-sub"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        Hundreds of recipes from around the world. Pick a category, search, and save your favourites.
      </motion.p>
    </section>
  )
}
