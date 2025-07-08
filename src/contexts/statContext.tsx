import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Define the shape of the stats context
export type StatContextType = {
  war: {
    stat: number;
    setStat: React.Dispatch<React.SetStateAction<number>>;
  };
  otherStats: {
    "EV Offense": {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    "EV Defense": {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    PP: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    PK: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    Finishing: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    Goals: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    "1st Assists": {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    Penalties: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    Competition: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    Teammates: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
  };
};

const StatContext = createContext<StatContextType | undefined>(undefined);

export const StatProvider = ({ children }: { children: ReactNode }) => {
  const [warstatValue, setWARStatValue] = useState<number>(99);
  const [evostatValue, setEVOstatValue] = useState<number>(99);
  const [evdstatValue, setEVDstatValue] = useState<number>(99);
  const [ppstatValue, setPPstatValue] = useState<number>(99);
  const [pkstatValue, setPKStatValue] = useState<number>(99);
  const [finstatValue, setFINStatValue] = useState<number>(99);
  const [goalstatValue, setGOALStatValue] = useState<number>(99);
  const [fasstatValue, setFASStatValue] = useState<number>(99);
  const [penstatValue, setPENStatValue] = useState<number>(99);
  const [compstatValue, setCOMPStatValue] = useState<number>(99);
  const [teamstatValue, setTEAMStatValue] = useState<number>(99);

  return (
    <StatContext.Provider
      value={{
        war: { stat: warstatValue, setStat: setWARStatValue },
        otherStats: {
          "EV Offense": { stat: evostatValue, setStat: setEVOstatValue },
          "EV Defense": { stat: evdstatValue, setStat: setEVDstatValue },
          PP: { stat: ppstatValue, setStat: setPPstatValue },
          PK: { stat: pkstatValue, setStat: setPKStatValue },
          Finishing: { stat: finstatValue, setStat: setFINStatValue },
          Goals: { stat: goalstatValue, setStat: setGOALStatValue },
          "1st Assists": { stat: fasstatValue, setStat: setFASStatValue },
          Penalties: { stat: penstatValue, setStat: setPENStatValue },
          Competition: { stat: compstatValue, setStat: setCOMPStatValue },
          Teammates: { stat: teamstatValue, setStat: setTEAMStatValue },
        },
      }}
    >
      {children}
    </StatContext.Provider>
  );
};

export const useStatContext = () => {
  const context = useContext(StatContext);
  if (!context) {
    throw new Error("useStatContext must be used within a StatProvider");
  }
  return context;
};
