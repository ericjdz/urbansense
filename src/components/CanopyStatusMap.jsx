import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

const DEFAULT_CENTER = [120.9794, 14.5826]

export default function CanopyStatusMap({ canopies = [], onSelect }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

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

    const map = new maplibregl.Map({ container: mapContainer.current, style, center: DEFAULT_CENTER, zoom: 15 })
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right')

    map.on('load', () => {
      // Optional labels overlay
      map.addSource('esri-labels', {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256
      })
      map.addLayer({ id: 'esri-labels', type: 'raster', source: 'esri-labels', minzoom: 0, maxzoom: 19, paint: { 'raster-opacity': 0.8 } })
      renderMarkers(map, canopies, onSelect, markersRef)
    })

    mapRef.current = map
    return () => {
      clearMarkers(markersRef)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    renderMarkers(mapRef.current, canopies, onSelect, markersRef)
  }, [canopies, onSelect])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
}

function renderMarkers(map, canopies, onSelect, markersRef) {
  clearMarkers(markersRef)
  canopies.forEach(c => {
    const el = document.createElement('div')
    const color = canopyStatus[c.status]?.color || canopyStatus.ok.color
    const border = c.offline ? '2px solid #ff1744' : '2px solid rgba(0,0,0,0.3)'
    el.style.width = '18px'
    el.style.height = '18px'
    el.style.borderRadius = '50%'
    el.style.background = color
    el.style.border = border
    el.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.2)'
    el.style.cursor = 'pointer'
    el.title = `${c.name}\nOcc ${c.occupancy}% • AQI ${c.aqi}`

    if (c.maintenanceDue) {
      const wrench = document.createElement('div')
      wrench.textContent = '🔧'
      wrench.style.position = 'absolute'
      wrench.style.transform = 'translate(-6px, -18px)'
      wrench.style.fontSize = '12px'
      el.appendChild(wrench)
    }

    el.addEventListener('click', () => onSelect && onSelect(c))
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([c.lng, c.lat])
      .addTo(map)
    markersRef.current.push(m)
  })
}

function clearMarkers(markersRef) {
  markersRef.current.forEach(m => m.remove())
  markersRef.current = []
}
