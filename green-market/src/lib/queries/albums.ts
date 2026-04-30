import { createServiceClient } from "@/lib/supabase/server";

export type AlbumEvent = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  end_date: string | null;
  location: string | null;
};

export type Album = {
  id: string;
  event_id: string | null;
  name: string;
  cover_photo_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AlbumWithEvent = {
  album: Album;
  event: AlbumEvent | null;
};

export type AlbumWithStats = AlbumWithEvent & {
  photo_count: number;
  cover_image_url: string | null;
};

export type GalleryPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: string | null;
  album_id: string;
  created_at: string;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Resolve the active event: current (today within event_date..end_date) else most recent past.
async function resolveActiveEvent(): Promise<AlbumEvent | null> {
  const service = createServiceClient();
  const t = today();

  const { data: current } = await service
    .from("events")
    .select("id, title, event_date, event_time, end_date, location")
    .lte("event_date", t)
    .order("event_date", { ascending: false })
    .limit(20);

  const currentMatch =
    current?.find(
      (e) => (e.end_date ?? e.event_date) >= t && e.event_date <= t
    ) ?? null;

  if (currentMatch) return currentMatch;

  const { data: past } = await service
    .from("events")
    .select("id, title, event_date, event_time, end_date, location")
    .lt("event_date", t)
    .order("event_date", { ascending: false })
    .limit(1);

  return past?.[0] ?? null;
}

export async function getActiveAlbum(): Promise<AlbumWithEvent | null> {
  const event = await resolveActiveEvent();
  if (!event) return null;

  const service = createServiceClient();
  const { data: album } = await service
    .from("albums")
    .select("*")
    .eq("event_id", event.id)
    .single();

  if (!album) return null;
  return { album, event };
}

export async function getAlbumById(
  albumId: string
): Promise<AlbumWithEvent | null> {
  const service = createServiceClient();
  const { data: album } = await service
    .from("albums")
    .select("*")
    .eq("id", albumId)
    .single();

  if (!album) return null;

  let event: AlbumEvent | null = null;
  if (album.event_id) {
    const { data } = await service
      .from("events")
      .select("id, title, event_date, event_time, end_date, location")
      .eq("id", album.event_id)
      .single();
    event = data ?? null;
  }
  return { album, event };
}

export async function getAlbumPhotos(albumId: string): Promise<GalleryPhoto[]> {
  const service = createServiceClient();
  const { data } = await service
    .from("gallery_photos")
    .select("*")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });
  return (data ?? []) as GalleryPhoto[];
}

export async function getAllAlbumsWithStats(): Promise<AlbumWithStats[]> {
  const service = createServiceClient();

  const { data: albums } = await service
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false });

  if (!albums || albums.length === 0) return [];

  const eventIds = albums.map((a) => a.event_id).filter(Boolean) as string[];
  const { data: events } = eventIds.length
    ? await service
        .from("events")
        .select("id, title, event_date, event_time, end_date, location")
        .in("id", eventIds)
    : { data: [] as AlbumEvent[] };

  const eventById = new Map((events ?? []).map((e) => [e.id, e]));

  const { data: photos } = await service
    .from("gallery_photos")
    .select("id, image_url, album_id, created_at")
    .in(
      "album_id",
      albums.map((a) => a.id)
    )
    .order("created_at", { ascending: false });

  const countByAlbum = new Map<string, number>();
  const firstPhotoByAlbum = new Map<string, string>();
  for (const p of photos ?? []) {
    countByAlbum.set(p.album_id, (countByAlbum.get(p.album_id) ?? 0) + 1);
    if (!firstPhotoByAlbum.has(p.album_id)) {
      firstPhotoByAlbum.set(p.album_id, p.image_url);
    }
  }

  const photoById = new Map((photos ?? []).map((p) => [p.id, p.image_url]));

  return albums.map((album) => {
    const cover_image_url = album.cover_photo_id
      ? (photoById.get(album.cover_photo_id) ?? null)
      : (firstPhotoByAlbum.get(album.id) ?? null);
    return {
      album,
      event: album.event_id ? (eventById.get(album.event_id) ?? null) : null,
      photo_count: countByAlbum.get(album.id) ?? 0,
      cover_image_url,
    };
  });
}

// Mirror of the SQL is_active_album() function. Use in server actions before
// trusting client-provided albumId values for customer uploads.
export async function isActiveAlbum(albumId: string): Promise<boolean> {
  const active = await getActiveAlbum();
  return active?.album.id === albumId;
}
