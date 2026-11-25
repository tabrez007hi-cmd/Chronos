import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Clock,
  Volume2,
  Sun,
  Download,
  Upload,
  Info,
  Palette,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { playChime } from '../utils/audio';
import {
  exportAllChronosData,
  importChronosData,
  GLASS_THEMES_CATALOG,
} from '../utils/storage';
import { APP_SHORT_VERSION } from '../utils/version';
import { AppTab, GlassThemeId } from '../types';

interface SettingsViewProps {
  is24Hour: boolean;
  onToggle24Hour: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onResetAllData: () => void;
  onOpenCustomizer?: () => void;
  onOpenUpdateDialog?: () => void;
  glassTheme?: GlassThemeId;
  onSelectGlassTheme?: (id: GlassThemeId) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  is24Hour,
  onToggle24Hour,
  onNavigateTab,
  onResetAllData,
  onOpenCustomizer,
  onOpenUpdateDialog,
  glassTheme = 'obsidian-glass',
  onSelectGlassTheme,
}) => {
  const {
    pomoConfig,
    updatePomoConfig,
    wakeLockEnabled,
    wakeLockMode,
    toggleWakeLock,
    notificationsEnabled,
    toggleNotifications,
  } = useTimer();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  const handleExportDownload = () => {
    const jsonStr = exportAllChronosData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronos_study_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importChronosData(content);
        if (success) {
          setImportStatus('Data successfully restored! Refreshing preferences...');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setImportStatus('Invalid backup file. Please check JSON format.');
        }
      } catch {
        setImportStatus('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Settings Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight ch-text">
              Preferences &amp; Settings
            </h2>
            <span className="text-xs ch-text-accent font-mono">· v{APP_SHORT_VERSION}</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Configure Classic Glass themes, timer rhythms, audio cues, screen behavior, and study backups
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenUpdateDialog && (
            <button
              type="button"
              onClick={onOpenUpdateDialog}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl ch-btn-secondary transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 ch-text-accent" />
              <span>What&apos;s New (v{APP_SHORT_VERSION})</span>
            </button>
          )}
          {onOpenCustomizer && (
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl ch-accent-soft transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Workspace Customizer</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('about')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl ch-btn-secondary cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Chronos</span>
          </button>
        </div>
      </div>

      {/* Grid of Settings Categories */}
      <div className="space-y-6">
        {/* Classic Glass Theme Picker Section */}
        {onSelectGlassTheme && (
          <div className="p-6 rounded-2xl ch-glass-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-bold ch-text">
                <Palette className="w-4 h-4 ch-text-accent" />
                <span>Classic Glass Appearance &amp; Theme</span>
              </div>
              <span className="text-[11px] ch-text-muted font-mono">
                Instant Light &amp; Smoked Glass
              </span>
            </div>

            <div className="grid grid-cols-1 @sm/main:grid-cols-2 @3xl/main:grid-cols-4 gap-3">
              {GLASS_THEMES_CATALOG.map((theme) => {
                const isSelected = theme.id === glassTheme;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onSelectGlassTheme(theme.id)}
                    className={`p-3.5 rounded-2xl text-left transition-all flex flex-col justify-between gap-2.5 border cursor-pointer ${
                      isSelected ? 'ch-accent-soft' : 'ch-glass-subtle hover:brightness-105'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="w-9 h-9 rounded-xl border ch-border flex items-center justify-center shadow-sm"
                        style={{ background: theme.swatchBg }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ background: theme.swatchAccent }}
                        />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold ch-text">{theme.shortName}</div>
                      <div className="text-[10px] ch-text-muted mt-0.5 capitalize">
                        {theme.mode} frosted glass
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 0: UI & Workspace Personalization */}
        {onOpenCustomizer && (
          <div
            className="p-6 rounded-2xl ch-glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderColor: 'var(--ch-accent-border)' }}
          >
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 ch-text-accent" />
                <h3 className="text-sm font-bold ch-text">UI &amp; Taskbar Customizer</h3>
                <span className="text-[10px] font-mono ch-text-accent font-bold">· Flexible</span>
              </div>
              <p className="text-xs ch-text-secondary mt-1 max-w-xl">
                Personalize mobile bottom taskbar navigation icons (3 to 6 destinations), customize
                sidebar companion modules, choose favorite study sounds, and switch glass themes.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="px-4 py-2 text-xs ch-btn-primary rounded-xl shrink-0 cursor-pointer"
            >
              Customize Workspace →
            </button>
          </div>
        )}

        {/* Section 1: Pomodoro Study Interval Timing */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold ch-text">
              <Clock className="w-4 h-4 ch-text-accent" />
              <span>Pomodoro &amp; Study Interval Timing</span>
            </div>
            <span className="text-[11px] ch-text-muted font-mono">Wall-Clock Synced</span>
          </div>

          <div className="grid grid-cols-1 @md/main:grid-cols-3 gap-4">
            <div>
              <label className="text-xs ch-text-muted font-medium block mb-1">
                Focus Sprint (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={Math.round(pomoConfig.focusDuration / 60)}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 25);
                  updatePomoConfig({ ...pomoConfig, focusDuration: val * 60 });
                }}
                className="w-full px-3 py-2 text-sm font-mono ch-input rounded-xl tabular-nums"
              />
              <span className="text-[10px] ch-text-muted mt-1 block">Default: 25 minutes</span>
            </div>

            <div>
              <label className="text-xs ch-text-muted font-medium block mb-1">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.round(pomoConfig.shortBreakDuration / 60)}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 5);
                  updatePomoConfig({ ...pomoConfig, shortBreakDuration: val * 60 });
                }}
                className="w-full px-3 py-2 text-sm font-mono ch-input rounded-xl tabular-nums"
              />
              <span className="text-[10px] ch-text-muted mt-1 block">Default: 5 minutes</span>
            </div>

            <div>
              <label className="text-xs ch-text-muted font-medium block mb-1">
                Long Break (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={Math.round(pomoConfig.longBreakDuration / 60)}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 15);
                  updatePomoConfig({ ...pomoConfig, longBreakDuration: val * 60 });
                }}
                className="w-full px-3 py-2 text-sm font-mono ch-input rounded-xl tabular-nums"
              />
              <span className="text-[10px] ch-text-muted mt-1 block">Default: 15 minutes</span>
            </div>
          </div>

          <div className="pt-3 border-t ch-border space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold ch-text">Auto-start Breaks</div>
                <div className="text-[11px] ch-text-muted">
                  Begin rest countdown immediately when focus sprint ends
                </div>
              </div>
              <input
                type="checkbox"
                checked={pomoConfig.autoStartBreaks}
                onChange={(e) =>
                  updatePomoConfig({ ...pomoConfig, autoStartBreaks: e.target.checked })
                }
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--ch-accent)' }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold ch-text">Soft Second Ticking Cue</div>
                <div className="text-[11px] ch-text-muted">
                  Subtle synthesized pace cue during deep focus
                </div>
              </div>
              <input
                type="checkbox"
                checked={pomoConfig.tickingSound}
                onChange={(e) =>
                  updatePomoConfig({ ...pomoConfig, tickingSound: e.target.checked })
                }
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--ch-accent)' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Audio & Alert Chimes */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold ch-text">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Completion Alerts &amp; Acoustic Chimes</span>
            </div>
            <span className="text-[11px] ch-text-muted font-mono">Web Audio API</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold ch-text">Interval Completion Sound</div>
              <div className="text-[11px] ch-text-muted">
                Acoustic bell chime played when a timer or sprint finishes
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={pomoConfig.soundAlert}
                onChange={(e) => updatePomoConfig({ ...pomoConfig, soundAlert: e.target.value })}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-xs ch-input rounded-xl"
              >
                <option value="bowl">Tibetan Singing Bowl</option>
                <option value="chime">Modern Bell Chime</option>
                <option value="marimba">Warm Marimba</option>
                <option value="digital">Digital Alarm</option>
                <option value="zen">Zen Temple Gong</option>
              </select>
              <button
                type="button"
                onClick={() => playChime(pomoConfig.soundAlert)}
                className="px-3 py-1.5 text-xs ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer"
              >
                Test Sound
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Screen & Background Persistence */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold ch-text">
              <Sun className="w-4 h-4 ch-text-accent" />
              <span>Screen Behavior &amp; Background Alerts</span>
            </div>
            <span className="text-[11px] ch-text-muted font-mono">Device APIs</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold ch-text">
                  Keep Screen Awake (WakeLock API)
                </div>
                <div className="text-[11px] ch-text-muted">
                  Prevents tablet, phone, or laptop display from sleeping during study sessions
                </div>
              </div>
              <button
                type="button"
                onClick={toggleWakeLock}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  wakeLockEnabled ? 'ch-accent-soft' : 'ch-btn-secondary'
                }`}
              >
                {wakeLockEnabled
                  ? `Active (${wakeLockMode === 'native' ? 'Native Awake' : 'Compat Awake'})`
                  : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold ch-text">
                  Background Tab Notifications
                </div>
                <div className="text-[11px] ch-text-muted">
                  Send desktop alerts when study sprints complete while reading PDFs or in another tab
                </div>
              </div>
              <button
                type="button"
                onClick={toggleNotifications}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap cursor-pointer ${
                  notificationsEnabled
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                    : 'ch-btn-secondary'
                }`}
              >
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold ch-text">
                  Time Format (Clock &amp; Alarms)
                </div>
                <div className="text-[11px] ch-text-muted">
                  Toggle between 24-hour military and 12-hour AM/PM format
                </div>
              </div>
              <button
                type="button"
                onClick={onToggle24Hour}
                className="px-3 py-1.5 text-xs font-semibold ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer"
              >
                {is24Hour ? '24-Hour (14:30)' : '12-Hour (2:30 PM)'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Study Data Backup & Restore */}
        <div className="p-6 rounded-2xl ch-glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold ch-text">
              <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Data Backup, Export &amp; Import</span>
            </div>
            <span className="text-[11px] ch-text-muted font-mono">JSON Portability</span>
          </div>

          <p className="text-xs ch-text-secondary leading-relaxed">
            Your study sessions, alarms, subjects, and timer configurations are stored locally and in
            Cloud Firestore. Export your entire study record to a standalone JSON file anytime to
            transfer between devices.
          </p>

          {importStatus && (
            <div className="p-3 rounded-xl ch-glass-subtle text-xs ch-text flex items-center gap-2">
              <Info className="w-4 h-4 ch-text-accent shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{copiedExport ? 'Downloaded Backup!' : 'Export Study Backup (JSON)'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Restore from Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Section 5: Clean Slate Reset */}
        <div className="p-6 rounded-2xl ch-glass-subtle space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold ch-text">Start from Zero / Clean Slate</h4>
              <p className="text-[11px] ch-text-muted mt-0.5">
                Reset all logged focus minutes, streaks, custom alarms, and tasks back to zero.
              </p>
            </div>

            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="px-3.5 py-1.5 text-xs ch-btn-secondary hover:text-rose-500 rounded-xl whitespace-nowrap cursor-pointer"
              >
                Reset to Zero Baseline
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setShowConfirmReset(false);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2.5 py-1.5 text-xs ch-text-muted hover:ch-text cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Version Footer */}
        <div className="text-center pt-2 text-xs ch-text-muted">
          Chronos Study Clock · Version {APP_SHORT_VERSION} · Designed &amp; Crafted by{' '}
          <strong className="ch-text">Tabrez</strong>
        </div>
      </div>
    </div>
  );
};
