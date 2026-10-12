export interface ImageService {
  generate(input: {
    prompt: string;
    dreamId: string;
    signal?: AbortSignal;
  }): Promise<{ imageUri: string }>;
}
