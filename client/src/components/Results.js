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
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Results({ results, showDetailedChart = false }) {
  if (!results) return null;

  const renderChart = (chartData, isDetailed = false) => {
    // Default data if not provided
    const defaultData = [
      { quarter: 'Q1', revenue: 250000, profit: 400000 },
      { quarter: 'Q2', revenue: 500000, profit: 650000 },
      { quarter: 'Q3', revenue: 800000, profit: 950000 },
    ];

    const chartDataPoints = (chartData && chartData.data) ? chartData.data : defaultData;

    const data = {
      labels: chartDataPoints.map(item => item.quarter || item.label),
      datasets: [
        {
          label: 'Revenue',
          data: chartDataPoints.map(item => item.revenue || item.value1),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: 'Profit',
          data: chartDataPoints.map(item => item.profit || item.value2),
          borderColor: '#64b5f6',
          backgroundColor: 'rgba(100, 181, 246, 0.1)',
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !isDetailed,
          position: 'top',
          labels: {
            color: '#2196f3',
          },
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: isDetailed ? 1000000 : undefined,
          ticks: {
            color: '#757575',
            stepSize: isDetailed ? 200000 : undefined,
            callback: function(value) {
              if (isDetailed) {
                return '$' + (value / 1000) + 'k';
              }
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
      <Box sx={{ height: isDetailed ? '100%' : 200, width: '100%' }}>
        <Line data={data} options={options} />
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
          {results.summary || "Financial performance over the last 3 quarters shows strong growth with revenue increasing by 15.2% and profits growing by 23.4%. The company has successfully managed costs while expanding market share."}
        </Typography>
      </Box>

      {/* Small Embedded Chart */}
      {results.chartData && (
        <Box 
          sx={{ 
            p: 2,
            bgcolor: 'rgba(33, 150, 243, 0.03)',
            borderRadius: 1,
          }}
        >
          {renderChart(results.chartData, false)}
        </Box>
      )}
    </Paper>
  );
}

export default Results;