// api/get-roster.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  securityMiddleware,
  handleError,
  validateTeamId,
} from "./utils/security";

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

  const teamId = req.query.teamId;

  if (!teamId || typeof teamId !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid teamId parameter" });
  }

  // Validate teamId format
  if (!validateTeamId(teamId)) {
    return res.status(400).json({ error: "Invalid teamId format" });
  }

  try {
    const response = await fetch(
      `https://api-web.nhle.com/v1/roster/${teamId}/current`
    );
    if (!response.ok) {
      throw new Error(`NHL API responded with status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    handleError(error, res, `Error fetching roster for team ${teamId}`);
  }
}
