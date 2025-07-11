import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware } from "./utils/security.js";
import { validateEnvVars } from "./utils/env.js";

// Validate environment variables
const env = validateEnvVars();

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply security middleware with stricter rate limiting for database operations
  const securityResult = await securityMiddleware(req, res, {
    allowedMethods: ["POST", "GET"],
    rateLimit: "INCREMENT",
    requireOriginCheck: true, // Require origin check for database modifications
  });

  if (!securityResult.allowed) {
    return; // Security middleware already sent response
  }

  try {
    const count = await redis.incr("player_card_count");
    res.status(200).json({ count });
  } catch (err: any) {
    console.error("Error incrementing count:", err.message);
    res.status(500).json({
      error: "Redis increment failed",
      timestamp: new Date().toISOString(),
    });
  }
}
