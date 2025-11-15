import { Paper, Typography } from '@mui/material'
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'

export default function SankeyPanel({ data }) {
  if (!data || !data.sankey) return null
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: '100%' }}>
      <Typography variant="subtitle2" gutterBottom>Engagement Flow</Typography>
      <ResponsiveContainer width="100%" height={360}>
        <Sankey data={data.sankey} nodePadding={20} nodeWidth={12} linkCurvature={0.5}>
          <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
        </Sankey>
      </ResponsiveContainer>
    </Paper>
  )
}
