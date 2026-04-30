// Client-safe constants and types for location statuses.
// Anything in this file must NOT touch server-only APIs (next/headers, service client).

export type StatusValue = "open" | "closed" | "closed_for_season";

export type StatusOption = {
  value: StatusValue;
  label: string;
  tone: "open" | "closed";
};

export const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: "open", label: "Open", tone: "open" },
  { value: "closed", label: "Closed", tone: "closed" },
  { value: "closed_for_season", label: "Closed for the season", tone: "closed" },
] as const;

export const LOCATION_DEFINITIONS = [
  {
    slug: "greenhouse_farm_stand",
    name: "Greenhouse and Farm Stand",
    image: "/events/greenhousefarmstand_gmf.jpg",
  },
  {
    slug: "blacksburg_farmers_market",
    name: "The Blacksburg Farmer's Market",
    image: "/events/blacksburgfarmersmarket_gmf.jpg",
  },
  {
    slug: "annie_kays_fruit_stand",
    name: "Fruit Stand at Annie Kay's",
    image: "/events/anniekays_gmf.jpg",
  },
] as const;

export type LocationStatus = {
  slug: string;
  status: StatusValue;
  note: string | null;
};

export type StatusMap = Record<string, LocationStatus>;

export function statusLabel(value: StatusValue): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function statusTone(value: StatusValue): "open" | "closed" {
  return STATUS_OPTIONS.find((o) => o.value === value)?.tone ?? "closed";
}
