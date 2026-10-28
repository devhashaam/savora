import { useState } from 'react'
import { motion } from 'framer-motion'

// A tap-to-check list: each tick springs in and the line strikes through
export default function IngredientList({ ingredients }) {
  const [checked, setChecked] = useState(() => new Set())

  const toggle = (name) =>
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  return (
    <>
      <p className="muted small">
        {checked.size} of {ingredients.length} ready
      </p>
      <ul className="ingredients">
        {ingredients.map(({ name, measure }, i) => {
          const done = checked.has(name)
          return (
            <motion.li
              key={`${name}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.03 }}
            >
              <button type="button" className={`ingredient${done ? ' done' : ''}`} aria-pressed={done} onClick={() => toggle(name)}>
                <span className="tick" aria-hidden="true">
                  <motion.svg viewBox="0 0 24 24" width="14" height="14">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={false}
                      // pathLength 0 → 1 "draws" the tick
                      animate={{ pathLength: done ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </motion.svg>
                </span>
                <span className="ingredient-name">{name}</span>
                {measure && <span className="ingredient-measure">{measure}</span>}
              </button>
            </motion.li>
          )
        })}
      </ul>
    </>
  )
}
