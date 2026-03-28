/**
 * Cloudinary Unsigned Upload Utility
 *
 * This utility uses Cloudinary's Unsigned REST API, bypassing the need for a backend.
 * It requires EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 * to be set in your .env file.
 * Optionally pass a folder name to organize the uploads.
 */
export async function uploadImageToCloudinary(imageUri: string, folder: string = 'general'): Promise<string | null> {
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error('Cloudinary environment variables missing (CLOUD_NAME or UPLOAD_PRESET)');
    return null;
  }
  
  try {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      // Defaulting to jpeg; Cloudinary auto-detects true file type on their end anyway.
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('folder', folder);
    
    // Construct the endpoint for an unsigned upload
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: data,
    });
    
    const result = await response.json();
    return result.secure_url || null;
  } catch (error) {
    console.error('Failed to upload image to Cloudinary:', error);
    return null;
  }
}
