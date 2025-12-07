# Ollama Integration Setup

This project uses Ollama for AI-powered responses. Follow these steps to set it up:

## Prerequisites

1. **Install Ollama**: Download and install Ollama from [https://ollama.ai](https://ollama.ai)

2. **Start Ollama**: Make sure Ollama is running on your system
   ```bash
   ollama serve
   ```

3. **Pull a Model**: Download a model (recommended: llama3.2 or llama3.1)
   ```bash
   ollama pull llama3.2
   ```
   
   Other good options:
   - `ollama pull llama3.1` (larger, more capable)
   - `ollama pull mistral` (fast and efficient)
   - `ollama pull phi3` (lightweight)

## Configuration

The system uses environment variables for configuration:

- `OLLAMA_URL`: Ollama API endpoint (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model to use (default: `llama3.2`)

You can set these in a `.env` file or as environment variables:

```bash
export OLLAMA_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.2
```

## How It Works

1. **Data Loading**: The system loads `wand_ai.json` which contains:
   - Company information
   - Financial data
   - Customer satisfaction metrics
   - Sales by region
   - User engagement data

2. **Query Processing**: When a user submits a query:
   - The system determines which agents are needed
   - Each agent extracts relevant structured data from `wand_ai.json`
   - Ollama receives the user's question + all relevant context data
   - Ollama generates a natural language response based on the data

3. **Response Generation**: 
   - Structured data (charts, metrics) is generated from the JSON
   - Natural language responses (summaries, analysis) come from Ollama
   - Both are combined for comprehensive answers

## Testing

1. Start the server:
   ```bash
   cd server
   npm start
   ```

2. Check if Ollama is detected (you should see a success message in the console)

3. Submit a query through the web interface and see Ollama-powered responses!

## Troubleshooting

**Ollama not detected?**
- Make sure Ollama is running: `ollama serve`
- Check if the model is installed: `ollama list`
- Verify the URL is correct (default: http://localhost:11434)

**Slow responses?**
- Try a smaller/faster model like `phi3` or `mistral`
- Reduce the model size if using a large model
- Check your system resources

**Model not found?**
- Pull the model: `ollama pull llama3.2`
- Or change the model in environment variables to one you have installed

## Fallback Behavior

If Ollama is not available, the system will:
- Still use structured data from `wand_ai.json`
- Provide basic responses without AI-generated text
- Continue to function, just without AI enhancement

