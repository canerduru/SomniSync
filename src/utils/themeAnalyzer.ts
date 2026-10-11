import { DreamRecord } from '../types/dream';

export interface ThemeDefinition {
  slug: string;
  subjectTr: string;
  subjectEn: string;
  keywords: string[];
  scientificMechanismTr: string;
  scientificMechanismEn: string;
  archetypeMeaningTr: string;
  archetypeMeaningEn: string;
  citation: string;
}

export const UNIVERSAL_THEMES: ThemeDefinition[] = [
  {
    slug: 'tema-ucma',
    subjectTr: 'UÇMA & AĞIRLIKSIZLIK',
    subjectEn: 'FLYING & LEVITATION',
    keywords: [
      'uç',
      'uçma',
      'uçuş',
      'uçuyor',
      'kanat',
      'süzül',
      'süzülme',
      'havalan',
      'yerçekim',
      'yerçekimsiz',
      'ağırlıksız',
      'yüksel',
      'göğe',
      'havada',
      'flying',
      'levitation',
      'floating',
    ],
    scientificMechanismTr:
      'REM atoni sırasında vestibüler çekirdekler ve somatosensöriyel korteks deafferentasyonu; motor emirlerin yerçekimi direnciyle karşılaşmaması simülasyonu.',
    scientificMechanismEn:
      'Vestibular-somatosensory deafferentation during REM motor atonia; lack of kinesthetic resistance simulates weightlessness.',
    archetypeMeaningTr:
      'Aşkınlık (Transcendence), dünyevi sınırlamalardan özgürleşme ve egonun özerklik arayışı.',
    archetypeMeaningEn:
      'Archetype of transcendence, liberation from terrestrial constraints, and ego autonomy.',
    citation: 'Voss et al., 2009; Hobson & Friston, 2012',
  },
  {
    slug: 'tema-dusme',
    subjectTr: 'DÜŞME & BOŞLUK',
    subjectEn: 'FALLING & ABYSS',
    keywords: [
      'düş',
      'düşme',
      'düşüş',
      'düşüyor',
      'uçurum',
      'çök',
      'çökme',
      'boşluk',
      'boşluğa',
      'yuvarlan',
      'merdiven',
      'aşağı',
      'kayma',
      'falling',
      'abyss',
      'vertigo',
      'drop',
    ],
    scientificMechanismTr:
      'Hipnik deşarjlar ve otolitik vestibüler çekirdeklerin uykuda yerçekimi sinyalini aniden kaybetmesi; amigdala ve locus coeruleus ani uyarımı.',
    scientificMechanismEn:
      'Hypnic jerks and abrupt loss of otolithic gravitational cues; transient locus coeruleus and amygdalar burst.',
    archetypeMeaningTr:
      'Kontrol kaybı kaygısı, şişirilmiş egonun (enflasyon) bilinçdışı tarafından dengelenmesi ve derin içsel arayış.',
    archetypeMeaningEn:
      'Loss of conscious control, compensatory puncture of ego inflation by the deeper unconscious.',
    citation: 'Revonsuo, 2000; Oudiette et al., 2012',
  },
  {
    slug: 'tema-su',
    subjectTr: 'SU & DERİNLİK',
    subjectEn: 'WATER & ABYSSAL',
    keywords: [
      'su',
      'sular',
      'okyanus',
      'deniz',
      'nehir',
      'göl',
      'dalga',
      'boğul',
      'akıntı',
      'derinlik',
      'sualtı',
      'ıslak',
      'derin sular',
      'water',
      'ocean',
      'sea',
      'submersion',
    ],
    scientificMechanismTr:
      'Parasempatik vagal tonus artışı ve limbik duygusal konsolidasyon; amigdala-hipokampus teta frekansında duygusal arşivleme.',
    scientificMechanismEn:
      'Elevated parasympathetic vagal tone and limbic emotional processing; theta coupling in the amygdalo-hippocampal axis.',
    archetypeMeaningTr:
      'Kolektif bilinçdışı okyanusu, rahim/yeniden doğuş arketipi ve duygusal arınma/dönüşüm ihtiyacı.',
    archetypeMeaningEn:
      'The oceanic collective unconscious, maternal abyss, psychic rebirth and emotional dissolution.',
    citation: 'Walker & van der Helm, 2011; Stickgold, 2005',
  },
  {
    slug: 'tema-dis-kaybi',
    subjectTr: 'DİŞ KAYBI & BEDEN',
    subjectEn: 'TEETH LOSS & BODY',
    keywords: [
      'diş',
      'dişim',
      'dişler',
      'dökül',
      'dökülme',
      'kırıl',
      'kırılma',
      'çene',
      'ağız',
      'çürü',
      'kanama',
      'kemik',
      'toz',
      'teeth',
      'tooth',
      'decay',
      'dental',
    ],
    scientificMechanismTr:
      'Nokturnal bruksizm (diş sıkma), trigeminal sinir stimülasyonu ve S1 kortikal homunculus ağız temsiliyetinin REM motor blokajıyla çakışması.',
    scientificMechanismEn:
      'Nocturnal bruxism, trigeminal motor feedback conflicting with REM atonia; somatosensory homunculus oral map excitation.',
    archetypeMeaningTr:
      'Persona (toplumsal maske) çatlağı, savunmasızlık, yaşlanma ve egonun dış dünyadaki güç/otorite kaybı kaygısı.',
    archetypeMeaningEn:
      'Fracture of the Persona, vulnerability, fear of decay, aging, and symbolic loss of primal potency.',
    citation: 'Zadra & Pihl, 1997; Schredl et al., 2004',
  },
  {
    slug: 'tema-kovalama',
    subjectTr: 'KOVALAMA & TEHDİT',
    subjectEn: 'PURSUIT & THREAT',
    keywords: [
      'kaç',
      'kaçma',
      'kaçış',
      'kovala',
      'kovalama',
      'takip',
      'canavar',
      'gölge',
      'siluet',
      'saklan',
      'avcı',
      'tehlike',
      'korku',
      'panik',
      'tuzak',
      'chase',
      'threat',
      'pursuit',
    ],
    scientificMechanismTr:
      'Evrimsel Tehdit Simülasyonu Teorisi (TST); amigdala ve periaqueductal gray (PAG) motor kaçış devrelerinin uykuda prova edilmesi.',
    scientificMechanismEn:
      'Evolutionary Threat Simulation Theory (TST); nocturnal rehearsal of amygdala-periaqueductal gray avoidance pathways.',
    archetypeMeaningTr:
      'Gölge (Shadow) arketipiyle kaçınılmaz karşılaşma; bilinçli zihnin reddettiği veya yüzleşmekten çekindiği dürtülerin takibi.',
    archetypeMeaningEn:
      'Encounter with the Shadow archetype; psychic confrontation with disowned unconscious material.',
    citation: 'Revonsuo, 2000 (PMID: 11105374)',
  },
  {
    slug: 'tema-labirent',
    subjectTr: 'LABİRENT & EŞİK',
    subjectEn: 'MAZE & THRESHOLD',
    keywords: [
      'labirent',
      'koridor',
      'kapı',
      'eşik',
      'anahtar',
      'mabet',
      'oda',
      'çıkmaz',
      'ayna',
      'geçit',
      'duvar',
      'kilit',
      'maze',
      'labyrinth',
      'threshold',
      'portal',
    ],
    scientificMechanismTr:
      'Entorhinal korteks ızgara (grid) hücreleri ve hipokampal yer (place) hücrelerinin uzamsal navigasyon ve bilişsel haritalama provası.',
    scientificMechanismEn:
      'Entorhinal grid cells and hippocampal place cells coordinating spatial cognition and cognitive mapping during slow oscillations.',
    archetypeMeaningTr:
      'Bireyleşme (Individuation) inisiyasyonu; benliğin kendi derinliklerindeki merkezine ulaşma ve eşik atlama süreci.',
    archetypeMeaningEn:
      'Individuation journey, sacred initiation, crossing psychological boundaries into deeper consciousness.',
    citation: 'Moser & Moser, 2013; Buzsáki, 2015',
  },
];

export const JUNGIAN_THEMES: ThemeDefinition[] = [
  {
    slug: 'golge-arketipi',
    subjectTr: 'GÖLGE ARKETİPİ',
    subjectEn: 'SHADOW ARCHETYPE',
    keywords: ['gölge', 'karanlık', 'canavar', 'düşman', 'yüzsüz', 'korku', 'shadow', 'darkness'],
    scientificMechanismTr: 'Negatif duygu valansı işlemleme, amigdala-vmPFC desensitisasyonu.',
    scientificMechanismEn: 'Negative valence processing, amygdalo-vmPFC desensitization.',
    archetypeMeaningTr: 'Bilinçdışının bastırılmış ve reddedilmiş malzemeleriyle yüzleşme.',
    archetypeMeaningEn: 'Confrontation with repressed psychic traits.',
    citation: 'Revonsuo, 2000',
  },
  {
    slug: 'derin-sular',
    subjectTr: 'DERİN SULAR',
    subjectEn: 'ABYSSAL WATER',
    keywords: ['su', 'okyanus', 'deniz', 'derin', 'sualtı', 'dalga', 'water', 'ocean'],
    scientificMechanismTr: 'Parasempatik vagal tonus ve epizodik bellek entegrasyonu.',
    scientificMechanismEn: 'Parasympathetic vagal tone and episodic memory integration.',
    archetypeMeaningTr: 'Kolektif bilinçdışının anaç ve dönüştürücü matrisi.',
    archetypeMeaningEn: 'The transformative matrix of the collective unconscious.',
    citation: 'Walker & van der Helm, 2011',
  },
  {
    slug: 'esik-anahtari',
    subjectTr: 'EŞİK & ANAHTAR',
    subjectEn: 'THRESHOLD & KEY',
    keywords: ['kapı', 'eşik', 'anahtar', 'geçit', 'kilit', 'portal', 'threshold', 'key'],
    scientificMechanismTr: 'Frontoparyetal kontrol ağının yeni çağrışımsal bağlantıları açması.',
    scientificMechanismEn: 'Frontoparietal network forming novel associative transitions.',
    archetypeMeaningTr: 'Ruhsal inisiyasyon ve psişik olgunlaşma kapısı.',
    archetypeMeaningEn: 'Psychic initiation into higher levels of consciousness.',
    citation: 'Stickgold & Walker, 2013',
  },
  {
    slug: 'obsidyen-merdiven',
    subjectTr: 'İNİŞ & DERİNLİK',
    subjectEn: 'DESCENT & ABYSS',
    keywords: ['merdiven', 'iniş', 'aşağı', 'basamak', 'derin', 'staircase', 'descent'],
    scientificMechanismTr: 'Yavaş dalga uykusu (NREM) ve hipokampal CA1 keskin dalga dalgacıkları.',
    scientificMechanismEn: 'Slow-wave oscillations and hippocampal sharp-wave ripples.',
    archetypeMeaningTr: 'Nekyia / Katabasis: Bilinçaltının yer altı dünyasına iniş.',
    archetypeMeaningEn: 'Nekyia: The hero descent into the psychic underworld.',
    citation: 'Tononi & Cirelli, 2014',
  },
  {
    slug: 'kayip-ve-donusum',
    subjectTr: 'DÖNÜŞÜM & SİMYA',
    subjectEn: 'METAMORPHOSIS',
    keywords: ['dönüşüm', 'değişim', 'kum', 'kuzgun', 'kristal', 'toz', 'metamorphosis', 'transform'],
    scientificMechanismTr: 'Sinaptik Plastisite ve Sinaptik Homeostaz (SHY) yeniden yapılanması.',
    scientificMechanismEn: 'Synaptic Homeostasis Hypothesis (SHY) renormalisation and pruning.',
    archetypeMeaningTr: 'Simyadaki Nigredo-Albedo geçişi; benliğin yenilenmesi.',
    archetypeMeaningEn: 'Alchemical Nigredo to Albedo; renewal of the Self.',
    citation: 'Tononi & Cirelli, 2006',
  },
  {
    slug: 'yercekimsiz-ucuş',
    subjectTr: 'BOŞLUK & UÇUŞ',
    subjectEn: 'VOID & TRANSCENDENCE',
    keywords: ['uçuş', 'boşluk', 'yerçekimsiz', 'yükselme', 'gök', 'flight', 'void', 'transcendence'],
    scientificMechanismTr: 'Motor korteks çıkışlarının REM atoniyle engellenmesi ve serbest salınım.',
    scientificMechanismEn: 'Motor cortex disconnection during REM atonia allowing free kinaesthesia.',
    archetypeMeaningTr: 'Egonun kısıtlamalarından kurtuluş ve aşkınlık (Transcendence).',
    archetypeMeaningEn: 'Liberation from ego boundaries and spiritual transcendence.',
    citation: 'Hobson, 2009',
  },
];

/**
 * Checks if a dream matches a specific theme based on:
 * 1. Transcript keyword match
 * 2. Tags slugs/labels match
 * 3. Interpretations match
 */
export function isDreamMatchingTheme(dream: DreamRecord, themeSlug: string): boolean {
  if (!dream) return false;

  const targetTheme =
    UNIVERSAL_THEMES.find((t) => t.slug === themeSlug) ||
    JUNGIAN_THEMES.find((t) => t.slug === themeSlug);

  if (!targetTheme) {
    // If not in definition, check tags directly
    return dream.tags.some((t) => t.slug === themeSlug);
  }

  // 1. Direct tag match
  const tagMatched = dream.tags.some(
    (t) =>
      t.slug === targetTheme.slug ||
      t.slug.includes(targetTheme.slug) ||
      targetTheme.slug.includes(t.slug)
  );
  if (tagMatched) return true;

  // 2. Transcript keyword matching
  const transcriptLower = (dream.rawTranscript || '').toLowerCase();
  for (const kw of targetTheme.keywords) {
    if (transcriptLower.includes(kw.toLowerCase())) {
      return true;
    }
  }

  // 3. Interpretation texts keyword matching
  const neuroText = (dream.interpretations?.neuroscience || '').toLowerCase();
  const jungText = (dream.interpretations?.jungian || '').toLowerCase();
  for (const kw of targetTheme.keywords) {
    if (neuroText.includes(kw.toLowerCase()) || jungText.includes(kw.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export interface RadarThemeResultItem {
  subject: string;
  slug: string;
  intensity: number; // 0 to 100
  count: number;
  frequency: number; // 0 to 100 percentage
  fullMark: number;
  scientificMechanism: string;
  archetypeMeaning: string;
  citation: string;
}

/**
 * Analyzes a collection of dreams and generates radar chart data.
 */
export function analyzeDreamThemes(
  dreams: DreamRecord[],
  mode: 'universal' | 'jungian' = 'universal',
  language: 'tr' | 'en' = 'tr'
): RadarThemeResultItem[] {
  const themeList = mode === 'universal' ? UNIVERSAL_THEMES : JUNGIAN_THEMES;

  // Count matching dreams for each theme
  const counts: Record<string, number> = {};
  themeList.forEach((th) => {
    counts[th.slug] = 0;
  });

  dreams.forEach((dream) => {
    themeList.forEach((th) => {
      if (isDreamMatchingTheme(dream, th.slug)) {
        counts[th.slug] = (counts[th.slug] || 0) + 1;
      }
    });
  });

  const maxCount = Math.max(...Object.values(counts), 1);
  const totalDreams = dreams.length || 1;

  return themeList.map((th) => {
    const count = counts[th.slug] || 0;
    const frequency = Math.round((count / totalDreams) * 100);
    // Baseline minimum 18% intensity for visible polygonal presence even at zero
    const intensity = count > 0 ? Math.round(25 + (count / maxCount) * 75) : 15;

    return {
      subject: language === 'en' ? th.subjectEn : th.subjectTr,
      slug: th.slug,
      intensity,
      count,
      frequency,
      fullMark: 100,
      scientificMechanism: language === 'en' ? th.scientificMechanismEn : th.scientificMechanismTr,
      archetypeMeaning: language === 'en' ? th.archetypeMeaningEn : th.archetypeMeaningTr,
      citation: th.citation,
    };
  });
}
