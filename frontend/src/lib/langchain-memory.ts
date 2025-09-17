import { BaseChatMessageHistory } from '@langchain/core/chat_history'
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { supabase } from './supabase'

export class SupabaseChatMessageHistory extends BaseChatMessageHistory {
  public sessionId: string
  public userId: string

  constructor(sessionId: string, userId: string) {
    super()
    this.sessionId = sessionId
    this.userId = userId
  }

  async getMessages(): Promise<BaseMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return (data || []).map(msg => {
      switch (msg.role) {
        case 'user':
          return new HumanMessage(msg.content)
        case 'assistant':
          return new AIMessage(msg.content)
        case 'system':
          return new SystemMessage(msg.content)
        default:
          return new HumanMessage(msg.content)
      }
    })
  }

  async addMessage(message: BaseMessage): Promise<void> {
    const role = message._getType() === 'human' ? 'user' : 
                 message._getType() === 'ai' ? 'assistant' : 'system'
    
    const { error } = await supabase
      .from('messages')
      .insert({
        session_id: this.sessionId,
        role,
        content: message.content,
        tokens: this.estimateTokens(message.content)
      })

    if (error) {
      console.error('Error adding message:', error)
    }
  }

  async addUserMessage(message: string): Promise<void> {
    await this.addMessage(new HumanMessage(message))
  }

  async addAIMessage(message: string): Promise<void> {
    await this.addMessage(new AIMessage(message))
  }

  async clear(): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('session_id', this.sessionId)

    if (error) {
      console.error('Error clearing messages:', error)
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4)
  }
}

// Memory factory
export function createChatMemory(sessionId: string, userId: string): SupabaseChatMessageHistory {
  return new SupabaseChatMessageHistory(sessionId, userId)
}

// Get recent messages for context (last N messages)
export async function getRecentMessages(
  sessionId: string, 
  limit: number = 10
): Promise<BaseMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent messages:', error)
    return []
  }

  return (data || []).reverse().map(msg => {
    switch (msg.role) {
      case 'user':
        return new HumanMessage(msg.content)
      case 'assistant':
        return new AIMessage(msg.content)
      case 'system':
        return new SystemMessage(msg.content)
      default:
        return new HumanMessage(msg.content)
    }
  })
}
