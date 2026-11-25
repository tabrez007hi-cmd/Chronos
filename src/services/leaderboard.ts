import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  ChronosWallet,
  DailyCheckInData,
  DeepWorkSession,
  PersistedAuthSession,
  PublicLeaderboardEntry,
  StudyTask,
} from '../types';
import {
  computeChronosAchievements,
  computeScholarDigitId,
  getScholarRank,
  getTodayDateString,
  loadGuestProfile,
} from '../utils/storage';

export interface AccountProfileMeta {
  displayName?: string;
  studyLevel?: string;
  primarySubject?: string;
  bio?: string;
}

export function getCurrentWeekKey(date: Date = new Date()): string {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getCurrentYearKey(date: Date = new Date()): string {
  return String(date.getFullYear());
}

export function computeUserPeriodMetrics(sessions: DeepWorkSession[]) {
  const now = new Date();
  const dayKey = getTodayDateString();
  const weekKey = getCurrentWeekKey(now);
  const yearKey = getCurrentYearKey(now);

  let dailyMinutes = 0;
  let weeklyMinutes = 0;
  let yearlyMinutes = 0;
  let totalMinutes = 0;

  for (const s of sessions) {
    const rawMins = Number(s.durationMinutes);
    const mins = Number.isFinite(rawMins) ? Math.max(0, Math.round(rawMins)) : 0;
    totalMinutes += mins;
    const d = new Date(s.timestamp || Date.now());
    const sDayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const sWeekKey = getCurrentWeekKey(d);
    const sYearKey = String(d.getFullYear());

    if (sDayKey === dayKey) dailyMinutes += mins;
    if (sWeekKey === weekKey) weeklyMinutes += mins;
    if (sYearKey === yearKey) yearlyMinutes += mins;
  }

  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const dayMins = sessions
      .filter((s) => s.timestamp >= dayStart && s.timestamp < dayEnd)
      .reduce((acc, s) => {
        const m = Number(s.durationMinutes);
        return acc + (Number.isFinite(m) ? Math.max(0, m) : 0);
      }, 0);

    if (dayMins >= 25) {
      streakDays += 1;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  // 1 point per focused minute challenge economy
  const dailyPoints = dailyMinutes;
  const weeklyPoints = weeklyMinutes;
  const yearlyPoints = yearlyMinutes;

  return {
    dayKey,
    weekKey,
    yearKey,
    dailyMinutes: Math.min(1440, dailyMinutes),
    dailyPoints: Math.min(100000, dailyPoints),
    weeklyMinutes: Math.min(10080, weeklyMinutes),
    weeklyPoints: Math.min(500000, weeklyPoints),
    yearlyMinutes: Math.min(527040, yearlyMinutes),
    yearlyPoints: Math.min(10000000, yearlyPoints),
    totalMinutes: Math.min(10000000, totalMinutes),
    streakDays: Math.min(10000, streakDays),
  };
}

export function buildLocalPublicProfile(params: {
  user: User | null;
  persistedSession?: PersistedAuthSession | null;
  sessions: DeepWorkSession[];
  tasks: StudyTask[];
  wallet: ChronosWallet;
  dailyGoalHours: number;
  activeSubject: string;
  dailyCheckIn: DailyCheckInData | null;
  profileOverride?: AccountProfileMeta;
}): PublicLeaderboardEntry {
  const {
    user,
    persistedSession,
    sessions,
    tasks,
    wallet,
    dailyGoalHours,
    activeSubject,
    dailyCheckIn,
    profileOverride,
  } = params;
  const guest = loadGuestProfile();
  const metrics = computeUserPeriodMetrics(sessions);
  const rawTotalEarned = Number(wallet.totalPointsEarned);
  const safeTotalEarned = Number.isFinite(rawTotalEarned)
    ? Math.max(0, Math.min(10000000, Math.round(rawTotalEarned)))
    : 0;
  const rank = getScholarRank(safeTotalEarned);
  const achievements = computeChronosAchievements(
    sessions,
    tasks,
    wallet,
    metrics.streakDays,
    dailyGoalHours
  );
  const unlockedBadgesCount = achievements.filter((a) => a.unlocked).length;

  const activeUid =
    user && !user.isAnonymous
      ? user.uid
      : persistedSession && !persistedSession.isAnonymous
      ? persistedSession.uid
      : null;
  const isGuest = !activeUid;
  const overrideName =
    profileOverride?.displayName && profileOverride.displayName.trim() !== 'Guest Scholar'
      ? profileOverride.displayName.trim()
      : '';
  const localGuestName =
    guest.displayName && guest.displayName.trim() !== 'Guest Scholar'
      ? guest.displayName.trim()
      : '';

  const rawName = isGuest
    ? guest.displayName || 'Guest Scholar'
    : overrideName ||
      user?.displayName ||
      persistedSession?.displayName ||
      user?.email?.split('@')[0] ||
      persistedSession?.email?.split('@')[0] ||
      localGuestName ||
      'Study Scholar';

  const resolvedLevel = isGuest
    ? guest.studyLevel || 'Undergraduate / College'
    : profileOverride?.studyLevel ||
      persistedSession?.studyLevel ||
      guest.studyLevel ||
      'Undergraduate / College';

  const resolvedSubject =
    (!isGuest
      ? profileOverride?.primarySubject?.trim() || persistedSession?.primarySubject?.trim()
      : guest.primarySubject?.trim()) ||
    profileOverride?.primarySubject?.trim() ||
    guest.primarySubject?.trim() ||
    activeSubject?.trim() ||
    'General';

  const resolvedBio = isGuest
    ? guest.bio || 'Focused deep study on Chronos.'
    : profileOverride?.bio ??
      persistedSession?.bio ??
      (guest.bio || 'Focused deep study on Chronos.');

  const safeFrame = (wallet.equippedFrame || 'default').slice(0, 40);
  const safeBg = (wallet.equippedBackground || 'default').slice(0, 40);
  const safeAvatar = (wallet.equippedAvatar || 'default').slice(0, 40);

  const resolvedPhotoURL = user?.photoURL || persistedSession?.photoURL;

  const entry: PublicLeaderboardEntry = {
    userId: activeUid || 'local-scholar',
    scholarId: activeUid ? computeScholarDigitId(activeUid) : undefined,
    isPublic: true,
    displayName: rawName.trim().slice(0, 60) || 'Study Scholar',
    studyLevel: resolvedLevel.trim().slice(0, 60),
    primarySubject: resolvedSubject.trim().slice(0, 50) || 'General',
    bio: resolvedBio.trim().slice(0, 160),
    rankTitle: rank.title.slice(0, 40),
    rankTier: rank.tier.slice(0, 20),
    equippedFrame: safeFrame,
    equippedBackground: safeBg,
    equippedAvatar: safeAvatar,
    totalPointsEarned: safeTotalEarned,
    totalMinutes: metrics.totalMinutes,
    streakDays: metrics.streakDays,
    unlockedBadgesCount: Math.max(0, Math.min(100, unlockedBadgesCount)),
    dayKey: metrics.dayKey,
    dailyMinutes: metrics.dailyMinutes,
    dailyPoints: metrics.dailyPoints,
    weekKey: metrics.weekKey,
    weeklyMinutes: metrics.weeklyMinutes,
    weeklyPoints: metrics.weeklyPoints,
    yearKey: metrics.yearKey,
    yearlyMinutes: metrics.yearlyMinutes,
    yearlyPoints: metrics.yearlyPoints,
    isGuest,
  };

  if (resolvedPhotoURL && resolvedPhotoURL.length <= 350) {
    entry.photoURL = resolvedPhotoURL;
  }
  if (dailyCheckIn?.date === metrics.dayKey && dailyCheckIn.focusWord) {
    entry.focusWord = dailyCheckIn.focusWord.trim().slice(0, 32);
  }

  return entry;
}

export async function removeGuestLeaderboardEntry(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'publicLeaderboard', uid));
  } catch {
    // Ignore if doc does not exist or rules disallow
  }
}

export function stripUndefinedFields<T extends Record<string, unknown>>(obj: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned as T;
}

export async function syncPublicLeaderboardProfile(params: {
  user: User;
  sessions: DeepWorkSession[];
  tasks: StudyTask[];
  wallet: ChronosWallet;
  dailyGoalHours: number;
  activeSubject: string;
  dailyCheckIn: DailyCheckInData | null;
  profileOverride?: AccountProfileMeta;
  throwOnError?: boolean;
  forceOverwrite?: boolean;
}): Promise<boolean> {
  if (!params.user || params.user.isAnonymous) {
    return false;
  }
  const path = `publicLeaderboard/${params.user.uid}`;
  let entry = buildLocalPublicProfile(params);

  try {
    // Anti-downgrade guard: on automatic/boot syncs, never overwrite a newer/higher
    // cloud standing from another active browser when this browser has empty/older sessions.
    if (!params.forceOverwrite) {
      try {
        const docRef = doc(db, 'publicLeaderboard', params.user.uid);
        const existingSnap = await getDocFromServer(docRef).catch(() => getDoc(docRef));
        if (existingSnap.exists()) {
          const cloud = existingSnap.data() as Partial<PublicLeaderboardEntry>;
          const sameDayHigher =
            cloud.dayKey === entry.dayKey &&
            Number(cloud.dailyMinutes || 0) > entry.dailyMinutes;
          const sameWeekHigher =
            cloud.weekKey === entry.weekKey &&
            Number(cloud.weeklyMinutes || 0) > entry.weeklyMinutes;
          const sameYearHigher =
            cloud.yearKey === entry.yearKey &&
            Number(cloud.yearlyMinutes || 0) > entry.yearlyMinutes;
          const totalHigher = Number(cloud.totalMinutes || 0) > entry.totalMinutes;

          if (sameDayHigher || sameWeekHigher || sameYearHigher || totalHigher) {
            const mergedTotalPointsEarned = Math.max(
              entry.totalPointsEarned,
              Number(cloud.totalPointsEarned || 0)
            );
            const mergedRank = getScholarRank(mergedTotalPointsEarned);
            entry = {
              ...entry,
              rankTitle: mergedRank.title.slice(0, 40),
              rankTier: mergedRank.tier.slice(0, 20),
              dailyMinutes:
                cloud.dayKey === entry.dayKey
                  ? Math.max(entry.dailyMinutes, Number(cloud.dailyMinutes || 0))
                  : entry.dailyMinutes,
              dailyPoints:
                cloud.dayKey === entry.dayKey
                  ? Math.max(entry.dailyPoints, Number(cloud.dailyPoints || 0))
                  : entry.dailyPoints,
              weeklyMinutes:
                cloud.weekKey === entry.weekKey
                  ? Math.max(entry.weeklyMinutes, Number(cloud.weeklyMinutes || 0))
                  : entry.weeklyMinutes,
              weeklyPoints:
                cloud.weekKey === entry.weekKey
                  ? Math.max(entry.weeklyPoints, Number(cloud.weeklyPoints || 0))
                  : entry.weeklyPoints,
              yearlyMinutes:
                cloud.yearKey === entry.yearKey
                  ? Math.max(entry.yearlyMinutes, Number(cloud.yearlyMinutes || 0))
                  : entry.yearlyMinutes,
              yearlyPoints:
                cloud.yearKey === entry.yearKey
                  ? Math.max(entry.yearlyPoints, Number(cloud.yearlyPoints || 0))
                  : entry.yearlyPoints,
              totalMinutes: Math.max(entry.totalMinutes, Number(cloud.totalMinutes || 0)),
              totalPointsEarned: mergedTotalPointsEarned,
              streakDays: Math.max(entry.streakDays, Number(cloud.streakDays || 0)),
              unlockedBadgesCount: Math.max(
                entry.unlockedBadgesCount,
                Number(cloud.unlockedBadgesCount || 0)
              ),
            };
          }
        }
      } catch {
        // Proceed if server check unavailable
      }
    }

    const payload = stripUndefinedFields<Record<string, unknown>>({
      ...entry,
      userId: params.user.uid,
      scholarId: computeScholarDigitId(params.user.uid),
      isPublic: true,
      isGuest: false,
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'publicLeaderboard', params.user.uid), payload, { merge: true });
    invalidateLeaderboardCache();
    return true;
  } catch (err) {
    if (params.throwOnError) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } else {
      console.warn('Public leaderboard background sync notice:', err);
    }
    return false;
  }
}

export interface LeaderboardPageResult {
  entries: PublicLeaderboardEntry[];
  hasMore: boolean;
}

const LEADERBOARD_CACHE_TTL_MS = 30_000;
let cachedLeaderboard: {
  entries: PublicLeaderboardEntry[];
  hasMore: boolean;
  pageLimit: number;
  fetchedAt: number;
} | null = null;
let orderedQuerySupported: boolean | null = null;

export function invalidateLeaderboardCache(): void {
  cachedLeaderboard = null;
}

export function getCachedLeaderboardSnapshot(pageLimit: number): LeaderboardPageResult | null {
  if (!cachedLeaderboard) return null;
  if (Date.now() - cachedLeaderboard.fetchedAt > LEADERBOARD_CACHE_TTL_MS) return null;
  if (cachedLeaderboard.pageLimit < pageLimit && cachedLeaderboard.hasMore) return null;
  return {
    entries: cachedLeaderboard.entries,
    hasMore: cachedLeaderboard.hasMore,
  };
}

export async function fetchPublicLeaderboardPage(
  maxResults: number = 25,
  forceRefresh: boolean = false
): Promise<LeaderboardPageResult> {
  if (!forceRefresh) {
    const hit = getCachedLeaderboardSnapshot(maxResults);
    if (hit) return hit;
  }

  try {
    const colRef = collection(db, 'publicLeaderboard');
    const fetchLimit = Math.max(1, maxResults) + 1;
    let snap;

    if (orderedQuerySupported !== false) {
      try {
        const orderedQ = query(
          colRef,
          where('isPublic', '==', true),
          orderBy('totalPointsEarned', 'desc'),
          limit(fetchLimit)
        );
        snap = await getDocsFromServer(orderedQ).catch(() => getDocs(orderedQ));
        orderedQuerySupported = true;
      } catch (orderErr) {
        const msg = orderErr instanceof Error ? orderErr.message : String(orderErr);
        if (msg.includes('index') || msg.includes('failed-precondition')) {
          orderedQuerySupported = false;
        }
        const basicQ = query(colRef, where('isPublic', '==', true), limit(fetchLimit));
        snap = await getDocsFromServer(basicQ).catch(() => getDocs(basicQ));
      }
    } else {
      const basicQ = query(colRef, where('isPublic', '==', true), limit(fetchLimit));
      snap = await getDocsFromServer(basicQ).catch(() => getDocs(basicQ));
    }

    const rawDocs = snap.docs.slice(0, maxResults);
    const hasMore = snap.docs.length > maxResults;
    const entries = rawDocs
      .map((d) => d.data() as PublicLeaderboardEntry)
      .filter((entry) => !entry.isGuest);

    cachedLeaderboard = {
      entries,
      hasMore,
      pageLimit: maxResults,
      fetchedAt: Date.now(),
    };

    return { entries, hasMore };
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'publicLeaderboard');
    return { entries: [], hasMore: false };
  }
}

export async function fetchPublicLeaderboard(): Promise<PublicLeaderboardEntry[]> {
  const res = await fetchPublicLeaderboardPage(100, true);
  return res.entries;
}

export function subscribePublicLeaderboard(
  onUpdate: (entries: PublicLeaderboardEntry[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, 'publicLeaderboard'), where('isPublic', '==', true), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => d.data() as PublicLeaderboardEntry)
        .filter((entry) => !entry.isGuest);
      onUpdate(list);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        console.warn('Public leaderboard live subscription notice:', err);
      }
    }
  );
}
