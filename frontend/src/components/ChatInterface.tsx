'use client'

import { useState, useRef, useEffect } from 'react'
import { UserProfile, Message, CourseRecommendation } from '@/lib/types'
import MessageBubble from './MessageBubble'
import CourseRecommendations from './CourseRecommendations'
import ThemeToggle from './ThemeToggle'

interface ChatInterfaceProps {
  user: any
  profile: UserProfile
  onProfileUpdate?: (profile: UserProfile) => void
}

export default function ChatInterface({ user, profile, onProfileUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [usedWebSearch, setUsedWebSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const startNewChat = () => {
    setMessages([])
    setRecommendations([])
    setSources([])
    setUsedWebSearch(false)
    setInput('')
    
    // Create a new session ID
    const newSessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    setSessionId(newSessionId)
  }

  // Create new session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.user_id })
        })
        const data = await response.json()
        setSessionId(data.sessionId)
      } catch (error) {
        // If API fails, generate a proper UUID for the session
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
        setSessionId(uuid)
      }
    }
    createSession()
  }, [profile.user_id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionId || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      session_id: sessionId,
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Add a small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('🔍 Profile object:', profile)
      console.log('🔍 Profile ID:', (profile as any)?.id, 'Profile user_id:', profile?.user_id)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          userId: (profile as any)?.id || profile?.user_id
        })
      })

      const data = await response.json()

      console.log('📥 Frontend received:', {
        responseLength: data.response?.length,
        recommendationsCount: data.recommendations?.length,
        recommendations: data.recommendations?.map((r: any) => ({ id: r.course?.id, title: r.course?.title, score: r.score }))
      })

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          session_id: sessionId,
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString(),
          citations: data.sources?.map((url: string) => ({ url, text: '' })) || []
        }

        setMessages(prev => [...prev, assistantMessage])
        setRecommendations(data.recommendations || [])
        setSources(data.sources || [])
        setUsedWebSearch(data.used_web_search || false)
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        session_id: sessionId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "What electives should I take for robotics?",
    "Show me courses that count toward the AI option",
    "What are good 2A electives?",
    "Help me plan my 3B term"
  ]

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Fixed Header - Full Width */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Elective Advisor</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask me about courses, options, and academic planning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.username}!</span>
            <ThemeToggle />
            <button
              onClick={startNewChat}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span>💬</span>
              New Chat
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('currentUser')
                window.location.href = '/login'
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">Welcome to your elective advisor!</p>
                <p className="mb-6 text-gray-500 dark:text-gray-400">I can help you find the best electives based on your goals and program.</p>
                <div className="space-y-2 max-w-md mx-auto">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Try asking:</p>
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="block w-full text-left px-4 py-3 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex space-x-3">
              <button
                type="button"
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
                disabled={loading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

            {/* Recommendations Panel - Aligned with Chat */}
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
              <div className="p-4">
                <CourseRecommendations 
                  recommendations={recommendations}
                  sources={sources}
                  usedWebSearch={usedWebSearch}
                />
              </div>
            </div>
      </div>
    </div>
  )
}
