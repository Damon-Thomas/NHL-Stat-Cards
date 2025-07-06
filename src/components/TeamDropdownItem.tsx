import { getTeamLogoPath } from "../utils/teamLogos";
import type { Team } from "../types";

interface TeamDropdownItemProps {
  team: Team;
  onSelect: (team: Team) => void;
}

export default function TeamDropdownItem({
  team,
  onSelect,
}: TeamDropdownItemProps) {
  const teamLogoUrl = getTeamLogoPath(team.teamAbbrev.default);

  return (
    <button
      onClick={() => onSelect(team)}
      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-4 bg-transparent border-none outline-none"
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <img
          src={teamLogoUrl}
          alt={team.teamName.default}
          className="w-full h-full object-contain"
        />
      </div>
      <span className="text-sm font-medium">{team.teamName.default}</span>
    </button>
  );
}
