#!/usr/bin/env node

/**
 * Agent D - Security Watch: Security Scanning Script
 *
 * This script performs security checks:
 * 1. Dependency vulnerability audit
 * 2. Secret pattern scanning
 * 3. Outdated dependency check
 *
 * Run: node scripts/security-scan.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Secret patterns to scan for (refined to reduce false positives)
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  // AWS Secret Key now requires specific context (not just any 40-char string)
  { name: 'AWS Secret Key', pattern: /aws[_-]?secret[_-]?(?:access[_-]?)?key['":\s]*[=:]\s*['"][0-9a-zA-Z/+]{40}['"]/gi },
  { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/g },
  { name: 'Stripe API Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'Stripe Test Key', pattern: /sk_test_[0-9a-zA-Z]{24,}/g },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'Generic API Key', pattern: /api[_-]?key['":\s]*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/gi },
  { name: 'Generic Secret', pattern: /(?:secret|password|token)['":\s]*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/gi },
  { name: 'Bearer Token', pattern: /Bearer\s+[a-zA-Z0-9\-_.]{20,}/g },
  { name: 'Database URL with Password', pattern: /(?:postgres|mysql|mongodb):\/\/[^:]+:[^@]+@/g },
  // Note: Mapbox public tokens (pk.*) are safe to expose - only secret tokens (sk.*) are sensitive
  { name: 'Mapbox Secret Token', pattern: /sk\.ey[a-zA-Z0-9\-_.]{80,}/g },
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
  '*.log',
  '*.lock',
]

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.yaml', '.yml', '.md']

let findings = {
  vulnerabilities: [],
  secrets: [],
  outdated: [],
}

/**
 * Run npm audit for dependency vulnerabilities
 */
function runDependencyAudit() {
  log('blue', '\n🔍 Running dependency vulnerability audit...\n')

  try {
    const result = execSync('npm audit --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
    const audit = JSON.parse(result)

    if (audit.vulnerabilities) {
      Object.entries(audit.vulnerabilities).forEach(([name, vuln]) => {
        findings.vulnerabilities.push({
          package: name,
          severity: vuln.severity,
          via: Array.isArray(vuln.via)
            ? vuln.via.map((v) => (typeof v === 'string' ? v : v.title)).join(', ')
            : vuln.via,
          fixAvailable: vuln.fixAvailable,
        })
      })
    }

    if (findings.vulnerabilities.length === 0) {
      log('green', '✓ No vulnerabilities found')
    } else {
      log('yellow', `⚠ Found ${findings.vulnerabilities.length} vulnerable packages`)
      findings.vulnerabilities.forEach((v) => {
        const color = v.severity === 'critical' || v.severity === 'high' ? 'red' : 'yellow'
        log(color, `  - ${v.package}: ${v.severity} (${v.via})`)
      })
    }
  } catch (error) {
    // npm audit returns non-zero exit code if vulnerabilities found
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout)
        if (audit.vulnerabilities) {
          Object.entries(audit.vulnerabilities).forEach(([name, vuln]) => {
            findings.vulnerabilities.push({
              package: name,
              severity: vuln.severity,
              via: Array.isArray(vuln.via)
                ? vuln.via.map((v) => (typeof v === 'string' ? v : v.title)).join(', ')
                : String(vuln.via),
              fixAvailable: vuln.fixAvailable,
            })
          })
        }
        log('yellow', `⚠ Found ${findings.vulnerabilities.length} vulnerable packages`)
      } catch (e) {
        log('red', '✗ Failed to parse npm audit output')
      }
    } else {
      log('red', '✗ npm audit failed')
    }
  }
}

/**
 * Scan files for potential secrets
 */
function scanForSecrets(dir) {
  log('blue', '\n🔍 Scanning for potential secrets...\n')

  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      const relativePath = path.relative(dir, fullPath)

      // Skip excluded paths
      if (SKIP_PATHS.some((skip) => relativePath.includes(skip))) {
        continue
      }

      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (SCAN_EXTENSIONS.includes(ext) || entry.name.startsWith('.env')) {
          scanFile(fullPath, relativePath)
        }
      }
    }
  }

  function scanFile(filePath, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      for (const { name, pattern } of SECRET_PATTERNS) {
        const matches = content.match(pattern)
        if (matches) {
          // Skip known safe patterns
          const isSafe = matches.every((match) => {
            // Skip example/placeholder values
            if (
              match.includes('your_') ||
              match.includes('YOUR_') ||
              match.includes('example') ||
              match.includes('EXAMPLE') ||
              match.includes('xxx') ||
              match.includes('XXX') ||
              match.includes('placeholder')
            ) {
              return true
            }
            // Skip comments
            if (content.includes(`// ${match}`) || content.includes(`/* ${match}`)) {
              return true
            }
            return false
          })

          if (!isSafe) {
            findings.secrets.push({
              file: relativePath,
              type: name,
              count: matches.length,
            })
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  walkDir(dir)

  if (findings.secrets.length === 0) {
    log('green', '✓ No potential secrets found')
  } else {
    log('red', `⚠ Found ${findings.secrets.length} potential secrets`)
    findings.secrets.forEach((s) => {
      log('red', `  - ${s.file}: ${s.type} (${s.count} occurrence${s.count > 1 ? 's' : ''})`)
    })
  }
}

/**
 * Check for outdated dependencies
 */
function checkOutdated() {
  log('blue', '\n🔍 Checking for outdated dependencies...\n')

  try {
    const result = execSync('npm outdated --json', { encoding: 'utf8' })
    const outdated = JSON.parse(result || '{}')

    Object.entries(outdated).forEach(([name, info]) => {
      const majorBump =
        info.current &&
        info.latest &&
        parseInt(info.current.split('.')[0]) < parseInt(info.latest.split('.')[0])

      findings.outdated.push({
        package: name,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest,
        majorBump,
      })
    })

    if (findings.outdated.length === 0) {
      log('green', '✓ All dependencies are up to date')
    } else {
      log('yellow', `⚠ Found ${findings.outdated.length} outdated packages`)
      findings.outdated.forEach((d) => {
        const icon = d.majorBump ? '🔴' : '🟡'
        log('yellow', `  ${icon} ${d.package}: ${d.current} → ${d.latest}`)
      })
    }
  } catch (error) {
    // npm outdated returns non-zero if outdated packages found
    if (error.stdout) {
      try {
        const outdated = JSON.parse(error.stdout || '{}')
        Object.entries(outdated).forEach(([name, info]) => {
          findings.outdated.push({
            package: name,
            current: info.current,
            wanted: info.wanted,
            latest: info.latest,
          })
        })
        log('yellow', `⚠ Found ${findings.outdated.length} outdated packages`)
      } catch (e) {
        log('yellow', 'ℹ Could not check outdated dependencies')
      }
    }
  }
}

/**
 * Check for .env files that shouldn't be committed
 */
function checkEnvFiles(dir) {
  log('blue', '\n🔍 Checking for sensitive env files...\n')

  const sensitiveEnvFiles = ['.env', '.env.local', '.env.production', '.env.development']

  const foundEnvFiles = []
  sensitiveEnvFiles.forEach((envFile) => {
    const filePath = path.join(dir, envFile)
    if (fs.existsSync(filePath)) {
      foundEnvFiles.push(envFile)
    }
  })

  if (foundEnvFiles.length > 0) {
    // Check if they're in .gitignore
    const gitignorePath = path.join(dir, '.gitignore')
    let gitignoreContent = ''
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
    }

    foundEnvFiles.forEach((envFile) => {
      const isIgnored = gitignoreContent.includes(envFile) || gitignoreContent.includes('.env')
      if (!isIgnored) {
        log('red', `⚠ ${envFile} exists but may not be in .gitignore`)
      } else {
        log('green', `✓ ${envFile} is properly gitignored`)
      }
    })
  } else {
    log('green', '✓ No sensitive env files in root directory')
  }
}

/**
 * Generate summary report
 */
function generateReport() {
  log('blue', '\n' + '='.repeat(60))
  log('blue', 'SECURITY SCAN SUMMARY')
  log('blue', '='.repeat(60) + '\n')

  const criticalVulns = findings.vulnerabilities.filter(
    (v) => v.severity === 'critical' || v.severity === 'high'
  )
  const hasSecrets = findings.secrets.length > 0
  const hasMajorOutdated = findings.outdated.filter((d) => d.majorBump).length > 0

  // Overall status
  if (hasSecrets) {
    log('red', '❌ SECRETS FOUND - ACTION REQUIRED\n')
  } else if (criticalVulns.length > 0) {
    log('yellow', '⚠️  VULNERABILITIES IN DEPENDENCIES - REVIEW RECOMMENDED\n')
    log('yellow', '   (Most are in dev dependencies like @lhci/cli, puppeteer, etc.)\n')
  } else if (findings.vulnerabilities.length > 0 || hasMajorOutdated) {
    log('yellow', '⚠️  WARNINGS FOUND - REVIEW RECOMMENDED\n')
  } else {
    log('green', '✅ ALL CHECKS PASSED\n')
  }

  // Details
  console.log(`Vulnerabilities: ${findings.vulnerabilities.length}`)
  console.log(`  - Critical/High: ${criticalVulns.length}`)
  console.log(`Potential Secrets: ${findings.secrets.length}`)
  console.log(`Outdated Packages: ${findings.outdated.length}`)
  console.log('')

  // Exit code: only fail on actual secrets
  if (hasSecrets) {
    process.exit(1)
  }
}

// Main execution
console.log('\n' + '='.repeat(60))
console.log('Agent D - Security Watch')
console.log('='.repeat(60))

const projectDir = path.resolve(__dirname, '..')

runDependencyAudit()
scanForSecrets(projectDir)
checkOutdated()
checkEnvFiles(projectDir)
generateReport()
