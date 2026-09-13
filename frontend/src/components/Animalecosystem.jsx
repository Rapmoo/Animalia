import { motion, useReducedMotion } from 'motion/react'

const CREATURES = [
  {
    id: 'clouds-1',
    emoji: '☁️',
    className: 'eco-cloud',
    style: { top: '8%', left: '-10%' },
    animate: { x: ['0vw', '120vw'] },
    duration: 90,
    delay: 0,
  },
  {
    id: 'clouds-2',
    emoji: '☁️',
    className: 'eco-cloud eco-cloud--small',
    style: { top: '18%', left: '-15%' },
    animate: { x: ['0vw', '120vw'] },
    duration: 130,
    delay: 20,
  },
  {
    id: 'bird-1',
    emoji: '🦅',
    className: 'eco-bird',
    style: { top: '22%', left: '-6%' },
    animate: { x: ['0vw', '112vw'], y: [0, -14, 0, 10, 0] },
    duration: 14,
    delay: 2,
  },
  {
    id: 'leaves-1',
    emoji: '🌿',
    className: 'eco-leaves',
    style: { top: '65%', left: '8%' },
    animate: { rotate: [-6, 6, -6], y: [0, 6, 0] },
    duration: 5,
    delay: 0,
    repeatType: 'mirror',
  },
  {
    id: 'leaves-2',
    emoji: '🌿',
    className: 'eco-leaves',
    style: { top: '70%', right: '10%' },
    animate: { rotate: [6, -6, 6], y: [0, 5, 0] },
    duration: 6,
    delay: 0.6,
    repeatType: 'mirror',
  },
  {
    id: 'butterfly-1',
    emoji: '🦋',
    className: 'eco-butterfly',
    style: { top: '38%', left: '20%' },
    animate: {
      x: [0, 24, 0, -18, 0],
      y: [0, -16, 4, -10, 0],
      rotate: [0, 8, -6, 4, 0],
    },
    duration: 9,
    delay: 1,
  },
  {
    id: 'fish-1',
    emoji: '🐟',
    className: 'eco-fish',
    style: { bottom: '10%', left: '-8%' },
    animate: { x: ['0vw', '40vw', '0vw'] },
    duration: 22,
    delay: 3,
  },
  {
    id: 'lion-1',
    emoji: '🦁',
    className: 'eco-lion',
    style: { bottom: '6%', left: '35%' },
    animate: { x: [0, 40, 0], y: [0, -1, 0] },
    duration: 26,
    delay: 4,
  },
  {
    id: 'elephant-1',
    emoji: '🐘',
    className: 'eco-elephant',
    style: { bottom: '4%', right: '12%' },
    animate: { opacity: [0, 1, 1, 0], x: [0, 10, 20, 30] },
    duration: 34,
    delay: 6,
  },
]

function Creature({ creature }) {
  const { id, emoji, img, className, style, animate, duration, delay, repeatType } = creature

  return (
    <motion.div
      key={id}
      className={`eco-creature ${className}`}
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
      animate={animate}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: repeatType || 'loop',
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      {img ? <img src={img} alt="" /> : <span>{emoji}</span>}
    </motion.div>
  )
}

function AnimalEcosystem() {
  const reduceMotion = useReducedMotion()

  // With reduced motion, show the scene as a calm, static illustration
  // instead of skipping it entirely — the animals stay, the movement
  // doesn't.
  if (reduceMotion) {
    return (
      <div className="animal-ecosystem" aria-hidden="true">
        {CREATURES.map((creature) => (
          <div
            key={creature.id}
            className={`eco-creature ${creature.className}`}
            style={{ position: 'absolute', pointerEvents: 'none', ...creature.style }}
          >
            {creature.img ? <img src={creature.img} alt="" /> : <span>{creature.emoji}</span>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="animal-ecosystem" aria-hidden="true">
      {CREATURES.map((creature) => (
        <Creature key={creature.id} creature={creature} />
      ))}
    </div>
  )
}

export default AnimalEcosystem