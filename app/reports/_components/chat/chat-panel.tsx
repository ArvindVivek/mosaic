'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatMessages } from './chat-messages'
import type { ScoutingReport } from '@/app/lib/orchestration/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContext {
  teamId: string
  teamName: string
  seriesIds: string[]
  currentReport: ScoutingReport | null
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  context: ChatContext
}

export function ChatPanel({ isOpen, onClose, context }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toolInProgress, setToolInProgress] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Clear messages when team changes
  useEffect(() => {
    setMessages([])
  }, [context.teamId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: Message = { role: 'user', content }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)
      setToolInProgress(null)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            context,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''
        let assistantContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6)
              if (dataStr === '[DONE]') continue

              try {
                const data = JSON.parse(dataStr)

                if (data.type === 'tool_call') {
                  setToolInProgress(data.tool)
                } else if (data.type === 'text') {
                  setToolInProgress(null)
                  assistantContent += data.text

                  // Update the assistant message in real-time
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    const lastMessage = newMessages[newMessages.length - 1]
                    if (lastMessage?.role === 'assistant') {
                      lastMessage.content = assistantContent
                    } else {
                      newMessages.push({ role: 'assistant', content: assistantContent })
                    }
                    return newMessages
                  })
                } else if (data.type === 'error') {
                  setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: `Error: ${data.error}` },
                  ])
                }
              } catch {
                // Ignore JSON parse errors
              }
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm sorry, I encountered an error. Please try again.",
          },
        ])
      } finally {
        setIsLoading(false)
        setToolInProgress(null)
      }
    },
    [messages, context, isLoading]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  if (!isOpen) return null

  return (
    <aside className="w-[400px] flex-shrink-0 border-l bg-white flex flex-col h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="font-semibold">Scout Assistant</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Context Badge */}
      {context.teamName && (
        <div className="px-4 py-2 bg-muted/30 border-b">
          <p className="text-xs text-muted-foreground">
            Analyzing:{' '}
            <span className="font-medium text-foreground">{context.teamName}</span>
            {context.seriesIds.length > 0 && (
              <span className="ml-1">({context.seriesIds.length} series)</span>
            )}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          toolInProgress={toolInProgress}
          onSuggestedQuestion={sendMessage}
        />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about strategies, players..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </aside>
  )
}
