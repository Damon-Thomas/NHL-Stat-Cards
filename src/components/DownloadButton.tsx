import React, { useState } from "react";
import { domToPng } from "modern-screenshot";
import type { Team, Player } from "../types";

interface DownloadButtonProps {
  selectedPlayer: Player | null;
  selectedTeam: Team | null;
  className?: string;
  children?: React.ReactNode;
}

export default function DownloadButton({
  selectedPlayer,
  selectedTeam,
  className = "",
  children = "Download Card as PNG",
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const hiddenCard = document.getElementById("hidden-card");
    if (!hiddenCard) {
      console.error("Hidden card element not found");
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await domToPng(hiddenCard, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        scale: 2,
        width: 1152,
        height: 626.398,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

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
