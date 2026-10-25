/**
 * Maps availability strings to CSS modifier classes.
 * Accustoms all availability dropdown options to distinct tactile color schemes.
 */
export function getAvailabilityClass(availability: string): string {
  const norm = (availability || "").toLowerCase();
  if (norm.includes("full-time") || norm.includes("opportunities") || norm.includes("open")) {
    return "avail-open";
  }
  if (norm.includes("freelance") || norm.includes("contract")) {
    return "avail-freelance";
  }
  if (norm.includes("limited") || norm.includes("partially") || norm.includes("consulting")) {
    return "avail-limited";
  }
  if (norm.includes("exploring") || norm.includes("inquir") || norm.includes("idea")) {
    return "avail-exploring";
  }
  if (norm.includes("busy") || norm.includes("unavail") || norm.includes("closed")) {
    return "avail-busy";
  }
  return "avail-open";
}
