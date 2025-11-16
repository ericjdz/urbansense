/**
 * AI Insights Generator
 * Generates hardcoded AI insights based on dashboard context
 * This is a prototype implementation with simulated AI responses
 */

/**
 * Generate AI insights based on dashboard context
 * @param {Object} context - Dashboard context
 * @param {string[]} context.locationIds - Selected location IDs
 * @param {string} context.timeRange - Time range ('24h' or '7d')
 * @param {Object} context.data - Current data snapshot (advData, govData, publicData)
 * @param {string} context.dashboardType - Type of dashboard ('control-room', 'gov', 'timeseries', 'engagement')
 * @returns {Promise<Object>} Insights response with insights array and summary
 */
export const generateAIInsights = async (context) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { locationIds, timeRange, data, dashboardType } = context;

  // Base insights pool - will be filtered based on context
  const allInsights = [];

  // Add location-specific insights
  if (locationIds && locationIds.length > 0) {
    allInsights.push(...generateLocationInsights(locationIds, data, timeRange));
  }

  // Add dashboard-specific insights
  switch (dashboardType) {
    case 'control-room':
      allInsights.push(...generateControlRoomInsights(data, timeRange));
      break;
    case 'gov':
      allInsights.push(...generateGovernmentInsights(data, timeRange));
      break;
    case 'timeseries':
      allInsights.push(...generateTimeSeriesInsights(data, timeRange));
      break;
    case 'engagement':
      allInsights.push(...generateEngagementInsights(data, timeRange));
      break;
    default:
      allInsights.push(...generateGeneralInsights(data, timeRange));
  }

  // Sort by severity and confidence
  const sortedInsights = allInsights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return b.confidence - a.confidence;
  });

  // Generate summary
  const summary = {
    totalInsights: sortedInsights.length,
    highPriority: sortedInsights.filter((i) => i.severity === 'high').length,
    categories: sortedInsights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {}),
  };

  return {
    insights: sortedInsights,
    summary,
    generatedAt: new Date().toISOString(),
    context: {
      locations: locationIds,
      timeRange,
      dashboardType,
    },
  };
};

// Location-specific insights
const generateLocationInsights = (locationIds, data, timeRange) => {
  const insights = [];

  // Multi-location comparison insight
  if (locationIds.length > 1) {
    insights.push({
      id: 'loc-compare-001',
      type: 'comparison',
      category: 'operations',
      title: 'Performance Gap Detected Across Locations',
      description: `Analysis of ${locationIds.length} locations shows a 23% performance variance. ${
        locationIds[0] === 'luneta' ? 'Luneta' : 'Binondo'
      } is outperforming other sites in visitor engagement and air quality management. Consider implementing their cooling schedule and notification timing strategies across other locations.`,
      confidence: 0.87,
      severity: 'medium',
      metrics: {
        variance: '23%',
        top_performer: locationIds[0] === 'luneta' ? 'Luneta' : 'Binondo',
        improvement_potential: '+18% engagement',
      },
      recommendedActions: [
        { action: 'view_comparison', label: 'View Detailed Comparison', priority: 1 },
        { action: 'export_best_practices', label: 'Export Best Practices', priority: 2 },
      ],
    });
  }

  // Single location deep-dive
  if (locationIds.length === 1) {
    const locationName = locationIds[0] === 'luneta' ? 'Luneta Park' : 'Binondo Heritage District';
    insights.push({
      id: 'loc-single-001',
      type: 'optimization',
      category: 'optimization',
      title: `${locationName} Efficiency Opportunity`,
      description: `Peak efficiency window detected between 9-11 AM when AQI is lowest and foot traffic is moderate. Scheduling high-engagement activities during this window could increase visitor satisfaction by 15-20%. Current utilization of this optimal window is only 45%.`,
      confidence: 0.82,
      severity: 'medium',
      metrics: {
        optimal_window: '9-11 AM',
        current_utilization: '45%',
        potential_gain: '+15-20% satisfaction',
      },
      recommendedActions: [
        { action: 'schedule_activities', label: 'Schedule Activities', priority: 1 },
        { action: 'view_schedule', label: 'View Efficiency Map', priority: 2 },
      ],
    });
  }

  return insights;
};

// Control Room specific insights
const generateControlRoomInsights = (data, timeRange) => {
  const insights = [];

  // Predictive AQI insight
  insights.push({
    id: 'cr-pred-001',
    type: 'prediction',
    category: 'prediction',
    title: 'AQI Spike Predicted Tomorrow Afternoon',
    description: `Machine learning model detects a high probability AQI spike between 2-4 PM tomorrow based on 7-day historical patterns, weather forecast data, and traffic predictions. Expected AQI: 165-180 (Unhealthy for Sensitive Groups). Recommend preemptive visitor alerts and increased ventilation 1 hour before spike.`,
    confidence: 0.91,
    severity: 'high',
    metrics: {
      predicted_aqi: '165-180',
      time_window: '2-4 PM tomorrow',
      preparation_time: '1 hour advance',
    },
    recommendedActions: [
      { action: 'schedule_alert', label: 'Schedule Alert', priority: 1 },
      { action: 'increase_ventilation', label: 'Configure Ventilation', priority: 2 },
      { action: 'view_forecast', label: 'View 7-Day Forecast', priority: 3 },
    ],
  });

  // Correlation anomaly
  insights.push({
    id: 'cr-anom-001',
    type: 'anomaly',
    category: 'anomaly',
    title: 'Unusual AQI-Traffic Correlation Pattern',
    description: `Detected abnormal decoupling between AQI and foot traffic over the past ${
      timeRange === '24h' ? '6 hours' : '2 days'
    }. Typically, these metrics show a negative correlation (r=-0.65), but current correlation is near zero (r=-0.12). This suggests external factors (construction, weather, or events) are influencing air quality independently of visitor presence.`,
    confidence: 0.78,
    severity: 'medium',
    metrics: {
      normal_correlation: 'r=-0.65',
      current_correlation: 'r=-0.12',
      deviation: '82% from baseline',
    },
    recommendedActions: [
      { action: 'investigate_cause', label: 'Investigate Cause', priority: 1 },
      { action: 'check_sensors', label: 'Check Sensors', priority: 2 },
    ],
  });

  // Network optimization
  insights.push({
    id: 'cr-opt-001',
    type: 'optimization',
    category: 'optimization',
    title: 'Canopy Network Load Balancing Opportunity',
    description: `Analysis shows uneven visitor distribution across the L.I.L.O.M network. Canopies C1 and C3 are operating at 85-90% capacity while C2 and C4 are at 40-50%. Implementing dynamic wayfinding recommendations through GlobeOne notifications could redistribute load and reduce per-visitor cooling costs by 12%.`,
    confidence: 0.84,
    severity: 'low',
    metrics: {
      load_variance: '45%',
      cost_reduction: '12%',
      implementation: 'GlobeOne app',
    },
    recommendedActions: [
      { action: 'enable_wayfinding', label: 'Enable Smart Wayfinding', priority: 1 },
      { action: 'simulate_impact', label: 'Simulate Impact', priority: 2 },
    ],
  });

  return insights;
};

// Government Dashboard insights
const generateGovernmentInsights = (data, timeRange) => {
  const insights = [];

  // Predictive maintenance
  insights.push({
    id: 'gov-maint-001',
    type: 'prediction',
    category: 'maintenance',
    title: 'Predictive Maintenance Alert: Solar Panel Degradation',
    description: `Machine learning analysis of solar power output patterns indicates early-stage degradation in Panel Array B. Current efficiency: 94% (down from 98% baseline). Predicted failure window: 12-18 days if not addressed. Scheduling preventive cleaning and inspection now could avoid 2-3 day downtime and $8,000 in emergency repair costs.`,
    confidence: 0.88,
    severity: 'high',
    metrics: {
      current_efficiency: '94%',
      baseline: '98%',
      failure_window: '12-18 days',
      cost_avoidance: '$8,000',
    },
    recommendedActions: [
      { action: 'schedule_maintenance', label: 'Schedule Maintenance', priority: 1 },
      { action: 'notify_vendor', label: 'Notify Vendor', priority: 2 },
      { action: 'view_diagnostics', label: 'View Diagnostics', priority: 3 },
    ],
  });

  // Energy optimization
  insights.push({
    id: 'gov-energy-001',
    type: 'optimization',
    category: 'operations',
    title: 'Peak Energy Production Window Under-Utilized',
    description: `Solar panels generate peak power between 11 AM - 1 PM (avg 48 kW), but system load during this period averages only 32 kW. Excess 16 kW could power additional cooling capacity or be stored for evening operations. Implementing load shifting could reduce grid dependency by 22% and increase carbon offset by 0.8 tonnes CO₂e annually.`,
    confidence: 0.79,
    severity: 'medium',
    metrics: {
      peak_generation: '48 kW',
      current_load: '32 kW',
      excess_capacity: '16 kW',
      carbon_benefit: '+0.8t CO₂e/year',
    },
    recommendedActions: [
      { action: 'configure_storage', label: 'Configure Battery Storage', priority: 1 },
      { action: 'optimize_schedule', label: 'Optimize Load Schedule', priority: 2 },
    ],
  });

  // Compliance insight
  insights.push({
    id: 'gov-comp-001',
    type: 'alert',
    category: 'operations',
    title: 'Compliance Score Trending Downward',
    description: `System compliance score has decreased from 96% to 88% over the past ${
      timeRange === '24h' ? '24 hours' : '7 days'
    }. Primary drivers: 2 missed sensor calibration schedules and 1 delayed incident report filing. Addressing these items within 48 hours will restore score to 94% and maintain certification status.`,
    confidence: 0.95,
    severity: 'high',
    metrics: {
      current_score: '88%',
      target_score: '94%',
      action_deadline: '48 hours',
    },
    recommendedActions: [
      { action: 'complete_calibration', label: 'Schedule Calibration', priority: 1 },
      { action: 'file_report', label: 'File Incident Report', priority: 2 },
    ],
  });

  return insights;
};

// Time Series Panel insights
const generateTimeSeriesInsights = (data, timeRange) => {
  const insights = [];

  // Pattern recognition
  insights.push({
    id: 'ts-pattern-001',
    type: 'prediction',
    category: 'prediction',
    title: 'Weekly Cyclical Pattern Detected',
    description: `Time series analysis reveals a strong weekly cyclical pattern in both AQI and foot traffic. AQI consistently peaks on Tuesdays (+18% above weekly average) and valleys on Sundays (-22%). Foot traffic shows inverse pattern with Sunday peaks. This predictable cycle enables proactive resource allocation and visitor experience optimization 7 days in advance.`,
    confidence: 0.86,
    severity: 'medium',
    metrics: {
      pattern_strength: 'r²=0.74',
      tuesday_aqi: '+18%',
      sunday_aqi: '-22%',
      forecast_horizon: '7 days',
    },
    recommendedActions: [
      { action: 'view_forecast', label: 'View Weekly Forecast', priority: 1 },
      { action: 'auto_schedule', label: 'Auto-Schedule Resources', priority: 2 },
    ],
  });

  // Correlation insight
  insights.push({
    id: 'ts-corr-001',
    type: 'analysis',
    category: 'environment',
    title: 'Strong Lagged Correlation: AQI Responds to Traffic with 2-Hour Delay',
    description: `Cross-correlation analysis shows AQI changes lag foot traffic changes by approximately 2 hours (r=0.73 at lag=2h). This means air quality improvements from reduced traffic are realized 2 hours later. Optimal visitor notification timing: alert visitors 2 hours before high-traffic periods to maximize air quality benefits.`,
    confidence: 0.81,
    severity: 'low',
    metrics: {
      lag_time: '2 hours',
      correlation: 'r=0.73',
      optimal_alert_timing: '-2 hours',
    },
    recommendedActions: [
      { action: 'adjust_notifications', label: 'Adjust Alert Timing', priority: 1 },
      { action: 'view_analysis', label: 'View Full Analysis', priority: 2 },
    ],
  });

  // Anomaly detection
  insights.push({
    id: 'ts-anom-002',
    type: 'anomaly',
    category: 'anomaly',
    title: 'Sudden AQI Improvement Anomaly Detected',
    description: `Unusual 35% AQI improvement detected ${
      timeRange === '24h' ? 'in the last 4 hours' : 'yesterday between 3-5 PM'
    } without corresponding foot traffic reduction. This positive anomaly suggests external factors (wind pattern change, nearby traffic diversion, or rain) improved conditions. Monitoring these factors could enable predictive optimization.`,
    confidence: 0.76,
    severity: 'low',
    metrics: {
      aqi_improvement: '-35%',
      traffic_change: '+2% (no change)',
      duration: '2 hours',
    },
    recommendedActions: [
      { action: 'investigate_cause', label: 'Investigate Weather Data', priority: 1 },
      { action: 'add_monitoring', label: 'Add Wind Monitoring', priority: 2 },
    ],
  });

  return insights;
};

// Engagement Panel insights
const generateEngagementInsights = (data, timeRange) => {
  const insights = [];

  // Conversion optimization
  insights.push({
    id: 'eng-conv-001',
    type: 'optimization',
    category: 'engagement',
    title: 'Notification Open Rate Below Industry Benchmark',
    description: `Current notification open rate: 28%. Industry benchmark for location-based apps: 42%. Analysis of timestamp data suggests notifications sent during visitor transit (walking) have 3x lower open rates than notifications sent during rest periods. Implementing motion-detection delay could increase open rate to 38-44%.`,
    confidence: 0.83,
    severity: 'medium',
    metrics: {
      current_rate: '28%',
      benchmark: '42%',
      potential_rate: '38-44%',
      improvement: '+36-57%',
    },
    recommendedActions: [
      { action: 'enable_motion_delay', label: 'Enable Smart Timing', priority: 1 },
      { action: 'ab_test', label: 'A/B Test Configuration', priority: 2 },
      { action: 'view_heatmap', label: 'View Engagement Heatmap', priority: 3 },
    ],
  });

  // Drop-off analysis
  insights.push({
    id: 'eng-drop-001',
    type: 'anomaly',
    category: 'engagement',
    title: 'High Drop-Off Rate at "Opened" Stage',
    description: `Engagement funnel shows 52% drop-off between "Opened" and "Engaged" stages, significantly higher than expected 30-35%. Content analysis suggests visitors are bouncing due to generic messaging. Personalizing content based on location zone (heritage vs. recreational) could reduce drop-off to 35% and increase deep engagement by 40%.`,
    confidence: 0.79,
    severity: 'high',
    metrics: {
      current_dropoff: '52%',
      expected_dropoff: '30-35%',
      target_dropoff: '35%',
      engagement_gain: '+40%',
    },
    recommendedActions: [
      { action: 'personalize_content', label: 'Enable Personalization', priority: 1 },
      { action: 'review_messaging', label: 'Review Messaging', priority: 2 },
    ],
  });

  // Peak engagement timing
  insights.push({
    id: 'eng-time-001',
    type: 'prediction',
    category: 'engagement',
    title: 'Optimal Engagement Window: 4-6 PM Weekends',
    description: `Historical data shows engagement rates peak on weekend afternoons (4-6 PM) with 68% higher deep engagement compared to weekday mornings. Conversion rate during this window: 12.4% vs. baseline 7.2%. Concentrating premium content releases and interactive features during this window could maximize impact and ROI.`,
    confidence: 0.92,
    severity: 'low',
    metrics: {
      peak_window: '4-6 PM Sat/Sun',
      engagement_boost: '+68%',
      peak_conversion: '12.4%',
      baseline_conversion: '7.2%',
    },
    recommendedActions: [
      { action: 'schedule_content', label: 'Schedule Premium Content', priority: 1 },
      { action: 'view_calendar', label: 'View Content Calendar', priority: 2 },
    ],
  });

  return insights;
};

// General insights (fallback)
const generateGeneralInsights = (data, timeRange) => {
  return [
    {
      id: 'gen-001',
      type: 'info',
      category: 'operations',
      title: 'System Operating Within Normal Parameters',
      description: `All monitored metrics are within expected ranges for ${timeRange} time window. No critical anomalies or optimization opportunities detected at this time. Continue monitoring for pattern changes.`,
      confidence: 0.95,
      severity: 'low',
      metrics: {
        status: 'Optimal',
        uptime: '99.8%',
      },
      recommendedActions: [
        { action: 'view_dashboard', label: 'View Dashboard', priority: 1 },
      ],
    },
  ];
};

export default generateAIInsights;
