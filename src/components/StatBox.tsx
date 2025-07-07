import { useState, useEffect, useMemo } from "react";
import { interpolateColor } from "../utils/colorInterpolation";

export default function StatBox({
  statValue,
  setStatValue,
  statLabel = "Proj WAR%",
  large = false,
}: {
  statValue: number;
  setStatValue?: (value: number) => void;
  statLabel?: string;
  large?: boolean;
}) {
  const [inputValue, setInputValue] = useState(
    statValue.toString().padStart(2, "0")
  );

  useEffect(() => {
    setInputValue(statValue.toString().padStart(2, "0"));
  }, [statValue]);

  const backgroundColor = useMemo(() => {
    return interpolateColor(statValue, "blue");
  }, [statValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Only allow up to 2 digits
    if (/^\d{0,2}$/.test(raw)) {
      setInputValue(raw);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
      setStatValue?.(parsed);
    } else {
      // Reset to last valid value
      setInputValue(statValue.toString().padStart(2, "0"));
    }
  };

  const numberClasses = large
    ? " text-xl sm:text-3xl md:text-6xl h-full"
    : "text-xs sm:text-base md:text-4xl ";

  const titleClasses = large
    ? "text-xs sm:text-lg md:text-xl h-full"
    : "text-xs sm:text-base md:text-xl ";

  const baseClasses = large ? "flex-1" : "py-2 sm:py-4 md:py-6 w-full";

  return (
    <div className={`flex flex-col min-w-0 max-w-full ${titleClasses}`}>
      <p className={`text-nowrap overflow-hidden tracking-tighter`}>
        {statLabel}
      </p>
      <div
        className={`flex justify-center items-center mt-2 gap-0 max-w-full ${baseClasses}`}
        style={{ backgroundColor }}
      >
        <input
          type="text"
          maxLength={2}
          pattern="[0-9]*"
          inputMode="numeric"
          className={`bg-transparent  text-center border-none outline-none font-black ${numberClasses}`}
          style={{
            appearance: "textfield",
            MozAppearance: "textfield",
            WebkitAppearance: "none",
            width: "2ch",
            minWidth: "2ch",
            maxWidth: "100%",
          }}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <p className={`h-full flex items-center font-bold ${numberClasses}`}>
          %
        </p>
      </div>
    </div>
  );
}
