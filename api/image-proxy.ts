// /api/image-proxy.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { securityMiddleware } from "./utils/security";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply security middleware
  const security = await securityMiddleware(req, res, {
    allowedMethods: ["GET"],
    rateLimit: "GET",
    requireOriginCheck: false, // Allow image proxy for all origins
  });

  if (!security.allowed) {
    return; // Response already sent by middleware
  }

  const rawUrl = req.query.url;

  if (!rawUrl || typeof rawUrl !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid image URL parameter" });
  }

  try {
    // Whitelist only NHL asset URLs for security
    const allowedBases = [
      "https://assets.nhle.com/",
      "https://cms.nhl.bamgrid.com/",
    ];

    const decodedUrl = decodeURIComponent(rawUrl);

    const isAllowed = allowedBases.some((base) => decodedUrl.startsWith(base));
    if (!isAllowed) {
      return res.status(403).json({ error: "URL not allowed" });
    }

    const imageRes = await fetch(decodedUrl);
    if (!imageRes.ok) {
      return res.status(502).send("Failed to fetch image");
    }

    const contentType =
      imageRes.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await imageRes.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=43200"
    ); // 1 day edge cache, 12h stale
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({ error: "Failed to proxy image" });
  }
}
