import { motion } from 'framer-motion'

export default function CategoryBar({ categories, active, onSelect, onIntent, savedCount }) {
  const items = [...categories, 'saved']

  return (
    <div className="chips" role="group" aria-label="Recipe categories">
      {items.map((c) => {
        const selected = c === active
        return (
          <button
            key={c}
            type="button"
            className={`chip${selected ? ' chip-active' : ''}`}
            aria-pressed={selected}
            onClick={() => onSelect(c)}
            onPointerEnter={() => onIntent?.(c)}
            onFocus={() => onIntent?.(c)}
          >
            {/* One shared layoutId: the pill glides to whichever chip is active */}
            {selected && (
              <motion.span
                layoutId="chip-pill"
                className="chip-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="chip-label">{c === 'saved' ? `♥ Saved (${savedCount})` : c}</span>
          </button>
        )
      })}
    </div>
  )
}
