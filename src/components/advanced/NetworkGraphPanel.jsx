import { Paper, Typography } from '@mui/material'

export default function NetworkGraphPanel({ data }) {
  // Simple radial layout SVG
  const R = 140
  const cx = 200, cy = 200
  const nodes = data.network.nodes.map((n, i, arr) => {
    if (n.type === 'gateway') return { ...n, x: cx, y: cy }
    const angle = (i / (arr.length - 1)) * Math.PI * 2
    return { ...n, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) }
  })
  const find = id => nodes.find(n => n.id === id)
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', height: '100%' }}>
      <Typography variant="subtitle2" gutterBottom>Sensor Network</Typography>
      <svg width="100%" height="360" viewBox="0 0 400 400">
        {data.network.links.map((l, idx) => {
          const a = find(l.source); const b = find(l.target)
          return <line key={idx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(144,202,249,0.6)" strokeWidth="2" />
        })}
        {nodes.map((n, idx) => (
          <g key={idx}>
            <circle cx={n.x} cy={n.y} r={n.type === 'gateway' ? 10 : 7} fill={fill(n.type)} />
            <text x={n.x + 12} y={n.y + 4} fontSize="11" fill="rgba(255,255,255,0.85)">{n.id}</text>
          </g>
        ))}
      </svg>
    </Paper>
  )
}

function fill(type) {
  switch (type) {
    case 'gateway': return '#64B6F7'
    case 'aq': return '#81C784'
    case 'canopy': return '#FFD54F'
    case 'camera': return '#E57373'
    default: return '#B0BEC5'
  }
}
