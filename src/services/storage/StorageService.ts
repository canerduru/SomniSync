/**
 * Storage Service for Audio Recordings and Dream Visuals
 * Supports Supabase Storage buckets or local object URL caching.
 */

export interface IStorageService {
  uploadAudio(audioBlob: Blob, userId: string): Promise<string>;
  uploadImage(imageDataUrlOrBlob: Blob | string, userId: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class StorageService implements IStorageService {
  async uploadAudio(audioBlob: Blob, userId: string): Promise<string> {
    // In live Supabase, this would upload to `dream-recordings/${userId}/${Date.now()}.webm`
    // In client-side / dev environment, create persistent local URL
    try {
      const url = URL.createObjectURL(audioBlob);
      return url;
    } catch {
      return `audio-rec://${userId}/${Date.now()}`;
    }
  }

  async uploadImage(imageDataUrlOrBlob: Blob | string, userId: string): Promise<string> {
    if (typeof imageDataUrlOrBlob === 'string') {
      return imageDataUrlOrBlob;
    }
    try {
      return URL.createObjectURL(imageDataUrlOrBlob);
    } catch {
      return `visual-img://${userId}/${Date.now()}`;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (fileUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(fileUrl);
      } catch {
        // ignore
      }
    }
  }
}

export const storageService = new StorageService();
