"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { deleteGalleryPhoto } from "@/app/(storefront)/gallery/actions";

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

interface GalleryGridProps {
  photos: GalleryPhoto[];
  userRole: "vendor" | "customer" | "admin" | null;
  userId: string | null;
}

// Repeating span pattern for bento variety
// Classes must be written in full for Tailwind to detect them at build time
const SPAN_CLASSES = [
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-7",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-6",
  "md:col-span-6",
];
const SPAN_VALUES = [7, 5, 5, 7, 4, 4, 4, 6, 6];
const MIN_HEIGHTS = [420, 280, 280, 380, 260, 260, 260, 320, 320];

export function GalleryGrid({ photos, userRole, userId }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const isFarmer = userRole === "vendor";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPhoto) {
        setSelectedPhoto(null);
      }
    },
    [selectedPhoto]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleDelete(photoId: string) {
    if (!confirm("Remove this photo from the gallery?")) return;
    setDeleting(photoId);
    const result = await deleteGalleryPhoto(photoId);
    if (result.error) {
      alert(result.error);
    }
    setDeleting(null);
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="py-24 text-center bg-surface-container-low rounded-2xl">
        <Icon
          name="photo_library"
          className="text-5xl text-on-surface-variant/40 mb-4"
        />
        <p className="font-headline italic text-2xl text-tertiary mb-2">
          No photos yet.
        </p>
        <p className="text-on-surface-variant font-body">
          {isFarmer
            ? "Share moments from the farm by uploading your first photo."
            : "Check back soon for photos from the farm."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 stagger-children">
        {photos.map((photo, i) => {
          const patternIndex = i % SPAN_CLASSES.length;
          const spanClass = SPAN_CLASSES[patternIndex];
          const spanVal = SPAN_VALUES[patternIndex];
          const minH = MIN_HEIGHTS[patternIndex];
          const isOwner = userId && photo.uploaded_by === userId;

          return (
            <div
              key={photo.id}
              className={`${spanClass} group relative overflow-hidden rounded-2xl bg-surface-container-highest cursor-pointer animate-slide-up-fast`}
              style={{
                minHeight: `${minH}px`,
                animationDelay: `${(i % 6) * 60}ms`,
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={photo.image_url}
                alt={photo.caption || "Farm gallery photo"}
                fill
                sizes={`(max-width: 768px) 50vw, ${Math.round((spanVal / 12) * 100)}vw`}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />

              {/* Caption overlay */}
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tertiary/80 via-tertiary/30 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-on-tertiary font-body text-sm line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Delete button for farmer's own photos */}
              {isFarmer && isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  disabled={deleting === photo.id}
                  className="absolute top-3 right-3 bg-tertiary/60 text-on-tertiary rounded-full p-2 opacity-0 group-hover:opacity-100 hover:bg-error transition-all duration-200 disabled:opacity-50"
                  aria-label="Delete photo"
                >
                  <Icon
                    name={deleting === photo.id ? "progress_activity" : "delete"}
                    size="sm"
                    className={deleting === photo.id ? "animate-spin" : ""}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="absolute inset-0 bg-tertiary/95 backdrop-blur-md" />

          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-on-tertiary/70 hover:text-on-tertiary transition-colors z-10"
            onClick={() => setSelectedPhoto(null)}
          >
            <Icon name="close" className="text-3xl" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] aspect-auto animate-slide-up-fast"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[80vh] rounded-xl overflow-hidden">
              <Image
                src={selectedPhoto.image_url}
                alt={selectedPhoto.caption || "Farm gallery photo"}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>

            {selectedPhoto.caption && (
              <p className="text-on-tertiary/80 font-body text-center mt-4 text-sm md:text-base">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
