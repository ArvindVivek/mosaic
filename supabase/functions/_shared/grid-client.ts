/**
 * GRID API GraphQL Client
 *
 * Provides authenticated GraphQL client for GRID esports data API
 * with automatic retry logic and exponential backoff.
 */

import { GraphQLClient } from 'https://esm.sh/graphql-request@7.1.2';

const GRID_API_URL = 'https://api.grid.gg/central-data/graphql';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

/**
 * Creates an authenticated GraphQL client for GRID API
 *
 * @param apiKey - GRID API key for authentication
 * @returns Configured GraphQL client with Bearer token
 */
export function createGridClient(apiKey: string): GraphQLClient {
  if (!apiKey) {
    throw new Error('GRID_API_KEY is required');
  }

  const client = new GraphQLClient(GRID_API_URL, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  return client;
}

/**
 * Execute a GraphQL query with exponential backoff retry logic
 *
 * Retries on network errors and 5xx server errors.
 * Does NOT retry on 4xx client errors (auth, validation, etc).
 *
 * @param client - GraphQL client instance
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @param options - Retry configuration
 * @returns Query result data
 * @throws Error if all retries exhausted or client error encountered
 */
export async function queryWithRetry<T = unknown>(
  client: GraphQLClient,
  query: string,
  variables?: Record<string, unknown>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    initialDelay = INITIAL_RETRY_DELAY,
    maxDelay = 30000, // 30 seconds max
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await client.request<T>(query, variables);
      return data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (isClientError(error)) {
        throw new Error(`GRID API client error: ${(error as Error).message}`);
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt),
        maxDelay
      );

      console.log(
        `GRID API request failed (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${delay}ms...`
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `GRID API request failed after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}

/**
 * Checks if error is a client error (4xx) that should not be retried
 */
function isClientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as { response?: { status?: number } };
  const status = err.response?.status;

  return status !== undefined && status >= 400 && status < 500;
}

/**
 * Sleep utility for testing and rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
