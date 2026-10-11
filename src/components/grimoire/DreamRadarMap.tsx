import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DreamRecord } from '../../types/dream';
import { useTranslation } from '../../context/LanguageContext';
import {
  Compass,
  Sparkles,
  Filter,
  Brain,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  analyzeDreamThemes,
  RadarThemeResultItem,
} from '../../utils/themeAnalyzer';

interface DreamRadarMapProps {
  dreams: DreamRecord[];
  selectedTag: string | null;
  onSelectTag: (slug: string | null) => void;
}

export const DreamRadarMap: React.FC<DreamRadarMapProps> = ({
  dreams,
  selectedTag,
  onSelectTag,
}) => {
  const { t, language } = useTranslation();
  const [mapMode, setMapMode] = useState<'universal' | 'jungian'>('universal');

  // Analyze themes for Recharts Radar
  const chartData: RadarThemeResultItem[] = useMemo(() => {
    return analyzeDreamThemes(dreams, mapMode, language === 'en' ? 'en' : 'tr');
  }, [dreams, mapMode, language]);

  // Determine dominant theme
  const dominant = useMemo(() => {
    const sorted = [...chartData].sort((a, b) => b.count - a.count);
    return sorted[0].count > 0 ? sorted[0] : null;
  }, [chartData]);

  // Selected item details if an item is active
  const activeThemeItem = useMemo(() => {
    if (!selectedTag) return null;
    return chartData.find((item) => item.slug === selectedTag) || null;
  }, [chartData, selectedTag]);

  // Custom high-contrast brutalist tooltip component
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: RadarThemeResultItem }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#050505]/95 border border-white/60 p-3 shadow-2xl backdrop-blur font-mono-data max-w-[280px] pointer-events-none select-none z-50 text-left">
          <div className="flex items-center justify-between border-b border-[#333333] pb-1.5 mb-1.5">
            <span className="text-[11px] text-white font-bold uppercase tracking-wider">
              {data.subject}
            </span>
            <span className="text-[9px] text-[#22c55e] border border-[#22c55e]/40 px-1 py-0.2">
              %{data.frequency} FREKANS
            </span>
          </div>

          <div className="space-y-1.5 text-[9px]">
            <div className="flex items-center justify-between text-[#aaaaaa]">
              <span>Kayıt Sayısı:</span>
              <span className="text-white font-bold">{data.count} / {dreams.length} rüya</span>
            </div>

            <div className="pt-1 border-t border-[#222222]">
              <span className="text-[#888888] block text-[8px] uppercase tracking-wider mb-0.5">
                Nörobiyolojik Mekanizma:
              </span>
              <p className="text-[#cccccc] text-[9px] leading-tight font-sans">
                {data.scientificMechanism}
              </p>
            </div>

            <div className="pt-1 border-t border-[#222222]">
              <span className="text-[#888888] block text-[8px] uppercase tracking-wider mb-0.5">
                Arketipal Anlam:
              </span>
              <p className="text-[#e2e8f0] text-[9px] leading-tight font-serif-dream italic">
                {data.archetypeMeaning}
              </p>
            </div>

            <div className="pt-1 border-t border-[#222222] flex items-center justify-between text-[8px] text-[#777777]">
              <span>Atıf: {data.citation}</span>
              <span className="text-white font-semibold">Tıkla & Filtrele</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-[#222222] bg-[#090909] p-4 flex flex-col items-center select-none shadow-2xl relative overflow-hidden transition-all">
      {/* Background technical coordinate badge */}
      <div className="absolute top-2 left-3 text-[8px] font-mono-data text-[#444444] uppercase tracking-widest pointer-events-none flex items-center gap-1.5">
        <span>RECHARTS 3.10 // 6-AXIS POLAR RADAR</span>
        <span>•</span>
        <span>{mapMode === 'universal' ? 'EVRENSEL TEMALAR' : 'JUNG ARKETİPLERİ'}</span>
      </div>

      {/* Header Bar */}
      <div className="w-full flex flex-wrap justify-between items-center gap-2 mb-2 mt-3 sm:mt-1">
        <div className="flex items-center gap-2">
          <Compass size={15} className="text-white animate-spin-slow" />
          <div>
            <h3 className="text-xs font-serif-dream font-medium uppercase tracking-wider text-white">
              {t.grimoire.radar_title}
            </h3>
            <p className="text-[9px] text-[#777777] font-mono-data">
              {mapMode === 'universal'
                ? 'Uçma, Düşme, Su, Diş Kaybı, Kovalama ve Labirent Vektörleri'
                : 'Jungian Gölge, Eşik, Derin Su ve Dönüşüm Matrisi'}
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-1 bg-[#111111] border border-[#222222] p-0.5">
          <button
            onClick={() => setMapMode('universal')}
            className={`text-[9px] font-mono-data px-2 py-1 uppercase tracking-wider transition-all cursor-pointer ${
              mapMode === 'universal'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Evrensel Temalar
          </button>
          <button
            onClick={() => setMapMode('jungian')}
            className={`text-[9px] font-mono-data px-2 py-1 uppercase tracking-wider transition-all cursor-pointer ${
              mapMode === 'jungian'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Arketip Matrisi
          </button>
        </div>
      </div>

      {/* Active Filter Banner if a theme is selected */}
      {selectedTag && (
        <div className="w-full mb-2 bg-[#121212] border border-white/30 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono-data text-white">
            <Filter size={11} className="text-[#22c55e]" />
            <span className="uppercase text-[#aaaaaa]">Filtrelenen Tema:</span>
            <span className="font-bold uppercase text-white">
              {activeThemeItem ? activeThemeItem.subject : selectedTag}
            </span>
            {activeThemeItem && (
              <span className="text-[9px] text-[#888888]">
                ({activeThemeItem.count} rüya // %{activeThemeItem.frequency})
              </span>
            )}
          </div>
          <button
            onClick={() => onSelectTag(null)}
            className="text-[9px] font-mono-data text-[#888888] hover:text-white uppercase flex items-center gap-1 border border-[#333333] hover:border-white px-2 py-0.5 cursor-pointer transition-colors"
          >
            <span>Filtreyi Kaldır</span>
            <span>✕</span>
          </button>
        </div>
      )}

      {/* Recharts Radar Chart Container */}
      <div className="w-full h-[290px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="72%"
            data={chartData}
            margin={{ top: 12, right: 28, bottom: 12, left: 28 }}
          >
            {/* Concentric Polygonal Web Grid */}
            <PolarGrid
              stroke="#262626"
              strokeDasharray="3 3"
              gridType="polygon"
            />

            {/* Radial Angle Axes (Subjects) */}
            <PolarAngleAxis
              dataKey="subject"
              tick={(props) => {
                const { x, y, payload } = props;
                const item = chartData.find((d) => d.subject === payload.value);
                const isSelected = item && selectedTag === item.slug;

                return (
                  <text
                    x={x}
                    y={y}
                    fill={isSelected ? '#ffffff' : '#8a8a8a'}
                    fontSize={9}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="cursor-pointer transition-colors uppercase hover:fill-white"
                    onClick={() => item && onSelectTag(isSelected ? null : item.slug)}
                  >
                    {payload.value}
                    {item && item.count > 0 ? ` (${item.count})` : ''}
                  </text>
                );
              }}
            />

            {/* Radius Intensity Scale Axis */}
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#2e2e2e"
              tick={{
                fill: '#555555',
                fontSize: 8,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />

            {/* Brutalist Monochrome Radar Polygon */}
            <Radar
              name="Rüya Frekansı"
              dataKey="intensity"
              stroke="#ffffff"
              strokeWidth={1.75}
              fill="#ffffff"
              fillOpacity={0.15}
              dot={{
                r: 3.5,
                fill: '#050505',
                stroke: '#ffffff',
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 6,
                fill: '#ffffff',
                stroke: '#000000',
                strokeWidth: 2,
              }}
            />

            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Interactive Buttons / Pills Grid */}
      <div className="w-full mt-2 pt-2 border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between text-[9px] font-mono-data text-[#666666] mb-2 uppercase">
          <span className="flex items-center gap-1">
            <Layers size={10} />
            <span>Filtrelenebilir Rüya Temaları:</span>
          </span>
          <span className="text-[#888888]">Grafik eksenine veya butona dokun</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {chartData.map((item) => {
            const isSelected = selectedTag === item.slug;
            return (
              <button
                key={item.slug}
                onClick={() => onSelectTag(isSelected ? null : item.slug)}
                className={`p-1.5 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-white bg-[#1a1a1a] text-white shadow-md ring-1 ring-white/30'
                    : 'border-[#1f1f1f] bg-[#0c0c0c] hover:border-[#444444] text-[#999999] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-mono-data font-bold tracking-tight truncate uppercase">
                    {item.subject}
                  </span>
                  {isSelected ? (
                    <Check size={10} className="text-[#22c55e]" />
                  ) : (
                    <span className="text-[8px] font-mono-data text-[#666666]">
                      {item.count} rüya
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1 text-[8px] font-mono-data">
                  <span className="text-[#666666]">Yoğunluk:</span>
                  <span className={item.count > 0 ? 'text-[#e2e8f0]' : 'text-[#555555]'}>
                    %{item.frequency}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dominant Subconscious Insight Banner */}
      <div className="w-full mt-3 p-2.5 border border-[#222222] bg-[#0c0c0c] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono-data">
          <span className="text-[#888888] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles size={11} className="text-white" />
            <span>{t.grimoire.dominant_archetype || 'Baskın Tema'}:</span>
          </span>
          <span className="text-white font-bold uppercase tracking-wider bg-[#1a1a1a] px-2 py-0.5 border border-[#333333]">
            {dominant ? `${dominant.subject} (%${dominant.frequency})` : 'Dengeli Dağılım'}
          </span>
        </div>

        {dominant && (
          <div className="space-y-1 text-[9px] font-mono-data border-t border-[#1a1a1a] pt-1.5">
            <div className="text-[#aaaaaa] flex items-start gap-1 leading-snug">
              <Brain size={11} className="text-[#38bdf8] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Nöro-Mekanizma:</strong> {dominant.scientificMechanism}
              </span>
            </div>
            <div className="text-[#aaaaaa] flex items-start gap-1 leading-snug">
              <ShieldCheck size={11} className="text-[#a855f7] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Psiko-Dinamik:</strong> {dominant.archetypeMeaning}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
