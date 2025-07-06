import type { Player, Team } from "../types";

interface PlayerSelectorProps {
  teams: Team[];
  selectedTeam: Team | null | undefined;
  roster: Player[];
  selectedPlayer: Player | null;
  loading: boolean;
  error: string;
  onTeamSelect: (teamId: string) => void;
  onPlayerSelect: (player: Player) => void;
}

const PlayerSelector = ({
  teams,
  selectedTeam,
  roster,
  selectedPlayer,
  loading,
  error,
  onTeamSelect,
  onPlayerSelect,
}: PlayerSelectorProps) => {
  return (
    <div className="top-section">
      {error && <div className="error">Error: {error}</div>}
      <div className="team-selector">
        <label htmlFor="team-select">Select a Team:</label>
        <select
          id="team-select"
          value={selectedTeam?.teamName ? selectedTeam.teamName.default : ""}
          onChange={(e) => onTeamSelect(e.target.value)}
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
          <h2>Roster for {selectedTeam?.teamName.default}</h2>
          <div className="players-list">
            {roster.map((player) => (
              <div
                key={player.id}
                className={`player-item ${
                  selectedPlayer?.id === player.id ? "selected" : ""
                }`}
                onClick={() => onPlayerSelect(player)}
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
  );
};

export default PlayerSelector;
