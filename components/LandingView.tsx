import React, { useEffect, useState } from 'react';
import { HeadphonesIcon } from './Icons';

interface LandingViewProps {
  onEnter: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LandingView: React.FC<LandingViewProps> = ({ onEnter, t }) => {
  const [greetingKey, setGreetingKey] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreetingKey('greeting.morning');
    else if (hours < 18) setGreetingKey('greeting.afternoon');
    else setGreetingKey('greeting.evening');
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] -top-20 -left-20 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[80px] bottom-0 right-0 animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

        <div className="z-10 flex flex-col items-center space-y-8 animate-fade-in p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-4 shadow-2xl">
                <HeadphonesIcon size={32} className="text-accent" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                {t(greetingKey)}
            </h1>

            <p className="text-subtext max-w-md text-sm md:text-base tracking-wide uppercase font-light">
                {t('landing.subtitle')}
            </p>

            <button 
                onClick={onEnter}
                className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-8"
            >
                <div className="absolute inset-0 w-full h-full border border-accent/50 rounded-full"></div>
                <div className="absolute inset-0 w-0 bg-accent transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                <span className="relative text-accent font-medium tracking-widest text-sm group-hover:text-accent-light flex items-center gap-2">
                    {t('landing.accessButton')}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
            </button>
        </div>

        <div className="absolute bottom-8 text-xs text-gray-700 font-mono">
            {t('footer.secureConnection')}
        </div>
    </div>
  );
}

export default LandingView;