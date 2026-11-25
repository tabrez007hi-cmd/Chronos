import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Headphones,
  Layers,
  Shield,
  ShieldCheck,
  Layout,
  Volume2,
  ChevronRight,
  Trophy,
  Palette,
  Clock,
  Crown,
  ShoppingBag,
  BarChart3,
  Users,
  Gift,
  Youtube,
  Cloud,
  Frame,
} from 'lucide-react';
import { AppTab } from '../types';
import { APP_SHORT_VERSION, APP_VERSION } from '../utils/version';

interface VersionUpdatesViewProps {
  onNavigateTab?: (tab: AppTab) => void;
  onOpenStore?: () => void;
  onOpenTaskDesigner?: () => void;
  onOpenUpdateDialog?: () => void;
}

export const VersionUpdatesView: React.FC<VersionUpdatesViewProps> = ({
  onNavigateTab,
  onOpenStore,
  onOpenTaskDesigner,
  onOpenUpdateDialog,
}) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div
        className="relative overflow-hidden rounded-3xl ch-glass-card p-6 sm:p-10"
        style={{ borderColor: 'var(--ch-accent-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold ch-text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Changelog &amp; Release History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight ch-text">
              Version {APP_SHORT_VERSION} Updates
            </h1>
            <p className="text-sm ch-text-secondary max-w-xl leading-relaxed">
              Explore the redesigned lag-free Unified Store, transparent ornate frames &amp;
              illustrated cosmetics, Friends &amp; Gift Mailbox, YouTube focus playlists, and
              cloud-synced Subjects engineered by{' '}
              <strong className="ch-text-accent">Tabrez</strong> in Chronos Study Clock v
              {APP_SHORT_VERSION}.
            </p>
            {onOpenUpdateDialog && (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={onOpenUpdateDialog}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ch-accent-soft text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open v{APP_SHORT_VERSION} Release Summary Dialog</span>
                </button>
              </div>
            )}
          </div>

          <div
            className="flex flex-col items-center sm:items-end shrink-0 p-4 rounded-2xl ch-glass-subtle"
            style={{ borderColor: 'var(--ch-accent-border)' }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider ch-text-muted">
              Current Version
            </span>
            <span className="font-mono text-3xl font-extrabold ch-text-accent tabular-nums">
              v{APP_VERSION}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Latest Release
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Feature Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {onOpenStore && (
          <button
            type="button"
            onClick={onOpenStore}
            className="p-4 rounded-2xl ch-glass-card hover:brightness-105 text-left transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold ch-text">
                  Store
                </h4>
                <p className="text-xs ch-text-muted">
                  Soundscapes, Avatar Frames, Backgrounds &amp; Emblems
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 ch-text-muted group-hover:ch-text-accent transition-colors" />
          </button>
        )}

        {onOpenTaskDesigner && (
          <button
            type="button"
            onClick={onOpenTaskDesigner}
            className="p-4 rounded-2xl ch-glass-card hover:brightness-105 text-left transition-all group flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold ch-text">Task Designer &amp; Planner</h4>
                <p className="text-xs ch-text-muted">Calibrate Pomodoro estimates &amp; earn XP</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 ch-text-muted group-hover:text-emerald-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Detailed Version Timeline */}
      <div className="space-y-6">
        {/* Version 1.6 Card */}
        <div
          className="p-6 rounded-2xl ch-glass-card space-y-4"
          style={{ borderColor: 'var(--ch-accent-border)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b ch-border pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg ch-accent-soft font-mono font-bold text-xs">
                v1.6.0
              </span>
              <h3 className="text-base font-bold ch-text">
                Redesigned Unified Store, Transparent Ornate Frames, Social Gifting &amp; YouTube Audio
              </h3>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
              Current Stable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold ch-text-accent flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Unified Store Redesign &amp; Progressive 12-Item Scroll</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Completely rebuilt Store unifying Frames, Backgrounds, Avatars, and Focus Music.
                Purchased items automatically move out of the shop into your Owned Wardrobe, while
                memoized cards and 12-item progressive loading eliminate scroll lag.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                <Frame className="w-3.5 h-3.5" />
                <span>Illustrated Cosmetics &amp; True Transparent Frames</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Added pre-generated anime scholar avatars, cozy Sakura Twilight &amp; Rainy Study
                Desk banners, and crisp transparent RGBA PNG frames (Sovereign Gold Laurel &amp;
                Azure Celestial Dragon) with built-in copy &amp; drag protection.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-sky-600 dark:text-sky-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Friends Network, 8-Digit Scholar IDs &amp; Gift Mailbox</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Search and add friends using unique 8-digit Scholar IDs or directly from Leaderboard
                profiles. Send Avatar, Frame, or Background gifts using Focus XP and unbox incoming
                gifts with dynamic effects in your Mailbox.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube Background Music, Playlists &amp; Audio Favourites</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Paste &amp; save any YouTube study track URL with auto-repeat, shuffle playback, and
                custom playlists (Deep Focus, Ambient, Lofi), plus curate your own Favourite Focus
                Audio list directly in the Focus sidebar.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5 md:col-span-2">
              <div className="font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud-Synced Subjects, Auto-Rank Sync &amp; Cross-Device Focus Fix</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Custom subjects now persist reliably in Cloud Firestore, Leaderboard ranks sync
                automatically in the background without manual refreshes, and Today&apos;s Focus in
                the sidebar accurately detects study hours logged from any signed-in device.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="px-3.5 py-1.5 rounded-xl ch-btn-primary text-xs cursor-pointer"
              >
                Explore Redesigned Store →
              </button>
            )}
            {onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('friends')}
                  className="px-3.5 py-1.5 rounded-xl ch-btn-secondary font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 ch-text-accent" />
                  <span>Friends &amp; Gifting →</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('leaderboard')}
                  className="px-3.5 py-1.5 rounded-xl ch-btn-secondary font-semibold text-xs cursor-pointer"
                >
                  Open Leaderboard →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('profile')}
                  className="px-3.5 py-1.5 rounded-xl ch-btn-secondary font-semibold text-xs cursor-pointer"
                >
                  Profile &amp; Wardrobe →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Version 1.5 Card */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b ch-border pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg ch-glass-subtle ch-text font-mono font-bold text-xs">
                v1.5.0
              </span>
              <h3 className="text-base font-bold ch-text">
                Tier Divisions, Unified Grand Store &amp; Multi-Horizon Analytics
              </h3>
            </div>
            <span className="text-xs ch-text-muted font-mono">
              Previous Major
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold ch-text-accent flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>38-Division Tier Ladder &amp; Study Levels</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Climb 9 major competitive tiers (Bronze V–I through Heroic V–I, Ace, Ace Master,
                and Conqueror) plus progressive Study Levels (Lv. 1+). Powered strictly by lifetime
                earned XP so spending in the Store never lowers your rank.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-sky-600 dark:text-sky-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Unified Store</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                One storefront for Soundscapes, 22 ornamental &amp; animated Avatar Frames (Zardozi
                embroidery, Tourbillon gear, Kintsugi, Laurel &amp; Conqueror Orrery rings), 22
                bespoke Patterned, Embroidered &amp; Animated Backgrounds, and 22 Vector Emblems
                up to 30,000 XP synced live to your Profile &amp; Leaderboard rows.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Day / Week / Month / Year Trajectory &amp; Insights</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Inspect study consistency across 14-Day, 10-Week, 12-Month, and Multi-Year views
                with interactive bar selection, daily goal line markers, period deltas, and Peak
                Focus Window analytics.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Wallet Isolation, Bug Fixes &amp; Anti-Exploit Guards</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Fixed cross-account wallet bleed with per-account Firestore wallet storage, added
                one-time XP guards on tasks and daily check-ins, synced edited profile names cleanly,
                and enabled live-refreshing alarm countdowns.
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('leaderboard')}
                className="px-3.5 py-1.5 rounded-xl ch-btn-primary text-xs cursor-pointer"
              >
                Open Leaderboard →
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('stats')}
                className="px-3.5 py-1.5 rounded-xl ch-btn-secondary font-semibold text-xs cursor-pointer"
              >
                Open Deep Work Graphs →
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('profile')}
                className="px-3.5 py-1.5 rounded-xl ch-btn-secondary font-semibold text-xs cursor-pointer"
              >
                Open Profile &amp; Tier →
              </button>
            </div>
          )}
        </div>

        {/* Version 1.4 Card */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b ch-border pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg ch-glass-subtle ch-text font-mono font-bold text-xs">
                v1.4.0
              </span>
              <h3 className="text-base font-bold ch-text">
                Classic Glass Redesign, Clock-Synced Timers &amp; Scholar Standings
              </h3>
            </div>
            <span className="text-xs ch-text-muted font-mono">
              Earlier Major
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold ch-text-accent flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Real Wall-Clock Timer Persistence</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Pomodoro, Countdown, and Stopwatch anchor to real system timestamps and persist
                continuously—even if the tab or browser closes, countdowns stop at their exact
                scheduled end time.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-sky-600 dark:text-sky-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>4 Classic Glass Themes + 5 Zen Studio Modes</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Instant theme switcher between Obsidian Glass, Frosted Crystal (Day), Midnight
                Sapphire, and Emerald Velvet, plus 5 fullscreen Zen Mode visual presets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold ch-text-accent flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Daily, Weekly &amp; Yearly Leaderboard</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Compare study focus minutes and earned XP across Daily (all accounts), Weekly (Top
                100), and Yearly (Top 100) periods synced with Cloud Firestore.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Public Scholar Profile Panel &amp; 1 XP/min</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Tap any scholar in Leaderboard to view public stats with strict PII isolation.
                Focused study awards 1 XP per minute across 20 tiered achievement medallions.
              </p>
            </div>
          </div>
        </div>

        {/* Version 1.3 Card */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-4">
          <div className="flex items-center justify-between border-b ch-border pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg ch-glass-subtle ch-text font-mono font-bold text-xs">
                v1.3.0
              </span>
              <h3 className="text-base font-bold ch-text">
                The Focus Music &amp; Task Economy Update
              </h3>
            </div>
            <span className="text-xs ch-text-muted font-mono">Earlier Release</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold ch-text-accent flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                <span>Focus Music Store &amp; Calm Piano</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Generative acoustic piano chords, lo-fi Rhodes electric keyboard, 432Hz deep space
                theta drone, and ocean waves unlocked via Focus XP.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Uninterrupted Background Audio</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Audio continues playing seamlessly when minimized or locked via continuous hardware
                nodes and MediaSession integration.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-sky-600 dark:text-sky-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Structured Task Designer</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Study tasks with priority tags, estimated Pomodoros, due dates, notes, and 1-click
                focus session initiation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ch-glass-subtle space-y-1.5">
              <div className="font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5" />
                <span>Customizable 5-Slot Navigation &amp; Width Fix</span>
              </div>
              <p className="ch-text-secondary leading-relaxed">
                Responsive layout across phone, tablet, and desktop with configurable mobile dock
                shortcuts and workspace companion modules.
              </p>
            </div>
          </div>
        </div>

        {/* Version 1.2 & 1.1 Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl ch-glass-card space-y-2.5">
            <div className="flex items-center justify-between border-b ch-border pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg ch-glass-subtle font-mono font-bold text-xs ch-text">
                  v1.2.0
                </span>
                <h3 className="text-sm font-bold ch-text">Guest Scholar &amp; Horology</h3>
              </div>
            </div>
            <ul className="text-xs ch-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Zero-friction Guest scholar mode with offline persistence.</li>
              <li>Precision vector SVG analog dials with 24h subdial and chrono sweep.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl ch-glass-card space-y-2.5">
            <div className="flex items-center justify-between border-b ch-border pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg ch-glass-subtle font-mono font-bold text-xs ch-text">
                  v1.1.0
                </span>
                <h3 className="text-sm font-bold ch-text">Deep Work &amp; PWA</h3>
              </div>
            </div>
            <ul className="text-xs ch-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Real-time Deep Work progress bar against user-defined daily targets.</li>
              <li>Custom Subject Management with 9 color palettes &amp; standalone PWA install.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Acknowledgement */}
      <div className="text-center pt-4 text-xs ch-text-muted">
        Chronos Productivity Clock · v{APP_VERSION} · Built with craftsmanship by{' '}
        <strong className="ch-text">Tabrez</strong>
      </div>
    </div>
  );
};
