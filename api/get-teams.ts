// api/get-teams.ts
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

  try {
    const response = await fetch("https://api-web.nhle.com/v1/standings/now");
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
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
  } catch (err: any) {
    console.error("Error fetching NHL teams:", err.message);
    res.status(500).json({
      error: "Failed to fetch NHL teams",
      timestamp: new Date().toISOString(),
    });
  }
}
