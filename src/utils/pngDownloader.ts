import html2canvas from "html2canvas";

export interface DownloadOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface PlayerInfo {
  firstName?: string;
  lastName?: string;
}

/**
 * Waits for all images in the given element to load
 */
const waitForImagesToLoad = (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll("img");

  if (images.length === 0) {
    return Promise.resolve();
  }

  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const handleLoad = () => {
        img.removeEventListener("load", handleLoad);
        img.removeEventListener("error", handleLoad);
        resolve();
      };

      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleLoad);
    });
  });

  return Promise.all(imagePromises).then(() => {});
};

/**
 * Generates a filename for the player card
 */
const generateFilename = (
  player: PlayerInfo | null,
  teamName?: string
): string => {
  if (player?.firstName && player?.lastName) {
    return `${player.firstName}_${player.lastName}_NHL_Card.png`;
  }

  if (teamName) {
    return `${teamName}_NHL_Card.png`;
  }

  return "NHL_Player_Card.png";
};

/**
 * Downloads an element as a PNG image
 */
export const downloadElementAsPNG = async (
  element: HTMLElement,
  player: PlayerInfo | null = null,
  teamName?: string,
  options: DownloadOptions = {}
): Promise<void> => {
  const {
    filename,
    quality = 1.0,
    scale = 2,
    backgroundColor = "#ffffff",
    width,
    height,
  } = options;

  try {
    // Wait for all images to load
    await waitForImagesToLoad(element);

    // Generate canvas from the element
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS: true,
      allowTaint: true,
      width: width || element.offsetWidth,
      height: height || element.offsetHeight,
      onclone: (clonedDoc) => {
        // Ensure external images work in the cloned document
        const clonedImages = clonedDoc.querySelectorAll("img");
        clonedImages.forEach((img) => {
          img.crossOrigin = "anonymous";
        });
      },
    });

    // Create download link
    const link = document.createElement("a");
    link.download = filename || generateFilename(player, teamName);
    link.href = canvas.toDataURL("image/png", quality);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating PNG:", error);
    throw new Error("Failed to generate PNG. Please try again.");
  }
};

/**
 * React hook for PNG download functionality
 */
export const usePNGDownload = () => {
  const downloadAsPNG = async (
    elementRef: React.RefObject<HTMLElement | null>,
    player: PlayerInfo | null = null,
    teamName?: string,
    options: DownloadOptions = {}
  ): Promise<void> => {
    if (!elementRef.current) {
      throw new Error("Element reference is not available");
    }

    return downloadElementAsPNG(elementRef.current, player, teamName, options);
  };

  return { downloadAsPNG };
};
