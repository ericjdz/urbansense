import { Paper, Typography } from '@mui/material'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Brush } from 'recharts'
import { useMemo } from 'react'
import { useFilters } from '../../contexts/FilterContext'
import { globeColors, statusColors, chartColors } from '../../config/globeColors'

export default function TimeSeriesPanel({ data }) {
  if (!data || !data.footSeriesToday) return null
  let selectedCellId = null
  let setTimeBrush = () => {}
  try {
    const filters = useFilters()
    selectedCellId = filters.selectedCellId
    setTimeBrush = filters.setTimeBrush
  } catch {
    // allow usage outside FilterProvider
  }

  const baseSeries = useMemo(() => {
    const aqi = data.aqiSeries
    const foot = data.footSeriesToday
    return aqi.map((p, idx) => ({
      t: p.t,
      aqi: p.v,
      foot: foot[idx]?.v ?? null
    }))
  }, [data])

  const filteredSeries = useMemo(() => {
    if (selectedCellId && data.cellSeries?.[selectedCellId]) {
      const aqi = data.cellSeries[selectedCellId].aqi
      const foot = data.cellSeries[selectedCellId].foot
      return aqi.map((p, idx) => ({
        t: p.t,
        aqi: p.v,
        foot: foot[idx]?.v ?? null
      }))
    }
    return baseSeries
  }, [baseSeries, data.cellSeries, selectedCellId])

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', flex: 1, minHeight: 300 }}>
      <Typography variant="subtitle2" gutterBottom>
        AQI vs Foot Traffic
        {selectedCellId ? ` · Cell ${selectedCellId}` : ''}
      </Typography>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={filteredSeries}>
          <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} hide />
          <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="aqi" stroke={globeColors.primary.main} strokeWidth={2} dot={false} name="AQI" />
          <Line yAxisId="right" type="monotone" dataKey="foot" stroke={statusColors.warning.main} strokeWidth={2} dot={false} name="Foot Traffic" />
          <Brush
            dataKey="t"
            height={24}
            travellerWidth={8}
            stroke={globeColors.primary.main}
            onChange={range => {
              if (!range) return
              const { startIndex, endIndex } = range
              setTimeBrush(startIndex != null && endIndex != null ? { startIndex, endIndex } : null)
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  )
}
