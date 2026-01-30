// Supabase client for Server Components and Server Actions
// Uses service role key for full database access (server-side only)

import { createServerClient as createClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = await cookies()

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in Server Components (read-only)
          }
        },
      },
    }
  )
}

// Service client for Server Actions (no cookies needed)
// Creates a singleton client for analytics operations
let serviceClientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createServiceClient() {
  if (serviceClientInstance) {
    return serviceClientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase service role key')
  }

  serviceClientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (...args) => {
        try {
          console.log('[Service Client] Fetch request to:', args[0]);
          const response = await fetch(...args);
          console.log('[Service Client] Fetch response:', response.status, response.statusText);
          return response;
        } catch (error) {
          console.error('[Service Client] Fetch error:', error);
          throw error;
        }
      },
    },
  })

  return serviceClientInstance
}
