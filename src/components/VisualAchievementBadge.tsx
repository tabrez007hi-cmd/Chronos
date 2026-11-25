import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Award,
  Crown,
  Target,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  CheckSquare,
  Layers,
  BookOpen,
  Sun,
  Moon,
  Headphones,
  Music,
  Lock,
  X,
  Coins,
  Check,
} from 'lucide-react';
import { AchievementItem } from '../types';

interface VisualAchievementBadgeProps {
  achievement: AchievementItem;
  size?: 'sm' | 'md' | 'lg';
  showDetailsModalOnClick?: boolean;
  sealOnly?: boolean;
}

export const VisualAchievementBadge: React.FC<VisualAchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showDetailsModalOnClick = true,
  sealOnly = false,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const tierThemes = {
    diamond: {
      outerBorder: 'border-cyan-400/80 shadow-cyan-500/20',
      ringGrad: 'from-cyan-300 via-sky-500 to-indigo-600',
      faceBg: 'from-cyan-950/90 via-neutral-900 to-slate-950',
      textAccent: 'text-cyan-300',
      ribbonBg: 'bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-600 text-neutral-950',
      glow: 'shadow-lg shadow-cyan-500/25',
      unlockedLabel: 'text-cyan-600 dark:text-cyan-400',
    },
    platinum: {
      outerBorder: 'border-slate-300/80 shadow-slate-300/20',
      ringGrad: 'from-slate-100 via-slate-400 to-slate-600',
      faceBg: 'from-slate-900/90 via-neutral-900 to-neutral-950',
      textAccent: 'text-slate-200',
      ribbonBg: 'bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 text-neutral-950',
      glow: 'shadow-lg shadow-slate-400/20',
      unlockedLabel: 'text-slate-600 dark:text-slate-300',
    },
    gold: {
      outerBorder: 'border-amber-400/80 shadow-amber-500/25',
      ringGrad: 'from-amber-200 via-amber-500 to-amber-700',
      faceBg: 'from-amber-950/85 via-neutral-900 to-neutral-950',
      textAccent: 'text-amber-300',
      ribbonBg: 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 text-neutral-950',
      glow: 'shadow-lg shadow-amber-500/25',
      unlockedLabel: 'text-amber-600 dark:text-amber-400',
    },
    silver: {
      outerBorder: 'border-zinc-400/70 shadow-zinc-400/15',
      ringGrad: 'from-zinc-200 via-zinc-400 to-zinc-600',
      faceBg: 'from-zinc-900/85 via-neutral-900 to-neutral-950',
      textAccent: 'text-zinc-200',
      ribbonBg: 'bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-300 text-neutral-950',
      glow: 'shadow-md shadow-zinc-400/15',
      unlockedLabel: 'text-zinc-600 dark:text-zinc-300',
    },
    bronze: {
      outerBorder: 'border-amber-700/60 shadow-amber-800/15',
      ringGrad: 'from-amber-600 via-amber-800 to-neutral-900',
      faceBg: 'from-amber-950/70 via-neutral-900 to-neutral-950',
      textAccent: 'text-amber-400',
      ribbonBg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100',
      glow: 'shadow-md shadow-amber-800/15',
      unlockedLabel: 'text-amber-700 dark:text-amber-400',
    },
  }[achievement.tier];

  const renderEmblem = (className: string) => {
    switch (achievement.iconName) {
      case 'Crown':
        return <Crown className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Clock':
      case 'Timer':
        return <Clock className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'CheckSquare':
        return <CheckSquare className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'Moon':
        return <Moon className={className} />;
      case 'Headphones':
        return <Headphones className={className} />;
      case 'Music':
        return <Music className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const isUnlocked = achievement.unlocked;

  const sizeStyles = {
    sm: {
      wrapper: 'w-24 p-2',
      medallion: 'w-16 h-16',
      iconSize: 'w-7 h-7',
      ribbonText: 'text-[8px]',
      titleText: 'text-[10px]',
    },
    md: {
      wrapper: 'w-full max-w-[170px] p-2.5 sm:p-3',
      medallion: 'w-20 h-20 sm:w-22 sm:h-22',
      iconSize: 'w-8 h-8 sm:w-9 sm:h-9',
      ribbonText: 'text-[9px] sm:text-[10px]',
      titleText: 'text-xs',
    },
    lg: {
      wrapper: 'w-full max-w-[210px] p-4',
      medallion: 'w-24 h-24 sm:w-28 sm:h-28',
      iconSize: 'w-10 h-10 sm:w-12 sm:h-12',
      ribbonText: 'text-[10px] sm:text-[11px]',
      titleText: 'text-sm',
    },
  }[size];

  return (
    <>
      {sealOnly ? (
        <button
          type="button"
          onClick={() => showDetailsModalOnClick && setShowModal(true)}
          title={`${achievement.title} (${achievement.progressPercent}%)`}
          className="relative inline-flex items-center justify-center rounded-full group cursor-pointer focus:outline-none shrink-0"
        >
          <div
            className={`rounded-full p-1 transition-all duration-300 ${
              size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-22 h-22' : 'w-18 h-18'
            } flex items-center justify-center ${
              isUnlocked
                ? `bg-gradient-to-br ${tierThemes.ringGrad} ${tierThemes.glow}`
                : 'bg-neutral-800/80 border border-neutral-600/50 opacity-80 group-hover:opacity-100'
            }`}
          >
            <div
              className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden ${
                isUnlocked
                  ? `bg-gradient-to-b ${tierThemes.faceBg} border ${tierThemes.outerBorder}`
                  : 'bg-neutral-900 border border-neutral-700'
              }`}
            >
              {isUnlocked && (
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)] pointer-events-none" />
              )}

              {isUnlocked ? (
                <div
                  className={`${tierThemes.textAccent} drop-shadow-md group-hover:scale-110 transition-transform`}
                >
                  {renderEmblem(size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7')}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400">
                  <Lock className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-mono text-neutral-300 tabular-nums">
                    {achievement.progressPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {isUnlocked && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shadow-md border-2 border-neutral-900">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => showDetailsModalOnClick && setShowModal(true)}
          className={`${sizeStyles.wrapper} flex flex-col items-center justify-between text-center rounded-2xl transition-all duration-300 relative group cursor-pointer focus:outline-none ${
            isUnlocked
              ? 'ch-glass-card hover:-translate-y-0.5 hover:brightness-105'
              : 'ch-glass-subtle opacity-70 hover:opacity-95'
          }`}
        >
          {achievement.isFeatured && (
            <div className="w-full text-center text-[9px] font-extrabold uppercase tracking-widest ch-text-accent mb-0.5">
              ★ Featured
            </div>
          )}

          {/* Physical Medallion Seal */}
          <div className="relative mt-1 mb-2 flex items-center justify-center">
            <div
              className={`rounded-full p-1.5 transition-all duration-300 ${sizeStyles.medallion} flex items-center justify-center ${
                isUnlocked
                  ? `bg-gradient-to-br ${tierThemes.ringGrad} ${tierThemes.glow}`
                  : 'bg-neutral-800/80 border border-neutral-600/50'
              }`}
            >
              <div
                className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden ${
                  isUnlocked
                    ? `bg-gradient-to-b ${tierThemes.faceBg} border ${tierThemes.outerBorder}`
                    : 'bg-neutral-900 border border-neutral-700'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)] pointer-events-none" />
                )}

                {isUnlocked ? (
                  <div
                    className={`${tierThemes.textAccent} drop-shadow-md group-hover:scale-110 transition-transform`}
                  >
                    {renderEmblem(sizeStyles.iconSize)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400">
                    <Lock className="w-5 h-5 mb-0.5" />
                    <span className="text-[8px] font-mono text-neutral-300 tabular-nums">
                      {achievement.progressPercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isUnlocked && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shadow-md border-2 border-neutral-900">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>

          {/* Badge Ribbon Label */}
          <div className="w-full space-y-1">
            <div
              className={`font-mono uppercase font-black tracking-wider py-0.5 px-2 rounded-md truncate w-full shadow-xs ${
                sizeStyles.ribbonText
              } ${
                isUnlocked
                  ? tierThemes.ribbonBg
                  : 'bg-neutral-700/50 text-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {achievement.badgeLabel}
            </div>

            <div
              className={`font-bold leading-tight line-clamp-1 mt-1 ${sizeStyles.titleText} ${
                isUnlocked ? 'ch-text' : 'ch-text-muted'
              }`}
            >
              {achievement.title}
            </div>

            <div className="text-[10px] ch-text-muted flex items-center justify-center gap-1 font-mono tabular-nums">
              {isUnlocked ? (
                <span className="ch-text-accent font-bold flex items-center gap-0.5">
                  <Coins className="w-2.5 h-2.5" /> +{achievement.pointsReward} XP
                </span>
              ) : (
                <span className="truncate">{achievement.progressPercent}% complete</span>
              )}
            </div>
          </div>
        </button>
      )}

      {/* Details & Lore Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md ch-glass-modal rounded-3xl p-6 sm:p-7 space-y-5 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center pt-2">
              <div
                className={`w-28 h-28 rounded-full p-2 flex items-center justify-center ${
                  isUnlocked
                    ? `bg-gradient-to-br ${tierThemes.ringGrad} ${tierThemes.glow}`
                    : 'bg-neutral-800 border-2 border-neutral-700'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden ${
                    isUnlocked
                      ? `bg-gradient-to-b ${tierThemes.faceBg} border-2 ${tierThemes.outerBorder}`
                      : 'bg-neutral-900'
                  }`}
                >
                  {isUnlocked ? (
                    <div className={tierThemes.textAccent}>{renderEmblem('w-12 h-12')}</div>
                  ) : (
                    <Lock className="w-10 h-10 text-neutral-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span
                className={`inline-block font-mono font-black uppercase text-xs tracking-widest px-3 py-1 rounded-lg ${
                  isUnlocked ? tierThemes.ribbonBg : 'bg-neutral-700 text-neutral-200'
                }`}
              >
                {achievement.badgeLabel}
              </span>

              <h3 className="text-lg font-bold ch-text">{achievement.title}</h3>

              <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                <span className={`font-semibold capitalize ${tierThemes.unlockedLabel}`}>
                  {achievement.tier} Tier
                </span>
                <span className="ch-text-muted">·</span>
                <span className="ch-text-secondary font-medium">{achievement.rarity} Badge</span>
                <span className="ch-text-muted">·</span>
                <span className="ch-text-accent font-mono font-bold flex items-center gap-1 tabular-nums">
                  <Coins className="w-3.5 h-3.5" /> +{achievement.pointsReward} Focus XP
                </span>
              </div>
            </div>

            <p className="text-xs ch-text-secondary leading-relaxed ch-glass-subtle p-3.5 rounded-xl">
              {achievement.desc}
            </p>

            <div className="space-y-2 text-left ch-glass-subtle p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="ch-text-muted">Progress Requirement:</span>
                <span className="font-mono font-bold ch-text tabular-nums">
                  {achievement.progressText}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${achievement.progressPercent}%`,
                    backgroundColor: isUnlocked ? 'var(--ch-accent)' : 'var(--ch-text-muted)',
                  }}
                />
              </div>

              <div className="text-[11px] ch-text-muted flex items-center justify-between pt-1">
                <span>{isUnlocked ? '✓ Criteria fully met' : 'Keep studying to unlock'}</span>
                <span className="font-mono tabular-nums">{achievement.progressPercent}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 ch-btn-secondary font-bold rounded-xl text-xs cursor-pointer"
            >
              Close Badge Inspector
            </button>
          </div>
        </div>
      )}
    </>
  );
};
