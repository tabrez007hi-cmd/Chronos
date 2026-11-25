import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  ShoppingBag,
  Users,
  Youtube,
  Cloud,
  Frame,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { APP_SHORT_VERSION, APP_VERSION } from '../utils/version';

interface VersionUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStore?: () => void;
  onOpenChangelog?: () => void;
  onOpenFriends?: () => void;
}

const RELEASE_HIGHLIGHTS = [
  {
    icon: ShoppingBag,
    accentClass: 'ch-accent-soft',
    title: 'Redesigned Unified Store & Lag-Free Browsing',
    description:
      'Browse Frames, Backgrounds, Avatars, and Focus Music in one streamlined storefront. Owned items hide automatically from the catalog, load 12 at a time as you scroll, and organize cleanly inside your Wardrobe.',
  },
  {
    icon: Frame,
    accentClass:
      'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30',
    title: 'Illustrated Cosmetics & Transparent Ornate Frames',
    description:
      'Equip pre-generated anime scholar portraits, cozy twilight & rainy desk banners, and crisp transparent ornate frames (Sovereign Gold Laurel & Azure Celestial Dragon) with built-in copy protection.',
  },
  {
    icon: Users,
    accentClass:
      'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30',
    title: 'Friends Network, 8-Digit Scholar IDs & Gift Mailbox',
    description:
      'Every scholar gets a unique 8-digit ID. Search or request friends right from the Leaderboard, send frames, backgrounds, or avatars using XP, and unbox received gifts in the animated Mailbox.',
  },
  {
    icon: Youtube,
    accentClass:
      'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30',
    title: 'YouTube Focus Studio, Playlists & Audio Favourites',
    description:
      'Play and save custom YouTube study music URLs with auto-repeat, shuffle mode, and custom playlists (Deep Focus, Ambient, Lofi), plus manage your own Favourite Audio list in the Focus sidebar.',
  },
  {
    icon: Cloud,
    accentClass:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30',
    title: 'Cloud Subjects, Auto-Synced Rank & Multi-Device Focus',
    description:
      'Custom subjects now sync to Cloud Firestore, Leaderboard ranks update automatically without manual clicks, and Today’s Focus accurately detects study hours logged across devices.',
  },
];

export const VersionUpdateDialog: React.FC<VersionUpdateDialogProps> = ({
  isOpen,
  onClose,
  onOpenStore,
  onOpenChangelog,
  onOpenFriends,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chronos-update-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl ch-glass-modal overflow-hidden shadow-2xl"
        style={{ borderColor: 'var(--ch-accent-border)' }}
      >
        {/* Header */}
        <div className="relative px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b ch-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="inline-flex items-center gap-2 text-xs font-semibold ch-text-accent">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Chronos Update</span>
                <span className="px-2 py-0.5 rounded-md ch-accent-soft font-mono text-[11px] font-bold">
                  v{APP_VERSION}
                </span>
              </div>
              <h2
                id="chronos-update-dialog-title"
                className="text-xl sm:text-2xl font-extrabold tracking-tight ch-text"
              >
                What&apos;s New in Version {APP_SHORT_VERSION}
              </h2>
              <p className="text-xs sm:text-sm ch-text-secondary leading-relaxed">
                A major upgrade introducing the redesigned Unified Store, transparent ornate frames,
                Friends &amp; Gift Mailbox, YouTube focus playlists, and seamless cloud sync.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close update dialog"
              className="p-2 rounded-xl ch-btn-secondary ch-text-muted hover:ch-text shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Highlights */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 sm:py-5 space-y-3">
          {RELEASE_HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-3.5 sm:p-4 rounded-2xl ch-glass-subtle flex items-start gap-3.5"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.accentClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold ch-text leading-snug">{item.title}</h3>
                  <p className="text-xs ch-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-7 py-4 border-t ch-border shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenStore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStore();
                }}
                className="px-3.5 py-2 rounded-xl ch-btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 ch-text-accent" />
                <span>Explore Store</span>
              </button>
            )}
            {onOpenFriends && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFriends();
                }}
                className="px-3.5 py-2 rounded-xl ch-btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 ch-text-accent" />
                <span>Friends</span>
              </button>
            )}
            {onOpenChangelog && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChangelog();
                }}
                className="px-3.5 py-2 rounded-xl ch-btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Full Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl ch-btn-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Got It, Start Focusing</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
