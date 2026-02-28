'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BookOpen, ArrowRight, Clock, User, Sparkles } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge } from '@/components/ui'

// ============================================
// BLOG PAGE - Premium Content Hub
// Design: Enhanced scroll animations, category filter,
// card hover effects, animated backgrounds
// ============================================

const featuredPost = {
  id: 1,
  title: 'How we built a matching system that actually works',
  excerpt: 'A deep dive into the technology behind CrewLink\'s instant matching, and why we chose to build it differently than everyone else.',
  author: 'Maria Santos',
  role: 'CTO',
  date: 'Jan 15, 2026',
  readTime: '8 min read',
  category: 'Engineering',
}

const posts = [
  {
    id: 2,
    title: 'The state of the gig economy in 2026',
    excerpt: 'What the numbers tell us about how people are working, earning, and thinking about flexibility.',
    author: 'Alex Chen',
    date: 'Jan 10, 2026',
    readTime: '5 min read',
    category: 'Industry',
  },
  {
    id: 3,
    title: 'Safety features every platform should have',
    excerpt: 'Our approach to building trust and safety into every interaction on CrewLink.',
    author: 'James Park',
    date: 'Jan 5, 2026',
    readTime: '6 min read',
    category: 'Product',
  },
  {
    id: 4,
    title: '5 tips for workers to get more jobs',
    excerpt: 'Practical advice from top-rated workers on how to stand out and build a successful profile.',
    author: 'Sarah Kim',
    date: 'Dec 28, 2025',
    readTime: '4 min read',
    category: 'Tips',
  },
  {
    id: 5,
    title: 'Launching in 10 new cities this quarter',
    excerpt: 'We\'re expanding to Austin, Denver, Nashville, and more. Here\'s what that means for you.',
    author: 'Alex Chen',
    date: 'Dec 20, 2025',
    readTime: '3 min read',
    category: 'Company',
  },
  {
    id: 6,
    title: 'How to hire help for your first time',
    excerpt: 'A step-by-step guide for people who\'ve never used a service like CrewLink before.',
    author: 'Sarah Kim',
    date: 'Dec 15, 2025',
    readTime: '5 min read',
    category: 'Tips',
  },
]

const categories = ['All', 'Engineering', 'Product', 'Company', 'Industry', 'Tips']

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-36 pb-16 sm:pt-44 sm:pb-20 relative overflow-hidden">
      {/* Animated Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: '14s', animationDelay: '4s' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '0ms' }}>
          <Badge variant="accent" size="md" className="mb-10 bg-purple-500/10 border-purple-500/20 text-purple-400">
            <BookOpen className="w-4 h-4 mr-2" />
            Our blog
          </Badge>
        </div>

        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          Stories from{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            CrewLink
          </span>
        </h1>

        <p className={`mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          Insights on building products, growing a marketplace, and the future of work.
        </p>
      </div>
    </section>
  )
}

function FeaturedPost() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <Link
          href={`/blog/${featuredPost.id}`}
          className={`group block ${getRevealClasses(isVisible, 'scale')}`}
        >
          <FeatureCard gradient="purple" shine className="p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="accent" size="sm" className="bg-purple-500/20 text-purple-400">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
              <Badge variant="neutral" size="sm">
                {featuredPost.category}
              </Badge>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
              {featuredPost.title}
            </h2>

            <p className="text-slate-400 leading-relaxed mb-6 max-w-2xl">
              {featuredPost.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-purple-500/30">
                  {featuredPost.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{featuredPost.author}</p>
                  <p className="text-xs text-slate-500">{featuredPost.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{featuredPost.date}</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </FeatureCard>
        </Link>
      </div>
    </section>
  )
}

function PostsGrid() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [activeCategory, setActiveCategory] = useState('All')
  const [allLoaded, setAllLoaded] = useState(false)

  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Categories */}
        <div className={`flex flex-wrap gap-2 mb-12 ${getRevealClasses(isVisible, 'up')}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                cat === activeCategory
                  ? 'bg-white text-slate-900 shadow-lg shadow-white/10'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {filteredPosts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className={`group block ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${80 + i * 60}ms` }}
            >
              <GlassCard interactive padding="lg" rounded="xl" className="hover:translate-y-[-2px] hover:border-purple-500/30 h-full">
                <Badge variant="neutral" size="sm" className="mb-4">
                  {post.category}
                </Badge>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-3">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Load more */}
        <div className={`text-center mt-12 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '400ms' }}>
          {allLoaded ? (
            <p className="text-sm text-slate-500">You&apos;ve reached the end</p>
          ) : (
            <Button variant="secondary" onClick={() => setAllLoaded(true)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Load more posts
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [emailFocused, setEmailFocused] = useState(false)

  return (
    <section ref={ref} className="py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <GlassPanel
          variant="elevated"
          padding="none"
          border="light"
          rounded="2xl"
          className={`relative overflow-hidden p-10 sm:p-14 text-center border-purple-500/20 ${getRevealClasses(isVisible, 'scale')}`}
        >
          {/* Animated background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-pulse"
              style={{ animationDuration: '8s' }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] animate-pulse"
              style={{ animationDuration: '10s', animationDelay: '2s' }}
            />
          </div>

          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stay in the loop
              </span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Get the latest posts delivered to your inbox. No spam, just good content.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1 group">
                {/* Focus glow */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 transition-opacity duration-300 ${
                    emailFocused ? 'opacity-30' : 'group-hover:opacity-10'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="relative w-full px-4 py-3.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <Button type="submit" variant="accent" size="lg">
                Subscribe
              </Button>
            </form>
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

export default function BlogPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <FeaturedPost />
      <PostsGrid />
      <NewsletterSection />
    </MarketingLayout>
  )
}
