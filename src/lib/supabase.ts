import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const WORKSPACE_IMAGES_BUCKET = "workspace-images";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Validates and uploads a compressed image file directly to Supabase Storage bucket
 * and returns the public CDN URL.
 */
export async function uploadWorkspaceLogo(file: File): Promise<string> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON_KEY) in .env.local."
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG and PNG images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("File size exceeds 2MB limit.");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "jpg");
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(WORKSPACE_IMAGES_BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(WORKSPACE_IMAGES_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
