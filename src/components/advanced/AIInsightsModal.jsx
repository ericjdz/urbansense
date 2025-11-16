import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Box,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseRoundedIcon,
  AutoAwesome as AutoAwesomeRoundedIcon,
  TrendingUp as TrendingUpRoundedIcon,
  Warning as WarningRoundedIcon,
  Lightbulb as LightbulbRoundedIcon,
  Build as BuildRoundedIcon,
  CheckCircle as CheckCircleRoundedIcon,
  Timeline as TimelineRoundedIcon,
  Notifications as NotificationsRoundedIcon,
} from '@mui/icons-material';

// Category icons mapping
const categoryIcons = {
  prediction: TrendingUpRoundedIcon,
  anomaly: WarningRoundedIcon,
  optimization: LightbulbRoundedIcon,
  maintenance: BuildRoundedIcon,
  environment: TimelineRoundedIcon,
  operations: CheckCircleRoundedIcon,
  engagement: NotificationsRoundedIcon,
};

// Category colors
const categoryColors = {
  prediction: '#2196F3',
  anomaly: '#FF9800',
  optimization: '#4CAF50',
  maintenance: '#F44336',
  environment: '#00BCD4',
  operations: '#9C27B0',
  engagement: '#FF5722',
};

// Severity colors
const severityColors = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const InsightCard = ({ insight, onAction }) => {
  const CategoryIcon = categoryIcons[insight.category] || LightbulbRoundedIcon;
  const borderColor = categoryColors[insight.category] || '#2196F3';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderLeft: '4px solid',
        borderColor: borderColor,
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeftWidth: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.04)',
          borderColor: borderColor,
          boxShadow: `0 0 20px ${borderColor}40`,
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <CategoryIcon sx={{ color: borderColor, fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
              {insight.title}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {insight.severity && (
              <Chip
                size="small"
                label={insight.severity.toUpperCase()}
                color={severityColors[insight.severity]}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
            {insight.confidence && (
              <Tooltip title={`${Math.round(insight.confidence * 100)}% confidence`}>
                <Chip
                  size="small"
                  label={`${Math.round(insight.confidence * 100)}%`}
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor:
                      insight.confidence > 0.8
                        ? 'rgba(76, 175, 80, 0.2)'
                        : insight.confidence > 0.6
                        ? 'rgba(255, 152, 0, 0.2)'
                        : 'rgba(158, 158, 158, 0.2)',
                    color:
                      insight.confidence > 0.8
                        ? '#4CAF50'
                        : insight.confidence > 0.6
                        ? '#FF9800'
                        : '#9E9E9E',
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {insight.description}
        </Typography>

        {/* Supporting Metrics */}
        {insight.metrics && Object.keys(insight.metrics).length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {Object.entries(insight.metrics).map(([key, value]) => (
              <Box key={key}>
                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>
                  {key.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color={borderColor}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Action Buttons */}
        {insight.recommendedActions && insight.recommendedActions.length > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {insight.recommendedActions.map((action, idx) => (
                <Button
                  key={idx}
                  size="small"
                  variant={idx === 0 ? 'contained' : 'outlined'}
                  onClick={() => onAction(insight.id, action.action)}
                  sx={{
                    minWidth: 'auto',
                    ...(idx === 0 && {
                      background: `linear-gradient(135deg, ${borderColor}DD 0%, ${borderColor}99 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${borderColor}FF 0%, ${borderColor}DD 100%)`,
                      },
                    }),
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
};

const AIInsightsModal = ({ open, onClose, insights, loading, context }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Group insights by category
  const categorizedInsights = insights.reduce((acc, insight) => {
    const category = insight.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(insight);
    return acc;
  }, {});

  // Get filtered insights based on active tab
  const filteredInsights = activeTab === 'all' ? insights : categorizedInsights[activeTab] || [];

  // Count insights by severity
  const highPriorityCount = insights.filter((i) => i.severity === 'high').length;

  const handleAction = (insightId, actionType) => {
    // Placeholder for action handling - show toast notification
    console.log(`Action triggered: ${actionType} for insight: ${insightId}`);
    // In production, this would trigger actual actions or open additional forms
    alert(`Action "${actionType}" triggered. This is a placeholder for future functionality.`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(18,18,18,0.95)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(33, 150, 243, 0.3)',
          boxShadow: '0 0 40px rgba(33, 150, 243, 0.15)',
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AutoAwesomeRoundedIcon sx={{ color: '#2196F3', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                AI Insights & Recommendations
              </Typography>
              {context && (
                <Typography variant="caption" color="text.disabled">
                  {context.location && `${context.location} • `}
                  {context.timeRange && `${context.timeRange}`}
                  {context.dataType && ` • ${context.dataType}`}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {highPriorityCount > 0 && (
              <Chip
                size="small"
                label={`${highPriorityCount} High Priority`}
                color="error"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Chip
              size="small"
              label="Powered by AI"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
              }}
            />
            <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.02)' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { minHeight: 48 },
          }}
        >
          <Tab
            label={`All (${insights.length})`}
            value="all"
            icon={<AutoAwesomeRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
          {Object.keys(categorizedInsights).map((category) => {
            const Icon = categoryIcons[category] || LightbulbRoundedIcon;
            return (
              <Tab
                key={category}
                label={`${category.charAt(0).toUpperCase() + category.slice(1)} (${
                  categorizedInsights[category].length
                })`}
                value={category}
                icon={<Icon fontSize="small" />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Analyzing temporal data and generating insights...
            </Typography>
            <LinearProgress sx={{ width: '100%', mt: 2, maxWidth: 300 }} />
          </Box>
        ) : filteredInsights.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Critical Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System is performing optimally. All metrics are within expected ranges.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* Summary Banner */}
            {activeTab === 'all' && insights.length > 0 && (
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <AutoAwesomeRoundedIcon sx={{ color: '#2196F3', fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Analysis Complete
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated {insights.length} insights from temporal and spatial data analysis
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Insight Cards */}
            {filteredInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} onAction={handleAction} />
            ))}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<TimelineRoundedIcon />}
          onClick={() => alert('Export functionality coming soon')}
        >
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIInsightsModal;
