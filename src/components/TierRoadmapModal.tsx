import React from 'react';
import { X, Crown, CheckCircle2, Lock, Sparkles, Coins } from 'lucide-react';
import { SCHOLAR_TIER_LADDER, getScholarRank } from '../utils/storage';
import { getMajorTierIcon } from './ScholarCosmetics';

interface TierRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPointsEarned: number;
}

export const TierRoadmapModal: React.FC<TierRoadmapModalProps> = ({
  isOpen,
  onClose,
  totalPointsEarned,
}) => {
  if (!isOpen) return null;

  const currentRank = getScholarRank(totalPointsEarned);

  // Group sub-divisions by Major Tier (Bronze -> Conqueror)
  const majorGroups: {
    majorTier: string;
    accentHex: string;
    gradientClass: string;
    steps: typeof SCHOLAR_TIER_LADDER;
  }[] = [];

  for (const step of SCHOLAR_TIER_LADDER) {
    let group = majorGroups.find((g) => g.majorTier === step.majorTier);
    if (!group) {
      group = {
        majorTier: step.majorTier,
        accentHex: step.accentHex,
        gradientClass: step.gradientClass,
        steps: [],
      };
      majorGroups.push(group);
    }
    group.steps.push(step);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92dvh] ch-glass-modal rounded-3xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b ch-border ch-glass-subtle flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl ch-accent-soft flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold ch-text truncate">
                  Scholar Tier &amp; Level Ladder
                </h2>
                <span className="text-xs font-mono font-bold ch-text-accent">
                  · Lv.{currentRank.level}
                </span>
              </div>
              <p className="text-xs ch-text-muted truncate">
                Permanent rank progression from Bronze V up to Chronos Conqueror · Spending XP in Store never lowers your tier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Standing Banner */}
        <div className="p-4 sm:px-6 ch-glass-subtle border-b ch-border shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold ch-text flex items-center gap-1.5">
                  {getMajorTierIcon(currentRank.majorTier, 'w-4 h-4 ch-text-accent')}
                  <span>
                    Current Tier: <strong className="ch-text-accent">{currentRank.tier}</strong> (
                    {currentRank.title})
                  </span>
                </span>
                <span className="font-mono font-bold ch-text tabular-nums">
                  {currentRank.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentRank.gradientClass} transition-all duration-500`}
                  style={{ width: `${Math.max(4, currentRank.progressPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] ch-text-muted font-mono tabular-nums">
                <span>Lifetime: {totalPointsEarned.toLocaleString()} XP</span>
                <span>
                  {currentRank.nextTierLabel === 'Max Tier'
                    ? 'Maximum Prestige Reached'
                    : `Next (${currentRank.nextTierLabel}): ${currentRank.nextTierPoints.toLocaleString()} XP`}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold ch-text flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 ch-text-accent" />
                  <span>Study Level {currentRank.level}</span>
                </span>
                <span className="font-mono ch-text-muted tabular-nums">
                  {currentRank.xpIntoLevel} / {currentRank.xpForNextLevel} XP
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(4, currentRank.levelProgressPercent)}%`,
                    backgroundColor: 'var(--ch-accent)',
                  }}
                />
              </div>
              <div className="text-[11px] ch-text-muted flex items-center justify-between">
                <span>1 focus minute = +1 Lifetime XP</span>
                <span className="font-mono">{currentRank.levelProgressPercent}% to Lv.{currentRank.level + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* All Tiers List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {majorGroups.map((group) => {
            const groupMin = group.steps[0].minPoints;
            const groupUnlocked = totalPointsEarned >= groupMin;
            const isCurrentGroup = group.majorTier === currentRank.majorTier;

            return (
              <div
                key={group.majorTier}
                className={`p-4 rounded-2xl ch-glass-card space-y-3 transition-all ${
                  !groupUnlocked ? 'opacity-75' : ''
                }`}
                style={isCurrentGroup ? { borderColor: group.accentHex } : undefined}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${group.gradientClass} text-white flex items-center justify-center shadow-md`}
                    >
                      {getMajorTierIcon(group.majorTier, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold ch-text">{group.majorTier} Tier</h3>
                        {isCurrentGroup && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ch-accent-soft">
                            Current Division
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono ch-text-muted tabular-nums">
                        Unlocks at {groupMin.toLocaleString()} Lifetime XP (
                        {Math.round(groupMin / 60)} hrs)
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold flex items-center gap-1 ch-text-muted">
                    {groupUnlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reached
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> {(groupMin - totalPointsEarned).toLocaleString()} XP away
                      </span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {group.steps.map((sub) => {
                    const isSubReached = totalPointsEarned >= sub.minPoints;
                    const isCurrentSub = sub.tier === currentRank.tier;
                    return (
                      <div
                        key={sub.id}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isCurrentSub
                            ? 'ch-accent-soft shadow-sm'
                            : isSubReached
                              ? 'ch-glass-subtle'
                              : 'ch-glass-subtle opacity-60'
                        }`}
                        style={isCurrentSub ? { borderColor: sub.accentHex } : undefined}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold ch-text truncate">{sub.tier}</span>
                          {isSubReached && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] ch-text-muted truncate mt-0.5">{sub.title}</div>
                        <div className="text-[10px] font-mono ch-text-accent mt-1 flex items-center gap-0.5 tabular-nums">
                          <Coins className="w-2.5 h-2.5" />
                          {sub.minPoints.toLocaleString()} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
