'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  MessageCircle, Search, MoreHorizontal,
  Send, Smile, Check, CheckCheck,
  ArrowLeft, Star, Loader2, AlertCircle, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'

// --- Types matching API response shapes ---

interface ConversationUser {
  id: string
  name: string | null
  avatarUrl: string | null
  image: string | null
}

interface ConversationJob {
  id: string
  title: string
  status: string
}

interface ConversationLastMessage {
  id: string
  content: string
  senderId: string
  createdAt: string
}

interface Conversation {
  id: string
  job: ConversationJob | null
  otherUser: ConversationUser | undefined
  lastMessage: ConversationLastMessage | null
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadCount: number
  isMuted: boolean
}

interface MessageSender {
  id: string
  name: string | null
  avatarUrl: string | null
  image: string | null
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: MessageSender
}

// --- Helper to format timestamps ---

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function getInitial(name: string | null | undefined): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

export default function HiringMessagesPage() {
  const { data: session } = useSession()
  const toast = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState<string | null>(null)

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)

  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true)
      setConversationsError(null)
      const res = await fetch('/api/conversations')
      if (!res.ok) throw new Error('Failed to load conversations')
      const json = await res.json()
      setConversations(json.data || [])
    } catch (err) {
      setConversationsError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Fetch messages when conversation is selected
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true)
      setMessagesError(null)
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      if (!res.ok) throw new Error('Failed to load messages')
      const json = await res.json()
      setMessages(json.data || [])
    } catch (err) {
      setMessagesError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [])

  // Focus input when conversation changes
  useEffect(() => {
    if (selectedConversation && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [selectedConversation])

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
    adjustTextareaHeight()
  }

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.otherUser?.name || ''
    const title = conv.job?.title || ''
    const q = searchQuery.toLowerCase()
    return name.toLowerCase().includes(q) || title.toLowerCase().includes(q)
  })

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  const handleSendMessage = async () => {
    const trimmedText = messageText.trim()
    if (!trimmedText || isSending || !selectedConversation) return

    setIsSending(true)

    // Optimistic update
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      content: trimmedText,
      senderId: session?.user?.id || '',
      createdAt: new Date().toISOString(),
      sender: {
        id: session?.user?.id || '',
        name: session?.user?.name || null,
        avatarUrl: null,
        image: null,
      },
    }
    setMessages((prev) => [...prev, optimisticMessage])

    // Clear input and reset height
    setMessageText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmedText }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to send message')
      }

      const json = await res.json()
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? json.data : m))
      )
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  // --- Loading skeleton for conversations ---
  if (conversationsLoading) {
    return (
      <div className="h-[calc(100vh-80px)] bg-slate-950 flex">
        <div className="w-full md:w-96 border-r border-white/5 flex flex-col bg-slate-900/50">
          <div className="p-4 border-b border-white/5">
            <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
            <Skeleton variant="rectangular" height={42} className="rounded-xl" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex gap-3 border-b border-white/5">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} />
                  <Skeleton variant="text" width="80%" height={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-950">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-spin" />
            <p className="text-slate-400">Loading conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  // --- Error state for conversations ---
  if (conversationsError) {
    return (
      <div className="h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-2">Failed to load conversations</h2>
          <p className="text-slate-400 mb-4">{conversationsError}</p>
          <button
            onClick={fetchConversations}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-950 flex">
      {/* Conversations List */}
      <div
        className={cn(
          'w-full md:w-96 border-r border-white/5 flex flex-col bg-slate-900/50',
          selectedConversation ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={cn(
                  'w-full p-4 flex gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5',
                  selectedConversation === conv.id && 'bg-cyan-500/10'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {getInitial(conv.otherUser?.name)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white truncate">
                        {conv.otherUser?.name || 'Unknown User'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                    </span>
                  </div>
                  {conv.job && (
                    <div className="text-xs text-cyan-400 mt-0.5 truncate">
                      {conv.job.title}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-sm text-slate-400 truncate">
                      {conv.lastMessage && conv.lastMessage.senderId === session?.user?.id && 'You: '}
                      {conv.lastMessagePreview || conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation && currentConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {getInitial(currentConversation.otherUser?.name)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">
                    {currentConversation.otherUser?.name || 'Unknown User'}
                  </span>
                </div>
                {currentConversation.job && (
                  <Link
                    href={`/hiring/job/${currentConversation.job.id}`}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    {currentConversation.job.title}
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                    <div className="max-w-[75%]">
                      <Skeleton
                        variant="rectangular"
                        width={i % 3 === 0 ? 200 : 280}
                        height={60}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : messagesError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-slate-400 mb-3">{messagesError}</p>
                  <button
                    onClick={() => fetchMessages(selectedConversation)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No messages yet. Send the first message!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isFromMe = message.senderId === session?.user?.id
                  return (
                    <div
                      key={message.id}
                      className={cn('flex', isFromMe ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] px-4 py-2.5 rounded-2xl',
                          isFromMe
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                            : 'bg-slate-800 text-white'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={cn(
                            'flex items-center justify-end gap-1 mt-1',
                            isFromMe ? 'text-white/70' : 'text-slate-500'
                          )}
                        >
                          <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
                          {isFromMe && (
                            <CheckCheck className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  disabled={isSending}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none min-h-[42px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ overflow: 'hidden' }}
                />
              </div>
              <button
                disabled={isSending}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
                className={cn(
                  'p-2.5 rounded-xl transition-colors disabled:cursor-not-allowed',
                  messageText.trim() && !isSending
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90'
                    : 'bg-slate-800 text-slate-500'
                )}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Your Messages</h2>
            <p className="text-slate-400 max-w-sm">
              Select a conversation to start messaging with workers about your jobs.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
