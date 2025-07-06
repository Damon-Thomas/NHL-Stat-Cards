import { useEffect } from "react";

/**
 * Component to preload team logos for instant loading
 */
export default function ImagePreloader() {
  useEffect(() => {
    // Most common team logos to preload
    const commonLogos = [
      "/nhl-seeklogo.png",
      "/logos/nhl/Boston_Bruins.svg",
      "/logos/nhl/Toronto_Maple_Leafs.svg",
      "/logos/nhl/Montreal_Canadiens.svg",
      "/logos/nhl/New_York_Rangers.svg",
      "/logos/nhl/Pittsburgh_Penguins.svg",
      "/logos/nhl/Chicago_Blackhawks.svg",
      "/logos/nhl/Detroit_Red_Wings.svg",
      "/logos/nhl/Los_Angeles_Kings.svg",
      "/logos/nhl/Tampa_Bay_Lightning.svg",
    ];

    // Preload images
    commonLogos.forEach((logoPath) => {
      const img = new Image();
      img.src = logoPath;
    });
  }, []);

  return null; // This component doesn't render anything
}
