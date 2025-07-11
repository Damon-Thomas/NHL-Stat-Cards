import { useState, useEffect, useMemo } from "react";
import { interpolateColor } from "../utils/colorInterpolation";
import { useStatContext } from "../contexts/statContext";

type StatObject = {
  statLabel: string;
  stat: number;
  setStat: React.Dispatch<React.SetStateAction<number>>;
};

export default function StatBox({
  statName,
  large = false,
  editable = true,
}: {
  statName?: string;
  large?: boolean;
  editable?: boolean;
}) {
  const { war, otherStats } = useStatContext();
  const [expandedStats, setExpandedStats] = useState<
    { statLabel: string; statObj: StatObject }[]
  >([]);
  const [statObj, setStatObj] = useState<StatObject | null>(null);

  useEffect(() => {
    setExpandedStats(
      Object.entries(otherStats).map(([statLabel, statObj]) => ({
        statLabel,
        statObj: { ...statObj, statLabel },
      }))
    );
  }, [otherStats]);

  useEffect(() => {
    setStatObj(
      large
        ? { ...war, statLabel: "WAR" }
        : expandedStats.find(
            (stat) => stat.statLabel.toLowerCase() === statName?.toLowerCase()
          )?.statObj || null
    );
  }, [statName, war, expandedStats, large]);

  const backgroundColor = useMemo(() => {
    const statValue = statObj?.stat !== undefined ? statObj.stat : 99;
    return interpolateColor(statValue);
  }, [statObj?.stat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();

    if (raw === "NA" || raw === "N" || /^\d{0,2}$/.test(raw)) {
      if (raw === "NA") {
        statObj?.setStat(0);
      } else if (raw === "") {
        statObj?.setStat(0);
      } else if (/^\d{1,2}$/.test(raw)) {
        statObj?.setStat(parseFloat(raw) || 0);
      }
    }
  };

  const handleBlur = (val: string) => {
    const upperVal = val.toUpperCase();
    if (upperVal === "NA") {
      statObj?.setStat(0);
    } else {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
        statObj?.setStat(parsed);
      } else {
        statObj?.setStat(0);
      }
    }
  };

  const displayValue =
    statObj?.stat === 0 ? "NA" : statObj?.stat.toString() || "";

  const numberClasses = large
    ? editable
      ? " text-xl sm:text-3xl md:text-6xl h-full"
      : " text-6xl h-full"
    : editable
    ? "text-xs sm:text-base md:text-4xl "
    : "text-4xl ";

  const titleClasses = large
    ? editable
      ? "text-xs sm:text-lg md:text-xl h-full"
      : "text-xl h-full"
    : editable
    ? "text-xs sm:text-base md:text-xl "
    : "text-xl ";

  const baseClasses = large
    ? "flex-1"
    : editable
    ? "py-2 sm:py-4 md:py-6 w-full"
    : "py-6 w-full";

  return (
    <div className={`flex flex-col min-w-0 max-w-full ${titleClasses}`}>
      <p
        className={`text-nowrap overflow-hidden tracking-tighter ${
          editable ? "text-[8px] sm:text-lg md:text-xl" : "text-xl"
        }`}
      >
        {statObj?.statLabel}
      </p>
      <div
        className={`flex justify-center items-center mt-2 gap-0 max-w-full ${baseClasses} relative`}
        style={{ backgroundColor }}
      >
        {editable ? (
          <>
            <input
              type="text"
              maxLength={2}
              pattern="[0-9]*"
              inputMode="numeric"
              className={`bg-transparent text-center border-none outline-none font-black ${numberClasses} ${
                displayValue === "NA" ? "text-transparent" : ""
              }`}
              style={{
                appearance: "textfield",
                MozAppearance: "textfield",
                WebkitAppearance: "none",
                width: "2ch",
                minWidth: "2ch",
                maxWidth: "100%",
              }}
              value={displayValue === "NA" ? "0" : displayValue}
              onChange={handleChange}
              onBlur={(e) => handleBlur(e.target.value)}
            />
            {displayValue !== "NA" && (
              <p
                className={`h-full flex items-center font-bold ${numberClasses}`}
              >
                %
              </p>
            )}
            {/* NA overlay when value is 0 */}
            {displayValue === "NA" && (
              <div
                className={`absolute inset-0 flex justify-center items-center font-black ${numberClasses} pointer-events-none cursor-text group`}
              >
                <span>NA</span>
                <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:animate-pulse border-r-2 border-current h-6"></span>
              </div>
            )}
          </>
        ) : (
          // Non-editable version - just display the value
          <div
            className={`flex justify-center items-center font-black ${numberClasses}`}
          >
            {displayValue === "NA" ? (
              <span>NA</span>
            ) : (
              <>
                <span>{displayValue}</span>
                <span>%</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
