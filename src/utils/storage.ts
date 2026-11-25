import { COSMETIC_ARTWORK_IMAGES } from './cosmeticAssets';
import {
  AlarmItem,
  DeepWorkSession,
  PomodoroConfig,
  StudyTask,
  WorldClockCity,
  SubjectItem,
  SubjectColor,
  BackgroundSettings,
  ChronosWallet,
  AmbientSoundType,
  FocusMusicTrack,
  AchievementItem,
  DailyCheckInData,
  CustomizationSettings,
  AppTab,
  ZenDesignStyle,
  GlassThemeId,
  StoreFrameItem,
  StoreBackgroundItem,
  StoreAvatarItem,
  ScholarTierStep,
  ScholarRankInfo,
  CustomYoutubeTrack,
  SavedCustomYoutubeTrack,
  PersistedAuthSession,
  DEFAULT_YOUTUBE_PLAYLISTS,
} from '../types';

const STORAGE_KEYS = {
  ALARMS: 'chronos_alarms_v1',
  POMODORO_CONFIG: 'chronos_pomodoro_cfg_v1',
  SESSIONS: 'chronos_sessions_v1',
  TASKS: 'chronos_tasks_v1',
  CITIES: 'chronos_cities_v1',
  CLOCK_STYLE: 'chronos_clock_style_v1',
  SUBJECTS: 'chronos_subjects_v1',
  BACKGROUND_SETTINGS: 'chronos_background_settings_v1',
  WALLET: 'chronos_wallet_v1',
  DAILY_CHECKIN: 'chronos_daily_checkin_v1',
  DAILY_CHECKIN_SNOOZE: 'chronos_daily_checkin_snooze_v1',
  CUSTOMIZATION: 'chronos_customization_v1',
  AUTH_SESSION: 'chronos_auth_session_v1',
};

export const FOCUS_TRACKS_CATALOG: FocusMusicTrack[] = [
  {
    id: 'yt-lofi-girl',
    title: 'Lofi Girl — Beats to Study & Relax',
    subtitle: 'Official 24/7 Lo-Fi Study Radio (Free)',
    description:
      'Iconic warm lo-fi hip-hop study beats curated for effortless flow, reading, and long problem-solving nights.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'jfKfPfyJRdk',
    fallbackYoutubeIds: ['5qap5aO4i9A', '4xDzrJKXOOY'],
    channel: 'Lofi Girl',
    costPoints: 0,
    bpm: 78,
    tags: ['YouTube', 'Lo-Fi Radio', 'Study Beats', 'Included'],
  },
  {
    id: 'yt-classical',
    title: 'Classical Study — Mozart, Chopin & Debussy',
    subtitle: 'YouTube Classical Instrumental Reading Mix (Free)',
    description:
      'Acoustic orchestral & solo piano masterpieces for analytical writing, math proofs, and quiet late-night reading.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'mIYzp5rcTvU',
    fallbackYoutubeIds: ['WPni755-Krg'],
    channel: 'Classical Study Mix',
    costPoints: 0,
    tags: ['YouTube', 'Classical Piano', 'Instrumental', 'Included'],
  },
  {
    id: 'yt-synthwave',
    title: 'Synthwave Radio — Chill Retro Focus',
    subtitle: '24/7 Chill Synthwave & Electronic (Free)',
    description:
      'Analog synth pads and steady retro-futuristic pulse built for coding, engineering sprints, and late-night deep work.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: '4xDzrJKXOOY',
    fallbackYoutubeIds: ['jfKfPfyJRdk'],
    channel: 'Lofi Girl Synthwave',
    costPoints: 0,
    bpm: 96,
    tags: ['YouTube', 'Synthwave', 'Coding', 'Included'],
  },
  {
    id: 'yt-alpha-focus',
    title: 'Deep Focus — Alpha Wave Ambient',
    subtitle: 'Memory & Concentration Music (Free)',
    description:
      'Spacious ambient harmonics tuned gently around alpha relaxation frequencies to sustain steady mental clarity.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'WPni755-Krg',
    fallbackYoutubeIds: ['mIYzp5rcTvU'],
    channel: 'Yellow Brick Cinema',
    costPoints: 0,
    tags: ['YouTube', 'Deep Focus', 'Alpha Ambient', 'Included'],
  },
  {
    id: 'yt-rain-thunder',
    title: 'Heavy Rain & Distant Thunder on Glass',
    subtitle: 'Field-Recorded Monsoon Ambience',
    description:
      'Authentic natural thunderstorm soundscape streaming from YouTube for immersive acoustic room isolation.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'mPZkdNFkNps',
    fallbackYoutubeIds: ['q76bMs-NwRk'],
    channel: 'Relaxing White Noise',
    costPoints: 140,
    tags: ['YouTube', 'Field Rain', 'Thunder', 'Immersion'],
  },
  {
    id: 'yt-chillhop',
    title: 'Chillhop Radio — Jazzy Instrumental Beats',
    subtitle: '24/7 Jazzhop & Dusty Keys',
    description:
      'Crisp jazzy guitar chords, brushed drums, and cozy coffeehouse grooves for marathon study blocks.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: '5qap5aO4i9A',
    fallbackYoutubeIds: ['jfKfPfyJRdk'],
    channel: 'Chillhop Music',
    costPoints: 220,
    bpm: 84,
    tags: ['YouTube', 'Chillhop', 'Jazz Beats', 'Radio'],
  },
  {
    id: 'yt-cafe-jazz',
    title: 'Rainy Coffee Shop — Smooth Focus Jazz',
    subtitle: 'Ambience & Mellow Piano Jazz (Free)',
    description:
      'Warm upright bass, soft brush percussion, and cozy cafe rain ambiance designed for reading and problem sets.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'c0_ejQQcrwI',
    fallbackYoutubeIds: ['5qap5aO4i9A', 'jfKfPfyJRdk'],
    channel: 'Cafe Music BGM',
    costPoints: 0,
    bpm: 74,
    tags: ['YouTube', 'Cafe Jazz', 'Acoustic', 'Included'],
  },
  {
    id: 'yt-fireplace-rain',
    title: 'Crackling Fireplace & Rain on Window',
    subtitle: ' Cozy Cabin Hearth Soundscape (Free)',
    description:
      'Deep organic hearth crackle layered with steady window rainfall to keep long late-night sessions grounded.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'L_LUpnjgPso',
    fallbackYoutubeIds: ['mPZkdNFkNps'],
    channel: 'Cozy Ambience',
    costPoints: 0,
    tags: ['YouTube', 'Fireplace', 'Rain', 'Included'],
  },
  {
    id: 'yt-ghibli-piano',
    title: 'Melodic Anime & Ghibli Study Piano',
    subtitle: 'Soft Solo Piano Collection (Free)',
    description:
      'Expressive, nostalgic solo piano arrangements paced gently to sustain concentration without lyrics.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'HSOtku1j600',
    fallbackYoutubeIds: ['mIYzp5rcTvU'],
    channel: 'Piano Study Lounge',
    costPoints: 0,
    bpm: 68,
    tags: ['YouTube', 'Solo Piano', 'Melodic', 'Included'],
  },
  {
    id: 'yt-dark-academia',
    title: 'Dark Academia Library — Rain & Cello',
    subtitle: 'YouTube Chamber Strings & Library Ambience',
    description:
      'Atmospheric chamber strings paired with muffled library rain for literature, essays, and exam prep.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: '3NycM9lYdRI',
    fallbackYoutubeIds: ['mIYzp5rcTvU', 'WPni755-Krg'],
    channel: 'Ambient Worlds',
    costPoints: 160,
    tags: ['YouTube', 'Strings', 'Library', 'Atmosphere'],
  },
  {
    id: 'yt-brown-noise',
    title: 'Velvet Brown Noise — Deep Focus Shield',
    subtitle: 'YouTube Smooth Low-Frequency Sound Curtain (Free)',
    description:
      'Warm bass-weighted continuous brown noise that softens jarring room distractions during intense study.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'RqzGzwTY-6w',
    fallbackYoutubeIds: ['WPni755-Krg'],
    channel: 'Deep Sound Studio',
    costPoints: 0,
    tags: ['YouTube', 'Brown Noise', 'Masking', 'Included'],
  },
  {
    id: 'yt-japanese-lofi',
    title: 'Kyoto Midnight Lo-Fi — Study Beats',
    subtitle: 'YouTube Soft Koto & Dusty Hip-Hop Grooves',
    description:
      'Minimalist late-night instrumental beats blended with gentle wooden percussion and mellow electric keys.',
    category: 'YouTube Focus',
    sourceType: 'youtube',
    youtubeId: 'kgx4WGK0oNU',
    fallbackYoutubeIds: ['jfKfPfyJRdk', '4xDzrJKXOOY'],
    channel: 'Shibuya Beats',
    costPoints: 180,
    bpm: 76,
    tags: ['YouTube', 'Lo-Fi', 'Night Study', 'Beats'],
  },
  {
    id: 'piano',
    title: 'Nocturne Study Piano (Offline)',
    subtitle: 'Gentle acoustic pentatonic piano chords',
    description:
      'Built-in generative acoustic piano voiced for sustained offline cognitive concentration and flow state.',
    category: 'Acoustic Piano',
    sourceType: 'synth',
    costPoints: 120,
    bpm: 64,
    tags: ['Offline Synth', 'Acoustic', 'Piano', 'Flow State'],
  },
  {
    id: 'waves',
    title: 'Pacific Shoreline Waves (Offline)',
    subtitle: 'Rhythmic ocean surf and tidal relaxation',
    description:
      'Offline rhythmic ocean swells with natural pink-frequency wash for deep focus masking.',
    category: 'Nature & Waves',
    sourceType: 'synth',
    costPoints: 180,
    tags: ['Offline Synth', 'Ocean', 'Surf', 'Nature'],
  },
  {
    id: 'lofi',
    title: 'Lo-Fi Chill Rhodes (Offline)',
    subtitle: 'Warm Rhodes electric chords with subtle tape warmth',
    description:
      'Smooth offline jazz-infused electric piano seventh chords wrapped in cozy vinyl warmth.',
    category: 'Lo-Fi Chill',
    sourceType: 'synth',
    costPoints: 260,
    bpm: 72,
    tags: ['Offline Synth', 'Lo-Fi', 'Rhodes', 'Mellow'],
  },
  {
    id: 'cosmic',
    title: '432Hz Deep Space Theta Drone (Offline)',
    subtitle: 'Deep resonance cosmic drone meditation',
    description:
      'Expansive 432Hz tuned fundamental harmonic drone designed to quiet mental chatter offline.',
    category: 'Cosmic Drone',
    sourceType: 'synth',
    costPoints: 380,
    tags: ['Offline Synth', '432Hz', 'Theta Waves', 'Meditation'],
  },
  {
    id: 'binaural',
    title: '10Hz Alpha Neuro-Wave',
    subtitle: 'Dual ear frequency entrainment (Free)',
    description:
      'Pure 10Hz binaural beat designed for active study, memory consolidation, and high alert retention.',
    category: 'Neuro-Alpha',
    sourceType: 'synth',
    costPoints: 0,
    tags: ['Alpha Waves', 'Neuroscience', 'Memory', 'Included'],
  },
  {
    id: 'rain',
    title: 'Monsoon Study Window',
    subtitle: 'Continuous rainfall on acoustic glass (Free)',
    description:
      'Soothing rain audio with filtered low-mid frequencies to mask outside conversations.',
    category: 'Nature & Waves',
    sourceType: 'synth',
    costPoints: 0,
    tags: ['Rain', 'Monsoon', 'Peaceful', 'Included'],
  },
  {
    id: 'whitenoise',
    title: 'White Noise Acoustic Shroud',
    subtitle: 'Uniform full-spectrum frequency masking (Free)',
    description:
      'Even distribution across all audible frequencies to block distracting sudden noises.',
    category: 'Background Noise',
    sourceType: 'synth',
    costPoints: 0,
    tags: ['Full Spectrum', 'Masking', 'Silent Room', 'Included'],
  },
  {
    id: 'pinknoise',
    title: 'Pink Noise Deep Focus',
    subtitle: 'Natural 1/f harmonic power distribution (Free)',
    description:
      'Deeper and softer than white noise, scientifically proven to improve sustained attention.',
    category: 'Background Noise',
    sourceType: 'synth',
    costPoints: 0,
    tags: ['1/f Curve', 'Balanced', 'Soft', 'Included'],
  },
  {
    id: 'cafe',
    title: 'Old Town Study Cafe',
    subtitle: 'Atmospheric coffee house murmur (Free)',
    description:
      'Subtle ambient hum of distant barista activity and gentle background presence.',
    category: 'Background Noise',
    sourceType: 'synth',
    costPoints: 0,
    tags: ['Atmosphere', 'Social Presence', 'Focus', 'Included'],
  },
  {
    id: 'forest',
    title: 'Nordic Woods Sanctuary',
    subtitle: 'Gentle canopy wind and leaves (Free)',
    description:
      'Subtle woodland breeze and high canopy resonance to soothe overstimulated minds.',
    category: 'Nature & Waves',
    sourceType: 'synth',
    costPoints: 0,
    tags: ['Forest', 'Woodland', 'Breeze', 'Included'],
  },
];

const CUSTOM_YT_STORAGE_KEY = 'chronos_custom_youtube_v1';
const SAVED_YT_LIBRARY_KEY = 'chronos_saved_youtube_tracks_v1';
const YT_PLAYLISTS_KEY = 'chronos_youtube_playlists_v1';
const AUDIO_REPEAT_MODE_KEY = 'chronos_audio_repeat_v1';
const AUDIO_SHUFFLE_MODE_KEY = 'chronos_audio_shuffle_v1';

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const seg = url.pathname.split('/').filter(Boolean)[0];
      return seg && /^[a-zA-Z0-9_-]{11}$/.test(seg) ? seg : null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;
      const parts = url.pathname.split('/').filter(Boolean);
      const markerIdx = parts.findIndex((p) => p === 'live' || p === 'embed' || p === 'shorts');
      if (markerIdx >= 0 && parts[markerIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[markerIdx + 1])) {
        return parts[markerIdx + 1];
      }
    }
  } catch {
    // ignore URL parse error
  }
  return null;
}

export function loadCustomYoutubeTrack(): CustomYoutubeTrack | null {
  try {
    const raw = localStorage.getItem(CUSTOM_YT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CustomYoutubeTrack>;
    if (parsed && typeof parsed.videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(parsed.videoId)) {
      return {
        videoId: parsed.videoId,
        title: (parsed.title || '').trim() || 'Custom YouTube Focus Stream',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCustomYoutubeTrack(track: CustomYoutubeTrack): void {
  try {
    localStorage.setItem(CUSTOM_YT_STORAGE_KEY, JSON.stringify(track));
  } catch {
    // ignore
  }
}

export function normalizePlaylistName(name: unknown): string {
  if (typeof name !== 'string') return 'Deep Focus';
  const cleaned = name.trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!cleaned) return 'Deep Focus';
  const matchDefault = DEFAULT_YOUTUBE_PLAYLISTS.find(
    (d) => d.toLowerCase() === cleaned.toLowerCase()
  );
  return matchDefault || cleaned;
}

export function normalizeYoutubePlaylists(raw: unknown): string[] {
  const result: string[] = [...DEFAULT_YOUTUBE_PLAYLISTS];
  const seen = new Set<string>(result.map((p) => p.toLowerCase()));
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item !== 'string') continue;
      const cleaned = item.trim().replace(/\s+/g, ' ').slice(0, 40);
      if (!cleaned) continue;
      const key = cleaned.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(cleaned);
      if (result.length >= 24) break;
    }
  }
  return result;
}

export function normalizeSavedYoutubeTracks(raw: unknown): SavedCustomYoutubeTrack[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const cleaned: SavedCustomYoutubeTrack[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Partial<SavedCustomYoutubeTrack>;
    if (typeof rec.videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(rec.videoId)) continue;
    if (seen.has(rec.videoId)) continue;
    seen.add(rec.videoId);
    const cleanTitle = (rec.title || '').trim().slice(0, 80) || 'Saved YouTube Track';
    const cleanUrl =
      typeof rec.url === 'string' && rec.url.trim()
        ? rec.url.trim().slice(0, 300)
        : `https://www.youtube.com/watch?v=${rec.videoId}`;
    cleaned.push({
      id: typeof rec.id === 'string' && rec.id ? rec.id : `yt-${rec.videoId}`,
      videoId: rec.videoId,
      title: cleanTitle,
      url: cleanUrl,
      playlist: normalizePlaylistName(rec.playlist),
      savedAt: typeof rec.savedAt === 'number' && Number.isFinite(rec.savedAt) ? rec.savedAt : Date.now(),
    });
  }
  return cleaned;
}

export function loadSavedYoutubeTracks(): SavedCustomYoutubeTrack[] {
  try {
    const raw = localStorage.getItem(SAVED_YT_LIBRARY_KEY);
    const parsed = raw ? normalizeSavedYoutubeTracks(JSON.parse(raw)) : [];
    if (parsed.length > 0) return parsed;

    // Auto-migrate legacy single custom track if present
    const legacy = loadCustomYoutubeTrack();
    if (legacy) {
      const migrated: SavedCustomYoutubeTrack[] = [
        {
          id: `yt-${legacy.videoId}`,
          videoId: legacy.videoId,
          title: legacy.title,
          url: `https://www.youtube.com/watch?v=${legacy.videoId}`,
          playlist: 'Deep Focus',
          savedAt: Date.now(),
        },
      ];
      localStorage.setItem(SAVED_YT_LIBRARY_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

export function replaceSavedYoutubeTracks(tracks: SavedCustomYoutubeTrack[]): SavedCustomYoutubeTrack[] {
  const normalized = normalizeSavedYoutubeTracks(tracks);
  try {
    localStorage.setItem(SAVED_YT_LIBRARY_KEY, JSON.stringify(normalized));
  } catch {
    // ignore
  }
  return normalized;
}

export function loadYoutubePlaylists(): string[] {
  try {
    const raw = localStorage.getItem(YT_PLAYLISTS_KEY);
    const base = raw ? normalizeYoutubePlaylists(JSON.parse(raw)) : [...DEFAULT_YOUTUBE_PLAYLISTS];
    const savedTracks = loadSavedYoutubeTracks();
    const extra = savedTracks
      .map((t) => t.playlist)
      .filter((p): p is string => Boolean(p && p.trim()));
    return normalizeYoutubePlaylists([...base, ...extra]);
  } catch {
    return [...DEFAULT_YOUTUBE_PLAYLISTS];
  }
}

export function replaceYoutubePlaylists(playlists: string[]): string[] {
  const normalized = normalizeYoutubePlaylists(playlists);
  try {
    localStorage.setItem(YT_PLAYLISTS_KEY, JSON.stringify(normalized));
  } catch {
    // ignore
  }
  return normalized;
}

export function addCustomYoutubePlaylist(name: string): string[] {
  const cleaned = name.trim().replace(/\s+/g, ' ').slice(0, 40);
  const existing = loadYoutubePlaylists();
  if (!cleaned) return existing;
  return replaceYoutubePlaylists([...existing, cleaned]);
}

export function removeCustomYoutubePlaylist(name: string): {
  playlists: string[];
  tracks: SavedCustomYoutubeTrack[];
} {
  const isDefault = DEFAULT_YOUTUBE_PLAYLISTS.some(
    (d) => d.toLowerCase() === name.trim().toLowerCase()
  );
  const currentPlaylists = loadYoutubePlaylists();
  const currentTracks = loadSavedYoutubeTracks();
  if (isDefault) {
    return { playlists: currentPlaylists, tracks: currentTracks };
  }
  const nextPlaylists = replaceYoutubePlaylists(
    currentPlaylists.filter((p) => p.toLowerCase() !== name.trim().toLowerCase())
  );
  const nextTracks = replaceSavedYoutubeTracks(
    currentTracks.map((t) =>
      (t.playlist || 'Deep Focus').toLowerCase() === name.trim().toLowerCase()
        ? { ...t, playlist: 'Deep Focus' }
        : t
    )
  );
  return { playlists: nextPlaylists, tracks: nextTracks };
}

export function saveCustomYoutubeTrackToLibrary(input: {
  videoId: string;
  title: string;
  url?: string;
  playlist?: string;
}): SavedCustomYoutubeTrack[] {
  const existing = loadSavedYoutubeTracks();
  const prev = existing.find((item) => item.videoId === input.videoId);
  const cleanTitle = input.title.trim().slice(0, 80) || `YouTube Music (${input.videoId})`;
  const cleanUrl =
    (input.url || '').trim().slice(0, 300) || `https://www.youtube.com/watch?v=${input.videoId}`;
  const playlistName = normalizePlaylistName(input.playlist || prev?.playlist);
  const entry: SavedCustomYoutubeTrack = {
    id: `yt-${input.videoId}`,
    videoId: input.videoId,
    title: cleanTitle,
    url: cleanUrl,
    playlist: playlistName,
    savedAt: Date.now(),
  };
  const next = [entry, ...existing.filter((item) => item.videoId !== input.videoId)];
  return replaceSavedYoutubeTracks(next);
}

export function updateSavedYoutubeTrackPlaylist(
  idOrVideoId: string,
  playlist: string
): SavedCustomYoutubeTrack[] {
  const targetPlaylist = normalizePlaylistName(playlist);
  const existing = loadSavedYoutubeTracks();
  const next = existing.map((item) =>
    item.id === idOrVideoId || item.videoId === idOrVideoId
      ? { ...item, playlist: targetPlaylist }
      : item
  );
  return replaceSavedYoutubeTracks(next);
}

export function removeSavedYoutubeTrack(idOrVideoId: string): SavedCustomYoutubeTrack[] {
  const existing = loadSavedYoutubeTracks();
  const next = existing.filter(
    (item) => item.id !== idOrVideoId && item.videoId !== idOrVideoId
  );
  return replaceSavedYoutubeTracks(next);
}

export function loadAudioRepeatMode(): boolean {
  try {
    const raw = localStorage.getItem(AUDIO_REPEAT_MODE_KEY);
    if (raw === null) return true; // Repeat enabled by default so study tracks loop continuously
    return raw !== 'false' && raw !== '0';
  } catch {
    return true;
  }
}

export function saveAudioRepeatMode(enabled: boolean): void {
  try {
    localStorage.setItem(AUDIO_REPEAT_MODE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function loadAudioShuffleMode(): boolean {
  try {
    const raw = localStorage.getItem(AUDIO_SHUFFLE_MODE_KEY);
    return raw === 'true' || raw === '1';
  } catch {
    return false;
  }
}

export function saveAudioShuffleMode(enabled: boolean): void {
  try {
    localStorage.setItem(AUDIO_SHUFFLE_MODE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

// ============================================================================
// SINGLE CHRONOS STORE — PROFILE FRAMES, BACKGROUNDS & AVATARS (GRIND ECONOMY)
// ============================================================================

export const STORE_FRAMES_CATALOG: StoreFrameItem[] = [
  {
    id: 'default',
    name: 'Classic Glass Frame',
    subtitle: 'Clean frosted specular rim (Included)',
    description: 'Default sleek Chronos frame with subtle glass hairline border.',
    rarity: 'Starter',
    costPoints: 0,
    ringBackground: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))',
    glowShadow: 'none',
    ornamentKey: 'none',
    badgeColor: '#94a3b8',
  },
  {
    id: 'frame-art-sovereign-laurel',
    name: 'Sovereign Gold Laurel Crown',
    subtitle: 'Signature Edition · Sculpted royal gold wreath',
    description:
      'High-detail gilded laurel leaf wreath crowned with a radiant imperial crest and delicate gold starlight glints.',
    rarity: 'Legendary',
    costPoints: 2200,
    ringBackground: 'linear-gradient(135deg, #fef08a 0%, #d97706 50%, #78350f 100%)',
    glowShadow: '0 0 20px rgba(245, 158, 11, 0.52)',
    ornamentKey: 'none',
    badgeLabel: 'SOVEREIGN',
    badgeColor: '#f59e0b',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameSovereignLaurel,
    imageScale: 1.66,
  },
  {
    id: 'frame-art-azure-dragon',
    name: 'Azure Celestial Dragon Ring',
    subtitle: 'Signature Edition · Luminous sapphire guardian',
    description:
      'Finely rendered sapphire and frost-cyan dragon coiling cleanly around your avatar rim with crystalline flares.',
    rarity: 'Mythic',
    costPoints: 3600,
    ringBackground: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 52%, #1e1b4b 100%)',
    glowShadow: '0 0 22px rgba(56, 189, 248, 0.58)',
    ornamentKey: 'none',
    badgeLabel: 'DRAGON',
    badgeColor: '#38bdf8',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameAzureDragon,
    imageScale: 1.66,
  },
  // === Profile Customization Collection — 10 Premium Transparent Frames (Mid to High Tier) ===
  {
    id: 'frame-col-celestial-violet',
    name: 'Celestial Violet Laurel',
    subtitle: 'Collection Series · Luminous indigo petal halo',
    description:
      'Radiant violet-sapphire crescent band framed by crystalline glowing leaves along the lower rim.',
    rarity: 'Epic',
    costPoints: 4200,
    ringBackground: 'linear-gradient(135deg, #a855f7 0%, #6366f1 55%, #38bdf8 100%)',
    glowShadow: '0 0 18px rgba(139, 92, 246, 0.5)',
    ornamentKey: 'none',
    badgeLabel: 'CELESTIAL',
    badgeColor: '#a855f7',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColCelestialViolet,
    imageScale: 1.82,
  },
  {
    id: 'frame-col-sakura-wreath',
    name: 'Blossoming Sakura Wreath',
    subtitle: 'Collection Series · Spring cherry petal circlet',
    description:
      'Delicate hand-illustrated cherry blossoms and rose petals braided cleanly around your circular portrait.',
    rarity: 'Epic',
    costPoints: 5400,
    ringBackground: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 55%, #be185d 100%)',
    glowShadow: '0 0 18px rgba(244, 114, 182, 0.5)',
    ornamentKey: 'none',
    badgeLabel: 'BLOSSOM',
    badgeColor: '#f472b6',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColSakuraWreath,
    imageScale: 1.86,
  },
  {
    id: 'frame-col-frostwing-butterfly',
    name: 'Frostwing Butterfly Ring',
    subtitle: 'Collection Series · Twin pearl-frost butterflies',
    description:
      'Translucent ice-pearl halo graced with twin sculpted sapphire-white butterflies resting on opposite arcs.',
    rarity: 'Epic',
    costPoints: 6800,
    ringBackground: 'linear-gradient(135deg, #e0f2fe 0%, #93c5fd 50%, #818cf8 100%)',
    glowShadow: '0 0 18px rgba(147, 197, 253, 0.52)',
    ornamentKey: 'none',
    badgeLabel: 'FROSTWING',
    badgeColor: '#93c5fd',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColFrostwingButterfly,
    imageScale: 1.86,
  },
  {
    id: 'frame-col-cyber-cryo',
    name: 'Cyber Cryo Arc',
    subtitle: 'Collection Series · Hyper-charged glacial alloy',
    description:
      'Sharp electric-cyan kinetic blades interlocked into a sleek futuristic energy containment ring.',
    rarity: 'Legendary',
    costPoints: 8500,
    ringBackground: 'linear-gradient(135deg, #67e8f9 0%, #0ea5e9 55%, #1d4ed8 100%)',
    glowShadow: '0 0 20px rgba(14, 165, 233, 0.55)',
    ornamentKey: 'none',
    badgeLabel: 'CRYO ARC',
    badgeColor: '#38bdf8',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColCyberCryo,
    imageScale: 1.76,
  },
  {
    id: 'frame-col-lunar-chime',
    name: 'Lunar Gold Chime',
    subtitle: 'Collection Series · Crescent moon & hanging stars',
    description:
      'Warm brushed-gold celestial ring crowned with a glowing crescent moon and suspended starlight pendants.',
    rarity: 'Legendary',
    costPoints: 10200,
    ringBackground: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 55%, #92400e 100%)',
    glowShadow: '0 0 20px rgba(245, 158, 11, 0.52)',
    ornamentKey: 'none',
    badgeLabel: 'LUNAR',
    badgeColor: '#fbbf24',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColLunarChime,
    imageScale: 1.86,
  },
  {
    id: 'frame-col-amethyst-thorn',
    name: 'Amethyst Thorn Crest',
    subtitle: 'Collection Series · Arcane royal briar aura',
    description:
      'Razor-edged royal violet briars pulsing with dark amethyst lightning across a gothic circular seal.',
    rarity: 'Legendary',
    costPoints: 12400,
    ringBackground: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 55%, #3b0764 100%)',
    glowShadow: '0 0 22px rgba(168, 85, 247, 0.56)',
    ornamentKey: 'none',
    badgeLabel: 'AMETHYST',
    badgeColor: '#c084fc',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColAmethystThorn,
    imageScale: 1.76,
  },
  {
    id: 'frame-col-astral-orbit',
    name: 'Astral Orbit Halo',
    subtitle: 'Collection Series · Ringed planets & stardust',
    description:
      'Deep-space nebula ring traced by glowing golden ringed planets, orbiting moons, and cosmic sparks.',
    rarity: 'Legendary',
    costPoints: 14800,
    ringBackground: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #f59e0b 100%)',
    glowShadow: '0 0 22px rgba(99, 102, 241, 0.58)',
    ornamentKey: 'none',
    badgeLabel: 'ASTRAL',
    badgeColor: '#818cf8',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColAstralOrbit,
    imageScale: 1.82,
  },
  {
    id: 'frame-col-crimson-fang',
    name: 'Crimson Dragon Fang',
    subtitle: 'Collection Series · Forged obsidian & ruby scales',
    description:
      'Razor-forged obsidian and silver dragon armor laced with a glowing crimson inner core.',
    rarity: 'Mythic',
    costPoints: 17500,
    ringBackground: 'linear-gradient(135deg, #f87171 0%, #dc2626 50%, #18181b 100%)',
    glowShadow: '0 0 24px rgba(239, 68, 68, 0.58)',
    ornamentKey: 'none',
    badgeLabel: 'CRIMSON',
    badgeColor: '#ef4444',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColCrimsonFang,
    imageScale: 1.76,
  },
  {
    id: 'frame-col-glacial-crown',
    name: 'Glacial Ice Crown',
    subtitle: 'Collection Series · Faceted permafrost diadem',
    description:
      'Crystalline frost-diamond spire crown curving into sculpted ice-leaf crests around your avatar.',
    rarity: 'Mythic',
    costPoints: 19800,
    ringBackground: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 52%, #1e40af 100%)',
    glowShadow: '0 0 24px rgba(56, 189, 248, 0.62)',
    ornamentKey: 'none',
    badgeLabel: 'GLACIAL',
    badgeColor: '#38bdf8',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColGlacialCrown,
    imageScale: 1.94,
  },
  {
    id: 'frame-col-imperial-crown',
    name: 'Imperial Sovereign Crown',
    subtitle: 'Collection Series · Filigree royal gold crest',
    description:
      'Opulent twin-filigree gold ring topped with a sculpted royal crown and inlaid sapphire medallion.',
    rarity: 'Mythic',
    costPoints: 22500,
    ringBackground: 'linear-gradient(135deg, #fef08a 0%, #eab308 50%, #854d0e 100%)',
    glowShadow: '0 0 26px rgba(234, 179, 8, 0.65)',
    ornamentKey: 'none',
    badgeLabel: 'IMPERIAL',
    badgeColor: '#eab308',
    noSpinRing: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.frameColImperialCrown,
    imageScale: 1.82,
  },
  {
    id: 'frame-bronze-crest',
    name: 'Bronze Battlement',
    subtitle: '7.5+ hrs focus grind · Forged armor crenelation',
    description: 'Hammered antique bronze castle corners with riveted fortress studs.',
    rarity: 'Rare',
    costPoints: 450,
    ringBackground: 'linear-gradient(135deg, #fbbf24 0%, #b45309 50%, #78350f 100%)',
    glowShadow: '0 0 14px rgba(180, 83, 9, 0.45)',
    ornamentKey: 'battlement',
    badgeLabel: 'BRONZE',
    badgeColor: '#d97706',
  },
  {
    id: 'frame-sakura-gold',
    name: 'Sakura Rose Filigree',
    subtitle: '11 hrs focus grind · Embossed cherry petals',
    description: 'Satin rose-gold frame crowned with sculptural five-petal sakura blossoms.',
    rarity: 'Rare',
    costPoints: 650,
    ringBackground: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 48%, #f59e0b 100%)',
    glowShadow: '0 0 15px rgba(244, 114, 182, 0.45)',
    ornamentKey: 'sakura',
    badgeLabel: 'SAKURA',
    badgeColor: '#f472b6',
  },
  {
    id: 'frame-frost-crystal',
    name: 'Glacier Shard Crown',
    subtitle: '15 hrs focus grind · Faceted ice spikes',
    description: 'Chiseled glacial diamond prisms jutting sharply from all four cardinal axes.',
    rarity: 'Rare',
    costPoints: 900,
    ringBackground: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 48%, #1d4ed8 100%)',
    glowShadow: '0 0 16px rgba(56, 189, 248, 0.48)',
    ornamentKey: 'crystal',
    badgeLabel: 'CRYSTAL',
    badgeColor: '#38bdf8',
  },
  {
    id: 'frame-zardozi-stitch',
    name: 'Zardozi Gold Embroidery',
    subtitle: '20 hrs focus grind · Couched pearl thread',
    description: 'Velvet ruby rim embroidered with golden zari chain-stitches & paisley corner scrolls.',
    rarity: 'Rare',
    costPoints: 1200,
    ringBackground: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 42%, #facc15 100%)',
    glowShadow: '0 0 18px rgba(234, 179, 8, 0.48)',
    ornamentKey: 'zardozi',
    badgeLabel: 'ZARDOZI',
    badgeColor: '#facc15',
  },
  {
    id: 'frame-emerald-viper',
    name: 'Emerald Viper Fangs',
    subtitle: '25 hrs focus grind · Jade serpent coils',
    description: 'Interlocking jade scale bezel flanked by twin geometric viper fangs.',
    rarity: 'Epic',
    costPoints: 1500,
    ringBackground: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 45%, #065f46 100%)',
    glowShadow: '0 0 18px rgba(16, 185, 129, 0.5)',
    ornamentKey: 'viper',
    badgeLabel: 'VIPER',
    badgeColor: '#10b981',
  },
  {
    id: 'frame-tourbillon-gear',
    name: 'Horology Tourbillon',
    subtitle: '30 hrs focus grind · Brass escapement teeth',
    description: 'Swiss watchmaker bronze gear-tooth perimeter studded with crimson ruby bearings.',
    rarity: 'Epic',
    costPoints: 1800,
    ringBackground: 'linear-gradient(135deg, #d97706 0%, #451a03 52%, #fbbf24 100%)',
    glowShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
    ornamentKey: 'tourbillon',
    badgeLabel: 'CALIBER',
    badgeColor: '#f59e0b',
  },
  {
    id: 'frame-phantom-obsidian',
    name: 'Phantom Hex-Bracket',
    subtitle: '35 hrs focus grind · Brushed titanium',
    description: 'Chamfered stealth gunmetal tactical corner brackets bolted with UV screws.',
    rarity: 'Epic',
    costPoints: 2100,
    ringBackground: 'linear-gradient(135deg, #94a3b8 0%, #1e293b 48%, #6366f1 100%)',
    glowShadow: '0 0 18px rgba(99, 102, 241, 0.5)',
    ornamentKey: 'titanium',
    badgeLabel: 'TITANIUM',
    badgeColor: '#818cf8',
  },
  {
    id: 'frame-kintsugi-seam',
    name: 'Kintsugi Gold Lacquer',
    subtitle: '40 hrs focus grind · Ceramic fracture craft',
    description: 'Charcoal porcelain bezel bridged asymmetrically with gleaming liquid-gold seams.',
    rarity: 'Epic',
    costPoints: 2400,
    ringBackground: 'linear-gradient(135deg, #27272a 0%, #09090b 65%, #f59e0b 100%)',
    glowShadow: '0 0 19px rgba(251, 191, 36, 0.45)',
    ornamentKey: 'kintsugi',
    badgeLabel: 'KINTSUGI',
    badgeColor: '#eab308',
  },
  {
    id: 'frame-crimson-heroic',
    name: 'Heroic Winged Blaze',
    subtitle: '48 hrs focus grind · Flared battle wings',
    description: 'Inspired by Heroic crests: razor crimson side-wings surging toward an apex flame.',
    rarity: 'Epic',
    costPoints: 2900,
    ringBackground: 'linear-gradient(135deg, #fda4af 0%, #e11d48 45%, #f59e0b 100%)',
    glowShadow: '0 0 20px rgba(225, 29, 72, 0.55)',
    ornamentKey: 'crimson',
    badgeLabel: 'HEROIC',
    badgeColor: '#f43f5e',
  },
  {
    id: 'frame-royal-crown',
    name: 'Sovereign Jewel Crown',
    subtitle: '60 hrs focus grind · Amethyst diadem',
    description: 'Ornate imperial three-peaked gold crown mounted with royal amethyst cabochons.',
    rarity: 'Legendary',
    costPoints: 3600,
    ringBackground: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 40%, #9333ea 85%, #fde68a 100%)',
    glowShadow: '0 0 22px rgba(245, 158, 11, 0.55)',
    ornamentKey: 'crown',
    badgeLabel: 'CROWN',
    badgeColor: '#eab308',
  },
  {
    id: 'frame-laurel-olympian',
    name: 'Olympian Laurel Wreath',
    subtitle: '72 hrs focus grind · Sculpted victory bough',
    description: 'Hand-carved golden botanical olive & laurel sprays sweeping upward around the portrait.',
    rarity: 'Legendary',
    costPoints: 4300,
    ringBackground: 'linear-gradient(135deg, #fef08a 0%, #ca8a04 45%, #065f46 100%)',
    glowShadow: '0 0 22px rgba(234, 179, 8, 0.55)',
    ornamentKey: 'laurel',
    badgeLabel: 'LAUREL',
    badgeColor: '#facc15',
  },
  {
    id: 'frame-volt-cyber',
    name: 'Volt Hyperion Circuit',
    subtitle: '82 hrs focus grind · PCB micro-nodes',
    description: 'Precision copper & cyan circuit elbows terminating in luminescent terminal nodes.',
    rarity: 'Legendary',
    costPoints: 4900,
    ringBackground: 'conic-gradient(from 90deg, #a3e635, #06b6d4, #22c55e, #38bdf8, #a3e635)',
    glowShadow: '0 0 22px rgba(163, 230, 53, 0.55)',
    ornamentKey: 'circuit',
    badgeLabel: 'VOLT',
    badgeColor: '#a3e635',
  },
  {
    id: 'frame-jaali-arch',
    name: 'Mughal Palace Filigree',
    subtitle: '92 hrs focus grind · Carved ogee tracery',
    description: 'Lapis-blue & spun-gold Mughal cusped ogee crest with pearl lattice scrollwork.',
    rarity: 'Legendary',
    costPoints: 5500,
    ringBackground: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 42%, #fde047 100%)',
    glowShadow: '0 0 23px rgba(96, 165, 250, 0.55)',
    ornamentKey: 'jaali',
    badgeLabel: 'FILIGREE',
    badgeColor: '#60a5fa',
  },
  {
    id: 'frame-celestial-ace',
    name: 'Ace Nebula Starlight',
    subtitle: '105 hrs focus grind · Orbital constellation',
    description: 'Prismatic star-compass points and suspended pearl satellites reserved for Ace scholars.',
    rarity: 'Legendary',
    costPoints: 6300,
    ringBackground: 'conic-gradient(from 45deg, #22d3ee, #818cf8, #e879f9, #fbbf24, #22d3ee)',
    glowShadow: '0 0 24px rgba(129, 140, 248, 0.6)',
    ornamentKey: 'nebula',
    badgeLabel: 'ACE',
    badgeColor: '#a855f7',
  },
  {
    id: 'frame-void-nova',
    name: 'Singularity Vortex',
    subtitle: '122 hrs focus grind · Graviton plasma',
    description: 'Swirling event-horizon vortex tendrils and floating ultraviolet diamond shards.',
    rarity: 'Mythic',
    costPoints: 7300,
    ringBackground: 'conic-gradient(from 180deg, #c084fc, #312e81, #f43f5e, #facc15, #c084fc)',
    glowShadow: '0 0 26px rgba(192, 132, 252, 0.65)',
    ornamentKey: 'nova',
    badgeLabel: 'NOVA',
    badgeColor: '#c084fc',
  },
  {
    id: 'frame-astrolabe-meridian',
    name: 'Astrolabe Meridian',
    subtitle: '136 hrs focus grind · Brass celestial dial',
    description: 'Graduated celestial degree ring with sweeping cardinal brass meridian needles.',
    rarity: 'Mythic',
    costPoints: 8200,
    ringBackground: 'conic-gradient(from 30deg, #fde047, #0284c7, #fbbf24, #1e1b4b, #fde047)',
    glowShadow: '0 0 26px rgba(250, 204, 21, 0.62)',
    ornamentKey: 'astrolabe',
    badgeLabel: 'MERIDIAN',
    badgeColor: '#fde047',
  },
  {
    id: 'frame-conqueror-mythic',
    name: 'Mythic Conqueror Halo',
    subtitle: '150 hrs focus grind · Sunburst horns',
    description: 'The apex prestige crest: twin curved dragon horns, sun-flare rays & central ruby.',
    rarity: 'Mythic',
    costPoints: 9000,
    ringBackground: 'conic-gradient(from 0deg, #fbbf24, #ef4444, #f59e0b, #fef08a, #ea580c, #fbbf24)',
    glowShadow: '0 0 28px rgba(251, 191, 36, 0.72)',
    ornamentKey: 'conqueror',
    badgeLabel: 'CONQUEROR',
    badgeColor: '#fbbf24',
  },
  {
    id: 'frame-anim-pendulum',
    name: 'Animated Chrono Tourbillon',
    subtitle: '192 hrs focus grind · Spinning gear bezel',
    description: 'Live counter-rotating brass horology rings with an orbiting ruby jewel bearing.',
    rarity: 'Mythic',
    costPoints: 11500,
    ringBackground: 'conic-gradient(from 0deg, #fbbf24, #78350f, #fde047, #b45309, #fbbf24)',
    glowShadow: '0 0 28px rgba(251, 191, 36, 0.7)',
    ornamentKey: 'anim-chrono',
    badgeLabel: 'ANIMATED',
    badgeColor: '#fbbf24',
    isAnimated: true,
  },
  {
    id: 'frame-anim-aurora',
    name: 'Animated Prism Aurora',
    subtitle: '258 hrs focus grind · Orbiting spectral ring',
    description: 'Gliding northern-lights cyan & emerald halo rotating continuously with pulsing glints.',
    rarity: 'Mythic',
    costPoints: 15500,
    ringBackground: 'conic-gradient(from 45deg, #2dd4bf, #38bdf8, #818cf8, #34d399, #2dd4bf)',
    glowShadow: '0 0 30px rgba(45, 212, 191, 0.72)',
    ornamentKey: 'anim-aurora',
    badgeLabel: 'AURORA FX',
    badgeColor: '#2dd4bf',
    isAnimated: true,
  },
  {
    id: 'frame-anim-inferno',
    name: 'Animated Solaris Blaze',
    subtitle: '350 hrs focus grind · Surging solar flares',
    description: 'Breathing crimson magma corona ringed by rotating golden sun-flare crescents.',
    rarity: 'Mythic',
    costPoints: 21000,
    ringBackground: 'conic-gradient(from 90deg, #f43f5e, #fb923c, #fde047, #e11d48, #f43f5e)',
    glowShadow: '0 0 32px rgba(244, 63, 94, 0.76)',
    ornamentKey: 'anim-inferno',
    badgeLabel: 'INFERNO FX',
    badgeColor: '#fb7185',
    isAnimated: true,
  },
  {
    id: 'frame-anim-sovereign',
    name: 'Animated Conqueror Orrery',
    subtitle: '467 hrs focus grind · Apex live celestial',
    description: 'Ultimate prestige frame: dual orbiting astrolabe gimbals, twin stars & radiant crown.',
    rarity: 'Mythic',
    costPoints: 28000,
    ringBackground: 'conic-gradient(from 0deg, #fef08a, #f59e0b, #e879f9, #38bdf8, #fbbf24, #fef08a)',
    glowShadow: '0 0 36px rgba(251, 191, 36, 0.85)',
    ornamentKey: 'anim-orrery',
    badgeLabel: 'APEX FX',
    badgeColor: '#fde047',
    isAnimated: true,
  },
  {
    id: 'frame-carrom-maharaja',
    name: 'Maharaja Teak & Brass',
    subtitle: 'Carrom Pool craft · Carved corner pockets',
    description: 'Hand-carved Burmese mahogany bezel framed by hammered brass corner pocket plates and inlaid mother-of-pearl diamonds.',
    rarity: 'Rare',
    costPoints: 800,
    ringBackground: 'linear-gradient(135deg, #451a03 0%, #92400e 42%, #d97706 72%, #fde68a 100%)',
    glowShadow: '0 0 18px rgba(217, 119, 6, 0.5)',
    ornamentKey: 'carrom-maharaja',
    badgeLabel: 'MAHARAJA',
    badgeColor: '#f59e0b',
    noSpinRing: true,
  },
  {
    id: 'frame-carrom-queen',
    name: 'Red Queen Striker Royal',
    subtitle: 'Carrom Pool craft · Mughal Kundan arch',
    description: 'Deep ruby-lacquered frame crowned with a scalloped kundan arch, twin sculpted Red Queen coins, and pearl beadwork.',
    rarity: 'Epic',
    costPoints: 1650,
    ringBackground: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 44%, #fbbf24 80%, #991b1b 100%)',
    glowShadow: '0 0 22px rgba(220, 38, 38, 0.55)',
    ornamentKey: 'carrom-queen',
    badgeLabel: 'RED QUEEN',
    badgeColor: '#fb7185',
    noSpinRing: true,
  },
  {
    id: 'frame-ff-heroic',
    name: 'Heroic Winged Vanguard',
    subtitle: 'Free Fire inspired · Multi-blade crest',
    description: 'Beveled titanium & scarlet-enamel tactical frame flanked by layered razor wings, lower V-chevrons, and a spiked Heroic crown.',
    rarity: 'Epic',
    costPoints: 2200,
    ringBackground: 'linear-gradient(135deg, #4c0519 0%, #be123c 45%, #fbbf24 82%, #1e293b 100%)',
    glowShadow: '0 0 24px rgba(225, 29, 72, 0.6)',
    ornamentKey: 'ff-heroic',
    badgeLabel: 'HEROIC V',
    badgeColor: '#f43f5e',
    noSpinRing: true,
  },
  {
    id: 'frame-carrom-champ',
    name: 'Carrom Arena Grand Trophy',
    subtitle: 'Carrom Pool craft · Emerald pocket crown',
    description: 'Champagne gold tournament bezel with four carved pocket shields, peacock filigree plumes, and faceted emerald & ruby jewels.',
    rarity: 'Legendary',
    costPoints: 3400,
    ringBackground: 'linear-gradient(135deg, #064e3b 0%, #eab308 42%, #fde047 68%, #065f46 100%)',
    glowShadow: '0 0 25px rgba(234, 179, 8, 0.6)',
    ornamentKey: 'carrom-champ',
    badgeLabel: 'CHAMPION',
    badgeColor: '#34d399',
    noSpinRing: true,
  },
  {
    id: 'frame-ff-booyah',
    name: 'Booyah Cyber Tactician',
    subtitle: 'Free Fire inspired · Chrono HUD armor',
    description: 'Angular stealth armor bezel reinforced with holographic rangefinder brackets, gold wing fins, and an apex Booyah crest.',
    rarity: 'Legendary',
    costPoints: 4100,
    ringBackground: 'linear-gradient(135deg, #0f172a 0%, #0284c7 48%, #22d3ee 75%, #fbbf24 100%)',
    glowShadow: '0 0 26px rgba(34, 211, 238, 0.6)',
    ornamentKey: 'ff-booyah',
    badgeLabel: 'BOOYAH',
    badgeColor: '#22d3ee',
    noSpinRing: true,
  },
  {
    id: 'frame-ff-cobra',
    name: 'Venom Cobra Sovereign',
    subtitle: 'Free Fire inspired · Twin serpent fangs',
    description: 'Twin sculpted obsidian & crimson cobras coiling symmetrically up both flanks with gleaming venom fangs and glowing snake eyes.',
    rarity: 'Mythic',
    costPoints: 6800,
    ringBackground: 'linear-gradient(135deg, #18181b 0%, #991b1b 45%, #f43f5e 75%, #fbbf24 100%)',
    glowShadow: '0 0 28px rgba(244, 63, 94, 0.68)',
    ornamentKey: 'ff-cobra',
    badgeLabel: 'COBRA',
    badgeColor: '#fb7185',
    noSpinRing: true,
  },
  {
    id: 'frame-ff-grandmaster',
    name: 'Grandmaster Blaze Wings',
    subtitle: 'Free Fire inspired · Living flame crest',
    description: 'Stationary forged gold battle bezel crowned with breathing multi-feather flame wings, rising embers & sweeping jewel glint.',
    rarity: 'Mythic',
    costPoints: 11000,
    ringBackground: 'linear-gradient(135deg, #451a03 0%, #dc2626 42%, #f59e0b 75%, #fef08a 100%)',
    glowShadow: '0 0 34px rgba(245, 158, 11, 0.78)',
    ornamentKey: 'anim-ff-grandmaster',
    badgeLabel: 'GRANDMASTER',
    badgeColor: '#fbbf24',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-carrom-imperium',
    name: 'Royal Kundan Striker FX',
    subtitle: 'Carrom Pool craft · Shimmering jewel court',
    description: 'Ornate imperial ivory & 24k gold Carrom court frame with gliding gold strikers, twinkling ruby kundan gems & metallic sweep.',
    rarity: 'Mythic',
    costPoints: 14000,
    ringBackground: 'linear-gradient(135deg, #1e1b4b 0%, #831843 44%, #eab308 78%, #fef08a 100%)',
    glowShadow: '0 0 34px rgba(250, 204, 21, 0.76)',
    ornamentKey: 'anim-carrom-imperium',
    badgeLabel: 'IMPERIUM FX',
    badgeColor: '#fde047',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-forest-vine',
    name: 'Sylvan Emerald Vines',
    subtitle: 'Botanical pack · Interwoven woodland leaves',
    description: 'Sculpted emerald ivy tendrils and sunlit botanical leaf pairs hugging the rounded scholar frame.',
    rarity: 'Rare',
    costPoints: 750,
    ringBackground: 'linear-gradient(135deg, #14532d 0%, #16a34a 48%, #84cc16 100%)',
    glowShadow: '0 0 18px rgba(34, 197, 94, 0.48)',
    ornamentKey: 'pack-forest-vine',
    badgeLabel: 'SYLVAN',
    badgeColor: '#4ade80',
    noSpinRing: true,
  },
  {
    id: 'frame-pack-laurel-crown',
    name: 'Imperial Laurel Crown',
    subtitle: 'Sovereign pack · Golden crown & wreath',
    description: 'Hand-carved 24k gold laurel sprays sweeping upward to a three-peaked imperial diadem crest.',
    rarity: 'Rare',
    costPoints: 950,
    ringBackground: 'linear-gradient(135deg, #78350f 0%, #eab308 45%, #fef08a 82%, #b45309 100%)',
    glowShadow: '0 0 20px rgba(234, 179, 8, 0.54)',
    ornamentKey: 'pack-laurel-crown',
    badgeLabel: 'IMPERIAL',
    badgeColor: '#fbbf24',
    noSpinRing: true,
  },
  {
    id: 'frame-pack-sakura-wreath',
    name: 'Sakura Blossom Garland',
    subtitle: 'Spring pack · Five-petal cherry bough',
    description: 'Rosewood floral vine garland studded with layered pastel pink sakura blossoms and golden stamens.',
    rarity: 'Rare',
    costPoints: 1100,
    ringBackground: 'linear-gradient(135deg, #831843 0%, #f472b6 50%, #fbcfe8 85%, #be185d 100%)',
    glowShadow: '0 0 20px rgba(244, 114, 182, 0.52)',
    ornamentKey: 'pack-sakura-wreath',
    badgeLabel: 'BLOSSOM',
    badgeColor: '#f9a8d4',
    noSpinRing: true,
  },
  {
    id: 'frame-pack-amethyst-shard',
    name: 'Amethyst Crystal Halo',
    subtitle: 'Arcane pack · Faceted violet prisms',
    description: 'Deep obsidian-indigo rim inlaid with glowing amethyst crystal clusters and twinkling arcane motes.',
    rarity: 'Epic',
    costPoints: 1950,
    ringBackground: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 48%, #c084fc 80%, #3b0764 100%)',
    glowShadow: '0 0 24px rgba(168, 85, 247, 0.6)',
    ornamentKey: 'pack-amethyst-shard',
    badgeLabel: 'AMETHYST',
    badgeColor: '#c084fc',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-cyber-cyan',
    name: 'Holo Cyber HUD Ring',
    subtitle: 'Telemetry pack · Precision cyan brackets',
    description: 'Holographic neon-cyan tactical bezel etched with precision ticks, optical corners, and sweeping glint.',
    rarity: 'Epic',
    costPoints: 2600,
    ringBackground: 'linear-gradient(135deg, #082f49 0%, #06b6d4 46%, #67e8f9 78%, #0f172a 100%)',
    glowShadow: '0 0 24px rgba(34, 211, 238, 0.62)',
    ornamentKey: 'pack-cyber-cyan',
    badgeLabel: 'HOLO HUD',
    badgeColor: '#22d3ee',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-crescent-cloud',
    name: 'Celestial Crescent & Clouds',
    subtitle: 'Nocturne pack · Golden moon & clouds',
    description: 'Radiant golden crescent moon crowning the corner above billowy silver clouds and twinkling night stars.',
    rarity: 'Legendary',
    costPoints: 3800,
    ringBackground: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #fbbf24 85%, #fef08a 100%)',
    glowShadow: '0 0 26px rgba(251, 191, 36, 0.58)',
    ornamentKey: 'pack-crescent-cloud',
    badgeLabel: 'CRESCENT',
    badgeColor: '#fde047',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-azure-dragon',
    name: 'Glacial Azure Dragon',
    subtitle: 'Frost pack · Coiled ice wyrm aura',
    description: 'Electric sapphire and frost-cyan dragon coiling around the frame with breathing icy mane plumes.',
    rarity: 'Legendary',
    costPoints: 4400,
    ringBackground: 'linear-gradient(135deg, #082f49 0%, #0284c7 45%, #38bdf8 78%, #1e3a8a 100%)',
    glowShadow: '0 0 28px rgba(56, 189, 248, 0.68)',
    ornamentKey: 'pack-azure-dragon',
    badgeLabel: 'AZURE WYRM',
    badgeColor: '#38bdf8',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-valkyrie-wing',
    name: 'Valkyrie Silver Wings',
    subtitle: 'Aegis pack · Sculpted angelic silver wings',
    description: 'Brushed platinum bezel flanked by sweeping silver Valkyrie feathers anchored by a sapphire diamond.',
    rarity: 'Legendary',
    costPoints: 5200,
    ringBackground: 'linear-gradient(135deg, #1e293b 0%, #94a3b8 48%, #f8fafc 82%, #334155 100%)',
    glowShadow: '0 0 26px rgba(226, 232, 240, 0.62)',
    ornamentKey: 'pack-valkyrie-wing',
    badgeLabel: 'VALKYRIE',
    badgeColor: '#e2e8f0',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-inferno-flame',
    name: 'Inferno Magma Aura',
    subtitle: 'Pyro pack · Surging blaze & embers',
    description: 'Charred obsidian steel engulfed by living crimson-gold fire tongues and ascending magma sparks.',
    rarity: 'Mythic',
    costPoints: 7800,
    ringBackground: 'linear-gradient(135deg, #450a0a 0%, #dc2626 44%, #f97316 76%, #fde047 100%)',
    glowShadow: '0 0 32px rgba(239, 68, 68, 0.76)',
    ornamentKey: 'pack-inferno-flame',
    badgeLabel: 'INFERNO',
    badgeColor: '#fb7185',
    isAnimated: true,
    noSpinRing: true,
  },
  {
    id: 'frame-pack-saturn-cosmos',
    name: 'Cosmic Saturn & Starlight',
    subtitle: 'Astral pack · Ringed planet & compass stars',
    description: 'Gilded celestial horizon bezel crowned with twinkling golden stars and a luminous ringed Saturn orbit.',
    rarity: 'Mythic',
    costPoints: 9800,
    ringBackground: 'linear-gradient(135deg, #090617 0%, #312e81 42%, #eab308 78%, #fef08a 100%)',
    glowShadow: '0 0 34px rgba(250, 204, 21, 0.72)',
    ornamentKey: 'pack-saturn-cosmos',
    badgeLabel: 'COSMIC',
    badgeColor: '#fde047',
    isAnimated: true,
    noSpinRing: true,
  },
];

export const STORE_BACKGROUNDS_CATALOG: StoreBackgroundItem[] = [
  {
    id: 'default',
    name: 'Classic Smoked Glass',
    subtitle: 'Default studio card surface (Included)',
    description: 'Subtle translucent glass backdrop matching your active Chronos theme.',
    rarity: 'Starter',
    costPoints: 0,
    gradientCss: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.08) 100%)',
    artworkKey: 'none',
    accentHex: '#94a3b8',
  },
  {
    id: 'bg-art-rainy-study-desk',
    name: 'Rainy Midnight Study Desk',
    subtitle: 'Signature Edition · Cozy lamp & rain window',
    description:
      'Warm brass desk lamp glowing over open notebooks beside a rain-streaked midnight window and distant city bokeh.',
    rarity: 'Epic',
    costPoints: 900,
    gradientCss: 'linear-gradient(135deg, #0b1120 0%, #1e293b 55%, #451a03 100%)',
    artworkKey: 'none',
    accentHex: '#f59e0b',
    badgeLabel: 'COZY DESK',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgRainyStudyDesk,
  },
  {
    id: 'bg-art-sakura-twilight',
    name: 'Sakura Twilight Overlook',
    subtitle: 'Signature Edition · Cherry blossoms at dusk',
    description:
      'Blooming pink sakura branches arching over rose-violet sunset clouds, a serene lakeside pagoda, and misty mountains.',
    rarity: 'Legendary',
    costPoints: 1800,
    gradientCss: 'linear-gradient(135deg, #2e1065 0%, #831843 52%, #f97316 100%)',
    artworkKey: 'none',
    accentHex: '#f472b6',
    badgeLabel: 'SAKURA',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgSakuraTwilightOverlook,
  },
  // === Profile Customization Collection — 10 Elegant Backgrounds (Mid to High Tier, HD 16:9) ===
  {
    id: 'bg-col-misty-pine-valley',
    name: 'Misty Pine Valley',
    subtitle: 'Collection Series · Midnight conifer fog',
    description:
      'Quiet indigo mountain forest where tall pine silhouettes rise through cool silver valley mist.',
    rarity: 'Epic',
    costPoints: 3800,
    gradientCss: 'linear-gradient(135deg, #0b132b 0%, #1d3557 55%, #457b9d 100%)',
    artworkKey: 'none',
    accentHex: '#93c5fd',
    badgeLabel: 'PINE MIST',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColMistyPineValley,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-twilight-misty-peaks',
    name: 'Twilight Misty Peaks',
    subtitle: 'Collection Series · Lavender alpine horizon',
    description:
      'Layered indigo mountain ridges receding beneath soft rose-violet dusk clouds and glacial peaks.',
    rarity: 'Epic',
    costPoints: 4900,
    gradientCss: 'linear-gradient(135deg, #1e1b4b 0%, #6d28d9 52%, #f472b6 100%)',
    artworkKey: 'none',
    accentHex: '#c4b5fd',
    badgeLabel: 'PEAKS',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColTwilightMistyPeaks,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-velvet-ultraviolet',
    name: 'Velvet Ultraviolet Waves',
    subtitle: 'Collection Series · Luminous violet silk',
    description:
      'Sculptural glowing ultraviolet ribbons gliding smoothly across a pure obsidian studio backdrop.',
    rarity: 'Epic',
    costPoints: 6200,
    gradientCss: 'linear-gradient(135deg, #090514 0%, #3b0764 55%, #9333ea 100%)',
    artworkKey: 'none',
    accentHex: '#c084fc',
    badgeLabel: 'ULTRAVIOLET',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColVelvetUltraviolet,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-amethyst-cloudrise',
    name: 'Amethyst Cloudrise',
    subtitle: 'Collection Series · Crescent moon & glowing clouds',
    description:
      'Luminous pastel-violet cloudscape lit from within beneath a razor-sharp twilight crescent moon.',
    rarity: 'Legendary',
    costPoints: 7800,
    gradientCss: 'linear-gradient(135deg, #1e1b4b 0%, #7e22ce 50%, #f9a8d4 100%)',
    artworkKey: 'none',
    accentHex: '#e879f9',
    badgeLabel: 'CLOUDRISE',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColAmethystCloudrise,
    imagePosition: 'center 46%',
  },
  {
    id: 'bg-col-moonlit-reflections',
    name: 'Moonlit Lake Reflections',
    subtitle: 'Collection Series · Full moon over midnight water',
    description:
      'Radiant full moon suspended above dark mountain shores, casting shimmering silver reflections across calm water.',
    rarity: 'Legendary',
    costPoints: 9400,
    gradientCss: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e3a8a 100%)',
    artworkKey: 'none',
    accentHex: '#7dd3fc',
    badgeLabel: 'MOONLIT',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColMoonlitReflections,
    imagePosition: 'center 42%',
  },
  {
    id: 'bg-col-hanging-starlight',
    name: 'Hanging Starlight Clouds',
    subtitle: 'Collection Series · Golden celestial pendants',
    description:
      'Warm glowing stars suspended on fine golden threads above illuminated dreamy clouds at midnight.',
    rarity: 'Legendary',
    costPoints: 11200,
    gradientCss: 'linear-gradient(135deg, #0f172a 0%, #312e81 52%, #d97706 100%)',
    artworkKey: 'none',
    accentHex: '#fbbf24',
    badgeLabel: 'STARLIGHT',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColHangingStarlight,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-obsidian-gold-marble',
    name: 'Obsidian Gold Marble',
    subtitle: 'Collection Series · Kintsugi luxury stone',
    description:
      'Polished midnight-black marble laced with dramatic molten gold veins for an understated executive look.',
    rarity: 'Legendary',
    costPoints: 13600,
    gradientCss: 'linear-gradient(135deg, #09090b 0%, #18181b 55%, #78350f 100%)',
    artworkKey: 'none',
    accentHex: '#f59e0b',
    badgeLabel: 'GOLD MARBLE',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColObsidianGoldMarble,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-gilded-silk-waves',
    name: 'Gilded Silk Waves',
    subtitle: 'Collection Series · Flowing liquid gold aura',
    description:
      'Translucent ribbons of incandescent gold silk and floating embers undulating across jet-black velvet.',
    rarity: 'Mythic',
    costPoints: 16200,
    gradientCss: 'linear-gradient(135deg, #09090b 0%, #271a07 55%, #b45309 100%)',
    artworkKey: 'none',
    accentHex: '#fbbf24',
    badgeLabel: 'GILDED SILK',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColGildedSilkWaves,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-deep-violet-spiral',
    name: 'Deep Violet Spiral',
    subtitle: 'Collection Series · Radiant cosmic galaxy',
    description:
      'Rotating violet-sapphire spiral galaxy blazing across an infinite starfield of deep indigo dust.',
    rarity: 'Mythic',
    costPoints: 18600,
    gradientCss: 'linear-gradient(135deg, #050516 0%, #312e81 52%, #7c3aed 100%)',
    artworkKey: 'none',
    accentHex: '#a78bfa',
    badgeLabel: 'GALAXY',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColDeepVioletSpiral,
    imagePosition: 'center center',
  },
  {
    id: 'bg-col-sakura-pagoda-moon',
    name: 'Sakura Pagoda Moon',
    subtitle: 'Collection Series · Illuminated Kyoto shrine',
    description:
      'Lantern-lit multi-tiered pagoda framed by blooming sakura boughs and a luminous silver full moon.',
    rarity: 'Mythic',
    costPoints: 21000,
    gradientCss: 'linear-gradient(135deg, #170d2e 0%, #4c1d95 52%, #f472b6 100%)',
    artworkKey: 'none',
    accentHex: '#f472b6',
    badgeLabel: 'PAGODA MOON',
    imageUrl: COSMETIC_ARTWORK_IMAGES.bgColSakuraPagodaMoon,
    imagePosition: 'center 46%',
  },
  {
    id: 'bg-slate-grid',
    name: 'Tactical Blueprint Draft',
    subtitle: '8+ hrs focus grind · Cad schematic lattice',
    description: 'Technical drafting crosshairs, vernier ruler ticks & cobalt schematic lines.',
    rarity: 'Rare',
    costPoints: 500,
    gradientCss: 'linear-gradient(135deg, #0b132b 0%, #1c2541 55%, #082f49 100%)',
    artworkKey: 'blueprint',
    accentHex: '#38bdf8',
    badgeLabel: 'BLUEPRINT',
  },
  {
    id: 'bg-sakura-night',
    name: 'Kyoto Shoji & Blossom',
    subtitle: '12.5 hrs focus grind · Lantern woodblock',
    description: 'Kumiko wooden lattice paneling backlit by a glowing lantern & drifting cherry petals.',
    rarity: 'Rare',
    costPoints: 750,
    gradientCss:
      'radial-gradient(ellipse at 82% 24%, rgba(244,114,182,0.44), transparent 55%), linear-gradient(135deg, #161130 0%, #2e1f5e 55%, #4a154b 100%)',
    artworkKey: 'sakura',
    accentHex: '#f472b6',
    badgeLabel: 'KYOTO',
  },
  {
    id: 'bg-zardozi-embroidery',
    name: 'Royal Zardozi Silk',
    subtitle: '16 hrs focus grind · Hand-stitched paisley',
    description: 'Crimson velvet textile embroidered in metallic gold paisley medallions & stitch border.',
    rarity: 'Rare',
    costPoints: 950,
    gradientCss:
      'radial-gradient(ellipse at 75% 30%, rgba(220,38,38,0.38), transparent 60%), linear-gradient(135deg, #1a0409 0%, #450a18 55%, #2b090e 100%)',
    artworkKey: 'zardozi',
    accentHex: '#fbbf24',
    badgeLabel: 'ZARDOZI',
  },
  {
    id: 'bg-amber-dusk',
    name: 'Chronometer Escapement',
    subtitle: '20 hrs focus grind · Guilloché clockwork',
    description: 'Engraved Swiss watch guilloché waves framing precision interlocking brass gears.',
    rarity: 'Rare',
    costPoints: 1200,
    gradientCss:
      'radial-gradient(ellipse at 82% 40%, rgba(245,158,11,0.36), transparent 58%), linear-gradient(135deg, #0b0a09 0%, #1c1917 55%, #3b1904 100%)',
    artworkKey: 'horology',
    accentHex: '#f59e0b',
    badgeLabel: 'GUILLOCHÉ',
  },
  {
    id: 'bg-kintsugi-lacquer',
    name: 'Kintsugi Gold Vein',
    subtitle: '26 hrs focus grind · Lacquered stoneware',
    description: 'Matte ink-black ceramic mended with luminous liquid-gold fault veins & artisan seal.',
    rarity: 'Epic',
    costPoints: 1550,
    gradientCss: 'linear-gradient(135deg, #09090b 0%, #18181b 55%, #272013 100%)',
    artworkKey: 'kintsugi',
    accentHex: '#facc15',
    badgeLabel: 'KINTSUGI',
  },
  {
    id: 'bg-aurora-borealis',
    name: 'Fjord Aurora Silhouette',
    subtitle: '32 hrs focus grind · Polar ridge & stars',
    description: 'Jagged midnight mountain peaks beneath sweeping emerald-teal aurora ribbons.',
    rarity: 'Epic',
    costPoints: 1900,
    gradientCss:
      'radial-gradient(ellipse at 25% 20%, rgba(16,185,129,0.42), transparent 55%), linear-gradient(135deg, #042423 0%, #0b162c 60%, #17153b 100%)',
    artworkKey: 'aurora',
    accentHex: '#2dd4bf',
    badgeLabel: 'AURORA',
  },
  {
    id: 'bg-cyber-matrix',
    name: 'Hyperion PCB Matrix',
    subtitle: '38 hrs focus grind · Copper circuit traces',
    description: '45-degree etched circuit board highways, microchip bus nodes & active hex grid.',
    rarity: 'Epic',
    costPoints: 2300,
    gradientCss:
      'radial-gradient(ellipse at 78% 25%, rgba(74,222,128,0.28), transparent 52%), linear-gradient(135deg, #030712 0%, #052e16 58%, #022c22 100%)',
    artworkKey: 'circuit',
    accentHex: '#4ade80',
    badgeLabel: 'PCB MATRIX',
  },
  {
    id: 'bg-damask-velvet',
    name: 'Baroque Damask Tapestry',
    subtitle: '46 hrs focus grind · Woven silk brocade',
    description: 'Woven emerald & burnished gold Venetian damask floral brocade with corner stitch trim.',
    rarity: 'Epic',
    costPoints: 2750,
    gradientCss: 'linear-gradient(135deg, #031f17 0%, #063829 52%, #132a1a 100%)',
    artworkKey: 'damask',
    accentHex: '#eab308',
    badgeLabel: 'DAMASK',
  },
  {
    id: 'bg-crimson-citadel',
    name: 'Heroic Dragonscale Mail',
    subtitle: '53 hrs focus grind · Overlapping armor',
    description: 'Repeating forged scarlet steel scale mail interlaced with crimson battle chevrons.',
    rarity: 'Epic',
    costPoints: 3200,
    gradientCss:
      'radial-gradient(circle at 80% 25%, rgba(244,63,94,0.42), transparent 55%), linear-gradient(135deg, #16050b 0%, #4c0519 52%, #5c180c 100%)',
    artworkKey: 'citadel',
    accentHex: '#fb7185',
    badgeLabel: 'SCALEMAIL',
  },
  {
    id: 'bg-art-deco-salon',
    name: 'Art Deco Gilded Fan',
    subtitle: '65 hrs focus grind · 1920s brass motif',
    description: 'Obsidian & champagne repeating Gatsby sunburst scallop fans edged in crisp hairline brass.',
    rarity: 'Legendary',
    costPoints: 3900,
    gradientCss: 'linear-gradient(135deg, #09090b 0%, #1c1917 50%, #2d220a 100%)',
    artworkKey: 'artdeco',
    accentHex: '#fde047',
    badgeLabel: 'ART DECO',
  },
  {
    id: 'bg-mughal-jaali',
    name: 'Mughal Palace Jaali',
    subtitle: '75 hrs focus grind · 8-point star carving',
    description: 'Lapis-sapphire & warm ivory 8-point star Khatam geometric lattice with palace arches.',
    rarity: 'Legendary',
    costPoints: 4500,
    gradientCss:
      'radial-gradient(ellipse at 75% 30%, rgba(56,189,248,0.3), transparent 55%), linear-gradient(135deg, #091534 0%, #172554 55%, #1e1b4b 100%)',
    artworkKey: 'jaali',
    accentHex: '#7dd3fc',
    badgeLabel: 'JAALI',
  },
  {
    id: 'bg-royal-library',
    name: 'Imperial Star Astrolabe',
    subtitle: '85 hrs focus grind · Celestial chart',
    description: 'Engraved golden ecliptic meridian circles, zodiac degree ticks & star constellations.',
    rarity: 'Legendary',
    costPoints: 5100,
    gradientCss:
      'radial-gradient(circle at 76% 32%, rgba(250,204,21,0.28), transparent 48%), linear-gradient(135deg, #08071a 0%, #1b1745 55%, #2b0f3e 100%)',
    artworkKey: 'observatory',
    accentHex: '#c4b5fd',
    badgeLabel: 'ASTROLABE',
  },
  {
    id: 'bg-glacier-valkyrie',
    name: 'Valkyrie Ice Tessellation',
    subtitle: '95 hrs focus grind · Refracted prism shards',
    description: 'Low-poly crystalline glacial facets etched with crisp Arctic silver frost geometry.',
    rarity: 'Legendary',
    costPoints: 5700,
    gradientCss:
      'radial-gradient(ellipse at 25% 20%, rgba(186,230,253,0.38), transparent 52%), linear-gradient(135deg, #06253b 0%, #0f172a 55%, #172554 100%)',
    artworkKey: 'glacier',
    accentHex: '#bae6fd',
    badgeLabel: 'PRISM ICE',
  },
  {
    id: 'bg-emerald-sanctum',
    name: 'Botanical Ginkgo Brocade',
    subtitle: '108 hrs focus grind · Art Nouveau leaves',
    description: 'Trailing golden ginkgo leaves and delicate engraved woodland ferns on deep malachite silk.',
    rarity: 'Legendary',
    costPoints: 6500,
    gradientCss: 'linear-gradient(135deg, #02241b 0%, #053d2e 55%, #062b16 100%)',
    artworkKey: 'botanical',
    accentHex: '#34d399',
    badgeLabel: 'BOTANICAL',
  },
  {
    id: 'bg-damascus-forge',
    name: 'Damascus Folded Steel',
    subtitle: '122 hrs focus grind · Wootz blade wave',
    description: 'Organic rippled titanium-and-amber Damascus steel folding lines with forge ember sheen.',
    rarity: 'Mythic',
    costPoints: 7300,
    gradientCss: 'linear-gradient(135deg, #09090b 0%, #1f2937 52%, #29180c 100%)',
    artworkKey: 'damascus',
    accentHex: '#fb923c',
    badgeLabel: 'DAMASCUS',
  },
  {
    id: 'bg-void-singularity',
    name: 'Singularity Gravity Grid',
    subtitle: '138 hrs focus grind · Warped spacetime',
    description: 'Hyperbolic spacetime distortion grid curving smoothly into a glowing plasma vortex.',
    rarity: 'Mythic',
    costPoints: 8300,
    gradientCss:
      'radial-gradient(circle at 75% 42%, rgba(192,132,252,0.45) 0%, rgba(244,63,94,0.25) 36%, transparent 62%), linear-gradient(135deg, #06030f 0%, #1c0f36 55%, #340859 100%)',
    artworkKey: 'singularity',
    accentHex: '#e879f9',
    badgeLabel: 'GRAVITON',
  },
  {
    id: 'bg-conqueror-solar',
    name: 'Conqueror Imperial Crest',
    subtitle: '155 hrs focus grind · Radiant sunburst halo',
    description: 'Radiant solar eclipse rays radiating behind a ceremonial woven Conqueror crest tapestry.',
    rarity: 'Mythic',
    costPoints: 9300,
    gradientCss:
      'radial-gradient(circle at 80% 42%, rgba(251,191,36,0.52) 0%, rgba(234,88,12,0.3) 30%, transparent 62%), linear-gradient(135deg, #080506 0%, #241004 52%, #3f1603 100%)',
    artworkKey: 'eclipse',
    accentHex: '#fbbf24',
    badgeLabel: 'CONQUEROR',
  },
  {
    id: 'bg-anim-cyber-pulse',
    name: 'Animated Neural Quantum',
    subtitle: '200 hrs focus grind · Sweeping telemetry beam',
    description: 'Living cyan circuit architecture scanned by a continuous photon pulse beam & data nodes.',
    rarity: 'Mythic',
    costPoints: 12000,
    gradientCss:
      'radial-gradient(ellipse at 76% 36%, rgba(56,189,248,0.34), transparent 60%), linear-gradient(135deg, #020617 0%, #082f49 54%, #1e1b4b 100%)',
    artworkKey: 'anim-quantum',
    accentHex: '#38bdf8',
    badgeLabel: 'QUANTUM FX',
    isAnimated: true,
  },
  {
    id: 'bg-anim-aurora-curtain',
    name: 'Animated Boreal Silk',
    subtitle: '283 hrs focus grind · Drifting polar ribbons',
    description: 'Shimmering emerald and violet aurora curtains undulating endlessly above alpine peaks.',
    rarity: 'Mythic',
    costPoints: 17000,
    gradientCss:
      'radial-gradient(ellipse at 70% 25%, rgba(45,212,191,0.4), transparent 58%), linear-gradient(135deg, #021a1d 0%, #06283d 52%, #1d1138 100%)',
    artworkKey: 'anim-boreal',
    accentHex: '#2dd4bf',
    badgeLabel: 'BOREAL FX',
    isAnimated: true,
  },
  {
    id: 'bg-anim-ember-forge',
    name: 'Animated Dragon Forge',
    subtitle: '392 hrs focus grind · Rising crucible sparks',
    description: 'Smoldering Damascus obsidian steel with continuously ascending golden forge embers.',
    rarity: 'Mythic',
    costPoints: 23500,
    gradientCss:
      'radial-gradient(circle at 78% 60%, rgba(249,115,22,0.42), transparent 56%), linear-gradient(135deg, #090607 0%, #270b08 55%, #451206 100%)',
    artworkKey: 'anim-forge',
    accentHex: '#fb923c',
    badgeLabel: 'FORGE FX',
    isAnimated: true,
  },
  {
    id: 'bg-anim-celestial-orrery',
    name: 'Animated Astral Cosmos',
    subtitle: '500 hrs focus grind · Orbiting imperial spheres',
    description: 'Endgame celestial tapestry featuring rotating golden ecliptic rings & orbiting planets.',
    rarity: 'Mythic',
    costPoints: 30000,
    gradientCss:
      'radial-gradient(circle at 78% 46%, rgba(251,191,36,0.42) 0%, rgba(168,85,247,0.28) 38%, transparent 64%), linear-gradient(135deg, #050312 0%, #150d38 54%, #2d1236 100%)',
    artworkKey: 'anim-cosmos',
    accentHex: '#fde047',
    badgeLabel: 'COSMOS FX',
    isAnimated: true,
  },
  {
    id: 'bg-carrom-arena',
    name: 'Maharaja Carrom Arena',
    subtitle: 'Carrom Pool craft · Rosewood & brass court',
    description: 'Championship rosewood board inlaid with corner pocket rings, ivory baselines, and a Crimson Queen striker rosette.',
    rarity: 'Rare',
    costPoints: 700,
    gradientCss:
      'radial-gradient(ellipse at 82% 48%, rgba(220,38,38,0.28), transparent 55%), linear-gradient(135deg, #1f0d06 0%, #451a08 55%, #240c06 100%)',
    artworkKey: 'carrom-arena',
    accentHex: '#f59e0b',
    badgeLabel: 'CARROM',
  },
  {
    id: 'bg-ff-booyah-zone',
    name: 'Bermuda Booyah Dropzone',
    subtitle: 'Free Fire inspired · Tactical horizon grid',
    description: 'Stealth charcoal radar topography lit by coral-amber hazard chevrons, airdrop crate beacon & Booyah wing horizon streaks.',
    rarity: 'Epic',
    costPoints: 1750,
    gradientCss:
      'radial-gradient(ellipse at 78% 30%, rgba(251,146,60,0.36), transparent 56%), linear-gradient(135deg, #0b0f19 0%, #27131d 55%, #431407 100%)',
    artworkKey: 'ff-booyah-zone',
    accentHex: '#fb923c',
    badgeLabel: 'BERMUDA',
  },
  {
    id: 'bg-focus-observatory',
    name: 'Midnight Desk & Rain',
    subtitle: 'Deep Focus craft · Arched study sanctuary',
    description: 'Quiet nocturnal library window streaked with soft silver rain, warm brass desk lamp glow & stacked scholarly volumes.',
    rarity: 'Epic',
    costPoints: 2100,
    gradientCss:
      'radial-gradient(circle at 80% 35%, rgba(251,191,36,0.28), transparent 50%), linear-gradient(135deg, #070b18 0%, #111c3a 58%, #1e1b4b 100%)',
    artworkKey: 'focus-observatory',
    accentHex: '#fbbf24',
    badgeLabel: 'STUDY NOIR',
  },
  {
    id: 'bg-ff-cobra-temple',
    name: 'Crimson Cobra Sanctum',
    subtitle: 'Free Fire inspired · Venom hex monolith',
    description: 'Obsidian & crimson hexagonal scale walls guarding twin glowing serpent totems etched in razor scarlet light.',
    rarity: 'Legendary',
    costPoints: 4200,
    gradientCss:
      'radial-gradient(circle at 78% 42%, rgba(244,63,94,0.42), transparent 56%), linear-gradient(135deg, #090609 0%, #3b0717 55%, #1c050d 100%)',
    artworkKey: 'ff-cobra-temple',
    accentHex: '#f43f5e',
    badgeLabel: 'COBRA HALL',
  },
  {
    id: 'bg-anim-booyah-inferno',
    name: 'Animated Grandmaster Royale',
    subtitle: 'Free Fire inspired · Sweeping Booyah rays',
    description: 'Tactical crimson & solar-gold championship backdrop with sweeping spotlight beams, breathing Heroic crest & rising embers.',
    rarity: 'Mythic',
    costPoints: 11500,
    gradientCss:
      'radial-gradient(circle at 80% 44%, rgba(251,191,36,0.44) 0%, rgba(225,29,72,0.28) 42%, transparent 66%), linear-gradient(135deg, #0c0609 0%, #450a18 54%, #5c1908 100%)',
    artworkKey: 'anim-booyah-inferno',
    accentHex: '#fbbf24',
    badgeLabel: 'ROYALE FX',
    isAnimated: true,
  },
  {
    id: 'bg-anim-carrom-palace',
    name: 'Animated Royal Kundan Court',
    subtitle: 'Carrom Pool craft · Twinkling palace court',
    description: 'Lapis-sapphire & velvet crimson Mughal courtyard illuminated by twinkling kundan stars and golden Carrom rosette geometry.',
    rarity: 'Mythic',
    costPoints: 13500,
    gradientCss:
      'radial-gradient(ellipse at 78% 40%, rgba(250,204,21,0.34), transparent 58%), linear-gradient(135deg, #090d26 0%, #2a0a38 52%, #4a0d24 100%)',
    artworkKey: 'anim-carrom-palace',
    accentHex: '#fde047',
    badgeLabel: 'KUNDAN FX',
    isAnimated: true,
  },
  {
    id: 'bg-pack-alpine-sunrise',
    name: 'Alpine Sea of Clouds',
    subtitle: 'Scenic pack · Golden dawn above peaks',
    description: 'Warm tangerine-gold sunrise cresting over rugged alpine summits and lavender-tinted cloud valleys.',
    rarity: 'Rare',
    costPoints: 850,
    gradientCss:
      'radial-gradient(circle at 72% 42%, rgba(251,146,60,0.48), transparent 52%), linear-gradient(135deg, #1e1b4b 0%, #9d4e73 48%, #f59e0b 100%)',
    artworkKey: 'pack-bg-alpine-sunrise',
    accentHex: '#fb923c',
    badgeLabel: 'DAWN PEAKS',
  },
  {
    id: 'bg-pack-dusk-peaks',
    name: 'Pastel Dawn Snow Peaks',
    subtitle: 'Scenic pack · Rose-tinted alpine range',
    description: 'Serene periwinkle twilight sky glowing above snow-draped mountain ridges and shadowy pine forests.',
    rarity: 'Rare',
    costPoints: 950,
    gradientCss:
      'radial-gradient(ellipse at 78% 28%, rgba(244,114,182,0.34), transparent 55%), linear-gradient(135deg, #0f172a 0%, #312e81 48%, #be6a8e 100%)',
    artworkKey: 'pack-bg-dusk-peaks',
    accentHex: '#f9a8d4',
    badgeLabel: 'SNOW RIDGE',
  },
  {
    id: 'bg-pack-forest-stream',
    name: 'Emerald Woodland Brook',
    subtitle: 'Nature pack · Sunbeams over mossy river',
    description: 'Tranquil emerald woodland canopy pierced by golden sunrays dancing across a cool clear brook.',
    rarity: 'Rare',
    costPoints: 1150,
    gradientCss:
      'radial-gradient(ellipse at 78% 26%, rgba(163,230,53,0.3), transparent 56%), linear-gradient(135deg, #022c22 0%, #064e3b 52%, #115e59 100%)',
    artworkKey: 'pack-bg-forest-stream',
    accentHex: '#34d399',
    badgeLabel: 'WOODLAND',
  },
  {
    id: 'bg-pack-sakura-breeze',
    name: 'Sunlit Sakura Breeze',
    subtitle: 'Spring pack · Blossoming branch & sky',
    description: 'Bright spring azure horizon framed by a sunlit cherry blossom bough and gently drifting petals.',
    rarity: 'Epic',
    costPoints: 1950,
    gradientCss:
      'radial-gradient(ellipse at 76% 32%, rgba(251,207,232,0.36), transparent 55%), linear-gradient(135deg, #0c4a6e 0%, #0284c7 52%, #7dd3fc 100%)',
    artworkKey: 'pack-bg-sakura-breeze',
    accentHex: '#fbcfe8',
    badgeLabel: 'SAKURA SKY',
    isAnimated: true,
  },
  {
    id: 'bg-pack-warm-library',
    name: 'Candlelit Desk & Classics',
    subtitle: 'Scholar pack · Mahogany study & glasses',
    description: 'Warm amber-lit scholar desk layered with leatherbound volumes, open parchment, and brass eyeglasses.',
    rarity: 'Epic',
    costPoints: 2200,
    gradientCss:
      'radial-gradient(ellipse at 74% 48%, rgba(245,158,11,0.38), transparent 55%), linear-gradient(135deg, #140b06 0%, #3b1d0a 52%, #1c1008 100%)',
    artworkKey: 'pack-bg-warm-library',
    accentHex: '#fbbf24',
    badgeLabel: 'ARCHIVES',
  },
  {
    id: 'bg-pack-rainy-study',
    name: 'Midnight Rainy Study Window',
    subtitle: 'Focus pack · Rainy glass & brass desk lamp',
    description: 'Cozy midnight study window beaded with raindrops beside potted plants, open notebook, and warm lamp light.',
    rarity: 'Epic',
    costPoints: 2300,
    gradientCss:
      'radial-gradient(circle at 80% 56%, rgba(251,191,36,0.34), transparent 48%), linear-gradient(135deg, #070d1c 0%, #10203e 54%, #1e293b 100%)',
    artworkKey: 'pack-bg-rainy-study',
    accentHex: '#fbbf24',
    badgeLabel: 'RAINY DESK',
    isAnimated: true,
  },
  {
    id: 'bg-pack-twilight-dome',
    name: 'Twilight Domes & Crescents',
    subtitle: 'Horizon pack · Illuminated palace spires',
    description: 'Violet-amber sunset skyline crowned by twin golden crescent moons over glowing imperial domes.',
    rarity: 'Epic',
    costPoints: 2600,
    gradientCss:
      'radial-gradient(ellipse at 74% 38%, rgba(251,146,60,0.42), transparent 55%), linear-gradient(135deg, #1b0e2e 0%, #6b215e 52%, #b45309 100%)',
    artworkKey: 'pack-bg-twilight-dome',
    accentHex: '#fbbf24',
    badgeLabel: 'CITADEL',
  },
  {
    id: 'bg-pack-fullmoon-clouds',
    name: 'Silver Full Moon Storm',
    subtitle: 'Nocturne pack · Luminous moonlit clouds',
    description: 'Radiant cratered full moon illuminating sculpted cobalt storm clouds above a silent dark skyline.',
    rarity: 'Legendary',
    costPoints: 3700,
    gradientCss:
      'radial-gradient(circle at 68% 34%, rgba(226,232,240,0.4), transparent 48%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
    artworkKey: 'pack-bg-fullmoon-clouds',
    accentHex: '#e2e8f0',
    badgeLabel: 'FULL MOON',
  },
  {
    id: 'bg-pack-autumn-maple',
    name: 'Autumn Maple Sunbeams',
    subtitle: 'Seasonal pack · Amber leaves & forest mist',
    description: 'Warm amber autumn forest haze crossed by glowing sunbeams and crimson-gold maple leaves drifting past.',
    rarity: 'Legendary',
    costPoints: 4100,
    gradientCss:
      'radial-gradient(circle at 75% 36%, rgba(251,191,36,0.44), transparent 56%), linear-gradient(135deg, #1c0c04 0%, #5c2308 52%, #92400e 100%)',
    artworkKey: 'pack-bg-autumn-maple',
    accentHex: '#fb923c',
    badgeLabel: 'AUTUMN FX',
    isAnimated: true,
  },
  {
    id: 'bg-pack-milkyway-comet',
    name: 'Milky Way & Shooting Star',
    subtitle: 'Cosmos pack · Violet nebula & ridge comet',
    description: 'Deep starfield spanned by an incandescent violet-indigo Milky Way band and a streaking silver comet.',
    rarity: 'Legendary',
    costPoints: 4800,
    gradientCss:
      'radial-gradient(ellipse at 65% 36%, rgba(167,139,250,0.38), transparent 58%), linear-gradient(135deg, #030712 0%, #0f172a 52%, #1e1b4b 100%)',
    artworkKey: 'pack-bg-milkyway-comet',
    accentHex: '#a78bfa',
    badgeLabel: 'STARLIGHT',
    isAnimated: true,
  },
];

export const STORE_AVATARS_CATALOG: StoreAvatarItem[] = [
  {
    id: 'default',
    name: 'Account Photo / Initial',
    subtitle: 'Uses your Google portrait or monogram (Included)',
    description: 'Displays your signed-in account avatar or clean monogram letter.',
    rarity: 'Starter',
    costPoints: 0,
    bgCss: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.05))',
    accentHex: '#f59e0b',
    emblemKey: 'default',
  },
  {
    id: 'avatar-art-midnight-scholar',
    name: 'Midnight Lo-Fi Scholar',
    subtitle: 'Anime Portrait · Desk lamp & headphones',
    description:
      'Detailed anime study portrait of a focused midnight scholar writing under a warm amber desk lamp with studio headphones.',
    rarity: 'Rare',
    costPoints: 550,
    bgCss: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #78350f 100%)',
    accentHex: '#fbbf24',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarMidnightScholar,
    imageScale: 1.06,
    emblemKey: 'face-scholar',
  },
  {
    id: 'avatar-art-starlight-dreamer',
    name: 'Starlight Crescent Dreamer',
    subtitle: 'Anime Portrait · Twilight crescent gaze',
    description:
      'Expressive anime portrait of a silver-haired scholar gazing upward at a luminous golden crescent and drifting starlight.',
    rarity: 'Epic',
    costPoints: 1100,
    bgCss: 'linear-gradient(135deg, #090d24 0%, #1e1b4b 55%, #4c1d95 100%)',
    accentHex: '#c4b5fd',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarStarlightDreamer,
    imageScale: 1.15,
    emblemKey: 'pack-av-sky-dreamer',
  },
  // === Profile Customization Collection — 10 Stunning Avatars (Mid to High Tier) ===
  {
    id: 'avatar-col-monochrome-tactician',
    name: 'Monochrome Tactician',
    subtitle: 'Collection Series · Silver-ink anime portrait',
    description:
      'Composed monochrome portrait of a sharp-eyed scholar drawn in crisp silver and charcoal tones.',
    rarity: 'Epic',
    costPoints: 3600,
    bgCss: 'linear-gradient(135deg, #18181b 0%, #3f3f46 55%, #a1a1aa 100%)',
    accentHex: '#e4e4e7',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColMonochromeTactician,
    emblemKey: 'face-scholar',
  },
  {
    id: 'avatar-col-sunset-silhouette',
    name: 'Sunset Silhouette',
    subtitle: 'Collection Series · Dusk sky contemplative',
    description:
      'Atmospheric scholar silhouette framed against glowing peach, coral, and lavender sunset clouds.',
    rarity: 'Epic',
    costPoints: 4500,
    bgCss: 'linear-gradient(135deg, #312e81 0%, #9d174d 55%, #fb923c 100%)',
    accentHex: '#fb923c',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColSunsetSilhouette,
    emblemKey: 'pack-av-sunset-traveler',
  },
  {
    id: 'avatar-col-lofi-stargazer',
    name: 'Lo-Fi Stargazer',
    subtitle: 'Collection Series · Headphones & twilight sky',
    description:
      'Serene anime portrait wearing glowing studio headphones while gazing up into the violet night sky.',
    rarity: 'Epic',
    costPoints: 5800,
    bgCss: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #a855f7 100%)',
    accentHex: '#c4b5fd',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColLofiStargazer,
    emblemKey: 'pack-av-sky-dreamer',
  },
  {
    id: 'avatar-col-royal-mochi-cat',
    name: 'Royal Mochi Cat',
    subtitle: 'Collection Series · Crowned study companion',
    description:
      'Joyful snow-white fluffy cat wearing a tiny golden royal crown to brighten every focus session.',
    rarity: 'Legendary',
    costPoints: 7200,
    bgCss: 'linear-gradient(135deg, #1e293b 0%, #475569 55%, #fde68a 100%)',
    accentHex: '#fbbf24',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColRoyalMochiCat,
    emblemKey: 'carrom-queen',
  },
  {
    id: 'avatar-col-sakura-torii-moon',
    name: 'Sakura Torii Moon',
    subtitle: 'Collection Series · Crimson shrine under moonlight',
    description:
      'Iconic vermilion Torii gate reflected in calm waters beneath blooming cherry blossoms and a full moon.',
    rarity: 'Legendary',
    costPoints: 8800,
    bgCss: 'linear-gradient(135deg, #2e1065 0%, #9d174d 55%, #f9a8d4 100%)',
    accentHex: '#f472b6',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColSakuraToriiMoon,
    emblemKey: 'pack-av-sakura-reader',
  },
  {
    id: 'avatar-col-silver-prodigy',
    name: 'Silver Masked Prodigy',
    subtitle: 'Collection Series · Crimson-eyed strategist',
    description:
      'High-contrast silver-haired anime prodigy wearing a sleek obsidian mask with piercing crimson eyes.',
    rarity: 'Legendary',
    costPoints: 10500,
    bgCss: 'linear-gradient(135deg, #09090b 0%, #27272a 55%, #991b1b 100%)',
    accentHex: '#f87171',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColSilverProdigy,
    emblemKey: 'pack-av-bloodmoon-shinobi',
  },
  {
    id: 'avatar-col-azure-spirit-wolf',
    name: 'Azure Spirit Wolf',
    subtitle: 'Collection Series · Electric cosmic guardian',
    description:
      'Noble sapphire spirit wolf crackling with bioluminescent azure fur against deep midnight space.',
    rarity: 'Legendary',
    costPoints: 12800,
    bgCss: 'linear-gradient(135deg, #020617 0%, #1d4ed8 55%, #38bdf8 100%)',
    accentHex: '#38bdf8',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColAzureSpiritWolf,
    emblemKey: 'wolf',
  },
  {
    id: 'avatar-col-nebula-voyager',
    name: 'Nebula Voyager',
    subtitle: 'Collection Series · Deep-space explorer',
    description:
      'Futuristic astronaut reflecting violet starlight across a mirrored cosmic helmet visor.',
    rarity: 'Mythic',
    costPoints: 15200,
    bgCss: 'linear-gradient(135deg, #09051a 0%, #3730a3 55%, #38bdf8 100%)',
    accentHex: '#818cf8',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColNebulaVoyager,
    emblemKey: 'pack-av-milkyway-gazer',
  },
  {
    id: 'avatar-col-phantom-hood',
    name: 'Phantom Thunder Hood',
    subtitle: 'Collection Series · Ultraviolet shadow sentinel',
    description:
      'Enigmatic hooded guardian wreathed in crackling purple lightning with glowing violet eyes.',
    rarity: 'Mythic',
    costPoints: 17400,
    bgCss: 'linear-gradient(135deg, #090514 0%, #581c87 55%, #a855f7 100%)',
    accentHex: '#a855f7',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColPhantomHood,
    emblemKey: 'pack-av-bloodmoon-shinobi',
  },
  {
    id: 'avatar-col-obsidian-crown',
    name: 'Obsidian Crown Emblem',
    subtitle: 'Collection Series · Minimalist monarch crest',
    description:
      'Pure jet-black obsidian emblem centered with a crisp white sovereign crown for ultra-clean prestige.',
    rarity: 'Mythic',
    costPoints: 19500,
    bgCss: 'linear-gradient(135deg, #000000 0%, #18181b 100%)',
    accentHex: '#f8fafc',
    isPortrait: true,
    imageUrl: COSMETIC_ARTWORK_IMAGES.avatarColObsidianCrown,
    emblemKey: 'face-maharaja',
  },
  {
    id: 'avatar-owl',
    name: 'Athena Night Owl',
    subtitle: '9+ hrs focus grind · Wisdom sigil',
    description: 'Custom vector emblem of the sleepless scholar owl.',
    rarity: 'Rare',
    costPoints: 550,
    bgCss: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    accentHex: '#38bdf8',
    emblemKey: 'owl',
  },
  {
    id: 'avatar-compass',
    name: 'Navigator Sextant',
    subtitle: '11.5 hrs focus grind · Precision path',
    description: 'Custom maritime brass compass rose with North Star needle.',
    rarity: 'Rare',
    costPoints: 700,
    bgCss: 'linear-gradient(135deg, #0c4a6e 0%, #1e293b 100%)',
    accentHex: '#7dd3fc',
    emblemKey: 'compass',
  },
  {
    id: 'avatar-lotus',
    name: 'Sacred Zen Lotus',
    subtitle: '13.5 hrs focus grind · Unbroken calm',
    description: 'Layered golden meditation lotus blooming over serene midnight indigo.',
    rarity: 'Rare',
    costPoints: 820,
    bgCss: 'linear-gradient(135deg, #3b0764 0%, #831843 100%)',
    accentHex: '#f9a8d4',
    emblemKey: 'lotus',
  },
  {
    id: 'avatar-chronomancer',
    name: 'Horology Astrolabe',
    subtitle: '16 hrs focus grind · Timekeeper',
    description: 'Precision brass & sapphire astrolabe dial emblem.',
    rarity: 'Rare',
    costPoints: 950,
    bgCss: 'linear-gradient(135deg, #1c1917 0%, #78350f 100%)',
    accentHex: '#fbbf24',
    emblemKey: 'chronomancer',
  },
  {
    id: 'avatar-alchemist',
    name: 'Philosopher Crucible',
    subtitle: '20 hrs focus grind · Transmutation flask',
    description: 'Geometric emerald-gold alchemy flask sealed with the Triad circle.',
    rarity: 'Rare',
    costPoints: 1200,
    bgCss: 'linear-gradient(135deg, #022c22 0%, #065f46 100%)',
    accentHex: '#6ee7b7',
    emblemKey: 'alchemist',
  },
  {
    id: 'avatar-knight',
    name: 'Vanguard Shield Knight',
    subtitle: '26 hrs focus grind · Disciplined',
    description: 'Armored silver-steel vanguard visor crest for relentless exam warriors.',
    rarity: 'Epic',
    costPoints: 1600,
    bgCss: 'linear-gradient(135deg, #09090b 0%, #334155 100%)',
    accentHex: '#e2e8f0',
    emblemKey: 'knight',
  },
  {
    id: 'avatar-spartan',
    name: 'Obsidian Spartan Helm',
    subtitle: '31 hrs focus grind · Phalanx grit',
    description: 'Crested bronze Corinthian war helmet forged for endurance sprints.',
    rarity: 'Epic',
    costPoints: 1850,
    bgCss: 'linear-gradient(135deg, #1c1917 0%, #7f1d1d 100%)',
    accentHex: '#fcd34d',
    emblemKey: 'spartan',
  },
  {
    id: 'avatar-falcon',
    name: 'Apex Peregrine Falcon',
    subtitle: '35 hrs focus grind · Velocity crest',
    description: 'Razor geometric falcon wings carved for unstoppable sprint discipline.',
    rarity: 'Epic',
    costPoints: 2100,
    bgCss: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
    accentHex: '#34d399',
    emblemKey: 'falcon',
  },
  {
    id: 'avatar-phoenix',
    name: 'Ember Phoenix Crest',
    subtitle: '43 hrs focus grind · Reborn flame',
    description: 'Blazing crimson-gold phoenix wings rising from exhaustion.',
    rarity: 'Epic',
    costPoints: 2600,
    bgCss: 'linear-gradient(135deg, #450a0a 0%, #9a3412 100%)',
    accentHex: '#fb7185',
    emblemKey: 'phoenix',
  },
  {
    id: 'avatar-kitsune',
    name: 'Nine-Tail Kitsune Mask',
    subtitle: '52 hrs focus grind · Kyoto spirit',
    description: 'Ceremonial ivory-and-crimson kitsune guardian mask etched in sharp brushwork.',
    rarity: 'Epic',
    costPoints: 3150,
    bgCss: 'linear-gradient(135deg, #1e1b4b 0%, #9f1239 100%)',
    accentHex: '#fda4af',
    emblemKey: 'kitsune',
  },
  {
    id: 'avatar-wolf',
    name: 'Cyber Astral Wolf',
    subtitle: '66 hrs focus grind · Apex tracker',
    description: 'Sharp neon cyan alpha-wolf geometric heraldry.',
    rarity: 'Legendary',
    costPoints: 4000,
    bgCss: 'linear-gradient(135deg, #042f2e 0%, #0369a1 100%)',
    accentHex: '#2dd4bf',
    emblemKey: 'wolf',
  },
  {
    id: 'avatar-crown-lion',
    name: 'Sovereign Golden Lion',
    subtitle: '78 hrs focus grind · Royal mane',
    description: 'Regal faceted lion heraldry forged in crown gold & smoked bronze.',
    rarity: 'Legendary',
    costPoints: 4700,
    bgCss: 'linear-gradient(135deg, #1c1917 0%, #854d0e 100%)',
    accentHex: '#fde047',
    emblemKey: 'lion',
  },
  {
    id: 'avatar-samurai',
    name: 'Neon Ronin Scholar',
    subtitle: '93 hrs focus grind · Ace blade',
    description: 'Violet & gold cyberpunk katana helmet insignia.',
    rarity: 'Legendary',
    costPoints: 5600,
    bgCss: 'linear-gradient(135deg, #2e1065 0%, #86198f 100%)',
    accentHex: '#e879f9',
    emblemKey: 'samurai',
  },
  {
    id: 'avatar-pegasus',
    name: 'Astral Winged Pegasus',
    subtitle: '104 hrs focus grind · Starlight flight',
    description: 'Feathered sky-sapphire winged steed emblem soaring past Ace Master.',
    rarity: 'Legendary',
    costPoints: 6250,
    bgCss: 'linear-gradient(135deg, #0c4a6e 0%, #312e81 100%)',
    accentHex: '#93c5fd',
    emblemKey: 'pegasus',
  },
  {
    id: 'avatar-celestial',
    name: 'Astral Eclipse Titan',
    subtitle: '116 hrs focus grind · Cosmic orbit',
    description: 'Sacred solar-lunar eclipse geometry etched in starlight violet.',
    rarity: 'Mythic',
    costPoints: 7000,
    bgCss: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #701a75 100%)',
    accentHex: '#f0abfc',
    emblemKey: 'celestial',
  },
  {
    id: 'avatar-griffin',
    name: 'Imperial Storm Griffin',
    subtitle: '126 hrs focus grind · Sky sovereign',
    description: 'Crowned heraldic griffin spreading razor storm-gold wings.',
    rarity: 'Mythic',
    costPoints: 7600,
    bgCss: 'linear-gradient(135deg, #0f172a 0%, #4338ca 50%, #92400e 100%)',
    accentHex: '#fde047',
    emblemKey: 'griffin',
  },
  {
    id: 'avatar-dragon',
    name: 'Apex Mythic Dragon',
    subtitle: '138 hrs focus grind · Conqueror crest',
    description: 'Imperial solar-gold dragon emblem reserved for true Chronos Conquerors.',
    rarity: 'Mythic',
    costPoints: 8300,
    bgCss: 'linear-gradient(135deg, #18181b 0%, #713f12 60%, #991b1b 100%)',
    accentHex: '#facc15',
    emblemKey: 'dragon',
  },
  {
    id: 'avatar-anim-chronocore',
    name: 'Animated Chrono Gear Core',
    subtitle: '175 hrs focus grind · Live turning mechanism',
    description: 'Interlocking golden watchmaker escapement gears turning smoothly in perpetual motion.',
    rarity: 'Mythic',
    costPoints: 10500,
    bgCss: 'linear-gradient(135deg, #0f172a 0%, #451a03 60%, #78350f 100%)',
    accentHex: '#fbbf24',
    emblemKey: 'anim-chronocore',
    isAnimated: true,
  },
  {
    id: 'avatar-anim-cybercore',
    name: 'Animated Quantum Reactor',
    subtitle: '242 hrs focus grind · Orbiting energy rings',
    description: 'Counter-rotating plasma gyroscope rings stabilizing a pulsing cyan photon singularity.',
    rarity: 'Mythic',
    costPoints: 14500,
    bgCss: 'linear-gradient(135deg, #042f2e 0%, #0f172a 55%, #312e81 100%)',
    accentHex: '#22d3ee',
    emblemKey: 'anim-reactor',
    isAnimated: true,
  },
  {
    id: 'avatar-anim-phoenix-fire',
    name: 'Animated Immortal Phoenix',
    subtitle: '333 hrs focus grind · Breathing flame halo',
    description: 'Radiant firebird crest floating above rising golden embers and a pulsing solar ring.',
    rarity: 'Mythic',
    costPoints: 20000,
    bgCss: 'linear-gradient(135deg, #450a0a 0%, #991b1b 52%, #b45309 100%)',
    accentHex: '#fda4af',
    emblemKey: 'anim-phoenixfire',
    isAnimated: true,
  },
  {
    id: 'avatar-anim-astral-crown',
    name: 'Animated Conqueror Singularity',
    subtitle: '433 hrs focus grind · Sovereign apex star',
    description: 'Crown-orbiting golden event-horizon sigil forged exclusively for top Chronos legends.',
    rarity: 'Mythic',
    costPoints: 26000,
    bgCss: 'linear-gradient(135deg, #090617 0%, #4c1d95 52%, #854d0e 100%)',
    accentHex: '#fde047',
    emblemKey: 'anim-singularity',
    isAnimated: true,
  },
  {
    id: 'avatar-face-scholar',
    name: 'Lo-Fi Study Scholar',
    subtitle: 'Person portrait · Headphones & focus specs',
    description: 'Expressive character portrait of a late-night scholar in round amber-lit glasses and wireless studio headphones.',
    rarity: 'Rare',
    costPoints: 600,
    bgCss: 'linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #312e81 100%)',
    accentHex: '#fbbf24',
    emblemKey: 'face-scholar',
    isPortrait: true,
  },
  {
    id: 'avatar-carrom-queen',
    name: 'Red Queen Golden Striker',
    subtitle: 'Carrom Pool craft · Championship pocket seal',
    description: 'Inlaid crimson-and-ivory Red Queen disc locked beneath a gleaming solid-brass Carrom championship striker.',
    rarity: 'Rare',
    costPoints: 850,
    bgCss: 'linear-gradient(135deg, #270e07 0%, #7c2d12 52%, #450a0a 100%)',
    accentHex: '#fbbf24',
    emblemKey: 'carrom-queen',
  },
  {
    id: 'avatar-face-booyah',
    name: 'Bermuda Vanguard',
    subtitle: 'Free Fire portrait · Cyber eye-visor operative',
    description: 'Free Fire inspired tactical fighter portrait sporting silver-frost hair, glowing cyan targeting visor & crimson neck scarf.',
    rarity: 'Epic',
    costPoints: 1400,
    bgCss: 'linear-gradient(135deg, #090d1a 0%, #1e1b4b 48%, #7f1d1d 100%)',
    accentHex: '#38bdf8',
    emblemKey: 'face-booyah',
    isPortrait: true,
  },
  {
    id: 'avatar-face-maharaja',
    name: 'Carrom Royal Maharaja',
    subtitle: 'Carrom Pool portrait · Jeweled kalgi crown',
    description: 'Dignified royal strategist portrait wearing a crimson & spun-gold turban adorned with an emerald kalgi plume.',
    rarity: 'Epic',
    costPoints: 1950,
    bgCss: 'linear-gradient(135deg, #1a0b2e 0%, #581c87 48%, #854d0e 100%)',
    accentHex: '#fde047',
    emblemKey: 'face-maharaja',
    isPortrait: true,
  },
  {
    id: 'avatar-ff-heroic-wing',
    name: 'Heroic Booyah Crest',
    subtitle: 'Free Fire focus · Crimson winged emblem',
    description: 'Iconic crimson-and-gold Heroic battle shield spread with razor metallic wings and a crowned center jewel.',
    rarity: 'Epic',
    costPoints: 2400,
    bgCss: 'linear-gradient(135deg, #18050b 0%, #7f1d1d 55%, #b45309 100%)',
    accentHex: '#fb7185',
    emblemKey: 'ff-heroic-wing',
  },
  {
    id: 'avatar-face-kunoichi',
    name: 'Crimson Ronin Duelist',
    subtitle: 'Free Fire portrait · Headband & katana focus',
    description: 'Sharp warrior-scholar portrait with flowing crimson headband, amber battle eyes & gleaming katana hilt at the shoulder.',
    rarity: 'Legendary',
    costPoints: 3200,
    bgCss: 'linear-gradient(135deg, #0f172a 0%, #4c0519 52%, #1e1b4b 100%)',
    accentHex: '#f43f5e',
    emblemKey: 'face-kunoichi',
    isPortrait: true,
  },
  {
    id: 'avatar-face-chrono-hacker',
    name: 'Chrono HUD Architect',
    subtitle: 'Person portrait · Holographic AR specs',
    description: 'Futuristic engineering specialist wearing luminous cyan AR-lenses reflecting live focus telemetry in razor detail.',
    rarity: 'Legendary',
    costPoints: 4500,
    bgCss: 'linear-gradient(135deg, #020617 0%, #0c4a6e 52%, #312e81 100%)',
    accentHex: '#22d3ee',
    emblemKey: 'face-chrono-hacker',
    isPortrait: true,
  },
  {
    id: 'avatar-face-alok',
    name: 'Animated Beat Commander',
    subtitle: 'Free Fire portrait · Pulsing EQ visor hero',
    description: 'Animated stage-commander portrait with pulsing golden soundwave visor glasses, studio headset mic & warm aura rim.',
    rarity: 'Mythic',
    costPoints: 8800,
    bgCss: 'linear-gradient(135deg, #140826 0%, #6b21a8 48%, #b45309 100%)',
    accentHex: '#fde047',
    emblemKey: 'anim-face-alok',
    isAnimated: true,
    isPortrait: true,
  },
  {
    id: 'avatar-focus-mandala',
    name: 'Animated Mind Eye Mandala',
    subtitle: 'Deep Focus craft · Breathing clarity sigil',
    description: 'Radiant golden eye of unbroken concentration framed by a rotating sacred-geometry lotus halo & rising light sparks.',
    rarity: 'Mythic',
    costPoints: 9500,
    bgCss: 'linear-gradient(135deg, #022c22 0%, #0f172a 54%, #312e81 100%)',
    accentHex: '#34d399',
    emblemKey: 'focus-mandala',
    isAnimated: true,
  },
  {
    id: 'avatar-anim-booyah-dragon',
    name: 'Animated Grandmaster Hero',
    subtitle: 'Free Fire portrait · Crowned blaze warrior',
    description: 'Apex animated warrior portrait crowned with horned Grandmaster gold plates, glowing amber eyes & rising fire embers.',
    rarity: 'Mythic',
    costPoints: 15000,
    bgCss: 'linear-gradient(135deg, #090607 0%, #7f1d1d 50%, #854d0e 100%)',
    accentHex: '#fbbf24',
    emblemKey: 'anim-booyah-dragon',
    isAnimated: true,
    isPortrait: true,
  },
  {
    id: 'avatar-pack-sunset-traveler',
    name: 'Golden Dusk Traveler',
    subtitle: 'Scene portrait · Backpack at sunset horizon',
    description: 'Full-bleed dusk portrait of a backpack-wearing scholar gazing across glowing peach-gold clouds.',
    rarity: 'Rare',
    costPoints: 650,
    bgCss: 'linear-gradient(160deg, #312e81 0%, #db7a7a 52%, #fbbf24 100%)',
    accentHex: '#fde68a',
    emblemKey: 'pack-av-sunset-traveler',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-desk-writer',
    name: 'Midnight Lamp Scholar',
    subtitle: 'Scene portrait · Glasses & late-night desk',
    description: 'Warm study desk portrait showing a focused scholar in headphones and glasses writing under a brass lamp.',
    rarity: 'Rare',
    costPoints: 850,
    bgCss: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #78350f 100%)',
    accentHex: '#fbbf24',
    emblemKey: 'pack-av-desk-writer',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-moonlit-peak',
    name: 'Crescent Peak Watcher',
    subtitle: 'Scene portrait · Lone night silhouette',
    description: 'Deep sapphire starscape silhouette of a reflective scholar beneath a luminous silver crescent moon.',
    rarity: 'Epic',
    costPoints: 1350,
    bgCss: 'linear-gradient(160deg, #020617 0%, #0f172a 55%, #1e3a8a 100%)',
    accentHex: '#bae6fd',
    emblemKey: 'pack-av-moonlit-peak',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-sky-dreamer',
    name: 'Skybound White Dreamer',
    subtitle: 'Scene portrait · Silver hair & open sky',
    description: 'Crisp cerulean sky portrait of a silver-haired dreamer looking skyward past sunlit cumulus clouds.',
    rarity: 'Epic',
    costPoints: 1800,
    bgCss: 'linear-gradient(160deg, #0284c7 0%, #38bdf8 55%, #bae6fd 100%)',
    accentHex: '#e0f2fe',
    emblemKey: 'pack-av-sky-dreamer',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-twilight-citadel',
    name: 'Twilight Citadel Horizon',
    subtitle: 'Scene portrait · Dusk silhouette & domes',
    description: 'Atmospheric twilight silhouette of a lone scholar facing glowing golden palace domes and spires.',
    rarity: 'Epic',
    costPoints: 2100,
    bgCss: 'linear-gradient(160deg, #2e1065 0%, #9d174d 52%, #f59e0b 100%)',
    accentHex: '#fcd34d',
    emblemKey: 'pack-av-twilight-citadel',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-sakura-reader',
    name: 'Sakura Canopy Reader',
    subtitle: 'Scene portrait · Reading under blossoms',
    description: 'Serene study portrait of a scholar reading beneath a dense canopy of sunlit pink cherry blossoms.',
    rarity: 'Epic',
    costPoints: 2400,
    bgCss: 'linear-gradient(160deg, #4c0519 0%, #be185d 52%, #fbcfe8 100%)',
    accentHex: '#fbcfe8',
    emblemKey: 'pack-av-sakura-reader',
    isAnimated: true,
    isPortrait: true,
  },
  {
    id: 'avatar-pack-bloodmoon-shinobi',
    name: 'Blood Moon Shinobi',
    subtitle: 'Scene portrait · Scarlet hood & katana',
    description: 'Crimson full-moon portrait of a hooded warrior silhouette armed with twin katanas amidst embers.',
    rarity: 'Legendary',
    costPoints: 3400,
    bgCss: 'linear-gradient(160deg, #090609 0%, #7f1d1d 55%, #dc2626 100%)',
    accentHex: '#fb7185',
    emblemKey: 'pack-av-bloodmoon-shinobi',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-clinical-scholar',
    name: 'Clinical Horizon Scholar',
    subtitle: 'Scene portrait · White coat & stethoscope',
    description: 'Sharp-lit corridor portrait of a medical/science scholar silhouette in a crisp white lab coat.',
    rarity: 'Legendary',
    costPoints: 3900,
    bgCss: 'linear-gradient(160deg, #0f172a 0%, #0369a1 52%, #7dd3fc 100%)',
    accentHex: '#7dd3fc',
    emblemKey: 'pack-av-clinical-scholar',
    isPortrait: true,
  },
  {
    id: 'avatar-pack-cyber-skyline',
    name: 'Neon Skyline Listener',
    subtitle: 'Scene portrait · Headphones & night towers',
    description: 'Cyberpunk violet-indigo skyline portrait of a scholar in wireless headphones overlooking city lights.',
    rarity: 'Legendary',
    costPoints: 4200,
    bgCss: 'linear-gradient(160deg, #090d26 0%, #312e81 55%, #db2777 100%)',
    accentHex: '#38bdf8',
    emblemKey: 'pack-av-cyber-skyline',
    isAnimated: true,
    isPortrait: true,
  },
  {
    id: 'avatar-pack-milkyway-gazer',
    name: 'Milky Way Stargazer',
    subtitle: 'Scene portrait · Galaxy core & starlight',
    description: 'Cosmic stargazer silhouette beneath a luminous violet-blue Milky Way nebula and twinkling stars.',
    rarity: 'Mythic',
    costPoints: 6400,
    bgCss: 'linear-gradient(160deg, #020617 0%, #1e1b4b 55%, #6d28d9 100%)',
    accentHex: '#c4b5fd',
    emblemKey: 'pack-av-milkyway-gazer',
    isAnimated: true,
    isPortrait: true,
  },
];

export const DEFAULT_WALLET: ChronosWallet = {
  points: 50,
  totalPointsEarned: 50,
  unlockedTracks: ['rain', 'whitenoise', 'pinknoise', 'binaural', 'cafe', 'forest'],
  unlockedFrames: ['default'],
  unlockedBackgrounds: ['default'],
  unlockedAvatars: ['default'],
  equippedFrame: 'default',
  equippedBackground: 'default',
  equippedAvatar: 'default',
};

export function normalizeWallet(raw?: Partial<ChronosWallet> | null): ChronosWallet {
  const unlockedTracks = Array.isArray(raw?.unlockedTracks)
    ? Array.from(new Set([...DEFAULT_WALLET.unlockedTracks, ...raw.unlockedTracks]))
    : DEFAULT_WALLET.unlockedTracks;
  const unlockedFrames = Array.isArray(raw?.unlockedFrames)
    ? Array.from(new Set(['default', ...raw.unlockedFrames]))
    : ['default'];
  const unlockedBackgrounds = Array.isArray(raw?.unlockedBackgrounds)
    ? Array.from(new Set(['default', ...raw.unlockedBackgrounds]))
    : ['default'];
  const unlockedAvatars = Array.isArray(raw?.unlockedAvatars)
    ? Array.from(new Set(['default', ...raw.unlockedAvatars]))
    : ['default'];

  const equippedFrame =
    typeof raw?.equippedFrame === 'string' && unlockedFrames.includes(raw.equippedFrame)
      ? raw.equippedFrame
      : 'default';
  const equippedBackground =
    typeof raw?.equippedBackground === 'string' && unlockedBackgrounds.includes(raw.equippedBackground)
      ? raw.equippedBackground
      : 'default';
  const equippedAvatar =
    typeof raw?.equippedAvatar === 'string' && unlockedAvatars.includes(raw.equippedAvatar)
      ? raw.equippedAvatar
      : 'default';

  const points =
    typeof raw?.points === 'number' && Number.isFinite(raw.points)
      ? Math.max(0, Math.round(raw.points))
      : DEFAULT_WALLET.points;
  const totalPointsEarned =
    typeof raw?.totalPointsEarned === 'number' && Number.isFinite(raw.totalPointsEarned)
      ? Math.max(points, Math.round(raw.totalPointsEarned))
      : Math.max(points, DEFAULT_WALLET.totalPointsEarned);

  return {
    points,
    totalPointsEarned,
    unlockedTracks,
    unlockedFrames,
    unlockedBackgrounds,
    unlockedAvatars,
    equippedFrame,
    equippedBackground,
    equippedAvatar,
  };
}

export function loadChronosWallet(): ChronosWallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!raw) return { ...DEFAULT_WALLET };
    return normalizeWallet(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_WALLET };
  }
}

export function saveChronosWallet(wallet: ChronosWallet) {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(normalizeWallet(wallet)));
  } catch {
    // ignore
  }
}

export function awardChronosPoints(amount: number): ChronosWallet {
  const safeAmount = Math.max(0, Math.round(amount));
  const current = loadChronosWallet();
  const updated: ChronosWallet = {
    ...current,
    points: current.points + safeAmount,
    totalPointsEarned: current.totalPointsEarned + safeAmount,
  };
  saveChronosWallet(updated);
  return updated;
}

export function unlockStoreTrack(trackId: AmbientSoundType, cost: number): boolean {
  const wallet = loadChronosWallet();
  if (wallet.unlockedTracks.includes(trackId)) return true;
  if (wallet.points < cost) return false;

  const updated: ChronosWallet = {
    ...wallet,
    points: wallet.points - cost,
    unlockedTracks: [...wallet.unlockedTracks, trackId],
  };
  saveChronosWallet(updated);
  return true;
}

export function purchaseStoreCosmetic(
  category: 'frame' | 'background' | 'avatar',
  itemId: string,
  cost: number
): { success: boolean; wallet: ChronosWallet } {
  const wallet = loadChronosWallet();

  if (category === 'frame') {
    if (wallet.unlockedFrames.includes(itemId)) {
      const updated = { ...wallet, equippedFrame: itemId };
      saveChronosWallet(updated);
      return { success: true, wallet: updated };
    }
    if (wallet.points < cost) return { success: false, wallet };
    const updated: ChronosWallet = {
      ...wallet,
      points: wallet.points - cost,
      unlockedFrames: [...wallet.unlockedFrames, itemId],
      equippedFrame: itemId,
    };
    saveChronosWallet(updated);
    return { success: true, wallet: updated };
  }

  if (category === 'background') {
    if (wallet.unlockedBackgrounds.includes(itemId)) {
      const updated = { ...wallet, equippedBackground: itemId };
      saveChronosWallet(updated);
      return { success: true, wallet: updated };
    }
    if (wallet.points < cost) return { success: false, wallet };
    const updated: ChronosWallet = {
      ...wallet,
      points: wallet.points - cost,
      unlockedBackgrounds: [...wallet.unlockedBackgrounds, itemId],
      equippedBackground: itemId,
    };
    saveChronosWallet(updated);
    return { success: true, wallet: updated };
  }

  if (wallet.unlockedAvatars.includes(itemId)) {
    const updated = { ...wallet, equippedAvatar: itemId };
    saveChronosWallet(updated);
    return { success: true, wallet: updated };
  }
  if (wallet.points < cost) return { success: false, wallet };
  const updated: ChronosWallet = {
    ...wallet,
    points: wallet.points - cost,
    unlockedAvatars: [...wallet.unlockedAvatars, itemId],
    equippedAvatar: itemId,
  };
  saveChronosWallet(updated);
  return { success: true, wallet: updated };
}

export function equipStoreCosmetic(
  category: 'frame' | 'background' | 'avatar',
  itemId: string
): ChronosWallet {
  const wallet = loadChronosWallet();
  if (category === 'frame') {
    if (!wallet.unlockedFrames.includes(itemId) && itemId !== 'default') return wallet;
    const updated = { ...wallet, equippedFrame: itemId };
    saveChronosWallet(updated);
    return updated;
  }
  if (category === 'background') {
    if (!wallet.unlockedBackgrounds.includes(itemId) && itemId !== 'default') return wallet;
    const updated = { ...wallet, equippedBackground: itemId };
    saveChronosWallet(updated);
    return updated;
  }
  if (!wallet.unlockedAvatars.includes(itemId) && itemId !== 'default') return wallet;
  const updated = { ...wallet, equippedAvatar: itemId };
  saveChronosWallet(updated);
  return updated;
}

export function getStoreFrameById(id?: string): StoreFrameItem {
  return STORE_FRAMES_CATALOG.find((f) => f.id === id) || STORE_FRAMES_CATALOG[0];
}

export function getStoreBackgroundById(id?: string): StoreBackgroundItem {
  return STORE_BACKGROUNDS_CATALOG.find((b) => b.id === id) || STORE_BACKGROUNDS_CATALOG[0];
}

export function getStoreAvatarById(id?: string): StoreAvatarItem {
  return STORE_AVATARS_CATALOG.find((a) => a.id === id) || STORE_AVATARS_CATALOG[0];
}

export function computeScholarDigitId(uid?: string | null): string {
  const clean = (uid || '').trim();
  if (!clean) return '00000000';
  let h1 = 2166136261 >>> 0;
  let h2 = 3735928559 >>> 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ (ch + i * 31), 2246822519) >>> 0;
  }
  const combined = ((h1 ^ (h2 >>> 13)) >>> 0) % 90000000;
  return String(10000000 + combined);
}

export function spendPointsForGift(
  costPoints: number
): { success: boolean; wallet: ChronosWallet } {
  const safeCost = Math.max(0, Math.round(costPoints));
  const wallet = loadChronosWallet();
  if (safeCost <= 0 || wallet.points < safeCost) {
    return { success: false, wallet };
  }
  const updated: ChronosWallet = {
    ...wallet,
    points: wallet.points - safeCost,
  };
  saveChronosWallet(updated);
  return { success: true, wallet: updated };
}

export function claimGiftedCosmeticToWallet(
  category: 'frame' | 'background' | 'avatar',
  itemId: string,
  equipNow: boolean = true
): { wallet: ChronosWallet; alreadyOwned: boolean; bonusXp: number } {
  const wallet = loadChronosWallet();
  let alreadyOwned = false;
  let nextWallet: ChronosWallet = { ...wallet };

  if (category === 'frame') {
    alreadyOwned = wallet.unlockedFrames.includes(itemId);
    nextWallet = {
      ...wallet,
      unlockedFrames: alreadyOwned ? wallet.unlockedFrames : [...wallet.unlockedFrames, itemId],
      equippedFrame: equipNow ? itemId : wallet.equippedFrame,
    };
  } else if (category === 'background') {
    alreadyOwned = wallet.unlockedBackgrounds.includes(itemId);
    nextWallet = {
      ...wallet,
      unlockedBackgrounds: alreadyOwned
        ? wallet.unlockedBackgrounds
        : [...wallet.unlockedBackgrounds, itemId],
      equippedBackground: equipNow ? itemId : wallet.equippedBackground,
    };
  } else {
    alreadyOwned = wallet.unlockedAvatars.includes(itemId);
    nextWallet = {
      ...wallet,
      unlockedAvatars: alreadyOwned ? wallet.unlockedAvatars : [...wallet.unlockedAvatars, itemId],
      equippedAvatar: equipNow ? itemId : wallet.equippedAvatar,
    };
  }

  const bonusXp = alreadyOwned ? 50 : 0;
  if (bonusXp > 0) {
    nextWallet = {
      ...nextWallet,
      points: nextWallet.points + bonusXp,
      totalPointsEarned: nextWallet.totalPointsEarned + bonusXp,
    };
  }

  saveChronosWallet(nextWallet);
  return { wallet: nextWallet, alreadyOwned, bonusXp };
}

// ============================================================================
// PUBG / FREE FIRE STYLE MULTI-TIER + SUB-LEVEL PROGRESSION SYSTEM
// ============================================================================

export const SCHOLAR_TIER_LADDER: ScholarTierStep[] = [
  // Bronze V -> I (0 - 499)
  { id: 'bronze-5', majorTier: 'Bronze', tier: 'Bronze V', title: 'Initiate Recruit', minPoints: 0, maxPoints: 99, accentHex: '#cd7f32', badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-700/15 border-amber-700/35', gradientClass: 'from-amber-800 via-amber-700 to-stone-700' },
  { id: 'bronze-4', majorTier: 'Bronze', tier: 'Bronze IV', title: 'Novice Scholar', minPoints: 100, maxPoints: 199, accentHex: '#cd7f32', badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-700/15 border-amber-700/35', gradientClass: 'from-amber-800 via-amber-700 to-stone-700' },
  { id: 'bronze-3', majorTier: 'Bronze', tier: 'Bronze III', title: 'Bronze Cadet', minPoints: 200, maxPoints: 299, accentHex: '#cd7f32', badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-700/15 border-amber-700/35', gradientClass: 'from-amber-800 via-amber-700 to-stone-700' },
  { id: 'bronze-2', majorTier: 'Bronze', tier: 'Bronze II', title: 'Bronze Ranger', minPoints: 300, maxPoints: 399, accentHex: '#cd7f32', badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-700/15 border-amber-700/35', gradientClass: 'from-amber-800 via-amber-700 to-stone-700' },
  { id: 'bronze-1', majorTier: 'Bronze', tier: 'Bronze I', title: 'Bronze Veteran', minPoints: 400, maxPoints: 499, accentHex: '#d97706', badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-700/15 border-amber-700/35', gradientClass: 'from-amber-700 via-amber-600 to-amber-800' },

  // Silver V -> I (500 - 1,249)
  { id: 'silver-5', majorTier: 'Silver', tier: 'Silver V', title: 'Silver Apprentice', minPoints: 500, maxPoints: 649, accentHex: '#94a3b8', badgeColor: 'text-slate-600 dark:text-slate-300 bg-slate-400/15 border-slate-400/35', gradientClass: 'from-slate-500 via-slate-300 to-slate-600' },
  { id: 'silver-4', majorTier: 'Silver', tier: 'Silver IV', title: 'Disciplined Mind', minPoints: 650, maxPoints: 799, accentHex: '#94a3b8', badgeColor: 'text-slate-600 dark:text-slate-300 bg-slate-400/15 border-slate-400/35', gradientClass: 'from-slate-500 via-slate-300 to-slate-600' },
  { id: 'silver-3', majorTier: 'Silver', tier: 'Silver III', title: 'Silver Sentinel', minPoints: 800, maxPoints: 949, accentHex: '#94a3b8', badgeColor: 'text-slate-600 dark:text-slate-300 bg-slate-400/15 border-slate-400/35', gradientClass: 'from-slate-500 via-slate-300 to-slate-600' },
  { id: 'silver-2', majorTier: 'Silver', tier: 'Silver II', title: 'Silver Tactician', minPoints: 950, maxPoints: 1099, accentHex: '#cbd5e1', badgeColor: 'text-slate-600 dark:text-slate-200 bg-slate-400/15 border-slate-400/35', gradientClass: 'from-slate-400 via-slate-200 to-slate-500' },
  { id: 'silver-1', majorTier: 'Silver', tier: 'Silver I', title: 'Silver Vanguard', minPoints: 1100, maxPoints: 1249, accentHex: '#cbd5e1', badgeColor: 'text-slate-600 dark:text-slate-200 bg-slate-400/15 border-slate-400/35', gradientClass: 'from-slate-400 via-slate-100 to-slate-500' },

  // Gold V -> I (1,250 - 2,499)
  { id: 'gold-5', majorTier: 'Gold', tier: 'Gold V', title: 'Deep Work Adept', minPoints: 1250, maxPoints: 1499, accentHex: '#eab308', badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/15 border-amber-500/35', gradientClass: 'from-amber-600 via-yellow-400 to-amber-700' },
  { id: 'gold-4', majorTier: 'Gold', tier: 'Gold IV', title: 'Gold Strategist', minPoints: 1500, maxPoints: 1749, accentHex: '#eab308', badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/15 border-amber-500/35', gradientClass: 'from-amber-600 via-yellow-400 to-amber-700' },
  { id: 'gold-3', majorTier: 'Gold', tier: 'Gold III', title: 'Gold Artisan', minPoints: 1750, maxPoints: 1999, accentHex: '#eab308', badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/15 border-amber-500/35', gradientClass: 'from-amber-600 via-yellow-400 to-amber-700' },
  { id: 'gold-2', majorTier: 'Gold', tier: 'Gold II', title: 'Gold Exemplar', minPoints: 2000, maxPoints: 2249, accentHex: '#f59e0b', badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/15 border-amber-500/35', gradientClass: 'from-amber-500 via-yellow-300 to-amber-600' },
  { id: 'gold-1', majorTier: 'Gold', tier: 'Gold I', title: 'Gold Commander', minPoints: 2250, maxPoints: 2499, accentHex: '#f59e0b', badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/15 border-amber-500/35', gradientClass: 'from-amber-500 via-yellow-200 to-amber-600' },

  // Platinum V -> I (2,500 - 4,499)
  { id: 'plat-5', majorTier: 'Platinum', tier: 'Platinum V', title: 'Focus Specialist', minPoints: 2500, maxPoints: 2899, accentHex: '#38bdf8', badgeColor: 'text-sky-500 dark:text-sky-300 bg-sky-500/15 border-sky-500/35', gradientClass: 'from-sky-500 via-cyan-300 to-indigo-600' },
  { id: 'plat-4', majorTier: 'Platinum', tier: 'Platinum IV', title: 'Master of Focus', minPoints: 2900, maxPoints: 3299, accentHex: '#38bdf8', badgeColor: 'text-sky-500 dark:text-sky-300 bg-sky-500/15 border-sky-500/35', gradientClass: 'from-sky-500 via-cyan-300 to-indigo-600' },
  { id: 'plat-3', majorTier: 'Platinum', tier: 'Platinum III', title: 'Platinum Savant', minPoints: 3300, maxPoints: 3699, accentHex: '#38bdf8', badgeColor: 'text-sky-500 dark:text-sky-300 bg-sky-500/15 border-sky-500/35', gradientClass: 'from-sky-500 via-cyan-300 to-indigo-600' },
  { id: 'plat-2', majorTier: 'Platinum', tier: 'Platinum II', title: 'Platinum Arbiter', minPoints: 3700, maxPoints: 4099, accentHex: '#0ea5e9', badgeColor: 'text-sky-500 dark:text-sky-300 bg-sky-500/15 border-sky-500/35', gradientClass: 'from-sky-400 via-cyan-200 to-blue-600' },
  { id: 'plat-1', majorTier: 'Platinum', tier: 'Platinum I', title: 'Platinum Marshal', minPoints: 4100, maxPoints: 4499, accentHex: '#0ea5e9', badgeColor: 'text-sky-500 dark:text-sky-300 bg-sky-500/15 border-sky-500/35', gradientClass: 'from-cyan-400 via-sky-200 to-indigo-600' },

  // Diamond V -> I (4,500 - 7,499)
  { id: 'dia-5', majorTier: 'Diamond', tier: 'Diamond V', title: 'Diamond Prodigy', minPoints: 4500, maxPoints: 5099, accentHex: '#22d3ee', badgeColor: 'text-cyan-500 dark:text-cyan-300 bg-cyan-500/15 border-cyan-500/35', gradientClass: 'from-cyan-500 via-blue-400 to-violet-600' },
  { id: 'dia-4', majorTier: 'Diamond', tier: 'Diamond IV', title: 'Diamond Tactician', minPoints: 5100, maxPoints: 5699, accentHex: '#22d3ee', badgeColor: 'text-cyan-500 dark:text-cyan-300 bg-cyan-500/15 border-cyan-500/35', gradientClass: 'from-cyan-500 via-blue-400 to-violet-600' },
  { id: 'dia-3', majorTier: 'Diamond', tier: 'Diamond III', title: 'Diamond Polymath', minPoints: 5700, maxPoints: 6299, accentHex: '#22d3ee', badgeColor: 'text-cyan-500 dark:text-cyan-300 bg-cyan-500/15 border-cyan-500/35', gradientClass: 'from-cyan-500 via-blue-400 to-violet-600' },
  { id: 'dia-2', majorTier: 'Diamond', tier: 'Diamond II', title: 'Diamond Luminary', minPoints: 6300, maxPoints: 6899, accentHex: '#06b6d4', badgeColor: 'text-cyan-500 dark:text-cyan-300 bg-cyan-500/15 border-cyan-500/35', gradientClass: 'from-cyan-400 via-sky-300 to-indigo-600' },
  { id: 'dia-1', majorTier: 'Diamond', tier: 'Diamond I', title: 'Diamond Sovereign', minPoints: 6900, maxPoints: 7499, accentHex: '#06b6d4', badgeColor: 'text-cyan-500 dark:text-cyan-300 bg-cyan-500/15 border-cyan-500/35', gradientClass: 'from-cyan-300 via-indigo-400 to-purple-600' },

  // Crown V -> I (7,500 - 11,999)
  { id: 'crown-5', majorTier: 'Crown', tier: 'Crown V', title: 'Crown Contender', minPoints: 7500, maxPoints: 8399, accentHex: '#a855f7', badgeColor: 'text-purple-500 dark:text-purple-300 bg-purple-500/15 border-purple-500/35', gradientClass: 'from-purple-600 via-fuchsia-400 to-amber-500' },
  { id: 'crown-4', majorTier: 'Crown', tier: 'Crown IV', title: 'Crown Noble', minPoints: 8400, maxPoints: 9299, accentHex: '#a855f7', badgeColor: 'text-purple-500 dark:text-purple-300 bg-purple-500/15 border-purple-500/35', gradientClass: 'from-purple-600 via-fuchsia-400 to-amber-500' },
  { id: 'crown-3', majorTier: 'Crown', tier: 'Crown III', title: 'Crown Archon', minPoints: 9300, maxPoints: 10199, accentHex: '#a855f7', badgeColor: 'text-purple-500 dark:text-purple-300 bg-purple-500/15 border-purple-500/35', gradientClass: 'from-purple-600 via-fuchsia-400 to-amber-500' },
  { id: 'crown-2', majorTier: 'Crown', tier: 'Crown II', title: 'Crown Regent', minPoints: 10200, maxPoints: 11099, accentHex: '#c084fc', badgeColor: 'text-purple-500 dark:text-purple-300 bg-purple-500/15 border-purple-500/35', gradientClass: 'from-purple-500 via-amber-300 to-fuchsia-600' },
  { id: 'crown-1', majorTier: 'Crown', tier: 'Crown I', title: 'Crown Monarch', minPoints: 11100, maxPoints: 11999, accentHex: '#c084fc', badgeColor: 'text-purple-500 dark:text-purple-300 bg-purple-500/15 border-purple-500/35', gradientClass: 'from-fuchsia-500 via-amber-300 to-purple-700' },

  // Heroic V -> I (12,000 - 18,999)
  { id: 'heroic-5', majorTier: 'Heroic', tier: 'Heroic V', title: 'Heroic Challenger', minPoints: 12000, maxPoints: 13399, accentHex: '#f43f5e', badgeColor: 'text-rose-500 dark:text-rose-300 bg-rose-500/15 border-rose-500/35', gradientClass: 'from-rose-600 via-red-500 to-amber-500' },
  { id: 'heroic-4', majorTier: 'Heroic', tier: 'Heroic IV', title: 'Heroic Paladin', minPoints: 13400, maxPoints: 14799, accentHex: '#f43f5e', badgeColor: 'text-rose-500 dark:text-rose-300 bg-rose-500/15 border-rose-500/35', gradientClass: 'from-rose-600 via-red-500 to-amber-500' },
  { id: 'heroic-3', majorTier: 'Heroic', tier: 'Heroic III', title: 'Heroic Vanguard', minPoints: 14800, maxPoints: 16199, accentHex: '#f43f5e', badgeColor: 'text-rose-500 dark:text-rose-300 bg-rose-500/15 border-rose-500/35', gradientClass: 'from-rose-600 via-red-500 to-amber-500' },
  { id: 'heroic-2', majorTier: 'Heroic', tier: 'Heroic II', title: 'Heroic Warden', minPoints: 16200, maxPoints: 17599, accentHex: '#fb7185', badgeColor: 'text-rose-500 dark:text-rose-300 bg-rose-500/15 border-rose-500/35', gradientClass: 'from-rose-500 via-amber-400 to-red-600' },
  { id: 'heroic-1', majorTier: 'Heroic', tier: 'Heroic I', title: 'Heroic Overlord', minPoints: 17600, maxPoints: 18999, accentHex: '#fb7185', badgeColor: 'text-rose-500 dark:text-rose-300 bg-rose-500/15 border-rose-500/35', gradientClass: 'from-red-500 via-amber-300 to-rose-700' },

  // Ace & Ace Master (19,000 - 25,999)
  { id: 'ace', majorTier: 'Ace', tier: 'Ace', title: 'Ace Grandmaster', minPoints: 19000, maxPoints: 21999, accentHex: '#10b981', badgeColor: 'text-emerald-500 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/35', gradientClass: 'from-emerald-500 via-teal-300 to-cyan-500' },
  { id: 'ace-master', majorTier: 'Ace', tier: 'Ace Master', title: 'Ace Dominator', minPoints: 22000, maxPoints: 25999, accentHex: '#34d399', badgeColor: 'text-emerald-500 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/35', gradientClass: 'from-emerald-400 via-amber-300 to-teal-500' },

  // Conqueror (26,000+)
  { id: 'conqueror', majorTier: 'Conqueror', tier: 'Conqueror', title: 'Chronos Conqueror', minPoints: 26000, maxPoints: null, accentHex: '#fbbf24', badgeColor: 'text-amber-500 dark:text-amber-300 bg-amber-500/20 border-amber-400/50', gradientClass: 'from-amber-400 via-rose-500 to-yellow-300' },
];

export function computeScholarLevel(totalPoints: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  levelProgressPercent: number;
} {
  let xp = Math.max(0, Math.floor(totalPoints));
  let level = 1;
  let costForNext = 60;

  while (xp >= costForNext && level < 200) {
    xp -= costForNext;
    level += 1;
    costForNext = 60 + (level - 1) * 20;
  }

  const levelProgressPercent =
    costForNext > 0 ? Math.min(100, Math.round((xp / costForNext) * 100)) : 100;

  return {
    level,
    xpIntoLevel: xp,
    xpForNextLevel: costForNext,
    levelProgressPercent,
  };
}

export function getScholarRank(totalPoints: number): ScholarRankInfo {
  const safePoints = Number.isFinite(totalPoints) ? Math.max(0, Math.round(totalPoints)) : 0;
  let idx = 0;
  for (let i = SCHOLAR_TIER_LADDER.length - 1; i >= 0; i--) {
    if (safePoints >= SCHOLAR_TIER_LADDER[i].minPoints) {
      idx = i;
      break;
    }
  }

  const current = SCHOLAR_TIER_LADDER[idx];
  const next = SCHOLAR_TIER_LADDER[idx + 1] || null;
  const parts = current.tier.split(' ');
  const division = parts.length > 1 ? parts[parts.length - 1] : '★';

  const currentTierFloor = current.minPoints;
  const nextTierPoints = next ? next.minPoints : current.minPoints;
  const progressPercent = next
    ? Math.min(
        100,
        Math.max(0, Math.round(((safePoints - currentTierFloor) / (nextTierPoints - currentTierFloor)) * 100))
      )
    : 100;

  const lvl = computeScholarLevel(safePoints);

  return {
    title: current.title,
    tier: current.tier,
    majorTier: current.majorTier,
    division,
    badgeColor: current.badgeColor,
    accentHex: current.accentHex,
    gradientClass: current.gradientClass,
    progressPercent,
    nextTierPoints,
    nextTierLabel: next ? next.tier : 'Max Tier',
    currentTierFloor,
    level: lvl.level,
    levelProgressPercent: lvl.levelProgressPercent,
    xpIntoLevel: lvl.xpIntoLevel,
    xpForNextLevel: lvl.xpForNextLevel,
  };
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundAlert: 'bowl',
  tickingSound: false,
};

export const DEFAULT_ALARMS: AlarmItem[] = [];

export const DEFAULT_CITIES: WorldClockCity[] = [
  { id: 'london', name: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { id: 'newyork', name: 'New York', country: 'United States', timezone: 'America/New_York' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
];

export const DEFAULT_TASKS: StudyTask[] = [];

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: 'sub-math', name: 'Mathematics', color: 'blue', isDefault: true },
  { id: 'sub-phys', name: 'Physics', color: 'cyan', isDefault: true },
  { id: 'sub-chem', name: 'Chemistry', color: 'emerald', isDefault: true },
  { id: 'sub-cs', name: 'Computer Science', color: 'violet', isDefault: true },
  { id: 'sub-lit', name: 'Literature', color: 'amber', isDefault: true },
  { id: 'sub-gen', name: 'General', color: 'indigo', isDefault: true },
];

export const COLOR_PALETTES: Record<
  SubjectColor,
  { bg: string; text: string; border: string; dot: string; solidBg: string }
> = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    solidBg: 'bg-blue-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-400',
    solidBg: 'bg-cyan-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    solidBg: 'bg-emerald-500',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20',
    dot: 'bg-violet-400',
    solidBg: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    solidBg: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
    solidBg: 'bg-rose-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    dot: 'bg-indigo-400',
    solidBg: 'bg-indigo-500',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/20',
    dot: 'bg-orange-400',
    solidBg: 'bg-orange-500',
  },
  teal: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20',
    dot: 'bg-teal-400',
    solidBg: 'bg-teal-500',
  },
};

export const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: COLOR_PALETTES.blue,
  Physics: COLOR_PALETTES.cyan,
  Chemistry: COLOR_PALETTES.emerald,
  'Computer Science': COLOR_PALETTES.violet,
  Literature: COLOR_PALETTES.amber,
  General: COLOR_PALETTES.indigo,
};

export function getSubjectStyle(subjectName: string, subjectsList: SubjectItem[] = DEFAULT_SUBJECTS) {
  const match = subjectsList.find((s) => s.name.toLowerCase() === subjectName.toLowerCase());
  if (match && COLOR_PALETTES[match.color]) {
    return COLOR_PALETTES[match.color];
  }
  return COLOR_PALETTES.amber;
}

export function loadStoredAlarms(): AlarmItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALARMS);
    return raw ? JSON.parse(raw) : DEFAULT_ALARMS;
  } catch {
    return DEFAULT_ALARMS;
  }
}

export function saveStoredAlarms(alarms: AlarmItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  } catch {
    // ignore
  }
}

export function loadPomodoroConfig(): PomodoroConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POMODORO_CONFIG);
    return raw ? { ...DEFAULT_POMODORO_CONFIG, ...JSON.parse(raw) } : DEFAULT_POMODORO_CONFIG;
  } catch {
    return DEFAULT_POMODORO_CONFIG;
  }
}

export function savePomodoroConfig(config: PomodoroConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.POMODORO_CONFIG, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function loadDeepWorkSessions(): DeepWorkSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeepWorkSessions(sessions: DeepWorkSession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function loadStudyTasks(): StudyTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveStudyTasks(tasks: StudyTask[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function loadWorldCities(): WorldClockCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CITIES);
    return raw ? JSON.parse(raw) : DEFAULT_CITIES;
  } catch {
    return DEFAULT_CITIES;
  }
}

export function saveWorldCities(cities: WorldClockCity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
  } catch {
    // ignore
  }
}

const VALID_SUBJECT_COLORS: SubjectColor[] = [
  'blue',
  'cyan',
  'emerald',
  'violet',
  'amber',
  'rose',
  'indigo',
  'orange',
  'teal',
];

export function normalizeSubjects(raw: unknown): SubjectItem[] {
  if (!Array.isArray(raw)) return DEFAULT_SUBJECTS;
  const cleaned: SubjectItem[] = [];
  const seenNames = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Partial<SubjectItem>;
    const name = typeof rec.name === 'string' ? rec.name.trim().slice(0, 50) : '';
    if (!name) continue;
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);

    const color: SubjectColor = VALID_SUBJECT_COLORS.includes(rec.color as SubjectColor)
      ? (rec.color as SubjectColor)
      : 'blue';
    const id =
      typeof rec.id === 'string' && rec.id.trim()
        ? rec.id.trim().slice(0, 64)
        : `sub-${nameKey.replace(/[^a-z0-9]+/g, '-')}`;

    cleaned.push({
      id,
      name,
      color,
      ...(rec.isDefault ? { isDefault: true } : {}),
    });
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_SUBJECTS;
}

export function mergeCloudAndLocalSubjects(
  cloudRaw: unknown,
  localSubjects: SubjectItem[],
  isSwitchingAccount: boolean
): SubjectItem[] {
  const cloudNormalized = Array.isArray(cloudRaw) ? normalizeSubjects(cloudRaw) : null;
  if (isSwitchingAccount) {
    return cloudNormalized || DEFAULT_SUBJECTS;
  }
  if (!cloudNormalized) {
    return normalizeSubjects(localSubjects);
  }
  // If user is on the same account and created custom local subjects while offline, keep union favoring cloud metadata
  const merged = [...cloudNormalized];
  const seen = new Set(merged.map((s) => s.name.toLowerCase()));
  for (const loc of localSubjects) {
    if (!loc?.name) continue;
    if (!loc.isDefault && !seen.has(loc.name.toLowerCase())) {
      seen.add(loc.name.toLowerCase());
      merged.push(loc);
    }
  }
  return merged;
}

export function normalizePomodoroConfig(raw: unknown): PomodoroConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_POMODORO_CONFIG;
  const rec = raw as Partial<PomodoroConfig>;
  const clampSecs = (val: unknown, fallback: number, min: number, max: number) =>
    typeof val === 'number' && Number.isFinite(val)
      ? Math.max(min, Math.min(max, Math.round(val)))
      : fallback;

  return {
    focusDuration: clampSecs(rec.focusDuration, DEFAULT_POMODORO_CONFIG.focusDuration, 60, 120 * 60),
    shortBreakDuration: clampSecs(
      rec.shortBreakDuration,
      DEFAULT_POMODORO_CONFIG.shortBreakDuration,
      60,
      60 * 60
    ),
    longBreakDuration: clampSecs(
      rec.longBreakDuration,
      DEFAULT_POMODORO_CONFIG.longBreakDuration,
      60,
      90 * 60
    ),
    longBreakInterval: clampSecs(
      rec.longBreakInterval,
      DEFAULT_POMODORO_CONFIG.longBreakInterval,
      1,
      12
    ),
    autoStartBreaks:
      typeof rec.autoStartBreaks === 'boolean'
        ? rec.autoStartBreaks
        : DEFAULT_POMODORO_CONFIG.autoStartBreaks,
    autoStartPomodoros:
      typeof rec.autoStartPomodoros === 'boolean'
        ? rec.autoStartPomodoros
        : DEFAULT_POMODORO_CONFIG.autoStartPomodoros,
    soundAlert:
      typeof rec.soundAlert === 'string' && rec.soundAlert.trim()
        ? rec.soundAlert.trim()
        : DEFAULT_POMODORO_CONFIG.soundAlert,
    tickingSound:
      typeof rec.tickingSound === 'boolean'
        ? rec.tickingSound
        : DEFAULT_POMODORO_CONFIG.tickingSound,
  };
}

export function normalizeBackgroundSettings(raw: unknown): BackgroundSettings {
  if (!raw || typeof raw !== 'object') {
    return { notificationsEnabled: true, wakeLockEnabled: false };
  }
  const rec = raw as Partial<BackgroundSettings>;
  return {
    notificationsEnabled:
      typeof rec.notificationsEnabled === 'boolean' ? rec.notificationsEnabled : true,
    wakeLockEnabled: typeof rec.wakeLockEnabled === 'boolean' ? rec.wakeLockEnabled : false,
  };
}

export function loadSubjects(): SubjectItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) return DEFAULT_SUBJECTS;
    return normalizeSubjects(JSON.parse(raw));
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: SubjectItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(normalizeSubjects(subjects)));
  } catch {
    // ignore
  }
}

export function loadBackgroundSettings(): BackgroundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKGROUND_SETTINGS);
    return raw
      ? normalizeBackgroundSettings(JSON.parse(raw))
      : { notificationsEnabled: true, wakeLockEnabled: false };
  } catch {
    return { notificationsEnabled: true, wakeLockEnabled: false };
  }
}

export function saveBackgroundSettings(settings: BackgroundSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.BACKGROUND_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export interface GuestProfileData {
  displayName: string;
  dailyTargetHours: number;
  primarySubject: string;
  studyLevel: string;
  bio: string;
  avatarSeed: string;
}

export const DEFAULT_GUEST_PROFILE: GuestProfileData = {
  displayName: 'Guest Scholar',
  dailyTargetHours: 4.0,
  primarySubject: 'Mathematics',
  studyLevel: 'Undergraduate',
  bio: 'Focus on the journey. Deep work produces timeless mastery.',
  avatarSeed: 'G',
};

export function loadGuestProfile(): GuestProfileData {
  try {
    const raw = localStorage.getItem('chronos_guest_profile_v1');
    return raw ? { ...DEFAULT_GUEST_PROFILE, ...JSON.parse(raw) } : DEFAULT_GUEST_PROFILE;
  } catch {
    return DEFAULT_GUEST_PROFILE;
  }
}

export function saveGuestProfile(profile: GuestProfileData) {
  try {
    localStorage.setItem('chronos_guest_profile_v1', JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadPersistedAuthSession(): PersistedAuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedAuthSession> | null;
    if (!parsed || typeof parsed.uid !== 'string' || !parsed.uid.trim() || parsed.isAnonymous) {
      return null;
    }
    return {
      uid: parsed.uid.trim(),
      email: typeof parsed.email === 'string' ? parsed.email : '',
      displayName:
        typeof parsed.displayName === 'string' && parsed.displayName.trim()
          ? parsed.displayName.trim()
          : parsed.email?.split('@')[0] || 'Study Scholar',
      photoURL: typeof parsed.photoURL === 'string' && parsed.photoURL ? parsed.photoURL : undefined,
      providerId: typeof parsed.providerId === 'string' ? parsed.providerId : undefined,
      isAnonymous: false,
      dailyTargetHours:
        typeof parsed.dailyTargetHours === 'number' && Number.isFinite(parsed.dailyTargetHours)
          ? parsed.dailyTargetHours
          : undefined,
      primarySubject:
        typeof parsed.primarySubject === 'string' && parsed.primarySubject.trim()
          ? parsed.primarySubject.trim()
          : undefined,
      studyLevel:
        typeof parsed.studyLevel === 'string' && parsed.studyLevel.trim()
          ? parsed.studyLevel.trim()
          : undefined,
      bio: typeof parsed.bio === 'string' ? parsed.bio : undefined,
      signedInAt: typeof parsed.signedInAt === 'number' ? parsed.signedInAt : Date.now(),
      lastVerifiedAt: typeof parsed.lastVerifiedAt === 'number' ? parsed.lastVerifiedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function savePersistedAuthSession(session: PersistedAuthSession): void {
  if (!session || !session.uid || session.isAnonymous) return;
  try {
    localStorage.setItem(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({
        ...session,
        isAnonymous: false,
        lastVerifiedAt: Date.now(),
      })
    );
    localStorage.setItem('chronos_last_auth_uid', session.uid);
  } catch {
    // ignore
  }
}

export function clearPersistedAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem('chronos_last_auth_uid');
  } catch {
    // ignore
  }
}

export function exportAllChronosData(): string {
  try {
    const exportBundle = {
      app: 'Chronos Study Clock',
      version: '1.6',
      exportedAt: new Date().toISOString(),
      sessions: loadDeepWorkSessions(),
      tasks: loadStudyTasks(),
      alarms: loadStoredAlarms(),
      subjects: loadSubjects(),
      pomodoroConfig: loadPomodoroConfig(),
      cities: loadWorldCities(),
      guestProfile: loadGuestProfile(),
      wallet: loadChronosWallet(),
    };
    return JSON.stringify(exportBundle, null, 2);
  } catch {
    return '{}';
  }
}

export function importChronosData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.sessions && Array.isArray(data.sessions)) saveDeepWorkSessions(data.sessions);
    if (data.tasks && Array.isArray(data.tasks)) saveStudyTasks(data.tasks);
    if (data.alarms && Array.isArray(data.alarms)) saveStoredAlarms(data.alarms);
    if (data.subjects && Array.isArray(data.subjects)) saveSubjects(data.subjects);
    if (data.pomodoroConfig) savePomodoroConfig(data.pomodoroConfig);
    if (data.guestProfile) saveGuestProfile(data.guestProfile);
    if (data.wallet) saveChronosWallet(normalizeWallet(data.wallet));
    return true;
  } catch (err) {
    console.error('Failed to import Chronos data:', err);
    return false;
  }
}

export function computeChronosAchievements(
  sessions: DeepWorkSession[],
  tasks: StudyTask[],
  wallet: ChronosWallet,
  streakDays: number,
  dailyGoalHours: number = 4
): AchievementItem[] {
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = totalMinutes / 60;
  const completedSessions = sessions.filter((s) => s.completed);
  const completedTasks = tasks.filter((t) => t.done);
  const distinctSubjects = new Set(sessions.map((s) => s.subject));
  const unlockedStoreCount = wallet.unlockedTracks.filter(
    (t) => t === 'piano' || t === 'lofi' || t === 'cosmic' || t === 'waves'
  ).length;
  const unlockedCosmeticsCount =
    Math.max(0, (wallet.unlockedFrames?.length || 1) - 1) +
    Math.max(0, (wallet.unlockedBackgrounds?.length || 1) - 1) +
    Math.max(0, (wallet.unlockedAvatars?.length || 1) - 1);

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const todayMinutes = sessions
    .filter((s) => s.timestamp >= startOfToday)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const hitDailyGoal = todayMinutes >= dailyGoalHours * 60 && dailyGoalHours > 0;

  const hasEarlyBird = sessions.some((s) => {
    const hour = new Date(s.timestamp).getHours();
    return hour >= 4 && hour < 8;
  });
  const hasNightOwl = sessions.some((s) => {
    const hour = new Date(s.timestamp).getHours();
    return hour >= 22 || hour < 3;
  });

  return [
    {
      id: 'hours_100',
      title: 'The Century Club (100 Hours Studied)',
      badgeLabel: '100 HOURS',
      desc: 'Accumulate 100 verified hours (6,000 minutes) of deep cognitive study',
      category: 'hours',
      tier: 'diamond',
      rarity: 'Mythic',
      pointsReward: 1000,
      iconName: 'Crown',
      unlocked: totalHours >= 100,
      progressPercent: Math.min(100, Math.round((totalHours / 100) * 100)),
      progressText: `${totalHours.toFixed(1)} / 100 hrs (${Math.min(100, Math.round((totalHours / 100) * 100))}%)`,
      isFeatured: true,
    },
    {
      id: 'streak_7_days',
      title: 'Week Warrior (7-Day Streak)',
      badgeLabel: '7-DAY STREAK',
      desc: 'Maintain a 7-day uninterrupted consecutive daily study streak',
      category: 'streak',
      tier: 'gold',
      rarity: 'Legendary',
      pointsReward: 400,
      iconName: 'Flame',
      unlocked: streakDays >= 7,
      progressPercent: Math.min(100, Math.round((streakDays / 7) * 100)),
      progressText: `${streakDays} / 7 consecutive days`,
      isFeatured: true,
    },
    {
      id: 'hours_1',
      title: 'Initiation Hour',
      badgeLabel: '1 HOUR',
      desc: 'Complete your first full hour (60 minutes) of focused study',
      category: 'hours',
      tier: 'bronze',
      rarity: 'Common',
      pointsReward: 50,
      iconName: 'Clock',
      unlocked: totalMinutes >= 60,
      progressPercent: Math.min(100, Math.round((totalMinutes / 60) * 100)),
      progressText: `${totalMinutes} / 60 mins`,
    },
    {
      id: 'hours_10',
      title: 'Tenacious Scholar (10 Hours)',
      badgeLabel: '10 HOURS',
      desc: 'Accumulate 10 hours (600 minutes) of deep cognitive focus',
      category: 'hours',
      tier: 'silver',
      rarity: 'Rare',
      pointsReward: 200,
      iconName: 'Clock',
      unlocked: totalHours >= 10,
      progressPercent: Math.min(100, Math.round((totalHours / 10) * 100)),
      progressText: `${totalHours.toFixed(1)} / 10 hrs`,
    },
    {
      id: 'hours_25',
      title: 'Quarter-Century Focus (25 Hours)',
      badgeLabel: '25 HOURS',
      desc: 'Surpass 25 hours (1,500 minutes) of verified academic deep work',
      category: 'hours',
      tier: 'gold',
      rarity: 'Epic',
      pointsReward: 450,
      iconName: 'Award',
      unlocked: totalHours >= 25,
      progressPercent: Math.min(100, Math.round((totalHours / 25) * 100)),
      progressText: `${totalHours.toFixed(1)} / 25 hrs`,
    },
    {
      id: 'hours_50',
      title: 'Iron Mind (50 Hours)',
      badgeLabel: '50 HOURS',
      desc: 'Surpass 50 hours (3,000 minutes) of verified deep study',
      category: 'hours',
      tier: 'platinum',
      rarity: 'Legendary',
      pointsReward: 750,
      iconName: 'Shield',
      unlocked: totalHours >= 50,
      progressPercent: Math.min(100, Math.round((totalHours / 50) * 100)),
      progressText: `${totalHours.toFixed(1)} / 50 hrs`,
    },
    {
      id: 'streak_3_days',
      title: 'Consistency Spark (3-Day Streak)',
      badgeLabel: '3-DAY STREAK',
      desc: 'Maintain a 3-day consecutive study streak',
      category: 'streak',
      tier: 'bronze',
      rarity: 'Common',
      pointsReward: 150,
      iconName: 'Flame',
      unlocked: streakDays >= 3,
      progressPercent: Math.min(100, Math.round((streakDays / 3) * 100)),
      progressText: `${streakDays} / 3 days`,
    },
    {
      id: 'streak_14_days',
      title: 'Fortnight of Iron Will (14-Day Streak)',
      badgeLabel: '14-DAY STREAK',
      desc: 'Maintain a 14-day continuous daily study streak',
      category: 'streak',
      tier: 'platinum',
      rarity: 'Legendary',
      pointsReward: 600,
      iconName: 'Flame',
      unlocked: streakDays >= 14,
      progressPercent: Math.min(100, Math.round((streakDays / 14) * 100)),
      progressText: `${streakDays} / 14 days`,
    },
    {
      id: 'streak_30_days',
      title: 'Master of Habit (30-Day Streak)',
      badgeLabel: '30-DAY STREAK',
      desc: 'Complete 30 consecutive days of continuous study',
      category: 'streak',
      tier: 'diamond',
      rarity: 'Mythic',
      pointsReward: 1200,
      iconName: 'Zap',
      unlocked: streakDays >= 30,
      progressPercent: Math.min(100, Math.round((streakDays / 30) * 100)),
      progressText: `${streakDays} / 30 days`,
    },
    {
      id: 'sprint_first',
      title: 'First Step to Mastery',
      badgeLabel: '1ST SPRINT',
      desc: 'Complete your first verified Pomodoro sprint',
      category: 'sprint',
      tier: 'bronze',
      rarity: 'Common',
      pointsReward: 50,
      iconName: 'Target',
      unlocked: completedSessions.length >= 1,
      progressPercent: Math.min(100, completedSessions.length >= 1 ? 100 : 0),
      progressText: `${completedSessions.length} / 1 sprint`,
    },
    {
      id: 'sprint_10',
      title: 'Pomodoro Adept (10 Sprints)',
      badgeLabel: '10 SPRINTS',
      desc: 'Complete 10 structured focus sprints',
      category: 'sprint',
      tier: 'silver',
      rarity: 'Rare',
      pointsReward: 150,
      iconName: 'Timer',
      unlocked: completedSessions.length >= 10,
      progressPercent: Math.min(100, Math.round((completedSessions.length / 10) * 100)),
      progressText: `${completedSessions.length} / 10 sprints`,
    },
    {
      id: 'sprint_50',
      title: 'Pomodoro Virtuoso (50 Sprints)',
      badgeLabel: '50 SPRINTS',
      desc: 'Complete 50 structured focus sprints',
      category: 'sprint',
      tier: 'gold',
      rarity: 'Epic',
      pointsReward: 500,
      iconName: 'Sparkles',
      unlocked: completedSessions.length >= 50,
      progressPercent: Math.min(100, Math.round((completedSessions.length / 50) * 100)),
      progressText: `${completedSessions.length} / 50 sprints`,
    },
    {
      id: 'task_5',
      title: 'Task Slayer (5 Tasks)',
      badgeLabel: '5 TASKS',
      desc: 'Design and complete 5 structured study objectives',
      category: 'tasks',
      tier: 'bronze',
      rarity: 'Common',
      pointsReward: 120,
      iconName: 'CheckSquare',
      unlocked: completedTasks.length >= 5,
      progressPercent: Math.min(100, Math.round((completedTasks.length / 5) * 100)),
      progressText: `${completedTasks.length} / 5 tasks`,
    },
    {
      id: 'task_25',
      title: 'Study Architect (25 Tasks)',
      badgeLabel: '25 TASKS',
      desc: 'Complete 25 planned study tasks in the Task Designer',
      category: 'tasks',
      tier: 'platinum',
      rarity: 'Legendary',
      pointsReward: 450,
      iconName: 'Layers',
      unlocked: completedTasks.length >= 25,
      progressPercent: Math.min(100, Math.round((completedTasks.length / 25) * 100)),
      progressText: `${completedTasks.length} / 25 tasks`,
    },
    {
      id: 'scholar_polymath',
      title: 'Polymath Mind',
      badgeLabel: 'POLYMATH',
      desc: 'Log deep work sessions across 3 or more distinct courses',
      category: 'scholar',
      tier: 'silver',
      rarity: 'Rare',
      pointsReward: 200,
      iconName: 'BookOpen',
      unlocked: distinctSubjects.size >= 3,
      progressPercent: Math.min(100, Math.round((distinctSubjects.size / 3) * 100)),
      progressText: `${distinctSubjects.size} / 3 courses`,
    },
    {
      id: 'scholar_daily_goal',
      title: 'Daily Goal Champion',
      badgeLabel: 'DAILY TARGET',
      desc: 'Hit or surpass your configured daily target study hours',
      category: 'scholar',
      tier: 'silver',
      rarity: 'Rare',
      pointsReward: 100,
      iconName: 'CheckCircle2',
      unlocked: hitDailyGoal,
      progressPercent: Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalHours * 60)) * 100)),
      progressText: `${Math.round(todayMinutes)} / ${Math.round(dailyGoalHours * 60)} mins today`,
    },
    {
      id: 'scholar_early_bird',
      title: 'Dawn Scholar',
      badgeLabel: 'EARLY BIRD',
      desc: 'Complete a focused study session between 4:00 AM and 8:00 AM',
      category: 'scholar',
      tier: 'silver',
      rarity: 'Rare',
      pointsReward: 100,
      iconName: 'Sun',
      unlocked: hasEarlyBird,
      progressPercent: hasEarlyBird ? 100 : 0,
      progressText: hasEarlyBird ? 'Unlocked' : 'Study between 4am - 8am',
    },
    {
      id: 'scholar_night_owl',
      title: 'Midnight Philosopher',
      badgeLabel: 'NIGHT OWL',
      desc: 'Log a deep focus sprint after 10:00 PM',
      category: 'scholar',
      tier: 'silver',
      rarity: 'Rare',
      pointsReward: 100,
      iconName: 'Moon',
      unlocked: hasNightOwl,
      progressPercent: hasNightOwl ? 100 : 0,
      progressText: hasNightOwl ? 'Unlocked' : 'Study after 10pm',
    },
    {
      id: 'store_first_track',
      title: 'Grand Store Collector',
      badgeLabel: 'COLLECTOR',
      desc: 'Unlock your first premium soundscape or profile cosmetic in the Chronos Store',
      category: 'store',
      tier: 'bronze',
      rarity: 'Common',
      pointsReward: 150,
      iconName: 'Headphones',
      unlocked: unlockedStoreCount + unlockedCosmeticsCount >= 1,
      progressPercent: Math.min(100, unlockedStoreCount + unlockedCosmeticsCount >= 1 ? 100 : 0),
      progressText: `${unlockedStoreCount + unlockedCosmeticsCount} / 1 item`,
    },
    {
      id: 'store_all_tracks',
      title: 'Study Music Maestro',
      badgeLabel: 'MAESTRO',
      desc: 'Unlock all 4 premium tracks (Calm Piano, Lo-Fi, Cosmic, Waves)',
      category: 'store',
      tier: 'diamond',
      rarity: 'Mythic',
      pointsReward: 600,
      iconName: 'Music',
      unlocked: unlockedStoreCount >= 4,
      progressPercent: Math.min(100, Math.round((unlockedStoreCount / 4) * 100)),
      progressText: `${unlockedStoreCount} / 4 tracks`,
    },
  ];
}

// --- DAILY CHECK-IN STORAGE ---
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDailyCheckIn(raw: unknown): DailyCheckInData | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<DailyCheckInData>;
  const date = typeof candidate.date === 'string' ? candidate.date.trim() : '';
  const focusWord = typeof candidate.focusWord === 'string' ? candidate.focusWord.trim() : '';
  const primaryObjective =
    typeof candidate.primaryObjective === 'string' ? candidate.primaryObjective.trim() : '';
  if (!date || (!focusWord && !primaryObjective)) return null;

  const energy =
    candidate.energyLevel === 'high' ||
    candidate.energyLevel === 'medium' ||
    candidate.energyLevel === 'calm' ||
    candidate.energyLevel === 'tired'
      ? candidate.energyLevel
      : 'high';

  return {
    date,
    focusWord: (focusWord || 'DEEP CLARITY').toUpperCase().slice(0, 32),
    primaryObjective: primaryObjective.slice(0, 280),
    energyLevel: energy,
    completed: Boolean(candidate.completed),
    checkInXpClaimed: Boolean(candidate.checkInXpClaimed),
    objectiveXpClaimed: Boolean(candidate.objectiveXpClaimed),
    reflectionNotes:
      typeof candidate.reflectionNotes === 'string' ? candidate.reflectionNotes.slice(0, 500) : '',
    updatedAt:
      typeof candidate.updatedAt === 'number' && Number.isFinite(candidate.updatedAt)
        ? candidate.updatedAt
        : Date.now(),
  };
}

export function loadTodayCheckIn(): DailyCheckInData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKIN);
    if (!raw) return null;
    const normalized = normalizeDailyCheckIn(JSON.parse(raw));
    const today = getTodayDateString();
    if (normalized && normalized.date === today) {
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDailyCheckIn(data: DailyCheckInData): void {
  try {
    const normalized = normalizeDailyCheckIn(data) || data;
    localStorage.setItem(STORAGE_KEYS.DAILY_CHECKIN, JSON.stringify(normalized));
  } catch {
    // ignore
  }
}

export function clearDailyCheckIn(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DAILY_CHECKIN);
  } catch {
    // ignore
  }
}

export function loadCheckInSnoozeUntil(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKIN_SNOOZE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { until?: number };
    const until = typeof parsed?.until === 'number' ? parsed.until : 0;
    if (until > Date.now()) {
      return until;
    }
    localStorage.removeItem(STORAGE_KEYS.DAILY_CHECKIN_SNOOZE);
    return null;
  } catch {
    return null;
  }
}

export function saveCheckInSnoozeForHours(hours: number): number {
  const safeHours = Math.max(0.5, Math.min(24, hours));
  const until = Date.now() + Math.round(safeHours * 60 * 60 * 1000);
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_CHECKIN_SNOOZE, JSON.stringify({ until }));
  } catch {
    // ignore
  }
  return until;
}

export function clearCheckInSnooze(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DAILY_CHECKIN_SNOOZE);
  } catch {
    // ignore
  }
}

export function formatRemainingSnooze(until: number): string {
  const diffMs = Math.max(0, until - Date.now());
  const totalMins = Math.ceil(diffMs / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export interface GlassThemeMeta {
  id: GlassThemeId;
  name: string;
  shortName: string;
  desc: string;
  mode: 'dark' | 'light';
  swatchBg: string;
  swatchAccent: string;
}

export const GLASS_THEMES_CATALOG: GlassThemeMeta[] = [
  {
    id: 'obsidian-glass',
    name: 'Obsidian Smoked Glass',
    shortName: 'Obsidian',
    desc: 'Deep obsidian canvas with smoked translucent glass panes, warm amber accents & crisp specular rims',
    mode: 'dark',
    swatchBg: '#090b10',
    swatchAccent: '#f59e0b',
  },
  {
    id: 'frosted-crystal',
    name: 'Frosted Crystal Light',
    shortName: 'Crystal Light',
    desc: 'Classic luminous pearl-slate frosted glass with 22px refractive diffusion & deep ink typography',
    mode: 'light',
    swatchBg: '#e9eff7',
    swatchAccent: '#d97706',
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire Glass',
    shortName: 'Sapphire',
    desc: 'Deep celestial navy glass with cobalt refraction and crisp ice-sky chronometer accents',
    mode: 'dark',
    swatchBg: '#070b16',
    swatchAccent: '#38bdf8',
  },
  {
    id: 'emerald-velvet',
    name: 'Emerald Studio Glass',
    shortName: 'Emerald',
    desc: 'Botanical slate glass with muted jade highlights and serene library contrast',
    mode: 'dark',
    swatchBg: '#06110e',
    swatchAccent: '#10b981',
  },
];

export function normalizeGlassTheme(raw?: string): GlassThemeId {
  switch (raw) {
    case 'frosted-crystal':
    case 'frosted-acrylic':
      return 'frosted-crystal';
    case 'midnight-sapphire':
    case 'obsidian-glow':
      return 'midnight-sapphire';
    case 'emerald-velvet':
    case 'deep-minimal':
      return 'emerald-velvet';
    case 'obsidian-glass':
    case 'subtle-glass':
    default:
      return 'obsidian-glass';
  }
}

export const DEFAULT_CUSTOMIZATION: CustomizationSettings = {
  bottomNavTabs: ['clock', 'pomodoro', 'timer', 'stats', 'leaderboard', 'profile'],
  sidebarSections: {
    showQuickTasks: true,
    showDailyProgress: true,
    showAlarmsPreview: true,
    showAmbientControls: true,
    showSystemControls: true,
  },
  glassTheme: 'obsidian-glass',
  favoriteTracks: ['yt-lofi-girl', 'yt-classical', 'rain', 'binaural'],
  favoriteYoutubeIds: [],
};

const LEGACY_DEFAULT_TABS_KEY = 'clock,pomodoro,timer,alarms,profile';

const VALID_CUSTOMIZATION_TABS = new Set<AppTab>([
  'clock',
  'pomodoro',
  'timer',
  'stopwatch',
  'alarms',
  'stats',
  'leaderboard',
  'friends',
  'profile',
  'settings',
  'about',
  'updates',
]);

export function normalizeCustomizationSettings(raw: unknown): CustomizationSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_CUSTOMIZATION;
  const parsed = raw as Partial<CustomizationSettings>;
  const filteredTabs: AppTab[] = Array.isArray(parsed.bottomNavTabs)
    ? parsed.bottomNavTabs.filter((t): t is AppTab => VALID_CUSTOMIZATION_TABS.has(t as AppTab))
    : [];
  let bottomNavTabs: AppTab[] =
    filteredTabs.length >= 3 ? filteredTabs : DEFAULT_CUSTOMIZATION.bottomNavTabs;

  if (bottomNavTabs.join(',') === LEGACY_DEFAULT_TABS_KEY) {
    bottomNavTabs = DEFAULT_CUSTOMIZATION.bottomNavTabs;
  }

  return {
    bottomNavTabs,
    sidebarSections: {
      ...DEFAULT_CUSTOMIZATION.sidebarSections,
      ...(parsed.sidebarSections || {}),
    },
    glassTheme: normalizeGlassTheme(parsed.glassTheme),
    favoriteTracks: Array.isArray(parsed.favoriteTracks)
      ? parsed.favoriteTracks
      : DEFAULT_CUSTOMIZATION.favoriteTracks,
    favoriteYoutubeIds: Array.isArray(parsed.favoriteYoutubeIds)
      ? parsed.favoriteYoutubeIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : [],
  };
}

export function loadCustomizationSettings(): CustomizationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMIZATION);
    if (!raw) return DEFAULT_CUSTOMIZATION;
    return normalizeCustomizationSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_CUSTOMIZATION;
  }
}

export function saveCustomizationSettings(settings: CustomizationSettings): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.CUSTOMIZATION,
      JSON.stringify(normalizeCustomizationSettings(settings))
    );
  } catch {
    // ignore
  }
}

export function loadZenDesignStyle(): ZenDesignStyle {
  try {
    const raw = localStorage.getItem('chronos_zen_design_v1');
    if (
      raw === 'minimal' ||
      raw === 'halo' ||
      raw === 'flip' ||
      raw === 'aurora' ||
      raw === 'warm-paper'
    ) {
      return raw;
    }
    return 'halo';
  } catch {
    return 'halo';
  }
}

export function saveZenDesignStyle(style: ZenDesignStyle): void {
  try {
    localStorage.setItem('chronos_zen_design_v1', style);
  } catch {
    // ignore
  }
}
