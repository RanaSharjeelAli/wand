const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get task history (mock implementation)
router.get('/history', (req, res) => {
  // Mock task history
  const history = [
    {
      id: '1',
      request: 'Summarize the last 3 quarters\' financial trends and create a chart',
      status: 'completed',
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      agents: ['data-collector', 'financial-analyst', 'summarizer', 'chart-generator']
    },
    {
      id: '2', 
      request: 'Analyze customer satisfaction data from last month',
      status: 'completed',
      completedAt: new Date(Date.now() - 7200000).toISOString(),
      agents: ['data-analyst', 'summarizer']
    }
  ];
  
  res.json(history);
});

// Get available agent types
router.get('/agents', (req, res) => {
  const agents = [
    {
      id: 'data-collector',
      name: 'Data Collector',
      description: 'Gathers and processes raw data from various sources',
      capabilities: ['data extraction', 'data cleaning', 'source validation']
    },
    {
      id: 'financial-analyst',
      name: 'Financial Analyst',
      description: 'Analyzes financial data and identifies trends',
      capabilities: ['trend analysis', 'financial modeling', 'risk assessment']
    },
    {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Performs statistical analysis and identifies patterns',
      capabilities: ['statistical analysis', 'pattern recognition', 'data visualization']
    },
    {
      id: 'summarizer',
      name: 'Summarizer',
      description: 'Creates concise summaries of complex information',
      capabilities: ['text summarization', 'key point extraction', 'content synthesis']
    },
    {
      id: 'chart-generator',
      name: 'Chart Generator',
      description: 'Creates visualizations and charts from data',
      capabilities: ['chart creation', 'data visualization', 'graph design']
    },
    {
      id: 'report-generator',
      name: 'Report Generator',
      description: 'Generates structured reports and documentation',
      capabilities: ['report writing', 'document formatting', 'content organization']
    },
    {
      id: 'general-analyst',
      name: 'General Analyst',
      description: 'Handles general analysis tasks',
      capabilities: ['comprehensive analysis', 'research', 'recommendations']
    }
  ];
  
  res.json(agents);
});

module.exports = { taskRoutes: router };