import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  Clock,
  Timer,
  Hourglass,
  Watch,
  Bell,
  BarChart2,
  ExternalLink,
  Maximize2,
  User as UserIcon,
  PanelRightClose,
  PanelRightOpen,
  LayoutTemplate,
  SlidersHorizontal,
  Info,
  Headphones,
  Layers,
  Sparkles,
  Trophy,
  ChevronLeft,
  Palette,
  Check,
  Sun,
  Moon,
  Music,
  ShoppingBag,
  Users,
  Mail,
  Compass,
} from 'lucide-react';

import {
  AppTab,
  AlarmItem,
  DeepWorkSession,
  StudyTask,
  AmbientSoundType,
  ChronosWallet,
  DailyCheckInData,
  CustomizationSettings,
  GlassThemeId,
  PersistedAuthSession,
  SavedCustomYoutubeTrack,
  FriendRequestItem,
  FriendshipItem,
  GiftItem,
  GiftItemCategory,
  PublicLeaderboardEntry,
  CosmeticRarity,
} from './types';

import {
  loadStoredAlarms,
  saveStoredAlarms,
  loadDeepWorkSessions,
  saveDeepWorkSessions,
  loadStudyTasks,
  saveStudyTasks,
  loadChronosWallet,
  saveChronosWallet,
  awardChronosPoints,
  normalizeWallet,
  DEFAULT_WALLET,
  getScholarRank,
  loadTodayCheckIn,
  saveDailyCheckIn,
  clearDailyCheckIn,
  normalizeDailyCheckIn,
  loadCheckInSnoozeUntil,
  saveCheckInSnoozeForHours,
  clearCheckInSnooze,
  loadCustomizationSettings,
  saveCustomizationSettings,
  DEFAULT_CUSTOMIZATION,
  getTodayDateString,
  GLASS_THEMES_CATALOG,
  normalizeGlassTheme,
  loadGuestProfile,
  saveGuestProfile,
  loadPersistedAuthSession,
  savePersistedAuthSession,
  clearPersistedAuthSession,
  loadSavedYoutubeTracks,
  saveCustomYoutubeTrackToLibrary,
  removeSavedYoutubeTrack,
  normalizeSavedYoutubeTracks,
  replaceSavedYoutubeTracks,
  loadYoutubePlaylists,
  normalizeYoutubePlaylists,
  replaceYoutubePlaylists,
  addCustomYoutubePlaylist,
  removeCustomYoutubePlaylist,
  updateSavedYoutubeTrackPlaylist,
  computeScholarDigitId,
  spendPointsForGift,
  claimGiftedCosmeticToWallet,
  DEFAULT_SUBJECTS,
  DEFAULT_POMODORO_CONFIG,
  mergeCloudAndLocalSubjects,
  normalizeSubjects,
  normalizePomodoroConfig,
  normalizeBackgroundSettings,
  normalizeCustomizationSettings,
  loadSubjects,
  loadPomodoroConfig,
  loadBackgroundSettings,
} from './utils/storage';

import {
  playChime,
  subscribeExternalAudioStop,
  subscribeExternalSoundChange,
} from './utils/audio';
import {
  TimerProvider,
  useTimer,
  useTimerControls,
  WorkspaceSyncPatch,
} from './context/TimerContext';
import { auth, authReadyPromise, db } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  getDocsFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
} from 'firebase/firestore';

import { TabletSidePanel } from './components/TabletSidePanel';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ScholarAvatar } from './components/ScholarCosmetics';
import {
  syncPublicLeaderboardProfile,
  removeGuestLeaderboardEntry,
  stripUndefinedFields,
  AccountProfileMeta,
} from './services/leaderboard';
import {
  subscribeIncomingFriendRequests,
  subscribeOutgoingFriendRequests,
  subscribeFriendships,
  subscribeReceivedGifts,
  subscribeSentGifts,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriendship,
  sendGiftToScholar,
  markGiftClaimed,
} from './services/social';
import {
  APP_SHORT_VERSION,
  hasUnseenAppUpdate,
  saveLastSeenVersion,
} from './utils/version';
import { DailyCheckInModal } from './components/DailyCheckInModal';

const ClockView = lazy(() =>
  import('./components/ClockView').then((m) => ({ default: m.ClockView }))
);
const PomodoroView = lazy(() =>
  import('./components/PomodoroView').then((m) => ({ default: m.PomodoroView }))
);
const CountdownTimerView = lazy(() =>
  import('./components/CountdownTimerView').then((m) => ({ default: m.CountdownTimerView }))
);
const StopwatchView = lazy(() =>
  import('./components/StopwatchView').then((m) => ({ default: m.StopwatchView }))
);
const AlarmsView = lazy(() =>
  import('./components/AlarmsView').then((m) => ({ default: m.AlarmsView }))
);
const DeepWorkStatsView = lazy(() =>
  import('./components/DeepWorkStatsView').then((m) => ({ default: m.DeepWorkStatsView }))
);
const LeaderboardView = lazy(() =>
  import('./components/LeaderboardView').then((m) => ({ default: m.LeaderboardView }))
);
const FriendsView = lazy(() =>
  import('./components/FriendsView').then((m) => ({ default: m.FriendsView }))
);
const ProfileView = lazy(() =>
  import('./components/ProfileView').then((m) => ({ default: m.ProfileView }))
);
const SettingsView = lazy(() =>
  import('./components/SettingsView').then((m) => ({ default: m.SettingsView }))
);
const AboutView = lazy(() =>
  import('./components/AboutView').then((m) => ({ default: m.AboutView }))
);
const VersionUpdatesView = lazy(() =>
  import('./components/VersionUpdatesView').then((m) => ({ default: m.VersionUpdatesView }))
);
const VersionUpdateDialog = lazy(() =>
  import('./components/VersionUpdateDialog').then((m) => ({ default: m.VersionUpdateDialog }))
);
const FocusMusicStore = lazy(() =>
  import('./components/FocusMusicStore').then((m) => ({ default: m.FocusMusicStore }))
);
const BackgroundMusicModal = lazy(() =>
  import('./components/BackgroundMusicModal').then((m) => ({ default: m.BackgroundMusicModal }))
);
const TaskDesignerModal = lazy(() =>
  import('./components/TaskDesignerModal').then((m) => ({ default: m.TaskDesignerModal }))
);
const CustomizationModal = lazy(() =>
  import('./components/CustomizationModal').then((m) => ({ default: m.CustomizationModal }))
);
const TierRoadmapModal = lazy(() =>
  import('./components/TierRoadmapModal').then((m) => ({ default: m.TierRoadmapModal }))
);
const SubjectManagerModal = lazy(() =>
  import('./components/SubjectManagerModal').then((m) => ({ default: m.SubjectManagerModal }))
);
const FloatingPipWidget = lazy(() =>
  import('./components/FloatingPipWidget').then((m) => ({ default: m.FloatingPipWidget }))
);
const ZenStudyMode = lazy(() =>
  import('./components/ZenStudyMode').then((m) => ({ default: m.ZenStudyMode }))
);
const GiftMailboxModal = lazy(() =>
  import('./components/GiftMailboxModal').then((m) => ({ default: m.GiftMailboxModal }))
);
const SendGiftModal = lazy(() =>
  import('./components/SendGiftModal').then((m) => ({ default: m.SendGiftModal }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center gap-3 ch-text-muted animate-fade-in">
    <div className="w-7 h-7 rounded-full border-2 border-[var(--ch-accent)] border-t-transparent animate-spin" />
    <span className="text-xs font-medium">Loading view...</span>
  </div>
);

const HeaderRunningTimerChip = React.memo(
  ({
    activeTab,
    onJumpToMode,
  }: {
    activeTab: AppTab;
    onJumpToMode: (mode: 'pomodoro' | 'timer' | 'stopwatch') => void;
  }) => {
    const { activeMode, currentDisplayTime, currentIsRunning } = useTimer();
    if (!currentIsRunning || activeTab === activeMode) return null;
    return (
      <button
        onClick={() => onJumpToMode(activeMode)}
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl ch-accent-soft text-xs font-mono font-bold whitespace-nowrap shrink-0"
        title="Jump back to active running timer"
      >
        <span>{currentDisplayTime}</span>
      </button>
    );
  }
);

function toSafeDocId(rawId: string): string {
  const cleaned = String(rawId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
  return cleaned || `doc-${Date.now()}`;
}

const IS_24_HOUR_KEY = 'chronos_is_24_hour_v1';

function loadStoredIs24Hour(): boolean {
  try {
    const raw = localStorage.getItem(IS_24_HOUR_KEY);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch {
    // ignore
  }
  return true;
}

function saveStoredIs24Hour(val: boolean): void {
  try {
    localStorage.setItem(IS_24_HOUR_KEY, val ? 'true' : 'false');
  } catch {
    // ignore
  }
}

const VALID_TABS: AppTab[] = [
  'clock',
  'pomodoro',
  'timer',
  'stopwatch',
  'alarms',
  'stats',
  'leaderboard',
  'friends',
  'profile',
  'settings',
  'about',
  'updates',
];

const TAB_TITLES: Record<AppTab, string> = {
  pomodoro: 'Pomodoro Studio',
  clock: 'Global Study Clock',
  timer: 'Countdown Block',
  stopwatch: 'Precision Stopwatch',
  alarms: 'Study Alarms',
  stats: 'Deep Work Analytics',
  leaderboard: 'Scholar Leaderboard',
  friends: 'Friends & Study Network',
  profile: 'Scholar Profile',
  settings: 'Studio Settings',
  updates: `Version ${APP_SHORT_VERSION} Notes`,
  about: 'About Chronos',
};

function MainContent() {
  const {
    activeMode,
    setActiveMode,
    isZenMode,
    setIsZenMode,
    showInAppPip,
    setShowInAppPip,
    launchOsPip,
    isOsPipActive,
    setSessionCallback,
    setWorkspaceSyncCallback,
    hydrateCloudWorkspace,
    subjects,
    updateSubjects,
    activeSubject,
    setActiveSubject,
    isSubjectModalOpen,
    setIsSubjectModalOpen,
  } = useTimerControls();

  const getInitialTab = (): AppTab => {
    try {
      const hash = window.location.hash.replace('#', '').toLowerCase() as AppTab;
      if (VALID_TABS.includes(hash)) return hash;
    } catch {
      // ignore
    }
    return 'pomodoro';
  };

  const [activeTab, setActiveTabState] = useState<AppTab>(getInitialTab);
  const [tabHistory, setTabHistory] = useState<AppTab[]>([getInitialTab()]);
  const [is24Hour, setIs24Hour] = useState<boolean>(() => loadStoredIs24Hour());

  const navigateToTab = useCallback(
    (newTab: AppTab, isBack: boolean = false) => {
      setActiveTabState(newTab);
      if (!isBack) {
        setTabHistory((prev) => (prev[prev.length - 1] === newTab ? prev : [...prev, newTab]));
      }
      if (newTab === 'pomodoro' || newTab === 'timer' || newTab === 'stopwatch') {
        setActiveMode(newTab);
      }
      try {
        window.history.pushState({ tab: newTab }, '', `#${newTab}`);
      } catch {
        window.location.hash = newTab;
      }
    },
    [setActiveMode]
  );

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      updated.pop();
      const previous = updated[updated.length - 1];
      setTabHistory(updated);
      setActiveTabState(previous);
      if (previous === 'pomodoro' || previous === 'timer' || previous === 'stopwatch') {
        setActiveMode(previous);
      }
      try {
        window.history.replaceState({ tab: previous }, '', `#${previous}`);
      } catch {
        window.location.hash = previous;
      }
    } else {
      navigateToTab('pomodoro');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const hashTab = window.location.hash.replace('#', '').toLowerCase() as AppTab;
      if (VALID_TABS.includes(hashTab)) {
        setActiveTabState(hashTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Persistent States
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => loadStoredAlarms());
  const [sessions, setSessions] = useState<DeepWorkSession[]>(() => loadDeepWorkSessions());
  const [tasks, setTasks] = useState<StudyTask[]>(() => loadStudyTasks());
  const [wallet, setWallet] = useState<ChronosWallet>(() => loadChronosWallet());
  const [dailyCheckIn, setDailyCheckIn] = useState<DailyCheckInData | null>(() => loadTodayCheckIn());
  const [checkInSnoozeUntil, setCheckInSnoozeUntil] = useState<number | null>(() =>
    loadCheckInSnoozeUntil()
  );
  const [customization, setCustomization] = useState<CustomizationSettings>(() => loadCustomizationSettings());

  // User Profile Preferences (hydrated synchronously from localStorage so rapid refreshes never flash/logout)
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [persistedAuthSession, setPersistedAuthSession] = useState<PersistedAuthSession | null>(
    () => loadPersistedAuthSession()
  );
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(
    () => loadPersistedAuthSession()?.dailyTargetHours || 4.0
  );
  const [primaryCourse, setPrimaryCourse] = useState<string>(
    () =>
      loadPersistedAuthSession()?.primarySubject ||
      loadGuestProfile().primarySubject ||
      'General'
  );
  const [accountProfileMeta, setAccountProfileMeta] = useState<AccountProfileMeta>(() => {
    const saved = loadPersistedAuthSession();
    if (!saved || saved.isAnonymous) return {};
    return {
      displayName: saved.displayName,
      studyLevel: saved.studyLevel,
      primarySubject: saved.primarySubject,
      bio: saved.bio,
    };
  });
  const [authSyncSeq, setAuthSyncSeq] = useState<number>(0);
  const [isSyncingSessions, setIsSyncingSessions] = useState<boolean>(false);
  const [hasMoreCloudSessions, setHasMoreCloudSessions] = useState<boolean>(false);
  const [isSyncingTasks, setIsSyncingTasks] = useState<boolean>(false);
  const [isSyncingAlarms, setIsSyncingAlarms] = useState<boolean>(false);
  const prevAuthUidRef = useRef<string | null>(loadPersistedAuthSession()?.uid || null);
  const explicitSignOutRef = useRef<boolean>(false);
  const isSwitchingAccountRef = useRef<boolean>(false);
  const hasCloudWalletRef = useRef<boolean>(false);
  const cloudUnsubsRef = useRef<Array<() => void>>([]);
  const syncRunIdRef = useRef<number>(0);
  const cloudLoadedRef = useRef<{
    uid: string | null;
    sessions: boolean;
    sessionsLimit: number;
    tasks: boolean;
    alarms: boolean;
    leaderboardSynced: boolean;
  }>({
    uid: null,
    sessions: false,
    sessionsLimit: 80,
    tasks: false,
    alarms: false,
    leaderboardSynced: false,
  });

  // Authoritative synchronous refs (prevents React 19 deferred state updater races)
  const sessionsRef = useRef<DeepWorkSession[]>(sessions);
  const tasksRef = useRef<StudyTask[]>(tasks);
  const alarmsRef = useRef<AlarmItem[]>(alarms);
  const walletRef = useRef<ChronosWallet>(wallet);
  const dailyGoalRef = useRef<number>(dailyGoalHours);
  const primaryCourseRef = useRef<string>(primaryCourse);
  const accountProfileMetaRef = useRef<AccountProfileMeta>(accountProfileMeta);
  const dailyCheckInRef = useRef<DailyCheckInData | null>(dailyCheckIn);
  const customizationRef = useRef<CustomizationSettings>(customization);
  const is24HourRef = useRef<boolean>(is24Hour);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  useEffect(() => {
    alarmsRef.current = alarms;
  }, [alarms]);
  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);
  useEffect(() => {
    dailyGoalRef.current = dailyGoalHours;
  }, [dailyGoalHours]);
  useEffect(() => {
    primaryCourseRef.current = primaryCourse;
  }, [primaryCourse]);
  useEffect(() => {
    accountProfileMetaRef.current = accountProfileMeta;
  }, [accountProfileMeta]);
  useEffect(() => {
    dailyCheckInRef.current = dailyCheckIn;
  }, [dailyCheckIn]);
  useEffect(() => {
    customizationRef.current = customization;
  }, [customization]);
  useEffect(() => {
    is24HourRef.current = is24Hour;
  }, [is24Hour]);

  useEffect(() => {
    setWorkspaceSyncCallback((patch: WorkspaceSyncPatch) => {
      const user = auth.currentUser;
      if (!user || user.isAnonymous) return;
      const payload: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      if (patch.subjects !== undefined) payload.subjects = patch.subjects;
      if (patch.activeSubject !== undefined) payload.activeSubject = patch.activeSubject;
      if (patch.pomoConfig !== undefined) payload.pomodoroConfig = patch.pomoConfig;
      if (patch.bgSettings !== undefined) payload.backgroundSettings = patch.bgSettings;
      setDoc(doc(db, 'users', user.uid), stripUndefinedFields(payload), { merge: true }).catch(
        () => {}
      );
    });
    return () => setWorkspaceSyncCallback(null);
  }, [setWorkspaceSyncCallback]);

  // Ambient Focus Audio State
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
  const [savedYoutubeTracks, setSavedYoutubeTracks] = useState<SavedCustomYoutubeTrack[]>(() =>
    loadSavedYoutubeTracks()
  );
  const [youtubePlaylists, setYoutubePlaylists] = useState<string[]>(() =>
    loadYoutubePlaylists()
  );
  const [isAutoSyncingRank, setIsAutoSyncingRank] = useState<boolean>(false);
  const [lastRankSyncAt, setLastRankSyncAt] = useState<number | null>(null);
  const savedYoutubeTracksRef = useRef<SavedCustomYoutubeTrack[]>(savedYoutubeTracks);
  const youtubePlaylistsRef = useRef<string[]>(youtubePlaylists);
  useEffect(() => {
    savedYoutubeTracksRef.current = savedYoutubeTracks;
  }, [savedYoutubeTracks]);
  useEffect(() => {
    youtubePlaylistsRef.current = youtubePlaylists;
  }, [youtubePlaylists]);

  useEffect(() => {
    const unsubStop = subscribeExternalAudioStop(() => setAmbientSound('off'));
    const unsubChange = subscribeExternalSoundChange((nextSound) =>
      setAmbientSound(nextSound)
    );
    return () => {
      unsubStop();
      unsubChange();
    };
  }, []);

  // Social: Friends & Gift Mailbox State
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<FriendRequestItem[]>([]);
  const [friendships, setFriendships] = useState<FriendshipItem[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftItem[]>([]);
  const [sentGifts, setSentGifts] = useState<GiftItem[]>([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState<boolean>(false);
  const [giftRecipient, setGiftRecipient] = useState<{
    userId: string;
    displayName: string;
    scholarId?: string;
    equippedFrame?: string;
    equippedAvatar?: string;
    equippedBackground?: string;
    totalPointsEarned?: number;
    rankTier?: string;
    primarySubject?: string;
  } | null>(null);

  const pendingRequestsCount = incomingFriendRequests.length;
  const unclaimedGiftsCount = useMemo(
    () => receivedGifts.filter((g) => g.status === 'unclaimed').length,
    [receivedGifts]
  );

  // Modals & Drawers
  const [isMusicStoreOpen, setIsMusicStoreOpen] = useState<boolean>(false);
  const [storeInitialSection, setStoreInitialSection] = useState<
    'all' | 'frames' | 'backgrounds' | 'avatars' | 'music'
  >('all');
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState<boolean>(false);
  const [isTaskDesignerOpen, setIsTaskDesignerOpen] = useState<boolean>(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isTierRoadmapOpen, setIsTierRoadmapOpen] = useState<boolean>(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [showSidePanel, setShowSidePanel] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const handleCloseUpdateDialog = useCallback(() => {
    saveLastSeenVersion();
    setIsUpdateDialogOpen(false);
    const today = getTodayDateString();
    const currentCheckIn = dailyCheckInRef.current || loadTodayCheckIn();
    const snoozedUntil = loadCheckInSnoozeUntil();
    if (
      (!currentCheckIn || currentCheckIn.date !== today) &&
      (!snoozedUntil || snoozedUntil <= Date.now())
    ) {
      window.setTimeout(() => {
        const latest = dailyCheckInRef.current || loadTodayCheckIn();
        const latestSnooze = loadCheckInSnoozeUntil();
        if (
          (!latest || latest.date !== getTodayDateString()) &&
          (!latestSnooze || latestSnooze <= Date.now())
        ) {
          setIsCheckInOpen(true);
        }
      }, 350);
    }
  }, []);

  const openUnifiedStore = useCallback(
    (section: 'all' | 'frames' | 'backgrounds' | 'avatars' | 'music' = 'all') => {
      setStoreInitialSection(section);
      setIsMusicStoreOpen(true);
    },
    []
  );

  // Active Glass Theme syncing onto <html> & meta theme-color
  const activeThemeId = normalizeGlassTheme(customization.glassTheme);
  const activeThemeMeta =
    GLASS_THEMES_CATALOG.find((t) => t.id === activeThemeId) || GLASS_THEMES_CATALOG[0];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', activeThemeMeta.mode === 'dark');
    GLASS_THEMES_CATALOG.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${activeThemeId}`);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', activeThemeMeta.swatchBg);
    }
  }, [activeThemeId, activeThemeMeta]);

  useEffect(() => {
    if (!isThemeMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);

  const persistCustomizationState = useCallback((nextCustom: CustomizationSettings) => {
    const normalized = normalizeCustomizationSettings(nextCustom);
    customizationRef.current = normalized;
    setCustomization(normalized);
    saveCustomizationSettings(normalized);
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      setDoc(
        doc(db, 'users', user.uid),
        stripUndefinedFields({
          customization: normalized,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      ).catch(() => {});
    }
  }, []);

  const handleUpdateFavoriteAudio = useCallback(
    (favoriteTracks: AmbientSoundType[], favoriteYoutubeIds: string[]) => {
      const updatedCustom: CustomizationSettings = {
        ...customizationRef.current,
        favoriteTracks,
        favoriteYoutubeIds,
      };
      persistCustomizationState(updatedCustom);
    },
    [persistCustomizationState]
  );

  const handleToggle24Hour = useCallback(() => {
    const nextVal = !is24HourRef.current;
    is24HourRef.current = nextVal;
    setIs24Hour(nextVal);
    saveStoredIs24Hour(nextVal);
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      setDoc(
        doc(db, 'users', user.uid),
        { is24Hour: nextVal, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
  }, []);

  const handleSelectGlassTheme = (themeId: GlassThemeId) => {
    const updated: CustomizationSettings = {
      ...customization,
      glassTheme: themeId,
    };
    persistCustomizationState(updated);
    setIsThemeMenuOpen(false);
  };

  // Show Version Update Dialog once per new release; otherwise run Daily Check-in prompt
  useEffect(() => {
    if (hasUnseenAppUpdate()) {
      const updateTimer = setTimeout(() => {
        setIsUpdateDialogOpen(true);
      }, 450);
      return () => clearTimeout(updateTimer);
    }

    const today = getTodayDateString();
    const existing = dailyCheckInRef.current || loadTodayCheckIn();
    const snoozedUntil = loadCheckInSnoozeUntil();
    if ((!existing || existing.date !== today) && (!snoozedUntil || snoozedUntil <= Date.now())) {
      const timer = setTimeout(() => {
        const latest = dailyCheckInRef.current || loadTodayCheckIn();
        const latestSnooze = loadCheckInSnoozeUntil();
        if (
          (!latest || latest.date !== getTodayDateString()) &&
          (!latestSnooze || latestSnooze <= Date.now())
        ) {
          setIsCheckInOpen(true);
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Automatically clear stale check-in state if the app stays open across midnight
  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = dailyCheckInRef.current;
      if (current && current.date !== getTodayDateString()) {
        dailyCheckInRef.current = null;
        setDailyCheckIn(null);
        clearDailyCheckIn();
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  // Automatically restore Check-in banner once its snooze timer elapses
  useEffect(() => {
    if (!checkInSnoozeUntil) return;
    const msRemaining = checkInSnoozeUntil - Date.now();
    if (msRemaining <= 0) {
      clearCheckInSnooze();
      setCheckInSnoozeUntil(null);
      return;
    }
    const timer = setTimeout(() => {
      clearCheckInSnooze();
      setCheckInSnoozeUntil(null);
    }, Math.min(msRemaining + 100, 2147483000));
    return () => clearTimeout(timer);
  }, [checkInSnoozeUntil]);

  const handleSnoozeCheckIn = useCallback((hours: number) => {
    const until = saveCheckInSnoozeForHours(hours);
    setCheckInSnoozeUntil(until);
  }, []);

  const handleExpandCheckIn = useCallback(() => {
    clearCheckInSnooze();
    setCheckInSnoozeUntil(null);
  }, []);

  // Active Alarm Ringing Modal
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);
  const lastTriggeredMinuteRef = useRef<string>('');
  const ringingAudioIntervalRef = useRef<number | null>(null);

  // Lightweight Boot Auth Listener: awaits Firebase persistence rehydration and uses localStorage
  // session cache so rapid/multiple refreshes NEVER log the user out until localStorage is cleared
  // or the user explicitly clicks Sign Out.
  useEffect(() => {
    const clearCloudSubscriptions = () => {
      cloudUnsubsRef.current.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
      cloudUnsubsRef.current = [];
    };

    const unsub = onAuthStateChanged(auth, async (user) => {
      const runId = ++syncRunIdRef.current;

      // Ensure Firebase has finished reading browserLocalPersistence before treating user=null as signed out
      if (!user) {
        await authReadyPromise;
        if (syncRunIdRef.current !== runId) return;
      }

      const resolvedAuthUser = user || auth.currentUser;
      clearCloudSubscriptions();
      setCurrentUser(resolvedAuthUser);
      setHasMoreCloudSessions(false);
      cloudLoadedRef.current = {
        uid: resolvedAuthUser?.uid || null,
        sessions: false,
        sessionsLimit: 80,
        tasks: false,
        alarms: false,
        leaderboardSynced: false,
      };
      hasCloudWalletRef.current = false;

      if (!resolvedAuthUser) {
        const savedSession = loadPersistedAuthSession();
        if (savedSession && !savedSession.isAnonymous && !explicitSignOutRef.current) {
          // Preserve authenticated state from localStorage across refreshes/token hiccups
          setPersistedAuthSession(savedSession);
          prevAuthUidRef.current = savedSession.uid;
          isSwitchingAccountRef.current = false;
          if (savedSession.dailyTargetHours && savedSession.dailyTargetHours > 0) {
            dailyGoalRef.current = savedSession.dailyTargetHours;
            setDailyGoalHours(savedSession.dailyTargetHours);
          }
          if (savedSession.primarySubject) {
            primaryCourseRef.current = savedSession.primarySubject;
            setPrimaryCourse(savedSession.primarySubject);
          }
          const restoredMeta: AccountProfileMeta = {
            displayName: savedSession.displayName,
            studyLevel: savedSession.studyLevel,
            primarySubject: savedSession.primarySubject,
            bio: savedSession.bio,
          };
          accountProfileMetaRef.current = restoredMeta;
          setAccountProfileMeta(restoredMeta);
          setAuthSyncSeq((n) => n + 1);
          return;
        }

        explicitSignOutRef.current = false;
        clearPersistedAuthSession();
        setPersistedAuthSession(null);
        const guestSubj = loadGuestProfile().primarySubject || DEFAULT_SUBJECTS[0].name;
        if (prevAuthUidRef.current) {
          sessionsRef.current = [];
          setSessions([]);
          saveDeepWorkSessions([]);
          const freshWallet = { ...DEFAULT_WALLET };
          walletRef.current = freshWallet;
          setWallet(freshWallet);
          saveChronosWallet(freshWallet);
          hydrateCloudWorkspace({
            subjects: DEFAULT_SUBJECTS,
            activeSubject: guestSubj,
            pomoConfig: DEFAULT_POMODORO_CONFIG,
            bgSettings: { notificationsEnabled: true, wakeLockEnabled: false },
          });
          customizationRef.current = DEFAULT_CUSTOMIZATION;
          setCustomization(DEFAULT_CUSTOMIZATION);
          saveCustomizationSettings(DEFAULT_CUSTOMIZATION);
          is24HourRef.current = true;
          setIs24Hour(true);
          saveStoredIs24Hour(true);
        }
        prevAuthUidRef.current = null;
        isSwitchingAccountRef.current = false;
        primaryCourseRef.current = guestSubj;
        setPrimaryCourse(guestSubj);
        accountProfileMetaRef.current = {};
        setAccountProfileMeta({});
        setAuthSyncSeq((n) => n + 1);
        return;
      }

      explicitSignOutRef.current = false;

      let isSwitchingAccount = false;
      try {
        const lastUid = localStorage.getItem('chronos_last_auth_uid');
        isSwitchingAccount = Boolean(lastUid && lastUid !== resolvedAuthUser.uid);
        localStorage.setItem('chronos_last_auth_uid', resolvedAuthUser.uid);
      } catch {
        // ignore
      }
      isSwitchingAccountRef.current = isSwitchingAccount;
      prevAuthUidRef.current = resolvedAuthUser.uid;

      const existingSaved = loadPersistedAuthSession();
      let resolvedGoal =
        (!isSwitchingAccount && existingSaved?.dailyTargetHours) || dailyGoalRef.current;
      let resolvedSubject =
        (!isSwitchingAccount && existingSaved?.primarySubject) ||
        loadGuestProfile().primarySubject ||
        'General';
      let resolvedMeta: AccountProfileMeta = {};
      let resolvedWallet: ChronosWallet = isSwitchingAccount
        ? { ...DEFAULT_WALLET }
        : loadChronosWallet();
      let resolvedCheckIn: DailyCheckInData | null = isSwitchingAccount ? null : loadTodayCheckIn();
      let hasCloudWallet = false;

      if (isSwitchingAccount) {
        sessionsRef.current = [];
        setSessions([]);
        saveDeepWorkSessions([]);
        walletRef.current = resolvedWallet;
        setWallet(resolvedWallet);
        saveChronosWallet(resolvedWallet);
        dailyCheckInRef.current = null;
        setDailyCheckIn(null);
        clearDailyCheckIn();
        hydrateCloudWorkspace({
          subjects: DEFAULT_SUBJECTS,
          activeSubject: DEFAULT_SUBJECTS[0].name,
          pomoConfig: DEFAULT_POMODORO_CONFIG,
          bgSettings: { notificationsEnabled: true, wakeLockEnabled: false },
        });
        customizationRef.current = DEFAULT_CUSTOMIZATION;
        setCustomization(DEFAULT_CUSTOMIZATION);
        saveCustomizationSettings(DEFAULT_CUSTOMIZATION);
        is24HourRef.current = true;
        setIs24Hour(true);
        saveStoredIs24Hour(true);
      }

      const userDocRef = doc(db, 'users', resolvedAuthUser.uid);

      if (!resolvedAuthUser.isAnonymous) {
        try {
          const snap = await getDocFromServer(userDocRef).catch(() => getDoc(userDocRef));
          if (syncRunIdRef.current !== runId) return;
          if (snap.exists()) {
            const data = snap.data();
            if (typeof data.dailyTargetHours === 'number' && data.dailyTargetHours > 0) {
              resolvedGoal = data.dailyTargetHours;
              dailyGoalRef.current = resolvedGoal;
              setDailyGoalHours(resolvedGoal);
            }
            if (typeof data.primarySubject === 'string' && data.primarySubject.trim()) {
              resolvedSubject = data.primarySubject.trim();
              primaryCourseRef.current = resolvedSubject;
              setPrimaryCourse(resolvedSubject);
            }
            if (data.wallet && typeof data.wallet === 'object') {
              resolvedWallet = normalizeWallet(data.wallet);
              hasCloudWallet = true;
            }
            const cloudCheckIn = normalizeDailyCheckIn(data.dailyCheckIn);
            if (cloudCheckIn && cloudCheckIn.date === getTodayDateString()) {
              resolvedCheckIn = cloudCheckIn;
              dailyCheckInRef.current = resolvedCheckIn;
              setDailyCheckIn(resolvedCheckIn);
              saveDailyCheckIn(resolvedCheckIn);
            }
            if (Array.isArray(data.youtubePlaylists)) {
              const incomingPlaylists = normalizeYoutubePlaylists([
                ...youtubePlaylistsRef.current,
                ...data.youtubePlaylists,
              ]);
              youtubePlaylistsRef.current = incomingPlaylists;
              setYoutubePlaylists(incomingPlaylists);
              replaceYoutubePlaylists(incomingPlaylists);
            }
            if (Array.isArray(data.savedYoutubeTracks)) {
              const incomingSaved = normalizeSavedYoutubeTracks(data.savedYoutubeTracks);
              if (incomingSaved.length > 0) {
                const merged = normalizeSavedYoutubeTracks([
                  ...savedYoutubeTracksRef.current,
                  ...incomingSaved,
                ]);
                savedYoutubeTracksRef.current = merged;
                setSavedYoutubeTracks(merged);
                replaceSavedYoutubeTracks(merged);
                const mergedPls = normalizeYoutubePlaylists([
                  ...youtubePlaylistsRef.current,
                  ...merged.map((t) => t.playlist || 'Deep Focus'),
                ]);
                youtubePlaylistsRef.current = mergedPls;
                setYoutubePlaylists(mergedPls);
                replaceYoutubePlaylists(mergedPls);
              }
            }

            // Hydrate workspace data from Firestore user document (with offline/local merge if same account)
            const localSubs = isSwitchingAccount ? [] : loadSubjects();
            const mergedSubjects = mergeCloudAndLocalSubjects(
              data.subjects,
              localSubs,
              isSwitchingAccount
            );
            const resolvedActiveSubject =
              typeof data.activeSubject === 'string' && data.activeSubject.trim()
                ? data.activeSubject.trim()
                : typeof data.primarySubject === 'string' && data.primarySubject.trim()
                ? data.primarySubject.trim()
                : mergedSubjects[0]?.name || DEFAULT_SUBJECTS[0].name;
            const resolvedPomoConfig =
              data.pomodoroConfig && typeof data.pomodoroConfig === 'object'
                ? normalizePomodoroConfig(data.pomodoroConfig)
                : !isSwitchingAccount
                ? loadPomodoroConfig()
                : DEFAULT_POMODORO_CONFIG;
            const resolvedBgSettings =
              data.backgroundSettings && typeof data.backgroundSettings === 'object'
                ? normalizeBackgroundSettings(data.backgroundSettings)
                : !isSwitchingAccount
                ? loadBackgroundSettings()
                : { notificationsEnabled: true, wakeLockEnabled: false };

            hydrateCloudWorkspace({
              subjects: mergedSubjects,
              activeSubject: resolvedActiveSubject,
              pomoConfig: resolvedPomoConfig,
              bgSettings: resolvedBgSettings,
            });

            const resolvedCustom =
              data.customization && typeof data.customization === 'object'
                ? normalizeCustomizationSettings(data.customization)
                : !isSwitchingAccount
                ? loadCustomizationSettings()
                : DEFAULT_CUSTOMIZATION;
            customizationRef.current = resolvedCustom;
            setCustomization(resolvedCustom);
            saveCustomizationSettings(resolvedCustom);

            const resolved24Hour =
              typeof data.is24Hour === 'boolean'
                ? data.is24Hour
                : !isSwitchingAccount
                ? loadStoredIs24Hour()
                : true;
            is24HourRef.current = resolved24Hour;
            setIs24Hour(resolved24Hour);
            saveStoredIs24Hour(resolved24Hour);

            // Backfill missing workspace fields to Firestore once
            const backfillPayload: Record<string, unknown> = {};
            const cloudSubjectsMissing =
              !Array.isArray(data.subjects) ||
              (!isSwitchingAccount && mergedSubjects.length > data.subjects.length);
            if (cloudSubjectsMissing) backfillPayload.subjects = mergedSubjects;
            if (typeof data.activeSubject !== 'string' || !data.activeSubject.trim()) {
              backfillPayload.activeSubject = resolvedActiveSubject;
            }
            if (!data.pomodoroConfig || typeof data.pomodoroConfig !== 'object') {
              backfillPayload.pomodoroConfig = resolvedPomoConfig;
            }
            if (!data.customization || typeof data.customization !== 'object') {
              backfillPayload.customization = resolvedCustom;
            }
            if (!data.backgroundSettings || typeof data.backgroundSettings !== 'object') {
              backfillPayload.backgroundSettings = resolvedBgSettings;
            }
            if (typeof data.is24Hour !== 'boolean') {
              backfillPayload.is24Hour = resolved24Hour;
            }
            if (
              resolvedCheckIn &&
              resolvedCheckIn.date === getTodayDateString() &&
              (!cloudCheckIn || cloudCheckIn.date !== getTodayDateString())
            ) {
              backfillPayload.dailyCheckIn = resolvedCheckIn;
            }
            if (Object.keys(backfillPayload).length > 0) {
              backfillPayload.updatedAt = new Date().toISOString();
              setDoc(userDocRef, stripUndefinedFields(backfillPayload), { merge: true }).catch(
                () => {}
              );
            }

            const rawName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
            const repairedName =
              rawName && rawName !== 'Guest Scholar'
                ? rawName
                : resolvedAuthUser.displayName ||
                  resolvedAuthUser.email?.split('@')[0] ||
                  'Study Scholar';

            if (rawName === 'Guest Scholar' && resolvedAuthUser.displayName) {
              setDoc(
                userDocRef,
                { displayName: repairedName, updatedAt: new Date().toISOString() },
                { merge: true }
              ).catch(() => {});
            }

            resolvedMeta = {
              displayName: repairedName,
              studyLevel: typeof data.studyLevel === 'string' ? data.studyLevel : undefined,
              primarySubject: resolvedSubject,
              bio: typeof data.bio === 'string' ? data.bio : undefined,
            };
          } else {
            resolvedMeta = {
              displayName:
                resolvedAuthUser.displayName ||
                resolvedAuthUser.email?.split('@')[0] ||
                existingSaved?.displayName ||
                'Study Scholar',
              studyLevel: existingSaved?.studyLevel,
              primarySubject: resolvedSubject,
              bio: existingSaved?.bio,
            };
            const initialSubjects = isSwitchingAccount ? DEFAULT_SUBJECTS : loadSubjects();
            const initialPomo = isSwitchingAccount
              ? DEFAULT_POMODORO_CONFIG
              : loadPomodoroConfig();
            const initialBg = isSwitchingAccount
              ? { notificationsEnabled: true, wakeLockEnabled: false }
              : loadBackgroundSettings();
            const initialCustom = isSwitchingAccount
              ? DEFAULT_CUSTOMIZATION
              : loadCustomizationSettings();
            const initial24Hour = isSwitchingAccount ? true : loadStoredIs24Hour();

            setDoc(
              userDocRef,
              stripUndefinedFields({
                subjects: initialSubjects,
                activeSubject: resolvedSubject || initialSubjects[0]?.name || 'Mathematics',
                pomodoroConfig: initialPomo,
                backgroundSettings: initialBg,
                customization: initialCustom,
                is24Hour: initial24Hour,
                updatedAt: new Date().toISOString(),
              }),
              { merge: true }
            ).catch(() => {});
          }
        } catch {
          resolvedMeta = {
            displayName:
              resolvedAuthUser.displayName ||
              resolvedAuthUser.email?.split('@')[0] ||
              existingSaved?.displayName ||
              'Study Scholar',
            studyLevel: existingSaved?.studyLevel,
            primarySubject: resolvedSubject,
            bio: existingSaved?.bio,
          };
        }
      }

      if (syncRunIdRef.current !== runId) return;

      hasCloudWalletRef.current = hasCloudWallet;
      walletRef.current = resolvedWallet;
      setWallet(resolvedWallet);
      saveChronosWallet(resolvedWallet);

      accountProfileMetaRef.current = resolvedMeta;
      setAccountProfileMeta(resolvedMeta);

      if (!resolvedAuthUser.isAnonymous) {
        const nextPersisted: PersistedAuthSession = {
          uid: resolvedAuthUser.uid,
          scholarId: computeScholarDigitId(resolvedAuthUser.uid),
          email: resolvedAuthUser.email || existingSaved?.email || '',
          displayName:
            resolvedMeta.displayName ||
            resolvedAuthUser.displayName ||
            resolvedAuthUser.email?.split('@')[0] ||
            'Study Scholar',
          photoURL: resolvedAuthUser.photoURL || existingSaved?.photoURL || undefined,
          providerId:
            resolvedAuthUser.providerData?.[0]?.providerId || existingSaved?.providerId,
          isAnonymous: false,
          dailyTargetHours: resolvedGoal,
          primarySubject: resolvedSubject,
          studyLevel: resolvedMeta.studyLevel,
          bio: resolvedMeta.bio,
          signedInAt:
            existingSaved && existingSaved.uid === resolvedAuthUser.uid
              ? existingSaved.signedInAt
              : Date.now(),
          lastVerifiedAt: Date.now(),
        };
        savePersistedAuthSession(nextPersisted);
        setPersistedAuthSession(nextPersisted);
      }

      if (resolvedAuthUser.isAnonymous) {
        void removeGuestLeaderboardEntry(resolvedAuthUser.uid);
      } else {
        // Attach single lightweight user profile/wallet/workspace doc listener
        const unsubUserDoc = onSnapshot(
          userDocRef,
          (snap) => {
            if (!snap.exists() || snap.metadata.hasPendingWrites) return;
            const data = snap.data();

            if (data.wallet && typeof data.wallet === 'object') {
              const incomingWallet = normalizeWallet(data.wallet);
              if (JSON.stringify(incomingWallet) !== JSON.stringify(walletRef.current)) {
                walletRef.current = incomingWallet;
                setWallet(incomingWallet);
                saveChronosWallet(incomingWallet);
              }
            }

            if (
              typeof data.dailyTargetHours === 'number' &&
              data.dailyTargetHours > 0 &&
              data.dailyTargetHours !== dailyGoalRef.current
            ) {
              dailyGoalRef.current = data.dailyTargetHours;
              setDailyGoalHours(data.dailyTargetHours);
            }

            const incomingSubj =
              typeof data.primarySubject === 'string' && data.primarySubject.trim()
                ? data.primarySubject.trim()
                : '';
            if (incomingSubj && incomingSubj !== primaryCourseRef.current) {
              primaryCourseRef.current = incomingSubj;
              setPrimaryCourse(incomingSubj);
            }

            const workspacePatch: WorkspaceSyncPatch = {};
            if (Array.isArray(data.subjects)) {
              const incomingSubs = normalizeSubjects(data.subjects);
              if (JSON.stringify(incomingSubs) !== JSON.stringify(loadSubjects())) {
                workspacePatch.subjects = incomingSubs;
              }
            }
            if (typeof data.activeSubject === 'string' && data.activeSubject.trim()) {
              workspacePatch.activeSubject = data.activeSubject.trim();
            }
            if (data.pomodoroConfig && typeof data.pomodoroConfig === 'object') {
              const incomingPomo = normalizePomodoroConfig(data.pomodoroConfig);
              if (JSON.stringify(incomingPomo) !== JSON.stringify(loadPomodoroConfig())) {
                workspacePatch.pomoConfig = incomingPomo;
              }
            }
            if (data.backgroundSettings && typeof data.backgroundSettings === 'object') {
              const incomingBg = normalizeBackgroundSettings(data.backgroundSettings);
              if (JSON.stringify(incomingBg) !== JSON.stringify(loadBackgroundSettings())) {
                workspacePatch.bgSettings = incomingBg;
              }
            }
            if (Object.keys(workspacePatch).length > 0) {
              hydrateCloudWorkspace(workspacePatch);
            }

            if (data.customization && typeof data.customization === 'object') {
              const incomingCustom = normalizeCustomizationSettings(data.customization);
              if (JSON.stringify(incomingCustom) !== JSON.stringify(customizationRef.current)) {
                customizationRef.current = incomingCustom;
                setCustomization(incomingCustom);
                saveCustomizationSettings(incomingCustom);
              }
            }

            if (typeof data.is24Hour === 'boolean' && data.is24Hour !== is24HourRef.current) {
              is24HourRef.current = data.is24Hour;
              setIs24Hour(data.is24Hour);
              saveStoredIs24Hour(data.is24Hour);
            }

            const incomingCheckIn = normalizeDailyCheckIn(data.dailyCheckIn);
            if (incomingCheckIn && incomingCheckIn.date === getTodayDateString()) {
              if (
                JSON.stringify(incomingCheckIn) !== JSON.stringify(dailyCheckInRef.current)
              ) {
                dailyCheckInRef.current = incomingCheckIn;
                setDailyCheckIn(incomingCheckIn);
                saveDailyCheckIn(incomingCheckIn);
              }
            }

            if (Array.isArray(data.youtubePlaylists)) {
              const incomingPls = normalizeYoutubePlaylists(data.youtubePlaylists);
              if (
                JSON.stringify(incomingPls) !== JSON.stringify(youtubePlaylistsRef.current)
              ) {
                youtubePlaylistsRef.current = incomingPls;
                setYoutubePlaylists(incomingPls);
                replaceYoutubePlaylists(incomingPls);
              }
            }

            if (Array.isArray(data.savedYoutubeTracks)) {
              const incomingSaved = normalizeSavedYoutubeTracks(data.savedYoutubeTracks);
              if (
                incomingSaved.length > 0 &&
                JSON.stringify(incomingSaved) !== JSON.stringify(savedYoutubeTracksRef.current)
              ) {
                savedYoutubeTracksRef.current = incomingSaved;
                setSavedYoutubeTracks(incomingSaved);
                replaceSavedYoutubeTracks(incomingSaved);
              }
            }

            const nextMeta: AccountProfileMeta = {
              displayName:
                typeof data.displayName === 'string' &&
                data.displayName.trim() &&
                data.displayName.trim() !== 'Guest Scholar'
                  ? data.displayName.trim()
                  : accountProfileMetaRef.current.displayName,
              studyLevel:
                typeof data.studyLevel === 'string'
                  ? data.studyLevel
                  : accountProfileMetaRef.current.studyLevel,
              primarySubject: incomingSubj || accountProfileMetaRef.current.primarySubject,
              bio:
                typeof data.bio === 'string'
                  ? data.bio
                  : accountProfileMetaRef.current.bio,
            };
            if (JSON.stringify(nextMeta) !== JSON.stringify(accountProfileMetaRef.current)) {
              accountProfileMetaRef.current = nextMeta;
              setAccountProfileMeta(nextMeta);
              const curSaved = loadPersistedAuthSession();
              if (curSaved && curSaved.uid === resolvedAuthUser.uid) {
                const updatedSaved: PersistedAuthSession = {
                  ...curSaved,
                  displayName: nextMeta.displayName || curSaved.displayName,
                  studyLevel: nextMeta.studyLevel,
                  primarySubject: nextMeta.primarySubject,
                  bio: nextMeta.bio,
                  dailyTargetHours: dailyGoalRef.current,
                  lastVerifiedAt: Date.now(),
                };
                savePersistedAuthSession(updatedSaved);
                setPersistedAuthSession(updatedSaved);
              }
            }
          },
          () => {
            // ignore transient snapshot notices
          }
        );

        cloudUnsubsRef.current = [unsubUserDoc];
      }

      setAuthSyncSeq((n) => n + 1);
    });

    return () => {
      syncRunIdRef.current += 1;
      clearCloudSubscriptions();
      unsub();
    };
  }, [hydrateCloudWorkspace]);

  const handleExplicitSignOut = useCallback(async () => {
    explicitSignOutRef.current = true;
    syncRunIdRef.current += 1;
    cloudUnsubsRef.current.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
    cloudUnsubsRef.current = [];
    clearPersistedAuthSession();
    setPersistedAuthSession(null);
    setCurrentUser(null);
    prevAuthUidRef.current = null;
    isSwitchingAccountRef.current = false;
    hasCloudWalletRef.current = false;

    sessionsRef.current = [];
    setSessions([]);
    saveDeepWorkSessions([]);
    const freshWallet = { ...DEFAULT_WALLET };
    walletRef.current = freshWallet;
    setWallet(freshWallet);
    saveChronosWallet(freshWallet);

    const guestSubj = loadGuestProfile().primarySubject || DEFAULT_SUBJECTS[0].name;
    hydrateCloudWorkspace({
      subjects: DEFAULT_SUBJECTS,
      activeSubject: guestSubj,
      pomoConfig: DEFAULT_POMODORO_CONFIG,
      bgSettings: { notificationsEnabled: true, wakeLockEnabled: false },
    });
    customizationRef.current = DEFAULT_CUSTOMIZATION;
    setCustomization(DEFAULT_CUSTOMIZATION);
    saveCustomizationSettings(DEFAULT_CUSTOMIZATION);
    is24HourRef.current = true;
    setIs24Hour(true);
    saveStoredIs24Hour(true);

    primaryCourseRef.current = guestSubj;
    setPrimaryCourse(guestSubj);
    accountProfileMetaRef.current = {};
    setAccountProfileMeta({});

    await signOut(auth).catch(() => {});
    setAuthSyncSeq((n) => n + 1);
  }, [hydrateCloudWorkspace]);

  // On-demand loader: Sessions (recent-first bounded slice loaded on auth boot for Today's Focus/Streak, full history lazy in Stats)
  const ensureSessionsLoaded = useCallback(
    async (opts: { loadAll?: boolean; force?: boolean; syncLeaderboard?: boolean } = {}) => {
      const user = auth.currentUser;
      if (!user) return;
      const targetLimit = opts.loadAll
        ? 2000
        : opts.loadAll === false
        ? 80
        : cloudLoadedRef.current.sessionsLimit;

      const alreadyLoaded =
        cloudLoadedRef.current.uid === user.uid &&
        cloudLoadedRef.current.sessions &&
        (!opts.loadAll || cloudLoadedRef.current.sessionsLimit >= 2000);

      if (alreadyLoaded && !opts.force) {
        if (opts.syncLeaderboard && !user.isAnonymous) {
          cloudLoadedRef.current.leaderboardSynced = true;
          setIsAutoSyncingRank(true);
          try {
            const ok = await syncPublicLeaderboardProfile({
              user,
              sessions: sessionsRef.current,
              tasks: tasksRef.current,
              wallet: walletRef.current,
              dailyGoalHours: dailyGoalRef.current,
              activeSubject: primaryCourseRef.current,
              dailyCheckIn: dailyCheckInRef.current,
              profileOverride: accountProfileMetaRef.current,
              forceOverwrite: true,
            });
            if (ok) setLastRankSyncAt(Date.now());
          } finally {
            setIsAutoSyncingRank(false);
          }
        }
        return;
      }

      const activeRunId = syncRunIdRef.current;
      setIsSyncingSessions(true);
      try {
        const sessColRef = collection(db, 'users', user.uid, 'sessions');
        const sessQuery = opts.loadAll
          ? query(sessColRef, orderBy('timestamp', 'desc'))
          : query(sessColRef, orderBy('timestamp', 'desc'), limit(targetLimit + 1));

        const sessSnap = await getDocsFromServer(sessQuery).catch(() => getDocs(sessQuery));
        if (syncRunIdRef.current !== activeRunId) return;

        const hasMore = !opts.loadAll && sessSnap.docs.length > targetLimit;
        const docsSlice = opts.loadAll ? sessSnap.docs : sessSnap.docs.slice(0, targetLimit);
        setHasMoreCloudSessions(hasMore);

        const localCurrent = [...sessionsRef.current];
        const sessionMap = new Map<string, DeepWorkSession>();
        for (const s of localCurrent) {
          if (s && s.id) sessionMap.set(s.id, s);
        }

        const serverIds = new Set<string>();
        docsSlice.forEach((d) => {
          const serverSess = d.data() as DeepWorkSession;
          if (serverSess && serverSess.id) {
            serverIds.add(serverSess.id);
            sessionMap.set(serverSess.id, serverSess);
          }
        });

        if (!isSwitchingAccountRef.current) {
          for (const localSess of localCurrent) {
            if (localSess && localSess.id && !serverIds.has(localSess.id)) {
              setDoc(
                doc(db, 'users', user.uid, 'sessions', toSafeDocId(localSess.id)),
                stripUndefinedFields({ ...localSess, userId: user.uid }),
                { merge: true }
              ).catch(() => {});
            }
          }
        }

        const mergedSessions = Array.from(sessionMap.values()).sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );
        sessionsRef.current = mergedSessions;
        setSessions(mergedSessions);
        saveDeepWorkSessions(mergedSessions);

        cloudLoadedRef.current.uid = user.uid;
        cloudLoadedRef.current.sessions = true;
        cloudLoadedRef.current.sessionsLimit = targetLimit;

        if (!user.isAnonymous && !hasCloudWalletRef.current) {
          const sessionMinutesFloor = mergedSessions.reduce(
            (acc, s) => acc + (s.durationMinutes || 0),
            0
          );
          if (sessionMinutesFloor > walletRef.current.totalPointsEarned) {
            const boostedWallet: ChronosWallet = {
              ...walletRef.current,
              points: walletRef.current.points + sessionMinutesFloor,
              totalPointsEarned: walletRef.current.totalPointsEarned + sessionMinutesFloor,
            };
            walletRef.current = boostedWallet;
            setWallet(boostedWallet);
            saveChronosWallet(boostedWallet);
            setDoc(
              doc(db, 'users', user.uid),
              { wallet: boostedWallet, updatedAt: new Date().toISOString() },
              { merge: true }
            ).catch(() => {});
          }
          hasCloudWalletRef.current = true;
        }

        if (opts.syncLeaderboard && !user.isAnonymous) {
          cloudLoadedRef.current.leaderboardSynced = true;
          setIsAutoSyncingRank(true);
          try {
            const ok = await syncPublicLeaderboardProfile({
              user,
              sessions: mergedSessions,
              tasks: tasksRef.current,
              wallet: walletRef.current,
              dailyGoalHours: dailyGoalRef.current,
              activeSubject: primaryCourseRef.current,
              dailyCheckIn: dailyCheckInRef.current,
              profileOverride: accountProfileMetaRef.current,
              forceOverwrite: true,
            });
            if (ok) setLastRankSyncAt(Date.now());
          } finally {
            setIsAutoSyncingRank(false);
          }
        }
      } catch {
        // ignore transient network errors
      } finally {
        setIsSyncingSessions(false);
      }
    },
    []
  );

  // On-demand loader: Tasks (fetched only when opening Task Planner, Mobile Drawer, Profile, or clicking Sync Tasks)
  const ensureTasksLoaded = useCallback(async (force: boolean = false) => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return;
    if (!force && cloudLoadedRef.current.uid === user.uid && cloudLoadedRef.current.tasks) {
      return;
    }

    const activeRunId = syncRunIdRef.current;
    setIsSyncingTasks(true);
    try {
      const tasksColRef = collection(db, 'users', user.uid, 'tasks');
      const taskSnap = await getDocsFromServer(tasksColRef).catch(() => getDocs(tasksColRef));
      if (syncRunIdRef.current !== activeRunId) return;

      if (!taskSnap.empty) {
        const serverTaskMap = new Map<string, StudyTask>();
        taskSnap.docs.forEach((d) => {
          const t = d.data() as StudyTask;
          if (t && t.id) serverTaskMap.set(t.id, t);
        });
        const mergedTasks = Array.from(serverTaskMap.values()).sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );
        tasksRef.current = mergedTasks;
        setTasks(mergedTasks);
        saveStudyTasks(mergedTasks);
      } else if (!isSwitchingAccountRef.current && tasksRef.current.length > 0) {
        for (const t of tasksRef.current) {
          if (t && t.id) {
            setDoc(
              doc(db, 'users', user.uid, 'tasks', toSafeDocId(t.id)),
              stripUndefinedFields({ ...t, userId: user.uid }),
              { merge: true }
            ).catch(() => {});
          }
        }
      }

      cloudLoadedRef.current.uid = user.uid;
      cloudLoadedRef.current.tasks = true;
    } catch {
      // ignore
    } finally {
      setIsSyncingTasks(false);
    }
  }, []);

  // On-demand loader: Alarms (fetched only when opening Alarms view or clicking Sync)
  const ensureAlarmsLoaded = useCallback(async (force: boolean = false) => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return;
    if (!force && cloudLoadedRef.current.uid === user.uid && cloudLoadedRef.current.alarms) {
      return;
    }

    const activeRunId = syncRunIdRef.current;
    setIsSyncingAlarms(true);
    try {
      const alarmsColRef = collection(db, 'users', user.uid, 'alarms');
      const alarmSnap = await getDocsFromServer(alarmsColRef).catch(() => getDocs(alarmsColRef));
      if (syncRunIdRef.current !== activeRunId) return;

      if (!alarmSnap.empty) {
        const serverAlarms: AlarmItem[] = [];
        alarmSnap.docs.forEach((d) => {
          const a = d.data() as AlarmItem;
          if (a && a.id) serverAlarms.push(a);
        });
        alarmsRef.current = serverAlarms;
        setAlarms(serverAlarms);
        saveStoredAlarms(serverAlarms);
      } else if (!isSwitchingAccountRef.current && alarmsRef.current.length > 0) {
        for (const a of alarmsRef.current) {
          if (a && a.id) {
            setDoc(
              doc(db, 'users', user.uid, 'alarms', toSafeDocId(a.id)),
              stripUndefinedFields({ ...a, userId: user.uid }),
              { merge: true }
            ).catch(() => {});
          }
        }
      }

      cloudLoadedRef.current.uid = user.uid;
      cloudLoadedRef.current.alarms = true;
    } catch {
      // ignore
    } finally {
      setIsSyncingAlarms(false);
    }
  }, []);

  // Hydrate recent bounded session slice on authenticated boot across ALL tabs so Today's Focus & Streak detect cross-device hours immediately
  useEffect(() => {
    if (!currentUser) return;
    void ensureSessionsLoaded({ loadAll: false });
  }, [currentUser?.uid, ensureSessionsLoaded]);

  // Trigger heavy / section-specific cloud data loads when the user invokes those sections
  useEffect(() => {
    if (!currentUser) return;

    if (activeTab === 'stats' || activeTab === 'profile' || activeTab === 'leaderboard') {
      void ensureSessionsLoaded({
        syncLeaderboard: activeTab === 'leaderboard' || activeTab === 'profile',
      });
    }
    if (activeTab === 'alarms') {
      void ensureAlarmsLoaded();
    }
    if (activeTab === 'profile' || isTaskDesignerOpen || mobileDrawerOpen) {
      void ensureTasksLoaded();
    }
  }, [
    activeTab,
    currentUser?.uid,
    isTaskDesignerOpen,
    mobileDrawerOpen,
    ensureSessionsLoaded,
    ensureAlarmsLoaded,
    ensureTasksLoaded,
  ]);

  // Lightweight live recent-sessions listener (limit 25) active across ALL tabs for real-time cross-device Today's Focus detection
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) return;

    const liveSessionsQuery = query(
      collection(db, 'users', currentUser.uid, 'sessions'),
      orderBy('timestamp', 'desc'),
      limit(25)
    );
    const unsub = onSnapshot(
      liveSessionsQuery,
      (snap) => {
        if (snap.metadata.hasPendingWrites || !cloudLoadedRef.current.sessions) return;
        const snapDocs = snap.docs
          .map((d) => d.data() as DeepWorkSession)
          .filter((s) => Boolean(s && s.id));
        const oldestSnapTs =
          snap.docs.length >= 25 && snapDocs.length > 0
            ? Math.min(...snapDocs.map((s) => s.timestamp || 0))
            : 0;
        const map = new Map<string, DeepWorkSession>();
        for (const existing of sessionsRef.current) {
          if (existing && existing.id && (existing.timestamp || 0) < oldestSnapTs) {
            map.set(existing.id, existing);
          }
        }
        for (const s of snapDocs) {
          map.set(s.id, s);
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );
        if (JSON.stringify(merged) !== JSON.stringify(sessionsRef.current)) {
          sessionsRef.current = merged;
          setSessions(merged);
          saveDeepWorkSessions(merged);
        }
      },
      () => {
        // ignore transient snapshot errors
      }
    );

    return () => unsub();
  }, [currentUser?.uid]);

  // Attach live Friends & Gift Mailbox Firestore listeners when signed into a registered account
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) {
      setIncomingFriendRequests([]);
      setOutgoingFriendRequests([]);
      setFriendships([]);
      setReceivedGifts([]);
      setSentGifts([]);
      return;
    }

    const uid = currentUser.uid;
    const unsubs = [
      subscribeIncomingFriendRequests(uid, setIncomingFriendRequests),
      subscribeOutgoingFriendRequests(uid, setOutgoingFriendRequests),
      subscribeFriendships(uid, setFriendships),
      subscribeReceivedGifts(uid, setReceivedGifts),
      subscribeSentGifts(uid, setSentGifts),
    ];

    return () => {
      unsubs.forEach((fn) => {
        try {
          fn();
        } catch {
          // ignore
        }
      });
    };
  }, [currentUser?.uid, currentUser?.isAnonymous]);

  const handleUpdateAlarms = (newAlarms: AlarmItem[]) => {
    const prevIds = new Set(alarmsRef.current.map((a) => toSafeDocId(a.id)));
    const nextIds = new Set(newAlarms.map((a) => toSafeDocId(a.id)));
    alarmsRef.current = newAlarms;
    setAlarms(newAlarms);
    saveStoredAlarms(newAlarms);

    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      for (const oldId of prevIds) {
        if (!nextIds.has(oldId)) {
          deleteDoc(doc(db, 'users', user.uid, 'alarms', oldId)).catch(() => {});
        }
      }
      for (const a of newAlarms) {
        setDoc(
          doc(db, 'users', user.uid, 'alarms', toSafeDocId(a.id)),
          stripUndefinedFields({ ...a, userId: user.uid }),
          { merge: true }
        ).catch(() => {});
      }
    }
  };

  const handleUpdateDailyGoal = useCallback((nextHours: number) => {
    dailyGoalRef.current = nextHours;
    setDailyGoalHours(nextHours);
    const curSaved = loadPersistedAuthSession();
    if (curSaved && !curSaved.isAnonymous) {
      const updated = { ...curSaved, dailyTargetHours: nextHours, lastVerifiedAt: Date.now() };
      savePersistedAuthSession(updated);
      setPersistedAuthSession(updated);
    }
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      setDoc(
        doc(db, 'users', user.uid),
        { dailyTargetHours: nextHours, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
  }, []);

  const handleUpdatePrimaryCourse = useCallback(
    (nextCourse: string) => {
      const cleaned = nextCourse.trim() || 'General';
      primaryCourseRef.current = cleaned;
      setPrimaryCourse(cleaned);
      setActiveSubject(cleaned);
      const updatedMeta = {
        ...accountProfileMetaRef.current,
        primarySubject: cleaned,
      };
      accountProfileMetaRef.current = updatedMeta;
      setAccountProfileMeta(updatedMeta);

      const curSaved = loadPersistedAuthSession();
      if (curSaved && !curSaved.isAnonymous) {
        const updated = { ...curSaved, primarySubject: cleaned, lastVerifiedAt: Date.now() };
        savePersistedAuthSession(updated);
        setPersistedAuthSession(updated);
      }

      const user = auth.currentUser;
      if (!user || user.isAnonymous) {
        if (!curSaved || curSaved.isAnonymous) {
          const guest = loadGuestProfile();
          saveGuestProfile({ ...guest, primarySubject: cleaned });
        }
      } else {
        setDoc(
          doc(db, 'users', user.uid),
          { primarySubject: cleaned, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
        syncPublicLeaderboardProfile({
          user,
          sessions: sessionsRef.current,
          tasks: tasksRef.current,
          wallet: walletRef.current,
          dailyGoalHours: dailyGoalRef.current,
          activeSubject: cleaned,
          dailyCheckIn: dailyCheckInRef.current,
          profileOverride: updatedMeta,
        }).catch(() => {});
      }
    },
    [setActiveSubject]
  );

  const persistWalletState = useCallback(
    (nextWallet: ChronosWallet, syncLeaderboard: boolean = true) => {
      const normalized = normalizeWallet(nextWallet);
      walletRef.current = normalized;
      setWallet(normalized);
      saveChronosWallet(normalized);
      const user = auth.currentUser;
      if (user && !user.isAnonymous) {
        setDoc(
          doc(db, 'users', user.uid),
          { wallet: normalized, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
        if (syncLeaderboard) {
          syncPublicLeaderboardProfile({
            user,
            sessions: sessionsRef.current,
            tasks: tasksRef.current,
            wallet: normalized,
            dailyGoalHours: dailyGoalRef.current,
            activeSubject: primaryCourseRef.current,
            dailyCheckIn: dailyCheckInRef.current,
            profileOverride: accountProfileMetaRef.current,
          }).catch(() => {});
        }
      }
    },
    []
  );

  const handleAwardPoints = useCallback(
    (amount: number) => {
      const updated = awardChronosPoints(amount);
      persistWalletState(updated, true);
    },
    [persistWalletState]
  );

  const syncPlaylistsAndTracksToCloud = useCallback(
    (nextTracks: SavedCustomYoutubeTrack[], nextPlaylists: string[]) => {
      const user = auth.currentUser;
      if (user && !user.isAnonymous) {
        setDoc(
          doc(db, 'users', user.uid),
          {
            savedYoutubeTracks: nextTracks,
            youtubePlaylists: nextPlaylists,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    },
    []
  );

  const handleSaveYoutubeTrack = useCallback(
    (input: { videoId: string; title: string; url: string; playlist?: string }) => {
      const nextTracks = saveCustomYoutubeTrackToLibrary(input);
      savedYoutubeTracksRef.current = nextTracks;
      setSavedYoutubeTracks(nextTracks);

      const targetPl = input.playlist?.trim();
      let nextPlaylists = youtubePlaylistsRef.current;
      if (targetPl) {
        nextPlaylists = addCustomYoutubePlaylist(targetPl);
        youtubePlaylistsRef.current = nextPlaylists;
        setYoutubePlaylists(nextPlaylists);
      }

      syncPlaylistsAndTracksToCloud(nextTracks, nextPlaylists);
    },
    [syncPlaylistsAndTracksToCloud]
  );

  const handleRemoveYoutubeTrack = useCallback(
    (idOrVideoId: string) => {
      const nextTracks = removeSavedYoutubeTrack(idOrVideoId);
      savedYoutubeTracksRef.current = nextTracks;
      setSavedYoutubeTracks(nextTracks);
      syncPlaylistsAndTracksToCloud(nextTracks, youtubePlaylistsRef.current);
    },
    [syncPlaylistsAndTracksToCloud]
  );

  const handleUpdateYoutubeTrackPlaylist = useCallback(
    (videoId: string, playlist: string) => {
      const nextTracks = updateSavedYoutubeTrackPlaylist(videoId, playlist);
      savedYoutubeTracksRef.current = nextTracks;
      setSavedYoutubeTracks(nextTracks);
      const nextPlaylists = addCustomYoutubePlaylist(playlist);
      youtubePlaylistsRef.current = nextPlaylists;
      setYoutubePlaylists(nextPlaylists);
      syncPlaylistsAndTracksToCloud(nextTracks, nextPlaylists);
    },
    [syncPlaylistsAndTracksToCloud]
  );

  const handleAddYoutubePlaylist = useCallback(
    (name: string) => {
      const nextPlaylists = addCustomYoutubePlaylist(name);
      youtubePlaylistsRef.current = nextPlaylists;
      setYoutubePlaylists(nextPlaylists);
      syncPlaylistsAndTracksToCloud(savedYoutubeTracksRef.current, nextPlaylists);
    },
    [syncPlaylistsAndTracksToCloud]
  );

  const handleRemoveYoutubePlaylist = useCallback(
    (name: string) => {
      const { playlists: nextPlaylists, tracks: nextTracks } =
        removeCustomYoutubePlaylist(name);
      youtubePlaylistsRef.current = nextPlaylists;
      setYoutubePlaylists(nextPlaylists);
      savedYoutubeTracksRef.current = nextTracks;
      setSavedYoutubeTracks(nextTracks);
      syncPlaylistsAndTracksToCloud(nextTracks, nextPlaylists);
    },
    [syncPlaylistsAndTracksToCloud]
  );

  // Social & Gift Action Handlers
  const getRegisteredSenderContext = useCallback(() => {
    const liveUser = auth.currentUser;
    if (!liveUser || liveUser.isAnonymous) {
      throw new Error('Please sign in with a registered Scholar account to connect or gift.');
    }
    const senderName =
      accountProfileMetaRef.current.displayName ||
      liveUser.displayName ||
      liveUser.email?.split('@')[0] ||
      'Study Scholar';
    const rank = getScholarRank(walletRef.current.totalPointsEarned);
    return {
      uid: liveUser.uid,
      displayName: senderName,
      frame: walletRef.current.equippedFrame,
      avatar: walletRef.current.equippedAvatar,
      primarySubject: primaryCourseRef.current,
      rankTier: rank.tier,
    };
  }, []);

  const handleSendFriendRequest = useCallback(
    async (target: PublicLeaderboardEntry) => {
      const sender = getRegisteredSenderContext();
      await sendFriendRequest({
        fromUid: sender.uid,
        fromName: sender.displayName,
        fromFrame: sender.frame,
        fromAvatar: sender.avatar,
        fromPrimarySubject: sender.primarySubject,
        fromRankTier: sender.rankTier,
        target,
      });
    },
    [getRegisteredSenderContext]
  );

  const handleAcceptFriendRequest = useCallback(async (req: FriendRequestItem) => {
    await acceptFriendRequest(req);
  }, []);

  const handleDeclineFriendRequest = useCallback(async (requestId: string) => {
    await declineFriendRequest(requestId);
  }, []);

  const handleCancelFriendRequest = useCallback(async (requestId: string) => {
    await cancelFriendRequest(requestId);
  }, []);

  const handleRemoveFriendship = useCallback(async (friendUid: string) => {
    const liveUser = auth.currentUser;
    if (!liveUser || liveUser.isAnonymous) return;
    await removeFriendship(liveUser.uid, friendUid);
  }, []);

  const handleSendGift = useCallback(
    async (payload: {
      recipient: { userId: string; displayName: string; scholarId?: string };
      category: GiftItemCategory;
      itemId: string;
      itemName: string;
      itemRarity: CosmeticRarity;
      costPoints: number;
      message: string;
    }) => {
      const sender = getRegisteredSenderContext();
      if (walletRef.current.points < payload.costPoints) {
        throw new Error('Not enough spendable XP to send this gift.');
      }
      await sendGiftToScholar({
        fromUid: sender.uid,
        fromName: sender.displayName,
        fromFrame: sender.frame,
        fromAvatar: sender.avatar,
        recipient: payload.recipient,
        itemCategory: payload.category,
        itemId: payload.itemId,
        itemName: payload.itemName,
        itemRarity: payload.itemRarity,
        costPoints: payload.costPoints,
        message: payload.message,
      });
      const spendResult = spendPointsForGift(payload.costPoints);
      if (spendResult.success) {
        persistWalletState(spendResult.wallet, false);
      }
    },
    [getRegisteredSenderContext, persistWalletState]
  );

  const handleClaimGift = useCallback(
    async (
      gift: GiftItem,
      equipNow: boolean
    ): Promise<{ alreadyOwned: boolean; bonusXp: number }> => {
      await markGiftClaimed(gift.giftId);
      const { wallet: updatedWallet, alreadyOwned, bonusXp } =
        claimGiftedCosmeticToWallet(gift.itemCategory, gift.itemId, equipNow);
      persistWalletState(updatedWallet, true);
      return { alreadyOwned, bonusXp };
    },
    [persistWalletState]
  );

  // Automatic Background Rank Sync: keeps public leaderboard up-to-date continuously
  // whenever sessions, XP, cosmetics, primary course, daily goal, tasks, or check-in change.
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return;

    const timer = window.setTimeout(() => {
      const activeUser = auth.currentUser;
      if (!activeUser || activeUser.isAnonymous) return;

      const canOverwriteTotals =
        cloudLoadedRef.current.uid === activeUser.uid && cloudLoadedRef.current.sessions;

      setIsAutoSyncingRank(true);
      void syncPublicLeaderboardProfile({
        user: activeUser,
        sessions: sessionsRef.current,
        tasks: tasksRef.current,
        wallet: walletRef.current,
        dailyGoalHours: dailyGoalRef.current,
        activeSubject: primaryCourseRef.current,
        dailyCheckIn: dailyCheckInRef.current,
        profileOverride: accountProfileMetaRef.current,
        forceOverwrite: canOverwriteTotals,
      })
        .then((ok) => {
          if (ok) {
            cloudLoadedRef.current.leaderboardSynced = true;
            setLastRankSyncAt(Date.now());
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsAutoSyncingRank(false);
        });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    currentUser?.uid,
    authSyncSeq,
    sessions,
    wallet,
    dailyGoalHours,
    primaryCourse,
    accountProfileMeta,
    dailyCheckIn,
    tasks,
  ]);

  // Synchronous-ref session completion (safe in React 19 + immediate Firestore write-through)
  const handleSessionComplete = useCallback((session: DeepWorkSession) => {
    const currentSessions = sessionsRef.current;
    if (currentSessions.some((s) => s.id === session.id)) {
      return;
    }

    const earnedPoints = Math.max(1, Math.round(session.durationMinutes));
    const sessionWithPoints: DeepWorkSession = {
      ...session,
      pointsEarned: earnedPoints,
    };

    const nextSessions = [sessionWithPoints, ...currentSessions];
    sessionsRef.current = nextSessions;
    setSessions(nextSessions);
    saveDeepWorkSessions(nextSessions);

    let bonusPoints = 0;
    const goalHours = dailyGoalRef.current;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const totalTodayMins = nextSessions
      .filter((s) => s.timestamp >= startOfToday)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    if (
      totalTodayMins >= goalHours * 60 &&
      totalTodayMins - session.durationMinutes < goalHours * 60
    ) {
      bonusPoints += 25;
    }

    let advancedFirst = false;
    const changedTasks: StudyTask[] = [];
    const nextTasks = tasksRef.current.map((t) => {
      if (
        !advancedFirst &&
        !t.done &&
        (t.subject === session.subject || session.subject === 'General')
      ) {
        advancedFirst = true;
        const nextCount = t.completedPomodoros + 1;
        const isNowDone = nextCount >= t.estimatedPomodoros;
        if (isNowDone && !t.rewardClaimed) {
          bonusPoints += 10;
        }
        const updatedTask: StudyTask = {
          ...t,
          completedPomodoros: nextCount,
          done: isNowDone,
          rewardClaimed: isNowDone ? true : t.rewardClaimed,
        };
        changedTasks.push(updatedTask);
        return updatedTask;
      }
      return t;
    });
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
    saveStudyTasks(nextTasks);

    const baseWallet = normalizeWallet(walletRef.current);
    const totalEarnedDelta = earnedPoints + bonusPoints;
    const finalWallet: ChronosWallet = {
      ...baseWallet,
      points: baseWallet.points + totalEarnedDelta,
      totalPointsEarned: baseWallet.totalPointsEarned + totalEarnedDelta,
    };
    walletRef.current = finalWallet;
    setWallet(finalWallet);
    saveChronosWallet(finalWallet);

    const user = auth.currentUser;
    if (user) {
      try {
        const sessRef = doc(db, 'users', user.uid, 'sessions', toSafeDocId(session.id));
        setDoc(
          sessRef,
          stripUndefinedFields({ ...sessionWithPoints, userId: user.uid }),
          { merge: true }
        ).catch(() => {});

        if (!user.isAnonymous) {
          for (const ct of changedTasks) {
            setDoc(
              doc(db, 'users', user.uid, 'tasks', toSafeDocId(ct.id)),
              stripUndefinedFields({ ...ct, userId: user.uid }),
              { merge: true }
            ).catch(() => {});
          }

          setDoc(
            doc(db, 'users', user.uid),
            stripUndefinedFields({
              wallet: finalWallet,
              updatedAt: new Date().toISOString(),
            }),
            { merge: true }
          ).catch(() => {});

          if (!cloudLoadedRef.current.sessions) {
            void ensureSessionsLoaded({ syncLeaderboard: true }).catch(() => {});
          } else {
            syncPublicLeaderboardProfile({
              user,
              sessions: nextSessions,
              tasks: nextTasks,
              wallet: finalWallet,
              dailyGoalHours: goalHours,
              activeSubject: primaryCourseRef.current,
              dailyCheckIn: dailyCheckInRef.current,
              profileOverride: {
                ...accountProfileMetaRef.current,
                primarySubject:
                  accountProfileMetaRef.current.primarySubject || primaryCourseRef.current,
              },
              forceOverwrite: true,
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Could not sync session to Firestore:', err);
      }
    }
  }, [ensureSessionsLoaded]);

  useEffect(() => {
    setSessionCallback(handleSessionComplete);
  }, [setSessionCallback, handleSessionComplete]);

  const handleUpdateTasks = (newTasks: StudyTask[]) => {
    const prevTasks = tasksRef.current;
    const prevMap = new Map<string, StudyTask>(prevTasks.map((t) => [t.id, t]));
    let bonusTasksCompleted = 0;
    const normalizedTasks = newTasks.map((t) => {
      const prev = prevMap.get(t.id);
      if (t.done && !prev?.done && !prev?.rewardClaimed) {
        bonusTasksCompleted += 1;
        return { ...t, rewardClaimed: true };
      }
      return t;
    });

    tasksRef.current = normalizedTasks;
    setTasks(normalizedTasks);
    saveStudyTasks(normalizedTasks);

    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      const nextIds = new Set(normalizedTasks.map((t) => toSafeDocId(t.id)));
      for (const oldT of prevTasks) {
        const safeOldId = toSafeDocId(oldT.id);
        if (!nextIds.has(safeOldId)) {
          deleteDoc(doc(db, 'users', user.uid, 'tasks', safeOldId)).catch(() => {});
        }
      }
      for (const t of normalizedTasks) {
        setDoc(
          doc(db, 'users', user.uid, 'tasks', toSafeDocId(t.id)),
          stripUndefinedFields({ ...t, userId: user.uid }),
          { merge: true }
        ).catch(() => {});
      }
    }

    if (bonusTasksCompleted > 0) {
      handleAwardPoints(bonusTasksCompleted * 10);
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessionsRef.current.filter((s) => s.id !== id);
    sessionsRef.current = updated;
    setSessions(updated);
    saveDeepWorkSessions(updated);

    const user = auth.currentUser;
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'sessions', toSafeDocId(id))).catch(() => {});
      if (!user.isAnonymous) {
        syncPublicLeaderboardProfile({
          user,
          sessions: updated,
          tasks: tasksRef.current,
          wallet: walletRef.current,
          dailyGoalHours: dailyGoalRef.current,
          activeSubject: primaryCourseRef.current,
          dailyCheckIn: dailyCheckInRef.current,
          profileOverride: accountProfileMetaRef.current,
          forceOverwrite: true,
        }).catch(() => {});
      }
    }
  };

  const handleClearSessions = () => {
    const toDelete = [...sessionsRef.current];
    sessionsRef.current = [];
    setSessions([]);
    saveDeepWorkSessions([]);

    const user = auth.currentUser;
    if (user) {
      for (const s of toDelete) {
        deleteDoc(doc(db, 'users', user.uid, 'sessions', toSafeDocId(s.id))).catch(() => {});
      }
      if (!user.isAnonymous) {
        syncPublicLeaderboardProfile({
          user,
          sessions: [],
          tasks: tasksRef.current,
          wallet: walletRef.current,
          dailyGoalHours: dailyGoalRef.current,
          activeSubject: primaryCourseRef.current,
          dailyCheckIn: dailyCheckInRef.current,
          profileOverride: accountProfileMetaRef.current,
          forceOverwrite: true,
        }).catch(() => {});
      }
    }
  };

  const handleResetAllData = () => {
    const oldSessions = [...sessionsRef.current];
    const oldTasks = [...tasksRef.current];
    const oldAlarms = [...alarmsRef.current];

    sessionsRef.current = [];
    setSessions([]);
    saveDeepWorkSessions([]);
    tasksRef.current = [];
    setTasks([]);
    saveStudyTasks([]);
    alarmsRef.current = [];
    setAlarms([]);
    saveStoredAlarms([]);

    const user = auth.currentUser;
    if (user) {
      oldSessions.forEach((s) =>
        deleteDoc(doc(db, 'users', user.uid, 'sessions', toSafeDocId(s.id))).catch(() => {})
      );
      oldTasks.forEach((t) =>
        deleteDoc(doc(db, 'users', user.uid, 'tasks', toSafeDocId(t.id))).catch(() => {})
      );
      oldAlarms.forEach((a) =>
        deleteDoc(doc(db, 'users', user.uid, 'alarms', toSafeDocId(a.id))).catch(() => {})
      );
      if (!user.isAnonymous) {
        syncPublicLeaderboardProfile({
          user,
          sessions: [],
          tasks: [],
          wallet: walletRef.current,
          dailyGoalHours: dailyGoalRef.current,
          activeSubject: primaryCourseRef.current,
          dailyCheckIn: dailyCheckInRef.current,
          profileOverride: accountProfileMetaRef.current,
          forceOverwrite: true,
        }).catch(() => {});
      }
    }
  };

  const handleStartFocusWithTask = (task: StudyTask) => {
    setActiveSubject(task.subject);
    setActiveMode('pomodoro');
    navigateToTab('pomodoro');
  };

  // Alarm Check Engine
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeKey = `${currentH}:${currentM}`;
      const currentDay = now.getDay();

      if (timeKey === lastTriggeredMinuteRef.current) return;

      const matched = alarms.find((a) => {
        if (!a.enabled) return false;
        if (a.time !== timeKey) return false;
        if (a.days.length === 0) return true;
        return a.days.includes(currentDay);
      });

      if (matched) {
        lastTriggeredMinuteRef.current = timeKey;
        triggerAlarmRing(matched);
      }
    };

    const interval = setInterval(checkAlarms, 5000);
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarmRing = (alarm: AlarmItem) => {
    setRingingAlarm(alarm);
    playChime(alarm.sound);

    if (ringingAudioIntervalRef.current) clearInterval(ringingAudioIntervalRef.current);
    ringingAudioIntervalRef.current = window.setInterval(() => {
      playChime(alarm.sound);
    }, 4500);
  };

  const dismissRingingAlarm = () => {
    if (ringingAudioIntervalRef.current) {
      clearInterval(ringingAudioIntervalRef.current);
      ringingAudioIntervalRef.current = null;
    }
    setRingingAlarm(null);
  };

  const snoozeRingingAlarm = (minutes: number = 5) => {
    dismissRingingAlarm();
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeH = now.getHours().toString().padStart(2, '0');
    const snoozeM = now.getMinutes().toString().padStart(2, '0');
    const snoozeTime = `${snoozeH}:${snoozeM}`;

    const snoozedAlarm: AlarmItem = {
      id: `snooze-${Date.now()}`,
      time: snoozeTime,
      label: `[Snoozed ${minutes}m] ${ringingAlarm?.label || 'Alarm'}`,
      category: ringingAlarm?.category || 'Study',
      days: [],
      enabled: true,
      sound: ringingAlarm?.sound || 'bowl',
      snoozeMinutes: minutes,
    };
    handleUpdateAlarms([...alarms, snoozedAlarm]);
  };

  // Memoized today focus stats & 30-day streak (only recomputed when sessions change)
  const { todayMinutes, currentStreak } = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const todayMins = sessions
      .filter((s) => s.timestamp >= startOfToday)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayMins = sessions
        .filter((s) => s.timestamp >= dayStart && s.timestamp < dayEnd)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      if (dayMins >= 25) {
        streak += 1;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return { todayMinutes: todayMins, currentStreak: streak };
  }, [sessions]);

  const railNavGroups: {
    heading: string;
    items: { tab: AppTab; label: string; icon: React.FC<{ className?: string }> }[];
  }[] = [
    {
      heading: 'Focus Instruments',
      items: [
        { tab: 'pomodoro', label: 'Pomodoro', icon: Timer },
        { tab: 'clock', label: 'Global Clock', icon: Clock },
        { tab: 'timer', label: 'Countdown', icon: Hourglass },
        { tab: 'stopwatch', label: 'Stopwatch', icon: Watch },
        { tab: 'alarms', label: 'Alarms', icon: Bell },
      ],
    },
    {
      heading: 'Insights & Scholars',
      items: [
        { tab: 'stats', label: 'Deep Work', icon: BarChart2 },
        { tab: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { tab: 'friends', label: 'Friends', icon: Users },
        { tab: 'profile', label: 'Profile', icon: UserIcon },
      ],
    },
    {
      heading: 'Studio',
      items: [
        { tab: 'settings', label: 'Settings', icon: SlidersHorizontal },
        { tab: 'updates', label: 'What’s New', icon: Sparkles },
        { tab: 'about', label: 'About', icon: Info },
      ],
    },
  ];

  return (
    <div className={`h-dvh overflow-hidden ch-canvas flex flex-col w-full max-w-full theme-${activeThemeId}`}>
      {/* Studio Top Glass Header */}
      <header className="ch-glass-panel border-x-0 border-t-0 shrink-0 relative z-30 h-14 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Left Zone: Back + Wordmark / Active Page */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {tabHistory.length > 1 && (
            <button
              onClick={handleGoBack}
              className="ch-btn-secondary flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-xl shrink-0"
              title="Return one step back in Chronos history"
            >
              <ChevronLeft className="w-3.5 h-3.5 ch-text-accent" />
              <span className="hidden lg:inline">Back</span>
            </button>
          )}

          <a
            href="#pomodoro"
            onClick={(e) => {
              e.preventDefault();
              navigateToTab('pomodoro');
            }}
            className="flex items-center gap-2 lg:hidden whitespace-nowrap shrink-0"
          >
            <span className="w-7 h-7 rounded-xl ch-accent-soft flex items-center justify-center font-extrabold text-xs">
              C
            </span>
            <span className="text-sm sm:text-base font-extrabold tracking-tight ch-text">Chronos</span>
          </a>

          <div className="hidden lg:flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-bold tracking-tight ch-text truncate">
              {TAB_TITLES[activeTab]}
            </h1>
            <span className="ch-text-muted text-xs shrink-0">·</span>
            <span className="text-xs ch-text-muted truncate">{activeSubject}</span>
          </div>

          {/* Live wall-clock timer jump chip when timer runs in another view */}
          <HeaderRunningTimerChip
            activeTab={activeTab}
            onJumpToMode={(mode) => navigateToTab(mode)}
          />
        </div>

        {/* Right Zone: Theme Switcher + Key Studio Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Classic Glass Theme Switcher */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen((o) => !o)}
              className="ch-btn-secondary flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0"
              title="Switch Classic Glass Theme"
            >
              <Palette className="w-3.5 h-3.5 ch-text-accent shrink-0" />
              <span className="hidden lg:inline">{activeThemeMeta.shortName}</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 ch-glass-modal rounded-2xl p-2 z-50 animate-fade-in">
                <div className="px-2.5 py-1.5 flex items-center justify-between border-b ch-border mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider ch-text-muted">
                    Classic Glass Theme
                  </span>
                  <button
                    onClick={() => {
                      setIsThemeMenuOpen(false);
                      setIsCustomizerOpen(true);
                    }}
                    className="text-[11px] font-semibold ch-text-accent hover:underline"
                  >
                    More options
                  </button>
                </div>
                <div className="space-y-1">
                  {GLASS_THEMES_CATALOG.map((theme) => {
                    const isSelected = theme.id === activeThemeId;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectGlassTheme(theme.id)}
                        className={`w-full flex items-center justify-between gap-2.5 p-2.5 rounded-xl text-left transition-colors ${
                          isSelected ? 'ch-accent-soft' : 'hover:bg-black/5 dark:hover:bg-white/5 ch-text'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-6 h-6 rounded-lg border ch-border-strong shrink-0 flex items-center justify-center"
                            style={{ background: theme.swatchBg }}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: theme.swatchAccent }}
                            />
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{theme.name}</span>
                              {theme.mode === 'light' ? (
                                <Sun className="w-3 h-3 ch-text-muted shrink-0" />
                              ) : (
                                <Moon className="w-3 h-3 ch-text-muted shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Daily Study Check-in Quick Trigger */}
          <button
            type="button"
            onClick={() => setIsCheckInOpen(true)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              dailyCheckIn && dailyCheckIn.date === getTodayDateString()
                ? 'ch-btn-secondary'
                : 'ch-accent-soft'
            }`}
            title={
              dailyCheckIn && dailyCheckIn.date === getTodayDateString()
                ? `Daily Check-in: "${dailyCheckIn.focusWord}"`
                : 'Open Daily Study Check-in (+5 XP)'
            }
          >
            <Compass className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="hidden xl:inline">Check-in</span>
            {(!dailyCheckIn || dailyCheckIn.date !== getTodayDateString()) && (
              <span
                className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                aria-hidden="true"
              />
            )}
          </button>

          {/* Dedicated Background Music Menu */}
          <button
            onClick={() => setIsMusicMenuOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              ambientSound !== 'off' ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
            title="Background Music — YouTube Focus Streams, Saved URLs & Repeat"
          >
            <Music className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="hidden xl:inline">Music</span>
          </button>

          {/* Gift Mailbox */}
          <button
            onClick={() => setIsMailboxOpen(true)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              unclaimedGiftsCount > 0 ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
            title="Gift Mailbox — Open gifts received from friends"
          >
            <Mail className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="hidden xl:inline">Mailbox</span>
            {unclaimedGiftsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-mono text-[10px] font-extrabold tabular-nums leading-tight">
                {unclaimedGiftsCount}
              </span>
            )}
          </button>

          {/* Store */}
          <button
            onClick={() => openUnifiedStore('all')}
            className="ch-accent-soft flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 hover:opacity-90 cursor-pointer"
            title="Store — Avatar Frames, Profile Backgrounds, Avatars & Focus Music"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">Store</span>
            <span className="font-mono text-[11px] font-bold tabular-nums">{wallet.points} XP</span>
          </button>

          {/* Task Designer */}
          <button
            onClick={() => setIsTaskDesignerOpen(true)}
            className="hidden sm:flex ch-btn-secondary items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0"
            title="Study Task Designer & Planner"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="hidden xl:inline">Tasks</span>
          </button>

          <PWAInstallButton variant="header" />

          {/* Zen Study Mode */}
          <button
            onClick={() => setIsZenMode(true)}
            className="ch-btn-secondary flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0"
            title="Distraction-free Zen Fullscreen Mode"
          >
            <Maximize2 className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="hidden xl:inline">Zen</span>
          </button>

          {/* OS PiP Popout */}
          <button
            onClick={() => launchOsPip()}
            className="hidden sm:flex ch-btn-primary items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl whitespace-nowrap shrink-0 shadow-sm"
            title="Pop out floating timer over other applications"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">{isOsPipActive ? 'Floating' : 'Float'}</span>
          </button>

          {/* Mini Widget */}
          <button
            onClick={() => setShowInAppPip(!showInAppPip)}
            className={`hidden xl:flex p-1.5 rounded-xl border transition-colors shrink-0 ${
              showInAppPip ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
            title="Toggle in-app mini floating widget"
          >
            <LayoutTemplate className="w-4 h-4" />
          </button>

          {/* Desktop Companion Panel Toggle */}
          <button
            onClick={() => setShowSidePanel(!showSidePanel)}
            className="hidden lg:flex ch-btn-secondary p-1.5 rounded-xl shrink-0"
            title={showSidePanel ? 'Hide Study Companion Panel' : 'Show Study Companion Panel'}
          >
            {showSidePanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>

          {/* Mobile Companion Drawer Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden ch-btn-secondary p-1.5 rounded-xl shrink-0"
            title="Open Study Companion & Tools"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </header>

      {/* Main Split Glass Workspace */}
      <div className="flex-1 flex min-h-0 w-full max-w-full overflow-hidden">
        {/* Desktop Left Frosted Glass Rail (>= 1024px, fixed to viewport height) */}
        <aside className="hidden lg:flex w-[208px] xl:w-[232px] h-full min-h-0 shrink-0 flex-col justify-between ch-glass-panel border-y-0 border-l-0 p-3 xl:p-3.5 overflow-y-auto">
          <div className="space-y-5">
            {/* Brand Header */}
            <div className="flex items-center justify-between px-2 pt-0.5">
              <button
                onClick={() => navigateToTab('pomodoro')}
                className="flex items-center gap-2.5 text-left"
              >
                <span className="w-8 h-8 rounded-xl ch-btn-primary flex items-center justify-center font-extrabold text-sm shadow-sm">
                  C
                </span>
                <div>
                  <div className="text-base font-extrabold tracking-tight ch-text leading-none">
                    Chronos
                  </div>
                  <div className="text-[11px] ch-text-muted mt-0.5">
                    Study Studio · v{APP_SHORT_VERSION}
                  </div>
                </div>
              </button>
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="p-1.5 rounded-lg ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Customize Workspace"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-4">
              {railNavGroups.map((group) => (
                <div key={group.heading} className="space-y-1">
                  <div className="px-2.5 text-[11px] font-semibold ch-text-muted">
                    {group.heading}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.tab;
                      const showFriendsBadge = item.tab === 'friends' && pendingRequestsCount > 0;
                      return (
                        <button
                          key={item.tab}
                          onClick={() => navigateToTab(item.tab)}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                            isActive
                              ? 'ch-accent-soft font-bold shadow-xs'
                              : 'ch-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:ch-text'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </span>
                          {showFriendsBadge && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono text-[10px] font-extrabold tabular-nums shrink-0">
                              {pendingRequestsCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Profile Shortcut & 1-Click Glass Theme Bar */}
          <div className="pt-3 mt-4 border-t ch-border space-y-3">
            <button
              type="button"
              onClick={() => navigateToTab('profile')}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'ch-accent-soft' : 'ch-btn-secondary'
              }`}
              title="Open Scholar Profile & Account"
            >
              <ScholarAvatar
                displayName={
                  accountProfileMeta.displayName ||
                  currentUser?.displayName ||
                  persistedAuthSession?.displayName ||
                  'Scholar Profile'
                }
                photoURL={currentUser?.photoURL || persistedAuthSession?.photoURL || undefined}
                frameId={wallet.equippedFrame}
                avatarId={wallet.equippedAvatar}
                size="xs"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold ch-text truncate">
                  {accountProfileMeta.displayName ||
                    currentUser?.displayName ||
                    persistedAuthSession?.displayName ||
                    'Scholar Profile'}
                </div>
                <div className="text-[10px] ch-text-muted truncate font-mono tabular-nums">
                  {getScholarRank(wallet.totalPointsEarned).tier} · Lv.
                  {getScholarRank(wallet.totalPointsEarned).level} · {wallet.points} XP
                </div>
              </div>
            </button>

            <div className="space-y-2">
              <div className="px-1 flex items-center justify-between text-[11px] font-semibold ch-text-muted">
                <span>Glass Theme</span>
                <span className="ch-text-accent">{activeThemeMeta.shortName}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {GLASS_THEMES_CATALOG.map((theme) => {
                  const isSelected = theme.id === activeThemeId;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectGlassTheme(theme.id)}
                      title={theme.name}
                      className={`h-8 rounded-xl border transition-all flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-offset-1 ring-amber-400 ch-border-strong' : 'ch-border opacity-80 hover:opacity-100'
                      }`}
                      style={{ background: theme.swatchBg }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: theme.swatchAccent }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Central Feature Viewport */}
        <main className="flex-1 min-w-0 min-h-0 flex overflow-hidden">
          <section className="@container/main flex-1 min-w-0 min-h-0 overflow-y-auto p-3.5 sm:p-5 lg:p-6 xl:p-8 max-w-5xl mx-auto w-full">
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeTab === 'clock' && (
                <ClockView is24Hour={is24Hour} onToggle24Hour={handleToggle24Hour} />
              )}

              {activeTab === 'pomodoro' && <PomodoroView />}

              {activeTab === 'timer' && <CountdownTimerView />}

              {activeTab === 'stopwatch' && <StopwatchView />}

              {activeTab === 'alarms' && (
                <AlarmsView
                  alarms={alarms}
                  onUpdateAlarms={handleUpdateAlarms}
                  is24Hour={is24Hour}
                  onSyncAlarms={
                    currentUser && !currentUser.isAnonymous
                      ? () => void ensureAlarmsLoaded(true)
                      : undefined
                  }
                  isSyncingAlarms={isSyncingAlarms}
                />
              )}

              {activeTab === 'stats' && (
                <DeepWorkStatsView
                  sessions={sessions}
                  onClearSessions={handleClearSessions}
                  onDeleteSession={handleDeleteSession}
                  dailyGoalHours={dailyGoalHours}
                  onUpdateDailyGoal={handleUpdateDailyGoal}
                  subjects={subjects}
                  onOpenSubjectManager={() => setIsSubjectModalOpen(true)}
                  onSyncSessions={
                    currentUser ? () => void ensureSessionsLoaded({ force: true }) : undefined
                  }
                  onLoadMoreCloudSessions={
                    currentUser
                      ? () => void ensureSessionsLoaded({ loadAll: true, force: true })
                      : undefined
                  }
                  hasMoreCloudSessions={hasMoreCloudSessions}
                  isSyncingSessions={isSyncingSessions}
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardView
                  currentUser={currentUser}
                  persistedAuthSession={persistedAuthSession}
                  sessions={sessions}
                  tasks={tasks}
                  wallet={wallet}
                  dailyGoalHours={dailyGoalHours}
                  activeSubject={primaryCourse}
                  dailyCheckIn={dailyCheckIn}
                  accountProfileMeta={accountProfileMeta}
                  authSyncSeq={authSyncSeq}
                  isAutoSyncingRank={isAutoSyncingRank}
                  lastRankSyncAt={lastRankSyncAt}
                  incomingRequests={incomingFriendRequests}
                  outgoingRequests={outgoingFriendRequests}
                  friendships={friendships}
                  onSendFriendRequest={handleSendFriendRequest}
                  onAcceptFriendRequest={handleAcceptFriendRequest}
                  onOpenSendGift={(target) => setGiftRecipient(target)}
                  onNavigateToProfile={() => navigateToTab('profile')}
                  onOpenTierRoadmap={() => setIsTierRoadmapOpen(true)}
                />
              )}

              {activeTab === 'friends' && (
                <FriendsView
                  currentUser={currentUser}
                  persistedAuthSession={persistedAuthSession}
                  wallet={wallet}
                  displayName={
                    accountProfileMeta.displayName ||
                    currentUser?.displayName ||
                    persistedAuthSession?.displayName ||
                    'Study Scholar'
                  }
                  primarySubject={primaryCourse}
                  incomingRequests={incomingFriendRequests}
                  outgoingRequests={outgoingFriendRequests}
                  friendships={friendships}
                  unclaimedGiftsCount={unclaimedGiftsCount}
                  onOpenMailbox={() => setIsMailboxOpen(true)}
                  onOpenSendGift={(target) => setGiftRecipient(target)}
                  onNavigateToProfile={() => navigateToTab('profile')}
                  onNavigateToLeaderboard={() => navigateToTab('leaderboard')}
                  onSendFriendRequest={handleSendFriendRequest}
                  onAcceptFriendRequest={handleAcceptFriendRequest}
                  onDeclineFriendRequest={handleDeclineFriendRequest}
                  onCancelFriendRequest={handleCancelFriendRequest}
                  onRemoveFriendship={handleRemoveFriendship}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  persistedAuthSession={persistedAuthSession}
                  onAuthSessionSaved={(saved) => {
                    explicitSignOutRef.current = false;
                    setPersistedAuthSession(saved);
                    prevAuthUidRef.current = saved.uid;
                    if (saved.dailyTargetHours && saved.dailyTargetHours > 0) {
                      dailyGoalRef.current = saved.dailyTargetHours;
                      setDailyGoalHours(saved.dailyTargetHours);
                    }
                    if (saved.primarySubject) {
                      primaryCourseRef.current = saved.primarySubject;
                      setPrimaryCourse(saved.primarySubject);
                      setActiveSubject(saved.primarySubject);
                    }
                    const nextMeta: AccountProfileMeta = {
                      displayName: saved.displayName,
                      studyLevel: saved.studyLevel,
                      primarySubject: saved.primarySubject,
                      bio: saved.bio,
                    };
                    accountProfileMetaRef.current = nextMeta;
                    setAccountProfileMeta(nextMeta);
                  }}
                  onExplicitSignOut={handleExplicitSignOut}
                  sessions={sessions}
                  onResetAllData={handleResetAllData}
                  dailyGoalHours={dailyGoalHours}
                  onUpdateDailyGoal={handleUpdateDailyGoal}
                  primarySubject={primaryCourse}
                  onUpdatePrimarySubject={handleUpdatePrimaryCourse}
                  subjects={subjects.map((s) => s.name)}
                  onNavigateTab={(tab) => navigateToTab(tab)}
                  wallet={wallet}
                  onWalletUpdated={(updated) => persistWalletState(updated, true)}
                  tasks={tasks}
                  onOpenStore={() => openUnifiedStore('all')}
                  onOpenMusicMenu={() => setIsMusicMenuOpen(true)}
                  onOpenTaskDesigner={() => setIsTaskDesignerOpen(true)}
                  dailyCheckIn={dailyCheckIn}
                  onOpenCheckIn={() => setIsCheckInOpen(true)}
                  checkInSnoozeUntil={checkInSnoozeUntil}
                  onSnoozeCheckIn={handleSnoozeCheckIn}
                  onExpandCheckIn={handleExpandCheckIn}
                  accountProfileMeta={accountProfileMeta}
                  onProfileMetaUpdated={(meta) => {
                    accountProfileMetaRef.current = meta;
                    setAccountProfileMeta(meta);
                    if (meta.primarySubject) {
                      primaryCourseRef.current = meta.primarySubject;
                      setPrimaryCourse(meta.primarySubject);
                    }
                  }}
                  onOpenTierRoadmap={() => setIsTierRoadmapOpen(true)}
                  friendsCount={friendships.length}
                  pendingRequestsCount={pendingRequestsCount}
                  unclaimedGiftsCount={unclaimedGiftsCount}
                  onOpenMailbox={() => setIsMailboxOpen(true)}
                  onToggleCheckInDone={() => {
                    if (dailyCheckIn && dailyCheckIn.date === getTodayDateString()) {
                      const nextCompleted = !dailyCheckIn.completed;
                      const shouldAwardObjectiveXp =
                        nextCompleted && !dailyCheckIn.objectiveXpClaimed;
                      const updated: DailyCheckInData =
                        normalizeDailyCheckIn({
                          ...dailyCheckIn,
                          completed: nextCompleted,
                          checkInXpClaimed: Boolean(dailyCheckIn.checkInXpClaimed),
                          objectiveXpClaimed: Boolean(
                            dailyCheckIn.objectiveXpClaimed || nextCompleted
                          ),
                          updatedAt: Date.now(),
                        }) || {
                          ...dailyCheckIn,
                          completed: nextCompleted,
                          checkInXpClaimed: Boolean(dailyCheckIn.checkInXpClaimed),
                          objectiveXpClaimed: Boolean(
                            dailyCheckIn.objectiveXpClaimed || nextCompleted
                          ),
                          updatedAt: Date.now(),
                        };
                      dailyCheckInRef.current = updated;
                      setDailyCheckIn(updated);
                      saveDailyCheckIn(updated);
                      if (auth.currentUser && !auth.currentUser.isAnonymous) {
                        setDoc(
                          doc(db, 'users', auth.currentUser.uid),
                          stripUndefinedFields({
                            dailyCheckIn: updated,
                            updatedAt: new Date().toISOString(),
                          }),
                          { merge: true }
                        ).catch((err) => {
                          console.warn('Failed to sync daily check-in completion:', err);
                        });
                      }
                      if (shouldAwardObjectiveXp) {
                        handleAwardPoints(15);
                      }
                    }
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  is24Hour={is24Hour}
                  onToggle24Hour={handleToggle24Hour}
                  onNavigateTab={(tab) => navigateToTab(tab)}
                  onResetAllData={handleResetAllData}
                  onOpenCustomizer={() => setIsCustomizerOpen(true)}
                  onOpenUpdateDialog={() => setIsUpdateDialogOpen(true)}
                  glassTheme={activeThemeId}
                  onSelectGlassTheme={handleSelectGlassTheme}
                />
              )}

              {activeTab === 'about' && (
                <AboutView onNavigateTab={(tab) => navigateToTab(tab as AppTab)} />
              )}

              {activeTab === 'updates' && (
                <VersionUpdatesView
                  onNavigateTab={(tab) => navigateToTab(tab)}
                  onOpenStore={() => openUnifiedStore('all')}
                  onOpenTaskDesigner={() => setIsTaskDesignerOpen(true)}
                  onOpenUpdateDialog={() => setIsUpdateDialogOpen(true)}
                />
              )}
            </Suspense>
          </section>

          {/* Right Companion Frosted Panel (>= 1024px, fixed to viewport height) */}
          {showSidePanel && (
            <div className="hidden lg:flex shrink-0 h-full min-h-0">
              <TabletSidePanel
                tasks={tasks}
                onUpdateTasks={handleUpdateTasks}
                alarms={alarms}
                ambientSound={ambientSound}
                onChangeAmbientSound={setAmbientSound}
                ambientVolume={ambientVolume}
                onChangeAmbientVolume={setAmbientVolume}
                todayMinutes={todayMinutes}
                streak={currentStreak}
                activeSubject={activeSubject}
                onOpenStore={(sec) => openUnifiedStore(sec || 'all')}
                onOpenMusicMenu={() => setIsMusicMenuOpen(true)}
                onOpenTaskDesigner={() => setIsTaskDesignerOpen(true)}
                onOpenCustomizer={() => setIsCustomizerOpen(true)}
                onNavigateTab={(tab) => navigateToTab(tab)}
                activeTab={activeTab}
                wallet={wallet}
                customization={customization}
                savedYoutubeTracks={savedYoutubeTracks}
                onUpdateFavorites={handleUpdateFavoriteAudio}
                onSyncTasks={
                  currentUser && !currentUser.isAnonymous
                    ? () => void ensureTasksLoaded(true)
                    : undefined
                }
                isSyncingTasks={isSyncingTasks}
              />
            </div>
          )}
        </main>
      </div>

      {/* MOBILE & TABLET GLASS BOTTOM DOCK (< 1024px, dedicated flex footer — zero content bleed) */}
      <nav className="lg:hidden shrink-0 ch-nav-dock border-t ch-border flex items-center justify-around gap-0.5 z-30 pt-1 [@media(max-height:500px)]:pt-0.5 pb-[calc(env(safe-area-inset-bottom,0px)+5px)] [@media(max-height:500px)]:pb-[calc(env(safe-area-inset-bottom,0px)+2px)] px-1.5 sm:px-3 w-full">
        {(customization.bottomNavTabs || DEFAULT_CUSTOMIZATION.bottomNavTabs).map((tabKey) => {
          const tabMetaMap: Record<AppTab, { label: string; icon: React.FC<{ className?: string }> }> = {
            clock: { label: 'Clock', icon: Clock },
            pomodoro: { label: 'Pomodoro', icon: Timer },
            timer: { label: 'Timer', icon: Hourglass },
            stopwatch: { label: 'Stopwatch', icon: Watch },
            alarms: { label: 'Alarms', icon: Bell },
            stats: { label: 'Deep Work', icon: BarChart2 },
            leaderboard: { label: 'Ranks', icon: Trophy },
            friends: { label: 'Friends', icon: Users },
            profile: { label: 'Profile', icon: UserIcon },
            settings: { label: 'Settings', icon: SlidersHorizontal },
            about: { label: 'About', icon: Info },
            updates: { label: 'Updates', icon: Sparkles },
          };
          const meta = tabMetaMap[tabKey] || tabMetaMap.pomodoro;
          const Icon = meta.icon;
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => navigateToTab(tabKey)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] [@media(max-height:500px)]:min-h-[38px] py-1 [@media(max-height:500px)]:py-0.5 px-1 rounded-xl transition-colors ${
                isActive ? 'ch-accent-soft font-bold' : 'ch-text-muted hover:ch-text'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 shrink-0 [@media(max-height:500px)]:mb-0" />
              <span className="text-[10px] leading-tight tracking-tight truncate max-w-full whitespace-nowrap [@media(max-height:500px)]:text-[9px]">
                {meta.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Companion Drawer (< 1024px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="w-full max-w-sm h-full ch-glass-modal border-y-0 border-r-0 flex flex-col">
            <TabletSidePanel
              tasks={tasks}
              onUpdateTasks={handleUpdateTasks}
              alarms={alarms}
              ambientSound={ambientSound}
              onChangeAmbientSound={setAmbientSound}
              ambientVolume={ambientVolume}
              onChangeAmbientVolume={setAmbientVolume}
              todayMinutes={todayMinutes}
              streak={currentStreak}
              activeSubject={activeSubject}
              onCloseMobile={() => setMobileDrawerOpen(false)}
              onOpenStore={(sec) => {
                setMobileDrawerOpen(false);
                openUnifiedStore(sec || 'all');
              }}
              onOpenMusicMenu={() => {
                setMobileDrawerOpen(false);
                setIsMusicMenuOpen(true);
              }}
              onOpenTaskDesigner={() => {
                setMobileDrawerOpen(false);
                setIsTaskDesignerOpen(true);
              }}
              onOpenCustomizer={() => {
                setMobileDrawerOpen(false);
                setIsCustomizerOpen(true);
              }}
              onNavigateTab={(tab) => {
                setMobileDrawerOpen(false);
                navigateToTab(tab);
              }}
              activeTab={activeTab}
              wallet={wallet}
              customization={customization}
              savedYoutubeTracks={savedYoutubeTracks}
              onUpdateFavorites={handleUpdateFavoriteAudio}
              onSyncTasks={
                currentUser && !currentUser.isAnonymous
                  ? () => void ensureTasksLoaded(true)
                  : undefined
              }
              isSyncingTasks={isSyncingTasks}
            />
          </div>
        </div>
      )}

      {/* Chronos Single Unified Store Modal (Frames, Backgrounds, Avatars & Music) — Lazy & Conditional */}
      {isMusicStoreOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-6xl h-[94dvh] sm:h-[90dvh] ch-glass-modal rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 p-6 shadow-2xl">
                <div className="w-11 h-11 rounded-2xl ch-accent-soft flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-sm font-bold ch-text">Loading Chronos Store…</div>
                <div className="text-xs ch-text-muted">
                  Preparing frames, avatars, backgrounds &amp; focus music
                </div>
              </div>
            </div>
          }
        >
          <FocusMusicStore
            isOpen={isMusicStoreOpen}
            onClose={() => setIsMusicStoreOpen(false)}
            wallet={wallet}
            onWalletUpdated={(updated) => persistWalletState(updated, true)}
            displayName={
              accountProfileMeta.displayName || currentUser?.displayName || 'Study Scholar'
            }
            photoURL={currentUser?.photoURL || undefined}
            initialSection={storeInitialSection}
            onOpenMusicMenu={() => setIsMusicMenuOpen(true)}
            onSelectSound={setAmbientSound}
            ambientVolume={ambientVolume}
          />
        </Suspense>
      )}

      {/* Dedicated Background Music Studio Modal — Lazy & Conditional */}
      {isMusicMenuOpen && (
        <Suspense fallback={null}>
          <BackgroundMusicModal
            isOpen={isMusicMenuOpen}
            onClose={() => setIsMusicMenuOpen(false)}
            activeSound={ambientSound}
            onSelectSound={setAmbientSound}
            ambientVolume={ambientVolume}
            onChangeVolume={setAmbientVolume}
            wallet={wallet}
            onWalletUpdated={(updated) => persistWalletState(updated, true)}
            favoriteTracks={customization.favoriteTracks}
            savedYoutubeTracks={savedYoutubeTracks}
            youtubePlaylists={youtubePlaylists}
            onSaveYoutubeTrack={handleSaveYoutubeTrack}
            onRemoveYoutubeTrack={handleRemoveYoutubeTrack}
            onUpdateYoutubeTrackPlaylist={handleUpdateYoutubeTrackPlaylist}
            onAddYoutubePlaylist={handleAddYoutubePlaylist}
            onRemoveYoutubePlaylist={handleRemoveYoutubePlaylist}
            onOpenStore={(sec) => openUnifiedStore(sec || 'music')}
            onToggleFavorite={(trackId) => {
              const isFav = customization.favoriteTracks.includes(trackId);
              const updatedFavs = isFav
                ? customization.favoriteTracks.filter((t) => t !== trackId)
                : [...customization.favoriteTracks, trackId];
              const updatedCustom: CustomizationSettings = {
                ...customization,
                favoriteTracks: updatedFavs,
              };
              persistCustomizationState(updatedCustom);
            }}
          />
        </Suspense>
      )}

      {/* Scholar Tier & Level Roadmap Modal */}
      {isTierRoadmapOpen && (
        <Suspense fallback={null}>
          <TierRoadmapModal
            isOpen={isTierRoadmapOpen}
            onClose={() => setIsTierRoadmapOpen(false)}
            totalPointsEarned={wallet.totalPointsEarned}
          />
        </Suspense>
      )}

      {/* Study Task Designer Modal */}
      {isTaskDesignerOpen && (
        <Suspense fallback={null}>
          <TaskDesignerModal
            isOpen={isTaskDesignerOpen}
            onClose={() => setIsTaskDesignerOpen(false)}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            subjects={subjects}
            activeSubject={activeSubject}
            onStartFocusWithTask={handleStartFocusWithTask}
          />
        </Suspense>
      )}

      {/* In-App Floating Mini Widget */}
      {showInAppPip && (
        <Suspense fallback={null}>
          <FloatingPipWidget
            onExpandToMain={() => {
              setShowInAppPip(false);
              navigateToTab(activeMode);
            }}
          />
        </Suspense>
      )}

      {/* Zen Fullscreen Study Mode Overlay */}
      {isZenMode && (
        <Suspense fallback={null}>
          <ZenStudyMode
            onExit={() => setIsZenMode(false)}
            ambientSound={ambientSound}
            onChangeAmbientSound={setAmbientSound}
          />
        </Suspense>
      )}

      {/* Active Alarm Ringing Modal */}
      {ringingAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md ch-glass-modal rounded-3xl p-8 text-center space-y-6 border-amber-500/50">
            <div className="w-16 h-16 rounded-full ch-accent-soft mx-auto flex items-center justify-center animate-bounce">
              <Bell className="w-8 h-8 fill-current" />
            </div>

            <div>
              <div className="font-mono text-5xl font-extrabold ch-text tabular-nums">
                {ringingAlarm.time}
              </div>
              <h3 className="text-xl font-bold ch-text-accent mt-2">{ringingAlarm.label}</h3>
              <p className="text-xs ch-text-muted mt-1">Study Alert · {ringingAlarm.category}</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={dismissRingingAlarm}
                className="w-full py-3.5 px-6 ch-btn-primary rounded-xl text-sm shadow-lg"
              >
                Dismiss Alarm
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => snoozeRingingAlarm(5)}
                  className="ch-btn-secondary py-2.5 px-4 font-semibold rounded-xl text-xs"
                >
                  Snooze 5 Min
                </button>
                <button
                  onClick={() => snoozeRingingAlarm(10)}
                  className="ch-btn-secondary py-2.5 px-4 font-semibold rounded-xl text-xs"
                >
                  Snooze 10 Min
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Manager Modal */}
      {isSubjectModalOpen && (
        <Suspense fallback={null}>
          <SubjectManagerModal
            isOpen={isSubjectModalOpen}
            onClose={() => setIsSubjectModalOpen(false)}
            subjects={subjects}
            onUpdateSubjects={updateSubjects}
            activeSubject={activeSubject}
            onSelectActiveSubject={setActiveSubject}
            sessions={sessions}
          />
        </Suspense>
      )}

      {/* Daily Study Check-in Modal */}
      {isCheckInOpen && (
        <DailyCheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          existingCheckIn={dailyCheckIn}
          snoozeUntil={checkInSnoozeUntil}
          onSnooze={handleSnoozeCheckIn}
          onSave={(checkInData) => {
            const activeToday = getTodayDateString();
            const existingToday =
              dailyCheckInRef.current && dailyCheckInRef.current.date === activeToday
                ? dailyCheckInRef.current
                : null;
            const shouldAwardCheckInXp = !existingToday?.checkInXpClaimed;
            const savedData: DailyCheckInData =
              normalizeDailyCheckIn({
                ...checkInData,
                date: activeToday,
                completed: Boolean(checkInData.completed),
                checkInXpClaimed: true,
                objectiveXpClaimed: Boolean(
                  checkInData.objectiveXpClaimed || existingToday?.objectiveXpClaimed
                ),
                reflectionNotes: checkInData.reflectionNotes || '',
                updatedAt: Date.now(),
              }) || {
                ...checkInData,
                date: activeToday,
                completed: Boolean(checkInData.completed),
                checkInXpClaimed: true,
                objectiveXpClaimed: Boolean(
                  checkInData.objectiveXpClaimed || existingToday?.objectiveXpClaimed
                ),
                reflectionNotes: checkInData.reflectionNotes || '',
                updatedAt: Date.now(),
              };

            clearCheckInSnooze();
            setCheckInSnoozeUntil(null);
            dailyCheckInRef.current = savedData;
            setDailyCheckIn(savedData);
            saveDailyCheckIn(savedData);

            let nextWallet = walletRef.current;
            if (shouldAwardCheckInXp) {
              nextWallet = awardChronosPoints(5);
              persistWalletState(nextWallet, true);
            }

            if (auth.currentUser && !auth.currentUser.isAnonymous) {
              setDoc(
                doc(db, 'users', auth.currentUser.uid),
                stripUndefinedFields({
                  dailyCheckIn: savedData,
                  updatedAt: new Date().toISOString(),
                }),
                { merge: true }
              ).catch((err) => {
                console.warn('Failed to save daily check-in to cloud:', err);
              });
              if (!shouldAwardCheckInXp) {
                syncPublicLeaderboardProfile({
                  user: auth.currentUser,
                  sessions: sessionsRef.current,
                  tasks: tasksRef.current,
                  wallet: nextWallet,
                  dailyGoalHours: dailyGoalRef.current,
                  activeSubject: primaryCourseRef.current,
                  dailyCheckIn: savedData,
                  profileOverride: accountProfileMetaRef.current,
                }).catch(() => {});
              }
            }
          }}
        />
      )}

      {/* UI & Workspace Customization Modal */}
      {isCustomizerOpen && (
        <Suspense fallback={null}>
          <CustomizationModal
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            settings={customization}
            onSaveSettings={(newSettings) => {
              persistCustomizationState(newSettings);
            }}
          />
        </Suspense>
      )}

      {/* Gift Mailbox Modal (Unbox & Claim Sent Cosmetics) */}
      {isMailboxOpen && (
        <Suspense fallback={null}>
          <GiftMailboxModal
            isOpen={isMailboxOpen}
            onClose={() => setIsMailboxOpen(false)}
            receivedGifts={receivedGifts}
            sentGifts={sentGifts}
            isGuest={
              !(
                (currentUser && !currentUser.isAnonymous) ||
                (persistedAuthSession && !persistedAuthSession.isAnonymous)
              )
            }
            onNavigateToProfile={() => navigateToTab('profile')}
            onOpenFriends={() => navigateToTab('friends')}
            onClaimGift={handleClaimGift}
          />
        </Suspense>
      )}

      {/* Send Gift Using Own XP Modal */}
      {giftRecipient && (
        <Suspense fallback={null}>
          <SendGiftModal
            isOpen={Boolean(giftRecipient)}
            onClose={() => setGiftRecipient(null)}
            recipient={giftRecipient}
            wallet={wallet}
            onSendGift={handleSendGift}
          />
        </Suspense>
      )}

      {/* Version Update ("What's New") Dialog */}
      {isUpdateDialogOpen && (
        <Suspense fallback={null}>
          <VersionUpdateDialog
            isOpen={isUpdateDialogOpen}
            onClose={handleCloseUpdateDialog}
            onOpenStore={() => openUnifiedStore('all')}
            onOpenFriends={() => navigateToTab('friends')}
            onOpenChangelog={() => navigateToTab('updates')}
          />
        </Suspense>
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <TimerProvider onSessionComplete={() => {}}>
      <MainContent />
    </TimerProvider>
  );
}
