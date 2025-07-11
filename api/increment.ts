import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware, fraudDetection } from "./utils/security";
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
    // Get client IP for fraud detection
    const forwarded = req.headers["x-forwarded-for"];
    const realIP = req.headers["x-real-ip"];
    const clientIP = (
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : realIP || "unknown"
    ) as string;

    // Use in-memory fraud detection instead of Redis calls
    const fraudCheck = fraudDetection.check(clientIP);

    if (!fraudCheck.allowed) {
      return res.status(429).json({
        error:
          "Too many card creations. Please wait before creating another card.",
        timestamp: new Date().toISOString(),
        retryAfter: 300, // 5 minutes in seconds
      });
    }

    // Only one Redis call for the actual increment operation
    const count = await redis.incr("player_card_count");

    res.status(200).json({ count });
  } catch (err: any) {
    console.error("Error incrementing count:", err.message);
    res.status(500).json({
      error: "Redis increment failed",
      timestamp: new Date().toISOString(),
    });
  }
};
