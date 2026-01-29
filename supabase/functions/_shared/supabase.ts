/**
 * Supabase Client Factory for Edge Functions
 *
 * Provides authenticated Supabase clients for use in Edge Functions
 * with service role access for backend operations.
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

/**
 * Creates a Supabase client with service role access
 *
 * Use this for backend operations that require elevated permissions
 * (bypassing Row Level Security policies).
 *
 * @param supabaseUrl - Supabase project URL
 * @param serviceRoleKey - Service role key for admin access
 * @returns Supabase client with service role privileges
 */
export function getSupabaseClient(
  supabaseUrl: string,
  serviceRoleKey: string
): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Parses environment variables from Edge Function request
 *
 * Edge Functions receive env vars differently than standard Node.js.
 * This helper ensures consistent access across environments.
 */
export function getEnvVars() {
  return {
    supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
    serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    gridApiKey: Deno.env.get('GRID_API_KEY') ?? '',
  };
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Create error response with CORS headers
 */
export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}
