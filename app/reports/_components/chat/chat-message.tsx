'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Bot,
  User,
  TrendingUp,
  TrendingDown,
  Target,
  Crosshair,
  Map,
  Users,
  Lightbulb,
  AlertTriangle,
  Trophy,
  BarChart3,
  Zap,
  Shield,
  CheckCircle2,
  Info,
  ArrowRight,
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatMessageProps {
  message: Message
}

type ParsedPart = {
  type: 'text' | 'block'
  content: string
  blockType?: string
  props?: Record<string, string>
  innerContent?: string
}

// Parse structured blocks from content
function parseStructuredBlocks(content: string): ParsedPart[] {
  const parts: ParsedPart[] = []

  // First, clean up any stray :::end markers and normalize whitespace
  let cleanedContent = content
    .replace(/\n?:::end\s*/g, '\n') // Remove :::end markers
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .trim()

  // Match blocks: :::type{props} with optional content until next block or end
  const blockRegex = /:::(\w+)\{([^}]*)\}([\s\S]*?)(?=:::|\n\n|$)/g
  let lastIndex = 0
  let match

  while ((match = blockRegex.exec(cleanedContent)) !== null) {
    // Add text before this block
    if (match.index > lastIndex) {
      const textBefore = cleanedContent.slice(lastIndex, match.index).trim()
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore })
      }
    }

    // Parse block props
    const blockType = match[1]
    const propsStr = match[2]
    const innerContent = match[3]?.trim() || ''
    const props: Record<string, string> = {}

    // Match key="value" pairs
    const propMatches = propsStr.matchAll(/(\w+)="([^"]+)"/g)
    for (const propMatch of propMatches) {
      props[propMatch[1]] = propMatch[2]
    }

    parts.push({ type: 'block', content: '', blockType, props, innerContent })
    lastIndex = match.index + match[0].length
  }

  // Add remaining text (also clean any stray :::end)
  if (lastIndex < cleanedContent.length) {
    const remaining = cleanedContent.slice(lastIndex).replace(/:::end/g, '').trim()
    if (remaining) {
      parts.push({ type: 'text', content: remaining })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text' as const, content }]
}

// Icon mapping for sections
const sectionIcons: Record<string, React.ReactNode> = {
  map: <Map className="h-4 w-4" />,
  player: <Users className="h-4 w-4" />,
  strategy: <Lightbulb className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  target: <Target className="h-4 w-4" />,
  trophy: <Trophy className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
}

// Section Header Component
function SectionBlock({ title, icon }: Record<string, string>) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 mb-2">
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
        {sectionIcons[icon] || <Target className="h-3 w-3" />}
      </div>
      <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
    </div>
  )
}

// Stat block component
function StatBlock({ label, value, confidence, trend }: Record<string, string>) {
  return (
    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 rounded-lg px-4 py-2.5 my-1.5 shadow-sm">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900">{value}</span>
          {trend && (
            <span className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            </span>
          )}
        </div>
      </div>
      {confidence && (
        <Badge
          variant="outline"
          className={cn(
            'text-[9px] px-1.5 py-0 h-4 font-semibold',
            confidence === 'HIGH' && 'bg-green-50 text-green-700 border-green-200',
            confidence === 'MEDIUM' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
            confidence === 'LOW' && 'bg-gray-50 text-gray-600 border-gray-200'
          )}
        >
          {confidence}
        </Badge>
      )}
    </div>
  )
}

// Insight Card Component
function InsightCard({ type, title, priority, innerContent }: Record<string, string>) {
  const configs = {
    weakness: { bg: 'bg-red-50', border: 'border-l-red-500', icon: <AlertTriangle className="h-4 w-4 text-red-500" />, badge: 'bg-red-100 text-red-700' },
    strength: { bg: 'bg-green-50', border: 'border-l-green-500', icon: <Shield className="h-4 w-4 text-green-500" />, badge: 'bg-green-100 text-green-700' },
    opportunity: { bg: 'bg-blue-50', border: 'border-l-blue-500', icon: <Zap className="h-4 w-4 text-blue-500" />, badge: 'bg-blue-100 text-blue-700' },
    warning: { bg: 'bg-amber-50', border: 'border-l-amber-500', icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, badge: 'bg-amber-100 text-amber-700' },
  }
  const config = configs[type as keyof typeof configs] || configs.warning

  return (
    <Card className={cn('my-2 border-l-4 overflow-hidden', config.bg, config.border)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-800">{title}</span>
              {priority && (
                <Badge className={cn('text-[9px] px-1.5 h-4', config.badge)}>
                  {priority.toUpperCase()}
                </Badge>
              )}
            </div>
            {innerContent && (
              <p className="text-sm text-gray-600 leading-relaxed">{innerContent}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Player card component
function PlayerCard({ name, role, acs, kd, agents }: Record<string, string>) {
  return (
    <Card className="my-2 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-200 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Crosshair className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-800">{name}</span>
              {role && <span className="text-xs text-gray-500 ml-2">{role}</span>}
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            {acs && (
              <div className="text-center">
                <div className="text-[10px] uppercase text-gray-400 font-medium">ACS</div>
                <div className="font-bold text-blue-600">{acs}</div>
              </div>
            )}
            {kd && (
              <div className="text-center">
                <div className="text-[10px] uppercase text-gray-400 font-medium">K/D</div>
                <div className="font-bold text-blue-600">{kd}</div>
              </div>
            )}
          </div>
        </div>
        {agents && (
          <div className="mt-2 flex flex-wrap gap-1">
            {agents.split(',').map((agent) => (
              <Badge key={agent} variant="secondary" className="text-[10px] bg-blue-100/50 text-blue-700 hover:bg-blue-100">
                {agent.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Counter strategy card component
function CounterCard({ confidence, title, innerContent }: Record<string, string>) {
  return (
    <Card className="my-2 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-amber-50/30 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-800">{title}</span>
              {confidence && (
                <Badge
                  className={cn(
                    'text-[9px] px-1.5 h-4',
                    confidence === 'HIGH' && 'bg-green-100 text-green-700',
                    confidence === 'MEDIUM' && 'bg-yellow-100 text-yellow-700',
                    confidence === 'LOW' && 'bg-gray-100 text-gray-600'
                  )}
                >
                  {confidence}
                </Badge>
              )}
            </div>
            {innerContent && (
              <p className="text-sm text-gray-600 leading-relaxed">{innerContent}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recommendation Card Component
function RecommendationCard({ priority, category, innerContent }: Record<string, string>) {
  return (
    <Card className="my-2 bg-gradient-to-r from-purple-50 to-violet-50/50 border-purple-200 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {category && (
                <Badge variant="outline" className="text-[9px] text-purple-600 border-purple-300 bg-purple-50">
                  {category}
                </Badge>
              )}
              {priority && (
                <Badge
                  className={cn(
                    'text-[9px] px-1.5 h-4',
                    priority === 'high' && 'bg-red-100 text-red-700',
                    priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                    priority === 'low' && 'bg-gray-100 text-gray-600'
                  )}
                >
                  {priority.toUpperCase()} PRIORITY
                </Badge>
              )}
            </div>
            {innerContent && (
              <p className="text-sm text-gray-700 leading-relaxed font-medium">{innerContent}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// List Block Component
function ListBlock({ title, type, innerContent }: Record<string, string>) {
  const configs = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info className="h-4 w-4 text-blue-500" /> },
  }
  const config = configs[type as keyof typeof configs] || configs.info

  // Parse the inner content as markdown list items
  const items = innerContent?.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')) || []

  return (
    <Card className={cn('my-2', config.bg, config.border)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {config.icon}
          <span className="font-semibold text-sm text-gray-800">{title}</span>
        </div>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <ArrowRight className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
              <span className="leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <>{children}</>,
                    strong: ({ children }) => <strong className="text-gray-800">{children}</strong>,
                  }}
                >
                  {item.replace(/^[-*]\s*/, '')}
                </ReactMarkdown>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// Strategy insight card component (legacy support)
function StrategyCard({ type, title, description }: Record<string, string>) {
  return (
    <Card className="my-2 border-l-4 border-l-purple-500 bg-purple-50/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {type && (
            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-300">
              {type}
            </Badge>
          )}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const parts = useMemo(() => parseStructuredBlocks(message.content), [message.content])

  return (
    <div className={cn('flex gap-3 px-4 py-3', isUser ? 'bg-gray-50' : 'bg-white')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white'
            : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {parts.map((part, i) => {
          if (part.type === 'text' && part.content.trim()) {
            return (
              <div key={i} className="prose prose-sm max-w-none prose-p:my-1 prose-headings:mt-3 prose-headings:mb-2 prose-li:my-0.5 prose-p:text-gray-700">
                <ReactMarkdown>{part.content}</ReactMarkdown>
              </div>
            )
          }

          if (part.type === 'block' && part.props) {
            const propsWithContent = { ...part.props, innerContent: part.innerContent || '' }

            switch (part.blockType) {
              case 'section':
                return <SectionBlock key={i} {...part.props} />
              case 'stat':
                return <StatBlock key={i} {...part.props} />
              case 'insight':
                return <InsightCard key={i} {...propsWithContent} />
              case 'player':
                return <PlayerCard key={i} {...part.props} />
              case 'counter':
                return <CounterCard key={i} {...propsWithContent} />
              case 'recommendation':
                return <RecommendationCard key={i} {...propsWithContent} />
              case 'list':
                return <ListBlock key={i} {...propsWithContent} />
              case 'strategy':
                return <StrategyCard key={i} {...part.props} />
              default:
                return null
            }
          }

          return null
        })}
      </div>
    </div>
  )
}
