import React, { useState } from 'react';
import {
  X,
  Trophy,
  Flame,
  Clock,
  Award,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Calendar,
  Compass,
  Crown,
  UserPlus,
  UserCheck,
  Check,
  Gift,
  Copy,
  LogIn,
} from 'lucide-react';
import { PublicLeaderboardEntry } from '../types';
import { computeScholarDigitId, getScholarRank } from '../utils/storage';
import { ProfileBannerBackdrop, RankTierBadge, ScholarAvatar } from './ScholarCosmetics';

interface PublicProfilePanelProps {
  entry: PublicLeaderboardEntry | null;
  onClose: () => void;
  isCurrentUser?: boolean;
  isGuestViewer?: boolean;
  friendStatus?: 'self' | 'friends' | 'incoming' | 'outgoing' | 'none';
  onAddFriend?: () => void;
  onAcceptFriend?: () => void;
  onSendGift?: () => void;
  onSignInPrompt?: () => void;
}

function formatDurationCompact(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
}

export const PublicProfilePanel: React.FC<PublicProfilePanelProps> = ({
  entry,
  onClose,
  isCurrentUser = false,
  isGuestViewer = false,
  friendStatus = 'none',
  onAddFriend,
  onAcceptFriend,
  onSendGift,
  onSignInPrompt,
}) => {
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [actionBusy, setActionBusy] = useState<boolean>(false);

  if (!entry) return null;

  const scholarDigitId = !entry.isGuest
    ? entry.scholarId || computeScholarDigitId(entry.userId)
    : null;

  const handleCopyScholarId = () => {
    if (!scholarDigitId) return;
    navigator.clipboard?.writeText(scholarDigitId).catch(() => {});
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const totalHours = (entry.totalMinutes / 60).toFixed(1);
  const hasCustomBanner = Boolean(
    entry.equippedBackground && entry.equippedBackground !== 'default'
  );
  const scholarRank = getScholarRank(entry.totalPointsEarned);

  const milestoneBadges = [
    { id: '100h', label: '100h Century Club', earned: entry.totalMinutes >= 6000 },
    { id: '50h', label: '50h Iron Mind', earned: entry.totalMinutes >= 3000 },
    { id: '10h', label: '10h Tenacious', earned: entry.totalMinutes >= 600 },
    { id: '30d', label: '30-Day Habit Master', earned: entry.streakDays >= 30 },
    { id: '7d', label: '7-Day Streak Warrior', earned: entry.streakDays >= 7 },
    { id: '3d', label: '3-Day Consistency', earned: entry.streakDays >= 3 },
  ];

  const earnedMilestones = milestoneBadges.filter((m) => m.earned);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg ch-glass-modal rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between px-5 py-4 border-b ch-border ch-glass-subtle shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider ch-text-secondary truncate">
              Public Scholar Profile {isCurrentUser ? '· You' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close public profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Identity Summary with Equipped Banner, Frame & Avatar */}
          <div
            className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border ch-border ${
              hasCustomBanner ? 'text-white' : 'ch-glass-subtle'
            }`}
            style={hasCustomBanner ? { backgroundColor: '#090b10' } : undefined}
          >
            <ProfileBannerBackdrop backgroundId={entry.equippedBackground} />

            <div className="relative z-10 flex items-start gap-4">
              <ScholarAvatar
                displayName={entry.displayName}
                photoURL={entry.photoURL}
                frameId={entry.equippedFrame}
                avatarId={entry.equippedAvatar}
                size="lg"
                showFrameBadge
              />

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`text-lg font-bold truncate ${
                      hasCustomBanner ? 'text-white' : 'ch-text'
                    }`}
                  >
                    {entry.displayName}
                  </h3>
                  <RankTierBadge
                    totalPointsEarned={entry.totalPointsEarned}
                    rankTierOverride={entry.rankTier}
                    compact
                  />
                </div>

                <div
                  className={`flex flex-wrap items-center gap-2 text-[11px] font-mono ${
                    hasCustomBanner ? 'text-amber-300' : 'ch-text-accent'
                  }`}
                >
                  <span>
                    {entry.rankTitle} · Level {scholarRank.level}
                  </span>
                  {scholarDigitId && (
                    <button
                      type="button"
                      onClick={handleCopyScholarId}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        hasCustomBanner
                          ? 'bg-black/35 border-white/25 text-white/90 hover:bg-black/55'
                          : 'ch-glass-subtle border-[var(--ch-border)] ch-text hover:brightness-105'
                      }`}
                      title="Copy 8-digit Scholar ID"
                    >
                      <span>ID #{scholarDigitId}</span>
                      {copiedId ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-75 shrink-0" />
                      )}
                    </button>
                  )}
                </div>

                <div
                  className={`flex flex-wrap items-center gap-1.5 text-xs ${
                    hasCustomBanner ? 'text-white/80' : 'ch-text-muted'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>{entry.studyLevel || 'Scholar'}</span>
                  <span>·</span>
                  <span
                    className={`font-medium ${
                      hasCustomBanner ? 'text-amber-300' : 'ch-text-accent'
                    }`}
                  >
                    {entry.primarySubject || 'General'}
                  </span>
                  {entry.isGuest && (
                    <>
                      <span>·</span>
                      <span>Guest Mode</span>
                    </>
                  )}
                </div>

                {entry.bio && (
                  <p
                    className={`text-xs italic pt-1 leading-relaxed ${
                      hasCustomBanner ? 'text-white/85' : 'ch-text-secondary'
                    }`}
                  >
                    &ldquo;{entry.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Friend & Gift Social Actions */}
          {!isCurrentUser && !entry.isGuest && (onAddFriend || onAcceptFriend || onSendGift || onSignInPrompt) && (
            <div className="p-3.5 rounded-2xl ch-glass-subtle flex flex-wrap items-center justify-between gap-2.5">
              {isGuestViewer ? (
                <button
                  type="button"
                  onClick={onSignInPrompt}
                  className="w-full py-2.5 px-4 rounded-xl ch-btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Add Friend &amp; Send Gifts</span>
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                    {friendStatus === 'friends' ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/35 text-xs font-bold flex items-center justify-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Friends</span>
                      </div>
                    ) : friendStatus === 'outgoing' ? (
                      <div className="w-full py-2 px-3 rounded-xl ch-btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5 opacity-85">
                        <Clock className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                        <span>Request Sent</span>
                      </div>
                    ) : friendStatus === 'incoming' ? (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={async () => {
                          if (!onAcceptFriend) return;
                          setActionBusy(true);
                          try {
                            await onAcceptFriend();
                          } finally {
                            setActionBusy(false);
                          }
                        }}
                        className="w-full py-2 px-3 rounded-xl ch-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{actionBusy ? 'Accepting...' : 'Accept Request'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={async () => {
                          if (!onAddFriend) return;
                          setActionBusy(true);
                          try {
                            await onAddFriend();
                          } finally {
                            setActionBusy(false);
                          }
                        }}
                        className="w-full py-2 px-3 rounded-xl ch-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-105 disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                        <span>{actionBusy ? 'Sending...' : 'Request Friend'}</span>
                      </button>
                    )}
                  </div>

                  {onSendGift && (
                    <button
                      type="button"
                      onClick={onSendGift}
                      className="flex-1 min-w-[140px] py-2 px-3.5 rounded-xl ch-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 shrink-0" />
                      <span>Send Gift</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Active Daily Focus Word */}
          {entry.focusWord && (
            <div className="p-3.5 rounded-2xl ch-accent-soft flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Compass className="w-4 h-4 ch-text-accent shrink-0" />
                <span className="text-xs ch-text-secondary">Today&apos;s Focus Word</span>
              </div>
              <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider ch-text-accent truncate">
                {entry.focusWord}
              </span>
            </div>
          )}

          {/* Daily / Weekly / Yearly Verified Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ch-text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 ch-text-accent" />
                <span>Verified Study Standings (1 XP/min)</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl ch-glass-subtle text-center">
                <div className="text-[10px] font-semibold uppercase tracking-wider ch-text-muted">
                  Daily
                </div>
                <div className="font-mono text-base sm:text-lg font-bold ch-text tabular-nums mt-1">
                  {formatDurationCompact(entry.dailyMinutes)}
                </div>
                <div className="font-mono text-[11px] ch-text-accent tabular-nums">
                  {entry.dailyPoints} XP
                </div>
              </div>

              <div className="p-3 rounded-2xl ch-glass-subtle text-center">
                <div className="text-[10px] font-semibold uppercase tracking-wider ch-text-muted">
                  Weekly
                </div>
                <div className="font-mono text-base sm:text-lg font-bold ch-text tabular-nums mt-1">
                  {formatDurationCompact(entry.weeklyMinutes)}
                </div>
                <div className="font-mono text-[11px] ch-text-accent tabular-nums">
                  {entry.weeklyPoints} XP
                </div>
              </div>

              <div className="p-3 rounded-2xl ch-glass-subtle text-center">
                <div className="text-[10px] font-semibold uppercase tracking-wider ch-text-muted">
                  Yearly
                </div>
                <div className="font-mono text-base sm:text-lg font-bold ch-text tabular-nums mt-1">
                  {formatDurationCompact(entry.yearlyMinutes)}
                </div>
                <div className="font-mono text-[11px] ch-text-accent tabular-nums">
                  {entry.yearlyPoints} XP
                </div>
              </div>
            </div>
          </div>

          {/* Lifetime Honors Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl ch-glass-subtle">
              <div className="flex items-center gap-1.5 text-[11px] ch-text-muted">
                <Clock className="w-3.5 h-3.5 ch-text-accent" />
                <span>Lifetime</span>
              </div>
              <div className="font-mono text-sm font-bold ch-text tabular-nums mt-1">
                {totalHours} hrs
              </div>
            </div>

            <div className="p-3 rounded-xl ch-glass-subtle">
              <div className="flex items-center gap-1.5 text-[11px] ch-text-muted">
                <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                <span>Streak</span>
              </div>
              <div className="font-mono text-sm font-bold ch-text tabular-nums mt-1">
                {entry.streakDays} days
              </div>
            </div>

            <div className="p-3 rounded-xl ch-glass-subtle">
              <div className="flex items-center gap-1.5 text-[11px] ch-text-muted">
                <Trophy className="w-3.5 h-3.5 ch-text-accent" />
                <span>Total XP</span>
              </div>
              <div className="font-mono text-sm font-bold ch-text-accent tabular-nums mt-1">
                {entry.totalPointsEarned.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl ch-glass-subtle">
              <div className="flex items-center gap-1.5 text-[11px] ch-text-muted">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Medallions</span>
              </div>
              <div className="font-mono text-sm font-bold ch-text tabular-nums mt-1">
                {entry.unlockedBadgesCount} earned
              </div>
            </div>
          </div>

          {/* Public Milestone Emblems */}
          <div className="space-y-2 pt-2 border-t ch-border">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ch-text-muted">
              <Crown className="w-3.5 h-3.5 ch-text-accent" />
              <span>Verified Milestone Seals</span>
            </div>

            {earnedMilestones.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {earnedMilestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl ch-glass-subtle text-xs ch-text"
                  >
                    <Sparkles className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                    <span className="font-medium truncate">{m.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs ch-text-muted">
                Active scholar building toward their first 3-day streak and 10-hour milestone seals.
              </p>
            )}
          </div>
        </div>

        {/* Privacy Notice Footer */}
        <div className="px-5 py-3 ch-glass-subtle border-t ch-border flex items-center justify-between gap-3 text-[11px] ch-text-muted shrink-0">
          <span className="truncate">
            Public stats only · Email, tasks, alarms &amp; study notes stay private.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 ch-btn-secondary rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
