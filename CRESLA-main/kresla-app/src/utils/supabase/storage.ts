import { createClient } from '@/utils/supabase/client';

export const PROPERTY_IMAGES_BUCKET = 'property-images';

/**
 * Uploads a property image to Supabase Storage bucket 'property-images'.
 * Returns the public URL of the uploaded image.
 */
export async function uploadPropertyImage(file: File, userId: string): Promise<string> {
  const supabase = createClient();

  const fileExt = file.name.split('.').pop() || 'jpg';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${sanitizedName}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image to Supabase Storage:', error);
    throw new Error(error.message || 'Failed to upload image to storage');
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Deletes a property image from Supabase Storage given its public URL or path.
 */
export async function deletePropertyImage(imagePathOrUrl: string): Promise<boolean> {
  try {
    const supabase = createClient();
    let filePath = imagePathOrUrl;

    if (imagePathOrUrl.includes(PROPERTY_IMAGES_BUCKET)) {
      const parts = imagePathOrUrl.split(`${PROPERTY_IMAGES_BUCKET}/`);
      if (parts.length > 1) {
        filePath = decodeURIComponent(parts[1]);
      }
    }

    const { error } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) {
      console.warn('Could not delete image from storage:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error in deletePropertyImage:', err);
    return false;
  }
}
