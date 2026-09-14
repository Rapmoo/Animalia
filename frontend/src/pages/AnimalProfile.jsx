import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import AnimalRangeMap from '../components/AnimalRangeMap'
import { getAnimalEmoji } from '../utils/animalEmoji'

const API_URL = 'http://localhost:8080/api'

// Shared entrance transition for sections scrolling into view.
const sectionMotionProps = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
}

function formatRange(min, max, unit) {
  if (min == null && max == null) return null

  const unitLabel = unit || ''

  if (min != null && max != null && min !== max) {
    return `${min} – ${max} ${unitLabel}`.trim()
  }

  const value = min ?? max
  return `${value} ${unitLabel}`.trim()
}

function formatDuration(seconds) {
  if (seconds == null) return null

  const total = Math.round(Number(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (bytes == null) return null

  const size = Number(bytes)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// Small inline "nothing here yet" state, used so media sections stay
// visible (rather than disappearing) when an animal has no sounds/photos.
function MediaEmptyState({ icon, message }) {
  return (
    <div className="media-empty-state">
      <span aria-hidden="true">{icon}</span>
      <p>{message}</p>
    </div>
  )
}

// One playable sound. Uses the real HTML5 <audio> element (native controls
// are already keyboard/screen-reader accessible), never autoplays, and
// falls back to a plain "unavailable" message if the file can't load
// instead of showing a broken player.
function SoundCard({ sound }) {
  const [audioError, setAudioError] = useState(false)
  const canPlay = Boolean(sound.storage_key) && !audioError

  return (
    <div className="sound-card">
      <div className="sound-card-info">
        <div className="sound-card-heading">
          <h3>{sound.sound_type}</h3>
          {sound.duration != null && (
            <span className="sound-duration">{formatDuration(sound.duration)}</span>
          )}
        </div>
        <p>{sound.description || sound.media_description}</p>
      </div>

      <div className="sound-card-player">
        {canPlay ? (
          <audio
            controls
            preload="metadata"
            src={`${API_URL}/media/${sound.media_id}`}
            onError={() => setAudioError(true)}
            aria-label={`${sound.sound_type} recording`}
          >
            Your browser does not support audio playback.
          </audio>
        ) : (
          <div className="media-unavailable" role="status">
            <span aria-hidden="true">🔇</span>
            <span>Audio unavailable</span>
          </div>
        )}
      </div>
    </div>
  )
}

// One photo in the gallery. Shows a skeleton while the image loads and a
// graceful fallback if the file is missing/unloadable.
function GalleryImage({ item }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <figure className="media-card gallery-card">
      <div className="media-image-wrap">
        {errored ? (
          <div className="media-placeholder" role="img" aria-label="Image unavailable">
            🖼️
          </div>
        ) : (
          <>
            {!loaded && <div className="media-skeleton" aria-hidden="true" />}
            <img
              className={`gallery-image${loaded ? ' is-loaded' : ''}`}
              src={`${API_URL}/media/${item.id}`}
              alt={item.caption || item.file_name}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
            />
          </>
        )}
      </div>

      <figcaption>
        <h3>{item.caption || item.file_name}</h3>
        {item.description && <p>{item.description}</p>}
        {(item.mime_type || item.file_size != null) && (
          <p className="media-meta">
            {[item.mime_type, formatFileSize(item.file_size)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </figcaption>
    </figure>
  )
}

// One video. The current schema's media_type enum only defines
// 'image' and 'audio', so this never renders today — but the profile
// endpoint already returns whatever `media` rows exist, so if a
// 'video' media_type is added later this renders it without further
// frontend changes.
function VideoCard({ item }) {
  const [errored, setErrored] = useState(false)

  return (
    <figure className="media-card video-card">
      {errored ? (
        <div className="media-placeholder" role="img" aria-label="Video unavailable">
          🎬
        </div>
      ) : (
        <video
          className="gallery-video"
          controls
          preload="metadata"
          onError={() => setErrored(true)}
        >
          <source src={`${API_URL}/media/${item.id}`} type={item.mime_type} />
          Your browser does not support video playback.
        </video>
      )}

      <figcaption>
        <h3>{item.caption || item.file_name}</h3>
        {item.description && <p>{item.description}</p>}
      </figcaption>
    </figure>
  )
}

function AnimalProfile() {
  const { id } = useParams()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${API_URL}/animals/${id}/profile`
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.error?.message || 'Failed to load animal profile'
          )
        }

        setProfile(result.data)
      } catch (err) {
        console.error('Failed to load animal profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="profile-page">
        <div className="status-message">
          Loading animal profile...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="status-message error">
          {error}
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const {
    animal,
    names,
    physical_characteristics,
    habitats,
    habitat_overview,
    geographic_range,
    diets,
    foods,
    behavior,
    sounds,
    reproduction,
    lifespan,
    conservation,
    ecological_roles,
    interesting_facts,
    media,
    biomes
  } = profile

  const classificationOrder = [
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'genus',
    'species'
  ]

  const classificationEntries = classificationOrder
    .filter((rank) => animal.classification[rank])
    .map((rank) => [rank, animal.classification[rank]])

  const length = formatRange(
    physical_characteristics?.length_min,
    physical_characteristics?.length_max,
    physical_characteristics?.length_unit
  )
  const weight = formatRange(
    physical_characteristics?.weight_min,
    physical_characteristics?.weight_max,
    physical_characteristics?.weight_unit
  )
  const height = formatRange(
    physical_characteristics?.height_min,
    physical_characteristics?.height_max,
    physical_characteristics?.height_unit
  )

  const [currentConservation, ...pastConservation] =
    conservation?.length > 0 ? conservation : [null]

  const images = media?.filter((item) => item.media_type === 'image') ?? []
  const videoMedia = media?.filter((item) => item.media_type === 'video') ?? []

  return (
    <div className="profile-page">

      {/* Back navigation */}
      <div className="profile-container">
        <motion.div
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'inline-block' }}
        >
          <Link to="/animals" className="back-link">
            ← Back to Animals
          </Link>
        </motion.div>
      </div>

      {/* 1. Animal introduction */}
      <section className="profile-hero">
        <div className="profile-container profile-hero-grid">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="eyebrow">ANIMAL PROFILE</p>

            <h1>{animal.common_name}</h1>

            <p className="profile-scientific-name">
              {animal.scientific_name}
            </p>

            <p className="profile-description">
              {animal.description ||
                'Explore detailed information about this animal.'}
            </p>
          </motion.div>

          <motion.div
            className="profile-animal-icon"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {getAnimalEmoji(animal.common_name)}
          </motion.div>

        </div>
      </section>

      {/* Alternative / regional names */}
      {names?.length > 0 && (
        <motion.section className="profile-section alternate" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">NAMES</p>
            <h2>Known Names</h2>

            <div className="tag-list">
              {names.map((item) => (
                <div className="name-tag" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.name_type}</span>
                </div>
              ))}
            </div>

          </div>
        </motion.section>
      )}

      {/* 2. Classification */}
      <motion.section className="profile-section" {...sectionMotionProps}>
        <div className="profile-container">

          <p className="eyebrow">CLASSIFICATION</p>
          <h2>Scientific Classification</h2>

          <div className="classification-grid">
            {classificationEntries.map(([rank, value]) => (
              <div className="classification-card" key={rank}>
                <span>{rank}</span>
                <strong>{value.name}</strong>
                <em>{value.scientific_name}</em>
              </div>
            ))}
          </div>

        </div>
      </motion.section>

      {/* Physical characteristics */}
      {physical_characteristics && (
        <motion.section className="profile-section alternate" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">PHYSICAL CHARACTERISTICS</p>
            <h2>Physical Characteristics</h2>

            <div className="stats-grid">

              <div className="stat-card">
                <span>Length</span>
                <strong>{length || 'Unknown'}</strong>
              </div>

              <div className="stat-card">
                <span>Weight</span>
                <strong>{weight || 'Unknown'}</strong>
              </div>

              <div className="stat-card">
                <span>Height</span>
                <strong>{height || 'Unknown'}</strong>
              </div>

            </div>

            {physical_characteristics.physical_features && (
              <p className="profile-text">
                {physical_characteristics.physical_features}
              </p>
            )}

          </div>
        </motion.section>
      )}

      {/* 3. Habitat */}
      <motion.section className="profile-section" {...sectionMotionProps}>
        <div className="profile-container">

          <div className="two-column">

            <div>
              <p className="eyebrow">HABITAT</p>
              <h2>Habitats</h2>

              {habitats?.length > 0 ? (
                <div className="info-list">
                  {habitats.map((habitat) => (
                    <div className="info-card" key={habitat.id}>
                      <h3>{habitat.name}</h3>
                      <p>{habitat.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">
                  No habitat information available.
                </p>
              )}
            </div>

            <div>
              <p className="eyebrow">BIOME</p>
              <h2>Biomes</h2>

              {biomes?.length > 0 ? (
                <div className="info-list">
                  {biomes.map((biome) => (
                    <div className="info-card" key={biome.id}>
                      <h3>{biome.name}</h3>
                      <p>{biome.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">
                  No biome information available.
                </p>
              )}
            </div>

          </div>

          {(habitat_overview?.habitat_description ||
            habitat_overview?.preferred_conditions) && (
            <div className="info-list habitat-overview-list">
              {habitat_overview.habitat_description && (
                <div className="info-card">
                  <h3>Habitat Overview</h3>
                  <p>{habitat_overview.habitat_description}</p>
                </div>
              )}

              {habitat_overview.preferred_conditions && (
                <div className="info-card">
                  <h3>Preferred Conditions</h3>
                  <p>{habitat_overview.preferred_conditions}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </motion.section>

      {/* 4. Diet */}
      <motion.section className="profile-section alternate" {...sectionMotionProps}>
        <div className="profile-container">

          <p className="eyebrow">DIET</p>
          <h2>What Does It Eat?</h2>

          {foods?.length > 0 && (
            <div className="tag-list">
              {foods.map((food) => (
                <div className="food-tag" key={food.id}>
                  {food.food_name}
                </div>
              ))}
            </div>
          )}

          {diets?.length > 0 && (
            <div className="diet-list">
              {diets.map((diet) => (
                <div className="info-card" key={diet.id}>
                  <h3>{diet.name}</h3>
                  <p>{diet.description}</p>
                </div>
              ))}
            </div>
          )}

          {behavior?.feeding_behavior && (
            <div className="diet-list">
              <div className="info-card">
                <h3>Feeding Behavior</h3>
                <p>{behavior.feeding_behavior}</p>
              </div>
            </div>
          )}

        </div>
      </motion.section>

      {/* 5. Behavior */}
      {behavior && (behavior.social_structure || behavior.communication || behavior.behaviors) && (
        <motion.section className="profile-section" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">BEHAVIOR</p>
            <h2>Behavior & Social Life</h2>

            <div className="behavior-grid">

              {behavior.social_structure && (
                <div className="info-card">
                  <h3>Social Behavior</h3>
                  <p>{behavior.social_structure}</p>
                </div>
              )}

              {behavior.communication && (
                <div className="info-card">
                  <h3>Communication</h3>
                  <p>{behavior.communication}</p>
                </div>
              )}

              {behavior.behaviors && (
                <div className="info-card">
                  <h3>Activity Patterns & General Behavior</h3>
                  <p>{behavior.behaviors}</p>
                </div>
              )}

            </div>

          </div>
        </motion.section>
      )}

      {/* Reproduction & lifespan */}
      {(reproduction || lifespan) && (
        <motion.section className="profile-section alternate" {...sectionMotionProps}>
          <div className="profile-container">

            <div className="two-column">

              {reproduction && (
                <div>
                  <p className="eyebrow">REPRODUCTION</p>
                  <h2>Reproduction</h2>

                  <div className="info-list">
                    {reproduction.reproduction_type && (
                      <div className="info-card">
                        <h3>Type</h3>
                        <p>{reproduction.reproduction_type}</p>
                      </div>
                    )}

                    {reproduction.gestation_or_incubation && (
                      <div className="info-card">
                        <h3>Gestation / Incubation</h3>
                        <p>
                          {reproduction.gestation_or_incubation}
                        </p>
                      </div>
                    )}

                    {(reproduction.offspring_count_min != null ||
                      reproduction.offspring_count_max != null) && (
                      <div className="info-card">
                        <h3>Offspring</h3>
                        <p>
                          {reproduction.offspring_count_min}
                          {' – '}
                          {reproduction.offspring_count_max}
                        </p>
                      </div>
                    )}

                    {reproduction.breeding_season && (
                      <div className="info-card">
                        <h3>Breeding Season</h3>
                        <p>{reproduction.breeding_season}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lifespan && (
                <div>
                  <p className="eyebrow">LIFESPAN</p>
                  <h2>Lifespan</h2>

                  <div className="stats-grid">

                    <div className="stat-card">
                      <span>Average</span>
                      <strong>
                        {lifespan.lifespan_average != null
                          ? `${lifespan.lifespan_average} years`
                          : 'Unknown'}
                      </strong>
                    </div>

                    <div className="stat-card">
                      <span>Maximum</span>
                      <strong>
                        {lifespan.lifespan_maximum != null
                          ? `${lifespan.lifespan_maximum} years`
                          : 'Unknown'}
                      </strong>
                    </div>

                  </div>

                  {lifespan.lifespan_conditions && (
                    <p className="profile-text">
                      {lifespan.lifespan_conditions}
                    </p>
                  )}
                </div>
              )}

            </div>

          </div>
        </motion.section>
      )}

      {/* 6. Geographic range */}
      <motion.section className="profile-section" {...sectionMotionProps}>
        <div className="profile-container">

          <p className="eyebrow">GEOGRAPHIC DISTRIBUTION</p>
          <h2>Geographic Range</h2>

          <div className="range-card">
            <AnimalRangeMap geographicRange={geographic_range} />

            <div className="info-list">
              {geographic_range?.length > 0 ? (
                geographic_range.map((range) => (
                  <div className="info-card" key={range.id}>
                    <h3>{range.range_type}</h3>
                    <p>{range.description}</p>
                  </div>
                ))
              ) : (
                <p className="empty-text">
                  No geographic range information available.
                </p>
              )}
            </div>
          </div>

        </div>
      </motion.section>

      {/* 7. Conservation */}
      {currentConservation && (
        <motion.section className="profile-section alternate" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">CONSERVATION</p>
            <h2>Conservation Status</h2>

            <div className="conservation-card">

              <div className="conservation-status">
                {currentConservation.status}
              </div>

              {currentConservation.population_trend && (
                <p>
                  <strong>Population trend:</strong>{' '}
                  {currentConservation.population_trend}
                </p>
              )}

              {currentConservation.threats && (
                <p>
                  <strong>Threats:</strong>{' '}
                  {currentConservation.threats}
                </p>
              )}

              {currentConservation.conservation_efforts && (
                <p>
                  <strong>Conservation actions:</strong>{' '}
                  {currentConservation.conservation_efforts}
                </p>
              )}

              {currentConservation.recorded_at && (
                <p className="conservation-record-date">
                  Recorded {new Date(currentConservation.recorded_at).toLocaleDateString()}
                </p>
              )}

            </div>

            {pastConservation?.length > 0 && (
              <div className="conservation-history">
                <h3>Conservation History</h3>

                <div className="info-list">
                  {pastConservation.map((record) => (
                    <div className="info-card" key={record.id}>
                      <h3>{record.status}</h3>
                      {record.population_trend && (
                        <p>
                          <strong>Population trend:</strong>{' '}
                          {record.population_trend}
                        </p>
                      )}
                      {record.threats && (
                        <p>
                          <strong>Threats:</strong> {record.threats}
                        </p>
                      )}
                      {record.conservation_efforts && (
                        <p>
                          <strong>Conservation actions:</strong>{' '}
                          {record.conservation_efforts}
                        </p>
                      )}
                      {record.recorded_at && (
                        <p className="conservation-record-date">
                          Recorded {new Date(record.recorded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.section>
      )}

      {/* Ecological role */}
      {ecological_roles?.length > 0 && (
        <motion.section className="profile-section" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">ECOLOGY</p>
            <h2>Ecological Role</h2>

            <div className="behavior-grid">
              {ecological_roles.map((role) => (
                <div className="info-card" key={role.id}>
                  <h3>{role.role}</h3>
                  {role.food_web_role && (
                    <p>
                      <strong>Food web role:</strong>{' '}
                      {role.food_web_role}
                    </p>
                  )}
                  {role.ecosystem_impact && (
                    <p>
                      <strong>Ecosystem impact:</strong>{' '}
                      {role.ecosystem_impact}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>
        </motion.section>
      )}

      {/* 8. Sounds and media */}
      <motion.section className="profile-section alternate" {...sectionMotionProps}>
        <div className="profile-container">

          <p className="eyebrow">SOUNDS</p>
          <h2>Animal Sounds</h2>

          {sounds?.length > 0 ? (
            <div className="sound-list">
              {sounds.map((sound) => (
                <SoundCard sound={sound} key={sound.sound_id} />
              ))}
            </div>
          ) : (
            <MediaEmptyState
              icon="🔇"
              message="No recorded sounds available for this animal yet."
            />
          )}

        </div>
      </motion.section>

      <motion.section className="profile-section" {...sectionMotionProps}>
        <div className="profile-container">

          <p className="eyebrow">GALLERY</p>
          <h2>Photos</h2>

          {images.length > 0 ? (
            <div className="media-grid">
              {images.map((item) => (
                <GalleryImage item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <MediaEmptyState
              icon="🖼️"
              message="No photos have been added for this animal yet."
            />
          )}

        </div>
      </motion.section>

      {/* The media_type enum currently only supports image/audio, so this
          section is invisible today and appears automatically once video
          media exists. */}
      {videoMedia.length > 0 && (
        <motion.section className="profile-section alternate" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">VIDEO</p>
            <h2>Videos</h2>

            <div className="media-grid">
              {videoMedia.map((item) => (
                <VideoCard item={item} key={item.id} />
              ))}
            </div>

          </div>
        </motion.section>
      )}

      {/* 9. Interesting facts */}
      {interesting_facts?.length > 0 && (
        <motion.section className="profile-section alternate" {...sectionMotionProps}>
          <div className="profile-container">

            <p className="eyebrow">DID YOU KNOW?</p>
            <h2>Interesting Facts</h2>

            <motion.div
              className="facts-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              {interesting_facts.map((fact, index) => (
                <motion.div
                  className="fact-card"
                  key={fact.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <span>0{index + 1}</span>
                  <p>{fact.fact}</p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </motion.section>
      )}

    </div>
  )
}

export default AnimalProfile