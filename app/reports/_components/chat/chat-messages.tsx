'use client'

import { useRef, useEffect } from 'react'
import { Bot, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './chat-message'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  toolInProgress?: string | null
  onSuggestedQuestion?: (question: string) => void
}

const SUGGESTED_QUESTIONS = [
  "What's this team's biggest weakness?",
  "Which player has the best first blood stats?",
  "What maps should we pick against them?",
  "Show me their pistol round patterns",
  "What counter-strategies do you recommend?",
]

export function ChatMessages({
  messages,
  isLoading,
  toolInProgress,
  onSuggestedQuestion,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <Bot className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold mb-2">Scout Assistant</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Ask about strategies, players, compositions, or counter-tactics
        </p>

        {/* Suggested Questions */}
        <div className="space-y-2 w-full">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
            Try asking
          </p>
          {SUGGESTED_QUESTIONS.map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto py-2.5 text-sm"
              onClick={() => onSuggestedQuestion?.(question)}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-2.5 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{question}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="divide-y">
        {messages.map((message, i) => (
          <ChatMessage key={`${i}-${message.role}`} message={message} />
        ))}

        {/* Loading / Tool in progress indicator */}
        {isLoading && (
          <div className="flex gap-3 px-4 py-3 bg-white">
            <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {toolInProgress ? (
                <span>Fetching {toolInProgress.replace(/_/g, ' ')}...</span>
              ) : (
                <span>Thinking...</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
