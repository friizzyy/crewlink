# CrewLink UI Premium Upgrade Audit & Execution Guide

> **Purpose:** This file is an exhaustive, page-by-page audit prompt designed to be fed to Claude Code (terminal). It tells Claude exactly what to examine, what standards to apply, and what upgrades to make across every page of CrewLink — marketing pages, auth flows, hirer dashboard, worker dashboard, and shared components. Nothing here changes the existing design system, brand palette, or custom components. Everything here elevates what's *inside* them.

---

## GOLDEN RULES (Read Before Touching Anything)

1. **Do NOT change brand colors, gradients, font family, or the design token system.** The palette stays. The shadows stay. The animation library stays. You are upgrading content, layout rhythm, hierarchy, and polish — not redesigning.

2. **Do NOT replace custom components (GlassPanel, GlassCard, LiveDot, GlowButton, etc.).** These are the signature. You can improve what goes inside them, how they're spaced, and what micro-interactions they use.

3. **Every page should feel like it was designed by a small, obsessive design studio — not generated.** That means: intentional asymmetry where appropriate, varied section rhythms (not every section is the same height), real copywriting cadence, unexpected micro-details (subtle hover states, staggered animation delays, contextual empty states), and zero generic placeholder energy.

4. **Target audience:** People who aren't tech-savvy but use modern apps daily (Instagram, Uber, Cash App). They expect things to *just work* and look good doing it. Younger users (18-30) should feel like this app is on their level — not corporate, not boring, not templated.

5. **No "AI slop" tells.** That means:
   - No symmetrical 3-column grids where every card is identical height with identical copy structure
   - No "Whether you're a [X] or a [Y], we've got you covered" style copy
   - No emoji bullets, no "🚀 Get Started Today!" energy
   - No lorem ipsum-feeling placeholder copy
   - Section headlines should feel like a human copywriter wrote them — punchy, varied rhythm, some short and some long
   - Avoid the pattern of: Icon → Bold Title → 2-line description repeated 3-6 times in a grid

6. **Hierarchy is king.** Every page needs a clear visual hierarchy: one hero element that dominates, supporting content that recedes, and CTAs that feel natural — not screaming.

7. **Whitespace is premium.** When in doubt, add more breathing room. Dense layouts feel cheap. Let elements float in space.

8. **Stagger everything.** Animation delays should be staggered (50-100ms increments) so elements cascade in, not pop in simultaneously. This single detail separates premium from template.

---

## PHASE 1: MARKETING PAGES (Public-Facing)

These are the pages that make the first impression. They need to feel like a Y Combinator-backed startup's marketing site, not a Wix template.

### 1.1 Landing Page (`/src/app/(marketing)/page.tsx` + landing variants)

**Audit checklist:**
- [ ] Hero section: Is there a single, dominant headline? Or is it cluttered with too many elements competing for attention?
- [ ] Hero CTA: Are there 1-2 clear CTAs max? Not 3+ buttons fighting each other?
- [ ] Social proof: Is there a trust strip (logos, review count, user count) near the hero? If not, add one.
- [ ] Section rhythm: Do sections alternate in visual weight? (Heavy → Light → Heavy → Light) or is every section the same density?
- [ ] Floating cards / feature previews: Are they showing real-feeling data? Not obviously fake placeholder data?
- [ ] Scroll animations: Are they staggered with delay increments? Or do all elements animate at once?
- [ ] Mobile: Does the hero collapse gracefully? Is the CTA above the fold on mobile?

**Upgrades to make:**
- Add staggered animation delays (each child element +75ms) to any section that currently fades in as a block
- If the hero has a subtitle, make it a lighter font-weight (font-light or font-normal) and slightly larger than body text — not the same weight as the headline
- Any feature grid: break the symmetry. Consider making one card span 2 columns, or use a masonry-style offset. If you can't do masonry, at minimum vary the card content lengths so they don't look cookie-cutter.
- Add a "trust strip" below the hero if one doesn't exist — something like: "Trusted by 2,000+ workers in [city]" with a row of tiny avatar circles (can be colored circles as placeholders) and a star rating
- Footer CTA section: make it feel like a closing statement, not a copy-paste of the hero. Different headline, different energy, same button.
- Any "How it works" preview on the landing page should use numbered steps with a subtle connecting line or progress indicator between them — not just isolated cards.

### 1.2 How It Works (`/src/app/(marketing)/how-it-works/page.tsx`)

**Audit checklist:**
- [ ] Are the hiring flow and working flow clearly separated? Can a user instantly find their path?
- [ ] Step numbers: Do they use prominent, styled step indicators (not just "Step 1" text)?
- [ ] Visual flow: Is there a visual connector between steps (line, arrow, progress bar)?
- [ ] Micro-illustrations: Are steps accompanied by any visual (icon, mini screenshot, illustration)?
- [ ] CTAs: Does each flow end with a relevant CTA? ("Post Your First Job" / "Start Earning")

**Upgrades to make:**
- Add a tab switcher or toggle at the top: "I want to hire" / "I want to work" — with smooth content transition between the two flows. If one already exists, ensure the toggle itself feels premium (pill-style with animated active indicator, not plain tabs).
- Step indicators should be large numbered circles with gradient backgrounds that match the mode color (cyan for hire, emerald for work). Connect them with a subtle dashed or gradient line.
- Each step should have a slightly different layout — not all identical cards. Example: Step 1 = text left / visual right, Step 2 = full width with centered content, Step 3 = text right / visual left. Break the repetition.
- Add a "What makes CrewLink different?" comparison strip below the steps — subtle, not aggressive. Simple 2-3 column comparison against "traditional" hiring (Craigslist, word-of-mouth).

### 1.3 Safety & Trust (`/src/app/(marketing)/safety/page.tsx`)

**Audit checklist:**
- [ ] Trust pillars: Are they displayed with enough visual weight? This page needs to feel *reassuring*, not just informative.
- [ ] Icons: Are trust-related icons prominent and well-sized?
- [ ] FAQ section: Is it collapsible/expandable? Does it feel interactive, not static?
- [ ] Tone: Does the copy feel confident and human? Not corporate-legal?

**Upgrades to make:**
- Lead with a bold, human statement: something that feels real, not "Your safety is our priority" (the most generic safety headline in existence).
- Trust pillars should use large icons (48px+) with subtle background shapes behind them (soft rounded rectangles or circles in brand-50 opacity). Not just floating icons.
- Add real-feeling (but mock) testimonial quotes from workers AND hirers about feeling safe. Use quotation marks, names, and a small avatar. These should feel genuine, not polished marketing copy.
- The FAQ section: ensure each expandable item has a smooth height transition (not instant show/hide). Use Framer Motion's AnimatePresence for this.
- Consider adding a "How we verify workers" visual flow — 3-4 steps showing the verification pipeline. Make it feel transparent and thorough.

### 1.4 Pricing (`/src/app/(marketing)/pricing/page.tsx`)

**Audit checklist:**
- [ ] Pricing cards: Is the "recommended" tier visually distinct? Does it have a badge, glow, or scale difference?
- [ ] Feature lists: Are they scannable? Using check marks, not paragraphs?
- [ ] Comparison: Is there a toggle for "For Hirers" / "For Workers" if applicable?
- [ ] CTA clarity: Is the action button on each card clear about what happens next?

**Upgrades to make:**
- The recommended/popular tier card should be slightly larger (scale-105 or extra padding) and have a subtle glow-accent or border-brand-400 border. It should also have a "Most Popular" badge pinned to the top.
- Add a "What's included with every plan" section below the cards — a simple row of icons with labels (verified profiles, secure payments, 24/7 support, etc.). This reassures users without cluttering the cards.
- Feature lists inside cards: Use subtle color-coded checkmarks (brand for included, slate-400 for excluded). Don't just use plain text lists.
- Add a single-line FAQ strip at the bottom: "Can I switch plans? · Is there a contract? · How does billing work?" — each is a clickable accordion item.

### 1.5 About (`/src/app/(marketing)/about/page.tsx`)

**Upgrades to make:**
- Lead with the mission, not the company description. One bold line about why CrewLink exists.
- Team section (if on this page): Use card hover effects that reveal a fun fact or short quote from each team member. Not just name/title/photo.
- Add a timeline or milestone strip showing the company journey — feels authentic and builds trust.
- Use pull quotes or highlighted stats ("10,000+ jobs completed") with large typography and subtle gradient text.

### 1.6 Help Center (`/src/app/(marketing)/help/page.tsx` + sub-routes)

**Upgrades to make:**
- The help center hub should feel like a friendly support page, not a documentation dump. Use category cards with icons that link to sub-sections.
- Search bar at the top should be prominent (not tucked away). Large, with placeholder text like "What do you need help with?"
- Article pages: use comfortable reading width (max-w-2xl or max-w-3xl), generous line height (leading-relaxed), and a sticky sidebar TOC for longer articles.
- "Still need help?" CTA at the bottom of every article — links to contact support.

### 1.7 Careers (`/src/app/(marketing)/careers/page.tsx` + sub-routes)

**Upgrades to make:**
- Job listings should use card hover effects (subtle lift + shadow increase).
- Each listing card: show department, location, type (Full-time/Part-time) as small badges/tags.
- Individual job page: use a two-column layout — job description on the left (wide), apply button + company info on the right (narrow, sticky).
- Application success page: make it feel celebratory, not just "Thanks, we'll be in touch." Add confetti animation or a satisfying check mark animation.

### 1.8 Contact (`/src/app/(marketing)/contact/page.tsx`)

**Upgrades to make:**
- Form layout: two-column for name/email (side by side), full-width for subject and message. Not all stacked.
- Add a "Response time: typically within 24 hours" note near the submit button.
- Add alternative contact methods (email, social links) beside the form, not hidden in the footer.

### 1.9 Marketing Footer (`/src/components/layout/MarketingFooter.tsx`)

**Upgrades to make:**
- Ensure link groups have clear visual separation (not just text next to text).
- Add a subtle top border or gradient divider between page content and footer.
- Newsletter signup (if exists) should be a single-line input + button combo, not a full form.
- Social links should have hover color transitions (slate → brand color).
- Bottom legal text (copyright, privacy, terms) should be notably smaller and lighter — it's required, not featured.

---

## PHASE 2: AUTH PAGES (First-Contact Flow)

These screens determine whether someone stays or bounces. They need to feel effortless and premium.

### 2.1 Sign In (`/src/app/(auth)/sign-in/page.tsx`)

**Upgrades to make:**
- Center the form vertically and horizontally in the viewport. It should float in space, not sit at the top.
- Add the CrewLink logo above the form (centered, not too large — 120-160px wide).
- Form fields: use the Input component with clear labels, not placeholder-only inputs (people forget what they're typing).
- "Forgot password?" link should be right-aligned below the password field, not below the submit button.
- CTA button: full-width, prominent. "Sign In" not "Submit."
- Below: "Don't have an account? Create one" — link to create-account. Subtle, not competing with the form.
- Consider adding a subtle brand gradient line or glow accent at the top of the form card.

### 2.2 Create Account (`/src/app/(auth)/create-account/page.tsx`)

**Upgrades to make:**
- Same centering and spacing as sign-in.
- If there's a mode/role selector on this page, make it visual (large cards to tap, not a dropdown).
- Password field: add a show/hide toggle and strength indicator bar.
- Terms checkbox: "By creating an account, you agree to our Terms and Privacy Policy" — with linked text. Don't make the checkbox feel like a legal threat.

### 2.3 Select Role (`/src/app/(auth)/select-role/page.tsx`)

**Upgrades to make:**
- This is a critical moment. Two large, visually distinct option cards: "I want to hire" and "I want to work."
- Each card should have: a relevant icon (large), a short description (1 line), and a subtle color accent matching the mode (cyan for hire, emerald for work).
- Hover/tap state: card lifts, border color intensifies, subtle glow.
- No submit button needed — clicking the card should be the action (with a brief loading state or animation).
- Add a "Don't worry, you can always switch later" reassurance line below the cards.

### 2.4 Forgot Password / Reset Password

**Upgrades to make:**
- Same centered, minimal layout as sign-in.
- Clear step indication: "Enter your email" → "Check your inbox" → "Set new password."
- Success state after submitting email: show a mail icon with a subtle animation and "We sent you a reset link" message. Don't just show a plain text confirmation.

---

## PHASE 3: HIRER DASHBOARD (App — `/hiring/*`)

This is where hirers spend their time. It needs to feel like a control center that's approachable, not overwhelming.

### 3.1 Hiring Dashboard Home (`/src/app/hiring/page.tsx`)

**Audit checklist:**
- [ ] Does the dashboard have a clear hierarchy? What's the first thing a hirer sees?
- [ ] Are key stats visible (active jobs, pending bids, messages)?
- [ ] Is there a primary CTA ("Post a New Job") that's always reachable?
- [ ] Quick actions: are recent jobs, latest bids, and unread messages surfaced?

**Upgrades to make:**
- Top section: greeting ("Hey Julius, here's what's happening") + stat cards in a row (Active Jobs, Pending Bids, Unread Messages). Stat cards should use the StatCard component with subtle brand accents.
- Primary CTA ("Post a Job") should be a prominent GlowButton or primary Button near the top — not buried.
- Below stats: a two-column layout. Left: "Recent Job Posts" (2-3 cards, link to full list). Right: "Latest Bids" (2-3 items) or "Recent Messages" (2-3 conversation previews).
- Empty states: if a hirer has no jobs yet, show an encouraging empty state with illustration and "Post your first job in under 2 minutes" CTA. Make it feel warm, not blank.
- Add staggered fade-in animations to dashboard sections (each section +100ms delay).

### 3.2 Hiring Map (`/src/app/hiring/map/page.tsx`)

**Upgrades to make:**
- Sidebar (MapSidebarShell): ensure the search input is prominent and the category filters are easy to scan. Active category should have a clear selected state (filled background, not just bold text).
- Worker cards in sidebar: ensure they show the most important info at a glance (name, rating, rate, distance). Don't overload with details.
- Selected worker card (expanded): show more detail (bio preview, skills, availability) without navigating away. Use a smooth height transition.
- Map pins: should have a subtle shadow and scale animation on hover. Selected pin should be visually distinct (larger, glowing, different color).
- Empty state for "no workers in this area": helpful message + suggestion to expand search radius.

### 3.3 My Jobs (`/src/app/hiring/jobs/page.tsx`)

**Upgrades to make:**
- Tab/filter bar at the top: "All · Active · Pending · Completed · Cancelled" — use pill-style tabs with count badges.
- Job cards (JobPostListCard): ensure status badges are color-coded and instantly readable. Active=green, Pending=amber, Completed=blue, Cancelled=slate.
- Each card's hover state: subtle lift + shadow increase. Clicking navigates to detail.
- Empty state per tab: "No active jobs" should feel helpful ("Ready to post your next job?"), not just blank.
- Add a sort dropdown (Newest first, Budget: High to Low, Most bids) — subtle, top-right of the list.

### 3.4 Post a Job (`/src/app/hiring/new/page.tsx` or `/hiring/post/page.tsx`)

**Upgrades to make:**
- Multi-step form: if it's a long form, break it into steps with a progress indicator (step dots or progress bar at the top). Don't present one giant form.
- Step 1: Category + Title. Step 2: Description + Requirements. Step 3: Budget + Timeline. Step 4: Location. Step 5: Review & Post.
- Each step should be visually contained (card or section) with clear "Next" and "Back" navigation.
- Category selection: use large, tappable cards with icons — not a dropdown. This is a critical choice and should feel intentional.
- Budget input: use the BudgetDropdown or a slider with labeled markers. Show a "typical range for this category" hint.
- Location step: map preview with pin placement. Let the user drag the pin or use AddressAutocomplete.
- Review step: summarize everything in a clean card. "Post Job" CTA should feel confident (GlowButton).
- Form validation: inline errors (red border + message below field), not a list of errors at the top.

### 3.5 Job Detail (`/src/app/hiring/job/[id]/page.tsx`)

**Upgrades to make:**
- Header: job title, status badge, posted date, location — all in a clear hierarchy.
- Bid list: each bid should be a card with worker avatar, name, rating, bid amount, and a short message preview. Action buttons: "Accept" (primary), "Message" (secondary), "Decline" (ghost/text).
- Job description section: formatted text with comfortable reading width.
- Sidebar or right column: job stats (views, bids count, time since posted), map pin preview, edit/cancel actions.
- If job is completed: show review section prominently.

### 3.6 Messages (`/src/app/hiring/messages/page.tsx`)

**Upgrades to make:**
- Two-panel layout: conversation list (left, narrow), active conversation (right, wide).
- Conversation list items: worker avatar, name, last message preview (truncated), timestamp, unread indicator (dot or badge).
- Active conversation: messages in bubbles (hirer right-aligned/brand color, worker left-aligned/slate). Timestamps between message groups, not on every message.
- Input area: full-width input with send button. Subtle border-top to separate from messages.
- Empty state (no conversations): "Your conversations will appear here once workers start bidding on your jobs."
- Mobile: conversation list and conversation should be separate views (tap to open), not side-by-side.

### 3.7 Notifications (`/src/app/hiring/notifications/page.tsx`)

**Upgrades to make:**
- Group notifications by date: "Today", "Yesterday", "Earlier this week."
- Each notification: icon (type-specific: bid, message, review, system), text, timestamp, read/unread state.
- Unread notifications should have a subtle left border accent or background tint.
- "Mark all as read" action: subtle text button, top-right.
- Empty state: "You're all caught up!" with a relevant icon.

### 3.8 Profile & Settings (`/src/app/hiring/profile/page.tsx`, `/hiring/settings/page.tsx`)

**Upgrades to make:**
- Profile: clean card with avatar (editable), name, email, member since, jobs posted count, average rating given.
- Settings: sectioned cards (Account, Notifications, Payment, Privacy). Each section is a collapsible or linked card.
- Form fields within settings: use consistent Input component with save buttons per section (not one giant save).
- Payment settings: show saved payment method as a card-style preview (last 4 digits, card brand icon). "Add/Change" button.

---

## PHASE 4: WORKER DASHBOARD (App — `/work/*`)

Workers need a fast, scannable experience. They're often on mobile, looking for jobs quickly.

### 4.1 Worker Dashboard Home (`/src/app/work/page.tsx`)

**Upgrades to make:**
- Greeting + stat cards: "Your Week" — Earnings, Active Bids, Jobs Completed, Rating. Use emerald accents.
- Primary CTA: "Find Jobs" button — prominent, always accessible.
- Quick sections: "Recommended Jobs" (2-3 cards based on category/location), "Your Active Bids" (status updates), "Recent Earnings" (mini chart or list).
- Empty states: encouraging and actionable. "Complete your profile to get matched with more jobs."
- If profile is incomplete: show a completion prompt with progress bar ("Your profile is 60% complete — add your skills to rank higher").

### 4.2 Worker Map (`/src/app/work/map/page.tsx`)

**Upgrades to make:**
- Sidebar: job search with category filters, budget range, distance slider.
- Job cards: show category icon, title, budget, location, urgency badge. Key info at a glance.
- Selected job (expanded): full description, hirer info (avatar, name, rating), "Place Bid" CTA.
- Map pins: color-coded by category or urgency. Cluster pins when zoomed out. Selected pin pops up with a mini info card.
- Empty state: "No jobs in this area. Try expanding your search radius or checking back later."

### 4.3 Browse Jobs (`/src/app/work/jobs/page.tsx`)

**Upgrades to make:**
- Filter bar: Category, Budget Range, Distance, Sort By — horizontal filter strip, not a sidebar.
- Job cards: consistent use of JobListCard. Ensure urgency badges are visible and color-coded.
- Pagination: infinite scroll with "Loading more jobs..." indicator, or paginated with clear page controls.
- Applied/bid jobs: show a "You bid on this" indicator on cards where the worker has already placed a bid.
- Sort options: "Newest", "Closest", "Highest Budget", "Ending Soon."

### 4.4 Job Detail (`/src/app/work/job/[id]/page.tsx`)

**Upgrades to make:**
- Clear hierarchy: job title (large), budget (prominent), location, timeline.
- Hirer info card: avatar, name, rating, jobs posted, member since. Builds trust.
- Job description: formatted, comfortable reading width.
- "Place Bid" section: prominent, with bid amount input, optional message, and submit button. If already bid: show bid status and option to update/withdraw.
- Similar jobs section at the bottom (optional but nice): "More jobs like this."

### 4.5 Earnings (`/src/app/work/earnings/page.tsx`)

**Upgrades to make:**
- Top section: total earnings (large number, bold), period selector (This Week / This Month / All Time).
- Mini chart: line or bar chart showing earnings over time. Use Recharts with brand colors.
- Earnings list: each completed job with date, amount, hirer name. Clean table or card list.
- Payout section: current balance, payout method preview, "Request Payout" button.
- If no earnings yet: encouraging message + link to browse jobs.

### 4.6 Worker Profile (`/src/app/work/profile/page.tsx`)

**Upgrades to make:**
- Profile header: large avatar, name, title/tagline, rating, completed jobs, member since.
- Skills/categories: pill/tag style display of service categories.
- About section: bio text with comfortable reading width.
- Reviews section: list of reviews with hirer avatar, name, rating, comment, date.
- Portfolio/photos (if supported): grid layout with lightbox on click.
- "Edit Profile" CTA: clearly accessible but not dominating.

### 4.7 Messages, Notifications, Settings

**Same upgrade patterns as hirer versions (Phase 3.6, 3.7, 3.8)** — but with emerald color accents instead of cyan.

---

## PHASE 5: SHARED COMPONENT POLISH

These components are used across the entire app. Small improvements here cascade everywhere.

### 5.1 UniversalNav (`/src/components/navigation/UniversalNav.tsx`)

**Upgrades to make:**
- Ensure the active route indicator is visible and smooth (animated underline or background pill).
- Notification badge: should use a subtle pulse animation when count increases (not constant pulsing — just on change).
- User menu dropdown: should have smooth open/close transitions (scale + opacity, not instant).
- Mobile menu: should be a full-screen overlay with large, tappable items — not a tiny dropdown.
- Brand mark in nav: ensure it's crisp at all sizes. Use next/image if not already.

### 5.2 GlassPanel / GlassCard (`/src/components/ui/GlassPanel.tsx`)

**Upgrades to make:**
- Ensure backdrop-blur is applied consistently (some browsers need -webkit prefix).
- Border should be a very subtle white/brand opacity (border-white/10 or border-brand-500/10) — not invisible but not distracting.
- Hover state (if interactive): increase border opacity slightly and add a subtle inner glow.

### 5.3 Button Components (`/src/components/ui/Button.tsx`)

**Upgrades to make:**
- All buttons: ensure they have a :active state (slight scale-95 transform) for tactile feedback.
- Loading state: spinner inside the button replacing text, with the button maintaining its width (no layout shift).
- Disabled state: reduced opacity (0.5) + cursor-not-allowed + no hover effect.
- GlowButton: the glow animation should be subtle and slow (4-6s cycle), not rapid or distracting.

### 5.4 Card Components (`/src/components/cards/`)

**Upgrades to make:**
- All cards: ensure consistent border-radius (rounded-xl or rounded-2xl) across the app.
- Hover states: use `transition-all duration-200` for smooth property changes. Avoid jarring color shifts.
- Selected states: clear but not overwhelming — a left border accent or subtle background tint, not a full color change.
- Card metadata (location, time, etc.): use a lighter text color (slate-400 or slate-500) and smaller font size to create hierarchy against the primary content.

### 5.5 Form Components (`/src/components/ui/Input.tsx`)

**Upgrades to make:**
- All inputs: consistent focus ring (ring-2 ring-brand-500/50, not the browser default).
- Labels: positioned above inputs (not inside), with consistent sizing (text-sm, font-medium, text-slate-300).
- Error states: red border + error message below (text-sm, text-red-400). Smooth transition when error appears.
- Helper text: below the input, lighter color (text-slate-500, text-xs).

### 5.6 Modal & Drawer (`/src/components/ui/Modal.tsx`)

**Upgrades to make:**
- Backdrop: dark overlay with blur (bg-black/50 backdrop-blur-sm). Should fade in, not snap.
- Modal content: should scale in from 95% to 100% with opacity 0→1. Use Framer Motion.
- Close button: always top-right, always visible, subtle but clickable (24px hit target minimum).
- Mobile modals: consider converting to bottom sheet pattern (BottomSheet component) for better thumb reach.

### 5.7 Empty States (`/src/components/ui/Card.tsx` — EmptyState)

**Upgrades to make:**
- Every empty state should have: an icon or small illustration, a headline, a description, and a CTA button.
- The tone should be helpful and warm, not clinical. "No messages yet" → "Conversations will appear here once you start connecting with workers."
- Use a lighter, muted color palette for empty states (slate-500 for text, slate-400 for icons).

### 5.8 Loading States

**Upgrades to make:**
- Skeleton screens: use for any content that takes >300ms to load. Pulse animation on skeletons.
- Spinners: use consistently (Spinner component). Brand color, not default.
- Button loading: spinner inside button, text hidden but width maintained.
- Page transitions: subtle fade between route changes. No blank white flash.

---

## PHASE 6: MICRO-INTERACTIONS & ANIMATION REFINEMENTS

### 6.1 Scroll Animations (Marketing Pages)

- Use intersection observer-based reveal animations.
- Stagger children: each child element should have an incrementing delay (+75ms per item).
- Don't animate everything — hero and first section should be visible immediately. Sections below the fold animate on scroll.
- Reveal direction: prefer fade-up (translate-y from 20px→0) over fade-in alone. It feels more intentional.

### 6.2 Page Transitions (App Pages)

- Use a consistent fade transition between route changes (200-300ms).
- Don't use heavy slide animations between app pages — it slows down the perceived speed.
- Dashboard sections should have subtle staggered fade-in on initial load.

### 6.3 Interactive Feedback

- Buttons: scale(0.97) on :active. Immediate, no delay.
- Cards: translateY(-2px) + shadow increase on hover. 200ms transition.
- Toggle switches: spring animation on toggle (if using Framer Motion).
- Form submission: button enters loading state → success state (checkmark) → navigates. Not instant redirect.
- Notifications: toast slides in from top-right with subtle spring. Auto-dismiss after 4s with a fade.

### 6.4 Number & Count Animations

- When stat numbers update (earnings, bid counts, etc.), use a counting animation (Framer Motion's animate or a count-up library). Numbers should tick up, not jump.
- Badge counts (notifications, messages): brief scale animation when count changes.

---

## PHASE 7: TYPOGRAPHY & COPY POLISH

### 7.1 Typography Hierarchy

Apply consistently across ALL pages:
- **Page title (h1):** text-3xl md:text-4xl lg:text-5xl, font-bold, text-white
- **Section title (h2):** text-2xl md:text-3xl, font-semibold, text-white
- **Card title (h3):** text-lg md:text-xl, font-semibold, text-white
- **Body text:** text-base, font-normal, text-slate-300
- **Supporting/meta text:** text-sm, font-normal, text-slate-400 or text-slate-500
- **Labels:** text-sm, font-medium, text-slate-300
- **Captions:** text-xs, font-normal, text-slate-500

### 7.2 Copy Guidelines (For All Text Changes)

- Headlines: varied rhythm. Not every section headline should be the same length or structure. Mix short punchy ones ("Built for trust.") with descriptive ones ("Every job, verified. Every payment, protected.").
- Button text: action verbs. "Post a Job", "Place Bid", "Start Earning" — not "Submit", "Continue", "Next."
- Error messages: human, not robotic. "That email doesn't look right — double check it?" instead of "Invalid email format."
- Empty states: warm, encouraging, helpful. Always include a path forward (CTA).
- Placeholders in inputs: helpful hints, not field labels. "e.g. Cleaning my 2-bedroom apartment" not "Enter job description."

---

## PHASE 8: RESPONSIVE & MOBILE REFINEMENTS

### 8.1 Mobile-First Checks (All Pages)

- [ ] Touch targets: all interactive elements minimum 44px height.
- [ ] Horizontal scroll: zero horizontal overflow on any page.
- [ ] Font sizes: minimum 14px (text-sm) for body text on mobile. Never smaller.
- [ ] Spacing: reduce desktop padding on mobile but maintain visual breathing room.
- [ ] Navigation: mobile menu is full-screen overlay with large items, not a tiny dropdown.
- [ ] Forms: single-column on mobile, comfortable input sizes.
- [ ] Map pages: sidebar collapses to bottom sheet on mobile, map fills screen.
- [ ] Cards: full-width on mobile, no side padding loss.

### 8.2 Tablet Checks

- [ ] Two-column layouts should collapse gracefully at md breakpoint.
- [ ] Sidebar + content layouts should stack or use a collapsible sidebar.
- [ ] Map sidebar should be resizable or toggleable on tablet.

---

## EXECUTION ORDER (Recommended)

1. **Shared components first** (Phase 5) — these cascade across the entire app.
2. **Marketing pages** (Phase 1) — first impression matters most.
3. **Auth pages** (Phase 2) — conversion-critical flow.
4. **Hirer dashboard** (Phase 3) — primary revenue user.
5. **Worker dashboard** (Phase 4) — primary supply-side user.
6. **Micro-interactions** (Phase 6) — polish layer.
7. **Typography & copy** (Phase 7) — final refinement.
8. **Mobile audit** (Phase 8) — catch anything missed.

---

## VERIFICATION CHECKLIST (Run After Each Phase)

- [ ] No `any` types introduced
- [ ] No hardcoded colors outside the design token system
- [ ] No new dependencies added without justification
- [ ] All animations use existing Tailwind keyframes or Framer Motion (no raw CSS animations)
- [ ] All text is in the component (no separate copy files introduced)
- [ ] Mobile responsive: tested at 375px, 768px, 1024px, 1440px
- [ ] Dark theme consistency: no white text on white backgrounds, no invisible elements
- [ ] Accessibility: color contrast ≥ 4.5:1 maintained, focus states visible, ARIA labels present
- [ ] No console.log statements left in
- [ ] No commented-out code left in
- [ ] Performance: no layout shifts, no unnecessary re-renders from animation changes

---

## FILES TO TOUCH (Quick Reference)

### Marketing
- `/src/app/(marketing)/page.tsx`
- `/src/app/(marketing)/how-it-works/page.tsx`
- `/src/app/(marketing)/safety/page.tsx`
- `/src/app/(marketing)/pricing/page.tsx`
- `/src/app/(marketing)/about/page.tsx`
- `/src/app/(marketing)/help/page.tsx`
- `/src/app/(marketing)/careers/page.tsx`
- `/src/app/(marketing)/contact/page.tsx`
- `/src/app/(marketing)/blog/page.tsx`
- `/src/app/(marketing)/cities/page.tsx`
- `/src/app/(marketing)/categories/page.tsx`
- `/src/components/layout/MarketingFooter.tsx`

### Auth
- `/src/app/(auth)/sign-in/page.tsx`
- `/src/app/(auth)/create-account/page.tsx`
- `/src/app/(auth)/select-role/page.tsx`
- `/src/app/(auth)/forgot-password/page.tsx`
- `/src/app/(auth)/reset-password/page.tsx`

### Hirer Dashboard
- `/src/app/hiring/page.tsx`
- `/src/app/hiring/map/page.tsx`
- `/src/app/hiring/jobs/page.tsx`
- `/src/app/hiring/new/page.tsx` or `/src/app/hiring/post/page.tsx`
- `/src/app/hiring/job/[id]/page.tsx`
- `/src/app/hiring/messages/page.tsx`
- `/src/app/hiring/notifications/page.tsx`
- `/src/app/hiring/profile/page.tsx`
- `/src/app/hiring/settings/page.tsx`

### Worker Dashboard
- `/src/app/work/page.tsx`
- `/src/app/work/map/page.tsx`
- `/src/app/work/jobs/page.tsx`
- `/src/app/work/job/[id]/page.tsx`
- `/src/app/work/messages/page.tsx`
- `/src/app/work/notifications/page.tsx`
- `/src/app/work/profile/page.tsx`
- `/src/app/work/earnings/page.tsx`
- `/src/app/work/settings/page.tsx`

### Shared Components
- `/src/components/navigation/UniversalNav.tsx`
- `/src/components/ui/Button.tsx`
- `/src/components/ui/Input.tsx`
- `/src/components/ui/Card.tsx`
- `/src/components/ui/Modal.tsx`
- `/src/components/ui/GlassPanel.tsx`
- `/src/components/cards/JobListCard.tsx`
- `/src/components/cards/JobPostListCard.tsx`
- `/src/components/cards/WorkerListCard.tsx`
- `/src/components/sidebar/MapSidebarShell.tsx`

---

*This file was built from a full codebase audit of the CrewLink repository. It references actual file paths, component names, and design tokens. Every recommendation preserves the existing design system while elevating the execution.*
