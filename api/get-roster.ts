// api/get-roster.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware } from "./utils/security";

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

  const teamId = req.query.teamId;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({
      error: "Missing or invalid teamId parameter",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const response = await fetch(
      `https://api-web.nhle.com/v1/roster/${teamId}/current`
    );
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err: any) {
    console.error(`Error fetching roster for team ${teamId}:`, err.message);
    res.status(500).json({
      error: "Failed to fetch team roster",
      timestamp: new Date().toISOString(),
    });
  }
}
