import { useContext, useEffect, useMemo, useState, lazy, Suspense, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Box, Container, Grid, Paper, Stack, Typography, Tooltip, Chip, Divider, Tabs, Tab, ToggleButtonGroup, ToggleButton, Select, MenuItem, Drawer, Button, ButtonGroup } from '@mui/material'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import AirRoundedIcon from '@mui/icons-material/AirRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import ThermostatRoundedIcon from '@mui/icons-material/ThermostatRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ColorModeContext } from '../App'
import { generateSimulatedData } from '../utils/dataSimulator'
import { generateGovernmentSnapshot } from '../utils/govSimulator'
import { generateAdvancedData } from '../utils/advancedSimulator'
import { getLocation } from '../config/locations'
import HeritageCarousel from '../components/HeritageCarousel'
import { statusColors, canopyStatus } from '../config/globeColors'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from 'recharts'

const CanopyStatusPanel = lazy(() => import('../components/advanced/CanopyStatusPanel'))
const TimeSeriesPanel = lazy(() => import('../components/advanced/TimeSeriesPanel'))
const KpiGaugesPanel = lazy(() => import('../components/advanced/KpiGaugesPanel'))
const EngagementPanel = lazy(() => import('../components/advanced/EngagementPanel'))

gsap.registerPlugin(ScrollTrigger)

function SensorBlock({ title, description, image, index, scroller }) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = `#sensor-${index}`
      const scrollerEl = scroller?.current || undefined
      gsap.fromTo(
        `${trigger} .sensor-img`,
        { autoAlpha: 0, x: -60, scale: 0.95 },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          scrollTrigger: {
            trigger,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            scroller: scrollerEl
          }
        }
      )
      gsap.fromTo(
        `${trigger} .sensor-text`,
        { autoAlpha: 0, x: 60, scale: 0.95 },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          scrollTrigger: {
            trigger,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            scroller: scrollerEl
          }
        }
      )
      gsap.fromTo(
        trigger,
        { scale: 0.95, borderRadius: 24 },
        {
          scale: 1.03,
          borderRadius: 32,
          scrollTrigger: {
            trigger,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: true,
            scroller: scrollerEl
          }
        }
      )
    })
    return () => ctx.revert()
  }, [index, scroller])

  return (
    <Paper id={`sensor-${index}`} variant="outlined" sx={{ p: { xs: 2, md: 3 }, transition: 'box-shadow .3s', '&:hover': { boxShadow: 6 } }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box className="sensor-img" component="img" src={image} alt={title} sx={{ width: '100%', borderRadius: 3 }} onLoad={() => ScrollTrigger.refresh()} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack className="sensor-text" spacing={1}>
            <Typography variant="h6" fontWeight={800}>{title}</Typography>
            <Typography variant="body1" color="text.secondary">{description}</Typography>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default function HeritageDetailView() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const location = getLocation(locationId)
  
  const { mode, toggleColorMode } = useContext(ColorModeContext)
  const scrollerRef = useRef(null)
  const [opacity, setOpacity] = useState(0)
  const [publicSnap, setPublicSnap] = useState(() => generateSimulatedData())
  const [govSnap, setGovSnap] = useState(() => generateGovernmentSnapshot())
  const [tab, setTab] = useState(0) // 0: Heritage, 1: Live Monitoring, 2: Analytics
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedCanopy, setSelectedCanopy] = useState(null)
  const [advData, setAdvData] = useState(() => generateAdvancedData({ 
    hours: 24,
    bounds: location?.bounds
  }))

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 50)
    return () => clearTimeout(timer)
  }, [])

  // Redirect if location not found
  useEffect(() => {
    if (!location) {
      navigate('/')
    }
  }, [location, navigate])

  useEffect(() => {
    const id1 = setInterval(() => setPublicSnap(generateSimulatedData()), 5000)
    const id2 = setInterval(() => setGovSnap(generateGovernmentSnapshot()), 6000)
    const id3 = setInterval(() => setAdvData(generateAdvancedData({ 
      hours: timeRange === '24h' ? 24 : 168,
      bounds: location?.bounds
    })), 6000)
    return () => { clearInterval(id1); clearInterval(id2); clearInterval(id3) }
  }, [timeRange, location])

  useEffect(() => {
    // regenerate when timeRange changes
    setAdvData(generateAdvancedData({ 
      hours: timeRange === '24h' ? 24 : 168,
      bounds: location?.bounds
    }))
  }, [timeRange, location])

  // Visitor-centric KPIs
  // Heat Index calculation (simplified NOAA formula for feels-like temperature)
  const heatIndex = useMemo(() => {
    const temp = publicSnap.weather.temp
    const humidity = publicSnap.weather.humidity || 65 // default humidity if not available
    
    // Simplified heat index: HI = T + 0.5555 * (VP - 10), where VP = humidity factor
    const hi = temp + (0.5555 * ((humidity / 100) * 6.112 * Math.exp((17.67 * temp) / (temp + 243.5)) - 10))
    const hiRounded = Math.round(hi)
    
    // NOAA-based thresholds
    if (hiRounded >= 41) return { label: 'Extreme Caution', value: hiRounded, color: 'error' }
    if (hiRounded >= 32) return { label: 'Caution', value: hiRounded, color: 'warning' }
    return { label: 'Normal', value: hiRounded, color: 'success' }
  }, [publicSnap.weather.temp, publicSnap.weather.humidity])

  const crowdingLevel = useMemo(() => {
    const traffic = publicSnap.footTraffic
    if (traffic > 800) return { label: 'High', value: traffic, color: 'error' }
    if (traffic > 500) return { label: 'Moderate', value: traffic, color: 'warning' }
    return { label: 'Low', value: traffic, color: 'success' }
  }, [publicSnap.footTraffic])

  const aqiLevel = useMemo(() => {
    const aqi = publicSnap.airQualityIndex
    if (aqi > 150) return { label: 'Unhealthy', value: aqi, color: 'error' }
    if (aqi > 100) return { label: 'Moderate', value: aqi, color: 'warning' }
    return { label: 'Good', value: aqi, color: 'success' }
  }, [publicSnap.airQualityIndex])

  const kpis = useMemo(() => ([
    { icon: <ThermostatRoundedIcon />, label: 'Heat Index', value: `${heatIndex.label} (${heatIndex.value}°C)`, color: heatIndex.color },
    { icon: <PeopleRoundedIcon />, label: 'Visitor Traffic', value: `${crowdingLevel.label} (${crowdingLevel.value}/hr)`, color: crowdingLevel.color },
    { icon: <AirRoundedIcon />, label: 'Air Quality', value: `${aqiLevel.label} (AQI ${aqiLevel.value})`, color: aqiLevel.color },
    { icon: <BoltRoundedIcon />, label: 'Energy Output', value: `${govSnap.powerKw} kW`, color: 'success' }
  ]), [heatIndex, crowdingLevel, aqiLevel, govSnap.powerKw])

  // Map canopy data for visualization - convert grid coords to lat/lng
  const canopies = useMemo(() => {
    if (!advData?.canopies) return []
    
    // Default bounds for conversion (Luneta Park area)
    const bounds = location?.bounds || {
      minLng: 120.9757,
      maxLng: 120.9835,
      minLat: 14.5801,
      maxLat: 14.5870
    }
    
    // Grid dimensions from simulator
    const gridW = 24
    const gridH = 16
    
    return advData.canopies.map(c => {
      // Convert grid coordinates to geographic coordinates
      const lng = bounds.minLng + (c.x / gridW) * (bounds.maxLng - bounds.minLng)
      const lat = bounds.minLat + (c.y / gridH) * (bounds.maxLat - bounds.minLat)
      
      return {
        ...c,
        lng,
        lat,
        status: c.occupancy > 20 ? 'alert' : c.occupancy > 15 ? 'busy' : 'ok',
        maintenanceDue: false
      }
    })
  }, [advData, location])

  // Build time series for selected canopy
  const selectedCanopySeries = useMemo(() => {
    if (!selectedCanopy) return []
    const hours = timeRange === '24h' ? 24 : 168
    return Array.from({ length: hours }, (_, i) => {
      const t = new Date(Date.now() - (hours - i) * 3600000)
      return {
        t: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        occ: Math.round(selectedCanopy.occupancy + Math.random() * 20 - 10),
        aqi: Math.round(selectedCanopy.aqi + Math.random() * 30 - 15)
      }
    })
  }, [selectedCanopy, timeRange])

  if (!location) {
    return null
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <Box 
      ref={scrollerRef} 
      sx={{ 
        position: 'absolute', 
        inset: 0, 
        overflowY: 'auto',
        opacity: opacity,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <AppBar color="transparent" elevation={0} position="sticky" sx={{ backdropFilter: 'blur(6px)', bgcolor: 'background.default' }}>
        <Toolbar>
          <Tooltip title="Back to Map">
            <IconButton edge="start" onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" fontWeight={800} letterSpacing={2} sx={{ flexGrow: 1 }}>{location.name.toUpperCase()}</Typography>
          <Tooltip title={mode === 'dark' ? 'Switch to Day' : 'Switch to Night'}>
            <IconButton onClick={toggleColorMode}>
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Hero Carousel */}
      <Container sx={{ pt: 3 }}>
        <HeritageCarousel images={location.carouselImages} title={location.displayName} />
      </Container>

      <Container sx={{ py: 3 }}>
        {/* Hero: title + live chips */}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
            <Box>
              <Typography variant="h5" fontWeight={800}>{location.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">{location.district} • L.I.L.O.M pilot site</Typography>
            </Box>
            <Box flexGrow={1} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={`Weather: ${publicSnap.weather.temp}° ${publicSnap.weather.condition}`} />
              <Chip size="small" label={`AQI ${publicSnap.airQualityIndex}`} color={publicSnap.airQualityIndex > 120 ? 'warning' : 'success'} />
              <Chip size="small" label={`Foot Traffic: ${publicSnap.footTraffic}/hr`} />
            </Stack>
          </Stack>
        </Paper>

        {/* Tabs: Heritage | Live Monitoring | Analytics */}
        <Box sx={{ mt: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{ px: 1 }}>
              <Tab label="Heritage" />
              <Tab label="Live Monitoring" />
              <Tab label="Analytics" />
            </Tabs>
            <Divider sx={{ opacity: 0.15 }} />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {/* Heritage Panel */}
              {tab === 0 && (
                <Stack spacing={4}>
                  <Typography variant="body1" color="text.secondary">{location.description}</Typography>

                  {/* Heritage Highlights */}
                  <SectionCard title="Highlights">
                    <Grid container spacing={1.5}>
                      {location.highlights.map((h, i) => (
                        <Grid item xs={12} md={4} key={i}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                            <Typography variant="subtitle1" fontWeight={700}>{h.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{h.desc}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </SectionCard>

                  {/* Heritage Components */}
                  <SectionCard title="Heritage Components">
                    <Grid container spacing={1.5}>
                      {location.heritageComponents.map((c, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.03)' }}>
                            <Box component="img" src={c.img} alt={c.title} sx={{ width: '100%', height: 160, objectFit: 'cover' }} />
                            <Box sx={{ p: 2 }}>
                              <Typography variant="subtitle1" fontWeight={700}>{c.title}</Typography>
                              <Typography variant="body2" color="text.secondary">{c.desc}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </SectionCard>

                  {/* Sensor storytelling with animated blocks */}
                  {location.sensors.map((b, i) => (
                    <SensorBlock key={i} index={i} scroller={scrollerRef} {...b} />
                  ))}
                  
                  {/* Spacer to allow last scroll animations to fully complete */}
                  <Box sx={{ height: { xs: 80, md: 120 } }} />
                </Stack>
              )}

              {/* Live Monitoring Panel */}
              {tab === 1 && (
                <Stack spacing={3}>
                  {/* Live KPIs */}
                  <Grid container spacing={1.5}>
                    {kpis.map((k, i) => (
                      <Grid key={i} item xs={6} md={3}>
                        <StatCard {...k} />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Enhanced L.I.L.O.M Status - Primary Interface */}
                  <Suspense fallback={null}>
                    <CanopyStatusPanel data={advData} onSelectCanopy={setSelectedCanopy} />
                  </Suspense>
                </Stack>
              )}

              {/* Analytics Panel */}
              {tab === 2 && (
                <Stack spacing={3}>
                  {/* Time Range Control - Contextual to Analytics */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle2">Time Range:</Typography>
                    <ButtonGroup size="small" variant="outlined">
                      <Button 
                        variant={timeRange === '24h' ? 'contained' : 'outlined'}
                        onClick={() => setTimeRange('24h')}
                      >
                        Last 24h
                      </Button>
                      <Button 
                        variant={timeRange === '7d' ? 'contained' : 'outlined'}
                        onClick={() => setTimeRange('7d')}
                      >
                        Last 7d
                      </Button>
                      <Button 
                        variant={timeRange === '30d' ? 'contained' : 'outlined'}
                        onClick={() => setTimeRange('30d')}
                      >
                        Last 30d
                      </Button>
                    </ButtonGroup>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip size="small" label={`Viewing: ${timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}`} color="primary" variant="outlined" />
                  </Stack>

                  {/* Time Series with Brush */}
                  <Suspense fallback={null}>
                    <TimeSeriesPanel data={advData} />
                  </Suspense>

                  {/* KPI Trends */}
                  <Suspense fallback={null}>
                    <KpiGaugesPanel data={advData} />
                  </Suspense>

                  {/* Visitor Engagement & Impact */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
                    <Typography variant="subtitle2" gutterBottom>Visitor Engagement & Impact</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      When visitors approach L.I.L.O.M units or heritage hotspots, the system can trigger notifications through partner apps. 
                      This shows the engagement journey from detection to meaningful interaction with heritage content.
                    </Typography>
                    <Suspense fallback={null}>
                      <EngagementPanel data={advData} />
                    </Suspense>
                  </Paper>
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Drill-down Drawer for Selected L.I.L.O.M */}
      <Drawer 
        anchor="right" 
        open={!!selectedCanopy} 
        onClose={() => setSelectedCanopy(null)} 
        PaperProps={{ 
          sx: { 
            width: 420, 
            maxWidth: '90vw',
            bgcolor: 'rgba(18,18,18,0.95)', 
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          } 
        }}
      >
        {selectedCanopy && (
          <Stack spacing={2} sx={{ p: 3, height: '100%' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={800}>{selectedCanopy.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  L.I.L.O.M • Live Data
                </Typography>
              </Box>
              <Chip 
                size="small" 
                label={selectedCanopy.status.toUpperCase()} 
                color={selectedCanopy.status === 'alert' ? 'error' : selectedCanopy.status === 'busy' ? 'warning' : 'success'} 
              />
              <IconButton size="small" onClick={() => setSelectedCanopy(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            <Divider sx={{ opacity: 0.2 }} />

            {/* Live Metrics */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                  <Typography variant="caption" color="text.secondary">People Nearby</Typography>
                  <Typography variant="h5" fontWeight={800} color={selectedCanopy.occupancy > 20 ? 'error.main' : selectedCanopy.occupancy > 15 ? 'warning.main' : 'success.main'}>
                    {Math.round(selectedCanopy.occupancy)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {selectedCanopy.occupancy > 20 ? 'High Density' : selectedCanopy.occupancy > 15 ? 'Moderate' : 'Low Density'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                  <Typography variant="caption" color="text.secondary">Air Quality Index</Typography>
                  <Typography variant="h5" fontWeight={800} color={selectedCanopy.aqi > 150 ? 'error.main' : selectedCanopy.aqi > 100 ? 'warning.main' : 'success.main'}>
                    {selectedCanopy.aqi}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {selectedCanopy.aqi > 150 ? 'Unhealthy' : selectedCanopy.aqi > 100 ? 'Moderate' : 'Good'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                  <Typography variant="caption" color="text.secondary">Temperature</Typography>
                  <Typography variant="h5" fontWeight={800} color="info.main">
                    {Math.round(28 + Math.random() * 8)}°C
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Ambient Reading
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                  <Typography variant="caption" color="text.secondary">Humidity</Typography>
                  <Typography variant="h5" fontWeight={800} color="info.main">
                    {Math.round(60 + Math.random() * 25)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Relative Humidity
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Trend Chart */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', flex: 1, minHeight: 240 }}>
              <Typography variant="subtitle2" gutterBottom>
                {timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'} Trends
              </Typography>
              <ResponsiveContainer width="100%" height="88%">
                <LineChart data={selectedCanopySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} hide />
                  <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <RTooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="occ" name="People Count" stroke={statusColors.warning.main} dot={false} strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="aqi" name="AQI" stroke={statusColors.success.main} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Sensor Data Details */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
              <Typography variant="subtitle2" gutterBottom>Sensor Information</Typography>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Sensor ID</Typography>
                  <Chip size="small" label={selectedCanopy.id} variant="outlined" />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Grid ({selectedCanopy.x}, {selectedCanopy.y})
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    size="small" 
                    label={selectedCanopy.status.toUpperCase()} 
                    color={selectedCanopy.status === 'alert' ? 'error' : selectedCanopy.status === 'busy' ? 'warning' : 'success'}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Network Status</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColors.success.main, boxShadow: `0 0 6px ${statusColors.success.main}` }} />
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      Online
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Signal Strength</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(75 + Math.random() * 20)}%
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Data Collection Info */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
              <Typography variant="subtitle2" gutterBottom>Data Collection</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                This L.I.L.O.M (Light-adaptive Intelligent Layered Outdoor Module) monitors environmental conditions and visitor traffic in real-time.
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Air Quality:</strong> PM2.5, PM10, CO₂ levels measured every 5 minutes
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Climate:</strong> Temperature, humidity, and heat index monitoring
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Visitor Density:</strong> Thermal sensors tracking people beneath L.I.L.O.M coverage
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>Energy:</strong> Solar panel efficiency and battery levels tracked hourly
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Drawer>
    </Box>
  )
}

function StatCard({ icon, label, value, color = 'default' }) {
  const chipColor = color === 'default' ? 'rgba(255,255,255,0.08)' : 
                    color === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                    color === 'warning' ? 'rgba(255, 167, 38, 0.2)' :
                    color === 'error' ? 'rgba(239, 83, 80, 0.2)' : 'rgba(255,255,255,0.08)'
  
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: chipColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Stack>
        <Typography variant="h6" fontWeight={800}>{value}</Typography>
      </Stack>
    </Paper>
  )
}

function SectionCard({ title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography variant="subtitle2" gutterBottom>{title}</Typography>
      {children}
    </Paper>
  )
}
