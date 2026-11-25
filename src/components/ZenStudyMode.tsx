import React, { useState, useEffect } from 'react';
import { Minimize2, Volume2, VolumeX, Play, Pause, RotateCcw, Palette } from 'lucide-react';
import { AmbientSoundType, ZenDesignStyle } from '../types';
import { startAmbientSound, stopAmbientSound, subscribeAudioStatus } from '../utils/audio';
import { useTimer } from '../context/TimerContext';
import {
  loadZenDesignStyle,
  saveZenDesignStyle,
  FOCUS_TRACKS_CATALOG,
} from '../utils/storage';

interface ZenStudyModeProps {
  onExit: () => void;
  ambientSound: AmbientSoundType;
  onChangeAmbientSound: (sound: AmbientSoundType) => void;
}

const ZEN_DESIGNS: { id: ZenDesignStyle; label: string }[] = [
  { id: 'halo', label: 'Chrono Halo' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'flip', label: 'Mechanical Flip' },
  { id: 'aurora', label: 'Aurora Glass' },
  { id: 'warm-paper', label: 'Amber Night' },
];

const QUICK_AMBIENT_CYCLE: AmbientSoundType[] = [
  'yt-lofi-girl',
  'yt-cafe-jazz',
  'yt-ghibli-piano',
  'yt-classical',
  'yt-synthwave',
  'yt-brown-noise',
  'rain',
  'piano',
  'binaural',
];

export const ZenStudyMode: React.FC<ZenStudyModeProps> = ({
  onExit,
  ambientSound,
  onChangeAmbientSound,
}) => {
  const {
    currentDisplayTime,
    currentDisplayProgress,
    currentIsRunning,
    currentTitle,
    currentSubtitle,
    toggleCurrentRunning,
    resetCurrent,
  } = useTimer();

  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [designStyle, setDesignStyle] = useState<ZenDesignStyle>(() => loadZenDesignStyle());
  const [activeTrackTitle, setActiveTrackTitle] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeAudioStatus((st) => setActiveTrackTitle(st.trackTitle));
    return unsub;
  }, []);

  const handleSelectDesign = (style: ZenDesignStyle) => {
    setDesignStyle(style);
    saveZenDesignStyle(style);
  };

  useEffect(() => {
    let timeoutId: number;
    const handleActivity = () => {
      setControlsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);

    timeoutId = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3500);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearTimeout(timeoutId);
    };
  }, []);

  const progressPct = Math.min(100, Math.max(0, currentDisplayProgress * 100));
  const timeSegments = currentDisplayTime.split(':');

  const containerClasses =
    designStyle === 'warm-paper' ? 'bg-[#120e09] text-amber-50' : 'bg-[#06080f] text-neutral-50';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 select-none overflow-hidden transition-colors duration-500 ${containerClasses}`}
    >
      {/* Background Ambient Layer per Design */}
      {designStyle === 'aurora' && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-500/18 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-emerald-500/14 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-indigo-500/12 rounded-full blur-3xl" />
        </div>
      )}

      {designStyle === 'warm-paper' && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(217, 119, 6, 0.08), transparent 65%)',
          }}
        />
      )}

      {/* Top Bar (Auto-hiding) */}
      <div
        className={`relative z-10 w-full flex flex-wrap items-center justify-between gap-2 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-neutral-400 whitespace-nowrap">
            ZEN STUDIO
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-xs text-amber-400 font-semibold truncate">{currentTitle}</span>
        </div>

        {/* Zen Design Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 overflow-x-auto max-w-full scrollbar-none">
          <Palette className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-0.5 shrink-0 hidden sm:inline" />
          {ZEN_DESIGNS.map((d) => {
            const active = designStyle === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelectDesign(d.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-neutral-100 rounded-xl border border-white/15 backdrop-blur-md transition-colors shadow-lg whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Zen</span>
        </button>
      </div>

      {/* Center Display */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center w-full max-w-4xl">
        {/* DESIGN 1: CHRONO HALO RING */}
        {designStyle === 'halo' && (
          <div className="relative flex flex-col items-center justify-center p-4">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 [@media(max-height:520px)]:w-52 [@media(max-height:520px)]:h-52 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                {Array.from({ length: 60 }).map((_, idx) => {
                  const angle = (idx * 6 * Math.PI) / 180;
                  const rOuter = 105;
                  const rInner = idx % 5 === 0 ? 97 : 101;
                  const x1 = 110 + rInner * Math.cos(angle);
                  const y1 = 110 + rInner * Math.sin(angle);
                  const x2 = 110 + rOuter * Math.cos(angle);
                  const y2 = 110 + rOuter * Math.sin(angle);
                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={idx % 5 === 0 ? 'rgba(245,158,11,0.45)' : 'rgba(255,255,255,0.12)'}
                      strokeWidth={idx % 5 === 0 ? 1.8 : 1}
                    />
                  );
                })}
                <circle
                  cx="110"
                  cy="110"
                  r="88"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="6"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="88"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - progressPct / 100)}
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                <div className="text-[10px] sm:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-1.5">
                  {currentSubtitle}
                </div>
                <div className="font-mono text-4xl sm:text-6xl md:text-7xl [@media(max-height:520px)]:text-4xl font-bold tracking-tight text-neutral-50 tabular-nums leading-none">
                  {currentDisplayTime}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESIGN 2: SPLIT-FLAP MECHANICAL */}
        {designStyle === 'flip' && (
          <div className="flex flex-col items-center">
            <div className="text-xs sm:text-sm font-medium tracking-widest uppercase text-neutral-400 mb-5">
              {currentSubtitle}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {timeSegments.map((seg, i) => (
                <React.Fragment key={i}>
                  <div className="relative bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl sm:rounded-3xl px-4 py-5 sm:px-8 sm:py-8 shadow-xl overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[2px] bg-black/70 z-10 pointer-events-none" />
                    <span className="relative font-mono text-5xl sm:text-7xl md:text-8xl [@media(max-height:520px)]:text-5xl font-extrabold text-amber-100 tabular-nums leading-none">
                      {seg}
                    </span>
                  </div>
                  {i < timeSegments.length - 1 && (
                    <span className="font-mono text-4xl sm:text-6xl font-bold text-amber-400/70">
                      :
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="w-64 sm:w-80 md:w-96 max-w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-8">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, progressPct)}%` }}
              />
            </div>
          </div>
        )}

        {/* DESIGN 3: AURORA GLASS CHAMBER */}
        {designStyle === 'aurora' && (
          <div className="bg-white/[0.06] backdrop-blur-md rounded-3xl px-8 py-10 sm:px-14 sm:py-12 shadow-xl border border-white/15 max-w-2xl w-full">
            <div className="text-xs sm:text-sm font-medium tracking-widest uppercase text-amber-300/80 mb-3">
              {currentSubtitle}
            </div>
            <div className="font-mono text-6xl sm:text-8xl md:text-9xl [@media(max-height:520px)]:text-5xl font-bold tracking-tight text-white tabular-nums leading-none">
              {currentDisplayTime}
            </div>
            <div className="w-full max-w-sm mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden mt-8">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, progressPct)}%` }}
              />
            </div>
          </div>
        )}

        {/* DESIGN 4: AMBER NIGHT INK */}
        {designStyle === 'warm-paper' && (
          <div className="flex flex-col items-center">
            <div className="text-xs sm:text-sm font-medium tracking-widest uppercase text-amber-500/70 mb-4">
              {currentSubtitle}
            </div>
            <div className="font-mono text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] [@media(max-height:520px)]:text-5xl font-bold tracking-tight text-amber-200 tabular-nums leading-none">
              {currentDisplayTime}
            </div>
            <div className="w-64 sm:w-80 md:w-96 max-w-full bg-amber-950/60 h-1.5 rounded-full overflow-hidden mt-8 sm:mt-10 border border-amber-900/40">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, progressPct)}%` }}
              />
            </div>
          </div>
        )}

        {/* DESIGN 5: OBSIDIAN MINIMAL */}
        {designStyle === 'minimal' && (
          <div className="flex flex-col items-center">
            <div className="text-xs sm:text-sm font-medium tracking-widest uppercase text-neutral-400 mb-4">
              {currentSubtitle}
            </div>
            <div className="font-mono text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] [@media(max-height:520px)]:text-5xl font-bold tracking-tight text-neutral-50 tabular-nums leading-none">
              {currentDisplayTime}
            </div>
            <div className="w-64 sm:w-80 md:w-96 max-w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-8 sm:mt-10">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, progressPct)}%` }}
              />
            </div>
          </div>
        )}

        {/* Play/Pause & Reset Actions */}
        <div
          className={`flex items-center gap-5 mt-6 sm:mt-8 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={toggleCurrentRunning}
            className="p-4 sm:p-5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-2xl transition-transform active:scale-95 cursor-pointer"
            title={currentIsRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {currentIsRunning ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={resetCurrent}
            className="p-3.5 sm:p-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-200 border border-white/15 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`relative z-10 w-full flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="hidden sm:inline">Touch or move mouse to reveal studio controls</span>
        <div className="flex items-center gap-2 ml-auto">
          {ambientSound !== 'off' && (
            <button
              type="button"
              onClick={() => {
                const idx = QUICK_AMBIENT_CYCLE.indexOf(ambientSound);
                const next = QUICK_AMBIENT_CYCLE[(idx + 1) % QUICK_AMBIENT_CYCLE.length];
                onChangeAmbientSound(next);
                startAmbientSound(next);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-neutral-200 border border-white/15 text-[11px] font-medium transition-colors cursor-pointer"
              title="Switch ambient soundscape"
            >
              Switch Track
            </button>
          )}
          <span className="truncate max-w-[180px] sm:max-w-xs">
            Audio:{' '}
            {ambientSound === 'off'
              ? 'Off'
              : ambientSound === 'yt-custom'
              ? activeTrackTitle || 'Custom YouTube Stream'
              : FOCUS_TRACKS_CATALOG.find((t) => t.id === ambientSound)?.title || 'Focus Stream'}
          </span>
          <button
            type="button"
            onClick={() => {
              if (ambientSound !== 'off') {
                stopAmbientSound();
                onChangeAmbientSound('off');
              } else {
                onChangeAmbientSound('yt-lofi-girl');
                startAmbientSound('yt-lofi-girl');
              }
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title={ambientSound !== 'off' ? 'Mute focus audio' : 'Play Lofi Girl Focus Radio'}
          >
            {ambientSound !== 'off' ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
