import { ISynastryService } from '../../../types/services';
import { CollectiveSynastryData, AnonymousResonanceMatch } from '../../../types/synastry';

export class MockSynastryService implements ISynastryService {
  private matches: AnonymousResonanceMatch[] = [
    {
      connectionId: 'conn-8921',
      otherUserAnonymousTag: 'Dreamer #8412',
      resonanceScore: 89,
      sharedTags: ['Obsidyen Merdiven', 'Derin Sular', 'Gölge Arketipi'],
      snippet: 'Kararan ay altında bilinmeyen bir derinliğe doğru iniş...',
      recordedAt: '2 saat önce',
      status: 'pending'
    },
    {
      connectionId: 'conn-4102',
      otherUserAnonymousTag: 'Dreamer #3190',
      resonanceScore: 74,
      sharedTags: ['Eşik ve Anahtar', 'Boşluğa İniş'],
      snippet: 'Sonsuz kapılar ve eski bronz bir mühür...',
      recordedAt: 'Dün gece',
      status: 'pending'
    }
  ];

  async getCollectiveStats(timeWindowHours: number = 24): Promise<CollectiveSynastryData> {
    // Simulate real aggregate query
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Notice: mathematically sound, sparse cold-start capable
    return {
      timeWindowHours,
      totalDreamsSampled: 142,
      activeMoonPhase: 'Karanlık Ay // Akrep Geçişi',
      calculatedAt: new Date().toISOString(),
      topArchetypes: [
        {
          tag: 'derin-sular',
          label: 'Derin Sular & Okyanus',
          percentage: 38.7,
          dreamCount: 55
        },
        {
          tag: 'obsidyen-merdiven',
          label: 'Sonsuz Merdiven & İniş',
          percentage: 26.1,
          dreamCount: 37
        },
        {
          tag: 'esik-anahtari',
          label: 'Eşik, Kapı & Anahtar',
          percentage: 19.4,
          dreamCount: 28
        },
        {
          tag: 'diş-dökülmesi',
          label: 'Dönüşüm / Diş Kaybı',
          percentage: 12.6,
          dreamCount: 18
        },
        {
          tag: 'yercekimsiz-ucuş',
          label: 'Yerçekimsiz Boşluk',
          percentage: 9.8,
          dreamCount: 14
        }
      ]
    };
  }

  async findResonanceMatches(userId: string): Promise<AnonymousResonanceMatch[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.matches];
  }

  async respondToMatch(connectionId: string, status: 'acknowledged' | 'dismissed'): Promise<void> {
    const match = this.matches.find((m) => m.connectionId === connectionId);
    if (match) {
      match.status = status;
    }
  }
}

export const mockSynastryService = new MockSynastryService();
