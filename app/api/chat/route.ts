import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { analyticsTools } from '@/app/lib/ai/tools'
import { executeTool } from '@/app/lib/ai/tool-executor'
import { buildSystemPrompt, type ChatContext } from '@/app/lib/ai/system-prompt'

// Vercel function timeout
export const maxDuration = 60

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const MAX_TOOL_CALLS = 5 // Maximum tool call iterations

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  context: ChatContext
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context }: ChatRequest = await request.json()

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context)

    // Convert messages to OpenAI format
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Create streaming response with tool calling
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = [...openaiMessages]
          let toolCallCount = 0

          // Tool calling loop
          while (toolCallCount < MAX_TOOL_CALLS) {
            const response = await openai.chat.completions.create({
              model: MODEL,
              messages: currentMessages,
              tools: analyticsTools,
              tool_choice: 'auto',
              stream: false, // Non-streaming for tool calls
              max_tokens: 2000,
              temperature: 0.7,
            })

            const choice = response.choices[0]
            const message = choice.message

            // Check if there are tool calls
            if (message.tool_calls && message.tool_calls.length > 0) {
              toolCallCount++

              // Add assistant message with tool calls
              currentMessages.push({
                role: 'assistant',
                content: message.content || null,
                tool_calls: message.tool_calls,
              })

              // Execute each tool call
              for (const toolCall of message.tool_calls) {
                if (toolCall.type !== 'function') continue
                const functionName = toolCall.function.name
                const functionArgs = JSON.parse(toolCall.function.arguments)

                // Inject teamId from context if not provided
                if (!functionArgs.teamId && context.teamId) {
                  functionArgs.teamId = context.teamId
                }
                if (!functionArgs.seriesIds && context.seriesIds?.length > 0) {
                  functionArgs.seriesIds = context.seriesIds
                }

                // Emit tool call status
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'tool_call', tool: functionName })}\n\n`
                  )
                )

                try {
                  const result = await executeTool(functionName, functionArgs)

                  // Add tool result
                  currentMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result),
                  })
                } catch (error) {
                  console.error(`Tool ${functionName} error:`, error)
                  currentMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ error: `Failed to execute ${functionName}` }),
                  })
                }
              }

              // Continue loop to process tool results
              continue
            }

            // No tool calls - stream the final response
            if (message.content) {
              // Stream the response token by token using streaming API
              const streamResponse = await openai.chat.completions.create({
                model: MODEL,
                messages: currentMessages,
                stream: true,
                max_tokens: 2000,
                temperature: 0.7,
              })

              for await (const chunk of streamResponse) {
                const text = chunk.choices[0]?.delta?.content || ''
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`)
                  )
                }
              }
            }

            // Exit loop - we have a final response
            break
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Chat stream error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
