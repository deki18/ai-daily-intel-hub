import React, { useState, useEffect } from 'react';
import { AppView, Category } from './types';
import ListView from './components/ListView';
import DetailView from './components/DetailView';
import { useLanguage } from './src/i18n/i18n';
import { startFileWatcher } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LIST);
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('politics');
  const { language, switchLanguage, t } = useLanguage();

  // Start file watcher with polling mechanism
  useEffect(() => {
    const stopWatcher = startFileWatcher(30000, language); // Poll every 30 seconds with current language
    return stopWatcher;
  }, [language]);

  const handleSelectBriefing = (id: string, category: Category) => {
    setSelectedBriefingId(id);
    setSelectedCategory(category);
    setCurrentView(AppView.DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSelectedBriefingId(null);
    setCurrentView(AppView.LIST);
  };

  return (
    <div className="antialiased selection:bg-accent selection:text-black">

      {currentView === AppView.LIST && (
        <ListView
            onSelect={handleSelectBriefing}
            onBack={() => {}}
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
            category={selectedCategory}
        />
      )}
    </div>
  );
};

export default App;