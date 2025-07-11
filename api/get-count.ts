import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware, handleError } from "./utils/security";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply security middleware
  const security = await securityMiddleware(req, res, {
    allowedMethods: ["GET"],
    rateLimit: "GET",
    requireOriginCheck: true,
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  try {
    const count = await redis.get<number>("player_card_count");
    res.status(200).json({ count: count ?? 0 });
  } catch (error) {
    handleError(error, res, "Error reading count from Redis");
  }
}
