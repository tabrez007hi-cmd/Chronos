import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Check,
  RotateCcw,
  X,
  Palette,
  Layout,
  Heart,
  Layers,
  Clock,
  Timer,
  Bell,
  BarChart2,
  User as UserIcon,
  Watch,
  Settings as SettingsIcon,
  Info,
  Trophy,
  CheckCircle2,
  Sun,
  Moon,
  Users,
} from 'lucide-react';
import {
  AppTab,
  CustomizationSettings,
  AmbientSoundType,
} from '../types';
import {
  DEFAULT_CUSTOMIZATION,
  FOCUS_TRACKS_CATALOG,
  GLASS_THEMES_CATALOG,
  normalizeGlassTheme,
} from '../utils/storage';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CustomizationSettings;
  onSaveSettings: (settings: CustomizationSettings) => void;
}

const AVAILABLE_TABS: { tab: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { tab: 'clock', label: 'Clock', icon: Clock },
  { tab: 'timer', label: 'Timer', icon: Watch },
  { tab: 'alarms', label: 'Alarms', icon: Bell },
  { tab: 'stats', label: 'Deep Work', icon: BarChart2 },
  { tab: 'leaderboard', label: 'Ranks', icon: Trophy },
  { tab: 'friends', label: 'Friends', icon: Users },
  { tab: 'profile', label: 'Profile', icon: UserIcon },
  { tab: 'stopwatch', label: 'Stopwatch', icon: Watch },
  { tab: 'settings', label: 'Settings', icon: SettingsIcon },
  { tab: 'about', label: 'About', icon: Info },
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'glass' | 'bottomNav' | 'sidebar' | 'favorites'>('glass');
  const [currentDraft, setCurrentDraft] = useState<CustomizationSettings>({
    ...settings,
    glassTheme: normalizeGlassTheme(settings.glassTheme),
  });
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentDraft({
        ...settings,
        glassTheme: normalizeGlassTheme(settings.glassTheme),
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggleTab = (tab: AppTab) => {
    const exists = currentDraft.bottomNavTabs.includes(tab);
    if (exists) {
      if (currentDraft.bottomNavTabs.length <= 3) return;
      setCurrentDraft({
        ...currentDraft,
        bottomNavTabs: currentDraft.bottomNavTabs.filter((t) => t !== tab),
      });
    } else {
      if (currentDraft.bottomNavTabs.length >= 6) return;
      setCurrentDraft({
        ...currentDraft,
        bottomNavTabs: [...currentDraft.bottomNavTabs, tab],
      });
    }
  };

  const handleToggleSidebarSection = (key: keyof CustomizationSettings['sidebarSections']) => {
    setCurrentDraft({
      ...currentDraft,
      sidebarSections: {
        ...currentDraft.sidebarSections,
        [key]: !currentDraft.sidebarSections[key],
      },
    });
  };

  const handleToggleFavoriteTrack = (id: AmbientSoundType) => {
    const isFav = currentDraft.favoriteTracks.includes(id);
    const updated = isFav
      ? currentDraft.favoriteTracks.filter((t) => t !== id)
      : [...currentDraft.favoriteTracks, id];
    setCurrentDraft({
      ...currentDraft,
      favoriteTracks: updated,
    });
  };

  const handleSave = () => {
    onSaveSettings(currentDraft);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 450);
  };

  const handleReset = () => {
    setCurrentDraft({ ...DEFAULT_CUSTOMIZATION });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl ch-glass-modal rounded-2xl sm:rounded-3xl flex flex-col max-h-[95dvh] sm:max-h-[90dvh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b ch-border shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold ch-text-accent">
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Workspace &amp; Classic Glass Customizer</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight ch-text mt-0.5 truncate">
              Personalize Chronos Appearance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b ch-border px-4 sm:px-5 gap-4 overflow-x-auto scrollbar-none ch-glass-subtle border-x-0 border-t-0 shrink-0">
          {[
            { id: 'glass', label: 'Glass Themes', icon: Palette },
            { id: 'bottomNav', label: 'Bottom Taskbar', icon: Layout },
            { id: 'sidebar', label: 'Companion Dock', icon: Layers },
            { id: 'favorites', label: 'Favorite Sounds', icon: Heart },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as typeof activeSubTab)}
                className={`flex items-center gap-1.5 py-3 text-xs font-bold transition-colors border-b-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[var(--ch-accent)] ch-text-accent'
                    : 'border-transparent ch-text-muted hover:ch-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 min-h-0">
          {/* TAB 1: Classic Glass Themes */}
          {activeSubTab === 'glass' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold ch-text">Classic Glass Surface Theme</h3>
                <p className="text-xs ch-text-muted mt-0.5">
                  Choose between luminous Frosted Crystal Light and smoked obsidian/sapphire/emerald glass panes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GLASS_THEMES_CATALOG.map((theme) => {
                  const isSelected = currentDraft.glassTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        const next = { ...currentDraft, glassTheme: theme.id };
                        setCurrentDraft(next);
                        onSaveSettings(next);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected ? 'ch-accent-soft' : 'ch-glass-subtle hover:border-[var(--ch-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-8 h-8 rounded-xl border ch-border-strong shrink-0 flex items-center justify-center shadow-sm"
                            style={{ background: theme.swatchBg }}
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: theme.swatchAccent }}
                            />
                          </span>
                          <span className="text-xs font-bold ch-text truncate">{theme.name}</span>
                        </div>
                        <span className="text-[11px] ch-text-muted flex items-center gap-1 shrink-0">
                          {theme.mode === 'light' ? (
                            <>
                              <Sun className="w-3 h-3" /> Light
                            </>
                          ) : (
                            <>
                              <Moon className="w-3 h-3" /> Dark
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs ch-text-muted leading-relaxed">{theme.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Mobile Bottom Taskbar */}
          {activeSubTab === 'bottomNav' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold ch-text">
                  Mobile Bottom Taskbar ({currentDraft.bottomNavTabs.length}/6 active)
                </h3>
                <p className="text-xs ch-text-muted mt-0.5">
                  Pin 3 to 6 primary destinations to the frosted bottom navigation bar on mobile and tablets.
                </p>
              </div>

              <div className="p-3 ch-glass-subtle rounded-2xl">
                <div className="text-[11px] font-semibold ch-text-muted mb-2">Live Preview</div>
                <div className="flex items-center justify-around py-2 px-1 ch-glass-card rounded-xl">
                  {currentDraft.bottomNavTabs.map((t) => {
                    const found = AVAILABLE_TABS.find((x) => x.tab === t);
                    if (!found) return null;
                    const Icon = found.icon;
                    return (
                      <div key={t} className="flex flex-col items-center ch-text-accent">
                        <Icon className="w-4 h-4 mb-0.5" />
                        <span className="text-[10px] font-semibold">{found.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AVAILABLE_TABS.map((tabItem) => {
                  const Icon = tabItem.icon;
                  const isChecked = currentDraft.bottomNavTabs.includes(tabItem.tab);
                  return (
                    <button
                      key={tabItem.tab}
                      type="button"
                      onClick={() => handleToggleTab(tabItem.tab)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isChecked ? 'ch-accent-soft' : 'ch-glass-subtle ch-text-secondary hover:border-[var(--ch-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-semibold truncate">{tabItem.label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'ch-btn-primary' : 'border ch-border-strong'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Companion Sidebar */}
          {activeSubTab === 'sidebar' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold ch-text">Companion Panel Modules</h3>
                <p className="text-xs ch-text-muted mt-0.5">
                  Choose which utilities appear in your right-hand frosted glass companion dock.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'showDailyProgress' as const,
                    title: 'Daily Study Target & XP Counter',
                    desc: 'Tracks studied minutes today alongside your live Chronos XP balance.',
                  },
                  {
                    key: 'showQuickTasks' as const,
                    title: 'Quick Study Agenda & Checklist',
                    desc: 'Fast inline checkboxes for study tasks and quick sprint creation.',
                  },
                  {
                    key: 'showAmbientControls' as const,
                    title: 'Ambient Soundscape Dock & Volume',
                    desc: 'Quick selectors for rainfall, lo-fi chill, binaural beats, and volume control.',
                  },
                  {
                    key: 'showAlarmsPreview' as const,
                    title: 'Upcoming Study Alarms',
                    desc: 'Displays your next enabled study or break alert.',
                  },
                  {
                    key: 'showSystemControls' as const,
                    title: 'Background Flow & Screen Wake Lock',
                    desc: 'Keep-awake display lock, interval notifications, and Picture-in-Picture.',
                  },
                ].map((sec) => {
                  const isEnabled = currentDraft.sidebarSections[sec.key];
                  return (
                    <div
                      key={sec.key}
                      onClick={() => handleToggleSidebarSection(sec.key)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                        isEnabled ? 'ch-glass-card' : 'ch-glass-subtle opacity-70'
                      }`}
                    >
                      <div className="pr-4">
                        <div className="text-xs font-bold ch-text">{sec.title}</div>
                        <div className="text-[11px] ch-text-muted mt-0.5">{sec.desc}</div>
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                          isEnabled ? 'bg-[var(--ch-accent)]' : 'bg-black/25 dark:bg-white/15'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Favorite Focus Tracks */}
          {activeSubTab === 'favorites' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold ch-text">Favorite Soundscapes</h3>
                <p className="text-xs ch-text-muted mt-0.5">
                  Pin your favorite study tracks in the Focus Music Lounge.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FOCUS_TRACKS_CATALOG.map((track) => {
                  const isFav = currentDraft.favoriteTracks.includes(track.id);
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleToggleFavoriteTrack(track.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        isFav ? 'ch-accent-soft' : 'ch-glass-subtle hover:border-[var(--ch-border-strong)]'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-bold ch-text truncate">{track.title}</div>
                        <div className="text-[11px] ch-text-muted truncate mt-0.5">{track.subtitle}</div>
                      </div>
                      <Heart
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isFav ? 'fill-current ch-text-accent' : 'ch-text-muted'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t ch-border flex items-center justify-between gap-2 ch-glass-subtle border-x-0 border-b-0 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ch-text-muted hover:ch-text rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold ch-text-muted hover:ch-text rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="ch-btn-primary flex items-center gap-1.5 px-5 py-2 text-xs rounded-xl shadow-md"
            >
              {savedNotice ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
