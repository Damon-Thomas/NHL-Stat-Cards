import { useState, useEffect } from "react";

interface OptimisticImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * An image component that shows a placeholder/fallback image immediately
 * while loading the actual image in the background
 */
export default function OptimisticImage({
  src,
  fallbackSrc,
  alt,
  className,
  onLoad,
  onError,
}: OptimisticImageProps) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset to fallback when src changes
    setCurrentSrc(fallbackSrc);
    setIsLoading(true);

    // If src is the same as fallback, no need to load
    if (src === fallbackSrc) {
      setIsLoading(false);
      return;
    }

    // Preload the actual image
    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      // Keep the fallback image if loading fails
      setIsLoading(false);
      onError?.();
    };

    img.src = src;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc, onLoad, onError]);

  return (
    <div className="relative">
      <img src={currentSrc} alt={alt} className={className} />
      {isLoading && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
