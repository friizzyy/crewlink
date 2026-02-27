# CrewLink Deployment Guide

**Framework:** Next.js 14 (App Router)
**Hosting:** Vercel
**Database:** PostgreSQL via Neon + Prisma ORM
**CI/CD:** GitHub Actions
**Last Updated:** 2026-02-27

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup & Migrations](#database-setup--migrations)
4. [Vercel Configuration](#vercel-configuration)
5. [GitHub Actions CI/CD](#github-actions-cicd)
6. [Build & Deployment Process](#build--deployment-process)
7. [Production Readiness](#production-readiness)
8. [Monitoring & Error Tracking](#monitoring--error-tracking)
9. [Rollback Procedures](#rollback-procedures)
10. [Security Hardening](#security-hardening)

---

## Pre-Deployment Checklist

Before deploying CrewLink to production, verify the following:

### Code & Git
- [ ] All feature branches merged to `main`
- [ ] Latest commit passes all CI/CD checks (GitHub Actions)
- [ ] No console errors or warnings in development build
- [ ] Commit history is clean and descriptive

### Environment & Secrets
- [ ] All environment variables are set in Vercel dashboard
- [ ] `NEXTAUTH_SECRET` is a strong, randomly generated string (minimum 32 characters)
- [ ] `DATABASE_URL` connects to production Neon database
- [ ] `NEXT_PUBLIC_ENABLE_ROLE_TOGGLE` is explicitly set to `false`
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` is restricted to production domains only
- [ ] No secrets committed to repository (check with `git log -p` or `.env` files)

### Database
- [ ] Production Neon database is created and accessible
- [ ] Latest Prisma migrations have been applied
- [ ] Database backups are configured (see [Database Backups](#database-backups))
- [ ] Connection pooling is enabled on Neon (pgbouncer for serverless)
- [ ] Seed script tested but NOT enabled for production

### Testing
- [ ] All test suites pass: `npm run test:qa`, `npm run test:e2e`
- [ ] Visual tests pass: `npm run test:visual`
- [ ] Performance baseline established: `npm run test:perf`
- [ ] Security audit passed: `npm run audit:security`
- [ ] Copy audit passed: `npm run audit:copy`
- [ ] Full agent suite passes: `npm run agents:all`

### Build & Performance
- [ ] Production build succeeds: `npm run build`
- [ ] Build size is optimized (check Next.js build output for warnings)
- [ ] Lighthouse scores meet targets (CI config: `lighthouserc.json`)
- [ ] No unoptimized images (all external images in `next.config.js` domain whitelist)
- [ ] Server Actions payload size doesn't exceed 2MB limit

### Third-Party Services
- [ ] Mapbox token created and scoped to production domain
- [ ] Mapbox usage limits reviewed to avoid overage charges
- [ ] Vercel project linked to correct GitHub repository
- [ ] Vercel billing plan supports production traffic

---

## Environment Configuration

### Environment Variables Reference

Create these variables in the Vercel dashboard under **Settings > Environment Variables**.

#### Required Variables (All Environments)

| Variable | Value | Source | Notes |
|----------|-------|--------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Neon dashboard | Format: `postgresql://user:password@host/database?schema=public` |
| `NEXTAUTH_SECRET` | Secure random string (32+ chars) | Generate locally | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL for authentication | Vercel environment | Production: `https://crewlink.vercel.app` or custom domain |
| `NEXT_PUBLIC_APP_URL` | Public-facing application URL | Vercel environment | Must include protocol (https://) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL API key | Mapbox dashboard | Restrict to production domain in Mapbox settings |

#### Auto-Set by Vercel

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_VERCEL_URL` | Preview/production domain |
| `VERCEL_ENV` | `production`, `preview`, or `development` |
| `VERCEL_GIT_COMMIT_SHA` | Git commit hash for deployment |

#### Feature Flags

| Variable | Production | Staging | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_ENABLE_ROLE_TOGGLE` | `false` | `true` | `true` |

**Critical:** The role toggle must be disabled in production to prevent unauthorized role escalation. This is a dev/QA-only feature.

#### Optional Variables (Recommended)

| Variable | Purpose | Example |
|----------|---------|---------|
| `SENTRY_AUTH_TOKEN` | Error tracking setup | From Sentry dashboard |
| `SENTRY_ORG` | Sentry organization slug | `your-org` |
| `SENTRY_PROJECT` | Sentry project slug | `crewlink` |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Track environment in Sentry | `production` |

### Local Development (.env.local)

Create `.env.local` in the project root for local development:

```env
# Database (use Neon staging database or local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/crewlink_dev

# NextAuth
NEXTAUTH_SECRET=your-local-dev-secret-here
NEXTAUTH_URL=http://localhost:3000

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-dev-token

# Feature Flags
NEXT_PUBLIC_ENABLE_ROLE_TOGGLE=true
```

**Never commit `.env.local` to git.** Add it to `.gitignore`.

### .env.example (Recommended)

Create `.env.example` in the project root for documentation:

```env
# .env.example - Copy to .env.local and fill in actual values

# Database Connection
DATABASE_URL=postgresql://user:password@host:5432/database_name

# NextAuth Configuration
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Feature Flags
NEXT_PUBLIC_ENABLE_ROLE_TOGGLE=false
```

---

## Database Setup & Migrations

### Neon PostgreSQL Setup

#### Create Production Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project named `crewlink-prod`
3. Create a database named `crewlink` (or use default)
4. Copy the connection string: `postgresql://user:password@host/database`
5. Enable "Connection Pooling" (pgbouncer) for serverless environments:
   - Pool Mode: `Transaction`
   - Pool Size: `10` (default, adjust based on load testing)

#### Connection Pooling for Serverless

Neon's connection pooling is essential for Next.js on Vercel because serverless functions create many short-lived connections.

**In `DATABASE_URL`, append pooling parameters:**

```
postgresql://user:password@host/database?schema=public&sslmode=require&connection_limit=5
```

Prisma will respect the `connection_limit` parameter for serverless environments.

### Prisma Schema & Migrations

#### Apply Migrations to Production

1. **Dry run** (verify changes without applying):
   ```bash
   npm run db:push -- --skip-generate
   ```

2. **Apply migrations:**
   ```bash
   npm run db:push
   ```

   This command:
   - Generates Prisma Client
   - Pushes schema changes to the database
   - Creates/alters tables as needed
   - **Does not** run seed script

#### Generate Prisma Client

Prisma Client is auto-generated during build via `next.config.js` postinstall hook:

```bash
# Manual generation if needed
npm run db:generate
```

#### Seed Database (Development Only)

The seed script at `prisma/seed.ts` should only run in development/staging:

```bash
# Only in development
npm run db:seed
```

**Production:** Disable seeding by:
- Not including seed execution in production deployment scripts
- Or by checking `process.env.NODE_ENV` in `seed.ts` and exiting early

### Database Backups

#### Neon Automatic Backups

Neon provides automatic daily backups on the Professional plan. Verify:

1. Go to Neon Console > **Backups**
2. Confirm backup frequency (daily for Professional tier)
3. Note retention period (typically 7 days)

#### Manual Backup Strategy

For critical data:

```bash
# Backup database to SQL file
pg_dump $DATABASE_URL > crewlink-backup-$(date +%Y-%m-%d).sql

# Compress and store (e.g., AWS S3, Google Cloud Storage)
tar -czf crewlink-backup-$(date +%Y-%m-%d).sql.tar.gz crewlink-backup-*.sql
```

#### Restore from Backup

```bash
# Restore from SQL backup
psql $DATABASE_URL < crewlink-backup-2026-02-27.sql
```

### Database Maintenance

#### Monitor Query Performance

Use Prisma Studio to inspect data and run queries:

```bash
npm run db:studio
```

#### Connection Limit Monitoring

Monitor active connections in Neon Console:
- Settings > **Connection limits**
- Alert threshold: Set to 80% of max connections

---

## Vercel Configuration

### Project Setup in Vercel

1. **Connect GitHub Repository:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New" > "Project"
   - Select `crewlink` repository
   - Vercel auto-detects Next.js framework

2. **Configure Build Settings:**
   - **Build Command:** `prisma generate && next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. **Set Environment Variables:**
   - Add all variables from [Environment Configuration](#environment-configuration)
   - Use "Encrypt for Preview Deployments" for sensitive variables

### Vercel Project Settings

#### Domains & SSL

- **Production Domain:** Add custom domain (e.g., `crewlink.yourcompany.com`)
- **SSL:** Automatic via Vercel (no configuration needed)
- **SSL Provider:** Let's Encrypt + Vercel Edge Network

#### Edge Middleware (Optional)

For advanced routing, create `middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Example: Redirect old /app/* routes to /hiring/*
  if (request.nextUrl.pathname.startsWith('/app/')) {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname.replace(/^\/app/, '/hiring'), request.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/work/:path*'],
};
```

#### Analytics & Monitoring (Optional)

Enable Vercel Analytics in `vercel.json`:

```json
{
  "analytics": {
    "enabled": true,
    "trackingId": "crewlink-prod"
  }
}
```

### Deployment Previews

**Preview deployments are automatically created for:**
- Pull requests
- Commits to non-main branches
- Manual redeploys

**Preview Database:** Use a staging database (separate Neon branch) to isolate preview data from production:

1. In Neon, create a branch: `staging`
2. In Vercel, create an environment with `DATABASE_URL` pointing to staging branch
3. Set preview deployments to use staging environment

### Vercel Build Logs

Access build logs for debugging:

1. Go to Vercel Dashboard > **Deployments**
2. Click on deployment
3. View "Build" tab for logs
4. Search for errors or warnings

---

## GitHub Actions CI/CD

### Workflow Overview

CrewLink uses GitHub Actions for automated testing and deployment.

#### On Pull Request (`.github/workflows/pr.yml`)

```yaml
on: [pull_request]

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run agents:quick  # QA + security audit
      - run: npm run test:e2e
      - run: npm run audit:security

  ui:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:visual

  performance:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:perf
      - run: npm run audit:perf
```

**Status:** PR cannot be merged until all checks pass.

#### On Merge to Main (`.github/workflows/deploy.yml`)

```yaml
on:
  push:
    branches: [main]

jobs:
  full-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run agents:all  # Full agent suite
      - run: npm run test:qa
      - run: npm run test:e2e
      - run: npm run audit:perf

  deploy:
    needs: full-suite
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### Weekly Security Audit (`.github/workflows/security.yml`)

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit
      - run: npm run audit:security
      - run: npm run agents:quick
```

#### Nightly Performance Check (`.github/workflows/perf.yml`)

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run audit:perf
      - run: npm run test:perf
```

### GitHub Secrets (Required)

Store these in **Settings > Secrets and variables > Actions:**

| Secret | Value | Source |
|--------|-------|--------|
| `VERCEL_TOKEN` | Personal access token | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Organization ID | Vercel team dashboard |
| `VERCEL_PROJECT_ID` | Project ID | Vercel project settings |

---

## Build & Deployment Process

### Local Build Testing

Before pushing to GitHub, test the production build locally:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Run build
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` and verify functionality.

### Build Pipeline

The build command in `next.config.js` is:

```bash
prisma generate && next build
```

This ensures:
1. **Prisma Client** is generated from schema
2. **Next.js** compiles and optimizes pages
3. **Image optimization** is configured for external domains:
   - `api.mapbox.com`
   - `images.unsplash.com`
   - Any other external image sources

### Server Actions Configuration

Next.js Server Actions have a payload size limit of **2MB** (configured in `next.config.js`):

```javascript
serverActions: {
  bodySizeLimit: '2mb',
}
```

**For uploads exceeding 2MB:**
- Split into chunks
- Use presigned S3 URLs
- Stream to Cloud Storage

### Build Output Analysis

After `npm run build`, check:

1. **Build Summary:**
   ```
   ✓ Compiled successfully
   ✓ Linting and type checking
   ✓ Collecting page data
   ```

2. **Page Size Analysis:**
   - Verify no pages exceed 262KB (Next.js threshold)
   - Check for large dependencies in bundle

3. **Static Generation:**
   - All pages should be `○ Static` or `●S Dynamic`
   - No ISR warnings

---

## Production Readiness

### Pre-Production Verification

#### 1. Environment Variable Audit

```bash
# Verify all required variables are set in Vercel
vercel env pull .env.production.local

# Check for secrets in code
grep -r "API_KEY\|SECRET\|PASSWORD" src/ --include="*.ts" --include="*.tsx"

# Ensure NEXT_PUBLIC_ENABLE_ROLE_TOGGLE is false
echo "NEXT_PUBLIC_ENABLE_ROLE_TOGGLE=$(vercel env list | grep ENABLE_ROLE)"
```

**Expected output:** `NEXT_PUBLIC_ENABLE_ROLE_TOGGLE=false`

#### 2. Database Connection Test

```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Verify schema is up to date
npm run db:push -- --skip-generate

# Check active connections
psql $DATABASE_URL -c "SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY datname, usename;"
```

#### 3. Build Verification

```bash
# Full production build
npm run build

# Check build size
du -sh .next/

# Verify Next.js compilation
cat .next/.build-id
```

#### 4. Image Optimization

Ensure all external images use next/image:

```bash
# Find unoptimized images
grep -r "<img\|<Image" src/ --include="*.tsx" --include="*.ts" | grep -v "next/image"
```

**Result:** Should return 0 matches (or only client-side images that can't use next/image).

#### 5. API Health Check

```bash
# Test health check endpoint
curl https://crewlink.vercel.app/api/health

# Expected response: {"status":"ok"}
```

#### 6. Authentication Test

1. Visit production URL
2. Test login flow
3. Verify tokens are set correctly (check browser DevTools > Application > Cookies)
4. Test logout and re-login

### Production Readiness Checklist

- [ ] All environment variables verified in Vercel dashboard
- [ ] Database migrations applied to production
- [ ] Database backups configured and tested
- [ ] Build completes without warnings
- [ ] Health check endpoint responds
- [ ] Authentication flow works end-to-end
- [ ] Third-party services (Mapbox) are scoped to production domain
- [ ] All tests pass in CI/CD
- [ ] Performance benchmarks met or improved
- [ ] Security audit passed
- [ ] No console errors or warnings
- [ ] Rollback procedure documented and tested (see [Rollback Procedures](#rollback-procedures))

---

## Monitoring & Error Tracking

### Health Check Endpoint

CrewLink includes a health check at `/api/health`:

```bash
curl https://crewlink.vercel.app/api/health
# Response: {"status":"ok"}
```

Monitor this endpoint every 5 minutes using a service like:
- **Uptime Robot** (free tier available)
- **Pingdom**
- **Datadog**
- **New Relic**

### Recommended: Add Sentry for Error Tracking

#### Install Sentry

```bash
npm install @sentry/nextjs
```

#### Configure `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: process.env.VERCEL_ENV === 'production' ? 0.1 : 1.0,
  enabled: process.env.NODE_ENV === 'production',
});
```

#### Set Vercel Environment Variables

```
SENTRY_DSN=https://key@sentry.io/project-id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

#### Verify Sentry Integration

1. Go to [Sentry Dashboard](https://sentry.io)
2. Check "Releases" tab for latest deployment
3. Test by triggering an error in production (if safe to do so)
4. Verify error appears in Sentry dashboard

### Key Metrics to Monitor

| Metric | Target | Tool |
|--------|--------|------|
| **Uptime** | 99.9%+ | Uptime Robot |
| **Response Time** | <200ms (p95) | Vercel Analytics or Sentry |
| **Error Rate** | <0.1% | Sentry |
| **Database Connections** | <80% of limit | Neon Console |
| **Build Time** | <5 minutes | GitHub Actions / Vercel |

### Alerting

Set up alerts for:
- Uptime Robot: SMS/email on downtime
- Sentry: Email on new errors (threshold: 10 errors/min)
- Neon: Email on high connection usage (>80%)

---

## Rollback Procedures

### Quick Rollback via Vercel

If a deployment causes issues:

1. Go to Vercel Dashboard > **Deployments**
2. Find the previous stable deployment
3. Click **•••** (three dots) > **Promote to Production**
4. Confirm promotion

**Time to rollback:** <1 minute

### Database Rollback

If a migration causes issues:

#### Option 1: Revert via Prisma (Recommended)

1. Identify the problematic migration in `prisma/migrations/`
2. Remove the latest migration folder
3. Revert schema in `prisma/schema.prisma`
4. Run:
   ```bash
   npm run db:push -- --skip-generate
   ```

#### Option 2: Restore from Backup

If data corruption occurs:

```bash
# List available backups
pg_dump $DATABASE_URL --list

# Restore from backup
psql $DATABASE_URL < crewlink-backup-2026-02-26.sql
```

### Code Rollback

If you need to revert code changes:

```bash
# Find the previous stable commit
git log --oneline | head -20

# Revert to a specific commit
git revert <commit-hash>

# Or force reset (destructive)
git reset --hard <commit-hash>
git push origin main --force-with-lease
```

**Note:** Use `git revert` for production to maintain history. Use `git reset --hard` only in emergencies with team approval.

### Rollback Checklist

- [ ] Identified root cause of issue
- [ ] Backed up current database state
- [ ] Rolled back code/deployment
- [ ] Re-ran database migrations if needed
- [ ] Verified health check endpoint
- [ ] Tested critical user flows
- [ ] Notified team of rollback
- [ ] Scheduled postmortem

---

## Security Hardening

### Environment Variables Security

- **Never commit secrets** to Git (use `.env.local`, `.env*.local` in `.gitignore`)
- **Use Vercel's encryption** for preview deployments
- **Rotate secrets** every 90 days (especially `NEXTAUTH_SECRET`)
- **Audit access** to secrets in Vercel Settings > Security

### NextAuth Security

`NEXTAUTH_SECRET` is critical for JWT signing and encryption:

1. **Generate a strong secret:**
   ```bash
   openssl rand -base64 32
   # Output: abc123xyz...
   ```

2. **Set in Vercel:** Go to Settings > Environment Variables
3. **Rotate every 90 days:**
   - Generate new secret
   - Update in Vercel
   - Existing sessions will re-authenticate (expected behavior)

### Database Security

#### Connection String Protection

- Never log or expose `DATABASE_URL`
- Use environment variables only
- In Vercel, mark as "Encrypt for Preview Deployments"

#### Neon Security Settings

1. **IP Whitelisting:**
   - Go to Neon Console > **Security**
   - Add Vercel IP ranges (or allow all for development)

2. **Connection Pooling:**
   - Enabled by default
   - Isolates connections per application

3. **SSL/TLS:**
   - Enforce SSL: `?sslmode=require` in `DATABASE_URL`

### Mapbox Token Security

1. **Create a scoped token:**
   - Go to Mapbox Dashboard > **Tokens**
   - Click "Create a token"
   - Permissions: `styles:read`, `fonts:read`
   - URL Restrictions: Add production domain only

2. **Rotate tokens annually** and before/after employee departures

### Next.js Security

#### CSRF Protection

NextAuth provides CSRF protection out of the box. Verify in production:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } = from "@/auth"

export const { GET, POST } = handlers
```

#### CORS Configuration

If needed, configure CORS in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
      ],
    },
  ];
}
```

#### Content Security Policy (CSP)

Add CSP headers in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' api.mapbox.com",
        },
      ],
    },
  ];
}
```

### Security Audit & Dependencies

#### Run Security Audits

```bash
# Check for vulnerable dependencies
npm audit

# Run CrewLink security audit
npm run audit:security

# Run full agent suite
npm run agents:all
```

#### Auto-Update Dependencies

Enable Dependabot in GitHub:
1. Go to repository Settings > **Code security and analysis**
2. Enable "Dependabot version updates"
3. Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    allow:
      - dependency-type: 'direct'
    pull-request-branch-name:
      separator: '/'
```

### Rate Limiting (Production)

Add rate limiting middleware to prevent abuse:

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const { success } = await ratelimit.limit(`${ip}:${request.pathname}`);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
```

**Setup:**
1. Create Upstash Redis database
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel

---

## Deployment Command Reference

### Local Development

```bash
npm install              # Install dependencies
npm run db:generate      # Generate Prisma Client
npm run dev              # Start dev server (http://localhost:3000)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database (dev only)
```

### Pre-Deployment Testing

```bash
npm run test:qa          # Run QA tests
npm run test:e2e         # Run end-to-end tests
npm run test:visual      # Run visual tests
npm run test:perf        # Run performance tests
npm run audit:security   # Run security audit
npm run audit:perf       # Run Lighthouse CI
npm run agents:all       # Run full agent suite
```

### Production Build & Deployment

```bash
npm run build            # Production build
npm start                # Start production server
npm run db:push          # Apply migrations
```

### Manual Vercel Deployment

```bash
npm install -g vercel    # Install Vercel CLI
vercel login             # Authenticate
vercel --prod            # Deploy to production
vercel env pull          # Pull environment variables
```

---

## Troubleshooting

### Common Issues & Solutions

#### "Prisma Client is not available"

**Cause:** Prisma Client not generated during build.

**Solution:**
```bash
npm run db:generate
npm run build
```

Ensure `next.config.js` includes postinstall hook:
```javascript
const { withPrisma } = require('@prisma/next');
module.exports = withPrisma({
  // config
});
```

#### Database Connection Timeout

**Cause:** Connection pooling misconfigured or database unreachable.

**Solution:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check pgbouncer is enabled in Neon
# Verify DATABASE_URL includes ?sslmode=require
```

#### NEXT_PUBLIC_ENABLE_ROLE_TOGGLE=true in Production

**Cause:** Feature flag not properly set in Vercel.

**Solution:**
1. Go to Vercel Settings > Environment Variables
2. Find `NEXT_PUBLIC_ENABLE_ROLE_TOGGLE`
3. Set to `false` for production environment
4. Redeploy

#### "413 Payload Too Large" on Form Submission

**Cause:** Request body exceeds 2MB limit.

**Solution:**
- Reduce payload size (remove unnecessary fields)
- Split into multiple requests
- Use presigned S3 URLs for file uploads

#### Lighthouse CI Failure

**Cause:** Performance metrics below threshold.

**Solution:**
```bash
# Run Lighthouse audit locally
npm run audit:perf

# Check lighthouserc.json for thresholds
cat lighthouserc.json

# Optimize images, code splitting, lazy loading
```

### Debugging Production Issues

#### View Vercel Logs

```bash
vercel logs --prod
```

#### View GitHub Actions Logs

1. Go to repository > **Actions**
2. Click failed workflow
3. View logs for each step

#### Test in Preview Deployment

1. Create a PR
2. Vercel automatically creates preview deployment
3. Test issue in preview environment
4. Check preview logs for errors

#### Enable Debug Mode

```bash
# Add to .env or Vercel environment
DEBUG=*
```

---

## Support & Contact

For deployment issues, contact:

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Neon Support:** [neon.tech/docs/introduction](https://neon.tech/docs/introduction)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs:** [prisma.io/docs](https://prisma.io/docs)

---

**Last Updated:** 2026-02-27
**Maintained by:** CrewLink DevOps Team
**Next Review:** 2026-05-27
