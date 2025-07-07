/**
 * Interpolates between colors based on a value (1-99)
 * @param value - The value (1-99) to interpolate for
 * @param scale - The scale type: 'blue' for high values = blue, 'red' for high values = red
 * @returns The interpolated color as a hex string
 */
export function interpolateColor(
  value: number,
  scale: "blue" | "red" = "blue"
): string {
  // Clamp value between 1 and 99
  const clampedValue = Math.max(1, Math.min(99, value));

  // Define colors (hex values from CSS variables)
  const maxBlue = "#79bef8";
  const maxRed = "#fe4f6d";
  const neutral = "#f6f6f6";

  // Calculate interpolation factor (0 to 1)
  // Values 1-49 interpolate from max color to neutral
  // Values 50-99 interpolate from neutral to max color
  let factor: number;
  let startColor: string;
  let endColor: string;

  if (scale === "blue") {
    // For blue scale: 1 = red, 50 = neutral, 99 = blue
    if (clampedValue <= 50) {
      factor = (50 - clampedValue) / 49; // 1 -> 1, 50 -> 0
      startColor = neutral;
      endColor = maxRed;
    } else {
      factor = (clampedValue - 50) / 49; // 50 -> 0, 99 -> 1
      startColor = neutral;
      endColor = maxBlue;
    }
  } else {
    // For red scale: 1 = blue, 50 = neutral, 99 = red
    if (clampedValue <= 50) {
      factor = (50 - clampedValue) / 49; // 1 -> 1, 50 -> 0
      startColor = neutral;
      endColor = maxBlue;
    } else {
      factor = (clampedValue - 50) / 49; // 50 -> 0, 99 -> 1
      startColor = neutral;
      endColor = maxRed;
    }
  }

  return interpolateHexColors(startColor, endColor, factor);
}

/**
 * Interpolates between two hex colors
 * @param color1 - Start color in hex format
 * @param color2 - End color in hex format
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated color as hex string
 */
function interpolateHexColors(
  color1: string,
  color2: string,
  factor: number
): string {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  // Interpolate each channel
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Converts hex color to RGB object
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
