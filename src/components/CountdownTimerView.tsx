import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  LayoutTemplate,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { COLOR_PALETTES } from '../utils/storage';

const PRESETS = [
  { label: '5m', name: 'Quick Review', seconds: 5 * 60 },
  { label: '15m', name: 'Flashcard Sprint', seconds: 15 * 60 },
  { label: '25m', name: 'Standard Sprint', seconds: 25 * 60 },
  { label: '45m', name: 'Lecture Block', seconds: 45 * 60 },
  { label: '60m', name: 'Deep Hour', seconds: 60 * 60 },
  { label: '90m', name: 'Exam Simulation', seconds: 90 * 60 },
  { label: '120m', name: '2-Hour Intensive', seconds: 120 * 60 },
];

export const CountdownTimerView: React.FC = () => {
  const {
    countTotalSeconds,
    countTimeLeft,
    countIsRunning,
    countScheduledEndAt,
    countTitle,
    setCountTitle,
    setCountdownDuration,
    toggleCountRunning,
    resetCount,
    addCountTime,
    activeSubject,
    setActiveSubject,
    subjects,
    setIsSubjectModalOpen,
    launchOsPip,
    isOsPipActive,
    setShowInAppPip,
    setActiveMode,
  } = useTimer();

  const [inputHours, setInputHours] = useState<number>(() => Math.floor(countTotalSeconds / 3600));
  const [inputMinutes, setInputMinutes] = useState<number>(() => Math.floor((countTotalSeconds % 3600) / 60));
  const [inputSeconds, setInputSeconds] = useState<number>(() => countTotalSeconds % 60);

  useEffect(() => {
    setInputHours(Math.floor(countTotalSeconds / 3600));
    setInputMinutes(Math.floor((countTotalSeconds % 3600) / 60));
    setInputSeconds(countTotalSeconds % 60);
  }, [countTotalSeconds]);

  const applyCustomDuration = () => {
    const total = inputHours * 3600 + inputMinutes * 60 + inputSeconds;
    if (total <= 0) return;
    setActiveMode('timer');
    setCountdownDuration(total, 'Custom Countdown');
  };

  const selectPreset = (preset: typeof PRESETS[0]) => {
    setActiveMode('timer');
    setCountdownDuration(preset.seconds, preset.name);
    const h = Math.floor(preset.seconds / 3600);
    const m = Math.floor((preset.seconds % 3600) / 60);
    const s = preset.seconds % 60;
    setInputHours(h);
    setInputMinutes(m);
    setInputSeconds(s);
  };

  const hours = Math.floor(countTimeLeft / 3600);
  const minutes = Math.floor((countTimeLeft % 3600) / 60);
  const seconds = countTimeLeft % 60;

  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');

  const blockTargetLabel =
    countTotalSeconds >= 3600
      ? `${Math.floor(countTotalSeconds / 3600)}h ${Math.floor((countTotalSeconds % 3600) / 60)}m`
      : countTotalSeconds % 60 === 0
      ? `${Math.round(countTotalSeconds / 60)}m`
      : `${Math.floor(countTotalSeconds / 60)}m ${countTotalSeconds % 60}s`;

  const progressRatio =
    countTotalSeconds > 0
      ? Math.min(1, Math.max(0, (countTotalSeconds - countTimeLeft) / countTotalSeconds))
      : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const scheduledEndLabel = countScheduledEndAt
    ? new Date(countScheduledEndAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight ch-text">Study Countdown Timer</h2>
            <span className="text-xs ch-text-muted">· {countTitle}</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Synced to real wall-clock time so blocks finish automatically as scheduled even after closing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveMode('timer');
              setShowInAppPip(true);
            }}
            className="ch-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
            title="Open in-app floating timer widget"
          >
            <LayoutTemplate className="w-3.5 h-3.5 ch-text-muted" />
            <span>Mini Widget</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('timer');
              launchOsPip();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isOsPipActive
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sm'
                : 'ch-btn-secondary'
            }`}
            title="Pop out floating timer over other applications"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isOsPipActive ? 'Floating (Active)' : 'Float (PiP)'}</span>
          </button>
        </div>
      </div>

      {/* Quick Study Presets */}
      <div>
        <div className="text-xs font-semibold ch-text-muted mb-2">Study Presets</div>
        <div className="grid grid-cols-2 @sm/main:grid-cols-4 @3xl/main:grid-cols-7 gap-2">
          {PRESETS.map((p) => {
            const isSelected = countTotalSeconds === p.seconds && countTitle === p.name;
            return (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className={`p-3 rounded-2xl border text-left transition-colors ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/45 text-sky-500'
                    : 'ch-glass-card hover:border-[var(--ch-border-strong)] ch-text-secondary'
                }`}
              >
                <div className="font-mono text-base font-bold ch-text tabular-nums">{p.label}</div>
                <div className="text-[11px] ch-text-muted truncate mt-0.5">{p.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="relative overflow-hidden rounded-3xl ch-glass-card p-5 sm:p-8 flex flex-col items-center justify-center text-center">
        {/* Subject Bar Selector */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-xs ch-text-muted flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Subject:
          </span>
          {subjects.map((sub) => {
            const palette = COLOR_PALETTES[sub.color] || COLOR_PALETTES.amber;
            const isSelected = activeSubject === sub.name;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubject(sub.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? `${palette.bg} ${palette.text} ${palette.border} font-semibold shadow-xs`
                    : 'ch-glass-subtle ch-text-muted hover:ch-text hover:border-[var(--ch-border-strong)]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${palette.solidBg}`} />
                <span>{sub.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs ch-text-muted hover:ch-text-accent ch-glass-subtle border-dashed rounded-lg transition-colors cursor-pointer"
            title="Manage study subjects"
          >
            <span>+ Manage</span>
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 flex-wrap justify-center">
          <input
            type="text"
            value={countTitle}
            onChange={(e) => setCountTitle(e.target.value)}
            className="ch-input text-sm font-semibold rounded-xl px-3.5 py-1.5 text-center"
            placeholder="Timer Title..."
          />
          <span className="text-xs ch-text-muted">({activeSubject})</span>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r={radius}
              style={{ stroke: 'var(--ch-ring-track)' }}
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="stroke-sky-500 transition-all duration-500 ease-out"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500 mb-1">
              {countIsRunning ? 'Counting Down' : countTimeLeft === 0 ? 'Completed' : 'Ready'}
            </span>
            <div className="font-mono text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight ch-text tabular-nums">
              {hours > 0 ? `${hoursStr}:${minutesStr}:${secondsStr}` : `${minutesStr}:${secondsStr}`}
            </div>
            <span className="text-xs ch-text-muted font-mono mt-2 tabular-nums">
              {Math.round(progressRatio * 100)}% Elapsed · {blockTargetLabel} block
            </span>
            {scheduledEndLabel && (
              <span className="mt-1 flex items-center gap-1 text-[11px] font-mono text-sky-500 tabular-nums">
                <Clock className="w-3 h-3" />
                Stops at {scheduledEndLabel}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setActiveMode('timer');
              addCountTime(60);
            }}
            className="ch-btn-secondary px-3 py-2 text-xs font-semibold rounded-xl"
          >
            +1 Min
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('timer');
              addCountTime(300);
            }}
            className="ch-btn-secondary px-3 py-2 text-xs font-semibold rounded-xl"
          >
            +5 Min
          </button>

          <button
            onClick={() => {
              setActiveMode('timer');
              toggleCountRunning();
            }}
            className={`flex items-center gap-2 px-7 sm:px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${
              countIsRunning
                ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 border border-sky-500/35'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold shadow-sky-500/20'
            }`}
          >
            {countIsRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Start Timer</span>
              </>
            )}
          </button>

          <button
            onClick={resetCount}
            className="ch-btn-secondary p-3 rounded-xl"
            title="Reset to Full Duration"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Duration Inputs */}
        <div className="w-full max-w-md mt-6 pt-5 border-t ch-border flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs ch-text-muted mr-2">Custom Time:</span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <input
              type="number"
              min="0"
              max="24"
              value={inputHours}
              onChange={(e) => setInputHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="ch-input w-12 px-2 py-1 text-center rounded-lg tabular-nums"
            />
            <span className="ch-text-muted">h</span>
            <input
              type="number"
              min="0"
              max="59"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="ch-input w-12 px-2 py-1 text-center rounded-lg tabular-nums"
            />
            <span className="ch-text-muted">m</span>
            <input
              type="number"
              min="0"
              max="59"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(Math.max(0, parseInt(e.target.value) || 0))}
              className="ch-input w-12 px-2 py-1 text-center rounded-lg tabular-nums"
            />
            <span className="ch-text-muted">s</span>
          </div>
          <button
            onClick={applyCustomDuration}
            className="ch-btn-secondary ml-2 px-3 py-1.5 text-xs font-semibold rounded-xl"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};
