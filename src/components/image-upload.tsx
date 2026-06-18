"use client";

import { useState, useRef, useEffect } from "react";

type ImageUploadProps = {
  name: string;
  defaultValue?: string | null;
  label?: string;
  /** Recommended resolution text, e.g. "1920 × 1080 px" */
  recommendedResolution?: string;
  /** Aspect ratio for preview, e.g. "16/9", "1/1", "4/3" */
  aspectRatio?: string;
  /** Hide the URL fallback toggle */
  hideUrlFallback?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const ACCEPTED_EXTENSIONS = "JPG, PNG, WebP, GIF";
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ImageUpload({
  name,
  defaultValue,
  label = "Gambar",
  recommendedResolution,
  aspectRatio = "16/9",
  hideUrlFallback = false,
  onUploadStart,
  onUploadEnd,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExistingImage = !!defaultValue;

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old blob URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setError("");
    setImageRemoved(false);

    // Validate type
    const allowedTypes = ACCEPTED_IMAGE_TYPES.split(",");
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipe file tidak didukung. Gunakan ${ACCEPTED_EXTENSIONS}.`);
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Ukuran file maksimal ${MAX_SIZE_MB}MB. File ini ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }

    // Show local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to server
    setUploading(true);
    onUploadStart?.();
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengupload");
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Gagal mengupload file");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageUrl("");
    setImageRemoved(true);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Determine the preview to show
  const displayPreview = imageRemoved
    ? null
    : previewUrl || (hasExistingImage && !imageUrl ? defaultValue : null);
  const hasImage = imageRemoved ? false : (!!imageUrl || (hasExistingImage && !previewUrl));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {!hideUrlFallback && (
          <button
            type="button"
            onClick={() => {
              setUseUrlInput(!useUrlInput);
              setImageRemoved(false);
              setError("");
            }}
            className="text-xs text-primary-600 hover:text-primary-800 underline"
          >
            {useUrlInput ? "Upload file" : "Gunakan URL"}
          </button>
        )}
      </div>

      {useUrlInput ? (
        <div>
          <div className="flex gap-2">
            <input
              type="url"
              name={name}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/image.jpg"
            />
            {(hasImage || previewUrl) && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
          {displayPreview && (
            <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
              style={{ aspectRatio }}
            >
              <img
                src={displayPreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Hidden input for form submission */}
          <input type="hidden" name={name} value={imageRemoved ? "" : imageUrl || defaultValue || ""} />

          <div
            onClick={triggerFilePicker}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const input = fileInputRef.current;
                if (input) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  input.files = dt.files;
                  handleFileSelect({ target: input } as any);
                }
              }
            }}
            className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              uploading
                ? "border-primary-400 bg-primary-50"
                : displayPreview
                ? "border-primary-400 bg-primary-50/30"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploading ? (
              <div className="py-8 text-center">
                <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-500">Mengupload...</p>
              </div>
            ) : displayPreview ? (
              <div className="relative group" style={{ aspectRatio }}>
                <img
                  src={displayPreview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); triggerFilePicker(); }}
                    className="px-4 py-2 bg-white/90 text-gray-800 text-sm font-medium rounded-lg hover:bg-white transition-colors"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                    className="px-4 py-2 bg-red-500/90 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Klik atau seret gambar ke sini
                </p>
                <p className="text-xs text-gray-500">
                  {ACCEPTED_EXTENSIONS} — Maks {MAX_SIZE_MB}MB
                </p>
                {recommendedResolution && (
                  <p className="text-xs text-primary-600 font-medium mt-1">
                    Resolusi terbaik: {recommendedResolution}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
