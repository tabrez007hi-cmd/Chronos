import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  PomodoroConfig,
  PomodoroPhase,
  StopwatchLap,
  DeepWorkSession,
  SubjectItem,
  BackgroundSettings,
} from '../types';
import {
  loadPomodoroConfig,
  savePomodoroConfig,
  loadSubjects,
  saveSubjects,
  loadBackgroundSettings,
  saveBackgroundSettings,
  normalizeSubjects,
  normalizePomodoroConfig,
  normalizeBackgroundSettings,
  DEFAULT_SUBJECTS,
  DEFAULT_POMODORO_CONFIG,
} from '../utils/storage';
import { playChime, playTickSound } from '../utils/audio';
import { pipManager } from '../utils/pipManager';
import {
  requestNotificationPermission,
  sendStudyNotification,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  getWakeLockStatus,
  setWakeLockReleaseListener,
  updateMediaSession,
} from '../utils/backgroundSync';

const RUNTIME_STORAGE_KEY = 'chronos_timer_runtime_v1';

interface StoredTimerRuntime {
  activeMode: 'pomodoro' | 'timer' | 'stopwatch';
  activeSubject: string;
  // Pomodoro
  pomoPhase: PomodoroPhase;
  pomoCompletedCycles: number;
  pomoTimeLeft: number;
  pomoAddedSeconds: number;
  pomoIsRunning: boolean;
  pomoStartedAtMs: number;
  pomoTargetEndMs: number | null;
  // Countdown
  countTotalSeconds: number;
  countTimeLeft: number;
  countIsRunning: boolean;
  countTitle: string;
  countStartedAtMs: number;
  countTargetEndMs: number | null;
  // Stopwatch
  swAccumulatedMs: number;
  swIsRunning: boolean;
  swResumedAtMs: number | null;
  swSessionStartedAtMs: number;
  swLaps: StopwatchLap[];
}

interface HydratedTimerState {
  runtime: StoredTimerRuntime;
  missedSessions: DeepWorkSession[];
}

function getDurationForPhase(phase: PomodoroPhase, cfg: PomodoroConfig): number {
  if (phase === 'focus') return cfg.focusDuration;
  if (phase === 'shortBreak') return cfg.shortBreakDuration;
  return cfg.longBreakDuration;
}

function buildDefaultRuntime(cfg: PomodoroConfig, defaultSubject: string): StoredTimerRuntime {
  return {
    activeMode: 'pomodoro',
    activeSubject: defaultSubject,
    pomoPhase: 'focus',
    pomoCompletedCycles: 0,
    pomoTimeLeft: cfg.focusDuration,
    pomoAddedSeconds: 0,
    pomoIsRunning: false,
    pomoStartedAtMs: Date.now(),
    pomoTargetEndMs: null,
    countTotalSeconds: 25 * 60,
    countTimeLeft: 25 * 60,
    countIsRunning: false,
    countTitle: 'Study Session',
    countStartedAtMs: Date.now(),
    countTargetEndMs: null,
    swAccumulatedMs: 0,
    swIsRunning: false,
    swResumedAtMs: null,
    swSessionStartedAtMs: Date.now(),
    swLaps: [],
  };
}

function reconcileRuntimeWithWallClock(
  raw: StoredTimerRuntime,
  cfg: PomodoroConfig,
  now: number
): HydratedTimerState {
  const missedSessions: DeepWorkSession[] = [];
  const next: StoredTimerRuntime = { ...raw };

  // 1. Reconcile Pomodoro against wall clock
  if (next.pomoIsRunning && typeof next.pomoTargetEndMs === 'number') {
    if (next.pomoTargetEndMs > now) {
      next.pomoTimeLeft = Math.max(1, Math.ceil((next.pomoTargetEndMs - now) / 1000));
    } else {
      // Phase finished while window was closed; advance strictly up to scheduled stops
      let guard = 0;
      while (
        next.pomoIsRunning &&
        typeof next.pomoTargetEndMs === 'number' &&
        next.pomoTargetEndMs <= now &&
        guard < 48
      ) {
        guard += 1;
        const completedEndMs: number = next.pomoTargetEndMs;
        const addedSecs = typeof next.pomoAddedSeconds === 'number' ? next.pomoAddedSeconds : 0;
        if (next.pomoPhase === 'focus') {
          const nextCycles = next.pomoCompletedCycles + 1;
          next.pomoCompletedCycles = nextCycles;

          const totalFocusSecs = Math.max(60, cfg.focusDuration + addedSecs);
          const durationMins = Math.max(1, Math.round(totalFocusSecs / 60));
          missedSessions.push({
            id: `sess-${completedEndMs}`,
            timestamp: next.pomoStartedAtMs || completedEndMs - totalFocusSecs * 1000,
            durationMinutes: durationMins,
            phase: 'focus',
            subject: next.activeSubject || 'General',
            completed: true,
          });

          const isLong = nextCycles % cfg.longBreakInterval === 0;
          const nextPhase: PomodoroPhase = isLong ? 'longBreak' : 'shortBreak';
          const nextDuration = getDurationForPhase(nextPhase, cfg);
          next.pomoPhase = nextPhase;
          next.pomoTimeLeft = nextDuration;
          next.pomoAddedSeconds = 0;

          if (cfg.autoStartBreaks) {
            next.pomoIsRunning = true;
            next.pomoStartedAtMs = completedEndMs;
            next.pomoTargetEndMs = completedEndMs + nextDuration * 1000;
          } else {
            next.pomoIsRunning = false;
            next.pomoStartedAtMs = completedEndMs;
            next.pomoTargetEndMs = null;
          }
        } else {
          // Break finished while window was closed
          next.pomoPhase = 'focus';
          next.pomoTimeLeft = cfg.focusDuration;
          next.pomoAddedSeconds = 0;

          if (cfg.autoStartPomodoros) {
            next.pomoIsRunning = true;
            next.pomoStartedAtMs = completedEndMs;
            next.pomoTargetEndMs = completedEndMs + cfg.focusDuration * 1000;
          } else {
            next.pomoIsRunning = false;
            next.pomoStartedAtMs = completedEndMs;
            next.pomoTargetEndMs = null;
          }
        }
      }

      if (next.pomoIsRunning && typeof next.pomoTargetEndMs === 'number') {
        if (next.pomoTargetEndMs > now) {
          next.pomoTimeLeft = Math.max(1, Math.ceil((next.pomoTargetEndMs - now) / 1000));
        } else {
          // Safety cap reached after >48 consecutive auto phases; stop cleanly
          next.pomoIsRunning = false;
          next.pomoTargetEndMs = null;
          next.pomoAddedSeconds = 0;
          next.pomoTimeLeft = getDurationForPhase(next.pomoPhase, cfg);
        }
      }
    }
  }

  // 2. Reconcile Countdown Timer against wall clock
  if (next.countIsRunning && typeof next.countTargetEndMs === 'number') {
    if (next.countTargetEndMs > now) {
      next.countTimeLeft = Math.max(1, Math.ceil((next.countTargetEndMs - now) / 1000));
    } else {
      // Scheduled completion time has passed -> stop at 00:00 and log session
      const completedEndMs = next.countTargetEndMs;
      next.countIsRunning = false;
      next.countTimeLeft = 0;
      next.countTargetEndMs = null;

      const durationMins = Math.round(next.countTotalSeconds / 60);
      if (durationMins >= 1) {
        missedSessions.push({
          id: `cnt-${completedEndMs}`,
          timestamp: next.countStartedAtMs || completedEndMs - next.countTotalSeconds * 1000,
          durationMinutes: durationMins,
          phase: 'countdown',
          subject: next.activeSubject || 'General',
          notes: next.countTitle,
          completed: true,
        });
      }
    }
  }

  return { runtime: next, missedSessions };
}

function hydrateInitialState(cfg: PomodoroConfig, defaultSubject: string): HydratedTimerState {
  const fallback = buildDefaultRuntime(cfg, defaultSubject);
  try {
    const rawStr = localStorage.getItem(RUNTIME_STORAGE_KEY);
    if (!rawStr) return { runtime: fallback, missedSessions: [] };
    const parsed = JSON.parse(rawStr) as Partial<StoredTimerRuntime>;
    const merged: StoredTimerRuntime = {
      ...fallback,
      ...parsed,
      swLaps: Array.isArray(parsed.swLaps) ? parsed.swLaps : [],
    };
    return reconcileRuntimeWithWallClock(merged, cfg, Date.now());
  } catch {
    return { runtime: fallback, missedSessions: [] };
  }
}

export interface WorkspaceSyncPatch {
  subjects?: SubjectItem[];
  activeSubject?: string;
  pomoConfig?: PomodoroConfig;
  bgSettings?: BackgroundSettings;
}

interface TimerContextType {
  activeMode: 'pomodoro' | 'timer' | 'stopwatch';
  setActiveMode: (mode: 'pomodoro' | 'timer' | 'stopwatch') => void;
  activeSubject: string;
  setActiveSubject: (sub: string) => void;

  // Subjects Management
  subjects: SubjectItem[];
  updateSubjects: (newSubjects: SubjectItem[]) => void;
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (open: boolean) => void;

  // Background running settings
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<boolean>;
  wakeLockEnabled: boolean;
  wakeLockMode: 'native' | 'fallback' | 'none';
  toggleWakeLock: () => Promise<boolean>;

  // Pomodoro
  pomoPhase: PomodoroPhase;
  pomoCompletedCycles: number;
  pomoTimeLeft: number;
  pomoAddedSeconds: number;
  pomoTotalSeconds: number;
  pomoIsRunning: boolean;
  pomoScheduledEndAt: number | null;
  pomoConfig: PomodoroConfig;
  updatePomoConfig: (cfg: PomodoroConfig) => void;
  setPomoPhase: (phase: PomodoroPhase) => void;
  togglePomoRunning: () => void;
  resetPomo: () => void;
  skipPomoPhase: () => void;
  addPomoTime: (seconds: number) => void;

  // Countdown
  countTotalSeconds: number;
  countTimeLeft: number;
  countIsRunning: boolean;
  countScheduledEndAt: number | null;
  countTitle: string;
  setCountTitle: (title: string) => void;
  setCountdownDuration: (totalSec: number, title?: string) => void;
  toggleCountRunning: () => void;
  resetCount: () => void;
  addCountTime: (seconds: number) => void;

  // Stopwatch
  swElapsedMs: number;
  getSwElapsedMsNow: () => number;
  swIsRunning: boolean;
  swStartedAt: number | null;
  swLaps: StopwatchLap[];
  toggleSwRunning: () => void;
  resetSw: () => void;
  recordSwLap: () => void;
  updateSwLapNote: (id: string, note: string) => void;

  // Unified Current Active Timer Details (for Zen Mode, Floating PiP, and Topbar)
  currentDisplayTime: string;
  currentDisplayProgress: number; // 0 to 1
  currentIsRunning: boolean;
  currentTitle: string;
  currentSubtitle: string;
  toggleCurrentRunning: () => void;
  resetCurrent: () => void;

  // Zen & PiP controls
  isZenMode: boolean;
  setIsZenMode: (open: boolean) => void;
  showInAppPip: boolean;
  setShowInAppPip: (open: boolean) => void;
  launchOsPip: () => Promise<boolean>;
  isOsPipActive: boolean;
  setSessionCallback: (cb: (session: DeepWorkSession) => void) => void;
  setWorkspaceSyncCallback: (cb: ((patch: WorkspaceSyncPatch) => void) | null) => void;
  hydrateCloudWorkspace: (patch: WorkspaceSyncPatch) => void;
}

export interface TimerControlsContextType {
  activeMode: 'pomodoro' | 'timer' | 'stopwatch';
  setActiveMode: (mode: 'pomodoro' | 'timer' | 'stopwatch') => void;
  activeSubject: string;
  setActiveSubject: (sub: string) => void;
  subjects: SubjectItem[];
  updateSubjects: (newSubjects: SubjectItem[]) => void;
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (open: boolean) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<boolean>;
  wakeLockEnabled: boolean;
  wakeLockMode: 'native' | 'fallback' | 'none';
  toggleWakeLock: () => Promise<boolean>;
  toggleCurrentRunning: () => void;
  resetCurrent: () => void;
  isZenMode: boolean;
  setIsZenMode: (open: boolean) => void;
  showInAppPip: boolean;
  setShowInAppPip: (open: boolean) => void;
  launchOsPip: () => Promise<boolean>;
  isOsPipActive: boolean;
  setSessionCallback: (cb: (session: DeepWorkSession) => void) => void;
  setWorkspaceSyncCallback: (cb: ((patch: WorkspaceSyncPatch) => void) | null) => void;
  hydrateCloudWorkspace: (patch: WorkspaceSyncPatch) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);
const TimerControlsContext = createContext<TimerControlsContextType | undefined>(undefined);

export const TimerProvider: React.FC<{
  children: ReactNode;
  onSessionComplete?: (session: DeepWorkSession) => void;
}> = ({ children, onSessionComplete }) => {
  const [pomoConfig, setPomoConfig] = useState<PomodoroConfig>(() => loadPomodoroConfig());
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => loadSubjects());

  // Hydrate timer state once synchronously with wall-clock reconciliation
  const initialHydrationRef = useRef<HydratedTimerState | null>(null);
  if (!initialHydrationRef.current) {
    initialHydrationRef.current = hydrateInitialState(
      pomoConfig,
      subjects[0]?.name || 'Mathematics'
    );
  }
  const initialRuntime = initialHydrationRef.current.runtime;

  const sessionCallbackRef = useRef<((session: DeepWorkSession) => void) | null>(
    onSessionComplete || null
  );
  const pendingCompletedSessionsRef = useRef<DeepWorkSession[]>(
    initialHydrationRef.current.missedSessions
  );

  const setSessionCallback = useCallback((cb: (session: DeepWorkSession) => void) => {
    sessionCallbackRef.current = cb;
    if (pendingCompletedSessionsRef.current.length > 0) {
      const queued = [...pendingCompletedSessionsRef.current];
      pendingCompletedSessionsRef.current = [];
      queued.forEach((sess) => cb(sess));
    }
  }, []);

  const workspaceSyncCallbackRef = useRef<((patch: WorkspaceSyncPatch) => void) | null>(null);
  const setWorkspaceSyncCallback = useCallback(
    (cb: ((patch: WorkspaceSyncPatch) => void) | null) => {
      workspaceSyncCallbackRef.current = cb;
    },
    []
  );

  const [activeMode, setActiveMode] = useState<'pomodoro' | 'timer' | 'stopwatch'>(
    initialRuntime.activeMode
  );
  const [activeSubject, setActiveSubjectState] = useState<string>(initialRuntime.activeSubject);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);

  const setActiveSubject = useCallback((sub: string) => {
    const cleaned = sub.trim() || 'General';
    activeSubjectRef.current = cleaned;
    setActiveSubjectState(cleaned);
    workspaceSyncCallbackRef.current?.({ activeSubject: cleaned });
  }, []);

  const updateSubjects = (newSubjects: SubjectItem[]) => {
    setSubjects(newSubjects);
    saveSubjects(newSubjects);
    workspaceSyncCallbackRef.current?.({ subjects: newSubjects });
  };

  // Background settings
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(() => loadBackgroundSettings());
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [wakeLockMode, setWakeLockMode] = useState<'native' | 'fallback' | 'none'>('none');
  const wakeLockWantedRef = useRef<boolean>(bgSettings.wakeLockEnabled);

  useEffect(() => {
    wakeLockWantedRef.current = bgSettings.wakeLockEnabled;
  }, [bgSettings.wakeLockEnabled]);

  const acquireAndSyncWakeLock = useCallback(async (): Promise<boolean> => {
    const ok = await requestScreenWakeLock();
    const status = getWakeLockStatus();
    setWakeLockActive(ok && status.active);
    setWakeLockMode(status.mode);
    return ok && status.active;
  }, []);

  // Automatically restore & re-acquire Keep Awake on mount, visibility return, window focus, or unexpected OS release
  useEffect(() => {
    let cancelled = false;

    const handleRelease = () => {
      if (cancelled) return;
      const status = getWakeLockStatus();
      setWakeLockActive(status.active);
      setWakeLockMode(status.mode);
      if (wakeLockWantedRef.current && document.visibilityState === 'visible') {
        void acquireAndSyncWakeLock();
      }
    };

    setWakeLockReleaseListener(handleRelease);

    if (bgSettings.wakeLockEnabled && document.visibilityState === 'visible') {
      void acquireAndSyncWakeLock();
    }

    const handleVisibilityOrFocus = () => {
      if (cancelled || !wakeLockWantedRef.current) return;
      if (document.visibilityState === 'visible') {
        void acquireAndSyncWakeLock();
      }
    };

    const handleGestureRetry = () => {
      if (cancelled || !wakeLockWantedRef.current) return;
      if (!getWakeLockStatus().active && document.visibilityState === 'visible') {
        void acquireAndSyncWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pointerdown', handleGestureRetry, { passive: true });

    return () => {
      cancelled = true;
      setWakeLockReleaseListener(null);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pointerdown', handleGestureRetry);
    };
  }, [bgSettings.wakeLockEnabled, acquireAndSyncWakeLock]);

  // Ensure wake lock cleans up on provider unmount
  useEffect(() => {
    return () => {
      releaseScreenWakeLock();
    };
  }, []);

  const toggleNotifications = async (): Promise<boolean> => {
    if (!bgSettings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      const updated = { ...bgSettings, notificationsEnabled: granted };
      setBgSettings(updated);
      saveBackgroundSettings(updated);
      workspaceSyncCallbackRef.current?.({ bgSettings: updated });
      return granted;
    } else {
      const updated = { ...bgSettings, notificationsEnabled: false };
      setBgSettings(updated);
      saveBackgroundSettings(updated);
      workspaceSyncCallbackRef.current?.({ bgSettings: updated });
      return false;
    }
  };

  const toggleWakeLock = async (): Promise<boolean> => {
    const shouldTurnOff = bgSettings.wakeLockEnabled || wakeLockActive;
    if (!shouldTurnOff) {
      wakeLockWantedRef.current = true;
      const ok = await acquireAndSyncWakeLock();
      const updated = { ...bgSettings, wakeLockEnabled: ok };
      setBgSettings(updated);
      saveBackgroundSettings(updated);
      workspaceSyncCallbackRef.current?.({ bgSettings: updated });
      return ok;
    } else {
      wakeLockWantedRef.current = false;
      releaseScreenWakeLock();
      setWakeLockActive(false);
      setWakeLockMode('none');
      const updated = { ...bgSettings, wakeLockEnabled: false };
      setBgSettings(updated);
      saveBackgroundSettings(updated);
      workspaceSyncCallbackRef.current?.({ bgSettings: updated });
      return false;
    }
  };

  // Pomodoro State
  const [pomoPhase, setPomoPhaseState] = useState<PomodoroPhase>(initialRuntime.pomoPhase);
  const [pomoCompletedCycles, setPomoCompletedCycles] = useState<number>(
    initialRuntime.pomoCompletedCycles
  );
  const [pomoTimeLeft, setPomoTimeLeft] = useState<number>(initialRuntime.pomoTimeLeft);
  const [pomoAddedSeconds, setPomoAddedSeconds] = useState<number>(
    initialRuntime.pomoAddedSeconds || 0
  );
  const [pomoIsRunning, setPomoIsRunning] = useState<boolean>(initialRuntime.pomoIsRunning);
  const [pomoScheduledEndAt, setPomoScheduledEndAt] = useState<number | null>(
    initialRuntime.pomoIsRunning ? initialRuntime.pomoTargetEndMs : null
  );
  const pomoTimerRef = useRef<number | null>(null);
  const pomoStartTsRef = useRef<number>(initialRuntime.pomoStartedAtMs);
  const pomoExpectedEndRef = useRef<number>(
    initialRuntime.pomoTargetEndMs ?? Date.now() + initialRuntime.pomoTimeLeft * 1000
  );
  const pomoPhaseRef = useRef<PomodoroPhase>(initialRuntime.pomoPhase);
  const pomoTimeLeftRef = useRef<number>(initialRuntime.pomoTimeLeft);
  const pomoAddedSecondsRef = useRef<number>(initialRuntime.pomoAddedSeconds || 0);
  const pomoIsRunningRef = useRef<boolean>(initialRuntime.pomoIsRunning);
  const pomoCompletedCyclesRef = useRef<number>(initialRuntime.pomoCompletedCycles);
  const activeSubjectRef = useRef<string>(initialRuntime.activeSubject);

  useEffect(() => {
    pomoPhaseRef.current = pomoPhase;
  }, [pomoPhase]);
  useEffect(() => {
    pomoTimeLeftRef.current = pomoTimeLeft;
  }, [pomoTimeLeft]);
  useEffect(() => {
    pomoAddedSecondsRef.current = pomoAddedSeconds;
  }, [pomoAddedSeconds]);
  useEffect(() => {
    pomoIsRunningRef.current = pomoIsRunning;
  }, [pomoIsRunning]);
  useEffect(() => {
    pomoCompletedCyclesRef.current = pomoCompletedCycles;
  }, [pomoCompletedCycles]);
  useEffect(() => {
    activeSubjectRef.current = activeSubject;
  }, [activeSubject]);

  // Countdown State
  const [countTotalSeconds, setCountTotalSeconds] = useState<number>(
    initialRuntime.countTotalSeconds
  );
  const [countTimeLeft, setCountTimeLeft] = useState<number>(initialRuntime.countTimeLeft);
  const [countIsRunning, setCountIsRunning] = useState<boolean>(initialRuntime.countIsRunning);
  const [countScheduledEndAt, setCountScheduledEndAt] = useState<number | null>(
    initialRuntime.countIsRunning ? initialRuntime.countTargetEndMs : null
  );
  const [countTitle, setCountTitle] = useState<string>(initialRuntime.countTitle);
  const countTimerRef = useRef<number | null>(null);
  const countStartTsRef = useRef<number>(initialRuntime.countStartedAtMs);
  const countExpectedEndRef = useRef<number>(
    initialRuntime.countTargetEndMs ?? Date.now() + initialRuntime.countTimeLeft * 1000
  );
  const countTotalSecondsRef = useRef<number>(initialRuntime.countTotalSeconds);
  const countTimeLeftRef = useRef<number>(initialRuntime.countTimeLeft);
  const countIsRunningRef = useRef<boolean>(initialRuntime.countIsRunning);
  const countTitleRef = useRef<string>(initialRuntime.countTitle);

  useEffect(() => {
    countTotalSecondsRef.current = countTotalSeconds;
  }, [countTotalSeconds]);
  useEffect(() => {
    countTimeLeftRef.current = countTimeLeft;
  }, [countTimeLeft]);
  useEffect(() => {
    countIsRunningRef.current = countIsRunning;
  }, [countIsRunning]);
  useEffect(() => {
    countTitleRef.current = countTitle;
  }, [countTitle]);

  // Stopwatch State (Wall-clock Date.now() anchored)
  const initialSwElapsed =
    initialRuntime.swIsRunning && typeof initialRuntime.swResumedAtMs === 'number'
      ? initialRuntime.swAccumulatedMs + Math.max(0, Date.now() - initialRuntime.swResumedAtMs)
      : initialRuntime.swAccumulatedMs;

  const [swElapsedMs, setSwElapsedMs] = useState<number>(initialSwElapsed);
  const [swIsRunning, setSwIsRunning] = useState<boolean>(initialRuntime.swIsRunning);
  const [swStartedAt, setSwStartedAt] = useState<number | null>(
    initialRuntime.swIsRunning ? initialRuntime.swSessionStartedAtMs : null
  );
  const [swLaps, setSwLaps] = useState<StopwatchLap[]>(initialRuntime.swLaps);
  const swAccumulatedRef = useRef<number>(initialRuntime.swAccumulatedMs);
  const swResumedAtRef = useRef<number | null>(
    initialRuntime.swIsRunning ? initialRuntime.swResumedAtMs : null
  );
  const swSessionStartedAtRef = useRef<number>(initialRuntime.swSessionStartedAtMs);
  const swAnimFrameRef = useRef<number | null>(null);

  // Zen & PiP
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showInAppPip, setShowInAppPip] = useState<boolean>(false);
  const [isOsPipActive, setIsOsPipActive] = useState<boolean>(false);

  // Persist complete runtime snapshot cleanly to localStorage
  const persistRuntime = useCallback(
    (overrides: Partial<StoredTimerRuntime> = {}) => {
      const snapshot: StoredTimerRuntime = {
        activeMode,
        activeSubject: activeSubjectRef.current,
        pomoPhase: pomoPhaseRef.current,
        pomoCompletedCycles: pomoCompletedCyclesRef.current,
        pomoTimeLeft: pomoTimeLeftRef.current,
        pomoAddedSeconds: pomoAddedSecondsRef.current,
        pomoIsRunning: pomoIsRunningRef.current,
        pomoStartedAtMs: pomoStartTsRef.current,
        pomoTargetEndMs: pomoIsRunningRef.current ? pomoExpectedEndRef.current : null,
        countTotalSeconds: countTotalSecondsRef.current,
        countTimeLeft: countTimeLeftRef.current,
        countIsRunning: countIsRunningRef.current,
        countTitle: countTitleRef.current,
        countStartedAtMs: countStartTsRef.current,
        countTargetEndMs: countIsRunningRef.current ? countExpectedEndRef.current : null,
        swAccumulatedMs: swAccumulatedRef.current,
        swIsRunning,
        swResumedAtMs: swIsRunning ? swResumedAtRef.current : null,
        swSessionStartedAtMs: swSessionStartedAtRef.current,
        swLaps,
        ...overrides,
      };
      try {
        localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore quota errors
      }
    },
    [
      activeMode,
      activeSubject,
      pomoPhase,
      pomoCompletedCycles,
      pomoTimeLeft,
      pomoAddedSeconds,
      pomoIsRunning,
      countTotalSeconds,
      countTimeLeft,
      countIsRunning,
      countTitle,
      swIsRunning,
      swLaps,
    ]
  );

  // Keep localStorage synced whenever core timer state transitions
  useEffect(() => {
    persistRuntime();
  }, [persistRuntime]);

  // Also flush latest runtime on pagehide/beforeunload
  useEffect(() => {
    const flush = () => persistRuntime();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, [persistRuntime]);

  const getPomoTotalDuration = useCallback(
    (p: PomodoroPhase) => getDurationForPhase(p, pomoConfig),
    [pomoConfig]
  );

  const emitSession = useCallback((sess: DeepWorkSession) => {
    if (sessionCallbackRef.current) {
      sessionCallbackRef.current(sess);
    } else {
      pendingCompletedSessionsRef.current.push(sess);
    }
  }, []);

  const updatePomoConfig = (cfg: PomodoroConfig) => {
    setPomoConfig(cfg);
    savePomodoroConfig(cfg);
    workspaceSyncCallbackRef.current?.({ pomoConfig: cfg });
    if (!pomoIsRunningRef.current) {
      const nextDur = getDurationForPhase(pomoPhaseRef.current, cfg);
      pomoAddedSecondsRef.current = 0;
      pomoTimeLeftRef.current = nextDur;
      pomoExpectedEndRef.current = Date.now() + nextDur * 1000;
      setPomoAddedSeconds(0);
      setPomoTimeLeft(nextDur);
      persistRuntime({
        pomoAddedSeconds: 0,
        pomoTimeLeft: nextDur,
        pomoTargetEndMs: null,
      });
    }
  };

  const hydrateCloudWorkspace = useCallback((patch: WorkspaceSyncPatch) => {
    if (patch.subjects !== undefined) {
      const normalizedSubs = normalizeSubjects(patch.subjects);
      const nextSubs = normalizedSubs.length > 0 ? normalizedSubs : DEFAULT_SUBJECTS;
      setSubjects(nextSubs);
      saveSubjects(nextSubs);
    }
    if (patch.activeSubject !== undefined) {
      const cleaned = patch.activeSubject.trim() || DEFAULT_SUBJECTS[0].name;
      if (cleaned !== activeSubjectRef.current) {
        activeSubjectRef.current = cleaned;
        setActiveSubjectState(cleaned);
      }
    }
    if (patch.pomoConfig !== undefined) {
      const normalizedCfg = normalizePomodoroConfig(patch.pomoConfig || DEFAULT_POMODORO_CONFIG);
      setPomoConfig(normalizedCfg);
      savePomodoroConfig(normalizedCfg);
      if (!pomoIsRunningRef.current) {
        const nextDur = getDurationForPhase(pomoPhaseRef.current, normalizedCfg);
        pomoAddedSecondsRef.current = 0;
        pomoTimeLeftRef.current = nextDur;
        pomoExpectedEndRef.current = Date.now() + nextDur * 1000;
        setPomoAddedSeconds(0);
        setPomoTimeLeft(nextDur);
      }
    }
    if (patch.bgSettings !== undefined) {
      const normalizedBg = normalizeBackgroundSettings(patch.bgSettings);
      setBgSettings(normalizedBg);
      saveBackgroundSettings(normalizedBg);
      wakeLockWantedRef.current = normalizedBg.wakeLockEnabled;
      if (!normalizedBg.wakeLockEnabled) {
        releaseScreenWakeLock();
        setWakeLockActive(false);
        setWakeLockMode('none');
      }
    }
  }, []);

  const setPomoPhase = (phase: PomodoroPhase) => {
    const dur = getPomoTotalDuration(phase);
    pomoIsRunningRef.current = false;
    pomoPhaseRef.current = phase;
    pomoAddedSecondsRef.current = 0;
    pomoTimeLeftRef.current = dur;
    pomoExpectedEndRef.current = Date.now() + dur * 1000;
    setPomoIsRunning(false);
    setPomoScheduledEndAt(null);
    setPomoPhaseState(phase);
    setPomoAddedSeconds(0);
    setPomoTimeLeft(dur);
    persistRuntime({
      pomoIsRunning: false,
      pomoPhase: phase,
      pomoTimeLeft: dur,
      pomoAddedSeconds: 0,
      pomoTargetEndMs: null,
    });
  };

  // Handle Pomodoro Phase Completion (supports catching up if slept/backgrounded)
  const handlePomoComplete = useCallback(
    (completedAtMs: number = Date.now()) => {
      playChime(pomoConfig.soundAlert);
      const currentPhase = pomoPhaseRef.current;
      const currentSubject = activeSubjectRef.current;
      const addedSecs = pomoAddedSecondsRef.current;

      if (currentPhase === 'focus') {
        const nextCycles = pomoCompletedCyclesRef.current + 1;
        pomoCompletedCyclesRef.current = nextCycles;
        setPomoCompletedCycles(nextCycles);

        if (bgSettings.notificationsEnabled) {
          sendStudyNotification(
            'Focus Sprint Complete! 🎯',
            `Great deep work on ${currentSubject}. Take a well-deserved break!`,
            'chronos-pomo-focus'
          );
        }

        const totalFocusSecs = Math.max(60, pomoConfig.focusDuration + addedSecs);
        const durationMins = Math.max(1, Math.round(totalFocusSecs / 60));
        emitSession({
          id: `sess-${completedAtMs}`,
          timestamp: pomoStartTsRef.current,
          durationMinutes: durationMins,
          phase: 'focus',
          subject: currentSubject,
          completed: true,
        });

        const isLong = nextCycles % pomoConfig.longBreakInterval === 0;
        const nextPhase: PomodoroPhase = isLong ? 'longBreak' : 'shortBreak';
        const nextDuration = getPomoTotalDuration(nextPhase);
        const now = Date.now();
        const nextEndMs = now + nextDuration * 1000;

        pomoPhaseRef.current = nextPhase;
        pomoAddedSecondsRef.current = 0;
        pomoTimeLeftRef.current = nextDuration;
        pomoStartTsRef.current = now;
        pomoExpectedEndRef.current = nextEndMs;
        pomoIsRunningRef.current = pomoConfig.autoStartBreaks;

        setPomoPhaseState(nextPhase);
        setPomoAddedSeconds(0);
        setPomoTimeLeft(nextDuration);
        setPomoIsRunning(pomoConfig.autoStartBreaks);
        setPomoScheduledEndAt(pomoConfig.autoStartBreaks ? nextEndMs : null);
      } else {
        if (bgSettings.notificationsEnabled) {
          sendStudyNotification(
            'Break Ended ⚡',
            'Ready to jump back into deep study mode?',
            'chronos-pomo-break'
          );
        }

        const now = Date.now();
        const nextEndMs = now + pomoConfig.focusDuration * 1000;

        pomoPhaseRef.current = 'focus';
        pomoAddedSecondsRef.current = 0;
        pomoTimeLeftRef.current = pomoConfig.focusDuration;
        pomoStartTsRef.current = now;
        pomoExpectedEndRef.current = nextEndMs;
        pomoIsRunningRef.current = pomoConfig.autoStartPomodoros;

        setPomoPhaseState('focus');
        setPomoAddedSeconds(0);
        setPomoTimeLeft(pomoConfig.focusDuration);
        setPomoIsRunning(pomoConfig.autoStartPomodoros);
        setPomoScheduledEndAt(pomoConfig.autoStartPomodoros ? nextEndMs : null);
      }
    },
    [
      pomoConfig,
      getPomoTotalDuration,
      bgSettings.notificationsEnabled,
      emitSession,
    ]
  );

  // Countdown Complete
  const handleCountComplete = useCallback(
    (completedAtMs: number = Date.now()) => {
      const currentTitle = countTitleRef.current;
      const currentSubject = activeSubjectRef.current;
      const totalSecs = countTotalSecondsRef.current;

      countIsRunningRef.current = false;
      countTimeLeftRef.current = 0;
      setCountIsRunning(false);
      setCountScheduledEndAt(null);
      setCountTimeLeft(0);
      playChime('bowl');

      if (bgSettings.notificationsEnabled) {
        sendStudyNotification(
          'Countdown Finished! ⏱️',
          `'${currentTitle}' study block has reached 00:00.`,
          'chronos-countdown'
        );
      }

      const durationMins = Math.round(totalSecs / 60);
      if (durationMins >= 1) {
        emitSession({
          id: `cnt-${completedAtMs}`,
          timestamp: countStartTsRef.current,
          durationMinutes: durationMins,
          phase: 'countdown',
          subject: currentSubject,
          notes: currentTitle,
          completed: true,
        });
      }
    },
    [bgSettings.notificationsEnabled, emitSession]
  );

  // Pomodoro Tick Effect (Wall-Clock Synchronized, deduplicated integer second updates)
  useEffect(() => {
    if (pomoIsRunning) {
      pomoTimerRef.current = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((pomoExpectedEndRef.current - now) / 1000));

        if (diff <= 0) {
          setPomoTimeLeft(0);
          handlePomoComplete(pomoExpectedEndRef.current);
        } else {
          setPomoTimeLeft((prev) => {
            if (prev === diff) return prev;
            if (pomoConfig.tickingSound) playTickSound();
            return diff;
          });
        }
      }, 250);
    } else {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    }
    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoIsRunning, pomoConfig.tickingSound, handlePomoComplete]);

  // Countdown Tick Effect (Wall-Clock Synchronized, deduplicated integer second updates)
  useEffect(() => {
    if (countIsRunning) {
      countTimerRef.current = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((countExpectedEndRef.current - now) / 1000));
        if (diff <= 0) {
          handleCountComplete(countExpectedEndRef.current);
        } else {
          setCountTimeLeft((prev) => (prev === diff ? prev : diff));
        }
      }, 250);
    } else {
      if (countTimerRef.current) clearInterval(countTimerRef.current);
    }
    return () => {
      if (countTimerRef.current) clearInterval(countTimerRef.current);
    };
  }, [countIsRunning, handleCountComplete]);

  // Visibility / Window Focus Re-sync against Wall Clock
  useEffect(() => {
    const syncAllWithClock = () => {
      const now = Date.now();
      if (pomoIsRunning) {
        const diff = Math.max(0, Math.ceil((pomoExpectedEndRef.current - now) / 1000));
        if (diff <= 0) {
          setPomoTimeLeft(0);
          handlePomoComplete(pomoExpectedEndRef.current);
        } else {
          setPomoTimeLeft(diff);
        }
      }
      if (countIsRunning) {
        const diff = Math.max(0, Math.ceil((countExpectedEndRef.current - now) / 1000));
        if (diff <= 0) {
          handleCountComplete(countExpectedEndRef.current);
        } else {
          setCountTimeLeft(diff);
        }
      }
      if (swIsRunning && swResumedAtRef.current !== null) {
        setSwElapsedMs(swAccumulatedRef.current + Math.max(0, now - swResumedAtRef.current));
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncAllWithClock();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncAllWithClock);
    window.addEventListener('pageshow', syncAllWithClock);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncAllWithClock);
      window.removeEventListener('pageshow', syncAllWithClock);
    };
  }, [pomoIsRunning, countIsRunning, swIsRunning, handlePomoComplete, handleCountComplete]);

  const togglePomoRunning = () => {
    const now = Date.now();
    if (!pomoIsRunningRef.current) {
      const baseDur = getPomoTotalDuration(pomoPhaseRef.current);
      const secs = pomoTimeLeftRef.current > 0 ? pomoTimeLeftRef.current : baseDur;
      if (pomoTimeLeftRef.current <= 0) {
        pomoAddedSecondsRef.current = 0;
        pomoTimeLeftRef.current = secs;
        setPomoAddedSeconds(0);
        setPomoTimeLeft(secs);
      }
      const endMs = now + secs * 1000;
      pomoStartTsRef.current = now;
      pomoExpectedEndRef.current = endMs;
      pomoIsRunningRef.current = true;
      setPomoScheduledEndAt(endMs);
      setPomoIsRunning(true);
      persistRuntime({
        pomoIsRunning: true,
        pomoTimeLeft: secs,
        pomoAddedSeconds: pomoAddedSecondsRef.current,
        pomoStartedAtMs: now,
        pomoTargetEndMs: endMs,
      });
    } else {
      const remaining = Math.max(0, Math.ceil((pomoExpectedEndRef.current - now) / 1000));
      pomoTimeLeftRef.current = remaining;
      pomoIsRunningRef.current = false;
      setPomoTimeLeft(remaining);
      setPomoScheduledEndAt(null);
      setPomoIsRunning(false);
      persistRuntime({
        pomoIsRunning: false,
        pomoTimeLeft: remaining,
        pomoAddedSeconds: pomoAddedSecondsRef.current,
        pomoTargetEndMs: null,
      });
    }
  };

  const resetPomo = () => {
    const total = getPomoTotalDuration(pomoPhaseRef.current);
    pomoIsRunningRef.current = false;
    pomoAddedSecondsRef.current = 0;
    pomoTimeLeftRef.current = total;
    pomoExpectedEndRef.current = Date.now() + total * 1000;
    setPomoIsRunning(false);
    setPomoScheduledEndAt(null);
    setPomoAddedSeconds(0);
    setPomoTimeLeft(total);
    persistRuntime({
      pomoIsRunning: false,
      pomoTimeLeft: total,
      pomoAddedSeconds: 0,
      pomoTargetEndMs: null,
    });
  };

  const skipPomoPhase = () => {
    pomoIsRunningRef.current = false;
    pomoAddedSecondsRef.current = 0;
    setPomoIsRunning(false);
    setPomoScheduledEndAt(null);
    setPomoAddedSeconds(0);
    if (pomoPhaseRef.current === 'focus') {
      const isLong = (pomoCompletedCyclesRef.current + 1) % pomoConfig.longBreakInterval === 0;
      const nextPhase: PomodoroPhase = isLong ? 'longBreak' : 'shortBreak';
      const total = getPomoTotalDuration(nextPhase);
      pomoPhaseRef.current = nextPhase;
      pomoTimeLeftRef.current = total;
      pomoExpectedEndRef.current = Date.now() + total * 1000;
      setPomoPhaseState(nextPhase);
      setPomoTimeLeft(total);
      persistRuntime({
        pomoIsRunning: false,
        pomoPhase: nextPhase,
        pomoTimeLeft: total,
        pomoAddedSeconds: 0,
        pomoTargetEndMs: null,
      });
    } else {
      pomoPhaseRef.current = 'focus';
      pomoTimeLeftRef.current = pomoConfig.focusDuration;
      pomoExpectedEndRef.current = Date.now() + pomoConfig.focusDuration * 1000;
      setPomoPhaseState('focus');
      setPomoTimeLeft(pomoConfig.focusDuration);
      persistRuntime({
        pomoIsRunning: false,
        pomoPhase: 'focus',
        pomoTimeLeft: pomoConfig.focusDuration,
        pomoAddedSeconds: 0,
        pomoTargetEndMs: null,
      });
    }
  };

  const addPomoTime = (secs: number) => {
    const now = Date.now();
    const currentLeft = pomoTimeLeftRef.current;
    const nextLeft = Math.max(0, currentLeft + secs);
    const nextAdded = Math.max(0, pomoAddedSecondsRef.current + secs);
    const baseEnd = pomoIsRunningRef.current
      ? Math.max(now, pomoExpectedEndRef.current)
      : now + currentLeft * 1000;
    const nextEnd = baseEnd + secs * 1000;

    pomoTimeLeftRef.current = nextLeft;
    pomoAddedSecondsRef.current = nextAdded;
    pomoExpectedEndRef.current = nextEnd;

    setPomoTimeLeft(nextLeft);
    setPomoAddedSeconds(nextAdded);
    if (pomoIsRunningRef.current) {
      setPomoScheduledEndAt(nextEnd);
    }

    persistRuntime({
      pomoTimeLeft: nextLeft,
      pomoAddedSeconds: nextAdded,
      pomoTargetEndMs: pomoIsRunningRef.current ? nextEnd : null,
    });
  };

  const toggleCountRunning = () => {
    const now = Date.now();
    if (!countIsRunningRef.current) {
      const secs =
        countTimeLeftRef.current > 0 ? countTimeLeftRef.current : countTotalSecondsRef.current;
      if (countTimeLeftRef.current <= 0) {
        countTimeLeftRef.current = secs;
        setCountTimeLeft(secs);
      }
      const endMs = now + secs * 1000;
      countStartTsRef.current = now;
      countExpectedEndRef.current = endMs;
      countIsRunningRef.current = true;
      setCountScheduledEndAt(endMs);
      setCountIsRunning(true);
      persistRuntime({
        countIsRunning: true,
        countTotalSeconds: countTotalSecondsRef.current,
        countTimeLeft: secs,
        countStartedAtMs: now,
        countTargetEndMs: endMs,
      });
    } else {
      const remaining = Math.max(0, Math.ceil((countExpectedEndRef.current - now) / 1000));
      countTimeLeftRef.current = remaining;
      countIsRunningRef.current = false;
      setCountTimeLeft(remaining);
      setCountScheduledEndAt(null);
      setCountIsRunning(false);
      persistRuntime({
        countIsRunning: false,
        countTotalSeconds: countTotalSecondsRef.current,
        countTimeLeft: remaining,
        countTargetEndMs: null,
      });
    }
  };

  const resetCount = () => {
    const total = countTotalSecondsRef.current;
    countIsRunningRef.current = false;
    countTimeLeftRef.current = total;
    countExpectedEndRef.current = Date.now() + total * 1000;
    setCountIsRunning(false);
    setCountScheduledEndAt(null);
    setCountTimeLeft(total);
    persistRuntime({
      countIsRunning: false,
      countTotalSeconds: total,
      countTimeLeft: total,
      countTargetEndMs: null,
    });
  };

  const addCountTime = (secs: number) => {
    const now = Date.now();
    const currentLeft = countTimeLeftRef.current;
    const currentTotal = countTotalSecondsRef.current;

    const isCompletedAtZero = !countIsRunningRef.current && currentLeft <= 0;
    const nextLeft = isCompletedAtZero ? Math.max(60, secs) : Math.max(0, currentLeft + secs);
    const nextTotal = isCompletedAtZero
      ? Math.max(60, secs)
      : Math.max(60, currentTotal + secs);

    const baseEnd = countIsRunningRef.current
      ? Math.max(now, countExpectedEndRef.current)
      : now + currentLeft * 1000;
    const nextEnd = isCompletedAtZero ? now + nextLeft * 1000 : baseEnd + secs * 1000;

    countTimeLeftRef.current = nextLeft;
    countTotalSecondsRef.current = nextTotal;
    countExpectedEndRef.current = nextEnd;

    setCountTimeLeft(nextLeft);
    setCountTotalSeconds(nextTotal);
    if (countIsRunningRef.current) {
      setCountScheduledEndAt(nextEnd);
    }

    persistRuntime({
      countTotalSeconds: nextTotal,
      countTimeLeft: nextLeft,
      countTargetEndMs: countIsRunningRef.current ? nextEnd : null,
    });
  };

  const setCountdownDuration = (totalSec: number, title?: string) => {
    const safeSec = Math.max(1, totalSec);
    const nextTitle = title ?? countTitleRef.current;
    countIsRunningRef.current = false;
    countTotalSecondsRef.current = safeSec;
    countTimeLeftRef.current = safeSec;
    countExpectedEndRef.current = Date.now() + safeSec * 1000;
    if (title) countTitleRef.current = title;

    setCountIsRunning(false);
    setCountScheduledEndAt(null);
    setCountTotalSeconds(safeSec);
    setCountTimeLeft(safeSec);
    if (title) setCountTitle(title);
    persistRuntime({
      countIsRunning: false,
      countTotalSeconds: safeSec,
      countTimeLeft: safeSec,
      countTitle: nextTitle,
      countTargetEndMs: null,
    });
  };

  const getSwElapsedMsNow = useCallback((): number => {
    if (swIsRunning && swResumedAtRef.current !== null) {
      return swAccumulatedRef.current + Math.max(0, Date.now() - swResumedAtRef.current);
    }
    return swAccumulatedRef.current;
  }, [swIsRunning]);

  // Throttled Stopwatch Context Tick (keeps global context overhead <= 1-4Hz instead of 60Hz;
  // StopwatchView reads getSwElapsedMsNow() at 60fps directly on DOM without re-rendering React!)
  useEffect(() => {
    if (swIsRunning) {
      if (swResumedAtRef.current === null) {
        swResumedAtRef.current = Date.now();
      }
      const tickIntervalMs = showInAppPip || isOsPipActive || isZenMode ? 250 : 1000;
      const syncElapsed = () => {
        if (swResumedAtRef.current !== null) {
          const elapsed = swAccumulatedRef.current + Math.max(0, Date.now() - swResumedAtRef.current);
          setSwElapsedMs(elapsed);
        }
      };
      syncElapsed();
      const id = window.setInterval(syncElapsed, tickIntervalMs);
      swAnimFrameRef.current = id;
    } else if (swAnimFrameRef.current !== null) {
      window.clearInterval(swAnimFrameRef.current);
      swAnimFrameRef.current = null;
    }
    return () => {
      if (swAnimFrameRef.current !== null) {
        window.clearInterval(swAnimFrameRef.current);
        swAnimFrameRef.current = null;
      }
    };
  }, [swIsRunning, showInAppPip, isOsPipActive, isZenMode]);

  const toggleSwRunning = () => {
    const now = Date.now();
    if (!swIsRunning) {
      if (swAccumulatedRef.current === 0) {
        swSessionStartedAtRef.current = now;
      }
      swResumedAtRef.current = now;
      setSwStartedAt(swSessionStartedAtRef.current);
      setSwIsRunning(true);
      persistRuntime({
        swIsRunning: true,
        swResumedAtMs: now,
        swSessionStartedAtMs: swSessionStartedAtRef.current,
        swAccumulatedMs: swAccumulatedRef.current,
      });
    } else {
      const total =
        swResumedAtRef.current !== null
          ? swAccumulatedRef.current + Math.max(0, now - swResumedAtRef.current)
          : swAccumulatedRef.current;
      swAccumulatedRef.current = total;
      swResumedAtRef.current = null;
      setSwElapsedMs(total);
      setSwStartedAt(null);
      setSwIsRunning(false);
      persistRuntime({
        swIsRunning: false,
        swResumedAtMs: null,
        swAccumulatedMs: total,
      });
    }
  };

  const resetSw = () => {
    const now = Date.now();
    const total =
      swIsRunning && swResumedAtRef.current !== null
        ? swAccumulatedRef.current + Math.max(0, now - swResumedAtRef.current)
        : swAccumulatedRef.current;
    if (swIsRunning) setSwIsRunning(false);
    const totalMinutes = Math.floor(total / 60000);
    if (totalMinutes >= 2) {
      emitSession({
        id: `sw-${now}`,
        timestamp: swSessionStartedAtRef.current,
        durationMinutes: totalMinutes,
        phase: 'stopwatch',
        subject: activeSubject,
        completed: true,
      });
    }
    swAccumulatedRef.current = 0;
    swResumedAtRef.current = null;
    swSessionStartedAtRef.current = now;
    setSwElapsedMs(0);
    setSwStartedAt(null);
    setSwLaps([]);
    persistRuntime({
      swIsRunning: false,
      swAccumulatedMs: 0,
      swResumedAtMs: null,
      swSessionStartedAtMs: now,
      swLaps: [],
    });
  };

  const recordSwLap = () => {
    const now = Date.now();
    const currentElapsed =
      swIsRunning && swResumedAtRef.current !== null
        ? swAccumulatedRef.current + Math.max(0, now - swResumedAtRef.current)
        : swElapsedMs;
    if (!swIsRunning && currentElapsed === 0) return;
    const previousTotal = swLaps.length > 0 ? swLaps[0].totalTimeMs : 0;
    const lapDuration = Math.max(0, currentElapsed - previousTotal);

    const newLap: StopwatchLap = {
      id: `lap-${now}`,
      lapNumber: swLaps.length + 1,
      lapDurationMs: lapDuration,
      totalTimeMs: currentElapsed,
      note: '',
    };
    setSwLaps([newLap, ...swLaps]);
  };

  const updateSwLapNote = (id: string, note: string) => {
    setSwLaps((prev) => prev.map((l) => (l.id === id ? { ...l, note } : l)));
  };

  // Compute Active Timer Formatted Time, Progress, and Controls
  let currentDisplayTime = '00:00';
  let currentDisplayProgress = 0;
  let currentIsRunning = false;
  let currentTitle = '';
  let currentSubtitle = '';

  const pomoTotalSeconds = getPomoTotalDuration(pomoPhase) + pomoAddedSeconds;

  if (activeMode === 'pomodoro') {
    const total = pomoTotalSeconds;
    const progress = total > 0 ? Math.min(1, Math.max(0, (total - pomoTimeLeft) / total)) : 0;
    const m = Math.floor(pomoTimeLeft / 60).toString().padStart(2, '0');
    const s = (pomoTimeLeft % 60).toString().padStart(2, '0');
    currentDisplayTime = `${m}:${s}`;
    currentDisplayProgress = progress;
    currentIsRunning = pomoIsRunning;
    currentTitle =
      pomoPhase === 'focus'
        ? `Focus (${(pomoCompletedCycles % pomoConfig.longBreakInterval) + 1}/${pomoConfig.longBreakInterval})`
        : pomoPhase === 'shortBreak'
        ? 'Short Break'
        : 'Long Break';
    currentSubtitle = `${activeSubject} · Pomodoro`;
  } else if (activeMode === 'timer') {
    const progress = countTotalSeconds > 0 ? (countTotalSeconds - countTimeLeft) / countTotalSeconds : 0;
    const h = Math.floor(countTimeLeft / 3600);
    const m = Math.floor((countTimeLeft % 3600) / 60);
    const s = countTimeLeft % 60;
    currentDisplayTime =
      h > 0
        ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    currentDisplayProgress = progress;
    currentIsRunning = countIsRunning;
    currentTitle = countTitle;
    currentSubtitle = `${activeSubject} · Countdown`;
  } else {
    const totalSecs = Math.floor(swElapsedMs / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    const hundredths = Math.floor((swElapsedMs % 1000) / 10).toString().padStart(2, '0');
    currentDisplayTime =
      h > 0 ? `${h.toString().padStart(2, '0')}:${m}:${s}.${hundredths}` : `${m}:${s}.${hundredths}`;
    currentDisplayProgress = (swElapsedMs % 60000) / 60000;
    currentIsRunning = swIsRunning;
    currentTitle = 'Stopwatch';
    currentSubtitle = `${activeSubject} · ${swLaps.length} Laps`;
  }

  const toggleCurrentRunning = () => {
    if (activeMode === 'pomodoro') togglePomoRunning();
    else if (activeMode === 'timer') toggleCountRunning();
    else toggleSwRunning();
  };

  const resetCurrent = () => {
    if (activeMode === 'pomodoro') resetPomo();
    else if (activeMode === 'timer') resetCount();
    else resetSw();
  };

  // Sync lightweight PiP text state on display changes
  useEffect(() => {
    pipManager.updateData({
      title: currentTitle.toUpperCase(),
      time: currentDisplayTime,
      subtitle: currentSubtitle,
      progress: currentDisplayProgress,
      isRunning: currentIsRunning,
      color: activeMode === 'pomodoro' ? '#f59e0b' : activeMode === 'timer' ? '#38bdf8' : '#10b981',
    });
  }, [
    currentDisplayTime,
    currentDisplayProgress,
    currentIsRunning,
    currentTitle,
    currentSubtitle,
    activeMode,
  ]);

  // Only update OS MediaSession metadata & handlers when session state/title changes (never every tick)
  useEffect(() => {
    updateMediaSession(
      currentTitle,
      `${activeSubject} · Chronos Study`,
      currentIsRunning ? 'playing' : 'paused',
      {
        onPlay: toggleCurrentRunning,
        onPause: toggleCurrentRunning,
        onNext: activeMode === 'pomodoro' ? skipPomoPhase : resetCurrent,
      }
    );
  }, [currentTitle, activeSubject, activeMode, currentIsRunning]);

  useEffect(() => {
    pipManager.setListener((active) => {
      setIsOsPipActive(active);
    });
  }, []);

  const launchOsPip = async (): Promise<boolean> => {
    const success = await pipManager.requestPip({
      onTogglePlay: toggleCurrentRunning,
      onReset: resetCurrent,
    });
    if (!success) {
      setShowInAppPip(true);
    }
    return success;
  };

  const stableActionsRef = useRef({
    updateSubjects,
    toggleNotifications,
    toggleWakeLock,
    toggleCurrentRunning,
    resetCurrent,
    launchOsPip,
  });
  stableActionsRef.current = {
    updateSubjects,
    toggleNotifications,
    toggleWakeLock,
    toggleCurrentRunning,
    resetCurrent,
    launchOsPip,
  };

  const controlsValue = React.useMemo<TimerControlsContextType>(
    () => ({
      activeMode,
      setActiveMode,
      activeSubject,
      setActiveSubject,
      subjects,
      updateSubjects: (newSubjects) => stableActionsRef.current.updateSubjects(newSubjects),
      isSubjectModalOpen,
      setIsSubjectModalOpen,
      notificationsEnabled: bgSettings.notificationsEnabled,
      toggleNotifications: () => stableActionsRef.current.toggleNotifications(),
      wakeLockEnabled: bgSettings.wakeLockEnabled && wakeLockActive,
      wakeLockMode,
      toggleWakeLock: () => stableActionsRef.current.toggleWakeLock(),
      toggleCurrentRunning: () => stableActionsRef.current.toggleCurrentRunning(),
      resetCurrent: () => stableActionsRef.current.resetCurrent(),
      isZenMode,
      setIsZenMode,
      showInAppPip,
      setShowInAppPip,
      launchOsPip: () => stableActionsRef.current.launchOsPip(),
      isOsPipActive,
      setSessionCallback,
      setWorkspaceSyncCallback,
      hydrateCloudWorkspace,
    }),
    [
      activeMode,
      activeSubject,
      setActiveSubject,
      subjects,
      isSubjectModalOpen,
      bgSettings.notificationsEnabled,
      bgSettings.wakeLockEnabled,
      wakeLockActive,
      wakeLockMode,
      isZenMode,
      showInAppPip,
      isOsPipActive,
      setSessionCallback,
      setWorkspaceSyncCallback,
      hydrateCloudWorkspace,
    ]
  );

  return (
    <TimerControlsContext.Provider value={controlsValue}>
      <TimerContext.Provider
        value={{
          activeMode,
          setActiveMode,
          activeSubject,
          setActiveSubject,

          subjects,
          updateSubjects,
          isSubjectModalOpen,
          setIsSubjectModalOpen,

          notificationsEnabled: bgSettings.notificationsEnabled,
          toggleNotifications,
          wakeLockEnabled: bgSettings.wakeLockEnabled && wakeLockActive,
          wakeLockMode,
          toggleWakeLock,

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

          swElapsedMs,
          getSwElapsedMsNow,
          swIsRunning,
          swStartedAt,
          swLaps,
          toggleSwRunning,
          resetSw,
          recordSwLap,
          updateSwLapNote,

          currentDisplayTime,
          currentDisplayProgress,
          currentIsRunning,
          currentTitle,
          currentSubtitle,
          toggleCurrentRunning,
          resetCurrent,

          isZenMode,
          setIsZenMode,
          showInAppPip,
          setShowInAppPip,
          launchOsPip,
          isOsPipActive,
          setSessionCallback,
          setWorkspaceSyncCallback,
          hydrateCloudWorkspace,
        }}
      >
        {children}
      </TimerContext.Provider>
    </TimerControlsContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within a TimerProvider');
  return ctx;
};

export const useTimerControls = () => {
  const ctx = useContext(TimerControlsContext);
  if (!ctx) throw new Error('useTimerControls must be used within a TimerProvider');
  return ctx;
};
