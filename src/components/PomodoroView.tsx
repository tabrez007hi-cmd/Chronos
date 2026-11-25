import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ExternalLink,
  Settings,
  BookOpen,
  Flame,
  LayoutTemplate,
  Clock,
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { useTimer } from '../context/TimerContext';
import { COLOR_PALETTES } from '../utils/storage';

export const PomodoroView: React.FC = () => {
  const {
    pomoPhase,
    pomoCompletedCycles,
    pomoTimeLeft,
    pomoAddedSeconds,
    pomoTotalSeconds,
    pomoIsRunning,
    pomoScheduledEndAt,
    pomoConfig,
    updatePomoConfig,
    setPomoPhase,
    togglePomoRunning,
    resetPomo,
    skipPomoPhase,
    addPomoTime,
    activeSubject,
    setActiveSubject,
    subjects,
    setIsSubjectModalOpen,
    launchOsPip,
    isOsPipActive,
    setShowInAppPip,
    setActiveMode,
  } = useTimer();

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const totalDuration = pomoTotalSeconds;

  const progressRatio =
    totalDuration > 0 ? Math.min(1, Math.max(0, (totalDuration - pomoTimeLeft) / totalDuration)) : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const minutes = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0');
  const seconds = (pomoTimeLeft % 60).toString().padStart(2, '0');

  const phaseTheme = {
    focus: {
      label: 'Deep Focus',
      color: 'ch-text-accent',
      stroke: 'stroke-[var(--ch-accent)]',
    },
    shortBreak: {
      label: 'Short Rest',
      color: 'text-emerald-500',
      stroke: 'stroke-emerald-500',
    },
    longBreak: {
      label: 'Long Rest',
      color: 'text-sky-500',
      stroke: 'stroke-sky-500',
    },
  }[pomoPhase];

  const scheduledEndLabel = pomoScheduledEndAt
    ? new Date(pomoScheduledEndAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight ch-text">Pomodoro Deep Work</h2>
            <span className="text-xs ch-text-muted">· {phaseTheme.label}</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Wall-clock synchronized focus sprints that persist and conclude on schedule
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setActiveMode('pomodoro');
              setShowInAppPip(true);
            }}
            className="hidden sm:flex ch-btn-secondary items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
            title="Open in-app floating timer widget"
          >
            <LayoutTemplate className="w-3.5 h-3.5 ch-text-muted" />
            <span>Mini Widget</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('pomodoro');
              launchOsPip();
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isOsPipActive ? 'ch-accent-soft shadow-sm' : 'ch-btn-secondary'
            }`}
            title="Pop out floating timer window over other applications"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isOsPipActive ? 'Floating (Active)' : 'Float (PiP)'}</span>
            <span className="sm:hidden">PiP</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ch-btn-secondary p-2 rounded-xl"
            title="Configure Pomodoro timings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phase Segmented Selector */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md grid grid-cols-3 p-1 ch-glass-card rounded-2xl gap-1">
          <button
            onClick={() => {
              setActiveMode('pomodoro');
              setPomoPhase('focus');
            }}
            className={`py-2 px-2 text-center text-[11px] sm:text-xs font-semibold rounded-xl transition-colors truncate ${
              pomoPhase === 'focus' ? 'ch-accent-soft font-bold' : 'ch-text-muted hover:ch-text'
            }`}
          >
            Focus ({Math.round(pomoConfig.focusDuration / 60)}m)
          </button>
          <button
            onClick={() => {
              setActiveMode('pomodoro');
              setPomoPhase('shortBreak');
            }}
            className={`py-2 px-2 text-center text-[11px] sm:text-xs font-semibold rounded-xl transition-colors truncate ${
              pomoPhase === 'shortBreak'
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/35 font-bold'
                : 'ch-text-muted hover:ch-text'
            }`}
          >
            Break ({Math.round(pomoConfig.shortBreakDuration / 60)}m)
          </button>
          <button
            onClick={() => {
              setActiveMode('pomodoro');
              setPomoPhase('longBreak');
            }}
            className={`py-2 px-2 text-center text-[11px] sm:text-xs font-semibold rounded-xl transition-colors truncate ${
              pomoPhase === 'longBreak'
                ? 'bg-sky-500/15 text-sky-500 border border-sky-500/35 font-bold'
                : 'ch-text-muted hover:ch-text'
            }`}
          >
            Long ({Math.round(pomoConfig.longBreakDuration / 60)}m)
          </button>
        </div>
      </div>

      {/* Main Frosted Glass Dial Showcase */}
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
                onClick={() => setActiveSubject(sub.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all ${
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
            onClick={() => setIsSubjectModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs ch-text-muted hover:ch-text-accent ch-glass-subtle border-dashed rounded-lg transition-colors"
            title="Manage study subjects"
          >
            <span>+ Manage</span>
          </button>
        </div>

        {/* Circular Dial Display */}
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
              className={`${phaseTheme.stroke} transition-all duration-500 ease-out`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${phaseTheme.color}`}>
              {phaseTheme.label}
            </span>
            <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight ch-text tabular-nums">
              {minutes}:{seconds}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs ch-text-muted">
              <Flame className="w-3.5 h-3.5 ch-text-accent" />
              <span>
                Cycle {(pomoCompletedCycles % pomoConfig.longBreakInterval) + 1} of {pomoConfig.longBreakInterval}
                {pomoAddedSeconds > 0 ? ` · ${Math.round(pomoTotalSeconds / 60)}m sprint` : ''}
              </span>
            </div>
            {scheduledEndLabel && (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono ch-text-accent tabular-nums">
                <Clock className="w-3 h-3" />
                <span>Ends {scheduledEndLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setActiveMode('pomodoro');
              addPomoTime(60);
            }}
            className="ch-btn-secondary px-3 py-2 text-xs font-semibold rounded-xl"
            title="Add 1 minute"
          >
            +1 Min
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('pomodoro');
              addPomoTime(300);
            }}
            className="ch-btn-secondary px-3 py-2 text-xs font-semibold rounded-xl"
            title="Add 5 minutes"
          >
            +5 Min
          </button>

          <button
            onClick={() => {
              setActiveMode('pomodoro');
              togglePomoRunning();
            }}
            className={`flex items-center gap-2 px-7 sm:px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${
              pomoIsRunning ? 'ch-accent-soft' : 'ch-btn-primary'
            }`}
          >
            {pomoIsRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={resetPomo}
            className="ch-btn-secondary p-3 rounded-xl"
            title="Reset Phase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={skipPomoPhase}
            className="ch-btn-secondary p-3 rounded-xl"
            title="Skip to Next Phase"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Session Note Input */}
        <div className="w-full max-w-md mt-6 pt-5 border-t ch-border">
          <input
            type="text"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Focus objective for this cycle (e.g. Chapter 4 Practice Questions 1-10)..."
            className="ch-input w-full px-3.5 py-2 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[92dvh] overflow-y-auto ch-glass-modal rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b ch-border pb-3">
              <h4 className="text-base font-bold ch-text">Pomodoro Intervals &amp; Sound</h4>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs ch-text-muted hover:ch-text"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs ch-text-muted font-medium block mb-1">Focus (min)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={Math.round(pomoConfig.focusDuration / 60)}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 25);
                    updatePomoConfig({ ...pomoConfig, focusDuration: val * 60 });
                  }}
                  className="ch-input w-full px-3 py-2 text-sm font-mono rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs ch-text-muted font-medium block mb-1">Short Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={Math.round(pomoConfig.shortBreakDuration / 60)}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 5);
                    updatePomoConfig({ ...pomoConfig, shortBreakDuration: val * 60 });
                  }}
                  className="ch-input w-full px-3 py-2 text-sm font-mono rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs ch-text-muted font-medium block mb-1">Long Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={Math.round(pomoConfig.longBreakDuration / 60)}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 15);
                    updatePomoConfig({ ...pomoConfig, longBreakDuration: val * 60 });
                  }}
                  className="ch-input w-full px-3 py-2 text-sm font-mono rounded-xl tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium ch-text">Auto-start Breaks</div>
                  <div className="text-xs ch-text-muted">Begin break intervals immediately after focus</div>
                </div>
                <input
                  type="checkbox"
                  checked={pomoConfig.autoStartBreaks}
                  onChange={(e) => updatePomoConfig({ ...pomoConfig, autoStartBreaks: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium ch-text">Soft Second Ticking</div>
                  <div className="text-xs ch-text-muted">Subtle audible pace cue for deep flow</div>
                </div>
                <input
                  type="checkbox"
                  checked={pomoConfig.tickingSound}
                  onChange={(e) => updatePomoConfig({ ...pomoConfig, tickingSound: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium ch-text">Completion Sound</div>
                  <div className="text-xs ch-text-muted">Chime played when interval completes</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pomoConfig.soundAlert}
                    onChange={(e) => updatePomoConfig({ ...pomoConfig, soundAlert: e.target.value })}
                    className="ch-input px-3 py-1.5 text-xs rounded-xl"
                  >
                    <option value="bowl">Tibetan Singing Bowl</option>
                    <option value="chime">Modern Bell Chime</option>
                    <option value="marimba">Warm Marimba</option>
                    <option value="digital">Digital Alarm</option>
                  </select>
                  <button
                    onClick={() => playChime(pomoConfig.soundAlert)}
                    className="ch-btn-secondary px-2.5 py-1.5 text-xs rounded-xl"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="ch-btn-primary px-5 py-2 text-xs rounded-xl"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
