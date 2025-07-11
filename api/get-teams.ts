// api/get-teams.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware, handleError } from "./utils/security";

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
    const response = await fetch("https://api-web.nhle.com/v1/standings/now");
    if (!response.ok) {
      throw new Error(`NHL API responded with status: ${response.status}`);
    }
    const data = await response.json();

    // Sort teams alphabetically by team name
    if (data.standings && Array.isArray(data.standings)) {
      data.standings.sort((a: any, b: any) => {
        const teamA = a.teamName?.default || "";
        const teamB = b.teamName?.default || "";
        return teamA.localeCompare(teamB);
      });
    }

    res.status(200).json(data);
  } catch (error) {
    handleError(error, res, "Error fetching NHL teams");
  }
}
