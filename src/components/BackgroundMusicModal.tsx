import React, { useState, useEffect, useMemo } from 'react';
import {
  Music,
  Play,
  Square,
  Volume2,
  VolumeX,
  X,
  Repeat,
  Shuffle,
  SkipForward,
  Heart,
  Radio,
  Link2,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  ShoppingBag,
  Sparkles,
  Coins,
  ListMusic,
  FolderPlus,
} from 'lucide-react';
import {
  AmbientSoundType,
  ChronosWallet,
  DEFAULT_YOUTUBE_PLAYLISTS,
  SavedCustomYoutubeTrack,
} from '../types';
import {
  FOCUS_TRACKS_CATALOG,
  extractYouTubeVideoId,
  normalizePlaylistName,
} from '../utils/storage';
import {
  AudioPlaybackStatus,
  QueuedAudioItem,
  playCustomYouTubeStream,
  playNextQueuedTrack,
  playRandomFromQueue,
  playSavedCustomYouTubeTrack,
  setAudioPlaybackQueue,
  setAudioRepeatEnabled,
  setAudioShuffleEnabled,
  startAmbientSound,
  stopAmbientSound,
  subscribeAudioStatus,
  updateAmbientVolume,
} from '../utils/audio';

type MusicFilterTab =
  | 'all'
  | 'youtube'
  | 'favorites'
  | 'offline'
  | 'nature';

interface BackgroundMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSound: AmbientSoundType;
  onSelectSound: (type: AmbientSoundType) => void;
  ambientVolume: number;
  onChangeVolume: (vol: number) => void;
  wallet: ChronosWallet;
  onWalletUpdated: (wallet: ChronosWallet) => void;
  favoriteTracks?: AmbientSoundType[];
  onToggleFavorite?: (id: AmbientSoundType) => void;
  savedYoutubeTracks: SavedCustomYoutubeTrack[];
  youtubePlaylists: string[];
  onSaveYoutubeTrack: (input: {
    videoId: string;
    title: string;
    url: string;
    playlist?: string;
  }) => void;
  onRemoveYoutubeTrack: (idOrVideoId: string) => void;
  onUpdateYoutubeTrackPlaylist: (videoId: string, playlist: string) => void;
  onAddYoutubePlaylist: (name: string) => void;
  onRemoveYoutubePlaylist: (name: string) => void;
  onOpenStore?: (section?: 'all' | 'music') => void;
}

export const BackgroundMusicModal: React.FC<BackgroundMusicModalProps> = ({
  isOpen,
  onClose,
  activeSound,
  onSelectSound,
  ambientVolume,
  onChangeVolume,
  wallet,
  onWalletUpdated,
  favoriteTracks = [],
  onToggleFavorite,
  savedYoutubeTracks,
  youtubePlaylists,
  onSaveYoutubeTrack,
  onRemoveYoutubeTrack,
  onUpdateYoutubeTrackPlaylist,
  onAddYoutubePlaylist,
  onRemoveYoutubePlaylist,
  onOpenStore,
}) => {
  const [filterTab, setFilterTab] = useState<MusicFilterTab>('all');
  const [selectedPlaylistFilter, setSelectedPlaylistFilter] = useState<string>('ALL');
  const [saveTargetPlaylist, setSaveTargetPlaylist] = useState<string>('Deep Focus');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [audioStatus, setAudioStatus] = useState<AudioPlaybackStatus | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlNotice, setUrlNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAudioStatus((st) => setAudioStatus(st));
    return unsub;
  }, []);

  // Keep save target synced when switching playlist view
  useEffect(() => {
    if (selectedPlaylistFilter !== 'ALL' && youtubePlaylists.includes(selectedPlaylistFilter)) {
      setSaveTargetPlaylist(selectedPlaylistFilter);
    }
  }, [selectedPlaylistFilter, youtubePlaylists]);

  const playlistTrackCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const pl of youtubePlaylists) {
      counts.set(pl, 0);
    }
    for (const tr of savedYoutubeTracks) {
      const pl = normalizePlaylistName(tr.playlist);
      counts.set(pl, (counts.get(pl) || 0) + 1);
    }
    return counts;
  }, [youtubePlaylists, savedYoutubeTracks]);

  const visibleSavedTracks = useMemo(() => {
    if (selectedPlaylistFilter === 'ALL') return savedYoutubeTracks;
    return savedYoutubeTracks.filter(
      (t) =>
        normalizePlaylistName(t.playlist).toLowerCase() ===
        selectedPlaylistFilter.toLowerCase()
    );
  }, [savedYoutubeTracks, selectedPlaylistFilter]);

  if (!isOpen) return null;

  const repeatEnabled = audioStatus?.repeatEnabled ?? true;
  const shuffleEnabled = audioStatus?.shuffleEnabled ?? false;
  const activeYoutubeId = audioStatus?.youtubeId;
  const activeTrackObj = FOCUS_TRACKS_CATALOG.find((t) => t.id === activeSound);
  const activeSavedTrack =
    activeSound === 'yt-custom'
      ? savedYoutubeTracks.find((t) => t.videoId === activeYoutubeId) || null
      : null;

  const showNotice = (msg: string) => {
    setUrlNotice(msg);
    window.setTimeout(() => setUrlNotice(null), 3200);
  };

  const toQueuedSavedTracks = (list: SavedCustomYoutubeTrack[]): QueuedAudioItem[] =>
    list.map((t) => ({
      soundType: 'yt-custom',
      videoId: t.videoId,
      fallbackIds: ['jfKfPfyJRdk'],
      title: t.title,
      artist: `${normalizePlaylistName(t.playlist)} · Saved YouTube`,
    }));

  const resolveYoutubeInput = (): {
    videoId: string;
    title: string;
    url: string;
    playlist: string;
  } | null => {
    const videoId = extractYouTubeVideoId(urlInput);
    if (!videoId) {
      setUrlError(
        'Paste a valid YouTube URL (youtube.com/watch?v=..., youtu.be/..., music.youtube.com/...) or 11-character Video ID.'
      );
      return null;
    }
    setUrlError(null);
    const trimmedUrl = urlInput.trim();
    const canonicalUrl = trimmedUrl.startsWith('http')
      ? trimmedUrl
      : `https://www.youtube.com/watch?v=${videoId}`;
    const existingSaved = savedYoutubeTracks.find((t) => t.videoId === videoId);
    const title =
      titleInput.trim() || existingSaved?.title || `YouTube Music · ${videoId}`;
    const playlist = normalizePlaylistName(saveTargetPlaylist || existingSaved?.playlist);
    return { videoId, title, url: canonicalUrl, playlist };
  };

  const handlePlayCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveYoutubeInput();
    if (!resolved) return;
    onSelectSound('yt-custom');
    playCustomYouTubeStream(resolved.videoId, resolved.title, ambientVolume);
    showNotice(
      `Streaming "${resolved.title}" (${shuffleEnabled ? 'Shuffle On' : repeatEnabled ? 'Repeat On' : 'Single Play'}).`
    );
  };

  const handleSaveCustomUrl = () => {
    const resolved = resolveYoutubeInput();
    if (!resolved) return;
    onSaveYoutubeTrack(resolved);
    showNotice(`Saved "${resolved.title}" in playlist "${resolved.playlist}".`);
  };

  const handleSaveAndPlayCustomUrl = () => {
    const resolved = resolveYoutubeInput();
    if (!resolved) return;
    onSaveYoutubeTrack(resolved);
    onSelectSound('yt-custom');
    playCustomYouTubeStream(resolved.videoId, resolved.title, ambientVolume);
    showNotice(`Saved to "${resolved.playlist}" & playing now.`);
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newPlaylistName.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!cleaned) return;
    onAddYoutubePlaylist(cleaned);
    setSelectedPlaylistFilter(cleaned);
    setSaveTargetPlaylist(cleaned);
    setNewPlaylistName('');
    setIsCreatingPlaylist(false);
    showNotice(`Created playlist "${cleaned}".`);
  };

  const handlePlaySavedTrack = (track: SavedCustomYoutubeTrack) => {
    const isThisPlaying =
      activeSound === 'yt-custom' && activeYoutubeId === track.videoId;
    if (isThisPlaying) {
      stopAmbientSound();
      onSelectSound('off');
      return;
    }
    const queueSource =
      visibleSavedTracks.length > 0 ? visibleSavedTracks : savedYoutubeTracks;
    const queueLabel =
      selectedPlaylistFilter === 'ALL'
        ? 'All Saved Music'
        : `${selectedPlaylistFilter} Playlist`;
    setAudioPlaybackQueue(toQueuedSavedTracks(queueSource), queueLabel, {
      soundType: 'yt-custom',
      videoId: track.videoId,
    });
    onSelectSound('yt-custom');
    playSavedCustomYouTubeTrack(track, ambientVolume);
  };

  const handlePlayPlaylist = (shuffleStart: boolean) => {
    if (visibleSavedTracks.length === 0) return;
    const queueLabel =
      selectedPlaylistFilter === 'ALL'
        ? 'All Saved Music'
        : `${selectedPlaylistFilter} Playlist`;
    const items = toQueuedSavedTracks(visibleSavedTracks);

    if (shuffleStart) {
      onSelectSound('yt-custom');
      playRandomFromQueue(items, queueLabel);
      showNotice(`Shuffling "${queueLabel}" (${items.length} tracks).`);
    } else {
      const first = visibleSavedTracks[0];
      setAudioPlaybackQueue(items, queueLabel, {
        soundType: 'yt-custom',
        videoId: first.videoId,
      });
      onSelectSound('yt-custom');
      playSavedCustomYouTubeTrack(first, ambientVolume);
      showNotice(`Playing "${queueLabel}" (${items.length} tracks).`);
    }
  };

  const handleToggleTrack = (type: AmbientSoundType) => {
    if (activeSound === type) {
      stopAmbientSound();
      onSelectSound('off');
    } else {
      const unlockedCatalogItems: QueuedAudioItem[] = FOCUS_TRACKS_CATALOG.filter(
        (t) => t.costPoints === 0 || wallet.unlockedTracks.includes(t.id)
      ).map((t) => ({
        soundType: t.id,
        videoId: t.youtubeId,
        fallbackIds: t.fallbackYoutubeIds,
        title: t.title,
        artist: t.channel || t.category,
      }));
      setAudioPlaybackQueue(unlockedCatalogItems, 'Focus Stations', {
        soundType: type,
      });
      onSelectSound(type);
      startAmbientSound(type, ambientVolume);
    }
  };

  const youtubeTracks = FOCUS_TRACKS_CATALOG.filter((t) => t.sourceType === 'youtube');
  const synthTracks = FOCUS_TRACKS_CATALOG.filter((t) => t.sourceType !== 'youtube');

  const filteredCatalog = FOCUS_TRACKS_CATALOG.filter((track) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'youtube') return track.sourceType === 'youtube';
    if (filterTab === 'favorites') return favoriteTracks.includes(track.id);
    if (filterTab === 'offline') return track.sourceType !== 'youtube';
    if (filterTab === 'nature') {
      return (
        track.category === 'Nature & Waves' ||
        track.category === 'Background Noise' ||
        track.id === 'yt-rain-thunder' ||
        track.id === 'yt-fireplace-rain' ||
        track.id === 'yt-brown-noise'
      );
    }
    return true;
  });

  const filterTabs: { id: MusicFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Music', count: FOCUS_TRACKS_CATALOG.length },
    { id: 'youtube', label: 'YouTube Streams', count: youtubeTracks.length },
    { id: 'offline', label: 'Offline Studio', count: synthTracks.length },
    { id: 'favorites', label: 'Favorites', count: favoriteTracks.length },
    {
      id: 'nature',
      label: 'Rain & Noise',
      count: FOCUS_TRACKS_CATALOG.filter(
        (t) =>
          t.category === 'Nature & Waves' ||
          t.category === 'Background Noise' ||
          t.id === 'yt-rain-thunder' ||
          t.id === 'yt-fireplace-rain' ||
          t.id === 'yt-brown-noise'
      ).length,
    },
  ];

  const resolvedCurrentId = extractYouTubeVideoId(urlInput);
  const isCurrentInputAlreadySaved = Boolean(
    resolvedCurrentId && savedYoutubeTracks.some((t) => t.videoId === resolvedCurrentId)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[95dvh] sm:max-h-[90dvh] ch-glass-modal rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <header className="px-4 py-3.5 sm:px-6 sm:py-5 border-b ch-border shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight ch-text">
                    Background Music
                  </h2>
                  <span className="hidden sm:inline text-xs ch-text-muted">
                    Custom playlists · Shuffle &amp; Repeat · YouTube Focus Streams
                  </span>
                </div>
                <p className="sm:hidden text-[11px] ch-text-muted truncate">
                  Playlists, Shuffle, Saved Links &amp; Streams
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenStore && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStore('music');
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ch-btn-secondary whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 ch-text-accent" />
                  <span>Open Store</span>
                </button>
              )}

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ch-glass-subtle font-mono text-xs font-bold ch-text-accent tabular-nums">
                <Coins className="w-3.5 h-3.5 shrink-0" />
                <span>{wallet.points.toLocaleString()} XP</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close Background Music"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Active Audio Deck, Shuffle & Repeat Controller */}
          <section className="rounded-2xl ch-glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  activeSound !== 'off' ? 'ch-btn-primary' : 'ch-glass-subtle ch-text-muted'
                }`}
              >
                <Radio className="w-5 h-5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider ch-text-muted truncate">
                  {activeSound === 'off'
                    ? 'Audio Deck Standby'
                    : audioStatus?.state === 'loading'
                    ? 'Connecting Stream...'
                    : activeSound === 'yt-custom'
                    ? `${activeSavedTrack?.playlist || audioStatus?.queueLabel || 'Custom YouTube'} · Active`
                    : `${activeTrackObj?.sourceType === 'youtube' ? 'YouTube Focus' : 'Offline Synth'} · Playing`}
                  {activeSound !== 'off' && shuffleEnabled ? ' · Shuffle On' : ''}
                </div>
                <div className="text-sm sm:text-base font-bold ch-text truncate">
                  {activeSound === 'off'
                    ? 'Choose a YouTube station, playlist, or paste any YouTube URL below'
                    : activeSound === 'yt-custom'
                    ? activeSavedTrack?.title || audioStatus?.trackTitle || 'Custom YouTube Focus'
                    : activeTrackObj?.title || audioStatus?.trackTitle}
                </div>
                {audioStatus?.notice && (
                  <p className="text-[11px] ch-text-accent truncate">{audioStatus.notice}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAudioShuffleEnabled(!shuffleEnabled)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  shuffleEnabled ? 'ch-accent-soft' : 'ch-btn-secondary'
                }`}
                title={
                  shuffleEnabled
                    ? 'Shuffle mode active — plays a random next track when a song finishes'
                    : 'Shuffle mode off — click to shuffle tracks automatically'
                }
              >
                <Shuffle className="w-3.5 h-3.5 shrink-0" />
                <span>Shuffle: {shuffleEnabled ? 'On' : 'Off'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAudioRepeatEnabled(!repeatEnabled)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  repeatEnabled ? 'ch-accent-soft' : 'ch-btn-secondary'
                }`}
                title={
                  repeatEnabled
                    ? 'Repeat is enabled — loops song or playlist queue'
                    : 'Repeat is off — stops after playback finishes'
                }
              >
                <Repeat className="w-3.5 h-3.5 shrink-0" />
                <span>Repeat: {repeatEnabled ? 'On' : 'Off'}</span>
              </button>

              {activeSound !== 'off' && (
                <button
                  type="button"
                  onClick={() => {
                    const ok = playNextQueuedTrack();
                    if (ok) {
                      showNotice(
                        shuffleEnabled
                          ? 'Shuffled to next focus track.'
                          : 'Switched to next track in queue.'
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ch-btn-secondary whitespace-nowrap shrink-0 cursor-pointer"
                  title="Skip to next track"
                >
                  <SkipForward className="w-3.5 h-3.5 shrink-0" />
                  <span>Next</span>
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl ch-glass-subtle">
                <button
                  type="button"
                  onClick={() => {
                    const nextVol = ambientVolume > 0 ? 0 : 0.4;
                    onChangeVolume(nextVol);
                    updateAmbientVolume(nextVol);
                  }}
                  className="ch-text-muted hover:ch-text cursor-pointer"
                  title={ambientVolume > 0 ? 'Mute' : 'Unmute'}
                >
                  {ambientVolume > 0 ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    onChangeVolume(vol);
                    updateAmbientVolume(vol);
                  }}
                  className="w-20 sm:w-24 h-1.5 rounded-lg cursor-pointer"
                  style={{ accentColor: 'var(--ch-accent)' }}
                />
                <span className="font-mono text-[11px] ch-text-secondary w-8 text-right tabular-nums">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>

              {activeSound !== 'off' && (
                <button
                  type="button"
                  onClick={() => {
                    stopAmbientSound();
                    onSelectSound('off');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ch-btn-secondary whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </section>

          {/* Custom YouTube URL Player + Playlist-Organized Saved Library */}
          <section className="rounded-2xl ch-glass-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider ch-text-accent">
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Custom YouTube Music &amp; Playlists</span>
                </div>
                <p className="text-xs ch-text-secondary">
                  Save any YouTube song URL into playlists like <strong className="ch-text">Deep Focus</strong>, <strong className="ch-text">Ambient</strong>, or <strong className="ch-text">Lofi</strong>, or create your own playlists with Shuffle &amp; Repeat.
                </p>
              </div>
              <div className="text-[11px] font-mono ch-text-muted tabular-nums shrink-0">
                {savedYoutubeTracks.length} saved · {youtubePlaylists.length} playlists
              </div>
            </div>

            <form onSubmit={handlePlayCustomUrl} className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="Paste YouTube URL (youtube.com/watch?v=... or youtu.be/...)"
                className="md:col-span-4 ch-input rounded-xl px-3.5 py-2.5 text-xs"
              />
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Track name (optional)"
                maxLength={80}
                className="md:col-span-3 ch-input rounded-xl px-3.5 py-2.5 text-xs"
              />
              <select
                value={saveTargetPlaylist}
                onChange={(e) => setSaveTargetPlaylist(e.target.value)}
                className="md:col-span-2 ch-input rounded-xl px-3 py-2.5 text-xs font-semibold"
                title="Target playlist when saving"
              >
                {youtubePlaylists.map((pl) => (
                  <option key={pl} value={pl}>
                    {pl}
                  </option>
                ))}
              </select>
              <div className="md:col-span-3 flex flex-wrap sm:flex-nowrap gap-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold ch-btn-primary whitespace-nowrap cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomUrl}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold ch-btn-secondary whitespace-nowrap cursor-pointer"
                  title="Save track into selected playlist"
                >
                  {isCurrentInputAlreadySaved ? (
                    <BookmarkCheck className="w-3.5 h-3.5 ch-text-accent" />
                  ) : (
                    <BookmarkPlus className="w-3.5 h-3.5 ch-text-accent" />
                  )}
                  <span>{isCurrentInputAlreadySaved ? 'Update' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPlayCustomUrl}
                  className="hidden 2xl:inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold ch-accent-soft whitespace-nowrap cursor-pointer"
                  title="Save to playlist and start playing immediately"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {urlError && (
              <p className="text-xs font-semibold text-rose-500">{urlError}</p>
            )}
            {urlNotice && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {urlNotice}
              </p>
            )}

            {/* Playlist Organizer Strip */}
            <div className="pt-2 border-t ch-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPlaylistFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedPlaylistFilter === 'ALL'
                        ? 'ch-btn-primary'
                        : 'ch-btn-secondary'
                    }`}
                  >
                    <ListMusic className="w-3.5 h-3.5 shrink-0" />
                    <span>All Saved</span>
                    <span className="font-mono text-[11px] opacity-75 tabular-nums">
                      {savedYoutubeTracks.length}
                    </span>
                  </button>

                  {youtubePlaylists.map((playlist) => {
                    const isSelected = selectedPlaylistFilter === playlist;
                    const count = playlistTrackCounts.get(playlist) || 0;
                    const isDefault = DEFAULT_YOUTUBE_PLAYLISTS.some(
                      (d) => d.toLowerCase() === playlist.toLowerCase()
                    );
                    return (
                      <div key={playlist} className="inline-flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedPlaylistFilter(playlist)}
                          className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                            !isDefault ? 'rounded-l-xl' : 'rounded-xl'
                          } ${isSelected ? 'ch-btn-primary' : 'ch-btn-secondary'}`}
                        >
                          <span>{playlist}</span>
                          <span className="font-mono text-[11px] opacity-75 tabular-nums">
                            {count}
                          </span>
                        </button>
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedPlaylistFilter === playlist) {
                                setSelectedPlaylistFilter('ALL');
                              }
                              onRemoveYoutubePlaylist(playlist);
                              showNotice(
                                `Removed "${playlist}". Tracks moved to Deep Focus.`
                              );
                            }}
                            className="px-1.5 py-1.5 rounded-r-xl ch-btn-secondary border-l-0 text-xs ch-text-muted hover:text-rose-500 cursor-pointer"
                            title={`Delete playlist "${playlist}" (moves tracks to Deep Focus)`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCreatingPlaylist((v) => !v)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold ch-accent-soft whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer"
                    title="Create a custom playlist"
                  >
                    <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>New Playlist</span>
                  </button>
                </div>

                {visibleSavedTracks.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePlayPlaylist(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ch-btn-secondary whitespace-nowrap cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current ch-text-accent" />
                      <span>Play Queue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlayPlaylist(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ch-accent-soft whitespace-nowrap cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Shuffle Play</span>
                    </button>
                  </div>
                )}
              </div>

              {isCreatingPlaylist && (
                <form
                  onSubmit={handleCreatePlaylist}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl ch-glass-subtle"
                >
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Custom playlist name (e.g. Late Night Physics, Synth Focus)"
                    maxLength={40}
                    autoFocus
                    className="flex-1 min-w-[200px] ch-input rounded-lg px-3 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold ch-btn-primary cursor-pointer"
                  >
                    Create Playlist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingPlaylist(false);
                      setNewPlaylistName('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold ch-btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Saved Tracks List inside Selected Playlist */}
              {visibleSavedTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {visibleSavedTracks.map((track) => {
                    const isPlayingThis =
                      activeSound === 'yt-custom' && activeYoutubeId === track.videoId;
                    const trackPlaylist = normalizePlaylistName(track.playlist);
                    return (
                      <div
                        key={track.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          isPlayingThis
                            ? 'ch-accent-soft'
                            : 'ch-glass-subtle hover:border-[var(--ch-border-strong)]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold ch-text truncate">
                            {track.title}
                          </div>
                          <div className="text-[11px] ch-text-muted font-mono truncate mt-0.5">
                            {trackPlaylist} · {track.videoId}
                            {isPlayingThis
                              ? shuffleEnabled
                                ? ' · Shuffling'
                                : repeatEnabled
                                ? ' · Repeating'
                                : ' · Playing'
                              : ''}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t ch-border">
                          <select
                            value={trackPlaylist}
                            onChange={(e) =>
                              onUpdateYoutubeTrackPlaylist(track.videoId, e.target.value)
                            }
                            className="ch-input rounded-lg px-2 py-1 text-[11px] font-medium max-w-[120px] truncate cursor-pointer"
                            title="Move track to playlist"
                          >
                            {youtubePlaylists.map((pl) => (
                              <option key={pl} value={pl}>
                                {pl}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlaySavedTrack(track)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                                isPlayingThis ? 'ch-btn-secondary' : 'ch-btn-primary'
                              }`}
                              title={isPlayingThis ? 'Stop' : 'Play saved music'}
                            >
                              {isPlayingThis ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Play</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isPlayingThis) {
                                  stopAmbientSound();
                                  onSelectSound('off');
                                }
                                onRemoveYoutubeTrack(track.videoId);
                              }}
                              className="p-1.5 rounded-lg ch-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remove from saved music"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 px-3 rounded-xl ch-glass-subtle text-xs ch-text-muted text-center">
                  {savedYoutubeTracks.length === 0
                    ? 'No custom tracks saved yet. Paste any YouTube URL above, pick a playlist (Deep Focus, Ambient, Lofi, or your own), and click Save.'
                    : `No tracks inside "${selectedPlaylistFilter}" yet. Save a YouTube URL to "${selectedPlaylistFilter}" or move an existing track using its playlist menu.`}
                </div>
              )}
            </div>
          </section>

          {/* Filter Bar for Curated YouTube & Built-in Catalog */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {filterTabs.map((tab) => {
                const isSelected = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected ? 'ch-btn-primary' : 'ch-btn-secondary'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="font-mono text-[11px] opacity-75 tabular-nums">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Music Stations & Soundscapes Grid */}
          {filteredCatalog.length === 0 ? (
            <div className="py-12 text-center rounded-2xl ch-glass-card">
              <Heart className="w-7 h-7 ch-text-muted mx-auto mb-2" />
              <div className="text-sm font-bold ch-text">No tracks match this filter</div>
              <p className="text-xs ch-text-muted mt-1">
                Tap the heart icon on any YouTube stream or soundscape to build your quick favorites.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((track) => {
                const isUnlocked =
                  track.costPoints === 0 || wallet.unlockedTracks.includes(track.id);
                const isPlaying = activeSound === track.id;
                const isFavorite = favoriteTracks.includes(track.id);
                const isYouTube = track.sourceType === 'youtube';
                const canAfford = wallet.points >= track.costPoints;

                return (
                  <div
                    key={track.id}
                    className={`rounded-2xl p-4 ch-glass-card flex flex-col justify-between gap-3.5 transition-all hover:-translate-y-0.5 ${
                      isPlaying ? 'border-[var(--ch-accent)]' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[11px] font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className={isYouTube ? 'ch-text-accent font-bold' : 'ch-text-muted'}>
                            {isYouTube ? 'YouTube' : 'Offline'}
                          </span>
                          <span className="ch-text-muted" aria-hidden="true">·</span>
                          <span className="ch-text-muted">
                            {track.channel || track.category}
                          </span>
                          <span className="ch-text-muted" aria-hidden="true">·</span>
                          <span className="font-mono ch-text-accent tabular-nums">
                            {track.costPoints === 0
                              ? 'Included'
                              : `${track.costPoints.toLocaleString()} XP`}
                          </span>
                        </div>

                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(track.id)}
                            className={`p-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                              isFavorite
                                ? 'text-rose-500'
                                : 'ch-text-muted hover:text-rose-400'
                            }`}
                            title={isFavorite ? 'Remove favorite' : 'Favorite track'}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold ch-text leading-snug">
                          {track.title}
                        </h3>
                        <p className="text-xs ch-text-secondary mt-1 line-clamp-2 leading-relaxed">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t ch-border">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleToggleTrack(track.id)}
                          className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isPlaying ? 'ch-accent-soft' : 'ch-btn-primary'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>
                                {shuffleEnabled
                                  ? 'Stop (Shuffling)'
                                  : repeatEnabled
                                  ? 'Stop (Looping)'
                                  : 'Stop Stream'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play Background Music</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenStore) {
                              onClose();
                              onOpenStore('music');
                            }
                          }}
                          className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            canAfford ? 'ch-btn-primary' : 'ch-btn-secondary opacity-85'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span>Get in Store · {track.costPoints.toLocaleString()} XP</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
