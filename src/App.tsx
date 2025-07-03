import { useState, useEffect } from "react";
import "./App.css";

interface Team {
  clinchIndicator?: string;
  conferenceAbbrev: string;
  conferenceHomeSequence: number;
  conferenceL10Sequence: number;
  conferenceName: string;
  conferenceRoadSequence: number;
  conferenceSequence: number;
  date: string;
  divisionAbbrev: string;
  divisionHomeSequence: number;
  divisionL10Sequence: number;
  divisionName: string;
  divisionRoadSequence: number;
  divisionSequence: number;
  gameTypeId: number;
  gamesPlayed: number;
  goalDifferential: number;
  goalDifferentialPctg: number;
  goalAgainst: number;
  goalFor: number;
  goalsForPctg: number;
  homeGamesPlayed: number;
  homeGoalDifferential: number;
  homeGoalsAgainst: number;
  homeGoalsFor: number;
  homeLosses: number;
  homeOtLosses: number;
  homePoints: number;
  homeRegulationPlusOtWins: number;
  homeRegulationWins: number;
  homeTies: number;
  homeWins: number;
  l10GamesPlayed: number;
  l10GoalDifferential: number;
  l10GoalsAgainst: number;
  l10GoalsFor: number;
  l10Losses: number;
  l10OtLosses: number;
  l10Points: number;
  l10RegulationPlusOtWins: number;
  l10RegulationWins: number;
  l10Ties: number;
  l10Wins: number;
  leagueHomeSequence: number;
  leagueL10Sequence: number;
  leagueRoadSequence: number;
  leagueSequence: number;
  losses: number;
  otLosses: number;
  placeName: {
    default: string;
  };
  pointPctg: number;
  points: number;
  regulationPlusOtWinPctg: number;
  regulationPlusOtWins: number;
  regulationWinPctg: number;
  regulationWins: number;
  roadGamesPlayed: number;
  roadGoalDifferential: number;
  roadGoalsAgainst: number;
  roadGoalsFor: number;
  roadLosses: number;
  roadOtLosses: number;
  roadPoints: number;
  roadRegulationPlusOtWins: number;
  roadRegulationWins: number;
  roadTies: number;
  roadWins: number;
  seasonId: number;
  shootoutLosses: number;
  shootoutWins: number;
  streakCode: string;
  streakCount: number;
  teamName: {
    default: string;
    fr?: string;
  };
  teamCommonName: {
    default: string;
  };
  teamAbbrev: {
    default: string;
  };
  teamLogo: string;
  ties: number;
  waiversSequence: number;
  wildcardSequence: number;
  winPctg: number;
  wins: number;
}

interface Player {
  id: number;
  firstName: {
    default: string;
  };
  lastName: {
    default: string;
  };
  sweaterNumber: number;
  positionCode: string;
  shootsCatches: string;
  heightInInches: number;
  weightInPounds: number;
  birthDate: string;
  birthCity: {
    default: string;
  };
  birthCountry: string;
}

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch all NHL teams on component mount
  useEffect(() => {
    fetchTeams();
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

  return (
    <div className="app">
      <h1>NHL Stat Cards</h1>

      {error && <div className="error">Error: {error}</div>}

      <div className="team-selector">
        <label htmlFor="team-select">Select a Team:</label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={(e) => handleTeamSelect(e.target.value)}
          disabled={loading}
        >
          <option value="">Choose a team...</option>
          {teams.map((team) => (
            <option
              key={team.teamAbbrev.default}
              value={team.teamAbbrev.default}
            >
              {team.teamName.default}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {roster.length > 0 && (
        <div className="roster">
          <h2>
            Roster for{" "}
            {
              teams.find((t) => t.teamAbbrev.default === selectedTeam)?.teamName
                .default
            }
          </h2>
          <div className="players-list">
            {roster.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-name">
                  {player.firstName.default} {player.lastName.default}
                </span>
                <span className="player-details">
                  #{player.sweaterNumber} • {player.positionCode}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
