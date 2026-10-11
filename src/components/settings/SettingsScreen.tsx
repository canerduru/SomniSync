import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { Shield, Globe, Trash2, CheckCircle2, Lock } from 'lucide-react';

interface SettingsScreenProps {
  onPurgeAllData: () => void;
  onResetDemoData?: () => void;
  allowSynastryDefault: boolean;
  setAllowSynastryDefault: (val: boolean) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onPurgeAllData,
  onResetDemoData,
  allowSynastryDefault,
  setAllowSynastryDefault,
}) => {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="flex-1 flex flex-col p-5 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-serif-dream font-light uppercase tracking-wider text-white">
          {t.settings.title}
        </h2>
        <p className="text-xs text-[#777777] font-mono-data mt-0.5">
          {t.settings.privacy_desc}
        </p>
      </div>

      {/* Language Section */}
      <div className="border border-[#222222] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-data text-[#888888] uppercase">
          <Globe size={14} className="text-white" />
          <span>{t.settings.language}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage('tr')}
            className={`py-2 px-3 text-xs font-mono-data uppercase border transition-colors flex items-center justify-between ${
              language === 'tr'
                ? 'bg-white text-black border-white font-bold'
                : 'bg-[#111111] text-[#777777] border-[#222222] hover:text-white'
            }`}
          >
            <span>TÜRKÇE (VARSAYILAN)</span>
            {language === 'tr' && <CheckCircle2 size={13} />}
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`py-2 px-3 text-xs font-mono-data uppercase border transition-colors flex items-center justify-between ${
              language === 'en'
                ? 'bg-white text-black border-white font-bold'
                : 'bg-[#111111] text-[#777777] border-[#222222] hover:text-white'
            }`}
          >
            <span>ENGLISH (READY)</span>
            {language === 'en' && <CheckCircle2 size={13} />}
          </button>
        </div>
      </div>

      {/* Privacy & Sovereignty */}
      <div className="border border-[#222222] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-data text-[#888888] uppercase">
          <Shield size={14} className="text-white" />
          <span>{t.settings.privacy_title}</span>
        </div>

        <div className="space-y-2 text-xs text-[#999999] leading-relaxed">
          <p>
            • Rüyalarınız yalnızca sizin cihazınızda ve şifreli depolanır.
          </p>
          <p>
            • Ham rüya metniniz ve ses kaydınız hiçbir üçüncü şahıs veya kullanıcıyla paylaşılmaz.
          </p>
          <p>
            • Kolektif Sinastriye katılım tamamen isteğe bağlıdır ve yalnızca anonim soyut temaları kapsar.
          </p>
        </div>

        {/* Privacy Audit Checklist */}
        <div className="border border-[#1c1c1c] bg-[#080808] p-3 text-[10px] font-mono-data space-y-1.5 text-[#aaaaaa]">
          <div className="flex items-center justify-between">
            <span>{t.settings.audit_telemetry}</span>
            <span className="text-white font-bold">[GÜVENLİ]</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.settings.audit_encryption}</span>
            <span className="text-white font-bold">[AKTİF]</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.settings.audit_synastry}</span>
            <span className="text-white font-bold">[DENETLİ]</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#181818]">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-mono-data text-white">
              Kolektif Sinastri Katılım İzni
            </span>
            <input
              type="checkbox"
              checked={allowSynastryDefault}
              onChange={(e) => setAllowSynastryDefault(e.target.checked)}
              className="accent-white w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Demo & Test Archive Seed */}
      <div className="border border-[#222222] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono-data text-white uppercase tracking-wider">
            TEST & DEMO VERİLERİ (6 ZENGİN RÜYA)
          </span>
          <span className="text-[9px] font-mono-data text-[#888888] border border-[#222222] px-1.5 py-0.5">
            GÖRSEL & LİTERATÜR
          </span>
        </div>

        <p className="text-[11px] text-[#888888] font-sans leading-relaxed">
          Uygulama içinde Grimoire arşivini, Recharts radar haritasını, 4:5/9:16 görsel paylaşım kartlarını ve PubMed nörobilim atıflarını test etmek için 6 farklı arketipe sahip monokrom rüyayı yükleyin.
        </p>

        <button
          onClick={() => {
            onResetDemoData?.();
          }}
          className="w-full py-2.5 border border-[#333333] bg-[#141414] hover:bg-white hover:text-black text-xs font-mono-data text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>6 Zengin Demo Rüyasını Yükle / Yenile</span>
        </button>
      </div>

      {/* Danger Zone: Purge Data */}
      <div className="border border-[#331111] bg-[#0f0909] p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono-data text-[#ff5555] uppercase">
          <Lock size={14} />
          <span>VERİ SİLME & HESAP SIFIRLAMA</span>
        </div>

        <p className="text-[11px] text-[#aaaaaa] font-sans leading-normal">
          {t.settings.purge_confirm}
        </p>

        <button
          onClick={() => {
            if (window.confirm(t.settings.purge_confirm)) {
              onPurgeAllData();
            }
          }}
          className="w-full py-2.5 border border-[#552222] bg-[#1a0c0c] text-xs font-mono-data text-[#ff6666] hover:bg-[#331111] hover:text-white transition-colors uppercase flex items-center justify-center gap-2"
        >
          <Trash2 size={13} />
          <span>{t.settings.purge_data}</span>
        </button>
      </div>
    </div>
  );
};
