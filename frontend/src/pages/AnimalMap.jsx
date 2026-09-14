import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import AnimalMapExplorer from '../components/AnimalMApExplorer'
import { getAnimalEmoji } from '../utils/animalEmoji'

const API_URL = 'http://localhost:8080/api'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
}

function AnimalMap() {
  const [animals, setAnimals] = useState([])
  const [animalsLoading, setAnimalsLoading] = useState(true)
  const [animalsError, setAnimalsError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [rangesByAnimal, setRangesByAnimal] = useState({})
  const [rangeLoading, setRangeLoading] = useState(false)
  const [rangeError, setRangeError] = useState(null)

  // Load the animal list for the sidebar.
  useEffect(() => {
    async function fetchAnimals() {
      try {
        setAnimalsLoading(true)
        const response = await fetch(`${API_URL}/animals`)
        if (!response.ok) throw new Error('Failed to load animals')
        const data = await response.json()
        const animalList = Array.isArray(data) ? data : data.animals || data.data || []
        setAnimals(animalList)
        setAnimalsError(null)
      } catch (err) {
        console.error(err)
        setAnimalsError('Unable to load animals.')
      } finally {
        setAnimalsLoading(false)
      }
    }

    fetchAnimals()
  }, [])

  // Load the geographic range for whichever animal is selected (cached
  // per animal id so re-selecting doesn't refetch).
  useEffect(() => {
    if (!selectedAnimal || rangesByAnimal[selectedAnimal.id]) return

    let cancelled = false

    async function fetchRange() {
      try {
        setRangeLoading(true)
        setRangeError(null)
        const response = await fetch(`${API_URL}/animals/${selectedAnimal.id}/range`)
        if (!response.ok) throw new Error('Failed to load geographic range')
        const data = await response.json()
        const rangeList = Array.isArray(data) ? data : data.ranges || data.data || []
        if (!cancelled) {
          setRangesByAnimal((prev) => ({ ...prev, [selectedAnimal.id]: rangeList }))
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) setRangeError('Unable to load this range.')
      } finally {
        if (!cancelled) setRangeLoading(false)
      }
    }

    fetchRange()

    return () => {
      cancelled = true
    }
  }, [selectedAnimal, rangesByAnimal])

  const ranges = selectedAnimal ? rangesByAnimal[selectedAnimal.id] ?? null : null

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredAnimals = useMemo(() => {
    if (!normalizedSearch) return animals
    return animals.filter((animal) =>
      (animal.common_name ?? '').toLowerCase().includes(normalizedSearch)
    )
  }, [animals, normalizedSearch])

  return (
    <div className="map-page">
      <motion.div
        className="map-page-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="eyebrow">GEOGRAPHIC RANGES</p>
        <h1>Explore where animals live.</h1>
        <p className="map-page-description">
          Pick an animal from the list to see its native, introduced,
          historical, and seasonal ranges plotted on the map.
        </p>
      </motion.div>

      <motion.div
        className="map-layout"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <aside className="map-sidebar">
          <div className="map-sidebar-search">
            <input
              type="text"
              placeholder="Search animals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {animalsLoading && (
            <p className="map-sidebar-status">Loading animals…</p>
          )}

          {animalsError && (
            <p className="map-sidebar-status error">{animalsError}</p>
          )}

          {!animalsLoading && !animalsError && (
            <motion.div
              className="map-sidebar-list"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredAnimals.map((animal) => (
                <motion.button
                  key={animal.id}
                  type="button"
                  variants={itemVariants}
                  className={`map-sidebar-item${
                    selectedAnimal?.id === animal.id ? ' active' : ''
                  }`}
                  onClick={() => setSelectedAnimal(animal)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="map-sidebar-item-emoji" aria-hidden="true">
                    {getAnimalEmoji(animal.common_name)}
                  </span>
                  <span className="map-sidebar-item-text">
                    <strong>{animal.common_name || 'Unnamed animal'}</strong>
                    <em>{animal.scientific_name}</em>
                  </span>
                </motion.button>
              ))}

              {filteredAnimals.length === 0 && (
                <p className="map-sidebar-status">No animals match "{searchTerm}".</p>
              )}
            </motion.div>
          )}
        </aside>

        <div className="map-main">
          <AnimalMapExplorer
            animal={selectedAnimal}
            ranges={ranges}
            loading={rangeLoading}
            error={rangeError}
          />

          <div className="map-legend">
            <span className="map-legend-item map-legend-native">Native</span>
            <span className="map-legend-item map-legend-introduced">Introduced</span>
            <span className="map-legend-item map-legend-historical">Historical</span>
            <span className="map-legend-item map-legend-seasonal">Seasonal</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnimalMap