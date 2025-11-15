import { useMemo, useState, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import MainView from './views/MainView2.jsx'
import HeritageDetailView from './views/HeritageDetailView.jsx'
import { UrbanSenseDataProvider } from './contexts/UrbanSenseDataContext'
import { globeColors, statusColors, uiColors } from './config/globeColors'

export const ColorModeContext = createContext({ mode: 'dark', toggleColorMode: () => {} })

export default function App() {
  const [mode, setMode] = useState('dark')
  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light'))
  }), [mode])

  const theme = useMemo(() => createTheme({
    palette: { 
      mode, 
      primary: globeColors.primary,
      secondary: globeColors.secondary,
      success: statusColors.success,
      warning: statusColors.warning,
      error: statusColors.error,
      info: statusColors.info,
      ...(mode === 'dark' ? {
        background: {
          default: uiColors.background.default,
          paper: uiColors.background.paper,
        },
        text: {
          primary: uiColors.text.primary,
          secondary: uiColors.text.secondary,
          disabled: uiColors.text.disabled,
        },
        divider: uiColors.divider,
      } : {}),
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 300,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 }
    }
  }), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UrbanSenseDataProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainView />} />
              <Route path="/location/:locationId" element={<HeritageDetailView />} />
            </Routes>
          </Router>
        </UrbanSenseDataProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
