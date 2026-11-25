import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  RefreshCw,
  Search,
  Flame,
  Clock,
  Award,
  UserCheck,
  ChevronRight,
  AlertCircle,
  Info,
  Crown,
  Eye,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  ChronosWallet,
  DailyCheckInData,
  DeepWorkSession,
  FriendRequestItem,
  FriendshipItem,
  PersistedAuthSession,
  PublicLeaderboardEntry,
  StudyTask,
} from '../types';
import { auth } from '../services/firebase';
import {
  AccountProfileMeta,
  buildLocalPublicProfile,
  fetchPublicLeaderboardPage,
  getCachedLeaderboardSnapshot,
  getCurrentWeekKey,
  getCurrentYearKey,
  syncPublicLeaderboardProfile,
} from '../services/leaderboard';
import { computeScholarDigitId, getTodayDateString } from '../utils/storage';
import { PublicProfilePanel } from './PublicProfilePanel';
import { ProfileBannerBackdrop, RankTierBadge, ScholarAvatar } from './ScholarCosmetics';

interface LeaderboardViewProps {
  currentUser: User | null;
  persistedAuthSession?: PersistedAuthSession | null;
  sessions: DeepWorkSession[];
  tasks: StudyTask[];
  wallet: ChronosWallet;
  dailyGoalHours: number;
  activeSubject: string;
  dailyCheckIn: DailyCheckInData | null;
  accountProfileMeta?: AccountProfileMeta;
  authSyncSeq?: number;
  isAutoSyncingRank?: boolean;
  lastRankSyncAt?: number | null;
  incomingRequests?: FriendRequestItem[];
  outgoingRequests?: FriendRequestItem[];
  friendships?: FriendshipItem[];
  onSendFriendRequest?: (target: PublicLeaderboardEntry) => Promise<void>;
  onAcceptFriendRequest?: (req: FriendRequestItem) => Promise<void>;
  onOpenSendGift?: (target: PublicLeaderboardEntry) => void;
  onNavigateToProfile?: () => void;
  onOpenTierRoadmap?: () => void;
}

type LeaderboardPeriod = 'daily' | 'weekly' | 'yearly';

function formatFocusDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  return `${h}h ${rem}m`;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  persistedAuthSession = null,
  sessions,
  tasks,
  wallet,
  dailyGoalHours,
  activeSubject,
  dailyCheckIn,
  accountProfileMeta,
  authSyncSeq = 0,
  isAutoSyncingRank = false,
  lastRankSyncAt = null,
  incomingRequests = [],
  outgoingRequests = [],
  friendships = [],
  onSendFriendRequest,
  onAcceptFriendRequest,
  onOpenSendGift,
  onNavigateToProfile,
  onOpenTierRoadmap,
}) => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('daily');
  const [pageLimit, setPageLimit] = useState<number>(25);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [entries, setEntries] = useState<PublicLeaderboardEntry[]>(
    () => getCachedLeaderboardSnapshot(25)?.entries || []
  );
  const [loading, setLoading] = useState<boolean>(() => !getCachedLeaderboardSnapshot(25));
  const [syncing, setSyncing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<PublicLeaderboardEntry | null>(null);

  const activeUid =
    currentUser && !currentUser.isAnonymous
      ? currentUser.uid
      : persistedAuthSession && !persistedAuthSession.isAnonymous
      ? persistedAuthSession.uid
      : null;
  const isGuestUser = !activeUid;

  const localSelfEntry = useMemo(
    () =>
      isGuestUser
        ? null
        : buildLocalPublicProfile({
            user: currentUser,
            persistedSession: persistedAuthSession,
            sessions,
            tasks,
            wallet,
            dailyGoalHours,
            activeSubject,
            dailyCheckIn,
            profileOverride: accountProfileMeta,
          }),
    [
      isGuestUser,
      currentUser,
      persistedAuthSession,
      sessions,
      tasks,
      wallet,
      dailyGoalHours,
      activeSubject,
      dailyCheckIn,
      accountProfileMeta,
    ]
  );

  const loadStandings = useCallback(
    async (targetLimit: number = pageLimit, forceRefresh: boolean = false) => {
      if (targetLimit > pageLimit) {
        setLoadingMore(true);
      } else if (forceRefresh || entries.length === 0) {
        setLoading(true);
      }
      setErrorMsg(null);
      try {
        const res = await fetchPublicLeaderboardPage(targetLimit, forceRefresh);
        setEntries(res.entries);
        setHasMore(res.hasMore);
      } catch {
        setErrorMsg('Unable to reach cloud standings right now.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageLimit, entries.length]
  );

  useEffect(() => {
    void loadStandings(pageLimit, false);
  }, [activeUid, authSyncSeq, pageLimit]);

  // Automatically refresh standings when background auto-rank-sync completes
  useEffect(() => {
    if (!lastRankSyncAt) return;
    void loadStandings(pageLimit, true);
  }, [lastRankSyncAt]);

  // Auto-publish updated rank upon opening Leaderboard when signed in
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous || isGuestUser) return;
    let cancelled = false;
    setSyncing(true);
    void syncPublicLeaderboardProfile({
      user,
      sessions,
      tasks,
      wallet,
      dailyGoalHours,
      activeSubject,
      dailyCheckIn,
      profileOverride: accountProfileMeta,
    })
      .then((ok) => {
        if (!cancelled && ok) {
          void loadStandings(pageLimit, true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeUid, authSyncSeq]);

  const handleLoadMoreScholars = () => {
    const nextLimit = pageLimit + 25;
    setPageLimit(nextLimit);
  };

  const todayKey = getTodayDateString();
  const weekKey = getCurrentWeekKey();
  const yearKey = getCurrentYearKey();

  const getPeriodMetrics = useCallback(
    (entry: PublicLeaderboardEntry) => {
      if (period === 'daily') {
        const isCurrentDay = entry.dayKey === todayKey;
        return {
          minutes: isCurrentDay ? entry.dailyMinutes : 0,
          points: isCurrentDay ? entry.dailyPoints : 0,
        };
      }
      if (period === 'weekly') {
        const isCurrentWeek = entry.weekKey === weekKey;
        return {
          minutes: isCurrentWeek ? entry.weeklyMinutes : 0,
          points: isCurrentWeek ? entry.weeklyPoints : 0,
        };
      }
      const isCurrentYear = entry.yearKey === yearKey;
      return {
        minutes: isCurrentYear ? entry.yearlyMinutes : 0,
        points: isCurrentYear ? entry.yearlyPoints : 0,
      };
    },
    [period, todayKey, weekKey, yearKey]
  );

  const resolvedSelfEntry = useMemo(() => {
    if (!localSelfEntry) return null;
    const cloudSelf = !isGuestUser && activeUid
      ? entries.find((e) => e.userId === activeUid && !e.isGuest)
      : undefined;
    if (!cloudSelf) return localSelfEntry;

    return {
      ...localSelfEntry,
      totalPointsEarned: Math.max(localSelfEntry.totalPointsEarned, cloudSelf.totalPointsEarned || 0),
      totalMinutes: Math.max(localSelfEntry.totalMinutes, cloudSelf.totalMinutes || 0),
      streakDays: Math.max(localSelfEntry.streakDays, cloudSelf.streakDays || 0),
      unlockedBadgesCount: Math.max(
        localSelfEntry.unlockedBadgesCount,
        cloudSelf.unlockedBadgesCount || 0
      ),
      dailyMinutes:
        cloudSelf.dayKey === localSelfEntry.dayKey
          ? Math.max(localSelfEntry.dailyMinutes, cloudSelf.dailyMinutes || 0)
          : localSelfEntry.dailyMinutes,
      dailyPoints:
        cloudSelf.dayKey === localSelfEntry.dayKey
          ? Math.max(localSelfEntry.dailyPoints, cloudSelf.dailyPoints || 0)
          : localSelfEntry.dailyPoints,
      weeklyMinutes:
        cloudSelf.weekKey === localSelfEntry.weekKey
          ? Math.max(localSelfEntry.weeklyMinutes, cloudSelf.weeklyMinutes || 0)
          : localSelfEntry.weeklyMinutes,
      weeklyPoints:
        cloudSelf.weekKey === localSelfEntry.weekKey
          ? Math.max(localSelfEntry.weeklyPoints, cloudSelf.weeklyPoints || 0)
          : localSelfEntry.weeklyPoints,
      yearlyMinutes:
        cloudSelf.yearKey === localSelfEntry.yearKey
          ? Math.max(localSelfEntry.yearlyMinutes, cloudSelf.yearlyMinutes || 0)
          : localSelfEntry.yearlyMinutes,
      yearlyPoints:
        cloudSelf.yearKey === localSelfEntry.yearKey
          ? Math.max(localSelfEntry.yearlyPoints, cloudSelf.yearlyPoints || 0)
          : localSelfEntry.yearlyPoints,
    };
  }, [localSelfEntry, entries, isGuestUser, activeUid]);

  const allSortedStandings = useMemo(() => {
    const map = new Map<string, PublicLeaderboardEntry>();
    for (const item of entries) {
      if (!item.isGuest) {
        map.set(item.userId, item);
      }
    }
    if (!isGuestUser && activeUid && resolvedSelfEntry) {
      map.set(activeUid, resolvedSelfEntry);
    }

    const combined = Array.from(map.values());
    combined.sort((a, b) => {
      const ma = getPeriodMetrics(a);
      const mb = getPeriodMetrics(b);
      if (mb.minutes !== ma.minutes) return mb.minutes - ma.minutes;
      if (mb.points !== ma.points) return mb.points - ma.points;
      return (b.totalMinutes || 0) - (a.totalMinutes || 0);
    });
    return combined;
  }, [entries, resolvedSelfEntry, isGuestUser, activeUid, getPeriodMetrics]);

  // Daily displays ALL accounts; Weekly & Yearly display ONLY top 100
  const periodStandings = useMemo(() => {
    const list =
      period === 'daily' ? allSortedStandings : allSortedStandings.slice(0, 100);
    return list.map((scholar, idx) => ({
      scholar,
      rank: idx + 1,
    }));
  }, [allSortedStandings, period]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    periodStandings.forEach(({ scholar }) => {
      if (scholar.primarySubject) set.add(scholar.primarySubject);
    });
    return Array.from(set).sort();
  }, [periodStandings]);

  const filteredStandings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qDigits = q.replace(/^#/, '');
    return periodStandings.filter(({ scholar }) => {
      if (subjectFilter !== 'all' && scholar.primarySubject !== subjectFilter) return false;
      if (!q) return true;
      const digitId = scholar.scholarId || computeScholarDigitId(scholar.userId);
      return (
        scholar.displayName.toLowerCase().includes(q) ||
        scholar.primarySubject.toLowerCase().includes(q) ||
        scholar.rankTitle.toLowerCase().includes(q) ||
        scholar.rankTier.toLowerCase().includes(q) ||
        (qDigits.length > 0 && digitId.includes(qDigits))
      );
    });
  }, [periodStandings, searchQuery, subjectFilter]);

  const selfId = !isGuestUser && activeUid ? activeUid : null;
  const selfRankIndex = selfId
    ? allSortedStandings.findIndex((e) => e.userId === selfId)
    : -1;
  const selfMetrics = resolvedSelfEntry ? getPeriodMetrics(resolvedSelfEntry) : null;

  const getFriendStatus = useCallback(
    (targetUid: string): 'self' | 'friends' | 'incoming' | 'outgoing' | 'none' => {
      if (selfId && targetUid === selfId) return 'self';
      if (friendships.some((f) => f.userA === targetUid || f.userB === targetUid)) {
        return 'friends';
      }
      if (incomingRequests.some((r) => r.fromUid === targetUid)) return 'incoming';
      if (outgoingRequests.some((r) => r.toUid === targetUid)) return 'outgoing';
      return 'none';
    },
    [selfId, friendships, incomingRequests, outgoingRequests]
  );

  const scopeSummary =
    period === 'daily'
      ? `Today · ${todayKey} · Showing all ${allSortedStandings.length} scholar${
          allSortedStandings.length === 1 ? '' : 's'
        }`
      : period === 'weekly'
      ? `Week · ${weekKey} · Top ${Math.min(100, allSortedStandings.length)} of ${allSortedStandings.length} scholars`
      : `Year · ${yearKey} · Top ${Math.min(100, allSortedStandings.length)} of ${allSortedStandings.length} scholars`;

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in max-w-5xl mx-auto pb-12 w-full overflow-x-hidden">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b ch-border pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 ch-text-accent shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight ch-text">
              Scholar Leaderboard
            </h2>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            {scopeSummary} · 1 XP/min · Click any scholar for their public card
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenTierRoadmap && (
            <button
              type="button"
              onClick={onOpenTierRoadmap}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer"
              title="Inspect all Scholar Tiers and Levels"
            >
              <Crown className="w-3.5 h-3.5 ch-text-accent shrink-0" />
              <span>Tier Ladder</span>
            </button>
          )}

          {isGuestUser ? (
            <button
              type="button"
              onClick={() => onNavigateToProfile?.()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs ch-btn-primary rounded-xl whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In to Compete</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ch-glass-subtle rounded-xl whitespace-nowrap ch-text-secondary"
              title="Your rank updates automatically whenever you focus, earn XP, or update your profile"
            >
              {syncing || isAutoSyncingRank ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin ch-text-accent shrink-0" />
                  <span>Auto-syncing rank...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Rank Auto-Synced</span>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => void loadStandings(pageLimit, true)}
            disabled={loading}
            className="p-2 ch-btn-secondary rounded-xl cursor-pointer"
            title="Refresh standings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin ch-text-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Period Segmented Switcher & Search Filter */}
      <div className="flex flex-col @xl/main:flex-row @xl/main:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 ch-glass-subtle rounded-xl w-full @xl/main:w-auto overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'daily', label: 'Daily (All)' },
              { id: 'weekly', label: 'Weekly (Top 100)' },
              { id: 'yearly', label: 'Yearly (Top 100)' },
            ] as const
          ).map((tab) => {
            const active = period === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id)}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'ch-btn-primary shadow-sm'
                    : 'ch-text-muted hover:ch-text'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 ch-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find scholar, tier or ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs ch-input rounded-xl"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs ch-input rounded-xl max-w-[145px]"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Your Standing Summary Bar (Signed-in scholars) OR Guest Spectator Notice (Guests hidden) */}
      {isGuestUser ? (
        <div className="p-4 rounded-2xl ch-glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 ch-text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold ch-text">Viewing Leaderboard as Guest</div>
              <p className="text-xs ch-text-muted mt-0.5">
                You can browse all scholar rankings, courses, and profiles below. Your own score and rank stay private and are not shown on the leaderboard.
              </p>
            </div>
          </div>

          {onNavigateToProfile && (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-3.5 py-2 text-xs font-semibold ch-btn-primary rounded-xl whitespace-nowrap self-start sm:self-auto shrink-0 cursor-pointer"
            >
              Sign In to Join Ranks
            </button>
          )}
        </div>
      ) : (
        resolvedSelfEntry &&
        selfMetrics &&
        (() => {
          const hasSelfBanner = Boolean(
            wallet.equippedBackground && wallet.equippedBackground !== 'default'
          );
          return (
            <div
              onClick={() => setSelectedEntry(resolvedSelfEntry)}
              className={`relative overflow-hidden p-4 rounded-2xl ch-glass-card flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:brightness-105 transition-all ${
                hasSelfBanner ? 'text-white' : ''
              }`}
              style={{
                borderColor: 'var(--ch-accent-border)',
                backgroundColor: hasSelfBanner ? '#0b0e14' : undefined,
              }}
            >
              {hasSelfBanner && (
                <ProfileBannerBackdrop
                  backgroundId={wallet.equippedBackground}
                  scrimClassName="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35"
                />
              )}

              <div className="relative z-10 flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs sm:text-sm font-bold tabular-nums shrink-0 ${
                    hasSelfBanner
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-300/40'
                      : 'ch-accent-soft'
                  }`}
                >
                  {selfRankIndex >= 0 ? `#${selfRankIndex + 1}` : 'Synced'}
                </div>
                <ScholarAvatar
                  displayName={resolvedSelfEntry.displayName}
                  photoURL={resolvedSelfEntry.photoURL}
                  frameId={wallet.equippedFrame}
                  avatarId={wallet.equippedAvatar}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold truncate ${
                        hasSelfBanner ? 'text-white' : 'ch-text'
                      }`}
                    >
                      {resolvedSelfEntry.displayName} (You)
                    </span>
                    <UserCheck
                      className={`w-3.5 h-3.5 shrink-0 ${
                        hasSelfBanner ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                    <RankTierBadge
                      totalPointsEarned={resolvedSelfEntry.totalPointsEarned}
                      rankTierOverride={resolvedSelfEntry.rankTier}
                      compact
                    />
                  </div>
                  <div
                    className={`text-xs truncate mt-0.5 ${
                      hasSelfBanner ? 'text-white/80' : 'ch-text-muted'
                    }`}
                  >
                    {resolvedSelfEntry.primarySubject} · {resolvedSelfEntry.streakDays}d streak
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3 sm:gap-4 ml-auto shrink-0">
                <div className="text-right">
                  <div
                    className={`font-mono text-sm font-bold tabular-nums ${
                      hasSelfBanner ? 'text-white' : 'ch-text'
                    }`}
                  >
                    {formatFocusDuration(selfMetrics.minutes)}
                  </div>
                  <div
                    className={`font-mono text-[11px] tabular-nums ${
                      hasSelfBanner ? 'text-amber-300' : 'ch-text-accent'
                    }`}
                  >
                    {selfMetrics.points} XP {period}
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl ch-accent-soft text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 ch-text-accent shrink-0" />
          <span className="ch-text">{errorMsg}</span>
        </div>
      )}

      {!loading && allSortedStandings.length <= 1 && (
        <div className="p-3.5 rounded-2xl ch-glass-subtle ch-text-secondary text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 ch-text-accent shrink-0 mt-0.5" />
            <span>
              Showing {allSortedStandings.length} registered scholar
              {allSortedStandings.length === 1 ? '' : 's'}. Older accounts stored only in private
              Firebase <code className="ch-text font-mono">/users</code> records appear after signing
              in once on v1.5+.
            </span>
          </div>
          {onNavigateToProfile && (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-3 py-1.5 rounded-lg ch-btn-secondary font-semibold whitespace-nowrap self-start sm:self-auto shrink-0 cursor-pointer"
            >
              {isGuestUser ? 'Sign In Account' : 'Switch / Sign In Account'}
            </button>
          )}
        </div>
      )}

      {/* Top 3 Podium */}
      {!loading && filteredStandings.length > 0 && (
        <div className="grid grid-cols-1 @xl/main:grid-cols-3 gap-3">
          {filteredStandings.slice(0, 3).map(({ scholar, rank }) => {
            const m = getPeriodMetrics(scholar);
            const isSelf = Boolean(selfId && scholar.userId === selfId);
            const hasBanner = Boolean(
              scholar.equippedBackground && scholar.equippedBackground !== 'default'
            );
            return (
              <button
                key={scholar.userId}
                type="button"
                onClick={() => setSelectedEntry(scholar)}
                className={`relative overflow-hidden p-4 rounded-2xl ch-glass-card text-left transition-all flex flex-col justify-between gap-3 hover:brightness-105 cursor-pointer ${
                  hasBanner ? 'text-white' : ''
                }`}
                style={{
                  borderColor: rank === 1 ? 'var(--ch-accent-border)' : undefined,
                  backgroundColor: hasBanner ? '#0b0e14' : undefined,
                }}
              >
                {hasBanner && (
                  <ProfileBannerBackdrop
                    backgroundId={scholar.equippedBackground}
                    className="opacity-75"
                  />
                )}

                <div className="relative z-10 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ScholarAvatar
                      displayName={scholar.displayName}
                      photoURL={scholar.photoURL}
                      frameId={scholar.equippedFrame}
                      avatarId={scholar.equippedAvatar}
                      size="sm"
                      showFrameBadge
                    />
                    <div className="min-w-0 space-y-1">
                      <div
                        className={`text-sm font-bold truncate ${
                          hasBanner ? 'text-white' : 'ch-text'
                        }`}
                      >
                        {scholar.displayName} {isSelf ? '(You)' : ''}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <RankTierBadge
                          totalPointsEarned={scholar.totalPointsEarned}
                          rankTierOverride={scholar.rankTier}
                          compact
                          showLevel={false}
                        />
                        <span
                          className={`text-[11px] truncate ${
                            hasBanner ? 'text-white/75' : 'ch-text-muted'
                          }`}
                        >
                          {scholar.primarySubject}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-extrabold tabular-nums shrink-0 ${
                      rank === 1
                        ? hasBanner
                          ? 'text-amber-300'
                          : 'ch-text-accent'
                        : hasBanner
                        ? 'text-white/70'
                        : 'ch-text-muted'
                    }`}
                  >
                    #{rank}
                  </span>
                </div>

                <div className="relative z-10 flex items-baseline justify-between pt-2 border-t border-white/15">
                  <div
                    className={`font-mono text-base font-bold tabular-nums ${
                      hasBanner ? 'text-white' : 'ch-text'
                    }`}
                  >
                    {formatFocusDuration(m.minutes)}
                  </div>
                  <div
                    className={`text-xs font-mono tabular-nums ${
                      hasBanner ? 'text-amber-300' : 'ch-text-accent'
                    }`}
                  >
                    {m.points} XP · {scholar.streakDays}d
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Standings List Table */}
      <div className="rounded-2xl ch-glass-card overflow-hidden">
        <div className="px-4 py-3 border-b ch-border ch-glass-subtle flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ch-text-muted">
          <span>
            Rank &amp; Scholar ({filteredStandings.length}
            {period !== 'daily' ? ' / Top 100' : ' All'})
          </span>
          <span>
            {period === 'daily' ? 'Today Focus' : period === 'weekly' ? 'Week Focus' : 'Year Focus'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs ch-text-muted">
            Loading live scholar standings...
          </div>
        ) : filteredStandings.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs ch-text-muted">No scholars matched your current filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {filteredStandings.map(({ scholar, rank }) => {
              const m = getPeriodMetrics(scholar);
              const isSelf = Boolean(selfId && scholar.userId === selfId);
              const hasRowBanner = Boolean(
                scholar.equippedBackground && scholar.equippedBackground !== 'default'
              );
              return (
                <button
                  key={scholar.userId}
                  type="button"
                  onClick={() => setSelectedEntry(scholar)}
                  className={`relative overflow-hidden w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                    hasRowBanner
                      ? 'text-white hover:brightness-110'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                  style={
                    hasRowBanner
                      ? { backgroundColor: '#0b0e14' }
                      : isSelf
                      ? { backgroundColor: 'var(--ch-accent-soft)' }
                      : undefined
                  }
                >
                  {hasRowBanner && (
                    <ProfileBannerBackdrop
                      backgroundId={scholar.equippedBackground}
                      scrimClassName="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35"
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`w-8 font-mono text-xs font-bold tabular-nums shrink-0 ${
                        rank === 1
                          ? hasRowBanner
                            ? 'text-amber-300'
                            : 'ch-text-accent'
                          : rank <= 3
                          ? hasRowBanner
                            ? 'text-white'
                            : 'ch-text'
                          : hasRowBanner
                          ? 'text-white/75'
                          : 'ch-text-muted'
                      }`}
                    >
                      #{rank}
                    </span>

                    <ScholarAvatar
                      displayName={scholar.displayName}
                      photoURL={scholar.photoURL}
                      frameId={scholar.equippedFrame}
                      avatarId={scholar.equippedAvatar}
                      size="xs"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            hasRowBanner ? 'text-white' : 'ch-text'
                          }`}
                        >
                          {scholar.displayName}
                        </span>
                        {isSelf && (
                          <span
                            className={`text-[10px] font-mono font-semibold shrink-0 ${
                              hasRowBanner ? 'text-amber-300' : 'ch-text-accent'
                            }`}
                          >
                            · You
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-[11px] truncate mt-0.5 ${
                          hasRowBanner ? 'text-white/80' : 'ch-text-muted'
                        }`}
                      >
                        <RankTierBadge
                          totalPointsEarned={scholar.totalPointsEarned}
                          rankTierOverride={scholar.rankTier}
                          compact
                          showLevel={false}
                        />
                        <span>· {scholar.primarySubject}</span>
                        <span className="hidden sm:inline font-mono text-[10px] opacity-80">
                          · #{scholar.scholarId || computeScholarDigitId(scholar.userId)}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span
                          className={`hidden sm:inline-flex items-center gap-0.5 tabular-nums ${
                            hasRowBanner ? 'text-orange-300' : 'text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          <Flame className="w-3 h-3" /> {scholar.streakDays}d
                        </span>
                        <span className="hidden md:inline">·</span>
                        <span
                          className={`hidden md:inline-flex items-center gap-0.5 tabular-nums ${
                            hasRowBanner
                              ? 'text-emerald-300'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Award className="w-3 h-3" /> {scholar.unlockedBadgesCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`font-mono text-xs sm:text-sm font-bold tabular-nums flex items-center justify-end gap-1 ${
                          hasRowBanner ? 'text-white' : 'ch-text'
                        }`}
                      >
                        <Clock
                          className={`w-3 h-3 hidden sm:inline ${
                            hasRowBanner ? 'text-amber-300' : 'ch-text-accent'
                          }`}
                        />
                        <span>{formatFocusDuration(m.minutes)}</span>
                      </div>
                      <div
                        className={`font-mono text-[11px] tabular-nums ${
                          hasRowBanner ? 'text-amber-300' : 'ch-text-accent'
                        }`}
                      >
                        {m.points} XP
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        hasRowBanner ? 'text-white/75' : 'ch-text-muted'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && hasMore && (
          <div className="p-3 border-t ch-border text-center ch-glass-subtle">
            <button
              type="button"
              onClick={handleLoadMoreScholars}
              disabled={loadingMore}
              className="px-4 py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer disabled:opacity-60"
            >
              {loadingMore ? 'Loading More Scholars...' : 'Load More Scholars (+25)'}
            </button>
          </div>
        )}
      </div>

      {/* Public Profile Slide-over / Modal */}
      <PublicProfilePanel
        entry={selectedEntry}
        isCurrentUser={Boolean(selfId && selectedEntry?.userId === selfId)}
        isGuestViewer={isGuestUser}
        friendStatus={selectedEntry ? getFriendStatus(selectedEntry.userId) : 'none'}
        onAddFriend={
          selectedEntry && onSendFriendRequest
            ? () => void onSendFriendRequest(selectedEntry)
            : undefined
        }
        onAcceptFriend={
          selectedEntry && onAcceptFriendRequest
            ? () => {
                const req = incomingRequests.find(
                  (r) => r.fromUid === selectedEntry.userId
                );
                if (req) void onAcceptFriendRequest(req);
              }
            : undefined
        }
        onSendGift={
          selectedEntry && onOpenSendGift
            ? () => {
                const target = selectedEntry;
                setSelectedEntry(null);
                onOpenSendGift(target);
              }
            : undefined
        }
        onSignInPrompt={() => {
          setSelectedEntry(null);
          onNavigateToProfile?.();
        }}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
};
