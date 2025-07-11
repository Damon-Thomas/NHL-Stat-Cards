// api/get-roster.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware, validateTeamId } from "./utils/security.js";

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
    return res
      .status(400)
      .json({ error: "Missing or invalid teamId parameter" });
  }

  // Validate teamId format
  if (!validateTeamId(teamId)) {
    return res
      .status(400)
      .json({ error: "Invalid teamId format. Must be 3 uppercase letters." });
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
