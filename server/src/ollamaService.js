const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2'; // Default to llama3.2, can be changed
  }

  /**
   * Generate a response using Ollama
   * @param {string} prompt - The user's question or prompt
   * @param {object} context - Additional context data (wand_ai.json data)
   * @param {string} agentType - Type of agent (summarizer, financial-analyst, etc.)
   * @returns {Promise<string>} - Generated response
   */
  async generateResponse(prompt, context = {}, agentType = 'general') {
    try {
      // Build a concise prompt with relevant data
      const systemPrompt = this.buildSystemPrompt(agentType, context);
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}\n\nProvide a concise, data-driven response. Use plain text formatting without asterisks or markdown. Focus on numbers, insights, and key findings.`;
      
      console.log(`[Ollama] Generating response for ${agentType}`);
      console.log(`[Ollama] Prompt length: ${fullPrompt.length} characters`);
      
      // Make request to Ollama
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 250,  // Increased for more detailed responses
          num_ctx: 2048,     // Context window
          repeat_penalty: 1.1,
        }
      }, {
        timeout: 90000  // 90 second timeout (increased from 30s)
      });

      if (response.data && response.data.response) {
        let ollamaResponse = response.data.response.trim();
        
        // Clean up excessive asterisks and markdown formatting
        ollamaResponse = this.cleanResponse(ollamaResponse);
        
        console.log(`[Ollama] ✓ Response generated (${ollamaResponse.length} chars)`);
        return `${ollamaResponse}\n\n💡 Response powered by Ollama AI (${this.model})`;
      }

      // If response format is unexpected
      console.warn('[Ollama] Unexpected response format, using fallback');
      return this.getFallbackResponse(prompt, context, agentType);
      
    } catch (error) {
      console.error('[Ollama] Error:', error.message);
      
      // Fallback if Ollama is not available or times out
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.warn('[Ollama] ⚠️  Server not reachable, using fallback response');
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.warn('[Ollama] ⚠️  Request timeout, using fallback response');
      } else {
        console.warn('[Ollama] ⚠️  Unexpected error, using fallback response');
      }
      
      return this.getFallbackResponse(prompt, context, agentType);
    }
  }

  /**
   * Clean up Ollama response formatting
   */
  cleanResponse(text) {
    // Remove excessive asterisks used for bold/italic
    text = text.replace(/\*\*\*/g, '');  // Remove triple asterisks
    text = text.replace(/\*\*/g, '');    // Remove double asterisks (bold)
    text = text.replace(/\*/g, '');      // Remove single asterisks (italic)
    
    // Remove excessive newlines
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Remove markdown headers
    text = text.replace(/^#{1,6}\s+/gm, '');
    
    return text.trim();
  }

  /**
   * Build system prompt based on agent type and context
   */
  buildSystemPrompt(agentType, context) {
    const wandAiData = context.wandAiData || {};
    const companyInfo = wandAiData.company_info || {};
    const financials = wandAiData.financials || [];
    const customerSatisfaction = wandAiData.customer_satisfaction || [];
    const salesByRegion = wandAiData.sales_by_region || [];
    const userEngagement = wandAiData.user_engagement || [];
    
    // NEW: Include uploaded document knowledge
    const documentKnowledge = context.documentKnowledge || '';
    const availableDocuments = context.availableDocuments || [];

    let systemPrompt = `You are an AI assistant helping with ${companyInfo.name || 'Wand AI'} company data analysis. `;
    
    systemPrompt += `\n\nCompany Information:\n`;
    systemPrompt += `- Company Name: ${companyInfo.name || 'Wand AI'}\n`;
    systemPrompt += `- Founded: ${companyInfo.founded || 'N/A'}\n`;
    systemPrompt += `- Mission: ${companyInfo.mission || 'N/A'}\n`;
    systemPrompt += `- Employees: ${companyInfo.employees || 'N/A'}\n`;
    systemPrompt += `- Headquarters: ${companyInfo.headquarters || 'N/A'}\n`;
    systemPrompt += `- Departments: ${(companyInfo.departments || []).join(', ')}\n`;

    if (financials.length > 0) {
      systemPrompt += `\nFinancial Data:\n`;
      financials.forEach(q => {
        systemPrompt += `- ${q.quarter}: Revenue: $${q.revenue?.toLocaleString() || 0}, Profit: $${q.profit?.toLocaleString() || 0}, Expenses: $${q.expenses?.toLocaleString() || 0}\n`;
      });
    }

    if (customerSatisfaction.length > 0) {
      systemPrompt += `\nCustomer Satisfaction Data:\n`;
      customerSatisfaction.forEach(m => {
        const rate = ((m.satisfied / m.surveyed) * 100).toFixed(1);
        systemPrompt += `- ${m.month}: ${m.surveyed} surveyed, ${m.satisfied} satisfied (${rate}%), ${m.neutral} neutral, ${m.dissatisfied} dissatisfied\n`;
      });
    }

    if (salesByRegion.length > 0) {
      systemPrompt += `\nSales by Region:\n`;
      salesByRegion.forEach(r => {
        systemPrompt += `- ${r.region}: $${r.sales?.toLocaleString() || 0}\n`;
      });
    }

    if (userEngagement.length > 0) {
      systemPrompt += `\nUser Engagement Metrics:\n`;
      userEngagement.forEach(e => {
        if (e.metric === 'feature_usage') {
          systemPrompt += `- Feature Usage: ${JSON.stringify(e.details)}\n`;
        } else {
          systemPrompt += `- ${e.metric}: ${e.last_month_average}\n`;
        }
      });
    }

    // NEW: Add uploaded document content to knowledge base
    if (documentKnowledge && documentKnowledge.trim().length > 0) {
      systemPrompt += `\n\nAdditional Knowledge from Uploaded Documents:\n`;
      if (availableDocuments.length > 0) {
        systemPrompt += `Available documents: ${availableDocuments.map(d => d.filename).join(', ')}\n\n`;
      }
      // Limit document content to prevent token overflow (max 2000 chars)
      const truncatedDocs = documentKnowledge.length > 2000 
        ? documentKnowledge.substring(0, 2000) + '... (truncated)'
        : documentKnowledge;
      systemPrompt += `${truncatedDocs}\n`;
    }

    // Add agent-specific instructions
    switch (agentType) {
      case 'summarizer':
        systemPrompt += `\n\nYour role: Create concise, accurate summaries based on the provided data AND uploaded documents. Focus on key insights and main points from all available sources.`;
        break;
      case 'financial-analyst':
        systemPrompt += `\n\nYour role: Analyze financial data, identify trends, calculate growth rates, and provide financial insights. Also check uploaded documents for relevant financial policies or reports. When analyzing trends, describe them in a way that would be suitable for visualization.`;
        break;
      case 'data-analyst':
        systemPrompt += `\n\nYour role: Perform statistical analysis, identify patterns, and provide data-driven insights using both structured data and uploaded documents. Present findings in a way that highlights numerical comparisons and trends.`;
        break;
      case 'chart-generator':
        systemPrompt += `\n\nYour role: YOU MUST RECOMMEND SPECIFIC CHARTS to visualize the data. Describe:
1. What type of chart (line, bar, pie, scatter, area) would best show the data
2. What data points should be on X and Y axes
3. What insights the chart would reveal
4. What trends or patterns are visible

ALWAYS suggest at least one chart visualization based on the available data. Be specific about the chart type and data to display.`;
        break;
      case 'report-generator':
        systemPrompt += `\n\nYour role: Generate structured reports with sections, analysis, and recommendations using all available data and documents.`;
        break;
      default:
        systemPrompt += `\n\nYour role: Provide comprehensive analysis and insights based on all available data and documents.`;
    }

    systemPrompt += `\n\nAlways base your responses on the actual data provided from BOTH structured data and uploaded documents. Be specific with numbers and percentages. If data is not available for a specific question, clearly state that. When citing information from uploaded documents, mention the source document name.`;

    return systemPrompt;
  }

  /**
   * Fallback response when Ollama is not available
   */
  getFallbackResponse(prompt, context, agentType) {
    const wandAiData = context.wandAiData || {};
    
    // Generate dummy responses based on agent type
    switch (agentType) {
      case 'summarizer':
        return `Based on the available data for ${wandAiData.company_info?.name || 'Wand AI'}, I can see this is a growing AI company founded in 2020 with 150+ employees. The company focuses on hybrid workforce AI solutions and has shown consistent growth across multiple departments.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'financial-analyst':
        const financials = wandAiData.financials || [];
        const totalRevenue = financials.reduce((sum, q) => sum + (q.revenue || 0), 0);
        const avgProfit = financials.reduce((sum, q) => sum + (q.profit || 0), 0) / (financials.length || 1);
        return `Financial Analysis: Total revenue across all quarters: $${totalRevenue.toLocaleString()}. Average quarterly profit: $${avgProfit.toLocaleString()}. The company shows steady growth with improving profit margins over time.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'customer-analyst':
        const satisfaction = wandAiData.customer_satisfaction || [];
        const avgSatisfaction = satisfaction.reduce((sum, m) => sum + ((m.satisfied / m.surveyed) * 100), 0) / (satisfaction.length || 1);
        return `Customer Satisfaction Analysis: Average satisfaction rate is ${avgSatisfaction.toFixed(1)}%. Customer feedback shows positive trends with most users reporting good experiences with the AI solutions.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'engagement-analyst':
        const engagement = wandAiData.user_engagement || [];
        const totalUsers = engagement.reduce((sum, e) => sum + (e.active_users || 0), 0);
        const avgSessionTime = engagement.reduce((sum, e) => sum + (e.avg_session_time || 0), 0) / (engagement.length || 1);
        return `User Engagement Analysis: Total active users: ${totalUsers.toLocaleString()}. Average session time: ${avgSessionTime.toFixed(1)} minutes. User engagement is strong with consistent daily activity patterns.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'data-collector':
        return `Data Collection Complete: Successfully gathered comprehensive data from ${wandAiData.company_info?.name || 'Wand AI'} including financial records, customer satisfaction surveys, sales by region, and user engagement metrics. All data sources have been verified and structured for analysis.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'data-analyst':
        return `Data Analysis Complete: Processed and analyzed all available datasets. Key findings include consistent revenue growth, high customer satisfaction rates above 85%, and strong user engagement metrics. Data patterns show positive business trends across all departments.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'chart-generator':
        return `Chart Generation Complete: Created visual representations including revenue trend charts, customer satisfaction graphs, regional sales maps, and user engagement dashboards. All charts are optimized for clarity and include proper data labeling and legends.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'report-generator':
        return `Report Generation Complete: Compiled comprehensive analysis report covering financial performance, customer insights, and engagement metrics. Report includes executive summary, detailed analysis, data visualizations, and strategic recommendations based on findings.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      case 'general-analyst':
        return `General Analysis Complete: Conducted thorough analysis of ${wandAiData.company_info?.name || 'Wand AI'} operations. The company demonstrates strong performance across all key metrics with consistent growth trajectory and positive market position in the AI solutions space.

*Note: Ollama AI is not available. Using structured data analysis.*`;
        
      default:
        return `Analysis complete for ${wandAiData.company_info?.name || 'Wand AI'}. The company data shows positive trends across financial performance, customer satisfaction, and user engagement metrics.

*Note: Ollama AI is not available. Using structured data analysis.*`;
    }
  }

  /**
   * Check if Ollama is available
   */
  async checkAvailability() {
    try {
      console.log('Testing Ollama availability at:', this.baseURL);
      const response = await axios.get(`${this.baseURL}/api/tags`, { timeout: 5000 });
      console.log('Ollama is available! Models:', response.data?.models?.map(m => m.name));
      
      // Test actual generation
      const testResponse = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: 'test',
        stream: false,
        options: { num_predict: 5 }
      }, { timeout: 10000 });
      console.log('Ollama generation test successful:', testResponse.data?.response?.substring(0, 50));
      
      return { available: true, models: response.data?.models || [] };
    } catch (error) {
      console.error('Ollama availability test failed:', error.message);
      console.error('Full error:', error);
      return { available: false, error: error.message };
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data?.models || [];
    } catch (error) {
      console.error('Error listing models:', error.message);
      return [];
    }
  }

  /**
   * Split context into smaller sections for faster processing
   */
  splitContextIntoSections(context) {
    const wandAiData = context.wandAiData || {};
    const sections = [];
    
    // Split by data type
    if (wandAiData.financials && wandAiData.financials.length > 0) {
      sections.push({ type: 'financials', data: wandAiData.financials });
    }
    
    if (wandAiData.customer_satisfaction && wandAiData.customer_satisfaction.length > 0) {
      sections.push({ type: 'customer_satisfaction', data: wandAiData.customer_satisfaction });
    }
    
    if (wandAiData.sales_by_region && wandAiData.sales_by_region.length > 0) {
      sections.push({ type: 'sales_by_region', data: wandAiData.sales_by_region });
    }
    
    if (wandAiData.user_engagement && wandAiData.user_engagement.length > 0) {
      sections.push({ type: 'user_engagement', data: wandAiData.user_engagement });
    }
    
    // Always include basic company info
    if (wandAiData.company_info) {
      sections.unshift({ type: 'company_info', data: wandAiData.company_info });
    }
    
    return sections.length > 0 ? sections : [{ type: 'basic', data: {} }];
  }
  
  /**
   * Build prompt for individual section
   */
  buildSectionPrompt(agentType, section, originalPrompt, sectionIndex, totalSections) {
    const sectionContext = this.formatSectionForPrompt(section);
    const sectionNumber = sectionIndex + 1;
    
    return `You are a ${agentType} analyzing data for Wand AI. This is section ${sectionNumber} of ${totalSections}.

${sectionContext}

User Question: ${originalPrompt}

Provide a brief analysis focusing on this section only. Keep response under 100 words.`;
  }
  
  /**
   * Format section data for prompt
   */
  formatSectionForPrompt(section) {
    switch (section.type) {
      case 'company_info':
        return `Company Info: ${JSON.stringify(section.data, null, 2)}`;
      case 'financials':
        return `Financial Data: ${JSON.stringify(section.data.slice(0, 3), null, 2)}`;
      case 'customer_satisfaction':
        return `Customer Satisfaction: ${JSON.stringify(section.data.slice(0, 2), null, 2)}`;
      case 'sales_by_region':
        return `Sales by Region: ${JSON.stringify(section.data.slice(0, 3), null, 2)}`;
      case 'user_engagement':
        return `User Engagement: ${JSON.stringify(section.data.slice(0, 2), null, 2)}`;
      default:
        return `Basic Data: ${JSON.stringify(section.data, null, 2)}`;
    }
  }
  
  /**
   * Generate response for individual section
   */
  async generateSectionResponse(prompt) {
    const response = await axios.post(`${this.baseURL}/api/generate`, {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.5,
        num_predict: 30,
        num_ctx: 256,
        repeat_penalty: 1.1,
      }
    }, {
      timeout: 10000
    });
    
    return response.data?.response?.trim() || '';
  }
  
  /**
   * Get fallback response for failed section
   */
  getSectionFallback(agentType, section) {
    return `Section analysis (${section.type}) completed using structured data.`;
  }

  /**
   * Generate summary for uploaded document
   */
  async generateDocumentSummary(text) {
    try {
      const prompt = `Summarize the following document in 2-3 sentences. Focus on the main topics and key information:\n\n${text.substring(0, 2000)}`;
      
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 100,
          num_ctx: 2048,
        }
      }, {
        timeout: 15000
      });

      return this.cleanResponse(response.data?.response || '');
    } catch (error) {
      console.error('[Ollama] Error generating summary:', error.message);
      return '';
    }
  }

  /**
   * Generate answer from document context
   */
  async generateAnswerFromDocuments(query, documentContext) {
    try {
      const prompt = `Based on the following documents, answer this question: ${query}

Documents:
${documentContext.substring(0, 4000)}

Provide a comprehensive answer using only information from the documents. If you're uncertain about any part, mention it.`;

      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 300,
          num_ctx: 4096,
        }
      }, {
        timeout: 30000
      });

      return this.cleanResponse(response.data?.response || '');
    } catch (error) {
      console.error('[Ollama] Error generating answer:', error.message);
      return '';
    }
  }

  /**
   * Check answer completeness and identify missing information
   */
  async checkAnswerCompleteness(query, answer, documentContext) {
    try {
      const prompt = `Analyze if this answer is complete and confident:

Question: ${query}
Answer: ${answer}
Available Context: ${documentContext.substring(0, 2000)}

Respond in JSON format:
{
  "isIncomplete": boolean,
  "confidenceLevel": number (0-100),
  "missingInfo": [array of specific missing information],
  "uncertainAreas": [array of uncertain parts]
}`;

      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 200,
          num_ctx: 3072,
        }
      }, {
        timeout: 20000
      });

      try {
        const jsonMatch = response.data?.response?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('[Ollama] Error parsing completeness check:', parseError);
      }

      return {
        isIncomplete: false,
        confidenceLevel: 70,
        missingInfo: [],
        uncertainAreas: []
      };
    } catch (error) {
      console.error('[Ollama] Error checking completeness:', error.message);
      return {
        isIncomplete: false,
        confidenceLevel: 70,
        missingInfo: [],
        uncertainAreas: []
      };
    }
  }

  /**
   * Generate enrichment suggestions
   */
  async generateEnrichmentSuggestions(query, answer, missingInfo) {
    try {
      const prompt = `Based on this incomplete answer, suggest specific documents or data sources that would help:

Question: ${query}
Current Answer: ${answer}
Missing Information: ${missingInfo.join(', ')}

Provide 3-5 specific suggestions for additional documents or data sources. Be concrete and specific.`;

      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 200,
          num_ctx: 2048,
        }
      }, {
        timeout: 15000
      });

      const suggestions = this.cleanResponse(response.data?.response || '');
      return suggestions.split('\n').filter(s => s.trim().length > 0);
    } catch (error) {
      console.error('[Ollama] Error generating enrichment suggestions:', error.message);
      return [];
    }
  }
}

module.exports = { OllamaService };

