// api/utils/security.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiting configuration
const RATE_LIMITS = {
  GET: { requests: 60, window: 60 }, // 60 requests per minute for GET
  POST: { requests: 30, window: 60 }, // 30 requests per minute for POST
  INCREMENT: { requests: 10, window: 60 }, // 10 increments per minute
};

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.PRODUCTION_URL || null,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
].filter(Boolean) as string[];

export interface SecurityOptions {
  allowedMethods?: string[];
  rateLimit?: keyof typeof RATE_LIMITS;
  requireOriginCheck?: boolean;
}

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
 * Check rate limiting for a client
 */
async function checkRateLimit(
  clientIP: string,
  endpoint: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number }> {
  const { requests, window } = RATE_LIMITS[limitType];
  const key = `rate_limit:${endpoint}:${clientIP}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, window);
    }

    const remaining = Math.max(0, requests - current);

    return {
      allowed: current <= requests,
      remaining,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // On Redis error, allow the request but log it
    return { allowed: true, remaining: requests };
  }
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
  const rateLimitResult = await checkRateLimit(clientIP, endpoint, rateLimit);

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
