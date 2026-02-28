'use client'

import Link from 'next/link'
import {
  Users, Heart, Shield, Zap, Target, Award, ArrowRight,
  Briefcase, MapPin, Star, TrendingUp, Globe, Clock,
  CheckCircle2, Sparkles, Building2, Rocket, HandHeart,
  UserCheck, BadgeCheck, Lightbulb, Scale
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import MarketingLayout from '@/components/MarketingLayout'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge } from '@/components/ui'

// Stats data
const stats = [
  { label: 'Active Workers', value: '50K+', icon: Users, color: 'cyan' },
  { label: 'Jobs Completed', value: '250K+', icon: Briefcase, color: 'emerald' },
  { label: 'Cities Covered', value: '100+', icon: MapPin, color: 'purple' },
  { label: 'Average Rating', value: '4.9', icon: Star, color: 'amber' },
]

// Timeline milestones
const milestones = [
  { year: '2023', title: 'Founded', description: 'CrewLink launched in San Francisco with a mission to transform local hiring.' },
  { year: '2024', title: 'Expansion', description: 'Expanded to 50+ cities across the US, connecting thousands of workers and hirers.' },
  { year: '2025', title: 'Innovation', description: 'Introduced AI-powered matching, instant payments, and enhanced safety features.' },
  { year: 'Future', title: 'Global Vision', description: 'Building the world\'s most trusted platform for local services.' },
]

// Values
const values = [
  {
    icon: Heart,
    title: 'People First',
    description: 'We believe in empowering individuals to build meaningful careers and find help when they need it most.',
    gradient: 'cyan' as const,
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'Every worker is verified, every payment is protected, and every interaction is backed by our safety guarantee.',
    gradient: 'emerald' as const,
  },
  {
    icon: Scale,
    title: 'Fair Opportunity',
    description: 'We create equal access to work opportunities regardless of background, ensuring fair pay for quality work.',
    gradient: 'purple' as const,
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We continuously improve our platform with modern technology to make hiring and working seamless.',
    gradient: 'amber' as const,
  },
]

// Team members
const team = [
  { name: 'Julius Williams', role: 'CEO', color: 'cyan', bio: 'Runs the company with a focus on what actually helps users.' },
  { name: 'Zahraa Alkhaleef', role: 'CTO & Co-Founder', color: 'purple', bio: 'Leads engineering and owns the matching system.' },
  { name: 'Ares Williams', role: 'Head of Product', color: 'emerald', bio: 'Figures out what to build and makes sure it works.' },
  { name: 'Ali Alkhaleef', role: 'Head of Operations', color: 'rose', bio: 'Keeps the platform running and launches new markets.' },
]

// Investors/Partners
const partners = [
  'Y Combinator',
  'Sequoia Capital',
  'Andreessen Horowitz',
  'First Round Capital',
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div
        ref={ref}
        className={cn(
          'relative max-w-5xl mx-auto px-4 text-center',
          getRevealClasses(isVisible)
        )}
      >
        {/* Badge */}
        <Badge variant="brand" size="md" className="mb-8">
          <Sparkles className="w-4 h-4 mr-2" />
          Our Story
        </Badge>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="text-white">Building the Future of </span>
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Local Work
          </span>
        </h1>

        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          We&apos;re on a mission to create economic opportunity for everyone by connecting
          skilled workers with people who need help getting things done.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/hiring">
            <Button variant="primary" size="lg" glow rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Hiring
            </Button>
          </Link>
          <Link href="/work">
            <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Find Work
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: 'text-cyan-400' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-400' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400' },
    }
    return colors[color] || colors.cyan
  }

  return (
    <section className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            const colors = getColorClasses(stat.color)
            return (
              <GlassPanel
                key={stat.label}
                variant="subtle"
                padding="lg"
                border="light"
                rounded="xl"
                hoverable
                className="text-center shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)]"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>
                <div className={cn('text-3xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent', {
                  'from-cyan-400 to-blue-400': stat.color === 'cyan',
                  'from-emerald-400 to-teal-400': stat.color === 'emerald',
                  'from-purple-400 to-pink-400': stat.color === 'purple',
                  'from-amber-400 to-orange-400': stat.color === 'amber',
                })}>{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </GlassPanel>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StorySection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Story */}
          <div>
            <Badge variant="success" size="md" className="mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Our Journey
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-white">From Idea to </span>
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Movement
              </span>
            </h2>

            <GlassPanel variant="elevated" padding="lg" border="light" rounded="xl" className="border-cyan-500/[0.12] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]">
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  In 2023, we noticed something broken. Hiring someone for a simple task meant outdated
                  listings, phone tag, and hoping for the best. For workers, finding gigs meant juggling
                  apps and never knowing when work would come.
                </p>
                <p>
                  CrewLink fixes that. Our platform connects the right worker to the right job, instantly.
                  No waiting. No guessing. Just work getting done by real people in your area.
                </p>
                <p>
                  Today, we&apos;re proud to serve thousands of communities across the country, but
                  we&apos;re just getting started. Our vision is to become the most trusted platform
                  for local services worldwide.
                </p>
              </div>
            </GlassPanel>
          </div>

          {/* Right: Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-emerald-500/50" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative pl-12">
                  <div className={cn(
                    'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    index === milestones.length - 1
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800 border border-white/10 text-slate-400'
                  )}>
                    {milestone.year === 'Future' ? <Sparkles className="w-4 h-4" /> : milestone.year.slice(-2)}
                  </div>
                  <GlassPanel variant="subtle" padding="md" border="light" rounded="lg">
                    <div className="text-sm text-cyan-400 font-medium mb-1">{milestone.year}</div>
                    <div className="font-semibold text-white mb-1">{milestone.title}</div>
                    <div className="text-sm text-slate-400">{milestone.description}</div>
                  </GlassPanel>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="py-16 sm:py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div
        ref={ref}
        className={cn(
          'relative max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="text-center mb-12">
          <Badge variant="accent" size="md" className="mb-6 bg-purple-500/10 border-purple-500/20 text-purple-400">
            <Heart className="w-4 h-4 mr-2" />
            Our Values
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              What Drives Us
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our core values guide every decision we make, from product features to customer support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, i) => {
            const Icon = value.icon
            return (
              <FeatureCard
                key={value.title}
                gradient={value.gradient}
                shine
                className="hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)] transition-shadow duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', {
                  'bg-cyan-500/10': value.gradient === 'cyan',
                  'bg-emerald-500/10': value.gradient === 'emerald',
                  'bg-purple-500/10': value.gradient === 'purple',
                  'bg-amber-500/10': value.gradient === 'amber',
                })}>
                  <Icon className={cn('w-6 h-6', {
                    'text-cyan-400': value.gradient === 'cyan',
                    'text-emerald-400': value.gradient === 'emerald',
                    'text-purple-400': value.gradient === 'purple',
                    'text-amber-400': value.gradient === 'amber',
                  })} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-slate-400">{value.description}</p>
              </FeatureCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const getGradient = (color: string) => {
    const gradients: Record<string, string> = {
      cyan: 'from-cyan-400 to-blue-600',
      purple: 'from-purple-400 to-pink-600',
      emerald: 'from-emerald-400 to-teal-600',
      rose: 'from-rose-400 to-orange-600',
    }
    return gradients[color] || gradients.cyan
  }

  return (
    <section className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="brand" size="md" className="mb-6">
            <Users className="w-4 h-4 mr-2" />
            Leadership
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A passionate team dedicated to building the future of local work.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <Link
              key={member.name}
              href={`/team/${member.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-center group"
            >
              <GlassCard interactive padding="lg" rounded="xl" className="mb-0 hover:-translate-y-1 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.4)] transition-all duration-300">
                <div className={cn(
                  'w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold transition-transform group-hover:scale-105 ring-2 ring-offset-2 ring-offset-slate-900',
                  getGradient(member.color),
                  {
                    'ring-cyan-500/30': member.color === 'cyan',
                    'ring-purple-500/30': member.color === 'purple',
                    'ring-emerald-500/30': member.color === 'emerald',
                    'ring-rose-500/30': member.color === 'rose',
                  }
                )}>
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors text-sm">{member.name}</h3>
                <p className="text-xs text-slate-400 mb-2">{member.role}</p>
                <p className="text-xs text-slate-500">{member.bio}</p>
              </GlassCard>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/careers">
            <Button variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />} className="text-cyan-400 hover:text-cyan-300">
              Join our team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function InvestorsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <GlassPanel variant="elevated" padding="xl" border="light" rounded="2xl">
          <div className="text-center mb-8">
            <Badge variant="warning" size="md" className="mb-4 bg-amber-500/10 border-amber-500/20 text-amber-400">
              <Building2 className="w-4 h-4 mr-2" />
              Backed By
            </Badge>
            <h3 className="text-xl font-semibold text-white">
              Leading Investors
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner) => (
              <GlassPanel
                key={partner}
                variant="solid"
                padding="sm"
                border="light"
                rounded="lg"
                className="px-6 py-3 bg-slate-800/50 text-slate-300 font-medium"
              >
                {partner}
              </GlassPanel>
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hire Card */}
          <FeatureCard gradient="cyan" shine>
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
              <UserCheck className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Need Help?</h3>
            <p className="text-slate-300 mb-6">
              Post a job and connect with verified local workers ready to help you get things done.
            </p>
            <Link href="/hiring">
              <Button variant="primary" glow rightIcon={<ArrowRight className="w-5 h-5" />}>
                Post a Job
              </Button>
            </Link>
          </FeatureCard>

          {/* Work Card */}
          <FeatureCard gradient="emerald" shine>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <Briefcase className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Looking for Work?</h3>
            <p className="text-slate-300 mb-6">
              Join thousands of workers earning on their own schedule with flexible local jobs.
            </p>
            <Link href="/work">
              <Button variant="success" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Find Jobs
              </Button>
            </Link>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen">
        <HeroSection />
        <StatsSection />
        <StorySection />
        <ValuesSection />
        <TeamSection />
        <InvestorsSection />
        <CTASection />
      </div>
    </MarketingLayout>
  )
}
