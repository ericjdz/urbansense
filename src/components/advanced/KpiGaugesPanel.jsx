import { Grid, Paper, Stack, Typography } from '@mui/material'
import { globeColors, statusColors } from '../../config/globeColors'

export default function KpiGaugesPanel({ data }) {
  if (!data || !data.kpis) return null
  const { avgOcc, avgAqi, heatIndex } = data.kpis
  return (
    <Grid container spacing={1.5} sx={{ height: '100%' }}>
      <Grid item xs={12} md={4}>
        <KpiCard title="Avg People Per L.I.L.O.M" value={Math.round(avgOcc)} color={globeColors.primary.main} />
      </Grid>
      <Grid item xs={12} md={4}>
        <KpiCard title="Current AQI" value={avgAqi} color="#90CAF9" />
      </Grid>
      <Grid item xs={12} md={4}>
        <KpiCard title="Heat Index" value={`${heatIndex}°C`} color={statusColors.warning.main} />
      </Grid>
    </Grid>
  )
}

function KpiCard({ title, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
      <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%' }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h3" fontWeight={800} sx={{ color }}>{value}</Typography>
      </Stack>
    </Paper>
  )
}
