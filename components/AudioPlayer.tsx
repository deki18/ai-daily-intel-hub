import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, RewindIcon, FastForwardIcon } from './Icons';
import { BriefingDetail } from '../types';

interface AudioPlayerProps {
  detail: BriefingDetail;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ detail }) => {
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
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

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

  return (
    <div className="w-full bg-surface/90 backdrop-blur-md border-t border-white/10 p-4 pb-8 md:pb-4 fixed bottom-0 left-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <audio
        ref={audioRef}
        src={detail.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-grow h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between md:justify-center md:gap-12">
            <button 
                onClick={cyclePlaybackRate}
                className="text-xs font-bold text-accent border border-accent/30 rounded px-2 py-1 w-12 hover:bg-accent/10 transition-colors"
            >
                {playbackRate}x
            </button>

            <div className="flex items-center gap-6">
                <button onClick={() => skip(-15)} className="text-gray-400 hover:text-white transition-colors">
                    <RewindIcon size={24} />
                </button>

                <button 
                    onClick={togglePlay} 
                    className="bg-accent text-black rounded-full p-3 hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                    {isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} className="ml-1" />}
                </button>

                <button onClick={() => skip(15)} className="text-gray-400 hover:text-white transition-colors">
                    <FastForwardIcon size={24} />
                </button>
            </div>

            {/* Placeholder for symmetry or volume on desktop */}
            <div className="w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;