// Brand gradient palette keyed off CodePress colors
// Brand hexes: cyan #00B9FF, magenta #FC83F5, yellow #F7CF1D, black #000000
// Using lighter, more pastel variants for better readability with dark text
// Each entry is [from, to]
const GRADIENTS: Array<[string, string]> = [
  // Light pastel cross-blends with soft contrast
  ["#E6F7FF", "#FEF0FD"], // light cyan → light magenta
  ["#E6F7FF", "#FEFBF0"], // light cyan → light yellow
  ["#FEF0FD", "#FEFBF0"], // light magenta → light yellow

  // Light brand colors with subtle gradients
  ["#E6F7FF", "#F0F9FF"], // very light cyan → lighter cyan
  ["#FEF0FD", "#FCF5FE"], // very light magenta → lighter magenta
  ["#FEFBF0", "#FDF8E8"], // very light yellow → lighter yellow

  // Soft tonal variations for subtle depth
  ["#F0F9FF", "#E0F2FE"], // light cyan spectrum
  ["#FCF5FE", "#F8E8FC"], // light magenta spectrum
  ["#FDF8E8", "#FBF3D3"], // light yellow spectrum

  // Mixed with very light grays for neutral options
  ["#F8FAFC", "#F1F5F9"], // light gray spectrum
  ["#FEFEFE", "#F9FAFB"], // very light neutrals
  ["#F5F5F5", "#EEEEEE"], // subtle gray gradients
];

// Corresponding dark text colors for each gradient (same index mapping)
const TEXT_COLORS: string[] = [
  // Dark versions of the light pastel cross-blends
  "#0369A1", // dark cyan (for light cyan → light magenta)
  "#0369A1", // dark cyan (for light cyan → light yellow)
  "#BE185D", // dark magenta (for light magenta → light yellow)

  // Dark brand colors for light brand gradients
  "#0369A1", // dark cyan (for very light cyan → lighter cyan)
  "#BE185D", // dark magenta (for very light magenta → lighter magenta)
  "#CA8A04", // dark yellow (for very light yellow → lighter yellow)

  // Dark versions for soft tonal variations
  "#0284C7", // medium-dark cyan (for light cyan spectrum)
  "#C2185B", // medium-dark magenta (for light magenta spectrum)
  "#D97706", // medium-dark yellow (for light yellow spectrum)

  // Dark grays for neutral options
  "#374151", // dark gray (for light gray spectrum)
  "#4B5563", // darker gray (for very light neutrals)
  "#6B7280", // medium gray (for subtle gray gradients)
];

function stringHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGradientCSSBySeed(seed: string): string {
  const hash = stringHash(seed || "seed");
  const idx = hash % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];
  // 135deg matches many avatar libraries' default angle
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

export function getTextColorBySeed(seed: string): string {
  const hash = stringHash(seed || "seed");
  const idx = hash % GRADIENTS.length;
  return TEXT_COLORS[idx];
}

export { GRADIENTS };
