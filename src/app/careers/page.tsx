'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Globe, ChevronDown, Mail } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { JOB_ROLES, getAllDepartments, getAllLocations, filterRoles } from '@/lib/careers'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge } from '@/components/ui'

// ============================================
// CAREERS PAGE - Job listings and company culture
// Premium design with scroll animations
// ============================================

const benefits = [
  { icon: Heart, title: 'Health & wellness', description: 'Full medical, dental, and vision coverage for you and your family', gradient: 'cyan' as const },
  { icon: Clock, title: 'Flexible schedule', description: 'Work when you\'re most productive. We trust you to manage your time', gradient: 'purple' as const },
  { icon: Globe, title: 'Remote-first', description: 'Work from anywhere. Our team spans multiple time zones', gradient: 'emerald' as const },
  { icon: Zap, title: 'Growth budget', description: '$2,000 annual stipend for learning, conferences, and courses', gradient: 'amber' as const },
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-36 pb-20 sm:pt-44 sm:pb-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '0ms' }}>
          <Badge variant="success" size="md" className="mb-10">
            <Briefcase className="w-4 h-4 mr-2" />
            We&apos;re hiring
          </Badge>
        </div>

        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          <span className="text-white">Build something that </span>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">matters</span>
        </h1>

        <p className={`mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          Join a team that&apos;s changing how local work happens. We&apos;re looking for people who want to make a real impact.
        </p>

        <div className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '240ms' }}>
          <a href="#openings">
            <Button variant="success" size="lg" glow rightIcon={<ArrowRight className="w-5 h-5" />}>
              View open positions
            </Button>
          </a>
          <a href="mailto:careers@crewlink.com?subject=General%20Inquiry">
            <Button variant="secondary" size="lg" leftIcon={<Mail className="w-5 h-5" />}>
              Contact recruiting
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className={`font-display text-3xl sm:text-4xl font-bold tracking-tight ${getRevealClasses(isVisible, 'up')}`}>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Why join CrewLink
            </span>
          </h2>
          <p className={`mt-4 text-lg text-slate-500 max-w-xl mx-auto ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
            We take care of our team so they can take care of our users
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <FeatureCard
              key={benefit.title}
              gradient={benefit.gradient}
              shine
              className={getRevealClasses(isVisible, 'up')}
              style={{ transitionDelay: `${160 + i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// Filter dropdown component
function FilterDropdown({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-white hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-slate-400">{label}:</span>
        <span className="font-medium">{value === 'all' ? 'All' : value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50" role="listbox">
          <button
            onClick={() => { onChange('all'); setIsOpen(false); }}
            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${value === 'all' ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'}`}
            role="option"
            aria-selected={value === 'all'}
          >
            All
          </button>
          {options.map(option => (
            <button
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${value === option ? 'text-emerald-400 bg-emerald-500/10' : 'text-white'}`}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function OpeningsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const filteredRoles = useMemo(() => {
    return filterRoles({
      department: departmentFilter,
      location: locationFilter,
    })
  }, [departmentFilter, locationFilter])

  const departments = getAllDepartments()
  const locations = getAllLocations()

  return (
    <section ref={ref} id="openings" className="py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className={`font-display text-3xl sm:text-4xl font-bold text-white tracking-tight ${getRevealClasses(isVisible, 'up')}`}>
            Open positions
          </h2>
          <p className={`mt-4 text-lg text-slate-500 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
            {filteredRoles.length} {filteredRoles.length === 1 ? 'role' : 'roles'} available
          </p>
        </div>

        {/* Filters */}
        <div className={`flex flex-wrap gap-3 mb-8 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '120ms' }}>
          <FilterDropdown
            label="Department"
            value={departmentFilter}
            options={departments}
            onChange={setDepartmentFilter}
          />
          <FilterDropdown
            label="Location"
            value={locationFilter}
            options={locations}
            onChange={setLocationFilter}
          />
          {(departmentFilter !== 'all' || locationFilter !== 'all') && (
            <button
              onClick={() => { setDepartmentFilter('all'); setLocationFilter('all'); }}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredRoles.length === 0 ? (
            <div className={`p-8 text-center ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
              <p className="text-slate-400">No roles match your filters. Try adjusting your criteria.</p>
            </div>
          ) : (
            filteredRoles.map((job, i) => (
              <Link
                key={job.slug}
                href={`/careers/${job.slug}`}
                className={`group block ${getRevealClasses(isVisible, 'up')}`}
                style={{ transitionDelay: `${160 + i * 60}ms` }}
              >
              <GlassCard interactive padding="lg" rounded="xl" className="hover:translate-y-[-2px] hover:border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </GlassCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <GlassPanel
          variant="elevated"
          padding="none"
          border="light"
          rounded="2xl"
          className={`relative overflow-hidden p-10 sm:p-14 text-center border-emerald-500/20 ${getRevealClasses(isVisible, 'scale')}`}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Don&apos;t see the right role?
              </span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll reach out when we have a match.
            </p>
            <a href="mailto:careers@crewlink.com?subject=General%20Application&body=Hi%20CrewLink%20team%2C%0A%0AI'm%20interested%20in%20opportunities%20at%20CrewLink.%0A%0A[Please%20attach%20your%20resume%20and%20share%20a%20bit%20about%20yourself]">
              <Button variant="secondary" size="lg" leftIcon={<Mail className="w-5 h-5" />}>
                Get in touch
              </Button>
            </a>
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

export default function CareersPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <BenefitsSection />
      <OpeningsSection />
      <CTASection />
    </MarketingLayout>
  )
}
