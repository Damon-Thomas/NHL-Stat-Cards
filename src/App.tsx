// War value unfocuses on change right now, but it should not

import { useState, useEffect, useRef } from "react";
import type { Team, Player } from "./types";
import CardCount from "./components/CardCount";
import DownloadButton from "./components/DownloadButton";
import OptimisticImage from "./components/OptimisticImage";
import TeamDropdownItem from "./components/TeamDropdownItem";
import { getTeamLogoPath } from "./utils/teamLogos";
import { getProxiedImageUrl } from "./utils/imageProxy";
import "./App.css";
import { getTeamColors } from "./data/colors";
import StatBox from "./components/StatBox";

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>();
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardCount, setCardCount] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlayerDropdownOpen, setIsPlayerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const playerDropdownRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the local logo path for the selected team
  const selectedTeamLogoUrl = getTeamLogoPath(selectedTeam?.teamAbbrev.default);

  const otherStats = [
    "EV Offense",
    "EV Defense",
    "PP",
    "PK",
    "Finishing",
    "Goals",
    "1st Assists",
    "Penalties",
    "Competition",
    "Teammates",
  ];
  // Fetch all NHL teams on component mount
  useEffect(() => {
    fetchTeams();
    getCount();
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        playerDropdownRef.current &&
        !playerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPlayerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-teams");

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await response.json();
      console.log("Fetched teams:", data);
      setTeams(data.standings || []);
    } catch (err) {
      console.log(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async (teamId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/get-roster?teamId=${teamId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch roster");
      }
      const data = await response.json();
      console.log(`Fetched roster for team ${teamId}:`, data);
      // The NHL API returns different structures, let's handle both
      let players =
        data.forwards?.concat(data.defensemen || [], data.goalies || []) ||
        data.data ||
        [];

      // Sort players alphabetically by last name, then first name
      players.sort((a: Player, b: Player) => {
        const lastNameA = a.lastName?.default || "";
        const lastNameB = b.lastName?.default || "";
        const firstNameA = a.firstName?.default || "";
        const firstNameB = b.firstName?.default || "";

        if (lastNameA === lastNameB) {
          return firstNameA.localeCompare(firstNameB);
        }
        return lastNameA.localeCompare(lastNameB);
      });

      setRoster(players);
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to fetch roster"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    const currentTeam = teams.find(
      (team) => team.teamAbbrev.default === teamId
    );
    if (!currentTeam) {
      console.error("Selected team not found in teams list");
      setRoster([]);
      setSelectedTeam(null);
      return;
    }
    setSelectedTeam(currentTeam);
    setIsDropdownOpen(false); // Close dropdown after selection
    if (teamId) {
      fetchRoster(teamId);
    } else {
      setRoster([]);
    }
  };

  const handleDropdownTeamSelect = (team: Team | null) => {
    if (team) {
      handleTeamSelect(team.teamAbbrev.default);
    } else {
      setSelectedTeam(null);
      setRoster([]);
      setIsDropdownOpen(false);
    }
  };

  // Just to display it
  const getCount = async () => {
    try {
      const res = await fetch("/api/get-count");
      const json = await res.json();
      console.log("Total player cards created:", json.count);
      setCardCount(json.count);
    } catch (err) {
      console.error("Failed to fetch card count:", err);
    }
  };

  // useEffect or after card creation
  const incrementCount = async () => {
    try {
      const res = await fetch("/api/increment");
      const json = await res.json();
      console.log("New count:", json.count);
      setCardCount(json.count);
    } catch (err) {
      console.error("Failed to increment card count:", err);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setIsPlayerDropdownOpen(false); // Close dropdown after selection
    // Clear form data when selecting a new player
    incrementCount(); // Increment count when a player card is created
  };

  const handleDropdownPlayerSelect = (player: Player | null) => {
    if (player) {
      handlePlayerSelect(player);
    } else {
      setSelectedPlayer(null);
      setIsPlayerDropdownOpen(false);
    }
  };

  const PlayerCard = () => {
    function formatAge(age: string | undefined): number {
      if (!age) return 0; // Handle undefined or null age
      return new Date().getFullYear() - new Date(age).getFullYear();
    }

    function inchesToFeet(inches: number | undefined): string {
      if (inches === undefined || inches < 0) return `5'10"`; // Handle undefined or negative values
      const feet = Math.floor(inches / 12);
      const remainingInches = inches % 12;
      return `${feet}'${remainingInches}"`;
    }

    function formatHandedness(handedness: string | undefined): string {
      if (!handedness) return "Left"; // Default to left if undefined
      if (handedness === "L") {
        return "Left";
      }
      if (handedness === "R") {
        return "Right";
      }
      return "Unknown"; // Handle other cases
    }

    function formatPosition(position: string | undefined): string {
      if (!position) return "LW"; // Handle undefined or null position
      if (position === "L") {
        return "LW";
      }
      if (position === "C") {
        return "C";
      }
      if (position === "R") {
        return "RW";
      }
      if (position === "D") {
        return "D";
      }
      if (position === "G") {
        return "G";
      }
      return position; // Handle other cases
    }

    const teamColorScheme = getTeamColors(
      selectedTeam?.teamAbbrev.default ?? ""
    );

    return (
      <div
        ref={playerCardRef}
        className="w-full max-w-6xl h-fit bg-white text-black rounded-xl p-2 sm:p-4 grid gap-2 overflow-hidden"
        style={{ gridTemplateColumns: "3fr 2fr" }}
      >
        <div className="min-w-0 overflow-hidden pt-2 flex flex-col sm:gap-2 md:gap-4">
          <div className="h-8 sm:h-12 md:h-16 lg:h-18 w-full mb-1 rounded flex items-center gap-2">
            {/* Logo container with fixed size */}
            <div
              className="w-8 sm:w-12 md:w-16 lg:w-18 h-8 sm:h-12 md:h-16 lg:h-18 flex-shrink-0 rounded flex items-center justify-center relative"
              ref={dropdownRef}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full flex items-center justify-center bg-transparent border-none outline-none"
                disabled={loading}
              >
                <img
                  src={selectedTeamLogoUrl}
                  alt={
                    selectedTeam ? selectedTeam.teamName.default : "NHL Logo"
                  }
                  className="w-8 sm:w-12 md:w-16 lg:w-18 h-8 sm:h-12 md:h-16 lg:h-18 object-contain"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {/* Default NHL option */}
                  <button
                    onClick={() => handleDropdownTeamSelect(null)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 border-b border-gray-200 bg-transparent"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <img
                        src="/nhl-seeklogo.png"
                        alt="NHL Logo"
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium">Select Team</span>
                  </button>

                  {/* Team options */}
                  {teams.map((team) => (
                    <TeamDropdownItem
                      key={team.teamAbbrev.default}
                      team={team}
                      onSelect={handleDropdownTeamSelect}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Player name container with constrained space */}
            <div className="h-8 sm:h-12 md:h-16 lg:h-18 flex flex-1 flex-col items-start min-w-0">
              {/* Player Dropdown */}
              <div
                className="w-full h-8 sm:h-12 md:h-16 lg:h-18 flex flex-col relative"
                ref={playerDropdownRef}
              >
                <button
                  onClick={() => setIsPlayerDropdownOpen(!isPlayerDropdownOpen)}
                  className="w-full flex-1 text-left flex items-center bg-transparent border-none outline-none p-0 m-0"
                  disabled={loading || !selectedTeam}
                >
                  <p className="text-xs w-full sm:text-xl md:text-2xl lg:text-3xl mb-1 ml-1 font-black italic tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                    {selectedPlayer
                      ? `${selectedPlayer?.firstName.default.toUpperCase()} ${selectedPlayer?.lastName.default.toUpperCase()}`
                      : "PLAYER NAME"}
                  </p>
                </button>
                <div
                  className="h-1.5 sm:h-2 lg:h-3"
                  style={{
                    background: teamColorScheme.primary,
                    clipPath: "polygon(4px 0, 100% 0, 100% 100%, 0 100%)",
                  }}
                ></div>

                {/* Player Dropdown Menu */}
                {isPlayerDropdownOpen && selectedTeam && roster.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {/* Default player option */}
                    <button
                      onClick={() => handleDropdownPlayerSelect(null)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 border-b border-gray-200 bg-transparent"
                    >
                      <span className="text-sm font-medium">Select Player</span>
                    </button>

                    {/* Player options */}
                    {roster.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleDropdownPlayerSelect(player)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 bg-transparent border-none outline-none"
                      >
                        <span className="text-sm font-medium">
                          {player.firstName.default} {player.lastName.default}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className="h-auto w-full mb-2 grid gap-2 sm:gap-4 md:gap-6"
            style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
          >
            <div className="min-w-0">
              <OptimisticImage
                src={
                  getProxiedImageUrl(selectedPlayer?.headshot) ||
                  "/default-skater.png"
                }
                fallbackSrc="/default-skater.png"
                alt={
                  selectedPlayer
                    ? `${selectedPlayer.firstName.default} ${selectedPlayer.lastName.default}`
                    : "NHL Player"
                }
                className="w-full h-auto object-contain"
              />
            </div>
            <StatBox large={true}></StatBox>

            <div className="grid grid-rows-4 text-xs sm:text-base md:text-2xl min-w-0">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <p className="flex- ">Pos:</p>
                <p className="flex-1 font-black text-left">
                  {formatPosition(selectedPlayer?.positionCode)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <p className="flex-2 ">Age:</p>
                <p className="flex-1 font-black text-left">
                  {formatAge(selectedPlayer?.birthDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <p className="flex-2">Hnd:</p>
                <p className="flex-1 font-black text-left">
                  {formatHandedness(selectedPlayer?.shootsCatches)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-6">
                <p className="flex-2">Hgt:</p>
                <p className="flex-1 font-black text-left">
                  {inchesToFeet(selectedPlayer?.heightInInches)}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 grid-rows-2 gap-1 sm:gap-2 md:gap-6 w-full min-w-0">
            {otherStats.map((stat, index) => (
              <StatBox key={index} statName={stat} large={false} />
            ))}
          </div>
        </div>
        <div className="bg-purple-400 p-4 flex items-center justify-center min-w-0 overflow-hidden"></div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start overflow-auto ">
      <div className="fixed top-0 left-0 h-20 w-full p-2 bg-white text-black shadow-lg z-10 flex justify-around items-center">
        <CardCount count={cardCount} />
        <DownloadButton
          elementRef={playerCardRef}
          selectedPlayer={selectedPlayer}
          selectedTeam={selectedTeam || null}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        />
      </div>
      <div className="pt-24 px-1 sm:px-4 w-full flex justify-center">
        <PlayerCard />
      </div>
    </div>
  );
}

// KEEP
// implement a hidden statcar later for consistently sized and high quality pngs
{
  /* <StatCard
  name={userName}
  team={userTeam}
  stats={userStats}
  playerImage={userImage}
/>

<div
  id="hidden-card"
  style={{
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    width: '800px',
    height: '450px',
    overflow: 'hidden',
    pointerEvents: 'none',
  }}
>
  <StatCard
    name={userName}
    team={userTeam}
    stats={userStats}
    playerImage={userImage}
  />
</div> */
}

export default App;
