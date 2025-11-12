import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

const MANILA_CENTER = [120.9842, 14.5995]
const LUNETA = [120.9794, 14.5826]

export default function MapComponent({ onMarkerClick, onMapReady, opacity = 1 }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

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

      // Luneta vicinity polygon
      map.addSource('luneta-poly', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [120.9757, 14.5856],
              [120.9820, 14.5870],
              [120.9832, 14.5798],
              [120.9772, 14.5787],
              [120.9757, 14.5856]
            ]]
          }
        }
      })
      map.addLayer({
        id: 'luneta-fill',
        type: 'fill',
        source: 'luneta-poly',
        paint: { 'fill-color': '#1976d2', 'fill-opacity': 0.15 }
      })
      map.addLayer({
        id: 'luneta-outline',
        type: 'line',
        source: 'luneta-poly',
        paint: { 'line-color': '#1976d2', 'line-width': 2, 'line-opacity': 0.8 }
      })

      // Interactivity: hover + click on polygon
      map.on('mouseenter', 'luneta-fill', () => {
        map.getCanvas().style.cursor = 'pointer'
        map.setPaintProperty('luneta-fill', 'fill-opacity', 0.25)
        map.setPaintProperty('luneta-outline', 'line-width', 3)
      })
      map.on('mouseleave', 'luneta-fill', () => {
        map.getCanvas().style.cursor = ''
        map.setPaintProperty('luneta-fill', 'fill-opacity', 0.15)
        map.setPaintProperty('luneta-outline', 'line-width', 2)
      })
      map.on('click', 'luneta-fill', () => {
        onMarkerClick && onMarkerClick()
      })

      // Pulsing marker
      const el = document.createElement('div')
      el.className = 'pulse'
      el.style.cursor = 'pointer'
      const marker = new maplibregl.Marker(el).setLngLat(LUNETA).addTo(map)
      el.addEventListener('click', () => onMarkerClick && onMarkerClick())

      mapRef.current = map
      markerRef.current = marker
      onMapReady && onMapReady(map)
    })

    return () => {
      if (markerRef.current) markerRef.current.remove()
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

  return <div ref={mapContainer} className="map-container" />
}

export function flyToLuneta(map, { zoom = 16, speed = 1.2, curve = 1.6 } = {}) {
  return new Promise((resolve) => {
    if (!map) return resolve()
    const onEnd = () => {
      map.off('moveend', onEnd)
      resolve()
    }
    map.on('moveend', onEnd)
    map.flyTo({ center: LUNETA, zoom, speed, curve, essential: true })
  })
}
