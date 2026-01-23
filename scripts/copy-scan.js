#!/usr/bin/env node

/**
 * Agent E - Copy Polish: Content Analysis Script
 *
 * This script scans the codebase for copy/microcopy issues:
 * 1. AI-ish phrases that should be avoided
 * 2. Inconsistent capitalization
 * 3. Placeholder text that wasn't replaced
 * 4. Overly long strings
 *
 * Run: node scripts/copy-scan.js
 */

const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// AI-ish phrases to flag
const AI_PHRASES = [
  { pattern: /in today's fast-paced/gi, replacement: 'Currently' },
  { pattern: /whether you're looking to/gi, replacement: 'If you want to' },
  { pattern: /we understand that/gi, replacement: '(remove)' },
  { pattern: /at \w+, we believe/gi, replacement: '(state directly)' },
  { pattern: /our state-of-the-art/gi, replacement: 'Our' },
  { pattern: /rest assured/gi, replacement: '(remove)' },
  { pattern: /with our innovative/gi, replacement: 'With our' },
  { pattern: /your satisfaction is our/gi, replacement: '(remove)' },
  { pattern: /we're committed to/gi, replacement: '(state directly)' },
  { pattern: /take .+ to the next level/gi, replacement: 'Improve' },
  { pattern: /unlock your potential/gi, replacement: '(be specific)' },
  { pattern: /empowering you to/gi, replacement: 'Helping you' },
  { pattern: /seamless experience/gi, replacement: 'Easy to use' },
  { pattern: /frictionless/gi, replacement: 'Simple' },
  { pattern: /robust/gi, replacement: 'Strong' },
  { pattern: /leverage/gi, replacement: 'Use' },
  { pattern: /utilize/gi, replacement: 'Use' },
  { pattern: /synergy/gi, replacement: '(be specific)' },
  { pattern: /ecosystem/gi, replacement: '(be specific)' },
  { pattern: /paradigm/gi, replacement: '(be specific)' },
  { pattern: /disrupt/gi, replacement: 'Change' },
  { pattern: /revolutionize/gi, replacement: 'Improve' },
  { pattern: /best-in-class/gi, replacement: '(be specific)' },
  { pattern: /world-class/gi, replacement: '(be specific)' },
  { pattern: /cutting-edge/gi, replacement: 'Modern' },
  { pattern: /game-changer/gi, replacement: '(be specific)' },
  { pattern: /holistic/gi, replacement: 'Complete' },
  { pattern: /curated/gi, replacement: 'Selected' },
  { pattern: /bespoke/gi, replacement: 'Custom' },
]

// Placeholder text patterns
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/gi,
  /\[placeholder\]/gi,
  /\[todo\]/gi,
  /XXX/g,
  /FIXME/g,
  /TBD/g,
  /coming soon/gi,
  /TODO:/g,
]

// Files/directories to skip
const SKIP_PATHS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'playwright-report',
  'test-results',
  'scripts',
  '__tests__',
  '*.test.',
  '*.spec.',
  '*.d.ts',
  '*.config.',
]

// File extensions to scan
const SCAN_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js']

let findings = {
  aiPhrases: [],
  placeholders: [],
  longStrings: [],
  capsIssues: [],
}

/**
 * Extract string literals from file content
 */
function extractStrings(content, filePath) {
  const strings = []

  // Match string literals (both single and double quotes)
  const stringPatterns = [
    /"([^"\\]|\\.)*"/g, // Double quotes
    /'([^'\\]|\\.)*'/g, // Single quotes
    /`([^`\\]|\\.)*`/g, // Template literals
  ]

  // Also match JSX text content (text between tags)
  const jsxTextPattern = />([^<>{]+)</g

  stringPatterns.forEach((pattern) => {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const str = match[0].slice(1, -1) // Remove quotes
      if (str.length > 3 && !/^[\s\n]*$/.test(str)) {
        // Skip imports, requires, and code-like content
        if (
          !str.startsWith('@/') &&
          !str.startsWith('./') &&
          !str.startsWith('../') &&
          !str.includes('className') &&
          !/^[a-z-]+$/.test(str) && // Skip simple identifiers
          !/^\d+$/.test(str) // Skip numbers
        ) {
          strings.push({
            value: str,
            line: content.substring(0, match.index).split('\n').length,
          })
        }
      }
    }
  })

  // JSX text
  const jsxMatches = content.matchAll(jsxTextPattern)
  for (const match of jsxMatches) {
    const str = match[1].trim()
    if (str.length > 3) {
      strings.push({
        value: str,
        line: content.substring(0, match.index).split('\n').length,
      })
    }
  }

  return strings
}

/**
 * Check string for AI-ish phrases
 */
function checkAiPhrases(str, file, line) {
  for (const { pattern, replacement } of AI_PHRASES) {
    if (pattern.test(str)) {
      pattern.lastIndex = 0 // Reset regex
      findings.aiPhrases.push({
        file,
        line,
        text: str.substring(0, 80),
        issue: `Contains: "${str.match(pattern)[0]}"`,
        suggestion: replacement,
      })
      return true
    }
  }
  return false
}

/**
 * Check for placeholder text
 */
function checkPlaceholders(str, file, line) {
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(str)) {
      pattern.lastIndex = 0
      findings.placeholders.push({
        file,
        line,
        text: str.substring(0, 80),
        issue: `Contains placeholder: "${str.match(pattern)[0]}"`,
      })
      return true
    }
  }
  return false
}

/**
 * Check for overly long strings (UI copy should be concise)
 */
function checkLength(str, file, line) {
  // Skip strings that look like code or paths
  if (str.includes('{') || str.includes('=>') || str.includes('http')) {
    return false
  }

  // Check for overly long single strings (> 150 chars likely needs editing)
  if (str.length > 150) {
    findings.longStrings.push({
      file,
      line,
      text: str.substring(0, 100) + '...',
      length: str.length,
    })
    return true
  }
  return false
}

/**
 * Check for capitalization inconsistencies
 */
function checkCapitalization(str, file, line) {
  // Check for ALL CAPS (except acronyms)
  const allCapsPattern = /\b[A-Z]{4,}\b/g
  const matches = str.match(allCapsPattern)
  if (matches) {
    const nonAcronyms = matches.filter(
      (m) =>
        !['TODO', 'FIXME', 'NOTE', 'API', 'URL', 'GPS', 'HTML', 'CSS', 'JSON', 'HTTP'].includes(m)
    )
    if (nonAcronyms.length > 0) {
      findings.capsIssues.push({
        file,
        line,
        text: str.substring(0, 80),
        issue: `ALL CAPS: ${nonAcronyms.join(', ')}`,
      })
      return true
    }
  }

  // Check for excessive exclamation marks
  const exclamationCount = (str.match(/!/g) || []).length
  if (exclamationCount > 1) {
    findings.capsIssues.push({
      file,
      line,
      text: str.substring(0, 80),
      issue: `Multiple exclamation marks (${exclamationCount})`,
    })
    return true
  }

  return false
}

/**
 * Scan a single file
 */
function scanFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const strings = extractStrings(content, relativePath)

    for (const { value, line } of strings) {
      checkAiPhrases(value, relativePath, line)
      checkPlaceholders(value, relativePath, line)
      checkLength(value, relativePath, line)
      checkCapitalization(value, relativePath, line)
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

/**
 * Walk directory and scan files
 */
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(projectDir, fullPath)

    // Skip excluded paths
    if (SKIP_PATHS.some((skip) => relativePath.includes(skip))) {
      continue
    }

    if (entry.isDirectory()) {
      walkDir(fullPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (SCAN_EXTENSIONS.includes(ext)) {
        scanFile(fullPath, relativePath)
      }
    }
  }
}

/**
 * Print findings
 */
function printFindings() {
  log('blue', '\n' + '='.repeat(60))
  log('blue', 'COPY ANALYSIS RESULTS')
  log('blue', '='.repeat(60))

  // AI Phrases
  log('magenta', `\n📝 AI-ish Phrases Found: ${findings.aiPhrases.length}`)
  if (findings.aiPhrases.length > 0) {
    findings.aiPhrases.slice(0, 10).forEach((f) => {
      log('yellow', `\n  ${f.file}:${f.line}`)
      console.log(`    "${f.text}"`)
      console.log(`    Issue: ${f.issue}`)
      console.log(`    Suggestion: ${f.suggestion}`)
    })
    if (findings.aiPhrases.length > 10) {
      console.log(`    ... and ${findings.aiPhrases.length - 10} more`)
    }
  }

  // Placeholders
  log('magenta', `\n📌 Placeholder Text Found: ${findings.placeholders.length}`)
  if (findings.placeholders.length > 0) {
    findings.placeholders.forEach((f) => {
      log('red', `  ${f.file}:${f.line} - ${f.issue}`)
    })
  }

  // Long Strings
  log('magenta', `\n📏 Overly Long Strings: ${findings.longStrings.length}`)
  if (findings.longStrings.length > 0) {
    findings.longStrings.slice(0, 5).forEach((f) => {
      log('yellow', `  ${f.file}:${f.line} (${f.length} chars)`)
      console.log(`    "${f.text}"`)
    })
    if (findings.longStrings.length > 5) {
      console.log(`    ... and ${findings.longStrings.length - 5} more`)
    }
  }

  // Capitalization
  log('magenta', `\n🔤 Capitalization Issues: ${findings.capsIssues.length}`)
  if (findings.capsIssues.length > 0) {
    findings.capsIssues.slice(0, 5).forEach((f) => {
      log('yellow', `  ${f.file}:${f.line} - ${f.issue}`)
    })
    if (findings.capsIssues.length > 5) {
      console.log(`    ... and ${findings.capsIssues.length - 5} more`)
    }
  }

  // Summary
  log('blue', '\n' + '='.repeat(60))
  log('blue', 'SUMMARY')
  log('blue', '='.repeat(60))

  const total =
    findings.aiPhrases.length +
    findings.placeholders.length +
    findings.longStrings.length +
    findings.capsIssues.length

  if (findings.placeholders.length > 0) {
    log('red', `\n❌ ${findings.placeholders.length} placeholder(s) need to be replaced!`)
  }

  if (findings.aiPhrases.length > 0) {
    log('yellow', `\n⚠️  ${findings.aiPhrases.length} AI-ish phrase(s) could be improved`)
  }

  if (total === 0) {
    log('green', '\n✅ Copy looks great! No issues found.')
  } else {
    console.log(`\nTotal issues: ${total}`)
    console.log('See agents/docs/copy-voice.md for style guidelines.')
  }

  // Exit with error if placeholders found (they should never ship)
  if (findings.placeholders.length > 0) {
    process.exit(1)
  }
}

// Main execution
console.log('\n' + '='.repeat(60))
console.log('Agent E - Copy Polish')
console.log('='.repeat(60))

const projectDir = path.resolve(__dirname, '..')
const srcDir = path.join(projectDir, 'src')

log('blue', '\nScanning source files...\n')
walkDir(srcDir)
printFindings()
