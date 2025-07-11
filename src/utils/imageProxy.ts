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

  // If it's an NHL assets URL, use our proxy
  if (originalUrl.startsWith("https://assets.nhle.com/")) {
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }

  // For security, only proxy NHL assets - reject other external URLs
  if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
    console.warn("Refusing to proxy non-NHL URL for security:", originalUrl);
    return "/default-skater.png";
  }

  // Fallback to original URL if it doesn't match any pattern
  return originalUrl;
}
