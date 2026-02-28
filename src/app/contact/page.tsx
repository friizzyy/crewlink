'use client'

import Link from 'next/link'
import { Mail, MessageCircle, Phone, MapPin, ArrowRight, HelpCircle, Briefcase, Shield } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge } from '@/components/ui'

// ============================================
// CONTACT PAGE - Contact form and support options
// Premium design with scroll animations
// ============================================

const contactOptions = [
  {
    icon: MessageCircle,
    title: 'Chat with us',
    description: 'Our support team typically responds within minutes during business hours.',
    action: 'Start a chat',
    href: '/help',
    color: 'cyan',
  },
  {
    icon: Mail,
    title: 'Email us',
    description: 'Send us a detailed message and we\'ll get back to you within 24 hours.',
    action: 'hello@crewlink.com',
    href: 'mailto:hello@crewlink.com',
    color: 'emerald',
  },
  {
    icon: Phone,
    title: 'Call us',
    description: 'Available Monday to Friday, 9am to 6pm Pacific Time.',
    action: '1-800-CREWLINK',
    href: 'tel:1-800-CREWLINK',
    color: 'purple',
  },
]

const quickLinks = [
  { icon: HelpCircle, title: 'Help Center', description: 'Find answers to common questions', href: '/help' },
  { icon: Shield, title: 'Safety', description: 'Report a safety concern', href: '/safety' },
  { icon: Briefcase, title: 'Careers', description: 'Join our team', href: '/careers' },
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-36 pb-16 sm:pt-44 sm:pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '0ms' }}>
          <Badge variant="brand" size="md" className="mb-10">
            <Mail className="w-4 h-4 mr-2" />
            Get in touch
          </Badge>
        </div>

        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          We&apos;d love to hear from you
        </h1>

        <p className={`mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          Have a question, feedback, or just want to say hi? We&apos;re here to help.
        </p>
      </div>
    </section>
  )
}

function ContactOptions() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      hover: 'hover:border-cyan-500/40',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      hover: 'hover:border-emerald-500/40',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      hover: 'hover:border-purple-500/40',
    },
  }

  return (
    <section ref={ref} className="py-12">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-3 gap-6">
          {contactOptions.map((option, i) => {
            const colors = colorMap[option.color as keyof typeof colorMap]
            const gradientMap: Record<string, 'cyan' | 'emerald' | 'purple'> = {
              cyan: 'cyan',
              emerald: 'emerald',
              purple: 'purple',
            }
            return (
              <a key={option.title} href={option.href}>
                <GlassCard
                  interactive
                  padding="lg"
                  rounded="xl"
                  className={`group ${getRevealClasses(isVisible, 'up')}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-4`}>
                    <option.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{option.description}</p>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${colors.text}`}>
                    {option.action}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </GlassCard>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ContactForm() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <GlassPanel
          variant="elevated"
          padding="xl"
          border="glow"
          rounded="2xl"
          className={getRevealClasses(isVisible, 'up')}
        >
          <h2 className="font-display text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Send us a message
            </span>
          </h2>
          <p className="text-slate-400 mb-8">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>

          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
              <select
                id="subject"
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none"
              >
                <option value="">Select a topic</option>
                <option value="general">General inquiry</option>
                <option value="support">Technical support</option>
                <option value="billing">Billing question</option>
                <option value="partnership">Partnership opportunity</option>
                <option value="press">Press inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea
                id="message"
                rows={5}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" glow>
              Send message
            </Button>
          </form>
        </GlassPanel>
      </div>
    </section>
  )
}

function QuickLinks() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className={`font-display text-2xl font-bold mb-8 text-center ${getRevealClasses(isVisible, 'up')}`}>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Looking for something else?
          </span>
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {quickLinks.map((link, i) => (
            <Link
              key={link.title}
              href={link.href}
              className={`group flex items-center gap-4 p-4 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${80 + i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <link.icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">{link.title}</h3>
                <p className="text-xs text-slate-500">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function OfficeSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <GlassPanel
          variant="elevated"
          padding="xl"
          border="light"
          rounded="2xl"
          className={getRevealClasses(isVisible, 'up')}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Our office</h3>
              <p className="text-slate-400 leading-relaxed">
                548 Market Street, Suite 95000<br />
                San Francisco, CA 94104<br />
                United States
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

export default function ContactPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <ContactOptions />
      <ContactForm />
      <QuickLinks />
      <OfficeSection />
    </MarketingLayout>
  )
}
