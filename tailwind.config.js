/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        globe: {
          blue: {
            DEFAULT: '#017EFA',
            light: '#3D9BFB',
            dark: '#0162C7',
          },
          cyan: {
            DEFAULT: '#00D1FF',
            light: '#33DCFF',
            dark: '#00A8CC',
          },
          purple: '#7B61FF',
          green: '#00E676',
          orange: '#FF9100',
          pink: '#FF4081',
        },
      },
    },
  },
  plugins: [],
}
