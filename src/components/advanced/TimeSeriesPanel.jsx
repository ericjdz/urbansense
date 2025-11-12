import { Paper, Typography, Grid, Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts'
import { useState } from 'react'

export default function TimeSeriesPanel({ data }) {
  const [compare, setCompare] = useState(true)
  return (
    <Grid container spacing={1.5} sx={{ height: '100%' }}>
      <Grid item xs={12} md={7} sx={{ height: '100%' }}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
          <Typography variant="subtitle2" gutterBottom>AQI Trend</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data.aqiSeries}>
              <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} hide />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
              <Line type="monotone" dataKey="v" stroke="#64B6F7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5} sx={{ height: '100%' }}>
        <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2">Foot Traffic by Hour</Typography>
            <ToggleButtonGroup size="small" exclusive value={compare} onChange={(_, v) => setCompare(Boolean(v))}>
              <ToggleButton value={true}>Compare</ToggleButton>
              <ToggleButton value={false}>Single</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={mergeBars(data.footSeriesToday, compare ? data.footSeriesYesterday : null)}>
              <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} hide />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
              {compare && <Legend />}
              <Bar dataKey="today" fill="#64B6F7" radius={[4,4,0,0]} />
              {compare && <Bar dataKey="yesterday" fill="#90CAF9" radius={[4,4,0,0]} />}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  )
}

function mergeBars(today, yesterday) {
  const map = new Map()
  for (const p of today) map.set(p.t, { t: p.t, today: p.v })
  if (yesterday) {
    for (const p of yesterday) {
      const m = map.get(p.t) || { t: p.t, today: 0 }
      m.yesterday = p.v
      map.set(p.t, m)
    }
  }
  return Array.from(map.values())
}
