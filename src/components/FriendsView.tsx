import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
  Gift,
  Mail,
  Copy,
  UserMinus,
  LogIn,
  AlertCircle,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  ChronosWallet,
  FriendRequestItem,
  FriendshipItem,
  PersistedAuthSession,
  PublicLeaderboardEntry,
} from '../types';
import { computeScholarDigitId, getScholarRank } from '../utils/storage';
import {
  fetchPublicProfilesByUids,
  normalizeDigitIdInput,
  searchScholarByDigitId,
} from '../services/social';
import { ProfileBannerBackdrop, RankTierBadge, ScholarAvatar } from './ScholarCosmetics';
import { PublicProfilePanel } from './PublicProfilePanel';

interface FriendsViewProps {
  currentUser: User | null;
  persistedAuthSession?: PersistedAuthSession | null;
  wallet: ChronosWallet;
  displayName: string;
  primarySubject: string;
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
  friendships: FriendshipItem[];
  unclaimedGiftsCount: number;
  onOpenMailbox: () => void;
  onOpenSendGift: (target: PublicLeaderboardEntry) => void;
  onNavigateToProfile: () => void;
  onNavigateToLeaderboard: () => void;
  onSendFriendRequest: (target: PublicLeaderboardEntry) => Promise<void>;
  onAcceptFriendRequest: (req: FriendRequestItem) => Promise<void>;
  onDeclineFriendRequest: (requestId: string) => Promise<void>;
  onCancelFriendRequest: (requestId: string) => Promise<void>;
  onRemoveFriendship: (friendUid: string) => Promise<void>;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  persistedAuthSession = null,
  wallet,
  displayName,
  primarySubject,
  incomingRequests,
  outgoingRequests,
  friendships,
  unclaimedGiftsCount,
  onOpenMailbox,
  onOpenSendGift,
  onNavigateToProfile,
  onNavigateToLeaderboard,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onCancelFriendRequest,
  onRemoveFriendship,
}) => {
  const activeUid =
    currentUser && !currentUser.isAnonymous
      ? currentUser.uid
      : persistedAuthSession && !persistedAuthSession.isAnonymous
      ? persistedAuthSession.uid
      : null;
  const isGuestUser = !activeUid;
  const myScholarId = activeUid ? computeScholarDigitId(activeUid) : '--------';

  const [subTab, setSubTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchIdInput, setSearchIdInput] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<PublicLeaderboardEntry | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRemoveUid, setConfirmRemoveUid] = useState<string | null>(null);
  const [friendProfiles, setFriendProfiles] = useState<
    Record<string, PublicLeaderboardEntry>
  >({});
  const [selectedProfile, setSelectedProfile] =
    useState<PublicLeaderboardEntry | null>(null);

  const friendUids = useMemo(() => {
    if (!activeUid) return [];
    return friendships.map((f) => (f.userA === activeUid ? f.userB : f.userA));
  }, [friendships, activeUid]);

  useEffect(() => {
    if (friendUids.length === 0) {
      setFriendProfiles({});
      return;
    }
    let cancelled = false;
    void fetchPublicProfilesByUids(friendUids)
      .then((map) => {
        if (!cancelled) setFriendProfiles(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [friendUids.join(',')]);

  const incomingFromSet = useMemo(
    () => new Set(incomingRequests.map((r) => r.fromUid)),
    [incomingRequests]
  );
  const outgoingToSet = useMemo(
    () => new Set(outgoingRequests.map((r) => r.toUid)),
    [outgoingRequests]
  );
  const friendUidSet = useMemo(() => new Set(friendUids), [friendUids]);

  const getRelationState = (
    targetUid: string
  ): 'self' | 'friends' | 'incoming' | 'outgoing' | 'none' => {
    if (!activeUid) return 'none';
    if (targetUid === activeUid) return 'self';
    if (friendUidSet.has(targetUid)) return 'friends';
    if (incomingFromSet.has(targetUid)) return 'incoming';
    if (outgoingToSet.has(targetUid)) return 'outgoing';
    return 'none';
  };

  const handleCopyMyId = () => {
    if (isGuestUser) return;
    navigator.clipboard?.writeText(myScholarId).catch(() => {});
    setCopiedId(true);
    window.setTimeout(() => setCopiedId(false), 1800);
  };

  const handleSearchById = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleaned = normalizeDigitIdInput(searchIdInput);
    setSearchError(null);
    setSearchAttempted(true);
    if (cleaned.length !== 8) {
      setSearchResult(null);
      setSearchError('Enter a valid 8-digit Scholar ID (for example: 48291037).');
      return;
    }
    if (activeUid && cleaned === myScholarId) {
      const rank = getScholarRank(wallet.totalPointsEarned);
      setSearchResult({
        userId: activeUid,
        scholarId: myScholarId,
        isPublic: true,
        displayName,
        studyLevel: 'Scholar',
        primarySubject,
        bio: 'This is your own Scholar Digit ID.',
        rankTitle: rank.title,
        rankTier: rank.tier,
        equippedFrame: wallet.equippedFrame,
        equippedBackground: wallet.equippedBackground,
        equippedAvatar: wallet.equippedAvatar,
        totalPointsEarned: wallet.totalPointsEarned,
        totalMinutes: 0,
        streakDays: 0,
        unlockedBadgesCount: 0,
        dayKey: '',
        dailyMinutes: 0,
        dailyPoints: 0,
        weekKey: '',
        weeklyMinutes: 0,
        weeklyPoints: 0,
        yearKey: '',
        yearlyMinutes: 0,
        yearlyPoints: 0,
        isGuest: false,
      });
      return;
    }

    setSearching(true);
    try {
      const found = await searchScholarByDigitId(cleaned);
      setSearchResult(found);
      setSubTab('search');
    } catch {
      setSearchError('Could not search scholars right now. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const resolveFriendCardData = (f: FriendshipItem): PublicLeaderboardEntry => {
    const otherUid = f.userA === activeUid ? f.userB : f.userA;
    const live = friendProfiles[otherUid];
    if (live) return live;
    const cachedName =
      (f.userA === activeUid ? f.userBName : f.userAName) || 'Study Scholar';
    const cachedScholarId =
      (f.userA === activeUid ? f.userBScholarId : f.userAScholarId) ||
      computeScholarDigitId(otherUid);
    return {
      userId: otherUid,
      scholarId: cachedScholarId,
      isPublic: true,
      displayName: cachedName,
      studyLevel: 'Scholar',
      primarySubject: 'General',
      bio: 'Chronos Study Friend',
      rankTitle: 'Initiate Recruit',
      rankTier: 'Bronze V',
      totalPointsEarned: 0,
      totalMinutes: 0,
      streakDays: 0,
      unlockedBadgesCount: 0,
      dayKey: '',
      dailyMinutes: 0,
      dailyPoints: 0,
      weekKey: '',
      weeklyMinutes: 0,
      weeklyPoints: 0,
      yearKey: '',
      yearlyMinutes: 0,
      yearlyPoints: 0,
      isGuest: false,
    };
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in max-w-5xl mx-auto pb-12 w-full overflow-x-hidden">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b ch-border pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 ch-text-accent shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight ch-text">
              Friends &amp; Study Network
            </h2>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Find scholars by 8-digit User ID, manage friend requests, and gift Store cosmetics
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onOpenMailbox}
            className="relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold ch-accent-soft rounded-xl cursor-pointer hover:brightness-105"
            title="Open Gift Mailbox"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Mailbox</span>
            {unclaimedGiftsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold tabular-nums leading-none">
                {unclaimedGiftsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onNavigateToLeaderboard}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 ch-text-accent" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* My Scholar Digit ID & Quick ID Search Card */}
      <div className="grid grid-cols-1 @2xl/main:grid-cols-2 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl ch-glass-card flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider ch-text-muted">
              Your Scholar Digit ID
            </div>
            {isGuestUser ? (
              <div className="mt-1 space-y-1">
                <div className="font-mono text-lg font-bold ch-text-muted tabular-nums">
                  Sign In Required
                </div>
                <p className="text-[11px] ch-text-muted">
                  Sign in on Profile to claim your permanent 8-digit Scholar ID.
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <div className="font-mono text-2xl font-extrabold ch-text-accent tracking-wider tabular-nums">
                  #{myScholarId}
                </div>
                <p className="text-[11px] ch-text-muted mt-0.5">
                  Share this 8-digit ID so friends can find &amp; add you
                </p>
              </div>
            )}
          </div>

          {isGuestUser ? (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-3.5 py-2 text-xs font-bold ch-btn-primary rounded-xl shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyMyId}
              className="px-3.5 py-2 text-xs font-semibold ch-btn-secondary rounded-xl shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 ch-text-accent" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Search Friend by 8-Digit User ID */}
        <form
          onSubmit={handleSearchById}
          className="p-4 sm:p-5 rounded-2xl ch-glass-card flex flex-col justify-between gap-2.5"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider ch-text-muted">
            Find Scholar by Digit ID
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 ch-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                placeholder="Enter 8-digit ID (e.g. 48291037)"
                className="w-full pl-8 pr-3 py-2 text-xs font-mono ch-input rounded-xl tabular-nums"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 text-xs font-bold ch-btn-primary rounded-xl shrink-0 cursor-pointer disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Find User'}
            </button>
          </div>
          {searchError && (
            <div className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>
      </div>

      {/* Guest Info Banner */}
      {isGuestUser ? (
        <div className="p-6 rounded-2xl ch-glass-card text-center space-y-3">
          <Users className="w-10 h-10 ch-text-accent mx-auto" />
          <h3 className="text-base font-bold ch-text">
            Social Network &amp; Gifting Require Sign-In
          </h3>
          <p className="text-xs ch-text-muted max-w-md mx-auto leading-relaxed">
            You can browse the public Scholar Leaderboard freely as a guest. Sign in on Profile to get your 8-digit User ID, send friend requests, and send or unbox Store gifts.
          </p>
          <button
            type="button"
            onClick={onNavigateToProfile}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold ch-btn-primary rounded-xl cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Open Profile Sign-In</span>
          </button>
        </div>
      ) : (
        <>
          {/* Section Tabs */}
          <div className="flex items-center gap-1.5 p-1 ch-glass-subtle rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setSubTab('friends')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                subTab === 'friends' ? 'ch-btn-primary' : 'ch-text-muted hover:ch-text'
              }`}
            >
              Friends List ({friendships.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('requests')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                subTab === 'requests' ? 'ch-btn-primary' : 'ch-text-muted hover:ch-text'
              }`}
            >
              <span>Requests</span>
              {incomingRequests.length + outgoingRequests.length > 0 && (
                <span className="font-mono text-[10px] tabular-nums opacity-90">
                  ({incomingRequests.length + outgoingRequests.length})
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSubTab('search')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                subTab === 'search' ? 'ch-btn-primary' : 'ch-text-muted hover:ch-text'
              }`}
            >
              Search Result
            </button>
          </div>

          {/* Search Result Tab */}
          {subTab === 'search' && (
            <div className="rounded-2xl ch-glass-card p-4 sm:p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider ch-text-muted">
                Digit ID Search Result
              </div>
              {searching ? (
                <div className="py-6 text-center text-xs ch-text-muted">
                  Looking up scholar in directory...
                </div>
              ) : searchResult ? (
                (() => {
                  const rel = getRelationState(searchResult.userId);
                  const hasBanner = Boolean(
                    searchResult.equippedBackground &&
                      searchResult.equippedBackground !== 'default'
                  );
                  return (
                    <div
                      className={`relative overflow-hidden p-4 rounded-2xl border ch-border flex flex-wrap items-center justify-between gap-3 ${
                        hasBanner ? 'text-white' : 'ch-glass-subtle'
                      }`}
                      style={hasBanner ? { backgroundColor: '#0b0e14' } : undefined}
                    >
                      {hasBanner && (
                        <ProfileBannerBackdrop
                          backgroundId={searchResult.equippedBackground}
                          scrimClassName="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35"
                        />
                      )}
                      <div
                        className="relative z-10 flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        onClick={() => setSelectedProfile(searchResult)}
                      >
                        <ScholarAvatar
                          displayName={searchResult.displayName}
                          photoURL={searchResult.photoURL}
                          frameId={searchResult.equippedFrame}
                          avatarId={searchResult.equippedAvatar}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-bold truncate ${
                                hasBanner ? 'text-white' : 'ch-text'
                              }`}
                            >
                              {searchResult.displayName}
                            </span>
                            <RankTierBadge
                              totalPointsEarned={searchResult.totalPointsEarned}
                              rankTierOverride={searchResult.rankTier}
                              compact
                              showLevel={false}
                            />
                          </div>
                          <div
                            className={`text-[11px] font-mono tabular-nums mt-0.5 ${
                              hasBanner ? 'text-white/80' : 'ch-text-muted'
                            }`}
                          >
                            ID #{searchResult.scholarId || computeScholarDigitId(searchResult.userId)} ·{' '}
                            {searchResult.primarySubject}
                          </div>
                        </div>
                      </div>

                      {rel !== 'self' && (
                        <div className="relative z-10 flex items-center gap-2 shrink-0">
                          {rel === 'friends' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              Friends
                            </span>
                          ) : rel === 'incoming' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const req = incomingRequests.find(
                                  (r) => r.fromUid === searchResult.userId
                                );
                                if (req) void onAcceptFriendRequest(req);
                              }}
                              className="px-3 py-1.5 rounded-xl ch-btn-primary text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept Request
                            </button>
                          ) : rel === 'outgoing' ? (
                            <span className="px-3 py-1.5 rounded-xl ch-glass-subtle text-xs font-semibold ch-text-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Request Sent
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={busyId === searchResult.userId}
                              onClick={async () => {
                                setBusyId(searchResult.userId);
                                try {
                                  await onSendFriendRequest(searchResult);
                                } finally {
                                  setBusyId(null);
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl ch-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Add Friend</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenSendGift(searchResult)}
                            className="px-3.5 py-2 rounded-xl ch-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Gift className="w-3.5 h-3.5 ch-text-accent" />
                            <span>Send Gift</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs ch-text-muted">
                    {searchAttempted
                      ? 'No registered scholar matched that 8-digit ID yet. Ask them to open Chronos once so their profile syncs.'
                      : 'Use the 8-digit ID box above to find any classmate or friend.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {subTab === 'requests' && (
            <div className="grid grid-cols-1 @2xl/main:grid-cols-2 gap-4">
              {/* Incoming */}
              <div className="p-4 sm:p-5 rounded-2xl ch-glass-card space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider ch-text-muted">
                  Incoming Requests ({incomingRequests.length})
                </div>
                {incomingRequests.length === 0 ? (
                  <p className="text-xs ch-text-muted py-4 text-center">
                    No pending incoming friend requests.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.requestId}
                        className="p-3 rounded-xl ch-glass-subtle flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <ScholarAvatar
                            displayName={req.fromName}
                            frameId={req.fromFrame}
                            avatarId={req.fromAvatar}
                            size="xs"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold ch-text truncate">
                              {req.fromName}
                            </div>
                            <div className="text-[10px] font-mono ch-text-muted tabular-nums truncate">
                              ID #{req.fromScholarId} · {req.fromPrimarySubject || 'Scholar'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={busyId === req.requestId}
                            onClick={async () => {
                              setBusyId(req.requestId);
                              try {
                                await onAcceptFriendRequest(req);
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            className="p-2 rounded-lg ch-btn-primary cursor-pointer disabled:opacity-50"
                            title="Accept friend request"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={busyId === req.requestId}
                            onClick={async () => {
                              setBusyId(req.requestId);
                              try {
                                await onDeclineFriendRequest(req.requestId);
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            className="p-2 rounded-lg ch-btn-secondary hover:text-rose-500 cursor-pointer disabled:opacity-50"
                            title="Decline friend request"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing */}
              <div className="p-4 sm:p-5 rounded-2xl ch-glass-card space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider ch-text-muted">
                  Sent Requests ({outgoingRequests.length})
                </div>
                {outgoingRequests.length === 0 ? (
                  <p className="text-xs ch-text-muted py-4 text-center">
                    No outgoing pending requests.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.requestId}
                        className="p-3 rounded-xl ch-glass-subtle flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <ScholarAvatar
                            displayName={req.toName}
                            frameId={req.toFrame}
                            avatarId={req.toAvatar}
                            size="xs"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold ch-text truncate">
                              {req.toName}
                            </div>
                            <div className="text-[10px] font-mono ch-text-muted tabular-nums truncate">
                              ID #{req.toScholarId} · Pending
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={busyId === req.requestId}
                          onClick={async () => {
                            setBusyId(req.requestId);
                            try {
                              await onCancelFriendRequest(req.requestId);
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg ch-btn-secondary text-[11px] font-semibold hover:text-rose-500 cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Friends List Tab */}
          {subTab === 'friends' && (
            <div className="space-y-3">
              {friendships.length === 0 ? (
                <div className="p-8 rounded-2xl ch-glass-card text-center space-y-3">
                  <Sparkles className="w-9 h-9 ch-text-accent mx-auto" />
                  <div className="text-sm font-bold ch-text">No Friends Added Yet</div>
                  <p className="text-xs ch-text-muted max-w-md mx-auto">
                    Search your classmates by their 8-digit Scholar ID above, or click any scholar on the Leaderboard to send them a Friend Request or Gift!
                  </p>
                  <button
                    type="button"
                    onClick={onNavigateToLeaderboard}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold ch-btn-primary rounded-xl cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Browse Scholar Leaderboard</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 @2xl/main:grid-cols-2 gap-3.5">
                  {friendships.map((f) => {
                    const scholar = resolveFriendCardData(f);
                    const hasBanner = Boolean(
                      scholar.equippedBackground &&
                        scholar.equippedBackground !== 'default'
                    );
                    const confirming = confirmRemoveUid === scholar.userId;

                    return (
                      <div
                        key={f.friendshipId}
                        className={`relative overflow-hidden p-4 rounded-2xl ch-glass-card flex flex-col justify-between gap-3 ${
                          hasBanner ? 'text-white' : ''
                        }`}
                        style={hasBanner ? { backgroundColor: '#0b0e14' } : undefined}
                      >
                        {hasBanner && (
                          <ProfileBannerBackdrop
                            backgroundId={scholar.equippedBackground}
                            scrimClassName="absolute inset-0 bg-gradient-to-r from-black/82 via-black/58 to-black/38"
                          />
                        )}

                        <div
                          className="relative z-10 flex items-center gap-3 min-w-0 cursor-pointer"
                          onClick={() => setSelectedProfile(scholar)}
                        >
                          <ScholarAvatar
                            displayName={scholar.displayName}
                            photoURL={scholar.photoURL}
                            frameId={scholar.equippedFrame}
                            avatarId={scholar.equippedAvatar}
                            size="sm"
                            showFrameBadge
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-bold truncate ${
                                  hasBanner ? 'text-white' : 'ch-text'
                                }`}
                              >
                                {scholar.displayName}
                              </span>
                              <RankTierBadge
                                totalPointsEarned={scholar.totalPointsEarned}
                                rankTierOverride={scholar.rankTier}
                                compact
                                showLevel={false}
                              />
                            </div>
                            <div
                              className={`text-[11px] font-mono tabular-nums mt-0.5 truncate ${
                                hasBanner ? 'text-white/80' : 'ch-text-muted'
                              }`}
                            >
                              ID #{scholar.scholarId || computeScholarDigitId(scholar.userId)} ·{' '}
                              {scholar.primarySubject} · {scholar.streakDays}d streak
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                          <button
                            type="button"
                            onClick={() => onOpenSendGift(scholar)}
                            className="px-3 py-1.5 rounded-xl ch-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Send Gift</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedProfile(scholar)}
                              className="px-2.5 py-1.5 rounded-xl ch-btn-secondary text-xs font-semibold cursor-pointer"
                            >
                              Profile
                            </button>
                            {confirming ? (
                              <button
                                type="button"
                                disabled={busyId === scholar.userId}
                                onClick={async () => {
                                  setBusyId(scholar.userId);
                                  try {
                                    await onRemoveFriendship(scholar.userId);
                                    setConfirmRemoveUid(null);
                                  } finally {
                                    setBusyId(null);
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmRemoveUid(scholar.userId)}
                                className="p-1.5 rounded-xl ch-btn-secondary hover:text-rose-500 cursor-pointer"
                                title="Remove friend"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Inspect Friend Public Card */}
      <PublicProfilePanel
        entry={selectedProfile}
        isCurrentUser={Boolean(activeUid && selectedProfile?.userId === activeUid)}
        isGuestViewer={isGuestUser}
        friendStatus={
          selectedProfile ? getRelationState(selectedProfile.userId) : 'none'
        }
        onAddFriend={
          selectedProfile
            ? () => void onSendFriendRequest(selectedProfile)
            : undefined
        }
        onAcceptFriend={
          selectedProfile
            ? () => {
                const req = incomingRequests.find(
                  (r) => r.fromUid === selectedProfile.userId
                );
                if (req) void onAcceptFriendRequest(req);
              }
            : undefined
        }
        onSendGift={
          selectedProfile
            ? () => {
                const target = selectedProfile;
                setSelectedProfile(null);
                onOpenSendGift(target);
              }
            : undefined
        }
        onSignInPrompt={() => {
          setSelectedProfile(null);
          onNavigateToProfile();
        }}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
};
