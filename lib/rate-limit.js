// lib/rate-limit.js — Lightweight in-memory sliding-window rate limiter.
//
// IMPORTANT: This implementation works correctly for single-instance deployments
// (local dev, single-container) where all requests hit the same Node.js process.
// For multi-instance production deployments (e.g. Vercel serverless with horizontal
// scaling), upgrade to @upstash/ratelimit backed by a Redis store so limits are
// enforced across all instances.

/** @type {Map<string, { count: number; resetAt: number }>} */
const store = new Map()

/**
 * Check and record a rate-limit hit.
 *
 * @param {string} key       Unique identifier, e.g. `"invite:${userId}"`
 * @param {number} limit     Maximum requests allowed within the window
 * @param {number} windowMs  Window duration in milliseconds
 * @returns {{ allowed: boolean; remaining: number }}
 */
export function rateLimit(key, limit, windowMs) {
  const now   = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count }
}
