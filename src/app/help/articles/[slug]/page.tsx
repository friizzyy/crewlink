'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Clock, ThumbsUp, ThumbsDown, ChevronRight, Check,
  BookOpen, Sparkles, ArrowRight, MessageCircle, HelpCircle,
  FileText, CheckCircle2, AlertCircle, Lightbulb, Info
} from 'lucide-react'
import MarketingLayout from '@/components/MarketingLayout'
import { cn } from '@/lib/utils'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// Article content mapping - in a real app this would come from a CMS
const articles: Record<string, {
  title: string
  category: string
  categoryHref: string
  categoryColor: 'cyan' | 'emerald' | 'purple' | 'amber' | 'rose'
  readTime: string
  content: { type: 'p' | 'h2' | 'ul' | 'tip' | 'warning' | 'steps'; text: string | string[] }[]
  relatedArticles: { title: string; href: string }[]
}> = {
  // Aliases for popular articles on help page
  'post-first-job': {
    title: 'How to post your first job',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'Posting a job on CrewLink is quick and easy. Follow these steps to get started and find the help you need.' },
      { type: 'steps', text: ['Describe your task with a clear, descriptive title', 'Set your location where the work will be done', 'Choose date and time for the work', 'Set your budget (flat rate or hourly)', 'Review all details and post your job'] },
      { type: 'h2', text: 'Step 1: Describe your task' },
      { type: 'p', text: 'Start by giving your job a clear, descriptive title. Be specific about what you need done—this helps attract the right workers.' },
      { type: 'h2', text: 'Step 2: Set your location' },
      { type: 'p', text: 'Enter the address where the work will be done. Workers nearby will see your job first.' },
      { type: 'h2', text: 'Step 3: Choose date and time' },
      { type: 'p', text: 'Select when you need the work done. You can choose specific times or mark it as flexible.' },
      { type: 'h2', text: 'Step 4: Set your budget' },
      { type: 'p', text: 'Enter how much you\'re willing to pay. You can set a flat rate or hourly rate depending on the task.' },
      { type: 'h2', text: 'Step 5: Review and post' },
      { type: 'p', text: 'Review all the details and post your job. Workers will start applying within minutes!' },
      { type: 'tip', text: 'Add photos if relevant to help workers understand the task better and provide more accurate quotes.' },
    ],
    relatedArticles: [
      { title: 'Finding the right worker', href: '/help/articles/finding-workers' },
      { title: 'Understanding service fees', href: '/help/articles/service-fees' },
    ],
  },
  'setting-rates': {
    title: 'Setting your rates as a worker',
    category: 'Working',
    categoryHref: '/help/workers',
    categoryColor: 'emerald',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Setting the right rates is crucial for attracting clients while ensuring you\'re fairly compensated for your work.' },
      { type: 'h2', text: 'Research the market' },
      { type: 'p', text: 'Look at what other workers with similar skills charge in your area. This gives you a baseline for competitive pricing.' },
      { type: 'h2', text: 'Consider your experience' },
      { type: 'p', text: 'More experienced workers can typically charge higher rates. Factor in your years of experience and specialized skills.' },
      { type: 'h2', text: 'Account for expenses' },
      { type: 'p', text: 'Remember to factor in travel time, tools, supplies, and the platform fee when setting your rates.' },
      { type: 'h2', text: 'Start competitive, then adjust' },
      { type: 'p', text: 'If you\'re new to the platform, consider starting with slightly lower rates to build reviews, then increase as you establish your reputation.' },
      { type: 'tip', text: 'Workers with 10+ five-star reviews can typically charge 20-30% more than new workers.' },
    ],
    relatedArticles: [
      { title: 'Getting started as a worker', href: '/help/articles/getting-started-worker' },
      { title: 'Understanding service fees', href: '/help/articles/service-fees' },
    ],
  },
  'service-fees': {
    title: 'Understanding service fees',
    category: 'Payments',
    categoryHref: '/help/payments',
    categoryColor: 'purple',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'CrewLink charges service fees to maintain the platform, provide customer support, and ensure secure payments for everyone.' },
      { type: 'h2', text: 'For clients' },
      { type: 'p', text: 'Clients pay a service fee of approximately 15% on top of the worker\'s rate. This covers payment processing, customer support, and the CrewLink Guarantee.' },
      { type: 'h2', text: 'For workers' },
      { type: 'p', text: 'Workers pay a 15% platform fee on their earnings. This fee covers payment processing, background checks, insurance, and platform maintenance.' },
      { type: 'h2', text: 'What\'s included' },
      { type: 'ul', text: ['Secure payment processing', '24/7 customer support', 'CrewLink Guarantee protection', 'Background check verification', 'In-app messaging and tools'] },
    ],
    relatedArticles: [
      { title: 'How payments work', href: '/help/articles/how-payments-work' },
      { title: 'Setting your rates', href: '/help/articles/setting-rates' },
    ],
  },
  'how-payments-work': {
    title: 'How payments work',
    category: 'Payments',
    categoryHref: '/help/payments',
    categoryColor: 'purple',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Understanding how payments work on CrewLink helps ensure a smooth experience for both clients and workers.' },
      { type: 'h2', text: 'For clients' },
      { type: 'p', text: 'When you book a job, a hold is placed on your payment method. The actual charge only happens when you confirm the job is complete.' },
      { type: 'h2', text: 'For workers' },
      { type: 'p', text: 'After the client confirms job completion, your earnings (minus the platform fee) are available for withdrawal. Standard payouts arrive within 1-3 business days.' },
      { type: 'h2', text: 'Payment protection' },
      { type: 'p', text: 'All payments are held securely in escrow until the job is done. This protects both parties—clients know they only pay for completed work, and workers know payment is guaranteed.' },
      { type: 'tip', text: 'Enable instant payouts to receive your earnings within minutes for a small fee.' },
    ],
    relatedArticles: [
      { title: 'Understanding service fees', href: '/help/articles/service-fees' },
      { title: 'Dispute resolution', href: '/help/articles/dispute-resolution' },
    ],
  },
  'worker-verification': {
    title: 'Getting verified as a worker',
    category: 'Working',
    categoryHref: '/help/workers',
    categoryColor: 'emerald',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'Getting verified on CrewLink significantly increases your chances of getting hired and builds trust with potential clients.' },
      { type: 'h2', text: 'What verification includes' },
      { type: 'ul', text: ['Government ID verification', 'Facial recognition matching', 'Background check', 'Phone number verification'] },
      { type: 'h2', text: 'How to get verified' },
      { type: 'p', text: 'Go to Settings > Verification and follow the prompts. You\'ll need to upload a photo of your government ID and take a selfie for matching.' },
      { type: 'h2', text: 'Benefits of verification' },
      { type: 'ul', text: ['Verified badge on your profile', 'Higher ranking in search results', 'Increased trust from clients', 'Access to premium job opportunities'] },
      { type: 'tip', text: 'Verified workers earn 40% more on average than non-verified workers.' },
    ],
    relatedArticles: [
      { title: 'Getting started as a worker', href: '/help/articles/getting-started-worker' },
      { title: 'Building your profile', href: '/help/articles/building-profile' },
    ],
  },
  'dispute-resolution': {
    title: 'What to do if there\'s a dispute',
    category: 'Trust & Safety',
    categoryHref: '/help/trust',
    categoryColor: 'rose',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Disputes are rare on CrewLink, but when they happen, we\'re here to help resolve them fairly.' },
      { type: 'steps', text: ['Communicate first with the other party', 'Contact support if needed', 'We investigate within 48-72 hours', 'Fair resolution is reached'] },
      { type: 'h2', text: 'Step 1: Communicate first' },
      { type: 'p', text: 'Most issues can be resolved by talking directly with the other party. Use in-app messaging to discuss the problem and try to find a solution.' },
      { type: 'h2', text: 'Step 2: Contact support' },
      { type: 'p', text: 'If you can\'t resolve it directly, contact our support team. Provide details about the job, what went wrong, and any documentation (photos, messages).' },
      { type: 'h2', text: 'Step 3: We investigate' },
      { type: 'p', text: 'Our team reviews all evidence and communicates with both parties. We aim to resolve disputes within 48-72 hours.' },
      { type: 'h2', text: 'Possible outcomes' },
      { type: 'ul', text: ['Full or partial refund to client', 'Payment released to worker', 'Rework arrangement', 'Mutual agreement between parties'] },
      { type: 'warning', text: 'Always keep communication within the CrewLink app to ensure we have records for dispute resolution.' },
    ],
    relatedArticles: [
      { title: 'CrewLink Guarantee', href: '/help/guarantee' },
      { title: 'Contact support', href: '/help/contact' },
    ],
  },
  'cancellation-policy': {
    title: 'Cancellation policies',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'Understanding our cancellation policy helps you plan ahead and avoid unexpected fees.' },
      { type: 'h2', text: 'Client cancellations' },
      { type: 'ul', text: ['Free cancellation up to 24 hours before the job', 'Cancellation fee (typically 25%) if cancelled within 24 hours', 'If worker has already arrived, full payment may be required'] },
      { type: 'h2', text: 'Worker cancellations' },
      { type: 'p', text: 'Workers should cancel as early as possible to allow clients to find a replacement. Frequent cancellations may affect your account standing.' },
      { type: 'h2', text: 'Mutual cancellations' },
      { type: 'p', text: 'If both parties agree to cancel, no fees apply. The hold on the client\'s payment method is released immediately.' },
      { type: 'warning', text: 'Repeated last-minute cancellations may result in account restrictions.' },
    ],
    relatedArticles: [
      { title: 'How payments work', href: '/help/articles/how-payments-work' },
      { title: 'Dispute resolution', href: '/help/articles/dispute-resolution' },
    ],
  },
  'leaving-reviews': {
    title: 'How to leave a review',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '2 min read',
    content: [
      { type: 'p', text: 'Reviews help the CrewLink community make informed decisions. Here\'s how to leave helpful feedback.' },
      { type: 'h2', text: 'When to leave a review' },
      { type: 'p', text: 'You\'ll be prompted to leave a review after a job is marked complete. You have 14 days to submit your review.' },
      { type: 'h2', text: 'What to include' },
      { type: 'ul', text: ['Star rating (1-5 stars)', 'Written feedback about your experience', 'Whether you\'d recommend this person'] },
      { type: 'h2', text: 'Tips for helpful reviews' },
      { type: 'ul', text: ['Be specific about what went well or could improve', 'Keep it professional and factual', 'Mention the type of work that was done', 'Note punctuality, communication, and quality'] },
      { type: 'tip', text: 'Detailed reviews help other users and are greatly appreciated by the community.' },
    ],
    relatedArticles: [
      { title: 'Finding the right worker', href: '/help/articles/finding-workers' },
      { title: 'Building your profile', href: '/help/articles/building-profile' },
    ],
  },
  'posting-jobs': {
    title: 'How to post your first job',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'Posting a job on CrewLink is quick and easy. Follow these steps to get started and find the help you need.' },
      { type: 'steps', text: ['Describe your task clearly', 'Set your location', 'Choose date and time', 'Set your budget', 'Review and post'] },
      { type: 'h2', text: 'Step 1: Describe your task' },
      { type: 'p', text: 'Start by giving your job a clear, descriptive title. Be specific about what you need done—this helps attract the right workers.' },
      { type: 'h2', text: 'Step 2: Set your location' },
      { type: 'p', text: 'Enter the address where the work will be done. Workers nearby will see your job first.' },
      { type: 'h2', text: 'Step 3: Choose date and time' },
      { type: 'p', text: 'Select when you need the work done. You can choose specific times or mark it as flexible.' },
      { type: 'h2', text: 'Step 4: Set your budget' },
      { type: 'p', text: 'Enter how much you\'re willing to pay. You can set a flat rate or hourly rate depending on the task.' },
      { type: 'h2', text: 'Step 5: Review and post' },
      { type: 'p', text: 'Review all the details and post your job. Workers will start applying within minutes!' },
      { type: 'h2', text: 'Tips for better results' },
      { type: 'ul', text: ['Add photos if relevant to help workers understand the task', 'Be clear about any tools or skills required', 'Respond quickly to applicants—the best workers go fast', 'Set a fair price based on the complexity and time required'] },
    ],
    relatedArticles: [
      { title: 'Finding the right worker', href: '/help/articles/finding-workers' },
      { title: 'Setting fair prices', href: '/help/articles/pricing-guide' },
      { title: 'Managing ongoing jobs', href: '/help/articles/managing-jobs' },
    ],
  },
  'finding-workers': {
    title: 'Finding the right worker',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Choosing the right worker is key to a successful experience on CrewLink. Here\'s how to find the perfect match for your task.' },
      { type: 'h2', text: 'Review profiles carefully' },
      { type: 'p', text: 'Take time to look at each applicant\'s profile. Check their bio, skills, and experience to see if they\'re a good fit.' },
      { type: 'h2', text: 'Check ratings and reviews' },
      { type: 'p', text: 'Past reviews from other clients give you insight into what it\'s like to work with someone. Look for consistent positive feedback.' },
      { type: 'h2', text: 'Look for badges' },
      { type: 'ul', text: ['Verified: Identity confirmed through our verification process', 'Top Rated: Consistently receives 5-star reviews', 'Fast Responder: Typically replies within 5 minutes', 'Elite: Among the highest-rated workers on the platform'] },
      { type: 'h2', text: 'Message before booking' },
      { type: 'p', text: 'Don\'t hesitate to message potential workers to ask questions or clarify details. This helps ensure you\'re on the same page.' },
      { type: 'h2', text: 'Trust your instincts' },
      { type: 'p', text: 'If something doesn\'t feel right, keep looking. There are plenty of great workers on CrewLink.' },
      { type: 'tip', text: 'Workers with the "Elite" badge have completed 50+ jobs with a 4.9+ rating.' },
    ],
    relatedArticles: [
      { title: 'How to post your first job', href: '/help/articles/posting-jobs' },
      { title: 'Leaving reviews', href: '/help/articles/leaving-reviews' },
      { title: 'Safety tips for clients', href: '/help/trust' },
    ],
  },
  'getting-started-worker': {
    title: 'Getting started as a worker',
    category: 'Working',
    categoryHref: '/help/workers',
    categoryColor: 'emerald',
    readTime: '5 min read',
    content: [
      { type: 'p', text: 'Welcome to CrewLink! Here\'s everything you need to know to start earning money on our platform.' },
      { type: 'steps', text: ['Create your account', 'Complete your profile', 'Get verified', 'Set up your payout method', 'Find your first job'] },
      { type: 'h2', text: 'Create your account' },
      { type: 'p', text: 'Sign up with your email and create a strong password. You will need to verify your email to get started.' },
      { type: 'h2', text: 'Complete your profile' },
      { type: 'p', text: 'Add a professional photo, write a compelling bio, and list all your relevant skills. The more complete your profile, the more likely you are to get hired.' },
      { type: 'h2', text: 'Get verified' },
      { type: 'p', text: 'Complete our identity verification process to earn the Verified badge. This significantly increases your chances of getting hired.' },
      { type: 'h2', text: 'Set up your payout method' },
      { type: 'p', text: 'Add your bank account so you can receive payments. We use secure, encrypted transfers.' },
      { type: 'h2', text: 'Find your first job' },
      { type: 'p', text: 'Browse available jobs in your area, filter by category or pay rate, and apply to ones that match your skills.' },
      { type: 'h2', text: 'Tips for success' },
      { type: 'ul', text: ['Respond to inquiries quickly. Clients appreciate fast communication', 'Be professional and on time for every job', 'Communicate clearly about any issues or changes', 'Ask for reviews after completing jobs'] },
      { type: 'tip', text: 'New workers who complete their profile within 24 hours are 3x more likely to get their first job.' },
    ],
    relatedArticles: [
      { title: 'Building your profile', href: '/help/articles/building-profile' },
      { title: 'Getting paid', href: '/help/articles/getting-paid' },
      { title: 'Earning great reviews', href: '/help/articles/earning-reviews' },
    ],
  },
  'building-profile': {
    title: 'Building your profile',
    category: 'Working',
    categoryHref: '/help/workers',
    categoryColor: 'emerald',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Your profile is your first impression on CrewLink. A complete, professional profile helps you stand out and win more jobs.' },
      { type: 'h2', text: 'Choose a great photo' },
      { type: 'p', text: 'Use a clear, friendly photo where your face is visible. Professional headshots work best, but a well-lit casual photo is fine too.' },
      { type: 'h2', text: 'Write a compelling bio' },
      { type: 'p', text: 'Tell clients who you are and what makes you great at what you do. Highlight your experience, specialties, and what you enjoy about your work.' },
      { type: 'h2', text: 'List your skills' },
      { type: 'p', text: 'Add all relevant skills to your profile. This helps you appear in more search results and shows clients your capabilities.' },
      { type: 'h2', text: 'Keep it updated' },
      { type: 'p', text: 'As you gain experience and learn new skills, update your profile to reflect your growth.' },
      { type: 'tip', text: 'Profiles with professional photos get 70% more views than those without.' },
    ],
    relatedArticles: [
      { title: 'Getting started as a worker', href: '/help/articles/getting-started-worker' },
      { title: 'Getting verified', href: '/help/articles/worker-verification' },
    ],
  },
  'getting-paid': {
    title: 'Getting paid',
    category: 'Payments',
    categoryHref: '/help/payments',
    categoryColor: 'purple',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'CrewLink makes getting paid simple and secure. Here is how the payout process works.' },
      { type: 'h2', text: 'When you get paid' },
      { type: 'p', text: 'After a client confirms the job is complete, your earnings (minus the platform fee) become available for withdrawal.' },
      { type: 'h2', text: 'Payout methods' },
      { type: 'ul', text: ['Direct bank transfer (1-3 business days)', 'Instant transfer (available for a small fee)', 'PayPal (where available)'] },
      { type: 'h2', text: 'Setting up payouts' },
      { type: 'p', text: 'Go to Settings > Payout Methods to add your bank account or other payment method. You only need to do this once.' },
      { type: 'h2', text: 'Tracking your earnings' },
      { type: 'p', text: 'View your earnings history, pending payouts, and transaction details in the Earnings section of your dashboard.' },
      { type: 'tip', text: 'Enable instant payouts to get your money within minutes after job completion.' },
    ],
    relatedArticles: [
      { title: 'Understanding service fees', href: '/help/articles/service-fees' },
      { title: 'How payments work', href: '/help/articles/how-payments-work' },
    ],
  },
  'earning-reviews': {
    title: 'Earning great reviews',
    category: 'Working',
    categoryHref: '/help/workers',
    categoryColor: 'emerald',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Great reviews are essential for success on CrewLink. Here is how to consistently earn 5-star ratings.' },
      { type: 'h2', text: 'Communicate clearly' },
      { type: 'p', text: 'Keep clients informed before, during, and after the job. Confirm details, give updates if running late, and let them know when you are finished.' },
      { type: 'h2', text: 'Be punctual' },
      { type: 'p', text: 'Arrive on time or a few minutes early. If you are running late, let the client know immediately.' },
      { type: 'h2', text: 'Do quality work' },
      { type: 'p', text: 'Take pride in your work. Do the job thoroughly and pay attention to details.' },
      { type: 'h2', text: 'Be professional' },
      { type: 'p', text: 'Dress appropriately, be courteous, and respect the client\'s space and belongings.' },
      { type: 'h2', text: 'Ask for feedback' },
      { type: 'p', text: 'After completing a job, politely ask if the client is satisfied and if they would be willing to leave a review.' },
      { type: 'tip', text: 'Workers who ask for reviews receive 2x more reviews than those who don\'t.' },
    ],
    relatedArticles: [
      { title: 'Building your profile', href: '/help/articles/building-profile' },
      { title: 'Getting started as a worker', href: '/help/articles/getting-started-worker' },
    ],
  },
  'pricing-guide': {
    title: 'Setting fair prices',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'Setting the right price attracts quality workers and helps ensure a great experience.' },
      { type: 'h2', text: 'Research typical rates' },
      { type: 'p', text: 'Browse similar jobs on CrewLink to see what others are paying for comparable tasks in your area.' },
      { type: 'h2', text: 'Consider complexity' },
      { type: 'p', text: 'Factor in the difficulty of the task, any special skills required, and the time it will take.' },
      { type: 'h2', text: 'Be fair' },
      { type: 'p', text: 'Fair pay attracts better workers and leads to better results. Low-ball offers often result in fewer applicants or lower quality work.' },
      { type: 'h2', text: 'Factor in materials' },
      { type: 'p', text: 'If the job requires supplies or tools, decide if you will provide them or if the worker should include them in their rate.' },
      { type: 'tip', text: 'Jobs priced at or above the suggested rate get 50% more applicants.' },
    ],
    relatedArticles: [
      { title: 'How to post your first job', href: '/help/articles/posting-jobs' },
      { title: 'Finding the right worker', href: '/help/articles/finding-workers' },
    ],
  },
  'managing-jobs': {
    title: 'Managing ongoing jobs',
    category: 'Hiring',
    categoryHref: '/help/hiring',
    categoryColor: 'cyan',
    readTime: '4 min read',
    content: [
      { type: 'p', text: 'Once you have hired a worker, here is how to manage the job from start to finish.' },
      { type: 'h2', text: 'Before the job starts' },
      { type: 'p', text: 'Confirm the details with your worker. Make sure you are both clear on the scope, timing, and expectations.' },
      { type: 'h2', text: 'During the job' },
      { type: 'p', text: 'Stay available for questions. If the worker encounters unexpected issues, communicate openly about how to proceed.' },
      { type: 'h2', text: 'Making changes' },
      { type: 'p', text: 'If the scope changes, discuss it with your worker and agree on any price adjustments before they do additional work.' },
      { type: 'h2', text: 'After completion' },
      { type: 'p', text: 'Review the work, confirm the job is complete in the app, and leave an honest review to help other clients.' },
      { type: 'warning', text: 'Always confirm scope changes in writing through the app before additional work begins.' },
    ],
    relatedArticles: [
      { title: 'How to post your first job', href: '/help/articles/posting-jobs' },
      { title: 'Leaving reviews', href: '/help/articles/leaving-reviews' },
    ],
  },
  'create-account': {
    title: 'Creating your account',
    category: 'Account',
    categoryHref: '/help/account',
    categoryColor: 'amber',
    readTime: '2 min read',
    content: [
      { type: 'p', text: 'Getting started with CrewLink is quick and easy. Follow these steps to create your account.' },
      { type: 'steps', text: ['Sign up with email or social login', 'Verify your email', 'Complete your profile', 'Choose your mode (hire or work)'] },
      { type: 'h2', text: 'Sign up' },
      { type: 'p', text: 'Click "Get Started" and enter your email address. You can also sign up with Google or Apple for faster registration.' },
      { type: 'h2', text: 'Verify your email' },
      { type: 'p', text: 'Check your inbox for a verification email and click the link to confirm your account.' },
      { type: 'h2', text: 'Complete your profile' },
      { type: 'p', text: 'Add your name, phone number, and location. If you plan to work, add your skills and a profile photo.' },
      { type: 'h2', text: 'Choose your mode' },
      { type: 'p', text: 'Select whether you want to hire help, find work, or both. You can switch between modes at any time.' },
    ],
    relatedArticles: [
      { title: 'Getting verified', href: '/help/articles/verify-identity' },
      { title: 'Completing your profile', href: '/help/articles/complete-profile' },
    ],
  },
  'complete-profile': {
    title: 'Completing your profile',
    category: 'Account',
    categoryHref: '/help/account',
    categoryColor: 'amber',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'A complete profile helps you get the most out of CrewLink, whether you are hiring or working.' },
      { type: 'h2', text: 'Add a photo' },
      { type: 'p', text: 'Profiles with photos get significantly more engagement. Choose a clear, friendly photo.' },
      { type: 'h2', text: 'Write your bio' },
      { type: 'p', text: 'Tell others about yourself. For workers, highlight your experience. For hirers, share what types of help you typically need.' },
      { type: 'h2', text: 'Add your location' },
      { type: 'p', text: 'Your location helps match you with nearby workers or jobs.' },
      { type: 'h2', text: 'Verify your identity' },
      { type: 'p', text: 'Complete identity verification to build trust and access all platform features.' },
      { type: 'tip', text: 'Complete profiles are 5x more likely to get responses.' },
    ],
    relatedArticles: [
      { title: 'Creating your account', href: '/help/articles/create-account' },
      { title: 'Getting verified', href: '/help/articles/verify-identity' },
    ],
  },
  'verify-identity': {
    title: 'Verifying your identity',
    category: 'Account',
    categoryHref: '/help/account',
    categoryColor: 'amber',
    readTime: '3 min read',
    content: [
      { type: 'p', text: 'Identity verification helps keep CrewLink safe for everyone and builds trust between users.' },
      { type: 'h2', text: 'What you will need' },
      { type: 'ul', text: ['A government-issued ID (driver\'s license, passport, or ID card)', 'A device with a camera for a selfie', 'Good lighting for clear photos'] },
      { type: 'h2', text: 'How to verify' },
      { type: 'p', text: 'Go to Settings > Verification and follow the prompts. The process typically takes just a few minutes.' },
      { type: 'h2', text: 'What happens next' },
      { type: 'p', text: 'Your information is reviewed securely. Most verifications are approved within 24 hours.' },
      { type: 'h2', text: 'Benefits of verification' },
      { type: 'ul', text: ['Verified badge on your profile', 'Increased trust from other users', 'Access to all platform features'] },
    ],
    relatedArticles: [
      { title: 'Completing your profile', href: '/help/articles/complete-profile' },
      { title: 'Account security', href: '/help/articles/change-password' },
    ],
  },
  'change-password': {
    title: 'Changing your password',
    category: 'Account',
    categoryHref: '/help/account',
    categoryColor: 'amber',
    readTime: '2 min read',
    content: [
      { type: 'p', text: 'Keep your account secure by using a strong password and changing it if you suspect any unauthorized access.' },
      { type: 'h2', text: 'To change your password' },
      { type: 'p', text: 'Go to Settings > Account > Password & Security. Enter your current password, then your new password twice.' },
      { type: 'h2', text: 'Forgot your password?' },
      { type: 'p', text: 'On the sign-in page, tap "Forgot password?" and enter your email. You will receive a link to create a new password.' },
      { type: 'h2', text: 'Password tips' },
      { type: 'ul', text: ['Use at least 8 characters', 'Include numbers and special characters', 'Avoid using the same password on other sites', 'Never share your password with anyone'] },
      { type: 'warning', text: 'If you suspect unauthorized access, change your password immediately and contact support.' },
    ],
    relatedArticles: [
      { title: 'Verifying your identity', href: '/help/articles/verify-identity' },
      { title: 'Account settings', href: '/help/account' },
    ],
  },
  'delete-account': {
    title: 'Deleting your account',
    category: 'Account',
    categoryHref: '/help/account',
    categoryColor: 'amber',
    readTime: '2 min read',
    content: [
      { type: 'p', text: 'If you need to delete your CrewLink account, you can do so in your settings. Please note this action is permanent.' },
      { type: 'warning', text: 'Account deletion is permanent and cannot be undone. Make sure to withdraw any earnings first.' },
      { type: 'h2', text: 'Before you delete' },
      { type: 'ul', text: ['Complete or cancel any pending jobs', 'Withdraw any remaining earnings', 'Download any data you want to keep'] },
      { type: 'h2', text: 'How to delete' },
      { type: 'p', text: 'Go to Settings > Danger Zone > Delete Account. You will need to confirm your password.' },
      { type: 'h2', text: 'What gets deleted' },
      { type: 'ul', text: ['Your profile and personal information', 'Job history and messages', 'Reviews you have given and received', 'Any remaining account balance (withdraw first)'] },
      { type: 'h2', text: 'Need help instead?' },
      { type: 'p', text: 'If you are having issues, contact our support team. We may be able to help resolve the problem.' },
    ],
    relatedArticles: [
      { title: 'Contact support', href: '/help/contact' },
      { title: 'Account settings', href: '/help/account' },
    ],
  },
}

// Default article for any slug not found
const defaultArticle = {
  title: 'Help Article',
  category: 'Help Center',
  categoryHref: '/help',
  categoryColor: 'cyan' as const,
  readTime: '2 min read',
  content: [
    { type: 'p' as const, text: 'We\'re still working on this article. Our help center is constantly being updated with new content.' },
    { type: 'p' as const, text: 'For immediate assistance, please contact our support team or browse our other help topics.' },
  ],
  relatedArticles: [
    { title: 'Contact support', href: '/help/contact' },
    { title: 'Back to Help Center', href: '/help' },
  ],
}

const colorClasses = {
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  },
}

function ContentBlock({ block, colors }: { block: { type: string; text: string | string[] }; colors: typeof colorClasses.cyan }) {
  if (block.type === 'h2') {
    return (
      <h2 className="text-xl font-semibold text-white mt-10 mb-4 flex items-center gap-3">
        <div className={cn('w-1 h-6 rounded-full', colors.bg.replace('/10', '/50'))} />
        {block.text as string}
      </h2>
    )
  }

  if (block.type === 'ul') {
    return (
      <ul className="space-y-3 my-6">
        {(block.text as string[]).map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-300">
            <CheckCircle2 className={cn('w-5 h-5 mt-0.5 flex-shrink-0', colors.text)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (block.type === 'steps') {
    return (
      <div className={cn('p-6 rounded-2xl border my-8', colors.bg, colors.border)}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className={cn('w-5 h-5', colors.text)} />
          <span className={cn('font-medium', colors.text)}>Quick Overview</span>
        </div>
        <ol className="space-y-2">
          {(block.text as string[]).map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                colors.bg, colors.text
              )}>
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (block.type === 'tip') {
    return (
      <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl my-6 flex gap-4">
        <Lightbulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium text-emerald-400">Pro tip: </span>
          <span className="text-slate-300">{block.text as string}</span>
        </div>
      </div>
    )
  }

  if (block.type === 'warning') {
    return (
      <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl my-6 flex gap-4">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium text-amber-400">Important: </span>
          <span className="text-slate-300">{block.text as string}</span>
        </div>
      </div>
    )
  }

  return (
    <p className="text-slate-300 my-4 leading-relaxed">
      {block.text as string}
    </p>
  )
}

export default function HelpArticlePage() {
  const params = useParams()
  const slug = params?.slug as string
  const article = articles[slug] || defaultArticle
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const colors = colorClasses[article.categoryColor]

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type)
  }

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-slate-950">
        {/* Hero */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
          </div>

          <div
            ref={ref}
            className={cn(
              'relative max-w-4xl mx-auto px-4',
              getRevealClasses(isVisible)
            )}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
              <Link href="/help" className="hover:text-white transition-colors flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={article.categoryHref} className={cn('hover:text-white transition-colors', colors.text)}>
                {article.category}
              </Link>
            </div>

            {/* Back button */}
            <Link
              href={article.categoryHref}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {article.category}
            </Link>

            {/* Category badge */}
            <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6', colors.badge)}>
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">{article.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_280px] gap-12">
              {/* Main Content */}
              <div>
                <div className="prose prose-invert prose-slate max-w-none">
                  {article.content.map((block, index) => (
                    <ContentBlock key={index} block={block} colors={colors} />
                  ))}
                </div>

                {/* Feedback */}
                <div className="mt-12 p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5">
                  <h3 className="font-semibold text-white mb-4">Was this article helpful?</h3>
                  {feedback ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-5 h-5" />
                      <span>Thanks for your feedback!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleFeedback('helpful')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/5 hover:border-emerald-500/30"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Yes, helpful
                      </button>
                      <button
                        onClick={() => handleFeedback('not-helpful')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition-all border border-white/5 hover:border-rose-500/30"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Related Articles */}
                <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Related Articles</h3>
                  </div>
                  <div className="space-y-2">
                    {article.relatedArticles.map((related) => (
                      <Link
                        key={related.title}
                        href={related.href}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                      >
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          {related.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Still have questions?</h3>
                  <p className="text-sm text-slate-400 mb-4">Our support team is here to help 24/7.</p>
                  <Link
                    href="/help/contact"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                  >
                    Contact Support
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  )
}
