"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { GalleryUploadModal } from "@/components/gallery/gallery-upload-modal";

interface GalleryHeaderProps {
  userRole: "vendor" | "customer" | "admin" | null;
  albumId: string | null;
  canUpload: boolean;
  eventTitle?: string | null;
}

export function GalleryHeader({
  userRole,
  albumId,
  canUpload,
  eventTitle,
}: GalleryHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const isFarmer = userRole === "vendor" || userRole === "admin";
  const isAnonymous = userRole === null;
  const showUpload = canUpload && !!albumId;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-4 mb-12">
        <div>
          <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3 block">
            Farm Life
          </span>
          <h1 className="font-headline italic text-4xl md:text-5xl text-tertiary leading-tight">
            {isFarmer ? (eventTitle ?? "Albums") : (eventTitle ?? "From the Farm")}
          </h1>
          {isFarmer ? (
            <InfoToggle
              description={
                eventTitle
                  ? "Hover over any image and click the star to set it as the album cover."
                  : "Every event has its own album. Customers can add photos to the active album when they're signed in. Hover over any image and click the star to set it as the album cover."
              }
            />
          ) : (
            <p className="text-on-surface-variant font-body mt-3 max-w-[55ch]">
              {eventTitle
                ? "Photos from this event. Sign in to add your own."
                : "A glimpse into our days at the market, in the fields, and everything in between."}
            </p>
          )}
        </div>

        {showUpload && (
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-label font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all duration-150 mb-2"
          >
            <Icon name="add_photo_alternate" size="sm" />
            Add Photo
          </button>
        )}

        {isAnonymous && albumId && (
          <Link
            href="/customer/login"
            className="inline-flex items-center gap-2 bg-surface-container-low text-tertiary px-6 py-3 rounded-xl font-label font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-colors mb-2"
          >
            <Icon name="login" size="sm" />
            Sign in to add a photo
          </Link>
        )}
      </div>

      {showUpload && albumId && (
        <GalleryUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          albumId={albumId}
        />
      )}
    </>
  );
}

function InfoToggle({ description }: { description: string }) {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <button
        type="button"
        onClick={() => setShown(false)}
        className="block text-left text-on-surface-variant font-body mt-3 max-w-[55ch] hover:text-tertiary transition-colors"
        aria-label="Hide information"
      >
        {description}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      title="More information"
      aria-label="More information"
      className="mt-3 inline-flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant hover:text-tertiary hover:bg-surface-container-low transition-colors"
    >
      <Icon name="info" size="sm" />
    </button>
  );
}
