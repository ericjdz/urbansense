import { useEffect, useRef } from 'react'
import { Paper, Typography, Stack } from '@mui/material'
import { useFilters } from '../../contexts/FilterContext'

export default function HeatmapPanel({ data, mapLayer: layerOverride }) {
  let mapLayer
  try {
    mapLayer = layerOverride ?? useFilters().mapLayer
  } catch {
    mapLayer = layerOverride ?? 'foot'
  }
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.clientWidth
    const H = canvas.height = canvas.clientHeight
    ctx.clearRect(0, 0, W, H)
    const cols = data.gridSize?.w ?? (Math.max(...data.cells.map(c => c.x)) + 1)
    const rows = data.gridSize?.h ?? (Math.max(...data.cells.map(c => c.y)) + 1)
    const cw = W / cols
    const ch = H / rows
    const key = mapLayer === 'aqi' ? 'aqi' : 'foot'
    const maxVal = Math.max(...data.cells.map(c => c[key])) || 1
    for (const cell of data.cells) {
      const v = cell[key] / maxVal
      const color = mapLayer === 'aqi' ? rampAQI(v) : rampFoot(v)
      ctx.fillStyle = color
      ctx.fillRect(cell.x * cw, cell.y * ch, Math.ceil(cw), Math.ceil(ch))
    }

    // draw canopy markers on top
    for (const c of data.canopies ?? []) {
      const cx = c.x * cw + cw / 2
      const cy = c.y * ch + ch / 2
      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(4, Math.min(cw, ch) * 0.25), 0, Math.PI * 2)
      ctx.fillStyle = fillByStatus(c.status)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [data, mapLayer])

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minHeight: 300, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom>Heatmap ({mapLayer === 'aqi' ? 'AQI' : 'Foot Traffic'})</Typography>
      <div style={{ position: 'relative', flex: 1 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </div>
      <Stack direction="row" spacing={2} mt={1}>
        <LegendSwatch color={fillByStatus('ok')} label="OK" />
        <LegendSwatch color={fillByStatus('busy')} label="Busy" />
        <LegendSwatch color={fillByStatus('alert')} label="Alert" />
      </Stack>
    </Paper>
  )
}

function rampFoot(t) {
  // blue -> cyan -> yellow
  const r = Math.round(255 * Math.min(1, Math.max(0, (t - 0.5) * 2)))
  const g = Math.round(200 * t)
  const b = Math.round(255 * (1 - t))
  return `rgba(${r},${g},${b},0.9)`
}
function rampAQI(t) {
  // green -> orange -> red
  const r = Math.round(255 * Math.pow(t, 1))
  const g = Math.round(200 * (1 - t))
  const b = 40
  return `rgba(${r},${g},${b},0.9)`
}

function fillByStatus(status) {
  switch (status) {
    case 'ok': return 'rgba(129, 199, 132, 0.95)'
    case 'busy': return 'rgba(255, 167, 38, 0.95)'
    case 'alert': return 'rgba(239, 83, 80, 0.95)'
    default: return 'rgba(176, 190, 197, 0.95)'
  }
}

function LegendSwatch({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 12, opacity: 0.75 }}>{label}</span>
    </span>
  )
}
