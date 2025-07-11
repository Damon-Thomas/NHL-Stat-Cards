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
  // Apply security middleware
  const securityResult = await securityMiddleware(req, res, {
    allowedMethods: ["GET"],
    rateLimit: "GET",
    requireOriginCheck: false,
  });

  if (!securityResult.allowed) {
    return; // Security middleware already sent response
  }

  try {
    const count = await redis.get<number>("player_card_count");
    res.status(200).json({ count: count ?? 0 });
  } catch (err: any) {
    console.error("Error reading count:", err.message);
    res.status(500).json({
      error: "Redis get failed",
      timestamp: new Date().toISOString(),
    });
  }
}
