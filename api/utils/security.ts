// api/utils/security.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllowedOrigins } from "./env";

// Rate limiting configuration
const RATE_LIMITS = {
  GET: { requests: 100, window: 60 }, // 100 requests per minute for GET
  POST: { requests: 60, window: 60 }, // 60 requests per minute for POST
  INCREMENT: { requests: 100, window: 60 }, // 100 increments per minute (much more generous)
};

// In-memory storage for rate limiting
const rateLimit = {
  // Store rate limit data with automatic cleanup
  limits: new Map<string, { count: number; expires: number }>(),

  // Clean expired entries every 5 minutes
  cleanup: function () {
    const now = Date.now();
    for (const [key, value] of this.limits.entries()) {
      if (value.expires < now) {
        this.limits.delete(key);
      }
    }
  },

  // Check and update rate limit
  check: function (
    key: string,
    limit: number,
    window: number
  ): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const expireTime = now + window * 1000;

    // Clean up old entries occasionally (1% chance on each request)
    if (Math.random() < 0.01) this.cleanup();

    // Get current count or initialize
    const current = this.limits.get(key);
    if (!current || current.expires < now) {
      this.limits.set(key, { count: 1, expires: expireTime });
      return { allowed: true, remaining: limit - 1 };
    }

    // Increment and check
    current.count += 1;
    const remaining = Math.max(0, limit - current.count);
    return { allowed: current.count <= limit, remaining };
  },
};

// In-memory storage for fraud detection
const fraudDetection = {
  limits: new Map<string, { count: number; expires: number }>(),

  // Check and update fraud detection limits
  check: function (clientIP: string): { allowed: boolean; count: number } {
    const key = `recent_increment:${clientIP}`;
    const now = Date.now();
    const window = 300; // 5 minutes
    const limit = 120; // Max 120 increments per 5 minutes

    // Get current count or initialize
    const current = this.limits.get(key);
    if (!current || current.expires < now) {
      this.limits.set(key, { count: 1, expires: now + window * 1000 });
      return { allowed: true, count: 1 };
    }

    // Increment and check
    current.count += 1;
    return {
      allowed: current.count <= limit,
      count: current.count,
    };
  },
};

// Get allowed origins from environment
const ALLOWED_ORIGINS = getAllowedOrigins();

export interface SecurityOptions {
  allowedMethods?: string[];
  rateLimit?: keyof typeof RATE_LIMITS;
  requireOriginCheck?: boolean;
}

export { fraudDetection };

/**
 * Get client IP address from various headers
 */
function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];
  const remoteAddress =
    req.connection?.remoteAddress || req.socket?.remoteAddress;

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return (realIP as string) || remoteAddress || "unknown";
}

/**
 * Check rate limiting for a client using in-memory storage
 */
function checkRateLimit(
  clientIP: string,
  endpoint: string,
  limitType: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number } {
  const { requests, window } = RATE_LIMITS[limitType];
  const key = `rate_limit:${endpoint}:${clientIP}`;

  // Use in-memory rate limiting instead of Redis
  return rateLimit.check(key, requests, window);
}

/**
 * Validate request origin
 */
function validateOrigin(req: VercelRequest): boolean {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Allow requests without origin (direct API calls, server-to-server)
  if (!origin && !referer) {
    return true;
  }

  // Check origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check referer as fallback
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    return ALLOWED_ORIGINS.includes(refererOrigin);
  }

  return false;
}

/**
 * Set security headers
 */
function setSecurityHeaders(res: VercelResponse, origin?: string): void {
  // CORS headers
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0] || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cache control
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300"); // 1min browser, 5min edge
}

/**
 * Validate teamId format (NHL team abbreviations are 3 uppercase letters)
 */
export function validateTeamId(teamId: string): boolean {
  return /^[A-Z]{3}$/.test(teamId);
}

/**
 * Main security middleware
 */
export async function securityMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  options: SecurityOptions = {}
): Promise<{ allowed: boolean; error?: string }> {
  const {
    allowedMethods = ["GET"],
    rateLimit = "GET",
    requireOriginCheck = false,
  } = options;

  // Set security headers
  const origin = req.headers.origin;
  setSecurityHeaders(res, origin);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return { allowed: false }; // Don't continue processing
  }

  // Validate HTTP method
  if (!allowedMethods.includes(req.method || "")) {
    res.status(405).json({ error: "Method not allowed" });
    return { allowed: false, error: "Method not allowed" };
  }

  // Validate origin if required
  if (requireOriginCheck && !validateOrigin(req)) {
    res.status(403).json({ error: "Origin not allowed" });
    return { allowed: false, error: "Origin not allowed" };
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  const endpoint = req.url?.split("?")[0] || "unknown";
  const rateLimitResult = checkRateLimit(clientIP, endpoint, rateLimit);

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", RATE_LIMITS[rateLimit].requests);
  res.setHeader("X-RateLimit-Remaining", rateLimitResult.remaining);
  res.setHeader(
    "X-RateLimit-Reset",
    Date.now() + RATE_LIMITS[rateLimit].window * 1000
  );

  if (!rateLimitResult.allowed) {
    res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: RATE_LIMITS[rateLimit].window,
      message: `Too many requests. Please wait ${RATE_LIMITS[rateLimit].window} seconds before trying again.`,
    });
    return { allowed: false, error: "Rate limit exceeded" };
  }

  return { allowed: true };
}

/**
 * Error handler that doesn't leak sensitive information
 */
export function handleError(
  error: any,
  res: VercelResponse,
  context: string
): void {
  console.error(`${context}:`, error);

  // Don't expose internal error details
  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
}
