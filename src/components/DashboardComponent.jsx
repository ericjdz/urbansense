import { useEffect, useState } from 'react'
import { Box, Divider, Paper, Typography, Stack, Chip, Avatar, LinearProgress, Tooltip as MuiTooltip, IconButton } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { generateSimulatedData } from '../utils/dataSimulator'
import { getLocation } from '../config/locations'
import { globeColors, statusColors } from '../config/globeColors'
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import AirRoundedIcon from '@mui/icons-material/AirRounded'
import DeviceThermostatRoundedIcon from '@mui/icons-material/DeviceThermostatRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { ButtonColorful } from '@/components/ui/button-colorful'

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'tween', duration: 0.5 } },
  exit: { x: '100%', transition: { type: 'tween', duration: 0.4 } }
}

export default function DashboardComponent({ open, onClose, onExplore, locationId = null }) {
  const location = locationId ? getLocation(locationId) : null
  const [snap, setSnap] = useState(() => generateSimulatedData())
  const [series, setSeries] = useState(() => [{ t: new Date().toLocaleTimeString(), pm25: snap.pollutionPM25 }])

  useEffect(() => {
    const id = setInterval(() => {
      const s = generateSimulatedData()
      setSnap(s)
      setSeries(prev => [...prev.slice(-30), { t: new Date().toLocaleTimeString(), pm25: s.pollutionPM25 }])
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay-right" initial="hidden" animate="visible" exit="exit" variants={panelVariants}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 } }}>
            {/* Phone-like dashboard card with concise Luneta overview */}
            <Paper elevation={12} sx={{
              width: { xs: '100%', sm: 380, md: 420 },
              maxWidth: '100%',
              height: { xs: '100%', sm: '92%' },
              mx: 'auto',
              p: { xs: 1.75, sm: 2.25 },
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'rgba(8,12,24,0.9)',
              border: '1px solid rgba(120,220,255,0.18)',
              boxShadow: '0 18px 45px rgba(0,0,0,0.65)',
              backdropFilter: 'blur(14px)',
              overflow: 'hidden'
            }}>
              <Stack spacing={1.25} sx={{ height: '100%', minHeight: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontWeight: 800, flexShrink: 0 }}>U</Avatar>
                  <Stack spacing={0} sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 10 }}
                      noWrap
                    >
                      {location ? `${location.shortName} Overview` : 'UrbanSense Overview'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: { xs: 13, sm: 14 } }} noWrap>
                      UrbanSense Snapshot
                    </Typography>
                  </Stack>
                  <Chip size="small" label="LIVE" color="success" sx={{ ml: 0.5, flexShrink: 0 }} />
                  <Chip size="small" label={location ? location.shortName : 'Select Area'} variant="outlined" sx={{ fontSize: 10, ml: 0.5, maxWidth: 90 }} />
                  <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Divider sx={{ opacity: 0.2 }} />
                <Stack
                  spacing={1.25}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 3
                    }
                  }}
                >
                  {/* Section 1: Comfort with KPI and risk bar */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(255,193,7,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WbSunnyRoundedIcon color="warning" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">Comfort right now</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="baseline" mt={1}>
                      <Typography variant="h4" fontWeight={800}>{snap.sunHeatIndex}°C</Typography>
                      <Chip
                        size="small"
                        label={snap.sunHeatIndex >= 42 ? 'Very Hot' : snap.sunHeatIndex >= 36 ? 'Warm' : 'Comfortable'}
                        color={snap.sunHeatIndex >= 42 ? 'error' : snap.sunHeatIndex >= 36 ? 'warning' : 'success'}
                      />
                    </Stack>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (snap.sunHeatIndex / 45) * 100)}
                        sx={{
                          height: 6,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.04)',
                          '& .MuiLinearProgress-bar': {
                            background: snap.sunHeatIndex >= 42
                              ? 'linear-gradient(90deg,#f44336,#e91e63)'
                              : snap.sunHeatIndex >= 36
                              ? 'linear-gradient(90deg,#ff9800,#ffc107)'
                              : 'linear-gradient(90deg,#4caf50,#8bc34a)'
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Feels like {snap.sunHeatIndex}°C with {snap.humidity}% humidity and {snap.weather.condition.toLowerCase()} skies.
                    </Typography>
                  </Paper>

                  {/* Section 2: Air Quality + safety band (keeps richer viz) */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(33,150,243,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AirRoundedIcon color="info" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">Air quality</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Current air quality is <strong>{airQualityLabel(snap.airQualityIndex)}</strong> (AQI {snap.airQualityIndex}).
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <MuiTooltip title="0-50 Good · 51-100 Moderate · 101+ Unhealthy">
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (snap.airQualityIndex / 200) * 100)}
                          sx={{
                            height: 6,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.04)',
                            '& .MuiLinearProgress-bar': {
                              background: snap.airQualityIndex <= 50
                                ? 'linear-gradient(90deg,#4caf50,#8bc34a)'
                                : snap.airQualityIndex <= 100
                                ? 'linear-gradient(90deg,#ff9800,#ffc107)'
                                : 'linear-gradient(90deg,#f44336,#e91e63)'
                            }
                          }}
                        />
                      </MuiTooltip>
                    </Box>
                    <Box sx={{ height: 56, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="pmMiniFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={globeColors.primary.main} stopOpacity={0.6} />
                              <stop offset="100%" stopColor={globeColors.primary.main} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="t" hide />
                          <YAxis domain={[0, 'auto']} hide />
                          <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                          <Area type="monotone" dataKey="pm25" stroke={globeColors.primary.main} strokeWidth={1.5} fill="url(#pmMiniFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      PM2.5 movement over the last few minutes.
                    </Typography>
                  </Paper>

                  {/* Section 3: Busyness / crowding with KPI and load bar */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GroupsRoundedIcon color="success" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">How busy is {location ? location.shortName : 'this area'}?</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="baseline" mt={1}>
                      <Typography variant="h5" fontWeight={800}>{busynessLabel(snap.footTraffic)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {snap.footTraffic} people / hour
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (snap.footTraffic / 600) * 100)}
                        sx={{
                          height: 6,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.04)',
                          '& .MuiLinearProgress-bar': {
                            background: snap.footTraffic < 300
                              ? 'linear-gradient(90deg,#4caf50,#8bc34a)'
                              : snap.footTraffic < 500
                              ? 'linear-gradient(90deg,#ff9800,#ffc107)'
                              : 'linear-gradient(90deg,#f44336,#e91e63)'
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Based on live estimates of people moving through main paths.
                    </Typography>
                  </Paper>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                  {location ? location.shortName : 'Area'} snapshot · Comfort {snap.sunHeatIndex}°C · Air {airQualityLabel(snap.airQualityIndex)} · {busynessLabel(snap.footTraffic)}.
                </Typography>
                <Divider sx={{ opacity: 0.2 }} />
                <Box sx={{ pt: 1 }}>
                  <ButtonColorful onClick={onExplore} label={location ? `Explore ${location.shortName}` : 'Explore Area'} />
                </Box>
              </Stack>
            </Paper>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function airQualityLabel(aqi) {
  if (aqi == null) return 'Unknown'
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function busynessLabel(footTraffic) {
  if (footTraffic == null) return 'Unknown'
  if (footTraffic < 150) return 'Quiet'
  if (footTraffic < 300) return 'Moderate'
  if (footTraffic < 500) return 'Busy'
  return 'Crowded'
}

// MiniKpi removed: metrics now live inside main cards with richer visuals
