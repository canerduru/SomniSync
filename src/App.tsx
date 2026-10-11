import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileShell, ActiveTab } from './components/layout/MobileShell';
import { HoldToRecord } from './components/record/HoldToRecord';
import { GrimoireScreen } from './components/grimoire/GrimoireScreen';
import { SynastryScreen } from './components/synastry/SynastryScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { LensSwiper } from './components/lenses/LensSwiper';
import { DreamRecord } from './types/dream';
import { dreamRepository } from './services/db/DreamRepository';

function SomniSyncApp() {
  const { user, updateProfile, purgeAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('record');
  const [activeDreamDetail, setActiveDreamDetail] = useState<DreamRecord | null>(null);
  const [dreams, setDreams] = useState<DreamRecord[]>([]);

  // Load user dreams from repository
  const loadDreams = useCallback(async () => {
    const list = await dreamRepository.getDreamsForUser(user.id);
    setDreams(list);
  }, [user.id]);

  useEffect(() => {
    loadDreams();
  }, [loadDreams]);

  const handleDreamCreated = (newDream: DreamRecord) => {
    setDreams((prev) => [newDream, ...prev]);
    // Automatically transition to the Triadic Lens Swiper for the new dream
    setActiveDreamDetail(newDream);
  };

  const handleDeleteDream = async (dreamId: string) => {
    await dreamRepository.deleteDream(dreamId);
    setDreams((prev) => prev.filter((d) => d.id !== dreamId));
    if (activeDreamDetail?.id === dreamId) {
      setActiveDreamDetail(null);
    }
  };

  const handlePurgeAllData = async () => {
    await dreamRepository.purgeUserData(user.id);
    purgeAccount();
    setDreams([]);
    setActiveDreamDetail(null);
  };

  // If a dream is selected for detailed Triadic Lens inspection
  if (activeDreamDetail) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#f5f5f5] flex justify-center items-center p-0 md:p-6 bg-noise selection:bg-white selection:text-black">
        <div className="w-full max-w-md h-screen md:h-[844px] bg-[#080808] border border-[#222222] md:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
          <LensSwiper
            dream={activeDreamDetail}
            onBack={() => setActiveDreamDetail(null)}
          />
        </div>
      </div>
    );
  }

  const handleResetDemoData = async () => {
    dreamRepository.resetDemoData();
    await loadDreams();
  };

  return (
    <MobileShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'record' && (
        <HoldToRecord
          onDreamCreated={handleDreamCreated}
          onNavigateToGrimoire={() => setActiveTab('grimoire')}
          dreamsCount={dreams.length}
        />
      )}
      {activeTab === 'grimoire' && (
        <GrimoireScreen
          dreams={dreams}
          onSelectDream={(dream) => setActiveDreamDetail(dream)}
          onDeleteDream={handleDeleteDream}
          onResetDemoData={handleResetDemoData}
        />
      )}
      {activeTab === 'synastry' && <SynastryScreen userDreams={dreams} />}
      {activeTab === 'settings' && (
        <SettingsScreen
          onPurgeAllData={handlePurgeAllData}
          onResetDemoData={handleResetDemoData}
          allowSynastryDefault={user.allow_synastry}
          setAllowSynastryDefault={(val) => updateProfile({ allow_synastry: val })}
        />
      )}
    </MobileShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SomniSyncApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
