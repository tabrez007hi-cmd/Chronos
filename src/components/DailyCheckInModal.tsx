import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  X,
  Smile,
  Flame,
  Coffee,
  BatteryCharging,
  Clock,
  Minimize2,
  AlertCircle,
} from 'lucide-react';
import { DailyCheckInData } from '../types';
import { getTodayDateString, formatRemainingSnooze } from '../utils/storage';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (checkIn: DailyCheckInData) => void;
  existingCheckIn?: DailyCheckInData | null;
  onSnooze?: (hours: number) => void;
  snoozeUntil?: number | null;
}

const PRESET_FOCUS_WORDS = [
  'DEEP CLARITY',
  'UNSTOPPABLE',
  'RELENTLESS',
  'MASTERY',
  'CALM FOCUS',
  'PERSISTENCE',
  'DISCIPLINE',
  'INTENTIONAL',
  'FLOW STATE',
  'EXECUTION',
];

const PRESET_OBJECTIVES = [
  'Complete 4 Pomodoro focus sprints with zero distractions',
  'Solve 3 algorithmic coding challenges and review solutions',
  'Finish high-yield reading chapter and summarize active recall notes',
  'Master core formulas & solve 10 previous exam questions',
  'Ship project feature module and write clean unit tests',
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCheckIn,
  onSnooze,
  snoozeUntil,
}) => {
  const todayStr = getTodayDateString();
  const todayCheckIn =
    existingCheckIn && existingCheckIn.date === todayStr ? existingCheckIn : null;

  const [focusWord, setFocusWord] = useState<string>(todayCheckIn?.focusWord || 'DEEP CLARITY');
  const [primaryObjective, setPrimaryObjective] = useState<string>(
    todayCheckIn?.primaryObjective || ''
  );
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'calm' | 'tired'>(
    todayCheckIn?.energyLevel || 'high'
  );
  const [rememberMinimize, setRememberMinimize] = useState<boolean>(false);
  const [snoozeHours, setSnoozeHours] = useState<number>(4);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wasOpenRef = useRef<boolean>(false);
  const focusWordInputRef = useRef<HTMLInputElement | null>(null);
  const objectiveInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Only re-initialize form inputs when the modal transitions from closed -> open
  // so live cloud snapshots never wipe what the user is actively typing.
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const currentToday = getTodayDateString();
      const activeExisting =
        existingCheckIn && existingCheckIn.date === currentToday ? existingCheckIn : null;
      setFocusWord(activeExisting?.focusWord || 'DEEP CLARITY');
      setPrimaryObjective(activeExisting?.primaryObjective || '');
      setEnergyLevel(activeExisting?.energyLevel || 'high');
      setRememberMinimize(Boolean(snoozeUntil && snoozeUntil > Date.now()));
      setErrorMsg(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, existingCheckIn, snoozeUntil]);

  // Dismiss cleanly with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDismissOrMinimize = () => {
    if (rememberMinimize && onSnooze) {
      onSnooze(snoozeHours);
    }
    onClose();
  };

  const handleMinimizeNow = () => {
    if (onSnooze) {
      onSnooze(snoozeHours);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedWord = focusWord.trim();
    const cleanedObjective = primaryObjective.trim();

    if (!cleanedWord) {
      setErrorMsg('Please choose or enter your Focus Word for today.');
      focusWordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      focusWordInputRef.current?.focus();
      return;
    }
    if (!cleanedObjective) {
      setErrorMsg('Please enter or pick a Quick Prompt for your Primary Objective.');
      objectiveInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      objectiveInputRef.current?.focus();
      return;
    }

    const activeToday = getTodayDateString();
    const sameDayExisting =
      existingCheckIn && existingCheckIn.date === activeToday ? existingCheckIn : null;

    const checkInData: DailyCheckInData = {
      date: activeToday,
      focusWord: cleanedWord.toUpperCase().slice(0, 32),
      primaryObjective: cleanedObjective.slice(0, 280),
      energyLevel,
      completed: Boolean(sameDayExisting?.completed),
      checkInXpClaimed: Boolean(sameDayExisting?.checkInXpClaimed),
      objectiveXpClaimed: Boolean(sameDayExisting?.objectiveXpClaimed),
      reflectionNotes: sameDayExisting?.reflectionNotes || '',
      updatedAt: Date.now(),
    };

    onSave(checkInData);
    onClose();
  };

  const alreadyClaimedToday = Boolean(todayCheckIn?.checkInXpClaimed);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-checkin-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg ch-glass-modal rounded-2xl sm:rounded-3xl flex flex-col max-h-[90dvh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b ch-border ch-glass-subtle shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider ch-text-accent">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Daily Study Check-in</span>
              <span className="font-mono text-[10px] ch-text-muted normal-case">· {todayStr}</span>
            </div>
            <h2
              id="daily-checkin-modal-title"
              className="text-lg sm:text-2xl font-bold tracking-tight ch-text mt-0.5"
            >
              Anchor Your Day’s Intent
            </h2>
            <p className="hidden sm:block [@media(max-height:580px)]:hidden text-xs ch-text-muted mt-0.5">
              Lock in your single primary objective and driving focus word before diving into study
              sprints.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Close check-in"
            aria-label="Close Daily Study Check-in"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
            {/* Focus Word */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="checkin-focus-word"
                  className="text-xs font-bold ch-text uppercase tracking-wide flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                  <span>Focus Word of the Day</span>
                </label>
                <span className="text-[11px] ch-text-muted shrink-0">1–3 words</span>
              </div>

              <input
                ref={focusWordInputRef}
                id="checkin-focus-word"
                type="text"
                value={focusWord}
                onChange={(e) => {
                  setFocusWord(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. DEEP CLARITY, UNSTOPPABLE, PERSISTENCE"
                className="w-full px-3.5 py-2.5 text-sm font-bold uppercase tracking-wider ch-input rounded-xl ch-text-accent"
                maxLength={28}
              />

              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {PRESET_FOCUS_WORDS.slice(0, 6).map((word) => (
                  <button
                    type="button"
                    key={word}
                    onClick={() => {
                      setFocusWord(word);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                      focusWord === word ? 'ch-accent-soft' : 'ch-btn-secondary'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Objective */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label
                  htmlFor="checkin-primary-objective"
                  className="text-xs font-bold ch-text uppercase tracking-wide flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Primary Objective (Non-Negotiable)</span>
                </label>
                <span className="text-[11px] ch-text-muted">What makes today a win?</span>
              </div>

              <textarea
                ref={objectiveInputRef}
                id="checkin-primary-objective"
                rows={2}
                value={primaryObjective}
                onChange={(e) => {
                  setPrimaryObjective(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Master React hooks architecture & complete 4 uninterrupted Pomodoro cycles"
                className="w-full px-3.5 py-2 text-xs sm:text-sm ch-input rounded-xl resize-none"
                maxLength={280}
              />

              <div className="space-y-1">
                <span className="text-[10px] ch-text-muted uppercase tracking-wider block">
                  Quick Prompts (tap to fill):
                </span>
                <div className="flex flex-col gap-1">
                  {PRESET_OBJECTIVES.slice(0, 3).map((obj) => {
                    const isPicked = primaryObjective.trim() === obj;
                    return (
                      <button
                        type="button"
                        key={obj}
                        onClick={() => {
                          setPrimaryObjective(obj);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className={`text-left text-[11px] p-1.5 rounded-lg truncate cursor-pointer transition-colors ${
                          isPicked ? 'ch-accent-soft font-semibold' : 'ch-btn-secondary'
                        }`}
                      >
                        ↳ {obj}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Energy Gauge */}
            <div className="space-y-2">
              <label className="text-xs font-bold ch-text uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>Starting Readiness &amp; Energy</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'high', label: 'Peak Fire', icon: Flame },
                  { id: 'medium', label: 'Steady', icon: BatteryCharging },
                  { id: 'calm', label: 'Zen Mind', icon: Smile },
                  { id: 'tired', label: 'Low Energy', icon: Coffee },
                ].map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = energyLevel === tier.id;
                  return (
                    <button
                      type="button"
                      key={tier.id}
                      onClick={() => setEnergyLevel(tier.id as 'high' | 'medium' | 'calm' | 'tired')}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected ? 'ch-accent-soft' : 'ch-btn-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px] font-semibold">{tier.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remember & Minimize Check-in for a Few Hours */}
            {onSnooze && (
              <div className="p-3.5 rounded-2xl ch-glass-subtle space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="flex items-center gap-2 text-xs font-semibold ch-text cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMinimize}
                      onChange={(e) => setRememberMinimize(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: 'var(--ch-accent)' }}
                    />
                    <span>Remember choice &amp; minimize for a few hours</span>
                  </label>
                  {snoozeUntil && snoozeUntil > Date.now() && (
                    <span className="text-[10px] font-mono ch-text-accent tabular-nums">
                      Minimized · {formatRemainingSnooze(snoozeUntil)} left
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Clock className="w-3.5 h-3.5 ch-text-muted shrink-0 mr-0.5" />
                    {[2, 4, 8, 12].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => {
                          setSnoozeHours(hrs);
                          setRememberMinimize(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer tabular-nums ${
                          snoozeHours === hrs && rememberMinimize
                            ? 'ch-accent-soft'
                            : 'ch-btn-secondary'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleMinimizeNow}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg ch-btn-secondary text-[11px] font-semibold cursor-pointer"
                  >
                    <Minimize2 className="w-3 h-3 ch-text-accent" />
                    <span>Minimize {snoozeHours}h Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer with Always-Visible Inline Validation Feedback */}
          <div className="shrink-0 border-t ch-border ch-glass-subtle p-3.5 sm:p-4 space-y-2.5">
            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-rose-500/12 border border-rose-500/35 text-rose-600 dark:text-rose-300 rounded-xl"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleDismissOrMinimize}
                className="px-3.5 py-2 text-xs font-semibold ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer"
              >
                {rememberMinimize && onSnooze
                  ? `Minimize (${snoozeHours}h)`
                  : 'Skip for Now'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs ch-btn-primary rounded-xl whitespace-nowrap cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {alreadyClaimedToday ? 'Save Check-in' : 'Lock In Objective (+5 XP)'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
