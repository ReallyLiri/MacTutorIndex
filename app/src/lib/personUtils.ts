import { Mathematician } from "@/types";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function formatYear(year: number | null, approx: boolean): string {
  if (year === null) return "Unknown";
  return `${approx ? "c. " : ""}${year}`;
}

export function formatPlace(place: string, link?: string): string {
  if (!place) return "Unknown";
  return place;
}

export function createMacTutorUrl(mathematician: Mathematician): string {
  return `https://mathshistory.st-andrews.ac.uk/Biographies/${mathematician.id}`;
}

export function createCitationUrl(name: string, text: string): string {
  const baseUrl = "https://mathshistory.st-andrews.ac.uk/Biographies/";
  const formattedName = name.split(" ").pop();
  return `${baseUrl}${formattedName}/#:~:text=${encodeURIComponent(text)}`;
}

export function formatSummaryText(text: string): string {
  if (!text) return "";
  
  const parts = text.split(/(_[^_]+_)/g);
  
  return parts.map(part => {
    if (part.match(/^_[^_]+_$/)) {
      const italicText = part.slice(1, -1);
      return italicText;
    }
    return part;
  }).join("");
}