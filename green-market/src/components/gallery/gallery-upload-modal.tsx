"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import { uploadGalleryPhoto } from "@/app/(storefront)/gallery/actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface GalleryUploadModalProps {
  open: boolean;
  onClose: () => void;
  albumId: string;
}

export function GalleryUploadModal({
  open,
  onClose,
  albumId,
}: GalleryUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setPreview(null);
    setCaption("");
    setError(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 5 MB.");
      e.target.value = "";
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));

    // Set the file input programmatically
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select an image.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Supabase Storage (client-side, same pattern as product-form)
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const objectPath = `${albumId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(objectPath, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery-images").getPublicUrl(uploadData.path);

      // Save to DB via server action
      const formData = new FormData();
      formData.set("image_url", publicUrl);
      formData.set("caption", caption);
      formData.set("album_id", albumId);

      const result = await uploadGalleryPhoto(formData);

      if (result.error) {
        setError(result.error);
        setUploading(false);
        return;
      }

      handleClose();
    } catch {
      setError(
        "Upload failed. Check that the gallery-images storage bucket exists."
      );
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-tertiary/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface rounded-2xl p-8 w-full max-w-lg animate-slide-up-fast"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-on-surface-variant/60 hover:text-on-surface transition-colors"
        >
          <Icon name="close" />
        </button>

        <h2 className="font-headline italic text-2xl text-tertiary mb-6">
          Add to Gallery
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden file input -- must stay mounted so the ref keeps the selected file */}
          <input
            id="gallery-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />

          {/* Drop zone / preview */}
          {preview ? (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-highest">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-3 right-3 bg-tertiary/70 text-on-tertiary rounded-full p-1.5 hover:bg-tertiary/90 transition-colors"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="gallery-file-input"
              className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Icon
                name="add_photo_alternate"
                className="text-4xl text-on-surface-variant/40"
              />
              <p className="text-sm text-on-surface-variant font-body">
                Drag and drop or click to choose
              </p>
              <p className="text-xs text-on-surface-variant/60 font-body">
                JPEG, PNG, or WebP up to 5 MB
              </p>
            </label>
          )}

          {/* Caption */}
          <div>
            <label
              htmlFor="gallery-caption"
              className="block text-xs font-label uppercase tracking-wider text-on-surface-variant/60 mb-2"
            >
              Caption (optional)
            </label>
            <input
              id="gallery-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What is this photo about?"
              maxLength={200}
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant rounded-t-lg px-4 py-3 text-on-surface font-body placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-0 focus:outline-none transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-error font-body">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || !preview}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Icon
                  name="progress_activity"
                  size="sm"
                  className="animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <Icon name="upload" size="sm" />
                Upload Photo
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
