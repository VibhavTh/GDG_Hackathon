import { createServiceClient } from "@/lib/supabase/server";
import type { LocationStatus, StatusMap } from "./location-statuses-shared";

export {
  STATUS_OPTIONS,
  LOCATION_DEFINITIONS,
  statusLabel,
  statusTone,
} from "./location-statuses-shared";
export type {
  StatusValue,
  StatusOption,
  LocationStatus,
  StatusMap,
} from "./location-statuses-shared";

export async function getLocationStatuses(): Promise<StatusMap> {
  const service = createServiceClient();
  const { data } = await service
    .from("location_statuses")
    .select("slug, status, note");

  const map: StatusMap = {};
  for (const row of data ?? []) {
    map[row.slug] = row as LocationStatus;
  }
  return map;
}
