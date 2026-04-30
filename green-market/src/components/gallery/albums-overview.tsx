import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import type { AlbumWithStats } from "@/lib/queries/albums";

interface AlbumsOverviewProps {
  albums: AlbumWithStats[];
}

function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AlbumsOverview({ albums }: AlbumsOverviewProps) {
  if (albums.length === 0) {
    return (
      <div className="py-24 text-center bg-surface-container-low rounded-2xl">
        <Icon
          name="photo_library"
          className="text-5xl text-on-surface-variant/40 mb-4"
        />
        <p className="font-headline italic text-2xl text-tertiary mb-2">
          No albums yet.
        </p>
        <p className="text-on-surface-variant font-body">
          Create an event in the dashboard to start a new album.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 stagger-children">
      {albums.map((a, i) => {
        const title = a.event?.title ?? a.album.name;
        const date = a.event ? formatDate(a.event.event_date) : null;
        return (
          <Link
            key={a.album.id}
            href={`/gallery/${a.album.id}`}
            className="group relative block bg-surface-container-low rounded-2xl overflow-hidden animate-slide-up-fast hover:bg-surface-container transition-colors"
            style={{ animationDelay: `${(i % 6) * 60}ms` }}
          >
            <div className="relative aspect-[4/3] bg-surface-container-highest">
              {a.cover_image_url ? (
                <Image
                  src={a.cover_image_url}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon
                    name="photo_library"
                    className="text-5xl text-on-surface-variant/30"
                  />
                </div>
              )}
              <span className="absolute top-3 right-3 bg-tertiary/70 text-on-tertiary rounded-full px-3 py-1 text-[11px] font-label tracking-wider">
                {a.photo_count} {a.photo_count === 1 ? "photo" : "photos"}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-headline italic text-xl text-tertiary leading-tight">
                {title}
              </h3>
              {date && (
                <p className="text-on-surface-variant font-body text-sm mt-1">
                  {date}
                </p>
              )}
              {!a.event && (
                <p className="text-on-surface-variant/60 font-body text-xs mt-1">
                  No linked event
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
