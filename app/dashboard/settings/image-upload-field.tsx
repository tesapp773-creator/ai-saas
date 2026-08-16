"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ImageUploadField({
  name,
  label,
  helpText,
  defaultValue,
  userId,
  assetKind,
}: {
  name: string;
  label: string;
  helpText?: string;
  defaultValue?: string | null;
  userId: string;
  assetKind: "avatar" | "wallpaper";
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/${assetKind}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("business-assets").upload(path, file, {
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
      setValue(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label className="field-label">{label}</label>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={assetKind === "avatar" ? "h-14 w-14 rounded-full object-cover" : "h-14 w-24 rounded-sm object-cover"}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-dashed border-line text-xs text-ink-muted">
            None
          </div>
        )}
        <label className="btn-secondary cursor-pointer px-3.5 py-2 text-xs">
          {isUploading ? "Uploading..." : value ? "Replace" : "Choose from gallery"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isUploading} />
        </label>
        {value && (
          <button type="button" onClick={() => setValue("")} className="text-xs text-ink-muted underline underline-offset-2">
            Remove
          </button>
        )}
      </div>
      {helpText && <p className="mt-1.5 text-xs text-ink-muted">{helpText}</p>}
      {error && <p className="mt-1.5 text-xs text-gold">{error}</p>}
    </div>
  );
}
