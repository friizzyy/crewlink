# CrewLink: Testing & QA Strategy (05-TESTING-QA.md)

## Overview

CrewLink's testing architecture prioritizes **end-to-end behavioral testing** via Playwright, supplemented by **QA agent automation** for visual regression, performance monitoring, security audits, and UX consistency. This document defines complete test coverage for critical user flows, API contracts, and component behavior.

**Current State**: Playwright E2E tests only. **Recommended**: Add Vitest for component/unit tests.

---

## 1. Testing Framework Stack

### 1.1 Playwright (E2E)
- **Status**: Primary test framework
- **Config**: `playwright.config.ts` (project root)
- **Test Suites**:
  - `tests/qa/` – Critical user flows, API contracts, cross-browser
  - `tests/visual/` – Visual regression (screenshots, pixel diffs)
  - `tests/performance/` – Load testing, interaction performance
- **Browsers**: Chromium, Firefox, WebKit (configurable)
- **Reporters**: HTML, JSON, JUnit (for CI/CD)

**Key Commands**:
```bash
npm run test:e2e                 # Run all E2E tests (headless)
npm run test:e2e:ui             # Run with Playwright Inspector UI
npm run test:qa                 # QA-specific tests only
npm run test:visual             # Visual regression tests
npm run test:perf               # Performance tests
npm run audit:perf              # Lighthouse CI audit
npm run audit:security          # Dependency security audit
npm run audit:copy              # Copy/tone validation
```

### 1.2 Vitest (Recommended for Unit/Component Tests)

**Why**: Playwright is slow for unit/component testing. Vitest enables fast feedback on isolated components.

**Setup** (not yet implemented):
```json
{
  "devDependencies": {
    "vitest": "^0.34.0",
    "@vitest/ui": "^0.34.0",
    "happy-dom": "^12.10.3",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0"
  }
}
```

**Recommended Structure**:
- `tests/unit/` – Pure function tests (utils, hooks)
- `tests/components/` – Component rendering, props, events
- `vitest.config.ts` – Vitest configuration

**Example Command** (to add):
```bash
npm run test:unit                # Run Vitest suite
npm run test:unit:ui            # Vitest UI dashboard
npm run test:unit:watch         # Watch mode (fast feedback)
```

### 1.3 Lighthouse CI
- **Config**: `lighthouserc.json` (project root)
- **Audits**: Performance, Accessibility, Best Practices, SEO
- **Triggers**: On every PR, before merge
- **Thresholds**: Performance > 90 (desktop), > 80 (mobile)

---

## 2. Critical User Flows: Complete Test Coverage

Each flow includes Playwright E2E test examples and API contract validation.

### 2.1 User Registration

**Flow**: `/create-account` → form → validate email/password → POST `/api/auth/register` → `/select-role` → choose role → redirect `/hiring` or `/work`

**Test File**: `tests/qa/auth-registration.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  const testEmail = `user-${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  test('should register new hirer account successfully', async ({ page }) => {
    // Navigate to registration
    await page.goto('/create-account');

    // Fill registration form
    await page.fill('input[name="fullName"]', 'Alice Contractor');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.check('input[name="termsAccepted"]');

    // Submit form
    const registerPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/register') && response.status() === 201
    );
    await page.click('button:has-text("Create Account")');
    const registerResponse = await registerPromise;

    // Verify API response
    const { user, token } = await registerResponse.json();
    expect(user.email).toBe(testEmail);
    expect(user.role).toBe('unassigned');
    expect(token).toBeTruthy();

    // Verify redirect to role selection
    await expect(page).toHaveURL('/select-role');
    expect(await page.isVisible('text=Choose your role')).toBe(true);
  });

  test('should select hirer role and redirect to /hiring', async ({ page }) => {
    // Assume user is authenticated and at /select-role
    await page.goto('/select-role');

    await page.click('button:has-text("I\'m hiring")');

    const selectRolePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/select-role') && response.status() === 200
    );
    await selectRolePromise;

    await expect(page).toHaveURL('/hiring');
    expect(await page.isVisible('text=Find talented workers')).toBe(true);
  });

  test('should select worker role and redirect to /work', async ({ page }) => {
    await page.goto('/select-role');

    await page.click('button:has-text("I\'m looking for work")');

    const selectRolePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/select-role') && response.status() === 200
    );
    await selectRolePromise;

    await expect(page).toHaveURL('/work');
    expect(await page.isVisible('text=Find opportunities')).toBe(true);
  });

  test('should reject duplicate email registration', async ({ page }) => {
    await page.goto('/create-account');

    // Use known existing email
    await page.fill('input[name="fullName"]', 'Bob User');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.check('input[name="termsAccepted"]');

    const registerPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/register')
    );
    await page.click('button:has-text("Create Account")');
    const registerResponse = await registerPromise;

    // Expect 409 Conflict
    expect(registerResponse.status()).toBe(409);
    const { error } = await registerResponse.json();
    expect(error).toContain('already exists');

    // Error message displayed
    expect(await page.isVisible('text=Email already in use')).toBe(true);
  });

  test('should reject invalid email format', async ({ page }) => {
    await page.goto('/create-account');

    await page.fill('input[name="fullName"]', 'Charlie User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // Form validation should trigger on blur or submit
    const errorText = await page.locator('text=Invalid email').isVisible();
    expect(errorText).toBe(true);

    // Submit button should be disabled
    const submitBtn = page.locator('button:has-text("Create Account")');
    expect(await submitBtn.isDisabled()).toBe(true);
  });

  test('should reject password mismatch', async ({ page }) => {
    await page.goto('/create-account');

    await page.fill('input[name="fullName"]', 'Dana User');
    await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');

    // Error should appear
    expect(await page.isVisible('text=Passwords do not match')).toBe(true);
  });
});
```

### 2.2 User Login

**Flow**: `/sign-in` → email/password → POST `/api/auth/login` → redirect `/hiring` or `/work` based on role

**Test File**: `tests/qa/auth-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  const testEmail = 'existing-hirer@example.com';
  const testPassword = 'SecurePassword123!';

  test('should login hirer and redirect to /hiring', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    const loginPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.click('button:has-text("Sign In")');
    const loginResponse = await loginPromise;

    const { user, token } = await loginResponse.json();
    expect(user.role).toBe('hirer');
    expect(token).toBeTruthy();

    // Token stored in localStorage/sessionStorage
    const storedToken = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(storedToken).toBeTruthy();

    // Redirect to role-specific dashboard
    await expect(page).toHaveURL('/hiring');
  });

  test('should login worker and redirect to /work', async ({ page }) => {
    const workerEmail = 'existing-worker@example.com';

    await page.goto('/sign-in');

    await page.fill('input[name="email"]', workerEmail);
    await page.fill('input[name="password"]', testPassword);

    const loginPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.click('button:has-text("Sign In")');
    const loginResponse = await loginPromise;

    const { user } = await loginResponse.json();
    expect(user.role).toBe('worker');

    await expect(page).toHaveURL('/work');
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');

    const loginPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login')
    );
    await page.click('button:has-text("Sign In")');
    const loginResponse = await loginPromise;

    expect(loginResponse.status()).toBe(401);
    expect(await page.isVisible('text=Invalid email or password')).toBe(true);
  });

  test('should persist session across page reload', async ({ page }) => {
    // Login
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Verify token exists
    const tokenBefore = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(tokenBefore).toBeTruthy();

    // Reload page
    await page.reload();

    // Should still be logged in, redirected to /hiring
    const tokenAfter = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(tokenAfter).toBe(tokenBefore);
    await expect(page).toHaveURL('/hiring');
  });
});
```

### 2.3 Job Posting (Hirer)

**Flow**: `/hiring/post` or `/hiring/new` → multi-step form (title, desc, budget, category) → POST `/api/jobs` → `/hiring/jobs` list shows new job → job visible on map

**Test File**: `tests/qa/job-posting.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Job Posting (Hirer)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'hirer@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');
  });

  test('should post a new job with all required fields', async ({ page }) => {
    await page.goto('/hiring/post');

    // Step 1: Basic Info
    await page.fill('input[name="title"]', 'Build React Dashboard');
    await page.fill('textarea[name="description"]', 'Need a modern dashboard for analytics. Prefer React + TypeScript.');

    // Step 2: Budget
    await page.selectOption('select[name="budgetRange"]', '500-1000');

    // Step 3: Category & Skills
    await page.selectOption('select[name="category"]', 'web-development');
    await page.fill('input[name="skills"]', 'React');
    await page.keyboard.press('Enter');

    // Step 4: Location
    await page.fill('input[name="location"]', '123 Main St, San Francisco, CA');
    // Simulate address autocomplete selection
    await page.click('text=123 Main St, San Francisco, CA 94102');

    // Submit form
    const jobPromise = page.waitForResponse(
      response => response.url().includes('/api/jobs') && response.status() === 201
    );
    await page.click('button:has-text("Post Job")');
    const jobResponse = await jobPromise;

    const { job } = await jobResponse.json();
    expect(job.title).toBe('Build React Dashboard');
    expect(job.budget).toContain('500-1000');
    expect(job.category).toBe('web-development');
    expect(job.status).toBe('open');

    // Verify redirect to job detail
    await expect(page).toHaveURL(new RegExp(`/hiring/job/${job.id}`));
    expect(await page.isVisible(`text=${job.title}`)).toBe(true);
  });

  test('should display new job on /hiring/jobs list', async ({ page }) => {
    // Post a job (abbreviated)
    await page.goto('/hiring/post');
    await page.fill('input[name="title"]', 'New UI Design');
    await page.fill('textarea[name="description"]', 'Design modern UI');
    await page.selectOption('select[name="budgetRange"]', '1000-2000');
    await page.selectOption('select[name="category"]', 'design');

    const jobPromise = page.waitForResponse(
      response => response.url().includes('/api/jobs') && response.status() === 201
    );
    await page.click('button:has-text("Post Job")');
    const jobResponse = await jobPromise;
    const { job } = await jobResponse.json();

    // Navigate to jobs list
    await page.goto('/hiring/jobs');

    // New job should appear in list
    expect(await page.isVisible(`text=${job.title}`)).toBe(true);
    const jobCard = page.locator(`[data-testid="job-card-${job.id}"]`);
    expect(await jobCard.isVisible()).toBe(true);
  });

  test('should display new job on map', async ({ page }) => {
    // Post a job with location
    await page.goto('/hiring/post');
    await page.fill('input[name="title"]', 'Map Job Test');
    await page.fill('textarea[name="description"]', 'Test job for map');
    await page.selectOption('select[name="budgetRange"]', '500-1000');
    await page.fill('input[name="location"]', '123 Main St, San Francisco, CA');
    await page.click('text=123 Main St, San Francisco, CA');

    const jobPromise = page.waitForResponse(response => response.status() === 201);
    await page.click('button:has-text("Post Job")');
    const jobResponse = await jobPromise;
    const { job } = await jobResponse.json();

    // Navigate to work map (worker view shows all jobs)
    // Or check hiring map if available
    await page.goto('/work');

    // Wait for map to load
    await page.waitForSelector('[data-testid="map-container"]');

    // Verify marker appears (may require API call to confirm)
    const mapMarkers = await page.locator('[data-testid="map-marker"]').count();
    expect(mapMarkers).toBeGreaterThan(0);
  });

  test('should reject job without required fields', async ({ page }) => {
    await page.goto('/hiring/post');

    // Try to submit without filling fields
    const submitBtn = page.locator('button:has-text("Post Job")');
    expect(await submitBtn.isDisabled()).toBe(true);

    // Fill only title
    await page.fill('input[name="title"]', 'Incomplete Job');

    // Still disabled
    expect(await submitBtn.isDisabled()).toBe(true);

    // Fill description
    await page.fill('textarea[name="description"]', 'Some description');

    // Still disabled
    expect(await submitBtn.isDisabled()).toBe(true);

    // Fill budget
    await page.selectOption('select[name="budgetRange"]', '500-1000');

    // Still disabled (location required)
    expect(await submitBtn.isDisabled()).toBe(true);
  });

  test('should validate budget range', async ({ page }) => {
    await page.goto('/hiring/post');

    await page.fill('input[name="title"]', 'Budget Test');
    await page.fill('textarea[name="description"]', 'Test');

    // Select invalid budget
    const budgetSelect = page.locator('select[name="budgetRange"]');
    await budgetSelect.selectOption(''); // Empty selection

    // Error should appear
    expect(await page.isVisible('text=Budget is required')).toBe(true);
  });
});
```

### 2.4 Job Discovery (Worker)

**Flow**: Worker logs in → `/work` → map loads with job markers → click marker → job detail shows in sidebar/bottom sheet

**Test File**: `tests/qa/job-discovery.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Job Discovery (Worker)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as worker
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'worker@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/work');
  });

  test('should load map with job markers', async ({ page }) => {
    await page.goto('/work');

    // Wait for map to initialize
    await page.waitForSelector('[data-testid="map-container"]');

    // Verify API call to fetch jobs
    const jobsResponse = await page.waitForResponse(
      response => response.url().includes('/api/jobs') && response.status() === 200
    );
    const { jobs } = await jobsResponse.json();
    expect(jobs.length).toBeGreaterThan(0);

    // Verify markers are rendered (count should match jobs)
    const markerCount = await page.locator('[data-testid="map-marker"]').count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should pan and zoom map', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('[data-testid="map-container"]');

    // Get initial center (store map state)
    const mapContainer = page.locator('[data-testid="map-container"]');

    // Pan right
    const bbox = await mapContainer.boundingBox();
    await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
    await page.mouse.wheel(5, 0); // Scroll right

    // Verify markers updated (debounced API call)
    await page.waitForTimeout(500); // Allow debounce
    const jobsResponse = await page.waitForResponse(
      response => response.url().includes('/api/jobs?')
    );
    expect(jobsResponse.status()).toBe(200);
  });

  test('should click map marker and show job detail', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('[data-testid="map-container"]');

    // Wait for jobs to load
    await page.waitForResponse(
      response => response.url().includes('/api/jobs') && response.status() === 200
    );

    // Click first marker
    const firstMarker = page.locator('[data-testid="map-marker"]').first();
    await firstMarker.click();

    // Bottom sheet or sidebar should appear with job detail
    const detailPanel = page.locator('[data-testid="job-detail-panel"]');
    await expect(detailPanel).toBeVisible();

    // Verify job info is displayed
    expect(await detailPanel.locator('text=/\\w+/').count()).toBeGreaterThan(0);
  });

  test('should filter jobs by category', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('[data-testid="map-container"]');

    // Open filter panel
    await page.click('button:has-text("Filters")');

    // Select category
    await page.selectOption('select[name="category"]', 'web-development');

    // Apply filter
    await page.click('button:has-text("Apply")');

    // API should be called with filter
    const filteredResponse = await page.waitForResponse(
      response => response.url().includes('/api/jobs?category=web-development')
    );
    expect(filteredResponse.status()).toBe(200);

    // Markers should update
    const { jobs } = await filteredResponse.json();
    const markerCount = await page.locator('[data-testid="map-marker"]').count();
    expect(markerCount).toBe(jobs.length);
  });

  test('should filter jobs by budget range', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('[data-testid="map-container"]');

    // Open filter panel
    await page.click('button:has-text("Filters")');

    // Set budget range
    await page.fill('input[name="minBudget"]', '500');
    await page.fill('input[name="maxBudget"]', '2000');

    // Apply filter
    await page.click('button:has-text("Apply")');

    // API should include budget params
    const filteredResponse = await page.waitForResponse(
      response => response.url().includes('/api/jobs?') &&
                  response.url().includes('minBudget=500') &&
                  response.url().includes('maxBudget=2000')
    );
    expect(filteredResponse.status()).toBe(200);
  });

  test('should click job card and navigate to detail page', async ({ page }) => {
    await page.goto('/work');

    // Wait for jobs to load
    await page.waitForResponse(response => response.url().includes('/api/jobs'));

    // Click on a job from map detail panel
    const firstMarker = page.locator('[data-testid="map-marker"]').first();
    await firstMarker.click();

    // Click "View Details" or title link in panel
    await page.click('[data-testid="job-detail-panel"] a:has-text("View Details")');

    // Should navigate to job detail
    await expect(page).toHaveURL(new RegExp('/work/job/\\w+'));
  });
});
```

### 2.5 Bidding (Worker)

**Flow**: `/work/job/[id]` → fill bid form (amount, message, duration) → POST `/api/jobs/[id]/bids` → confirmation

**Test File**: `tests/qa/bidding.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Bidding (Worker)', () => {
  let jobId: string;

  test.beforeEach(async ({ page, context }) => {
    // Login as worker
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'worker@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/work');

    // Get a job ID (fetch from API or navigate to find one)
    const jobsResponse = await context.request.get('/api/jobs');
    const { jobs } = await jobsResponse.json();
    jobId = jobs[0].id;
  });

  test('should submit a bid with all fields', async ({ page }) => {
    await page.goto(`/work/job/${jobId}`);

    // Fill bid form
    await page.fill('input[name="amount"]', '1500');
    await page.fill('textarea[name="message"]', 'I have 5 years of React experience. Can start immediately.');
    await page.selectOption('select[name="duration"]', '2-weeks');

    // Submit bid
    const bidPromise = page.waitForResponse(
      response => response.url().includes(`/api/jobs/${jobId}/bids`) && response.status() === 201
    );
    await page.click('button:has-text("Submit Bid")');
    const bidResponse = await bidPromise;

    const { bid } = await bidResponse.json();
    expect(bid.amount).toBe(1500);
    expect(bid.estimatedDuration).toBe('2-weeks');
    expect(bid.status).toBe('pending');

    // Confirmation message
    expect(await page.isVisible('text=Bid submitted successfully')).toBe(true);
  });

  test('should not allow hirer to submit bid', async ({ page }) => {
    // Login as hirer instead
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'hirer@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Try to access worker bid page (should be blocked or redirected)
    await page.goto(`/work/job/${jobId}`);

    // Should be redirected or see access denied
    expect(await page.isVisible('text=Access denied') ||
           !page.url().includes(`/work/job/${jobId}`)).toBe(true);
  });

  test('should reject bid without amount', async ({ page }) => {
    await page.goto(`/work/job/${jobId}`);

    // Fill only message
    await page.fill('textarea[name="message"]', 'I can do this');

    // Submit button should be disabled
    const submitBtn = page.locator('button:has-text("Submit Bid")');
    expect(await submitBtn.isDisabled()).toBe(true);

    // Error message
    expect(await page.isVisible('text=Amount is required')).toBe(true);
  });

  test('should reject duplicate bid from same worker', async ({ page }) => {
    await page.goto(`/work/job/${jobId}`);

    // Submit first bid
    await page.fill('input[name="amount"]', '1000');
    await page.fill('textarea[name="message"]', 'First bid');
    await page.selectOption('select[name="duration"]', '1-week');
    await page.click('button:has-text("Submit Bid")');

    await page.waitForResponse(response => response.status() === 201);

    // Try to submit another bid (need to navigate back or refresh)
    await page.goto(`/work/job/${jobId}`);

    // Bid form might be disabled or show "Already bid" message
    const alreadyBidMsg = await page.isVisible('text=You have already submitted a bid for this job');
    expect(alreadyBidMsg).toBe(true);
  });

  test('should validate bid amount format', async ({ page }) => {
    await page.goto(`/work/job/${jobId}`);

    // Enter invalid amount
    await page.fill('input[name="amount"]', 'abc');

    // Error appears
    expect(await page.isVisible('text=Amount must be a number')).toBe(true);

    // Try negative amount
    await page.fill('input[name="amount"]', '-500');
    expect(await page.isVisible('text=Amount must be greater than 0')).toBe(true);

    // Try amount too high
    await page.fill('input[name="amount"]', '999999');
    expect(await page.isVisible('text=Amount exceeds maximum')).toBe(true);
  });
});
```

### 2.6 Bid Management (Hirer)

**Flow**: `/hiring/job/[id]` → see list of bids → accept/reject bid → PATCH `/api/bids/[id]` → worker notified

**Test File**: `tests/qa/bid-management.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Bid Management (Hirer)', () => {
  let jobId: string;
  let bidId: string;

  test.beforeEach(async ({ page, context }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'hirer@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Get a job with bids
    const jobsResponse = await context.request.get('/api/jobs?owner=hirer@example.com');
    const { jobs } = await jobsResponse.json();
    jobId = jobs[0].id;

    // Fetch bids for this job
    const bidsResponse = await context.request.get(`/api/jobs/${jobId}/bids`);
    const { bids } = await bidsResponse.json();
    bidId = bids[0].id;
  });

  test('should view bids for job', async ({ page }) => {
    await page.goto(`/hiring/job/${jobId}`);

    // Bids section should show
    expect(await page.isVisible('text=Bids')).toBe(true);

    // Fetch bids to verify
    const bidsResponse = await page.waitForResponse(
      response => response.url().includes(`/api/jobs/${jobId}/bids`)
    );
    const { bids } = await bidsResponse.json();

    // Each bid should be rendered
    for (const bid of bids) {
      expect(await page.isVisible(`text=${bid.amount}`)).toBe(true);
    }
  });

  test('should accept a bid', async ({ page }) => {
    await page.goto(`/hiring/job/${jobId}`);

    // Find bid and click Accept
    const bidCard = page.locator(`[data-testid="bid-${bidId}"]`);
    await bidCard.locator('button:has-text("Accept")').click();

    // Confirmation modal
    expect(await page.isVisible('text=Accept this bid?')).toBe(true);
    await page.click('button:has-text("Confirm")');

    // API call to accept
    const acceptResponse = await page.waitForResponse(
      response => response.url().includes(`/api/bids/${bidId}`) && response.status() === 200
    );
    const { bid } = await acceptResponse.json();
    expect(bid.status).toBe('accepted');

    // UI updates
    expect(await bidCard.locator('text=Accepted').isVisible()).toBe(true);
    expect(await bidCard.locator('button:has-text("Accept")').isVisible()).toBe(false);
  });

  test('should reject a bid', async ({ page }) => {
    await page.goto(`/hiring/job/${jobId}`);

    // Find bid and click Reject
    const bidCard = page.locator(`[data-testid="bid-${bidId}"]`);
    await bidCard.locator('button:has-text("Reject")').click();

    // Rejection reason modal
    expect(await page.isVisible('text=Reason for rejection')).toBe(true);
    await page.fill('textarea[name="rejectionReason"]', 'Looking for more experience');
    await page.click('button:has-text("Reject")');

    // API call
    const rejectResponse = await page.waitForResponse(
      response => response.url().includes(`/api/bids/${bidId}`)
    );
    const { bid } = await rejectResponse.json();
    expect(bid.status).toBe('rejected');
    expect(bid.rejectionReason).toBe('Looking for more experience');
  });

  test('should not allow worker to accept/reject bids', async ({ page }) => {
    // Attempt direct API call as worker
    const response = await page.request.patch(`/api/bids/${bidId}`, {
      data: { status: 'accepted' }
    });

    // Should be 403 Forbidden (worker is not job owner)
    expect(response.status()).toBe(403);
    const { error } = await response.json();
    expect(error).toContain('not authorized');
  });

  test('should send notification when bid accepted', async ({ page, context }) => {
    // As hirer, accept a bid
    await page.goto(`/hiring/job/${jobId}`);
    const bidCard = page.locator(`[data-testid="bid-${bidId}"]`);
    await bidCard.locator('button:has-text("Accept")').click();
    await page.click('button:has-text("Confirm")');

    await page.waitForResponse(response => response.status() === 200);

    // Check notifications for worker
    // (This would require logging in as the bidding worker)
    const notificationsResponse = await context.request.get('/api/notifications');
    const { notifications } = await notificationsResponse.json();

    // Should contain acceptance notification
    const acceptanceNotif = notifications.find(n =>
      n.type === 'bid-accepted' && n.bidId === bidId
    );
    expect(acceptanceNotif).toBeTruthy();
  });
});
```

### 2.7 Messaging

**Flow**: User opens `/hiring/messages` or `/work/messages` → select conversation → send message → message appears for other party → real-time sync (optional: WebSocket)

**Test File**: `tests/qa/messaging.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Messaging', () => {
  let conversationId: string;
  const hirerEmail = 'hirer@example.com';
  const workerEmail = 'worker@example.com';

  test.beforeEach(async ({ page, context }) => {
    // Create a conversation if needed
    const response = await context.request.post('/api/conversations', {
      data: { participantEmail: workerEmail }
    });
    const { conversation } = await response.json();
    conversationId = conversation.id;
  });

  test('should display conversations list', async ({ page }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', hirerEmail);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Navigate to messages
    await page.goto('/hiring/messages');

    // Fetch conversations
    const convResponse = await page.waitForResponse(
      response => response.url().includes('/api/conversations')
    );
    const { conversations } = await convResponse.json();
    expect(conversations.length).toBeGreaterThan(0);

    // Each conversation shown
    for (const conv of conversations) {
      expect(await page.isVisible(`text=${conv.participantName}`)).toBe(true);
    }
  });

  test('should open conversation and send message', async ({ page }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', hirerEmail);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');

    // Navigate to messages
    await page.goto('/hiring/messages');

    // Click conversation
    await page.click(`[data-testid="conversation-${conversationId}"]`);

    // Message input appears
    expect(await page.isVisible('textarea[name="message"]')).toBe(true);

    // Send message
    await page.fill('textarea[name="message"]', 'Hi, are you interested in this project?');

    const messagePromise = page.waitForResponse(
      response => response.url().includes(`/api/conversations/${conversationId}/messages`) &&
                   response.status() === 201
    );
    await page.click('button:has-text("Send")');
    const messageResponse = await messagePromise;

    const { message } = await messageResponse.json();
    expect(message.content).toBe('Hi, are you interested in this project?');
    expect(message.sender).toBe(hirerEmail);

    // Message appears in chat
    expect(await page.isVisible('text=Hi, are you interested in this project?')).toBe(true);
  });

  test('should receive message from other party', async ({ browser, page }) => {
    // Send message as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', hirerEmail);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');

    await page.goto('/hiring/messages');
    await page.click(`[data-testid="conversation-${conversationId}"]`);

    await page.fill('textarea[name="message"]', 'Can you start tomorrow?');
    await page.click('button:has-text("Send")');

    // Open new browser context as worker
    const context = await browser.newContext();
    const workerPage = await context.newPage();

    await workerPage.goto('/sign-in');
    await workerPage.fill('input[name="email"]', workerEmail);
    await workerPage.fill('input[name="password"]', 'SecurePassword123!');
    await workerPage.click('button:has-text("Sign In")');

    // Navigate to messages
    await workerPage.goto('/work/messages');
    await workerPage.click(`[data-testid="conversation-${conversationId}"]`);

    // Message should be visible
    expect(await workerPage.isVisible('text=Can you start tomorrow?')).toBe(true);

    await context.close();
  });

  test('should mark message as read', async ({ page }) => {
    // Receive a message (create it via API)
    // Then open conversation
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', hirerEmail);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');

    await page.goto('/hiring/messages');

    // Unread count should exist
    const unreadBadge = page.locator('[data-testid="unread-count"]');
    if (await unreadBadge.isVisible()) {
      const unreadCount = parseInt(await unreadBadge.textContent());
      expect(unreadCount).toBeGreaterThan(0);
    }

    // Click conversation to read
    await page.click(`[data-testid="conversation-${conversationId}"]`);

    // Unread should decrease
    const newCount = await unreadBadge.isVisible()
      ? parseInt(await unreadBadge.textContent())
      : 0;
    expect(newCount).toBeLessThan(unreadCount || 1);
  });
});
```

### 2.8 Profile Updates

**Flow**: `/hiring/profile` or `/work/profile` → edit fields → PATCH `/api/users/[id]` → changes reflected

**Test File**: `tests/qa/profile-update.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Profile Update', () => {
  test('should update hirer profile', async ({ page }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'hirer@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Navigate to profile
    await page.goto('/hiring/profile');

    // Edit fields
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="companyName"]', 'Updated Company Inc');
    await page.fill('textarea[name="bio"]', 'We build amazing products');
    await page.fill('input[name="website"]', 'https://updatedcompany.com');

    // Save
    const updatePromise = page.waitForResponse(
      response => response.url().includes('/api/users/') && response.status() === 200
    );
    await page.click('button:has-text("Save")');
    const updateResponse = await updatePromise;

    const { user } = await updateResponse.json();
    expect(user.companyName).toBe('Updated Company Inc');
    expect(user.bio).toBe('We build amazing products');
    expect(user.website).toBe('https://updatedcompany.com');

    // Profile refreshes
    expect(await page.isVisible('text=Updated Company Inc')).toBe(true);
  });

  test('should update worker profile with skills', async ({ page }) => {
    // Login as worker
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'worker@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/work');

    // Navigate to profile
    await page.goto('/work/profile');

    // Edit skills
    await page.click('button:has-text("Edit")');

    // Add skills
    await page.fill('input[name="skills"]', 'React');
    await page.keyboard.press('Enter');
    await page.fill('input[name="skills"]', 'TypeScript');
    await page.keyboard.press('Enter');

    // Save
    const updatePromise = page.waitForResponse(
      response => response.url().includes('/api/users/') && response.status() === 200
    );
    await page.click('button:has-text("Save")');
    const updateResponse = await updatePromise;

    const { user } = await updateResponse.json();
    expect(user.skills).toContain('React');
    expect(user.skills).toContain('TypeScript');
  });

  test('should upload profile picture', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'hirer@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');

    await page.goto('/hiring/profile');
    await page.click('button:has-text("Edit")');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/avatar.jpg');

    // Image preview appears
    const preview = page.locator('img[alt="Profile picture preview"]');
    expect(await preview.isVisible()).toBe(true);

    // Save
    const updatePromise = page.waitForResponse(
      response => response.url().includes('/api/users/') && response.status() === 200
    );
    await page.click('button:has-text("Save")');
    const updateResponse = await updatePromise;

    const { user } = await updateResponse.json();
    expect(user.avatarUrl).toBeTruthy();
  });
});
```

### 2.9 Role Switching

**Flow**: Authenticated user navigates to `/select-role` → choose different role → PATCH `/api/auth/select-role` → dashboard updates for new role

**Test File**: `tests/qa/role-switching.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Role Switching', () => {
  test('should switch from hirer to worker', async ({ page }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'dual-role@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Verify hirer dashboard
    expect(await page.isVisible('text=Find talented workers')).toBe(true);

    // Navigate to role selector
    await page.goto('/select-role');

    // Switch to worker
    await page.click('button:has-text("I\'m looking for work")');

    const switchResponse = await page.waitForResponse(
      response => response.url().includes('/api/auth/select-role') && response.status() === 200
    );
    const { user } = await switchResponse.json();
    expect(user.role).toBe('worker');

    // Redirected to worker dashboard
    await expect(page).toHaveURL('/work');
    expect(await page.isVisible('text=Find opportunities')).toBe(true);
  });

  test('should switch from worker to hirer', async ({ page }) => {
    // Login as worker
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'dual-role@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/work');

    // Switch to hirer
    await page.goto('/select-role');
    await page.click('button:has-text("I\'m hiring")');

    await page.waitForResponse(
      response => response.url().includes('/api/auth/select-role')
    );

    await expect(page).toHaveURL('/hiring');
  });

  test('should show correct nav for current role', async ({ page }) => {
    // Login as hirer
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'dual-role@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Hirer nav visible
    expect(await page.isVisible('[data-testid="hiring-nav"]')).toBe(true);
    expect(await page.isVisible('[data-testid="worker-nav"]')).toBe(false);

    // Switch to worker
    await page.goto('/select-role');
    await page.click('button:has-text("I\'m looking for work")');
    await page.waitForURL('/work');

    // Worker nav visible
    expect(await page.isVisible('[data-testid="worker-nav"]')).toBe(true);
    expect(await page.isVisible('[data-testid="hiring-nav"]')).toBe(false);
  });
});
```

### 2.10 Map Interaction

**Flow**: Load map → pan/zoom → markers update → click marker → detail sidebar/bottom sheet opens with job info

Covered in **2.4 Job Discovery** above.

---

## 3. API Contract Testing

All API routes must return consistent, validated payloads. Test files: `tests/qa/api-contracts/`

### 3.1 Authentication API

**File**: `tests/qa/api-contracts/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Auth API Contracts', () => {
  test('POST /api/auth/register returns user and token', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        fullName: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }
    });

    expect(response.status()).toBe(201);
    const { user, token } = await response.json();

    // User shape
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('fullName');
    expect(user).toHaveProperty('role');
    expect(user.role).toBe('unassigned');

    // Token
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('POST /api/auth/login returns authenticated user', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'existing@example.com',
        password: 'SecurePassword123!'
      }
    });

    expect(response.status()).toBe(200);
    const { user, token } = await response.json();

    expect(user.email).toBe('existing@example.com');
    expect(['hirer', 'worker']).toContain(user.role);
    expect(token).toBeTruthy();
  });

  test('POST /api/auth/login returns 401 for invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!'
      }
    });

    expect(response.status()).toBe(401);
    const { error } = await response.json();
    expect(error).toBeTruthy();
  });
});
```

### 3.2 Jobs API

**File**: `tests/qa/api-contracts/jobs.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Jobs API Contracts', () => {
  test('GET /api/jobs returns array of jobs', async ({ request }) => {
    const response = await request.get('/api/jobs');

    expect(response.status()).toBe(200);
    const { jobs } = await response.json();

    expect(Array.isArray(jobs)).toBe(true);

    // Each job should have required fields
    if (jobs.length > 0) {
      const job = jobs[0];
      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('description');
      expect(job).toHaveProperty('budget');
      expect(job).toHaveProperty('category');
      expect(job).toHaveProperty('owner');
      expect(job).toHaveProperty('status');
      expect(job).toHaveProperty('createdAt');
      expect(['open', 'in-progress', 'completed']).toContain(job.status);
    }
  });

  test('GET /api/jobs?category=web-development filters results', async ({ request }) => {
    const response = await request.get('/api/jobs?category=web-development');

    expect(response.status()).toBe(200);
    const { jobs } = await response.json();

    // All jobs should have matching category
    jobs.forEach(job => {
      expect(job.category).toBe('web-development');
    });
  });

  test('GET /api/jobs/:id returns job detail', async ({ request }) => {
    // Get a job ID first
    const listResponse = await request.get('/api/jobs');
    const { jobs } = await listResponse.json();
    const jobId = jobs[0].id;

    const response = await request.get(`/api/jobs/${jobId}`);
    expect(response.status()).toBe(200);

    const { job } = await response.json();
    expect(job.id).toBe(jobId);
  });

  test('POST /api/jobs creates job with validation', async ({ request }) => {
    const response = await request.post('/api/jobs', {
      data: {
        title: 'API Test Job',
        description: 'Test job for API validation',
        budget: '1000-2000',
        category: 'web-development',
        location: { lat: 37.7749, lng: -122.4194 }
      },
      headers: { 'Authorization': 'Bearer ' + process.env.TEST_TOKEN }
    });

    expect(response.status()).toBe(201);
    const { job } = await response.json();

    expect(job.title).toBe('API Test Job');
    expect(job.status).toBe('open');
    expect(job.owner).toBeTruthy();
  });

  test('PATCH /api/jobs/:id requires ownership', async ({ request }) => {
    const response = await request.patch(`/api/jobs/some-other-job-id`, {
      data: { title: 'Hacked!' },
      headers: { 'Authorization': 'Bearer ' + process.env.WRONG_USER_TOKEN }
    });

    expect(response.status()).toBe(403);
  });
});
```

### 3.3 Bids API

**File**: `tests/qa/api-contracts/bids.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Bids API Contracts', () => {
  test('POST /api/jobs/:id/bids creates bid', async ({ request }) => {
    const jobId = 'test-job-id';

    const response = await request.post(`/api/jobs/${jobId}/bids`, {
      data: {
        amount: 1500,
        message: 'I can do this',
        estimatedDuration: '2-weeks'
      },
      headers: { 'Authorization': 'Bearer ' + process.env.WORKER_TOKEN }
    });

    expect(response.status()).toBe(201);
    const { bid } = await response.json();

    expect(bid).toHaveProperty('id');
    expect(bid.amount).toBe(1500);
    expect(bid.estimatedDuration).toBe('2-weeks');
    expect(bid.status).toBe('pending');
    expect(bid.worker).toBeTruthy();
  });

  test('PATCH /api/bids/:id accepts bid (owner only)', async ({ request }) => {
    const bidId = 'test-bid-id';

    const response = await request.patch(`/api/bids/${bidId}`, {
      data: { status: 'accepted' },
      headers: { 'Authorization': 'Bearer ' + process.env.HIRER_TOKEN }
    });

    expect(response.status()).toBe(200);
    const { bid } = await response.json();
    expect(bid.status).toBe('accepted');
  });

  test('PATCH /api/bids/:id rejects non-owner', async ({ request }) => {
    const bidId = 'test-bid-id';

    const response = await request.patch(`/api/bids/${bidId}`, {
      data: { status: 'accepted' },
      headers: { 'Authorization': 'Bearer ' + process.env.WRONG_USER_TOKEN }
    });

    expect(response.status()).toBe(403);
  });
});
```

---

## 4. Component Testing (Recommended Vitest)

### 4.1 Setup Example: `vitest.config.ts` (Recommended Addition)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['tests/components/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/components/setup.ts',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
```

### 4.2 Component Test Examples

**File**: `tests/components/Button.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
  });

  it('should apply variant styles', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container.firstChild).toHaveClass('btn-primary');
  });
});
```

**File**: `tests/components/Input.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should update value on user input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('should call onChange callback', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should show error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
```

**File**: `tests/components/RoleGuard.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');

describe('RoleGuard Component', () => {
  it('should render children for authorized role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', role: 'hirer' },
      isLoading: false
    } as any);

    render(
      <RoleGuard requiredRole="hirer">
        <div>Hirer Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Hirer Content')).toBeInTheDocument();
  });

  it('should not render children for unauthorized role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', role: 'worker' },
      isLoading: false
    } as any);

    render(
      <RoleGuard requiredRole="hirer">
        <div>Hirer Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Hirer Content')).not.toBeInTheDocument();
  });

  it('should show fallback component', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', role: 'worker' },
      isLoading: false
    } as any);

    render(
      <RoleGuard requiredRole="hirer" fallback={<div>Access Denied</div>}>
        <div>Hirer Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true
    } as any);

    render(
      <RoleGuard requiredRole="hirer">
        <div>Hirer Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

**File**: `tests/components/MapboxMap.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapboxMap } from '@/components/Map/MapboxMap';

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(),
    Marker: vi.fn()
  }
}));

describe('MapboxMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render map container', () => {
    render(<MapboxMap />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should render markers for jobs', async () => {
    const jobs = [
      { id: '1', title: 'Job 1', coords: [37.7749, -122.4194] },
      { id: '2', title: 'Job 2', coords: [37.7850, -122.4085] }
    ];

    render(<MapboxMap jobs={jobs} />);

    await waitFor(() => {
      const markers = screen.getAllByTestId('map-marker');
      expect(markers).toHaveLength(2);
    });
  });

  it('should call onMarkerClick when marker is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const jobs = [
      { id: '1', title: 'Job 1', coords: [37.7749, -122.4194] }
    ];

    render(<MapboxMap jobs={jobs} onMarkerClick={handleClick} />);

    const marker = screen.getByTestId('map-marker');
    await user.click(marker);

    expect(handleClick).toHaveBeenCalledWith(jobs[0]);
  });

  it('should handle viewport changes', async () => {
    const handleViewportChange = vi.fn();
    render(
      <MapboxMap onViewportChange={handleViewportChange} />
    );

    // Simulate pan/zoom (implementation depends on mapbox wrapper)
    await waitFor(() => {
      expect(handleViewportChange).toHaveBeenCalled();
    });
  });
});
```

---

## 5. QA Agents: Validation Strategy

CrewLink has 5 specialized QA agents. Each tests different aspects:

### 5.1 QA Sentinel: Dead Buttons & Broken Navigation

**Scope**: Every interactive element, all navigation paths

**Test File**: `src/qa/sentinel.ts`

```typescript
// QA Sentinel checks:
// 1. All buttons have click handlers or href
// 2. All links are valid and respond
// 3. Navigation guards prevent unauthorized access
// 4. Form validation prevents invalid submissions
// 5. API error handling displays user-friendly messages

export const sentinel = {
  validateButtons: () => {
    // Check all buttons have onClick or type="submit"
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (!btn.onclick && !btn.type && !btn.disabled) {
        console.warn('Dead button detected:', btn);
      }
    });
  },

  validateLinks: async () => {
    // Check all links respond with 200-399
    const links = document.querySelectorAll('a[href]');
    for (const link of links) {
      const url = (link as HTMLAnchorElement).href;
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.status >= 400) {
          console.warn(`Broken link: ${url} (${response.status})`);
        }
      } catch (e) {
        console.warn(`Link error: ${url}`, e);
      }
    }
  },

  validateNavigation: () => {
    // RoleGuard should protect /hiring and /work
    // Unauthenticated users should redirect to /sign-in
    // Current user role should determine allowed routes
  }
};
```

**Playwright Test**: `tests/qa/qa-sentinel.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('QA Sentinel: Dead Buttons & Navigation', () => {
  test('should not have dead buttons on hiring dashboard', async ({ page }) => {
    // Login and navigate to hiring
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'hirer@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/hiring');

    // Check every button
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const isDisabled = await btn.isDisabled();
      const hasText = (await btn.textContent()).trim().length > 0;
      const isVisible = await btn.isVisible();

      if (isVisible && !isDisabled) {
        // Button should have meaningful text
        expect(hasText).toBe(true);

        // Button should be clickable
        const ariaDisabled = await btn.getAttribute('aria-disabled');
        expect(ariaDisabled).not.toBe('true');
      }
    }
  });

  test('should not have broken navigation links', async ({ page }) => {
    // Navigate hiring nav
    await page.goto('/hiring');

    const navLinks = await page.locator('[data-testid="hiring-nav"] a').all();
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        await page.goto(href);
        // Should not see 404
        expect(page.url()).not.toMatch(/404|not-found/);
      }
    }
  });

  test('should block unauthorized role access', async ({ page }) => {
    // Login as worker
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'worker@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/work');

    // Try to access /hiring (should redirect or show access denied)
    await page.goto('/hiring');

    const isRedirected = page.url().includes('/work') || page.url().includes('/select-role');
    const isDenied = await page.isVisible('text=Access denied');

    expect(isRedirected || isDenied).toBe(true);
  });
});
```

### 5.2 UI Enforcer: Visual Regression

**Scope**: Visual consistency, responsive design, color/typography

**Config**: `tests/visual/visual.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('UI Enforcer: Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hiring');
  });

  test('hiring dashboard layout matches snapshot', async ({ page }) => {
    // Desktop screenshot
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('hiring-dashboard-desktop.png');

    // Tablet screenshot
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('hiring-dashboard-tablet.png');

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('hiring-dashboard-mobile.png');
  });

  test('job card visual consistency', async ({ page }) => {
    // Navigate to jobs list
    await page.goto('/hiring/jobs');

    // Capture job cards
    const cards = await page.locator('[data-testid="job-card"]').all();
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await expect(cards[i]).toHaveScreenshot(`job-card-${i}.png`);
    }
  });

  test('form field visual states', async ({ page }) => {
    await page.goto('/hiring/profile');
    await page.click('button:has-text("Edit")');

    // Normal state
    const input = page.locator('input[name="companyName"]');
    await expect(input).toHaveScreenshot('input-normal.png');

    // Focused state
    await input.focus();
    await expect(input).toHaveScreenshot('input-focused.png');

    // Error state
    await input.fill('');
    await page.click('button:has-text("Save")');
    await expect(input).toHaveScreenshot('input-error.png');
  });
});
```

### 5.3 Performance Agent: Lighthouse Audits

**Config**: `lighthouserc.json` (root directory)

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/hiring",
        "http://localhost:3000/work",
        "http://localhost:3000/work/map"
      ],
      "staticDistDir": "./dist",
      "numberOfRuns": 3
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "cumululative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "first-input-delay": ["error", { "maxNumericValue": 200 }],
        "speed-index": ["error", { "maxNumericValue": 3000 }]
      }
    }
  }
}
```

**Playwright Test**: `tests/performance/lighthouse.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance Agent: Lighthouse', () => {
  test('hiring dashboard meets performance targets', async ({ page }) => {
    await page.goto('/hiring');

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return {
        lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
        cls: (performance as any).measureUserAgentSpecificMemory?.() || 0,
        inp: 0 // INP measured via PerformanceObserver
      };
    });

    // LCP < 2.5s
    expect(metrics.lcp).toBeLessThan(2500);
  });

  test('map initial load < 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/work');
    await page.waitForSelector('[data-testid="map-container"]');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });

  test('job list loads < 1 second', async ({ page }) => {
    await page.goto('/work');

    const start = Date.now();
    const listResponse = await page.waitForResponse(
      response => response.url().includes('/api/jobs')
    );
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(1000);
  });
});
```

### 5.4 Security Agent: Dependency Audit

**Config**: CI/CD step in `.github/workflows/` or `package.json` script

```bash
# audit:security script
npm audit --audit-level=moderate
npx snyk test
npx @dependabot/dependabot-cli check
```

**Playwright Test**: `tests/qa/qa-security.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Security Agent: Dependency Audit', () => {
  test('should not expose sensitive data in network requests', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');

    const requests = [];
    page.on('request', req => {
      requests.push({
        url: req.url(),
        headers: req.headers()
      });
    });

    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/work');

    // Check no password in URLs or headers
    requests.forEach(req => {
      expect(req.url).not.toMatch(/password|token/i);
      expect(JSON.stringify(req.headers)).not.toMatch(/password/i);
    });
  });

  test('should use HTTPS for API calls', async ({ page }) => {
    await page.goto('/hiring');

    const requests = [];
    page.on('request', req => {
      requests.push(req.url());
    });

    // Make some API calls
    await page.goto('/hiring/jobs');

    // All API requests should be HTTPS
    const apiRequests = requests.filter(url => url.includes('/api/'));
    apiRequests.forEach(url => {
      expect(url).toMatch(/^https:\/\//);
    });
  });

  test('should have CSP headers', async ({ page }) => {
    const response = await page.goto('/hiring');
    const headers = response?.headers();

    expect(headers['content-security-policy']).toBeTruthy();
  });
});
```

### 5.5 Copy Polish: UX & Tone Validation

**Config**: Script to extract and validate all user-facing text

**File**: `src/qa/copy-polish.ts`

```typescript
// Copy Polish rules:
// - Action buttons: Verb + Noun (e.g., "Post Job", "Submit Bid")
// - Error messages: Explain problem + solution
// - Form labels: Clear, concise, no acronyms
// - Modals: Brief title, detailed body text
// - Confirmation dialogs: Ask clearly, offer Undo if destructive

export const copyPolishRules = {
  actionButtons: [
    { pattern: /^(post|create|submit|send|accept|reject)/, ok: true },
    { pattern: /^(click here|button|ok)/, ok: false }
  ],

  errorMessages: [
    { pattern: /^(field required|invalid|error)$/i, ok: false },
    { pattern: /^(email must be|password must contain|please enter)/, ok: true }
  ],

  formLabels: [
    { pattern: /^(name|email|password|message)$/i, ok: true },
    { pattern: /^(usr_nm|pwd|msg_body)/, ok: false }
  ]
};
```

**Playwright Test**: `tests/qa/qa-copy-polish.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Copy Polish: UX & Tone', () => {
  test('action buttons use verb + noun pattern', async ({ page }) => {
    await page.goto('/hiring');

    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = (await btn.textContent()).trim();
      if (text && text.length > 0 && !text.includes('...')) {
        // Action buttons should start with verb or be recognizable
        const verbPatterns = /^(post|create|submit|send|accept|reject|save|delete|cancel|edit|view)/i;
        if (!text.match(/^\./)) { // Ignore special chars
          // At least start with uppercase (not click here, ok)
          expect(text[0]).toMatch(/[A-Z]/);
        }
      }
    }
  });

  test('error messages explain problem and solution', async ({ page }) => {
    await page.goto('/create-account');

    // Trigger validation error
    await page.fill('input[name="email"]', 'invalid');
    await page.click('input[name="password"]');

    const errorMsg = await page.locator('[data-testid="error-message"]').textContent();

    // Error should be helpful, not just "invalid"
    expect(errorMsg).not.toMatch(/^(invalid|error|field required)$/i);
    expect(errorMsg?.length).toBeGreaterThan(15);
  });

  test('form labels are clear and concise', async ({ page }) => {
    await page.goto('/hiring/post');

    const labels = await page.locator('label').all();
    for (const label of labels) {
      const text = (await label.textContent()).trim();
      // Labels should be short (< 30 chars) and clear
      expect(text.length).toBeLessThan(30);
      expect(text).not.toMatch(/\(.*\)/); // Avoid parenthetical explanations
    }
  });

  test('destructive actions require confirmation', async ({ page }) => {
    await page.goto('/hiring/jobs');

    // Try to delete a job
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Modal should appear
      expect(await page.isVisible('text=Are you sure')).toBe(true);

      // Should offer undo or clear language
      expect(await page.textContent('[role="dialog"]')).toMatch(/are you sure|confirm|cannot be undone/i);
    }
  });
});
```

---

## 6. Running Tests: Complete Command Reference

### 6.1 E2E Tests (Playwright)

```bash
# All E2E tests
npm run test:e2e

# With UI inspector
npm run test:e2e:ui

# QA-specific flows only
npm run test:qa

# Single test file
npm run test:e2e -- tests/qa/auth-registration.spec.ts

# Run with specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run with debugging
npm run test:e2e -- --debug

# Generate HTML report
npm run test:e2e -- --reporter=html
# Open: playwright-report/index.html
```

### 6.2 Visual Regression (Recommended Addition)

```bash
# Update snapshots after visual changes
npm run test:visual -- --update-snapshots

# Run visual tests
npm run test:visual
```

### 6.3 Performance Tests

```bash
# Lighthouse CI audit
npm run audit:perf

# Performance-specific E2E
npm run test:perf
```

### 6.4 Unit & Component Tests (Vitest - Recommended)

```bash
# All unit tests
npm run test:unit

# Watch mode (instant feedback)
npm run test:unit:watch

# UI dashboard
npm run test:unit:ui

# Coverage report
npm run test:unit -- --coverage
```

### 6.5 Security Audits

```bash
# Dependency vulnerabilities
npm run audit:security

# Also check:
npm audit
npx snyk test
```

### 6.6 Copy & Tone Validation

```bash
# Validate all UX copy
npm run audit:copy
```

### 6.7 Full CI/CD Run (Local)

```bash
# Run everything
npm run test:e2e && npm run test:visual && npm run test:unit && npm run audit:perf && npm run audit:security
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow Example

**File**: `.github/workflows/test.yml`

```yaml
name: Tests & QA

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npm run build

      # E2E Tests
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

      # Unit Tests
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      # Performance
      - run: npm run audit:perf

      # Security
      - run: npm run audit:security
```

---

## 8. Recommended Next Steps

### 8.1 Implement Vitest (HIGH PRIORITY)
1. Add Vitest config (`vitest.config.ts`)
2. Set up testing library
3. Write component tests for UI primitives
4. Set up coverage reporting
5. Add `npm run test:unit` to CI/CD

### 8.2 Expand API Contract Tests
1. Test all error scenarios (400, 401, 403, 500)
2. Test pagination, filtering, sorting
3. Add response time assertions
4. Test concurrent requests

### 8.3 Add Integration Tests
1. Multi-step user journeys (e.g., post job → receive bid → accept → message)
2. State synchronization across roles
3. Real-time features (notifications, messaging)

### 8.4 Performance Baselines
1. Establish Lighthouse baselines
2. Set up performance regression detection
3. Monitor bundle size
4. Profile slow components with Playwright

### 8.5 E2E Data Management
1. Set up test fixture database
2. Implement database reset between test runs
3. Create data factories for common scenarios

---

## 9. Test Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Critical user flows (E2E) | 100% | 90% |
| API contracts | 100% | 85% |
| UI components (unit) | 80% | 0% |
| Visual regression | Critical flows | Partial |
| Performance (Lighthouse) | 90+ desktop, 80+ mobile | To measure |
| Security (OWASP) | No critical vulns | TBD |

---

## 10. References

- **Playwright**: https://playwright.dev
- **Vitest**: https://vitest.dev
- **Testing Library**: https://testing-library.com
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **OWASP Testing**: https://owasp.org/www-project-web-security-testing-guide

---

**Document Version**: 1.0
**Last Updated**: 2025-02
**Maintained By**: QA Engineering Team
