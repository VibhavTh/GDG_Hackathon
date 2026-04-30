"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import {
  deleteGalleryPhoto,
  setAlbumCover,
} from "@/app/(storefront)/gallery/actions";

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
  currentUserId: string | null;
  albumId?: string;
  coverPhotoId?: string | null;
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

export function GalleryGrid({
  photos,
  userRole,
  currentUserId,
  albumId,
  coverPhotoId,
}: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingCover, setSettingCover] = useState<string | null>(null);
  const [optimisticCoverId, setOptimisticCoverId] = useState<string | null>(
    coverPhotoId ?? null
  );

  const isFarmer = userRole === "vendor" || userRole === "admin";
  const activeCoverId = optimisticCoverId ?? coverPhotoId ?? null;

  function canDelete(photo: GalleryPhoto): boolean {
    if (isFarmer) return true;
    return !!currentUserId && photo.uploaded_by === currentUserId;
  }

  async function handleSetCover(photoId: string) {
    if (!albumId) return;
    const previous = optimisticCoverId;
    setOptimisticCoverId(photoId);
    setSettingCover(photoId);
    const result = await setAlbumCover(albumId, photoId);
    if (result.error) {
      setOptimisticCoverId(previous);
      alert(result.error);
    }
    setSettingCover(null);
  }

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

  async function handleDownload(photo: GalleryPhoto) {
    try {
      const response = await fetch(photo.image_url, { mode: "cors" });
      const blob = await response.blob();
      const ext = (photo.image_url.split(".").pop() || "jpg").split("?")[0];
      const safeCaption =
        photo.caption?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "photo";
      const filename = `green-market-${safeCaption}-${photo.id.slice(0, 8)}.${ext}`;
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback: open the image in a new tab so the user can long-press / right-click to save.
      window.open(photo.image_url, "_blank", "noopener,noreferrer");
    }
  }

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
            : "Be the first to add a photo to this album."}
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

              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(photo);
                  }}
                  className="bg-tertiary/60 text-on-tertiary rounded-full p-2 hover:bg-secondary transition-colors"
                  aria-label="Download photo"
                  title="Download"
                >
                  <Icon name="download" size="sm" />
                </button>
                {isFarmer && albumId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCover(photo.id);
                    }}
                    disabled={settingCover === photo.id}
                    className="bg-tertiary/60 text-on-tertiary rounded-full p-2 hover:bg-primary transition-colors disabled:opacity-50"
                    aria-label={
                      activeCoverId === photo.id
                        ? "Current cover photo"
                        : "Set as cover"
                    }
                    title={
                      activeCoverId === photo.id
                        ? "Current cover"
                        : "Set as cover"
                    }
                  >
                    <Icon
                      name={
                        settingCover === photo.id ? "progress_activity" : "star"
                      }
                      fill={activeCoverId === photo.id}
                      size="sm"
                      className={
                        settingCover === photo.id ? "animate-spin" : ""
                      }
                    />
                  </button>
                )}
                {canDelete(photo) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    disabled={deleting === photo.id}
                    className="bg-tertiary/60 text-on-tertiary rounded-full p-2 hover:bg-error transition-colors disabled:opacity-50"
                    aria-label="Delete photo"
                  >
                    <Icon
                      name={
                        deleting === photo.id ? "progress_activity" : "delete"
                      }
                      size="sm"
                      className={deleting === photo.id ? "animate-spin" : ""}
                    />
                  </button>
                )}
              </div>
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

          {/* Top-right controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
            <button
              className="text-on-tertiary/70 hover:text-on-tertiary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedPhoto);
              }}
              aria-label="Download photo"
              title="Download"
            >
              <Icon name="download" className="text-3xl" />
            </button>
            <button
              className="text-on-tertiary/70 hover:text-on-tertiary transition-colors"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close"
            >
              <Icon name="close" className="text-3xl" />
            </button>
          </div>

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
