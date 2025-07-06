import React, { useState } from "react";
import {
  usePNGDownload,
  type PlayerInfo,
  type DownloadOptions,
} from "../utils/pngDownloader";

interface DownloadButtonProps {
  elementRef: React.RefObject<HTMLElement | null>;
  player?: PlayerInfo | null;
  teamName?: string;
  options?: DownloadOptions;
  className?: string;
  children?: React.ReactNode;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  elementRef,
  player,
  teamName,
  options = {},
  className = "",
  children,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { downloadAsPNG } = usePNGDownload();

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadAsPNG(elementRef, player, teamName, options);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PNG. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const defaultClassName = `
    px-6 py-3 rounded-lg font-medium transition-colors duration-200
    ${
      isDownloading
        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
    }
  `;

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className || defaultClassName}
    >
      {children ||
        (isDownloading ? "Generating PNG..." : "Download Card as PNG")}
    </button>
  );
};

export default DownloadButton;
