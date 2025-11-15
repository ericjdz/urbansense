/**
 * Globe Telecom Color Palette
 * Optimized for data analytics and visualization
 * Designed for dark mode dashboards with WCAG AA contrast compliance
 */

// Globe Brand Primary Colors
export const globeColors = {
  // Primary Brand Colors
  primary: {
    main: '#017EFA',      // Globe Blue - primary brand color
    light: '#3D9BFB',     // Lighter blue for hover states
    dark: '#0162C7',      // Darker blue for pressed states
    contrast: '#FFFFFF',  // Text on primary backgrounds
  },
  
  // Secondary Brand Colors
  secondary: {
    main: '#00D1FF',      // Globe Cyan - accent color
    light: '#33DCFF',     // Lighter cyan
    dark: '#00A8CC',      // Darker cyan
    contrast: '#000000',  // Text on secondary backgrounds
  },
  
  // Globe Extended Palette
  accent: {
    purple: '#7B61FF',    // Globe Purple
    green: '#00E676',     // Globe Green (success variant)
    orange: '#FF9100',    // Globe Orange (warning variant)
    pink: '#FF4081',      // Globe Pink
  },
  
  // Neutral Colors (Dark Mode Optimized)
  neutral: {
    50: '#F5F7FA',
    100: '#E8ECF1',
    200: '#D1D9E3',
    300: '#B0BCC9',
    400: '#8996A6',
    500: '#6B7A8F',
    600: '#4E5D73',
    700: '#3A4859',
    800: '#2A3642',
    900: '#1A2129',
  },
}

// Status Colors for Data Visualization
export const statusColors = {
  success: {
    main: '#00E676',      // Globe Green
    light: '#33FF99',
    dark: '#00C763',
    bg: 'rgba(0, 230, 118, 0.2)',
  },
  warning: {
    main: '#FF9100',      // Globe Orange
    light: '#FFA733',
    dark: '#CC7400',
    bg: 'rgba(255, 145, 0, 0.2)',
  },
  error: {
    main: '#FF4081',      // Globe Pink (error variant)
    light: '#FF6D9D',
    dark: '#CC3368',
    bg: 'rgba(255, 64, 129, 0.2)',
  },
  info: {
    main: '#00D1FF',      // Globe Cyan
    light: '#33DCFF',
    dark: '#00A8CC',
    bg: 'rgba(0, 209, 255, 0.2)',
  },
}

// Data Visualization Color Scales
export const dataVizColors = {
  // Primary chart series (Globe-branded progression)
  series: [
    '#017EFA',  // Globe Blue
    '#00D1FF',  // Globe Cyan
    '#7B61FF',  // Globe Purple
    '#00E676',  // Globe Green
    '#FF9100',  // Globe Orange
    '#FF4081',  // Globe Pink
    '#3D9BFB',  // Light Blue
    '#00E6AC',  // Teal variant
  ],
  
  // Gradient definitions for area charts
  gradients: {
    primary: {
      start: '#017EFA',
      middle: '#0162C7',
      end: 'rgba(1, 126, 250, 0.1)',
    },
    secondary: {
      start: '#00D1FF',
      middle: '#00A8CC',
      end: 'rgba(0, 209, 255, 0.1)',
    },
    success: {
      start: '#00E676',
      middle: '#00C763',
      end: 'rgba(0, 230, 118, 0.1)',
    },
    warning: {
      start: '#FF9100',
      middle: '#CC7400',
      end: 'rgba(255, 145, 0, 0.1)',
    },
  },
  
  // Heatmap color scales
  heatmap: {
    // Air Quality Index scale (good to unhealthy)
    aqi: [
      '#00E676',  // Good (0-50)
      '#33FF99',  // Moderate (51-100)
      '#FFD54F',  // Unhealthy for sensitive (101-150)
      '#FF9100',  // Unhealthy (151-200)
      '#FF4081',  // Very Unhealthy (201-300)
      '#CC3368',  // Hazardous (301+)
    ],
    // Traffic density scale (low to high)
    traffic: [
      '#017EFA',  // Low
      '#00D1FF',  // Medium-low
      '#7B61FF',  // Medium
      '#FF9100',  // Medium-high
      '#FF4081',  // High
    ],
    // Temperature scale (cool to hot)
    temperature: [
      '#00D1FF',  // Cool
      '#017EFA',  // Comfortable
      '#FFD54F',  // Warm
      '#FF9100',  // Hot
      '#FF4081',  // Very hot
    ],
  },
  
  // Network visualization colors
  network: {
    gateway: '#017EFA',     // Globe Blue - main nodes
    sensor: '#00D1FF',      // Globe Cyan - sensor nodes
    canopy: '#FFD54F',      // Yellow - canopy nodes
    camera: '#FF4081',      // Globe Pink - camera nodes
    edge: 'rgba(1, 126, 250, 0.3)',  // Connection lines
    edgeActive: '#00D1FF',  // Active connections
  },
  
  // Map polygon colors
  map: {
    location: '#017EFA',         // Primary location
    locationHover: '#3D9BFB',    // Hover state
    locationActive: '#00D1FF',   // Selected state
    boundary: 'rgba(1, 126, 250, 0.4)',
  },
}

// Canopy/Sensor Status Colors
export const canopyStatus = {
  ok: {
    color: '#00E676',
    bg: 'rgba(0, 230, 118, 0.15)',
    label: 'OK',
  },
  busy: {
    color: '#FF9100',
    bg: 'rgba(255, 145, 0, 0.15)',
    label: 'Busy',
  },
  alert: {
    color: '#FF4081',
    bg: 'rgba(255, 64, 129, 0.15)',
    label: 'Alert',
  },
  offline: {
    color: '#6B7A8F',
    bg: 'rgba(107, 122, 143, 0.15)',
    label: 'Offline',
  },
}

// UI Component Colors (Dark Mode Optimized)
export const uiColors = {
  background: {
    default: '#0A0E14',
    paper: '#12171F',
    elevated: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(18, 23, 31, 0.95)',
  },
  
  border: {
    default: 'rgba(1, 126, 250, 0.12)',
    light: 'rgba(255, 255, 255, 0.08)',
    focus: '#017EFA',
  },
  
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.65)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  
  divider: 'rgba(255, 255, 255, 0.12)',
  
  // Interactive states
  hover: 'rgba(1, 126, 250, 0.08)',
  active: 'rgba(1, 126, 250, 0.16)',
  focus: 'rgba(1, 126, 250, 0.12)',
  selected: 'rgba(1, 126, 250, 0.24)',
}

// Chart-specific colors
export const chartColors = {
  grid: 'rgba(255, 255, 255, 0.06)',
  axis: 'rgba(255, 255, 255, 0.6)',
  tooltip: {
    bg: 'rgba(18, 23, 31, 0.95)',
    border: 'rgba(1, 126, 250, 0.2)',
  },
  brush: {
    fill: 'rgba(1, 126, 250, 0.1)',
    stroke: '#017EFA',
  },
}

// Animation & Effect Colors
export const effectColors = {
  glow: {
    primary: '0 0 12px rgba(1, 126, 250, 0.6)',
    secondary: '0 0 12px rgba(0, 209, 255, 0.6)',
    success: '0 0 12px rgba(0, 230, 118, 0.6)',
    warning: '0 0 12px rgba(255, 145, 0, 0.6)',
    error: '0 0 12px rgba(255, 64, 129, 0.6)',
  },
  pulse: '#017EFA',
}

// Helper function to get RGB values for dynamic gradient calculations
export const getRGB = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null
}

// Helper function to interpolate between two colors
export const interpolateColor = (color1, color2, factor) => {
  const c1 = getRGB(color1)
  const c2 = getRGB(color2)
  if (!c1 || !c2) return color1
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r))
  const g = Math.round(c1.g + factor * (c2.g - c1.g))
  const b = Math.round(c1.b + factor * (c2.b - c1.b))
  
  return `rgb(${r}, ${g}, ${b})`
}

export default globeColors
