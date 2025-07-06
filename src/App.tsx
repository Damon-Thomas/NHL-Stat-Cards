import { useState, useEffect, useRef } from "react";
import type { Team, Player, PlayerCardData } from "./types";
import CardCount from "./components/CardCount";
import DownloadButton from "./components/DownloadButton";
import "./App.css";
import { DEFAULT_TEAM_COLORS, getTeamColors } from "./data/colors";

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>();
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [cardCount, setCardCount] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlayerDropdownOpen, setIsPlayerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const playerDropdownRef = useRef<HTMLDivElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const [playerCardData, setPlayerCardData] = useState<PlayerCardData>({
    projWAR: "",
    evOffence: "",
    evDefence: "",
    pp: "",
    pk: "",
    finishing: "",
    goals: "",
    firstAssists: "",
    penalties: "",
    competition: "",
    teammates: "",
    warPercentileRankYr1: "",
    warPercentileRankYr2: "",
    warPercentileRankYr3: "",
    offenseYr1: "",
    offenseYr2: "",
    offenseYr3: "",
    defenseYr1: "",
    defenseYr2: "",
    defenseYr3: "",
    finishingYr1: "",
    finishingYr2: "",
    finishingYr3: "",
  });

  // State to track which fields are set to NA
  const [naFields, setNaFields] = useState<
    Record<keyof PlayerCardData, boolean>
  >({
    projWAR: false,
    evOffence: false,
    evDefence: false,
    pp: false,
    pk: false,
    finishing: false,
    goals: false,
    firstAssists: false,
    penalties: false,
    competition: false,
    teammates: false,
    warPercentileRankYr1: false,
    warPercentileRankYr2: false,
    warPercentileRankYr3: false,
    offenseYr1: false,
    offenseYr2: false,
    offenseYr3: false,
    defenseYr1: false,
    defenseYr2: false,
    defenseYr3: false,
    finishingYr1: false,
    finishingYr2: false,
    finishingYr3: false,
  });

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
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async (teamId: string) => {
    try {
      setLoading(true);
      setError("");
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
      setError(err instanceof Error ? err.message : "Failed to fetch roster");
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
    clearAllValues();
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

  const handleInputChange = (field: keyof PlayerCardData, value: string) => {
    setPlayerCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle NA checkbox changes
  const handleNaToggle = (field: keyof PlayerCardData) => {
    setNaFields((prev) => {
      const newNaFields = { ...prev, [field]: !prev[field] };

      // If NA is checked, set the field value to "N/A", otherwise clear it
      if (newNaFields[field]) {
        setPlayerCardData((prevData) => ({
          ...prevData,
          [field]: "N/A",
        }));
      } else {
        setPlayerCardData((prevData) => ({
          ...prevData,
          [field]: "",
        }));
      }

      return newNaFields;
    });
  };

  // Autofill all fields with max value (99)
  const autofillMaxValues = () => {
    const maxValues: PlayerCardData = {
      projWAR: "99",
      evOffence: "99",
      evDefence: "99",
      pp: "99",
      pk: "99",
      finishing: "99",
      goals: "99",
      firstAssists: "99",
      penalties: "99",
      competition: "99",
      teammates: "99",
      warPercentileRankYr1: "99",
      warPercentileRankYr2: "99",
      warPercentileRankYr3: "99",
      offenseYr1: "99",
      offenseYr2: "99",
      offenseYr3: "99",
      defenseYr1: "99",
      defenseYr2: "99",
      defenseYr3: "99",
      finishingYr1: "99",
      finishingYr2: "99",
      finishingYr3: "99",
    };

    setPlayerCardData(maxValues);
    // Clear all NA flags when autofilling
    setNaFields({
      projWAR: false,
      evOffence: false,
      evDefence: false,
      pp: false,
      pk: false,
      finishing: false,
      goals: false,
      firstAssists: false,
      penalties: false,
      competition: false,
      teammates: false,
      warPercentileRankYr1: false,
      warPercentileRankYr2: false,
      warPercentileRankYr3: false,
      offenseYr1: false,
      offenseYr2: false,
      offenseYr3: false,
      defenseYr1: false,
      defenseYr2: false,
      defenseYr3: false,
      finishingYr1: false,
      finishingYr2: false,
      finishingYr3: false,
    });
  };

  // Clear all form data
  const clearAllValues = () => {
    setPlayerCardData({
      projWAR: "",
      evOffence: "",
      evDefence: "",
      pp: "",
      pk: "",
      finishing: "",
      goals: "",
      firstAssists: "",
      penalties: "",
      competition: "",
      teammates: "",
      warPercentileRankYr1: "",
      warPercentileRankYr2: "",
      warPercentileRankYr3: "",
      offenseYr1: "",
      offenseYr2: "",
      offenseYr3: "",
      defenseYr1: "",
      defenseYr2: "",
      defenseYr3: "",
      finishingYr1: "",
      finishingYr2: "",
      finishingYr3: "",
    });

    setNaFields({
      projWAR: false,
      evOffence: false,
      evDefence: false,
      pp: false,
      pk: false,
      finishing: false,
      goals: false,
      firstAssists: false,
      penalties: false,
      competition: false,
      teammates: false,
      warPercentileRankYr1: false,
      warPercentileRankYr2: false,
      warPercentileRankYr3: false,
      offenseYr1: false,
      offenseYr2: false,
      offenseYr3: false,
      defenseYr1: false,
      defenseYr2: false,
      defenseYr3: false,
      finishingYr1: false,
      finishingYr2: false,
      finishingYr3: false,
    });
  };

  const PlayerCard = () => {
    let heightFeet = 0;
    let heightInches = 0;
    let age = 0;
    let selectedTeamInfo: Team | null = null;
    let teamColorScheme = DEFAULT_TEAM_COLORS;
    if (selectedPlayer && selectedTeam) {
      heightFeet = Math.floor(selectedPlayer.heightInInches / 12);
      heightInches = selectedPlayer.heightInInches % 12;
      age =
        new Date().getFullYear() -
        new Date(selectedPlayer.birthDate).getFullYear();

      // Get team colors
      teamColorScheme = getTeamColors(selectedTeam?.teamAbbrev.default ?? "");

      // Get team info
      selectedTeamInfo = selectedTeam;
    }
    return (
      <div
        ref={playerCardRef}
        className=" w-full aspect-[3/2] m-2 bg-white text-black rounded-xl p-2 grid grid-cols-[3fr_2fr] gap-2 overflow-hidden"
      >
        <div className="">
          <div className="h-12 w-full mb-1 rounded flex items-center">
            <div
              className="w-10 h-10 rounded flex items-center justify-center relative"
              ref={dropdownRef}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-full flex items-center justify-center bg-transparent border-none outline-none"
                disabled={loading}
              >
                <img
                  src={selectedTeam?.teamLogo || "/nhl-seeklogo.png"}
                  alt={
                    selectedTeam ? selectedTeam.teamName.default : "NHL Logo"
                  }
                  className={
                    selectedTeam
                      ? "w-full h-full object-contain"
                      : "w-8 h-8 object-contain"
                  }
                  onError={(e) => {
                    console.log("Team logo failed to load");
                    // Try alternative URL for fallback
                    e.currentTarget.src =
                      "https://assets.nhle.com/logos/nhl/svg/nhl-logo.svg";
                    e.currentTarget.className = "w-8 h-8 object-contain";
                    e.currentTarget.onerror = () => {
                      // Final fallback to text
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="text-gray-600 text-xs font-bold">NHL</div>
                      `;
                    };
                  }}
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
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://assets.nhle.com/logos/nhl/svg/nhl-logo.svg";
                          e.currentTarget.className = "w-4 h-4 object-contain";
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">Select Team</span>
                  </button>

                  {/* Team options */}
                  {teams.map((team) => (
                    <button
                      key={team.teamAbbrev.default}
                      onClick={() => handleDropdownTeamSelect(team)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 bg-transparent border-none outline-none"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img
                          src={team.teamLogo}
                          alt={team.teamName.default}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {team.teamName.default}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-6 flex flex-1 flex-col items-start">
              {/* Player Dropdown */}
              <div className="w-full relative" ref={playerDropdownRef}>
                <button
                  onClick={() => setIsPlayerDropdownOpen(!isPlayerDropdownOpen)}
                  className="w-full text-left bg-transparent border-none outline-none p-0 m-0"
                  disabled={loading || !selectedTeam}
                >
                  <p className="text-lg mb-1 font-black italic ml-2 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                    {selectedPlayer
                      ? `${selectedPlayer?.firstName.default} ${selectedPlayer?.lastName.default}`
                      : "PLAYER NAME"}
                  </p>
                </button>

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
              <div
                className="h-2 ml-1 w-full"
                style={{
                  background: teamColorScheme.primary,
                  clipPath: "polygon(4px 0, 100% 0, 100% 100%, 0 100%)",
                }}
              ></div>
            </div>
          </div>
          <div className="h-6 bg-gray-300 w-3/4 mb-2 rounded"></div>
          <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
        </div>
        <div className="bg-purple-400 p-4 flex items-center justify-center"></div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-start overflow-auto pt-24 px-2 sm:px-4">
      <div className="fixed top-0 left-0 h-20 w-screen p-2 bg-white text-black shadow-lg z-10 flex justify-around items-center">
        <CardCount count={cardCount} />
        <DownloadButton
          elementRef={playerCardRef}
          player={
            selectedPlayer
              ? {
                  firstName: selectedPlayer.firstName.default,
                  lastName: selectedPlayer.lastName.default,
                }
              : null
          }
          teamName={selectedTeam?.teamName.default}
          options={{
            scale: 3,
            quality: 1.0,
            backgroundColor: "#ffffff",
          }}
          className=" px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        />
      </div>
      <PlayerCard />
    </div>
  );
}

export default App;
