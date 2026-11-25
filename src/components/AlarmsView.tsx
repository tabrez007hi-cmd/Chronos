import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Volume2, RefreshCw } from 'lucide-react';
import { AlarmItem } from '../types';
import { playChime } from '../utils/audio';

interface AlarmsViewProps {
  alarms: AlarmItem[];
  onUpdateAlarms: (alarms: AlarmItem[]) => void;
  is24Hour: boolean;
  onSyncAlarms?: () => void;
  isSyncingAlarms?: boolean;
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmsView: React.FC<AlarmsViewProps> = ({
  alarms,
  onUpdateAlarms,
  is24Hour,
  onSyncAlarms,
  isSyncingAlarms = false,
}) => {
  const [, setMinuteTick] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => setMinuteTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | null>(null);

  const [formTime, setFormTime] = useState<string>('09:00');
  const [formLabel, setFormLabel] = useState<string>('Deep Study Session');
  const [formCategory, setFormCategory] = useState<AlarmItem['category']>('Study');
  const [formDays, setFormDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [formSound, setFormSound] = useState<AlarmItem['sound']>('bowl');
  const [formSnooze, setFormSnooze] = useState<number>(5);

  const getTimeUntil = (alarmTime: string, days: number[]): string => {
    const [ah, am] = alarmTime.split(':').map(Number);
    const now = new Date();
    const currentDay = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const targetMins = ah * 60 + am;

    if (days.length > 0) {
      let minDiffDays = Infinity;
      days.forEach((d) => {
        let dayDiff = (d - currentDay + 7) % 7;
        if (dayDiff === 0 && targetMins <= currentMins) {
          dayDiff = 7;
        }
        if (dayDiff < minDiffDays) {
          minDiffDays = dayDiff;
        }
      });
      const totalMinutesDiff = minDiffDays * 24 * 60 + (targetMins - currentMins);
      const diffHours = Math.floor(totalMinutesDiff / 60);
      const diffMins = totalMinutesDiff % 60;
      if (diffHours === 0) return `Rings in ${diffMins}m`;
      return `Rings in ${diffHours}h ${diffMins}m`;
    } else {
      let diff = targetMins - currentMins;
      if (diff <= 0) diff += 24 * 60;
      const diffHours = Math.floor(diff / 60);
      const diffMins = diff % 60;
      if (diffHours === 0) return `Rings in ${diffMins}m`;
      return `Rings in ${diffHours}h ${diffMins}m`;
    }
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    onUpdateAlarms(updated);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    onUpdateAlarms(updated);
  };

  const handleSaveAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAlarm) {
      const updated = alarms.map((a) =>
        a.id === editingAlarm.id
          ? {
              ...a,
              time: formTime,
              label: formLabel.trim() || 'Study Alarm',
              category: formCategory,
              days: formDays,
              sound: formSound,
              snoozeMinutes: formSnooze,
            }
          : a
      );
      onUpdateAlarms(updated);
    } else {
      const newAlarm: AlarmItem = {
        id: `alm-${Date.now()}`,
        time: formTime,
        label: formLabel.trim() || 'Study Alarm',
        category: formCategory,
        days: formDays,
        enabled: true,
        sound: formSound,
        snoozeMinutes: formSnooze,
      };
      onUpdateAlarms([...alarms, newAlarm]);
    }

    setShowAddModal(false);
    setEditingAlarm(null);
  };

  const openCreateModal = () => {
    setEditingAlarm(null);
    setFormTime('09:00');
    setFormLabel('Deep Study Sprint');
    setFormCategory('Study');
    setFormDays([1, 2, 3, 4, 5]);
    setFormSound('bowl');
    setFormSnooze(5);
    setShowAddModal(true);
  };

  const openEditModal = (alarm: AlarmItem) => {
    setEditingAlarm(alarm);
    setFormTime(alarm.time);
    setFormLabel(alarm.label);
    setFormCategory(alarm.category);
    setFormDays(alarm.days);
    setFormSound(alarm.sound);
    setFormSnooze(alarm.snoozeMinutes);
    setShowAddModal(true);
  };

  const toggleDay = (dayIndex: number) => {
    if (formDays.includes(dayIndex)) {
      setFormDays(formDays.filter((d) => d !== dayIndex));
    } else {
      setFormDays([...formDays, dayIndex].sort());
    }
  };

  const formatAlarmDisplayTime = (time24: string) => {
    if (is24Hour) return { time: time24, ampm: '' };
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return {
      time: `${h.toString().padStart(2, '0')}:${mStr}`,
      ampm,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight ch-text">Study &amp; Focus Alarms</h2>
            <span className="text-xs ch-text-muted">· {alarms.filter((a) => a.enabled).length} Active</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Scheduled alerts for study shifts, practice exams, posture breaks, and morning deep work
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSyncAlarms && (
            <button
              type="button"
              onClick={onSyncAlarms}
              disabled={isSyncingAlarms}
              className="ch-btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-60"
              title="Refresh alarms from cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAlarms ? 'animate-spin ch-text-accent' : ''}`} />
              <span>{isSyncingAlarms ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="ch-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Alarm</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {alarms.length === 0 && (
        <div className="ch-glass-card rounded-3xl p-10 text-center space-y-3">
          <h3 className="text-base font-bold ch-text">No study alarms scheduled</h3>
          <p className="text-xs ch-text-muted max-w-sm mx-auto">
            Create recurring wake-up reminders, exam block alerts, or posture break alarms.
          </p>
          <button
            onClick={openCreateModal}
            className="ch-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Alarm</span>
          </button>
        </div>
      )}

      {/* Alarms Grid */}
      <div className="grid grid-cols-1 @2xl/main:grid-cols-2 gap-4">
        {alarms.map((alarm) => {
          const { time, ampm } = formatAlarmDisplayTime(alarm.time);
          const timeUntil = alarm.enabled ? getTimeUntil(alarm.time, alarm.days) : 'Disabled';

          return (
            <div
              key={alarm.id}
              className={`p-5 rounded-3xl transition-all ${
                alarm.enabled ? 'ch-glass-card' : 'ch-glass-subtle opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight ch-text tabular-nums">
                      {time}
                    </span>
                    {ampm && (
                      <span className="text-xs font-bold ch-text-muted uppercase">{ampm}</span>
                    )}
                  </div>

                  <div className="text-sm font-semibold ch-text mt-1">{alarm.label}</div>

                  <div className="flex items-center gap-2 text-xs ch-text-muted mt-1">
                    <span className="ch-text-accent font-medium">{alarm.category}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] tabular-nums">{timeUntil}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleAlarm(alarm.id)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    alarm.enabled ? 'bg-[var(--ch-accent)] justify-end' : 'bg-black/20 dark:bg-white/15 justify-start'
                  }`}
                  title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t ch-border flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {DAYS_SHORT.map((dayName, idx) => {
                    const isDayActive = alarm.days.includes(idx);
                    return (
                      <span
                        key={dayName}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isDayActive ? 'ch-accent-soft font-bold' : 'ch-text-muted opacity-50'
                        }`}
                      >
                        {dayName[0]}
                      </span>
                    );
                  })}
                  {alarm.days.length === 0 && (
                    <span className="text-[11px] ch-text-muted">Once</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playChime(alarm.sound)}
                    title={`Test tone (${alarm.sound})`}
                    className="p-1.5 ch-text-muted hover:ch-text rounded-lg transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(alarm)}
                    title="Edit alarm"
                    className="px-2 py-1 text-xs ch-text-muted hover:ch-text rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAlarm(alarm.id)}
                    title="Delete alarm"
                    className="p-1.5 ch-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveAlarm}
            className="w-full max-w-md max-h-[92dvh] overflow-y-auto ch-glass-modal rounded-3xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b ch-border pb-3">
              <h4 className="text-base font-bold ch-text">
                {editingAlarm ? 'Edit Study Alarm' : 'New Study Alarm'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs ch-text-muted hover:ch-text"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs ch-text-muted font-semibold block mb-1">Alarm Time</label>
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                required
                className="ch-input w-full px-4 py-3 text-2xl font-mono font-bold rounded-xl tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs ch-text-muted font-semibold block mb-1">Alarm Label</label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. Problem Set Revision..."
                className="ch-input w-full px-3 py-2 text-sm rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs ch-text-muted font-semibold block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as AlarmItem['category'])}
                  className="ch-input w-full px-3 py-2 text-xs rounded-xl"
                >
                  <option value="Study">Study Block</option>
                  <option value="Exam">Exam Simulation</option>
                  <option value="Break">Rest &amp; Hydrate</option>
                  <option value="Morning">Morning Wake</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-xs ch-text-muted font-semibold block mb-1">Alert Sound</label>
                <select
                  value={formSound}
                  onChange={(e) => setFormSound(e.target.value as AlarmItem['sound'])}
                  className="ch-input w-full px-3 py-2 text-xs rounded-xl"
                >
                  <option value="bowl">Tibetan Bowl</option>
                  <option value="chime">Modern Bell</option>
                  <option value="marimba">Warm Marimba</option>
                  <option value="digital">Digital Beep</option>
                  <option value="zen">Zen Harmonic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs ch-text-muted font-semibold block mb-2">Repeat Days</label>
              <div className="flex gap-1.5 justify-between">
                {DAYS_SHORT.map((day, idx) => {
                  const selected = formDays.includes(idx);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                        selected ? 'ch-btn-primary border-transparent' : 'ch-btn-secondary'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold ch-text-muted hover:ch-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ch-btn-primary px-5 py-2 text-xs rounded-xl shadow-sm"
              >
                {editingAlarm ? 'Update Alarm' : 'Save Alarm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
