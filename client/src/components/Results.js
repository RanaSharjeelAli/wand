import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Results({ results, showDetailedChart = false }) {
  if (!results || typeof results !== 'object') return null;
  
  // Debug: Log results to see structure
  console.log('[Results] Received results:', results);
  console.log('[Results] Chart data:', results.chartData);
  
  // Ensure results has the expected structure
  const safeResults = {
    summary: results.summary || '',
    chartData: results.chartData || results.chart || null, // Support both chartData and chart
    data: results.data || {},
    agents: results.agents || []
  };

  const renderChart = (chartData, isDetailed = false) => {
    console.log('[Results] renderChart called with:', chartData);
    
    if (!chartData) {
      console.log('[Results] No chartData provided');
      return null;
    }
    
    if (!chartData.data || chartData.data.length === 0) {
      console.log('[Results] chartData.data is empty or missing:', chartData.data);
      return null;
    }

    const chartType = chartData.chartType || 'line';
    const chartDataPoints = chartData.data;
    
    console.log('[Results] Rendering chart type:', chartType, 'with data points:', chartDataPoints);

    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#2196f3',
            font: {
              size: 12
            }
          },
        },
        title: {
          display: !!chartData.title,
          text: chartData.title || '',
          color: '#2196f3',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
      },
    };

    // Render Pie Chart
    if (chartType === 'pie') {
      const colors = [
        'rgba(33, 150, 243, 0.8)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 87, 34, 0.8)',
      ];

      const data = {
        labels: chartDataPoints.map(item => item.label || item.region || item.name),
        datasets: [{
          data: chartDataPoints.map(item => item.value || item.sales),
          backgroundColor: colors.slice(0, chartDataPoints.length),
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        }],
      };

      return (
        <Box sx={{ height: isDetailed ? 400 : 250, width: '100%' }}>
          <Pie data={data} options={commonOptions} />
        </Box>
      );
    }

    // Render Bar Chart
    if (chartType === 'bar') {
      const data = {
        labels: chartDataPoints.map(item => item.metric || item.label || item.name),
        datasets: [{
          label: chartData.title || 'Values',
          data: chartDataPoints.map(item => item.value || item.count),
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 2,
        }],
      };

      const barOptions = {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#757575',
            },
            grid: {
              color: 'rgba(33, 150, 243, 0.1)',
            },
          },
          x: {
            ticks: {
              color: '#757575',
            },
            grid: {
              color: 'rgba(33, 150, 243, 0.1)',
            },
          },
        },
      };

      return (
        <Box sx={{ height: isDetailed ? 400 : 250, width: '100%' }}>
          <Bar data={data} options={barOptions} />
        </Box>
      );
    }

    // Render Line Chart (default)
    const data = {
      labels: chartDataPoints.map(item => item.quarter || item.label || item.month),
      datasets: [
        {
          label: 'Revenue',
          data: chartDataPoints.map(item => item.revenue || item.value || item.value1),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        },
        ...(chartDataPoints[0]?.profit ? [{
          label: 'Profit',
          data: chartDataPoints.map(item => item.profit || item.value2),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        }] : []),
      ],
    };

    const lineOptions = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#757575',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(33, 150, 243, 0.1)',
          },
        },
        x: {
          ticks: {
            color: '#757575',
          },
          grid: {
            color: 'rgba(33, 150, 243, 0.1)',
          },
        },
      },
    };

    return (
      <Box sx={{ height: isDetailed ? 400 : 250, width: '100%' }}>
        <Line data={data} options={lineOptions} />
      </Box>
    );
  };

  // If showDetailedChart is true, only show the detailed chart
  if (showDetailedChart) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'rgba(33, 150, 243, 0.2)',
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {renderChart(results.chartData, true)}
        </Box>
      </Paper>
    );
  }

  // Default view: Executive Summary + Small Chart
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(33, 150, 243, 0.2)',
        borderRadius: 2,
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'primary.main',
          fontWeight: 600,
          mb: 2,
        }}
      >
        Results
      </Typography>

      {/* Executive Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'primary.main',
            mb: 1.5,
            fontWeight: 500,
          }}
        >
          Executive Summary
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.primary',
            lineHeight: 1.7,
          }}
        >
          {safeResults.summary || "Task completed successfully."}
        </Typography>
      </Box>

      {/* Small Embedded Chart */}
      {safeResults.chartData && (
        <Box 
          sx={{ 
            p: 2,
            bgcolor: 'rgba(33, 150, 243, 0.03)',
            borderRadius: 1,
          }}
        >
          {renderChart(safeResults.chartData, false)}
        </Box>
      )}
    </Paper>
  );
}

export default Results;