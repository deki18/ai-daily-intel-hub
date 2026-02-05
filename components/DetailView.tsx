import React, { useEffect, useState } from 'react';
import { BriefingDetail, Category } from '../types';
import { fetchBriefingDetail } from '../services/dataService';
import AudioPlayer from './AudioPlayer';
import MarkdownRenderer from './MarkdownRenderer';
import { ChevronLeftIcon } from './Icons';
import LanguageSelector from '../src/components/LanguageSelector';
import { Language } from '../src/i18n/i18n';

interface DetailViewProps {
  id: string;
  onBack: () => void;
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  onLanguageChange: (language: Language) => void;
  category?: Category;
}

const DetailView: React.FC<DetailViewProps> = ({ id, onBack, language, t, onLanguageChange, category = 'politics' }) => {
  const [detail, setDetail] = useState<BriefingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBriefingDetail(id, language, category);
        setDetail(data);
      } catch (err) {
        console.error('Failed to load briefing detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to load briefing detail');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, language, category]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <h2 className="text-2xl font-bold text-white mb-4">{t('detail.error')}</h2>
        <p className="text-subtext mb-8 text-center">{error || 'Unknown error occurred'}</p>
        <button 
            onClick={onBack}
            className="px-6 py-3 bg-accent text-black font-medium rounded-full hover:bg-accent/90 transition-colors"
        >
            {t('detail.returnToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text pb-36 md:pb-32 animate-fade-in relative player-spacer">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
         <img src={detail.coverImage} className="w-full h-full object-cover blur-3xl" alt="" />
         <div className="absolute inset-0 bg-background/80"></div>
      </div>

      {/* Header / Nav */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center justify-between">
          <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0"
          >
              <ChevronLeftIcon />
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={onLanguageChange} 
            />
          

        </div>
      </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="mb-8">
            <span className="font-mono text-accent text-sm tracking-wider mb-2 block">{detail.date}</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                {detail.title}
            </h1>
            <div className="h-1 w-20 bg-accent rounded-full"></div>
        </div>

        {/* Content Container */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl">
            <div className="prose prose-invert max-w-none">
                <MarkdownRenderer content={detail.fullContent} />
            </div>
        </div>
      </div>

      {/* Player */}
      <AudioPlayer 
        detail={detail} 
        t={t} 
        autoPlay={true}
      />
    </div>
  );
};

export default DetailView;