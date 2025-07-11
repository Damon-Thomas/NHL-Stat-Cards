import { Analytics } from "@vercel/analytics/next";
import { useState, useEffect } from "react";
import CardCount from "./components/CardCount";
import DownloadButton from "./components/DownloadButton";
import PlayerCard from "./components/PlayerCard";
import HelpModal from "./components/HelpModal";
import "./App.css";
import { StatProvider } from "./contexts/statContext";
import { GraphProvider } from "./contexts/graphContext";
import { PlayerProvider, usePlayerContext } from "./contexts/playerContext";

function App() {
  return (
    <PlayerProvider>
      <StatProvider>
        <GraphProvider>
          <AppContent />
        </GraphProvider>
      </StatProvider>
    </PlayerProvider>
  );
}

function AppContent() {
  const { selectedPlayer, selectedTeam } = usePlayerContext();
  const [cardCount, setCardCount] = useState<number>(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Check if user has seen help modal before
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("nhl-stat-cards-help-seen");
    if (!hasSeenHelp) {
      setIsHelpModalOpen(true);
    }
  }, []);

  useEffect(() => {
    getCount();
  }, []);

  const getCount = async () => {
    try {
      const res = await fetch("/api/get-count");
      const json = await res.json();
      setCardCount(json.count);
    } catch (err) {
      console.error("Failed to fetch card count:", err);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start overflow-auto ">
      <div className="fixed top-0 left-0 h-20 w-full p-2 bg-white text-black shadow-lg z-10 flex justify-center items-center">
        <div className="w-full max-w-6xl flex justify-between items-center px-2">
          <CardCount count={cardCount} />
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="px-2 py-2 sm:px-4 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-1 sm:gap-2"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">Help</span>
            </button>
            <DownloadButton
              selectedPlayer={selectedPlayer}
              selectedTeam={selectedTeam || null}
              className="px-3 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              <span className="sm:hidden">Download</span>
              <span className="hidden sm:inline">Download Card</span>
            </DownloadButton>
          </div>
        </div>
      </div>
      <div className="pt-24 px-1 sm:px-4 w-full flex justify-center">
        <PlayerCard />
      </div>
      {/* Background for hidden card */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 1152,
          height: 626.398,
          backgroundColor: "#242424",
          zIndex: -98,
          pointerEvents: "none",
        }}
      />
      <div
        id="hidden-card"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 1,
          zIndex: -99,
          pointerEvents: "none",
          width: 1152,
          height: 626.398,
        }}
      >
        <PlayerCard fixed={true} />
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => {
          localStorage.setItem("nhl-stat-cards-help-seen", "true");
          setIsHelpModalOpen(false);
        }}
      />
      <Analytics />
    </div>
  );
}

export default App;
