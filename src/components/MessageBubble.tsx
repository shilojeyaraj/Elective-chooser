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
            ? 'bg-blue-600 text-white'
            : 'bg-chat-gray text-white'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs font-medium mb-2 text-white/80">Sources:</p>
            <div className="space-y-1">
              {message.citations.map((citation, index) => (
                <a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200 block truncate underline"
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
