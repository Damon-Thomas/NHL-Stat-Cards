import { useEffect, useState, useRef } from "react";
import { useGraph } from "../contexts/graphContext";

const POINT_RADIUS = 10;
const AXIS_LABELS = ["0%", "25%", "50%", "75%", "100%"];
const AXIS_Y_VALUES = [1, 0.75, 0.5, 0.25, 0];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_LABELS = [
  `${String((CURRENT_YEAR - 2) % 100).padStart(2, "0")}-${String(
    (CURRENT_YEAR - 1) % 100
  ).padStart(2, "0")}`,
  `${String((CURRENT_YEAR - 1) % 100).padStart(2, "0")}-${String(
    CURRENT_YEAR % 100
  ).padStart(2, "0")}`,
  `${String(CURRENT_YEAR % 100).padStart(2, "0")}-${String(
    (CURRENT_YEAR + 1) % 100
  ).padStart(2, "0")}`,
];

const MARGIN = { top: 20, right: 40, bottom: 40, left: 60 };

function LineGraph({
  showAll = true,
  width = 600,
  height = 300,
  fixed = false,
}: {
  showAll?: boolean;
  width?: number;
  height?: number;
  fixed?: boolean;
}) {
  const graphContext = useGraph();
  const [showFormControls, setShowFormControls] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  if (!graphContext) {
    throw new Error("LineGraph must be used within a GraphProvider");
  }

  const { single, multiple, updateXPoints } = graphContext;

  const mainSet = showAll ? multiple.mainSet : single.singleSet;
  const setMainSet = showAll ? multiple.setMainSet : single.setSingleSet;
  const secondSet = showAll ? multiple.secondSet : multiple.secondSet;
  const setSecondSet = showAll ? multiple.setSecondSet : multiple.setSecondSet;
  const thirdSet = showAll ? multiple.thirdSet : multiple.thirdSet;
  const setThirdSet = showAll ? multiple.setThirdSet : multiple.setThirdSet;

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const fontSize = Math.max(12, width * 0.04); // 2% of width, min 10px

  // Update x-coordinates when dimensions change
  useEffect(() => {
    updateXPoints(innerWidth);
  }, [innerWidth, updateXPoints]);

  const xPoints = [
    Math.floor(innerWidth * 0.125),
    Math.floor(innerWidth * 0.5),
    Math.floor(innerWidth * 0.875),
  ];

  const scaleY = (val: number) => innerHeight * val;

  const handleDrag = (
    setPoints: Function,
    index: number,
    initialYRatio: number,
    e: React.MouseEvent<SVGCircleElement>
  ) => {
    e.preventDefault();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();

    const startY = e.clientY - rect.top - MARGIN.top;
    const offset = startY - innerHeight * initialYRatio;

    const onMove = (moveEvent: MouseEvent) => {
      const newY = moveEvent.clientY - rect.top - MARGIN.top - offset;
      const ratioY = Math.max(0, Math.min(1, newY / innerHeight));

      setPoints((prev: any[]) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], y: ratioY };
        return updated;
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleTouchDrag = (
    setPoints: Function,
    index: number,
    _initialYRatio: number,
    e: React.TouchEvent<SVGCircleElement>
  ) => {
    e.preventDefault();
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];

    // Direct touch positioning without offset calculation for more intuitive feel
    const updatePointPosition = (clientY: number) => {
      const newY = clientY - rect.top - MARGIN.top;
      const ratioY = Math.max(0, Math.min(1, newY / innerHeight));

      setPoints((prev: any[]) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], y: ratioY };
        return updated;
      });
    };

    // Initial update
    updatePointPosition(touch.clientY);

    const onTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault(); // Prevent scrolling while dragging
      if (moveEvent.touches.length === 0) return;
      updatePointPosition(moveEvent.touches[0].clientY);
    };

    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
  };

  const handleFormValueChange = (
    setPoints: Function,
    index: number,
    value: number
  ) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const ratioY = 1 - clampedValue / 100; // Convert percentage to y ratio (invert for SVG)

    setPoints((prev: any[]) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], y: ratioY };
      return updated;
    });
  };

  const getPercentageValue = (point: { y: number }) => {
    return Math.round((1 - point.y) * 100);
  };

  const renderLine = (
    points: { x: number; y: number }[],
    color: string,
    dashed = false
  ) => (
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="8"
      strokeDasharray={dashed ? "6 4" : undefined}
      points={points
        .map((p) => `${p.x + MARGIN.left},${scaleY(p.y) + MARGIN.top}`)
        .join(" ")}
    />
  );

  const renderPoints = (
    points: { x: number; y: number }[],
    color: string,
    setPoints: Function
  ) =>
    points.map((p, i) => (
      <g key={i}>
        {/* Larger invisible hit area for better touch interaction */}
        <circle
          cx={p.x + MARGIN.left}
          cy={scaleY(p.y) + MARGIN.top}
          r={POINT_RADIUS * 3} // 3x larger touch area
          fill="transparent"
          stroke="transparent"
          strokeWidth={1}
          cursor="grab"
          onMouseDown={(e) => handleDrag(setPoints, i, p.y, e)}
          onTouchStart={(e) => handleTouchDrag(setPoints, i, p.y, e)}
        />
        {/* Visible dot (unchanged for PNG output) */}
        <circle
          cx={p.x + MARGIN.left}
          cy={scaleY(p.y) + MARGIN.top}
          r={POINT_RADIUS}
          fill={color}
          pointerEvents="none"
        />
      </g>
    ));

  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Don't close if clicking the edit button
        if (!target.closest("button[data-edit-button]")) {
          setShowFormControls(false);
        }
      }
    };

    if (showFormControls) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFormControls]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Form Controls Button - hide in fixed/print version */}
      {!fixed && (
        <button
          data-edit-button
          onClick={() => setShowFormControls(!showFormControls)}
          className="absolute -top-1 -right-1 sm:top-1 sm:right-1 z-10 bg-gray-600 text-white w-5 h-5 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center justify-center"
          style={{ fontSize: "8px" }}
        >
          <span className="hidden sm:inline">
            {showFormControls ? "Hide" : "Edit"}
          </span>
          <span className="sm:hidden">{showFormControls ? "×" : "✎"}</span>
        </button>
      )}

      {/* Form Controls Modal - hide in fixed/print version */}
      {!fixed && showFormControls && (
        <>
          {/* Modal backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowFormControls(false)}
          />

          {/* Modal content */}
          <div
            ref={formRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-white rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto min-w-0 sm:min-w-80 max-w-4xl border border-gray-200"
          >
            {/* Header with accent */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="text-base font-semibold text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Graph Values
                </div>
                <button
                  onClick={() => setShowFormControls(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Single graph controls */}
              {!showAll && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#202947]"></div>
                    <span className="text-sm font-medium text-gray-700">
                      WAR Percentile
                    </span>
                  </div>
                  <div className="space-y-3">
                    {YEAR_LABELS.map((year, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center gap-3"
                      >
                        <span className="text-sm w-16 text-gray-600 font-medium">
                          {year}:
                        </span>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={getPercentageValue(mainSet[i])}
                            onChange={(e) =>
                              handleFormValueChange(
                                setMainSet,
                                i,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple graphs controls - responsive layout */}
              {showAll && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#202947]"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Offense
                      </span>
                    </div>
                    <div className="space-y-3">
                      {YEAR_LABELS.map((year, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="text-sm w-12 text-gray-600 font-medium">
                            {year}:
                          </span>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={getPercentageValue(mainSet[i])}
                              onChange={(e) =>
                                handleFormValueChange(
                                  setMainSet,
                                  i,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#F24758]"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Defense
                      </span>
                    </div>
                    <div className="space-y-3">
                      {YEAR_LABELS.map((year, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="text-sm w-12 text-gray-600 font-medium">
                            {year}:
                          </span>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={getPercentageValue(secondSet[i])}
                              onChange={(e) =>
                                handleFormValueChange(
                                  setSecondSet,
                                  i,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg mb-4">
                      <div className="w-3 h-3 rounded-full bg-[#95CDFA]"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Finishing
                      </span>
                    </div>
                    <div className="space-y-3">
                      {YEAR_LABELS.map((year, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center gap-2"
                        >
                          <span className="text-sm w-12 text-gray-600 font-medium">
                            {year}:
                          </span>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={getPercentageValue(thirdSet[i])}
                              onChange={(e) =>
                                handleFormValueChange(
                                  setThirdSet,
                                  i,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
      >
        {AXIS_Y_VALUES.map((val, i) => (
          <g key={i}>
            <line
              x1={MARGIN.left}
              y1={scaleY(val) + MARGIN.top}
              x2={width - MARGIN.right}
              y2={scaleY(val) + MARGIN.top}
              stroke="#ccc"
            />

            <text
              x={0}
              y={scaleY(val) + MARGIN.top + 4}
              fontSize={fontSize}
              fontWeight="bold"
              fill="#000"
            >
              {AXIS_LABELS[i]}
            </text>
          </g>
        ))}

        <line
          x1={MARGIN.left}
          y1={height - MARGIN.bottom}
          x2={width - MARGIN.right}
          y2={height - MARGIN.bottom}
          stroke="black"
        />

        {YEAR_LABELS.map((year, i) => (
          <text
            key={i}
            x={xPoints[i] + MARGIN.left - 16}
            y={height}
            fontSize={fontSize}
            fontWeight="bold"
            fill="#000"
          >
            {year}
          </text>
        ))}

        {showAll && renderLine(thirdSet, "#95CDFA", true)}
        {showAll && renderLine(secondSet, "#F24758")}
        {renderLine(mainSet, "#202947")}

        {renderPoints(mainSet, "#202947", setMainSet)}
        {showAll && renderPoints(secondSet, "#F24758", setSecondSet)}
        {showAll && renderPoints(thirdSet, "#95CDFA", setThirdSet)}
      </svg>
    </div>
  );
}

export default LineGraph;
