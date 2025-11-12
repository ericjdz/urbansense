import { useMemo, useState, createContext } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import MainView from './views/MainView.jsx'

export const ColorModeContext = createContext({ mode: 'dark', toggleColorMode: () => {} })

export default function App() {
  const [mode, setMode] = useState('dark')
  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light'))
  }), [mode])

  const theme = useMemo(() => createTheme({
    palette: { mode, primary: { main: '#1976d2' } },
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
        <MainView />
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
