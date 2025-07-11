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
    setCurrentSrc(fallbackSrc);
    setIsLoading(true);

    if (src === fallbackSrc) {
      setIsLoading(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setIsLoading(false);
      onError?.();
    };

    img.src = src;

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
