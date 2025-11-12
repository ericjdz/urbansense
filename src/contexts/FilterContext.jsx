import { createContext, useContext, useMemo, useState } from 'react'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [timeRange, setTimeRange] = useState('24h')
  const [mapLayer, setMapLayer] = useState('foot') // 'foot' | 'aqi'
  const value = useMemo(() => ({ timeRange, setTimeRange, mapLayer, setMapLayer }), [timeRange, mapLayer])
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx
}
