import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { Mic, BookOpen, Sparkles, Sliders, Globe } from 'lucide-react';

export type ActiveTab = 'record' | 'grimoire' | 'synastry' | 'settings';

interface MobileShellProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] flex justify-center items-center p-0 md:p-6 bg-noise selection:bg-white selection:text-black">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md h-screen md:h-[844px] bg-[#080808] border border-[#222222] md:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Minimalist Brutalist Status Bar */}
        <header className="px-5 pt-5 pb-3 border-b border-[#1c1c1c] flex items-center justify-between bg-[#0a0a0a]/90 backdrop-blur z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <h1 className="text-lg font-serif-dream tracking-widest font-semibold uppercase text-white">
                {t.app.title}
              </h1>
            </div>
            <p className="text-[9px] font-mono-data text-[#777777] tracking-wider uppercase">
              {t.app.beta_label} // {t.app.status_encrypted}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono-data border border-[#2a2a2a] hover:border-white transition-colors bg-[#111111] text-[#dddddd] uppercase tracking-wider"
              title="Change Language"
            >
              <Globe size={11} className="text-[#888888]" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto relative flex flex-col">
          {children}
        </main>

        {/* Bottom Brutalist Navigation Bar */}
        <nav className="border-t border-[#1c1c1c] bg-[#080808]/95 backdrop-blur px-2 py-2.5 flex items-center justify-around text-[10px] font-mono-data uppercase tracking-widest z-20">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
              activeTab === 'record'
                ? 'text-white border-b border-white'
                : 'text-[#666666] hover:text-[#999999]'
            }`}
          >
            <Mic size={16} strokeWidth={activeTab === 'record' ? 2 : 1.5} />
            <span>{t.nav.record}</span>
          </button>

          <button
            onClick={() => setActiveTab('grimoire')}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
              activeTab === 'grimoire'
                ? 'text-white border-b border-white'
                : 'text-[#666666] hover:text-[#999999]'
            }`}
          >
            <BookOpen size={16} strokeWidth={activeTab === 'grimoire' ? 2 : 1.5} />
            <span>{t.nav.grimoire}</span>
          </button>

          <button
            onClick={() => setActiveTab('synastry')}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
              activeTab === 'synastry'
                ? 'text-white border-b border-white'
                : 'text-[#666666] hover:text-[#999999]'
            }`}
          >
            <Sparkles size={16} strokeWidth={activeTab === 'synastry' ? 2 : 1.5} />
            <span>{t.nav.synastry}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${
              activeTab === 'settings'
                ? 'text-white border-b border-white'
                : 'text-[#666666] hover:text-[#999999]'
            }`}
          >
            <Sliders size={16} strokeWidth={activeTab === 'settings' ? 2 : 1.5} />
            <span>{t.nav.settings}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
