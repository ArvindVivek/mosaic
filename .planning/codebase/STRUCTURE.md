# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
mosaic/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout wrapper for all pages
│   ├── page.tsx           # Home page component (route: /)
│   ├── globals.css        # Global styles and CSS variables
│   └── favicon.ico        # Favicon asset
├── public/                # Static assets served at root
│   ├── next.svg          # Next.js logo
│   ├── vercel.svg        # Vercel logo
│   ├── file.svg          # File icon
│   ├── globe.svg         # Globe icon
│   └── window.svg        # Window icon
├── docs/                  # Documentation directory
├── .planning/codebase/    # Planning and analysis documents
├── .git/                  # Git repository
├── package.json           # npm dependencies and scripts
├── package-lock.json      # npm lockfile
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## Directory Purposes

**app/:**
- Purpose: Contains all pages, layouts, and app-level code following Next.js App Router convention
- Contains: Page components (.tsx), layout components (.tsx), stylesheets (.css)
- Key files: `page.tsx` (home page), `layout.tsx` (root document structure)
- Note: Directory name is required by Next.js; all routes defined here

**public/:**
- Purpose: Serves static assets at the root domain (e.g., `/next.svg`)
- Contains: SVG icons, images, logos used in pages
- Key files: SVG assets for branding and UI elements
- Note: Committed to git; accessible at runtime

**docs/:**
- Purpose: Additional documentation or guides
- Contains: User-created documentation (currently empty)
- Note: Not part of application logic

**.planning/codebase/:**
- Purpose: GSD mapping documents for codebase analysis
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Note: Reference documents for code generation and planning

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Home page component; renders when user visits `/`
- `app/layout.tsx`: Root layout; wraps all pages and provides document shell

**Configuration:**
- `tsconfig.json`: TypeScript compiler settings; path alias `@/*` maps to root directory
- `next.config.ts`: Next.js-specific configuration (currently empty with defaults)
- `postcss.config.mjs`: PostCSS plugins configuration; includes Tailwind CSS
- `eslint.config.mjs`: ESLint rules; uses Next.js config with TypeScript and Core Web Vitals
- `package.json`: npm dependencies, scripts, and project metadata

**Core Logic:**
- `app/page.tsx`: Main page component with JSX structure and Tailwind classes
- `app/layout.tsx`: Document metadata, font configuration, and layout wrapper
- `app/globals.css`: CSS variables, theme configuration, Tailwind imports

**Styling:**
- `app/globals.css`: All global styles; Tailwind CSS with custom CSS variables for theme

**Assets:**
- `public/`: All static files served at domain root

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `page.tsx`, `layout.tsx`)
- Stylesheets: `lowercase.css` (e.g., `globals.css`)
- Config files: `lowercase.config.mjs|ts` (e.g., `next.config.ts`, `postcss.config.mjs`)
- SVG assets: `lowercase.svg` (e.g., `next.svg`, `vercel.svg`)

**Directories:**
- Next.js reserved: `app/`, `public/` (lowercase, required by framework)
- Feature directories: lowercase (none currently; add as needed)
- Documentation: `docs/`, `.planning/` (lowercase)

**TypeScript/React:**
- Components: Default export, `export default function ComponentName() {}`
- Types: `Readonly<{ prop: Type }>` for strict typing
- Imports: Absolute paths with alias `@/` (maps to root)

## Where to Add New Code

**New Page/Route:**
1. Create file in `app/` directory following Next.js convention
2. Example: `app/about/page.tsx` creates `/about` route
3. Wrap with RootLayout automatically
4. Location: `app/[route-name]/page.tsx`

**New Component:**
1. Create directory in `app/` if not a page: `app/components/ComponentName.tsx`
2. Or create directly in feature directory if route-scoped
3. Example: `app/components/Card.tsx`
4. Use default or named exports as needed

**New Utility/Helper:**
1. Create at root or in `app/lib/` directory
2. Example: `app/lib/utils.ts`
3. Import with absolute path: `import { helper } from '@/app/lib/utils'`

**New Stylesheet:**
1. Prefer Tailwind CSS classes in JSX (utility-first)
2. For component-scoped styles: create `.css` file in same directory
3. For global styles: add to `app/globals.css`
4. Import in appropriate `.tsx` file

**New Static Asset:**
1. Add to `public/` directory
2. Reference in code as `/filename` (e.g., `src="/next.svg"`)
3. Use Next.js Image component for optimization: `<Image src="/file.svg" />`

**New Configuration:**
1. Environment variables: add to `.env.local` (dev) or deployment platform (prod)
2. Next.js config: modify `next.config.ts`
3. TypeScript: modify `tsconfig.json` (rarely needed)
4. Tailwind: modify `app/globals.css` for custom theme values

## Special Directories

**.next/:**
- Purpose: Build output and cache
- Generated: Yes (created during build)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (created by npm install)
- Committed: No (in .gitignore)

**public/:**
- Purpose: Static assets
- Generated: No (user-created)
- Committed: Yes

**app/:**
- Purpose: Application code (required by Next.js)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-01-28*
