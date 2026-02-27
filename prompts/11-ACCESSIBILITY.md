# CrewLink Accessibility Audit & Implementation Guide

## Overview

CrewLink is a location-based job marketplace with inherent accessibility challenges: map-based interaction, dark theme design, touch-gesture navigation, and complex form workflows. This document provides specific, testable accessibility standards for CrewLink components and pages.

**Testing Standard:** WCAG 2.1 Level AA
**Last Updated:** 2026-02-27
**Owner:** Engineering Team

---

## 1. Critical Accessibility Challenges

### 1.1 Map Components (CRITICAL)

Maps are fundamentally inaccessible interfaces for screen reader users. Canvas-based rendering (MapboxMap, LeafletMap) provides no semantic information to assistive technologies.

**Challenge:** Job locations and markers on maps cannot be perceived by users with visual impairments without alternative representations.

**Solutions:**

#### 1.1.1 Map Sidebar / Bottom Sheet as Primary Text Alternative
- Provide a **complete, sortable list** of all jobs visible on map
- Include: job title, location, wage, distance from user
- Synchronize visibility: when sidebar is open, expand full list
- On mobile, bottom sheet must include all job details
- List must be keyboard navigable and screen-reader accessible

#### 1.1.2 Accessible Map Controls
- Zoom buttons: standard `<button>` elements with `aria-label="Zoom in"` and `aria-label="Zoom out"`
- Pan controls: arrow buttons with clear labels and keyboard support
- Current zoom level: announce with `aria-live="polite"` when changed
- Geolocation button: `aria-label="Show my location"`

#### 1.1.3 Job Markers On Map
- **No color-only encoding:** Markers must use shape + color + labels
  - Hourly jobs: triangle marker + blue color
  - Fixed-price jobs: circle marker + orange color
  - Completed jobs: checkmark overlay
- **Visible labels:** Show job title or category on marker (not just on hover)
- **Click feedback:** When marker selected, announce to screen readers: `aria-live="polite"` region showing selected job details

#### 1.1.4 Geolocation Permission Modal
- Clear explanation: `<h2>Location Permission</h2>` followed by descriptive paragraph
- Explain purpose: "We use your location to show nearby jobs"
- Explain scope: "This app can request your location whenever it's open"
- Buttons: "Allow" and "Not now" with clear `aria-labels`
- Do NOT use browser's default geolocation UI without accessible wrapper

#### 1.1.5 Focus Management for Map Interaction
- On map load, set focus to **map sidebar** (if present) or **zoom controls**
- Never set initial focus to map canvas itself
- When user navigates list and selects a job, focus remains in list (do NOT auto-shift focus to map)
- Provide "Press Enter to view on map" instruction in list
- Map markers reachable via keyboard: Tab through visible markers (implement proper tabindex)

**WCAG Mapping:**
- Success Criterion 1.1.1 (Non-text Content) — provide text alternative list
- Success Criterion 2.1.1 (Keyboard) — keyboard navigation for all map controls
- Success Criterion 2.4.3 (Focus Order) — logical focus sequence in sidebar then controls
- Success Criterion 4.1.3 (Status Messages) — aria-live announcements for selected jobs

---

### 1.2 Dark Theme Contrast Requirements

CrewLink's dark theme introduces specific contrast challenges. The following color pairs MUST pass WCAG AA (4.5:1 for normal text, 3:1 for large text).

#### 1.2.1 Brand Color Verification

**Current CrewLink Color Palette:**
- Primary Brand: `#0c8ce7` (brand-500)
- Accent: `#ff7f10` (accent-500)
- Dark Background: `#0f172a` (slate-900)
- Medium Dark Background: `#1e293b` (slate-800)
- Text Muted: `#94a3b8` (slate-400)
- Text Default: `#f1f5f9` (slate-100)

#### 1.2.2 Required Contrast Pairs (Minimum WCAG AA)

| Component | Foreground | Background | Required Ratio | Test Result |
|-----------|-----------|-----------|----------|----------|
| Primary Button Text | #f1f5f9 (white) | #0c8ce7 (brand) | 4.5:1 | **VERIFY** |
| Primary Button Text | #ffffff | #0c8ce7 | 4.5:1 | **VERIFY** |
| Accent Button Text | #0f172a (dark) | #ff7f10 (accent) | 4.5:1 | **VERIFY** |
| Default Text | #f1f5f9 | #0f172a | 4.5:1 | **MUST PASS** |
| Muted Text | #94a3b8 | #0f172a | 3:1 | **LIKELY FAILS** |
| Muted Text | #94a3b8 | #1e293b | 3:1 | **LIKELY FAILS** |
| Link Text | #0c8ce7 | #0f172a | 4.5:1 | **VERIFY** |
| Visited Link | #a78bfa (lighter) | #0f172a | 4.5:1 | **VERIFY** |
| Disabled Text | #64748b (slate-600) | #0f172a | 3:1 | **VERIFY** |
| Success Status | #10b981 (green) | #0f172a | 4.5:1 | **VERIFY** |
| Error Status | #ef4444 (red) | #0f172a | 4.5:1 | **VERIFY** |
| Warning Status | #f59e0b (amber) | #0f172a | 4.5:1 | **VERIFY** |

#### 1.2.3 Glass Panel Contrast
GlassPanel components use blurred backgrounds with text overlays. This is a high-risk pattern for contrast.

**Requirement:** All text on GlassPanel must maintain 4.5:1 contrast against the underlying blurred content (simulate by using average background color).

**Implementation Strategy:**
- Add semi-opaque color layer above glass blur (e.g., `rgba(15, 23, 42, 0.4)`) before text
- Test contrast with most vibrant potential background behind panel
- Consider: Use solid semi-transparent background instead of pure glass for text areas
- Never place muted-color text on glass panels

#### 1.2.4 Testing Tools
- Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Browser DevTools: Chrome DevTools color contrast indicator (Chrome 88+)
- Automated testing: axe DevTools, WAVE, or Lighthouse
- Run tests on both light (if supported) and dark theme

**Action Items:**
1. [ ] Verify all color pairs listed in table above
2. [ ] Document any failures with contrast ratio values
3. [ ] Update design tokens or component colors to pass AA
4. [ ] Add contrast checks to CI/CD pipeline using color-contrast-checker
5. [ ] Test GlassPanel contrast with at least 3 different background scenarios

---

## 2. Component-Level Accessibility

### 2.1 Navigation Components

#### 2.1.1 UniversalNav (Marketing Navigation)
**Location:** Used on landing, blog, help center pages

**Requirements:**
- [ ] Use `<nav>` semantic element
- [ ] Heading hierarchy starts at `<h1>` (page title) then `<h2>` for major sections
- [ ] Logo linked to homepage: `<a href="/" aria-label="CrewLink Home">`
- [ ] Primary navigation list: `<ul role="menubar">` with `<li role="none"><a role="menuitem">` pattern
- [ ] Dropdown menus: implement listbox pattern
  - On focus, expand dropdown
  - Arrow keys navigate options
  - Enter or Space selects option
  - Escape closes dropdown
- [ ] Mobile hamburger menu:
  - `<button aria-expanded="false" aria-controls="mobile-menu">Menu</button>`
  - When expanded: `aria-expanded="true"`
  - Mobile menu itself: `<div id="mobile-menu" role="navigation">`
  - Clicking outside or pressing Escape closes menu
  - Focus trapped within menu when open (focus first item, then back to first after last)

#### 2.1.2 HiringNav / WorkerNav (Dashboard Navigation)
**Location:** Top-left nav on `/hiring/*` and `/worker/*` pages

**Requirements:**
- [ ] Primary navigation: `<nav aria-label="Main navigation">`
- [ ] Active page indicator: `aria-current="page"` on current link
- [ ] Logo/branding: screen-reader text "CrewLink Dashboard"
- [ ] User menu button: `aria-haspopup="true" aria-expanded="false"`
- [ ] Bottom bar on mobile:
  - `<nav aria-label="Mobile navigation">` with `position: fixed; bottom: 0`
  - Tab order: bottom bar comes last in focus order (or first, depending on workflow)
  - Icons with text labels: `<button><icon /> <span>Jobs</span></button>`
  - Never use icon-only buttons without aria-labels

#### 2.1.3 Bottom Sheet (Mobile Drawer)
**Location:** Job details, filters on mobile

**Focus Management:**
- [ ] When bottom sheet opens:
  - Show `<div role="dialog" aria-labelledby="sheet-title" aria-modal="true">`
  - Set `inert` attribute on background content (prevents focus escape)
  - Move focus to first interactive element in sheet (usually close button or heading)
  - Announce to screen readers: "Job details panel opened"
- [ ] When bottom sheet closes:
  - Remove `inert` attribute
  - Return focus to trigger button (e.g., job card that opened sheet)
- [ ] Keyboard navigation:
  - Escape key closes sheet
  - Tab cycles through elements within sheet only
  - Shift+Tab cycles backwards
  - Do NOT tab out of sheet to background
- [ ] Swipe gesture alternatives:
  - Provide visible "Close" button for keyboard/screen reader users
  - Do NOT rely solely on swipe-to-close gesture
  - Handle both swipe and button close identically
- [ ] Announce content changes: use `aria-live="polite"` for job details that load asynchronously
- [ ] Scrollable content within sheet: ensure scrollbar is keyboard accessible
  - Use semantic `<button>` for "See more" if needed, not just scroll hints

**Testing:**
- Test with keyboard-only navigation (no mouse/touch)
- Test with screen reader: NVDA (Windows) or VoiceOver (Mac/iOS)
- Verify focus never escapes sheet accidentally
- Verify swiping is NOT the only way to close sheet

---

### 2.2 Form Components

#### 2.2.1 Sign-In Form (`/sign-in`)

**HTML Structure:**
```html
<form aria-label="Sign in">
  <div>
    <label for="email-input">Email Address</label>
    <input
      id="email-input"
      type="email"
      required
      aria-describedby="email-hint email-error"
    />
    <span id="email-hint" class="hint-text">
      We'll never share your email
    </span>
    <span id="email-error" class="error-text" role="alert">
      <!-- Error message appears here after submission attempt -->
    </span>
  </div>

  <div>
    <label for="password-input">Password</label>
    <input
      id="password-input"
      type="password"
      required
      aria-describedby="password-hint password-error"
    />
    <span id="password-hint">8+ characters, 1 number, 1 symbol</span>
    <span id="password-error" role="alert">
      <!-- Error message -->
    </span>
  </div>

  <button type="submit" aria-busy="false">
    Sign In
  </button>
  <!-- When loading: aria-busy="true" -->
</form>
```

**Requirements:**
- [ ] Every `<input>` has explicit `<label>` with `for` attribute
- [ ] `aria-describedby` links input to hint text AND error messages
- [ ] Error messages use `role="alert"` for instant screen reader announcement
- [ ] When form submits without validation, focus moves to first error field
- [ ] Submit button shows loading state:
  - Set `aria-busy="true"` and `disabled` attribute
  - Change text to "Signing in..." or show spinner icon with `aria-hidden="true"`
- [ ] "Forgot password?" link is always accessible (even if visually hidden on load)
- [ ] Form submission errors announced: `<div role="alert">Please fix the errors above</div>`

**WCAG Mapping:**
- 1.3.1 (Info & Relationships) — label-input association
- 3.3.1 (Error Identification) — errors identified to all users
- 3.3.3 (Error Suggestion) — helpful error messages provided
- 3.3.4 (Error Prevention) — confirmation before submission

---

#### 2.2.2 Registration Form (`/create-account`)

**Extends sign-in form with additional fields:**

**HTML Structure:**
```html
<form aria-label="Create account">
  <!-- Email & password fields (same as sign-in) -->

  <fieldset>
    <legend>Account Type</legend>
    <div role="radiogroup" aria-labelledby="account-type-legend">
      <label>
        <input type="radio" name="account-type" value="worker" />
        Find Jobs
      </label>
      <label>
        <input type="radio" name="account-type" value="hiring" />
        Post Jobs
      </label>
    </div>
  </fieldset>

  <div>
    <label for="name-input">Full Name</label>
    <input id="name-input" type="text" required />
  </div>

  <div>
    <label for="terms-checkbox">
      <input
        id="terms-checkbox"
        type="checkbox"
        required
        aria-describedby="terms-link"
      />
      I agree to the <a id="terms-link" href="/terms">Terms of Service</a>
    </label>
  </div>

  <button type="submit" aria-busy="false">Create Account</button>
</form>
```

**Requirements:**
- [ ] Use `<fieldset>` and `<legend>` for grouped fields (account type, role selection)
- [ ] Radio buttons use `role="radiogroup"` and `aria-labelledby` to legend
- [ ] Checkbox for terms/conditions: label text includes legal link
- [ ] Step indicator (if multi-step):
  - Use `<nav aria-label="Form steps">` with list of step buttons
  - Current step: `aria-current="step"`
  - Completed steps: show checkmark icon with `aria-label="Completed"`
  - Announce step changes: `<div role="status" aria-live="polite">Step 2 of 3: Account Details</div>`
- [ ] Progressive validation:
  - Validate fields on blur (not while typing)
  - Show error immediately with `aria-live="assertive"`
  - Do NOT prevent form submission during validation check
- [ ] Submission handling:
  - Show loading state on button (`aria-busy="true"`)
  - After submission error, focus returns to form
  - After submission success, announce: `<div role="alert">Account created successfully. Redirecting...</div>`

**WCAG Mapping:**
- 1.4.5 (Images of Text) — no text rendered as images
- 3.2.4 (Consistent Identification) — buttons use consistent labels
- 3.3.4 (Error Prevention) — form validated before submission

---

#### 2.2.3 Job Posting Form (`/hiring/post`, `/hiring/new`)

**Complexity:** Multi-step wizard form with category selection, job details, budget, and posting preview.

**HTML Structure:**
```html
<form aria-label="Post a job">
  <!-- Step indicator -->
  <nav aria-label="Form steps" role="tablist">
    <button
      role="tab"
      aria-selected="true"
      aria-controls="step-1-panel"
      id="step-1-tab"
    >
      <span aria-hidden="true">1</span> Job Category
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="step-2-panel"
      id="step-2-tab"
    >
      <span aria-hidden="true">2</span> Job Details
    </button>
    <!-- More steps -->
  </nav>

  <!-- Step 1: Category Selection -->
  <div
    id="step-1-panel"
    role="tabpanel"
    aria-labelledby="step-1-tab"
  >
    <fieldset>
      <legend>Select a job category</legend>
      <div role="radiogroup">
        <label>
          <input type="radio" name="category" value="construction" />
          Construction & Trades
        </label>
        <!-- More categories -->
      </div>
    </fieldset>
  </div>

  <!-- Step 2: Job Details -->
  <div
    id="step-2-panel"
    role="tabpanel"
    aria-labelledby="step-2-tab"
    hidden
  >
    <label for="job-title">Job Title</label>
    <input id="job-title" type="text" required />

    <label for="job-desc">Job Description</label>
    <textarea id="job-desc" required aria-describedby="desc-hint"></textarea>
    <span id="desc-hint">Describe the work, location, and skills needed</span>
  </div>

  <!-- Navigation buttons -->
  <button type="button" id="prev-btn" disabled>Previous</button>
  <button type="button" id="next-btn">Next</button>
  <button type="submit" hidden>Post Job</button>
</form>
```

**Requirements:**
- [ ] Implement tab panel pattern (ARIA tabs):
  - `role="tablist"` on step navigator
  - Each step: `role="tab"` with `aria-selected`, `aria-controls` to panel
  - Panel: `role="tabpanel"` with `aria-labelledby` back to tab
  - Keyboard nav: Left/Right arrows move between tabs, Enter/Space activates
- [ ] Step indicator accessibility:
  - Announce when entering new step: `<div role="status" aria-live="polite">Step 2 of 4: Job Details</div>`
  - Show percentage progress if not obvious: `aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"`
- [ ] Form field validation:
  - Validate on blur or on step advance (not during typing)
  - Show inline errors with `role="alert"` and `aria-describedby`
  - Prevent advancing to next step if validation fails
  - Announce errors: "Job title is required"
- [ ] AddressAutocomplete field:
  - Use combobox pattern (see section 2.2.5)
  - Announce suggestions as they appear
  - Allow both manual entry and selection from list
- [ ] Budget/pricing fields:
  - Fixed vs hourly toggle: radio buttons with clear labels
  - Currency input: `<input type="text" inputmode="decimal">`
  - Amount description: "Enter amount in USD"
- [ ] Textarea (job description):
  - Show character count: `<span aria-live="polite">123 characters entered</span>`
  - Optional: Show word count
  - Set reasonable `maxlength` and announce limit
- [ ] Preview step:
  - Show what job posting will look like
  - Announce any formatting issues (e.g., "Title too short")
  - Allow editing from preview (link back to relevant step)
- [ ] Final submission:
  - Disable submit button during upload
  - Show uploading status: `aria-busy="true"`
  - On success, announce: "Job posted successfully"
  - On error, focus returns to form with error message

**WCAG Mapping:**
- 1.3.1 (Info & Relationships) — fieldset/legend, label association
- 2.4.3 (Focus Order) — logical tab order through wizard steps
- 3.3.1 (Error Identification) — validation errors announced
- 4.1.3 (Status Messages) — step progress and status updates announced

---

#### 2.2.4 Bid Submission Form

**Location:** Job detail page, worker places bid

**HTML Structure:**
```html
<form aria-label="Submit bid">
  <fieldset>
    <legend>Your Bid Amount</legend>

    <div role="radiogroup" aria-labelledby="bid-type-legend">
      <legend id="bid-type-legend">Bid Type</legend>
      <label>
        <input type="radio" name="bid-type" value="fixed" />
        Fixed Price
      </label>
      <label>
        <input type="radio" name="bid-type" value="hourly" />
        Hourly Rate
      </label>
    </div>

    <div>
      <label for="amount-input">Amount (USD)</label>
      <div class="input-group">
        <span aria-hidden="true">$</span>
        <input
          id="amount-input"
          type="text"
          inputmode="decimal"
          required
          aria-describedby="amount-hint amount-error"
        />
      </div>
      <span id="amount-hint">Budget is $150 - $500</span>
      <span id="amount-error" role="alert"></span>
    </div>
  </fieldset>

  <div>
    <label for="message-input">Cover Letter (Optional)</label>
    <textarea
      id="message-input"
      aria-describedby="message-hint"
    ></textarea>
    <span id="message-hint">Tell the employer why you're a great fit</span>
  </div>

  <button type="submit" aria-busy="false">Submit Bid</button>
</form>
```

**Requirements:**
- [ ] Radio group for bid type with clear `<legend>`
- [ ] Amount input:
  - Use `inputmode="decimal"` for mobile number keyboard
  - Do NOT use `type="number"` (poor UX with spinners)
  - Validate on blur: check if within job budget
  - Announce validation result: "Your bid of $200 is within the budget"
  - Show budget range: linked to job posting via `aria-describedby`
- [ ] Cover letter textarea:
  - Character counter with `aria-live="polite"`
  - Optional field, but if present, explain purpose
- [ ] Submission feedback:
  - Loading state: `aria-busy="true"` on button
  - Success: Announce "Bid submitted successfully"
  - Error: Focus remains in form, error message announced
  - Do NOT auto-navigate away on success (let user see confirmation)

**WCAG Mapping:**
- 1.3.1 (Info & Relationships) — radio group legend, field labels
- 3.3.3 (Error Suggestion) — budget range and validation hints
- 3.3.4 (Error Prevention) — budget validation before submission

---

#### 2.2.5 AddressAutocomplete Component

**Location:** Used in job posting form, profile settings, filter widgets

**Implementation (Combobox Pattern):**

```html
<div class="address-autocomplete">
  <label for="address-input">Location</label>

  <input
    id="address-input"
    type="text"
    role="combobox"
    aria-autocomplete="list"
    aria-controls="address-listbox"
    aria-expanded="false"
    aria-describedby="address-hint"
  />
  <span id="address-hint">Start typing a city or street address</span>

  <div
    id="address-listbox"
    role="listbox"
    aria-label="Location suggestions"
    hidden
  >
    <div role="option" aria-selected="false" tabindex="-1">
      123 Main St, New York, NY
    </div>
    <!-- More options -->
  </div>
</div>
```

**Requirements:**
- [ ] Combobox pattern:
  - Input has `role="combobox"`
  - Input has `aria-autocomplete="list"` and `aria-controls` to listbox
  - Listbox has `role="listbox"`, options have `role="option"`
  - Input has `aria-expanded="false"` (true when list shown)
- [ ] Keyboard navigation:
  - Arrow Down: open list, focus first option
  - Arrow Down/Up: navigate options
  - Enter/Space: select focused option
  - Escape: close list, keep entered text
  - Tab: select highlighted option and move focus out
- [ ] Dynamic suggestions:
  - Announce suggestion count: `aria-live="polite"` region shows "5 suggestions found"
  - Do NOT auto-select first result (let user choose)
  - Remove option if no longer valid (e.g., after user edits)
- [ ] Selection feedback:
  - Selected option: `aria-selected="true"`
  - Highlighted option: Add `aria-current="true"` or use `background-color` (ensure contrast)
  - After selection, announce: "123 Main St selected"
- [ ] Error handling:
  - If no valid address: announce "No results found"
  - If API error: announce "Unable to fetch suggestions, please try again"
  - Allow manual entry even if no suggestions match (do NOT require selection from list)

**WCAG Mapping:**
- 2.1.1 (Keyboard) — full keyboard support for combobox pattern
- 2.4.3 (Focus Order) — focus moves logically through options
- 4.1.3 (Status Messages) — suggestion count and selection announced

---

#### 2.2.6 BudgetDropdown & CategoryDropdown

**Implementation (Select/Listbox Pattern):**

```html
<div class="dropdown">
  <button
    id="budget-btn"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-controls="budget-listbox"
  >
    Budget: Any
    <span aria-hidden="true">▼</span>
  </button>

  <ul
    id="budget-listbox"
    role="listbox"
    aria-label="Budget filter"
    hidden
  >
    <li role="option" aria-selected="true" tabindex="0">Any</li>
    <li role="option" aria-selected="false" tabindex="-1">Under $100</li>
    <li role="option" aria-selected="false" tabindex="-1">$100 - $500</li>
    <!-- More options -->
  </ul>
</div>
```

**Requirements:**
- [ ] Use `<select>` element if dropdown is simple (3-5 items)
  - Native `<select>` is fully accessible by default
  - Do NOT replace with custom implementation unless justified
- [ ] If custom dropdown (many items, complex options):
  - Button has `aria-haspopup="listbox"` and `aria-expanded`
  - Options: `role="option"` with `aria-selected`
  - Keyboard: Arrow Up/Down, Home/End navigate, Enter selects
  - Keyboard: Type first letter to jump to matching option
  - Focus returns to button after selection
- [ ] Selection feedback:
  - Button text updates to show selection: "Budget: $100-$500"
  - Selected option: `aria-selected="true"`
  - Announce selection: "Budget filter updated to $100-$500"
- [ ] Mobile considerations:
  - On touch devices, use native `<select>` picker if possible
  - If custom, ensure dropdown is not hidden by mobile keyboard
  - Provide "Close" button for custom mobile dropdown

**WCAG Mapping:**
- 2.1.1 (Keyboard) — full keyboard support
- 2.4.3 (Focus Order) — logical focus within dropdown
- 3.2.4 (Consistent Identification) — consistent dropdown behavior

---

### 2.3 Button Component (Button.tsx)

**Accessibility Features Required:**

```html
<!-- Standard button -->
<button type="button">Find Jobs</button>

<!-- Loading/disabled state -->
<button type="button" disabled aria-busy="true">
  <span aria-hidden="true">⟳</span> Loading...
</button>

<!-- Icon-only button (must have aria-label) -->
<button type="button" aria-label="Close job details">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- Button with icon + text (icon is decorative) -->
<button type="button">
  <svg aria-hidden="true"><!-- Down arrow --></svg>
  More Options
</button>

<!-- Destructive button (warning state) -->
<button type="button" aria-describedby="delete-warning">
  Delete Job Posting
</button>
<span id="delete-warning" class="warning-text">
  This action cannot be undone
</span>
```

**Component Requirements:**
- [ ] **Type attribute:** Always include `type="button"` (defaults to "submit" in forms)
- [ ] **Focus visible:** Use `outline: 2px solid` in `:focus-visible` pseudo-class
  - Minimum 2px outline, high contrast color (not same as background)
  - Test: Tab through page, verify every button has visible focus ring
- [ ] **Disabled state:**
  - Use `disabled` attribute (not just CSS class)
  - Add `aria-busy="true"` if loading/processing
  - Change cursor to `not-allowed`
  - Reduce opacity to 60% for visual indication
  - Screen reader announces "button, disabled"
- [ ] **Icon-only buttons:**
  - Include `aria-label`: `aria-label="Close"` or `aria-label="Delete job"`
  - Do NOT omit label even if icon seems obvious
  - Icon itself: use `<svg aria-hidden="true">` to hide from screen readers
- [ ] **Button with dropdown:**
  - Include `aria-haspopup="true"` and `aria-expanded="false"`
  - Change to `aria-expanded="true"` when menu appears
  - Announce: "Menu expanded" or similar
- [ ] **Destructive buttons:**
  - Visually distinct color (red or orange, not primary blue)
  - Include warning text with `aria-describedby`
  - Consider requiring confirmation dialog
  - Never auto-trigger destructive action
- [ ] **Primary vs secondary:**
  - Ensure sufficient color contrast between states
  - Use `font-weight: 600+` to differentiate primary button
  - Do NOT rely solely on color to show button importance

**Testing Checklist:**
- [ ] All buttons focusable with Tab key
- [ ] Focus visible at all times (use `:focus-visible`, not `:focus`)
- [ ] Disabled buttons do not receive focus
- [ ] Icon-only buttons have text alternative in `aria-label`
- [ ] Hover/focus/active states all have sufficient contrast
- [ ] Button text is descriptive (not "Click here" or "Submit")

**WCAG Mapping:**
- 2.1.1 (Keyboard) — all buttons keyboard accessible
- 2.4.7 (Focus Visible) — focus ring always visible
- 3.2.2 (On Input) — buttons do not submit on blur

---

### 2.4 Modal Component (Modal.tsx)

**Accessibility Features Required:**

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <div class="modal-header">
    <h2 id="modal-title">Confirm Delete Job</h2>
    <button
      type="button"
      aria-label="Close dialog"
      onClick={onClose}
    >
      ✕
    </button>
  </div>

  <div id="modal-description">
    <p>Are you sure you want to delete this job posting?</p>
    <p>This action cannot be undone.</p>
  </div>

  <div class="modal-footer">
    <button type="button" onClick={onClose}>Cancel</button>
    <button type="button" onClick={onConfirm} aria-describedby="delete-warning">
      Delete
    </button>
    <span id="delete-warning" class="sr-only">This action cannot be undone</span>
  </div>
</div>

<!-- Background overlay (inert content) -->
<div aria-hidden="true" onClick={onClose}></div>
```

**Requirements:**
- [ ] **Dialog structure:**
  - Container: `role="dialog"` and `aria-modal="true"`
  - Title: Use `<h2>` with `id`, link via `aria-labelledby` on dialog
  - Description: Optional paragraph with `id`, link via `aria-describedby`
  - Close button: Icon with `aria-label="Close dialog"`
- [ ] **Focus management:**
  - On open: Move focus to first focusable element (usually close button or "Cancel")
  - Never move focus to title heading
  - Tab only cycles within modal (do NOT tab out to background)
  - Shift+Tab at beginning focuses last item in modal
  - Use `inert` attribute on background to prevent accidental focus
- [ ] **Escape key:**
  - Escape key closes modal (if appropriate for modal type)
  - Do NOT trap users in required confirmation dialogs (e.g., legal agreements)
  - Test: Press Escape, verify modal closes and focus returns to trigger button
- [ ] **Screen reader announcements:**
  - When opening: screen reader announces "Dialog, [title]"
  - When announced, description text is read
  - After closing: "Dialog closed, focus returned to [button name]"
- [ ] **Backdrop:**
  - Semi-transparent overlay behind modal (0.5-0.7 opacity)
  - Overlay is `aria-hidden="true"` (not interactive)
  - Clicking overlay does NOT close modal (confusing UX)
  - Test: Verify tabbing does NOT focus overlay elements
- [ ] **Confirmation dialogs:**
  - Default focus on "Cancel" button (safer default)
  - Do NOT default focus on destructive action
  - Exception: Form dialogs default focus to first input
- [ ] **Scrolling:**
  - If modal content overflows, allow scrolling within modal only
  - Do NOT scroll page behind modal
  - Use `overflow: auto` on modal body, `overflow: hidden` on page body when modal open

**Testing Checklist:**
- [ ] Modal opens with keyboard focus in modal
- [ ] Tab cycles only within modal
- [ ] Escape closes modal and returns focus
- [ ] Screen reader announces modal title and description
- [ ] Background content is not focusable (inert)
- [ ] Overlay is not clickable to close (or explicitly allowed in design)
- [ ] Modal is centered and responsive on small screens
- [ ] Scrolling works if modal content overflows

**WCAG Mapping:**
- 2.1.1 (Keyboard) — fully keyboard operable
- 2.4.3 (Focus Order) — focus trapped within modal
- 4.1.2 (Name, Role, Value) — dialog role and title announced
- 4.1.3 (Status Messages) — focus management announced

---

### 2.5 Toast Notification Component (Toast.tsx, react-hot-toast)

**Accessibility Features Required:**

```html
<!-- Toast container (screen reader region) -->
<div
  role="region"
  aria-live="polite"
  aria-atomic="true"
  aria-label="Notifications"
  class="toast-container"
>
  <!-- Toast 1: Success -->
  <div role="status" class="toast-success">
    <svg aria-hidden="true">✓</svg>
    <span>Job posted successfully</span>
    <button
      type="button"
      aria-label="Close notification"
      onClick={dismiss}
    >
      ✕
    </button>
  </div>

  <!-- Toast 2: Error -->
  <div role="alert" class="toast-error">
    <svg aria-hidden="true">✕</svg>
    <span>Error posting job. Please try again.</span>
  </div>

  <!-- Toast 3: Loading -->
  <div role="status" aria-busy="true">
    <span aria-hidden="true">⟳</span>
    Posting job...
  </div>
</div>
```

**Requirements:**
- [ ] **Container attributes:**
  - `role="region"` (or use `<section>` if HTML5 semantic)
  - `aria-live="polite"` for non-urgent toasts (success, info)
  - Use `aria-live="assertive"` only for errors/warnings that need immediate attention
  - `aria-atomic="true"` to announce full toast, not just changes
  - `aria-label="Notifications"` to identify region to screen readers
- [ ] **Individual toast roles:**
  - Success/info: `role="status"` (implicit aria-live-region)
  - Error: `role="alert"` (implicit aria-live="assertive")
  - Loading: `role="status"` with `aria-busy="true"`
- [ ] **Toast content:**
  - Include icon or status indicator (✓, ✕, ⟳)
  - Icon: `aria-hidden="true"` (text content conveys meaning)
  - Message text must be human-readable and specific
  - Bad: "Success!" | Good: "Job posted successfully"
  - Bad: "Error" | Good: "Error posting job. Ensure all fields are filled."
- [ ] **Dismissal:**
  - If dismissible, include "Close" button with `aria-label`
  - Do NOT auto-dismiss toasts without giving users time to read
  - Minimum 5 seconds visible for reading
  - Test: Read toast aloud 2x, verify time is sufficient
- [ ] **Toast stacking:**
  - If multiple toasts visible, announce each in order
  - Screen reader should read new toasts as they appear
  - Do NOT show more than 3 toasts simultaneously
- [ ] **Auto-dismiss animation:**
  - If toast auto-hides, announce before disappearing
  - Use `aria-live="polite"` announcement: "Notification dismissed"
  - Do NOT abruptly cut off toast audio announcement

**Testing Checklist:**
- [ ] Enable screen reader, trigger action, verify toast announced
- [ ] Toast message is specific and actionable
- [ ] Multiple toasts announced in logical order
- [ ] Toast remains visible long enough to read aloud
- [ ] Close button works with keyboard (Enter/Space)
- [ ] Toasts appear in top-right (or designed location) consistently

**WCAG Mapping:**
- 4.1.3 (Status Messages) — toasts announced via aria-live
- 1.4.5 (Images of Text) — text not rendered as images in icons
- 2.1.1 (Keyboard) — close button keyboard accessible

---

### 2.6 Dropdown Component (Dropdown.tsx)

**Accessibility Features Required:**

```html
<div class="dropdown">
  <button
    id="sort-btn"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-controls="sort-menu"
  >
    Sort By: Newest
    <span aria-hidden="true">▼</span>
  </button>

  <ul
    id="sort-menu"
    role="listbox"
    aria-label="Sort options"
    hidden
  >
    <li
      role="option"
      aria-selected="true"
      tabindex="0"
      data-value="newest"
    >
      Newest First
    </li>
    <li
      role="option"
      aria-selected="false"
      tabindex="-1"
      data-value="pay"
    >
      Highest Pay
    </li>
    <!-- More options -->
  </ul>
</div>
```

**Requirements:**
- [ ] **Button attributes:**
  - `aria-haspopup="listbox"` (or "menu" if button-style options)
  - `aria-expanded="false"` (true when menu visible)
  - `aria-controls` points to menu `id`
- [ ] **Menu structure:**
  - `role="listbox"` for list-style options
  - `aria-label` describes purpose (e.g., "Sort options")
  - Options: `role="option"` with `aria-selected` state
  - Only one option can have `aria-selected="true"` (single-select)
- [ ] **Keyboard navigation:**
  - Enter/Space on button: open/close menu
  - Arrow Down/Up: navigate options
  - Home: jump to first option
  - End: jump to last option
  - First letter: jump to first option starting with letter
  - Escape: close menu, focus returns to button
  - Enter/Space: select option and close menu
- [ ] **Focus management:**
  - Initially, button is focusable (tabindex=0)
  - First option in menu: tabindex=0 (focused when menu opens)
  - Other options: tabindex=-1 (focusable only via arrow keys)
  - After selection, focus returns to button
  - Button text updates to reflect selection
- [ ] **Visual feedback:**
  - Highlighted option: background color + `aria-current="true"` (optional)
  - Selected option: bold text, checkmark icon, or distinct background
  - Hover state: same as keyboard highlight (maintain consistency)
  - Focus ring: visible on button and options
- [ ] **Multiple menu types:**
  - Single-select (sort options): `role="listbox"`, single `aria-selected`
  - Multi-select (filters): use checkboxes in menu instead of listbox
  - Action menu: `role="menu"`, options are `role="menuitem"`
  - Do NOT use listbox for multi-select; use checkboxes instead

**Testing Checklist:**
- [ ] Menu opens/closes with Enter and Escape
- [ ] Arrow keys navigate all options
- [ ] First-letter navigation works
- [ ] Selected option is visually distinct
- [ ] Focus returns to button after selection
- [ ] Button text updates after selection
- [ ] Menu hides when clicking outside
- [ ] Tab does NOT enter menu (menu is opened with Enter, not Tab)

**WCAG Mapping:**
- 2.1.1 (Keyboard) — full keyboard support
- 2.4.3 (Focus Order) — logical focus within dropdown
- 4.1.2 (Name, Role, Value) — listbox role and selected state announced
- 4.1.3 (Status Messages) — selection and menu state announced

---

### 2.7 GlassPanel Component (GlassPanel.tsx)

**Accessibility Challenge:** Semi-transparent glass backgrounds reduce text contrast.

**Requirements:**
- [ ] **Contrast verification:**
  - Measure contrast against likely background colors (simulate with color checker)
  - Test against vibrant job category colors, dark map tiles, etc.
  - All text must meet 4.5:1 minimum for WCAG AA
  - Do NOT place muted-color text on glass panels
- [ ] **Implementation strategy:**
  ```css
  .glass-panel {
    background: rgba(15, 23, 42, 0.4)
      url('data:image/svg+xml,...blur-filter');
    backdrop-filter: blur(8px);
    color: #f1f5f9; /* Light text, not muted */
  }
  ```
- [ ] **Text alternatives to blur:**
  - If glass pattern fails contrast on dark backgrounds, add solid color layer
  - Use `background: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6))` over blur
  - Test contrast again with new solid layer
- [ ] **Focus states:**
  - Interactive elements within glass panel must have visible focus ring
  - Use `outline: 2px solid #ff7f10` (high contrast accent color)
  - Test: Tab through elements on glass panel, verify focus visible
- [ ] **Interactive elements:**
  - Links: use `color: #0c8ce7` with underline (not color alone)
  - Buttons: solid backgrounds, not just text (glass background buttons not accessible)
  - Hover/focus: change background color or underline, not text color
- [ ] **Animations:**
  - Reduce blur intensity in `prefers-reduced-motion` media query
  - Consider removing glass effect entirely for users with motion sensitivity

**Testing Checklist:**
- [ ] Use WebAIM contrast checker with actual glass background
- [ ] All text meets 4.5:1 contrast
- [ ] Focus rings visible on interactive elements
- [ ] Links have underline or text decoration (not color alone)
- [ ] Buttons have sufficient background color (not just text)

**WCAG Mapping:**
- 1.4.3 (Contrast Minimum) — 4.5:1 text contrast
- 2.1.1 (Keyboard) — interactive elements within glass are keyboard accessible
- 2.4.7 (Focus Visible) — focus visible on glass background

---

### 2.8 LiveDot Component (LiveDot.tsx)

**Purpose:** Visual indicator for online/active status (e.g., "2 people looking at this job")

**Accessibility Requirements:**

```html
<!-- LiveDot with text label -->
<span class="live-indicator">
  <span class="live-dot" aria-hidden="true"></span>
  <span>2 people looking</span>
</span>

<!-- LiveDot with screen reader only label -->
<div>
  <span class="live-dot"
    role="status"
    aria-label="Job is actively being viewed"
    aria-hidden="false"
  ></span>
  <span class="sr-only">Live indicator: currently active</span>
</div>

<!-- Animated pulse (must respect prefers-reduced-motion) -->
<style>
  .live-dot {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .live-dot {
      animation: none;
    }
  }
</style>
```

**Requirements:**
- [ ] **Visual indicator:**
  - Green circle (at least 8px diameter) for active/online
  - Red or gray circle for inactive/offline
  - Use color + shape + text (do NOT rely on color alone)
- [ ] **Screen reader announcement:**
  - If icon-only: include `aria-label="Job is being viewed by 2 workers"`
  - Or include text label next to dot: "2 people looking"
  - Text is stronger than aria-label (use when possible)
- [ ] **Animations:**
  - If pulsing animation: add `@media (prefers-reduced-motion: reduce)` to remove animation
  - Do NOT auto-play animations that distract
  - Remove animation if motion sensitivity detected
- [ ] **Status updates:**
  - If count changes (2 → 3 people), announce with aria-live:
    ```html
    <span aria-live="polite" aria-atomic="true">
      3 people looking
    </span>
    ```
  - Announce changes: "Now 3 people looking"
- [ ] **Placement:**
  - Always provide visible label text or aria-label
  - Do NOT use dot as only indicator of status
  - Test: Cover dot with CSS, verify meaning is still clear from text

**Testing Checklist:**
- [ ] Dot has sufficient color contrast against background
- [ ] Text label accompanies dot or aria-label provided
- [ ] Pulsing animation removed with prefers-reduced-motion
- [ ] Status updates announced with aria-live if dynamic
- [ ] Meaning clear without relying on color alone

**WCAG Mapping:**
- 1.4.1 (Use of Color) — meaning not conveyed by color alone
- 4.1.3 (Status Messages) — status changes announced
- 2.3.3 (Animation from Interactions) — respect motion preferences

---

### 2.9 Card Components (Clickable Cards)

**Location:** Job cards, worker profile cards, bid cards

**Accessibility Challenge:** Clickable divs without proper semantics confuse screen readers.

**Incorrect Implementation (Avoid):**
```html
<!-- BAD: div with onclick is not a button -->
<div class="job-card" onClick={openJobDetails}>
  <h3>Plumbing Repair</h3>
  <p>$150 - $300</p>
</div>
```

**Correct Implementation (Use Semantic HTML):**

```html
<!-- Option 1: <button> with card styling -->
<button
  type="button"
  class="job-card"
  onClick={openJobDetails}
  aria-label="Open job details for Plumbing Repair"
>
  <h3>Plumbing Repair</h3>
  <p>$150 - $300</p>
  <p class="location">New York, NY</p>
  <p class="distance">2 miles away</p>
</button>

<!-- Option 2: <a> link wrapping card content -->
<a href="/jobs/plumbing-123" class="job-card">
  <h3>Plumbing Repair</h3>
  <p>$150 - $300</p>
  <p class="location">New York, NY</p>
  <p class="distance">2 miles away</p>
</a>

<!-- Option 3: Semantic card with interactive button inside -->
<article class="job-card">
  <h3>Plumbing Repair</h3>
  <p>$150 - $300</p>
  <p class="location">New York, NY</p>
  <p class="distance">2 miles away</p>
  <button type="button" onClick={openJobDetails}>
    View Job
  </button>
</article>
```

**Requirements:**
- [ ] **Use semantic elements:** `<button>`, `<a>`, or proper heading structure
- [ ] **Do NOT use `<div>` with onclick:** This breaks screen reader functionality
- [ ] **Card role:** Use `role="article"` if card is informational, `role="region"` if it's a distinct section
- [ ] **Clickable areas:**
  - If entire card is clickable: wrap in `<button>` or `<a>`
  - If card has multiple actions: use `<article>` with `<button>` for each action
  - Never make the whole card a button if it contains a link
- [ ] **Card content structure:**
  ```html
  <article class="job-card">
    <header>
      <h3>Job Title</h3>
      <span class="badge">Featured</span>
    </header>
    <p class="job-details">$200 fixed price</p>
    <footer>
      <p class="location">City, State</p>
      <button type="button">View Job</button>
    </footer>
  </article>
  ```
- [ ] **Focus management:**
  - Card itself should not be focusable if it contains a focusable button
  - Button inside card is focusable and receives focus
  - If entire card is a button, it receives focus (no nested buttons)
- [ ] **Focus visible:**
  - If card is a button: outline on card background
  - If card contains button: outline on button only
  - Ensure outline has sufficient contrast
- [ ] **Heading hierarchy:**
  - Card title should be `<h3>` or `<h4>` (after page `<h1>` and section `<h2>`)
  - Do NOT skip heading levels (no `<h1>` then `<h3>`)

**Testing Checklist:**
- [ ] Tab through cards, verify button or link receives focus
- [ ] Enter key activates card/button
- [ ] Screen reader announces "button, [card title]" or "link, [card title]"
- [ ] No double-nested interactive elements (button within button)
- [ ] Focus ring visible on card or internal button

**WCAG Mapping:**
- 2.1.1 (Keyboard) — card activation via Enter key
- 4.1.2 (Name, Role, Value) — button/link role and title announced
- 4.1.3 (Status Messages) — card navigation announced

---

## 3. Content Accessibility

### 3.1 Marketing Pages (Landing, Blog, Help Center)

**URL:** `/`, `/blog`, `/help`

**Requirements:**
- [ ] **Page structure:**
  - One `<h1>` per page (page title)
  - Heading hierarchy: `<h1>` → `<h2>` → `<h3>` (no skips)
  - Use `<nav>` for navigation regions
  - Use `<main>` for primary page content
  - Use `<aside>` for supplementary content (sidebar, related articles)
- [ ] **Navigation landmarks:**
  - Primary nav: `<nav aria-label="Main navigation">`
  - Footer nav: `<nav aria-label="Footer links">`
  - Breadcrumb: `<nav aria-label="Breadcrumb">` with `aria-current="page"`
- [ ] **Content structure:**
  - Blog post: Use `<article>` with `<h1>` (article title)
  - Help article: Use `<article>` with metadata (author, date)
  - FAQ: Use `<dl>` (definition list) or accordion pattern
- [ ] **Links:**
  - Link text must be descriptive: "Learn more about job bidding" (not "Learn more")
  - Never use "click here" or "read more" alone
  - External links: include `rel="noopener noreferrer"` and aria-label: "Opens in new tab"
  - Link underline: always visible, not just on hover
- [ ] **Images:**
  - All images have `alt` text describing content
  - Decorative images: `alt=""` or `aria-hidden="true"`
  - Images with text: alt text includes text content
  - Charts/graphs: include data table as text alternative
- [ ] **Skip links:**
  - Visible on focus: "Skip to main content"
  - Links to `<main>` element
  - Works on all pages

**Blog-Specific:**
- [ ] **Article metadata:**
  ```html
  <article>
    <h1>How to Write Effective Job Proposals</h1>
    <p class="byline">By Jane Smith, March 15, 2026</p>
    <p class="reading-time">5 min read</p>
    <!-- Content -->
  </article>
  ```
- [ ] **Code blocks:** If including code snippets:
  - Use `<pre><code>` with language specified: `<code class="language-javascript">`
  - Do NOT use image of code
  - Syntax highlighting must meet contrast requirements
- [ ] **Comments section:** If enabled:
  - Use form pattern (see section 2.2)
  - Each comment is an `<article>` with metadata
  - Threading: use indentation + aria-level for nested comments

**Help Center-Specific:**
- [ ] **FAQ accordion:**
  - Use details/summary pattern or implement custom accordion
  - Each question: `<button aria-expanded="false">` or `<summary>`
  - Each answer: `<div role="region">` (if custom accordion)
  - Keyboard: Space/Enter toggles, no focus trap
  - Announce expand/collapse: "Section expanded" via aria-live
- [ ] **Search functionality:**
  - Search input with clear label: `<label for="help-search">Search help articles</label>`
  - Results announced: `<div role="region" aria-live="polite">15 articles found</div>`
  - Results list: each result is a link with title and snippet
- [ ] **Categories/tags:**
  - Organized as filter buttons or dropdown menu
  - Current category: `aria-current="page"`
  - Announce filter changes: "Showing articles in Getting Started category"

**WCAG Mapping:**
- 1.3.1 (Info & Relationships) — landmark regions and heading hierarchy
- 2.4.2 (Page Titled) — descriptive page title
- 2.4.8 (Location & Wayfinding) — breadcrumb and skip links
- 1.1.1 (Non-text Content) — image alt text

---

### 3.2 City Pages (`/jobs/[city]`)

**Requirements:**
- [ ] **Page structure:**
  - Page title: `<h1>[City], [State] — Find Local Jobs</h1>`
  - Sections:
    1. Featured jobs (carousel or list)
    2. Job categories in city
    3. Recent reviews/testimonials
    4. FAQ section
- [ ] **Job list:**
  - If showing as data table: proper table markup
    ```html
    <table>
      <thead>
        <tr>
          <th>Job Title</th>
          <th>Pay</th>
          <th>Distance</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><a href="/jobs/123">Plumbing</a></td>
          <td>$200-300</td>
          <td>2 miles</td>
          <td><button>View</button></td>
        </tr>
      </tbody>
    </table>
    ```
  - If showing as card list: use card pattern (section 2.9)
  - Row focus: Tab selects row, Enter opens job details
- [ ] **Category listing:**
  - Use list of links or buttons, not custom menu
  - Current category: `aria-current="page"`
- [ ] **Testimonials/reviews:**
  - Each review: `<article role="region" aria-labelledby="review-title">`
  - Rating: announce numerically: "4 out of 5 stars" (not just stars)
  - Use `<img alt="4 out of 5 stars">` or text only
  - Never use star image alone without text equivalent

**WCAG Mapping:**
- 1.3.1 (Info & Relationships) — table headers and associations
- 1.4.5 (Images of Text) — ratings announced as text, not images only
- 2.4.3 (Focus Order) — logical focus through job list

---

### 3.3 Team Pages

**Requirements:**
- [ ] **Team member profiles:**
  - Each member: `<article>` with photo, name, title, bio
  - Photo: `<img alt="Jane Smith, Hiring Manager" src="..."/>`
  - Alt text includes name and role
  - Do NOT use decorative photos without alt text
- [ ] **Team structure:**
  - Use `<section>` for each team/department
  - Heading per section: `<h2>Engineering Team</h2>`
  - Grid layout acceptable (ensure focus order is logical)
- [ ] **Social links:**
  - Each link labeled: `<a href="..." aria-label="Jane on LinkedIn" rel="noopener noreferrer">LinkedIn</a>`
  - Include `rel="noopener noreferrer"` for external links
  - Icon + text: make text visible, not just in aria-label

**WCAG Mapping:**
- 1.1.1 (Non-text Content) — meaningful alt text on team photos
- 2.4.4 (Link Purpose) — descriptive link text

---

## 4. Animations & Motion

**Challenge:** CrewLink has 30+ animations. Users with vestibular disorders, migraines, or seizure disorders can be harmed by motion.

### 4.1 Respecting prefers-reduced-motion

**Global CSS Implementation:**

```css
/* Default animation (respects user preference) */
@media (prefers-reduced-motion: reduce) {
  /* Remove ALL animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Specific animation disabling */
  .slide-animation {
    animation: none;
  }

  .fade-animation {
    animation: none;
  }

  .pulse-animation {
    animation: none;
  }

  .bounce-animation {
    animation: none;
  }

  /* Keep essential transitions (e.g., focus) */
  button:focus-visible {
    outline: 2px solid #0c8ce7;
    outline-offset: 2px;
    /* Do NOT disable focus transition */
  }
}
```

### 4.2 Individual Animation Audit

**Audit every animation in CrewLink for these requirements:**

| Animation Name | Current Duration | Behavior | Needs prefers-reduced-motion? |
|---|---|---|---|
| AmbientBackground particles | ? | Floating, infinite | YES - disable entirely |
| Bottom sheet slide-up | ? | Entrance animation | YES - instant instead |
| Toast slide-in | ? | Notification entrance | YES - instant instead |
| Dropdown fade-in | ? | Menu appearance | YES - instant instead |
| Skeleton loader pulse | ? | Repeating shimmer | YES - static instead |
| Page transition fade | ? | Between pages | YES - instant instead |
| Button hover scale | ? | 1.02x → 1.05x | OPTIONAL - can keep |
| Focus ring pulse | ? | Attention-grabbing | CONDITIONAL - make subtle |
| Loading spinner | ? | Rotating icon | YES - static or instant |
| Marker pop animation | ? | Map marker appears | YES - instant instead |

**Action Items:**
1. [ ] Audit all animations: use browser DevTools Performance tab to capture all animations
2. [ ] Document each animation: name, duration, location
3. [ ] Add `@media (prefers-reduced-motion: reduce)` to each
4. [ ] Test with prefers-reduced-motion enabled in OS (Windows: Settings > Ease of Access > Display, macOS: System Prefs > Accessibility > Display)
5. [ ] Verify no motion sensitivity occurs after removing animations

### 4.3 AmbientBackground Component (CRITICAL)

**Current Implementation:** Floating particles/shapes with animations

**Issues:**
- Constant, unavoidable motion
- Can cause seizures or migraines
- Non-dismissible

**Required Changes:**
```jsx
// AmbientBackground component
import { useReducedMotion } from 'react-use-gesture';

export function AmbientBackground() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    // Return static background without animation
    return (
      <div
        className="ambient-bg-static"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          position: 'fixed',
          inset: 0,
          zIndex: -1,
        }}
      />
    );
  }

  // Return animated background for users who can handle motion
  return (
    <div className="ambient-bg-animated" aria-hidden="true">
      {/* Particles with animation */}
    </div>
  );
}
```

**CSS:**
```css
.ambient-bg-animated {
  animation: float 20s ease-in-out infinite;
}

.ambient-bg-static {
  /* No animation */
}

@media (prefers-reduced-motion: reduce) {
  .ambient-bg-animated {
    animation: none;
  }
}
```

**WCAG Mapping:**
- 2.3.3 (Animation from Interactions) — respect motion preferences
- 2.3.2 (Three Flashes) — no content flashes more than 3x/second

---

## 5. Role Switching & State Changes

**Location:** Worker profile → Hire jobs, Hiring profile → Apply for jobs

**Requirements:**
- [ ] **Role change modal:**
  - Clear explanation: "Switch to Hiring to post jobs"
  - Confirm button: "Switch to Hiring"
  - Cancel button: "Stay as Worker"
  - On switch: `<div role="status" aria-live="polite">Switched to Hiring profile. You can now post jobs.</div>`
- [ ] **Screen reader announcement:**
  - On page load: Announce current role
  - On role switch: Announce new role and available actions
  - Navigation updates: announce new nav items available
- [ ] **Navigation synchronization:**
  - After role switch, update HiringNav or WorkerNav
  - Announce which nav items are now available
  - Focus moves to first item in new nav
- [ ] **State persistence:**
  - If user is switching roles frequently, remember last role used
  - Announce: "Your profile was last set to [role]. Switch to [role]?"

**WCAG Mapping:**
- 4.1.3 (Status Messages) — role change announced to screen readers
- 2.4.3 (Focus Order) — focus updates after role switch

---

## 6. Notification Badges

**Location:** Unread bids, messages, job updates

**Requirements:**
- [ ] **Badge implementation:**
  ```html
  <!-- Icon with visible badge -->
  <button aria-label="Bids (3 unread)">
    <svg aria-hidden="true"><!-- Bell icon --></svg>
    <span class="badge" aria-hidden="true">3</span>
  </button>

  <!-- Or use aria-label only for icon -->
  <button aria-label="3 unread bids">
    <svg aria-hidden="true"><!-- Bell icon --></svg>
  </button>
  ```
- [ ] **Screen reader announcement:**
  - Badge number in button aria-label: "Bids (3 unread)"
  - Or separate: "Unread bids, 3"
  - Do NOT rely on badge number alone
- [ ] **Badge updates:**
  - When new notification arrives: `<div role="status" aria-live="polite">New bid from Jane Smith</div>`
  - Announce: "New bid from Jane Smith on Plumbing job"
  - Do NOT just announce "Badge updated to 4"
- [ ] **Badge visibility:**
  - Badge visible number text (not just aria-label)
  - Number clearly readable (minimum 12px font)
  - Contrasts with background (at least 3:1)

**WCAG Mapping:**
- 4.1.3 (Status Messages) — badge updates announced via aria-live
- 1.4.3 (Contrast Minimum) — badge number has sufficient contrast

---

## 7. Loading States & Skeleton Loaders

**Requirements:**
- [ ] **Skeleton loader accessibility:**
  ```html
  <!-- Skeleton (loading state) -->
  <div
    role="status"
    aria-label="Loading job details..."
    aria-busy="true"
  >
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text"></div>
  </div>
  ```
- [ ] **Attributes:**
  - `role="status"` — announces the region updates
  - `aria-label="Loading [content name]"` — tells user what's loading
  - `aria-busy="true"` — indicates loading in progress
  - After load: Remove `aria-busy`, change `aria-label` to loaded content title
- [ ] **Visual indication:**
  - Skeleton has light gray background
  - Shimmer animation (with prefers-reduced-motion support)
  - Clear that content is loading (do NOT look like finished content)
- [ ] **Timeout handling:**
  - If load takes >3 seconds, show message: "Still loading... please wait"
  - If load fails, announce error immediately
  - Do NOT show skeleton forever if request hangs
- [ ] **Loading announcements:**
  - On page enter: "Loading job details, please wait"
  - After load: "Job details loaded"
  - On error: "Failed to load job details. Please try again."

**WCAG Mapping:**
- 4.1.3 (Status Messages) — loading state announced via role="status"
- 2.4.2 (Page Titled) — page title updates after load

---

## 8. Testing & Validation

### 8.1 Automated Testing Tools

**Recommended tools:**
- **axe DevTools** (Chrome, Firefox): browser extension for automated scanning
- **WebAIM WAVE** (browser extension): visual feedback on accessibility issues
- **Lighthouse** (Chrome DevTools): built-in accessibility audits
- **Pa11y** (CLI): automated accessibility testing in CI/CD
- **color-contrast-checker** (npm): programmatic contrast validation

**CI/CD Integration:**
```bash
# Add to package.json scripts
"test:a11y": "pa11y-ci --config pa11yci.json"
"test:contrast": "node scripts/check-contrast.js"

# Run before deployment
npm run test:a11y && npm run test:contrast
```

### 8.2 Manual Testing Checklist

**Keyboard Navigation:**
- [ ] Tab through entire page (no focus traps)
- [ ] Reverse Tab (Shift+Tab) works
- [ ] Enter/Space activate buttons
- [ ] Arrow keys navigate menus and lists
- [ ] Escape closes modals and dropdowns
- [ ] Focus visible on all interactive elements
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] No keyboard-only dead ends

**Screen Reader Testing:**
- [ ] Use NVDA (Windows) or VoiceOver (Mac)
- [ ] Navigate entire page with screen reader
- [ ] Headings announced at correct level
- [ ] Form fields labeled and announced
- [ ] Buttons announced with action text
- [ ] Links announced with descriptive text
- [ ] Lists and tables structure announced
- [ ] Error messages and alerts announced
- [ ] Status changes announced (loading, success, error)
- [ ] Image alt text read aloud
- [ ] Landmarks and regions announced

**Visual Contrast:**
- [ ] Text contrast: 4.5:1 minimum for normal text (WCAG AA)
- [ ] Text contrast: 3:1 minimum for large text (18pt+)
- [ ] Focus rings visible on dark and light backgrounds
- [ ] Color not the only way to convey information
- [ ] Use WebAIM Contrast Checker for spot checks
- [ ] Test dark theme colors systematically

**Mobile Accessibility:**
- [ ] Touch targets at least 44x44px
- [ ] Bottom sheet is keyboard accessible
- [ ] No swipe-only interactions
- [ ] Mobile menu is focus-trapped and dismissible
- [ ] Text input does NOT zoom on focus (font-size ≥ 16px)
- [ ] Landscape orientation works (not rotated fixed)

**Motion Sensitivity:**
- [ ] Enable `prefers-reduced-motion` in OS
- [ ] All animations disabled or instant
- [ ] AmbientBackground removed or static
- [ ] No strobing or flashing effects
- [ ] Page is usable without animations

**Color Blindness:**
- [ ] Use Color Blindness Simulator (Polypane, Color Oracle)
- [ ] Test deuteranopia (red-green), protanopia, tritanopia
- [ ] Shapes/labels used in addition to color (e.g., blue circle + "Active")
- [ ] Status indicators (success, error, warning) not color-only
- [ ] Job categories not distinguished by color alone

**Zoom & Magnification:**
- [ ] Text remains readable at 200% zoom
- [ ] Layout does NOT break at 200% zoom
- [ ] Interactive elements remain clickable at zoom
- [ ] No horizontal scroll required at 200% zoom

### 8.3 Testing Checklist by Page

**Sign-In Page (`/sign-in`):**
- [ ] Form fields labeled
- [ ] Error messages announced
- [ ] Focus management on error
- [ ] Button loading state announced
- [ ] "Forgot password?" accessible

**Job Search Page (`/jobs`):**
- [ ] Map alternatives (sidebar list)
- [ ] Filter controls keyboard accessible
- [ ] Job list keyboard navigable
- [ ] Filter changes announced
- [ ] No auto-submitted forms

**Job Detail Page (`/jobs/[id]`):**
- [ ] Job title announced
- [ ] All job details readable
- [ ] Contact/message form accessible
- [ ] Map accessible (sidebar alternative)
- [ ] Related jobs list keyboard navigable

**Job Posting Form (`/hiring/post`):**
- [ ] Multi-step wizard keyboard navigable
- [ ] Step progress announced
- [ ] Form validation errors announced
- [ ] AddressAutocomplete combobox accessible
- [ ] Submit button loading state announced

**Worker Profile (`/worker/profile`):**
- [ ] Edit buttons functional
- [ ] Form fields labeled
- [ ] Role switch button/link accessible
- [ ] Logout button accessible

---

## 9. Accessibility Maintenance

### 9.1 Regular Audits

**Monthly:**
- [ ] Run Lighthouse audit in CI/CD
- [ ] Test critical user journeys with screen reader
- [ ] Check for new regressions (axe DevTools)

**Quarterly:**
- [ ] Manual full-page accessibility audit
- [ ] Contrast verification on dark theme
- [ ] Mobile device testing (iOS VoiceOver, Android TalkBack)
- [ ] User testing with people with disabilities

**Annually:**
- [ ] WCAG 2.1 Level AA compliance audit
- [ ] Update accessibility documentation
- [ ] Review and update color contrast specifications
- [ ] Accessibility training for engineering team

### 9.2 Accessibility Champions

**Designate team members:**
- Accessibility lead (owner of this document)
- QA accessibility tester
- Designer responsible for color contrast
- Frontend engineer for component a11y

**Responsibilities:**
- Lead: oversee accessibility strategy, resolve issues
- QA: test accessibility in QA environment before release
- Designer: verify color contrast, test dark theme
- Frontend: implement accessible components, review PRs

### 9.3 Bug Tracking

**Create a11y issues with:**
- WCAG criterion affected
- Severity (critical, major, minor)
- Component or page affected
- Steps to reproduce
- Expected vs actual behavior
- Example: "CRITICAL - Sign-in form lacks error announcements (WCAG 3.3.1)"

**Critical (must fix before release):**
- Form validation not announced
- Keyboard trap (focus escape)
- No text alternative for map/image
- Color contrast below 3:1

**Major (fix in next sprint):**
- Missing aria-labels on buttons
- Focus not visible
- Heading hierarchy broken
- Animation without prefers-reduced-motion support

**Minor (fix in backlog):**
- Verbose screen reader announcements
- Suboptimal focus order (but logical)
- Nice-to-have landmark regions

---

## 10. Conclusion & Resources

**This accessibility audit covers:**
- WCAG 2.1 Level AA standards
- CrewLink-specific accessibility challenges (maps, dark theme, forms, mobile)
- Component-level implementation guides with code examples
- Testing strategies and tools
- Maintenance and improvement processes

**Next Steps:**
1. [ ] Assign accessibility lead
2. [ ] Audit existing CrewLink components (maps, navigation, forms)
3. [ ] Add prefers-reduced-motion support to AmbientBackground
4. [ ] Verify color contrast on dark theme
5. [ ] Implement automated accessibility testing in CI/CD
6. [ ] Schedule manual accessibility testing (quarterly)
7. [ ] Train development team on accessibility best practices

**Useful Resources:**
- WebAIM: https://webaim.org/
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- Accessibility Insights (free Chrome extension): https://accessibilityinsights.io/
- Polypane Accessibility Simulator: https://polypane.app/
- A11y Project: https://www.a11yproject.com/

---

**Document Status:** Ready for implementation
**Last Reviewed:** 2026-02-27
**Next Review:** 2026-08-27 (6 months)
