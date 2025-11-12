import { Paper, Typography, List, ListItem, ListItemText, Chip, LinearProgress, Stack } from '@mui/material'

export default function CanopyStatusPanel({ data }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, width: 360, minWidth: 300, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom>Canopy Status</Typography>
      <List dense sx={{ flex: 1, overflow: 'auto' }}>
        {data.canopies.map(c => (
          <ListItem key={c.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <ListItemText primary={c.name} secondary={`AQI ${c.aqi}`} />
              <Chip size="small" label={label(c.status)} color={color(c.status)} />
            </Stack>
            <LinearProgress variant="determinate" value={c.occupancy} sx={{ mt: 0.5, width: '100%' }} />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
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
