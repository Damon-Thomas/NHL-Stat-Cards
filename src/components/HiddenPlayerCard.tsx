import React from "react";
import { getTeamColors } from "../data/colors";
import { getTeamLogoPath } from "../utils/teamLogos";
import { getProxiedImageUrl } from "../utils/imageProxy";
import { useStatContext } from "../contexts/statContext";
import { usePlayerContext } from "../contexts/playerContext";
import { interpolateColor } from "../utils/colorInterpolation";
import OptimisticImage from "./OptimisticImage";
import StatBox from "./StatBox";

const HiddenPlayerCard: React.FC = () => {
  const { war, otherStats: statContextStats } = useStatContext();
  const { selectedPlayer, selectedTeam } = usePlayerContext();

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
  const teamColorScheme = getTeamColors(selectedTeam?.teamAbbrev.default ?? "");
  const selectedTeamLogoUrl = getTeamLogoPath(selectedTeam?.teamAbbrev.default);

  function formatAge(age: string | undefined): number {
    if (!age) return 0;
    return new Date().getFullYear() - new Date(age).getFullYear();
  }

  function inchesToFeet(inches: number | undefined): string {
    if (inches === undefined || inches < 0) return `5'10"`;
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  }

  function formatHandedness(handedness: string | undefined): string {
    if (!handedness) return "Left";
    if (handedness === "L") return "Left";
    if (handedness === "R") return "Right";
    return "Unknown";
  }

  function formatPosition(position: string | undefined): string {
    if (!position) return "LW";
    if (position === "L") return "LW";
    if (position === "C") return "C";
    if (position === "R") return "RW";
    if (position === "D") return "D";
    if (position === "G") return "G";
    return position;
  }

  return (
    <div
      className="w-full max-w-6xl bg-white text-black rounded-xl p-2 sm:p-4 grid gap-2 overflow-hidden"
      style={{
        gridTemplateColumns: "3fr 2fr",
        width: "1120px",
        height: "594.398px",
      }}
    >
      <div className="min-w-0 overflow-hidden pt-2 flex flex-col sm:gap-2 md:gap-4">
        <div className="h-8 sm:h-12 md:h-16 lg:h-18 w-full mb-1 rounded flex items-center gap-2">
          <div className="w-8 sm:w-12 md:w-16 lg:w-18 h-8 sm:h-12 md:h-16 lg:h-18 flex-shrink-0 rounded flex items-center justify-center">
            <img
              src={selectedTeamLogoUrl}
              alt={selectedTeam ? selectedTeam.teamName.default : "NHL Logo"}
              className="w-8 sm:w-12 md:w-16 lg:w-18 h-8 sm:h-12 md:h-16 lg:h-18 object-contain"
            />
          </div>
          <div className="h-8 sm:h-12 md:h-16 lg:h-18 flex flex-1 flex-col items-start min-w-0">
            <div className="w-full h-8 sm:h-12 md:h-16 lg:h-18 flex flex-col">
              <p className="text-xs w-full sm:text-xl md:text-2xl lg:text-3xl mb-1 ml-1 font-black italic tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedPlayer
                  ? `${selectedPlayer?.firstName.default.toUpperCase()} ${selectedPlayer?.lastName.default.toUpperCase()}`
                  : "PLAYER NAME"}
              </p>
              <div
                className="h-1.5 sm:h-2 lg:h-3"
                style={{
                  background: teamColorScheme.primary,
                  clipPath: "polygon(4px 0, 100% 0, 100% 100%, 0 100%)",
                }}
              ></div>
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
          <div
            className="flex justify-center items-center p-2 text-center"
            style={{ backgroundColor: interpolateColor(war.stat) }}
          >
            <div>
              <p className="text-sm font-bold">WAR</p>
              <p className="text-2xl font-black">
                {war.stat === 0 ? "NA" : `${war.stat}%`}
              </p>
            </div>
          </div>
          <div className="grid grid-rows-4 text-xs sm:text-base md:text-2xl min-w-0">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <p className="flex-">Pos:</p>
              <p className="flex-1 font-black text-left">
                {formatPosition(selectedPlayer?.positionCode)}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <p className="flex-2">Age:</p>
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
          {otherStats.map((stat, index) => {
            const statKey = stat as keyof typeof statContextStats;
            const statValue = statContextStats[statKey]?.stat ?? 99;
            const backgroundColor = interpolateColor(statValue);

            return <StatBox editable={false} key={index} />;
          })}
        </div>
      </div>
      <div className="flex flex-col items-center justify-around pl-2 sm:pl-4 w-full h-full">
        <div className="flex flex-col w-full">
          <p className="font-black text-xs sm:text-xl md:text-2xl">
            WAR Percentile Rank
          </p>
          <div className="w-full h-32 bg-white border flex items-center justify-center relative">
            <svg viewBox="0 0 300 120" className="w-full h-full">
              {/* Grid lines */}
              <line
                x1="40"
                y1="20"
                x2="260"
                y2="20"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="40"
                x2="260"
                y2="40"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="60"
                x2="260"
                y2="60"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="80"
                x2="260"
                y2="80"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="100"
                x2="260"
                y2="100"
                stroke="#ccc"
                strokeWidth="1"
              />

              {/* Single line */}
              <polyline
                fill="none"
                stroke="#202947"
                strokeWidth="3"
                points="70,60 150,40 230,50"
              />

              {/* Points */}
              <circle cx="70" cy="60" r="4" fill="#202947" />
              <circle cx="150" cy="40" r="4" fill="#202947" />
              <circle cx="230" cy="50" r="4" fill="#202947" />

              {/* Labels */}
              <text x="10" y="25" fontSize="10" fill="#000">
                100%
              </text>
              <text x="10" y="45" fontSize="10" fill="#000">
                75%
              </text>
              <text x="10" y="65" fontSize="10" fill="#000">
                50%
              </text>
              <text x="10" y="85" fontSize="10" fill="#000">
                25%
              </text>
              <text x="10" y="105" fontSize="10" fill="#000">
                0%
              </text>
            </svg>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <p className="font-black text-xs sm:text-xl md:text-2xl mt-4">
            <span className="text-[#273044]">Offense</span> vs{" "}
            <span className="text-[#E34C5B]">Defense</span> vs{" "}
            <span className="text-[#5DB4F9]">Finishing</span>
          </p>
          <div className="w-full h-32 bg-white border flex items-center justify-center relative">
            <svg viewBox="0 0 300 120" className="w-full h-full">
              {/* Grid lines */}
              <line
                x1="40"
                y1="20"
                x2="260"
                y2="20"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="40"
                x2="260"
                y2="40"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="60"
                x2="260"
                y2="60"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="80"
                x2="260"
                y2="80"
                stroke="#ccc"
                strokeWidth="1"
              />
              <line
                x1="40"
                y1="100"
                x2="260"
                y2="100"
                stroke="#ccc"
                strokeWidth="1"
              />

              {/* Three lines */}
              <polyline
                fill="none"
                stroke="#273044"
                strokeWidth="3"
                points="70,50 150,60 230,45"
              />
              <polyline
                fill="none"
                stroke="#E34C5B"
                strokeWidth="3"
                points="70,70 150,40 230,65"
              />
              <polyline
                fill="none"
                stroke="#5DB4F9"
                strokeWidth="3"
                strokeDasharray="5,3"
                points="70,40 150,70 230,55"
              />

              {/* Points */}
              <circle cx="70" cy="50" r="4" fill="#273044" />
              <circle cx="150" cy="60" r="4" fill="#273044" />
              <circle cx="230" cy="45" r="4" fill="#273044" />

              <circle cx="70" cy="70" r="4" fill="#E34C5B" />
              <circle cx="150" cy="40" r="4" fill="#E34C5B" />
              <circle cx="230" cy="65" r="4" fill="#E34C5B" />

              <circle cx="70" cy="40" r="4" fill="#5DB4F9" />
              <circle cx="150" cy="70" r="4" fill="#5DB4F9" />
              <circle cx="230" cy="55" r="4" fill="#5DB4F9" />

              {/* Labels */}
              <text x="10" y="25" fontSize="10" fill="#000">
                100%
              </text>
              <text x="10" y="45" fontSize="10" fill="#000">
                75%
              </text>
              <text x="10" y="65" fontSize="10" fill="#000">
                50%
              </text>
              <text x="10" y="85" fontSize="10" fill="#000">
                25%
              </text>
              <text x="10" y="105" fontSize="10" fill="#000">
                0%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiddenPlayerCard;
