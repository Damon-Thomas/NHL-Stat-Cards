/**
 * Utility to get local team logo paths
 * Maps team abbreviations to static logo file paths
 */
export function getTeamLogoPath(teamAbbrev: string | undefined): string {
  if (!teamAbbrev) {
    return "/nhl-seeklogo.png";
  }

  // Map team abbreviations to local logo paths
  const logoMap: Record<string, string> = {
    ANA: "/logos/nhl/anaheim-ducks-2024-seeklogo.png",
    ARI: "/nhl-seeklogo.png", // Need to add Arizona logo
    BOS: "/logos/nhl/Boston_Bruins.svg",
    BUF: "/logos/nhl/Buffalo_Sabres.svg",
    CAR: "/logos/nhl/Carolina_Hurricanes.svg",
    CBJ: "/logos/nhl/Columbus_Blue_Jackets.svg",
    CGY: "/logos/nhl/Calgary_Flames.svg",
    CHI: "/logos/nhl/Chicago_Blackhawks.svg",
    COL: "/logos/nhl/Colorado_Avalanche.svg",
    DAL: "/logos/nhl/Dallas_Stars.svg",
    DET: "/logos/nhl/Detroit_Red_Wings.svg",
    EDM: "/logos/nhl/Edmonton_Oilers.svg",
    FLA: "/logos/nhl/Florida_Panthers.svg",
    LAK: "/logos/nhl/Los_Angeles_Kings.svg",
    MIN: "/logos/nhl/Minnesota_Wild.svg",
    MTL: "/logos/nhl/Montreal_Canadiens.svg",
    NJD: "/logos/nhl/New_Jersey_Devils.svg",
    NSH: "/logos/nhl/Nashville_Predators.svg",
    NYI: "/logos/nhl/New_York_Islanders.svg",
    NYR: "/logos/nhl/New_York_Rangers.svg",
    OTT: "/logos/nhl/Ottawa_Senators.svg",
    PHI: "/logos/nhl/Philadelphia_Flyers.svg",
    PIT: "/logos/nhl/Pittsburgh_Penguins.svg",
    SEA: "/logos/nhl/Seattle_Kraken.svg",
    SJS: "/logos/nhl/San_Jose_Sharks.svg",
    STL: "/logos/nhl/St._Louis_Blues.svg",
    TBL: "/logos/nhl/Tampa_Bay_Lightning.svg",
    TOR: "/logos/nhl/Toronto_Maple_Leafs.svg",
    UTA: "/nhl-seeklogo.png", // Need to add Utah logo
    VAN: "/logos/nhl/Vancouver_Canucks.svg",
    VGK: "/logos/nhl/Vegas_Golden_Knights.svg",
    WPG: "/logos/nhl/Winnipeg_Jets.svg",
    WSH: "/logos/nhl/Washington_Capitals.svg",
  };

  return logoMap[teamAbbrev] || "/nhl-seeklogo.png";
}
