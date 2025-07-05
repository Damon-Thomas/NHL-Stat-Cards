import { useState, useEffect } from "react";
import type { Team, Player, PlayerCardData } from "./types";
import PlayerSelector from "./components/PlayerSelector";
import PlayerStatsForm from "./components/PlayerStatsForm";
import PlayerCard from "./components/PlayerCard";
import CardCount from "./components/CardCount";
import "./App.css";

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [cardCount, setCardCount] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
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
    setSelectedTeam(teamId);
    if (teamId) {
      fetchRoster(teamId);
    } else {
      setRoster([]);
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
    // Clear form data when selecting a new player
    clearAllValues();
    incrementCount(); // Increment count when a player card is created
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

  return (
    <div className="app">
      <div className="app-layout">
        <PlayerSelector
          teams={teams}
          selectedTeam={selectedTeam}
          roster={roster}
          selectedPlayer={selectedPlayer}
          loading={loading}
          error={error}
          onTeamSelect={handleTeamSelect}
          onPlayerSelect={handlePlayerSelect}
        />

        <CardCount count={cardCount} />

        {selectedPlayer && (
          <PlayerStatsForm
            playerCardData={playerCardData}
            naFields={naFields}
            onInputChange={handleInputChange}
            onNaToggle={handleNaToggle}
            onAutofillMaxValues={autofillMaxValues}
            onClearAllValues={clearAllValues}
          />
        )}

        <div className="card-section">
          {selectedPlayer ? (
            <PlayerCard
              player={selectedPlayer}
              selectedTeam={selectedTeam}
              teams={teams}
              playerCardData={playerCardData}
            />
          ) : (
            <div className="no-player-selected">
              <h2>Select a Player</h2>
              <p>Choose a team and click on a player to view their card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
