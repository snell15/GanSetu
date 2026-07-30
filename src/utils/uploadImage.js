import { supabase } from '../supabaseClient';

/**
 * Uploads a file to a specific public Supabase storage bucket
 * @param {File} file - The raw file object from the HTML file input
 * @param {string} bucketName - The target bucket ('decorations' or 'feedback-images')
 * @returns {Promise<string>} - The public CDN URL of the uploaded asset
 */
export const uploadImageToStorage = async (file, bucketName) => {
  try {
    if (!file) throw new Error("No file selected.");

    // Generate a unique filename to completely avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // 1. Upload the raw asset file to the specified bucket
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 2. Extract the public distribution URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;

  } catch (error) {
    console.error(`Error uploading to bucket [${bucketName}]:`, error.message);
    throw error;
  }
};