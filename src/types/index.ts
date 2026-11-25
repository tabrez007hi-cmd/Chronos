export type AppTab =
  | 'clock'
  | 'pomodoro'
  | 'timer'
  | 'stopwatch'
  | 'alarms'
  | 'stats'
  | 'leaderboard'
  | 'friends'
  | 'profile'
  | 'settings'
  | 'about'
  | 'updates';

export type ZenDesignStyle = 'minimal' | 'halo' | 'flip' | 'aurora' | 'warm-paper';

export type CosmeticRarity = 'Starter' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type FrameOrnamentKey =
  | 'none'
  | 'battlement'
  | 'sakura'
  | 'crystal'
  | 'zardozi'
  | 'viper'
  | 'tourbillon'
  | 'titanium'
  | 'kintsugi'
  | 'crimson'
  | 'crown'
  | 'laurel'
  | 'circuit'
  | 'jaali'
  | 'nebula'
  | 'nova'
  | 'astrolabe'
  | 'conqueror'
  | 'anim-chrono'
  | 'anim-aurora'
  | 'anim-inferno'
  | 'anim-orrery'
  | 'carrom-maharaja'
  | 'carrom-queen'
  | 'carrom-champ'
  | 'ff-heroic'
  | 'ff-booyah'
  | 'ff-cobra'
  | 'anim-ff-grandmaster'
  | 'anim-carrom-imperium'
  | 'pack-laurel-crown'
  | 'pack-amethyst-shard'
  | 'pack-azure-dragon'
  | 'pack-sakura-wreath'
  | 'pack-crescent-cloud'
  | 'pack-forest-vine'
  | 'pack-cyber-cyan'
  | 'pack-inferno-flame'
  | 'pack-valkyrie-wing'
  | 'pack-saturn-cosmos';

export type BannerArtworkKey =
  | 'none'
  | 'blueprint'
  | 'sakura'
  | 'zardozi'
  | 'horology'
  | 'kintsugi'
  | 'aurora'
  | 'circuit'
  | 'damask'
  | 'citadel'
  | 'artdeco'
  | 'jaali'
  | 'observatory'
  | 'glacier'
  | 'botanical'
  | 'damascus'
  | 'singularity'
  | 'eclipse'
  | 'anim-quantum'
  | 'anim-boreal'
  | 'anim-forge'
  | 'anim-cosmos'
  | 'carrom-arena'
  | 'ff-booyah-zone'
  | 'focus-observatory'
  | 'ff-cobra-temple'
  | 'anim-booyah-inferno'
  | 'anim-carrom-palace'
  | 'pack-bg-alpine-sunrise'
  | 'pack-bg-rainy-study'
  | 'pack-bg-twilight-dome'
  | 'pack-bg-sakura-breeze'
  | 'pack-bg-milkyway-comet'
  | 'pack-bg-forest-stream'
  | 'pack-bg-fullmoon-clouds'
  | 'pack-bg-warm-library'
  | 'pack-bg-autumn-maple'
  | 'pack-bg-dusk-peaks';

export interface StoreFrameItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: CosmeticRarity;
  costPoints: number;
  ringBackground: string;
  glowShadow: string;
  ornamentKey?: FrameOrnamentKey;
  badgeLabel?: string;
  badgeColor: string;
  isAnimated?: boolean;
  noSpinRing?: boolean;
  imageUrl?: string;
  imageScale?: number;
}

export interface StoreBackgroundItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: CosmeticRarity;
  costPoints: number;
  gradientCss: string;
  patternCss?: string;
  artworkKey?: BannerArtworkKey;
  accentHex: string;
  badgeLabel?: string;
  isAnimated?: boolean;
  imageUrl?: string;
  imagePosition?: string;
}

export interface StoreAvatarItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: CosmeticRarity;
  costPoints: number;
  bgCss: string;
  accentHex: string;
  isAnimated?: boolean;
  isPortrait?: boolean;
  imageUrl?: string;
  imageScale?: number;
  emblemKey:
    | 'default'
    | 'owl'
    | 'chronomancer'
    | 'knight'
    | 'phoenix'
    | 'wolf'
    | 'samurai'
    | 'dragon'
    | 'compass'
    | 'falcon'
    | 'lion'
    | 'celestial'
    | 'lotus'
    | 'alchemist'
    | 'spartan'
    | 'kitsune'
    | 'pegasus'
    | 'griffin'
    | 'anim-chronocore'
    | 'anim-reactor'
    | 'anim-phoenixfire'
    | 'anim-singularity'
    | 'face-scholar'
    | 'face-booyah'
    | 'face-maharaja'
    | 'face-kunoichi'
    | 'face-chrono-hacker'
    | 'carrom-queen'
    | 'ff-heroic-wing'
    | 'focus-mandala'
    | 'anim-face-alok'
    | 'anim-booyah-dragon'
    | 'pack-av-sunset-traveler'
    | 'pack-av-desk-writer'
    | 'pack-av-moonlit-peak'
    | 'pack-av-bloodmoon-shinobi'
    | 'pack-av-sky-dreamer'
    | 'pack-av-twilight-citadel'
    | 'pack-av-cyber-skyline'
    | 'pack-av-sakura-reader'
    | 'pack-av-clinical-scholar'
    | 'pack-av-milkyway-gazer';
}

export interface ScholarTierStep {
  id: string;
  majorTier: string;
  tier: string;
  title: string;
  minPoints: number;
  maxPoints: number | null;
  accentHex: string;
  badgeColor: string;
  gradientClass: string;
}

export interface ScholarRankInfo {
  title: string;
  tier: string;
  majorTier: string;
  division: string;
  badgeColor: string;
  accentHex: string;
  gradientClass: string;
  progressPercent: number;
  nextTierPoints: number;
  nextTierLabel: string;
  currentTierFloor: number;
  level: number;
  levelProgressPercent: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export interface PublicLeaderboardEntry {
  userId: string;
  scholarId?: string;
  isPublic: boolean;
  displayName: string;
  photoURL?: string;
  studyLevel: string;
  primarySubject: string;
  bio: string;
  focusWord?: string;
  rankTitle: string;
  rankTier: string;
  equippedFrame?: string;
  equippedBackground?: string;
  equippedAvatar?: string;
  totalPointsEarned: number;
  totalMinutes: number;
  streakDays: number;
  unlockedBadgesCount: number;
  dayKey: string;
  dailyMinutes: number;
  dailyPoints: number;
  weekKey: string;
  weeklyMinutes: number;
  weeklyPoints: number;
  yearKey: string;
  yearlyMinutes: number;
  yearlyPoints: number;
  isGuest: boolean;
  updatedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  dailyTargetHours: number;
  primarySubject: string;
  studyLevel?: string;
  bio?: string;
  isGuest?: boolean;
  createdAt?: string;
  customSubjects?: SubjectItem[];
}

export interface PersistedAuthSession {
  uid: string;
  scholarId?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId?: string;
  isAnonymous: boolean;
  dailyTargetHours?: number;
  primarySubject?: string;
  studyLevel?: string;
  bio?: string;
  signedInAt: number;
  lastVerifiedAt: number;
}

export type SubjectColor =
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'orange'
  | 'teal';

export interface SubjectItem {
  id: string;
  name: string;
  color: SubjectColor;
  isDefault?: boolean;
}

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroConfig {
  focusDuration: number; // in seconds (default 25 * 60)
  shortBreakDuration: number; // in seconds (default 5 * 60)
  longBreakDuration: number; // in seconds (default 15 * 60)
  longBreakInterval: number; // number of focus sessions before long break (default 4)
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundAlert: string;
  tickingSound: boolean;
}

export interface DeepWorkSession {
  id: string;
  timestamp: number; // epoch ms
  durationMinutes: number;
  phase: PomodoroPhase | 'countdown' | 'stopwatch';
  subject: string;
  notes?: string;
  completed: boolean;
  pointsEarned?: number;
}

export interface AlarmItem {
  id: string;
  time: string; // "HH:MM" 24h format
  label: string;
  category: 'Study' | 'Exam' | 'Break' | 'Morning' | 'Custom';
  days: number[]; // 0 = Sun, 1 = Mon, ... 6 = Sat. Empty = Once
  enabled: boolean;
  sound: 'chime' | 'bowl' | 'digital' | 'marimba' | 'zen';
  snoozeMinutes: number;
}

export interface StopwatchLap {
  id: string;
  lapNumber: number;
  lapDurationMs: number;
  totalTimeMs: number;
  note?: string;
}

export interface WorldClockCity {
  id: string;
  name: string;
  country: string;
  timezone: string;
}

export type ClockStyle = 'minimal' | 'modern' | 'flip' | 'oled' | 'analog';

export type AnalogTheme = 'obsidian' | 'flieger' | 'bauhaus';

export type AmbientSoundType =
  | 'off'
  | 'yt-lofi-girl'
  | 'yt-classical'
  | 'yt-synthwave'
  | 'yt-alpha-focus'
  | 'yt-rain-thunder'
  | 'yt-chillhop'
  | 'yt-cafe-jazz'
  | 'yt-fireplace-rain'
  | 'yt-ghibli-piano'
  | 'yt-dark-academia'
  | 'yt-brown-noise'
  | 'yt-japanese-lofi'
  | 'yt-custom'
  | 'rain'
  | 'whitenoise'
  | 'pinknoise'
  | 'binaural'
  | 'cafe'
  | 'forest'
  | 'piano'
  | 'lofi'
  | 'cosmic'
  | 'waves';

export const DEFAULT_YOUTUBE_PLAYLISTS = ['Deep Focus', 'Ambient', 'Lofi'] as const;

export interface CustomYoutubeTrack {
  videoId: string;
  title: string;
}

export interface SavedCustomYoutubeTrack {
  id: string;
  videoId: string;
  title: string;
  url: string;
  playlist?: string;
  savedAt: number;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  done: boolean;
  rewardClaimed?: boolean;
  priority?: TaskPriority;
  description?: string;
  dueDate?: string;
  createdAt?: number;
}

export interface BackgroundSettings {
  notificationsEnabled: boolean;
  wakeLockEnabled: boolean;
}

export interface ChronosWallet {
  points: number;
  totalPointsEarned: number;
  unlockedTracks: AmbientSoundType[];
  unlockedFrames: string[];
  unlockedBackgrounds: string[];
  unlockedAvatars: string[];
  equippedFrame: string;
  equippedBackground: string;
  equippedAvatar: string;
}

export interface FocusMusicTrack {
  id: AmbientSoundType;
  title: string;
  subtitle: string;
  description: string;
  category:
    | 'YouTube Focus'
    | 'Acoustic Piano'
    | 'Lo-Fi Chill'
    | 'Cosmic Drone'
    | 'Nature & Waves'
    | 'Neuro-Alpha'
    | 'Background Noise';
  sourceType?: 'youtube' | 'synth';
  youtubeId?: string;
  fallbackYoutubeIds?: string[];
  channel?: string;
  costPoints: number;
  bpm?: number;
  tags: string[];
}

export interface DailyCheckInData {
  date: string; // YYYY-MM-DD
  focusWord: string;
  primaryObjective: string;
  completed?: boolean;
  checkInXpClaimed?: boolean;
  objectiveXpClaimed?: boolean;
  reflectionNotes?: string;
  energyLevel?: 'high' | 'medium' | 'calm' | 'tired';
  updatedAt: number;
}

export type GlassThemeId =
  | 'obsidian-glass'
  | 'frosted-crystal'
  | 'midnight-sapphire'
  | 'emerald-velvet';

export interface CustomizationSettings {
  bottomNavTabs: AppTab[]; // Custom ordered 3 to 6 tabs for mobile bottom bar
  sidebarSections: {
    showQuickTasks: boolean;
    showDailyProgress: boolean;
    showAlarmsPreview: boolean;
    showAmbientControls: boolean;
    showSystemControls: boolean;
  };
  glassTheme: GlassThemeId;
  favoriteTracks: AmbientSoundType[];
  favoriteYoutubeIds?: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  badgeLabel: string;
  desc: string;
  category: 'hours' | 'streak' | 'sprint' | 'scholar' | 'tasks' | 'store';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  pointsReward: number;
  iconName: string;
  unlocked: boolean;
  progressText: string;
  progressPercent: number; // 0 - 100
  unlockedAt?: string;
  isFeatured?: boolean;
}

export type GiftItemCategory = 'frame' | 'background' | 'avatar';

export interface FriendRequestItem {
  requestId: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  toName: string;
  fromScholarId: string;
  toScholarId: string;
  fromFrame?: string;
  fromAvatar?: string;
  fromPrimarySubject?: string;
  fromRankTier?: string;
  toFrame?: string;
  toAvatar?: string;
  toPrimarySubject?: string;
  toRankTier?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FriendshipItem {
  friendshipId: string;
  userA: string;
  userB: string;
  memberUids: [string, string];
  requestId: string;
  userAName?: string;
  userBName?: string;
  userAScholarId?: string;
  userBScholarId?: string;
  createdAt?: unknown;
}

export interface GiftItem {
  giftId: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  toName: string;
  fromScholarId: string;
  toScholarId: string;
  fromFrame?: string;
  fromAvatar?: string;
  itemCategory: GiftItemCategory;
  itemId: string;
  itemName: string;
  itemRarity: CosmeticRarity;
  costPoints: number;
  message: string;
  status: 'unclaimed' | 'claimed';
  createdAt?: unknown;
  claimedAt?: unknown;
}
