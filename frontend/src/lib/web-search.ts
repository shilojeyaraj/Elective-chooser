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

// Fallback web search when database doesn't have information
export async function searchWaterlooWebsite(
  query: string,
  maxResults: number = 5
): Promise<WebSearchResult[]> {
  // In a real implementation, you would use:
  // - Tavily API
  // - Bing Search API
  // - Google Custom Search API
  // - Or scrape with proper rate limiting and respect for robots.txt
  
  // For now, return mock results
  const mockResults: WebSearchResult[] = [
    {
      title: `Waterloo Engineering - ${query}`,
      url: `https://uwaterloo.ca/engineering/undergraduate-studies/${query.toLowerCase().replace(/\s+/g, '-')}`,
      content: `Information about ${query} in Waterloo Engineering programs. This is a mock result for demonstration.`,
      relevance_score: 0.9
    }
  ]
  
  return mockResults.slice(0, maxResults)
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
  // 2. Low confidence in results
  // 3. Query contains specific course codes or terms not found
  
  if (dbResults.length === 0) {
    return true
  }
  
  // Check for specific course codes (e.g., "ECE486", "MTE380")
  const courseCodePattern = /[A-Z]{2,4}\s*\d{3,4}/i
  if (courseCodePattern.test(query) && dbResults.length < 3) {
    return true
  }
  
  // Check for low confidence (if we had confidence scores)
  // This would be implemented based on your specific confidence metrics
  
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
  
  // Web search disabled for now to avoid 404 errors
  // if (shouldTriggerWebSearch(dbResults, query)) {
  //   webResults = await searchWaterlooWebsite(query)
  //   
  //   if (webResults.length > 0) {
  //     // Process and store web results
  //     await processWebSearchResults(query, webResults)
  //     usedWebSearch = true
  //     
  //     // Re-search database with newly added content
  //     const newDbResults = await searchCourses(query, filters)
  //     dbResults.push(...newDbResults)
  //   }
  // }
  
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

