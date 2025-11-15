import { useRef, useState, lazy, Suspense } from 'react'
import { Box, Fab, Tooltip } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import MapComponent, { flyToLuneta } from '../components/MapComponent'
import DashboardComponent from '../components/DashboardComponent'
import LunetaDetailView from './LunetaDetailView'
const UrbanSenseControlRoom = lazy(() => import('../components/UrbanSenseControlRoom'))
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'

export default function MainView() {
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [view, setView] = useState('map') // 'map' | 'detail'
  const [mapOpacity, setMapOpacity] = useState(1)
  const mapInstanceRef = useRef(null)
  const [controlOpen, setControlOpen] = useState(false)

  const handleMarkerClick = () => setDashboardOpen(true)

  const handleExplore = async () => {
    // 1) Close panel
    setDashboardOpen(false)
    // 2) Fly camera to Luneta, then fade to detail
    await flyToLuneta(mapInstanceRef.current, { zoom: 16 })
    // 3) Cross-fade map -> detail
    setMapOpacity(0)
    setTimeout(() => setView('detail'), 650)
  }

  const handleBackToMap = () => {
    // Fade detail out and map back in
    setView('map')
    setTimeout(() => setMapOpacity(1), 0)
  }

  return (
    <Box
      className="crossfade"
      sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      {view === 'map' && (
        <MapComponent
          onMarkerClick={handleMarkerClick}
          onMapReady={(m) => (mapInstanceRef.current = m)}
          opacity={mapOpacity}
        />
      )}

      <DashboardComponent open={dashboardOpen && view === 'map'} onClose={() => setDashboardOpen(false)} onExplore={handleExplore} />

      <AnimatePresence>{view === 'detail' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <LunetaDetailView onBack={handleBackToMap} />
        </motion.div>
      )}</AnimatePresence>

      {/* Open UrbanSense Control Room */}
      {view === 'map' && (
        <Tooltip title="Open UrbanSense Control Room">
          <Fab
            color="primary"
            size="medium"
            onClick={() => setControlOpen(true)}
            sx={{ position: 'absolute', top: 16, left: 16, zIndex: 21 }}
          >
            <DashboardCustomizeRoundedIcon />
          </Fab>
        </Tooltip>
      )}

      <Suspense fallback={null}>
        <UrbanSenseControlRoom open={controlOpen} onClose={() => setControlOpen(false)} />
      </Suspense>
    </Box>
  )}
