import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Define the shape of the stats context
type StatContextType = {
  war: {
    stat: number;
    setStat: React.Dispatch<React.SetStateAction<number>>;
  };
  otherStats: {
    evo: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    evd: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    pp: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    pk: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    fin: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    goal: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    fas: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    pen: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    comp: {
      stat: number;
      setStat: React.Dispatch<React.SetStateAction<number>>;
    };
    team: {
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
          evo: { stat: evostatValue, setStat: setEVOstatValue },
          evd: { stat: evdstatValue, setStat: setEVDstatValue },
          pp: { stat: ppstatValue, setStat: setPPstatValue },
          pk: { stat: pkstatValue, setStat: setPKStatValue },
          fin: { stat: finstatValue, setStat: setFINStatValue },
          goal: { stat: goalstatValue, setStat: setGOALStatValue },
          fas: { stat: fasstatValue, setStat: setFASStatValue },
          pen: { stat: penstatValue, setStat: setPENStatValue },
          comp: { stat: compstatValue, setStat: setCOMPStatValue },
          team: { stat: teamstatValue, setStat: setTEAMStatValue },
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
