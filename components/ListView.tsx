import React, { useEffect, useState, useRef } from 'react';
import { DailyBriefing } from '../types';
import { fetchBriefingList } from '../services/dataService';
import { SearchIcon, LogoIcon, PlayIcon, PauseIcon } from './Icons';
import LanguageSelector from '../src/components/LanguageSelector';
import { Language } from '../src/i18n/i18n';

interface ListViewProps {
  onSelect: (id: string) => void;
  onBack: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

type Category = 'politics' | 'economy' | 'technology';

const ListView: React.FC<ListViewProps> = ({ onSelect, onBack: _onBack, t, language, onLanguageChange }) => {
  const [briefings, setBriefings] = useState<DailyBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // Set to 6 to match 3-column grid
  const [total, setTotal] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category>('politics');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const feedbackModalRef = React.useRef<HTMLDivElement>(null);

  // Audio player state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Close modal when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        feedbackModalRef.current && 
        !feedbackModalRef.current.contains(event.target as Node)
      ) {
        setFeedbackModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Audio playback functions
  const togglePlay = async (e: React.MouseEvent, briefing: DailyBriefing) => {
    e.stopPropagation(); // Prevent card click

    if (playingId === briefing.id) {
      // Pause current
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Stop previous if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Fetch audio URL if not available
      let audioUrl = briefing.audioUrl;
      if (!audioUrl) {
        try {
          const response = await fetch(`/data/${language}/archive/${briefing.id}.json`);
          if (response.ok) {
            const detail = await response.json();
            audioUrl = detail.audioUrl;
          }
        } catch (err) {
          console.error('Failed to fetch audio URL:', err);
          return;
        }
      }

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener('timeupdate', () => {
          setProgress(audio.currentTime);
        });

        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });

        audio.addEventListener('ended', () => {
          setPlayingId(null);
          setProgress(0);
        });

        audio.play();
        setPlayingId(briefing.id);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        {/* Top Navigation Bar - Economist Style */}
        <header className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-white/10">
            {/* Upper Header */}
            <div className="h-10 grid grid-cols-3 items-center px-4 md:px-8 max-w-7xl mx-auto">
                {/* Left - Empty for balance */}
                <div></div>
                {/* Center - Logo */}
                <div className="flex items-center justify-center gap-2">
                    <LogoIcon size={24} className="text-accent" />
                    <span className="text-base font-bold text-white tracking-wider">JOE'S DAILY INTEL</span>
                </div>
                {/* Right - Language & Feedback */}
                <div className="flex items-center justify-end gap-3">
                    <LanguageSelector 
                        currentLanguage={language} 
                        onLanguageChange={onLanguageChange} 
                    />
                    <button
                        onClick={() => setFeedbackModalOpen(true)}
                        className="text-xs text-subtext hover:text-white transition-colors uppercase tracking-wider"
                    >
                        {language === 'zh' ? '反馈' : 'Feedback'}
                    </button>
                </div>
            </div>
            
            {/* Category Navigation - Politics & Military, Economy, Technology */}
            <nav className="border-t border-white/5">
                <div className="flex items-center justify-center gap-8 h-8 px-4 max-w-7xl mx-auto">
                    <button 
                        onClick={() => setActiveCategory('politics')}
                        className={`text-xs uppercase tracking-widest h-full flex items-center transition-colors ${
                            activeCategory === 'politics' 
                                ? 'text-white font-medium border-b-2 border-accent' 
                                : 'text-subtext hover:text-white'
                        }`}
                    >
                        {language === 'zh' ? '政治与军事' : 'Politics & Military'}
                    </button>
                    <button 
                        onClick={() => setActiveCategory('economy')}
                        className={`text-xs uppercase tracking-widest h-full flex items-center transition-colors ${
                            activeCategory === 'economy' 
                                ? 'text-white font-medium border-b-2 border-accent' 
                                : 'text-subtext hover:text-white'
                        }`}
                    >
                        {language === 'zh' ? '经济' : 'Economy'}
                    </button>
                    <button 
                        onClick={() => setActiveCategory('technology')}
                        className={`text-xs uppercase tracking-widest h-full flex items-center transition-colors ${
                            activeCategory === 'technology' 
                                ? 'text-white font-medium border-b-2 border-accent' 
                                : 'text-subtext hover:text-white'
                        }`}
                    >
                        {language === 'zh' ? '科技' : 'Technology'}
                    </button>
                </div>
            </nav>
        </header>

        {/* Hero Section - Economist Style */}
        <div className="pt-20 pb-6 text-center border-b border-white/5">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-2">
                {t('landing.title')}
            </h1>
            <p className="text-subtext text-sm uppercase tracking-[0.3em]">
                {t('landing.subtitle1')}
            </p>
            
            {/* Search Bar - Centered */}
            <div className="mt-6 relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <SearchIcon size={16} className="text-subtext" />
                </div>
                <input
                    type="text"
                    placeholder={t('list.searchPlaceholder')}
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-white/10 rounded-full text-white text-sm placeholder-subtext focus:outline-none focus:border-accent/40 transition-colors text-center"
                />
            </div>
        </div>

        {/* Content based on loading/error state and active category */}
        {activeCategory !== 'politics' ? (
            // Economy and Technology categories - Coming Soon
            <div className="flex flex-col items-center justify-center py-24 px-4">
                <div className="w-20 h-20 mb-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                    {language === 'zh' ? '情报正在准备中' : 'Intelligence is Being Prepared'}
                </h2>
                <p className="text-subtext text-center max-w-md mb-6">
                    {language === 'zh' 
                        ? `${activeCategory === 'economy' ? '经济' : '科技'}板块的内容正在紧张筹备中，敬请期待...`
                        : `The ${activeCategory === 'economy' ? 'Economy' : 'Technology'} section is being prepared. Stay tuned...`}
                </p>
                <button
                    onClick={() => setActiveCategory('politics')}
                    className="px-6 py-3 bg-accent text-black font-medium rounded-full hover:bg-accent/90 transition-colors"
                >
                    {language === 'zh' ? '返回政治与军事' : 'Back to Politics & Military'}
                </button>
            </div>
        ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 w-full bg-surface rounded-2xl animate-pulse border border-white/5"></div>
                ))}
            </div>
        ) : error ? (
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
        ) : (
            <>

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
                            {/* Date Header Banner */}
                            <div className="bg-[#D4AF37] px-3 py-1 relative overflow-hidden">
                                {/* Animated gradient line */}
                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/30 to-transparent"></div>
                                {/* Decorative corner accent */}
                                <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-white/20 to-transparent"></div>
                                <div className="flex items-center gap-2 relative z-10">
                                    {/* Calendar icon */}
                                    <div className="flex flex-col items-center justify-center w-8 h-8 bg-black/20 rounded-lg">
                                        <span className="text-[8px] font-bold text-black/60 uppercase leading-none">{(new Date(item.date)).toLocaleString('en', { month: 'short' })}</span>
                                        <span className="text-sm font-black text-black leading-none">{(new Date(item.date)).getDate()}</span>
                                    </div>
                                    {/* Full date with styling */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-black/60 uppercase tracking-widest">
                                            Daily Report
                                        </span>
                                        <span className="text-base font-black text-black tracking-wide">
                                            {item.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Image Section */}
                            <div className="relative h-48 overflow-hidden bg-surface">
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
                            </div>

                            {/* Text Content */}
                            <div className="p-5 pt-4 flex flex-col flex-grow bg-surface relative z-30">
                                <h3 className="text-lg font-bold text-gray-400 group-hover:text-white transition-colors duration-500 leading-tight mb-2 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-subtext line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity duration-500 mb-3">
                                    {item.summary}
                                </p>

                                {/* Audio Player Controls */}
                                <div className="mt-auto pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => togglePlay(e, item)}
                                            className="w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center hover:bg-accent/20 transition-colors flex-shrink-0"
                                        >
                                            {playingId === item.id ? (
                                                <PauseIcon size={14} className="text-accent" />
                                            ) : (
                                                <PlayIcon size={14} className="text-accent ml-0.5" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-accent transition-all duration-300"
                                                    style={{
                                                        width: playingId === item.id && duration > 0
                                                            ? `${(progress / duration) * 100}%`
                                                            : '0%'
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-subtext">
                                                    {playingId === item.id ? formatTime(progress) : '00:00'}
                                                </span>
                                                <span className="text-[10px] text-subtext">
                                                    {playingId === item.id && duration > 0 ? formatTime(duration) : '--:--'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
            </>
        )}

        {/* Feedback Modal */}
        {feedbackModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setFeedbackModalOpen(false)}
                />
                <div 
                    ref={feedbackModalRef}
                    className="relative bg-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
                >
                    {!feedbackSubmitted ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    {language === 'zh' ? '提交反馈' : 'Submit Feedback'}
                                </h3>
                                <button
                                    onClick={() => setFeedbackModalOpen(false)}
                                    className="text-subtext hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form 
                                action="https://formsubmit.co/a65203806@gmail.com" 
                                method="POST"
                                onSubmit={() => setFeedbackSubmitted(true)}
                            >
                                {/* Disable captcha */}
                                <input type="hidden" name="_captcha" value="false" />
                                {/* Redirect back to site after submission */}
                                <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.href : ''} />
                                {/* Subject line */}
                                <input type="hidden" name="_subject" value="AI Daily Intel Hub - New Feedback" />
                                
                                <div className="mb-4">
                                    <label className="block text-sm text-subtext mb-2">
                                        {language === 'zh' ? '您的邮箱（可选）' : 'Your Email (Optional)'}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder={language === 'zh' ? 'example@email.com' : 'example@email.com'}
                                        className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-white text-sm placeholder-subtext focus:outline-none focus:border-accent/40 transition-colors"
                                    />
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-sm text-subtext mb-2">
                                        {language === 'zh' ? '您的反馈 *' : 'Your Feedback *'}
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={5}
                                        placeholder={language === 'zh' ? '请输入您的问题、建议或反馈...' : 'Please enter your questions, suggestions, or feedback...'}
                                        className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-white text-sm placeholder-subtext focus:outline-none focus:border-accent/40 transition-colors resize-none"
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFeedbackModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-subtext hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        {language === 'zh' ? '取消' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-accent text-black rounded-xl hover:bg-accent/90 transition-colors text-sm font-medium"
                                    >
                                        {language === 'zh' ? '提交' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {language === 'zh' ? '感谢您的反馈！' : 'Thank You for Your Feedback!'}
                            </h3>
                            <p className="text-subtext text-sm mb-6">
                                {language === 'zh' ? '我们会尽快查看您的反馈。' : 'We will review your feedback as soon as possible.'}
                            </p>
                            <button
                                onClick={() => {
                                    setFeedbackModalOpen(false);
                                    setFeedbackSubmitted(false);
                                }}
                                className="px-6 py-3 bg-accent text-black rounded-xl hover:bg-accent/90 transition-colors text-sm font-medium"
                            >
                                {language === 'zh' ? '关闭' : 'Close'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default ListView;
