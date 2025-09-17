'use client'

import { useState, useRef, useEffect } from 'react'
import { UserProfile, Message, CourseRecommendation } from '@/lib/types'
import MessageBubble from './MessageBubble'
import CourseRecommendations from './CourseRecommendations'

interface ChatInterfaceProps {
  profile: UserProfile
}

export default function ChatInterface({ profile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [usedWebSearch, setUsedWebSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          userId: profile.user_id
        })
      })

      const data = await response.json()

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
    <div className="flex h-[calc(100vh-8rem)] bg-chat-dark rounded-lg shadow-2xl overflow-hidden border border-chat-gray">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-chat-gray border-b border-chat-light p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-chat-dark font-bold text-sm">UI</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Elective Advisor</h2>
              <p className="text-sm text-chat-muted">
                Ask me about courses, options, and academic planning
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-darker">
          {messages.length === 0 && (
            <div className="text-center text-chat-muted py-8">
              <div className="w-16 h-16 bg-chat-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-lg font-medium text-white mb-4">Welcome to your elective advisor!</p>
              <p className="mb-6 text-chat-muted">I can help you find the best electives based on your goals and program.</p>
              <div className="space-y-2 max-w-md mx-auto">
                <p className="text-sm font-medium text-white">Try asking:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="block w-full text-left px-4 py-3 text-sm bg-chat-gray hover:bg-chat-light rounded-lg transition-colors text-white border border-chat-light"
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
              <div className="bg-chat-gray rounded-2xl p-4 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-chat-muted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-chat-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-chat-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-chat-gray bg-chat-dark">
          <div className="flex space-x-3">
            <button
              type="button"
              className="w-10 h-10 bg-chat-gray hover:bg-chat-light rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-chat-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 px-4 py-3 bg-chat-gray border border-chat-light rounded-full text-white placeholder-chat-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Recommendations Panel */}
      <div className="w-96 border-l border-chat-gray bg-chat-dark overflow-y-auto">
        <CourseRecommendations 
          recommendations={recommendations}
          sources={sources}
          usedWebSearch={usedWebSearch}
        />
      </div>
    </div>
  )
}
