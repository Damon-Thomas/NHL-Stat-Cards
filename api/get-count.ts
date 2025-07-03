import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const count = await redis.get<number>("player_card_count");
    res.status(200).json({ count: count ?? 0 });
  } catch (err: any) {
    console.error("Error reading count:", err.message);
    res.status(500).json({ error: "Redis get failed" });
  }
}
