import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Colors are keyed off the real `range_type` enum values from the
// database (native / introduced / historical / seasonal) so the legend
// and map styling reflect actual PostGIS data, not invented categories.
const RANGE_STYLES = {
  native: { color: '#294635', fillColor: '#6f9463', dash: null },
  introduced: { color: '#b06a1c', fillColor: '#e9a24d', dash: null },
  historical: { color: '#7d7568', fillColor: '#c2b9a6', dash: '6 5' },
  seasonal: { color: '#2f6f8f', fillColor: '#7fb8d6', dash: '2 6' },
}

function styleForRange(rangeType) {
  const preset = RANGE_STYLES[rangeType] || RANGE_STYLES.native
  return {
    color: preset.color,
    weight: 2,
    fillColor: preset.fillColor,
    fillOpacity: 0.35,
    dashArray: preset.dash,
  }
}

function markerIcon(rangeType) {
  const preset = RANGE_STYLES[rangeType] || RANGE_STYLES.native
  return L.divIcon({
    className: 'range-marker',
    html: `<span class="range-marker-dot" style="background:${preset.color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  })
}

// Fits the map to the selected animal's combined range geometry whenever
// it changes, per the "fit the map to the selected animal's range" spec.
function FitToRanges({ featureCollection }) {
  const map = useMap()

  useEffect(() => {
    if (!featureCollection || featureCollection.features.length === 0) return

    const layer = L.geoJSON(featureCollection)
    const bounds = layer.getBounds()

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 7 })
    }
  }, [featureCollection, map])

  return null
}

function RangePopup({ animal, range }) {
  return (
    <div className="range-popup">
      <p className="range-popup-eyebrow">{range.range_type}</p>
      <h3>{animal.common_name}</h3>
      <p className="range-popup-scientific">{animal.scientific_name}</p>
      {range.description && (
        <p className="range-popup-description">{range.description}</p>
      )}
      <Link to={`/animals/${animal.id}`} className="range-popup-link">
        View full profile →
      </Link>
    </div>
  )
}

function AnimalMapExplorer({ animal, ranges, loading, error }) {
  const featureCollection = useMemo(() => {
    if (!ranges) return null

    const features = ranges
      .filter((range) => range.geometry)
      .map((range) => ({
        type: 'Feature',
        properties: { id: range.id, range_type: range.range_type },
        geometry: range.geometry,
      }))

    return { type: 'FeatureCollection', features }
  }, [ranges])

  if (loading) {
    return (
      <div className="map-state map-state-loading">
        <span className="map-state-spinner" aria-hidden="true" />
        <p>Loading geographic range…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="map-state map-state-error">
        <span className="map-state-icon" aria-hidden="true">⚠️</span>
        <h3>Couldn't load the range</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="map-state map-state-empty">
        <span className="map-state-icon" aria-hidden="true">🗺️</span>
        <h3>Select an animal</h3>
        <p>Choose an animal from the list to view its geographic range.</p>
      </div>
    )
  }

  if (!featureCollection || featureCollection.features.length === 0) {
    return (
      <div className="map-state map-state-empty">
        <span className="map-state-icon" aria-hidden="true">📍</span>
        <h3>No range data for {animal.common_name}</h3>
        <p>
          This animal doesn't have any geographic range recorded in the
          database yet.
        </p>
      </div>
    )
  }

  return (
    <MapContainer
      key={animal.id}
      center={[10, 20]}
      zoom={3}
      scrollWheelZoom
      className="animal-map-container"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToRanges featureCollection={featureCollection} />

      <GeoJSON
        data={featureCollection}
        style={(feature) => styleForRange(feature.properties.range_type)}
        onEachFeature={(feature, layer) => {
          const range = ranges.find((r) => r.id === feature.properties.id)
          if (!range) return

          layer.bindPopup(
            L.Util.template(
              '<div class="range-popup"><p class="range-popup-eyebrow">{type}</p><h3>{name}</h3><p class="range-popup-scientific">{sci}</p>{desc}<a class="range-popup-link" href="{href}">View full profile →</a></div>',
              {
                type: range.range_type,
                name: animal.common_name,
                sci: animal.scientific_name,
                desc: range.description
                  ? `<p class="range-popup-description">${range.description}</p>`
                  : '',
                href: `/animals/${animal.id}`,
              }
            )
          )
        }}
      />

      {ranges
        .filter((range) => range.representative_point)
        .map((range) => {
          const [lng, lat] = range.representative_point.coordinates
          return (
            <Marker
              key={range.id}
              position={[lat, lng]}
              icon={markerIcon(range.range_type)}
            >
              <Popup>
                <RangePopup animal={animal} range={range} />
              </Popup>
            </Marker>
          )
        })}
    </MapContainer>
  )
}

export default AnimalMapExplorer