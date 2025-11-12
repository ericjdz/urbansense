import { useEffect, useState } from 'react'
import { Box, Paper, Stack, Typography, Chip, Grid, IconButton, Divider, Button, List, ListItem, ListItemText, Tabs, Tab, Alert } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded'
import ReportRoundedIcon from '@mui/icons-material/ReportRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { generateGovernmentSnapshot } from '../utils/govSimulator'

export default function GovDashboard({ open, onClose }) {
  const [snap, setSnap] = useState(generateGovernmentSnapshot())
  const [tab, setTab] = useState(0) // 0: Energy, 1: Environment, 2: Assets, 3: Safety, 4: Reports
  useEffect(() => {
    const id = setInterval(() => setSnap(generateGovernmentSnapshot()), 6000)
    return () => clearInterval(id)
  }, [])

  if (!open) return null

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <Paper elevation={12} sx={{ width: 980, maxWidth: '96%', height: '92%', p: 2.5, borderRadius: 3, bgcolor: 'rgba(18,18,18,0.75)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={800}>Government Dashboard</Typography>
            <Chip size="small" label="Smart Heritage Canopies" icon={<ArchitectureRoundedIcon />} sx={{ ml: 1 }} />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
          </Stack>
          <Divider sx={{ opacity: 0.2 }} />

          {/* Alerts */}
          {(snap.incidents > 0 || snap.complianceScore < 90) && (
            <Alert severity={snap.incidents > 0 ? 'warning' : 'info'} sx={{ borderRadius: 2 }}>
              {snap.incidents > 0 ? `${snap.incidents} incident(s) require attention in the last 24h.` : `Compliance at ${snap.complianceScore}%. Review due checks.`}
            </Alert>
          )}

          {/* KPIs */}
          <Grid container spacing={1.5}>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<BoltRoundedIcon color="warning" />} label="Solar Power" value={`${snap.powerKw} kW`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<ForestRoundedIcon color="success" />} label="Shading Coverage" value={`${snap.shading}%`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<ShieldRoundedIcon color="info" />} label="Compliance" value={`${snap.complianceScore}%`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <KpiCard icon={<ReportRoundedIcon color={snap.incidents ? 'error' : 'success'} />} label="Incidents (24h)" value={`${snap.incidents}`} />
            </Grid>
          </Grid>

          {/* Domain Tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{
            '& .MuiTab-root': { textTransform: 'none', minHeight: 36 },
            '& .MuiTabs-indicator': { height: 2 }
          }}>
            <Tab label="Energy" />
            <Tab label="Environment" />
            <Tab label="Assets" />
            <Tab label="Safety" />
            <Tab label="Reports" />
          </Tabs>

          {/* Tab Panels */}
          <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
            {tab === 0 && (
              <>
                <Grid item xs={12} md={7} sx={{ height: '100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                    <Typography variant="subtitle2" gutterBottom>Energy Output Today (kW)</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                      <AreaChart data={snap.energySeries}>
                        <defs>
                          <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#64B6F7" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#64B6F7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <Area type="monotone" dataKey="kw" stroke="#64B6F7" strokeWidth={2} fill="url(#energyFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5} sx={{ height: '100%' }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="subtitle2">Summary</Typography>
                    <StatLine label="Current Output" value={`${snap.powerKw} kW`} />
                    <StatLine label="Carbon Offset (today)" value={`${snap.carbonOffset} t CO₂e`} />
                    <StatLine label="Uptime" value={`${snap.uptime}%`} />
                    <Box sx={{ flexGrow: 1 }} />
                    <Button size="small" variant="outlined" startIcon={<ReportRoundedIcon />}>Export Energy Report</Button>
                  </Paper>
                </Grid>
              </>
            )}

            {tab === 1 && (
              <Grid item xs={12} sx={{ height: '100%' }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                  <Typography variant="subtitle2" gutterBottom>Environment Overview</Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}><KpiCard icon={<ForestRoundedIcon color="success" />} label="Shading Coverage" value={`${snap.shading}%`} /></Grid>
                    <Grid item xs={12} md={4}><KpiCard icon={<ShieldRoundedIcon color="info" />} label="Compliance" value={`${snap.complianceScore}%`} /></Grid>
                    <Grid item xs={12} md={4}><KpiCard icon={<BoltRoundedIcon color="warning" />} label="Carbon Offset (today)" value={`${snap.carbonOffset} t`} /></Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" mt={2}>Real-time shade coverage and compliance are updated continuously from deployed sensors. Historical charts can be added here.</Typography>
                </Paper>
              </Grid>
            )}

            {tab === 2 && (
              <Grid item xs={12} md={12} sx={{ height: '100%' }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" gutterBottom>Heritage Assets</Typography>
                  <List dense sx={{ flex: 1, overflow: 'auto' }}>
                    {snap.assets.map(a => (
                      <ListItem key={a.id} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}>
                        <ListItemText
                          primary={<Typography fontWeight={600}>{a.name}</Typography>}
                          secondary={`#${a.id} • ${a.district} • Last service ${timeSince(a.lastService)}`}
                        />
                        <Chip size="small" label={statusLabel(a.status)} color={statusColor(a.status)} />
                      </ListItem>
                    ))}
                  </List>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" startIcon={<BuildRoundedIcon />}>Schedule Maintenance</Button>
                    <Button size="small" variant="contained" startIcon={<ReportRoundedIcon />}>Export Report</Button>
                  </Stack>
                </Paper>
              </Grid>
            )}

            {tab === 3 && (
              <Grid item xs={12} sx={{ height: '100%' }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="subtitle2">Safety</Typography>
                  <StatLine label="Incidents (24h)" value={`${snap.incidents}`} />
                  <StatLine label="Uptime" value={`${snap.uptime}%`} />
                  <Typography variant="body2" color="text.secondary">Hook this into your incident management system for live feed, triage and SLA tracking.</Typography>
                </Paper>
              </Grid>
            )}

            {tab === 4 && (
              <Grid item xs={12} sx={{ height: '100%' }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="subtitle2">Reports</Typography>
                  <Typography variant="body2" color="text.secondary">Generate and export compliance, energy, and maintenance reports. This is a placeholder for workflow integration.</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" startIcon={<ReportRoundedIcon />}>Export Compliance</Button>
                    <Button size="small" variant="contained" startIcon={<ReportRoundedIcon />}>Export Energy</Button>
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
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
