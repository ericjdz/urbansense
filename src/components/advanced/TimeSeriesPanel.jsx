import { Paper, Typography, Stack, Chip, ToggleButton, ToggleButtonGroup, IconButton, Tooltip as MuiTooltip } from '@mui/material'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Brush, ReferenceLine, AreaChart, Area } from 'recharts'
import { useMemo, useState } from 'react'
import { useFilters } from '../../contexts/FilterContext'
import { globeColors, statusColors, chartColors } from '../../config/globeColors'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import AIInsightsModal from './AIInsightsModal'
import { generateAIInsights } from '../../utils/aiInsightsGenerator'

export default function TimeSeriesPanel({ data }) {
  const [metric, setMetric] = useState('aqi') // 'aqi' | 'foot'
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false)
  
  if (!data || !data.footSeriesToday) return null
  let selectedCellId = null
  let setTimeBrush = () => {}
  try {
    const filters = useFilters()
    selectedCellId = filters.selectedCellId
    setTimeBrush = filters.setTimeBrush
  } catch {
    // allow usage outside FilterProvider
  }

  const baseSeries = useMemo(() => {
    const aqi = data.aqiSeries
    const foot = data.footSeriesToday
    return aqi.map((p, idx) => ({
      t: p.t,
      aqi: p.v,
      foot: foot[idx]?.v ?? null
    }))
  }, [data])

  const filteredSeries = useMemo(() => {
    if (selectedCellId && data.cellSeries?.[selectedCellId]) {
      const aqi = data.cellSeries[selectedCellId].aqi
      const foot = data.cellSeries[selectedCellId].foot
      return aqi.map((p, idx) => ({
        t: p.t,
        aqi: p.v,
        foot: foot[idx]?.v ?? null
      }))
    }
    return baseSeries
  }, [baseSeries, data.cellSeries, selectedCellId])

  // Calculate correlation coefficient for insight
  const correlation = useMemo(() => {
    const validPairs = filteredSeries.filter(d => d.aqi != null && d.foot != null)
    if (validPairs.length < 2) return null
    
    const n = validPairs.length
    const sumAqi = validPairs.reduce((s, d) => s + d.aqi, 0)
    const sumFoot = validPairs.reduce((s, d) => s + d.foot, 0)
    const sumAqiFoot = validPairs.reduce((s, d) => s + d.aqi * d.foot, 0)
    const sumAqi2 = validPairs.reduce((s, d) => s + d.aqi * d.aqi, 0)
    const sumFoot2 = validPairs.reduce((s, d) => s + d.foot * d.foot, 0)
    
    const numerator = n * sumAqiFoot - sumAqi * sumFoot
    const denominator = Math.sqrt((n * sumAqi2 - sumAqi * sumAqi) * (n * sumFoot2 - sumFoot * sumFoot))
    
    return denominator === 0 ? 0 : numerator / denominator
  }, [filteredSeries])

  // Handle AI Insights generation
  const handleAIInsights = async () => {
    setAiInsightsOpen(true)
    setAiInsightsLoading(true)
    
    try {
      const context = {
        locationIds: ['luneta'],
        timeRange: '24h',
        data: { advData: data },
        dashboardType: 'timeseries'
      }
      
      const result = await generateAIInsights(context)
      setAiInsights(result.insights)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      setAiInsights([])
    } finally {
      setAiInsightsLoading(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', flex: 1, minHeight: 300 }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">
            {metric === 'aqi' ? 'Air Quality Index' : 'Foot Traffic'}
            {selectedCellId ? ` · Cell ${selectedCellId}` : ''}
          </Typography>
          {correlation !== null && (
            <Chip 
              size="small" 
              label={`r=${correlation.toFixed(2)}`} 
              color={Math.abs(correlation) > 0.5 ? 'success' : 'default'}
              sx={{ fontSize: 11 }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <MuiTooltip title="Get AI insights on patterns and correlations" arrow>
            <IconButton
              size="small"
              onClick={handleAIInsights}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: 28,
                height: 28,
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </MuiTooltip>
          <ToggleButtonGroup
            value={metric}
            exclusive
            onChange={(e, val) => val && setMetric(val)}
            size="small"
            sx={{ height: 28 }}
          >
            <ToggleButton value="aqi" sx={{ px: 1.5, py: 0.5, fontSize: 11 }}>AQI</ToggleButton>
            <ToggleButton value="foot" sx={{ px: 1.5, py: 0.5, fontSize: 11 }}>People</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
      <ResponsiveContainer width="100%" height={260}>
        {metric === 'aqi' ? (
          <AreaChart data={filteredSeries}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={globeColors.primary.main} stopOpacity={0.4} />
                <stop offset="100%" stopColor={globeColors.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 220]} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'AQI', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.6)', fontSize: 12 } }} />
            <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
            <ReferenceLine y={50} stroke={statusColors.success.main} strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: 'Good', position: 'insideTopRight', fill: statusColors.success.main, fontSize: 10 }} />
            <ReferenceLine y={100} stroke={statusColors.warning.main} strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: 'Moderate', position: 'insideTopRight', fill: statusColors.warning.main, fontSize: 10 }} />
            <ReferenceLine y={150} stroke={statusColors.error.main} strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'Unhealthy', position: 'insideTopRight', fill: statusColors.error.main, fontSize: 10 }} />
            <Area type="monotone" dataKey="aqi" stroke={globeColors.primary.main} strokeWidth={2} fill="url(#aqiFill)" />
            <Brush
              dataKey="t"
              height={24}
              travellerWidth={8}
              stroke={globeColors.primary.main}
              onChange={range => {
                if (!range) return
                const { startIndex, endIndex } = range
                setTimeBrush(startIndex != null && endIndex != null ? { startIndex, endIndex } : null)
              }}
            />
          </AreaChart>
        ) : (
          <AreaChart data={filteredSeries}>
            <defs>
              <linearGradient id="footFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={statusColors.warning.main} stopOpacity={0.4} />
                <stop offset="100%" stopColor={statusColors.warning.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 30]} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'People', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.6)', fontSize: 12 } }} />
            <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.12)' }} />
            <ReferenceLine y={10} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'Quiet', position: 'insideTopRight', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <ReferenceLine y={20} stroke={statusColors.warning.main} strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: 'Busy', position: 'insideTopRight', fill: statusColors.warning.main, fontSize: 10 }} />
            <Area type="monotone" dataKey="foot" stroke={statusColors.warning.main} strokeWidth={2} fill="url(#footFill)" />
            <Brush
              dataKey="t"
              height={24}
              travellerWidth={8}
              stroke={statusColors.warning.main}
              onChange={range => {
                if (!range) return
                const { startIndex, endIndex } = range
                setTimeBrush(startIndex != null && endIndex != null ? { startIndex, endIndex } : null)
              }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>

      {/* AI Insights Modal */}
      <AIInsightsModal
        open={aiInsightsOpen}
        onClose={() => setAiInsightsOpen(false)}
        insights={aiInsights}
        loading={aiInsightsLoading}
        context={{
          location: selectedCellId ? `Cell ${selectedCellId}` : 'All Cells',
          timeRange: 'Time Series Analysis',
          dataType: 'AQI & Foot Traffic Correlation'
        }}
      />
    </Paper>
  )
}
