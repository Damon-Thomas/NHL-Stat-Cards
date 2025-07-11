// /api/image-proxy.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawUrl = req.query.url;

  if (!rawUrl || typeof rawUrl !== "string") {
    return res.status(400).send("Missing image URL");
  }

  try {
    // Whitelist only NHL asset URLs
    const nhlBase = "https://assets.nhle.com/";
    const decodedUrl = decodeURIComponent(rawUrl);

    if (!decodedUrl.startsWith(nhlBase)) {
      return res.status(403).send("URL not allowed");
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
    res.status(500).send("Proxy error");
  }
}
