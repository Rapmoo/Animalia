import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import AnimalEcosystem from '../components/AnimalEcosystem'

const backgrounds = Object.values(
  import.meta.glob('../assets/backgrounds/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default',
    query: '?url',
  })
)

function Home() {
  const [currentBackground, setCurrentBackground] = useState(0)
  const [heroSearch, setHeroSearch] = useState('')
  const navigate = useNavigate()

  const handleHeroSearch = (event) => {
    event.preventDefault()
    const term = heroSearch.trim()
    navigate(term ? `/animals?q=${encodeURIComponent(term)}` : '/animals')
  }

  // BACKGROUND SLIDESHOW
  useEffect(() => {
    if (backgrounds.length <= 1) return

    const interval = setInterval(() => {
      setCurrentBackground((previous) => (previous + 1) % backgrounds.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section
        className="hero-section"
        id="home"
        aria-labelledby="hero-title"
      >
        {/* Background slideshow */}
        {backgrounds.length > 0 && (
          <AnimatePresence mode="sync">
            <motion.div
              key={currentBackground}
              className="hero-background"
              style={{
                backgroundImage: `url(${backgrounds[currentBackground]})`,
              }}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{
                opacity: { duration: 1.5 },
                scale: { duration: 8, ease: 'easeOut' },
              }}
            />
          </AnimatePresence>
        )}

        {/* Cinematic readability layers */}
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />

        {/* Existing ecosystem animation */}
        <AnimalEcosystem />

        {/* Hero content */}
        <div className="hero-content">
          <motion.p
            className="hero-kicker"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span />
            DISCOVER THE WILD
          </motion.p>

          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.12, ease: 'easeOut' }}
          >
            Every species
            <span>has a story.</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: 'easeOut' }}
          >
            Animalia is an interactive encyclopedia of the world's animals.
            Explore species, habitats, behavior, sounds, conservation, and
            the extraordinary stories that connect life on Earth.
          </motion.p>

          {/* Search — the fastest path in for a visitor who already
              knows what they're looking for */}
          <motion.form
            className="hero-search"
            role="search"
            onSubmit={handleHeroSearch}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.34, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <label htmlFor="hero-search-input" className="sr-only">
              Search for an animal by name
            </label>
            <input
              id="hero-search-input"
              type="search"
              placeholder="Search for an animal — try “otter” or “eagle”"
              value={heroSearch}
              onChange={(event) => setHeroSearch(event.target.value)}
            />

            <button type="submit">Search</button>
          </motion.form>

          {/* CTA */}
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.44, ease: 'easeOut' }}
          >
            <Link to="/animals" className="hero-button">
              Browse the database
              <span aria-hidden="true">→</span>
            </Link>

            <Link to="/map" className="hero-action-note hero-action-link">
              Or see where animals live on the map →
            </Link>
          </motion.div>

          {/* Statistics */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.52, ease: 'easeOut' }}
          >
            <div>
              <strong>2,400+</strong>
              <span>Species to explore</span>
            </div>

            <div>
              <strong>180+</strong>
              <span>Habitats</span>
            </div>

            <div>
              <strong>1</strong>
              <span>Living planet</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home