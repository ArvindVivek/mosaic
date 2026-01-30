// Batch execution utilities for parallel async operations
// Enables graceful degradation with Promise.allSettled

// =============================================================================
// Types
// =============================================================================

export interface BatchResult<T> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: Error;
}

export interface BatchExecutionOptions {
  onBatchStart?: (batchIndex: number, totalBatches: number) => void;
  onBatchComplete?: (batchIndex: number, totalBatches: number) => void;
}

// =============================================================================
// Batch Execution Functions
// =============================================================================

/**
 * Execute async functions in parallel using Promise.allSettled (heterogeneous types)
 * Enables graceful degradation - failed functions don't abort entire batch
 * Supports functions returning different types using tuple inference
 *
 * @param functions - Tuple of async functions to execute
 * @param options - Optional callbacks for batch lifecycle
 * @returns Tuple of results with status for each function
 */
export async function executeBatch<T extends Array<() => Promise<any>>>(
  functions: T,
  options?: BatchExecutionOptions
): Promise<{ [K in keyof T]: BatchResult<Awaited<ReturnType<T[K]>>> }>;

/**
 * Execute async functions in parallel using Promise.allSettled (homogeneous types)
 * Enables graceful degradation - failed functions don't abort entire batch
 *
 * @param functions - Array of async functions to execute
 * @param options - Optional callbacks for batch lifecycle
 * @returns Array of results with status for each function
 */
export async function executeBatch<T>(
  functions: Array<() => Promise<T>>,
  options?: BatchExecutionOptions
): Promise<BatchResult<T>[]>;

// Implementation
export async function executeBatch(
  functions: Array<() => Promise<any>>,
  options?: BatchExecutionOptions
): Promise<BatchResult<any>[]> {
  // Notify batch start
  options?.onBatchStart?.(0, 1);

  // Execute all functions in parallel
  const results = await Promise.allSettled(
    functions.map((fn) => fn())
  );

  // Map Promise.allSettled results to BatchResult type
  const batchResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return {
        status: 'fulfilled' as const,
        value: result.value,
      };
    } else {
      // Log errors for debugging
      console.error(`Batch function ${index} failed:`, result.reason);

      return {
        status: 'rejected' as const,
        reason: result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason)),
      };
    }
  });

  // Notify batch complete
  options?.onBatchComplete?.(0, 1);

  return batchResults;
}

/**
 * Execute multiple batches sequentially, with parallel execution within each batch
 * Useful for limiting concurrent database connections
 *
 * @param functions - Array of async functions to execute
 * @param batchSize - Number of functions to execute per batch
 * @param options - Optional callbacks for batch lifecycle
 * @returns Array of results with status for each function
 */
export async function executeInBatches<T>(
  functions: Array<() => Promise<T>>,
  batchSize: number,
  options?: BatchExecutionOptions
): Promise<BatchResult<T>[]> {
  const allResults: BatchResult<T>[] = [];
  const totalBatches = Math.ceil(functions.length / batchSize);

  // Process each batch sequentially
  for (let i = 0; i < functions.length; i += batchSize) {
    const batchIndex = Math.floor(i / batchSize);
    const batch = functions.slice(i, i + batchSize);

    // Notify batch start
    options?.onBatchStart?.(batchIndex, totalBatches);

    // Execute batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map((fn) => fn())
    );

    // Map results to BatchResult type
    const mappedResults = batchResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          status: 'fulfilled' as const,
          value: result.value,
        };
      } else {
        // Log errors for debugging
        console.error(`Batch ${batchIndex}, function ${index} failed:`, result.reason);

        return {
          status: 'rejected' as const,
          reason: result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason)),
        };
      }
    });

    allResults.push(...mappedResults);

    // Notify batch complete
    options?.onBatchComplete?.(batchIndex, totalBatches);
  }

  return allResults;
}
