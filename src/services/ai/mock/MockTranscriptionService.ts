import { ITranscriptionService } from '../../../types/services';

export class MockTranscriptionService implements ITranscriptionService {
  private fallbackTranscriptsTr = [
    'Sonsuz bir merdivenden aşağı iniyordum. Duvarlar siyah mermerdendi ve her basamakta su sesi yankılanıyordu. En alt kata vardığımda yüzü olmayan bir suret bana eski bir anahtar uzattı. Anahtarı aldığımda parmaklarım dondu ve gökyüzü yarılıp içinden karanlık bir ay doğdu.',
    'Eski çocukluk evimin koridorlarındaydım ama bütün kapılar okyanusa açılıyordu. Derin sularda nefes alabildiğimi fark ettim. Dişlerimin döküldüğünü hissedip elimle tutmaya çalıştım, avucuma inci taneleri döküldü.',
    'Büyük bir kütüphanede kaybolmuştum, raflar göğe kadar uzanıyordu. Kitapların sayfaları kendi kendine çevriliyordu ve her sayfada geçmişte aldığım bir kararın farklı bir ihtimali yazılıydı. Bir anda yer çekimi kayboldu ve boşluğa doğru süzülmeye başladım.'
  ];

  private fallbackTranscriptsEn = [
    'I was descending an endless staircase of black obsidian. Each step echoed with the cadence of dripping water. At the nadir, a faceless entity handed me an ancient bronze key. As I touched it, my fingers turned to frost and a black moon eclipsed the sky.',
    'I stood in the corridor of my childhood home, yet every doorway opened onto a boundless abyssal ocean. I realized I could breathe underwater. My teeth began loosening into pearls as I grasped for certainty.',
    'Trapped within a towering monolith of books. The pages flickered autonomously, chronicling every unchosen divergence of my life. Gravity severed and I floated upward into the dark canopy.'
  ];

  async transcribeAudio(audioBlob: Blob, language: string = 'tr'): Promise<string> {
    // Simulate speech-to-text processing delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const list = language === 'en' ? this.fallbackTranscriptsEn : this.fallbackTranscriptsTr;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }
}

export const mockTranscriptionService = new MockTranscriptionService();
