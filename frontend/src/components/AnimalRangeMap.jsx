import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function AnimalRangeMap({ geographicRange }) {
  if (!geographicRange || geographicRange.length === 0) {
    return (
      <div className="map-placeholder">
        No geographic range data available.
      </div>
    )
  }

  const features = geographicRange
    .filter((range) => range.geometry)
    .map((range) => ({
      type: 'Feature',
      properties: {
        range_type: range.range_type,
        description: range.description,
      },
      geometry: range.geometry,
    }))

  if (features.length === 0) {
    return (
      <div className="map-placeholder">
        No geographic geometry available.
      </div>
    )
  }

  const geoJson = {
    type: 'FeatureCollection',
    features,
  }

  return (
    <MapContainer
      center={[1.5, 37]}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <GeoJSON
        data={geoJson}
        style={{
          color: '#294635',
          weight: 2,
          fillColor: '#8fa77b',
          fillOpacity: 0.4,
        }}
        onEachFeature={(feature, layer) => {
          layer.bindPopup(`
            <strong>${feature.properties.range_type}</strong>
            <br />
            ${feature.properties.description || ''}
          `)
        }}
      />
    </MapContainer>
  )
}

export default AnimalRangeMap