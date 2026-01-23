import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import LandingView from './components/LandingView';
import ListView from './components/ListView';
import DetailView from './components/DetailView';
import { useLanguage } from './src/i18n/i18n';
import { startFileWatcher } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const { language, switchLanguage, t } = useLanguage();

  // Simple state persistence for demo experience reset
  useEffect(() => {
    // Optional: check if user visited before to skip landing?
    // For now, we always show landing for the experience.
  }, []);

  // Start file watcher with polling mechanism
  useEffect(() => {
    const stopWatcher = startFileWatcher(30000, language); // Poll every 30 seconds with current language
    return stopWatcher;
  }, [language]);

  const handleEnter = () => {
    setCurrentView(AppView.LIST);
  };

  const handleSelectBriefing = (id: string) => {
    setSelectedBriefingId(id);
    setCurrentView(AppView.DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedBriefingId(null);
    setCurrentView(AppView.LIST);
  };

  const handleBackToLanding = () => {
    setCurrentView(AppView.LANDING);
  };

  return (
    <div className="antialiased selection:bg-accent selection:text-black">


      {currentView === AppView.LANDING && (
        <LandingView 
          onEnter={handleEnter} 
          t={t} 
        />
      )}

      {currentView === AppView.LIST && (
        <ListView 
            onSelect={handleSelectBriefing} 
            onBack={handleBackToLanding} 
            t={t} 
            language={language}
            onLanguageChange={switchLanguage}
        />
      )}

      {currentView === AppView.DETAIL && selectedBriefingId && (
        <DetailView 
            id={selectedBriefingId} 
            onBack={handleBackToList} 
            language={language} 
            t={t} 
            onLanguageChange={switchLanguage}
        />
      )}
    </div>
  );
};

export default App;