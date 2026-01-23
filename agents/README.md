# CrewLink Agent System

Automated quality assurance, consistency, and maintenance agents for the CrewLink platform.

## Overview

This folder contains 5 specialized agents that can be run locally or in CI to ensure code quality:

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Agent A** | QA Sentinel - Dead buttons, broken nav, flow breakage | PRs, nightly |
| **Agent B** | UI Consistency - Visual regression, theme enforcement | PRs |
| **Agent C** | Performance Auditor - Lighthouse, bundle analysis | PRs, nightly |
| **Agent D** | Security Watch - Dependency audit, secret scanning | Weekly, dependency changes |
| **Agent E** | Copy Polish - Tone consistency, microcopy quality | On demand |

## Quick Start

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers
npx playwright install

# Run all agents
npm run agents:all

# Run individual agents
npm run test:qa          # Agent A - QA Sentinel
npm run test:visual      # Agent B - Visual Regression
npm run audit:perf       # Agent C - Performance
npm run audit:security   # Agent D - Security
npm run audit:copy       # Agent E - Copy
```

## Agent Details

### Agent A - QA Sentinel

**Purpose:** Detect dead buttons, broken navigation, and flow breakage.

**How it works:**
1. Reads the click targets registry (`src/qa/clickTargets.ts`)
2. Visits each critical route
3. Clicks each registered `data-qa` element
4. Verifies expected outcomes (navigation, modal, toast, etc.)
5. Takes screenshots on failure

**Files:**
- `tests/qa/critical-clicks.spec.ts` - Click verification tests
- `tests/qa/routes-smoke.spec.ts` - Route accessibility tests
- `src/qa/clickTargets.ts` - Registry of all testable elements

**Adding new elements:**
1. Add `data-qa="your-element-id"` attribute to the element
2. Register in `src/qa/clickTargets.ts`
3. Run `npm run test:qa` to verify

### Agent B - UI Consistency Enforcer

**Purpose:** Enforce visual consistency and catch unintended UI changes.

**How it works:**
1. Takes screenshots of key screens
2. Compares against baseline images
3. Reports pixel differences above threshold
4. Verifies theme token usage

**Files:**
- `tests/visual/screenshots.spec.ts` - Screenshot comparison tests
- `tests/visual/theme-consistency.spec.ts` - Theme verification
- `src/design/tokens.ts` - Design token definitions

### Agent C - Performance Auditor

**Purpose:** Monitor performance metrics and prevent regressions.

**How it works:**
1. Runs Lighthouse CI against key pages
2. Measures Core Web Vitals
3. Analyzes bundle size
4. Reports against thresholds

**Files:**
- `lighthouserc.json` - Lighthouse CI configuration
- `tests/performance/` - Performance test files

### Agent D - Security Watch

**Purpose:** Identify security vulnerabilities and leaked secrets.

**How it works:**
1. Runs `npm audit` for dependency vulnerabilities
2. Scans codebase for potential secrets
3. Checks for outdated dependencies
4. Reports findings with severity levels

**Files:**
- `scripts/security-scan.js` - Security scanning script
- `.github/workflows/security-watch.yml` - CI workflow

### Agent E - Copy Polish

**Purpose:** Ensure consistent voice and tone across all copy.

**How it works:**
1. Scans all text content in components
2. Checks against tone rules (luxury, concise, human)
3. Identifies AI-ish phrases and inconsistencies
4. Suggests improvements

**Files:**
- `agents/docs/copy-voice.md` - Voice guidelines
- `scripts/copy-scan.js` - Copy analysis script

## CI Integration

All agents are integrated with GitHub Actions:

- **On PR:** Agents A, B, C run automatically
- **On merge to main:** Full agent suite runs
- **Weekly:** Agent D (Security) runs
- **On demand:** Agent E (Copy) can be triggered manually

## Configuration

### Thresholds

Performance thresholds are configured in `lighthouserc.json`:
- Performance: 70+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 80+

Visual regression threshold: 100 pixels max difference

### Customization

To adjust agent behavior:
1. Edit the relevant configuration file
2. Update thresholds in CI workflow
3. Run agents locally to verify changes

## Troubleshooting

### Tests failing locally

1. Ensure dev server is running: `npm run dev`
2. Check Playwright is installed: `npx playwright install`
3. Verify all data-qa attributes exist

### Visual regression false positives

1. Update baseline: `npm run test:visual -- --update-snapshots`
2. Review changes carefully before committing

### Performance test flakiness

1. Run with more retries: `npm run audit:perf -- --retries=3`
2. Check network conditions
3. Consider increasing thresholds for CI

## Contributing

When adding new features:

1. **Add data-qa attributes** to all interactive elements
2. **Register in clickTargets.ts** with expected outcomes
3. **Add visual test** if introducing new UI patterns
4. **Document** any new patterns in design tokens
5. **Run full agent suite** before PR: `npm run agents:all`
