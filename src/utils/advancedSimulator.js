// Advanced simulator for maps, trends, flows, and network visuals

export function generateAdvancedData({ hours = 24 } = {}) {
  const gridW = 12
  const gridH = 8
  const cells = []
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const base = Math.sin(x / 2) * Math.cos(y / 3)
      const foot = Math.max(0, 30 + base * 20 + rand(-10, 10))
      const aqi = Math.max(20, 60 + base * 30 + rand(-15, 15))
      cells.push({ id: `${x}-${y}`, x, y, foot: Math.round(foot), aqi: Math.round(aqi) })
    }
  }

  // Fixed canopy positions laid out across the grid for consistency
  const canopyPositions = [
    { x: 2, y: 2 }, { x: 4, y: 3 }, { x: 6, y: 2 }, { x: 8, y: 4 }, { x: 3, y: 6 }, { x: 9, y: 5 }
  ]
  const canopies = canopyPositions.map((pos, i) => {
    const occupancy = Math.round(30 + Math.random() * 70)
    const aqi = Math.round(50 + Math.random() * 80)
    const status = occupancy > 85 ? 'busy' : aqi > 120 ? 'alert' : 'ok'
    return { id: `CAN-${i + 1}`, name: `Canopy ${i + 1}`, occupancy, aqi, status, x: pos.x, y: pos.y }
  })

  const hoursLabels = Array.from({ length: hours }, (_, i) => `${(24 - hours + i).toString().padStart(2, '0')}:00`)
  const footSeriesToday = hoursLabels.map((t, i) => ({ t, v: clamp(50 + 40 * Math.sin(i / 3) + rand(-15, 15), 0, 200) }))
  const footSeriesYesterday = hoursLabels.map((t, i) => ({ t, v: clamp(45 + 35 * Math.sin((i + 2) / 3) + rand(-15, 15), 0, 200) }))
  const aqiSeries = hoursLabels.map((t, i) => ({ t, v: clamp(60 + 25 * Math.sin(i / 4) + rand(-10, 10), 30, 180) }))

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

  const network = {
    nodes: [
      { id: 'Gateway', type: 'gateway' },
      { id: 'AQ-1', type: 'aq' },
      { id: 'AQ-2', type: 'aq' },
      { id: 'Canopy-1', type: 'canopy' },
      { id: 'Cam-1', type: 'camera' },
      { id: 'Cam-2', type: 'camera' }
    ],
    links: [
      { source: 'AQ-1', target: 'Gateway' },
      { source: 'AQ-2', target: 'Gateway' },
      { source: 'Canopy-1', target: 'Gateway' },
      { source: 'Cam-1', target: 'Gateway' },
      { source: 'Cam-2', target: 'Gateway' }
    ]
  }

  const avgOcc = Math.round(canopies.reduce((s, c) => s + c.occupancy, 0) / canopies.length)
  const avgAqi = Math.round(canopies.reduce((s, c) => s + c.aqi, 0) / canopies.length)
  const heatIndex = Math.round(30 + Math.random() * 20)

  return { gridSize: { w: gridW, h: gridH }, cells, canopies, footSeriesToday, footSeriesYesterday, aqiSeries, sankey, network, kpis: { avgOcc, avgAqi, heatIndex } }
}

function rand(min, max) { return Math.random() * (max - min) + min }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
