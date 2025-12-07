# Wand AI - Multi-Agent Task Solver

> AI-powered multi-agent system with knowledge base integration, real-time chat, and intelligent data visualization.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Ollama with llama3.2 model
- SQLite3

### Installation

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Start Ollama (in separate terminal)
ollama serve
ollama pull llama3.2

# Start backend server
cd server && npm start

# Start frontend (in new terminal)
cd client && npm start
```

video demo: `https://www.loom.com/share/2331526be8d94aa894202681704d20d4`

## ✨ Features

### Multi-Agent Task Processing
- **8 Specialized AI Agents**: Financial analyst, data analyst, chart generator, summarizer, customer analyst, engagement analyst, data collector, report generator
- **Intelligent Routing**: Automatically selects optimal agents for each task
- **Real-time Progress**: Watch agents work with live status updates via WebSocket
- **Ollama Integration**: Powered by llama3.2 for natural language processing

### Knowledge Base & Search
- **Document Upload**: PDF, DOCX, DOC, TXT files (10MB max)
- **Full-text Search**: Fast document search with relevance scoring
- **AI Summarization**: Automatic document summaries
- **Context-aware Answers**: AI generates answers from uploaded documents
- **Confidence Scoring**: Answer completeness rating (0-100)
- **Enrichment Suggestions**: Identifies missing information

### Authentication & User Management
- **JWT Authentication**: Secure login/signup with bcrypt password hashing
- **User Isolation**: Each user sees only their own chats and documents
- **Session Persistence**: 7-day token expiry with auto-login
- **Protected Routes**: All API endpoints secured with auth middleware

### Chat & Visualization
- **Persistent Chat History**: All conversations saved with auto-generated titles
- **Dynamic Charts**: Line, bar, and pie charts with Chart.js
- **Export Options**: Download chats as PDF or DOCX
- **Collapsible Sidebar**: Clean interface with chat history
- **Smooth Animations**: Framer Motion for professional UX

## 🏗️ Architecture

### Tech Stack
**Frontend**: React, Redux Toolkit, Material-UI, Chart.js, Socket.IO Client, Framer Motion  
**Backend**: Express, Socket.IO, SQLite, Ollama, JWT, bcrypt, Axios  
**AI/ML**: Ollama (llama3.2), Natural language processing, Multi-agent orchestration

### Project Structure
```
wand-main/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom hooks (socket, API)
│   │   └── store/       # Redux store
├── server/              # Express backend
│   ├── src/
│   │   ├── agents.js    # Multi-agent logic
│   │   ├── ollamaService.js  # Ollama integration
│   │   ├── authService.js    # JWT authentication
│   │   └── documentService.js # Document processing
│   └── data/            # SQLite database
└── wand_ai.json         # Company data for analysis
```

## 🤖 Available Agents

| Agent | Purpose |
|-------|---------|
| `summarizer` | Concise summaries (90%) |
| `financial-analyst` | Financial analysis (88%) |
| `data-analyst` | Statistical analysis (92%) |
| `chart-generator` | Chart specs (80%) |
| `customer-analyst` | Customer satisfaction (85%) |
| `engagement-analyst` | User engagement (85%) |
| `data-collector` | Data gathering (75%) |
| `report-generator` | Reports (87%) |

## 💡 Example Queries

- "Summarize the last 3 quarters' financial trends and create a chart"
- "Analyze customer satisfaction data from last month"
- "Show me sales performance by region"

## 🔧 Configuration

**Ollama**: Ensure running with llama3.2 (`ollama serve` then `ollama pull llama3.2`)  
**Ports**: Server on 5001, client on 3000  
**Config files**: `server/src/index.js`, `client/src/hooks/useSocket.js`

## 📊 Database Schema

**Users**: userId, email, passwordHash, createdAt  
**Chats**: chatId, userId, title, createdAt  
**Messages**: messageId, chatId, text, isUser, timestamp, agents, results  
**Documents**: documentId, userId, filename, content, summary

## 🚨 Troubleshooting

**Ollama timeout errors**: Timeout increased to 60s in `ollamaService.js`  
**Auth issues**: Check JWT token in localStorage  
**Socket connection fails**: Verify backend is running on port 5001  
**Chart not displaying**: Ensure results contain `chartData` property
