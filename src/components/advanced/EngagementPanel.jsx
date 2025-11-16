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
              // Calculate conversion at key funnel stages for actionable insights
              const notificationReach = site.passers ? Math.round((site.notified / site.passers) * 100) : 0
              const openRate = site.notified ? Math.round((site.opened / site.notified) * 100) : 0
              const conversionRate = site.engaged ? Math.round((site.deepEngaged / site.engaged) * 100) : 0
              return (
                <SiteRow key={site.id} site={site} metrics={{ notificationReach, openRate, conversionRate }} />
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

function SiteRow({ site, metrics }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
        <Typography variant="subtitle2">{site.name}</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, color: metrics.conversionRate > 50 ? 'success.light' : 'text.secondary' }}>
          {site.deepEngaged} completed
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        {site.passers} detected · {site.notified} notified · {site.opened} opened · {site.engaged} engaged
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Stack direction="row" spacing={0.5} sx={{ flex: 1 }}>
          <Box sx={{ flex: 1, position: 'relative', height: 6, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${metrics.notificationReach}%`, bgcolor: dataVizColors.series[1], transition: 'width 0.3s' }} />
          </Box>
          <Box sx={{ flex: 1, position: 'relative', height: 6, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${metrics.openRate}%`, bgcolor: dataVizColors.series[2], transition: 'width 0.3s' }} />
          </Box>
          <Box sx={{ flex: 1, position: 'relative', height: 6, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${metrics.conversionRate}%`, bgcolor: dataVizColors.series[4], transition: 'width 0.3s' }} />
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right', fontSize: '0.7rem' }}>
          {metrics.notificationReach}% · {metrics.openRate}% · {metrics.conversionRate}%
        </Typography>
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
