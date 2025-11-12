import { useEffect, useMemo, useState } from 'react'
import { Box, Paper, Stack, Typography, IconButton, Divider, Tabs, Tab, ToggleButtonGroup, ToggleButton, MenuItem, Select } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import { FilterProvider, useFilters } from '../../contexts/FilterContext'
import { generateAdvancedData } from '../../utils/advancedSimulator'
import HeatmapPanel from './HeatmapPanel'
import CanopyStatusPanel from './CanopyStatusPanel'
import TimeSeriesPanel from './TimeSeriesPanel'
import KpiGaugesPanel from './KpiGaugesPanel'
import SankeyPanel from './SankeyPanel'
import NetworkGraphPanel from './NetworkGraphPanel'

export default function AdvancedDashboardOverlay({ open, onClose }) {
  if (!open) return null
  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FilterProvider>
        <Shell onClose={onClose} />
      </FilterProvider>
    </Box>
  )
}

function Shell({ onClose }) {
  const [tab, setTab] = useState(0)
  const { timeRange, setTimeRange, mapLayer, setMapLayer } = useFilters()
  const [data, setData] = useState(() => generateAdvancedData({ hours: timeRange === '24h' ? 24 : 168 }))

  useEffect(() => {
    const id = setInterval(() => setData(generateAdvancedData({ hours: timeRange === '24h' ? 24 : 168 })), 6000)
    return () => clearInterval(id)
  }, [timeRange])

  return (
    <Paper elevation={12} sx={{ width: 1120, maxWidth: '96%', height: '92%', p: 2, borderRadius: 3, bgcolor: 'rgba(18,18,18,0.78)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <InsightsRoundedIcon fontSize="small" />
          <Typography variant="h6" fontWeight={800}>Advanced Analytics</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup size="small" exclusive value={mapLayer} onChange={(_, v) => v && setMapLayer(v)} sx={{ mr: 1 }}>
            <ToggleButton value="foot">Foot</ToggleButton>
            <ToggleButton value="aqi">AQI</ToggleButton>
          </ToggleButtonGroup>
          <Select size="small" value={timeRange} onChange={e => setTimeRange(e.target.value)} sx={{ mr: 1 }}>
            <MenuItem value="24h">Last 24h</MenuItem>
            <MenuItem value="7d">Last 7d</MenuItem>
          </Select>
          <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
        </Stack>
        <Divider sx={{ opacity: 0.2 }} />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile>
          <Tab icon={<MapRoundedIcon />} label="Maps" iconPosition="start" />
          <Tab icon={<TimelineRoundedIcon />} label="Trends" iconPosition="start" />
          <Tab icon={<AutoGraphRoundedIcon />} label="KPIs" iconPosition="start" />
          <Tab icon={<AutoGraphRoundedIcon />} label="Engagement" iconPosition="start" />
          <Tab icon={<HubRoundedIcon />} label="Network" iconPosition="start" />
        </Tabs>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {tab === 0 && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ height: '100%' }}>
              <HeatmapPanel data={data} />
              <CanopyStatusPanel data={data} />
            </Stack>
          )}
          {tab === 1 && (<TimeSeriesPanel data={data} />)}
          {tab === 2 && (<KpiGaugesPanel data={data} />)}
          {tab === 3 && (<SankeyPanel data={data} />)}
          {tab === 4 && (<NetworkGraphPanel data={data} />)}
        </Box>
      </Stack>
    </Paper>
  )
}
