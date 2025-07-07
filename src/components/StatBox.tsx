import { useState, useEffect, useMemo } from "react";
import { interpolateColor } from "../utils/colorInterpolation";

export default function StatBox({
  statValue,
  setStatValue,
}: {
  statValue: number;
  setStatValue?: (value: number) => void;
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

  return (
    <div className="flex flex-col min-w-0 sm:pt-2 text-xs sm:text-base md:text-xl max-w-full">
      <p className="text-nowrap overflow-hidden text-ellipsis tracking-tighter">
        Proj WAR%
      </p>
      <div
        className="flex justify-center items-center mt-2 gap-0 flex-1 max-w-full text-xs sm:text-xl md:text-6xl"
        style={{ backgroundColor }}
      >
        <input
          type="text"
          maxLength={2}
          pattern="[0-9]*"
          inputMode="numeric"
          className="bg-transparent h-full text-center border-none outline-none font-black"
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
        <p className="h-full flex items-center font-bold ">%</p>
      </div>
    </div>
  );
}
