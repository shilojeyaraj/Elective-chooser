'use client'

import { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {message.citations && message.citations.length > 0 && (
          <div className={`mt-3 pt-3 border-t ${isUser ? 'border-white/20' : 'border-gray-300 dark:border-gray-600'}`}>
            <p className={`text-xs font-medium mb-2 ${isUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>Sources:</p>
            <div className="space-y-1">
              {message.citations.map((citation, index) => (
                <a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs block truncate underline ${
                    isUser 
                      ? 'text-purple-300 hover:text-purple-200' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  {citation.url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
