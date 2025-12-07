const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { OllamaService } = require('./ollamaService');

class TaskManager {
  constructor(io, taskId) {
    this.io = io;
    this.taskId = taskId;
    this.agents = [];
    this.results = {};
    this.wandAiData = this.loadWandAiData();
    this.ollamaService = new OllamaService();
  }

  loadWandAiData() {
    try {
      const filePath = path.join(__dirname, '../../wand_ai.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading wand_ai.json:', error);
      return {
        company_info: {},
        financials: [],
        customer_satisfaction: [],
        sales_by_region: [],
        user_engagement: []
      };
    }
  }

  async processTask(taskData) {
    try {
      // Step 1: Analyze task and determine required agents
      const agents = this.determineAgents(taskData.request);
      
      // Step 2: Initialize agents
      this.agents = agents.map(agentType => ({
        id: uuidv4(),
        type: agentType,
        status: 'pending',
        progress: 0,
        result: null
      }));

      // Notify clients about task start
      this.io.emit('task-started', {
        taskId: this.taskId,
        agents: this.agents,
        request: taskData.request
      });

      // Step 3: Execute agents in sequence or parallel
      await this.executeAgents(taskData.request);

      // Step 4: Aggregate results
      const finalResult = this.aggregateResults();

      // Step 5: Send final result
      this.io.emit('task-completed', {
        taskId: this.taskId,
        result: finalResult
      });

    } catch (error) {
      this.io.emit('task-error', {
        taskId: this.taskId,
        error: error.message
      });
    }
  }

  determineAgents(request) {
    const agents = [];
    const lowerRequest = request.toLowerCase();

    // Business logic to determine which agents are needed
    if (lowerRequest.includes('summarize') || lowerRequest.includes('summary')) {
      agents.push('summarizer');
    }
    
    if (lowerRequest.includes('chart') || lowerRequest.includes('graph') || lowerRequest.includes('visualize')) {
      agents.push('data-analyst');
      agents.push('chart-generator');
    }
    
    if (lowerRequest.includes('financial') || lowerRequest.includes('quarter') || lowerRequest.includes('trend')) {
      agents.push('financial-analyst');
    }
    
    if (lowerRequest.includes('data') || lowerRequest.includes('report')) {
      agents.push('data-collector');
    }

    // Default agents if none matched
    if (agents.length === 0) {
      agents.push('general-analyst', 'report-generator');
    }

    return agents;
  }

  async executeAgents(request) {
    for (const agent of this.agents) {
      // Update agent status to running
      agent.status = 'running';
      this.io.emit('agent-updated', {
        taskId: this.taskId,
        agent
      });

      // Simulate agent work with progress updates
      await this.simulateAgentWork(agent, request);

      // Update agent status to completed
      agent.status = 'completed';
      agent.progress = 100;
      this.io.emit('agent-updated', {
        taskId: this.taskId,
        agent
      });
    }
  }

  async simulateAgentWork(agent, request) {
    const steps = 10;
    const stepDelay = 500; // 500ms per step

    for (let i = 0; i <= steps; i++) {
      agent.progress = (i / steps) * 100;
      this.io.emit('agent-progress', {
        taskId: this.taskId,
        agentId: agent.id,
        progress: agent.progress
      });
      
      await new Promise(resolve => setTimeout(resolve, stepDelay));
    }

    // Generate result using Ollama and structured data
    agent.result = await this.generateResultWithOllama(agent.type, request);
    this.results[agent.type] = agent.result;
  }

  async generateResultWithOllama(agentType, request) {
    // First, get structured data based on query type
    const structuredData = this.getStructuredData(agentType, request);
    
    // Then use Ollama to generate natural language responses
    try {
      const context = {
        wandAiData: this.wandAiData,
        structuredData: structuredData
      };
      
      const ollamaResponse = await this.ollamaService.generateResponse(
        request,
        context,
        agentType
      );

      // Combine structured data with Ollama-generated text
      return this.combineOllamaAndStructuredData(agentType, structuredData, ollamaResponse, request);
    } catch (error) {
      console.error(`Error generating Ollama response for ${agentType}:`, error);
      // Fallback to structured data only
      return structuredData;
    }
  }

  getStructuredData(agentType, request) {
    // This is the old generateMockResult logic, but returns structured data
    const lowerRequest = request.toLowerCase();
    const isFinancialQuery = lowerRequest.includes('financial') || 
                             lowerRequest.includes('quarter') || 
                             lowerRequest.includes('revenue') || 
                             lowerRequest.includes('profit') ||
                             lowerRequest.includes('trend');
    const isCustomerQuery = lowerRequest.includes('customer') || 
                            lowerRequest.includes('satisfaction') || 
                            lowerRequest.includes('survey');
    const isSalesQuery = lowerRequest.includes('sales') || 
                        lowerRequest.includes('region');
    const isEngagementQuery = lowerRequest.includes('engagement') || 
                             lowerRequest.includes('user') || 
                             lowerRequest.includes('active');

    // Use financial data for financial queries
    if (isFinancialQuery && this.wandAiData.financials && this.wandAiData.financials.length > 0) {
      return this.generateFinancialStructuredData(agentType, request);
    }

    // Use customer satisfaction data
    if (isCustomerQuery && this.wandAiData.customer_satisfaction && this.wandAiData.customer_satisfaction.length > 0) {
      return this.generateCustomerSatisfactionStructuredData(agentType, request);
    }

    // Use sales data
    if (isSalesQuery && this.wandAiData.sales_by_region && this.wandAiData.sales_by_region.length > 0) {
      return this.generateSalesStructuredData(agentType, request);
    }

    // Use engagement data
    if (isEngagementQuery && this.wandAiData.user_engagement && this.wandAiData.user_engagement.length > 0) {
      return this.generateEngagementStructuredData(agentType, request);
    }

    // Use company info and other data for general queries
    if (this.wandAiData.company_info && Object.keys(this.wandAiData.company_info).length > 0) {
      return this.generateGeneralStructuredData(agentType, request);
    }

    // Fallback to default mock data
    return this.generateDefaultStructuredData(agentType, request);
  }

  combineOllamaAndStructuredData(agentType, structuredData, ollamaResponse, request) {
    // Combine Ollama's natural language response with structured data
    switch (agentType) {
      case 'summarizer':
        return {
          ...structuredData,
          summary: ollamaResponse || structuredData.summary,
          keyPoints: structuredData.keyPoints || [],
          confidence: structuredData.confidence || 0.90
        };
      
      case 'financial-analyst':
        return {
          ...structuredData,
          insights: structuredData.insights || [],
          analysis: ollamaResponse,
          trends: structuredData.trends || {},
          confidence: structuredData.confidence || 0.88
        };
      
      case 'data-analyst':
        return {
          ...structuredData,
          analysis: ollamaResponse,
          metrics: structuredData.metrics || {},
          patterns: structuredData.patterns || [],
          confidence: structuredData.confidence || 0.92
        };
      
      case 'chart-generator':
        return {
          ...structuredData,
          description: ollamaResponse,
          insights: structuredData.insights || []
        };
      
      case 'report-generator':
        return {
          ...structuredData,
          ollamaAnalysis: ollamaResponse,
          sections: structuredData.sections || [],
          format: structuredData.format || 'structured_report'
        };
      
      default:
        return {
          ...structuredData,
          analysis: ollamaResponse || structuredData.analysis,
          confidence: structuredData.confidence || 0.80
        };
    }
  }


  generateFinancialStructuredData(agentType, request) {
    const financialData = this.wandAiData.financials || [];
    
    // Calculate trends
    const firstQuarter = financialData[0];
    const lastQuarter = financialData[financialData.length - 1];
    const revenueGrowth = ((lastQuarter.revenue - firstQuarter.revenue) / firstQuarter.revenue * 100).toFixed(1);
    const profitGrowth = ((lastQuarter.profit - firstQuarter.profit) / firstQuarter.profit * 100).toFixed(1);
    const expenseGrowth = ((lastQuarter.expenses - firstQuarter.expenses) / firstQuarter.expenses * 100).toFixed(1);

    // Calculate total revenue
    const totalRevenue = financialData.reduce((sum, q) => sum + q.revenue, 0);
    const totalProfit = financialData.reduce((sum, q) => sum + q.profit, 0);
    const avgQuarterlyGrowth = ((revenueGrowth / financialData.length) * 0.75).toFixed(1);

    const results = {
      'data-collector': {
        dataPoints: financialData.length * 3, // revenue, profit, expenses per quarter
        sources: financialData.map(q => `${q.quarter} Financial Report`),
        timeRange: `${financialData[0].quarter} to ${financialData[financialData.length - 1].quarter}`,
        confidence: 0.95
      },
      'financial-analyst': {
        trends: {
          revenue: `+${revenueGrowth}%`,
          expenses: `+${expenseGrowth}%`,
          profit: `+${profitGrowth}%`
        },
        insights: this.generateFinancialInsights(financialData, revenueGrowth, profitGrowth),
        confidence: 0.88
      },
      'data-analyst': {
        metrics: {
          totalRevenue: `$${(totalRevenue / 1000).toFixed(1)}k`,
          totalProfit: `$${(totalProfit / 1000).toFixed(1)}k`,
          avgQuarterlyGrowth: `${avgQuarterlyGrowth}%`,
          volatility: this.calculateVolatility(financialData)
        },
        patterns: this.identifyPatterns(financialData),
        confidence: 0.92
      },
      'summarizer': {
        summary: `Financial performance from ${financialData[0].quarter} to ${financialData[financialData.length - 1].quarter} shows ${revenueGrowth > 0 ? 'growth' : 'decline'} with revenue ${revenueGrowth > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(revenueGrowth)}% and profits ${profitGrowth > 0 ? 'growing' : 'declining'} by ${Math.abs(profitGrowth)}%. The company has ${expenseGrowth < revenueGrowth ? 'successfully managed costs' : 'experienced cost increases'} while ${revenueGrowth > 0 ? 'expanding' : 'maintaining'} market position.`,
        keyPoints: this.generateKeyPoints(financialData, revenueGrowth, profitGrowth),
        confidence: 0.90
      },
      'chart-generator': {
        chartType: 'line',
        data: financialData.map(q => ({
          quarter: q.quarter.replace(' 2025', '').replace('Q', 'Q'), // Format: Q1, Q2, etc.
          revenue: q.revenue,
          profit: q.profit
        })),
        insights: this.generateChartInsights(financialData)
      },
      'report-generator': {
        sections: [
          { 
            title: 'Executive Summary', 
            content: `Analysis of financial data from ${financialData[0].quarter} to ${financialData[financialData.length - 1].quarter} reveals ${revenueGrowth > 0 ? 'strong' : 'challenging'} performance with revenue ${revenueGrowth > 0 ? 'growth' : 'decline'} of ${Math.abs(revenueGrowth)}%.` 
          },
          { 
            title: 'Detailed Analysis', 
            content: `Quarter-over-quarter analysis shows revenue ranging from $${Math.min(...financialData.map(q => q.revenue)).toLocaleString()} to $${Math.max(...financialData.map(q => q.revenue)).toLocaleString()}, with profit margins ${profitGrowth > revenueGrowth ? 'expanding' : 'contracting'}.` 
          },
          { 
            title: 'Recommendations', 
            content: revenueGrowth > 0 ? 'Continue current growth strategy and focus on maintaining cost efficiency.' : 'Review cost structure and identify opportunities for revenue growth.' 
          }
        ],
        format: 'structured_report'
      },
      'general-analyst': {
        analysis: `Financial analysis based on ${financialData.length} quarters of data shows ${revenueGrowth > 0 ? 'positive' : 'negative'} trends.`,
        recommendations: this.generateRecommendations(financialData, revenueGrowth, profitGrowth),
        confidence: 0.75
      }
    };

    return results[agentType] || { message: 'Analysis completed', confidence: 0.80 };
  }

  generateGeneralStructuredData(agentType, request) {
    const companyInfo = this.wandAiData.company_info || {};
    const companyText = `Company: ${companyInfo.name || 'Wand AI'}, Founded: ${companyInfo.founded || 'N/A'}, Mission: ${companyInfo.mission || 'N/A'}, Employees: ${companyInfo.employees || 'N/A'}, Headquarters: ${companyInfo.headquarters || 'N/A'}, Departments: ${(companyInfo.departments || []).join(', ')}`;

    const results = {
      'data-collector': {
        dataPoints: Object.keys(this.wandAiData).length,
        sources: ['Company Information', 'Financial Data', 'Customer Satisfaction', 'Sales Data', 'User Engagement'],
        timeRange: 'Current company data',
        confidence: 0.95
      },
      'summarizer': {
        summary: `${companyInfo.name || 'Wand AI'} is a company founded in ${companyInfo.founded || '2020'} with ${companyInfo.employees || 150} employees based in ${companyInfo.headquarters || 'San Francisco, CA'}. ${companyInfo.mission || 'The company focuses on AI integration.'}`,
        keyPoints: [
          `Company: ${companyInfo.name || 'Wand AI'}`,
          `Founded: ${companyInfo.founded || '2020'}`,
          `Employees: ${companyInfo.employees || 150}`,
          `Headquarters: ${companyInfo.headquarters || 'San Francisco, CA'}`
        ],
        confidence: 0.90
      },
      'report-generator': {
        sections: [
          {
            title: 'Company Overview',
            content: companyText
          },
          {
            title: 'Available Data',
            content: `Financial data: ${(this.wandAiData.financials || []).length} quarters, Customer satisfaction: ${(this.wandAiData.customer_satisfaction || []).length} months, Sales regions: ${(this.wandAiData.sales_by_region || []).length}, Engagement metrics: ${(this.wandAiData.user_engagement || []).length}`
          }
        ],
        format: 'structured_report'
      },
      'general-analyst': {
        analysis: `Analysis based on Wand AI company data. Company information and various data sources available for analysis.`,
        recommendations: ['Review company information', 'Analyze financial trends', 'Examine customer satisfaction', 'Review sales performance'],
        confidence: 0.75
      }
    };

    return results[agentType] || { 
      message: 'Company information available', 
      confidence: 0.80 
    };
  }

  generateCustomerSatisfactionStructuredData(agentType, request) {
    const satisfactionData = this.wandAiData.customer_satisfaction || [];
    const totalSatisfied = satisfactionData.reduce((sum, m) => sum + (m.satisfied || 0), 0);
    const totalSurveyed = satisfactionData.reduce((sum, m) => sum + (m.surveyed || 0), 0);
    const satisfactionRate = totalSurveyed > 0 ? ((totalSatisfied / totalSurveyed) * 100).toFixed(1) : 0;

    const results = {
      'data-collector': {
        dataPoints: satisfactionData.length,
        sources: satisfactionData.map(m => `${m.month} Survey`),
        timeRange: `${satisfactionData[0]?.month || 'N/A'} to ${satisfactionData[satisfactionData.length - 1]?.month || 'N/A'}`,
        confidence: 0.95
      },
      'summarizer': {
        summary: `Customer satisfaction analysis shows ${satisfactionRate}% satisfaction rate across ${satisfactionData.length} months. Average ${totalSurveyed / satisfactionData.length} customers surveyed per month.`,
        keyPoints: [
          `Overall satisfaction rate: ${satisfactionRate}%`,
          `Total customers surveyed: ${totalSurveyed}`,
          `Data covers ${satisfactionData.length} months`
        ],
        confidence: 0.90
      },
      'data-analyst': {
        metrics: {
          satisfactionRate: `${satisfactionRate}%`,
          totalSurveyed: totalSurveyed,
          averagePerMonth: Math.round(totalSurveyed / satisfactionData.length)
        },
        patterns: satisfactionData.map(m => `${m.month}: ${((m.satisfied / m.surveyed) * 100).toFixed(1)}% satisfied`),
        confidence: 0.92
      },
      'chart-generator': {
        chartType: 'bar',
        data: satisfactionData.map(m => ({
          month: m.month,
          satisfied: m.satisfied,
          neutral: m.neutral,
          dissatisfied: m.dissatisfied
        })),
        insights: [`Average satisfaction: ${satisfactionRate}%`, `Peak satisfaction month: ${satisfactionData.reduce((max, m) => (m.satisfied / m.surveyed) > (max.satisfied / max.surveyed) ? m : max, satisfactionData[0])?.month || 'N/A'}`]
      }
    };

    return results[agentType] || { message: 'Customer satisfaction analysis completed', confidence: 0.80 };
  }

  generateSalesStructuredData(agentType, request) {
    const salesData = this.wandAiData.sales_by_region || [];
    const totalSales = salesData.reduce((sum, r) => sum + (r.sales || 0), 0);
    const topRegion = salesData.reduce((max, r) => (r.sales || 0) > (max.sales || 0) ? r : max, salesData[0] || {});

    const results = {
      'data-collector': {
        dataPoints: salesData.length,
        sources: salesData.map(r => `${r.region} Sales Data`),
        timeRange: 'Current period',
        confidence: 0.95
      },
      'summarizer': {
        summary: `Sales performance across ${salesData.length} regions shows total sales of $${totalSales.toLocaleString()}. Top performing region is ${topRegion.region || 'N/A'} with $${(topRegion.sales || 0).toLocaleString()} in sales.`,
        keyPoints: [
          `Total sales: $${totalSales.toLocaleString()}`,
          `Top region: ${topRegion.region || 'N/A'}`,
          `Regions analyzed: ${salesData.length}`
        ],
        confidence: 0.90
      },
      'data-analyst': {
        metrics: {
          totalSales: `$${totalSales.toLocaleString()}`,
          averagePerRegion: `$${Math.round(totalSales / salesData.length).toLocaleString()}`,
          topRegion: topRegion.region || 'N/A'
        },
        patterns: salesData.map(r => `${r.region}: $${(r.sales || 0).toLocaleString()} (${((r.sales / totalSales) * 100).toFixed(1)}%)`),
        confidence: 0.92
      },
      'chart-generator': {
        chartType: 'bar',
        data: salesData.map(r => ({
          region: r.region,
          sales: r.sales
        })),
        insights: [`Total sales: $${totalSales.toLocaleString()}`, `Top region: ${topRegion.region || 'N/A'}`]
      }
    };

    return results[agentType] || { message: 'Sales analysis completed', confidence: 0.80 };
  }

  generateEngagementStructuredData(agentType, request) {
    const engagementData = this.wandAiData.user_engagement || [];
    const dau = engagementData.find(e => e.metric === 'daily_active_users')?.last_month_average || 0;
    const wau = engagementData.find(e => e.metric === 'weekly_active_users')?.last_month_average || 0;
    const mau = engagementData.find(e => e.metric === 'monthly_active_users')?.last_month_average || 0;
    const sessionTime = engagementData.find(e => e.metric === 'average_session_time_minutes')?.last_month_average || 0;
    const featureUsage = engagementData.find(e => e.metric === 'feature_usage')?.details || {};

    const results = {
      'data-collector': {
        dataPoints: engagementData.length,
        sources: engagementData.map(e => e.metric),
        timeRange: 'Last month average',
        confidence: 0.95
      },
      'summarizer': {
        summary: `User engagement metrics show ${mau.toLocaleString()} monthly active users, ${wau.toLocaleString()} weekly active users, and ${dau.toLocaleString()} daily active users. Average session time is ${sessionTime} minutes. Feature usage: ${Object.entries(featureUsage).map(([k, v]) => `${k}: ${v}%`).join(', ')}.`,
        keyPoints: [
          `Monthly Active Users: ${mau.toLocaleString()}`,
          `Weekly Active Users: ${wau.toLocaleString()}`,
          `Daily Active Users: ${dau.toLocaleString()}`,
          `Average Session: ${sessionTime} minutes`
        ],
        confidence: 0.90
      },
      'data-analyst': {
        metrics: {
          dailyActiveUsers: dau.toLocaleString(),
          weeklyActiveUsers: wau.toLocaleString(),
          monthlyActiveUsers: mau.toLocaleString(),
          avgSessionTime: `${sessionTime} minutes`
        },
        patterns: [
          `DAU/MAU ratio: ${((dau / mau) * 100).toFixed(1)}%`,
          `WAU/MAU ratio: ${((wau / mau) * 100).toFixed(1)}%`,
          `Most used feature: ${Object.entries(featureUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`
        ],
        confidence: 0.92
      },
      'chart-generator': {
        chartType: 'bar',
        data: [
          { metric: 'Daily Active Users', value: dau },
          { metric: 'Weekly Active Users', value: wau },
          { metric: 'Monthly Active Users', value: mau }
        ],
        insights: [`Total MAU: ${mau.toLocaleString()}`, `Engagement rate: ${((dau / mau) * 100).toFixed(1)}%`]
      }
    };

    return results[agentType] || { message: 'Engagement analysis completed', confidence: 0.80 };
  }

  generateDefaultStructuredData(agentType, request) {
    // Fallback mock data
    const results = {
      'data-collector': {
        dataPoints: 150,
        sources: ['Q1 Financial Report', 'Q2 Financial Report', 'Q3 Financial Report'],
        timeRange: 'Last 3 quarters',
        confidence: 0.95
      },
      'financial-analyst': {
        trends: { revenue: '+15.2%', expenses: '+8.7%', profit: '+23.4%' },
        insights: ['Revenue growth accelerated', 'Cost management improved', 'Profit margins expanded'],
        confidence: 0.88
      },
      'summarizer': {
        summary: 'Analysis completed successfully based on available data.',
        keyPoints: ['Data processed', 'Insights generated', 'Report ready'],
        confidence: 0.90
      },
      'chart-generator': {
        chartType: 'line',
        data: [
          { quarter: 'Q1', revenue: 10000, profit: 2000 },
          { quarter: 'Q2', revenue: 12000, profit: 2500 },
          { quarter: 'Q3', revenue: 11000, profit: 2100 }
        ],
        insights: ['Data visualization created', 'Trends identified']
      }
    };

    return results[agentType] || { message: 'Analysis completed', confidence: 0.80 };
  }

  // Helper methods for financial analysis
  generateFinancialInsights(data, revenueGrowth, profitGrowth) {
    const insights = [];
    if (parseFloat(revenueGrowth) > 10) {
      insights.push('Strong revenue growth observed across quarters');
    }
    if (parseFloat(profitGrowth) > parseFloat(revenueGrowth)) {
      insights.push('Profit growth outpacing revenue, indicating improved efficiency');
    }
    const profitMargins = data.map(q => (q.profit / q.revenue) * 100);
    const avgMargin = profitMargins.reduce((a, b) => a + b, 0) / profitMargins.length;
    insights.push(`Average profit margin: ${avgMargin.toFixed(1)}%`);
    return insights;
  }

  calculateVolatility(data) {
    const revenues = data.map(q => q.revenue);
    const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = (stdDev / mean) * 100;
    return coefficient < 10 ? 'Low' : coefficient < 20 ? 'Medium' : 'High';
  }

  identifyPatterns(data) {
    const patterns = [];
    const revenues = data.map(q => q.revenue);
    const isIncreasing = revenues.every((val, i) => i === 0 || val >= revenues[i - 1]);
    const isDecreasing = revenues.every((val, i) => i === 0 || val <= revenues[i - 1]);
    
    if (isIncreasing) patterns.push('Consistent upward trend in revenue');
    else if (isDecreasing) patterns.push('Declining revenue pattern detected');
    else patterns.push('Volatile revenue pattern with fluctuations');
    
    return patterns;
  }

  generateKeyPoints(data, revenueGrowth, profitGrowth) {
    return [
      `Revenue ${parseFloat(revenueGrowth) > 0 ? 'growth' : 'change'} of ${Math.abs(revenueGrowth)}%`,
      `Profit ${parseFloat(profitGrowth) > 0 ? 'growth' : 'change'} of ${Math.abs(profitGrowth)}%`,
      `Data covers ${data.length} quarters from ${data[0].quarter} to ${data[data.length - 1].quarter}`
    ];
  }

  generateChartInsights(data) {
    const maxRevenue = Math.max(...data.map(q => q.revenue));
    const maxProfit = Math.max(...data.map(q => q.profit));
    const insights = [];
    insights.push(`Peak revenue: $${maxRevenue.toLocaleString()}`);
    insights.push(`Peak profit: $${maxProfit.toLocaleString()}`);
    return insights;
  }

  generateRecommendations(data, revenueGrowth, profitGrowth) {
    const recommendations = [];
    if (parseFloat(revenueGrowth) > 0) {
      recommendations.push('Continue current growth strategy');
    } else {
      recommendations.push('Review revenue generation strategies');
    }
    if (parseFloat(profitGrowth) < parseFloat(revenueGrowth)) {
      recommendations.push('Focus on improving profit margins');
    }
    recommendations.push('Monitor quarterly trends closely');
    return recommendations;
  }

  aggregateResults() {
    const summary = this.results['summarizer'];
    const financial = this.results['financial-analyst'];
    const chart = this.results['chart-generator'];
    const report = this.results['report-generator'];

    const baseSummary = summary?.summary || 'Analysis completed successfully';
    const attribution = baseSummary.includes('LLM') || baseSummary.includes('Mock') ? '' : '\n\n*This response was generated by Mock JavaScript Agent*';
    
    return {
      summary: baseSummary + attribution,
      keyInsights: financial?.insights || [],
      chartData: chart,
      detailedReport: report,
      agents: this.agents.map(a => ({
        id: a.id,
        type: a.type,
        status: a.status,
        confidence: a.result?.confidence || 0.80
      })),
      completedAt: new Date().toISOString()
    };
  }
}

module.exports = { TaskManager };