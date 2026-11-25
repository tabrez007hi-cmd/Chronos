import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Flame,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  GraduationCap,
  Headphones,
  Layers,
  Coins,
  Bell,
  Watch,
  SlidersHorizontal,
  Crown,
  LayoutGrid,
  List,
  BarChart2,
  Trophy,
  Compass,
  Edit3,
  ChevronRight,
  Frame,
  Minimize2,
  Maximize2,
  Music,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  googleProvider,
  db,
  handleFirestoreError,
  OperationType,
  signInAnonymously,
} from '../services/firebase';
import {
  DeepWorkSession,
  AppTab,
  ChronosWallet,
  StudyTask,
  DailyCheckInData,
  PersistedAuthSession,
} from '../types';
import {
  loadGuestProfile,
  saveGuestProfile,
  loadPersistedAuthSession,
  savePersistedAuthSession,
  clearPersistedAuthSession,
  GuestProfileData,
  computeChronosAchievements,
  getScholarRank,
  getStoreFrameById,
  getStoreBackgroundById,
  getStoreAvatarById,
  STORE_FRAMES_CATALOG,
  STORE_BACKGROUNDS_CATALOG,
  STORE_AVATARS_CATALOG,
  equipStoreCosmetic,
  formatRemainingSnooze,
  computeScholarDigitId,
  getTodayDateString,
} from '../utils/storage';
import { VisualAchievementBadge } from './VisualAchievementBadge';
import { AccountProfileMeta, syncPublicLeaderboardProfile } from '../services/leaderboard';
import { ProfileBannerBackdrop, RankTierBadge, ScholarAvatar } from './ScholarCosmetics';

interface ProfileViewProps {
  currentUser: User | null;
  persistedAuthSession?: PersistedAuthSession | null;
  onAuthSessionSaved?: (session: PersistedAuthSession) => void;
  onExplicitSignOut?: () => Promise<void> | void;
  sessions: DeepWorkSession[];
  onResetAllData: () => void;
  dailyGoalHours: number;
  onUpdateDailyGoal: (hours: number) => void;
  primarySubject: string;
  onUpdatePrimarySubject: (subject: string) => void;
  subjects: string[];
  onNavigateTab?: (tab: AppTab) => void;
  wallet: ChronosWallet;
  onWalletUpdated?: (wallet: ChronosWallet) => void;
  tasks: StudyTask[];
  onOpenStore?: () => void;
  onOpenMusicMenu?: () => void;
  onOpenTaskDesigner?: () => void;
  dailyCheckIn?: DailyCheckInData | null;
  onOpenCheckIn?: () => void;
  onToggleCheckInDone?: () => void;
  checkInSnoozeUntil?: number | null;
  onSnoozeCheckIn?: (hours: number) => void;
  onExpandCheckIn?: () => void;
  accountProfileMeta?: AccountProfileMeta;
  onProfileMetaUpdated?: (meta: AccountProfileMeta) => void;
  onOpenTierRoadmap?: () => void;
  friendsCount?: number;
  pendingRequestsCount?: number;
  unclaimedGiftsCount?: number;
  onOpenMailbox?: () => void;
}

const STUDY_LEVELS = [
  'Undergraduate / College',
  'Graduate / Master / PhD',
  'High School Scholar',
  'Medical / Law / Professional',
  'Self-Taught Engineer / Developer',
  'Competitive Exam Aspirant',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  persistedAuthSession = null,
  onAuthSessionSaved,
  onExplicitSignOut,
  sessions,
  onResetAllData: _onResetAllData,
  dailyGoalHours,
  onUpdateDailyGoal,
  primarySubject,
  onUpdatePrimarySubject,
  subjects,
  onNavigateTab,
  wallet,
  onWalletUpdated,
  tasks,
  onOpenStore,
  onOpenMusicMenu,
  onOpenTaskDesigner,
  dailyCheckIn,
  onOpenCheckIn,
  onToggleCheckInDone,
  checkInSnoozeUntil,
  onSnoozeCheckIn,
  onExpandCheckIn,
  accountProfileMeta,
  onProfileMetaUpdated,
  onOpenTierRoadmap,
  friendsCount = 0,
  pendingRequestsCount = 0,
  unclaimedGiftsCount = 0,
  onOpenMailbox,
}) => {
  const effectiveFirebaseUser =
    currentUser && !currentUser.isAnonymous ? currentUser : null;
  const activeSavedSession =
    persistedAuthSession && !persistedAuthSession.isAnonymous
      ? persistedAuthSession
      : null;
  const isGuestUser = !effectiveFirebaseUser && !activeSavedSession;
  const myScholarUid = effectiveFirebaseUser?.uid || activeSavedSession?.uid || null;
  const myScholarId =
    !isGuestUser && myScholarUid
      ? activeSavedSession?.scholarId || computeScholarDigitId(myScholarUid)
      : null;

  const activeTodayCheckIn =
    dailyCheckIn && dailyCheckIn.date === getTodayDateString() ? dailyCheckIn : null;

  const [copiedMyId, setCopiedMyId] = useState<boolean>(false);
  const [guestProfile, setGuestProfile] = useState<GuestProfileData>(() => loadGuestProfile());

  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const [isEditingGuest, setIsEditingGuest] = useState<boolean>(false);
  const [guestNameInput, setGuestNameInput] = useState<string>(
    accountProfileMeta?.displayName ||
      effectiveFirebaseUser?.displayName ||
      activeSavedSession?.displayName ||
      guestProfile.displayName
  );
  const [guestBioInput, setGuestBioInput] = useState<string>(
    accountProfileMeta?.bio ?? activeSavedSession?.bio ?? guestProfile.bio
  );
  const [guestLevelInput, setGuestLevelInput] = useState<string>(
    accountProfileMeta?.studyLevel || activeSavedSession?.studyLevel || guestProfile.studyLevel
  );
  const [savedAccountName, setSavedAccountName] = useState<string | undefined>(
    accountProfileMeta?.displayName ||
      effectiveFirebaseUser?.displayName ||
      activeSavedSession?.displayName
  );
  const [goalDraft, setGoalDraft] = useState<string>(String(dailyGoalHours));

  const [achievementCategory, setAchievementCategory] = useState<string>('all');
  const [badgeViewMode, setBadgeViewMode] = useState<'medallions' | 'list'>('medallions');
  const [showCheckInSnoozeMenu, setShowCheckInSnoozeMenu] = useState<boolean>(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState<boolean>(false);
  const [wardrobeCategory, setWardrobeCategory] = useState<'frames' | 'backgrounds' | 'avatars'>('frames');

  useEffect(() => {
    setGoalDraft(String(dailyGoalHours));
  }, [dailyGoalHours]);

  useEffect(() => {
    if (!isGuestUser) {
      const resolvedName =
        accountProfileMeta?.displayName ||
        effectiveFirebaseUser?.displayName ||
        activeSavedSession?.displayName ||
        effectiveFirebaseUser?.email?.split('@')[0] ||
        activeSavedSession?.email?.split('@')[0] ||
        'Study Scholar';
      setSavedAccountName(resolvedName);
      setGuestNameInput(resolvedName);
      if (accountProfileMeta?.studyLevel || activeSavedSession?.studyLevel) {
        setGuestLevelInput(
          accountProfileMeta?.studyLevel || activeSavedSession?.studyLevel || STUDY_LEVELS[0]
        );
      }
      if (accountProfileMeta?.bio !== undefined || activeSavedSession?.bio !== undefined) {
        setGuestBioInput(accountProfileMeta?.bio ?? activeSavedSession?.bio ?? '');
      }
    } else {
      const localGuest = loadGuestProfile();
      setGuestProfile(localGuest);
      setGuestNameInput(localGuest.displayName);
      setGuestLevelInput(localGuest.studyLevel);
      setGuestBioInput(localGuest.bio);
      setSavedAccountName(undefined);
    }
  }, [isGuestUser, effectiveFirebaseUser, activeSavedSession, accountProfileMeta]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setFormSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const existingSnap = await getDoc(userDocRef);
      const fallbackName =
        user.displayName || user.email?.split('@')[0] || 'Study Scholar';

      let resolvedName = fallbackName;
      let resolvedGoal = dailyGoalHours;
      let resolvedSubject = primarySubject;
      let resolvedLevel = guestLevelInput;
      let resolvedBio = guestBioInput;

      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        const existingName =
          typeof existingData.displayName === 'string'
            ? existingData.displayName.trim()
            : '';
        resolvedName =
          existingName && existingName !== 'Guest Scholar' ? existingName : fallbackName;
        if (typeof existingData.dailyTargetHours === 'number' && existingData.dailyTargetHours > 0) {
          resolvedGoal = existingData.dailyTargetHours;
        }
        if (typeof existingData.primarySubject === 'string' && existingData.primarySubject.trim()) {
          resolvedSubject = existingData.primarySubject.trim();
        }
        if (typeof existingData.studyLevel === 'string' && existingData.studyLevel.trim()) {
          resolvedLevel = existingData.studyLevel.trim();
        }
        if (typeof existingData.bio === 'string') {
          resolvedBio = existingData.bio;
        }
        const patch: Record<string, unknown> = {
          id: user.uid,
          email: user.email || existingData.email || '',
          updatedAt: new Date().toISOString(),
        };
        if (!existingName || existingName === 'Guest Scholar') {
          patch.displayName = fallbackName;
        }
        await setDoc(userDocRef, patch, { merge: true });
      } else {
        await setDoc(
          userDocRef,
          {
            id: user.uid,
            displayName: fallbackName,
            email: user.email || '',
            dailyTargetHours: dailyGoalHours,
            primarySubject: primarySubject,
            studyLevel: guestLevelInput,
            bio: guestBioInput,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      const persisted: PersistedAuthSession = {
        uid: user.uid,
        scholarId: computeScholarDigitId(user.uid),
        email: user.email || '',
        displayName: resolvedName,
        photoURL: user.photoURL || undefined,
        providerId: user.providerData?.[0]?.providerId || 'google.com',
        isAnonymous: false,
        dailyTargetHours: resolvedGoal,
        primarySubject: resolvedSubject,
        studyLevel: resolvedLevel,
        bio: resolvedBio,
        signedInAt: Date.now(),
        lastVerifiedAt: Date.now(),
      };
      savePersistedAuthSession(persisted);
      onAuthSessionSaved?.(persisted);
    } catch (err: unknown) {
      console.warn('Google sign in notice:', err);
      let message = 'Google sign-in was blocked or cancelled.';
      if (err instanceof Error) {
        if (err.message.includes('popup-blocked')) {
          message =
            'Chrome blocked the sign-in pop-up. Please click the pop-up icon in Chrome address bar to allow pop-ups, or continue as Guest Scholar.';
        } else if (err.message.includes('unauthorized-domain')) {
          message =
            'This domain is not in Firebase authorized domains list. You can browse and study freely in Guest Mode or sign in with email.';
        } else if (err.message.includes('popup-closed-by-user')) {
          message = 'Sign-in was cancelled before completion.';
        } else {
          message = err.message;
        }
      }
      setAuthError(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setAuthError(null);
    setFormSubmitting(true);
    try {
      await signInAnonymously(auth);
    } catch {
      // Local Guest mode works even if offline
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput || !passwordInput) return;

    setFormSubmitting(true);
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        const chosenName =
          nameInput.trim() || emailInput.trim().split('@')[0] || 'Study Scholar';
        await updateProfile(cred.user, { displayName: chosenName });
        const userDocRef = doc(db, 'users', cred.user.uid);
        await setDoc(
          userDocRef,
          {
            id: cred.user.uid,
            displayName: chosenName,
            email: cred.user.email || '',
            dailyTargetHours: dailyGoalHours,
            primarySubject: primarySubject,
            studyLevel: guestLevelInput,
            bio: guestBioInput,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        const persisted: PersistedAuthSession = {
          uid: cred.user.uid,
          scholarId: computeScholarDigitId(cred.user.uid),
          email: cred.user.email || emailInput.trim(),
          displayName: chosenName,
          photoURL: cred.user.photoURL || undefined,
          providerId: 'password',
          isAnonymous: false,
          dailyTargetHours: dailyGoalHours,
          primarySubject: primarySubject,
          studyLevel: guestLevelInput,
          bio: guestBioInput,
          signedInAt: Date.now(),
          lastVerifiedAt: Date.now(),
        };
        savePersistedAuthSession(persisted);
        onAuthSessionSaved?.(persisted);
      } else {
        const cred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        const user = cred.user;
        const persisted: PersistedAuthSession = {
          uid: user.uid,
          scholarId: computeScholarDigitId(user.uid),
          email: user.email || emailInput.trim(),
          displayName: user.displayName || user.email?.split('@')[0] || 'Study Scholar',
          photoURL: user.photoURL || undefined,
          providerId: 'password',
          isAnonymous: false,
          dailyTargetHours: dailyGoalHours,
          primarySubject: primarySubject,
          studyLevel: guestLevelInput,
          bio: guestBioInput,
          signedInAt: Date.now(),
          lastVerifiedAt: Date.now(),
        };
        savePersistedAuthSession(persisted);
        onAuthSessionSaved?.(persisted);
      }
      setEmailInput('');
      setPasswordInput('');
      setNameInput('');
    } catch (err: unknown) {
      console.warn('Email auth result:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err instanceof Error) {
        if (err.message.includes('auth/operation-not-allowed')) {
          const chosenName = nameInput.trim() || emailInput.trim().split('@')[0] || 'Study Scholar';
          const localScholar: GuestProfileData = {
            displayName: chosenName,
            dailyTargetHours: dailyGoalHours,
            primarySubject,
            studyLevel: guestLevelInput,
            bio: guestBioInput || `Scholar · ${emailInput.trim()}`,
            avatarSeed: chosenName[0].toUpperCase(),
          };
          setGuestProfile(localScholar);
          saveGuestProfile(localScholar);
          setGuestNameInput(chosenName);
          setEmailInput('');
          setPasswordInput('');
          setNameInput('');
          setAuthError(
            'Notice: Email/Password provider is currently not enabled in Firebase project. We have activated your Scholar Profile locally with complete persistence!'
          );
          setFormSubmitting(false);
          return;
        } else if (
          err.message.includes('auth/wrong-password') ||
          err.message.includes('auth/invalid-credential')
        ) {
          msg = 'Incorrect email or password. Please try again.';
        } else if (err.message.includes('auth/email-already-in-use')) {
          msg = 'An account with this email already exists. Try signing in.';
        } else if (err.message.includes('auth/weak-password')) {
          msg = 'Password should be at least 6 characters.';
        } else if (err.message.includes('auth/invalid-email')) {
          msg = 'Please enter a valid email address.';
        } else {
          msg = err.message;
        }
      }
      setAuthError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    setIsEditingGuest(false);
    if (onExplicitSignOut) {
      await onExplicitSignOut();
    } else {
      clearPersistedAuthSession();
      await signOut(auth).catch(() => {});
    }
    const localGuest = loadGuestProfile();
    setGuestProfile(localGuest);
    setGuestNameInput(localGuest.displayName);
    setGuestLevelInput(localGuest.studyLevel);
    setGuestBioInput(localGuest.bio);
    setSavedAccountName(undefined);
  };

  const handleSavePreferences = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    if (!isGuestUser) {
      const typedName = guestNameInput.trim();
      const fallbackAuthName =
        effectiveFirebaseUser?.displayName ||
        activeSavedSession?.displayName ||
        effectiveFirebaseUser?.email?.split('@')[0] ||
        activeSavedSession?.email?.split('@')[0] ||
        'Study Scholar';
      const resolvedDisplayName =
        typedName && typedName !== 'Guest Scholar' ? typedName : fallbackAuthName;

      setIsEditingGuest(false);
      setGuestNameInput(resolvedDisplayName);
      setSavedAccountName(resolvedDisplayName);

      const nextMeta: AccountProfileMeta = {
        displayName: resolvedDisplayName,
        studyLevel: guestLevelInput,
        primarySubject,
        bio: guestBioInput.trim(),
      };
      onProfileMetaUpdated?.(nextMeta);

      const existingSaved = activeSavedSession || loadPersistedAuthSession();
      const sessionUid = effectiveFirebaseUser?.uid || existingSaved?.uid;
      if (sessionUid) {
        const updatedSession: PersistedAuthSession = {
          uid: sessionUid,
          scholarId: computeScholarDigitId(sessionUid),
          email: effectiveFirebaseUser?.email || existingSaved?.email || '',
          displayName: resolvedDisplayName,
          photoURL: effectiveFirebaseUser?.photoURL || existingSaved?.photoURL,
          providerId:
            effectiveFirebaseUser?.providerData?.[0]?.providerId || existingSaved?.providerId,
          isAnonymous: false,
          dailyTargetHours: dailyGoalHours,
          primarySubject,
          studyLevel: guestLevelInput,
          bio: guestBioInput.trim(),
          signedInAt: existingSaved?.signedInAt || Date.now(),
          lastVerifiedAt: Date.now(),
        };
        savePersistedAuthSession(updatedSession);
        onAuthSessionSaved?.(updatedSession);
      }

      const liveUser =
        auth.currentUser && !auth.currentUser.isAnonymous ? auth.currentUser : effectiveFirebaseUser;
      if (!liveUser) {
        setTimeout(() => {
          setIsSyncing(false);
          setSyncSuccess(true);
          setTimeout(() => setSyncSuccess(false), 2500);
        }, 250);
        return;
      }

      try {
        if (resolvedDisplayName !== liveUser.displayName) {
          await updateProfile(liveUser, { displayName: resolvedDisplayName }).catch(() => {});
        }
        const userDocRef = doc(db, 'users', liveUser.uid);
        await setDoc(
          userDocRef,
          {
            displayName: resolvedDisplayName,
            dailyTargetHours: dailyGoalHours,
            primarySubject,
            studyLevel: guestLevelInput,
            bio: guestBioInput.trim(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        await syncPublicLeaderboardProfile({
          user: liveUser,
          sessions,
          tasks,
          wallet,
          dailyGoalHours,
          activeSubject: primarySubject,
          dailyCheckIn: dailyCheckIn || null,
          profileOverride: nextMeta,
          throwOnError: true,
          forceOverwrite: true,
        });
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 2500);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${liveUser.uid}`);
      } finally {
        setIsSyncing(false);
      }
      return;
    }

    const updatedGuest: GuestProfileData = {
      displayName: guestNameInput.trim() || 'Guest Scholar',
      dailyTargetHours: dailyGoalHours,
      primarySubject,
      studyLevel: guestLevelInput,
      bio: guestBioInput.trim(),
      avatarSeed: (guestNameInput.trim() || 'G')[0].toUpperCase(),
    };
    setGuestProfile(updatedGuest);
    saveGuestProfile(updatedGuest);
    setIsEditingGuest(false);
    onProfileMetaUpdated?.({
      displayName: updatedGuest.displayName,
      studyLevel: updatedGuest.studyLevel,
      primarySubject,
      bio: updatedGuest.bio,
    });

    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    }, 350);
  };

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedSessionsCount = sessions.filter((s) => s.completed).length;

  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayMins = sessions
      .filter((s) => s.timestamp >= dayStart && s.timestamp < dayEnd)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    if (dayMins >= 25) {
      currentStreak += 1;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  const scholarRank = getScholarRank(wallet.totalPointsEarned);
  const allAchievements = computeChronosAchievements(
    sessions,
    tasks,
    wallet,
    currentStreak,
    dailyGoalHours
  );

  const filteredAchievements = allAchievements.filter((a) => {
    if (achievementCategory === 'all') return true;
    if (achievementCategory === 'unlocked') return a.unlocked;
    if (achievementCategory === 'locked') return !a.unlocked;
    return a.category === achievementCategory;
  });

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
  const badge100Hours = allAchievements.find((a) => a.id === 'hours_100') || allAchievements[0];
  const badge7DayStreak =
    allAchievements.find((a) => a.id === 'streak_7_days') || allAchievements[1];

  const activePhotoURL =
    effectiveFirebaseUser?.photoURL || activeSavedSession?.photoURL || undefined;
  const activeDisplayName = isGuestUser
    ? guestProfile.displayName
    : savedAccountName ||
      accountProfileMeta?.displayName ||
      effectiveFirebaseUser?.displayName ||
      activeSavedSession?.displayName ||
      effectiveFirebaseUser?.email?.split('@')[0] ||
      activeSavedSession?.email?.split('@')[0] ||
      'Study Scholar';

  const hasCustomBanner = wallet.equippedBackground !== 'default';
  const equippedFrameMeta = getStoreFrameById(wallet.equippedFrame);
  const equippedBgMeta = getStoreBackgroundById(wallet.equippedBackground);
  const equippedAvatarMeta = getStoreAvatarById(wallet.equippedAvatar);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto pb-12 w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight ch-text">
              Scholar Profile &amp; Badges
            </h2>
            <span className="text-xs ch-text-accent font-mono font-semibold">· v1.6</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Academic standing, multi-tier rank divisions, cosmetic loadout, and milestone medals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl ch-accent-soft">
            <Coins className="w-4 h-4 shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-bold tabular-nums">
              {wallet.points.toLocaleString()} XP
            </span>
          </div>

          {!isGuestUser && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ch-btn-secondary hover:text-rose-500 rounded-xl whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Study Check-in Accountability Card (Redesigned & Fully Responsive) */}
      {checkInSnoozeUntil && checkInSnoozeUntil > Date.now() ? (
        <div className="rounded-2xl px-4 py-3.5 ch-glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 ch-text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold ch-text truncate">
                Daily Study Check-in minimized
              </div>
              <div className="text-[11px] font-mono ch-text-muted tabular-nums">
                Reminds in {formatRemainingSnooze(checkInSnoozeUntil)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
            {onExpandCheckIn && (
              <button
                type="button"
                onClick={onExpandCheckIn}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer min-h-[38px]"
              >
                <Maximize2 className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                <span>Expand</span>
              </button>
            )}
            {onOpenCheckIn && (
              <button
                type="button"
                onClick={onOpenCheckIn}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold ch-accent-soft rounded-xl whitespace-nowrap cursor-pointer min-h-[38px]"
              >
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span>Open Check-in</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl ch-glass-card p-4 sm:p-6 space-y-4">
          {/* Top Metadata & Utility Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b ch-border">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
                <Compass className="w-3.5 h-3.5 ch-text-accent" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap min-w-0 text-xs">
                <span className="font-bold ch-text whitespace-nowrap">
                  Today&apos;s Study Check-in
                </span>
                {activeTodayCheckIn?.date && (
                  <>
                    <span className="ch-text-muted" aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] ch-text-muted tabular-nums whitespace-nowrap">
                      {activeTodayCheckIn.date}
                    </span>
                  </>
                )}
                {activeTodayCheckIn?.energyLevel && (
                  <>
                    <span className="ch-text-muted hidden xs:inline" aria-hidden="true">·</span>
                    <span className="text-[11px] ch-text-muted capitalize whitespace-nowrap">
                      Energy: <span className="font-semibold ch-text">{activeTodayCheckIn.energyLevel}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {onSnoozeCheckIn && (
              <button
                type="button"
                onClick={() => setShowCheckInSnoozeMenu((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  showCheckInSnoozeMenu ? 'ch-accent-soft' : 'ch-btn-secondary'
                }`}
                title="Minimize check-in banner for a few hours"
              >
                <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                <span>{showCheckInSnoozeMenu ? 'Hide Timer' : 'Minimize'}</span>
              </button>
            )}
          </div>

          {/* Inline Responsive Snooze Bar (zero layout jump or overflow on mobile) */}
          {showCheckInSnoozeMenu && onSnoozeCheckIn && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-xl ch-glass-subtle animate-fade-in">
              <span className="text-xs font-medium ch-text-secondary">
                Minimize check-in banner for:
              </span>
              <div className="flex items-center gap-1.5">
                {[2, 4, 8, 12].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => {
                      onSnoozeCheckIn(hrs);
                      setShowCheckInSnoozeMenu(false);
                    }}
                    className="px-2.5 py-1.5 text-xs font-mono font-bold ch-accent-soft rounded-lg cursor-pointer hover:brightness-110 tabular-nums"
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Body + Responsive Action Cluster */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              {activeTodayCheckIn ? (
                <>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-medium ch-text-muted">Focus Word</div>
                    <div className="text-xl sm:text-2xl font-extrabold tracking-tight ch-text-accent font-mono break-words">
                      &ldquo;{activeTodayCheckIn.focusWord}&rdquo;
                    </div>
                  </div>

                  <div className="pt-2 border-t ch-border space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Primary Objective
                      </span>
                      <span className="ch-text-muted font-medium">
                        {activeTodayCheckIn.completed ? 'Completed · +15 XP' : 'Active today'}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed break-words ${
                        activeTodayCheckIn.completed
                          ? 'line-through ch-text-muted'
                          : 'ch-text font-medium'
                      }`}
                    >
                      {activeTodayCheckIn.primaryObjective}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-bold ch-text">
                    Set Your Daily Study Anchor
                  </h4>
                  <p className="text-xs sm:text-sm ch-text-muted leading-relaxed max-w-2xl">
                    Choose one driving focus word and a single non-negotiable objective before
                    starting your focus sessions (+5 XP once per day).
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons: Clean 2-col touch grid on mobile, inline row on sm/lg */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto pt-1 lg:pt-0">
              {activeTodayCheckIn && onToggleCheckInDone && (
                <button
                  type="button"
                  onClick={onToggleCheckInDone}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer min-h-[40px] ${
                    activeTodayCheckIn.completed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                      : 'ch-btn-secondary'
                  }`}
                  title="Mark daily primary objective as accomplished"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{activeTodayCheckIn.completed ? 'Objective Crushed' : 'Mark Crushed'}</span>
                </button>
              )}

              {onOpenCheckIn && (
                <button
                  type="button"
                  onClick={onOpenCheckIn}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs ch-btn-primary rounded-xl whitespace-nowrap cursor-pointer min-h-[40px] shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeTodayCheckIn ? 'Edit Check-in' : 'Set Today’s Check-in'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Utilities Hub */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider ch-text-muted">
          Quick Utilities &amp; Features
        </h3>

        <div className="grid grid-cols-2 @md/main:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('stats')}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl ch-accent-soft flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Deep Work</div>
              <div className="text-[10px] ch-text-muted">Day/Wk/Mo/Yr Graphs</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('leaderboard')}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl ch-accent-soft flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Leaderboard</div>
              <div className="text-[10px] ch-text-muted">Daily, Weekly, Year</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('friends')}
            className="relative p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            {pendingRequestsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono text-[10px] font-extrabold tabular-nums">
                {pendingRequestsCount}
              </span>
            )}
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Friends &amp; ID</div>
              <div className="text-[10px] ch-text-muted">
                {isGuestUser
                  ? 'Find Scholars by ID'
                  : `${friendsCount} friend${friendsCount === 1 ? '' : 's'}${
                      pendingRequestsCount > 0 ? ` · ${pendingRequestsCount} req` : ''
                    }`}
              </div>
            </div>
          </button>

          {onOpenMailbox && (
            <button
              type="button"
              onClick={onOpenMailbox}
              className="relative p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
            >
              {unclaimedGiftsCount > 0 && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-mono text-[10px] font-extrabold tabular-nums">
                  {unclaimedGiftsCount}
                </span>
              )}
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold ch-text">Gift Mailbox</div>
                <div className="text-[10px] ch-text-muted">
                  {unclaimedGiftsCount > 0
                    ? `${unclaimedGiftsCount} gift${unclaimedGiftsCount === 1 ? '' : 's'} waiting`
                    : 'Claim Frames & Banners'}
                </div>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenStore}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl ch-accent-soft flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Store</div>
              <div className="text-[10px] ch-text-muted">Frames, Banners, Avatars &amp; Music</div>
            </div>
          </button>

          {onOpenMusicMenu && (
            <button
              type="button"
              onClick={onOpenMusicMenu}
              className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl ch-accent-soft flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold ch-text">Background Music</div>
                <div className="text-[10px] ch-text-muted">YouTube, Saved &amp; Repeat</div>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenTaskDesigner}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Task Planner</div>
              <div className="text-[10px] ch-text-muted">Objectives &amp; Badges</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('alarms')}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Study Alarms</div>
              <div className="text-[10px] ch-text-muted">Chimes &amp; Reminders</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('stopwatch')}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Watch className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Stopwatch</div>
              <div className="text-[10px] ch-text-muted">Split Laps &amp; CSV</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('settings')}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl ch-accent-soft flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">Settings</div>
              <div className="text-[10px] ch-text-muted">Timings &amp; Themes</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('updates')}
            className="p-3.5 rounded-2xl ch-glass-card text-left transition-all group flex flex-col justify-between hover:brightness-105 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold ch-text">What&apos;s New</div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                v1.6 Release
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Profile Grid: Identity, Tier & Preferences */}
      <div className="grid grid-cols-1 @3xl/main:grid-cols-3 gap-6">
        <div className="@3xl/main:col-span-2 space-y-6">
          {/* Identity, Banner & Scholar Tier Card */}
          <div className="rounded-3xl ch-glass-card overflow-hidden">
            {/* Showcase Banner Region */}
            <div
              className={`relative overflow-hidden p-6 ch-protected-asset ${
                hasCustomBanner ? 'text-white' : ''
              }`}
              style={hasCustomBanner ? { backgroundColor: '#090b10' } : undefined}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <ProfileBannerBackdrop backgroundId={wallet.equippedBackground} />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <ScholarAvatar
                  displayName={activeDisplayName}
                  photoURL={activePhotoURL}
                  frameId={wallet.equippedFrame}
                  avatarId={wallet.equippedAvatar}
                  size="lg"
                  showFrameBadge
                />

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-lg sm:text-xl font-bold truncate ${
                        hasCustomBanner ? 'text-white' : 'ch-text'
                      }`}
                    >
                      {activeDisplayName}
                    </h3>
                    <RankTierBadge totalPointsEarned={wallet.totalPointsEarned} />
                    {myScholarId && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(myScholarId).catch(() => {});
                          setCopiedMyId(true);
                          setTimeout(() => setCopiedMyId(false), 1800);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                          hasCustomBanner
                            ? 'bg-black/35 border-white/25 text-white hover:bg-black/55'
                            : 'ch-glass-subtle border-[var(--ch-border)] ch-text hover:brightness-105'
                        }`}
                        title="Share your 8-digit Scholar ID so friends can find you"
                      >
                        <span>ID #{myScholarId}</span>
                        {copiedMyId ? (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-75 shrink-0" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs flex-wrap ${
                      hasCustomBanner ? 'text-white/80' : 'ch-text-muted'
                    }`}
                  >
                    <span className="font-mono font-semibold text-amber-400">
                      {scholarRank.title}
                    </span>
                    <span>·</span>
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>{guestLevelInput || 'Undergraduate / College'}</span>
                    <span>·</span>
                    <span
                      className={`font-medium ${
                        hasCustomBanner ? 'text-amber-300' : 'ch-text-accent'
                      }`}
                    >
                      {primarySubject}
                    </span>
                  </div>

                  <p
                    className={`text-xs italic line-clamp-2 ${
                      hasCustomBanner ? 'text-white/85' : 'ch-text-secondary'
                    }`}
                  >
                    &ldquo;{guestBioInput || guestProfile.bio}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 border-t ch-border">
              {/* Scholar Tier & Level Dual Progress Bars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider ch-text-muted flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 ch-text-accent" />
                    <span>Rank Progression · {scholarRank.tier} (Lv.{scholarRank.level})</span>
                  </span>
                  {onOpenTierRoadmap && (
                    <button
                      type="button"
                      onClick={onOpenTierRoadmap}
                      className="text-xs ch-text-accent hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View All Tiers &amp; Levels</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Division Progress */}
                  <div className="p-3 rounded-2xl ch-glass-subtle space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] tabular-nums">
                      <span className="ch-text-muted">Next: {scholarRank.nextTierLabel}</span>
                      <span className="font-mono font-bold ch-text-accent">
                        {scholarRank.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${scholarRank.gradientClass} transition-all duration-500`}
                        style={{ width: `${Math.max(4, scholarRank.progressPercent)}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono ch-text-muted tabular-nums">
                      {wallet.totalPointsEarned.toLocaleString()} /{' '}
                      {scholarRank.nextTierPoints.toLocaleString()} Lifetime XP
                    </div>
                  </div>

                  {/* Study Level Progress */}
                  <div className="p-3 rounded-2xl ch-glass-subtle space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] tabular-nums">
                      <span className="ch-text-muted">Study Level {scholarRank.level}</span>
                      <span className="font-mono font-bold ch-text">
                        {scholarRank.xpIntoLevel} / {scholarRank.xpForNextLevel} XP
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, scholarRank.levelProgressPercent)}%`,
                          backgroundColor: 'var(--ch-accent)',
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-mono ch-text-muted">
                      {scholarRank.levelProgressPercent}% toward Level {scholarRank.level + 1}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipped Cosmetic Loadout & Owned Wardrobe */}
              <div className="p-3.5 rounded-2xl ch-glass-subtle space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Frame className="w-4 h-4 ch-text-accent shrink-0" />
                    <div className="min-w-0 text-xs">
                      <div className="font-bold ch-text">Equipped Cosmetic Loadout</div>
                      <div className="text-[11px] ch-text-muted truncate">
                        {equippedFrameMeta.name} · {equippedBgMeta.name} · {equippedAvatarMeta.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {onWalletUpdated && (
                      <button
                        type="button"
                        onClick={() => setIsWardrobeOpen((v) => !v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                          isWardrobeOpen ? 'ch-btn-primary' : 'ch-btn-secondary'
                        }`}
                      >
                        {isWardrobeOpen ? 'Close Wardrobe' : 'My Wardrobe'}
                      </button>
                    )}
                    {onOpenStore && (
                      <button
                        type="button"
                        onClick={onOpenStore}
                        className="px-3.5 py-1.5 rounded-xl ch-accent-soft text-xs font-bold shrink-0 cursor-pointer hover:brightness-105"
                      >
                        Visit Store
                      </button>
                    )}
                  </div>
                </div>

                {isWardrobeOpen && onWalletUpdated && (() => {
                  const ownedFrames = STORE_FRAMES_CATALOG.filter(
                    (f) => f.costPoints === 0 || wallet.unlockedFrames.includes(f.id)
                  );
                  const ownedBgs = STORE_BACKGROUNDS_CATALOG.filter(
                    (b) => b.costPoints === 0 || wallet.unlockedBackgrounds.includes(b.id)
                  );
                  const ownedAvs = STORE_AVATARS_CATALOG.filter(
                    (a) => a.costPoints === 0 || wallet.unlockedAvatars.includes(a.id)
                  );
                  return (
                    <div className="pt-3 border-t ch-border space-y-3 animate-fade-in">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(
                          [
                            { id: 'frames', label: `Frames (${ownedFrames.length})` },
                            { id: 'backgrounds', label: `Backgrounds (${ownedBgs.length})` },
                            { id: 'avatars', label: `Avatars (${ownedAvs.length})` },
                          ] as { id: 'frames' | 'backgrounds' | 'avatars'; label: string }[]
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setWardrobeCategory(t.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                              wardrobeCategory === t.id ? 'ch-btn-primary' : 'ch-btn-secondary'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-0.5">
                        {wardrobeCategory === 'frames' &&
                          ownedFrames.map((f) => {
                            const active = wallet.equippedFrame === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => onWalletUpdated(equipStoreCosmetic('frame', f.id))}
                                className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                                  active ? 'ch-accent-soft' : 'ch-glass-card hover:border-[var(--ch-border-strong)]'
                                }`}
                              >
                                <div className="text-xs font-bold ch-text truncate">{f.name}</div>
                                <div className="text-[10px] ch-text-muted">
                                  {active ? 'Equipped' : 'Tap to equip'}
                                </div>
                              </button>
                            );
                          })}

                        {wardrobeCategory === 'backgrounds' &&
                          ownedBgs.map((b) => {
                            const active = wallet.equippedBackground === b.id;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => onWalletUpdated(equipStoreCosmetic('background', b.id))}
                                className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                                  active ? 'ch-accent-soft' : 'ch-glass-card hover:border-[var(--ch-border-strong)]'
                                }`}
                              >
                                <div className="text-xs font-bold ch-text truncate">{b.name}</div>
                                <div className="text-[10px] ch-text-muted">
                                  {active ? 'Equipped' : 'Tap to equip'}
                                </div>
                              </button>
                            );
                          })}

                        {wardrobeCategory === 'avatars' &&
                          ownedAvs.map((a) => {
                            const active = wallet.equippedAvatar === a.id;
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => onWalletUpdated(equipStoreCosmetic('avatar', a.id))}
                                className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                                  active ? 'ch-accent-soft' : 'ch-glass-card hover:border-[var(--ch-border-strong)]'
                                }`}
                              >
                                <div className="text-xs font-bold ch-text truncate">{a.name}</div>
                                <div className="text-[10px] ch-text-muted">
                                  {active ? 'Equipped' : 'Tap to equip'}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Profile Details & Daily Goals */}
              <div className="pt-3 border-t ch-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider ch-text-muted">
                    Profile Details &amp; Daily Goals
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingGuest(!isEditingGuest)}
                    className="text-xs ch-text-accent hover:underline font-semibold cursor-pointer"
                  >
                    {isEditingGuest ? 'Close Editor' : 'Edit Details'}
                  </button>
                </div>

                {isEditingGuest && (
                  <div className="space-y-3 p-4 rounded-xl ch-glass-subtle animate-fade-in">
                    <div>
                      <label className="text-xs ch-text-muted block mb-1">Your Name</label>
                      <input
                        type="text"
                        value={guestNameInput}
                        onChange={(e) => setGuestNameInput(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-3 py-2 text-xs ch-input rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs ch-text-muted block mb-1">Study Level / Track</label>
                      <select
                        value={guestLevelInput}
                        onChange={(e) => setGuestLevelInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs ch-input rounded-lg"
                      >
                        {STUDY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs ch-text-muted block mb-1">
                        Motivation Motto / Bio
                      </label>
                      <input
                        type="text"
                        value={guestBioInput}
                        onChange={(e) => setGuestBioInput(e.target.value)}
                        placeholder="e.g. Focus on the journey, results will follow."
                        className="w-full px-3 py-2 text-xs ch-input rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs ch-text-muted block mb-1">
                      Daily Focus Goal (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="16"
                      value={goalDraft}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setGoalDraft(raw);
                        const parsed = parseFloat(raw);
                        if (Number.isFinite(parsed) && parsed >= 0.5 && parsed <= 16) {
                          onUpdateDailyGoal(parsed);
                        }
                      }}
                      onBlur={() => {
                        const parsed = parseFloat(goalDraft);
                        const clamped = Number.isFinite(parsed)
                          ? Math.max(0.5, Math.min(16, Math.round(parsed * 2) / 2))
                          : 4;
                        setGoalDraft(String(clamped));
                        onUpdateDailyGoal(clamped);
                      }}
                      className="w-full px-3 py-2 text-sm font-mono ch-input rounded-lg"
                    />
                    <span className="text-[10px] ch-text-muted mt-1 block">
                      +25 Focus XP bonus awarded when reaching daily target
                    </span>
                  </div>

                  <div>
                    <label className="text-xs ch-text-muted block mb-1">
                      Primary Course / Subject
                    </label>
                    <select
                      value={primarySubject}
                      onChange={(e) => onUpdatePrimarySubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm ch-input rounded-lg"
                    >
                      {(subjects.includes(primarySubject)
                        ? subjects
                        : [primarySubject, ...subjects]
                      ).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] ch-text-muted mt-1 block">
                      Default subject for new Pomodoro &amp; Countdown blocks
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
                  <div className="text-xs ch-text-muted">
                    {syncSuccess ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Profile changes saved successfully!
                      </span>
                    ) : isGuestUser ? (
                      'Guest profile active — local data preserved'
                    ) : effectiveFirebaseUser ? (
                      'Synchronized with Cloud Firestore & local storage'
                    ) : (
                      'Signed-in session active — saved in local storage'
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    disabled={isSyncing}
                    className="px-4 py-2 text-xs ch-btn-primary rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {isSyncing ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Upgrade / Authentication Panel */}
          {isGuestUser ? (
            <div className="p-6 rounded-3xl ch-glass-card space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold ch-text">
                    {isRegistering
                      ? 'Create Student Cloud Account'
                      : 'Optional Cloud Sync & Sign-In'}
                  </h3>
                  <span className="text-[11px] font-mono ch-text-muted">· Optional</span>
                </div>
                <p className="text-xs ch-text-secondary mt-1">
                  You are currently browsing as a <strong>Guest Scholar</strong> with complete access
                  to all study features. Sign in anytime to sync progress &amp; Store unlocks across devices.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={formSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 border border-black/10 font-bold text-xs transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-black/10 dark:bg-white/10" />
                <span className="text-[11px] uppercase tracking-wider ch-text-muted font-semibold">
                  Or Email / Guest
                </span>
                <div className="flex-1 h-[1px] bg-black/10 dark:bg-white/10" />
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl ch-accent-soft text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 ch-text-accent mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold ch-text">Notice:</p>
                    <p className="ch-text-secondary">{authError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {isRegistering && (
                  <div>
                    <label className="text-xs ch-text-muted block mb-1">Your Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 ch-text-muted absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-9 pr-3 py-2 text-xs ch-input rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs ch-text-muted block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 ch-text-muted absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      placeholder="student@university.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs ch-input rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs ch-text-muted block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 ch-text-muted absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs ch-input rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl ch-btn-primary text-xs disabled:opacity-50 mt-1 cursor-pointer"
                >
                  {formSubmitting
                    ? 'Processing...'
                    : isRegistering
                    ? 'Create Student Account'
                    : 'Sign In with Email'}
                </button>
              </form>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError(null);
                  }}
                  className="text-xs ch-text-accent hover:underline font-medium cursor-pointer"
                >
                  {isRegistering
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Create one"}
                </button>

                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="text-xs ch-text-muted hover:ch-text cursor-pointer"
                >
                  Stay as Guest
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Verified Study Record Stats */}
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl ch-glass-card space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider ch-text-muted">
              Verified Study Record
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl ch-glass-subtle">
                <div className="flex items-center gap-2 text-xs ch-text-secondary">
                  <Clock className="w-4 h-4 ch-text-accent shrink-0" />
                  <span>Total Deep Work</span>
                </div>
                <span className="font-mono font-bold text-sm ch-text tabular-nums">
                  {totalHours} hrs
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl ch-glass-subtle">
                <div className="flex items-center gap-2 text-xs ch-text-secondary">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Completed Sprints</span>
                </div>
                <span className="font-mono font-bold text-sm ch-text tabular-nums">
                  {completedSessionsCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl ch-glass-subtle">
                <div className="flex items-center gap-2 text-xs ch-text-secondary">
                  <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 shrink-0" />
                  <span>Current Streak</span>
                </div>
                <span className="font-mono font-bold text-sm ch-text tabular-nums">
                  {currentStreak} days
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl ch-glass-subtle">
                <div className="flex items-center gap-2 text-xs ch-text-secondary">
                  <Coins className="w-4 h-4 ch-text-accent shrink-0" />
                  <span>Spendable Store XP</span>
                </div>
                <span className="font-mono font-bold text-sm ch-text-accent tabular-nums">
                  {wallet.points.toLocaleString()} XP
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl ch-glass-subtle">
                <div className="flex items-center gap-2 text-xs ch-text-secondary">
                  <Crown className="w-4 h-4 ch-text-accent shrink-0" />
                  <span>Lifetime Rank XP</span>
                </div>
                <span className="font-mono font-bold text-sm ch-text tabular-nums">
                  {wallet.totalPointsEarned.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Signature Milestones */}
      <div className="p-5 sm:p-6 rounded-3xl ch-glass-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 ch-text-accent" />
              <h3 className="text-sm sm:text-base font-bold ch-text">
                Prestigious Signature Milestones
              </h3>
            </div>
            <p className="text-xs ch-text-muted">
              Rare milestone seals granted for extraordinary discipline and consistency
            </p>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-wider ch-text-accent font-bold">
            High-Honor Seals
          </span>
        </div>

        <div className="grid grid-cols-1 @2xl/main:grid-cols-2 gap-4 pt-1">
          {/* Card 1: 100 Hours Studied */}
          <div className="p-4 rounded-2xl ch-glass-subtle flex items-center gap-4 overflow-hidden">
            <div className="w-18 sm:w-20 shrink-0 flex items-center justify-center">
              <VisualAchievementBadge achievement={badge100Hours} size="md" sealOnly />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
                  MYTHIC MEDALLION
                </span>
                <span className="ch-text-muted">·</span>
                <span className="text-xs font-mono font-bold ch-text-accent tabular-nums">
                  +1000 XP
                </span>
              </div>
              <h4 className="text-sm font-bold ch-text leading-tight">
                The Century Club: 100 Hours Studied
              </h4>
              <p className="text-[11px] ch-text-muted leading-snug">
                Accumulate 100 verified hours (6,000 minutes) of deep cognitive study.
              </p>
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] ch-text-muted font-mono mb-1 tabular-nums">
                  <span>Current: {badge100Hours.progressText}</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-300">
                    {badge100Hours.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-500"
                    style={{ width: `${badge100Hours.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 7-Day Streak */}
          <div className="p-4 rounded-2xl ch-glass-subtle flex items-center gap-4 overflow-hidden">
            <div className="w-18 sm:w-20 shrink-0 flex items-center justify-center">
              <VisualAchievementBadge achievement={badge7DayStreak} size="md" sealOnly />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider ch-text-accent">
                  LEGENDARY MEDALLION
                </span>
                <span className="ch-text-muted">·</span>
                <span className="text-xs font-mono font-bold ch-text-accent tabular-nums">
                  +400 XP
                </span>
              </div>
              <h4 className="text-sm font-bold ch-text leading-tight">
                Week Warrior: 7-Day Study Streak
              </h4>
              <p className="text-[11px] ch-text-muted leading-snug">
                Maintain 7 continuous days of uninterrupted deep study sessions.
              </p>
              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] ch-text-muted font-mono mb-1 tabular-nums">
                  <span>Current: {badge7DayStreak.progressText}</span>
                  <span className="font-bold ch-text-accent">
                    {badge7DayStreak.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${badge7DayStreak.progressPercent}%`,
                      backgroundColor: 'var(--ch-accent)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Achievement Medallions Gallery */}
      <div className="p-5 sm:p-6 rounded-3xl ch-glass-card space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 ch-text-accent" />
              <h3 className="text-base font-bold ch-text">
                Milestone Badges &amp; Medallions ({unlockedCount}/{allAchievements.length})
              </h3>
            </div>
            <p className="text-xs ch-text-muted">
              Click any medallion to inspect lore, milestone requirements, and focus XP rewards
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 ch-glass-subtle rounded-xl">
            <button
              type="button"
              onClick={() => setBadgeViewMode('medallions')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                badgeViewMode === 'medallions'
                  ? 'ch-btn-primary shadow-sm'
                  : 'ch-text-muted hover:ch-text'
              }`}
              title="Showcase Gallery View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Medallions</span>
            </button>
            <button
              type="button"
              onClick={() => setBadgeViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                badgeViewMode === 'list'
                  ? 'ch-btn-primary shadow-sm'
                  : 'ch-text-muted hover:ch-text'
              }`}
              title="Detailed List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">List View</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Medallions' },
            { id: 'unlocked', label: 'Unlocked' },
            { id: 'hours', label: 'Study Hours' },
            { id: 'streak', label: 'Streaks' },
            { id: 'sprint', label: 'Pomodoros' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'scholar', label: 'Scholar Habits' },
            { id: 'store', label: 'Store & Music' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setAchievementCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                achievementCategory === cat.id
                  ? 'ch-btn-primary font-bold'
                  : 'ch-btn-secondary font-semibold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {badgeViewMode === 'medallions' ? (
          <div className="grid grid-cols-2 @md/main:grid-cols-3 @2xl/main:grid-cols-4 @4xl/main:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
            {filteredAchievements.map((item) => (
              <VisualAchievementBadge key={item.id} achievement={item} size="md" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAchievements.map((item) => (
              <div
                key={item.id}
                className={`p-3 sm:p-4 rounded-2xl ch-glass-subtle flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 overflow-hidden ${
                  !item.unlocked ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-16 shrink-0 flex items-center justify-center">
                    <VisualAchievementBadge
                      achievement={item}
                      size="sm"
                      sealOnly
                      showDetailsModalOnClick={true}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold ch-text leading-snug">{item.title}</span>
                      <span className="text-[10px] font-mono ch-text-accent font-semibold shrink-0 tabular-nums">
                        +{item.pointsReward} XP
                      </span>
                    </div>
                    <p className="text-[11px] ch-text-secondary mt-0.5 line-clamp-2">{item.desc}</p>
                    <span className="text-[10px] ch-text-muted font-mono mt-1 block tabular-nums">
                      {item.progressText}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-auto">
                  {item.unlocked ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono ch-text-muted tabular-nums">
                      {item.progressPercent}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
