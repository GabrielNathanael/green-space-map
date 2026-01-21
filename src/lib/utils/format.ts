export function formatArea(sqKm: number): string {
  if (!sqKm || sqKm === 0) return "0 m²";

  // If less than 0.01 km² (1 hectare), show in m²
  if (sqKm < 0.01) {
    const sqm = sqKm * 1000000;
    if (sqm < 1) return "< 1 m²";
    return `${Math.round(sqm).toLocaleString()} m²`;
  }

  // If less than 1 km², show in hectares
  if (sqKm < 1) {
    const ha = sqKm * 100;
    return `${ha.toFixed(1)} ha`;
  }

  // Otherwise show in km²
  return `${sqKm.toFixed(2)} km²`;
}

export function formatType(type: string): string {
  if (!type) return "Unknown";
  return type
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
