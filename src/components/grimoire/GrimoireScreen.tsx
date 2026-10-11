import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { DreamRecord } from '../../types/dream';
import { Search, Trash2, ChevronRight, Lock, Share2, Compass, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { ShareCardModal } from '../share/ShareCardModal';
import { DreamRadarMap } from './DreamRadarMap';
import { NeuroAnalysisPanel } from '../neuro/NeuroAnalysisPanel';
import { GrimoireNeuroDetailSection } from '../neuro/GrimoireNeuroDetailSection';
import { isDreamMatchingTheme } from '../../utils/themeAnalyzer';

interface GrimoireScreenProps {
  dreams: DreamRecord[];
  onSelectDream: (dream: DreamRecord) => void;
  onDeleteDream: (dreamId: string) => void;
  onResetDemoData?: () => void;
}

export const GrimoireScreen: React.FC<GrimoireScreenProps> = ({
  dreams,
  onSelectDream,
  onDeleteDream,
  onResetDemoData,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [shareDream, setShareDream] = useState<DreamRecord | null>(null);
  const [showRadarMap, setShowRadarMap] = useState(true);
  const [selectedDreamForNeuro, setSelectedDreamForNeuro] = useState<DreamRecord | null>(null);
  const [showNeuroPanel, setShowNeuroPanel] = useState(true);

  // Default active dream for neuro analysis to selected or first dream
  const activeNeuroDream = selectedDreamForNeuro || (dreams.length > 0 ? dreams[0] : null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const map = new Map<string, string>();
    dreams.forEach((d) => {
      d.tags.forEach((tag) => {
        map.set(tag.slug, tag.label);
      });
    });
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  }, [dreams]);

  // Filter dreams by search and tag
  const filteredDreams = useMemo(() => {
    return dreams.filter((dream) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        dream.rawTranscript.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.tags.some((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === null ||
        dream.tags.some((t) => t.slug === selectedTag) ||
        isDreamMatchingTheme(dream, selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [dreams, searchQuery, selectedTag]);

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif-dream font-light uppercase tracking-wider text-white">
            {t.grimoire.title}
          </h2>
          <div className="flex items-center gap-1.5">
            {onResetDemoData && (
              <button
                onClick={onResetDemoData}
                className="text-[9px] font-mono-data border border-[#333333] hover:border-white px-2 py-0.5 text-[#aaaaaa] hover:text-white transition-colors uppercase cursor-pointer"
                title="Test ve demo verilerini sıfırla / yeniden yükle"
              >
                Test Rüyalarını Yenile
              </button>
            )}
            <span className="text-[10px] font-mono-data text-[#777777] border border-[#222222] px-2 py-0.5">
              {dreams.length} ARŞİV KAYDI
            </span>
          </div>
        </div>
        <p className="text-xs text-[#777777] font-mono-data mt-0.5">
          {t.grimoire.subtitle}
        </p>

        {dreams.length > 0 && (
          <div className="mt-2 py-1.5 px-2.5 bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-between text-[9px] font-mono-data text-[#888888] uppercase">
            <span>{t.grimoire.archetype_stats}: {allTags.length} ARKETİP</span>
            <span>UÇTAN UCA İZOLE</span>
          </div>
        )}
      </div>

      {/* Dream Radar Map (D3-based Archetype Radar) */}
      {dreams.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowRadarMap(!showRadarMap)}
            className="w-full flex items-center justify-between border border-[#222222] bg-[#0d0d0d] px-3.5 py-2 hover:border-[#444444] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-xs font-mono-data text-white uppercase tracking-wider">
              <Compass size={13} className="text-white" />
              <span>{t.grimoire.radar_title}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono-data text-[#888888] uppercase">
              <span>{showRadarMap ? t.grimoire.toggle_map_hide : t.grimoire.toggle_map_show}</span>
              {showRadarMap ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          </button>

          {showRadarMap && (
            <DreamRadarMap
              dreams={dreams}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />
          )}
        </div>
      )}

      {/* Selected Dream Deep Neuro-Scientific Analysis Panel */}
      {dreams.length > 0 && activeNeuroDream && (
        <div className="space-y-2">
          <button
            onClick={() => setShowNeuroPanel(!showNeuroPanel)}
            className="w-full flex items-center justify-between border border-[#222222] bg-[#0d0d0d] px-3.5 py-2 hover:border-[#444444] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-xs font-mono-data text-white uppercase tracking-wider">
              <Brain size={13} className="text-white" />
              <span>NÖRO-ANALİZ: HİPOKAMPAL & BELLEK KONSOLİDASYONU</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono-data text-[#888888] uppercase">
              <span className="text-[9px] text-[#aaaaaa] mr-1 hidden sm:inline">
                [ODAK: #{activeNeuroDream.id.slice(-6)}]
              </span>
              <span>{showNeuroPanel ? 'GİZLE' : 'GÖSTER'}</span>
              {showNeuroPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          </button>

          {showNeuroPanel && (
            <GrimoireNeuroDetailSection
              selectedDream={activeNeuroDream}
              allDreams={dreams}
              onSelectDream={(d) => setSelectedDreamForNeuro(d)}
              onOpenFullDetail={onSelectDream}
            />
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.grimoire.search_placeholder}
          className="w-full bg-[#0c0c0c] border border-[#222222] pl-9 pr-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-white font-mono-data"
        />
      </div>

      {/* Tag Filter Horizontal Scroller */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-mono-data">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 uppercase whitespace-nowrap transition-colors border ${
              selectedTag === null
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-[#0f0f0f] text-[#888888] border-[#222222] hover:text-white'
            }`}
          >
            {t.grimoire.filter_all}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => setSelectedTag(selectedTag === tag.slug ? null : tag.slug)}
              className={`px-2.5 py-1 uppercase whitespace-nowrap transition-colors border ${
                selectedTag === tag.slug
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-[#0f0f0f] text-[#888888] border-[#222222] hover:text-white'
              }`}
            >
              #{tag.label}
            </button>
          ))}
        </div>
      )}

      {/* Feed List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
        {filteredDreams.length === 0 ? (
          <div className="h-48 border border-dashed border-[#222222] flex flex-col items-center justify-center p-6 text-center space-y-2">
            <p className="text-sm font-serif-dream text-[#aaaaaa]">
              {t.grimoire.empty_title}
            </p>
            <p className="text-[11px] text-[#666666] font-mono-data">
              {t.grimoire.empty_desc}
            </p>
            {onResetDemoData && (
              <button
                onClick={onResetDemoData}
                className="mt-2 px-3.5 py-1.5 border border-white bg-white text-black text-xs font-mono-data font-bold hover:bg-neutral-200 transition-colors uppercase cursor-pointer"
              >
                6 Hazır Test Rüyasını & Görsellerini Yükle
              </button>
            )}
          </div>
        ) : (
          filteredDreams.map((dream) => (
            <div
              key={dream.id}
              className={`border transition-all flex flex-col overflow-hidden group ${
                activeNeuroDream?.id === dream.id
                  ? 'border-white bg-[#0e0e0e] shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                  : 'border-[#222222] bg-[#0c0c0c] hover:border-[#444444]'
              }`}
            >
              <div
                onClick={() => onSelectDream(dream)}
                className="cursor-pointer"
              >
                {/* Visual Thumbnail if exists */}
                {dream.imageUrl && (
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={dream.imageUrl}
                      alt="Dream memory"
                      className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
                    
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 text-[9px] font-mono-data text-[#888888] border border-white/10">
                      <Lock size={10} />
                      <span>ÖZEL</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono-data text-[#777777]">
                    <span className="flex items-center gap-1.5">
                      {new Date(dream.recordedAt).toLocaleDateString()} // {new Date(dream.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {activeNeuroDream?.id === dream.id && (
                        <span className="bg-white text-black text-[8px] px-1 font-bold uppercase">
                          NÖRO-ODAK
                        </span>
                      )}
                    </span>
                    <span className="group-hover:text-white transition-colors flex items-center gap-0.5">
                      {t.grimoire.view_details} <ChevronRight size={12} />
                    </span>
                  </div>

                  <p className="text-xs font-serif-dream italic text-[#dddddd] line-clamp-2 leading-relaxed">
                    "{dream.rawTranscript}"
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {dream.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[9px] font-mono-data bg-[#141414] border border-[#222222] text-[#888888] px-1.5 py-0.5 uppercase"
                      >
                        #{tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expandable Nöro-Analiz Panel */}
              <div className="px-3 pb-2.5 pt-0.5">
                <NeuroAnalysisPanel dream={dream} />
              </div>

              {/* Bottom Quick Actions */}
              <div className="px-3.5 py-2 border-t border-[#181818] bg-[#090909] flex justify-between items-center">
                <span className="text-[9px] font-mono-data text-[#555555]">
                  ID: #{dream.id.slice(-6)}
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDreamForNeuro(dream);
                      setShowNeuroPanel(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-[10px] font-mono-data flex items-center gap-1 transition-colors uppercase ${
                      activeNeuroDream?.id === dream.id
                        ? 'text-white font-bold'
                        : 'text-[#888888] hover:text-white'
                    }`}
                    title="Bu rüyanın nöro-analizini yukarıdaki panelde incele"
                  >
                    <Brain size={11} className={activeNeuroDream?.id === dream.id ? 'text-white' : 'text-[#888888]'} />
                    <span>{activeNeuroDream?.id === dream.id ? 'ODAKTA' : 'NÖRO-ODAK'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareDream(dream);
                    }}
                    className="text-[10px] font-mono-data text-[#888888] hover:text-white flex items-center gap-1 transition-colors uppercase"
                    title={t.share.export_card}
                  >
                    <Share2 size={11} />
                    <span>Paylaş</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(t.grimoire.confirm_delete)) {
                        onDeleteDream(dream.id);
                      }
                    }}
                    className="text-[10px] font-mono-data text-[#666666] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={11} />
                    <span>{t.grimoire.delete_dream}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Share Card Modal */}
      {shareDream && (
        <ShareCardModal
          dream={shareDream}
          isOpen={Boolean(shareDream)}
          onClose={() => setShareDream(null)}
        />
      )}
    </div>
  );
};
