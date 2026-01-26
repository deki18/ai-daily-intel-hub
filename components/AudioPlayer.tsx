import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, RewindIcon, FastForwardIcon } from './Icons';
import { BriefingDetail } from '../types';

interface AudioPlayerProps {
  detail: BriefingDetail;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ detail, t }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Setup Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: detail.title,
        artist: 'AI Daily Intel',
        album: detail.date,
        artwork: [
          { src: detail.coverImage, sizes: '96x96', type: 'image/jpeg' },
          { src: detail.coverImage, sizes: '128x128', type: 'image/jpeg' },
          { src: detail.coverImage, sizes: '192x192', type: 'image/jpeg' },
          { src: detail.coverImage, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => skip(15));
    }
  }, [detail]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Set the audio source only when user clicks play
        if (!audioRef.current.src.includes(detail.audioUrl)) {
          audioRef.current.src = detail.audioUrl;
        }
        audioRef.current.play().catch(error => {
          // Only log errors in development mode
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Audio playback error (development mode):', error);
          }
          // Avoid alerting in development mode to prevent frequent prompts
          if (process.env.NODE_ENV === 'production') {
            alert(t('audioPlayer.loadError'));
          }
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, t, detail.audioUrl]);

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    // Only log errors in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Audio loading error (development mode):', e);
    }
    setIsPlaying(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const iconSize = window.innerWidth < 640 ? 20 : 24;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-surface/95 backdrop-blur-md border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] safe-area-pb">
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
      />

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 sm:py-4">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 font-mono w-full mb-2 sm:mb-3">
          <span className="min-w-[30px] max-sm:min-w-[28px] text-right truncate">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-grow h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="min-w-[30px] max-sm:min-w-[28px] truncate">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button 
                onClick={cyclePlaybackRate}
                className="text-xs font-bold text-accent border border-accent/30 rounded px-2 py-1 max-sm:w-10 hover:bg-accent/10 transition-colors shrink-0"
            >
                {playbackRate}x
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => skip(-15)} className="text-gray-400 hover:text-white transition-colors p-1">
                    <RewindIcon size={iconSize} />
                </button>

                <button
                    onClick={togglePlay}
                    className="bg-accent text-black rounded-full p-2.5 sm:p-3 hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                    {isPlaying ? <PauseIcon size={iconSize} /> : <PlayIcon size={iconSize} className="ml-0.5" />}
                </button>

                <button onClick={() => skip(15)} className="text-gray-400 hover:text-white transition-colors p-1">
                    <FastForwardIcon size={iconSize} />
                </button>
            </div>

            {/* Placeholder for symmetry */}
            <div className="w-10 max-sm:hidden shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;