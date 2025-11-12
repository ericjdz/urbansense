# UrbanSense MVP

A single-location smart city data visualization proof-of-concept focused on Luneta Park (Rizal Park), Metro Manila.

## Stack
- Vite + React 18
- MapLibre GL JS (no key) with Esri World Imagery raster tiles
- MUI (Material-UI) for UI components
- Framer Motion for panel & cross-fade animations
- GSAP + ScrollTrigger for scroll-based reveal animations
- Recharts for lightweight charts

## Features (MVP)
1. Full-screen satellite map centered on Metro Manila with a pulsing Luneta Park marker.
2. Sliding live-data dashboard with simulated environmental + foot traffic data.
3. "Explore city" cinematic transition: panel slides out, map camera flyTo, cross-fade into detail view.
4. Luneta detail page with image slider and animated sensor info sections.
5. Government dashboard overlay (Smart Heritage Canopies context) with solar energy output, shading coverage, compliance score, incidents, and heritage asset status.
6. Advanced Analytics overlay: Maps (heatmap + canopy status), Trends (time-series + comparison), KPIs gauges, Engagement Sankey, and Sensor Network.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. API Keys
No API key is required for the current configuration. Satellite imagery is provided by Esri World Imagery via public raster tiles. Review Esri terms for production/commercial use and attribution.

### 3. Run dev server
```bash
npm run dev
```
Open the printed local URL (default http://localhost:5173).

### 4. Production build (optional)
```bash
npm run build
npm run preview
```

## Project Structure
```
src/
  components/
    MapComponent.jsx      # Map + marker + flyTo logic
    DashboardComponent.jsx# Live data panel
    ImageSliderComponent.jsx
  views/
    MainView.jsx          # Orchestrates map & transitions
    LunetaDetailView.jsx  # Detail content page
  utils/
    dataSimulator.js      # Generates simulated data snapshots
  App.jsx
  main.jsx
  index.css
```

## Data Simulation
`generateSimulatedData()` returns a snapshot for the public dashboard. It polls every 5s via `setInterval`.

`generateGovernmentSnapshot()` powers the government dashboard overlay (every 6s). It includes:
- `powerKw`: Current solar energy production from canopy arrays.
- `shading`: Percent of pedestrian path area currently shaded.
- `complianceScore`: Simple percentage score for regulatory / maintenance compliance.
- `incidents`: Count of notable incidents flagged in the last 24h.
- `energySeries`: Trend data (hourly) for energy output.
- `assets`: Array of heritage / infrastructure items with `status` and `lastService`.

All simulation values are ephemeral / randomly generated — replace with a real API or websocket for production.

## Animation Flow
1. Marker click -> dashboard opens (Framer Motion slide-in).
2. Explore button -> dashboard exits, map `flyTo` Luneta.
3. After camera settles, map fades out, detail view fades in.
4. Scroll-triggered GSAP animations reveal sensor blocks.

## Government Dashboard (Smart Heritage Canopies)
Access: While on the map view, click the floating action button (top-left) to open the Government Dashboard overlay. Close with the X icon.

Contents:
- KPI cards: Solar Power (kW), Shading Coverage (%), Compliance (%), Incidents (24h).
- Energy Output chart: AreaChart (Recharts) with gradient fill.
- Heritage Assets list: Status chips (Operational / Maintenance Due / Attention) with last service recency.
- Action buttons: Schedule Maintenance (placeholder), Export Report (placeholder).

Design Notes:
- Glassmorphic elevated panel (blur + subtle border) distinct from consumer dashboard.
- Fast polling (6s) to emulate live operational console feel.
- Easily extensible: add tabs (Energy / Environment / Assets / Safety / Reports) or map-linked highlighting for selected asset.

Extension Ideas:
- Integrate maintenance scheduling and incident workflow views.
- Add ESG metrics (carbon offset, water usage) and historical range selector.
- Hook asset selection to map outlines / markers.
- Role-based access & audit logging.

## Attribution & Imagery
Satellite imagery via Esri World Imagery public raster tiles. Ensure proper attribution and review Esri terms before commercial deployment.

## Accessibility & Next Steps
Planned improvements:
- Keyboard + screen reader enhancements (focus order, ARIA labels for charts).
- Performance: Code-split Government Dashboard to reduce initial bundle.
- Responsive tweaks for very small devices.

## Disclaimer
Prototype only. Simulated metrics do not represent real operational data. Replace all simulation logic before public launch.

## Extending Ideas
- Add global state (Zustand, Context) for multi-location scaling.
- Replace simulator with real API/websocket.
- Add historical charts & time range scrubber.
- Implement accessibility pass (ARIA roles, keyboard nav).

## License
MVP prototype. Add a license if distributing.

## Advanced Analytics (exploration tools)
Access: On the map, click the purple “Advanced Analytics” button (next to the Government Dashboard FAB).

Tabs:
- Maps: Heatmap (Foot or AQI) and Canopy Status list.
- Trends: AQI line chart; Hourly foot traffic bar chart with Today vs Yesterday comparison.
- KPIs: Large readouts for average occupancy, AQI, and heat index.
- Engagement: Sankey diagram (Notification → View → Click → Redeem).
- Network: Simple sensor network topology.

Filters:
- Time range: 24h or 7d.
- Map layer toggle: Foot vs AQI.

Notes:
- Data is simulated by `generateAdvancedData()` in `src/utils/advancedSimulator.js`.
- Panels are under `src/components/advanced/` and are code-split.
