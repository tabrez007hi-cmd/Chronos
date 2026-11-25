import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Headphones,
  CheckSquare,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  Volume2,
  Bell,
  LayoutTemplate,
  X,
  BarChart2,
  Trophy,
  Sun,
  Moon,
  User as UserIcon,
  RefreshCw,
  Music,
  Shuffle,
  SkipForward,
  Heart,
  SlidersHorizontal,
  Search,
  Play,
  Square,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import {
  AmbientSoundType,
  AppTab,
  StudyTask,
  AlarmItem,
  ChronosWallet,
  CustomizationSettings,
  SavedCustomYoutubeTrack,
} from '../types';
import {
  FOCUS_TRACKS_CATALOG,
  DEFAULT_CUSTOMIZATION,
  normalizePlaylistName,
} from '../utils/storage';
import {
  startAmbientSound,
  stopAmbientSound,
  updateAmbientVolume,
  subscribeAudioStatus,
  setAudioShuffleEnabled,
  playNextQueuedTrack,
  setAudioPlaybackQueue,
  playSavedCustomYouTubeTrack,
  AudioPlaybackStatus,
  QueuedAudioItem,
} from '../utils/audio';
import { useTimerControls } from '../context/TimerContext';
import { PWAInstallButton } from './PWAInstallButton';

interface TabletSidePanelProps {
  tasks: StudyTask[];
  onUpdateTasks: (tasks: StudyTask[]) => void;
  alarms: AlarmItem[];
  ambientSound: AmbientSoundType;
  onChangeAmbientSound: (sound: AmbientSoundType) => void;
  ambientVolume: number;
  onChangeAmbientVolume: (vol: number) => void;
  todayMinutes: number;
  streak: number;
  activeSubject: string;
  onCloseMobile?: () => void;
  onOpenStore?: (section?: 'all' | 'music') => void;
  onOpenMusicMenu?: () => void;
  onOpenTaskDesigner?: () => void;
  onOpenCustomizer?: () => void;
  onNavigateTab?: (tab: AppTab) => void;
  activeTab?: AppTab;
  wallet?: ChronosWallet;
  customization?: CustomizationSettings;
  savedYoutubeTracks?: SavedCustomYoutubeTrack[];
  onUpdateFavorites?: (
    favoriteTracks: AmbientSoundType[],
    favoriteYoutubeIds: string[]
  ) => void;
  onSyncTasks?: () => void;
  isSyncingTasks?: boolean;
}

type AudioDisplayItem =
  | {
      kind: 'catalog';
      key: string;
      soundId: AmbientSoundType;
      label: string;
      desc: string;
      sourceGroup: 'youtube' | 'offline';
      youtubeId?: string;
      fallbackIds?: string[];
      artist: string;
    }
  | {
      kind: 'saved-yt';
      key: string;
      videoId: string;
      label: string;
      desc: string;
      sourceGroup: 'saved';
      savedTrack: SavedCustomYoutubeTrack;
      artist: string;
    };

type ManageFilterTab = 'all' | 'favorites' | 'youtube' | 'offline' | 'saved';

function shortTrackLabel(title: string): string {
  const dashIdx = title.indexOf('—');
  if (dashIdx > 0) return title.slice(0, dashIdx).trim();
  const parenIdx = title.indexOf('(');
  if (parenIdx > 0) return title.slice(0, parenIdx).trim();
  return title;
}

export const TabletSidePanel: React.FC<TabletSidePanelProps> = ({
  tasks,
  onUpdateTasks,
  alarms,
  ambientSound,
  onChangeAmbientSound,
  ambientVolume,
  onChangeAmbientVolume,
  todayMinutes,
  streak,
  activeSubject,
  onCloseMobile,
  onOpenStore,
  onOpenMusicMenu,
  onOpenTaskDesigner,
  onOpenCustomizer,
  onNavigateTab,
  activeTab,
  wallet,
  customization,
  savedYoutubeTracks = [],
  onUpdateFavorites,
  onSyncTasks,
  isSyncingTasks = false,
}) => {
  const {
    launchOsPip,
    isOsPipActive,
    setShowInAppPip,
    wakeLockEnabled,
    wakeLockMode,
    toggleWakeLock,
    notificationsEnabled,
    toggleNotifications,
  } = useTimerControls();

  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [audioStatus, setAudioStatus] = useState<AudioPlaybackStatus | null>(null);
  const [audioListTab, setAudioListTab] = useState<'favorites' | 'all'>('favorites');
  const [isManageAudioOpen, setIsManageAudioOpen] = useState<boolean>(false);
  const [manageSearch, setManageSearch] = useState<string>('');
  const [manageFilter, setManageFilter] = useState<ManageFilterTab>('all');

  React.useEffect(() => {
    const unsub = subscribeAudioStatus((st) => setAudioStatus(st));
    return unsub;
  }, []);

  const sections = customization?.sidebarSections || {
    showQuickTasks: true,
    showDailyProgress: true,
    showAlarmsPreview: true,
    showAmbientControls: true,
    showSystemControls: true,
  };

  const unlockedTrackIds = wallet?.unlockedTracks || [];
  const favoriteTrackIds = customization?.favoriteTracks || DEFAULT_CUSTOMIZATION.favoriteTracks;
  const favoriteYoutubeIds = customization?.favoriteYoutubeIds || [];

  // All unlocked built-in catalog items + saved custom YouTube items
  const allUnlockedItems = useMemo<AudioDisplayItem[]>(() => {
    const catalogItems: AudioDisplayItem[] = FOCUS_TRACKS_CATALOG.filter(
      (t) => t.costPoints === 0 || unlockedTrackIds.includes(t.id)
    ).map((t) => ({
      kind: 'catalog',
      key: `cat:${t.id}`,
      soundId: t.id,
      label: shortTrackLabel(t.title),
      desc:
        t.sourceType === 'youtube'
          ? t.channel || 'YouTube Focus'
          : `Offline · ${t.category}`,
      sourceGroup: t.sourceType === 'youtube' ? 'youtube' : 'offline',
      youtubeId: t.youtubeId,
      fallbackIds: t.fallbackYoutubeIds,
      artist: t.channel || t.category,
    }));

    const savedItems: AudioDisplayItem[] = savedYoutubeTracks.map((tr) => ({
      kind: 'saved-yt',
      key: `yt:${tr.videoId}`,
      videoId: tr.videoId,
      label: tr.title,
      desc: `Saved · ${normalizePlaylistName(tr.playlist)}`,
      sourceGroup: 'saved',
      savedTrack: tr,
      artist: `${normalizePlaylistName(tr.playlist)} · Saved YouTube`,
    }));

    return [...catalogItems, ...savedItems];
  }, [unlockedTrackIds, savedYoutubeTracks]);

  // User's curated Favourite List (preserving exact order)
  const favoriteItems = useMemo<AudioDisplayItem[]>(() => {
    const byCatalogId = new Map<AmbientSoundType, AudioDisplayItem>();
    const byVideoId = new Map<string, AudioDisplayItem>();

    for (const item of allUnlockedItems) {
      if (item.kind === 'catalog') {
        byCatalogId.set(item.soundId, item);
      } else {
        byVideoId.set(item.videoId, item);
      }
    }

    const result: AudioDisplayItem[] = [];
    for (const id of favoriteTrackIds) {
      const found = byCatalogId.get(id);
      if (found) result.push(found);
    }
    for (const vid of favoriteYoutubeIds) {
      const found = byVideoId.get(vid);
      if (found) result.push(found);
    }
    return result;
  }, [allUnlockedItems, favoriteTrackIds, favoriteYoutubeIds]);

  const visibleAudioItems = audioListTab === 'favorites' ? favoriteItems : allUnlockedItems;

  const isItemFavorited = (item: AudioDisplayItem): boolean => {
    if (item.kind === 'catalog') {
      return favoriteTrackIds.includes(item.soundId);
    }
    return favoriteYoutubeIds.includes(item.videoId);
  };

  const handleToggleFavoriteItem = (item: AudioDisplayItem) => {
    if (!onUpdateFavorites) return;
    if (item.kind === 'catalog') {
      const exists = favoriteTrackIds.includes(item.soundId);
      const nextTracks = exists
        ? favoriteTrackIds.filter((id) => id !== item.soundId)
        : [...favoriteTrackIds, item.soundId];
      onUpdateFavorites(nextTracks, favoriteYoutubeIds);
    } else {
      const exists = favoriteYoutubeIds.includes(item.videoId);
      const nextYt = exists
        ? favoriteYoutubeIds.filter((vid) => vid !== item.videoId)
        : [...favoriteYoutubeIds, item.videoId];
      onUpdateFavorites(favoriteTrackIds, nextYt);
    }
  };

  const handleMoveFavorite = (item: AudioDisplayItem, direction: -1 | 1) => {
    if (!onUpdateFavorites) return;
    if (item.kind === 'catalog') {
      const unlockedFavCatalog = favoriteTrackIds.filter((id) =>
        allUnlockedItems.some((u) => u.kind === 'catalog' && u.soundId === id)
      );
      const idx = unlockedFavCatalog.indexOf(item.soundId);
      const targetIdx = idx + direction;
      if (idx < 0 || targetIdx < 0 || targetIdx >= unlockedFavCatalog.length) return;
      const reordered = [...unlockedFavCatalog];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
      // Preserve any locked favorites at end just in case
      const remaining = favoriteTrackIds.filter((id) => !reordered.includes(id));
      onUpdateFavorites([...reordered, ...remaining], favoriteYoutubeIds);
    } else {
      const validFavYt = favoriteYoutubeIds.filter((vid) =>
        savedYoutubeTracks.some((s) => s.videoId === vid)
      );
      const idx = validFavYt.indexOf(item.videoId);
      const targetIdx = idx + direction;
      if (idx < 0 || targetIdx < 0 || targetIdx >= validFavYt.length) return;
      const reordered = [...validFavYt];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
      onUpdateFavorites(favoriteTrackIds, reordered);
    }
  };

  const handleResetDefaultFavorites = () => {
    if (!onUpdateFavorites) return;
    onUpdateFavorites([...DEFAULT_CUSTOMIZATION.favoriteTracks], []);
  };

  const handleClearAllFavorites = () => {
    if (!onUpdateFavorites) return;
    onUpdateFavorites([], []);
  };

  const toQueueItems = (list: AudioDisplayItem[]): QueuedAudioItem[] =>
    list.map((entry) =>
      entry.kind === 'catalog'
        ? {
            soundType: entry.soundId,
            videoId: entry.youtubeId,
            fallbackIds: entry.fallbackIds,
            title: entry.label,
            artist: entry.artist,
          }
        : {
            soundType: 'yt-custom',
            videoId: entry.videoId,
            fallbackIds: ['jfKfPfyJRdk'],
            title: entry.label,
            artist: entry.artist,
          }
    );

  const isItemPlaying = (item: AudioDisplayItem): boolean => {
    if (item.kind === 'catalog') {
      return ambientSound === item.soundId;
    }
    return ambientSound === 'yt-custom' && audioStatus?.youtubeId === item.videoId;
  };

  const handleSelectAudioItem = (item: AudioDisplayItem, queueSource: AudioDisplayItem[]) => {
    if (isItemPlaying(item)) {
      stopAmbientSound();
      onChangeAmbientSound('off');
      return;
    }

    const queueLabel =
      audioListTab === 'favorites' ? 'My Favourite Audio' : 'Ambient Focus Audio';
    const queue = toQueueItems(queueSource.length > 0 ? queueSource : allUnlockedItems);

    if (item.kind === 'catalog') {
      setAudioPlaybackQueue(queue, queueLabel, { soundType: item.soundId });
      onChangeAmbientSound(item.soundId);
      startAmbientSound(item.soundId, ambientVolume);
    } else {
      setAudioPlaybackQueue(queue, queueLabel, {
        soundType: 'yt-custom',
        videoId: item.videoId,
      });
      onChangeAmbientSound('yt-custom');
      playSavedCustomYouTubeTrack(item.savedTrack, ambientVolume);
    }
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: StudyTask = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: activeSubject,
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      done: false,
    };
    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onUpdateTasks(updated);
  };

  const handleVolumeChange = (vol: number) => {
    onChangeAmbientVolume(vol);
    updateAmbientVolume(vol);
  };

  const nextAlarm = alarms.find((a) => a.enabled);

  // Filtered tracks for Manage Audio Modal
  const managedListItems = useMemo(() => {
    const q = manageSearch.trim().toLowerCase();
    const source = manageFilter === 'favorites' ? favoriteItems : allUnlockedItems;
    return source.filter((item) => {
      if (manageFilter === 'youtube' && item.sourceGroup !== 'youtube') return false;
      if (manageFilter === 'offline' && item.sourceGroup !== 'offline') return false;
      if (manageFilter === 'saved' && item.sourceGroup !== 'saved') return false;
      if (q) {
        const hay = `${item.label} ${item.desc} ${item.artist}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [manageFilter, manageSearch, favoriteItems, allUnlockedItems]);

  const manageAudioModal =
    isManageAudioOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={() => setIsManageAudioOpen(false)}
          >
            <div
              className="w-full max-w-2xl max-h-[88dvh] ch-glass-modal rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b ch-border flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold ch-text truncate">
                      Manage Focus Audio List
                    </h3>
                    <p className="text-xs ch-text-muted truncate">
                      Build &amp; reorder your personal Favourite List for Ambient Focus Audio
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManageAudioOpen(false)}
                  className="p-2 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  aria-label="Close music list manager"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search & Source Filter Bar */}
              <div className="px-4 sm:px-6 py-3 border-b ch-border space-y-2.5 shrink-0">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 ch-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={manageSearch}
                      onChange={(e) => setManageSearch(e.target.value)}
                      placeholder="Search unlocked tracks & saved YouTube..."
                      className="w-full ch-input rounded-xl pl-8 pr-7 py-1.5 text-xs"
                    />
                    {manageSearch && (
                      <button
                        type="button"
                        onClick={() => setManageSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 ch-text-muted hover:ch-text cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleResetDefaultFavorites}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl ch-btn-secondary text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                      title="Restore starter favourite tracks"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Defaults</span>
                    </button>
                    {favoriteItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllFavorites}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl ch-btn-secondary text-[11px] font-semibold hover:text-rose-500 cursor-pointer whitespace-nowrap"
                      >
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  {(
                    [
                      { id: 'all', label: 'All Unlocked', count: allUnlockedItems.length },
                      { id: 'favorites', label: 'My Favourites', count: favoriteItems.length },
                      {
                        id: 'youtube',
                        label: 'YouTube Focus',
                        count: allUnlockedItems.filter((i) => i.sourceGroup === 'youtube').length,
                      },
                      {
                        id: 'offline',
                        label: 'Offline Synth',
                        count: allUnlockedItems.filter((i) => i.sourceGroup === 'offline').length,
                      },
                      {
                        id: 'saved',
                        label: 'Saved URLs',
                        count: allUnlockedItems.filter((i) => i.sourceGroup === 'saved').length,
                      },
                    ] as { id: ManageFilterTab; label: string; count: number }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setManageFilter(tab.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        manageFilter === tab.id ? 'ch-btn-primary' : 'ch-btn-secondary'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="font-mono text-[10px] opacity-75 tabular-nums">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Track List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
                {managedListItems.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <Music className="w-7 h-7 ch-text-muted mx-auto" />
                    <div className="text-sm font-bold ch-text">
                      {manageFilter === 'favorites'
                        ? 'No favourites selected yet'
                        : manageFilter === 'saved'
                        ? 'No saved YouTube URLs yet'
                        : 'No matching tracks found'}
                    </div>
                    <p className="text-xs ch-text-muted max-w-sm mx-auto">
                      {manageFilter === 'favorites'
                        ? 'Switch to All Unlocked and tap the heart button next to any track to add it to your Favourite List.'
                        : manageFilter === 'saved'
                        ? 'Add your own YouTube links from Background Music, then pin them here.'
                        : 'Try a different search keyword or filter.'}
                    </p>
                  </div>
                ) : (
                  managedListItems.map((item, idx) => {
                    const fav = isItemFavorited(item);
                    const playing = isItemPlaying(item);
                    const showReorder = manageFilter === 'favorites' && !manageSearch.trim();

                    return (
                      <div
                        key={item.key}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          playing
                            ? 'ch-accent-soft'
                            : fav
                            ? 'ch-glass-card border-[var(--ch-border-strong)]'
                            : 'ch-glass-subtle'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleSelectAudioItem(item, managedListItems)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                              playing ? 'ch-btn-primary' : 'ch-btn-secondary'
                            }`}
                            title={playing ? 'Stop preview' : 'Play track'}
                          >
                            {playing ? (
                              <Square className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="text-xs font-bold ch-text truncate">{item.label}</div>
                            <div className="text-[11px] ch-text-muted truncate">{item.desc}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {showReorder && (
                            <>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveFavorite(item, -1)}
                                className="p-1.5 rounded-lg ch-text-muted hover:ch-text disabled:opacity-30 cursor-pointer disabled:cursor-default"
                                title="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === managedListItems.length - 1}
                                onClick={() => handleMoveFavorite(item, 1)}
                                className="p-1.5 rounded-lg ch-text-muted hover:ch-text disabled:opacity-30 cursor-pointer disabled:cursor-default"
                                title="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleFavoriteItem(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              fav
                                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20'
                                : 'ch-btn-secondary'
                            }`}
                            title={fav ? 'Remove from Favourite List' : 'Add to Favourite List'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
                            <span>{fav ? 'Saved' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3.5 border-t ch-border shrink-0 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs ch-text-muted">
                  <span className="font-mono font-bold ch-text tabular-nums">
                    {favoriteItems.length}
                  </span>
                  <span>in your Favourite List</span>
                  {onOpenStore && (
                    <>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManageAudioOpen(false);
                          onOpenStore('music');
                        }}
                        className="inline-flex items-center gap-1 ch-text-accent font-semibold hover:underline cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Unlock More in Store</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsManageAudioOpen(false);
                    if (favoriteItems.length > 0) setAudioListTab('favorites');
                  }}
                  className="px-4 py-1.5 rounded-xl ch-btn-primary text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <aside className="w-full h-full min-h-0 lg:w-[276px] xl:w-[332px] flex flex-col gap-4 p-4 xl:p-5 ch-glass-panel border-y-0 border-r-0 overflow-y-auto">
      {manageAudioModal}

      {/* Companion Header */}
      <div className="flex items-center justify-between border-b ch-border pb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold ch-text">Study Companion</span>
          <span className="ch-text-muted">·</span>
          <span className="ch-text-accent font-semibold flex items-center gap-1 tabular-nums">
            <Flame className="w-3.5 h-3.5" /> {streak}d
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onOpenCustomizer && (
            <button
              onClick={onOpenCustomizer}
              className="p-1.5 rounded-lg ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Customize sidebar panels & taskbar"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => launchOsPip()}
            className="p-1.5 rounded-lg ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Pop out floating timer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/5"
              title="Close companion panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Quick Navigation */}
      {onNavigateTab && (
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onNavigateTab('stats')}
            className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'stats' ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="truncate">Deep Work</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('leaderboard')}
            className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'leaderboard' ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="truncate">Ranks</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile' ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <span className="truncate">Profile</span>
          </button>
        </div>
      )}

      {/* Daily Progress Gauge */}
      {sections.showDailyProgress &&
        (() => {
          const safeTodayMinutes = Math.max(0, Math.round(todayMinutes));
          return (
            <div className="p-3.5 rounded-2xl ch-glass-card flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold ch-text-muted">Today’s Focus</div>
                <div className="font-mono text-xl font-extrabold ch-text tabular-nums mt-0.5">
                  {Math.floor(safeTodayMinutes / 60)}h {safeTodayMinutes % 60}m
                </div>
              </div>
              {wallet && (
                <div className="px-2.5 py-1 rounded-xl ch-accent-soft font-mono text-xs font-bold tabular-nums">
                  {wallet.points} XP
                </div>
              )}
            </div>
          );
        })()}

      {/* Floating Window & Background Sync Controls */}
      {sections.showSystemControls && (
        <div className="p-3.5 rounded-2xl ch-glass-card text-xs space-y-2.5">
          <div className="flex items-center justify-between font-semibold ch-text">
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 ch-text-accent" />
              Background &amp; Floating Flow
            </span>
          </div>
          <p className="ch-text-muted text-[11px] leading-relaxed">
            Timers stay synchronized to your system clock even if the window closes.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowInAppPip(true)}
              className="ch-btn-secondary flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1"
            >
              <LayoutTemplate className="w-3 h-3 ch-text-accent" />
              <span>Mini Widget</span>
            </button>
            <button
              onClick={() => launchOsPip()}
              className="ch-btn-primary flex-1 py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isOsPipActive ? 'OS Active' : 'Float (PiP)'}</span>
            </button>
          </div>

          <div className="pt-2 border-t ch-border grid grid-cols-2 gap-2">
            <button
              onClick={toggleWakeLock}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                wakeLockEnabled ? 'ch-accent-soft' : 'ch-btn-secondary'
              }`}
              title={
                wakeLockEnabled
                  ? `Display kept awake (${wakeLockMode === 'native' ? 'Native WakeLock' : 'Compat Stream'})`
                  : 'Keep display awake during study sessions'
              }
            >
              {wakeLockEnabled ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              <span>{wakeLockEnabled ? 'Awake On' : 'Keep Awake'}</span>
            </button>

            <button
              onClick={toggleNotifications}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 border transition-colors ${
                notificationsEnabled
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/35'
                  : 'ch-btn-secondary'
              }`}
              title="Send notifications when intervals finish"
            >
              <Bell className="w-3 h-3" />
              <span>{notificationsEnabled ? 'Alerts On' : 'Alerts Off'}</span>
            </button>
          </div>

          <div className="pt-2 border-t ch-border">
            <PWAInstallButton variant="panel" />
          </div>
        </div>
      )}

      {/* Ambient Focus Generator with Personal Favourite List Manager */}
      {sections.showAmbientControls && (
        <div className="space-y-2.5 p-3.5 rounded-2xl ch-glass-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold ch-text min-w-0">
              <Headphones className="w-3.5 h-3.5 ch-text-accent shrink-0" />
              <span className="truncate">Ambient Focus Audio</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {onUpdateFavorites && (
                <button
                  type="button"
                  onClick={() => {
                    setManageFilter('all');
                    setManageSearch('');
                    setIsManageAudioOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg ch-btn-secondary text-[10px] font-semibold cursor-pointer hover:border-[var(--ch-accent)] whitespace-nowrap"
                  title="Manage music listed & create your own Favourite List"
                >
                  <SlidersHorizontal className="w-3 h-3 ch-text-accent" />
                  <span>Manage</span>
                </button>
              )}
              {ambientSound !== 'off' && (
                <button
                  type="button"
                  onClick={() => {
                    stopAmbientSound();
                    onChangeAmbientSound('off');
                  }}
                  className="text-[11px] ch-text-accent font-semibold hover:underline cursor-pointer"
                >
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* Favourites vs All Unlocked Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl ch-glass-subtle">
            <button
              type="button"
              onClick={() => setAudioListTab('favorites')}
              className={`py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                audioListTab === 'favorites' ? 'ch-btn-primary' : 'ch-text-muted hover:ch-text'
              }`}
            >
              <Heart className="w-3 h-3 shrink-0" />
              <span>Favourites</span>
              <span className="font-mono text-[10px] opacity-80 tabular-nums">
                ({favoriteItems.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAudioListTab('all')}
              className={`py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                audioListTab === 'all' ? 'ch-btn-primary' : 'ch-text-muted hover:ch-text'
              }`}
            >
              <span>All Tracks</span>
              <span className="font-mono text-[10px] opacity-80 tabular-nums">
                ({allUnlockedItems.length})
              </span>
            </button>
          </div>

          {/* Music Track Grid */}
          {visibleAudioItems.length === 0 ? (
            <div className="py-4 px-3 rounded-xl ch-glass-subtle text-center space-y-2">
              <p className="text-[11px] ch-text-muted">
                No tracks in your Favourite List yet.
              </p>
              {onUpdateFavorites && (
                <button
                  type="button"
                  onClick={() => {
                    setManageFilter('all');
                    setIsManageAudioOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl ch-accent-soft text-[11px] font-bold cursor-pointer"
                >
                  <Heart className="w-3 h-3" />
                  <span>Build Favourite List</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
              {visibleAudioItems.map((item) => {
                const isActive = isItemPlaying(item);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectAudioItem(item, visibleAudioItems)}
                    className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'ch-accent-soft'
                        : 'ch-glass-subtle hover:border-[var(--ch-border-strong)] ch-text-secondary'
                    }`}
                    title={`${item.label} — ${item.desc}`}
                  >
                    <div className="text-xs font-semibold truncate">{item.label}</div>
                    <div className="text-[10px] ch-text-muted truncate">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {ambientSound !== 'off' && (
            <div className="space-y-1.5 pt-1 px-1">
              {audioStatus && (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] ch-text-accent truncate">
                    {audioStatus.notice ||
                      `${audioStatus.trackTitle}${
                        audioStatus.shuffleEnabled
                          ? ' · Shuffle'
                          : audioStatus.repeatEnabled
                          ? ' · Repeating'
                          : ''
                      }`}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setAudioShuffleEnabled(!(audioStatus.shuffleEnabled ?? false))
                      }
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        audioStatus.shuffleEnabled
                          ? 'ch-accent-soft'
                          : 'ch-text-muted hover:ch-text'
                      }`}
                      title={
                        audioStatus.shuffleEnabled
                          ? 'Shuffle On (click to turn off)'
                          : 'Shuffle Off (click to turn on)'
                      }
                    >
                      <Shuffle className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => playNextQueuedTrack()}
                      className="p-1 rounded-md ch-text-muted hover:ch-text transition-colors cursor-pointer"
                      title="Skip to next track"
                    >
                      <SkipForward className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 ch-text-muted" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono ch-text-muted w-7 text-right tabular-nums">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            </div>
          )}

          {(onOpenMusicMenu || onOpenStore) && (
            <div className="grid grid-cols-2 gap-2">
              {onOpenMusicMenu && (
                <button
                  type="button"
                  onClick={onOpenMusicMenu}
                  className="ch-accent-soft py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <Music className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Music Menu</span>
                </button>
              )}
              {onOpenStore && (
                <button
                  type="button"
                  onClick={() => onOpenStore('all')}
                  className={`ch-btn-secondary py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-1 cursor-pointer ${
                    onOpenMusicMenu ? '' : 'col-span-2'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <ShoppingBag className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                    <span>Store</span>
                  </span>
                  {wallet && (
                    <span className="text-[10px] font-mono ch-text-accent font-bold tabular-nums shrink-0">
                      {wallet.points} XP
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Study Agenda & Checklist */}
      {sections.showQuickTasks && (
        <div className="space-y-2.5 flex-1 flex flex-col p-3.5 rounded-2xl ch-glass-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold ch-text">
              <CheckSquare className="w-3.5 h-3.5 ch-text-accent" />
              <span>
                Agenda ({tasks.filter((t) => t.done).length}/{tasks.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onSyncTasks && (
                <button
                  type="button"
                  onClick={onSyncTasks}
                  disabled={isSyncingTasks}
                  className="p-1 rounded-lg ch-text-muted hover:ch-text-accent transition-colors cursor-pointer disabled:opacity-50"
                  title="Load latest cloud tasks"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingTasks ? 'animate-spin ch-text-accent' : ''}`} />
                </button>
              )}
              {onOpenTaskDesigner && (
                <button
                  onClick={onOpenTaskDesigner}
                  className="text-[11px] ch-text-accent font-semibold hover:underline cursor-pointer"
                >
                  Task Planner →
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-1.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add study objective..."
              className="ch-input flex-1 px-3 py-1.5 text-xs rounded-xl"
            />
            <button
              type="submit"
              className="ch-btn-secondary p-1.5 rounded-xl"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-52 pr-0.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start gap-2.5 p-2.5 rounded-xl ch-glass-subtle transition-colors ${
                  task.done ? 'opacity-60' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleTask(task.id)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ch-text leading-snug ${task.done ? 'line-through' : ''}`}>
                    {task.title}
                  </div>
                  <div className="text-[10px] ch-text-muted mt-0.5">{task.subject}</div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-65 lg:opacity-0 lg:group-hover:opacity-100 p-1 ch-text-muted hover:text-rose-500 transition-opacity shrink-0 cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-4 text-xs ch-text-muted">
                No tasks added yet. Add a quick study objective above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Alarm Strip */}
      {sections.showAlarmsPreview && nextAlarm && (
        <div className="p-3 rounded-2xl ch-glass-card flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-3.5 h-3.5 ch-text-accent shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold ch-text truncate">{nextAlarm.label}</div>
              <div className="text-[10px] ch-text-muted">{nextAlarm.category} alert</div>
            </div>
          </div>
          <span className="font-mono font-bold ch-text tabular-nums">{nextAlarm.time}</span>
        </div>
      )}
    </aside>
  );
};
