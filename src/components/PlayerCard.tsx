import { useRef, useState, useEffect } from "react";
import type { Team, Player } from "../types";
import OptimisticImage from "./OptimisticImage";
import StatBox from "./StatBox";
import LineGraph from "./LineGraph";
import TeamDropdownItem from "./TeamDropdownItem";
import { getTeamLogoPath } from "../utils/teamLogos";
import { getProxiedImageUrl } from "../utils/imageProxy";
import { getTeamColors } from "../data/colors";
import { usePlayerContext } from "../contexts/playerContext";

interface PlayerCardProps {
  fixed?: boolean;
}

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

export default function PlayerCard({ fixed = false }: PlayerCardProps) {
  const { selectedPlayer, setSelectedPlayer, selectedTeam, setSelectedTeam } =
    usePlayerContext();

  // Internal state for data and UI
  const [teams, setTeams] = useState<Team[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlayerDropdownOpen, setIsPlayerDropdownOpen] = useState(false);

  // Refs for dropdown management
  const dropdownRef = useRef<HTMLDivElement>(null);
  const playerDropdownRef = useRef<HTMLDivElement>(null);

  // Get the local logo path for the selected team
  const selectedTeamLogoUrl = getTeamLogoPath(selectedTeam?.teamAbbrev.default);

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

  const teamColorScheme = getTeamColors(selectedTeam?.teamAbbrev.default ?? "");

  // Fetch teams on mount (only if not fixed)
  useEffect(() => {
    if (!fixed) {
      fetchTeams();
    }
  }, [fixed]);

  // Handle clicks outside dropdown (only if not fixed)
  useEffect(() => {
    if (fixed) return;

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
    };
  }, [fixed]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-teams");

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await response.json();
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
    // Ensure teams is available before trying to find
    if (!teams || teams.length === 0) {
      console.warn("Teams not loaded yet");
      return;
    }
    
    const currentTeam = teams.find(
      (team) => team.teamAbbrev.default === teamId
    );

    if (!currentTeam) {
      setRoster([]);
      setSelectedTeam(null);
      return;
    }

    setSelectedTeam(currentTeam);
    setIsDropdownOpen(false);

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

  const incrementCount = async () => {
    try {
      const res = await fetch("/api/increment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to increment card count:", err);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setIsPlayerDropdownOpen(false);
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

  return (
    <div
      className={`bg-white text-black rounded-xl grid gap-2 overflow-hidden ${
        fixed ? "w-[1152px] p-4" : "w-full max-w-6xl p-2 sm:p-4"
      }`}
      style={{
        gridTemplateColumns: "3fr 2fr",
        ...(fixed && { height: "626.398px" }),
      }}
    >
      <div
        className={`min-w-0 overflow-hidden pt-2 flex flex-col ${
          fixed ? "gap-4" : "sm:gap-2 md:gap-4"
        }`}
      >
        <div
          className={`w-full mb-1 rounded flex items-center gap-2 ${
            fixed ? "h-16" : "h-8 sm:h-12 md:h-16 lg:h-18"
          }`}
        >
          {/* Logo container with fixed size */}
          <div
            className={`flex-shrink-0 rounded flex items-center justify-center relative ${
              fixed
                ? "w-16 h-16"
                : "w-8 sm:w-12 md:w-16 lg:w-18 h-8 sm:h-12 md:h-16 lg:h-18"
            }`}
            ref={fixed ? null : dropdownRef}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full h-full flex relative items-center justify-center bg-transparent border-none rounded-md transition-colors outline-none ${
                !fixed ? "hover:bg-gray-300" : ""
              }`}
              disabled={loading}
            >
              <img
                src={selectedTeamLogoUrl}
                alt={selectedTeam ? selectedTeam.teamName.default : "NHL Logo"}
                className={
                  fixed
                    ? "w-16 h-16 object-contain"
                    : "w-8 sm:w-12 md:w-16 lg:w-18 h-8 sm:h-12 md:h-16 lg:h-18 object-contain"
                }
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && !fixed && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {/* Default NHL option */}
                <button
                  onClick={() => handleDropdownTeamSelect(null)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 border-b border-gray-200 bg-transparent `}
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
                {teams && teams.length > 0 && teams.map((team) => (
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
          <div
            className={`flex flex-1 flex-col items-start min-w-0 rounded-t-md ${
              fixed ? "h-16" : "h-8 sm:h-12 md:h-16 lg:h-18"
            } ${fixed ? "" : !roster || roster.length === 0 ? "" : "hover:bg-gray-300"}`}
          >
            {/* Player Dropdown */}
            <div
              className={`w-full flex flex-col relative ${
                fixed ? "h-16" : "h-8 sm:h-12 md:h-16 lg:h-18"
              }`}
              ref={fixed ? null : playerDropdownRef}
            >
              <button
                onClick={() => setIsPlayerDropdownOpen(!isPlayerDropdownOpen)}
                className="w-full flex-1 text-left flex items-center bg-transparent border-none outline-none p-0 m-0"
                disabled={loading || !selectedTeam}
              >
                <p
                  className={`w-full mb-1 ml-1 font-black italic tracking-wider whitespace-nowrap overflow-hidden text-ellipsis ${
                    fixed
                      ? "text-3xl"
                      : "text-xs sm:text-xl md:text-2xl lg:text-3xl"
                  }`}
                >
                  {selectedPlayer
                    ? `${selectedPlayer?.firstName.default.toUpperCase()} ${selectedPlayer?.lastName.default.toUpperCase()}`
                    : "PLAYER NAME"}
                </p>
              </button>
              <div
                className={fixed ? "h-3" : "h-1.5 sm:h-2 lg:h-3"}
                style={{
                  background: teamColorScheme.primary,
                  clipPath: "polygon(4px 0, 100% 0, 100% 100%, 0 100%)",
                }}
              ></div>

              {/* Player Dropdown Menu */}
              {isPlayerDropdownOpen && selectedTeam && roster && roster.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {/* Default player option */}
                  <button
                    onClick={() => handleDropdownPlayerSelect(null)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 border-b border-gray-200 bg-transparent"
                  >
                    <span className="text-sm font-medium">Select Player</span>
                  </button>

                  {/* Player options */}
                  {roster && roster.length > 0 && roster.map((player) => (
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
          className={`h-auto w-full mb-2 grid ${
            fixed ? "gap-6" : "gap-2 sm:gap-4 md:gap-6"
          }`}
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
          <StatBox large={true} editable={!fixed}></StatBox>

          <div
            className={`grid grid-rows-4 min-w-0 ${
              fixed ? "text-2xl" : "text-xs sm:text-base md:text-2xl"
            }`}
          >
            <div
              className={`flex items-center justify-center ${
                fixed ? "gap-4" : "gap-2 sm:gap-4"
              }`}
            >
              <p className="flex- ">Pos:</p>
              <p className="flex-1 font-black text-left">
                {formatPosition(selectedPlayer?.positionCode)}
              </p>
            </div>
            <div
              className={`flex items-center ${
                fixed ? "gap-4" : "gap-2 sm:gap-4"
              }`}
            >
              <p className="flex-2 ">Age:</p>
              <p className="flex-1 font-black text-left">
                {formatAge(selectedPlayer?.birthDate)}
              </p>
            </div>
            <div
              className={`flex items-center ${
                fixed ? "gap-4" : "gap-2 sm:gap-4"
              }`}
            >
              <p className="flex-2">Hnd:</p>
              <p className="flex-1 font-black text-left">
                {formatHandedness(selectedPlayer?.shootsCatches)}
              </p>
            </div>
            <div
              className={`flex items-center ${
                fixed ? "gap-6" : "gap-2 sm:gap-6"
              }`}
            >
              <p className="flex-2">Hgt:</p>
              <p className="flex-1 font-black text-left">
                {inchesToFeet(selectedPlayer?.heightInInches)}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`grid grid-cols-5 grid-rows-2 w-full min-w-0 ${
            fixed ? "gap-6" : "gap-1 sm:gap-2 md:gap-6"
          }`}
        >
          {otherStats.map((stat, index) => (
            <StatBox
              key={index}
              statName={stat}
              editable={!fixed}
              large={false}
            />
          ))}
        </div>
      </div>
      <div
        className={`flex flex-col items-center justify-around w-full h-full ${
          fixed ? "pl-4" : "pl-2 sm:pl-4"
        }`}
      >
        <div className="flex flex-col w-full">
          <p
            className={`font-black mt-4 ${
              fixed ? "text-2xl" : "text-xs sm:text-xl md:text-2xl"
            }`}
          >
            WAR Percentile Rank
          </p>
          <div className="w-full" style={{ minHeight: 0 }}>
            <LineGraph showAll={false} />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <p
            className={`font-black mt-4 ${
              fixed ? "text-2xl" : "text-xs sm:text-xl md:text-2xl"
            }`}
          >
            <span className="text-[#273044]">Offense</span> vs{" "}
            <span className="text-[#E34C5B]">Defense</span> vs{" "}
            <span className="text-[#5DB4F9]">Finishing</span>
          </p>
          <div className="w-full" style={{ minHeight: 0 }}>
            <LineGraph showAll={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
