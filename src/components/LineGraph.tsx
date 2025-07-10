import { useState } from "react";

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

const MARGIN = { top: 10, right: 40, bottom: 40, left: 60 };

function LineGraph({
  showAll = true,
  width = 600,
  height = 300,
}: {
  showAll?: boolean;
  width?: number;
  height?: number;
}) {
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const fontSize = Math.max(12, width * 0.04); // 2% of width, min 10px

  const xPoints = [
    Math.floor(innerWidth * 0.125),
    Math.floor(innerWidth * 0.5),
    Math.floor(innerWidth * 0.875),
  ];

  const [mainSet, setMainSet] = useState(xPoints.map((x) => ({ x, y: 0.5 })));
  const [secondSet, setSecondSet] = useState(
    xPoints.map((x, i) => ({ x, y: [0.6, 0.4, 0.7][i] }))
  );
  const [thirdSet, setThirdSet] = useState(
    xPoints.map((x, i) => ({ x, y: [0.3, 0.6, 0.5][i] }))
  );

  const scaleY = (val: number) => innerHeight * val;

  //   const handleDrag = (
  //     setPoints: Function,
  //     index: number,
  //     e: React.MouseEvent<SVGCircleElement>
  //   ) => {
  //     e.preventDefault();
  //     const svg = e.currentTarget.ownerSVGElement;
  //     if (!svg) return;

  //     const rect = svg.getBoundingClientRect();

  //     const onMove = (moveEvent: MouseEvent) => {
  //       const y = moveEvent.clientY - rect.top - MARGIN.top;
  //       const ratioY = Math.max(0, Math.min(1, y / innerHeight));
  //       setPoints((prev: any[]) => {
  //         const updated = [...prev];
  //         updated[index] = { ...updated[index], y: ratioY };
  //         return updated;
  //       });
  //     };

  //     const onUp = () => {
  //       window.removeEventListener("mousemove", onMove);
  //       window.removeEventListener("mouseup", onUp);
  //     };

  //     window.addEventListener("mousemove", onMove);
  //     window.addEventListener("mouseup", onUp);
  //   };

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
      <circle
        key={i}
        cx={p.x + MARGIN.left}
        cy={scaleY(p.y) + MARGIN.top}
        r={POINT_RADIUS}
        fill={color}
        cursor="pointer"
        onMouseDown={(e) => handleDrag(setPoints, i, p.y, e)}
      />
    ));

  return (
    <div style={{ width: "100%", height: "100%" }}>
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
