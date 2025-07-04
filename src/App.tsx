import { useState, useEffect } from "react";
import "./App.css";

// Default team colors for fallback
const DEFAULT_TEAM_COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#ffffff",
};

// NHL Team Colors
const teamColors: Record<
  string,
  { primary: string; secondary: string; accent: string }
> = {
  ANA: { primary: "#F47A38", secondary: "#B09862", accent: "#C1C6C8" },
  ARI: { primary: "#8C2633", secondary: "#E2D6B5", accent: "#111111" },
  BOS: { primary: "#FFB81C", secondary: "#000000", accent: "#FFFFFF" },
  BUF: { primary: "#003087", secondary: "#FFB81C", accent: "#C8102E" },
  CGY: { primary: "#C8102E", secondary: "#F1BE48", accent: "#000000" },
  CAR: { primary: "#CC0000", secondary: "#000000", accent: "#A2AAAD" },
  CHI: { primary: "#CF0A2C", secondary: "#000000", accent: "#FFFFFF" },
  COL: { primary: "#6F263D", secondary: "#236192", accent: "#A2AAAD" },
  CBJ: { primary: "#002654", secondary: "#CE1126", accent: "#A4A9AD" },
  DAL: { primary: "#006847", secondary: "#8F8F8C", accent: "#000000" },
  DET: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#000000" },
  EDM: { primary: "#041E42", secondary: "#FF4C00", accent: "#FFFFFF" },
  FLA: { primary: "#041E42", secondary: "#C8102E", accent: "#B9975B" },
  LAK: { primary: "#111111", secondary: "#A2AAAD", accent: "#FFFFFF" },
  MIN: { primary: "#154734", secondary: "#A6192E", accent: "#EAAA00" },
  MTL: { primary: "#AF1E2D", secondary: "#192168", accent: "#FFFFFF" },
  NSH: { primary: "#FFB81C", secondary: "#041E42", accent: "#FFFFFF" },
  NJD: { primary: "#CE1126", secondary: "#000000", accent: "#FFFFFF" },
  NYI: { primary: "#00539B", secondary: "#F47D30", accent: "#FFFFFF" },
  NYR: { primary: "#0038A8", secondary: "#CE1126", accent: "#FFFFFF" },
  OTT: { primary: "#C52032", secondary: "#000000", accent: "#CBA044" },
  PHI: { primary: "#F74902", secondary: "#000000", accent: "#FFFFFF" },
  PIT: { primary: "#000000", secondary: "#CFC493", accent: "#FFFFFF" },
  SJS: { primary: "#006D75", secondary: "#EA7200", accent: "#000000" },
  SEA: { primary: "#99D9D9", secondary: "#001628", accent: "#68A8B3" },
  STL: { primary: "#002F87", secondary: "#FCB514", accent: "#FFFFFF" },
  TBL: { primary: "#002868", secondary: "#FFFFFF", accent: "#000000" },
  TOR: { primary: "#003E7E", secondary: "#FFFFFF", accent: "#000000" },
  VAN: { primary: "#001F5B", secondary: "#00843D", accent: "#FFFFFF" },
  VGK: { primary: "#B4975A", secondary: "#333F42", accent: "#000000" },
  WSH: { primary: "#C8102E", secondary: "#041E42", accent: "#FFFFFF" },
  WPG: { primary: "#041E42", secondary: "#004C97", accent: "#AC162C" },
  UTA: { primary: "#69B3E7", secondary: "#000000", accent: "#FFFFFF" },
};

// Helper function to get team colors with fallback
const getTeamColors = (teamAbbrev: string) => {
  return teamColors[teamAbbrev] || DEFAULT_TEAM_COLORS;
};

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
  headshot: string;
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

interface PlayerCardData {
  projWAR: string;
  evOffence: string;
  evDefence: string;
  pp: string;
  pk: string;
  finishing: string;
  goals: string;
  firstAssists: string;
  penalties: string;
  competition: string;
  teammates: string;
  warPercentileRankYr1: string;
  warPercentileRankYr2: string;
  warPercentileRankYr3: string;
  offenseYr1: string;
  offenseYr2: string;
  offenseYr3: string;
  defenseYr1: string;
  defenseYr2: string;
  defenseYr3: string;
  finishingYr1: string;
  finishingYr2: string;
  finishingYr3: string;
}

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

  // Input validation function
  const validateInput = (value: string): boolean => {
    // Allow empty string
    if (value === "") return true;

    // Allow "N/A" (case insensitive)
    if (value.toUpperCase() === "N/A") return true;

    // Check if it's a valid number between 0 and 99
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 99) {
      return true;
    }

    return false;
  };

  const handleInputChange = (field: keyof PlayerCardData, value: string) => {
    if (validateInput(value)) {
      setPlayerCardData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
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

  // Helper component for form fields with NA checkbox (for specific fields only)
  const FormFieldWithNA = ({
    label,
    field,
    value,
    isNA,
  }: {
    label: string;
    field: keyof PlayerCardData;
    value: string;
    isNA: boolean;
  }) => (
    <label className="form-field">
      {label}:
      <div className="input-group">
        <label className="na-checkbox">
          <input
            type="checkbox"
            checked={isNA}
            onChange={() => handleNaToggle(field)}
          />
          N/A
        </label>
        {!isNA && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder="0-99"
            style={{ color: "#333" }}
          />
        )}
        {isNA && <span className="na-display">N/A</span>}
      </div>
    </label>
  );

  // Helper component for regular form fields (no NA checkbox)
  const FormField = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof PlayerCardData;
    value: string;
  }) => (
    <label className="form-field">
      {label}:
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder="0-99"
        style={{ color: "#333" }}
      />
    </label>
  );

  const PlayerCard = ({ player }: { player: Player }) => {
    const heightFeet = Math.floor(player.heightInInches / 12);
    const heightInches = player.heightInInches % 12;
    const age =
      new Date().getFullYear() - new Date(player.birthDate).getFullYear();

    // Get team colors
    const teamColorScheme = getTeamColors(selectedTeam);

    // Get team info
    const selectedTeamInfo = teams.find(
      (t) => t.teamAbbrev.default === selectedTeam
    );

    return (
      <div
        className="player-card"
        style={{
          background: `linear-gradient(135deg, ${teamColorScheme.primary} 0%, ${teamColorScheme.secondary} 100%)`,
          boxShadow: `0 8px 32px ${teamColorScheme.primary}33`,
          borderTop: `4px solid ${teamColorScheme.primary}`,
        }}
      >
        <div className="player-card-header">
          <div className="player-card-title">
            <div className="player-card-images">
              <img
                src={player.headshot}
                alt={`${player.firstName.default} ${player.lastName.default}`}
                className="player-headshot"
                onError={(e) => {
                  console.log('Player headshot failed to load:', player.headshot);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Player headshot loaded successfully:', player.headshot);
                }}
              />
              {selectedTeamInfo && (
                <img
                  src={selectedTeamInfo.teamLogo}
                  alt={selectedTeamInfo.teamName.default}
                  className="team-logo"
                  onError={(e) => {
                    console.log('Team logo failed to load:', selectedTeamInfo.teamLogo);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Team logo loaded successfully:', selectedTeamInfo.teamLogo);
                  }}
                />
              )}
            </div>
            <h2 className="player-card-name">
              {player.firstName.default} {player.lastName.default}
            </h2>
            {selectedTeamInfo && (
              <div className="player-card-team">
                {selectedTeamInfo.teamName.default}
              </div>
            )}
          </div>
          <div className="player-card-number">#{player.sweaterNumber}</div>
        </div>

        <div className="player-card-stats">
          <div className="stat-group">
            <h3>Basic Info</h3>
            <div className="stat-item">
              <span className="stat-label">Position:</span>
              <span className="stat-value">{player.positionCode}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Shoots/Catches:</span>
              <span className="stat-value">{player.shootsCatches}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Age:</span>
              <span className="stat-value">{age}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Height:</span>
              <span className="stat-value">
                {heightFeet}'{heightInches}"
              </span>
            </div>
          </div>

          {/* Advanced Stats */}
          <div className="stat-group">
            <h3>Advanced Stats</h3>
            {playerCardData.projWAR && (
              <div className="stat-item">
                <span className="stat-label">Proj. WAR:</span>
                <span className="stat-value">{playerCardData.projWAR}</span>
              </div>
            )}
            {playerCardData.evOffence && (
              <div className="stat-item">
                <span className="stat-label">EV Offence:</span>
                <span className="stat-value">{playerCardData.evOffence}</span>
              </div>
            )}
            {playerCardData.evDefence && (
              <div className="stat-item">
                <span className="stat-label">EV Defence:</span>
                <span className="stat-value">{playerCardData.evDefence}</span>
              </div>
            )}
            {playerCardData.pp && (
              <div className="stat-item">
                <span className="stat-label">PP:</span>
                <span className="stat-value">{playerCardData.pp}</span>
              </div>
            )}
            {playerCardData.pk && (
              <div className="stat-item">
                <span className="stat-label">PK:</span>
                <span className="stat-value">{playerCardData.pk}</span>
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className="stat-group">
            <h3>Performance</h3>
            {playerCardData.finishing && (
              <div className="stat-item">
                <span className="stat-label">Finishing:</span>
                <span className="stat-value">{playerCardData.finishing}</span>
              </div>
            )}
            {playerCardData.goals && (
              <div className="stat-item">
                <span className="stat-label">Goals:</span>
                <span className="stat-value">{playerCardData.goals}</span>
              </div>
            )}
            {playerCardData.firstAssists && (
              <div className="stat-item">
                <span className="stat-label">1st Assists:</span>
                <span className="stat-value">
                  {playerCardData.firstAssists}
                </span>
              </div>
            )}
            {playerCardData.penalties && (
              <div className="stat-item">
                <span className="stat-label">Penalties:</span>
                <span className="stat-value">{playerCardData.penalties}</span>
              </div>
            )}
            {playerCardData.competition && (
              <div className="stat-item">
                <span className="stat-label">Competition:</span>
                <span className="stat-value">{playerCardData.competition}</span>
              </div>
            )}
            {playerCardData.teammates && (
              <div className="stat-item">
                <span className="stat-label">Teammates:</span>
                <span className="stat-value">{playerCardData.teammates}</span>
              </div>
            )}
          </div>

          {/* WAR Percentile Rankings */}
          {(playerCardData.warPercentileRankYr1 ||
            playerCardData.warPercentileRankYr2 ||
            playerCardData.warPercentileRankYr3) && (
            <div className="stat-group">
              <h3>WAR Percentile Rank</h3>
              {playerCardData.warPercentileRankYr1 && (
                <div className="stat-item">
                  <span className="stat-label">Year 1:</span>
                  <span className="stat-value">
                    {playerCardData.warPercentileRankYr1}
                  </span>
                </div>
              )}
              {playerCardData.warPercentileRankYr2 && (
                <div className="stat-item">
                  <span className="stat-label">Year 2:</span>
                  <span className="stat-value">
                    {playerCardData.warPercentileRankYr2}
                  </span>
                </div>
              )}
              {playerCardData.warPercentileRankYr3 && (
                <div className="stat-item">
                  <span className="stat-label">Year 3:</span>
                  <span className="stat-value">
                    {playerCardData.warPercentileRankYr3}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Offense by Year */}
          {(playerCardData.offenseYr1 ||
            playerCardData.offenseYr2 ||
            playerCardData.offenseYr3) && (
            <div className="stat-group">
              <h3>Offense by Year</h3>
              {playerCardData.offenseYr1 && (
                <div className="stat-item">
                  <span className="stat-label">Year 1:</span>
                  <span className="stat-value">
                    {playerCardData.offenseYr1}
                  </span>
                </div>
              )}
              {playerCardData.offenseYr2 && (
                <div className="stat-item">
                  <span className="stat-label">Year 2:</span>
                  <span className="stat-value">
                    {playerCardData.offenseYr2}
                  </span>
                </div>
              )}
              {playerCardData.offenseYr3 && (
                <div className="stat-item">
                  <span className="stat-label">Year 3:</span>
                  <span className="stat-value">
                    {playerCardData.offenseYr3}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Defense by Year */}
          {(playerCardData.defenseYr1 ||
            playerCardData.defenseYr2 ||
            playerCardData.defenseYr3) && (
            <div className="stat-group">
              <h3>Defense by Year</h3>
              {playerCardData.defenseYr1 && (
                <div className="stat-item">
                  <span className="stat-label">Year 1:</span>
                  <span className="stat-value">
                    {playerCardData.defenseYr1}
                  </span>
                </div>
              )}
              {playerCardData.defenseYr2 && (
                <div className="stat-item">
                  <span className="stat-label">Year 2:</span>
                  <span className="stat-value">
                    {playerCardData.defenseYr2}
                  </span>
                </div>
              )}
              {playerCardData.defenseYr3 && (
                <div className="stat-item">
                  <span className="stat-label">Year 3:</span>
                  <span className="stat-value">
                    {playerCardData.defenseYr3}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Finishing by Year */}
          {(playerCardData.finishingYr1 ||
            playerCardData.finishingYr2 ||
            playerCardData.finishingYr3) && (
            <div className="stat-group">
              <h3>Finishing by Year</h3>
              {playerCardData.finishingYr1 && (
                <div className="stat-item">
                  <span className="stat-label">Year 1:</span>
                  <span className="stat-value">
                    {playerCardData.finishingYr1}
                  </span>
                </div>
              )}
              {playerCardData.finishingYr2 && (
                <div className="stat-item">
                  <span className="stat-label">Year 2:</span>
                  <span className="stat-value">
                    {playerCardData.finishingYr2}
                  </span>
                </div>
              )}
              {playerCardData.finishingYr3 && (
                <div className="stat-item">
                  <span className="stat-label">Year 3:</span>
                  <span className="stat-value">
                    {playerCardData.finishingYr3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="app-layout">
        <div className="top-section">
          <h1>NHL Stat Cards</h1>

          <div className="card-count">
            <p>
              Total Player Cards Created: <strong>{cardCount}</strong>
            </p>
          </div>

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
                  teams.find((t) => t.teamAbbrev.default === selectedTeam)
                    ?.teamName.default
                }
              </h2>
              <div className="players-list">
                {roster.map((player) => (
                  <div
                    key={player.id}
                    className={`player-item ${
                      selectedPlayer?.id === player.id ? "selected" : ""
                    }`}
                    onClick={() => handlePlayerSelect(player)}
                  >
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

        {selectedPlayer && (
          <div className="form-section-container">
            <div className="player-card-form">
              <div className="form-header">
                <h3>Player Statistics</h3>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={autofillMaxValues}
                    className="autofill-btn"
                  >
                    Autofill Max (99)
                  </button>
                  <button
                    type="button"
                    onClick={clearAllValues}
                    className="clear-btn"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="form-sections">
                <div className="form-section">
                  <h4>Advanced Stats</h4>
                  <div className="form-row">
                    <FormField
                      label="Proj. WAR"
                      field="projWAR"
                      value={playerCardData.projWAR}
                    />
                  </div>
                  <div className="form-row">
                    <FormField
                      label="EV Offence"
                      field="evOffence"
                      value={playerCardData.evOffence}
                    />
                    <FormField
                      label="EV Defence"
                      field="evDefence"
                      value={playerCardData.evDefence}
                    />
                  </div>
                  <div className="form-row">
                    <FormFieldWithNA
                      label="PP"
                      field="pp"
                      value={playerCardData.pp}
                      isNA={naFields.pp}
                    />
                    <FormFieldWithNA
                      label="PK"
                      field="pk"
                      value={playerCardData.pk}
                      isNA={naFields.pk}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Performance</h4>
                  <div className="form-row">
                    <FormFieldWithNA
                      label="Finishing"
                      field="finishing"
                      value={playerCardData.finishing}
                      isNA={naFields.finishing}
                    />
                    <FormField
                      label="Goals"
                      field="goals"
                      value={playerCardData.goals}
                    />
                  </div>
                  <div className="form-row">
                    <FormField
                      label="1st Assists"
                      field="firstAssists"
                      value={playerCardData.firstAssists}
                    />
                    <FormField
                      label="Penalties"
                      field="penalties"
                      value={playerCardData.penalties}
                    />
                  </div>
                  <div className="form-row">
                    <FormField
                      label="Competition"
                      field="competition"
                      value={playerCardData.competition}
                    />
                    <FormField
                      label="Teammates"
                      field="teammates"
                      value={playerCardData.teammates}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>WAR Percentile Rank</h4>
                  <div className="form-row">
                    <FormFieldWithNA
                      label="Year 1"
                      field="warPercentileRankYr1"
                      value={playerCardData.warPercentileRankYr1}
                      isNA={naFields.warPercentileRankYr1}
                    />
                    <FormFieldWithNA
                      label="Year 2"
                      field="warPercentileRankYr2"
                      value={playerCardData.warPercentileRankYr2}
                      isNA={naFields.warPercentileRankYr2}
                    />
                    <FormFieldWithNA
                      label="Year 3"
                      field="warPercentileRankYr3"
                      value={playerCardData.warPercentileRankYr3}
                      isNA={naFields.warPercentileRankYr3}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Offense by Year</h4>
                  <div className="form-row">
                    <FormFieldWithNA
                      label="Year 1"
                      field="offenseYr1"
                      value={playerCardData.offenseYr1}
                      isNA={naFields.offenseYr1}
                    />
                    <FormFieldWithNA
                      label="Year 2"
                      field="offenseYr2"
                      value={playerCardData.offenseYr2}
                      isNA={naFields.offenseYr2}
                    />
                    <FormFieldWithNA
                      label="Year 3"
                      field="offenseYr3"
                      value={playerCardData.offenseYr3}
                      isNA={naFields.offenseYr3}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Defense by Year</h4>
                  <div className="form-row">
                    <FormFieldWithNA
                      label="Year 1"
                      field="defenseYr1"
                      value={playerCardData.defenseYr1}
                      isNA={naFields.defenseYr1}
                    />
                    <FormFieldWithNA
                      label="Year 2"
                      field="defenseYr2"
                      value={playerCardData.defenseYr2}
                      isNA={naFields.defenseYr2}
                    />
                    <FormFieldWithNA
                      label="Year 3"
                      field="defenseYr3"
                      value={playerCardData.defenseYr3}
                      isNA={naFields.defenseYr3}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Finishing by Year</h4>
                  <div className="form-row">
                    <FormFieldWithNA
                      label="Year 1"
                      field="finishingYr1"
                      value={playerCardData.finishingYr1}
                      isNA={naFields.finishingYr1}
                    />
                    <FormFieldWithNA
                      label="Year 2"
                      field="finishingYr2"
                      value={playerCardData.finishingYr2}
                      isNA={naFields.finishingYr2}
                    />
                    <FormFieldWithNA
                      label="Year 3"
                      field="finishingYr3"
                      value={playerCardData.finishingYr3}
                      isNA={naFields.finishingYr3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card-section">
          {selectedPlayer ? (
            <PlayerCard player={selectedPlayer} />
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
