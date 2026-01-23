import React, { useEffect, useState } from 'react';
import { DailyBriefing } from '../types';
import { fetchBriefingList } from '../services/dataService';
import { HeadphonesIcon, SearchIcon } from './Icons';
import LanguageSelector from '../src/components/LanguageSelector';
import { Language } from '../src/i18n/i18n';

interface ListViewProps {
  onSelect: (id: string) => void;
  onBack: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const ListView: React.FC<ListViewProps> = ({ onSelect, onBack, t, language, onLanguageChange }) => {
  const [briefings, setBriefings] = useState<DailyBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // Set to 6 to match 3-column grid
  const [total, setTotal] = useState(0);

  const loadBriefings = async (currentPage: number = 1, query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchBriefingList({
        page: currentPage,
        pageSize,
        searchQuery: query
      }, language);
      setBriefings(result.data);
      setTotal(result.total);
      setPage(currentPage);
    } catch (err) {
      console.error('Failed to load briefing list:', err);
      setError(err instanceof Error ? err.message : 'Failed to load briefing list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBriefings(1, searchQuery);
  }, [searchQuery, language]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    loadBriefings(newPage, searchQuery);
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg z-30 border-b border-white/5 h-16 flex items-center justify-between px-6">
            <button onClick={onBack} className="text-sm text-subtext hover:text-white transition-colors tracking-widest uppercase font-medium">
                AI Daily Intel
            </button>
            <div className="flex items-center gap-4">
                <LanguageSelector 
                    currentLanguage={language} 
                    onLanguageChange={onLanguageChange} 
                />
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
        </header>

        <div className="mb-12 mt-6">
          <h2 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">Recent Briefings</h2>
          <p className="text-subtext text-sm">Deep dives and intelligence reports from the last 24 hours.</p>
          
          {/* Search Bar */}
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <SearchIcon size={18} className="text-subtext" />
            </div>
            <input
              type="text"
              placeholder={t('list.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-subtext focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-80 w-full bg-surface rounded-2xl animate-pulse border border-white/5"></div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg z-30 border-b border-white/5 h-16 flex items-center justify-between px-6">
            <button onClick={onBack} className="text-sm text-subtext hover:text-white transition-colors tracking-widest uppercase font-medium">
                AI Daily Intel
            </button>
            <div className="flex items-center gap-4">
                <LanguageSelector 
                    currentLanguage={language} 
                    onLanguageChange={onLanguageChange} 
                />
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
        </header>

        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold text-white mb-4">{t('list.error')}</h2>
          <p className="text-subtext mb-8 text-center">{error}</p>
          <button 
              onClick={() => loadBriefings()}
              className="px-6 py-3 bg-accent text-black font-medium rounded-full hover:bg-accent/90 transition-colors"
          >
              {t('list.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg z-30 border-b border-white/5 h-16 flex items-center justify-between px-6">
            <button onClick={onBack} className="text-sm text-subtext hover:text-white transition-colors tracking-widest uppercase font-medium">
                AI Daily Intel
            </button>
            <div className="flex items-center gap-4">
                <LanguageSelector 
                    currentLanguage={language} 
                    onLanguageChange={onLanguageChange} 
                />
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
        </header>

        <div className="mb-12 mt-6">
          <h2 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">{t('list.title')}</h2>
          <p className="text-subtext text-sm">{t('list.description')}</p>
          
          {/* Search Bar */}
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <SearchIcon size={18} className="text-subtext" />
            </div>
            <input
              type="text"
              placeholder={t('list.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-subtext focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {briefings.map((item, index) => (
                <div 
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="group relative flex flex-col cursor-pointer bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
                    style={{
                        animationDelay: `${index * 100}ms`,
                    }}
                >
                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden bg-surface">
                        {/* Flicker Fix: Overlap plate */}
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-surface z-20 translate-y-[1px]"></div>
                        
                        {/* Grayscale and Darkness overlays */}
                        <div className="absolute inset-0 z-10 bg-black/40 group-hover:bg-transparent transition-colors duration-700"></div>
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90 group-hover:opacity-40 transition-opacity duration-700"></div>
                        
                        <img 
                            src={item.coverImage} 
                            alt={item.title} 
                            className="w-full h-full block object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                        />
                        
                        {/* Optimized Date Badge */}
                        <div className="absolute top-5 left-5 z-20">
                            <div className="bg-black/40 backdrop-blur-lg border border-white/10 px-4 py-2 rounded-xl shadow-lg">
                                <span className="text-sm font-bold font-mono text-accent tracking-widest uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                                    {item.date}
                                </span>
                            </div>
                        </div>

                        {/* Audio Play Indicator */}
                        <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                            <div className="bg-accent text-black p-2.5 rounded-full shadow-2xl">
                                <HeadphonesIcon size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="p-7 pt-5 flex flex-col flex-grow bg-surface relative z-30">
                        <h3 className="text-xl font-bold text-gray-400 group-hover:text-white transition-colors duration-500 leading-tight mb-3 line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="text-sm text-subtext line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                            {item.summary}
                        </p>
                    </div>

                    {/* Subtle Border Glow */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/0 group-hover:border-accent/10 transition-colors duration-500"></div>
                </div>
            ))}
        </div>
        
        {/* Pagination */}
        {total > pageSize && (
            <div className="mt-12 flex items-center justify-between">
                <div className="text-sm text-subtext">
                    {t('list.pagination', {
                        start: ((page - 1) * pageSize) + 1,
                        end: Math.min(page * pageSize, total),
                        total: total
                    })}
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => page > 1 && handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 bg-surface border border-white/10 rounded-xl text-subtext hover:text-white disabled:opacity-30 transition-colors"
                    >
                        {t('list.previous')}
                    </button>
                    
                    <div className="text-sm text-subtext">
                        {t('list.pageInfo', {
                            current: page,
                            total: totalPages
                        })}
                    </div>
                    
                    <button
                        onClick={() => page < totalPages && handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-surface border border-white/10 rounded-xl text-subtext hover:text-white disabled:opacity-30 transition-colors"
                    >
                        {t('list.next')}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ListView;