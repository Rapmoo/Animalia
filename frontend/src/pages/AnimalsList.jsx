import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { getAnimalEmoji } from '../utils/animalEmoji'

const API_URL = 'http://localhost:8080/api'

function AnimalsList() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [submittedTerm, setSubmittedTerm] = useState(searchParams.get('q') || '')

  // LIVE (DEBOUNCED) SEARCH
  // Filters as the person types, 250ms after they pause — feels instant
  // without re-filtering on every keystroke. Enter still applies
  // immediately for anyone who prefers to type-and-submit.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSubmittedTerm(searchTerm.trim())
    }, 250)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  // LOAD ANIMALS
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/animals`)

        if (!response.ok) {
          throw new Error('Failed to load animals')
        }

        const data = await response.json()

        const animalList = Array.isArray(data)
          ? data
          : data.animals || data.data || []

        setAnimals(animalList)
      } catch (err) {
        console.error('Failed to load animals:', err)
        setError('Unable to load animals.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnimals()
  }, [])

  // SEARCH
  // Bypasses the debounce for an instant result (Enter key or button).
  const applySearchNow = () => {
    setSubmittedTerm(searchTerm.trim())
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSubmittedTerm('')
  }

  const normalizedSearch = submittedTerm.toLowerCase()

  const filteredAnimals = normalizedSearch
    ? animals.filter((animal) => {
        const searchableValues = [
          animal.common_name,
          animal.scientific_name,
          animal.rank,
        ]

        return searchableValues
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          )
      })
    : animals

  return (
    <div className="animals-page">
      {/* ANIMAL DATABASE */}
      <section className="animals-section" id="animals">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow">ANIMAL DATABASE</p>
          <h2>Explore Animals</h2>
          <p>
            Discover species, learn their stories, and explore the
            diversity of the animal kingdom.
          </p>

          {/* Search controls */}
          <motion.div
            className="animal-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <label htmlFor="animals-search-input" className="sr-only">
              Search by common name, scientific name, or rank
            </label>
            <input
              id="animals-search-input"
              type="search"
              placeholder="Search by name — e.g. “fox” or “Vulpes”..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applySearchNow()
                }
              }}
            />

            <motion.button
              type="button"
              onClick={applySearchNow}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>

            {(searchTerm || submittedTerm) && (
              <motion.button
                type="button"
                className="clear-search"
                onClick={clearSearch}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear
              </motion.button>
            )}
          </motion.div>

          {!loading && !error && submittedTerm && (
            <p className="search-result-count" role="status">
              {filteredAnimals.length === 0
                ? `No matches for "${submittedTerm}"`
                : `${filteredAnimals.length} animal${filteredAnimals.length === 1 ? '' : 's'} found`}
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div
            className="status-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Loading animals...
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            className="status-message error"
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Animal grid */}
        {!loading && !error && (
          <motion.div
            className="animal-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredAnimals.map((animal) => (
                <motion.article
                  className="animal-card"
                  key={animal.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <div className="animal-image">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.25 }}
                    >
                      {getAnimalEmoji(animal.common_name)}
                    </motion.span>
                  </div>

                  <div className="animal-card-content">
                    {animal.rank && (
                      <span className="specimen-tag">{animal.rank}</span>
                    )}

                    <h3>{animal.common_name || 'Unnamed animal'}</h3>

                    {animal.scientific_name && (
                      <p className="scientific-name">
                        {animal.scientific_name}
                      </p>
                    )}

                    <motion.div
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Link
                        to={`/animals/${animal.id}`}
                        className="profile-button"
                      >
                        View Profile
                        <span aria-hidden="true">→</span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {/* No results */}
            {filteredAnimals.length === 0 && (
              <motion.div
                className="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="no-results-icon" aria-hidden="true">
                  🔎
                </span>

                <h3>No animals found</h3>

                <p>
                  {submittedTerm
                    ? `We couldn't find anything matching "${submittedTerm}". Try a different name.`
                    : 'There are no animals in the database yet.'}
                </p>

                {submittedTerm && (
                  <motion.button
                    type="button"
                    onClick={clearSearch}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear search
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  )
}

export default AnimalsList