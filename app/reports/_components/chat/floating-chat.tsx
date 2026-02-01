'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2, Sparkles, MessageCircle, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatMessages } from './chat-messages'
import { cn } from '@/lib/utils'
import type { ScoutingReport } from '@/app/lib/orchestration/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatContext {
  teamId: string
  teamName: string
  seriesIds: string[]
  currentReport: ScoutingReport | null
  reportGeneratedAt?: number // Timestamp to track report changes
}

interface FloatingChatProps {
  context: ChatContext
}

export function FloatingChat({ context }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toolInProgress, setToolInProgress] = useState<string | null>(null)
  const [lastReportTimestamp, setLastReportTimestamp] = useState<number | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Clear messages when team changes
  useEffect(() => {
    if (context.teamId) {
      setMessages([])
    }
  }, [context.teamId])

  // Clear messages when a new report is generated (context refresh)
  useEffect(() => {
    if (context.reportGeneratedAt && context.reportGeneratedAt !== lastReportTimestamp) {
      setMessages([])
      setLastReportTimestamp(context.reportGeneratedAt)
    }
  }, [context.reportGeneratedAt, lastReportTimestamp])

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
            context: {
              teamId: context.teamId,
              teamName: context.teamName,
              seriesIds: context.seriesIds,
              currentReport: context.currentReport,
            },
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

  const hasContext = context.teamId && context.teamName

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          disabled={!hasContext}
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center justify-center',
            'w-14 h-14 rounded-full shadow-lg transition-all duration-300',
            'hover:scale-110 active:scale-95',
            hasContext
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-orange-500/25 hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          )}
          title={hasContext ? 'Open Scout Assistant' : 'Generate a report first'}
        >
          <MessageCircle className="w-6 h-6" />
          {hasContext && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-[420px] h-[600px] max-h-[calc(100vh-100px)]',
            'bg-white rounded-2xl shadow-2xl border border-gray-200',
            'flex flex-col overflow-hidden',
            'animate-in slide-in-from-bottom-4 fade-in duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Scout Assistant</h2>
                {context.teamName && (
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    Analyzing {context.teamName}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-orange-100"
              onClick={() => setIsOpen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

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
          <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about strategies, players..."
                disabled={isLoading}
                className="flex-1 bg-white"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
