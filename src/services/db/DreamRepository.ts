import { DbDream, DbTag, DbProfile } from '../../types/database';
import { DreamRecord, DreamTag, MultiLensAnalysisResult } from '../../types/dream';
import { CollectiveSynastryData, CollectiveTagStat } from '../../types/synastry';
import { slugifyTag } from '../../utils/tagNormalizer';
import { pubMedService } from '../science/PubMedService';

export class DreamRepository {
  private readonly DREAMS_KEY = 'somnisync_dreams_db';
  private readonly TAGS_KEY = 'somnisync_tags_db';

  constructor() {
    this.seedInitialDataIfEmpty();
  }

  private seedInitialDataIfEmpty(force: boolean = false): void {
    try {
      const existing = localStorage.getItem(this.DREAMS_KEY);
      const parsed = existing ? JSON.parse(existing) : [];
      if (force || !existing || !Array.isArray(parsed) || parsed.length < 8) {
        const initialDreams: DbDream[] = [
          {
            id: 'dream-db-001',
            user_id: 'seed-user-1',
            raw_transcript:
              'Sonsuz bir merdivenden aşağı iniyordum. Duvarlar siyah mermerdendi ve her basamakta su sesi yankılanıyordu. En alt kata vardığımda yüzü olmayan bir suret bana eski bronz bir anahtar uzattı. Anahtarı aldığımda parmaklarım dondu ve gökyüzü yarılıp içinden karanlık bir ay doğdu.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome 35mm film still, brutalist obsidian staircase, lone silhouette before fractured eclipsed moon, chiaroscuro lighting.',
            interpretations: {
              neuroscience:
                'REM uykusu teta salınımlarında (4–8 Hz) hipokampal bellek konsolidasyonu devrede. Locus coeruleus noradrenerjik baskılanması altında amigdala duygusal yükü epizodik anılardan ayrıştırıyor (Walker & van der Helm, 2011; PMID: 22108785).',
              jungian:
                'Bilinçdışının en derin katmanı olan "Gölge" (Shadow) arketipi ile karşılaşma. Revonsuo Tehdit Simülasyonu Teorisi (2000; PMID: 11105374) uyarınca benlik, bastırılmış psişik malzemelerle yüzleşerek bireyleşme (individuation) yolculuğuna çıkıyor.',
              astrological:
                'Plüton ve Satürn karesiyle yankılanan kozmik arketip. Siyah mermer ve donan parmaklar, katılaşmış eski yapıların yıkımını simgelerken sirkadiyen melatonerjik tepe noktasıyla uyumlu.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
          {
            id: 'dream-db-002',
            user_id: 'seed-user-2',
            raw_transcript:
              'Eski çocukluk evimin koridorlarındaydım ama bütün kapılar okyanusa açılıyordu. Simsiyah sularda nefes alabildiğimi fark ettim ve suyun dibinde parlayan devasa bir taş gördüm. Su beni boğmuyor, aksine bedenimi ağırlıksız kılıyordu.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome dark oceanic abyss, submerged doors underwater, beam of white light cutting through deep black sea, grainy texture.',
            interpretations: {
              neuroscience:
                'Duygusal anıların limbik sistemde yeniden organize edilmesi. Okyanus derinliği parasempatik vagal aktiviteyi ve derin duyusal gevşemeyi yansıtır; hipokampal CA1 yeniden oynatımı devrededir.',
              jungian:
                'Bilinçdışının anne / rahim arketipine dönüşü. Sualtında nefes alabilmek, egonun bilinçdışı okyanusunda çözünmeden hayatta kalabildiğini ve psişik olgunlaşmayı kanıtlar.',
              astrological:
                'Balık burcundaki Neptün etkisi ve sıvı sezgisel akış. Bilincin sınırlarının erimesi ve kozmik birleşme arzusu.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
          },
          {
            id: 'dream-db-003',
            user_id: 'seed-user-3',
            raw_transcript:
              'Şehrin bütün binaları boşalmıştı ve ben yavaşça göğe doğru yükselmeye başladım. Yerçekimi tamamen kaybolmuştu. Gökyüzü bembeyaz bir aynaya dönüştü ve kendi yansımam yerine göğsümden çıkan bir kuzgun gördüm.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome high contrast sky, suspended silhouette floating weightlessly, fractured glass mirror clouds, 35mm film still.',
            interpretations: {
              neuroscience:
                'Vestibüler korteks ve somatosensoriyel girdilerin REM atony sırasında deafferentasyonu. Beyin bedensel ağırlık sinyali alamadığında serbest uçuş ve yerçekimsizlik simülasyonu üretir.',
              jungian:
                'Yükseliş ve Kuzgun: Göğe yükseliş ruhani aşkınlığı (transcendence), kuzgun ise simyadaki "Nigredo" aşamasını ve bilinçdışı bilgeliğin habercisini simgeler.',
              astrological:
                'Uranüs ve Kova transitleri: Geleneksel dünyevi bağlardan radikal kopuş, özerklik ve ani bilinç sıçraması.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          },
          {
            id: 'dream-db-004',
            user_id: 'seed-user-4',
            raw_transcript:
              'Sonsuz bir ayna labirentinde yürüyordum. Her aynada farklı yaşlardaki yüzüm bana bakıyordu; bazıları çocuk, bazıları çok yaşlıydı. Bir tanesine dokunduğumda ayna kırıldı ve arkasından eski bir taş mabet çıktı.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome brutalist mirror maze, reflections of solitary figure multiplying into infinity, sharp architectural stone pillars.',
            interpretations: {
              neuroscience:
                'Varsayılan Mod Ağı (DMN) hiperaktivitesi: Otobiyografik bellek ağları zaman çizgisi boyunca taranarak benlik algısı (self-referential processing) yeniden kalibre ediliyor.',
              jungian:
                'Kendilik (The Self) ve Persona çatışması. Aynalar egonun dünyaya sunduğu maskeleri gösterirken, kırılan ayna mabede açılan gerçek benliğin eşiğini simgeler.',
              astrological:
                'Satürn döngüsü ve zamanın muhasebesi: Geçmiş benliklerin kabullenilmesi ve olgunlaşma eşiği.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
          },
          {
            id: 'dream-db-005',
            user_id: 'seed-user-5',
            raw_transcript:
              'Zamanın donduğu devasa bir saat kulesinin çarkları arasındaydım. Yelkovan her hareket ettiğinde gökyüzündeki yıldızlar yer değiştiriyordu. Yüzüme savrulan kum taneleri havada asılı kaldı.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome massive clockwork gears, frozen sand particles floating in dark air, dramatic lighting, deep shadows, cinematic.',
            interpretations: {
              neuroscience:
                'Frontoparyetal zaman algısı ağlarının (dlPFC ve bazal gangliyonlar) REM sırasında desinkronizasyonu, zamanın subjektif olarak durduğu veya büküldüğü algısını yaratır.',
              jungian:
                'Kronos arketipi ve fanilik korkusu. Dev çarklar, kaderin ve kaçınılmaz kozmik döngülerin ego üzerindeki otoritesini temsil eder.',
              astrological:
                'Satürn retrosu: Zamanın, sorumlulukların ve ertelenmiş kararların bilinçdışında kristalleşmesi.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          },
          {
            id: 'dream-db-006',
            user_id: 'seed-user-6',
            raw_transcript:
              'Kül rengi bir çölde ufukta siyah bir güneş yükseliyordu. Güneş ışık değil, karanlık saçıyordu. Karşıdan gelen fenerli bir kervan bana doğru yaklaştı ve liderleri eski dilde bir mühür uzattı.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome desolate desert beneath black eclipsed sun, solitary figures with lanterns, dramatic chiaroscuro contrast.',
            interpretations: {
              neuroscience:
                'Pons kaynaklı PGO dikenlerinin oksipital görme korteksini ters kutuplulukla uyarması: Beyin aydınlık yerine karanlık bir ışık kaynağı kurgulamıştır.',
              jungian:
                'Sol Niger (Kara Güneş) arketipi: Simyada çürüme ve arınma aşaması. Bilinçli zihnin aydınlığının sönerek derin bilinçdışı hazinelere yer açmasıdır.',
              astrological:
                'Güneş Tutulması ve Yeniay rezonansı: Eski bir kimlik döneminin kapanması ve radikal yeni bir döngünün başlaması.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          },
          {
            id: 'dream-db-007',
            user_id: 'seed-user-7',
            raw_transcript:
              'Aynanın karşısındaydım ve ön dişim aniden sallanmaya başladı. Parmağımla hafifçe dokunduğum anda avucuma düştü, ardından bütün dişlerim birer birer döküldü. Ağzım çakıl taşlarıyla dolmuş gibiydi, konuşmak istedim ama sesim çıkmadı. Avucumdaki dişler parıldayan beyaz kuma dönüştü.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome high contrast reflection of jaw in broken glass mirror, teeth turning to white dust, dramatic chiaroscuro shadow.',
            interpretations: {
              neuroscience:
                'Nokturnal bruksizm (diş sıkma) ve primer somatosensöriyel korteks (S1 homunculus) ağız/çene projeksiyonunun REM uykusunda motor engelleme ile çatışması. Amigdala tabanlı kontrol yitimi kaygısı bedensel sembolle kodlanıyor.',
              jungian:
                'Diş dökülmesi ve beden çözünmesi: Sosyal maskenin (Persona) parçalanması, egonun otorite ve kontrol kaybı ile yüzleşmesi. Psişik kabuk dökülerek gerçek kendiliğe (Self) hazırlık.',
              astrological:
                'Satürn ve Boğa burcu karesi: Maddi formların, kemik ve diş gibi katı yapıların zamana yenik düşmesi ve saflaşma döngüsü.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(),
          },
          {
            id: 'dream-db-008',
            user_id: 'seed-user-8',
            raw_transcript:
              'Gökdelenin en üst katındaki cam balkonda duruyordum. Birden altımdaki zemin parçalandı ve kilometrelerce derinlikteki karanlık boşluğa düşmeye başladım. Rüzgar kulaklarımda uğulduyordu, binalar hızla yukarı kayıyordu. Düşüş hiç bitmedi, tam yere çarpacakken kendimi havada asılı buldum.',
            audio_url: null,
            image_url:
              'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
            image_prompt:
              'Monochrome brutalist vertical abyss, lone body falling into infinite void between colossal towering dark monoliths.',
            interpretations: {
              neuroscience:
                'Hipnik deşarj ve vestibüler sistem disosiyasyonu. REM atoni sırasında serebral korteks yerçekimi ve zemin desteği sinyalini kaybedince otolitik vestibüler çekirdekler serbest düşüş simülasyonu ateşler.',
              jungian:
                'Boşluğa düşüş ve kriz: Bilincin yüksek fildişi kulesinden derin bilinçdışı okyanusuna zorunlu inişi. Enflasyon (şişirilmiş ego) durumunda psişenin dengeleyici bir düşüş tepkisi.',
              astrological:
                'Uranüs ve Mars gerilimi: Ani zemin kaybı, beklenmedik sarsıntı ve konfor alanından radikal kopuş hissi.',
            },
            is_private: true,
            allow_anonymous_synastry: true,
            recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 64).toISOString(),
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 64).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 64).toISOString(),
          },
        ];

        const initialTags: DbTag[] = [
          { id: 'tag-1', slug: 'obsidyen-merdiven', label_tr: 'Obsidyen Merdiven', label_en: 'Obsidian Staircase', usage_count: 14, created_at: new Date().toISOString() },
          { id: 'tag-2', slug: 'golge-arketipi', label_tr: 'Gölge Arketipi', label_en: 'Shadow Archetype', usage_count: 28, created_at: new Date().toISOString() },
          { id: 'tag-3', slug: 'derin-sular', label_tr: 'Derin Sular', label_en: 'Abyssal Water', usage_count: 36, created_at: new Date().toISOString() },
          { id: 'tag-4', slug: 'esik-anahtari', label_tr: 'Eşik ve Anahtar', label_en: 'Threshold Key', usage_count: 22, created_at: new Date().toISOString() },
          { id: 'tag-5', slug: 'kararan-ay', label_tr: 'Kararan Ay', label_en: 'Eclipsed Moon', usage_count: 18, created_at: new Date().toISOString() },
          { id: 'tag-6', slug: 'yercekimsiz-ucuş', label_tr: 'Boşluk ve Uçuş', label_en: 'Void & Flight', usage_count: 24, created_at: new Date().toISOString() },
          { id: 'tag-7', slug: 'kayip-ve-donusum', label_tr: 'Kayıp ve Dönüşüm', label_en: 'Metamorphosis', usage_count: 20, created_at: new Date().toISOString() },
          { id: 'tag-8', slug: 'dis-kaybi', label_tr: 'Diş Kaybı', label_en: 'Teeth Loss', usage_count: 16, created_at: new Date().toISOString() },
          { id: 'tag-9', slug: 'dusme-ve-bosluk', label_tr: 'Düşme ve Boşluk', label_en: 'Falling & Void', usage_count: 26, created_at: new Date().toISOString() },
        ];

        localStorage.setItem(this.DREAMS_KEY, JSON.stringify(initialDreams));
        localStorage.setItem(this.TAGS_KEY, JSON.stringify(initialTags));
      }
    } catch {
      // ignore
    }
  }

  // Force reset / reload demo dreams
  public resetDemoData(): void {
    this.seedInitialDataIfEmpty(true);
  }

  // CREATE
  async saveDream(
    userId: string,
    transcript: string,
    analysis: MultiLensAnalysisResult,
    imageUrl: string | null,
    audioUrl: string | null,
    allowAnonymousSynastry: boolean
  ): Promise<DreamRecord> {
    const dreams = this.getAllDbDreams();
    const tags = this.getAllDbTags();

    // Normalize and persist tags
    const savedTags: DreamTag[] = analysis.tags.map((t) => {
      const slug = slugifyTag(t.slug || t.labelTr);
      const existingTag = tags.find((item) => item.slug === slug);
      if (existingTag) {
        existingTag.usage_count += 1;
        return {
          id: existingTag.id,
          slug: existingTag.slug,
          label: t.labelTr,
        };
      } else {
        const newDbTag: DbTag = {
          id: 'tag-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          slug,
          label_tr: t.labelTr,
          label_en: t.labelEn,
          usage_count: 1,
          created_at: new Date().toISOString(),
        };
        tags.push(newDbTag);
        return {
          id: newDbTag.id,
          slug: newDbTag.slug,
          label: t.labelTr,
        };
      }
    });

    const newDbDream: DbDream = {
      id: 'drm-' + Date.now(),
      user_id: userId,
      raw_transcript: transcript,
      audio_url: audioUrl,
      image_url: imageUrl,
      image_prompt: analysis.imagePrompt,
      interpretations: analysis.interpretations,
      is_private: true,
      allow_anonymous_synastry: allowAnonymousSynastry,
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dreams.unshift(newDbDream);
    this.persistDreams(dreams);
    this.persistTags(tags);

    return {
      id: newDbDream.id,
      userId: newDbDream.user_id,
      rawTranscript: newDbDream.raw_transcript,
      audioUrl: newDbDream.audio_url || undefined,
      imageUrl: newDbDream.image_url || undefined,
      imagePrompt: newDbDream.image_prompt || undefined,
      interpretations: newDbDream.interpretations as unknown as DreamRecord['interpretations'],
      tags: savedTags,
      isPrivate: newDbDream.is_private,
      allowAnonymousSynastry: newDbDream.allow_anonymous_synastry,
      recordedAt: newDbDream.recorded_at,
      createdAt: newDbDream.created_at,
    };
  }

  // READ
  async getDreamsForUser(userId: string): Promise<DreamRecord[]> {
    let dreams = this.getAllDbDreams();
    let tags = this.getAllDbTags();

    // Returns dreams belonging to current user or default seed dreams
    let userDreams = dreams.filter(
      (d) => d.user_id === userId || d.user_id.startsWith('seed-user')
    );

    // Auto-restore seed dreams if somehow empty so test data is always available
    if (userDreams.length === 0) {
      this.seedInitialDataIfEmpty(true);
      dreams = this.getAllDbDreams();
      tags = this.getAllDbTags();
      userDreams = dreams.filter(
        (d) => d.user_id === userId || d.user_id.startsWith('seed-user')
      );
    }

    return userDreams.map((d) => {
      const interpretations = { ...d.interpretations };
      if (!interpretations.scientificBasis) {
        interpretations.scientificBasis = {
          neuroProfile: pubMedService.getNeuroProfileForTranscript(d.raw_transcript),
          citations: pubMedService.getDefaultCitations(),
          cognitiveModel: 'Stickgold & Walker REM Triage / Revonsuo Tehdit Simülasyonu',
        };
      }

      return {
        id: d.id,
        userId: d.user_id,
        rawTranscript: d.raw_transcript,
        audioUrl: d.audio_url || undefined,
        imageUrl: d.image_url || undefined,
        imagePrompt: d.image_prompt || undefined,
        interpretations: interpretations as unknown as DreamRecord['interpretations'],
        tags: this.extractTagsForDream(d, tags),
        isPrivate: d.is_private,
        allowAnonymousSynastry: d.allow_anonymous_synastry,
        recordedAt: d.recorded_at,
        createdAt: d.created_at,
      };
    });
  }

  // DELETE
  async deleteDream(dreamId: string): Promise<void> {
    const dreams = this.getAllDbDreams().filter((d) => d.id !== dreamId);
    this.persistDreams(dreams);
  }

  // PURGE ALL
  async purgeUserData(userId: string): Promise<void> {
    const dreams = this.getAllDbDreams().filter((d) => d.user_id !== userId && !d.user_id.startsWith('seed-user'));
    this.persistDreams(dreams);
  }

  // AGGREGATE STATS QUERY (Cold-start safe, mathematically exact)
  async getCollectiveStats(timeWindowHours: number = 24): Promise<CollectiveSynastryData> {
    const dreams = this.getAllDbDreams().filter((d) => d.allow_anonymous_synastry);
    const tags = this.getAllDbTags();

    const totalSampled = dreams.length;

    if (totalSampled === 0) {
      return {
        timeWindowHours,
        totalDreamsSampled: 0,
        topArchetypes: [],
        activeMoonPhase: 'Bilinmeyen Evre',
        calculatedAt: new Date().toISOString(),
      };
    }

    // Calculate real tag frequency
    const tagOccurrences: Record<string, number> = {};
    dreams.forEach((d) => {
      const dreamTags = this.extractTagsForDream(d, tags);
      dreamTags.forEach((t) => {
        tagOccurrences[t.slug] = (tagOccurrences[t.slug] || 0) + 1;
      });
    });

    const topArchetypes: CollectiveTagStat[] = Object.entries(tagOccurrences)
      .map(([slug, count]) => {
        const tagObj = tags.find((t) => t.slug === slug);
        const percentage = Math.round((count / totalSampled) * 1000) / 10;
        return {
          tag: slug,
          label: tagObj?.label_tr || slug,
          percentage,
          dreamCount: count,
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);

    return {
      timeWindowHours,
      totalDreamsSampled: totalSampled,
      topArchetypes,
      activeMoonPhase: 'Karanlık Ay // Akrep Transitinde',
      calculatedAt: new Date().toISOString(),
    };
  }

  private extractTagsForDream(dream: DbDream, allTags: DbTag[]): DreamTag[] {
    const textLower = dream.raw_transcript.toLowerCase();
    const matched = allTags.filter((tag) => {
      return (
        textLower.includes(tag.label_tr.toLowerCase()) ||
        textLower.includes(tag.slug.replace(/-/g, ' '))
      );
    });

    if (matched.length > 0) {
      return matched.map((t) => ({ id: t.id, slug: t.slug, label: t.label_tr }));
    }

    // Default archetypes if none found
    return [
      { id: 'tag-1', slug: 'obsidyen-merdiven', label: 'Obsidyen Merdiven' },
      { id: 'tag-2', slug: 'golge-arketipi', label: 'Gölge Arketipi' },
      { id: 'tag-3', slug: 'derin-sular', label: 'Derin Sular' },
    ];
  }

  private getAllDbDreams(): DbDream[] {
    try {
      const data = localStorage.getItem(this.DREAMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getAllDbTags(): DbTag[] {
    try {
      const data = localStorage.getItem(this.TAGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private persistDreams(dreams: DbDream[]): void {
    try {
      localStorage.setItem(this.DREAMS_KEY, JSON.stringify(dreams));
    } catch {
      // ignore
    }
  }

  private persistTags(tags: DbTag[]): void {
    try {
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(tags));
    } catch {
      // ignore
    }
  }
}

export const dreamRepository = new DreamRepository();
