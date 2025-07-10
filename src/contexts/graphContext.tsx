import { createContext, useContext, useState, type ReactNode } from "react";

type GraphContextType = {
  single: {
    singleSet: { x: number; y: number }[];
    setSingleSet: React.Dispatch<
      React.SetStateAction<{ x: number; y: number }[]>
    >;
  };
  multiple: {
    mainSet: { x: number; y: number }[];
    setMainSet: React.Dispatch<
      React.SetStateAction<{ x: number; y: number }[]>
    >;
    secondSet: { x: number; y: number }[];
    setSecondSet: React.Dispatch<
      React.SetStateAction<{ x: number; y: number }[]>
    >;
    thirdSet: { x: number; y: number }[];
    setThirdSet: React.Dispatch<
      React.SetStateAction<{ x: number; y: number }[]>
    >;
  };
  updateXPoints: (innerWidth: number) => void;
};

export const GraphContext = createContext<GraphContextType | undefined>(
  undefined
);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  // Default width for initial setup - will be updated by LineGraph component
  const defaultInnerWidth = 500;
  const xPoints = [
    Math.floor(defaultInnerWidth * 0.125),
    Math.floor(defaultInnerWidth * 0.5),
    Math.floor(defaultInnerWidth * 0.875),
  ];
  const [singleSet, setSingleSet] = useState(
    xPoints.map((x) => ({ x, y: 0.5 }))
  );
  const [mainSet, setMainSet] = useState(xPoints.map((x) => ({ x, y: 0.5 })));
  const [secondSet, setSecondSet] = useState(
    xPoints.map((x, i) => ({ x, y: [0.6, 0.4, 0.7][i] }))
  );
  const [thirdSet, setThirdSet] = useState(
    xPoints.map((x, i) => ({ x, y: [0.3, 0.6, 0.5][i] }))
  );

  const updateXPoints = (innerWidth: number) => {
    const newXPoints = [
      Math.floor(innerWidth * 0.125),
      Math.floor(innerWidth * 0.5),
      Math.floor(innerWidth * 0.875),
    ];

    setSingleSet((prev) =>
      prev.map((point, i) => ({ ...point, x: newXPoints[i] }))
    );
    setMainSet((prev) =>
      prev.map((point, i) => ({ ...point, x: newXPoints[i] }))
    );
    setSecondSet((prev) =>
      prev.map((point, i) => ({ ...point, x: newXPoints[i] }))
    );
    setThirdSet((prev) =>
      prev.map((point, i) => ({ ...point, x: newXPoints[i] }))
    );
  };

  return (
    <GraphContext.Provider
      value={{
        single: { singleSet, setSingleSet },
        multiple: {
          mainSet,
          setMainSet,
          secondSet,
          setSecondSet,
          thirdSet,
          setThirdSet,
        },
        updateXPoints,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export function useGraph() {
  return useContext(GraphContext);
}
