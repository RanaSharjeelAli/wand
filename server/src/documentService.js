const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { OllamaService } = require('./ollamaService');

class DocumentService {
  constructor(sqliteStorage) {
    this.storage = sqliteStorage;
    this.ollamaService = new OllamaService();
    this.documentsDir = path.join(__dirname, '../data/documents');
    this.ensureDocumentsDirectory();
  }

  ensureDocumentsDirectory() {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  async extractTextFromFile(filePath, mimeType) {
    try {
      if (mimeType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } else if (mimeType === 'text/plain') {
        return fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('[DocumentService] Text extraction error:', error);
      throw error;
    }
  }

  async processDocument(file, userId = 'default-user') {
    const docId = uuidv4();
    const timestamp = new Date().toISOString();
    
    try {
      // Save file to disk
      const fileExtension = path.extname(file.originalname);
      const savedFileName = `${docId}${fileExtension}`;
      const savedFilePath = path.join(this.documentsDir, savedFileName);
      
      fs.writeFileSync(savedFilePath, file.buffer);
      
      // Extract text content
      const textContent = await this.extractTextFromFile(savedFilePath, file.mimetype);
      
      // Generate embeddings/chunks for better search
      const chunks = this.chunkText(textContent);
      
      // Generate summary using Ollama
      const summary = await this.generateSummary(textContent);
      
      // Store document metadata and content
      const document = {
        id: docId,
        userId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        savedPath: savedFilePath,
        textContent,
        chunks,
        summary,
        uploadedAt: timestamp,
        lastAccessedAt: timestamp
      };
      
      this.storage.addDocument(document);
      
      console.log(`[DocumentService] Processed document: ${file.originalname}`);
      
      return {
        id: docId,
        filename: file.originalname,
        summary,
        size: file.size,
        uploadedAt: timestamp
      };
      
    } catch (error) {
      console.error('[DocumentService] Error processing document:', error);
      throw error;
    }
  }

  chunkText(text, chunkSize = 500, overlap = 50) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push({
        id: uuidv4(),
        text: chunk,
        position: i,
        length: chunk.length
      });
    }
    
    return chunks;
  }

  async generateSummary(text) {
    try {
      // Limit text to first 2000 characters for summary
      const truncatedText = text.substring(0, 2000);
      
      const prompt = `Please provide a concise summary (2-3 sentences) of the following document:\n\n${truncatedText}`;
      
      const summary = await this.ollamaService.generateResponse(prompt, 'summarizer');
      return summary || 'Document summary unavailable.';
    } catch (error) {
      console.error('[DocumentService] Summary generation failed:', error);
      return 'Document summary unavailable.';
    }
  }

  async searchDocuments(query, userId = 'default-user') {
    try {
      // Get all user documents
      const documents = this.storage.getUserDocuments(userId);
      
      if (!documents || documents.length === 0) {
        return {
          answer: 'No documents found in your knowledge base. Please upload documents first.',
          sources: [],
          confidence: 0,
          hasGaps: true,
          enrichmentSuggestions: ['Upload relevant documents to build your knowledge base.']
        };
      }
      
      // Search for relevant chunks across all documents
      const relevantChunks = this.findRelevantChunks(query, documents);
      
      if (relevantChunks.length === 0) {
        return {
          answer: 'No relevant information found in your documents.',
          sources: [],
          confidence: 0.2,
          hasGaps: true,
          enrichmentSuggestions: [
            `Upload documents related to: "${query}"`,
            'Add more detailed documentation covering this topic',
            'Consider uploading FAQs or user guides related to this query'
          ]
        };
      }
      
      // Generate AI answer using relevant context
      const answer = await this.generateAnswer(query, relevantChunks);
      
      // Analyze confidence and gaps
      const analysis = this.analyzeAnswerQuality(query, relevantChunks, answer);
      
      return {
        answer: answer.text,
        sources: relevantChunks.map(c => ({
          documentId: c.documentId,
          filename: c.filename,
          snippet: c.text.substring(0, 200) + '...',
          relevance: c.score
        })),
        confidence: analysis.confidence,
        hasGaps: analysis.hasGaps,
        enrichmentSuggestions: analysis.suggestions,
        relatedTopics: this.extractRelatedTopics(relevantChunks)
      };
      
    } catch (error) {
      console.error('[DocumentService] Search error:', error);
      throw error;
    }
  }

  findRelevantChunks(query, documents, topK = 5) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
    
    const scoredChunks = [];
    
    documents.forEach(doc => {
      if (!doc.chunks) return;
      
      doc.chunks.forEach(chunk => {
        const chunkLower = chunk.text.toLowerCase();
        
        // Simple keyword-based scoring (can be improved with embeddings)
        let score = 0;
        
        // Exact phrase match gets highest score
        if (chunkLower.includes(queryLower)) {
          score += 10;
        }
        
        // Individual word matches
        queryWords.forEach(word => {
          if (chunkLower.includes(word)) {
            score += 2;
          }
        });
        
        // Boost score if multiple query words appear close together
        const positions = queryWords.map(word => chunkLower.indexOf(word)).filter(p => p >= 0);
        if (positions.length > 1) {
          const maxDistance = Math.max(...positions) - Math.min(...positions);
          if (maxDistance < 100) {
            score += 3;
          }
        }
        
        if (score > 0) {
          scoredChunks.push({
            ...chunk,
            documentId: doc.id,
            filename: doc.filename,
            score
          });
        }
      });
    });
    
    // Sort by score and return top K
    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async generateAnswer(query, relevantChunks) {
    try {
      const context = relevantChunks
        .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.filename}]\n${chunk.text}`)
        .join('\n\n---\n\n');
      
      const prompt = `Based on the following context from uploaded documents, please answer this question: "${query}"

Context:
${context}

Instructions:
- Provide a clear, direct answer based ONLY on the information in the context
- If the context doesn't contain enough information, explicitly state what's missing
- Cite which source(s) you're using (e.g., "According to Source 1...")
- Be concise but thorough

Answer:`;
      
      const response = await this.ollamaService.generateResponse(prompt, 'general-analyst');
      
      return {
        text: response || 'Unable to generate answer at this time.',
        tokensUsed: response.length
      };
      
    } catch (error) {
      console.error('[DocumentService] Answer generation failed:', error);
      return {
        text: 'Error generating answer. Please try again.',
        tokensUsed: 0
      };
    }
  }

  analyzeAnswerQuality(query, chunks, answer) {
    const answerLower = answer.text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    let confidence = 0.5; // Base confidence
    let hasGaps = false;
    const suggestions = [];
    
    // Check if answer indicates uncertainty
    const uncertaintyPhrases = [
      'i don\'t have',
      'not enough information',
      'cannot find',
      'unclear',
      'missing',
      'insufficient',
      'unable to determine'
    ];
    
    const hasUncertainty = uncertaintyPhrases.some(phrase => answerLower.includes(phrase));
    
    if (hasUncertainty) {
      confidence = 0.3;
      hasGaps = true;
      suggestions.push('Upload more documents with detailed information about this topic');
    }
    
    // Check chunk relevance scores
    const avgRelevance = chunks.reduce((sum, c) => sum + c.score, 0) / chunks.length;
    if (avgRelevance < 5) {
      confidence *= 0.7;
      hasGaps = true;
      suggestions.push('Current documents have low relevance. Upload more specific documents.');
    }
    
    // Check answer length (too short might indicate insufficient info)
    if (answer.text.length < 100) {
      confidence *= 0.8;
      hasGaps = true;
      suggestions.push('Answer is brief. Consider adding more comprehensive documentation.');
    }
    
    // Check if only 1-2 sources were used
    if (chunks.length < 3) {
      hasGaps = true;
      suggestions.push('Limited sources found. Upload additional documents for cross-validation.');
    }
    
    // Boost confidence for good indicators
    if (chunks.length >= 4) confidence += 0.1;
    if (avgRelevance > 8) confidence += 0.2;
    if (answer.text.length > 200) confidence += 0.1;
    
    // Cap confidence
    confidence = Math.min(0.95, Math.max(0.1, confidence));
    
    // Generic enrichment suggestions
    if (suggestions.length === 0 && confidence < 0.7) {
      suggestions.push('Consider uploading additional reference materials');
      suggestions.push('Add documentation with examples and use cases');
    }
    
    return {
      confidence: Math.round(confidence * 100) / 100,
      hasGaps,
      suggestions: suggestions.length > 0 ? suggestions : ['Knowledge base looks good!']
    };
  }

  extractRelatedTopics(chunks) {
    // Extract key terms that appear frequently
    const allText = chunks.map(c => c.text).join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(w => w.length > 5);
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get top frequent words as related topics
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  deleteDocument(docId, userId = 'default-user') {
    try {
      const doc = this.storage.getDocument(docId);
      
      if (!doc || doc.userId !== userId) {
        throw new Error('Document not found or access denied');
      }
      
      // Delete file from disk
      if (fs.existsSync(doc.savedPath)) {
        fs.unlinkSync(doc.savedPath);
      }
      
      // Delete from database
      this.storage.deleteDocument(docId);
      
      console.log(`[DocumentService] Deleted document: ${doc.filename}`);
      return true;
      
    } catch (error) {
      console.error('[DocumentService] Delete error:', error);
      throw error;
    }
  }

  getAllDocuments(userId = 'default-user') {
    return this.storage.getUserDocuments(userId).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      summary: doc.summary,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      mimeType: doc.mimeType
    }));
  }
}

module.exports = { DocumentService };
