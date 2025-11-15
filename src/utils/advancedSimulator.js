// Advanced simulator for maps, trends, flows, and correlated spatio-temporal visuals

export function generateAdvancedData({ hours = 24, bounds = null } = {}) {
  const gridW = 24
  const gridH = 16
  
  // Default bounds for Luneta if not provided
  const locationBounds = bounds || {
    minLng: 120.9757,
    maxLng: 120.9835,
    minLat: 14.5801,
    maxLat: 14.5870
  }

  // time axis
  const hoursLabels = Array.from({ length: hours }, (_, i) => `${(24 - hours + i).toString().padStart(2, '0')}:00`)

  // baseline foot traffic (people) and environment - scaled to realistic canopy coverage area
  const baselineFoot = hoursLabels.map((t, i) => ({ t, v: clamp(8 + 12 * Math.sin(i / 3), 0, 30) }))
  const baselineHeat = hoursLabels.map((t, i) => ({ t, v: clamp(26 + 6 * Math.sin(i / 4), 24, 35) }))

  // pollution event on the "west" side (x < gridW / 2) for a 60-minute window near the end
  const eventStart = Math.max(0, hours - 6)
  const eventEnd = hours - 3

  const cells = []
  const cellSeries = {} // per-cell time series: { [cellId]: { aqi: [], foot: [] } }

  // Fixed canopy positions laid out across the grid for consistency
  const canopyPositions = [
    { x: 4, y: 4 },
    { x: 9, y: 6 },
    { x: 13, y: 5 },
    { x: 18, y: 7 },
    { x: 7, y: 11 },
    { x: 19, y: 9 }
  ]
  const canopies = canopyPositions.map((pos, i) => ({
    id: `CAN-${i + 1}`,
    name: `Canopy ${i + 1}`,
    x: pos.x,
    y: pos.y,
    occupancy: 0,
    aqi: 0,
    status: 'ok'
  }))

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const id = `${x}-${y}`
      const baseSpatial = Math.sin(x / 2) * Math.cos(y / 3)
      const isWest = x < gridW / 2

      const aqiSeriesForCell = []
      const footSeriesForCell = []

      for (let i = 0; i < hours; i++) {
        const t = hoursLabels[i]

        // baseline values for this hour
        const baseFoot = baselineFoot[i].v
        const baseHeat = baselineHeat[i].v

        // Rule 3: pollution event not caused by people (wind from highway)
        let baselineAqi = 60 + baseSpatial * 20 + rand(-5, 5)
        if (i >= eventStart && i <= eventEnd && isWest) {
          baselineAqi = 160 + rand(-10, 10)
        }

        // Rule 2: people cause environmental load (positive correlation)
        const densityFactor = 0.3 + 0.7 * (1 + baseSpatial) / 2
        let actualFoot = clamp(baseFoot * densityFactor + rand(-3, 3), 0, 30)

        // Rule 1: people react to environment (negative correlation)
        const heatIndex = baseHeat
        if (heatIndex > 32 || baselineAqi > 100) {
          // reduce footfall in uncomfortable conditions
          actualFoot *= 0.65
        }

        // More nuanced people-to-pollution: higher density areas have bigger impact
        const pollutionMultiplier = 0.12 + (densityFactor - 0.3) * 0.08
        const aqi = clamp(baselineAqi + actualFoot * pollutionMultiplier, 20, 220)

        aqiSeriesForCell.push({ t, v: Math.round(aqi) })
        footSeriesForCell.push({ t, v: Math.round(actualFoot) })
      }

      cellSeries[id] = { aqi: aqiSeriesForCell, foot: footSeriesForCell }

      // snapshot of latest hour for the grid
      const latestFoot = footSeriesForCell[hours - 1].v
      const latestAqi = aqiSeriesForCell[hours - 1].v
      cells.push({ id, x, y, foot: latestFoot, aqi: latestAqi })
    }
  }

  // derive park-level aggregate series by averaging all cells at each timestep
  const aqiSeries = hoursLabels.map((t, i) => {
    let sum = 0
    let count = 0
    for (const id in cellSeries) {
      sum += cellSeries[id].aqi[i].v
      count++
    }
    return { t, v: Math.round(sum / count) }
  })

  const footSeriesToday = hoursLabels.map((t, i) => {
    let sum = 0
    let count = 0
    for (const id in cellSeries) {
      sum += cellSeries[id].foot[i].v
      count++
    }
    return { t, v: Math.round(sum / count) }
  })

  const footSeriesYesterday = footSeriesToday.map(p => ({ t: p.t, v: clamp(p.v + rand(-30, 30), 0, 220) }))

  const sankey = {
    nodes: [
      { name: 'Notification' },
      { name: 'View' },
      { name: 'Click' },
      { name: 'Redeem' }
    ],
    links: [
      { source: 0, target: 1, value: 1200 },
      { source: 1, target: 2, value: 540 },
      { source: 2, target: 3, value: 220 }
    ]
  }

  // Simple engagement funnel per heritage site / canopy cluster
  const engagementSites = [
    { id: 'RIZAL', name: 'Rizal Monument', passers: 1400 },
    { id: 'MUSEUM', name: 'Museum Gate', passers: 950 },
    { id: 'THEATER', name: 'Open-Air Auditorium', passers: 680 },
    { id: 'GARDEN', name: 'Garden Walk', passers: 520 }
  ].map(site => {
    const notified = Math.round(site.passers * rand(0.6, 0.8))
    const opened = Math.round(notified * rand(0.45, 0.6))
    const engaged = Math.round(opened * rand(0.6, 0.75))
    const deepEngaged = Math.round(engaged * rand(0.3, 0.4))
    return { ...site, notified, opened, engaged, deepEngaged }
  })

  // Derive canopy metrics from nearby grid cells so status is reactive
  for (const canopy of canopies) {
    const cell = cells.find(c => c.x === canopy.x && c.y === canopy.y)
    const occupancy = cell ? cell.foot : 0
    const aqi = cell ? cell.aqi : 0
    canopy.occupancy = occupancy
    canopy.aqi = aqi
    if (occupancy > 20) canopy.status = 'busy'
    else if (aqi > 150) canopy.status = 'alert'
    else canopy.status = 'ok'
  }

  const avgOcc = Math.round(canopies.reduce((s, c) => s + c.occupancy, 0) / canopies.length)
  const avgAqi = Math.round(canopies.reduce((s, c) => s + c.aqi, 0) / canopies.length)
  const heatIndex = Math.round(baselineHeat.reduce((s, p) => s + p.v, 0) / baselineHeat.length)

  // Generate network topology: gateway + sensor nodes
  const networkNodes = [
    { id: 'GW', type: 'gateway', status: 'online' },
    ...canopies.slice(0, 5).map((c, i) => ({
      id: `S${i + 1}`,
      type: 'sensor',
      status: c.status === 'alert' ? 'warning' : 'online',
      canopyId: c.id
    }))
  ]
  const networkLinks = networkNodes
    .filter(n => n.type === 'sensor')
    .map(n => ({ source: 'GW', target: n.id, strength: 0.7 + Math.random() * 0.3 }))

  return {
    gridSize: { w: gridW, h: gridH },
    cells,
    canopies,
    footSeriesToday,
    footSeriesYesterday,
    aqiSeries,
    sankey,
    engagementSites,
    kpis: { avgOcc, avgAqi, heatIndex },
    cellSeries,
    network: { nodes: networkNodes, links: networkLinks }
  }
}

// Map a logical grid cell (x, y) to a GeoJSON polygon using provided bounds.
// Accepts bounds parameter to support multiple heritage locations.
export function cellToGeoJsonPolygon(x, y, bounds = null) {
  // Default to Luneta bounds if not provided
  const locationBounds = bounds || {
    minLng: 120.9757,
    maxLng: 120.9832,
    minLat: 14.5787,
    maxLat: 14.5870
  }

  const gridW = 12
  const gridH = 8

  const lngStep = (locationBounds.maxLng - locationBounds.minLng) / gridW
  const latStep = (locationBounds.maxLat - locationBounds.minLat) / gridH

  const lng0 = locationBounds.minLng + x * lngStep
  const lng1 = locationBounds.minLng + (x + 1) * lngStep
  const lat0 = locationBounds.minLat + y * latStep
  const lat1 = locationBounds.minLat + (y + 1) * latStep

  return {
    type: 'Polygon',
    coordinates: [[
      [lng0, lat0],
      [lng1, lat0],
      [lng1, lat1],
      [lng0, lat1],
      [lng0, lat0]
    ]]
  }
}

// Simple helper to map canopy grid coordinates to lng/lat using the same grid mapping
export function canopyToLngLat(canopy, bounds = null) {
  const poly = cellToGeoJsonPolygon(canopy.x, canopy.y, bounds)
  const ring = poly.coordinates[0]
  // center of the cell polygon
  const lng = (ring[0][0] + ring[2][0]) / 2
  const lat = (ring[0][1] + ring[2][1]) / 2
  return [lng, lat]
}

function rand(min, max) { return Math.random() * (max - min) + min }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
