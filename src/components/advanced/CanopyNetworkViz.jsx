import { useState, useMemo } from 'react'
import { Paper, Typography, Stack, Box } from '@mui/material'
import { canopyStatus } from '../../config/globeColors'

export default function CanopyNetworkViz({ canopies = [], onSelectCanopy }) {
  const [hoveredCanopy, setHoveredCanopy] = useState(null)

  // Calculate view dimensions
  const width = 800
  const height = 400
  const padding = 60

  // Get grid dimensions from canopy positions
  const maxX = Math.max(...canopies.map(c => c.x || 0), 23)
  const maxY = Math.max(...canopies.map(c => c.y || 0), 15)

  // Scale canopy positions to SVG coordinates
  const scaledCanopies = useMemo(() => {
    return canopies.map(c => ({
      ...c,
      svgX: padding + ((c.x || 0) / maxX) * (width - 2 * padding),
      svgY: padding + ((c.y || 0) / maxY) * (height - 2 * padding)
    }))
  }, [canopies, maxX, maxY])

  const getCanopyColor = (canopy) => {
    return canopyStatus[canopy.status]?.color || canopyStatus.ok.color
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ width: '100%', height: height, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Canopy nodes */}
          {scaledCanopies.map((canopy, idx) => {
            const isHovered = hoveredCanopy?.id === canopy.id
            const radius = isHovered ? 14 : 10
            
            return (
              <g key={`canopy-${idx}`}>
                {/* Glow effect on hover */}
                {isHovered && (
                  <circle
                    cx={canopy.svgX}
                    cy={canopy.svgY}
                    r={radius + 10}
                    fill={getCanopyColor(canopy)}
                    opacity="0.25"
                  />
                )}
                
                {/* Main canopy circle */}
                <circle
                  cx={canopy.svgX}
                  cy={canopy.svgY}
                  r={radius}
                  fill={getCanopyColor(canopy)}
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="2.5"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={() => setHoveredCanopy(canopy)}
                  onMouseLeave={() => setHoveredCanopy(null)}
                  onClick={() => onSelectCanopy && onSelectCanopy(canopy)}
                />
                
                {/* Canopy label */}
                <text
                  x={canopy.svgX}
                  y={canopy.svgY - radius - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="rgba(255,255,255,0.95)"
                  fontWeight="600"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {canopy.name}
                </text>

                {/* People count indicator */}
                <text
                  x={canopy.svgX}
                  y={canopy.svgY + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill="white"
                  fontWeight="700"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {Math.round(canopy.occupancy)}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>

      {/* Hover tooltip */}
      {hoveredCanopy && (
        <Paper 
          elevation={8}
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            p: 1.5,
            minWidth: 220,
            bgcolor: 'rgba(18,18,18,0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            zIndex: 10
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>{hoveredCanopy.name}</Typography>
          <Stack direction="row" spacing={2} mt={0.5}>
            <Typography variant="caption" color="text.secondary">
              People: <strong style={{ color: '#fff' }}>{Math.round(hoveredCanopy.occupancy)}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AQI: <strong style={{ color: '#fff' }}>{hoveredCanopy.aqi}</strong>
            </Typography>
          </Stack>
          <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
            Click for detailed view →
          </Typography>
        </Paper>
      )}
    </Box>
  )
}
