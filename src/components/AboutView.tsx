import React from 'react';
import {
  Clock,
  Sparkles,
  Code2,
  Cpu,
  CheckCircle2,
  Zap,
  Award,
  Headphones,
  Coins,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl ch-glass-card p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold ch-text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Release · Version 1.6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight ch-text">
              Chronos Study &amp; Productivity Clock
            </h1>
            <p className="text-sm ch-text-secondary max-w-xl leading-relaxed">
              An uncompromising, distraction-free study environment combining Swiss horological
              craftsmanship with deep work cognitive tracking, 38-division competitive Tier &amp;
              Study Level progression, Redesigned Unified Store with illustrated cosmetics &amp;
              transparent frames, Friends &amp; Gift Mailbox, YouTube focus playlists, and cloud sync.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end shrink-0 p-4 rounded-2xl ch-glass-subtle">
            <span className="text-[11px] font-mono uppercase tracking-wider ch-text-muted">
              Release Build
            </span>
            <span className="font-mono text-2xl font-bold ch-text-accent tabular-nums">
              v1.6.0
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Production Ready
            </span>
          </div>
        </div>
      </div>

      {/* Developer Spotlight: Tabrez */}
      <div
        className="rounded-3xl ch-glass-card p-6 sm:p-8 relative overflow-hidden"
        style={{ borderColor: 'var(--ch-accent-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl ch-accent-soft flex items-center justify-center shrink-0">
            <span className="font-mono text-3xl font-black tracking-tighter">T</span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold ch-text">Tabrez</h2>
              <span className="text-xs font-semibold ch-text-accent">
                · Lead Creator &amp; Software Engineer
              </span>
            </div>
            <p className="text-xs ch-text-secondary leading-relaxed">
              Designed, architected, and built by <strong className="ch-text">Tabrez</strong> with a
              dedicated mission to give students, researchers, and engineers a calm, focused, and
              mathematically precise study instrument.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs ch-text-muted">
              <span className="flex items-center gap-1 ch-text-secondary">
                <Code2 className="w-3.5 h-3.5 ch-text-accent" /> Full-Stack Architecture
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 ch-text-secondary">
                <Clock className="w-3.5 h-3.5 ch-text-accent" /> Horological Engineering
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 ch-text-secondary">
                <Zap className="w-3.5 h-3.5 ch-text-accent" /> Zero-Distraction UX
              </span>
            </div>
          </div>
        </div>

        {/* Developer Note */}
        <div className="mt-6 pt-5 border-t ch-border text-xs ch-text-secondary leading-relaxed italic ch-glass-subtle p-4 rounded-xl">
          &ldquo;Chronos was born out of the frustration with bloated study tools that force
          constant sign-in popups, nag for subscriptions, or lose timer accuracy when closing tabs.
          In Chronos v1.6, every hour focused rewards real competitive rank across 38 tier divisions,
          unlocks illustrated portraits, banners, and transparent ornate frames in a fast unified
          Store, lets you gift friends and curate YouTube study playlists, and syncs effortlessly
          across devices.&rdquo;
          <div className="text-right not-italic font-bold ch-text-accent mt-2">— Tabrez</div>
        </div>
      </div>

      {/* Version 1.6 Release Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 ch-text-accent" />
            <h3 className="text-base font-bold ch-text">Version 1.6 Major Release Highlights</h3>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('updates')}
              className="text-xs ch-text-accent hover:underline font-semibold cursor-pointer"
            >
              View Full Changelog →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl ch-glass-card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold ch-text-accent">
              <Award className="w-4 h-4" />
              <span>Unified Store, Transparent Frames &amp; Wardrobe</span>
            </div>
            <p className="text-xs ch-text-secondary leading-relaxed">
              Redesigned lag-free storefront with 12-item progressive scroll, hidden owned items,
              illustrated anime portraits &amp; cozy banners, true transparent ornate PNG frames,
              asset copy protection, and an Owned Wardrobe.
            </p>
          </div>

          <div className="p-4 rounded-2xl ch-glass-card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              <Zap className="w-4 h-4" />
              <span>Friends Network, 8-Digit IDs &amp; Gift Mailbox</span>
            </div>
            <p className="text-xs ch-text-secondary leading-relaxed">
              Add study partners via unique 8-digit Scholar IDs or Leaderboard profiles, send
              cosmetic gifts using Focus XP, and unbox incoming gifts inside an animated Mailbox.
            </p>
          </div>

          <div className="p-4 rounded-2xl ch-glass-card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
              <Headphones className="w-4 h-4" />
              <span>YouTube Focus Playlists &amp; Audio Favourites</span>
            </div>
            <p className="text-xs ch-text-secondary leading-relaxed">
              Stream and save YouTube study URLs with auto-repeat, shuffle mode, and custom
              playlists (Deep Focus, Ambient, Lofi), plus curate your sidebar Favourite Audio list.
            </p>
          </div>

          <div className="p-4 rounded-2xl ch-glass-card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-300">
              <Coins className="w-4 h-4" />
              <span>Cloud Subjects, Auto-Rank Sync &amp; Cross-Device Focus</span>
            </div>
            <p className="text-xs ch-text-secondary leading-relaxed">
              Subjects persist in Cloud Firestore, Leaderboard ranks sync automatically, and
              Today&apos;s Focus accurately tracks study hours logged across all signed-in devices.
            </p>
          </div>
        </div>
      </div>

      {/* Engineering & Technology Stack */}
      <div className="p-6 rounded-2xl ch-glass-card space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 ch-text-accent" />
          <h3 className="text-base font-bold ch-text">Engineering &amp; Modern Web APIs</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">React 19 &amp; TS</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Strict typed UI components</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">Tailwind CSS v4</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Zero runtime overhead</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">Web Audio API</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Generative acoustic piano</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">MediaSession API</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Persistent background playback</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">Screen WakeLock</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Keep screen awake</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">PWA Fullscreen</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Homescreen installable</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">Document PiP</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Floating mini window</div>
          </div>
          <div className="p-3 rounded-xl ch-glass-subtle">
            <div className="font-semibold ch-text">Cloud Firestore</div>
            <div className="text-[11px] ch-text-muted mt-0.5">Persistent study sync</div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-4 text-xs ch-text-muted">
        Chronos Study &amp; Productivity Clock · Version 1.6 · Handcrafted by{' '}
        <strong className="ch-text">Tabrez</strong>
      </div>
    </div>
  );
};
