import { IInterpretationService } from '../../../types/services';
import { MultiLensAnalysisResult } from '../../../types/dream';
import { pubMedService } from '../../science/PubMedService';

export class MockInterpretationService implements IInterpretationService {
  async analyzeDream(transcript: string, language: string = 'tr'): Promise<MultiLensAnalysisResult> {
    // Simulate multi-lens LLM synthesis latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isEn = language === 'en';

    // Contextual detection of symbols
    const hasWater =
      transcript.toLowerCase().includes('su') ||
      transcript.toLowerCase().includes('water') ||
      transcript.toLowerCase().includes('okyanus');
    const hasFalling =
      transcript.toLowerCase().includes('düş') ||
      transcript.toLowerCase().includes('fall') ||
      transcript.toLowerCase().includes('boşluk');
    const hasKey =
      transcript.toLowerCase().includes('anahtar') ||
      transcript.toLowerCase().includes('key') ||
      transcript.toLowerCase().includes('kapı');
    const hasTeeth =
      transcript.toLowerCase().includes('diş') || transcript.toLowerCase().includes('teeth');

    // Retrieve scientifically verified PubMed citations and neurobiological profile
    const neuroProfile = pubMedService.getNeuroProfileForTranscript(transcript);
    const citations = await pubMedService.getCitationsForDream(transcript);

    if (isEn) {
      return {
        imagePrompt:
          'Monochrome 35mm film still, brutalist obsidian architecture, lone silhouette beneath a colossal fractured celestial sphere, grainy texture, chiaroscuro lighting, eerie silence, 8k.',
        interpretations: {
          neuroscience:
            'Hippocampal neural replay active during REM theta waves (4–8 Hz). The narrative signals intense emotional decontextualization; the brain is uncoupling episodic trauma from somatic stress responses, reorganizing neural plasticity matrices (van der Helm & Walker, 2011; PMID: 22108785).',
          jungian:
            'The descent confronts the Shadow archetype. Interpreted through Revonsuo\'s Threat Simulation Theory (2000; PMID: 11105374): archaic survival schemas are reactivated in an offline virtual reality, integrating suppressed affective drives into waking self-schemas.',
          astrological:
            'Analyzed through Circadian Chronobiology & Archetypal resonance: Peak ultradian REM cycle during the circadian core body temperature nadir (03:00–05:00), aligning with lunar transit symbolism.',
          scientificBasis: {
            neuroProfile,
            citations,
            cognitiveModel:
              'Sleep to Forget, Sleep to Remember (Walker) & Threat Simulation Theory (Revonsuo)',
          },
        },
        tags: [
          { slug: 'obsidian-staircase', labelTr: 'Obsidyen Merdiven', labelEn: 'Obsidian Staircase' },
          { slug: 'shadow-work', labelTr: 'Gölge Entegrasyonu', labelEn: 'Shadow Work' },
          { slug: 'void-descent', labelTr: 'Boşluğa İniş', labelEn: 'Void Descent' },
          { slug: 'key-threshold', labelTr: 'Eşik ve Anahtar', labelEn: 'Key Threshold' },
          hasWater
            ? { slug: 'abyssal-water', labelTr: 'Derin Sular', labelEn: 'Abyssal Water' }
            : { slug: 'monochrome-sky', labelTr: 'Monokrom Gökyüzü', labelEn: 'Monochrome Sky' },
        ],
      };
    }

    // Default Turkish Multi-Lens Output with rigorous scientific grounding
    return {
      imagePrompt:
        'Monokrom 35mm grenli sinematik kare, siyah mermerden brutalist mimari, devasa kırık göksel küre altında tekil silüet, yüksek kontrastlı chiaroscuro aydınlatma, tekinsiz ve minimalist atmosfer.',
      interpretations: {
        neuroscience:
          'REM uykusu teta salınımlarında (4–8 Hz) hipokampal-neokortikal bellek konsolidasyonu devrede. Locus coeruleus noradrenerjik baskılanması altında, amigdala duygu yükünü epizodik anıdan ayrıştırarak sinaptik homeostaz budaması gerçekleştiriyor (Walker & van der Helm, 2011; PMID: 22108785).',
        jungian:
          'Bilinçdışının "Gölge" (Shadow) arketipi ile karşılaşma. Evrimsel Tehdit Simülasyonu Teorisi (Revonsuo, 2000; PMID: 11105374) ışığında: Bastırılmış somatik korkular ve egonun savunma bariyerleri, nörolojik bir simülasyon ortamında güvenle yüzleştirilerek bireyleşme (individuation) sağlanıyor.',
        astrological:
          'Sirkadiyen Kronobiyoloji & Sembolik Kozmik Rezonans: Vücut çekirdek sıcaklığının en dipte olduğu gece 03:00–05:00 ultradiyen REM döngüsünde melatonerjik zirve, arketipal ay döngüsüyle rezonans oluşturuyor.',
        scientificBasis: {
          neuroProfile,
          citations,
          cognitiveModel:
            'REM Duygusal Ayrıştırma Modeli (Walker) & Evrimsel Tehdit Simülasyonu (Revonsuo)',
        },
      },
      tags: [
        { slug: 'obsidyen-merdiven', labelTr: 'Obsidyen Merdiven', labelEn: 'Obsidian Staircase' },
        { slug: 'golge-arketipi', labelTr: 'Gölge Arketipi', labelEn: 'Shadow Archetype' },
        { slug: 'esik-anahtari', labelTr: 'Eşik ve Anahtar', labelEn: 'Threshold Key' },
        { slug: 'kararan-ay', labelTr: 'Kararan Ay', labelEn: 'Eclipsed Moon' },
        hasWater
          ? { slug: 'derin-sular', labelTr: 'Derin Sular', labelEn: 'Abyssal Waters' }
          : hasTeeth
          ? { slug: 'kayip-ve-donusum', labelTr: 'Kayıp ve Dönüşüm', labelEn: 'Loss & Transformation' }
          : { slug: 'kolektif-yankı', labelTr: 'Kolektif Yankı', labelEn: 'Collective Echo' },
      ],
    };
  }
}

export const mockInterpretationService = new MockInterpretationService();
