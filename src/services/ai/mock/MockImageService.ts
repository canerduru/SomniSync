import { IImageService } from '../../../types/services';

export class MockImageService implements IImageService {
  // Curated stark brutalist monochrome cinematic dream visuals
  private mockDreamVisuals = [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80', // Obsidian stairs / shadows
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', // Eclipsed dark moon / void
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80', // Deep mist waters / abyss
    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=1200&q=80', // Brutalist monolith / portal
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80', // Stark minimalist horizons
  ];

  async generateDreamVisual(prompt: string): Promise<string> {
    // Simulate generation latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const randomIndex = Math.floor(Math.random() * this.mockDreamVisuals.length);
    return this.mockDreamVisuals[randomIndex];
  }
}

export const mockImageService = new MockImageService();
