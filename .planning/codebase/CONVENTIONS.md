# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- Page components: PascalCase with `.tsx` extension (e.g., `page.tsx`, `layout.tsx`)
- Configuration files: kebab-case (e.g., `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`)
- CSS files: kebab-case (e.g., `globals.css`)
- Files follow Next.js App Router conventions

**Functions:**
- Component functions: PascalCase (e.g., `RootLayout`, `Home`)
- Regular functions: camelCase (e.g., `geistSans`, `geistMono`)
- Arrow functions are preferred for callbacks and exports
- Default exports for page components and layouts

**Variables:**
- camelCase for all variable declarations (e.g., `geistSans`, `geistMono`)
- Constants at module level use camelCase (e.g., `nextConfig`)
- Configuration objects: camelCase keys

**Types:**
- Type aliases: PascalCase using `type` keyword (e.g., `Metadata`)
- React component props: Inline `Readonly<{}>` types for immutability
- Imports use `type` keyword when importing types (e.g., `import type { Metadata } from "next"`)

## Code Style

**Formatting:**
- No explicit Prettier configuration present; follows Next.js defaults
- Uses built-in formatting from ESLint with Next.js configurations
- Consistent indentation appears to be 2 spaces

**Linting:**
- ESLint v9 configured via `eslint.config.mjs` (flat config format)
- Configuration extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next`, `out`, `build`, `next-env.d.ts`

## Import Organization

**Order:**
1. External library imports (Next.js, React)
2. Type imports (prefixed with `type` keyword)
3. Internal imports (CSS, assets)

**Path Aliases:**
- Configured: `@/*` maps to root directory
- Implementation: Uses `@/` prefix for absolute imports
- Example: `import "./globals.css"` (direct relative paths for CSS in root)

**Pattern Examples from codebase:**
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Image from "next/image";
```

## Error Handling

**Patterns:**
- Limited error handling visible in boilerplate code
- No explicit try-catch blocks in current components
- Next.js framework handles route errors and defaults

## Logging

**Framework:** `console` - No logging framework configured

**Patterns:**
- No logging patterns observed in current codebase
- Recommendation: Use `console.log`, `console.error`, `console.warn` when needed

## Comments

**When to Comment:**
- No comments present in current source files
- Assumption: Self-documenting code preferred
- Comments expected only for complex logic or business rules

**JSDoc/TSDoc:**
- No JSDoc observed in current codebase
- Type annotations used instead of inline documentation
- Recommendation: Use JSDoc for exported functions and component props

## Function Design

**Size:**
- Functions are concise; `RootLayout` and `Home` are single-responsibility components

**Parameters:**
- Components use destructuring for props
- Type annotations via inline `Readonly` types
- Single object parameter pattern preferred for React components

**Return Values:**
- React components return JSX
- Metadata exports return typed objects

## Module Design

**Exports:**
- `export default function` for page and layout components
- `export const` for metadata and configuration objects
- Prefers default exports for component entry points

**Barrel Files:**
- No barrel files (index.ts) observed in current structure
- Each component/page is in its own file

## Next.js Specific Conventions

**App Router Structure:**
- `app/` directory for routing (Next.js 13+)
- `layout.tsx` for shared layouts
- `page.tsx` for route pages
- File-based routing

**Server vs Client Components:**
- No explicit `'use client'` directive in current files (Server Components by default)
- Assumption: All components are Server Components unless marked otherwise

**TypeScript Configuration:**
- Strict mode enabled: `"strict": true`
- JSX: `react-jsx` (modern JSX transform)
- Module resolution: `bundler`

---

*Convention analysis: 2026-01-28*
