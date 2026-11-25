type WakeLockMode = 'native' | 'fallback' | 'none';

interface WakeLockSentinelLike {
  released?: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

let wakeLockSentinel: WakeLockSentinelLike | null = null;
let fallbackVideoEl: HTMLVideoElement | null = null;
let fallbackStream: MediaStream | null = null;
let fallbackCanvasTimer: number | null = null;
let activeMode: WakeLockMode = 'none';
let releaseCallback: (() => void) | null = null;

/**
 * Subscribe to unexpected wake lock releases (e.g. tab minimized or OS battery saver)
 */
export function setWakeLockReleaseListener(cb: (() => void) | null) {
  releaseCallback = cb;
}

/**
 * Query whether a screen keep-awake lock is currently held and via which mechanism
 */
export function getWakeLockStatus(): { active: boolean; mode: WakeLockMode } {
  const nativeActive = Boolean(wakeLockSentinel && wakeLockSentinel.released !== true);
  const fallbackActive = Boolean(fallbackVideoEl && !fallbackVideoEl.paused);

  if (nativeActive) {
    return { active: true, mode: 'native' };
  }
  if (fallbackActive) {
    return { active: true, mode: 'fallback' };
  }
  return { active: false, mode: 'none' };
}

/**
 * Request Notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Send an OS / browser notification when study interval completes in the background
 */
export function sendStudyNotification(title: string, body: string, tag: string = 'chronos-timer') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        requireInteraction: true,
      });
    } catch (err) {
      console.warn('Notification could not be dispatched:', err);
    }
  }
}

function stopFallbackWakeLock() {
  if (fallbackCanvasTimer !== null) {
    window.clearInterval(fallbackCanvasTimer);
    fallbackCanvasTimer = null;
  }
  if (fallbackVideoEl) {
    try {
      fallbackVideoEl.pause();
      fallbackVideoEl.srcObject = null;
      fallbackVideoEl.remove();
    } catch {
      // ignore
    }
    fallbackVideoEl = null;
  }
  if (fallbackStream) {
    try {
      fallbackStream.getTracks().forEach((track) => track.stop());
    } catch {
      // ignore
    }
    fallbackStream = null;
  }
  if (activeMode === 'fallback') {
    activeMode = 'none';
  }
}

async function startFallbackWakeLock(): Promise<boolean> {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  if (fallbackVideoEl && !fallbackVideoEl.paused) {
    activeMode = 'fallback';
    return true;
  }

  stopFallbackWakeLock();

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    let toggle = false;
    const drawTick = () => {
      toggle = !toggle;
      ctx.fillStyle = toggle ? '#010101' : '#020202';
      ctx.fillRect(0, 0, 16, 16);
    };
    drawTick();

    const captureCanvas = canvas as HTMLCanvasElement & {
      captureStream?: (frameRate?: number) => MediaStream;
    };

    if (typeof captureCanvas.captureStream !== 'function') {
      return false;
    }

    const stream = captureCanvas.captureStream(1);
    fallbackStream = stream;

    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('aria-hidden', 'true');
    video.playsInline = true;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.width = 1;
    video.height = 1;
    video.style.position = 'fixed';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.001';
    video.style.pointerEvents = 'none';
    video.style.bottom = '0';
    video.style.right = '0';
    video.style.zIndex = '-1';
    video.srcObject = stream;

    document.body.appendChild(video);
    fallbackVideoEl = video;

    // Paint minimal frame updates so browser compositor considers the media active
    fallbackCanvasTimer = window.setInterval(drawTick, 4000);

    await video.play();
    activeMode = 'fallback';
    return true;
  } catch {
    stopFallbackWakeLock();
    return false;
  }
}

const handleNativeRelease = () => {
  wakeLockSentinel = null;
  if (activeMode === 'native') {
    activeMode = 'none';
  }
  if (releaseCallback) {
    releaseCallback();
  }
};

/**
 * Request Screen Wake Lock to keep display on during intense study sessions.
 * Uses native navigator.wakeLock when permitted, and falls back to an ultra-lightweight
 * silent muted 1px video stream when inside iframes or browsers without WakeLock support.
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return false;
  }

  // If already active and unreleased, succeed immediately
  if (wakeLockSentinel && wakeLockSentinel.released !== true) {
    activeMode = 'native';
    return true;
  }

  // 1. Try native Screen Wake Lock API first
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      const lockNavigator = navigator as unknown as {
        wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
      };
      const sentinel = await lockNavigator.wakeLock.request('screen');
      wakeLockSentinel = sentinel;
      activeMode = 'native';
      stopFallbackWakeLock();

      if (typeof sentinel.addEventListener === 'function') {
        sentinel.addEventListener('release', handleNativeRelease);
      }
      return true;
    } catch {
      // Blocked (e.g. iframe Permissions-Policy) or unsupported: fall through to video keep-awake
      wakeLockSentinel = null;
    }
  }

  // 2. Fallback hidden 1px muted media keep-awake
  const fallbackOk = await startFallbackWakeLock();
  return fallbackOk;
}

/**
 * Release Screen Wake Lock (both native sentinel and compatibility video fallback)
 */
export function releaseScreenWakeLock() {
  if (wakeLockSentinel) {
    try {
      if (typeof wakeLockSentinel.removeEventListener === 'function') {
        wakeLockSentinel.removeEventListener('release', handleNativeRelease);
      }
      void wakeLockSentinel.release();
    } catch {
      // ignore
    }
    wakeLockSentinel = null;
  }
  stopFallbackWakeLock();
  activeMode = 'none';
}

/**
 * Integrate with Media Session API for Lockscreen study controls
 */
export function updateMediaSession(
  title: string,
  artist: string,
  playbackState: 'playing' | 'paused' | 'none',
  handlers?: {
    onPlay?: () => void;
    onPause?: () => void;
    onNext?: () => void;
  }
) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Chronos Productivity Clock',
    });

    navigator.mediaSession.playbackState = playbackState;

    if (handlers?.onPlay) {
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    }
    if (handlers?.onPause) {
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    }
    if (handlers?.onNext) {
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    }
  } catch {
    // ignore
  }
}
