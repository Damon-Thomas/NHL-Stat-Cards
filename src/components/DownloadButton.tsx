import React, { useState } from "react";
import { domToPng } from "modern-screenshot";
import type { Team, Player } from "../types";

interface DownloadButtonProps {
  elementRef: React.RefObject<HTMLElement | null>;
  selectedPlayer: Player | null;
  selectedTeam: Team | null;
  className?: string;
  children?: React.ReactNode;
}

export default function DownloadButton({
  elementRef,
  selectedPlayer,
  selectedTeam,
  className = "",
  children = "Download Card as PNG",
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!elementRef.current) {
      console.error("Element reference is null");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("Starting PNG generation with proxied images...");

      // Since images are now proxied as base64 data URLs, modern-screenshot should work without CORS issues
      const dataUrl = await domToPng(elementRef.current, {
        quality: 1,
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      // Create download link
      const playerName = selectedPlayer
        ? `${selectedPlayer.firstName.default}_${selectedPlayer.lastName.default}`
        : "NHL_Player";

      const teamName = selectedTeam
        ? `_${selectedTeam.teamAbbrev.default}`
        : "";

      const link = document.createElement("a");
      link.download = `${playerName}${teamName}_Card.png`;
      link.href = dataUrl;
      link.click();

      console.log("PNG download completed successfully!");
    } catch (error) {
      console.error("Error generating PNG:", error);
      alert("Failed to generate PNG. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`px-6 py-2 rounded font-medium transition-colors ${
        isGenerating
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      } text-white ${className}`}
    >
      {isGenerating ? "Generating PNG..." : children}
    </button>
  );
}
