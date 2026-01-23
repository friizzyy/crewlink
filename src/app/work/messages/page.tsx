'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle, Search, Phone, Video, MoreHorizontal,
  Send, Paperclip, Image as ImageIcon, Smile, Check, CheckCheck,
  ArrowLeft, Star, Clock, MapPin, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    hirer: {
      name: 'Alex Johnson',
      avatar: 'A',
      rating: 4.9,
      verified: true,
      online: true,
    },
    job: {
      id: '1',
      title: 'Deep House Cleaning',
      status: 'pending', // pending bid response
    },
    lastMessage: {
      text: "Thanks for your bid! Can you start today at 2pm?",
      time: '5 min ago',
      isFromMe: false,
      read: false,
    },
    unread: 1,
  },
  {
    id: '2',
    hirer: {
      name: 'Jordan Kim',
      avatar: 'J',
      rating: 5.0,
      verified: true,
      online: false,
    },
    job: {
      id: '2',
      title: 'IKEA Furniture Assembly',
      status: 'in-progress',
    },
    lastMessage: {
      text: "Perfect, I'll have everything ready when you arrive.",
      time: '2 hours ago',
      isFromMe: false,
      read: true,
    },
    unread: 0,
  },
  {
    id: '3',
    hirer: {
      name: 'Sam Wilson',
      avatar: 'S',
      rating: 4.8,
      verified: true,
      online: true,
    },
    job: {
      id: '3',
      title: 'Help Moving Furniture',
      status: 'completed',
    },
    lastMessage: {
      text: "Thanks again for the great work! Left you a 5-star review.",
      time: '1 day ago',
      isFromMe: false,
      read: true,
    },
    unread: 0,
  },
]

const mockMessages = [
  {
    id: '1',
    text: "Hi! I saw your cleaning job posting and I'd love to help. I have 5 years of experience with deep cleaning.",
    time: '10:00 AM',
    isFromMe: true,
    read: true,
  },
  {
    id: '2',
    text: "Great! Your reviews look amazing. I see you're available today?",
    time: '10:05 AM',
    isFromMe: false,
    read: true,
  },
  {
    id: '3',
    text: "Yes, I can start anytime today. I have all my own eco-friendly cleaning supplies if needed.",
    time: '10:08 AM',
    isFromMe: true,
    read: true,
  },
  {
    id: '4',
    text: "That's perfect! I have supplies but feel free to use yours if you prefer. The apartment is about 1,100 sq ft.",
    time: '10:12 AM',
    isFromMe: false,
    read: true,
  },
  {
    id: '5',
    text: "Thanks for your bid! Can you start today at 2pm?",
    time: '5 min ago',
    isFromMe: false,
    read: false,
  },
]

export default function WorkMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = mockConversations.filter((conv) =>
    conv.hirer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-400'
      case 'in-progress':
        return 'text-blue-400'
      case 'completed':
        return 'text-emerald-400'
      default:
        return 'text-slate-400'
    }
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                  selectedConversation === conv.id && 'bg-emerald-500/10'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-semibold">
                    {conv.hirer.avatar}
                  </div>
                  {conv.hirer.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white truncate">
                        {conv.hirer.name}
                      </span>
                      {conv.hirer.verified && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {conv.lastMessage.time}
                    </span>
                  </div>
                  <div className={cn('text-xs mt-0.5 truncate', getJobStatusColor(conv.job.status))}>
                    <Briefcase className="w-3 h-3 inline mr-1" />
                    {conv.job.title}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-sm text-slate-400 truncate">
                      {conv.lastMessage.isFromMe && 'You: '}
                      {conv.lastMessage.text}
                    </p>
                    {conv.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-semibold">
                  {currentConversation.hirer.avatar}
                </div>
                {currentConversation.hirer.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">
                    {currentConversation.hirer.name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-400">
                      {currentConversation.hirer.rating}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/work/job/${currentConversation.job.id}`}
                  className={cn('text-xs hover:underline', getJobStatusColor(currentConversation.job.status))}
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
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
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
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
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
              Select a conversation to start messaging with hirers about their jobs.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
