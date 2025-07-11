// api/get-roster.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const teamId = req.query.teamId;

  if (!teamId || typeof teamId !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid teamId parameter" });
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
    res.status(500).json({ error: "Failed to fetch team roster" });
  }
}
