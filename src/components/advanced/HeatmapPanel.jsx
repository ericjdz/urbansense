import { Paper, Typography, Stack, Box } from '@mui/material'
import { useFilters } from '../../contexts/FilterContext'
import { dataVizColors, interpolateColor, canopyStatus } from '../../config/globeColors'

export default function HeatmapPanel({ data, mapLayer: layerOverride }) {
  if (!data || !data.cells) return null
  
  let mapLayer
  let filters
  try {
    filters = useFilters()
    mapLayer = layerOverride ?? filters.mapLayer
  } catch {
    filters = null
    mapLayer = layerOverride ?? 'foot'
  }

  const cols = data.gridSize?.w ?? (Math.max(...data.cells.map(c => c.x)) + 1)
  const rows = data.gridSize?.h ?? (Math.max(...data.cells.map(c => c.y)) + 1)
  const key = mapLayer === 'aqi' ? 'aqi' : 'foot'
  const maxVal = Math.max(...data.cells.map(c => c[key])) || 1

  const handleCellClick = cell => {
    if (!filters) return
    filters.setSelectedCellId(cell.id)
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minHeight: 300, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom>Heatmap ({mapLayer === 'aqi' ? 'AQI' : 'Foot Traffic'})</Typography>
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {data.cells.map(cell => {
          const v = cell[key] / maxVal
          const color = mapLayer === 'aqi' ? rampAQI(v) : rampFoot(v)
          const isSelected = filters?.selectedCellId === cell.id
          return (
            <Box
              key={cell.id}
              onClick={() => handleCellClick(cell)}
              sx={{
                backgroundColor: color,
                border: isSelected ? '1px solid rgba(255,255,255,0.9)' : '1px solid transparent',
                cursor: filters ? 'pointer' : 'default'
              }}
            />
          )
        })}
      </Box>
      <Stack direction="row" spacing={2} mt={1}>
        <LegendSwatch color={fillByStatus('ok')} label="OK" />
        <LegendSwatch color={fillByStatus('busy')} label="Busy" />
        <LegendSwatch color={fillByStatus('alert')} label="Alert" />
      </Stack>
    </Paper>
  )
}

function rampFoot(t) {
  // Globe traffic scale: low (blue) -> high (pink)
  const colors = dataVizColors.heatmap.traffic
  const idx = Math.min(colors.length - 1, Math.floor(t * colors.length))
  const nextIdx = Math.min(colors.length - 1, idx + 1)
  const localT = (t * colors.length) - idx
  const result = interpolateColor(colors[idx], colors[nextIdx], localT)
  return result.replace('rgb', 'rgba').replace(')', ',0.9)')
}
function rampAQI(t) {
  // Globe AQI scale: good (green) -> hazardous (pink)
  const colors = dataVizColors.heatmap.aqi
  const idx = Math.min(colors.length - 1, Math.floor(t * colors.length))
  const nextIdx = Math.min(colors.length - 1, idx + 1)
  const localT = (t * colors.length) - idx
  const result = interpolateColor(colors[idx], colors[nextIdx], localT)
  return result.replace('rgb', 'rgba').replace(')', ',0.9)')
}

function fillByStatus(status) {
  const statusColor = canopyStatus[status]
  if (statusColor) {
    return statusColor.color.replace('rgb', 'rgba').replace(')', ',0.95)')
  }
  return 'rgba(176, 190, 197, 0.95)'
}

function LegendSwatch({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 12, opacity: 0.75 }}>{label}</span>
    </span>
  )
}
