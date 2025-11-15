import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { getAllLocations, MANILA_CENTER } from '../config/locations'
import { dataVizColors } from '../config/globeColors'

export default function MapComponent({ onLocationSelect, onMapReady, opacity = 1, selectedLocation = null }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    const style = {
      version: 8,
      sources: {
        esri: {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Tiles © Esri — Source: Esri, Earthstar Geographics'
        }
      },
      layers: [
        { id: 'esri', type: 'raster', source: 'esri', minzoom: 0, maxzoom: 19 }
      ]
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style,
      center: MANILA_CENTER,
      zoom: 12
    })
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right')

    map.on('load', () => {
      // Reference labels overlay (places & boundaries)
      map.addSource('esri-labels', {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Labels © Esri'
      })
      map.addLayer({ id: 'esri-labels', type: 'raster', source: 'esri-labels', minzoom: 0, maxzoom: 19, paint: { 'raster-opacity': 0.8 } })

      // Add all heritage location polygons
      const locations = getAllLocations()
      const colors = {
        luneta: dataVizColors.map.location,
        binondo: '#f57c00',
        intramuros: '#7b1fa2',
        pasigRiver: '#0097a7'
      }

      locations.forEach((location) => {
        const color = colors[location.id] || dataVizColors.map.location
        const fillId = `${location.id}-fill`
        const outlineId = `${location.id}-outline`

        // Add polygon source
        map.addSource(`${location.id}-poly`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { locationId: location.id },
            geometry: {
              type: 'Polygon',
              coordinates: [location.polygon]
            }
          }
        })

        // Add fill layer
        map.addLayer({
          id: fillId,
          type: 'fill',
          source: `${location.id}-poly`,
          paint: { 'fill-color': color, 'fill-opacity': 0.15 }
        })

        // Add outline layer
        map.addLayer({
          id: outlineId,
          type: 'line',
          source: `${location.id}-poly`,
          paint: { 'line-color': color, 'line-width': 2, 'line-opacity': 0.8 }
        })

        // Hover interaction
        map.on('mouseenter', fillId, () => {
          map.getCanvas().style.cursor = 'pointer'
          map.setPaintProperty(fillId, 'fill-opacity', 0.25)
          map.setPaintProperty(outlineId, 'line-width', 3)
        })
        map.on('mouseleave', fillId, () => {
          map.getCanvas().style.cursor = ''
          map.setPaintProperty(fillId, 'fill-opacity', 0.15)
          map.setPaintProperty(outlineId, 'line-width', 2)
        })

        // Click interaction
        map.on('click', fillId, () => {
          onLocationSelect && onLocationSelect(location.id)
        })
      })

      // Add pulsing markers for all locations
      locations.forEach((location) => {
        const color = colors[location.id] || '#1976d2'
        const el = document.createElement('div')
        el.className = 'pulse'
        el.style.cursor = 'pointer'
        el.style.setProperty('--pulse-color', color)
        const marker = new maplibregl.Marker(el)
          .setLngLat(location.coordinates)
          .addTo(map)
        el.addEventListener('click', () => onLocationSelect && onLocationSelect(location.id))
        markersRef.current.push(marker)
      })

      mapRef.current = map
      onMapReady && onMapReady(map)
    })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mapContainer.current) {
      mapContainer.current.style.opacity = String(opacity)
      mapContainer.current.style.transition = 'opacity 0.6s ease'
    }
  }, [opacity])

  return (
    <div
      ref={mapContainer}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export function flyToLocation(map, locationId, { zoom = 16, speed = 1.2, curve = 1.6 } = {}) {
  return new Promise((resolve) => {
    console.log('flyToLocation called with:', { map: !!map, locationId, zoom, speed, curve })
    
    if (!map) {
      console.warn('flyToLocation: map is null')
      return resolve()
    }
    
    const locations = getAllLocations()
    const location = locations.find(loc => loc.id === locationId)
    
    if (!location) {
      console.warn('flyToLocation: location not found:', locationId)
      return resolve()
    }
    
    console.log('flyToLocation: flying to', location.name, 'at', location.coordinates)
    
    let resolved = false
    
    const onEnd = () => {
      if (resolved) return
      resolved = true
      console.log('flyToLocation: moveend event fired')
      map.off('moveend', onEnd)
      resolve()
    }
    
    // Fallback timeout in case moveend doesn't fire
    const timeout = setTimeout(() => {
      if (resolved) return
      resolved = true
      console.warn('flyToLocation: timeout reached, moveend never fired')
      map.off('moveend', onEnd)
      resolve()
    }, 3000) // 3 second timeout
    
    map.on('moveend', onEnd)
    
    try {
      map.flyTo({ 
        center: location.coordinates, 
        zoom: location.zoom || zoom, 
        speed, 
        curve, 
        essential: true 
      })
      console.log('flyToLocation: flyTo called successfully')
    } catch (error) {
      console.error('flyToLocation: error calling flyTo:', error)
      clearTimeout(timeout)
      map.off('moveend', onEnd)
      if (!resolved) {
        resolved = true
        resolve()
      }
    }
  })
}
