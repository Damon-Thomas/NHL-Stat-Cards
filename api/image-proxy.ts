// /api/image-proxy.ts

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

  const rawUrl = req.query.url;

  if (!rawUrl || typeof rawUrl !== "string") {
    return res.status(400).json({
      error: "Missing image URL",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Whitelist only NHL asset URLs
    const nhlBase = "https://assets.nhle.com/";
    const decodedUrl = decodeURIComponent(rawUrl);

    if (!decodedUrl.startsWith(nhlBase)) {
      return res.status(403).json({
        error: "URL not allowed",
        timestamp: new Date().toISOString(),
      });
    }

    // Additional URL validation to prevent SSRF
    try {
      const urlObj = new URL(decodedUrl);
      if (urlObj.hostname !== "assets.nhle.com") {
        return res.status(403).json({
          error: "Invalid hostname",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (urlError) {
      return res.status(400).json({
        error: "Invalid URL format",
        timestamp: new Date().toISOString(),
      });
    }

    const imageRes = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "NHL-Stat-Cards/1.0",
      },
    });
    if (!imageRes.ok) {
      return res.status(502).json({
        error: "Failed to fetch image",
        timestamp: new Date().toISOString(),
      });
    }

    const contentType =
      imageRes.headers.get("content-type") || "application/octet-stream";

    // Validate content type is an image
    if (!contentType.startsWith("image/")) {
      return res.status(400).json({
        error: "Invalid content type - not an image",
        timestamp: new Date().toISOString(),
      });
    }

    const buffer = Buffer.from(await imageRes.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=43200"
    ); // 1 day edge cache, 12h stale
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({
      error: "Proxy error",
      timestamp: new Date().toISOString(),
    });
  }
}
