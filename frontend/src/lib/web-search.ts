import { getEmbedding } from './openai'
import { supabaseAdmin } from './supabase'
import { searchCourses } from './search'

// Web search interface
export interface WebSearchResult {
  title: string
  url: string
  content: string
  relevance_score: number
}

// Tavily web search implementation
export async function searchWaterlooWebsite(
  query: string,
  maxResults: number = 5
): Promise<WebSearchResult[]> {
  const tavilyApiKey = process.env.TAVILY_API_KEY
  
  if (!tavilyApiKey) {
    console.warn('Tavily API key not found, skipping web search')
    return []
  }
  
  try {
    // Focus search on Waterloo Engineering domain
    const searchQuery = `${query} site:uwaterloo.ca/engineering`
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyApiKey}`
      },
      body: JSON.stringify({
        query: searchQuery,
        search_depth: 'basic',
        include_answer: true,
        include_images: false,
        include_raw_content: false,
        max_results: maxResults,
        include_domains: ['uwaterloo.ca'],
        exclude_domains: ['uwaterloo.ca/calendar', 'uwaterloo.ca/undergraduate-students/course-catalog']
      })
    })
    
    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Convert Tavily results to our format
    const results: WebSearchResult[] = data.results?.map((result: any) => ({
      title: result.title || 'No title',
      url: result.url || '',
      content: result.content || result.raw_content || '',
      relevance_score: result.score || 0.5
    })) || []
    
    console.log(`🔍 Tavily search found ${results.length} results for: ${query}`)
    return results
    
  } catch (error) {
    console.error('Tavily search error:', error)
    return []
  }
}

// Extract and clean text from web pages
export async function extractWebPageContent(url: string): Promise<string> {
  try {
    // In a real implementation, you would:
    // 1. Fetch the URL with proper headers
    // 2. Use trafilatura or similar to extract clean text
    // 3. Handle different content types (HTML, PDF, etc.)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Waterloo Elective Chooser Bot 1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // Simple text extraction - in reality, use trafilatura
    const text = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    return text
  } catch (error) {
    console.error(`Failed to extract content from ${url}:`, error)
    return ''
  }
}

// Process web search results and store relevant chunks
export async function processWebSearchResults(
  query: string,
  results: WebSearchResult[]
): Promise<void> {
  for (const result of results) {
    try {
      const content = await extractWebPageContent(result.url)
      
      if (content.length < 100) {
        continue // Skip if content is too short
      }
      
      // Chunk the content
      const chunks = chunkText(content, 1000, 150)
      
      // Store each chunk with embedding
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embedding = await getEmbedding(chunk)
        
        await supabaseAdmin
          .from('elective_docs')
          .insert({
            text: chunk,
            source_url: result.url,
            chunk_id: i,
            embedding: embedding
          })
      }
    } catch (error) {
      console.error(`Failed to process result ${result.url}:`, error)
    }
  }
}

// Check if we should trigger web search
export function shouldTriggerWebSearch(
  dbResults: any[],
  query: string
): boolean {
  // Trigger web search if:
  // 1. No database results
  // 2. Very few results (less than 3)
  // 3. Query contains specific course codes or terms not found
  // 4. Query is asking about options/specializations
  // 5. Query contains "requirements", "prerequisites", "details"
  
  if (dbResults.length === 0) {
    console.log('🔍 Triggering web search: No database results')
    return true
  }
  
  if (dbResults.length < 3) {
    console.log('🔍 Triggering web search: Few database results')
    return true
  }
  
  // Check for specific course codes (e.g., "ECE486", "MTE380")
  const courseCodePattern = /[A-Z]{2,4}\s*\d{3,4}/i
  if (courseCodePattern.test(query) && dbResults.length < 3) {
    console.log('🔍 Triggering web search: Course code query with few results')
    return true
  }
  
  // Check for options/specializations queries
  const optionsKeywords = ['option', 'specialization', 'specializations', 'track', 'concentration']
  if (optionsKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
    console.log('🔍 Triggering web search: Options/specializations query')
    return true
  }
  
  // Check for detailed information requests
  const detailKeywords = ['requirements', 'prerequisites', 'details', 'description', 'syllabus', 'outline']
  if (detailKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
    console.log('🔍 Triggering web search: Detailed information request')
    return true
  }
  
  // Additional check: if we have very few results, trigger web search
  if (dbResults.length < 2) {
    console.log('🔍 Triggering web search: Very few database results')
    return true
  }
  
  return false
}

// Enhanced search that combines database and web search
 export async function enhancedSearch(
  query: string,
  filters: any = {}
): Promise<{
  results: any[]
  sources: string[]
  used_web_search: boolean
}> {
  // First, try database search
  const dbResults = await searchCourses(query, filters)
  
  let webResults: WebSearchResult[] = []
  let usedWebSearch = false
  
  // Enable web search when database results are insufficient
  if (shouldTriggerWebSearch(dbResults, query)) {
    console.log('🌐 Triggering Tavily web search for better results')
    webResults = await searchWaterlooWebsite(query)
    
    if (webResults.length > 0) {
      console.log(`🌐 Found ${webResults.length} web results, processing...`)
      // Process and store web results
      await processWebSearchResults(query, webResults)
      usedWebSearch = true
      
      // Re-search database with newly added content
      const newDbResults = await searchCourses(query, filters)
      dbResults.push(...newDbResults)
      console.log(`📚 After web search: ${dbResults.length} total database results`)
    }
  }
  
  // Combine and deduplicate results
  const allResults = [...dbResults]
  const sources = [
    ...new Set([
      ...dbResults.map(r => r.source_url).filter(Boolean) as string[],
      ...webResults.map(r => r.url).filter(Boolean) as string[]
    ])
  ]
  
  return {
    results: allResults,
    sources,
    used_web_search: usedWebSearch
  }
}

// Helper function to chunk text
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 150): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > start + chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1)
      }
    }
    
    chunks.push(chunk.trim())
    start = start + chunk.length - overlap
  }
  
  return chunks.filter(chunk => chunk.length > 50)
}

