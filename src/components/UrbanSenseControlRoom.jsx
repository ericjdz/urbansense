import { useMemo, useState, useEffect } from 'react'
import { Box, Paper, Stack, Typography, IconButton, Divider, Tabs, Tab, Grid, Chip, Button, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel, OutlinedInput, Checkbox, ListItemIcon, Tooltip, Badge, Menu, Alert, CircularProgress, Dialog, DialogTitle, DialogContent } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ReportRoundedIcon from '@mui/icons-material/ReportRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import AirRoundedIcon from '@mui/icons-material/AirRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import ThermostatRoundedIcon from '@mui/icons-material/ThermostatRounded'
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, LineChart, Line, Legend, CartesianGrid, BarChart, Bar, ComposedChart } from 'recharts'
import { useUrbanSenseData } from '../contexts/UrbanSenseDataContext'
import { globeColors, statusColors } from '../config/globeColors'
import { getAllLocations } from '../config/locations'
import { generateGovernmentSnapshot } from '../utils/govSimulator'
import { generateAdvancedData } from '../utils/advancedSimulator'
import TimeSeriesPanel from './advanced/TimeSeriesPanel'
import CanopyStatusPanel from './advanced/CanopyStatusPanel'
import EngagementPanel from './advanced/EngagementPanel'

export default function UrbanSenseControlRoom({ open, onClose }) {
  const { timeRange, setTimeRange, publicSnap, govSnap, advData, govHistory, advHistory } = useUrbanSenseData()
  const [lens, setLens] = useState(0) // 0 Overview, 1 Operations, 2 Env & Crowd, 3 Engagement, 4 Comparison
  const allLocations = useMemo(() => getAllLocations(), [])
  const [selectedLocationIds, setSelectedLocationIds] = useState(() => allLocations.map(l => l.id)) // Default to all locations
  const [locationData, setLocationData] = useState(new Map()) // Map<locationId, {govSnap, advData}>
  const [isLoading, setIsLoading] = useState(false)
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false)
  const [showSelectionHint, setShowSelectionHint] = useState(true)
  
  const MAX_LOCATIONS = 4 // UX limit for performance

  // Generate data for selected locations
  useEffect(() => {
    if (!open) return

    const generateDataForLocations = () => {
      setIsLoading(true)
      const newData = new Map()
      selectedLocationIds.forEach(locId => {
        const location = allLocations.find(l => l.id === locId)
        if (location) {
          const locGovSnap = generateGovernmentSnapshot({ location })
          const locAdvData = generateAdvancedData({ 
            hours: timeRange === '24h' ? 24 : 168,
            bounds: location.bounds,
            location 
          })
          newData.set(locId, { govSnap: locGovSnap, advData: locAdvData, location })
        }
      })
      setLocationData(newData)
      setTimeout(() => setIsLoading(false), 300) // Smooth loading transition
    }

    // Initial generation
    generateDataForLocations()

    // Update on interval
    const interval = setInterval(generateDataForLocations, 6000)
    return () => clearInterval(interval)
  }, [open, selectedLocationIds, timeRange, allLocations])
  
  // Auto-dismiss selection hint after first use
  useEffect(() => {
    if (selectedLocationIds.length > 1) {
      const timer = setTimeout(() => setShowSelectionHint(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [selectedLocationIds])
  
  // Smart location selection handler with validation
  const handleLocationChange = (newValue) => {
    if (newValue.length === 0) {
      // Prevent empty selection - keep at least one
      return
    }
    if (newValue.length > MAX_LOCATIONS) {
      // Prevent exceeding max - remove oldest selection
      setSelectedLocationIds(newValue.slice(-MAX_LOCATIONS))
    } else {
      setSelectedLocationIds(newValue)
    }
  }
  
  // Quick action handlers
  const handleSelectAll = () => {
    setSelectedLocationIds(allLocations.map(l => l.id))
  }
  
  const handleClearAll = () => {
    setSelectedLocationIds(allLocations.map(l => l.id)) // Reset to all locations
  }

  // Aggregate data across all selected locations
  const aggregateData = useMemo(() => {
    if (locationData.size === 0) return null
    
    let totalPower = 0, avgUptime = 0, totalPeople = 0, totalEngagements = 0
    let allCanopies = [], allIncidents = 0, anyMaintenance = false
    let totalAqi = 0, totalHeatIndex = 0
    
    locationData.forEach(({ govSnap, advData }) => {
      totalPower += govSnap.powerKw || 0
      avgUptime += govSnap.networkUptime || 0
      totalPeople += Math.round(advData.kpis?.avgOcc || 0) * (advData.canopies?.length || 0)
      totalEngagements += totalDeepEngaged(advData.engagementSites)
      totalAqi += advData.kpis?.avgAqi || 0
      totalHeatIndex += advData.kpis?.heatIndex || 0
      allCanopies.push(...(advData.canopies || []))
      allIncidents += govSnap.incidents || 0
      if (govSnap.maintenanceDue) anyMaintenance = true
    })
    
    avgUptime = locationData.size > 0 ? avgUptime / locationData.size : 0
    const avgPeoplePerCanopy = allCanopies.length > 0 ? totalPeople / allCanopies.length : 0
    const avgAqi = locationData.size > 0 ? totalAqi / locationData.size : 0
    const avgHeatIndex = locationData.size > 0 ? totalHeatIndex / locationData.size : 0
    
    return {
      totalPower,
      avgUptime,
      avgPeoplePerCanopy,
      totalEngagements,
      avgAqi,
      avgHeatIndex,
      allCanopies,
      allIncidents,
      anyMaintenance,
      locationCount: locationData.size
    }
  }, [locationData])

  const series24h = useMemo(() => build24hCorrelation(advData), [advData])

  if (!open) return null

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 0.5, sm: 1, md: 2 } }}>
      <Paper elevation={12} sx={{ width: '100%', maxWidth: { xs: '100%', sm: 900, md: 1180 }, height: { xs: '100%', sm: '96%', md: '94%' }, p: { xs: 1, sm: 1.5, md: 2.5 }, borderRadius: { xs: 0, sm: 2, md: 3 }, bgcolor: 'rgba(18,18,18,0.8)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={{ xs: 1, sm: 1.25, md: 1.5 }} sx={{ height: '100%', minHeight: 0 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <InsightsRoundedIcon fontSize="small" />
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>UrbanSense Control Room</Typography>
            <Chip size="small" label="LIVE" color="success" sx={{ ml: { xs: 0, sm: 1 } }} />
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Enhanced Multi-Location Selector */}
            <FormControl size="small" sx={{ minWidth: 220, display: { xs: 'none', md: 'flex' } }}>
                <Select
                  multiple
                  value={selectedLocationIds}
                  onChange={(e) => handleLocationChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                      {isLoading && <CircularProgress size={14} sx={{ mr: 0.5 }} />}
                      {selected.length === allLocations.length ? (
                        <Chip 
                          size="small" 
                          label="All Locations" 
                          icon={<PublicRoundedIcon />} 
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : (
                        selected.map((id) => {
                          const loc = allLocations.find(l => l.id === id)
                          return (
                            <Chip 
                              key={id} 
                              size="small" 
                              label={loc?.shortName || id}
                              onDelete={(e) => {
                                e.stopPropagation()
                                if (selected.length > 1) {
                                  handleLocationChange(selected.filter(s => s !== id))
                                }
                              }}
                              deleteIcon={selected.length > 1 ? <CancelRoundedIcon /> : undefined}
                              sx={{ 
                                fontWeight: 600,
                                '& .MuiChip-deleteIcon': { 
                                  fontSize: '1rem',
                                  '&:hover': { color: 'error.main' } 
                                }
                              }}
                            />
                          )
                        })
                      )}
                    </Box>
                  )}
                  IconComponent={ExpandMoreRoundedIcon}
                  sx={{ 
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: selectedLocationIds.length > 1 ? 'rgba(33, 150, 243, 0.5)' : 'rgba(255,255,255,0.15)',
                      borderWidth: selectedLocationIds.length > 1 ? 2 : 1
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(33, 150, 243, 0.7)'
                    },
                    transition: 'all 0.3s'
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'rgba(20, 20, 20, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxHeight: 400
                      }
                    }
                  }}
                >
                  {/* Quick Actions Header */}
                  <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        QUICK ACTIONS
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Select all locations" arrow>
                          <Button 
                            size="small" 
                            startIcon={<CheckCircleRoundedIcon fontSize="small" />}
                            onClick={handleSelectAll}
                            disabled={selectedLocationIds.length === allLocations.length}
                            sx={{ fontSize: '0.65rem', px: 1, py: 0.25 }}
                          >
                            All
                          </Button>
                        </Tooltip>
                        <Tooltip title="Reset to all locations" arrow>
                          <Button 
                            size="small" 
                            startIcon={<RefreshRoundedIcon fontSize="small" />}
                            onClick={handleClearAll}
                            disabled={selectedLocationIds.length === allLocations.length}
                            sx={{ fontSize: '0.65rem', px: 1, py: 0.25 }}
                          >
                            Reset
                          </Button>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    {selectedLocationIds.length > 1 && (
                      <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5 }}>
                        ✓ Comparison mode active ({selectedLocationIds.length}/{MAX_LOCATIONS} locations)
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Location Menu Items */}
                  {allLocations.map((location) => {
                    const isSelected = selectedLocationIds.indexOf(location.id) > -1
                    const isDisabled = !isSelected && selectedLocationIds.length >= MAX_LOCATIONS
                    
                    return (
                      <MenuItem 
                        key={location.id} 
                        value={location.id}
                        disabled={isDisabled}
                        sx={{ 
                          py: 1.5,
                          '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' },
                          '&.Mui-selected': { 
                            bgcolor: 'rgba(33, 150, 243, 0.15)',
                            '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.2)' }
                          }
                        }}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          disabled={isDisabled}
                          icon={<Box sx={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 0.5 }} />}
                          checkedIcon={<CheckCircleRoundedIcon sx={{ color: 'primary.main' }} />}
                        />
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Badge 
                            badgeContent={isSelected ? '✓' : null} 
                            color="primary"
                            sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 14, height: 14 } }}
                          >
                            <ArchitectureRoundedIcon fontSize="small" color={isSelected ? 'primary' : 'inherit'} />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                              {location.shortName}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {location.district}
                            </Typography>
                          }
                        />
                        {isDisabled && (
                          <Tooltip title={`Maximum ${MAX_LOCATIONS} locations`} arrow>
                            <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                              Limit
                            </Typography>
                          </Tooltip>
                        )}
                      </MenuItem>
                    )
                  })}
                  
                  {/* Footer Info */}
                  <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HelpOutlineRoundedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: '0.9rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        Select multiple locations to enable comparison analytics
                      </Typography>
                    </Stack>
                  </Box>
                </Select>
              </FormControl>

            {/* Mobile Location Selector */}
            <Tooltip title="Tap to select locations" arrow>
              <Chip 
                size="small" 
                label={selectedLocationIds.length > 1 ? `${selectedLocationIds.length} Sites` : allLocations.find(l => l.id === selectedLocationIds[0])?.shortName || 'Select Location'} 
                icon={isLoading ? <CircularProgress size={14} /> : <ArchitectureRoundedIcon />}
                onClick={() => setMobileDialogOpen(true)}
                color={selectedLocationIds.length > 1 ? 'primary' : 'default'}
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.15)' }
                }} 
              />
            </Tooltip>
            
            <Chip size="small" label={timeRange === '24h' ? 'Last 24h' : 'Last 7d'} variant="outlined" onClick={() => setTimeRange(timeRange === '24h' ? '7d' : '24h')} />
            <IconButton onClick={onClose} size="small"><CloseRoundedIcon /></IconButton>
          </Stack>
          <Divider sx={{ opacity: 0.2 }} />

          {/* Selection Hint */}
          {showSelectionHint && selectedLocationIds.length > 1 && (
            <Alert 
              severity="info" 
              icon={<CompareArrowsRoundedIcon />}
              onClose={() => setShowSelectionHint(false)}
              sx={{ 
                py: 0.5,
                '& .MuiAlert-message': { fontSize: '0.8rem' }
              }}
            >
              Comparison mode active with {selectedLocationIds.length} locations. Switch to "Comparison" tab for detailed analytics.
            </Alert>
          )}

          {/* Insightful KPI strip with trends and deltas - Aggregated across selected locations */}
          <Grid container spacing={{ xs: 1, sm: 1.25, md: 1.5 }}>
            <Grid item xs={6} sm={4} md={2}>
              <TrendKpiCard
                icon={<BoltRoundedIcon color="warning" />}
                label={selectedLocationIds.length > 1 ? "Total Solar Power" : "Solar Power"}
                unit="kW"
                series={selectedLocationIds.length > 1 ? [] : (govSnap.energySeries || []).map(p => p.kw)}
                current={aggregateData?.totalPower || govSnap.powerKw || 0}
                locations={selectedLocationIds.length}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TrendKpiCard
                icon={<ShieldRoundedIcon color="success" />}
                label={selectedLocationIds.length > 1 ? "Avg Network Uptime" : "Network Uptime"}
                unit="%"
                series={selectedLocationIds.length > 1 ? [] : govHistory.map(h => h.snap.networkUptime)}
                current={aggregateData?.avgUptime || govSnap.networkUptime || 0}
                locations={selectedLocationIds.length}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TrendKpiCard
                icon={<AirRoundedIcon color="info" />}
                label="Avg Air Quality"
                unit=""
                series={selectedLocationIds.length > 1 ? [] : advHistory.map(h => h.data.kpis?.avgAqi || 0)}
                current={Math.round(aggregateData?.avgAqi || advData.kpis?.avgAqi || 0)}
                locations={selectedLocationIds.length}
                colorCode={true}
                thresholds={{ error: 150, warning: 100 }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TrendKpiCard
                icon={<ThermostatRoundedIcon color="error" />}
                label="Heat Index"
                unit="°C"
                series={selectedLocationIds.length > 1 ? [] : advHistory.map(h => h.data.kpis?.heatIndex || 0)}
                current={Math.round(aggregateData?.avgHeatIndex || advData.kpis?.heatIndex || 0)}
                locations={selectedLocationIds.length}
                colorCode={true}
                thresholds={{ error: 35, warning: 32 }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TrendKpiCard
                icon={<GroupsRoundedIcon color="success" />}
                label="Avg People"
                unit=""
                series={selectedLocationIds.length > 1 ? [] : advHistory.map(h => h.data.kpis.avgOcc)}
                current={aggregateData?.avgPeoplePerCanopy || Math.round(advData.kpis?.avgOcc || 0)}
                locations={selectedLocationIds.length}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TrendKpiCard
                icon={<ForestRoundedIcon color="secondary" />}
                label={selectedLocationIds.length > 1 ? "Total Engagements" : "Deep Engagements"}
                unit=""
                series={selectedLocationIds.length > 1 ? [] : advHistory.map(h => totalDeepEngaged(h.data.engagementSites))}
                current={aggregateData?.totalEngagements || totalDeepEngaged(advData.engagementSites)}
                locations={selectedLocationIds.length}
              />
            </Grid>
          </Grid>

          {/* Lenses */}
          <Tabs value={lens} onChange={(_, v) => setLens(v)} variant="scrollable" scrollButtons="auto" sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: { xs: 32, sm: 36 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, px: { xs: 0.5, sm: 1 } } }}>
            <Tab label="Overview" icon={<PublicRoundedIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Operations" icon={<TimelineRoundedIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Environment & Crowd" icon={<AirRoundedIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Engagement & Impact" icon={<GroupsRoundedIcon fontSize="small" />} iconPosition="start" />
            {selectedLocationIds.length > 1 && <Tab label="Comparison" icon={<CompareArrowsRoundedIcon fontSize="small" />} iconPosition="start" />}
          </Tabs>

          <Box sx={{ flex: 1, minHeight: 0, mt: 1, overflow: 'auto' }}>
            {/* Overview Lens */}
            {lens === 0 && (
              <OverviewLens 
                locationData={locationData} 
                allLocations={allLocations} 
                aggregateData={aggregateData}
                selectedLocationIds={selectedLocationIds}
              />
            )}

            {/* Operations Lens */}
            {lens === 1 && (
              <Grid container spacing={1.5} sx={{ height: { xs: 'auto', md: '100%' } }}>
                <Grid item xs={12} md={7} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 300, md: 0 } }}>
                  <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', minHeight: { xs: 300, md: 0 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedLocationIds.length > 1 ? 'Combined Energy Output (kW)' : 'Energy Output Today (kW)'}
                    </Typography>
                    <ResponsiveContainer width="100%" height="88%">
                      <AreaChart data={selectedLocationIds.length === 1 && govSnap.energySeries ? govSnap.energySeries : buildCombinedEnergySeries(locationData)}>
                        <defs>
                          <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={globeColors.primary.main} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={globeColors.primary.main} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <Area type="monotone" dataKey="kw" stroke={globeColors.primary.main} strokeWidth={2} fill="url(#energyFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 300, md: 0 } }}>
                  <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', minHeight: { xs: 300, md: 0 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>System Summary</Typography>
                    {selectedLocationIds.length === 1 ? (
                      <>
                        <StatLine label="Carbon Offset (today)" value={`${govSnap.carbonOffset} t CO₂e`} />
                        <StatLine label="Uptime" value={`${govSnap.uptime}%`} />
                        <StatLine label="Maintenance Flag" value={govSnap.maintenanceDue ? 'Yes' : 'No'} />
                      </>
                    ) : (
                      <>
                        <StatLine label="Total Locations" value={`${selectedLocationIds.length} sites`} />
                        <StatLine label="Total Canopies" value={`${aggregateData?.allCanopies.length || 0} units`} />
                        <StatLine label="Maintenance Alerts" value={aggregateData?.anyMaintenance ? 'Yes' : 'No'} />
                      </>
                    )}
                    <Box sx={{ height: 12 }} />
                    <Typography variant="subtitle2">Asset & Canopy Alerts</Typography>
                    <List dense sx={{ flex: 1, overflow: 'auto' }}>
                      {buildTriageQueue(aggregateData?.allCanopies || advData.canopies || [], selectedLocationIds.length === 1 ? govSnap : { incidents: aggregateData?.allIncidents, maintenanceDue: aggregateData?.anyMaintenance }, locationData).map(item => (
                        <ListItem key={item.id} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                          <ListItemText primary={<Typography fontWeight={700}>{item.title}</Typography>} secondary={item.subtitle} />
                          <Chip size="small" label={item.tag} color={item.color} />
                        </ListItem>
                      ))}
                      {buildTriageQueue(aggregateData?.allCanopies || advData.canopies || [], selectedLocationIds.length === 1 ? govSnap : { incidents: aggregateData?.allIncidents, maintenanceDue: aggregateData?.anyMaintenance }, locationData).length === 0 && (
                        <ListItem><ListItemText primary="No active alerts" secondary="All systems nominal" /></ListItem>
                      )}
                    </List>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button size="small" variant="outlined" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Schedule Maintenance</Button>
                      <Button size="small" variant="contained" startIcon={<ReportRoundedIcon fontSize="small" />} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Export Report</Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Environment & Crowd Lens */}
            {lens === 2 && (
              <Grid container spacing={1.5} sx={{ height: { xs: 'auto', md: '100%' } }}>
                <Grid item xs={12} md={7} sx={{ height: { xs: 300, md: '100%' }, minHeight: 300 }}>
                  <TimeSeriesPanel data={advData} />
                </Grid>
                <Grid item xs={12} md={5} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 300, md: 0 } }}>
                  <CanopyStatusPanel data={advData} />
                </Grid>
              </Grid>
            )}

            {/* Engagement & Impact Lens */}
            {lens === 3 && (
              <EngagementPanel data={advData} />
            )}

            {/* Comparison Lens */}
            {lens === 4 && selectedLocationIds.length > 1 && (
              <ComparisonLens 
                locationData={locationData}
                allLocations={allLocations}
                selectedLocationIds={selectedLocationIds}
              />
            )}
          </Box>
        </Stack>
      </Paper>
      
      {/* Mobile Location Selection Dialog */}
      <Dialog
        open={mobileDialogOpen}
        onClose={() => setMobileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <TuneRoundedIcon />
              <Typography variant="h6" fontWeight={700}>Select Locations</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setMobileDialogOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Choose 1-{MAX_LOCATIONS} locations to monitor ({selectedLocationIds.length} selected)
          </Typography>
        </DialogTitle>
        <Divider sx={{ opacity: 0.2 }} />
        <DialogContent sx={{ p: 0 }}>
          {/* Quick Actions */}
          <Box sx={{ px: 2, py: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
            <Stack direction="row" spacing={1}>
              <Button 
                fullWidth
                size="small" 
                variant="outlined"
                startIcon={<CheckCircleRoundedIcon />}
                onClick={() => {
                  handleSelectAll()
                  setMobileDialogOpen(false)
                }}
                disabled={selectedLocationIds.length === allLocations.length}
              >
                Select All
              </Button>
              <Button 
                fullWidth
                size="small" 
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => {
                  handleClearAll()
                  setMobileDialogOpen(false)
                }}
                disabled={selectedLocationIds.length === 1 && selectedLocationIds[0] === 'luneta'}
              >
                Reset
              </Button>
            </Stack>
          </Box>
          
          {/* Location List */}
          <List sx={{ py: 0 }}>
            {allLocations.map((location) => {
              const isSelected = selectedLocationIds.indexOf(location.id) > -1
              const isDisabled = !isSelected && selectedLocationIds.length >= MAX_LOCATIONS
              
              return (
                <ListItem
                  key={location.id}
                  button
                  onClick={() => {
                    if (isDisabled) return
                    const newSelection = isSelected
                      ? selectedLocationIds.filter(id => id !== location.id)
                      : [...selectedLocationIds, location.id]
                    handleLocationChange(newSelection)
                  }}
                  disabled={isDisabled}
                  sx={{
                    py: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' },
                    bgcolor: isSelected ? 'rgba(33, 150, 243, 0.12)' : 'transparent'
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    icon={<Box sx={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.3)', borderRadius: 1 }} />}
                    checkedIcon={<CheckCircleRoundedIcon sx={{ color: 'primary.main' }} />}
                    sx={{ mr: 1 }}
                  />
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Badge 
                      badgeContent={isSelected ? selectedLocationIds.indexOf(location.id) + 1 : null}
                      color="primary"
                    >
                      <ArchitectureRoundedIcon color={isSelected ? 'primary' : 'inherit'} />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={isSelected ? 700 : 500}>
                        {location.shortName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {location.district}
                      </Typography>
                    }
                  />
                  {isDisabled && (
                    <Chip size="small" label="Limit" color="error" />
                  )}
                  {isSelected && (
                    <CheckCircleRoundedIcon color="primary" fontSize="small" />
                  )}
                </ListItem>
              )
            })}
          </List>
          
          {/* Footer */}
          <Box sx={{ px: 2, py: 2, bgcolor: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Stack spacing={1}>
              <Alert severity="info" icon={<HelpOutlineRoundedIcon fontSize="small" />} sx={{ py: 0.5 }}>
                <Typography variant="caption">
                  Select multiple locations to enable comparison analytics
                </Typography>
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setMobileDialogOpen(false)}
                sx={{ mt: 1 }}
              >
                Apply Selection ({selectedLocationIds.length})
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

function TrendKpiCard({ icon, label, unit = '', series = [], current, locations = 1, colorCode = false, thresholds = {} }) {
  const points = series.filter(v => typeof v === 'number' && !Number.isNaN(v))
  const prev = points.length > 1 ? points[points.length - 2] : null
  const deltaVal = prev != null ? current - prev : 0
  const deltaPct = prev && prev !== 0 ? Math.round((deltaVal / prev) * 100) : 0
  const direction = deltaVal > 0 ? 'up' : deltaVal < 0 ? 'down' : 'flat'

  const sparkData = points.slice(-20).map((v, idx) => ({ idx, v }))

  // Determine color based on thresholds if colorCode is enabled
  let valueColor = 'inherit'
  if (colorCode && thresholds) {
    if (thresholds.error && current > thresholds.error) {
      valueColor = 'error.main'
    } else if (thresholds.warning && current > thresholds.warning) {
      valueColor = 'warning.main'
    } else if (thresholds.error || thresholds.warning) {
      valueColor = 'success.main'
    }
  }

  let insight
  if (locations > 1) {
    insight = `Aggregate across ${locations} location${locations > 1 ? 's' : ''}`
  } else if (direction === 'up' && Math.abs(deltaPct) >= 5) {
    insight = 'Rising vs last sample'
  } else if (direction === 'down' && Math.abs(deltaPct) >= 5) {
    insight = 'Dropping vs last sample'
  } else {
    insight = 'Stable vs last sample'
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.25, sm: 1.75 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 }, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: { xs: '1rem', sm: '1.25rem' } } }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>{label}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
          <Typography variant="h6" fontWeight={800} color={valueColor} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{`${Math.round(current)}${unit}`}</Typography>
          {prev != null && locations === 1 && (
            <Typography variant="caption" color={direction === 'up' ? 'success.main' : direction === 'down' ? 'error.main' : 'text.secondary'} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {deltaVal > 0 ? '+' : ''}{Math.round(deltaVal)}{unit} ({deltaPct > 0 ? '+' : ''}{deltaPct}%)
            </Typography>
          )}
        </Stack>
        <Box sx={{ height: 38 }}>
          {sparkData.length > 1 && locations === 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="idx" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <RTooltip contentStyle={{ display: 'none' }} />
                <Line type="monotone" dataKey="v" stroke={globeColors.primary.main} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">{insight}</Typography>
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

function build24hCorrelation(adv) {
  if (!adv) return []
  const map = {}
  ;(adv.aqiSeries || []).forEach(p => { map[p.t] = { t: p.t, avgAQI: p.v, totalFoot: 0 } })
  ;(adv.footSeriesToday || []).forEach(p => { if (!map[p.t]) map[p.t] = { t: p.t, avgAQI: 0, totalFoot: 0 }; map[p.t].totalFoot = p.v })
  return Object.values(map)
}

function buildTriageQueue(canopies = [], govSnap, locationData = null) {
  const items = []
  
  // If multi-location, identify which location each canopy belongs to
  const getLocationName = (canopy) => {
    if (!locationData || locationData.size <= 1) return null
    for (const [locId, data] of locationData.entries()) {
      if (data.advData.canopies?.some(c => c.id === canopy.id)) {
        return data.location.shortName
      }
    }
    return null
  }
  
  canopies.forEach(c => {
    const locName = getLocationName(c)
    const prefix = locName ? `[${locName}] ` : ''
    
    if (c.status === 'alert') items.push({ 
      id: c.id + '-aqi', 
      title: `${prefix}${c.name}: High AQI`, 
      subtitle: `AQI ${c.aqi}`, 
      tag: 'Environment', 
      color: 'error' 
    })
    if (c.status === 'busy') items.push({ 
      id: c.id + '-occ', 
      title: `${prefix}${c.name}: High Occupancy`, 
      subtitle: `Occ ${Math.round(c.occupancy)}`, 
      tag: 'Occupancy', 
      color: 'warning' 
    })
  })
  
  if (govSnap.maintenanceDue) {
    items.push({ id: 'maint-flag', title: 'Maintenance Due', subtitle: 'At least one asset flagged for service', tag: 'Maintenance', color: 'warning' })
  }
  if (govSnap.incidents) {
    items.push({ id: 'incidents-flag', title: 'Incidents (24h)', subtitle: `${govSnap.incidents} incident(s) reported in last 24h`, tag: 'Incident', color: 'error' })
  }
  return items
}

function totalDeepEngaged(sites = []) {
  return sites.reduce((sum, s) => sum + (s.deepEngaged || 0), 0)
}

function buildCombinedEnergySeries(locationData) {
  const timeMap = {}
  locationData.forEach(({ govSnap }) => {
    if (govSnap.energySeries) {
      govSnap.energySeries.forEach(({ t, kw }) => {
        if (!timeMap[t]) timeMap[t] = { t, kw: 0 }
        timeMap[t].kw += kw
      })
    }
  })
  return Object.values(timeMap).sort((a, b) => a.t.localeCompare(b.t))
}

// Overview Lens Component
function OverviewLens({ locationData, allLocations, aggregateData, selectedLocationIds }) {
  const statusByLocation = useMemo(() => {
    const result = []
    locationData.forEach(({ location, advData, govSnap }) => {
      const alertCount = (advData.canopies || []).filter(c => c.status === 'alert').length
      const busyCount = (advData.canopies || []).filter(c => c.status === 'busy').length
      const okCount = (advData.canopies || []).length - alertCount - busyCount
      
      result.push({
        locationId: location.id,
        name: location.shortName,
        displayName: location.displayName,
        district: location.district,
        power: govSnap.powerKw,
        uptime: govSnap.networkUptime,
        canopyCount: advData.canopies?.length || 0,
        alertCount,
        busyCount,
        okCount,
        avgOcc: Math.round(advData.kpis?.avgOcc || 0),
        avgAqi: Math.round(advData.kpis?.avgAQI || 0),
        engagement: totalDeepEngaged(advData.engagementSites),
        status: alertCount > 0 ? 'alert' : busyCount > 2 ? 'warning' : 'ok'
      })
    })
    return result
  }, [locationData])

  return (
    <Stack spacing={2}>
      {/* System-Wide Summary */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
        <Typography variant="subtitle2" gutterBottom>System-Wide Status</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Active Locations</Typography>
              <Typography variant="h5" fontWeight={800}>{selectedLocationIds.length}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Total Canopies</Typography>
              <Typography variant="h5" fontWeight={800}>{aggregateData?.allCanopies.length || 0}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Critical Alerts</Typography>
              <Typography variant="h5" fontWeight={800} color="error.main">
                {(aggregateData?.allCanopies || []).filter(c => c.status === 'alert').length}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Total Incidents</Typography>
              <Typography variant="h5" fontWeight={800} color={aggregateData?.allIncidents > 0 ? 'warning.main' : 'success.main'}>
                {aggregateData?.allIncidents || 0}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Location Status Cards */}
      <Grid container spacing={1.5}>
        {statusByLocation.map((loc) => (
          <Grid item xs={12} sm={6} md={selectedLocationIds.length > 2 ? 6 : 4} key={loc.locationId}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.04)', 
                border: `1px solid ${loc.status === 'alert' ? 'rgba(239, 83, 80, 0.3)' : loc.status === 'warning' ? 'rgba(255, 167, 38, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.3s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', transform: 'translateY(-2px)' }
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{loc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{loc.district}</Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={loc.status === 'alert' ? 'Alert' : loc.status === 'warning' ? 'Warning' : 'Normal'} 
                    color={loc.status === 'alert' ? 'error' : loc.status === 'warning' ? 'warning' : 'success'} 
                  />
                </Stack>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Power</Typography>
                      <Typography variant="body2" fontWeight={700}>{loc.power.toFixed(1)} kW</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Uptime</Typography>
                      <Typography variant="body2" fontWeight={700}>{loc.uptime.toFixed(1)}%</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Avg Occupancy</Typography>
                      <Typography variant="body2" fontWeight={700}>{loc.avgOcc}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">Avg AQI</Typography>
                      <Typography variant="body2" fontWeight={700} color={loc.avgAqi > 150 ? 'error.main' : loc.avgAqi > 100 ? 'warning.main' : 'success.main'}>
                        {loc.avgAqi}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ opacity: 0.2 }} />
                
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                    <Typography variant="caption">{loc.alertCount} Alert</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    <Typography variant="caption">{loc.busyCount} Busy</Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="caption">{loc.okCount} OK</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Timeline */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
        <Typography variant="subtitle2" gutterBottom>Recent Activity</Typography>
        <List dense>
          {buildTriageQueue(aggregateData?.allCanopies || [], { incidents: aggregateData?.allIncidents, maintenanceDue: aggregateData?.anyMaintenance }, locationData).slice(0, 5).map((item, idx) => (
            <ListItem key={item.id} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
              <ListItemText 
                primary={<Typography fontWeight={700} variant="body2">{item.title}</Typography>} 
                secondary={<Typography variant="caption">{item.subtitle}</Typography>} 
              />
              <Chip size="small" label={item.tag} color={item.color} />
            </ListItem>
          ))}
          {buildTriageQueue(aggregateData?.allCanopies || [], { incidents: aggregateData?.allIncidents, maintenanceDue: aggregateData?.anyMaintenance }, locationData).length === 0 && (
            <ListItem><ListItemText primary="No active alerts" secondary="All systems operating normally" /></ListItem>
          )}
        </List>
      </Paper>
    </Stack>
  )
}

// Comparison Lens Component
function ComparisonLens({ locationData, allLocations, selectedLocationIds }) {
  const comparisonData = useMemo(() => {
    const result = []
    locationData.forEach(({ location, advData, govSnap }) => {
      result.push({
        locationId: location.id,
        name: location.shortName,
        power: govSnap.powerKw || 0,
        uptime: govSnap.networkUptime || 0,
        avgOcc: Math.round(advData.kpis?.avgOcc || 0),
        avgAqi: Math.round(advData.kpis?.avgAqi || 0),
        heatIndex: Math.round(advData.kpis?.heatIndex || 0),
        canopyCount: advData.canopies?.length || 0,
        engagement: totalDeepEngaged(advData.engagementSites),
        carbonOffset: govSnap.carbonOffset || 0,
        alertCount: (advData.canopies || []).filter(c => c.status === 'alert').length
      })
    })
    return result
  }, [locationData])

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa', '#fb923c']

  return (
    <Stack spacing={2}>
      {/* Comparison Bar Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: 280 }}>
            <Typography variant="subtitle2" gutterBottom>Power Output Comparison (kW)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="power" fill={globeColors.primary.main} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: 280 }}>
            <Typography variant="subtitle2" gutterBottom>Network Uptime Comparison (%)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[90, 100]} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="uptime" fill={statusColors.success.main} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: 280 }}>
            <Typography variant="subtitle2" gutterBottom>Average Occupancy Comparison</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="avgOcc" fill={statusColors.warning.main} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: 280 }}>
            <Typography variant="subtitle2" gutterBottom>Air Quality Index Comparison</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="avgAqi" fill="#82ca9d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: 280 }}>
            <Typography variant="subtitle2" gutterBottom>Heat Index Comparison (°C)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[25, 40]} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="heatIndex" fill="#ff7c7c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: 280 }}>
            <Typography variant="subtitle2" gutterBottom>Visitor Engagement Comparison</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="engagement" fill="#7b61ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Ranking Table */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
        <Typography variant="subtitle2" gutterBottom>Performance Ranking</Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Location</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Power (kW)</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Uptime (%)</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Canopies</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Avg AQI</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Heat Index (°C)</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Engagement</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={row.locationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <Typography variant="body2" fontWeight={700}>{row.name}</Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Typography variant="body2">{row.power.toFixed(1)}</Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Typography variant="body2">{row.uptime.toFixed(1)}</Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Typography variant="body2">{row.canopyCount}</Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Typography variant="body2" color={row.avgAqi > 150 ? 'error.main' : row.avgAqi > 100 ? 'warning.main' : 'success.main'}>
                      {row.avgAqi}
                    </Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Typography variant="body2" color={row.heatIndex > 35 ? 'error.main' : row.heatIndex > 32 ? 'warning.main' : 'inherit'}>
                      {row.heatIndex}°
                    </Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Typography variant="body2">{row.engagement}</Typography>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                    <Chip size="small" label={row.alertCount} color={row.alertCount > 0 ? 'error' : 'success'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Stack>
  )
}
