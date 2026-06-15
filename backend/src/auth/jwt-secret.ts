/**
 * Single source of truth for the JWT signing/verification secret.
 *
 * Fail fast at boot if no secret is configured rather than silently falling
 * back to a publicly-known constant (which would let anyone forge tokens).
 *
 * In development we still allow a deterministic default so the app can boot
 * without extra setup, but ONLY outside production.
 */
const isProduction = process.env.NODE_ENV === 'production'

export const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (isProduction) {
    // Do not start the service with an insecure default in production.
    throw new Error('JWT_SECRET environment variable must be set in production')
  }
  return 'tripcircle-dev-secret-do-not-use-in-prod'
})()
