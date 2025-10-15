import OpenAI from 'openai'

// vLLM Configuration
const VLLM_BASE_URL = process.env.VLLM_BASE_URL || 'http://localhost:8000/v1'
const VLLM_API_KEY = process.env.VLLM_API_KEY || 'local-anything' // vLLM accepts any key for local deployment
const VLLM_MODEL = process.env.VLLM_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct'

console.log('🔧 vLLM Configuration:')
console.log('  VLLM_BASE_URL:', VLLM_BASE_URL)
console.log('  VLLM_MODEL:', VLLM_MODEL)
console.log('  VLLM_API_KEY:', VLLM_API_KEY ? '✅ SET' : '❌ NOT SET')

// Create OpenAI-compatible client pointing to vLLM
const vllmClient = new OpenAI({
  baseURL: VLLM_BASE_URL,
  apiKey: VLLM_API_KEY,
})

export { vllmClient }

// Embedding function for RAG (you'll need a separate embedding model)
export async function getEmbedding(text: string): Promise<number[]> {
  // For now, we'll use a simple embedding approach
  // You can replace this with a local embedding model like sentence-transformers
  const response = await vllmClient.embeddings.create({
    model: 'text-embedding-3-large', // Replace with your embedding model
    input: text,
  })
  
  return response.data[0].embedding
}

// Chat completion using vLLM
export async function getChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  temperature: number = 0.2,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const response = await vllmClient.chat.completions.create({
      model: VLLM_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens
    })
    
    return response.choices[0].message.content || ''
  } catch (error) {
    console.error('❌ vLLM API Error:', error)
    throw new Error(`vLLM API Error: ${error}`)
  }
}

// Health check for vLLM server
export async function checkVLLMHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${VLLM_BASE_URL}/models`)
    return response.ok
  } catch (error) {
    console.error('❌ vLLM Health Check Failed:', error)
    return false
  }
}
