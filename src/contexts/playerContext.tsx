import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Player, Team } from "../types";

type PlayerContextType = {
  selectedPlayer: Player | null;
  setSelectedPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  selectedTeam: Team | null;
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        selectedPlayer,
        setSelectedPlayer,
        selectedTeam,
        setSelectedTeam,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
};
