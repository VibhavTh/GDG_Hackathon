"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { GalleryUploadModal } from "@/components/gallery/gallery-upload-modal";

interface GalleryHeaderProps {
  userRole: "vendor" | "customer" | "admin" | null;
}

export function GalleryHeader({ userRole }: GalleryHeaderProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const isFarmer = userRole === "vendor";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-4 mb-12">
        <div>
          <span className="text-secondary font-label text-[11px] uppercase tracking-[0.25em] mb-3 block">
            Farm Life
          </span>
          <h1 className="font-headline italic text-4xl md:text-5xl text-tertiary leading-tight">
            From the Farm
          </h1>
          <p className="text-on-surface-variant font-body mt-3 max-w-[50ch]">
            A glimpse into our days at the market, in the fields, and everything
            in between.
          </p>
        </div>

        {isFarmer && (
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-label font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all duration-150 mb-2"
          >
            <Icon name="add_photo_alternate" size="sm" />
            Add Photo
          </button>
        )}
      </div>

      <GalleryUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </>
  );
}
