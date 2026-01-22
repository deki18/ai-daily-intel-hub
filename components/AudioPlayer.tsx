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
        audioRef.current.play().catch(error => {
          console.error('Audio playback error:', error);
          alert(t('audioPlayer.loadError'));
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, t]);

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
    console.error('Audio loading error:', e);
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
    <div className="w-full bg-surface/90 backdrop-blur-md border-t border-white/10 p-2 max-sm:p-1.5 pb-4 max-sm:pb-3 fixed bottom-0 left-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <audio
        ref={audioRef}
        src={detail.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
      />

      <div className="w-full px-4 flex flex-col gap-2 sm:gap-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-1 max-sm:gap-1 text-xs text-gray-400 font-mono">
          <span className="min-w-[36px] max-sm:min-w-[32px] text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-grow h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="min-w-[36px] max-sm:min-w-[32px]">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between max-sm:gap-2">
            <button 
                onClick={cyclePlaybackRate}
                className="text-xs font-bold text-accent border border-accent/30 rounded px-2 py-1 max-sm:w-10 hover:bg-accent/10 transition-colors"
            >
                {playbackRate}x
            </button>

            <div className="flex items-center gap-3 max-sm:gap-2">
                <button onClick={() => skip(-15)} className="text-gray-400 hover:text-white transition-colors">
                    <RewindIcon size={iconSize} />
                </button>

                <button
                    onClick={togglePlay}
                    className="bg-accent text-black rounded-full p-2.5 max-sm:p-2 hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                    {isPlaying ? <PauseIcon size={iconSize} /> : <PlayIcon size={iconSize} className="ml-1" />}
                </button>

                <button onClick={() => skip(15)} className="text-gray-400 hover:text-white transition-colors">
                    <FastForwardIcon size={iconSize} />
                </button>
            </div>

            {/* Placeholder for symmetry or volume on desktop */}
            <div className="w-12 max-sm:w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;