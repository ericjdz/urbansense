import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Divider, Grid, Paper, Typography, Stack, Chip, TextField, Avatar } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { generateSimulatedData } from '../utils/dataSimulator'
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import AirRoundedIcon from '@mui/icons-material/AirRounded'
import DeviceThermostatRoundedIcon from '@mui/icons-material/DeviceThermostatRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'tween', duration: 0.5 } },
  exit: { x: '100%', transition: { type: 'tween', duration: 0.4 } }
}

export default function DashboardComponent({ open, onClose, onExplore }) {
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
            {/* Phone-like dashboard card with glass style */}
            <Paper elevation={10} sx={{
              width: 380,
              maxWidth: '100%',
              height: { xs: '100%', sm: '92%' },
              mx: 'auto',
              p: 2.25,
              borderRadius: 2.5,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'rgba(18,18,18,0.65)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)'
            }}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>U</Avatar>
                  <Typography variant="subtitle1" fontWeight={800}>UrbanSense</Typography>
                  <Chip size="small" label="LIVE" color="success" sx={{ ml: 1 }} />
                  <Box flexGrow={1} />
                </Stack>
                <TextField size="small" placeholder="Search" fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 12,
                    bgcolor: 'rgba(255,255,255,0.06)'
                  }
                }} />
                <Divider sx={{ opacity: 0.2 }} />
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(255,193,7,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WbSunnyRoundedIcon color="warning" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">Sun Heat Index</Typography>
                    </Stack>
                    <Typography variant="h4" mt={1} fontWeight={800}>{snap.sunHeatIndex}°C</Typography>
                    <Chip size="small" label={snap.sunHeatIndex > 40 ? 'High' : 'Moderate'} color={snap.sunHeatIndex > 40 ? 'error' : 'warning'} sx={{ mt: 1 }} />
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(33,150,243,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AirRoundedIcon color="info" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">Air Quality / Humidity</Typography>
                    </Stack>
                    <Typography variant="h5" mt={1} fontWeight={800}>AQI {snap.airQualityIndex}</Typography>
                    <Typography variant="body2" color="text.secondary">Humidity {snap.humidity}%</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, height: 180, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography variant="subtitle2" gutterBottom>PM2.5 (µg/m³)</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="pmFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1976d2" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" hide />
                        <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <Area type="monotone" dataKey="pm25" stroke="#64B6F7" strokeWidth={2} fill="url(#pmFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(244,67,54,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DeviceThermostatRoundedIcon color="error" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">Weather</Typography>
                    </Stack>
                    <Typography variant="h4" mt={1} fontWeight={800}>{snap.weather.temp}°</Typography>
                    <Typography variant="body2" color="text.secondary">{snap.weather.condition}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GroupsRoundedIcon color="success" fontSize="small" />
                      </Box>
                      <Typography variant="subtitle2">Foot Traffic</Typography>
                    </Stack>
                    <Typography variant="h4" mt={1} fontWeight={800}>{snap.footTraffic}</Typography>
                    <Typography variant="body2" color="text.secondary">people / hour</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box flexGrow={1} />
              <Divider sx={{ opacity: 0.2 }} />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" fullWidth onClick={onClose} sx={{ borderRadius: 12 }}>Close</Button>
                <Button variant="contained" fullWidth onClick={onExplore} sx={{ borderRadius: 12 }}>Explore</Button>
              </Stack>
            </Stack>
            </Paper>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
