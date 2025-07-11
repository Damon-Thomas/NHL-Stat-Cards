import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware } from "./utils/security";
import { validateEnvVars } from "./utils/env";

// Validate environment variables
const env = validateEnvVars();

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Apply security middleware
  const securityResult = await securityMiddleware(req, res, {
    allowedMethods: ["POST"],
    rateLimit: "INCREMENT",
    requireOriginCheck: true,
  });

  if (!securityResult.allowed) {
    return; // Security middleware already sent response
  }

  try {
    // Add fraud detection: Check if increment is too frequent from same IP
    const forwarded = req.headers["x-forwarded-for"];
    const realIP = req.headers["x-real-ip"];
    const clientIP = (
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : realIP || "unknown"
    ) as string;

    const recentKey = `recent_increment:${clientIP}`;
    const recentCount = (await redis.get<number>(recentKey)) || 0;

    if (recentCount >= 3) {
      // Max 3 increments per 5 minutes per IP
      return res.status(429).json({
        error:
          "Too many card creations. Please wait before creating another card.",
        timestamp: new Date().toISOString(),
      });
    }

    // Increment the counter
    const count = await redis.incr("player_card_count");

    // Track this increment for fraud detection
    await redis.incr(recentKey);
    await redis.expire(recentKey, 300); // 5 minutes

    res.status(200).json({ count });
  } catch (err: any) {
    console.error("Error incrementing count:", err.message);
    res.status(500).json({
      error: "Redis increment failed",
      timestamp: new Date().toISOString(),
    });
  }
};
