import { useEffect, useMemo, useState } from 'react'
import { Box, Paper, Stack, Typography, Chip, Grid, IconButton, Divider, Button, List, ListItem, ListItemText, Tabs, Tab, Alert, Drawer } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded'
import ReportRoundedIcon from '@mui/icons-material/ReportRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, Legend, CartesianGrid } from 'recharts'
import { generateGovernmentSnapshot } from '../utils/govSimulator'
import { generateAdvancedData } from '../utils/advancedSimulator'
import { globeColors, statusColors } from '../config/globeColors'
import CanopyStatusMap from './CanopyStatusMap'

export default function GovDashboard({ open, onClose }) {
  // System-wide KPIs
  const [snap, setSnap] = useState(generateGovernmentSnapshot())
  // Advanced per-canopy, people + AQI data
  const [adv, setAdv] = useState(generateAdvancedData({ hours: 24 }))
  // 0: Operations (default), 1: System Health
  const [tab, setTab] = useState(0)
  // Selected canopy/asset for drill-down
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const id1 = setInterval(() => setSnap(generateGovernmentSnapshot()), 6000)
    const id2 = setInterval(() => setAdv(generateAdvancedData({ hours: 24 })), 6000)
    return () => { clearInterval(id1); clearInterval(id2) }
  }, [])

  const canopies = useMemo(() => mapAdvancedCanopiesToAssets(adv?.canopies || [], snap?.maintenanceDue), [adv, snap])

  const triage = useMemo(() => buildTriageQueue(canopies), [canopies])

  const series24h = useMemo(() => build24hCorrelation(adv), [adv])

  if (!open) return null

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <Paper elevation={12} sx={{ width: 1180, maxWidth: '96%', height: '94%', p: 2.5, borderRadius: 3, bgcolor: 'rgba(18,18,18,0.75)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={800}>Government Dashboard</Typography>
            <Chip size="small" label="Smart Heritage Canopies" icon={<ArchitectureRoundedIcon />} sx={{ ml: 1 }} />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
          </Stack>
          <Divider sx={{ opacity: 0.2 }} />

          {/* Top KPIs always on */}
          <Grid container spacing={1.5}>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<BoltRoundedIcon color="warning" />} label="Solar Power" value={`${snap.powerKw} kW`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<ShieldRoundedIcon color="success" />} label="Network Uptime" value={`${snap.networkUptime}%`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<ShieldRoundedIcon color="info" />} label="Compliance" value={`${snap.complianceScore}%`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<ReportRoundedIcon color={snap.incidents ? 'error' : 'success'} />} label="Incidents (24h)" value={`${snap.incidents}`} />
            </Grid>
          </Grid>

          {/* Role-based tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 36 } }}>
            <Tab label="Operations" />
            <Tab label="System Health" />
          </Tabs>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {tab === 0 && (
              <Grid container spacing={1.5} sx={{ height: '100%' }}>
                {/* Map-focused operations view */}
                <Grid item xs={12} md={8} sx={{ height: '100%' }}>
                  <Paper variant="outlined" sx={{ position: 'relative', p: 0, height: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.04)' }}>
                    <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, bgcolor: 'rgba(0,0,0,0.5)', px: 1, py: 0.5, borderRadius: 1 }}>
                      <Typography variant="caption" color="white">Canopy Status View</Typography>
                    </Box>
                    <CanopyStatusMap
                      canopies={canopies}
                      onSelect={(c) => setSelected(c)}
                    />
                  </Paper>
                </Grid>
                {/* Active Triage Queue */}
                <Grid item xs={12} md={4} sx={{ height: '100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">Active Triage</Typography>
                      <Chip size="small" label={`${triage.length}`} color={triage.length ? 'error' : 'default'} />
                    </Stack>
                    <List dense sx={{ flex: 1, overflow: 'auto' }}>
                      {triage.length === 0 && (
                        <ListItem><ListItemText primary="No active alerts" secondary="All canopies nominal" /></ListItem>
                      )}
                      {triage.map(item => (
                        <ListItem key={item.id + item.type} button onClick={() => setSelected(item.canopy)} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                          <ListItemText
                            primary={<Typography fontWeight={700}>{item.title}</Typography>}
                            secondary={`${item.canopy.name} • ${item.subtitle}`}
                          />
                          <Chip size="small" label={item.type.toUpperCase()} color={item.severity === 'high' ? 'error' : item.severity === 'medium' ? 'warning' : 'default'} />
                        </ListItem>
                      ))}
                    </List>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" startIcon={<BuildRoundedIcon />}>Schedule Maintenance</Button>
                      <Button size="small" variant="contained" startIcon={<ReportRoundedIcon />}>Export Incidents</Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <Grid container spacing={1.5} sx={{ height: '100%' }}>
                <Grid item xs={12} md={7} sx={{ height: '100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                    <Typography variant="subtitle2" gutterBottom>Energy Output Today (kW)</Typography>
                    <ResponsiveContainer width="100%" height="88%">
                      <AreaChart data={snap.energySeries}>
                        <defs>
                          <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={globeColors.primary.main} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={globeColors.primary.main} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <Area type="monotone" dataKey="kw" stroke={globeColors.primary.main} strokeWidth={2} fill="url(#energyFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5} sx={{ height: '100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="subtitle2">System Summary</Typography>
                    <StatLine label="Carbon Offset (today)" value={`${snap.carbonOffset} t CO₂e`} />
                    <StatLine label="Uptime" value={`${snap.uptime}%`} />
                    <Box sx={{ height: 8 }} />
                    <Typography variant="subtitle2">24h AQI vs Foot Traffic</Typography>
                    <Box sx={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={series24h} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                          <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="avgAQI" name="Avg AQI" stroke={statusColors.error.main} dot={false} strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="totalFoot" name="Total Foot Traffic" stroke="#ffd54f" dot={false} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Drill-down Drawer */}
          <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)} PaperProps={{ sx: { width: 380, bgcolor: 'rgba(18,18,18,0.95)', borderLeft: '1px solid rgba(255,255,255,0.08)' } }}>
            {selected && (
              <Stack spacing={1.5} sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={800}>{selected.name}</Typography>
                  <Chip size="small" label={selected.status.toUpperCase()} color={selected.status === 'alert' ? 'error' : selected.status === 'busy' ? 'warning' : 'success'} />
                </Stack>
                <Divider sx={{ opacity: 0.2 }} />
                <Grid container spacing={1.5}>
                  <Grid item xs={6}><KpiCard icon={<ReportRoundedIcon color="warning" />} label="Live Occupancy" value={`${selected.occupancy}%`} /></Grid>
                  <Grid item xs={6}><KpiCard icon={<ShieldRoundedIcon color="info" />} label="Live AQI" value={`${selected.aqi}`} /></Grid>
                </Grid>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', flex: 1, minHeight: 200 }}>
                  <Typography variant="subtitle2" gutterBottom>Last 60 min: Occupancy vs AQI</Typography>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={buildLast60MinSeries(selected)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="t" hide />
                      <YAxis yAxisId="left" hide />
                      <YAxis yAxisId="right" orientation="right" hide />
                      <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                      <Line yAxisId="left" type="monotone" dataKey="occ" stroke={statusColors.warning.main} dot={false} strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="aqi" stroke={statusColors.success.main} dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" startIcon={<BuildRoundedIcon />}>Schedule Maintenance</Button>
                  <Button size="small" variant="contained">View Asset Record</Button>
                </Stack>
              </Stack>
            )}
          </Drawer>
        </Stack>
      </Paper>
    </Box>
  )
}

function KpiCard({ icon, label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Stack>
        <Typography variant="h5" fontWeight={800}>{value}</Typography>
      </Stack>
    </Paper>
  )
}

function StatLine({ label, value }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{value}</Typography>
    </Stack>
  )
}

function statusColor(status) {
  switch (status) {
    case 'operational': return 'success'
    case 'maintenance-due': return 'warning'
    case 'attention': return 'error'
    default: return 'default'
  }
}
function statusLabel(status) {
  switch (status) {
    case 'operational': return 'Operational'
    case 'maintenance-due': return 'Maintenance Due'
    case 'attention': return 'Attention'
    default: return status
  }
}

function timeSince(d) {
  const days = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)))
  return `${days}d ago`
}

// Helpers to build the new data views
function mapAdvancedCanopiesToAssets(canopies, maintenanceDueFlag) {
  // Map grid x,y to lat/lng within Luneta bounds (approx)
  const minLng = 120.9757, maxLng = 120.9832
  const minLat = 14.5787, maxLat = 14.5870
  const gridW = 12, gridH = 8
  return canopies.map((c, i) => {
    const lng = minLng + (c.x / (gridW - 1)) * (maxLng - minLng)
    const lat = minLat + (c.y / (gridH - 1)) * (maxLat - minLat)
    const offline = c.status === 'alert' && c.occupancy < 5 ? true : false
    const maintenanceDue = maintenanceDueFlag && i % 3 === 0
    return { ...c, lat, lng, offline, maintenanceDue }
  })
}

function buildTriageQueue(canopies) {
  const items = []
  canopies.forEach(c => {
    if (c.offline) items.push({ id: c.id, title: `${c.name}: Offline`, subtitle: `Sensor unreachable`, type: 'offline', severity: 'high', canopy: c })
    if (c.status === 'alert' && !c.offline) items.push({ id: c.id + '-aqi', title: `${c.name}: High AQI`, subtitle: `AQI ${c.aqi}`, type: 'environment', severity: 'high', canopy: c })
    if (c.status === 'busy') items.push({ id: c.id + '-occ', title: `${c.name}: High Occupancy`, subtitle: `Occ ${c.occupancy}%`, type: 'occupancy', severity: 'medium', canopy: c })
    if (c.maintenanceDue) items.push({ id: c.id + '-maint', title: `${c.name}: Maintenance Due`, subtitle: `Schedule service`, type: 'maintenance', severity: 'low', canopy: c })
  })
  // sort by severity
  const order = { high: 0, medium: 1, low: 2 }
  return items.sort((a, b) => order[a.severity] - order[b.severity])
}

function build24hCorrelation(adv) {
  if (!adv) return []
  const map = {}
  ;(adv.aqiSeries || []).forEach(p => { map[p.t] = { t: p.t, avgAQI: p.v, totalFoot: 0 } })
  ;(adv.footSeriesToday || []).forEach(p => { if (!map[p.t]) map[p.t] = { t: p.t, avgAQI: 0, totalFoot: 0 }; map[p.t].totalFoot = p.v })
  return Object.values(map)
}

function buildLast60MinSeries(c) {
  if (!c) return []
  const now = Date.now()
  const points = []
  for (let i = 59; i >= 0; i--) {
    const t = new Date(now - i * 60000)
    const occ = clampVal(c.occupancy + jitter(-8, 8))
    const aqi = Math.max(20, c.aqi + jitter(-10, 10))
    points.push({ t: t.toISOString(), occ, aqi })
  }
  return points
}

function clampVal(v) { return Math.max(0, Math.min(100, Math.round(v))) }
function jitter(min, max) { return Math.random() * (max - min) + min }
