import { supabase } from '../db.js';
import fs from 'fs';

/**
 * Ensures the public storage bucket "patents" exists in Supabase.
 * If not, creates it with appropriate security settings.
 */
export const ensureBucketExists = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('⚠️ [Supabase Storage] Error listing buckets:', error.message);
      return;
    }

    const exists = buckets.some(b => b.name === 'patents');
    if (!exists) {
      console.log('📦 [Supabase Storage] Bucket "patents" not found. Creating it...');
      const { error: createError } = await supabase.storage.createBucket('patents', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });

      if (createError) {
        console.error('❌ [Supabase Storage] Failed to create bucket "patents":', createError.message);
      } else {
        console.log('✅ [Supabase Storage] Public bucket "patents" successfully created.');
      }
    } else {
      console.log('✅ [Supabase Storage] Public bucket "patents" verified.');
    }
  } catch (err) {
    console.error('⚠️ [Supabase Storage] Bucket verification failed:', err.message);
  }
};

/**
 * Uploads a local file to Supabase Storage.
 * @param {string} localFilePath - Path of the file on local disk
 * @param {string} fileName - Destination filename in the bucket
 * @param {string} subfolder - Subfolder name (e.g. 'proof_of_publish' or 'proof_of_grant')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFileToSupabase = async (localFilePath, fileName, subfolder) => {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`Local file not found at path: ${localFilePath}`);
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  const bucketName = 'patents';
  const destinationPath = `${subfolder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(destinationPath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error(`❌ [Supabase Storage] Upload error for ${destinationPath}:`, error.message);
    throw error;
  }

  // Retrieve the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(destinationPath);

  console.log(`🚀 [Supabase Storage] Uploaded successfully: ${publicUrl}`);
  return publicUrl;
};

/**
 * Deletes a file from Supabase Storage given its public URL.
 * @param {string} publicUrl - Public URL of the file to delete
 */
export const deleteFileFromSupabase = async (publicUrl) => {
  if (!publicUrl) return;
  try {
    const bucketName = 'patents';
    // Match the path after ".../public/patents/"
    const match = publicUrl.match(/\/storage\/v1\/object\/public\/patents\/(.+)$/);
    if (match) {
      const storagePath = decodeURIComponent(match[1]);
      const { error } = await supabase.storage.from(bucketName).remove([storagePath]);
      if (error) {
        console.warn(`⚠️ [Supabase Storage] Failed to delete old file (${storagePath}):`, error.message);
      } else {
        console.log(`🗑️ [Supabase Storage] Deleted old file: ${storagePath}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️ [Supabase Storage] Error trying to delete old file:`, err.message);
  }
};
