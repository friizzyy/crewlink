'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle, Search, Phone, Video, MoreHorizontal,
  Send, Paperclip, Image as ImageIcon, Smile, Check, CheckCheck,
  ArrowLeft, Star, Clock, MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    worker: {
      name: 'Marcus Thompson',
      avatar: 'M',
      rating: 4.9,
      verified: true,
      online: true,
    },
    job: {
      id: '2',
      title: 'Help Moving Furniture',
    },
    lastMessage: {
      text: "I'll be there in about 15 minutes. Just finishing up parking.",
      time: '2 min ago',
      isFromMe: false,
      read: true,
    },
    unread: 2,
  },
  {
    id: '2',
    worker: {
      name: 'Sarah Kim',
      avatar: 'S',
      rating: 5.0,
      verified: true,
      online: false,
    },
    job: {
      id: '3',
      title: 'IKEA Furniture Assembly',
    },
    lastMessage: {
      text: 'Thank you for the great review! Happy to help anytime.',
      time: '2 days ago',
      isFromMe: false,
      read: true,
    },
    unread: 0,
  },
  {
    id: '3',
    worker: {
      name: 'David Chen',
      avatar: 'D',
      rating: 4.7,
      verified: false,
      online: true,
    },
    job: {
      id: '1',
      title: 'Deep House Cleaning',
    },
    lastMessage: {
      text: 'Sounds good! I can start tomorrow morning at 9am.',
      time: '1 hour ago',
      isFromMe: false,
      read: false,
    },
    unread: 1,
  },
]

const mockMessages = [
  {
    id: '1',
    text: "Hi! I'm interested in hiring you for the moving job. Are you available this Saturday?",
    time: '10:30 AM',
    isFromMe: true,
    read: true,
  },
  {
    id: '2',
    text: "Hi there! Yes, Saturday works great for me. What time were you thinking?",
    time: '10:32 AM',
    isFromMe: false,
    read: true,
  },
  {
    id: '3',
    text: "Perfect! How about 10am? It's a 2-bedroom apartment, mostly furniture and boxes.",
    time: '10:35 AM',
    isFromMe: true,
    read: true,
  },
  {
    id: '4',
    text: "10am works! I have a truck so we should be able to do it in one trip. Do you have an elevator or stairs?",
    time: '10:38 AM',
    isFromMe: false,
    read: true,
  },
  {
    id: '5',
    text: "There's an elevator, so that should make things easier. Building has a loading dock too.",
    time: '10:40 AM',
    isFromMe: true,
    read: true,
  },
  {
    id: '6',
    text: "I'll be there in about 15 minutes. Just finishing up parking.",
    time: '2 min ago',
    isFromMe: false,
    read: true,
  },
]

export default function HiringMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = mockConversations.filter((conv) =>
    conv.worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.job.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentConversation = mockConversations.find((c) => c.id === selectedConversation)

  const toast = useToast()

  const handleSendMessage = () => {
    if (!messageText.trim()) return
    // In real app, send message via API
    toast.success('Message sent')
    setMessageText('')
  }

  const handleCall = () => {
    toast.info('Voice calls coming soon')
  }

  const handleVideoCall = () => {
    toast.info('Video calls coming soon')
  }

  const handleAttachment = () => {
    toast.info('File attachments coming soon')
  }

  const handleImageUpload = () => {
    toast.info('Image sharing coming soon')
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
                    {conv.worker.avatar}
                  </div>
                  {conv.worker.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white truncate">
                        {conv.worker.name}
                      </span>
                      {conv.worker.verified && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {conv.lastMessage.time}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 mt-0.5 truncate">
                    {conv.job.title}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-sm text-slate-400 truncate">
                      {conv.lastMessage.isFromMe && 'You: '}
                      {conv.lastMessage.text}
                    </p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                        {conv.unread}
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
                  {currentConversation.worker.avatar}
                </div>
                {currentConversation.worker.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">
                    {currentConversation.worker.name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-400">
                      {currentConversation.worker.rating}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/hiring/job/${currentConversation.job.id}`}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {currentConversation.job.title}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCall}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Voice call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={handleVideoCall}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Video call"
              >
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.isFromMe ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[75%] px-4 py-2.5 rounded-2xl',
                    message.isFromMe
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-slate-800 text-white'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <div
                    className={cn(
                      'flex items-center justify-end gap-1 mt-1',
                      message.isFromMe ? 'text-white/70' : 'text-slate-500'
                    )}
                  >
                    <span className="text-xs">{message.time}</span>
                    {message.isFromMe && (
                      message.read ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <div className="flex items-end gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleAttachment}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={handleImageUpload}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Send image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className={cn(
                  'p-2.5 rounded-xl transition-colors',
                  messageText.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-800 text-slate-500'
                )}
              >
                <Send className="w-5 h-5" />
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
