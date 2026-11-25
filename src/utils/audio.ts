import { AmbientSoundType } from '../types';
import {
  FOCUS_TRACKS_CATALOG,
  loadAudioRepeatMode,
  loadAudioShuffleMode,
  loadChronosWallet,
  loadCustomYoutubeTrack,
  loadSavedYoutubeTracks,
  saveAudioRepeatMode,
  saveAudioShuffleMode,
  saveCustomYoutubeTrack,
} from './storage';

export interface QueuedAudioItem {
  soundType: AmbientSoundType;
  videoId?: string;
  fallbackIds?: string[];
  title: string;
  artist: string;
}

export interface AudioPlaybackStatus {
  activeSound: AmbientSoundType;
  source: 'off' | 'synth' | 'youtube';
  state: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  trackTitle: string;
  artist: string;
  youtubeId?: string;
  notice?: string;
  repeatEnabled: boolean;
  shuffleEnabled: boolean;
  queueLabel?: string;
  queueSize: number;
}

type StatusListener = (status: AudioPlaybackStatus) => void;
type ExternalStopListener = () => void;
type ExternalSoundChangeListener = (sound: AmbientSoundType) => void;

let audioCtx: AudioContext | null = null;
let streamDestNode: MediaStreamAudioDestinationNode | null = null;
let synthAudioElement: HTMLAudioElement | null = null;
let silentKeepaliveElement: HTMLAudioElement | null = null;
let silentKeepaliveUrl: string | null = null;

let ambientNodes: {
  gainNode: GainNode;
  stop: () => void;
} | null = null;

// Active playback intent state (used to protect background playback from browser throttling)
let repeatEnabled = loadAudioRepeatMode();
let shuffleEnabled = loadAudioShuffleMode();
let activeQueue: QueuedAudioItem[] = [];
let activeQueueLabel: string | undefined = undefined;
let activeQueueIndex = -1;
let playedShuffleKeys = new Set<string>();
let lastEndedHandledAt = 0;

let currentStatus: AudioPlaybackStatus = {
  activeSound: 'off',
  source: 'off',
  state: 'idle',
  trackTitle: 'Off',
  artist: 'Chronos Focus Studio',
  repeatEnabled,
  shuffleEnabled,
  queueSize: 0,
};
let desiredPlaying = false;
let currentVolume = 0.35;
let watchdogIntervalId: number | null = null;
let ytScriptPromise: Promise<void> | null = null;
let ytPlayer: YTPlayerLike | null = null;
let ytPlayerReady = false;
let pendingYtRequest: {
  videoId: string;
  fallbackIds: string[];
  volume: number;
  soundType: AmbientSoundType;
  title: string;
  artist: string;
} | null = null;
let activeYtFallbackQueue: string[] = [];

const statusListeners = new Set<StatusListener>();
const externalStopListeners = new Set<ExternalStopListener>();
const externalSoundChangeListeners = new Set<ExternalSoundChangeListener>();

interface YTPlayerLike {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
  setLoop?: (loopPlaylists: boolean) => void;
  setVolume: (vol: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          width?: number | string;
          height?: number | string;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayerLike }) => void;
            onStateChange?: (e: { data: number; target: YTPlayerLike }) => void;
            onError?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayerLike;
      PlayerState?: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function emitStatus(patch: Partial<AudioPlaybackStatus>) {
  currentStatus = { ...currentStatus, ...patch };
  statusListeners.forEach((fn) => {
    try {
      fn(currentStatus);
    } catch {
      // ignore
    }
  });
}

export function getAudioPlaybackStatus(): AudioPlaybackStatus {
  return currentStatus;
}

export function subscribeAudioStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

export function subscribeExternalAudioStop(listener: ExternalStopListener): () => void {
  externalStopListeners.add(listener);
  return () => {
    externalStopListeners.delete(listener);
  };
}

export function subscribeExternalSoundChange(listener: ExternalSoundChangeListener): () => void {
  externalSoundChangeListeners.add(listener);
  return () => {
    externalSoundChangeListeners.delete(listener);
  };
}

function getQueueItemKey(item: QueuedAudioItem): string {
  return item.videoId ? `yt:${item.videoId}` : `sound:${item.soundType}`;
}

function notifyExternalSoundChange(sound: AmbientSoundType) {
  externalSoundChangeListeners.forEach((fn) => {
    try {
      fn(sound);
    } catch {
      // ignore
    }
  });
}

function buildFallbackShuffleQueue(): QueuedAudioItem[] {
  if (currentStatus.activeSound === 'yt-custom') {
    const saved = loadSavedYoutubeTracks();
    if (saved.length > 0) {
      return saved.map((t) => ({
        soundType: 'yt-custom' as AmbientSoundType,
        videoId: t.videoId,
        fallbackIds: ['jfKfPfyJRdk'],
        title: t.title,
        artist: `${t.playlist || 'Deep Focus'} · Saved YouTube`,
      }));
    }
  }
  const wallet = loadChronosWallet();
  const preferYoutube = currentStatus.source === 'youtube';
  const unlockedCatalog = FOCUS_TRACKS_CATALOG.filter((t) => {
    const unlocked = t.costPoints === 0 || wallet.unlockedTracks.includes(t.id);
    if (!unlocked) return false;
    return preferYoutube ? t.sourceType === 'youtube' : true;
  });
  return unlockedCatalog.map((t) => ({
    soundType: t.id,
    videoId: t.youtubeId,
    fallbackIds: t.fallbackYoutubeIds,
    title: t.title,
    artist: t.channel || t.category,
  }));
}

function playQueuedItemAt(index: number) {
  const item = activeQueue[index];
  if (!item) return;
  activeQueueIndex = index;
  playedShuffleKeys.add(getQueueItemKey(item));
  notifyExternalSoundChange(item.soundType);

  if (item.videoId) {
    if (item.soundType === 'yt-custom') {
      saveCustomYoutubeTrack({ videoId: item.videoId, title: item.title });
    }
    void startYouTubeTrack(
      item.videoId,
      item.fallbackIds || ['jfKfPfyJRdk'],
      item.soundType,
      item.title,
      item.artist,
      currentVolume
    );
  } else {
    startSynthSound(item.soundType, currentVolume, item.soundType);
  }
}

export function setAudioPlaybackQueue(
  items: QueuedAudioItem[],
  queueLabel?: string,
  currentItemMatch?: { soundType?: AmbientSoundType; videoId?: string }
) {
  activeQueue = [...items];
  activeQueueLabel = queueLabel;
  playedShuffleKeys.clear();
  if (currentItemMatch) {
    const idx = activeQueue.findIndex((item) =>
      currentItemMatch.videoId
        ? item.videoId === currentItemMatch.videoId
        : item.soundType === currentItemMatch.soundType
    );
    activeQueueIndex = idx;
    if (idx >= 0) {
      playedShuffleKeys.add(getQueueItemKey(activeQueue[idx]));
    }
  } else {
    activeQueueIndex = -1;
  }
  emitStatus({
    queueLabel: activeQueueLabel,
    queueSize: activeQueue.length,
  });
}

export function clearAudioPlaybackQueue() {
  activeQueue = [];
  activeQueueLabel = undefined;
  activeQueueIndex = -1;
  playedShuffleKeys.clear();
  emitStatus({
    queueLabel: undefined,
    queueSize: 0,
  });
}

export function playNextQueuedTrack(): boolean {
  if (activeQueue.length === 0) {
    const fallback = buildFallbackShuffleQueue();
    if (fallback.length > 0) {
      activeQueue = fallback;
      activeQueueLabel =
        currentStatus.activeSound === 'yt-custom' ? 'All Saved Tracks' : 'Focus Mix';
      activeQueueIndex = activeQueue.findIndex((item) =>
        currentStatus.youtubeId
          ? item.videoId === currentStatus.youtubeId
          : item.soundType === currentStatus.activeSound
      );
      if (activeQueueIndex >= 0) {
        playedShuffleKeys.add(getQueueItemKey(activeQueue[activeQueueIndex]));
      }
      emitStatus({
        queueLabel: activeQueueLabel,
        queueSize: activeQueue.length,
      });
    }
  }

  if (activeQueue.length === 0) return false;

  if (activeQueue.length === 1) {
    if (repeatEnabled) {
      playQueuedItemAt(0);
      return true;
    }
    return false;
  }

  if (shuffleEnabled) {
    const currentKey =
      activeQueueIndex >= 0 && activeQueue[activeQueueIndex]
        ? getQueueItemKey(activeQueue[activeQueueIndex])
        : currentStatus.youtubeId
        ? `yt:${currentStatus.youtubeId}`
        : `sound:${currentStatus.activeSound}`;

    let candidateIndices = activeQueue
      .map((item, idx) => ({ item, idx }))
      .filter(
        ({ item }) =>
          getQueueItemKey(item) !== currentKey &&
          !playedShuffleKeys.has(getQueueItemKey(item))
      )
      .map(({ idx }) => idx);

    if (candidateIndices.length === 0) {
      if (!repeatEnabled && playedShuffleKeys.size >= activeQueue.length) {
        return false;
      }
      // Reset shuffle cycle while still avoiding an immediate back-to-back repeat
      playedShuffleKeys.clear();
      if (activeQueueIndex >= 0 && activeQueue[activeQueueIndex]) {
        playedShuffleKeys.add(getQueueItemKey(activeQueue[activeQueueIndex]));
      }
      candidateIndices = activeQueue
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => getQueueItemKey(item) !== currentKey)
        .map(({ idx }) => idx);
    }

    if (candidateIndices.length === 0) {
      return false;
    }
    const chosenIdx =
      candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    playQueuedItemAt(chosenIdx);
    return true;
  }

  const nextIdx =
    activeQueueIndex >= 0 ? (activeQueueIndex + 1) % activeQueue.length : 0;
  if (!repeatEnabled && activeQueueIndex >= 0 && nextIdx === 0) {
    return false;
  }
  playQueuedItemAt(nextIdx);
  return true;
}

export function playRandomFromQueue(
  items: QueuedAudioItem[],
  queueLabel?: string
): boolean {
  if (items.length === 0) return false;
  shuffleEnabled = true;
  saveAudioShuffleMode(true);
  setAudioPlaybackQueue(items, queueLabel);
  const startIdx = Math.floor(Math.random() * items.length);
  emitStatus({ shuffleEnabled: true });
  playQueuedItemAt(startIdx);
  return true;
}

/**
 * Generates a real 2-second valid PCM WAV Blob URL with ultra-quiet (-90 dBFS) dither
 * so mobile & desktop Chromium browsers recognize active hardware audio telemetry
 * instead of discarding a tiny silent stub and sleeping the tab after 5–15 seconds.
 */
function getKeepaliveWavUrl(): string | null {
  if (typeof window === 'undefined' || typeof Blob === 'undefined') return null;
  if (silentKeepaliveUrl) return silentKeepaliveUrl;

  const sampleRate = 8000;
  const durationSeconds = 2;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Subtle +/- 2 LSB thermal dither (-84 dBFS: completely inaudible, non-zero PCM signal)
  for (let i = 0; i < numSamples; i++) {
    const sample = i % 2 === 0 ? 2 : -2;
    view.setInt16(44 + i * 2, sample, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  silentKeepaliveUrl = URL.createObjectURL(blob);
  return silentKeepaliveUrl;
}

function ensureBackgroundAudioKeeper() {
  try {
    if (typeof document === 'undefined') return;
    const url = getKeepaliveWavUrl();
    if (!url) return;

    if (!silentKeepaliveElement) {
      silentKeepaliveElement = document.createElement('audio');
      silentKeepaliveElement.src = url;
      silentKeepaliveElement.loop = true;
      silentKeepaliveElement.volume = 0.05;
      silentKeepaliveElement.setAttribute('playsinline', '');
      silentKeepaliveElement.setAttribute('webkit-playsinline', '');
    }
    if (silentKeepaliveElement.paused) {
      silentKeepaliveElement.play().catch(() => {});
    }
  } catch {
    // ignore
  }
}

function stopBackgroundAudioKeeper() {
  try {
    if (silentKeepaliveElement) {
      silentKeepaliveElement.pause();
    }
  } catch {
    // ignore
  }
}

function startBackgroundWatchdog() {
  if (typeof window === 'undefined' || watchdogIntervalId !== null) return;
  watchdogIntervalId = window.setInterval(() => {
    if (!desiredPlaying) return;

    if (audioCtx && (audioCtx.state === 'suspended' || audioCtx.state === ('interrupted' as AudioContextState))) {
      audioCtx.resume().catch(() => {});
    }
    if (currentStatus.source === 'synth' && synthAudioElement && synthAudioElement.paused) {
      synthAudioElement.play().catch(() => {});
    }
    if (silentKeepaliveElement && silentKeepaliveElement.paused) {
      silentKeepaliveElement.play().catch(() => {});
    }
    if (currentStatus.source === 'youtube' && ytPlayer && ytPlayerReady) {
      try {
        const st = ytPlayer.getPlayerState();
        if (st === 0) {
          const now = Date.now();
          if (now - lastEndedHandledAt > 1200) {
            lastEndedHandledAt = now;
            if (shuffleEnabled && playNextQueuedTrack()) {
              return;
            }
            if (repeatEnabled) {
              ytPlayer.seekTo?.(0, true);
              ytPlayer.playVideo();
            }
          }
        } else if (st === 2 && document.visibilityState === 'hidden') {
          ytPlayer.playVideo();
        }
      } catch {
        // ignore
      }
    }
  }, 2000);
}

function stopBackgroundWatchdog() {
  if (watchdogIntervalId !== null) {
    clearInterval(watchdogIntervalId);
    watchdogIntervalId = null;
  }
}

function ensureAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();

    // Auto-resume if browser/OS tries to suspend context while ambient focus audio is active
    audioCtx.onstatechange = () => {
      if (
        desiredPlaying &&
        audioCtx &&
        (audioCtx.state === 'suspended' || audioCtx.state === ('interrupted' as AudioContextState))
      ) {
        audioCtx.resume().catch(() => {});
      }
    };
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Connect masterGain through a real HTMLAudioElement via MediaStreamAudioDestinationNode.
 * This elevates Web Audio to full hardware media playback so background tabs & locked phones
 * do NOT throttle or cut off sound after 5-15 seconds.
 */
function attachSynthOutputSink(ctx: AudioContext, masterGain: GainNode) {
  try {
    if (typeof ctx.createMediaStreamDestination === 'function' && typeof document !== 'undefined') {
      if (!streamDestNode) {
        streamDestNode = ctx.createMediaStreamDestination();
      }
      masterGain.connect(streamDestNode);

      if (!synthAudioElement) {
        synthAudioElement = document.createElement('audio');
        synthAudioElement.setAttribute('playsinline', '');
        synthAudioElement.setAttribute('webkit-playsinline', '');
        synthAudioElement.autoplay = true;
      }
      if (synthAudioElement.srcObject !== streamDestNode.stream) {
        synthAudioElement.srcObject = streamDestNode.stream;
      }
      synthAudioElement.volume = 1.0;
      synthAudioElement.play().catch(() => {
        // Fallback to direct context destination if stream playback is blocked
        try {
          masterGain.connect(ctx.destination);
        } catch {
          // ignore
        }
      });
      return;
    }
  } catch {
    // Fallback below
  }

  masterGain.connect(ctx.destination);
}

// Keep playback uninterrupted across tab minimize, screen lock, and focus switches
if (typeof window !== 'undefined') {
  const handleVisibilityOrFocus = () => {
    if (!desiredPlaying) return;

    if (audioCtx && audioCtx.state !== 'running') {
      audioCtx.resume().catch(() => {});
    }
    ensureBackgroundAudioKeeper();

    if (currentStatus.source === 'synth' && synthAudioElement && synthAudioElement.paused) {
      synthAudioElement.play().catch(() => {});
    }

    if (currentStatus.source === 'youtube' && ytPlayer && ytPlayerReady) {
      // Chromium sometimes auto-pauses background video iframes right as visibility turns hidden
      window.setTimeout(() => {
        if (!desiredPlaying || currentStatus.source !== 'youtube' || !ytPlayer) return;
        try {
          const st = ytPlayer.getPlayerState();
          if (st !== 1 && st !== 3) {
            ytPlayer.playVideo();
          }
        } catch {
          // ignore
        }
      }, 280);

      window.setTimeout(() => {
        if (!desiredPlaying || currentStatus.source !== 'youtube' || !ytPlayer) return;
        try {
          const st = ytPlayer.getPlayerState();
          if (st !== 1 && st !== 3) {
            ytPlayer.playVideo();
          }
        } catch {
          // ignore
        }
      }, 1200);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityOrFocus);
  window.addEventListener('focus', handleVisibilityOrFocus);
  window.addEventListener('pageshow', handleVisibilityOrFocus);
}

function updateMediaSession(title: string, artist: string) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Chronos Focus Studio v1.6',
    });
    navigator.mediaSession.playbackState = 'playing';

    navigator.mediaSession.setActionHandler('play', () => {
      if (currentStatus.activeSound !== 'off') {
        startAmbientSound(currentStatus.activeSound, currentVolume);
      }
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      stopAmbientSound(true);
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      stopAmbientSound(true);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextQueuedTrack();
    });
  } catch {
    // ignore MediaSession errors on older browsers
  }
}

function clearMediaSession() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.playbackState = 'none';
  } catch {
    // ignore
  }
}

// ============================================================================
// LAZY YOUTUBE IFRAME API HOST (loaded only on first YouTube play request)
// ============================================================================

function ensureYouTubeContainer(): HTMLElement {
  let host = document.getElementById('chronos-yt-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'chronos-yt-host';
    // Non-zero visible-dimension off-focus layer so browsers never suspend hidden 0x0 iframes
    host.style.position = 'fixed';
    host.style.bottom = '0';
    host.style.right = '0';
    host.style.width = '240px';
    host.style.height = '135px';
    host.style.opacity = '0.008';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '-1';
    host.style.overflow = 'hidden';

    const inner = document.createElement('div');
    inner.id = 'chronos-yt-iframe';
    host.appendChild(inner);
    document.body.appendChild(host);
  }
  return host;
}

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve();
  }
  if (ytScriptPromise) return ytScriptPromise;

  ytScriptPromise = new Promise<void>((resolve, reject) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        prevReady?.();
      } catch {
        // ignore
      }
      resolve();
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="youtube.com/iframe_api"]'
    );
    if (!existing) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => {
        ytScriptPromise = null;
        reject(new Error('YouTube IFrame API failed to load'));
      };
      document.head.appendChild(tag);
    }

    // Timeout safeguard if YouTube is blocked on network
    window.setTimeout(() => {
      if (!(window.YT && typeof window.YT.Player === 'function')) {
        ytScriptPromise = null;
        reject(new Error('YouTube API timed out'));
      }
    }, 10000);
  });

  return ytScriptPromise;
}

function fallbackFromYouTubeToSynth(reasonNotice: string) {
  const prevSound = currentStatus.activeSound;
  // Choose closest offline acoustic mood instead of abruptly going silent
  let synthType: AmbientSoundType = 'lofi';
  if (prevSound === 'yt-classical' || prevSound === 'yt-ghibli-piano' || prevSound === 'yt-dark-academia') {
    synthType = 'piano';
  } else if (prevSound === 'yt-rain-thunder' || prevSound === 'yt-fireplace-rain') {
    synthType = 'rain';
  } else if (prevSound === 'yt-alpha-focus') {
    synthType = 'binaural';
  } else if (prevSound === 'yt-brown-noise') {
    synthType = 'pinknoise';
  } else if (prevSound === 'yt-synthwave') {
    synthType = 'cosmic';
  }

  stopYouTubePlaybackOnly();
  startSynthSound(synthType, currentVolume, prevSound, reasonNotice);
}

function stopYouTubePlaybackOnly() {
  pendingYtRequest = null;
  activeYtFallbackQueue = [];
  if (ytPlayer && ytPlayerReady) {
    try {
      ytPlayer.pauseVideo();
    } catch {
      // ignore
    }
  }
}

async function startYouTubeTrack(
  videoId: string,
  fallbackIds: string[],
  soundType: AmbientSoundType,
  title: string,
  artist: string,
  volume: number
) {
  stopSynthNodesOnly();
  currentVolume = volume;
  desiredPlaying = true;
  activeYtFallbackQueue = [...fallbackIds];

  ensureBackgroundAudioKeeper();
  startBackgroundWatchdog();
  updateMediaSession(title, artist);

  emitStatus({
    activeSound: soundType,
    source: 'youtube',
    state: 'loading',
    trackTitle: title,
    artist,
    youtubeId: videoId,
    notice: undefined,
  });

  pendingYtRequest = { videoId, fallbackIds, volume, soundType, title, artist };

  try {
    await loadYouTubeIframeAPI();
    if (!desiredPlaying || pendingYtRequest?.soundType !== soundType) return;

    ensureYouTubeContainer();

    if (ytPlayer && ytPlayerReady) {
      ytPlayer.setVolume(Math.round(volume * 100));
      ytPlayer.setLoop?.(false);
      ytPlayer.loadVideoById(videoId);
      ytPlayer.playVideo();
      return;
    }

    if (!ytPlayer && window.YT?.Player) {
      ytPlayer = new window.YT.Player('chronos-yt-iframe', {
        width: 240,
        height: 135,
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            ytPlayerReady = true;
            if (!desiredPlaying || !pendingYtRequest) {
              try {
                event.target.pauseVideo();
              } catch {}
              return;
            }
            event.target.setVolume(Math.round(currentVolume * 100));
            event.target.setLoop?.(false);
            if (pendingYtRequest.videoId !== videoId) {
              event.target.loadVideoById(pendingYtRequest.videoId);
            }
            event.target.playVideo();
          },
          onStateChange: (event) => {
            // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
            if (event.data === 1) {
              emitStatus({ state: 'playing', notice: undefined });
            } else if (event.data === 3) {
              if (desiredPlaying) emitStatus({ state: 'loading' });
            } else if (event.data === 0) {
              const now = Date.now();
              if (now - lastEndedHandledAt < 900) return;
              lastEndedHandledAt = now;

              if (desiredPlaying && shuffleEnabled) {
                const advanced = playNextQueuedTrack();
                if (advanced) return;
              }

              // Reliably repeat any single YouTube video or song when Repeat is enabled
              if (desiredPlaying && repeatEnabled) {
                try {
                  event.target.seekTo?.(0, true);
                  event.target.playVideo();
                } catch {}
                window.setTimeout(() => {
                  if (!desiredPlaying || !repeatEnabled || currentStatus.source !== 'youtube') return;
                  try {
                    const st = event.target.getPlayerState();
                    if (st !== 1 && st !== 3) {
                      event.target.seekTo?.(0, true);
                      event.target.playVideo();
                    }
                  } catch {}
                }, 220);
              } else if (desiredPlaying) {
                stopAmbientSound(true);
              }
            } else if (event.data === 2 && desiredPlaying && document.visibilityState === 'hidden') {
              // If browser throttled background video iframe on minimize, immediately nudge play
              window.setTimeout(() => {
                if (desiredPlaying && currentStatus.source === 'youtube') {
                  try {
                    event.target.playVideo();
                  } catch {}
                }
              }, 250);
            }
          },
          onError: () => {
            if (!desiredPlaying) return;
            const nextId = activeYtFallbackQueue.shift();
            if (nextId && ytPlayer && ytPlayerReady) {
              ytPlayer.loadVideoById(nextId);
              ytPlayer.setLoop?.(repeatEnabled && !shuffleEnabled);
              ytPlayer.playVideo();
              emitStatus({
                youtubeId: nextId,
                notice: 'Switched to backup YouTube mirror stream.',
              });
            } else if (shuffleEnabled && playNextQueuedTrack()) {
              emitStatus({
                notice: 'Skipped unavailable stream in shuffle queue.',
              });
            } else {
              fallbackFromYouTubeToSynth('YouTube unavailable offline — playing built-in focus studio.');
            }
          },
        },
      });
    }
  } catch {
    if (desiredPlaying) {
      fallbackFromYouTubeToSynth('YouTube unreachable — playing built-in offline focus studio.');
    }
  }
}

export function setAudioRepeatEnabled(enabled: boolean) {
  repeatEnabled = enabled;
  saveAudioRepeatMode(enabled);
  if (ytPlayer && ytPlayerReady) {
    try {
      ytPlayer.setLoop?.(enabled && !shuffleEnabled);
    } catch {
      // ignore
    }
  }
  emitStatus({ repeatEnabled: enabled });
}

export function getAudioRepeatEnabled(): boolean {
  return repeatEnabled;
}

export function setAudioShuffleEnabled(enabled: boolean) {
  shuffleEnabled = enabled;
  saveAudioShuffleMode(enabled);
  if (enabled) {
    playedShuffleKeys.clear();
    if (currentStatus.activeSound !== 'off') {
      const key = currentStatus.youtubeId
        ? `yt:${currentStatus.youtubeId}`
        : `sound:${currentStatus.activeSound}`;
      playedShuffleKeys.add(key);
    }
  }
  if (ytPlayer && ytPlayerReady) {
    try {
      ytPlayer.setLoop?.(repeatEnabled && !enabled);
    } catch {
      // ignore
    }
  }
  emitStatus({ shuffleEnabled: enabled });
}

export function getAudioShuffleEnabled(): boolean {
  return shuffleEnabled;
}

export function playCustomYouTubeStream(
  videoId: string,
  title: string,
  volume: number = currentVolume
) {
  const cleanTitle = (title || '').trim() || 'Custom YouTube Focus';
  saveCustomYoutubeTrack({ videoId, title: cleanTitle });
  void startYouTubeTrack(
    videoId,
    ['jfKfPfyJRdk'],
    'yt-custom',
    cleanTitle,
    'YouTube Custom Stream',
    volume
  );
}

export function playSavedCustomYouTubeTrack(
  track: { videoId: string; title: string },
  volume: number = currentVolume
) {
  playCustomYouTubeStream(track.videoId, track.title, volume);
}

// ============================================================================
// CHIMES & PRECISION TICKS
// ============================================================================

export function playChime(type: string = 'chime', volume: number = 0.8) {
  try {
    const ctx = ensureAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    if (type === 'bowl' || type === 'zen') {
      const freqs = [261.63, 523.25, 784.88, 1046.5];
      const gains = [0.4, 0.25, 0.15, 0.08];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(3.5, now);
        lfoGain.gain.setValueAtTime(1.2, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + 4.5);

        g.gain.setValueAtTime(gains[i], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 4.5);
      });
    } else if (type === 'digital') {
      const beeps = [0, 0.15, 0.3, 0.45];
      beeps.forEach((startOffset) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1046.5, now + startOffset);
        g.gain.setValueAtTime(0.25, now + startOffset);
        g.gain.setValueAtTime(0.001, now + startOffset + 0.08);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + 0.09);
      });
    } else if (type === 'marimba') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.35, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 1.2);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(start);
        osc.stop(start + 1.25);
      });
    } else {
      const notes = [783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.15;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.3, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 2.5);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(start);
        osc.stop(start + 2.5);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function playTickSound(volume: number = 0.05) {
  try {
    const ctx = ensureAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Ignore
  }
}

// ============================================================================
// ENHANCED OFFLINE SYNTH GENERATORS (with MediaStream background continuity)
// ============================================================================

function createPianoLoopBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 12.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const notesSequence: { time: number; freq: number; pan: number; gain: number }[] = [
    { time: 0.0, freq: 130.81, pan: -0.2, gain: 0.28 },
    { time: 0.2, freq: 196.0, pan: 0.1, gain: 0.22 },
    { time: 0.6, freq: 329.63, pan: 0.3, gain: 0.24 },
    { time: 1.2, freq: 493.88, pan: -0.1, gain: 0.2 },
    { time: 1.8, freq: 587.33, pan: 0.2, gain: 0.18 },
    { time: 2.2, freq: 392.0, pan: -0.2, gain: 0.15 },
    { time: 3.0, freq: 110.0, pan: -0.3, gain: 0.28 },
    { time: 3.3, freq: 164.81, pan: 0.2, gain: 0.22 },
    { time: 3.8, freq: 261.63, pan: -0.1, gain: 0.24 },
    { time: 4.4, freq: 392.0, pan: 0.3, gain: 0.22 },
    { time: 5.0, freq: 493.88, pan: 0.0, gain: 0.18 },
    { time: 6.0, freq: 87.31, pan: -0.2, gain: 0.26 },
    { time: 6.3, freq: 130.81, pan: 0.1, gain: 0.22 },
    { time: 6.8, freq: 220.0, pan: -0.3, gain: 0.24 },
    { time: 7.4, freq: 329.63, pan: 0.2, gain: 0.22 },
    { time: 8.0, freq: 392.0, pan: 0.1, gain: 0.18 },
    { time: 9.0, freq: 98.0, pan: -0.1, gain: 0.28 },
    { time: 9.3, freq: 146.83, pan: 0.2, gain: 0.22 },
    { time: 9.8, freq: 246.94, pan: -0.2, gain: 0.24 },
    { time: 10.4, freq: 329.63, pan: 0.3, gain: 0.2 },
    { time: 11.0, freq: 293.66, pan: -0.1, gain: 0.16 },
  ];

  notesSequence.forEach(({ time, freq, pan, gain }) => {
    const startSample = Math.floor(time * sampleRate);
    const decayDuration = 4.2;
    const noteSamples = Math.min(Math.floor(decayDuration * sampleRate), totalSamples);

    for (let i = 0; i < noteSamples; i++) {
      const idx = (startSample + i) % totalSamples;
      const t = i / sampleRate;
      const attack = Math.min(1, t / 0.008);
      const decay = Math.exp(-t * 1.55);
      const env = attack * decay * gain;
      const tone =
        Math.sin(2 * Math.PI * freq * t) * 0.65 +
        Math.sin(2 * Math.PI * freq * 2.002 * t) * 0.25 +
        Math.sin(2 * Math.PI * freq * 3.005 * t) * 0.1;

      left[idx] += tone * env * ((1 - pan) * 0.5);
      right[idx] += tone * env * ((1 + pan) * 0.5);
    }
  });

  return buffer;
}

function createLoFiRhodesBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 10.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const chords: { time: number; freqs: number[] }[] = [
    { time: 0.0, freqs: [146.83, 220.0, 261.63, 349.23] },
    { time: 2.5, freqs: [164.81, 246.94, 293.66, 392.0] },
    { time: 5.0, freqs: [174.61, 261.63, 329.63, 440.0] },
    { time: 7.5, freqs: [196.0, 246.94, 293.66, 349.23] },
  ];

  chords.forEach(({ time, freqs }) => {
    const startSample = Math.floor(time * sampleRate);
    const decayDuration = 2.8;
    const noteSamples = Math.min(Math.floor(decayDuration * sampleRate), totalSamples);

    freqs.forEach((freq, fIndex) => {
      const spread = (fIndex / (freqs.length - 1) - 0.5) * 0.4;
      for (let i = 0; i < noteSamples; i++) {
        const idx = (startSample + i) % totalSamples;
        const t = i / sampleRate;
        const env = Math.min(1, t / 0.015) * Math.exp(-t * 1.15) * 0.13;
        const tremolo = 1 + 0.1 * Math.sin(2 * Math.PI * 4.5 * t);
        const tone =
          (Math.sin(2 * Math.PI * freq * t) + 0.22 * Math.sin(2 * Math.PI * freq * 2 * t)) * tremolo;

        left[idx] += tone * env * (0.5 - spread);
        right[idx] += tone * env * (0.5 + spread);
      }
    });
  });

  // Subtle dusty vinyl warmth
  for (let i = 0; i < totalSamples; i++) {
    if (Math.random() < 0.001) {
      const crackle = (Math.random() * 2 - 1) * 0.032;
      left[i] += crackle;
      right[i] += crackle;
    }
  }

  return buffer;
}

function stopSynthNodesOnly() {
  if (ambientNodes && audioCtx) {
    const currentNodes = ambientNodes;
    ambientNodes = null;
    try {
      const now = audioCtx.currentTime;
      currentNodes.gainNode.gain.setValueAtTime(currentNodes.gainNode.gain.value, now);
      currentNodes.gainNode.gain.linearRampToValueAtTime(0.0008, now + 0.22);
      window.setTimeout(() => {
        try {
          currentNodes.stop();
        } catch {
          // ignore
        }
      }, 260);
    } catch {
      currentNodes.stop();
    }
  }
  if (synthAudioElement) {
    try {
      synthAudioElement.pause();
    } catch {
      // ignore
    }
  }
}

function startSynthSound(
  type: AmbientSoundType,
  volume: number,
  displaySoundId: AmbientSoundType = type,
  notice?: string
) {
  stopYouTubePlaybackOnly();
  stopSynthNodesOnly();
  if (type === 'off') return;

  try {
    const ctx = ensureAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(Math.max(0.001, volume), now + 0.9);
    attachSynthOutputSink(ctx, masterGain);

    desiredPlaying = true;
    currentVolume = volume;
    ensureBackgroundAudioKeeper();
    startBackgroundWatchdog();

    const trackMeta = FOCUS_TRACKS_CATALOG.find((t) => t.id === displaySoundId);
    const title = trackMeta?.title || 'Focus Audio';
    const artist = trackMeta?.channel || 'Chronos Study Studio';
    updateMediaSession(title, artist);
    emitStatus({
      activeSound: displaySoundId,
      source: 'synth',
      state: 'playing',
      trackTitle: title,
      artist,
      youtubeId: undefined,
      notice,
    });

    if (type === 'piano') {
      const buffer = createPianoLoopBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(2400, now);

      source.connect(lowpass);
      lowpass.connect(masterGain);
      source.start(now);

      ambientNodes = {
        gainNode: masterGain,
        stop: () => {
          try {
            source.stop();
            source.disconnect();
            lowpass.disconnect();
            masterGain.disconnect();
          } catch {}
        },
      };
    } else if (type === 'lofi') {
      const buffer = createLoFiRhodesBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1450, now);

      source.connect(filter);
      filter.connect(masterGain);
      source.start(now);

      ambientNodes = {
        gainNode: masterGain,
        stop: () => {
          try {
            source.stop();
            source.disconnect();
            filter.disconnect();
            masterGain.disconnect();
          } catch {}
        },
      };
    } else if (type === 'cosmic') {
      const freqs = [108, 216, 432, 436];
      const gains = [0.35, 0.25, 0.15, 0.15];
      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];
      const merger = ctx.createChannelMerger(2);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.03, now);
        lfoGain.gain.setValueAtTime(0.8, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        lfos.push(lfo);

        g.gain.setValueAtTime(gains[idx] * 0.4, now);
        osc.connect(g);
        g.connect(merger, 0, idx % 2);
        osc.start(now);
        oscs.push(osc);
      });

      merger.connect(masterGain);

      ambientNodes = {
        gainNode: masterGain,
        stop: () => {
          try {
            oscs.forEach((o) => o.stop());
            lfos.forEach((l) => l.stop());
            oscs.forEach((o) => o.disconnect());
            merger.disconnect();
            masterGain.disconnect();
          } catch {}
        },
      };
    } else if (type === 'waves') {
      const bufferSize = ctx.sampleRate * 6;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const l = buffer.getChannelData(0);
      const r = buffer.getChannelData(1);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;

        l[i] = pink;
        r[i] = pink * 0.9 + (Math.random() * 2 - 1) * 0.005;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, now);
      lfoGain.gain.setValueAtTime(380, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start(now);

      ambientNodes = {
        gainNode: masterGain,
        stop: () => {
          try {
            noiseSource.stop();
            lfo.stop();
            noiseSource.disconnect();
            filter.disconnect();
            masterGain.disconnect();
          } catch {}
        },
      };
    } else if (type === 'binaural') {
      const merger = ctx.createChannelMerger(2);
      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(210, now);

      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(220, now);

      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      leftGain.gain.setValueAtTime(0.2, now);
      rightGain.gain.setValueAtTime(0.2, now);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      merger.connect(masterGain);
      leftOsc.start(now);
      rightOsc.start(now);

      ambientNodes = {
        gainNode: masterGain,
        stop: () => {
          try {
            leftOsc.stop();
            rightOsc.stop();
            leftOsc.disconnect();
            rightOsc.disconnect();
            masterGain.disconnect();
          } catch {}
        },
      };
    } else {
      // Rain, White Noise, Pink Noise, Cafe, Forest (stereo-decorrelated natural textures)
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let r0 = 0, r1 = 0, r2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w1 = Math.random() * 2 - 1;
        const w2 = Math.random() * 2 - 1;
        if (type === 'whitenoise') {
          left[i] = w1 * 0.14;
          right[i] = w2 * 0.14;
        } else {
          b0 = 0.99886 * b0 + w1 * 0.0555179;
          b1 = 0.99332 * b1 + w1 * 0.0750759;
          b2 = 0.96900 * b2 + w1 * 0.1538520;
          b3 = 0.86650 * b3 + w1 * 0.3104856;
          b4 = 0.55000 * b4 + w1 * 0.5329522;
          b5 = -0.7616 * b5 - w1 * 0.0168980;
          const pinkL = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w1 * 0.5362) * 0.042;
          b6 = w1 * 0.115926;

          r0 = 0.997 * r0 + w2 * 0.07;
          r1 = 0.975 * r1 + w2 * 0.15;
          r2 = 0.85 * r2 + w2 * 0.25;
          const pinkR = (r0 + r1 + r2 + w2 * 0.45) * 0.042;

          if (type === 'rain' && Math.random() < 0.0025) {
            // Subtle raindrop patters
            left[i] = pinkL + (Math.random() * 2 - 1) * 0.09;
            right[i] = pinkR;
          } else {
            left[i] = pinkL;
            right[i] = pinkR;
          }
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.setValueAtTime(1.2, now);
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(580, now);
        filter.Q.setValueAtTime(1.1, now);
      } else if (type === 'forest') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);
      }

      let breezeLfo: OscillatorNode | null = null;
      if (type === 'forest') {
        breezeLfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        breezeLfo.frequency.setValueAtTime(0.14, now);
        lfoGain.gain.setValueAtTime(260, now);
        breezeLfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        breezeLfo.start(now);
      }

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start(now);

      ambientNodes = {
        gainNode: masterGain,
        stop: () => {
          try {
            noiseSource.stop();
            breezeLfo?.stop();
            noiseSource.disconnect();
            filter.disconnect();
            masterGain.disconnect();
          } catch {}
        },
      };
    }
  } catch (err) {
    console.warn('Ambient audio error:', err);
  }
}

/**
 * Unified entry point for all Focus Music & Soundscapes (YouTube Focus Streams + Offline Synth).
 */
export function startAmbientSound(type: AmbientSoundType, volume: number = 0.4) {
  currentVolume = volume;
  if (type === 'off') {
    stopAmbientSound();
    return;
  }

  if (type === 'yt-custom') {
    const custom = loadCustomYoutubeTrack();
    if (custom) {
      void startYouTubeTrack(
        custom.videoId,
        ['jfKfPfyJRdk'],
        'yt-custom',
        custom.title,
        'Custom YouTube Stream',
        volume
      );
      return;
    }
  }

  const catalogEntry = FOCUS_TRACKS_CATALOG.find((t) => t.id === type);
  if (catalogEntry?.sourceType === 'youtube' && catalogEntry.youtubeId) {
    void startYouTubeTrack(
      catalogEntry.youtubeId,
      catalogEntry.fallbackYoutubeIds || [],
      type,
      catalogEntry.title,
      catalogEntry.channel || 'YouTube Focus Radio',
      volume
    );
    return;
  }

  startSynthSound(type, volume, type);
}

export function updateAmbientVolume(volume: number) {
  currentVolume = volume;
  if (ambientNodes && audioCtx) {
    ambientNodes.gainNode.gain.setValueAtTime(Math.max(0.0001, volume), audioCtx.currentTime);
  }
  if (ytPlayer && ytPlayerReady && currentStatus.source === 'youtube') {
    try {
      ytPlayer.setVolume(Math.round(volume * 100));
    } catch {
      // ignore
    }
  }
}

export function stopAmbientSound(notifyExternal: boolean = false) {
  desiredPlaying = false;
  stopBackgroundWatchdog();
  stopBackgroundAudioKeeper();
  clearMediaSession();
  stopYouTubePlaybackOnly();
  stopSynthNodesOnly();

  emitStatus({
    activeSound: 'off',
    source: 'off',
    state: 'idle',
    trackTitle: 'Off',
    artist: 'Chronos Focus Studio',
    youtubeId: undefined,
    notice: undefined,
  });

  if (notifyExternal) {
    externalStopListeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
  }
}
