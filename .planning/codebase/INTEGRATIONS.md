# External Integrations

**Analysis Date:** 2026-01-28

## APIs & External Services

**Documentation/Resources:**
- Vercel Templates - Referenced in `app/page.tsx` for Next.js templates
- Next.js Learning Resources - Referenced in `app/page.tsx` for tutorials

**Note:** No backend API integrations, third-party APIs, or service SDKs are currently implemented in the codebase.

## Data Storage

**Databases:**
- Not detected - No database client, ORM, or driver installed

**File Storage:**
- Local filesystem only
- Public assets served from `public/` directory (Next.js built-in)
- No cloud storage integration (AWS S3, Google Cloud Storage, etc.)

**Caching:**
- None explicitly configured
- Next.js default caching via image optimization and font loading

## Authentication & Identity

**Auth Provider:**
- Not implemented - No authentication or identity provider configured
- Application is fully public with no protected routes or user sessions

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service (Sentry, Rollbar, etc.)

**Logs:**
- Console logging only via Node.js and browser developer tools
- No centralized logging service

**Performance Monitoring:**
- Not detected - No APM (Application Performance Monitoring) service

## CI/CD & Deployment

**Hosting:**
- Recommended: Vercel (Next.js creators' platform)
- Alternative: Any Node.js hosting (AWS, Heroku, DigitalOcean, etc.)
- No CI/CD configuration files detected (GitHub Actions, GitLab CI, etc.)

**CI Pipeline:**
- Not detected - No GitHub Actions workflow, GitLab CI, or other CI service configured
- `.planning/` directory suggests upcoming GSD orchestration

**Deployment Target:**
- Next.js built-in server (next start)
- Vercel deployments reference in template documentation

## Environment Configuration

**Required env vars:**
- None detected - Application is self-contained and requires no external configuration

**Optional env vars:**
- Pattern: `.env*` files (per `.gitignore` and Next.js convention)
- Examples: API keys, database URLs, service credentials (if added)

**Secrets location:**
- `.env.local` (development) - Not committed
- `.env.production` (production) - Not committed
- Environment variables in deployment platform (if using Vercel or similar)

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints or handlers implemented

**Outgoing:**
- Not detected - No webhook integrations to external services

## Frontend Dependencies

**Font Services:**
- Google Fonts via `next/font/google` - Geist and Geist_Mono fonts loaded in `app/layout.tsx`
- Next.js automatic font optimization (no external request overhead)

**Image Optimization:**
- Next.js built-in Image component (`next/image` imported in `app/page.tsx`)
- Automatic format conversion, responsive images, lazy loading

---

*Integration audit: 2026-01-28*
