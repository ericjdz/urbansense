import { Paper, Typography, List, ListItem, ListItemText, Chip, LinearProgress, Stack, Box, IconButton } from '@mui/material'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { canopyStatus, statusColors } from '../../config/globeColors'

export default function CanopyStatusPanel({ data, onSelectCanopy }) {
  if (!data || !data.canopies) return null
  
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2">Smart Canopy Network Status</Typography>
        <Chip 
          size="small" 
          icon={<SensorsRoundedIcon sx={{ fontSize: 14 }} />} 
          label={`${data.canopies.length} Active`} 
          color="primary" 
          variant="outlined"
        />
      </Stack>
      
      <List dense sx={{ overflow: 'auto' }}>
        {data.canopies.map(c => (
          <ListItem 
            key={c.id} 
            sx={{ 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              borderRadius: 2,
              mb: 1,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                transform: 'translateX(4px)'
              }
            }}
            onClick={() => onSelectCanopy && onSelectCanopy(c)}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: statusColor(c.status),
                    boxShadow: `0 0 8px ${statusColor(c.status)}`
                  }} 
                />
                <ListItemText 
                  primary={c.name} 
                  secondary={`AQI ${c.aqi} • ${Math.round(c.occupancy)} people nearby`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </Stack>
              <Chip size="small" label={label(c.status)} color={color(c.status)} />
              <IconButton size="small" sx={{ opacity: 0.6 }}>
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((c.occupancy / 30) * 100, 100)} 
              sx={{ 
                mt: 1, 
                width: '100%', 
                height: 6, 
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: c.occupancy > 20 ? '#ef5350' : c.occupancy > 15 ? '#ffa726' : '#66bb6a'
                }
              }} 
            />
          </ListItem>
        ))}
      </List>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
        Click any canopy to view detailed metrics, trends, and take actions
      </Typography>
    </Paper>
  )
}

function statusColor(s) {
  switch (s) {
    case 'ok': return '#66bb6a'
    case 'busy': return '#ffa726'
    case 'alert': return '#ef5350'
    default: return '#888'
  }
}

function color(s) {
  switch (s) {
    case 'ok': return 'success'
    case 'busy': return 'warning'
    case 'alert': return 'error'
    default: return 'default'
  }
}

function label(s) {
  switch (s) {
    case 'ok': return 'OK'
    case 'busy': return 'Busy'
    case 'alert': return 'Alert'
    default: return s
  }
}
