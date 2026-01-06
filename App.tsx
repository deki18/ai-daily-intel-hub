import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import LandingView from './components/LandingView';
import ListView from './components/ListView';
import DetailView from './components/DetailView';
import { startFileWatcher } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);

  // Simple state persistence for demo experience reset
  useEffect(() => {
    // Optional: check if user visited before to skip landing?
    // For now, we always show landing for the experience.
  }, []);

  // Start file watcher with polling mechanism
  useEffect(() => {
    const stopWatcher = startFileWatcher(30000); // Poll every 30 seconds
    return stopWatcher;
  }, []);

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
        <LandingView onEnter={handleEnter} />
      )}

      {currentView === AppView.LIST && (
        <ListView 
            onSelect={handleSelectBriefing} 
            onBack={handleBackToLanding} 
        />
      )}

      {currentView === AppView.DETAIL && selectedBriefingId && (
        <DetailView 
            id={selectedBriefingId} 
            onBack={handleBackToList} 
        />
      )}
    </div>
  );
};

export default App;