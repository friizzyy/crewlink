# CrewLink

Premium gig economy platform connecting hirers with verified workers.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Maps:** Mapbox GL / Leaflet
- **Database:** Prisma
- **Testing:** Playwright

---

## Agent System

This repository includes an automated quality assurance system with 5 specialized agents.

### Available Agents

| Agent | Purpose | Command |
|-------|---------|---------|
| **A - QA Sentinel** | Dead buttons, broken nav, flow breakage | `npm run test:qa` |
| **B - UI Enforcer** | Visual regression, theme consistency | `npm run test:visual` |
| **C - Performance** | Lighthouse, bundle analysis, web vitals | `npm run audit:perf` |
| **D - Security** | Dependency audit, secret scanning | `npm run audit:security` |
| **E - Copy Polish** | Tone consistency, microcopy quality | `npm run audit:copy` |

### Running Agents

```bash
# Run all agents (full suite)
npm run agents:all

# Quick check (QA + Security only)
npm run agents:quick

# Individual agents
npm run test:qa          # Agent A
npm run test:visual      # Agent B
npm run audit:perf       # Agent C (requires build first)
npm run audit:security   # Agent D
npm run audit:copy       # Agent E
```

### First Time Setup

```bash
# Install Playwright browsers
npx playwright install

# Run tests
npm run test:qa
```

### CI Integration

Agents run automatically via GitHub Actions:

- **On PR:** Agents A, B, C
- **On merge to main:** Full suite
- **Weekly:** Security audit
- **Nightly:** Performance check

See `.github/workflows/` for workflow configurations.

---

## Adding New Interactive Elements

When adding new buttons, links, or interactive elements:

### 1. Add data-qa attribute

```tsx
<button data-qa="my-new-button" onClick={handleClick}>
  Click Me
</button>
```

### 2. Register in click targets

Edit `src/qa/clickTargets.ts`:

```typescript
export const myTargets: ClickTarget[] = [
  {
    selector: 'my-new-button',
    name: 'My New Button',
    category: 'cta',
    outcome: { type: 'route', path: '/destination' },
    visibleOn: ['/current-page'],
    critical: true,
  },
]
```

### 3. Verify with tests

```bash
npm run test:qa
```

---

## Design System

### Tokens

Design tokens are defined in `src/design/tokens.ts`:

```typescript
import { colors, spacing, typography } from '@/design/tokens'
```

### Theme Checklist

Before merging UI changes, verify against `agents/docs/theme-checklist.md`.

### Key Rules

- **Background:** `bg-slate-950` (primary), `bg-slate-900` (secondary)
- **Accent:** `cyan-500` (primary), `blue-600` (secondary)
- **Text:** `text-white` (primary), `text-slate-400` (secondary)
- **Border radius:** `rounded-xl` (buttons), `rounded-2xl` (cards)
- **Animations:** Never modify existing animations without approval

---

## Copy Guidelines

See `agents/docs/copy-voice.md` for full guidelines.

### Quick Rules

- **Tone:** Premium, calm, human
- **Avoid:** AI-ish phrases, jargon, ALL CAPS
- **CTAs:** Use action verbs (Post Job, Find Work)
- **Errors:** Tell what happened AND what to do

---

## Project Structure

```
crewlink-full-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── design/           # Design tokens
│   ├── qa/               # Click targets registry
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── tests/
│   ├── qa/               # Agent A tests
│   ├── visual/           # Agent B tests
│   └── performance/      # Agent C tests
├── agents/
│   ├── docs/             # Agent documentation
│   └── README.md         # Agent system overview
├── scripts/
│   ├── security-scan.js  # Agent D script
│   └── copy-scan.js      # Agent E script
└── .github/workflows/    # CI configurations
```

---

## Scripts Reference

### Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Testing

```bash
npm run test:e2e     # All Playwright tests
npm run test:e2e:ui  # Playwright UI mode
npm run test:qa      # QA Sentinel tests
npm run test:visual  # Visual regression
npm run test:perf    # Performance tests
```

### Audits

```bash
npm run audit:perf     # Lighthouse CI
npm run audit:security # Security scan
npm run audit:copy     # Copy analysis
npm run agents:all     # Full agent suite
npm run agents:quick   # Quick checks
```

---

## Environment Variables

Create `.env.local` with:

```env
# Database
DATABASE_URL="postgresql://..."

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk...."

# Optional: Role toggle for QA
NEXT_PUBLIC_ENABLE_ROLE_TOGGLE="true"
```

---

## Deployment

### Vercel (Recommended)

1. Connect repository
2. Set environment variables
3. Deploy

### Manual

```bash
npm run build
npm run start
```

---

## Contributing

1. Create feature branch from `develop`
2. Add `data-qa` attributes to new interactive elements
3. Run `npm run agents:quick` before PR
4. Ensure CI passes
5. Request review

---

## License

Private - All rights reserved
