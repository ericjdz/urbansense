// Function to generate a single snapshot of data
export function generateSimulatedData() {
  return {
    sunHeatIndex: Number((35 + Math.random() * 10).toFixed(1)), // degrees C
    airQualityIndex: Number((40 + Math.random() * 50).toFixed(0)), // AQI value
    humidity: Number((70 + Math.random() * 25).toFixed(0)), // percentage
    pollutionPM25: Number((15 + Math.random() * 20).toFixed(2)), // µg/m³
    weather: { temp: 32, condition: 'Partly Cloudy' }, // static for now
    footTraffic: Number((150 + Math.random() * 100).toFixed(0)), // people per hour
    timestamp: new Date()
  }
}
