'use client'

import { useState } from 'react'
import { NavConceptA } from '@/components/navigation/NavConceptA'
import { NavConceptB } from '@/components/navigation/NavConceptB'
import { NavConceptC } from '@/components/navigation/NavConceptC'

// ============================================
// NAV CONCEPTS DEMO PAGE
// Switch between all 3 navigation concepts
// ============================================

type Concept = 'A' | 'B' | 'C'

const conceptInfo = {
  A: {
    name: 'Structured / Anchored',
    tagline: '"Professional Dock"',
    description: 'Fixed edge-to-edge top bar with distinct zones. Prioritizes predictability and muscle-memory navigation.',
    pros: ['Familiar UX pattern', 'Clear hierarchy', 'Low learning curve'],
    cons: ['Takes vertical space', 'Less modern feel'],
  },
  B: {
    name: 'Floating / Modular',
    tagline: '"Premium Island"',
    description: 'Floating pill-shaped navigation with corner-anchored elements. Modern, premium feel with maximum content space.',
    pros: ['Modern aesthetic', 'Maximum content space', 'Premium feel'],
    cons: ['More complex layout', 'Floating elements can feel disconnected'],
  },
  C: {
    name: 'Contextual / Adaptive',
    tagline: '"Smart Sidebar"',
    description: 'Collapsible vertical rail on desktop, bottom sheet on mobile. Perfect for map-heavy interfaces.',
    pros: ['Maximum horizontal space', 'Great for maps', 'Progressive disclosure'],
    cons: ['Unconventional on mobile', 'Hidden nav items'],
  },
}

export default function NavConceptsPage() {
  const [activeConcept, setActiveConcept] = useState<Concept>('A')
  const [mode, setMode] = useState<'hire' | 'work'>('hire')

  const info = conceptInfo[activeConcept]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Render the active navigation concept */}
      {activeConcept === 'A' && <NavConceptA mode={mode} routePrefix="/hiring" />}
      {activeConcept === 'B' && <NavConceptB mode={mode} routePrefix="/hiring" />}
      {activeConcept === 'C' && <NavConceptC mode={mode} routePrefix="/hiring" />}

      {/* Demo Content */}
      <div className={`${activeConcept === 'C' ? 'lg:ml-16' : ''} p-6 pt-20 md:pt-24`}>
        {/* Concept Switcher - Fixed position - Must be above all navs */}
        <div className="fixed bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 z-[100]">
          <div className="flex items-center gap-2 bg-slate-950 border border-cyan-500/30 rounded-2xl p-2 shadow-2xl shadow-cyan-500/20">
            {(['A', 'B', 'C'] as Concept[]).map((concept) => (
              <button
                key={concept}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveConcept(concept)
                }}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none ${
                  activeConcept === concept
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Concept {concept}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="fixed top-24 md:top-8 right-6 z-[100]">
          <div className="flex items-center gap-2 bg-slate-950 border border-cyan-500/30 rounded-xl p-1.5 shadow-lg">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMode('hire') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                mode === 'hire'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hire Mode
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMode('work') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                mode === 'work'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Work Mode
            </button>
          </div>
        </div>

        {/* Concept Info Card */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-slate-950 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Concept {activeConcept}: {info.name}
                </h1>
                <p className="text-lg text-cyan-400 font-medium">{info.tagline}</p>
              </div>
              <div className="text-6xl font-bold text-white/10">{activeConcept}</div>
            </div>

            <p className="text-slate-400 mb-8">{info.description}</p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">+</span>
                  Pros
                </h3>
                <ul className="space-y-2">
                  {info.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">!</span>
                  Considerations
                </h3>
                <ul className="space-y-2">
                  {info.cons.map((con, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center text-slate-500 text-sm">
            <p>Use the switcher at the bottom to change concepts.</p>
            <p>Resize your browser to see responsive behavior.</p>
          </div>

          {/* Mock Content */}
          <div className="mt-12 space-y-4">
            <h2 className="text-xl font-semibold text-white">Sample Content Area</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 border border-white/5 rounded-xl p-6 h-40 flex items-center justify-center"
                >
                  <span className="text-slate-500">Content Card {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
