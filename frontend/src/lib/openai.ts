import OpenAI from 'openai'

// Check OpenAI configuration
const openaiApiKey = process.env.OPENAI_API_KEY
console.log('🔧 OpenAI Configuration:')
console.log('  OPENAI_API_KEY:', openaiApiKey ? '✅ SET' : '❌ NOT SET')

if (!openaiApiKey) {
  console.warn('⚠️ OpenAI API key not set. Please add OPENAI_API_KEY to your .env.local file')
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
})

export { openai }

// Embedding function for RAG
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  })
  
  return response.data[0].embedding
}

// Chat completion for the chatbot
export async function getChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  temperature: number = 0.2
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature,
    max_tokens: 1000,
  })
  
  return response.choices[0].message.content || ''
}
