# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript 5.x - All application code, configuration files, and build tooling
- JavaScript (JSX/TSX) - React components using React 19 with JSX syntax

**Secondary:**
- CSS - Global styles and Tailwind CSS utilities in `app/globals.css`
- PostCSS - CSS preprocessing and Tailwind CSS integration

## Runtime

**Environment:**
- Node.js (version specified by `.nvmrc` or package-lock.json - not explicitly pinned)

**Package Manager:**
- npm (Node Package Manager)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with server-side rendering, API routes, and file-based routing
- React 19.2.3 - Frontend UI library and component framework
- React DOM 19.2.3 - DOM rendering for React components

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework via `@tailwindcss/postcss` 4.x
- PostCSS 4 - CSS transformation and Tailwind CSS processing via `postcss.config.mjs`

**Build/Dev:**
- ESLint 9.x - Code linting via `eslint.config.mjs`
- eslint-config-next 16.1.6 - Next.js-specific ESLint rules (core-web-vitals and TypeScript)

## Key Dependencies

**Critical:**
- next@16.1.6 - Core framework, handles routing, SSR, API endpoints, and build optimization
- react@19.2.3 - Component rendering and state management foundation
- react-dom@19.2.3 - Browser DOM rendering for React components

**Infrastructure:**
- @tailwindcss/postcss@^4 - Tailwind CSS PostCSS plugin for style processing
- tailwindcss@^4 - Tailwind CSS utility classes
- @types/react@^19 - TypeScript type definitions for React 19
- @types/react-dom@^19 - TypeScript type definitions for React DOM 19
- @types/node@^20 - TypeScript type definitions for Node.js APIs
- typescript@^5 - TypeScript compiler and type checker

## Configuration

**Environment:**
- Environment variables: `.env*` files (pattern in `.gitignore`)
- No `.env.local`, `.env.production`, or `.env.development` files currently committed
- Secrets management: Not explicitly configured; relies on `.env*` convention

**Build:**
- TypeScript: `tsconfig.json` with strict mode enabled, target ES2017, module esnext
- Next.js: `next.config.ts` (empty configuration, using defaults)
- PostCSS: `postcss.config.mjs` configured with Tailwind CSS plugin
- ESLint: `eslint.config.mjs` extends eslint-config-next core-web-vitals and TypeScript rules

**Path Aliases:**
- `@/*` resolves to root directory as configured in `tsconfig.json`

## Platform Requirements

**Development:**
- Node.js (latest LTS recommended for Next.js 16.1.6)
- npm 8.0+
- Browser with ES2017+ support
- TypeScript 5.x compatible IDE/editor

**Production:**
- Deployment target: Vercel (recommended by Next.js project template)
- Alternative: Any Node.js hosting that supports Next.js applications
- Environment variables required: None documented; app is self-contained

**Scripts:**
```bash
npm run dev      # Start development server (next dev)
npm run build    # Build for production (next build)
npm start        # Start production server (next start)
npm run lint     # Run ESLint (eslint)
```

---

*Stack analysis: 2026-01-28*
