import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { dreamRepository } from '../../services/db/DreamRepository';
import { matchingEngine } from '../../services/synastry/MatchingEngine';
import { CollectiveSynastryData, AnonymousResonanceMatch } from '../../types/synastry';
import { DreamRecord } from '../../types/dream';
import { Sparkles, Moon, Check, Radio, ShieldAlert } from 'lucide-react';

interface SynastryScreenProps {
  userDreams: DreamRecord[];
}

export const SynastryScreen: React.FC<SynastryScreenProps> = ({ userDreams }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<CollectiveSynastryData | null>(null);
  const [matches, setMatches] = useState<AnonymousResonanceMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const statsData = await dreamRepository.getCollectiveStats(24);
        const dynamicMatches = matchingEngine.calculateMatches(userDreams);
        setStats(statsData);
        setMatches(dynamicMatches);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userDreams]);

  const handleRespond = (connectionId: string, status: 'acknowledged' | 'dismissed') => {
    setMatches((prev) =>
      prev.map((m) => (m.connectionId === connectionId ? { ...m, status } : m))
    );
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <Moon size={16} className="text-white" />
          <h2 className="text-2xl font-serif-dream font-light uppercase tracking-wider text-white">
            {t.synastry.title}
          </h2>
        </div>
        <p className="text-xs text-[#777777] font-mono-data mt-0.5">
          {t.synastry.subtitle}
        </p>
      </div>

      {/* Lunar & Archetypal Vector */}
      <div className="border border-[#262626] bg-[#0c0c0c] p-4 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono-data text-[#666666] uppercase tracking-widest block">
            KOZMİK VE AY FAZI FREKANSI
          </span>
          <span className="text-sm font-serif-dream font-medium text-white block mt-0.5">
            {stats?.activeMoonPhase || 'Karanlık Ay Evresi'}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Aggregate Stats Section: Cold-Start Handled */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-mono-data text-[#888888] uppercase tracking-wider">
            {t.synastry.stats_header}
          </span>
          <span className="text-[9px] font-mono-data text-[#555555]">
            N={stats?.totalDreamsSampled ?? 0} RÜYA ÖRNEKLEMİ
          </span>
        </div>

        {loading ? (
          <div className="p-6 border border-[#222222] text-center font-mono-data text-xs text-[#666666]">
            SİNASTRİ HESAPLANIYOR...
          </div>
        ) : !stats || stats.topArchetypes.length === 0 ? (
          <div className="border border-[#222222] p-4 bg-[#0a0a0a] text-center">
            <ShieldAlert size={16} className="mx-auto text-[#666666] mb-1" />
            <p className="text-xs text-[#888888] font-mono-data">
              {t.synastry.stats_empty}
            </p>
          </div>
        ) : (
          <div className="border border-[#222222] bg-[#0a0a0a] divide-y divide-[#181818]">
            {stats.topArchetypes.map((stat) => (
              <div key={stat.tag} className="p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif-dream text-[#eeeeee]">
                    {stat.label}
                  </span>
                  <span className="font-mono-data font-bold text-white">
                    %{stat.percentage.toFixed(1)}
                  </span>
                </div>

                {/* Precision brutalist bar */}
                <div className="w-full h-1 bg-[#1a1a1a] overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(5, stat.percentage))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] font-mono-data text-[#666666]">
                  <span>{stat.dreamCount} rüya kaydında tespit edildi</span>
                  <span>Kolektif Rezonans</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[9px] font-mono-data text-[#555555] tracking-wide">
          * {t.synastry.stats_disclaimer}
        </p>
      </div>

      {/* Anonymous Resonance Matches Section */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-mono-data text-[#888888] uppercase tracking-wider">
            {t.synastry.resonance_title}
          </span>
          <span className="text-[9px] font-mono-data text-[#555555]">
            ANONİM EŞLEŞMELER
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="border border-[#222222] p-6 text-center bg-[#0a0a0a]">
            <Radio size={16} className="mx-auto text-[#555555] mb-2" />
            <p className="text-xs font-mono-data text-[#888888]">
              {t.synastry.resonance_empty}
            </p>
            <p className="text-[10px] text-[#555555] font-mono-data mt-1">
              (Yeni rüya kaydedip 'Anonim Sinastriye Dahil Et' seçeneğini işaretlediğinizde eşleşmeler hesaplanır.)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.connectionId}
                className="border border-[#222222] bg-[#0c0c0c] p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono-data text-[#777777] block uppercase">
                      ANONİM PROFİL
                    </span>
                    <span className="text-sm font-mono-data font-medium text-white">
                      {match.otherUserAnonymousTag}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono-data text-[#777777] block uppercase">
                      {t.synastry.match_ratio}
                    </span>
                    <span className="text-sm font-mono-data font-bold text-white">
                      %{match.resonanceScore}
                    </span>
                  </div>
                </div>

                {match.snippet && (
                  <p className="text-xs font-serif-dream italic text-[#aaaaaa] border-l border-[#333333] pl-2 py-0.5">
                    "{match.snippet}"
                  </p>
                )}

                <div>
                  <span className="text-[9px] font-mono-data text-[#666666] uppercase block mb-1">
                    {t.synastry.shared_archetypes}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.sharedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono-data bg-[#161616] border border-[#2a2a2a] text-[#cccccc] px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match Action */}
                <div className="pt-2 border-t border-[#181818] flex items-center justify-between">
                  <span className="text-[9px] font-mono-data text-[#555555]">
                    {match.recordedAt}
                  </span>

                  {match.status === 'acknowledged' ? (
                    <div className="flex items-center gap-1 text-[10px] font-mono-data text-white">
                      <Check size={12} />
                      <span>{t.synastry.acknowledged}</span>
                    </div>
                  ) : match.status === 'dismissed' ? (
                    <span className="text-[10px] font-mono-data text-[#555555]">
                      Yoksayıldı
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(match.connectionId, 'dismissed')}
                        className="px-2.5 py-1 text-[10px] font-mono-data border border-[#222222] text-[#777777] hover:text-white uppercase transition-colors"
                      >
                        {t.synastry.dismiss}
                      </button>
                      <button
                        onClick={() => handleRespond(match.connectionId, 'acknowledged')}
                        className="px-3 py-1 text-[10px] font-mono-data bg-white text-black font-bold uppercase hover:bg-[#e0e0e0] flex items-center gap-1 transition-colors"
                      >
                        <Sparkles size={11} />
                        <span>{t.synastry.send_echo}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
