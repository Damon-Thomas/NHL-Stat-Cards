export const teamColors: Record<
  string,
  { primary: string; secondary: string; accent: string }
> = {
  ANA: { primary: "#F47A38", secondary: "#B09862", accent: "#C1C6C8" },
  ARI: { primary: "#8C2633", secondary: "#E2D6B5", accent: "#111111" },
  BOS: { primary: "#FFB81C", secondary: "#000000", accent: "#FFFFFF" },
  BUF: { primary: "#003087", secondary: "#FFB81C", accent: "#C8102E" },
  CGY: { primary: "#C8102E", secondary: "#F1BE48", accent: "#000000" },
  CAR: { primary: "#CC0000", secondary: "#000000", accent: "#A2AAAD" },
  CHI: { primary: "#CF0A2C", secondary: "#000000", accent: "#FFFFFF" },
  COL: { primary: "#6F263D", secondary: "#236192", accent: "#A2AAAD" },
  CBJ: { primary: "#002654", secondary: "#CE1126", accent: "#A4A9AD" },
  DAL: { primary: "#006847", secondary: "#8F8F8C", accent: "#000000" },
  DET: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#000000" },
  EDM: { primary: "#041E42", secondary: "#FF4C00", accent: "#FFFFFF" },
  FLA: { primary: "#041E42", secondary: "#C8102E", accent: "#B9975B" },
  LAK: { primary: "#111111", secondary: "#A2AAAD", accent: "#FFFFFF" },
  MIN: { primary: "#154734", secondary: "#A6192E", accent: "#EAAA00" },
  MTL: { primary: "#AF1E2D", secondary: "#192168", accent: "#FFFFFF" },
  NSH: { primary: "#FFB81C", secondary: "#041E42", accent: "#FFFFFF" },
  NJD: { primary: "#CE1126", secondary: "#000000", accent: "#FFFFFF" },
  NYI: { primary: "#00539B", secondary: "#F47D30", accent: "#FFFFFF" },
  NYR: { primary: "#0038A8", secondary: "#CE1126", accent: "#FFFFFF" },
  OTT: { primary: "#C52032", secondary: "#000000", accent: "#CBA044" },
  PHI: { primary: "#F74902", secondary: "#000000", accent: "#FFFFFF" },
  PIT: { primary: "#000000", secondary: "#CFC493", accent: "#FFFFFF" },
  SJS: { primary: "#006D75", secondary: "#EA7200", accent: "#000000" },
  SEA: { primary: "#99D9D9", secondary: "#001628", accent: "#68A8B3" },
  STL: { primary: "#002F87", secondary: "#FCB514", accent: "#FFFFFF" },
  TBL: { primary: "#002868", secondary: "#FFFFFF", accent: "#000000" },
  TOR: { primary: "#003E7E", secondary: "#FFFFFF", accent: "#000000" },
  VAN: { primary: "#001F5B", secondary: "#00843D", accent: "#FFFFFF" },
  VGK: { primary: "#B4975A", secondary: "#333F42", accent: "#000000" },
  WSH: { primary: "#C8102E", secondary: "#041E42", accent: "#FFFFFF" },
  WPG: { primary: "#041E42", secondary: "#004C97", accent: "#AC162C" },
  UTA: { primary: "#69B3E7", secondary: "#000000", accent: "#FFFFFF" },
};

// Default team colors for fallback
export const DEFAULT_TEAM_COLORS = {
  primary: "#000000",
  secondary: "#764ba2",
  accent: "#ffffff",
};

export const getTeamColors = (teamAbbrev: string) => {
  return teamColors[teamAbbrev] || DEFAULT_TEAM_COLORS;
};
