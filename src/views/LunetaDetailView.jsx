import { useContext, useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { AppBar, Toolbar, IconButton, Box, Container, Grid, Paper, Stack, Typography, Tooltip, Chip, Divider, Tabs, Tab, ToggleButtonGroup, ToggleButton, Select, MenuItem } from '@mui/material'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ForestRoundedIcon from '@mui/icons-material/ForestRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ReportRoundedIcon from '@mui/icons-material/ReportRounded'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import ImageSliderComponent from '../components/ImageSliderComponent'
import DemoOne from '../components/ui/demo'
import { ColorModeContext } from '../App'
import { generateSimulatedData } from '../utils/dataSimulator'
import { generateGovernmentSnapshot } from '../utils/govSimulator'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import { generateAdvancedData } from '../utils/advancedSimulator'
const HeatmapPanel = lazy(() => import('../components/advanced/HeatmapPanel'))
const CanopyStatusPanel = lazy(() => import('../components/advanced/CanopyStatusPanel'))
const TimeSeriesPanel = lazy(() => import('../components/advanced/TimeSeriesPanel'))
const KpiGaugesPanel = lazy(() => import('../components/advanced/KpiGaugesPanel'))
const SankeyPanel = lazy(() => import('../components/advanced/SankeyPanel'))
const NetworkGraphPanel = lazy(() => import('../components/advanced/NetworkGraphPanel'))

gsap.registerPlugin(ScrollTrigger)

function SensorBlock({ title, description, image, index }) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = `#sensor-${index}`
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
            scrub: true
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
            scrub: true
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
            scrub: true
          }
        }
      )
    })
    return () => ctx.revert()
  }, [index])

  return (
    <Paper id={`sensor-${index}`} variant="outlined" sx={{ p: { xs: 2, md: 3 }, transition: 'box-shadow .3s', '&:hover': { boxShadow: 6 } }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box className="sensor-img" component="img" src={image} alt={title} sx={{ width: '100%', borderRadius: 3 }} />
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

export default function LunetaDetailView({ onBack }) {
  const { mode, toggleColorMode } = useContext(ColorModeContext)
  const [publicSnap, setPublicSnap] = useState(() => generateSimulatedData())
  const [govSnap, setGovSnap] = useState(() => generateGovernmentSnapshot())
  const [trafficSeries, setTrafficSeries] = useState(() => [])
  const [tab, setTab] = useState(0) // 0: Heritage, 1: Dashboard
  const [advTab, setAdvTab] = useState(0) // 0 Maps, 1 Trends, 2 KPIs, 3 Engagement, 4 Network
  const [timeRange, setTimeRange] = useState('24h')
  const [mapLayer, setMapLayer] = useState('foot')
  const [advData, setAdvData] = useState(() => generateAdvancedData({ hours: 24 }))

  useEffect(() => {
    const id1 = setInterval(() => setPublicSnap(generateSimulatedData()), 5000)
    const id2 = setInterval(() => setGovSnap(generateGovernmentSnapshot()), 6000)
    const id3 = setInterval(() => setAdvData(generateAdvancedData({ hours: timeRange === '24h' ? 24 : 168 })), 6000)
    return () => { clearInterval(id1); clearInterval(id2); clearInterval(id3) }
  }, [])

  useEffect(() => {
    // regenerate when timeRange changes
    setAdvData(generateAdvancedData({ hours: timeRange === '24h' ? 24 : 168 }))
  }, [timeRange])

  useEffect(() => {
    setTrafficSeries(prev => {
      const next = [...prev, { t: new Date().toLocaleTimeString(), v: publicSnap.footTraffic }]
      return next.slice(-24)
    })
  }, [publicSnap.footTraffic])

  const kpis = useMemo(() => ([
    { icon: <BoltRoundedIcon color="warning" />, label: 'Solar Power', value: `${govSnap.powerKw} kW` },
    { icon: <ForestRoundedIcon color="success" />, label: 'Shading', value: `${govSnap.shading}%` },
    { icon: <ShieldRoundedIcon color="info" />, label: 'Compliance', value: `${govSnap.complianceScore}%` },
    { icon: <ReportRoundedIcon color={govSnap.incidents ? 'error' : 'success'} />, label: 'Incidents', value: `${govSnap.incidents}` }
  ]), [govSnap])
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
      <AppBar color="transparent" elevation={0} position="sticky" sx={{ backdropFilter: 'blur(6px)', bgcolor: 'background.default' }}>
        <Toolbar>
          <Tooltip title="Back to Map">
            <IconButton edge="start" onClick={onBack} sx={{ mr: 1 }}>
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" fontWeight={800} letterSpacing={2} sx={{ flexGrow: 1 }}>LUNETA PARK</Typography>
          <Tooltip title={mode === 'dark' ? 'Switch to Day' : 'Switch to Night'}>
            <IconButton onClick={toggleColorMode}>
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        {/* Hero: title + live chips */}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Luneta Park (Rizal Park)</Typography>
              <Typography variant="body2" color="text.secondary">Ermita, Manila • Smart Heritage Canopies pilot site</Typography>
            </Box>
            <Box flexGrow={1} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={`Weather: ${publicSnap.weather.temp}° ${publicSnap.weather.condition}`} />
              <Chip size="small" label={`AQI ${publicSnap.airQualityIndex}`} color={publicSnap.airQualityIndex > 120 ? 'warning' : 'success'} />
              <Chip size="small" label={`Foot Traffic: ${publicSnap.footTraffic}/hr`} />
            </Stack>
          </Stack>
        </Paper>

        {/* Visual hero: replaced with new carousel */}
        <DemoOne />

        {/* Scroll animation hero removed to avoid undefined import */}

        {/* Tabs: Heritage | Dashboard */}
        <Box sx={{ mt: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{ px: 1 }}>
              <Tab label="Heritage" />
              <Tab label="Dashboard" />
            </Tabs>
            <Divider sx={{ opacity: 0.15 }} />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {/* Heritage Panel */}
              {tab === 0 && (
                <Stack spacing={4}>
                  <Typography variant="body1" color="text.secondary">Luneta Park is a national heritage landscape featuring iconic monuments, cultural venues, and civic spaces. Smart Heritage Canopies aim to protect comfort and walkability while preserving sightlines and historical integrity.</Typography>

                  {/* Heritage Highlights */}
                  <SectionCard title="Highlights">
                    <Grid container spacing={1.5}>
                      {[{
                        title: 'Rizal Monument',
                        desc: 'Central obelisk and statue marking Dr. José Rizal\'s resting place. Preserved sightlines and ambient lighting.'
                      }, {
                        title: 'Open-Air Auditorium',
                        desc: 'Community events venue with optional canopy shade and adjacent AQ sensing.'
                      }, {
                        title: 'Museum Cluster',
                        desc: 'National Museum complex perimeter with improved walkability and microclimate nodes.'
                      }].map((h, i) => (
                        <Grid item xs={12} md={4} key={i}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                            <Typography variant="subtitle1" fontWeight={700}>{h.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{h.desc}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </SectionCard>

                  {/* Heritage Components (placeholders) */}
                  <SectionCard title="Heritage Components">
                    <Grid container spacing={1.5}>
                      {[
                        {
                          title: 'Cooling Canopy',
                          img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
                          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In hac habitasse platea dictumst.'
                        },
                        {
                          title: 'Solar Tree',
                          img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&h=800&fit=crop',
                          desc: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
                        },
                        {
                          title: 'Water Feature',
                          img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
                          desc: 'Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.'
                        },
                        {
                          title: 'Garden Walk',
                          img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
                          desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
                        },
                        {
                          title: 'Pavilion',
                          img: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop',
                          desc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                        },
                        {
                          title: 'Monument Plaza',
                          img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
                          desc: 'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vestibulum ante ipsum primis in faucibus.'
                        },
                      ].map((c, i) => (
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

                  {/* Sensor storytelling retains animated blocks */}
                  {[{
                    title: 'AI-Powered Smart Canopy',
                    description: 'This dynamic canopy adjusts its axis in real-time, tracking the sun\'s path to provide maximum shade throughout the day. Integrated sensors continuously gather environmental data, making it the central nervous system of our smart park.',
                    image: 'https://picsum.photos/seed/canopy/1200/700'
                  }, {
                    title: 'Air Quality Node',
                    description: 'Distributed AQ nodes monitor PM2.5, humidity, and temperature to adapt park ventilation and shade logic.',
                    image: 'https://picsum.photos/seed/aqnode/1200/700'
                  }, {
                    title: 'Foot Traffic Vision',
                    description: 'Anonymous computer vision counts and directionality support crowd-comfort routing and safety alerts.',
                    image: 'https://picsum.photos/seed/traffic/1200/700'
                  }].map((b, i) => (
                    <SensorBlock key={i} index={i} {...b} />
                  ))}
                </Stack>
              )}

              {/* Dashboard Panel */}
              {tab === 1 && (
                <Stack spacing={4}>
                  {/* KPI strip */}
                  <Grid container spacing={1.5}>
                    {kpis.map((k, i) => (
                      <Grid key={i} item xs={6} md={3}>
                        <StatCard {...k} />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Secondary tabs: Maps | Trends | KPIs | Engagement | Network */}
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Tabs value={advTab} onChange={(_, v) => setAdvTab(v)} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{ flex: 1 }}>
                        <Tab label="Maps" />
                        <Tab label="Trends" />
                        <Tab label="KPIs" />
                        <Tab label="Engagement" />
                        <Tab label="Network" />
                      </Tabs>
                      {/* Filters */}
                      <ToggleButtonGroup size="small" exclusive value={mapLayer} onChange={(_, v) => v && setMapLayer(v)}>
                        <ToggleButton value="foot">Foot</ToggleButton>
                        <ToggleButton value="aqi">AQI</ToggleButton>
                      </ToggleButtonGroup>
                      <Select size="small" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                        <MenuItem value="24h">Last 24h</MenuItem>
                        <MenuItem value="7d">Last 7d</MenuItem>
                      </Select>
                    </Stack>
                    <Divider sx={{ opacity: 0.15 }} />
                    <Suspense fallback={null}>
                      {advTab === 0 && (
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} md={7}>
                            <SectionCard title={`Heatmap (${mapLayer === 'aqi' ? 'AQI' : 'Foot Traffic'})`}>
                              <div style={{ height: 320 }}>
                                <HeatmapPanel data={advData} mapLayer={mapLayer} />
                              </div>
                            </SectionCard>
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <CanopyStatusPanel data={advData} />
                          </Grid>
                        </Grid>
                      )}
                      {advTab === 1 && (
                        <TimeSeriesPanel data={advData} />
                      )}
                      {advTab === 2 && (
                        <KpiGaugesPanel data={advData} />
                      )}
                      {advTab === 3 && (
                        <SankeyPanel data={advData} />
                      )}
                      {advTab === 4 && (
                        <NetworkGraphPanel data={advData} />
                      )}
                    </Suspense>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
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

function DonutGauge({ value, min = 0, max = 100, units = '', thresholds = { warn: 70, danger: 85 } }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const size = 160
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * pct
  const color = value >= thresholds.danger ? '#ef5350' : value >= thresholds.warn ? '#ffa726' : '#66bb6a'
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
        <Typography variant="h5" fontWeight={800}>{value}{units}</Typography>
        <Typography variant="caption" color="text.secondary">{pct < 0.5 ? 'Comfortable' : (value >= thresholds.danger ? 'High Risk' : 'Warm')}</Typography>
      </Stack>
    </Box>
  )
}
