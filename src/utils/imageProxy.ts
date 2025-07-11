/**
 * Utility to get proxied image URLs to handle CORS issues
 */
export function getProxiedImageUrl(originalUrl: string | undefined): string {
  if (!originalUrl) {
    return "/default-skater.png";
  }

  // If it's already a local image, return as is
  if (
    originalUrl.startsWith("/") ||
    originalUrl.startsWith("http://localhost") ||
    originalUrl.startsWith("https://localhost")
  ) {
    return originalUrl;
  }

  if (originalUrl.startsWith("https://assets.nhle.com/")) {
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }

  if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
    console.warn("Refusing to proxy non-NHL URL for security:", originalUrl);
    return "/default-skater.png";
  }

  return originalUrl;
}
