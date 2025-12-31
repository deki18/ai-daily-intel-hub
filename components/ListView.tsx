import React, { useEffect, useState } from 'react';
import { DailyBriefing } from '../types';
import { fetchBriefingList } from '../services/dataService';
import { HeadphonesIcon } from './Icons';

interface ListViewProps {
  onSelect: (id: string) => void;
  onBack: () => void;
}

const ListView: React.FC<ListViewProps> = ({ onSelect, onBack }) => {
  const [briefings, setBriefings] = useState<DailyBriefing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefingList().then(data => {
      setBriefings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4 md:px-8 max-w-6xl mx-auto animate-fade-in">
        <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg z-30 border-b border-white/5 h-16 flex items-center justify-between px-6">
            <button onClick={onBack} className="text-sm text-subtext hover:text-white transition-colors tracking-widest uppercase font-medium">
                AI Daily Intel
            </button>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </header>

        <div className="mb-12 mt-6">
          <h2 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">Recent Briefings</h2>
          <p className="text-subtext text-sm">Deep dives and intelligence reports from the last 24 hours.</p>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 w-full bg-surface rounded-2xl animate-pulse border border-white/5"></div>
                ))}
            </div>
        ) : (
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
        )}
    </div>
  );
};

export default ListView;