import { useRef, useState, lazy, Suspense, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Fab, Tooltip } from '@mui/material'
import MapComponent, { flyToLocation } from '../components/MapComponent'
import DashboardComponent from '../components/DashboardComponent'
const UrbanSenseControlRoom = lazy(() => import('../components/UrbanSenseControlRoom'))
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded'

export default function MainView() {
  const navigate = useNavigate()
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const mapInstanceRef = useRef(null)
  const [controlOpen, setControlOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mapOpacity, setMapOpacity] = useState(1)

  const handleLocationSelect = useCallback((locationId) => {
    setSelectedLocation(locationId)
    setDashboardOpen(true)
  }, [])

  const handleExplore = useCallback(async () => {
    if (!selectedLocation) {
      console.warn('No location selected')
      return
    }
    
    if (isTransitioning) {
      console.warn('Already transitioning')
      return
    }
    
    console.log('Exploring location:', selectedLocation)
    setIsTransitioning(true)
    
    // 1) Close panel
    setDashboardOpen(false)
    
    // 2) Start flying and fading out simultaneously
    if (mapInstanceRef.current) {
      console.log('Flying to location:', selectedLocation)
      
      // Start fade out immediately
      setTimeout(() => setMapOpacity(0), 100)
      
      try {
        // Fly to location
        await flyToLocation(mapInstanceRef.current, selectedLocation, { zoom: 16, speed: 1.4 })
        console.log('Fly animation completed')
      } catch (error) {
        console.error('Error during fly animation:', error)
      }
    } else {
      console.warn('Map not ready, skipping fly animation')
      setMapOpacity(0)
      await new Promise(resolve => setTimeout(resolve, 600))
    }
    
    // 3) Navigate to detail view
    const targetPath = `/location/${selectedLocation}`
    console.log('Navigating to:', targetPath)
    try {
      navigate(targetPath)
      console.log('Navigation called successfully')
    } catch (error) {
      console.error('Navigation error:', error)
    }
    setIsTransitioning(false)
    // Reset opacity for when coming back
    setTimeout(() => setMapOpacity(1), 100)
  }, [selectedLocation, isTransitioning, navigate])

  return (
    <Box
      sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: mapOpacity,
          transition: 'opacity 0.6s ease-in-out'
        }}
      >
        <MapComponent
          onLocationSelect={handleLocationSelect}
          onMapReady={(m) => (mapInstanceRef.current = m)}
          selectedLocation={selectedLocation}
        />
      </Box>

      <DashboardComponent 
        open={dashboardOpen} 
        onClose={() => setDashboardOpen(false)} 
        onExplore={handleExplore}
        locationId={selectedLocation}
      />

      {/* Open UrbanSense Control Room */}
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

      <Suspense fallback={null}>
        <UrbanSenseControlRoom open={controlOpen} onClose={() => setControlOpen(false)} />
      </Suspense>
    </Box>
  )
}
