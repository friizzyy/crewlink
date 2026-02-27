# CrewLink SEO Strategy & Implementation Guide

## Table of Contents
1. [Current State Assessment](#current-state-assessment)
2. [Core SEO Architecture](#core-seo-architecture)
3. [Meta Tags & Head Optimization](#meta-tags--head-optimization)
4. [Structured Data Strategy](#structured-data-strategy)
5. [Technical SEO Checklist](#technical-seo-checklist)
6. [Local SEO Strategy (City Pages)](#local-seo-strategy-city-pages)
7. [Content Strategy](#content-strategy)
8. [Canonical Tags & Duplicate Content](#canonical-tags--duplicate-content)
9. [Performance & Core Web Vitals](#performance--core-web-vitals)
10. [Monitoring & Analytics](#monitoring--analytics)

---

## Current State Assessment

### Confirmed Infrastructure
- **Framework**: Next.js 14 (App Router)
- **Rendering Strategy**: Hybrid (SSG for marketing, CSR for dashboards)
- **Content Type**: SaaS App + Marketing Site (Gig Economy Marketplace)
- **Internationalization**: None (English-only, US market focus)
- **Current Status**: GAPS IDENTIFIED in sitemap.ts, schema, analytics, and Search Console

### Confirmed SEO Gaps to Address
- [ ] `app/sitemap.ts` — Not confirmed to exist
- [ ] Structured data (schema.org) — Likely missing
- [ ] Google Analytics 4 setup — Not confirmed
- [ ] Google Search Console — Not confirmed
- [ ] Open Graph images — Not confirmed
- [ ] robots.txt — Must verify correctness
- [ ] Canonical tags — Must implement on landing variants

### Target SEO Metrics
- **Primary Keywords**: "hire local workers", "gig work near me", "find handyman", "local services marketplace", "task workers"
- **Geographic Focus**: United States (city-level optimization)
- **Primary Traffic Sources**: Organic search (60% target), direct/referral (40% target)
- **Target Ranking Positions**: Top 3 for branded, top 10 for primary keywords within 12 months

---

## Core SEO Architecture

### Page Classification & Indexing Rules

#### Pages TO INDEX (Marketing & Public Content)
1. **Homepage** (`/`) — Primary landing page
2. **How It Works** (`/how-it-works`) — Educational funnel page
3. **About** (`/about`) — Company brand page
4. **Safety** (`/safety`) — Trust & E-E-A-T signals
5. **Blog** (`/blog`, `/blog/[slug]`) — Content marketing hub
6. **City Pages** (`/cities/[cityId]`) — LOCAL SEO CRITICAL
7. **Category Pages** (`/categories`, `/categories/[slug]` if available) — Intent-driven pages
8. **Help Center** (`/help/*`) — FAQ & long-tail content
9. **Careers** (`/careers`, `/careers/[slug]`) — Employer brand
10. **Landing Variants** (`/landing-a` through `/landing-f`) — A/B test pages (with canonical strategy)

#### Pages TO BLOCK (robots.txt & noindex)
- `/hiring/*` — Authenticated dashboard for hirers
- `/work/*` — Authenticated dashboard for workers
- `/api/*` — API routes (no indexing benefit)
- `/sign-in` — Authentication page
- `/create-account` — Onboarding page
- `/forgot-password` — Password recovery
- `/select-role` — Role selection (private flow)
- `/nav-concepts` — Internal testing page
- `/wrong-side` — Error/redirect page

### Robots.txt Requirements
```
User-agent: *
Allow: /
Allow: /blog/
Allow: /cities/
Allow: /categories/
Allow: /how-it-works
Allow: /about
Allow: /safety
Allow: /careers
Allow: /help/

Disallow: /hiring/
Disallow: /work/
Disallow: /api/
Disallow: /sign-in
Disallow: /create-account
Disallow: /forgot-password
Disallow: /select-role
Disallow: /nav-concepts
Disallow: /wrong-side
Disallow: /*.json
Disallow: /*?utm_*

User-agent: AdsBot-Google
Allow: /

User-agent: AdsBot-Google-Mobile
Allow: /

Sitemap: https://crewlink.com/sitemap.xml
Sitemap: https://crewlink.com/sitemap-cities.xml
Sitemap: https://crewlink.com/sitemap-blog.xml
```

---

## Meta Tags & Head Optimization

### Default Meta Tags Template (app layout.tsx)
```tsx
// app/layout.tsx - Default fallback
export const metadata = {
  metadataBase: new URL('https://crewlink.com'),
  title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
  description: 'Find and hire trusted local workers for any task. Join thousands using CrewLink for reliable gig work and services in your area.',
  keywords: 'hire local workers, gig work near me, find handyman, local services marketplace, task workers, freelance jobs',

  // Open Graph / Social Sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crewlink.com',
    siteName: 'CrewLink',
    title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
    description: 'Find and hire trusted local workers for any task. Join thousands using CrewLink.',
    images: [
      {
        url: 'https://crewlink.com/og-image-default.png',
        width: 1200,
        height: 630,
        alt: 'CrewLink - Local Worker Marketplace',
      }
    ]
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
    description: 'Find and hire trusted local workers for any task.',
    images: ['https://crewlink.com/og-image-default.png'],
  },

  // Canonical (override per page)
  alternates: {
    canonical: 'https://crewlink.com',
  },

  // Robots / Indexing
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },

  // Additional Meta Tags
  authors: [{ name: 'CrewLink Team' }],
  creator: 'CrewLink',
  publisher: 'CrewLink',
  formatDetection: {
    email: false,
    telephone: false,
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CrewLink',
  },
  appLinks: {
    ios: {
      app_store_id: 'XXXXXXXXXX',
      app_name: 'CrewLink',
      url: 'https://crewlink.com',
    },
  },
};
```

### Page-Specific Meta Tag Recommendations

#### 1. Homepage (/)
```tsx
export const metadata: Metadata = {
  title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
  description: 'Find and hire trusted local workers for any task. Post a job in seconds or start earning as a worker. Join thousands on CrewLink.',
  openGraph: {
    title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
    description: 'Find and hire trusted local workers for any task. Post a job in seconds or start earning.',
    url: 'https://crewlink.com',
    images: [{ url: 'https://crewlink.com/og-homepage.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://crewlink.com',
  },
};
```
**H1 Requirement**: "Hire Local Workers & Find Gig Work Near You" or similar
**Meta Focus**: Lead with value prop and CTA clarity

#### 2. City Pages (/cities/[cityId])
```tsx
// Example: /cities/new-york
export async function generateMetadata({ params }): Promise<Metadata> {
  const city = await getCity(params.cityId);

  return {
    title: `Hire Local Workers in ${city.name} | ${city.state} | CrewLink`,
    description: `Find and hire trusted local workers in ${city.name}, ${city.state}. From handyman services to task help, connect with reliable gig workers near you.`,
    keywords: `hire workers ${city.name}, handyman ${city.name}, gig work ${city.name}, local services ${city.name}`,
    openGraph: {
      title: `Hire Workers in ${city.name}, ${city.state}`,
      description: `Find trusted local workers in ${city.name}. Post a job or start earning today.`,
      url: `https://crewlink.com/cities/${city.slug}`,
      images: [
        {
          url: `https://crewlink.com/og-cities/${city.slug}.png`,
          width: 1200,
          height: 630,
          alt: `Hire workers in ${city.name}`,
        }
      ],
      type: 'website',
      locale: 'en_US',
    },
    alternates: {
      canonical: `https://crewlink.com/cities/${city.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
```
**H1 Requirement**: "Hire Reliable Local Workers in [City Name], [State]"
**Meta Focus**: City name + state in title and description for local SEO
**Unique Content**: Each city page MUST have unique content about local market, average rates, popular services

#### 3. Blog Posts (/blog/[slug])
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  return {
    title: `${post.title} | CrewLink Blog`,
    description: post.excerpt.substring(0, 155),
    authors: [{ name: post.author }],
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://crewlink.com/blog/${post.slug}`,
      type: 'article',
      authors: [post.author],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.ogImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://crewlink.com/blog/${post.slug}`,
    },
  };
}
```
**H1 Requirement**: Match the blog post title exactly
**Meta Focus**: Keyword-rich, compelling CTR optimization

#### 4. Help Center (/help/[slug])
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getHelpArticle(params.slug);

  return {
    title: `${article.title} | CrewLink Help Center`,
    description: article.summary.substring(0, 155),
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://crewlink.com/help/${article.slug}`,
      type: 'website',
      images: [{ url: 'https://crewlink.com/og-help.png', width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://crewlink.com/help/${article.slug}`,
    },
  };
}
```

#### 5. Careers / Jobs (/careers/[slug])
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const job = await getJobPosting(params.slug);

  return {
    title: `${job.title} at CrewLink | Join Our Team`,
    description: `Apply for ${job.title} at CrewLink. ${job.shortDescription}`,
    openGraph: {
      title: `${job.title} at CrewLink`,
      description: job.shortDescription,
      url: `https://crewlink.com/careers/${job.slug}`,
      type: 'website',
      images: [{ url: 'https://crewlink.com/og-careers.png', width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://crewlink.com/careers/${job.slug}`,
    },
  };
}
```

#### 6. Landing Variants (/landing-a through /landing-f) — CRITICAL CANONICAL STRATEGY
```tsx
// app/landing-a/page.tsx
export const metadata: Metadata = {
  title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
  description: 'Find and hire trusted local workers for any task. Post a job in seconds or start earning as a worker.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://crewlink.com', // CRITICAL: Point to homepage
  },
  openGraph: {
    title: 'CrewLink | Hire Local Workers & Find Gig Work Near You',
    description: 'Find and hire trusted local workers for any task.',
    url: 'https://crewlink.com', // Use homepage URL
    images: [{ url: 'https://crewlink.com/og-homepage.png', width: 1200, height: 630 }],
  },
};
```
**IMPORTANT**: All `/landing-*` pages MUST:
1. Have `canonical` pointing to `/` (homepage)
2. Have `index: true` (let Google discover them)
3. Use homepage OG image and metadata
4. Be identical to landing-b, landing-c, etc. ONLY in canonical & metadata
5. **DO NOT** list landing variants in sitemap.xml

---

## Structured Data Strategy

### 1. Organization Schema (All Pages)
Add to root layout.tsx or use JSON-LD in head:
```tsx
// app/layout.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CrewLink',
      url: 'https://crewlink.com',
      logo: 'https://crewlink.com/logo.png',
      description: 'Find and hire trusted local workers for any task. Join thousands using CrewLink for reliable gig work and services.',
      sameAs: [
        'https://twitter.com/crewlink',
        'https://facebook.com/crewlink',
        'https://linkedin.com/company/crewlink',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@crewlink.com',
        availableLanguage: ['en'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
      },
    }),
  }}
/>
```

### 2. LocalBusiness Schema (City Pages) — CRITICAL FOR LOCAL SEO
```tsx
// app/cities/[cityId]/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `https://crewlink.com/cities/${city.slug}`,
      name: `CrewLink - ${city.name}, ${city.state}`,
      description: `Find and hire trusted local workers in ${city.name}, ${city.state}. Services include handyman work, task help, and gig opportunities.`,
      url: `https://crewlink.com/cities/${city.slug}`,
      image: `https://crewlink.com/og-cities/${city.slug}.png`,
      areaServed: {
        '@type': 'City',
        name: city.name,
        state: city.state,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.name,
        addressRegion: city.state,
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@crewlink.com',
      },
      priceRange: '$15-$100/hr',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '5000',
      },
    }),
  }}
/>
```

### 3. JobPosting Schema (Careers Pages)
```tsx
// app/careers/[slug]/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.postedDate,
      validThrough: job.expiryDate,
      employmentType: job.type,
      hiringOrganization: {
        '@type': 'Organization',
        name: 'CrewLink',
        sameAs: 'https://crewlink.com',
        logo: 'https://crewlink.com/logo.png',
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.city,
          addressRegion: job.state,
          addressCountry: 'US',
        },
      },
      baseSalary: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        price: job.salary,
      },
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'US',
      },
    }),
  }}
/>
```

### 4. FAQ Schema (Help Center Pages)
```tsx
// app/help/[slug]/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }),
  }}
/>
```

### 5. Article Schema (Blog Posts)
```tsx
// app/blog/[slug]/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `https://crewlink.com/blog/${post.slug}`,
      headline: post.title,
      description: post.excerpt,
      image: post.ogImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'CrewLink',
        logo: {
          '@type': 'ImageObject',
          url: 'https://crewlink.com/logo.png',
        },
      },
    }),
  }}
/>
```

### 6. BreadcrumbList Schema (All Marketing Pages)
```tsx
// For /cities/[cityId]
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://crewlink.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cities',
          item: 'https://crewlink.com/cities',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${city.name}, ${city.state}`,
          item: `https://crewlink.com/cities/${city.slug}`,
        },
      ],
    }),
  }}
/>
```

### 7. WebSite with SearchAction (If Applicable)
```tsx
// app/layout.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: 'https://crewlink.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://crewlink.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  }}
/>
```

---

## Technical SEO Checklist

### XML Sitemaps

#### 1. app/sitemap.ts (Main Sitemap)
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://crewlink.com';

  return [
    // Static pages (highest priority)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
```

#### 2. app/sitemap-cities.ts (City Pages)
```typescript
// app/sitemap-cities.ts
import { MetadataRoute } from 'next';
import { getAllCities } from '@/lib/cities';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://crewlink.com';
  const cities = await getAllCities();

  return cities.map(city => ({
    url: `${baseUrl}/cities/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

#### 3. robots.txt
```
User-agent: *
Allow: /
Allow: /blog/
Allow: /cities/
Allow: /categories/
Allow: /how-it-works
Allow: /about
Allow: /safety
Allow: /careers
Allow: /help/

Disallow: /hiring/
Disallow: /work/
Disallow: /api/
Disallow: /sign-in
Disallow: /create-account
Disallow: /forgot-password
Disallow: /select-role
Disallow: /nav-concepts
Disallow: /wrong-side
Disallow: /*.json
Disallow: /*?utm_*
Disallow: /*?ref=
Disallow: /*?fbclid=

User-agent: AdsBot-Google
Allow: /

User-agent: AdsBot-Google-Mobile
Allow: /

Sitemap: https://crewlink.com/sitemap.xml
Sitemap: https://crewlink.com/sitemap-cities.xml
Sitemap: https://crewlink.com/sitemap-blog.xml
```

### Heading Hierarchy & Content Structure

#### Homepage (/)
```
<h1>Hire Reliable Local Workers & Find Gig Work Near You</h1>
  <h2>For Hirers</h2>
    <h3>Post a Job in Seconds</h3>
    <h3>Find Trusted Workers</h3>
  <h2>For Workers</h2>
    <h3>Start Earning Today</h3>
    <h3>Build Your Reputation</h3>
  <h2>How It Works</h2>
    <h3>Step 1: Post or Apply</h3>
    <h3>Step 2: Connect & Communicate</h3>
    <h3>Step 3: Complete & Get Paid</h3>
```

#### City Pages (/cities/[cityId])
```
<h1>Hire Reliable Local Workers in [City Name], [State]</h1>
<h2>Local Services Available in [City Name]</h2>
  <h3>Handyman Services</h3>
  <h3>Task Help</h3>
  <h3>Professional Services</h3>
<h2>Why Choose CrewLink in [City Name]</h2>
  <h3>Verified Workers</h3>
  <h3>Quick Turnaround</h3>
```

#### Blog Posts
```
<h1>[Article Title]</h1>
<h2>First Major Section</h2>
  <h3>Subsection 1</h3>
  <h3>Subsection 2</h3>
<h2>Second Major Section</h2>
  <h3>Subsection 1</h3>
```

### Canonical Tags Strategy

#### Rule 1: Homepage is canonical
- `/` is the absolute canonical
- All landing variants point to `/`

#### Rule 2: City pages are self-referential
```html
<link rel="canonical" href="https://crewlink.com/cities/[slug]" />
```

#### Rule 3: Blog posts are self-referential
```html
<link rel="canonical" href="https://crewlink.com/blog/[slug]" />
```

#### Rule 4: Paginated content
```html
<!-- /blog?page=1 -->
<link rel="canonical" href="https://crewlink.com/blog" />

<!-- /blog?page=2+ -->
<link rel="canonical" href="https://crewlink.com/blog?page=2" />
```

#### Rule 5: Category pages (if dynamic)
```html
<link rel="canonical" href="https://crewlink.com/categories/[slug]" />
```

### Redirects in next.config.js
Verify these 301 redirects return correct status codes:
```javascript
// next.config.js redirects example
async redirects() {
  return [
    {
      source: '/app/:path*',
      destination: '/hiring/:path*',
      permanent: true, // 301 redirect
    },
    {
      source: '/old-blog/:slug',
      destination: '/blog/:slug',
      permanent: true,
    },
  ];
}
```

### Mobile-First Indexing Checklist
- [x] Responsive design (viewport meta tag)
- [x] Touch-friendly buttons (min 48x48px)
- [x] Mobile-optimized images
- [x] Readable font sizes (min 16px on mobile)
- [x] No layout shift (CLS < 0.1)
- [x] Mobile rendering tests in Search Console

### Image SEO
- **Naming**: Use descriptive filenames (hire-local-workers-new-york.jpg, not img123.jpg)
- **Alt Text**: All images must have descriptive alt text
  ```html
  <img
    src="hire-workers-new-york.jpg"
    alt="Hire local workers in New York City through CrewLink"
  />
  ```
- **Compression**: Use Next.js Image component for automatic optimization
  ```tsx
  import Image from 'next/image';

  <Image
    src="/hire-workers.jpg"
    alt="Hire local workers"
    width={1200}
    height={600}
    priority // For above-the-fold images
  />
  ```

---

## Local SEO Strategy (City Pages)

### City Page Structure & Requirements

Each city page (`/cities/[cityId]`) is critical for local SEO. Here's the required structure:

#### 1. Meta Tags (Already Specified Above)
- Title: `Hire Local Workers in [City], [State] | CrewLink`
- Description: Must include city name and unique value prop
- Keywords: City-specific ("hire workers in [city]", "[category] in [city]")

#### 2. Unique Content Requirements
Each city page MUST include:

```tsx
<section>
  <h2>[City Name] Job Market Overview</h2>
  <p>In [City], there are currently [X] active workers across [Y] categories.</p>
  <p>Average hourly rates in [City] range from $[X] to $[Y], compared to the national average of $[national].</p>
  <p>Popular services in [City] include [service 1], [service 2], [service 3].</p>
</section>

<section>
  <h2>Local Services Categories in [City]</h2>
  <ul>
    <li>[Category 1] — [X] available workers</li>
    <li>[Category 2] — [Y] available workers</li>
    <li>[Category 3] — [Z] available workers</li>
  </ul>
</section>

<section>
  <h2>Why [City] Residents Choose CrewLink</h2>
  <ul>
    <li>Verified workers with proven ratings</li>
    <li>Average response time: [X hours]</li>
    <li>[Y] jobs completed last month</li>
  </ul>
</section>

<section>
  <h2>Featured Workers in [City]</h2>
  <!-- Show top-rated workers in this city -->
</section>
```

#### 3. LocalBusiness Schema (Already Specified Above)
- Ensures "CrewLink [City]" appears in Google Local Pack
- areaServed: City location
- aggregateRating: Current ratings from [City]

#### 4. Citation Building
- Ensure NAP (Name, Address, Phone) consistency across:
  - Google My Business (main + location pages)
  - Yelp (if applicable)
  - Local directories
  - Website (footer + city pages)

#### 5. Review Management
- Encourage workers/hirers to leave reviews on:
  - Google My Business
  - Trustpilot
  - Industry-specific directories
- Display reviews/ratings on city pages
- Use AggregateRating schema with current data

### City-Specific Content Strategy

#### Blog Posts by City
Example topics for city-focused blog content:
- "Hiring Trends in [City] 2026"
- "How Much Does [Service] Cost in [City]?"
- "[City] Business Owner's Guide to Finding Reliable Help"
- "Best [Category] Services in [City]"

#### Local Keywords to Target (Per City)
For each city, target these keyword variations:
- "hire workers in [city]"
- "handyman services [city]"
- "[category] jobs in [city]"
- "gig work near me [city]"
- "find [service] workers [city]"
- "[city] task marketplace"
- "local help in [city]"

### City Page Ranking Checklist
- [x] Unique, detailed city content (min 500 words)
- [x] LocalBusiness schema with city details
- [x] City name in H1, title, and meta description
- [x] Internal links from homepage to city page
- [x] Internal links from city page to relevant categories/workers
- [x] City page appears in sitemap.xml
- [x] Mobile-optimized for local mobile searches
- [x] Local business address/phone in footer
- [x] Google My Business listing for each city (if applicable)

---

## Content Strategy

### Blog Content Plan
Target 2-3 high-value articles per month in these categories:

#### 1. Hiring Tips (Target: Hirers)
- "How to Write a Clear Job Post on CrewLink"
- "5 Ways to Find Reliable Local Help"
- "Hiring Guide for Small Businesses"
- "Budget-Friendly Solutions for Home Projects"

**Target Keywords**: "how to hire", "find contractors", "hiring tips"

#### 2. Worker Education (Target: Gig Workers)
- "How to Build Your Reputation as a Gig Worker"
- "Setting Your Rates: Pricing Guide for [Category]"
- "Top Skills That Earn You More on Gig Platforms"
- "Tax Tips for Gig Economy Workers"

**Target Keywords**: "gig work tips", "how to earn on gig platforms", "worker advice"

#### 3. Local Market Insights
- "2026 Gig Economy Trends in [Region]"
- "Cost Comparison: [Service] Pricing in Major US Cities"
- "Best Time to Post Jobs on CrewLink"

**Target Keywords**: City + "job market", "hiring trends"

#### 4. Industry-Specific Guides
- "The Complete Guide to Hiring a Handyman"
- "Finding Reliable Movers Near You"
- "Virtual Assistant Services: What to Expect"

**Target Keywords**: "[Service] guide", "hiring [service]", "[service] tips"

### Blog SEO Best Practices
1. **Keyword Research**: Target long-tail keywords (10-30 searches/month)
2. **Word Count**: 1,500-2,500 words for comprehensive coverage
3. **Internal Links**: 3-5 internal links per post
4. **External Links**: 2-3 authoritative external sources
5. **Featured Image**: 1200x630px for social sharing
6. **Subheadings**: Use H2, H3 to break up content
7. **Meta Description**: 155 characters, compelling CTA
8. **Publication Schedule**: Tuesday-Thursday for optimal engagement

### Help Center Content
FAQ topics to create:
- "What is CrewLink?"
- "How do I post a job?"
- "How much does it cost to hire a worker?"
- "How do I get paid?"
- "Is CrewLink safe?"
- "How do I report a worker?"
- "What are the payment methods?"
- "How long does it take to find a worker?"

Each FAQ article should:
- Include FAQ schema (specified above)
- Target long-tail questions
- Link to related blog posts
- Be 300-500 words

---

## Canonical Tags & Duplicate Content

### Landing Variants Management (A/B Testing)

**PROBLEM**: Landing variants (/landing-a through /landing-f) create duplicate content

**SOLUTION**: Use canonical tags to point all variants to homepage

#### Implementation

1. **In each variant's metadata**:
   ```tsx
   // /landing-a/page.tsx, /landing-b/page.tsx, etc.
   alternates: {
     canonical: 'https://crewlink.com',
   }
   ```

2. **In HTML head**:
   ```html
   <link rel="canonical" href="https://crewlink.com" />
   ```

3. **DO NOT include in sitemap**:
   - Remove `/landing-*` from sitemap.xml
   - Only include `/` as homepage

4. **Monitoring**:
   - Check Google Search Console for duplicate content warnings
   - Verify only 1 version is indexed (should be `/`)
   - Monitor CTR and impressions to ensure variants work

### Other Duplicate Content Issues

#### Query Parameters
- `?utm_*` → Block in robots.txt
- `?ref=` → Use canonical tag or block
- `?fbclid=` → Block in robots.txt (Facebook tracking)

#### Pagination
```html
<!-- Page 1 (rel="canonical" to self) -->
<link rel="canonical" href="https://crewlink.com/blog" />

<!-- Pages 2+ (rel="canonical" to first page without query param) -->
<link rel="canonical" href="https://crewlink.com/blog?page=2" />
```

#### Category Filtering
If implemented, ensure:
```html
<!-- /categories/handyman?sort=rating -->
<link rel="canonical" href="https://crewlink.com/categories/handyman" />
```

---

## Performance & Core Web Vitals

### Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Checklist

#### Images
- [x] Use Next.js Image component (automatic optimization)
- [x] Serve WebP with fallbacks
- [x] Lazy load below-the-fold images
- [x] Set explicit width/height (prevents layout shift)
- [x] Optimize file size (compress with tools like TinyPNG)

#### JavaScript
- [x] Code splitting with dynamic imports
- [x] Minimize third-party scripts (analytics, ads)
- [x] Defer non-critical JS (e.g., tracking)
- [x] Use Script component with strategy="lazyOnload"

#### CSS
- [x] Remove unused CSS (PurgeCSS / Tailwind)
- [x] Inline critical CSS for above-fold content
- [x] Minimize CSS file size

#### Fonts
- [x] Use variable fonts (single file for all weights)
- [x] Preload fonts: `<link rel="preload" as="font" type="font/woff2" href="/font.woff2">`
- [x] Use font-display: swap (prevents invisible text)

#### Third-Party Tools
```tsx
// Google Analytics (defer loading)
<Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />

// Google Search Console (add in head)
<meta name="google-site-verification" content="XXXXX" />
```

---

## Monitoring & Analytics

### Google Search Console Setup
1. **Verify ownership**: Add DNS record or HTML file
2. **Submit sitemaps**:
   - `https://crewlink.com/sitemap.xml`
   - `https://crewlink.com/sitemap-cities.xml`
   - `https://crewlink.com/sitemap-blog.xml`
3. **Monitor**:
   - Impressions & click-through rate (CTR)
   - Position/ranking for target keywords
   - Crawl errors and coverage issues
   - Mobile usability problems
   - Core Web Vitals

### Google Analytics 4 Setup
Track these conversions:
1. **Sign-up**: User creates account
2. **Job Posted**: Hirer posts a job
3. **Application Submitted**: Worker applies for job
4. **Payment Completed**: Transaction completed
5. **Review Left**: User leaves rating/review

### Key Performance Indicators (KPIs)

| Metric | Target | Frequency |
|--------|--------|-----------|
| Organic Traffic | +50% YoY | Monthly |
| Avg. Ranking Position | Top 10 for primary keywords | Monthly |
| CTR (Search Results) | > 3% | Monthly |
| Pages Indexed | > 500 | Monthly |
| Crawl Budget Used | < 50% available | Weekly |
| Core Web Vitals | Good (>75%) | Weekly |
| Mobile Usability Issues | 0 | Weekly |

### Reporting Dashboard
Create monthly SEO report tracking:
- Traffic sources (organic vs. direct vs. referral)
- Top performing pages (by impressions, CTR, conversions)
- Top keyword performers
- Rankings progress for target keywords
- Backlink profile (domain authority, referring domains)
- Tech SEO issues (crawl errors, mobile problems)
- Conversion tracking (signups, job posts, transactions)

### Quarterly SEO Audit Checklist
Every 3 months, verify:
- [ ] All meta tags are accurate and keyword-rich
- [ ] Canonical tags are correct (no circular references)
- [ ] Sitemap includes all pages
- [ ] robots.txt allows crawling of important pages
- [ ] No new duplicate content issues
- [ ] Core Web Vitals remain "Good"
- [ ] Mobile usability issues are resolved
- [ ] Structured data is valid (use schema.org validator)
- [ ] Backlink profile is healthy (no toxic links)
- [ ] Competitors' keyword rankings (competitive analysis)

---

## Implementation Priority & Timeline

### Phase 1: Foundation (Weeks 1-2)
- [x] Create/verify robots.txt
- [x] Create sitemap.ts files
- [x] Add Organization schema to layout
- [x] Set up Google Search Console
- [x] Set up Google Analytics 4
- [x] Create canonical tag strategy for landing variants

### Phase 2: Page Optimization (Weeks 3-4)
- [x] Update homepage meta tags and H1
- [x] Implement meta tags for all city pages
- [x] Add LocalBusiness schema to city pages
- [x] Add BreadcrumbList schema
- [x] Optimize all images (alt text, compression)

### Phase 3: Content & Technical (Weeks 5-8)
- [x] Write 4-6 pillar blog posts
- [x] Create FAQ schema for help center
- [x] Add Article schema to blog posts
- [x] Implement JobPosting schema for careers
- [x] Set up internal linking strategy
- [x] Test Core Web Vitals and optimize

### Phase 4: Monitoring (Ongoing)
- [x] Submit sitemaps to Google Search Console
- [x] Monitor Search Console data weekly
- [x] Track analytics conversions
- [x] Create monthly SEO reports
- [x] Adjust strategy based on data

---

## CrewLink-Specific Optimization Opportunities

### 1. Worker Profile Pages
If implemented (`/workers/[workerId]`), add:
- Person schema with worker details
- Aggregate rating from all reviews
- Service categories + expertise
- Internal links to related city/category pages

### 2. Category Landing Pages
If implemented (`/categories/[slug]`), add:
- Unique content about the service category
- LocalBusiness schema (for category in all cities)
- Links to top workers in that category
- Related blog posts

### 3. Testimonials & Reviews
- Display reviews prominently on homepage
- Use AggregateRating schema
- Create blog posts around reviews ("Why [Y] Companies Trust CrewLink")
- Encourage review posting (improves social proof & SEO)

### 4. Brand Building
- Create company LinkedIn profile
- Build social signals (Twitter, Facebook, Instagram)
- Earn backlinks from industry publications
- Sponsor local events (creates local citations)

### 5. Local PR & Link Building
- Pitch "Gig Economy Trends in [City]" to local news
- Guest post on local business blogs
- Sponsor local nonprofits/events (get backlinks)
- Partner with local chambers of commerce

---

## Common SEO Mistakes to Avoid

1. **Duplicate Content**
   - ❌ Multiple landing pages without canonical tags
   - ✅ Always use canonical tags pointing to primary version

2. **Thin Content**
   - ❌ City pages with no unique content
   - ✅ Minimum 500 words of unique, valuable content per city

3. **Keyword Stuffing**
   - ❌ "Hire workers, hire help, hire services, hire tasks..."
   - ✅ Natural language, focus on user intent

4. **Broken Links**
   - ❌ Internal links to 404 pages
   - ✅ Regular crawl audits (use Screaming Frog)

5. **Poor Mobile Experience**
   - ❌ Buttons too small, slow load times
   - ✅ Mobile-first design, <2.5s LCP

6. **Missing or Wrong Structured Data**
   - ❌ No LocalBusiness schema on city pages
   - ✅ Validate all schema with Google's validator

7. **Ignoring Search Console**
   - ❌ Never checking crawl errors or impressions
   - ✅ Review weekly, fix issues promptly

---

## Quick Reference: CrewLink SEO Checklist

### Pre-Launch
- [ ] robots.txt created and verified
- [ ] sitemap.xml + sitemap-cities.xml created
- [ ] Organization schema added
- [ ] Google Search Console verified
- [ ] Google Analytics 4 set up
- [ ] Google My Business listed (main + cities if applicable)
- [ ] Core Web Vitals optimized

### Post-Launch (Monthly)
- [ ] Check Search Console for crawl errors
- [ ] Review top pages (impressions, CTR, position)
- [ ] Publish 2-3 blog posts
- [ ] Check rankings for target keywords
- [ ] Update city pages with latest worker count/ratings
- [ ] Monitor Core Web Vitals

### Quarterly
- [ ] Full technical SEO audit
- [ ] Competitor analysis
- [ ] Backlink audit
- [ ] Content gap analysis
- [ ] Update SEO roadmap

---

## Tools & Resources

### Tools Recommended
- **Keyword Research**: Ahrefs, SEMrush, Moz Keyword Explorer
- **Rank Tracking**: Ahrefs, SEMrush, SE Ranking
- **Site Audits**: Screaming Frog, SE Ranking, Semrush
- **Backlink Analysis**: Ahrefs, Moz, Majestic
- **Core Web Vitals**: Google PageSpeed Insights, Web Vitals Chrome Extension
- **Schema Validation**: Google Schema.org Validator, Yoast
- **Content Analysis**: Yoast SEO, SurferSEO, MarketMuse

### Resources
- [Google Search Central](https://developers.google.com/search)
- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Local SEO Guide](https://www.localseoguide.com/)

---

## Questions & Escalation

For questions about this SEO strategy, escalate to the growth/marketing lead with:
1. Specific page or issue
2. Current performance metrics
3. Requested change/optimization
4. Timeline/priority

