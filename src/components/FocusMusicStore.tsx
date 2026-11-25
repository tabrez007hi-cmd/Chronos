import React, { useMemo, useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import {
  X,
  ShoppingBag,
  Sparkles,
  Check,
  Search,
  Coins,
  Music,
  Frame,
  Image as ImageIcon,
  Shield,
  SlidersHorizontal,
  ArrowLeft,
  RotateCcw,
  Play,
  Headphones,
  Radio,
  WifiOff,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Crown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from 'lucide-react';
import {
  AmbientSoundType,
  ChronosWallet,
  CosmeticRarity,
  FocusMusicTrack,
  StoreAvatarItem,
  StoreBackgroundItem,
  StoreFrameItem,
} from '../types';
import {
  FOCUS_TRACKS_CATALOG,
  STORE_AVATARS_CATALOG,
  STORE_BACKGROUNDS_CATALOG,
  STORE_FRAMES_CATALOG,
  equipStoreCosmetic,
  getStoreAvatarById,
  getStoreBackgroundById,
  getStoreFrameById,
  loadChronosWallet,
  purchaseStoreCosmetic,
  unlockStoreTrack,
} from '../utils/storage';
import { startAmbientSound } from '../utils/audio';
import { ProfileBannerBackdrop, RankTierBadge, ScholarAvatar } from './ScholarCosmetics';

export type StoreSectionTab = 'all' | 'frames' | 'backgrounds' | 'avatars' | 'music';
type StoreSortMode = 'featured' | 'rarity-desc' | 'rarity-asc' | 'price-asc' | 'price-desc';
type WardrobeTab = 'frames' | 'backgrounds' | 'avatars';

const STORE_SORT_OPTIONS: {
  id: StoreSortMode;
  label: string;
  shortLabel: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'featured',
    label: 'Featured Collection',
    shortLabel: 'Featured',
    hint: 'Curated mix across categories',
    icon: Sparkles,
  },
  {
    id: 'rarity-desc',
    label: 'Rarity: Mythic → Rare',
    shortLabel: 'Rarity: High → Low',
    hint: 'Mythic, Legendary, Epic, Rare',
    icon: Crown,
  },
  {
    id: 'rarity-asc',
    label: 'Rarity: Rare → Mythic',
    shortLabel: 'Rarity: Low → High',
    hint: 'Rare, Epic, Legendary, Mythic',
    icon: Shield,
  },
  {
    id: 'price-asc',
    label: 'Price: Low to High',
    shortLabel: 'Price: Low → High',
    hint: 'Lowest XP cost first',
    icon: ArrowUpNarrowWide,
  },
  {
    id: 'price-desc',
    label: 'Price: High to Low',
    shortLabel: 'Price: High → Low',
    hint: 'Highest XP cost first',
    icon: ArrowDownWideNarrow,
  },
];

const STORE_BATCH_SIZE = 12;
const WARDROBE_BATCH_SIZE = 16;

interface FocusMusicStoreProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: ChronosWallet;
  onWalletUpdated: (wallet: ChronosWallet) => void;
  displayName?: string;
  photoURL?: string;
  initialSection?: StoreSectionTab;
  onOpenMusicMenu?: () => void;
  onSelectSound?: (sound: AmbientSoundType) => void;
  ambientVolume?: number;
}

type UnifiedStoreEntry =
  | {
      kind: 'frame';
      key: string;
      id: string;
      name: string;
      subtitle: string;
      description: string;
      rarity: CosmeticRarity;
      costPoints: number;
      isAnimated?: boolean;
      hasArtwork?: boolean;
      item: StoreFrameItem;
    }
  | {
      kind: 'background';
      key: string;
      id: string;
      name: string;
      subtitle: string;
      description: string;
      rarity: CosmeticRarity;
      costPoints: number;
      isAnimated?: boolean;
      hasArtwork?: boolean;
      item: StoreBackgroundItem;
    }
  | {
      kind: 'avatar';
      key: string;
      id: string;
      name: string;
      subtitle: string;
      description: string;
      rarity: CosmeticRarity;
      costPoints: number;
      isAnimated?: boolean;
      hasArtwork?: boolean;
      item: StoreAvatarItem;
    }
  | {
      kind: 'music';
      key: string;
      id: AmbientSoundType;
      name: string;
      subtitle: string;
      description: string;
      rarity: CosmeticRarity;
      costPoints: number;
      isAnimated?: boolean;
      hasArtwork?: boolean;
      item: FocusMusicTrack;
    };

const RARITY_RANK: Record<CosmeticRarity, number> = {
  Starter: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
  Mythic: 4,
};

const RARITY_TEXT_CLASS: Record<CosmeticRarity, string> = {
  Starter: 'text-zinc-500 dark:text-zinc-400',
  Rare: 'text-sky-600 dark:text-sky-400',
  Epic: 'text-violet-600 dark:text-violet-400',
  Legendary: 'text-amber-600 dark:text-amber-400',
  Mythic: 'text-rose-600 dark:text-rose-400',
};

const preventAssetCopy = (e: React.SyntheticEvent) => {
  e.preventDefault();
};

function getMusicRarity(costPoints: number): CosmeticRarity {
  if (costPoints >= 320) return 'Legendary';
  if (costPoints >= 200) return 'Epic';
  return 'Rare';
}

function getKindLabel(entry: UnifiedStoreEntry): string {
  if (entry.kind === 'frame') return 'Frame';
  if (entry.kind === 'background') return 'Background';
  if (entry.kind === 'avatar') return entry.item.isPortrait ? 'Portrait' : 'Avatar';
  return entry.item.sourceType === 'youtube' ? 'YouTube Music' : 'Offline Audio';
}

function getMusicArtworkGradient(track: FocusMusicTrack): string {
  if (track.id === 'yt-rain-thunder') {
    return 'linear-gradient(135deg, #0b132b 0%, #1c2541 48%, #3a506b 100%)';
  }
  if (track.id === 'yt-chillhop') {
    return 'linear-gradient(135deg, #2d142c 0%, #510a32 50%, #c72c41 100%)';
  }
  if (track.id === 'yt-dark-academia') {
    return 'linear-gradient(135deg, #1b1512 0%, #3d2c20 52%, #6e4f35 100%)';
  }
  if (track.id === 'yt-japanese-lofi') {
    return 'linear-gradient(135deg, #161032 0%, #3d2c8d 52%, #916bbf 100%)';
  }
  if (track.id === 'piano') {
    return 'linear-gradient(135deg, #171717 0%, #3f3f46 52%, #71717a 100%)';
  }
  if (track.id === 'waves') {
    return 'linear-gradient(135deg, #042f2e 0%, #0f766e 54%, #0284c7 100%)';
  }
  if (track.id === 'lofi') {
    return 'linear-gradient(135deg, #2e1065 0%, #6d28d9 50%, #db2777 100%)';
  }
  if (track.id === 'cosmic') {
    return 'linear-gradient(135deg, #090617 0%, #312e81 50%, #6b21a8 100%)';
  }
  return 'linear-gradient(135deg, #111827 0%, #1e293b 55%, #334155 100%)';
}

const MusicArtVisual: React.FC<{ track: FocusMusicTrack; compact?: boolean }> = React.memo(
  ({ track, compact = false }) => {
    const isYouTube = track.sourceType === 'youtube';
    const bars = [38, 66, 92, 54, 82, 46, 74, 60, 88, 44, 70, 52];

    return (
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none ch-protected-asset"
        style={{ background: getMusicArtworkGradient(track) }}
        onContextMenu={preventAssetCopy}
        onDragStart={preventAssetCopy}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-32 h-32 rounded-full border border-white/40" />
          <div className="absolute w-48 h-48 rounded-full border border-white/25" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2.5 px-4 text-center">
          <div
            className={`${
              compact ? 'w-11 h-11' : 'w-12 h-12'
            } rounded-2xl bg-black/35 border border-white/20 flex items-center justify-center text-white shadow-lg`}
          >
            {isYouTube ? <Radio className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
          </div>

          <div className="flex items-end gap-1 h-5" aria-hidden="true">
            {bars.map((height, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full bg-white/70"
                style={{ height: `${Math.max(20, Math.round((height / 100) * 20))}px` }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/80">
            {isYouTube ? (
              <span>YouTube Stream</span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" />
                Offline Synth
              </span>
            )}
            {track.bpm ? (
              <>
                <span>·</span>
                <span className="font-mono tabular-nums">{track.bpm} BPM</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

const StoreCardSkeleton: React.FC = () => (
  <div
    className="rounded-2xl overflow-hidden border ch-border ch-glass-card flex flex-col animate-pulse"
    aria-hidden="true"
  >
    <div className="h-40 sm:h-44 w-full bg-black/15 dark:bg-white/[0.06] relative overflow-hidden flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-black/15 dark:bg-white/[0.08]" />
    </div>
    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
      <div className="space-y-2">
        <div className="h-2.5 w-24 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-3/4 rounded-md bg-black/15 dark:bg-white/15" />
        <div className="h-3 w-1/2 rounded-md bg-black/10 dark:bg-white/10" />
      </div>
      <div className="pt-2.5 border-t ch-border flex items-center justify-between gap-2">
        <div className="h-4 w-20 rounded-md bg-black/15 dark:bg-white/12" />
        <div className="h-7 w-16 rounded-xl bg-black/15 dark:bg-white/12" />
      </div>
    </div>
  </div>
);

interface StoreItemCardProps {
  entry: UnifiedStoreEntry;
  isSelected: boolean;
  canAfford: boolean;
  missingXp: number;
  displayName: string;
  photoURL?: string;
  equippedAvatarId: string;
  onSelect: (entry: UnifiedStoreEntry) => void;
  onBuy: (entry: UnifiedStoreEntry) => void;
}

const StoreItemCard: React.FC<StoreItemCardProps> = React.memo(
  ({
    entry,
    isSelected,
    canAfford,
    missingXp,
    displayName,
    photoURL,
    equippedAvatarId,
    onSelect,
    onBuy,
  }) => {
    const renderVisual = () => {
      if (entry.kind === 'frame') {
        return (
          <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${entry.item.badgeColor}66 0%, transparent 68%)`,
              }}
            />
            <ScholarAvatar
              displayName={displayName}
              photoURL={photoURL}
              frameId={entry.id}
              avatarId={equippedAvatarId}
              size="lg"
              staticPreview
            />
          </div>
        );
      }
      if (entry.kind === 'background') {
        return (
          <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
            <ProfileBannerBackdrop
              backgroundId={entry.id}
              scrimClassName="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              staticPreview
            />
          </div>
        );
      }
      if (entry.kind === 'avatar') {
        return (
          <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${entry.item.accentHex}55 0%, transparent 70%)`,
              }}
            />
            <ScholarAvatar
              displayName={displayName}
              photoURL={photoURL}
              frameId="default"
              avatarId={entry.id}
              size="xl"
              staticPreview
            />
          </div>
        );
      }
      return <MusicArtVisual track={entry.item} />;
    };

    return (
      <article
        onClick={() => onSelect(entry)}
        onContextMenu={preventAssetCopy}
        onDragStart={preventAssetCopy}
        className={`ch-store-card-contain ch-protected-asset group rounded-2xl overflow-hidden border transition-all duration-150 flex flex-col cursor-pointer hover:-translate-y-0.5 ${
          isSelected
            ? 'border-[var(--ch-accent)] ring-1 ring-[var(--ch-accent)] bg-[var(--ch-surface)] shadow-lg'
            : 'ch-glass-card hover:border-[var(--ch-border-strong)]'
        }`}
      >
        {/* 65-70% Visual Showcase Stage with Non-Copyable Shield */}
        <div className="h-40 sm:h-44 w-full shrink-0 relative overflow-hidden">
          {renderVisual()}
          <div
            className="absolute inset-0 z-20 select-none"
            onContextMenu={preventAssetCopy}
            onDragStart={preventAssetCopy}
            aria-hidden="true"
          />
        </div>

        {/* Clean Editorial Metadata & Price Row */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider truncate">
              <span className={RARITY_TEXT_CLASS[entry.rarity]}>{entry.rarity}</span>
              <span className="ch-text-muted" aria-hidden="true">
                ·
              </span>
              <span className="ch-text-muted">{getKindLabel(entry)}</span>
              {!entry.hasArtwork && entry.isAnimated && (
                <>
                  <span className="ch-text-muted" aria-hidden="true">
                    ·
                  </span>
                  <span className="ch-text-accent">Animated</span>
                </>
              )}
            </div>

            <h3 className="text-[15px] font-semibold ch-text leading-snug line-clamp-1">
              {entry.name}
            </h3>
            <p className="text-xs ch-text-muted line-clamp-1">{entry.subtitle}</p>
          </div>

          <div className="pt-2.5 border-t ch-border flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-bold ch-text tabular-nums">
              {entry.costPoints.toLocaleString()} XP
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (canAfford) {
                  onBuy(entry);
                } else {
                  onSelect(entry);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer inline-flex items-center gap-1 ${
                canAfford ? 'ch-btn-primary' : 'ch-btn-secondary ch-text-muted'
              }`}
              title={
                canAfford
                  ? `Purchase ${entry.name} for ${entry.costPoints.toLocaleString()} XP`
                  : `Need ${missingXp.toLocaleString()} more XP`
              }
            >
              {canAfford ? (
                <span>Buy</span>
              ) : (
                <>
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Inspect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }
);

export const FocusMusicStore: React.FC<FocusMusicStoreProps> = ({
  isOpen,
  onClose,
  wallet,
  onWalletUpdated,
  displayName = 'Study Scholar',
  photoURL,
  initialSection = 'all',
  onOpenMusicMenu,
  onSelectSound,
  ambientVolume = 0.35,
}) => {
  const [viewMode, setViewMode] = useState<'store' | 'wardrobe'>('store');
  const [section, setSection] = useState<StoreSectionTab>(initialSection);
  const [wardrobeTab, setWardrobeTab] = useState<WardrobeTab>('frames');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [sortMode, setSortMode] = useState<StoreSortMode>('featured');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const [affordableOnly, setAffordableOnly] = useState(false);

  // Horizontal scroll arrows for Store category content bar
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState<boolean>(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState<boolean>(false);

  const updateCategoryScrollArrows = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollCatLeft(el.scrollLeft > 4);
    setCanScrollCatRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollCategoryTabs = useCallback((direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'right' ? 180 : -180,
      behavior: 'smooth',
    });
  }, []);

  // Close custom sort dropdown on outside click or Escape
  useEffect(() => {
    if (!isSortMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isSortMenuOpen]);

  // Keep horizontal swipe arrows synced with viewport width & tab counts
  useEffect(() => {
    if (!isOpen || viewMode !== 'store') return;
    const el = categoryScrollRef.current;
    if (!el) return;
    const raf = window.requestAnimationFrame(updateCategoryScrollArrows);
    el.addEventListener('scroll', updateCategoryScrollArrows, { passive: true });
    window.addEventListener('resize', updateCategoryScrollArrows);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateCategoryScrollArrows);
      ro.observe(el);
    }
    return () => {
      window.cancelAnimationFrame(raf);
      el.removeEventListener('scroll', updateCategoryScrollArrows);
      window.removeEventListener('resize', updateCategoryScrollArrows);
      ro?.disconnect();
    };
  }, [isOpen, viewMode, updateCategoryScrollArrows]);

  // Progressive 12-item infinite scroll & content loading states
  const [visibleCount, setVisibleCount] = useState<number>(STORE_BATCH_SIZE);
  const [wardrobeVisibleCount, setWardrobeVisibleCount] = useState<number>(WARDROBE_BATCH_SIZE);
  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const gridScrollRef = useRef<HTMLDivElement | null>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const wardrobeScrollRef = useRef<HTMLDivElement | null>(null);
  const wardrobeSentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTimerRef = useRef<number | null>(null);

  // Selected item for the Live Fitting Room / Product Detail Inspector
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [previewFrameId, setPreviewFrameId] = useState<string | null>(null);
  const [previewBackgroundId, setPreviewBackgroundId] = useState<string | null>(null);
  const [previewAvatarId, setPreviewAvatarId] = useState<string | null>(null);

  // Post-purchase confirmation banner
  const [purchaseNotice, setPurchaseNotice] = useState<{
    name: string;
    cost: number;
    kind: UnifiedStoreEntry['kind'];
    trackId?: AmbientSoundType;
  } | null>(null);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setViewMode('store');
      setSection(initialSection);
      setSearchQuery('');
      setVisibleCount(STORE_BATCH_SIZE);
      setWardrobeVisibleCount(WARDROBE_BATCH_SIZE);
      setPreviewFrameId(null);
      setPreviewBackgroundId(null);
      setPreviewAvatarId(null);
      setPurchaseNotice(null);
      setIsLoadingMore(false);
    }
    return () => {
      if (loadMoreTimerRef.current) {
        window.clearTimeout(loadMoreTimerRef.current);
        loadMoreTimerRef.current = null;
      }
    };
  }, [isOpen, initialSection]);

  // Smooth content-loading skeleton feedback when opening store or switching category/sort/search/mode
  useEffect(() => {
    if (!isOpen) return;
    setIsContentLoading(true);
    setIsLoadingMore(false);
    setVisibleCount(STORE_BATCH_SIZE);
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 0;
    }
    const timer = window.setTimeout(() => {
      setIsContentLoading(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [isOpen, section, deferredSearch, sortMode, affordableOnly, viewMode]);

  // Reset wardrobe batch when switching wardrobe tabs
  useEffect(() => {
    setWardrobeVisibleCount(WARDROBE_BATCH_SIZE);
    if (wardrobeScrollRef.current) {
      wardrobeScrollRef.current.scrollTop = 0;
    }
  }, [wardrobeTab, viewMode]);

  // Build STRICTLY UNOWNED purchasable catalog — purchased & free items NEVER show in Store
  const unownedEntries = useMemo<UnifiedStoreEntry[]>(() => {
    const frames: UnifiedStoreEntry[] = STORE_FRAMES_CATALOG.filter(
      (f) => f.costPoints > 0 && !wallet.unlockedFrames.includes(f.id)
    ).map((item) => ({
      kind: 'frame',
      key: `frame:${item.id}`,
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      description: item.description,
      rarity: item.rarity,
      costPoints: item.costPoints,
      isAnimated: item.isAnimated,
      hasArtwork: Boolean(item.imageUrl),
      item,
    }));

    const backgrounds: UnifiedStoreEntry[] = STORE_BACKGROUNDS_CATALOG.filter(
      (b) => b.costPoints > 0 && !wallet.unlockedBackgrounds.includes(b.id)
    ).map((item) => ({
      kind: 'background',
      key: `background:${item.id}`,
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      description: item.description,
      rarity: item.rarity,
      costPoints: item.costPoints,
      isAnimated: item.isAnimated,
      hasArtwork: Boolean(item.imageUrl),
      item,
    }));

    const avatars: UnifiedStoreEntry[] = STORE_AVATARS_CATALOG.filter(
      (a) => a.costPoints > 0 && !wallet.unlockedAvatars.includes(a.id)
    ).map((item) => ({
      kind: 'avatar',
      key: `avatar:${item.id}`,
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      description: item.description,
      rarity: item.rarity,
      costPoints: item.costPoints,
      isAnimated: item.isAnimated,
      hasArtwork: Boolean(item.imageUrl),
      item,
    }));

    const music: UnifiedStoreEntry[] = FOCUS_TRACKS_CATALOG.filter(
      (t) => t.costPoints > 0 && !wallet.unlockedTracks.includes(t.id)
    ).map((item) => ({
      kind: 'music',
      key: `music:${item.id}`,
      id: item.id,
      name: item.title,
      subtitle: item.channel ? `${item.channel} · ${item.category}` : item.subtitle,
      description: item.description,
      rarity: getMusicRarity(item.costPoints),
      costPoints: item.costPoints,
      item,
    }));

    // Lead Featured view with interleaved Illustrated Collection items across Frames, Avatars & Backgrounds
    const artFrames: UnifiedStoreEntry[] = [];
    const artBackgrounds: UnifiedStoreEntry[] = [];
    const artAvatars: UnifiedStoreEntry[] = [];
    const remainingFrames: UnifiedStoreEntry[] = [];
    const remainingBackgrounds: UnifiedStoreEntry[] = [];
    const remainingAvatars: UnifiedStoreEntry[] = [];

    for (const f of frames) {
      if (f.hasArtwork) artFrames.push(f);
      else remainingFrames.push(f);
    }
    for (const b of backgrounds) {
      if (b.hasArtwork) artBackgrounds.push(b);
      else remainingBackgrounds.push(b);
    }
    for (const a of avatars) {
      if (a.hasArtwork) artAvatars.push(a);
      else remainingAvatars.push(a);
    }

    const illustratedInterleaved: UnifiedStoreEntry[] = [];
    const artBuckets = [artFrames, artAvatars, artBackgrounds];
    const maxArtLen = Math.max(...artBuckets.map((b) => b.length), 0);
    for (let i = 0; i < maxArtLen; i++) {
      for (const bucket of artBuckets) {
        if (bucket[i]) illustratedInterleaved.push(bucket[i]);
      }
    }

    const interleavedRest: UnifiedStoreEntry[] = [];
    const buckets = [music, remainingFrames, remainingBackgrounds, remainingAvatars];
    const maxLen = Math.max(...buckets.map((b) => b.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (bucket[i]) interleavedRest.push(bucket[i]);
      }
    }

    return [...illustratedInterleaved, ...interleavedRest];
  }, [
    wallet.unlockedFrames,
    wallet.unlockedBackgrounds,
    wallet.unlockedAvatars,
    wallet.unlockedTracks,
  ]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: unownedEntries.length,
      frames: 0,
      backgrounds: 0,
      avatars: 0,
      music: 0,
    };
    for (const entry of unownedEntries) {
      if (entry.kind === 'frame') counts.frames += 1;
      else if (entry.kind === 'background') counts.backgrounds += 1;
      else if (entry.kind === 'avatar') counts.avatars += 1;
      else if (entry.kind === 'music') counts.music += 1;
    }
    return counts;
  }, [unownedEntries]);

  const filteredEntries = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const list = unownedEntries.filter((entry) => {
      if (section === 'frames' && entry.kind !== 'frame') return false;
      if (section === 'backgrounds' && entry.kind !== 'background') return false;
      if (section === 'avatars' && entry.kind !== 'avatar') return false;
      if (section === 'music' && entry.kind !== 'music') return false;
      if (affordableOnly && entry.costPoints > wallet.points) return false;
      if (q) {
        const hay = `${entry.name} ${entry.subtitle} ${entry.description} ${entry.rarity} ${entry.kind}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortMode === 'price-asc') {
      return [...list].sort((a, b) => a.costPoints - b.costPoints);
    }
    if (sortMode === 'price-desc') {
      return [...list].sort((a, b) => b.costPoints - a.costPoints);
    }
    if (sortMode === 'rarity-desc') {
      return [...list].sort(
        (a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity] || b.costPoints - a.costPoints
      );
    }
    if (sortMode === 'rarity-asc') {
      return [...list].sort(
        (a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity] || a.costPoints - b.costPoints
      );
    }
    return list;
  }, [unownedEntries, section, affordableOnly, wallet.points, deferredSearch, sortMode]);

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, visibleCount),
    [filteredEntries, visibleCount]
  );

  const hasMoreStoreItems = visibleCount < filteredEntries.length;

  const triggerLoadMoreStoreItems = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredEntries.length) return;
    setIsLoadingMore(true);
    if (loadMoreTimerRef.current) {
      window.clearTimeout(loadMoreTimerRef.current);
    }
    loadMoreTimerRef.current = window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(filteredEntries.length, prev + STORE_BATCH_SIZE));
      setIsLoadingMore(false);
      loadMoreTimerRef.current = null;
    }, 180);
  }, [isLoadingMore, visibleCount, filteredEntries.length]);

  // IntersectionObserver for smooth 12-item progressive infinite scroll in Store
  useEffect(() => {
    if (!isOpen || viewMode !== 'store' || !hasMoreStoreItems || isContentLoading || isLoadingMore) {
      return;
    }
    const sentinel = loadMoreSentinelRef.current;
    const root = gridScrollRef.current;
    if (!sentinel || !root || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          triggerLoadMoreStoreItems();
        }
      },
      { root, rootMargin: '220px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    isOpen,
    viewMode,
    hasMoreStoreItems,
    isContentLoading,
    isLoadingMore,
    triggerLoadMoreStoreItems,
  ]);

  // Keep selected item valid
  const selectedEntry = useMemo(() => {
    if (selectedKey) {
      const found = filteredEntries.find((e) => e.key === selectedKey);
      if (found) return found;
    }
    return filteredEntries[0] || null;
  }, [filteredEntries, selectedKey]);

  // Owned lists for Wardrobe
  const ownedFrames = useMemo(
    () =>
      STORE_FRAMES_CATALOG.filter(
        (f) => f.costPoints === 0 || wallet.unlockedFrames.includes(f.id)
      ),
    [wallet.unlockedFrames]
  );
  const ownedBackgrounds = useMemo(
    () =>
      STORE_BACKGROUNDS_CATALOG.filter(
        (b) => b.costPoints === 0 || wallet.unlockedBackgrounds.includes(b.id)
      ),
    [wallet.unlockedBackgrounds]
  );
  const ownedAvatars = useMemo(
    () =>
      STORE_AVATARS_CATALOG.filter(
        (a) => a.costPoints === 0 || wallet.unlockedAvatars.includes(a.id)
      ),
    [wallet.unlockedAvatars]
  );
  const totalOwnedCosmetics = ownedFrames.length + ownedBackgrounds.length + ownedAvatars.length;

  const currentWardrobeTotal =
    wardrobeTab === 'frames'
      ? ownedFrames.length
      : wardrobeTab === 'backgrounds'
      ? ownedBackgrounds.length
      : ownedAvatars.length;
  const hasMoreWardrobeItems = wardrobeVisibleCount < currentWardrobeTotal;

  // IntersectionObserver for smooth infinite scroll inside My Wardrobe
  useEffect(() => {
    if (!isOpen || viewMode !== 'wardrobe' || !hasMoreWardrobeItems) return;
    const sentinel = wardrobeSentinelRef.current;
    const root = wardrobeScrollRef.current;
    if (!sentinel || !root || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setWardrobeVisibleCount((prev) =>
            Math.min(currentWardrobeTotal, prev + WARDROBE_BATCH_SIZE)
          );
        }
      },
      { root, rootMargin: '240px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, viewMode, hasMoreWardrobeItems, currentWardrobeTotal, wardrobeVisibleCount]);

  const handleSelectEntry = useCallback((entry: UnifiedStoreEntry) => {
    setSelectedKey(entry.key);
    if (entry.kind === 'frame') {
      setPreviewFrameId(entry.id);
    } else if (entry.kind === 'background') {
      setPreviewBackgroundId(entry.id);
    } else if (entry.kind === 'avatar') {
      setPreviewAvatarId(entry.id);
    }
  }, []);

  const handleResetPreview = useCallback(() => {
    setPreviewFrameId(null);
    setPreviewBackgroundId(null);
    setPreviewAvatarId(null);
  }, []);

  const handlePurchaseEntry = useCallback(
    (entry: UnifiedStoreEntry) => {
      if (wallet.points < entry.costPoints) return;

      if (entry.kind === 'music') {
        const ok = unlockStoreTrack(entry.id, entry.costPoints);
        if (ok) {
          onWalletUpdated(loadChronosWallet());
          setPurchaseNotice({
            name: entry.name,
            cost: entry.costPoints,
            kind: 'music',
            trackId: entry.id,
          });
          setSelectedKey(null);
        }
        return;
      }

      const res = purchaseStoreCosmetic(entry.kind, entry.id, entry.costPoints);
      if (res.success) {
        onWalletUpdated(res.wallet);
        if (entry.kind === 'frame') setPreviewFrameId(null);
        if (entry.kind === 'background') setPreviewBackgroundId(null);
        if (entry.kind === 'avatar') setPreviewAvatarId(null);
        setPurchaseNotice({
          name: entry.name,
          cost: entry.costPoints,
          kind: entry.kind,
        });
        setSelectedKey(null);
      }
    },
    [wallet.points, onWalletUpdated]
  );

  const handleEquipOwned = useCallback(
    (category: 'frame' | 'background' | 'avatar', itemId: string) => {
      const updated = equipStoreCosmetic(category, itemId);
      onWalletUpdated(updated);
    },
    [onWalletUpdated]
  );

  if (!isOpen) return null;

  const activeFrameId = previewFrameId || wallet.equippedFrame;
  const activeBackgroundId = previewBackgroundId || wallet.equippedBackground;
  const activeAvatarId = previewAvatarId || wallet.equippedAvatar;
  const isPreviewingCustom = Boolean(previewFrameId || previewBackgroundId || previewAvatarId);

  const categoryTabs: {
    id: StoreSectionTab;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    { id: 'all', label: 'All Items', count: categoryCounts.all, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'frames', label: 'Frames', count: categoryCounts.frames, icon: <Frame className="w-3.5 h-3.5" /> },
    { id: 'backgrounds', label: 'Backgrounds', count: categoryCounts.backgrounds, icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'avatars', label: 'Avatars', count: categoryCounts.avatars, icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'music', label: 'Focus Music', count: categoryCounts.music, icon: <Music className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl h-[94dvh] sm:h-[90dvh] ch-glass-modal rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Store Navigation Header */}
        <header className="px-4 py-3.5 sm:px-6 sm:py-4 border-b ch-border shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {viewMode === 'wardrobe' ? (
              <button
                type="button"
                onClick={() => setViewMode('store')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ch-btn-secondary text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Store</span>
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight ch-text">
                  {viewMode === 'store' ? 'Chronos Store' : 'My Owned Wardrobe'}
                </h2>
                <span className="text-xs ch-text-muted tabular-nums">
                  {viewMode === 'store'
                    ? `${categoryCounts.all} available to unlock`
                    : `${totalOwnedCosmetics} owned cosmetics`}
                </span>
              </div>
            </div>
          </div>

          {/* Search + Balance + Wardrobe Toggle + Close */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
            {viewMode === 'store' && (
              <div className="relative flex-1 sm:flex-initial sm:w-56">
                <Search className="w-3.5 h-3.5 ch-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search frames, banners, music..."
                  className="w-full ch-input rounded-xl pl-8 pr-7 py-1.5 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 ch-text-muted hover:ch-text cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'store' ? 'wardrobe' : 'store'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                viewMode === 'wardrobe' ? 'ch-btn-primary' : 'ch-btn-secondary'
              }`}
              title="Equip items you already own"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{viewMode === 'wardrobe' ? 'Back to Store' : 'My Wardrobe'}</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ch-accent-soft font-mono text-xs font-bold tabular-nums shrink-0">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span>{wallet.points.toLocaleString()} XP</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close Store"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ===================== STORE MODE (12-ITEM PROGRESSIVE SCROLL, UNOWNED ONLY) ===================== */}
        {viewMode === 'store' ? (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT / MAIN: Category Bar + Progressive 12-Item Product Grid */}
            <div className="flex-1 min-w-0 flex flex-col min-h-0">
              {/* Category Filter Bar (with horizontal swipe arrows) + Custom Glassmorphic Sort Dropdown */}
              <div className="relative z-30 px-4 sm:px-6 py-3 border-b ch-border shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex items-center min-w-0 flex-1">
                  {canScrollCatLeft && (
                    <button
                      type="button"
                      onClick={() => scrollCategoryTabs('left')}
                      aria-label="Scroll categories left"
                      title="Swipe left"
                      className="absolute left-0 z-10 h-8 w-7 rounded-lg ch-glass-modal border ch-border flex items-center justify-center ch-text hover:ch-text-accent shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  <div
                    ref={categoryScrollRef}
                    className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 scroll-smooth w-full ${
                      canScrollCatLeft ? 'pl-8' : ''
                    } ${canScrollCatRight ? 'pr-9' : ''}`}
                  >
                    {categoryTabs.map((tab) => {
                      const active = section === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSection(tab.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                            active ? 'ch-btn-primary' : 'ch-btn-secondary'
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                          <span className="font-mono text-[11px] opacity-75 tabular-nums">
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {canScrollCatRight && (
                    <div className="absolute right-0 z-10 flex items-center pl-4 bg-gradient-to-l from-[var(--ch-surface)] via-[var(--ch-surface)]/85 to-transparent rounded-r-xl">
                      <button
                        type="button"
                        onClick={() => scrollCategoryTabs('right')}
                        aria-label="Scroll categories right"
                        title="Swipe right for more categories"
                        className="h-8 w-7 rounded-lg ch-accent-soft border flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={() => setAffordableOnly((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer border transition-colors ${
                      affordableOnly ? 'ch-accent-soft' : 'ch-btn-secondary'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Can Afford</span>
                  </button>

                  {/* Bespoke Glassmorphic Sort & Rarity Dropdown */}
                  <div ref={sortMenuRef} className="relative">
                    {(() => {
                      const activeOpt =
                        STORE_SORT_OPTIONS.find((opt) => opt.id === sortMode) ||
                        STORE_SORT_OPTIONS[0];
                      const ActiveIcon = activeOpt.icon;
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsSortMenuOpen((o) => !o)}
                            aria-haspopup="listbox"
                            aria-expanded={isSortMenuOpen}
                            aria-label="Arrange store items"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer border transition-all ${
                              isSortMenuOpen
                                ? 'ch-accent-soft shadow-sm'
                                : 'ch-btn-secondary hover:border-[var(--ch-accent)]'
                            }`}
                          >
                            <ActiveIcon className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                            <span>{activeOpt.shortLabel}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 ch-text-muted transition-transform duration-150 ${
                                isSortMenuOpen ? 'rotate-180 ch-text-accent' : ''
                              }`}
                            />
                          </button>

                          {isSortMenuOpen && (
                            <div
                              role="listbox"
                              aria-label="Arrange store items by"
                              className="absolute right-0 mt-2 w-60 rounded-2xl ch-glass-modal border ch-border shadow-2xl p-1.5 z-40 animate-fade-in"
                            >
                              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ch-text-muted flex items-center gap-1.5 border-b ch-border mb-1">
                                <SlidersHorizontal className="w-3 h-3 ch-text-accent" />
                                <span>Arrange Store By</span>
                              </div>
                              <div className="space-y-0.5">
                                {STORE_SORT_OPTIONS.map((opt) => {
                                  const OptIcon = opt.icon;
                                  const selected = opt.id === sortMode;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      onClick={() => {
                                        setSortMode(opt.id);
                                        setIsSortMenuOpen(false);
                                      }}
                                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                        selected
                                          ? 'ch-accent-soft'
                                          : 'hover:bg-black/5 dark:hover:bg-white/[0.06]'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2.5 min-w-0">
                                        <OptIcon
                                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                            selected ? 'ch-text-accent' : 'ch-text-muted'
                                          }`}
                                        />
                                        <div className="min-w-0">
                                          <div
                                            className={`text-xs font-semibold truncate ${
                                              selected ? 'ch-text-accent' : 'ch-text'
                                            }`}
                                          >
                                            {opt.label}
                                          </div>
                                          <div className="text-[10px] ch-text-muted truncate">
                                            {opt.hint}
                                          </div>
                                        </div>
                                      </div>
                                      {selected && (
                                        <Check className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Purchase Confirmation Banner */}
              {purchaseNotice && (
                <div className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 animate-fade-in shrink-0">
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold ch-text truncate">
                      Unlocked &ldquo;{purchaseNotice.name}&rdquo;
                      {purchaseNotice.kind !== 'music' ? ' & equipped on your profile' : ''}
                    </span>
                    <span className="font-mono text-[11px] ch-text-muted tabular-nums shrink-0">
                      −{purchaseNotice.cost.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {purchaseNotice.kind === 'music' && purchaseNotice.trackId && (
                      <button
                        type="button"
                        onClick={() => {
                          const tid = purchaseNotice.trackId!;
                          onSelectSound?.(tid);
                          startAmbientSound(tid, ambientVolume);
                          setPurchaseNotice(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ch-btn-primary text-[11px] font-bold cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play Now</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPurchaseNotice(null)}
                      className="p-1 ch-text-muted hover:ch-text cursor-pointer"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable Progressive Boutique Product Grid */}
              <div ref={gridScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
                {isContentLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 text-xs ch-text-muted">
                      <span className="inline-flex items-center gap-2 font-semibold ch-text">
                        <Loader2 className="w-3.5 h-3.5 animate-spin ch-text-accent" />
                        <span>Loading Store collection…</span>
                      </span>
                      <span className="font-mono text-[11px] tabular-nums">
                        Preparing previews
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <StoreCardSkeleton key={idx} />
                      ))}
                    </div>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center max-w-md mx-auto py-10 space-y-3">
                    <div className="w-12 h-12 rounded-2xl ch-accent-soft flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold ch-text">
                      {categoryCounts.all === 0
                        ? 'You own the entire Chronos collection!'
                        : searchQuery || affordableOnly
                        ? 'No unowned items match your filter'
                        : 'Everything in this category is already yours'}
                    </h3>
                    <p className="text-xs ch-text-muted leading-relaxed">
                      {searchQuery || affordableOnly
                        ? 'Try clearing your search or turning off the Can Afford filter to browse more items.'
                        : 'Purchased items are automatically removed from the Store. Equip your cosmetics in My Wardrobe or play your unlocked tracks in Background Music.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {(searchQuery || affordableOnly) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setAffordableOnly(false);
                          }}
                          className="px-3.5 py-2 rounded-xl ch-btn-primary text-xs font-bold cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                      {section !== 'all' && categoryCounts.all > 0 && (
                        <button
                          type="button"
                          onClick={() => setSection('all')}
                          className="px-3.5 py-2 rounded-xl ch-btn-secondary text-xs font-semibold cursor-pointer"
                        >
                          View All Available ({categoryCounts.all})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewMode('wardrobe')}
                        className="px-3.5 py-2 rounded-xl ch-btn-secondary text-xs font-semibold cursor-pointer"
                      >
                        Open My Wardrobe
                      </button>
                      {section === 'music' && onOpenMusicMenu && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMusicMenu();
                          }}
                          className="px-3.5 py-2 rounded-xl ch-accent-soft text-xs font-semibold cursor-pointer"
                        >
                          Open Music Player
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {visibleEntries.map((entry) => {
                        const canAfford = wallet.points >= entry.costPoints;
                        return (
                          <StoreItemCard
                            key={entry.key}
                            entry={entry}
                            isSelected={selectedEntry?.key === entry.key}
                            canAfford={canAfford}
                            missingXp={Math.max(0, entry.costPoints - wallet.points)}
                            displayName={displayName}
                            photoURL={photoURL}
                            equippedAvatarId={wallet.equippedAvatar}
                            onSelect={handleSelectEntry}
                            onBuy={handlePurchaseEntry}
                          />
                        );
                      })}
                      {isLoadingMore &&
                        Array.from({ length: 3 }).map((_, idx) => (
                          <StoreCardSkeleton key={`more-skel-${idx}`} />
                        ))}
                    </div>

                    {/* Infinite Scroll Sentinel + Manual Fallback with Loading Indicator */}
                    <div
                      ref={loadMoreSentinelRef}
                      className="mt-6 pt-4 border-t ch-border flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ch-text-muted"
                    >
                      <span className="font-mono tabular-nums inline-flex items-center gap-2">
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin ch-text-accent" />
                            <span className="font-sans font-semibold ch-text">
                              Loading next items…
                            </span>
                          </>
                        ) : (
                          <span>
                            Showing {visibleEntries.length} of {filteredEntries.length} items
                          </span>
                        )}
                      </span>
                      {hasMoreStoreItems && (
                        <button
                          type="button"
                          disabled={isLoadingMore}
                          onClick={triggerLoadMoreStoreItems}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ch-btn-secondary text-xs font-semibold cursor-pointer hover:border-[var(--ch-accent)] disabled:opacity-60"
                        >
                          {isLoadingMore ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin ch-text-accent" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 ch-text-accent" />
                          )}
                          <span>
                            {isLoadingMore
                              ? 'Loading…'
                              : `Load ${Math.min(STORE_BATCH_SIZE, filteredEntries.length - visibleEntries.length)} More`}
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Compact Bottom Sticky Inspector Bar */}
              {selectedEntry && (
                <div className="lg:hidden px-4 py-3 border-t ch-border ch-glass-panel shrink-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider ch-text-muted truncate">
                      {selectedEntry.rarity} · {getKindLabel(selectedEntry)}
                    </div>
                    <div className="text-xs font-bold ch-text truncate">
                      {selectedEntry.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={wallet.points < selectedEntry.costPoints}
                    onClick={() => handlePurchaseEntry(selectedEntry)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      wallet.points >= selectedEntry.costPoints
                        ? 'ch-btn-primary'
                        : 'ch-btn-secondary'
                    }`}
                  >
                    {wallet.points >= selectedEntry.costPoints
                      ? `Buy · ${selectedEntry.costPoints.toLocaleString()} XP`
                      : `Need ${(selectedEntry.costPoints - wallet.points).toLocaleString()} XP`}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT STICKY FITTING ROOM & CONTIGUOUS PURCHASE MODULE (DESKTOP) */}
            <aside className="hidden lg:flex w-[328px] xl:w-[356px] shrink-0 border-l ch-border flex-col overflow-y-auto p-5 gap-5 bg-black/[0.02] dark:bg-white/[0.015]">
              {/* Live Scholar Card Fitting Room (Full Live Animations + Anti-Copy Protection) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider ch-text-muted">
                    {selectedEntry?.kind === 'music' ? 'Audio Showcase' : 'Live Try-On Studio'}
                  </span>
                  {isPreviewingCustom && selectedEntry?.kind !== 'music' && (
                    <button
                      type="button"
                      onClick={handleResetPreview}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold ch-text-accent hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {selectedEntry?.kind === 'music' ? (
                  <div className="rounded-2xl overflow-hidden border ch-border h-44 shadow-md">
                    <MusicArtVisual track={selectedEntry.item} />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl overflow-hidden border ch-border bg-zinc-950 text-white relative shadow-md ch-protected-asset"
                    onContextMenu={preventAssetCopy}
                    onDragStart={preventAssetCopy}
                  >
                    <div className="relative p-5 min-h-[172px] flex flex-col justify-end">
                      <ProfileBannerBackdrop backgroundId={activeBackgroundId} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                      <div className="relative z-10 flex items-center gap-3.5">
                        <ScholarAvatar
                          displayName={displayName}
                          photoURL={photoURL}
                          frameId={activeFrameId}
                          avatarId={activeAvatarId}
                          size="lg"
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-bold text-white truncate">
                            {displayName}
                          </div>
                          <RankTierBadge totalPointsEarned={wallet.totalPointsEarned} />
                        </div>
                      </div>
                      {/* Non-copyable transparent shield over Try-On card */}
                      <div
                        className="absolute inset-0 z-20 select-none"
                        onContextMenu={preventAssetCopy}
                        onDragStart={preventAssetCopy}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="px-4 py-2.5 bg-black/55 border-t border-white/10 text-[11px] text-white/75 flex items-center justify-between gap-2">
                      <span className="truncate">
                        {getStoreFrameById(activeFrameId).name} ·{' '}
                        {getStoreBackgroundById(activeBackgroundId).name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contiguous Purchase Module for Selected Item */}
              {selectedEntry ? (
                <div className="flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                        <span className={RARITY_TEXT_CLASS[selectedEntry.rarity]}>
                          {selectedEntry.rarity}
                        </span>
                        <span className="ch-text-muted">·</span>
                        <span className="ch-text-muted">{getKindLabel(selectedEntry)}</span>
                        {!selectedEntry.hasArtwork && selectedEntry.isAnimated && (
                          <>
                            <span className="ch-text-muted">·</span>
                            <span className="ch-text-accent">Animated</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-bold ch-text leading-snug">
                        {selectedEntry.name}
                      </h3>
                      <p className="text-xs ch-text-secondary leading-relaxed">
                        {selectedEntry.description}
                      </p>
                    </div>

                    {selectedEntry.kind === 'music' && (
                      <div className="pt-2 border-t ch-border space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="ch-text-muted">Source</span>
                          <span className="font-semibold ch-text">
                            {selectedEntry.item.sourceType === 'youtube'
                              ? selectedEntry.item.channel || 'YouTube Focus'
                              : 'Offline Built-In Synth'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="ch-text-muted">Category</span>
                          <span className="font-semibold ch-text">
                            {selectedEntry.item.category}
                          </span>
                        </div>
                        {selectedEntry.item.bpm && (
                          <div className="flex items-center justify-between">
                            <span className="ch-text-muted">Tempo</span>
                            <span className="font-mono font-semibold ch-text tabular-nums">
                              {selectedEntry.item.bpm} BPM
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing Summary & Primary Buy CTA */}
                  <div className="pt-4 border-t ch-border space-y-3">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="ch-text-muted">Item Price</span>
                        <span className="font-mono font-bold ch-text tabular-nums">
                          {selectedEntry.costPoints.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="ch-text-muted">Your Balance</span>
                        <span className="font-mono font-semibold ch-text-accent tabular-nums">
                          {wallet.points.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t ch-border">
                        <span className="ch-text-muted">
                          {wallet.points >= selectedEntry.costPoints
                            ? 'After Purchase'
                            : 'XP Needed'}
                        </span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            wallet.points >= selectedEntry.costPoints
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-500'
                          }`}
                        >
                          {wallet.points >= selectedEntry.costPoints
                            ? `${(wallet.points - selectedEntry.costPoints).toLocaleString()} XP`
                            : `+${(selectedEntry.costPoints - wallet.points).toLocaleString()} XP (~${Math.max(
                                1,
                                Math.ceil((selectedEntry.costPoints - wallet.points) / 60)
                              )}h focus)`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={wallet.points < selectedEntry.costPoints}
                      onClick={() => handlePurchaseEntry(selectedEntry)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        wallet.points >= selectedEntry.costPoints
                          ? 'ch-btn-primary shadow-md'
                          : 'ch-btn-secondary'
                      }`}
                    >
                      {wallet.points >= selectedEntry.costPoints ? (
                        <>
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          <span>
                            Purchase · {selectedEntry.costPoints.toLocaleString()} XP
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>Insufficient XP</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] ch-text-muted text-center">
                      {selectedEntry.kind === 'music'
                        ? 'Unlocks permanently in Ambient Focus Audio & Background Music.'
                        : 'Unlocks permanently and equips immediately on your Scholar profile.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-xs ch-text-muted px-4">
                  Select any item in the store to inspect and try it on before purchasing.
                </div>
              )}
            </aside>
          </div>
        ) : (
          /* ===================== MY OWNED WARDROBE MODE (EQUIP ONLY — PROGRESSIVE SCROLL) ===================== */
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b ch-border shrink-0 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: 'frames', label: 'Owned Frames', count: ownedFrames.length },
                    { id: 'backgrounds', label: 'Owned Backgrounds', count: ownedBackgrounds.length },
                    { id: 'avatars', label: 'Owned Avatars', count: ownedAvatars.length },
                  ] as { id: WardrobeTab; label: string; count: number }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setWardrobeTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                      wardrobeTab === tab.id ? 'ch-btn-primary' : 'ch-btn-secondary'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="font-mono text-[11px] opacity-75 tabular-nums">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-xs ch-text-muted truncate">
                Equipped: <strong className="ch-text">{getStoreFrameById(wallet.equippedFrame).name}</strong> ·{' '}
                <strong className="ch-text">{getStoreBackgroundById(wallet.equippedBackground).name}</strong> ·{' '}
                <strong className="ch-text">{getStoreAvatarById(wallet.equippedAvatar).name}</strong>
              </div>
            </div>

            <div ref={wardrobeScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wardrobeTab === 'frames' &&
                  ownedFrames.slice(0, wardrobeVisibleCount).map((frame) => {
                    const isEquipped = wallet.equippedFrame === frame.id;
                    return (
                      <div
                        key={frame.id}
                        onContextMenu={preventAssetCopy}
                        onDragStart={preventAssetCopy}
                        className={`ch-store-card-contain ch-protected-asset rounded-2xl overflow-hidden border flex flex-col ${
                          isEquipped
                            ? 'border-[var(--ch-accent)] ring-1 ring-[var(--ch-accent)]'
                            : 'ch-glass-card'
                        }`}
                      >
                        <div className="h-36 bg-zinc-950 flex items-center justify-center relative">
                          <ScholarAvatar
                            displayName={displayName}
                            photoURL={photoURL}
                            frameId={frame.id}
                            avatarId={wallet.equippedAvatar}
                            size="lg"
                            staticPreview
                          />
                          <div
                            className="absolute inset-0 z-20 select-none"
                            onContextMenu={preventAssetCopy}
                            onDragStart={preventAssetCopy}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="p-3.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold ch-text truncate">{frame.name}</div>
                            <div className={`text-[10px] font-semibold uppercase ${RARITY_TEXT_CLASS[frame.rarity]}`}>
                              {frame.rarity}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isEquipped}
                            onClick={() => handleEquipOwned('frame', frame.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                              isEquipped
                                ? 'ch-accent-soft cursor-default'
                                : 'ch-btn-secondary hover:border-[var(--ch-accent)]'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {wardrobeTab === 'backgrounds' &&
                  ownedBackgrounds.slice(0, wardrobeVisibleCount).map((bg) => {
                    const isEquipped = wallet.equippedBackground === bg.id;
                    return (
                      <div
                        key={bg.id}
                        onContextMenu={preventAssetCopy}
                        onDragStart={preventAssetCopy}
                        className={`ch-store-card-contain ch-protected-asset rounded-2xl overflow-hidden border flex flex-col ${
                          isEquipped
                            ? 'border-[var(--ch-accent)] ring-1 ring-[var(--ch-accent)]'
                            : 'ch-glass-card'
                        }`}
                      >
                        <div className="h-36 bg-zinc-950 relative overflow-hidden">
                          <ProfileBannerBackdrop backgroundId={bg.id} staticPreview />
                          <div
                            className="absolute inset-0 z-20 select-none"
                            onContextMenu={preventAssetCopy}
                            onDragStart={preventAssetCopy}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="p-3.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold ch-text truncate">{bg.name}</div>
                            <div className={`text-[10px] font-semibold uppercase ${RARITY_TEXT_CLASS[bg.rarity]}`}>
                              {bg.rarity}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isEquipped}
                            onClick={() => handleEquipOwned('background', bg.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                              isEquipped
                                ? 'ch-accent-soft cursor-default'
                                : 'ch-btn-secondary hover:border-[var(--ch-accent)]'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {wardrobeTab === 'avatars' &&
                  ownedAvatars.slice(0, wardrobeVisibleCount).map((av) => {
                    const isEquipped = wallet.equippedAvatar === av.id;
                    return (
                      <div
                        key={av.id}
                        onContextMenu={preventAssetCopy}
                        onDragStart={preventAssetCopy}
                        className={`ch-store-card-contain ch-protected-asset rounded-2xl overflow-hidden border flex flex-col ${
                          isEquipped
                            ? 'border-[var(--ch-accent)] ring-1 ring-[var(--ch-accent)]'
                            : 'ch-glass-card'
                        }`}
                      >
                        <div className="h-36 bg-zinc-950 flex items-center justify-center relative">
                          <ScholarAvatar
                            displayName={displayName}
                            photoURL={photoURL}
                            frameId="default"
                            avatarId={av.id}
                            size="lg"
                            staticPreview
                          />
                          <div
                            className="absolute inset-0 z-20 select-none"
                            onContextMenu={preventAssetCopy}
                            onDragStart={preventAssetCopy}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="p-3.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold ch-text truncate">{av.name}</div>
                            <div className={`text-[10px] font-semibold uppercase ${RARITY_TEXT_CLASS[av.rarity]}`}>
                              {av.rarity}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isEquipped}
                            onClick={() => handleEquipOwned('avatar', av.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                              isEquipped
                                ? 'ch-accent-soft cursor-default'
                                : 'ch-btn-secondary hover:border-[var(--ch-accent)]'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {hasMoreWardrobeItems && (
                <div
                  ref={wardrobeSentinelRef}
                  className="mt-5 pt-4 border-t ch-border flex items-center justify-between text-xs ch-text-muted"
                >
                  <span className="font-mono tabular-nums">
                    Showing {Math.min(wardrobeVisibleCount, currentWardrobeTotal)} of {currentWardrobeTotal}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setWardrobeVisibleCount((prev) =>
                        Math.min(currentWardrobeTotal, prev + WARDROBE_BATCH_SIZE)
                      )
                    }
                    className="px-3 py-1.5 rounded-xl ch-btn-secondary text-xs font-semibold cursor-pointer"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
