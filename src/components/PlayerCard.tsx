import type { Player, Team, PlayerCardData } from "../types.js";

interface PlayerCardProps {
  player?: Player | null;
  selectedTeam?: string;
  teams?: Team[];
  playerCardData?: PlayerCardData;
}

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

// Default team colors for fallback
const DEFAULT_TEAM_COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#ffffff",
};

// Helper function to get team colors with fallback
const getTeamColors = (teamAbbrev: string) => {
  return teamColors[teamAbbrev] || DEFAULT_TEAM_COLORS;
};

const PlayerCard = ({
  player,
  selectedTeam,
  teams,
  playerCardData,
}: PlayerCardProps) => {
  if (!player) {
    return (
      <div className="min-w-56 min-h-48 bg-white shadow-lg rounded-lg p-4 mb-4 grid grid-cols-[3fr_2fr] gap-4">
        <div className="bg-amber-300 p-4">
          <div className="h-10 bg-gray-400 w-full mb-2 rounded"></div>
          <div className="h-6 bg-gray-300 w-3/4 mb-2 rounded"></div>
          <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
        </div>
        <div className="bg-purple-400 p-4 flex items-center justify-center">
          <img
            src="/nhl-seeklogo.png"
            alt="NHL Logo"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              console.log("NHL logo failed to load");
              // Try alternative URL
              e.currentTarget.src =
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/NHL_Shield.svg/1200px-NHL_Shield.svg.png";
              e.currentTarget.onerror = () => {
                // Final fallback to text
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="text-white text-xl font-bold">NHL</div>
                `;
              };
            }}
          />
        </div>
      </div>
    );
  }

  const heightFeet = Math.floor(player.heightInInches / 12);
  const heightInches = player.heightInInches % 12;
  const age =
    new Date().getFullYear() - new Date(player.birthDate).getFullYear();

  // Get team colors
  const teamColorScheme = getTeamColors(selectedTeam ?? "");

  // Get team info
  const selectedTeamInfo = teams?.find(
    (t) => t.teamAbbrev.default === selectedTeam
  );

  return (
    <>
      <div className="w-full min-h-48 bg-white shadow-lg rounded-lg p-4 mb-4 flex">
        <div className="flex-[3] bg-amber-300"></div>
        <div className="flex-[2] bg-purple-400"></div>
      </div>
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
                  console.log(
                    "Player headshot failed to load:",
                    player.headshot
                  );
                  e.currentTarget.style.display = "none";
                }}
                onLoad={() => {
                  console.log(
                    "Player headshot loaded successfully:",
                    player.headshot
                  );
                }}
              />
              {selectedTeamInfo && (
                <img
                  src={selectedTeamInfo.teamLogo}
                  alt={selectedTeamInfo.teamName.default}
                  className="team-logo"
                  onError={(e) => {
                    console.log(
                      "Team logo failed to load:",
                      selectedTeamInfo.teamLogo
                    );
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={() => {
                    console.log(
                      "Team logo loaded successfully:",
                      selectedTeamInfo.teamLogo
                    );
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
            {playerCardData?.projWAR && (
              <div className="stat-item">
                <span className="stat-label">Proj. WAR:</span>
                <span className="stat-value">{playerCardData.projWAR}</span>
              </div>
            )}
            {playerCardData?.evOffence && (
              <div className="stat-item">
                <span className="stat-label">EV Offence:</span>
                <span className="stat-value">{playerCardData.evOffence}</span>
              </div>
            )}
            {playerCardData?.evDefence && (
              <div className="stat-item">
                <span className="stat-label">EV Defence:</span>
                <span className="stat-value">{playerCardData.evDefence}</span>
              </div>
            )}
            {playerCardData?.pp && (
              <div className="stat-item">
                <span className="stat-label">PP:</span>
                <span className="stat-value">{playerCardData.pp}</span>
              </div>
            )}
            {playerCardData?.pk && (
              <div className="stat-item">
                <span className="stat-label">PK:</span>
                <span className="stat-value">{playerCardData.pk}</span>
              </div>
            )}
          </div>

          {/* Performance Stats */}
          <div className="stat-group">
            <h3>Performance</h3>
            {playerCardData?.finishing && (
              <div className="stat-item">
                <span className="stat-label">Finishing:</span>
                <span className="stat-value">{playerCardData.finishing}</span>
              </div>
            )}
            {playerCardData?.goals && (
              <div className="stat-item">
                <span className="stat-label">Goals:</span>
                <span className="stat-value">{playerCardData.goals}</span>
              </div>
            )}
            {playerCardData?.firstAssists && (
              <div className="stat-item">
                <span className="stat-label">1st Assists:</span>
                <span className="stat-value">
                  {playerCardData.firstAssists}
                </span>
              </div>
            )}
            {playerCardData?.penalties && (
              <div className="stat-item">
                <span className="stat-label">Penalties:</span>
                <span className="stat-value">{playerCardData.penalties}</span>
              </div>
            )}
            {playerCardData?.competition && (
              <div className="stat-item">
                <span className="stat-label">Competition:</span>
                <span className="stat-value">{playerCardData.competition}</span>
              </div>
            )}
            {playerCardData?.teammates && (
              <div className="stat-item">
                <span className="stat-label">Teammates:</span>
                <span className="stat-value">{playerCardData.teammates}</span>
              </div>
            )}
          </div>

          {/* WAR Percentile Rankings */}
          {(playerCardData?.warPercentileRankYr1 ||
            playerCardData?.warPercentileRankYr2 ||
            playerCardData?.warPercentileRankYr3) && (
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
          {(playerCardData?.offenseYr1 ||
            playerCardData?.offenseYr2 ||
            playerCardData?.offenseYr3) && (
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
          {(playerCardData?.defenseYr1 ||
            playerCardData?.defenseYr2 ||
            playerCardData?.defenseYr3) && (
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
          {(playerCardData?.finishingYr1 ||
            playerCardData?.finishingYr2 ||
            playerCardData?.finishingYr3) && (
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
    </>
  );
};

export default PlayerCard;
