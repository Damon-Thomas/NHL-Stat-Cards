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
 * Converts an image URL to base64 with multiple fallback strategies
 */
const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  console.log("Converting image URL to base64:", imageUrl);

  // If it's already a data URL, return it
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // Strategy 1: Try direct canvas conversion (works for same-origin)
  try {
    const result = await createImageFromUrl(imageUrl);
    console.log("Direct canvas conversion successful");
    return result;
  } catch (error) {
    console.log("Direct canvas failed, trying proxy approach:", error);
  }

  // Strategy 2: Try CORS proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      imageUrl
    )}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });

    console.log("Proxy conversion successful");
    return base64;
  } catch (error) {
    console.log("Proxy conversion failed:", error);
  }

  // Strategy 3: Try alternative proxy
  try {
    const altProxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
    const response = await fetch(altProxyUrl);

    if (!response.ok) {
      throw new Error(`Alternative proxy failed: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });

    console.log("Alternative proxy conversion successful");
    return base64;
  } catch (error) {
    console.log("Alternative proxy failed, using placeholder:", error);
  }

  // Final fallback: Create placeholder
  console.log("All conversion methods failed, using placeholder");
  return createPlaceholderImage();
};

/**
 * Creates a clean image from URL using a fresh canvas
 */
const createImageFromUrl = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Try to enable CORS

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.naturalWidth || img.width || 40;
      canvas.height = img.naturalHeight || img.height || 40;

      try {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
};

/**
 * Creates a placeholder image that looks like an NHL team logo
 */
const createPlaceholderImage = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkM5LjUgMjYgMSAxNy41IDEgN0MxIDYuNDQ3NzIgMS40NDc3MiA2IDIgNkgzOEMzOC41NTIzIDYgMzkgNi40NDc3MiAzOSA3QzM5IDE3LjUgMzAuNSAyNiAyMCAyNloiIGZpbGw9IiM5Q0E0QjAiLz4KPC9zdmc+";
  }

  canvas.width = 100;
  canvas.height = 100;

  // Create a circular background
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(50, 50, 45, 0, 2 * Math.PI);
  ctx.fill();

  // Add a border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(50, 50, 42, 0, 2 * Math.PI);
  ctx.stroke();

  // Add NHL text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NHL", 50, 50);

  return canvas.toDataURL("image/png");
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
 * Downloads an element as a PNG image exactly as it appears on screen
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
  } = options;

  try {
    console.log("Starting PNG download process...");

    // Get the current dimensions of the element
    const rect = element.getBoundingClientRect();
    console.log("Element dimensions:", rect);

    // Create a temporary wrapper that matches the element's size
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "-9999px";
    wrapper.style.left = "-9999px";
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;
    wrapper.style.background = backgroundColor;
    wrapper.style.overflow = "hidden";
    wrapper.style.zIndex = "-1000";
    wrapper.style.pointerEvents = "none";

    // Clone the element and preserve all computed styles
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Copy all computed styles to preserve exact appearance
    const computedStyle = window.getComputedStyle(element);
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      clonedElement.style.setProperty(
        property,
        computedStyle.getPropertyValue(property),
        computedStyle.getPropertyPriority(property)
      );
    }

    // Ensure the cloned element fills the wrapper exactly
    clonedElement.style.width = "100%";
    clonedElement.style.height = "100%";
    clonedElement.style.margin = "0";
    clonedElement.style.padding = computedStyle.padding;
    clonedElement.style.boxSizing = "border-box";

    wrapper.appendChild(clonedElement);
    document.body.appendChild(wrapper);

    // Handle images in the cloned element
    const clonedImages = wrapper.querySelectorAll("img");
    console.log(`Found ${clonedImages.length} images to process`);

    // Process each image individually
    for (let i = 0; i < clonedImages.length; i++) {
      const img = clonedImages[i];
      const originalSrc = img.src;

      try {
        // Try to convert to base64
        const base64 = await imageUrlToBase64(originalSrc);
        img.src = base64;
        console.log(`Converted image ${i + 1}/${clonedImages.length}`);
      } catch (error) {
        console.warn(
          `Failed to convert image ${i + 1}, using placeholder:`,
          error
        );
        img.src = createPlaceholderImage();
      }

      // Remove event handlers to prevent interference
      img.onload = null;
      img.onerror = null;
      img.removeAttribute("onload");
      img.removeAttribute("onerror");
    }

    console.log("All images processed, waiting for render...");

    // Wait for everything to settle
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Generating canvas with html2canvas...");

    // Generate canvas with settings optimized for exact reproduction
    const canvas = await html2canvas(wrapper, {
      backgroundColor,
      scale,
      useCORS: false,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      removeContainer: false,
      foreignObjectRendering: false,
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: rect.width,
      windowHeight: rect.height,
      ignoreElements: (element) => {
        // Skip dropdown menus and overlays
        return (
          element.classList.contains("absolute") &&
          (element.classList.contains("z-10") ||
            element.classList.contains("z-20"))
        );
      },
    });

    console.log("Canvas generated successfully");

    // Clean up
    document.body.removeChild(wrapper);

    // Create download
    const link = document.createElement("a");
    link.download = filename || generateFilename(player, teamName);
    link.href = canvas.toDataURL("image/png", quality);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("PNG download completed!");
  } catch (error) {
    console.error("Error generating PNG:", error);
    throw new Error(
      `Failed to generate PNG: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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

// Future handleDownload function using modern-screenshot
// Uncomment this when you have a 2nd hidden card element
// Use this for consistently sized pngs

// const handleDownload = async () => {
//   const element = document.getElementById('hidden-card');

//   if (!element) return;

//   const png = await modernScreenshot.domToPng(element, {
//     width: 800,
//     height: 450,
//     scale: 2, // for high-res export
//   });

//   const link = document.createElement('a');
//   link.href = png;
//   link.download = 'stat-card.png';
//   link.click();
// };
