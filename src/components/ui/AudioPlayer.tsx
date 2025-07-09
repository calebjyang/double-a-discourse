import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";

export interface AudioPlayerHandle {
  pause: () => void;
  play: () => void;
}

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  guest: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  ({ audioUrl, title, guest, isPlaying, onPlay, onPause }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useImperativeHandle(ref, () => ({
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      },
      play: () => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      },
    }));

    // Sync playback with isPlaying prop
    useEffect(() => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }, [isPlaying]);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (isPlaying) audioRef.current.play();
      }
    }, [audioUrl]);

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const value = Number(e.target.value);
      audioRef.current.currentTime = (value / 100) * (audioRef.current.duration || 0);
      setProgress(value);
    };

    // Format time (mm:ss)
    const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const m = Math.floor(time / 60);
      const s = Math.floor(time % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    return (
      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-50 w-full max-w-xl px-4 py-3 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 rounded-xl flex items-center" style={{minHeight: 72}}>
        <button
          onClick={() => (isPlaying ? onPause() : onPlay())}
          className={`flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors mr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="6" y="6" width="5" height="16" rx="2" fill="currentColor"/><rect x="17" y="6" width="5" height="16" rx="2" fill="currentColor"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M7 6v16l14-8-14-8z" fill="currentColor"/></svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate text-gray-900 dark:text-white">{title}</span>
            {isPlaying && <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">with {guest}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 w-8 text-right">{audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className="flex-1 accent-primary h-1 rounded-lg bg-gray-200 dark:bg-gray-700 appearance-none cursor-pointer"
              style={{ accentColor: '#ff4a4a' }}
            />
            <span className="text-xs text-gray-400 w-8 text-left">{formatTime(duration)}</span>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{ display: "none" }}
        />
      </div>
    );
  }
);

export default AudioPlayer; 