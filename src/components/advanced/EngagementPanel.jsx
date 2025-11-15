import { Box, Paper, Typography, Grid, Stack, LinearProgress, List, ListItem, ListItemText } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { dataVizColors } from '../../config/globeColors'

export default function EngagementPanel({ data }) {
  const sites = data.engagementSites || []
  const totals = buildTotals(sites)

  return (
    <Grid container spacing={{ xs: 1, sm: 1.25, md: 1.5 }} sx={{ height: '100%' }}>
      <Grid item xs={12} md={6} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 280, md: 0 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', minHeight: { xs: 280, md: 0 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>GlobeOne Engagement by Heritage Site</Typography>
          <Stack spacing={1.25} sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {sites.map(site => {
              const completion = site.passers ? Math.round((site.deepEngaged / site.passers) * 100) : 0
              return (
                <SiteRow key={site.id} site={site} completion={completion} />
              )
            })}
            {sites.length === 0 && (
              <Typography variant="body2" color="text.secondary">No engagement data available.</Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 280, md: 0 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', minHeight: { xs: 280, md: 0 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1 }, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' }, flexShrink: 0 }}>Overall GlobeOne Journey Today</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, flexShrink: 0 }}>
            When a Globe user walks near a L.I.L.O.M unit or heritage hotspot,
            the system detects their presence and triggers a GlobeOne
            notification. This funnel shows how many visitors move through the
            journey from detection to deep engagement.
          </Typography>
          <Box sx={{ flexShrink: 0, minHeight: { xs: 140, md: 180 }, height: { xs: 140, md: 180 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[totals]} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }} width={120} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <Bar dataKey="passers" name="Detected visitors" stackId="funnel" fill={dataVizColors.series[0]} />
                <Bar dataKey="notified" name="Notified" stackId="funnel" fill={dataVizColors.series[1]} />
                <Bar dataKey="opened" name="Opened app" stackId="funnel" fill={dataVizColors.series[2]} />
                <Bar dataKey="engaged" name="Viewed content" stackId="funnel" fill={dataVizColors.series[3]} />
                <Bar dataKey="deepEngaged" name="Completed action" stackId="funnel" fill={dataVizColors.series[4]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <List dense sx={{ flexShrink: 0 }}>
            <ListItem sx={{ py: { xs: 0.25, sm: 0.5 } }}>
              <ListItemText 
                primary={`Notification reach: ${totals.passers ? Math.round((totals.notified / totals.passers) * 100) : 0}% of detected visitors`}
                primaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            </ListItem>
            <ListItem sx={{ py: { xs: 0.25, sm: 0.5 } }}>
              <ListItemText 
                primary={`Open rate: ${totals.notified ? Math.round((totals.opened / totals.notified) * 100) : 0}% of notified users`}
                primaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            </ListItem>
            <ListItem sx={{ py: { xs: 0.25, sm: 0.5 } }}>
              <ListItemText 
                primary={`Deep engagement: ${totals.engaged ? Math.round((totals.deepEngaged / totals.engaged) * 100) : 0}% of users who viewed content`}
                primaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  )
}

function SiteRow({ site, completion }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
      <Typography variant="subtitle2">{site.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {site.passers} detected · {site.notified} notified · {site.opened} opened · {site.engaged} engaged
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} mt={0.75}>
        <LinearProgress variant="determinate" value={completion} sx={{ flex: 1, height: 6, borderRadius: 999 }} />
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>{completion}%</Typography>
      </Stack>
    </Paper>
  )
}

function buildTotals(sites) {
  const totals = { label: 'Journey', passers: 0, notified: 0, opened: 0, engaged: 0, deepEngaged: 0 }
  sites.forEach(s => {
    totals.passers += s.passers || 0
    totals.notified += s.notified || 0
    totals.opened += s.opened || 0
    totals.engaged += s.engaged || 0
    totals.deepEngaged += s.deepEngaged || 0
  })
  return totals
}
