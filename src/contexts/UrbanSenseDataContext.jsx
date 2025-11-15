import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { generateSimulatedData } from '../utils/dataSimulator'
import { generateGovernmentSnapshot } from '../utils/govSimulator'
import { generateAdvancedData } from '../utils/advancedSimulator'

const UrbanSenseDataContext = createContext(null)

export function UrbanSenseDataProvider({ children }) {
  const [timeRange, setTimeRange] = useState('24h')
  const [publicSnap, setPublicSnap] = useState(() => generateSimulatedData())
  const [govSnap, setGovSnap] = useState(() => generateGovernmentSnapshot())
  const [advData, setAdvData] = useState(() => generateAdvancedData({ hours: 24 }))
  const [govHistory, setGovHistory] = useState(() => [])
  const [advHistory, setAdvHistory] = useState(() => [])

  useEffect(() => {
    const hours = timeRange === '24h' ? 24 : 168
    const next = generateAdvancedData({ hours })
    setAdvData(next)
    setAdvHistory(prev => [...prev.slice(-47), { ts: Date.now(), data: next }])
  }, [timeRange])

  useEffect(() => {
    const id1 = setInterval(() => setPublicSnap(generateSimulatedData()), 5000)
    const id2 = setInterval(() => {
      const next = generateGovernmentSnapshot()
      setGovSnap(next)
      setGovHistory(prev => [...prev.slice(-47), { ts: Date.now(), snap: next }])
    }, 6000)
    const id3 = setInterval(() => {
      const hours = timeRange === '24h' ? 24 : 168
      const next = generateAdvancedData({ hours })
      setAdvData(next)
      setAdvHistory(prev => [...prev.slice(-47), { ts: Date.now(), data: next }])
    }, 6000)
    return () => {
      clearInterval(id1)
      clearInterval(id2)
      clearInterval(id3)
    }
  }, [timeRange])

  const value = useMemo(
    () => ({ timeRange, setTimeRange, publicSnap, govSnap, advData, govHistory, advHistory }),
    [timeRange, publicSnap, govSnap, advData, govHistory, advHistory]
  )

  return <UrbanSenseDataContext.Provider value={value}>{children}</UrbanSenseDataContext.Provider>
}

export function useUrbanSenseData() {
  const ctx = useContext(UrbanSenseDataContext)
  if (!ctx) throw new Error('useUrbanSenseData must be used within UrbanSenseDataProvider')
  return ctx
}
