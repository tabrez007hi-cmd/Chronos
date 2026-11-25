import React, { useState, useMemo } from 'react';
import {
  Flame,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Download,
  Trash2,
  CheckCircle,
  Filter,
  BookOpen,
  Plus,
  Minus,
  Award,
  Activity,
  TrendingUp,
  Sun,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { DeepWorkSession, SubjectItem } from '../types';
import { getSubjectStyle } from '../utils/storage';
import { useTimer } from '../context/TimerContext';

interface DeepWorkStatsViewProps {
  sessions: DeepWorkSession[];
  onClearSessions: () => void;
  onDeleteSession: (id: string) => void;
  dailyGoalHours: number;
  onUpdateDailyGoal: (hours: number) => void;
  subjects: SubjectItem[];
  onOpenSubjectManager: () => void;
  onSyncSessions?: () => void;
  onLoadMoreCloudSessions?: () => void;
  hasMoreCloudSessions?: boolean;
  isSyncingSessions?: boolean;
}

type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface GraphBucket {
  id: string;
  shortLabel: string;
  subLabel: string;
  fullLabel: string;
  minutes: number;
  hours: number;
  sessionCount: number;
  isCurrent: boolean;
}

export const DeepWorkStatsView: React.FC<DeepWorkStatsViewProps> = ({
  sessions,
  onClearSessions: _onClearSessions,
  onDeleteSession,
  dailyGoalHours,
  onUpdateDailyGoal,
  subjects,
  onOpenSubjectManager,
  onSyncSessions,
  onLoadMoreCloudSessions,
  hasMoreCloudSessions = false,
  isSyncingSessions = false,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [graphPeriod, setGraphPeriod] = useState<AnalyticsPeriod>('daily');
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState<number>(30);

  const {
    activeMode,
    activeSubject,
    pomoPhase,
    pomoTotalSeconds,
    pomoTimeLeft,
    pomoIsRunning,
    countTotalSeconds,
    countTimeLeft,
    countIsRunning,
    swElapsedMs,
    swIsRunning,
  } = useTimer();

  // Memoized historical & daily aggregates (unaffected by per-second live timer ticks)
  const {
    todaySessions,
    todayTotalMins,
    todayHours,
    last7DaysMinutes,
    totalAllTimeMins,
    subjectList,
    todaySubjectMap,
    currentStreak,
    filteredSessions,
    bucketsByPeriod,
    efficiencyStats,
  } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todaySess = sessions.filter((s) => s.timestamp >= startOfToday);
    const todayMins = todaySess.reduce((acc, s) => acc + s.durationMinutes, 0);
    const todayHrs = (todayMins / 60).toFixed(1);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // 7-day rolling mins for KPI card
    const sevenDaysStart = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const sevenDaysMins = sessions
      .filter((s) => s.timestamp >= sevenDaysStart)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // 1) Daily buckets (last 14 days, day after day)
    const dailyBuckets: GraphBucket[] = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i));
      const dayStart = d.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const matched = sessions.filter((s) => s.timestamp >= dayStart && s.timestamp < dayEnd);
      const mins = matched.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        id: `day-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        shortLabel: i === 13 ? 'Today' : `${d.getDate()}`,
        subLabel: daysOfWeek[d.getDay()],
        fullLabel: d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        minutes: mins,
        hours: +(mins / 60).toFixed(1),
        sessionCount: matched.length,
        isCurrent: i === 13,
      };
    });

    // 2) Weekly buckets (last 10 calendar weeks, Mon - Sun)
    const dayOfWeekMon0 = (now.getDay() + 6) % 7;
    const currentWeekMon = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOfWeekMon0
    );
    const weeklyBuckets: GraphBucket[] = Array.from({ length: 10 }).map((_, i) => {
      const weekStartDate = new Date(
        currentWeekMon.getFullYear(),
        currentWeekMon.getMonth(),
        currentWeekMon.getDate() - (9 - i) * 7
      );
      const weekStart = weekStartDate.getTime();
      const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
      const matched = sessions.filter((s) => s.timestamp >= weekStart && s.timestamp < weekEnd);
      const mins = matched.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        id: `week-${weekStartDate.getFullYear()}-${weekStartDate.getMonth()}-${weekStartDate.getDate()}`,
        shortLabel: i === 9 ? 'This Wk' : `${weekStartDate.getMonth() + 1}/${weekStartDate.getDate()}`,
        subLabel: `W${i + 1}`,
        fullLabel: `Week of ${weekStartDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })}`,
        minutes: mins,
        hours: +(mins / 60).toFixed(1),
        sessionCount: matched.length,
        isCurrent: i === 9,
      };
    });

    // 3) Monthly buckets (rolling 12 months)
    const monthlyBuckets: GraphBucket[] = Array.from({ length: 12 }).map((_, i) => {
      const mDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const mStart = mDate.getTime();
      const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 1).getTime();
      const matched = sessions.filter((s) => s.timestamp >= mStart && s.timestamp < mEnd);
      const mins = matched.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        id: `month-${mDate.getFullYear()}-${mDate.getMonth()}`,
        shortLabel: monthNames[mDate.getMonth()],
        subLabel: `'${String(mDate.getFullYear()).slice(-2)}`,
        fullLabel: `${monthNames[mDate.getMonth()]} ${mDate.getFullYear()}`,
        minutes: mins,
        hours: +(mins / 60).toFixed(1),
        sessionCount: matched.length,
        isCurrent: i === 11,
      };
    });

    // 4) Yearly buckets (at least 3 years ending with current year, plus any earlier logged years)
    const currentYear = now.getFullYear();
    let earliestYear = currentYear - 2;
    sessions.forEach((s) => {
      const y = new Date(s.timestamp).getFullYear();
      if (y < earliestYear) earliestYear = y;
    });
    const yearCount = Math.min(8, Math.max(3, currentYear - earliestYear + 1));
    const startYear = currentYear - yearCount + 1;
    const yearlyBuckets: GraphBucket[] = Array.from({ length: yearCount }).map((_, i) => {
      const yr = startYear + i;
      const yStart = new Date(yr, 0, 1).getTime();
      const yEnd = new Date(yr + 1, 0, 1).getTime();
      const matched = sessions.filter((s) => s.timestamp >= yStart && s.timestamp < yEnd);
      const mins = matched.reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        id: `year-${yr}`,
        shortLabel: String(yr),
        subLabel: `${matched.length} sess`,
        fullLabel: `Year ${yr}`,
        minutes: mins,
        hours: +(mins / 60).toFixed(1),
        sessionCount: matched.length,
        isCurrent: yr === currentYear,
      };
    });

    // Subject distribution
    const subMap: Record<string, number> = {};
    sessions.forEach((s) => {
      subMap[s.subject] = (subMap[s.subject] || 0) + s.durationMinutes;
    });
    const allTimeTotal = Object.values(subMap).reduce((a, b) => a + b, 0) || 1;
    const sortedSubjects = Object.entries(subMap).sort((a, b) => b[1] - a[1]);

    const todaySubMap: Record<string, number> = {};
    todaySess.forEach((s) => {
      todaySubMap[s.subject] = (todaySubMap[s.subject] || 0) + s.durationMinutes;
    });

    // Streak calculation (up to 60 days)
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayMins = sessions
        .filter((s) => s.timestamp >= dayStart && s.timestamp < dayEnd)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      if (dayMins >= 25) {
        streak += 1;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    // Study efficiency insights
    const windowBuckets: Record<string, number> = {
      'Early Morning (5–9)': 0,
      'Morning (9–12)': 0,
      'Afternoon (12–17)': 0,
      'Evening (17–21)': 0,
      'Night Owl (21–5)': 0,
    };
    const dayTotalsMap: Record<string, number> = {};
    let totalDurationSum = 0;

    sessions.forEach((s) => {
      totalDurationSum += s.durationMinutes;
      const dt = new Date(s.timestamp);
      const h = dt.getHours();
      if (h >= 5 && h < 9) windowBuckets['Early Morning (5–9)'] += s.durationMinutes;
      else if (h >= 9 && h < 12) windowBuckets['Morning (9–12)'] += s.durationMinutes;
      else if (h >= 12 && h < 17) windowBuckets['Afternoon (12–17)'] += s.durationMinutes;
      else if (h >= 17 && h < 21) windowBuckets['Evening (17–21)'] += s.durationMinutes;
      else windowBuckets['Night Owl (21–5)'] += s.durationMinutes;

      const dKey = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dayTotalsMap[dKey] = (dayTotalsMap[dKey] || 0) + s.durationMinutes;
    });

    const topWindow = Object.entries(windowBuckets).sort((a, b) => b[1] - a[1])[0];
    const peakWindowLabel =
      sessions.length > 0 && topWindow[1] > 0 ? topWindow[0] : 'Log sprints to detect';

    const bestDayEntry = Object.entries(dayTotalsMap).sort((a, b) => b[1] - a[1])[0];
    const bestDayText = bestDayEntry
      ? `${(bestDayEntry[1] / 60).toFixed(1)}h (${bestDayEntry[0]})`
      : '—';

    const consistencyDays = dailyBuckets.filter((b) => b.minutes >= 25).length;
    const consistencyPct = Math.round((consistencyDays / 14) * 100);
    const avgSprintMins =
      sessions.length > 0 ? Math.round(totalDurationSum / sessions.length) : 0;

    const filtered = sessions
      .filter((s) => filterSubject === 'all' || s.subject === filterSubject)
      .sort((a, b) => b.timestamp - a.timestamp);

    return {
      todaySessions: todaySess,
      todayTotalMins: todayMins,
      todayHours: todayHrs,
      last7DaysMinutes: sevenDaysMins,
      totalAllTimeMins: allTimeTotal,
      subjectList: sortedSubjects,
      todaySubjectMap: todaySubMap,
      currentStreak: streak,
      filteredSessions: filtered,
      bucketsByPeriod: {
        daily: dailyBuckets,
        weekly: weeklyBuckets,
        monthly: monthlyBuckets,
        yearly: yearlyBuckets,
      },
      efficiencyStats: {
        peakWindowLabel,
        bestDayText,
        consistencyDays,
        consistencyPct,
        avgSprintMins,
      },
    };
  }, [sessions, filterSubject]);

  const activeBuckets = bucketsByPeriod[graphPeriod];
  const periodTargetMinutes =
    graphPeriod === 'daily'
      ? Math.round(dailyGoalHours * 60)
      : graphPeriod === 'weekly'
      ? Math.round(dailyGoalHours * 60 * 7)
      : graphPeriod === 'monthly'
      ? Math.round(dailyGoalHours * 60 * 30)
      : Math.round(dailyGoalHours * 60 * 365);

  const maxBucketMinutes = Math.max(
    graphPeriod === 'daily' ? 120 : graphPeriod === 'weekly' ? 600 : 1200,
    graphPeriod === 'daily' || graphPeriod === 'weekly' ? periodTargetMinutes : 0,
    ...activeBuckets.map((b) => b.minutes)
  );

  const periodTotalMinutes = activeBuckets.reduce((acc, b) => acc + b.minutes, 0);
  const activeBucketsWithTime = activeBuckets.filter((b) => b.minutes > 0).length;
  const periodAvgMinutes =
    activeBucketsWithTime > 0 ? Math.round(periodTotalMinutes / activeBuckets.length) : 0;

  const latestBucket = activeBuckets[activeBuckets.length - 1];
  const prevBucket = activeBuckets[activeBuckets.length - 2];
  const deltaMins = latestBucket && prevBucket ? latestBucket.minutes - prevBucket.minutes : 0;
  const inspectedBucket =
    activeBuckets.find((b) => b.id === selectedBucketId) || latestBucket;

  const goalMinutes = Math.round(dailyGoalHours * 60);
  const goalSeconds = Math.max(1, Math.round(dailyGoalHours * 3600));
  const targetProgress =
    goalMinutes > 0 ? Math.min(100, Math.round((todayTotalMins / goalMinutes) * 100)) : 0;
  const remainingMins = Math.max(0, goalMinutes - todayTotalMins);
  const isGoalReached = todayTotalMins >= goalMinutes && goalMinutes > 0;

  // Live current active session elapsed seconds
  let currentSessionSeconds = 0;
  let currentSessionIsActive = false;
  let currentModeLabel = 'Pomodoro Focus';

  if (activeMode === 'pomodoro') {
    currentSessionIsActive = pomoIsRunning;
    if (pomoPhase === 'focus') {
      currentSessionSeconds = Math.max(0, pomoTotalSeconds - pomoTimeLeft);
      currentModeLabel = 'Pomodoro Focus';
    } else {
      currentSessionSeconds = 0;
      currentModeLabel = pomoPhase === 'shortBreak' ? 'Short Break (Rest)' : 'Long Break (Rest)';
    }
  } else if (activeMode === 'timer') {
    currentSessionIsActive = countIsRunning;
    currentSessionSeconds = Math.max(0, countTotalSeconds - countTimeLeft);
    currentModeLabel = 'Countdown Sprint';
  } else {
    currentSessionIsActive = swIsRunning;
    currentSessionSeconds = Math.floor(swElapsedMs / 1000);
    currentModeLabel = 'Open Stopwatch';
  }

  const formatSessionHMS = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${hrs}h ${pad(mins)}m ${pad(secs)}s`;
    return `${mins}m ${pad(secs)}s`;
  };

  const currentSessionMins = currentSessionSeconds / 60;
  const currentSessionHours = (currentSessionSeconds / 3600).toFixed(2);
  const sessionVsGoalExactPct = Math.min(100, (currentSessionSeconds / goalSeconds) * 100);
  const sessionVsGoalDisplayPct =
    sessionVsGoalExactPct > 0 && sessionVsGoalExactPct < 0.1
      ? '<0.1'
      : sessionVsGoalExactPct.toFixed(1);
  const sessionBarWidth =
    currentSessionSeconds > 0 ? Math.min(100, Math.max(2, sessionVsGoalExactPct)) : 0;

  const loggedTodayPct = goalMinutes > 0 ? Math.min(100, (todayTotalMins / goalMinutes) * 100) : 0;
  const combinedLivePct = Math.min(100, loggedTodayPct + sessionVsGoalExactPct);
  const combinedLiveMins = +(todayTotalMins + currentSessionMins).toFixed(1);
  const activeSubjectStyle = getSubjectStyle(activeSubject, subjects);

  const exportSessionsCSV = () => {
    const header = 'Date & Time,Subject,Duration (Minutes),Mode,Completed,Notes\n';
    const rows = sessions
      .map((s) => {
        const date = new Date(s.timestamp).toISOString();
        const note = (s.notes || '').replace(/"/g, '""');
        return `"${date}","${s.subject}",${s.durationMinutes},"${s.phase}",${s.completed},"${note}"`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronos_deepwork_sessions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdjustGoal = (deltaHours: number) => {
    const next = Math.max(0.5, Math.min(16, +(dailyGoalHours + deltaHours).toFixed(1)));
    onUpdateDailyGoal(next);
  };

  const formatCompactMinutes = (mins: number) => {
    if (mins <= 0) return '0m';
    if (mins < 60) return `${Math.round(mins)}m`;
    return `${(mins / 60).toFixed(1)}h`;
  };

  const targetLineBottomPct =
    maxBucketMinutes > 0 && (graphPeriod === 'daily' || graphPeriod === 'weekly')
      ? Math.min(96, Math.max(4, Math.round((periodTargetMinutes / maxBucketMinutes) * 100)))
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight ch-text">
              Deep Work &amp; Productivity Intelligence
            </h2>
            <span className="text-xs ch-text-muted tabular-nums">
              · {sessions.length} sessions logged
            </span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Day, week, month, and yearly focus trajectory, subject balance, and efficiency metrics
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onSyncSessions && (
            <button
              type="button"
              onClick={onSyncSessions}
              disabled={isSyncingSessions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer disabled:opacity-60"
              title="Refresh sessions from cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSessions ? 'animate-spin ch-text-accent' : ''}`} />
              <span>{isSyncingSessions ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSubjectManager}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer"
            title="Manage study subjects and courses"
          >
            <BookOpen className="w-3.5 h-3.5 ch-text-accent" />
            <span>Manage Subjects</span>
          </button>

          <button
            type="button"
            onClick={exportSessionsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ch-btn-secondary rounded-xl whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Daily Goal Progress Banner */}
      <div className="relative overflow-hidden rounded-3xl ch-glass-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider ch-text-accent flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Daily Goal Progress
              </span>
              <span className="ch-text-muted">·</span>
              <span className="text-xs ch-text-muted tabular-nums">
                Target: {dailyGoalHours}h ({goalMinutes} mins)
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold ch-text tracking-tight tabular-nums">
                {todayTotalMins}
              </span>
              <span className="text-lg font-mono ch-text-secondary font-semibold tabular-nums">
                / {goalMinutes} mins
              </span>
              <span className="text-xs ch-text-muted font-sans tabular-nums">
                ({todayHours} hrs completed)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 p-1 ch-glass-subtle rounded-xl">
              <button
                type="button"
                onClick={() => handleAdjustGoal(-0.5)}
                className="p-1.5 ch-text-muted hover:ch-text rounded-lg transition-colors cursor-pointer"
                title="Decrease goal by 30 mins"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold ch-text px-2 tabular-nums">
                {dailyGoalHours}h Goal
              </span>
              <button
                type="button"
                onClick={() => handleAdjustGoal(+0.5)}
                className="p-1.5 ch-text-muted hover:ch-text rounded-lg transition-colors cursor-pointer"
                title="Increase goal by 30 mins"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] ch-text-muted">Synced with Profile settings</span>
          </div>
        </div>

        {/* Full-Width Progress Track */}
        <div className="mt-5 space-y-2">
          <div className="relative w-full ch-glass-subtle h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(todayTotalMins > 0 ? 3 : 0, targetProgress)}%`,
                backgroundColor: isGoalReached ? '#10b981' : 'var(--ch-accent)',
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-xs pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold ch-text-accent text-sm tabular-nums">
                {targetProgress}%
              </span>
              <span className="ch-text-secondary">
                {isGoalReached ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Daily Target Met! Excellent focus.
                  </span>
                ) : (
                  <span>{remainingMins} minutes left to hit daily target</span>
                )}
              </span>
            </div>

            {Object.keys(todaySubjectMap).length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] flex-wrap">
                <span className="ch-text-muted">Today:</span>
                {Object.entries(todaySubjectMap).map(([sub, mins], idx) => {
                  const style = getSubjectStyle(sub, subjects);
                  return (
                    <span key={sub} className="inline-flex items-center gap-1 font-medium tabular-nums">
                      {idx > 0 && <span className="ch-text-muted">·</span>}
                      <span className={style.text}>
                        {sub} ({mins}m)
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Session vs Daily Target Comparison Card */}
      <div className="rounded-3xl ch-glass-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Current Session vs. Daily Target
              </span>
              <span className="ch-text-muted">·</span>
              <span className="text-xs ch-text-secondary font-medium">{currentModeLabel}</span>
              <span className="ch-text-muted">·</span>
              <span className={`text-xs font-semibold ${activeSubjectStyle.text}`}>
                {activeSubject}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold ch-text tracking-tight tabular-nums">
                {formatSessionHMS(currentSessionSeconds)}
              </span>
              <span className="text-sm sm:text-base font-mono ch-text-secondary font-semibold tabular-nums">
                / {dailyGoalHours}h ({goalMinutes}m) target
              </span>
              <span className="text-xs ch-text-muted font-mono tabular-nums">
                ({currentSessionHours} hrs)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border tabular-nums ${
                currentSessionIsActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/35'
                  : currentSessionSeconds > 0
                    ? 'ch-accent-soft'
                    : 'ch-glass-subtle ch-text-muted'
              }`}
            >
              {currentSessionIsActive
                ? 'Session Running'
                : currentSessionSeconds > 0
                  ? 'Session Paused'
                  : 'No Active Elapsed Time'}
            </span>
          </div>
        </div>

        {/* Direct Current Session vs Target Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="ch-text-secondary font-medium">
              Single-Session Progress Toward Daily Target
            </span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {sessionVsGoalDisplayPct}% of {dailyGoalHours}h target
            </span>
          </div>

          <div className="relative w-full ch-glass-subtle h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${sessionBarWidth}%`,
                background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
              }}
            />
          </div>

          {/* Target Scale Markers */}
          <div className="flex items-center justify-between text-[10px] font-mono ch-text-muted tabular-nums pt-0.5">
            <span>0h</span>
            <span>{(dailyGoalHours * 0.25).toFixed(1)}h</span>
            <span>{(dailyGoalHours * 0.5).toFixed(1)}h</span>
            <span>{(dailyGoalHours * 0.75).toFixed(1)}h</span>
            <span>{dailyGoalHours}h Target</span>
          </div>
        </div>

        {/* Combined Daily Impact Preview (Logged Today + Current Live Session) */}
        <div className="pt-3 border-t ch-border space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="ch-text-muted">
              Combined Daily Impact (Saved {todayTotalMins}m + Active{' '}
              {currentSessionMins.toFixed(1)}m)
            </span>
            <span className="font-mono ch-text font-semibold tabular-nums">
              {combinedLiveMins}m / {goalMinutes}m ({Math.round(combinedLivePct)}%)
            </span>
          </div>
          <div className="relative w-full ch-glass-subtle h-2.5 rounded-full overflow-hidden flex">
            {loggedTodayPct > 0 && (
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${loggedTodayPct}%`,
                  backgroundColor: isGoalReached ? '#10b981' : 'var(--ch-accent)',
                }}
                title={`Completed Today: ${todayTotalMins} mins`}
              />
            )}
            {sessionVsGoalExactPct > 0 && loggedTodayPct < 100 && (
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100 - loggedTodayPct, sessionVsGoalExactPct)}%`,
                  backgroundColor: '#38bdf8',
                }}
                title={`Current Live Session: ${formatSessionHMS(currentSessionSeconds)}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 @sm/main:grid-cols-2 @3xl/main:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl ch-glass-card">
          <div className="flex items-center justify-between ch-text-muted text-xs mb-2">
            <span>Today&apos;s Deep Work</span>
            <Clock className="w-4 h-4 ch-text-accent" />
          </div>
          <div className="font-mono text-3xl font-extrabold ch-text tabular-nums">
            {todayHours} <span className="text-sm font-sans font-normal ch-text-muted">hrs</span>
          </div>
          <div className="mt-2 text-xs ch-text-secondary tabular-nums">
            {todayTotalMins} total focused minutes
          </div>
        </div>

        <div className="p-5 rounded-2xl ch-glass-card">
          <div className="flex items-center justify-between ch-text-muted text-xs mb-2">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold ch-text tabular-nums">
            {currentStreak} <span className="text-sm font-sans font-normal ch-text-muted">days</span>
          </div>
          <div className="mt-2 text-xs ch-text-secondary">
            {currentStreak >= 3 ? 'Strong consistency maintained' : 'Build a daily study streak'}
          </div>
        </div>

        <div className="p-5 rounded-2xl ch-glass-card">
          <div className="flex items-center justify-between ch-text-muted text-xs mb-2">
            <span>Sessions Today</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold ch-text tabular-nums">
            {todaySessions.length}
          </div>
          <div className="mt-2 text-xs ch-text-secondary tabular-nums">
            {todaySessions.length > 0
              ? `${(todayTotalMins / todaySessions.length).toFixed(0)} min avg session length`
              : 'Start your first session today'}
          </div>
        </div>

        <div className="p-5 rounded-2xl ch-glass-card">
          <div className="flex items-center justify-between ch-text-muted text-xs mb-2">
            <span>7-Day Total</span>
            <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold ch-text tabular-nums">
            {(last7DaysMinutes / 60).toFixed(1)}{' '}
            <span className="text-sm font-sans font-normal ch-text-muted">hrs</span>
          </div>
          <div className="mt-2 text-xs ch-text-secondary">Past 7 days accumulated focus</div>
        </div>
      </div>

      {/* Multi-Horizon Progress Graph (Day / Week / Month / Year) & Subject Distribution */}
      <div className="grid grid-cols-1 @3xl/main:grid-cols-3 gap-6">
        <div className="@3xl/main:col-span-2 p-5 sm:p-6 rounded-2xl ch-glass-card flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 ch-text-accent" />
                <h3 className="text-sm sm:text-base font-bold ch-text">
                  Study Progress Trajectory
                </h3>
              </div>
              <p className="text-xs ch-text-muted mt-0.5">
                {graphPeriod === 'daily'
                  ? 'Day-by-day focus trend (Last 14 Days)'
                  : graphPeriod === 'weekly'
                  ? 'Week-by-week focus volume (Last 10 Weeks)'
                  : graphPeriod === 'monthly'
                  ? 'Month-by-month progress (Last 12 Months)'
                  : 'Year-by-year cumulative study growth'}
              </p>
            </div>

            {/* Period Horizon Segmented Control */}
            <div className="flex items-center gap-1 p-1 ch-glass-subtle rounded-xl">
              {(
                [
                  { id: 'daily', label: 'Day' },
                  { id: 'weekly', label: 'Week' },
                  { id: 'monthly', label: 'Month' },
                  { id: 'yearly', label: 'Year' },
                ] as const
              ).map((tab) => {
                const active = graphPeriod === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setGraphPeriod(tab.id);
                      setSelectedBucketId(null);
                    }}
                    className={`px-2.5 sm:px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      active ? 'ch-btn-primary shadow-xs' : 'ch-text-muted hover:ch-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Readout Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-2xl ch-glass-subtle text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider ch-text-muted font-semibold">
                Range Total
              </div>
              <div className="font-mono font-bold ch-text text-sm sm:text-base tabular-nums mt-0.5">
                {(periodTotalMinutes / 60).toFixed(1)}h
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider ch-text-muted font-semibold">
                Avg /{' '}
                {graphPeriod === 'daily'
                  ? 'Day'
                  : graphPeriod === 'weekly'
                  ? 'Week'
                  : graphPeriod === 'monthly'
                  ? 'Month'
                  : 'Year'}
              </div>
              <div className="font-mono font-bold ch-text text-sm sm:text-base tabular-nums mt-0.5">
                {formatCompactMinutes(periodAvgMinutes)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider ch-text-muted font-semibold">
                {inspectedBucket ? inspectedBucket.fullLabel : 'Latest Change'}
              </div>
              <div className="font-mono font-bold ch-text-accent text-sm sm:text-base tabular-nums mt-0.5">
                {inspectedBucket
                  ? `${inspectedBucket.hours}h (${inspectedBucket.sessionCount})`
                  : `${deltaMins >= 0 ? '+' : ''}${formatCompactMinutes(deltaMins)}`}
              </div>
            </div>
          </div>

          {/* Interactive Vertical Bars Chart */}
          <div className="relative pt-7">
            {targetLineBottomPct !== null && (
              <>
                <span className="absolute top-0 right-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 pointer-events-none">
                  Goal {Math.round(periodTargetMinutes / 60)}h
                </span>
                <div
                  className="absolute inset-x-0 border-t border-dashed border-emerald-500/45 pointer-events-none z-0"
                  style={{ bottom: `calc(${targetLineBottomPct}% * 0.72 + 44px)` }}
                />
              </>
            )}

            <div className="relative z-10 flex items-end justify-between gap-1.5 sm:gap-2 h-52 overflow-x-auto pb-1">
              {activeBuckets.map((b) => {
                const heightPercent =
                  b.minutes > 0 ? Math.max(8, Math.round((b.minutes / maxBucketMinutes) * 100)) : 3;
                const isSelected = inspectedBucket?.id === b.id;
                const meetsGoal =
                  (graphPeriod === 'daily' || graphPeriod === 'weekly') &&
                  periodTargetMinutes > 0 &&
                  b.minutes >= periodTargetMinutes;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBucketId(b.id)}
                    className="flex-1 min-w-[22px] sm:min-w-[28px] flex flex-col items-center h-full justify-end group cursor-pointer focus:outline-none"
                    title={`${b.fullLabel}: ${b.minutes} mins (${b.hours}h)`}
                  >
                    <div className="text-[9px] sm:text-[10px] font-mono ch-text-secondary mb-1 tabular-nums truncate max-w-full">
                      {b.minutes > 0 ? formatCompactMinutes(b.minutes) : '0'}
                    </div>
                    <div className="w-full max-w-[36px] ch-glass-subtle rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: meetsGoal
                            ? '#10b981'
                            : b.isCurrent || isSelected
                            ? 'var(--ch-accent)'
                            : 'var(--ch-text-muted)',
                          opacity: b.minutes === 0 ? 0.25 : b.isCurrent || isSelected ? 1 : 0.6,
                        }}
                      />
                    </div>
                    <div className="mt-1.5 text-center leading-tight">
                      <div
                        className={`text-[10px] sm:text-[11px] font-medium tabular-nums truncate ${
                          b.isCurrent || isSelected ? 'ch-text-accent font-bold' : 'ch-text-secondary'
                        }`}
                      >
                        {b.shortLabel}
                      </div>
                      <div className="text-[9px] ch-text-muted font-mono hidden sm:block">
                        {b.subLabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] ch-text-muted pt-1 border-t ch-border flex-wrap gap-2">
            <span>
              {deltaMins >= 0 ? '▲' : '▼'} Latest vs prior:{' '}
              <strong className="ch-text font-mono tabular-nums">
                {deltaMins >= 0 ? '+' : ''}
                {Math.round(deltaMins)} mins
              </strong>
            </span>
            <span>Tap any bar to inspect session count &amp; hours</span>
          </div>
        </div>

        {/* Right Column: Subject Distribution + Study Efficiency Insights */}
        <div className="space-y-6 flex flex-col">
          {/* Subject Distribution */}
          <div className="p-6 rounded-2xl ch-glass-card flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold ch-text">Subject Distribution</h3>
                <button
                  type="button"
                  onClick={onOpenSubjectManager}
                  className="text-[11px] ch-text-accent hover:underline font-semibold cursor-pointer"
                >
                  Manage
                </button>
              </div>
              <p className="text-xs ch-text-muted mb-4">Time allocation across courses</p>

              <div className="space-y-3">
                {subjectList.slice(0, 6).map(([subject, mins]) => {
                  const percent = Math.round((mins / totalAllTimeMins) * 100);
                  const style = getSubjectStyle(subject, subjects);
                  return (
                    <div key={subject}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-semibold ${style.text}`}>{subject}</span>
                        <span className="font-mono ch-text-secondary tabular-nums">
                          {(mins / 60).toFixed(1)}h ({percent}%)
                        </span>
                      </div>
                      <div className="w-full ch-glass-subtle h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: 'var(--ch-accent)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {subjectList.length === 0 && (
                  <div className="text-xs ch-text-muted py-6 text-center">
                    No sessions recorded yet. Start a Pomodoro or countdown!
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t ch-border text-[11px] ch-text-muted flex items-center justify-between">
              <span>Courses Tracked: {subjects.length}</span>
              <button
                type="button"
                onClick={onOpenSubjectManager}
                className="ch-text-secondary hover:ch-text-accent font-medium transition-colors cursor-pointer"
              >
                + Add Course
              </button>
            </div>
          </div>

          {/* Study Efficiency & Peak Focus Window Insights */}
          <div className="p-5 rounded-2xl ch-glass-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider ch-text-accent">
              <Zap className="w-3.5 h-3.5" />
              <span>Study Efficiency Insights</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl ch-glass-subtle">
                <span className="ch-text-muted flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                  Peak Focus Window
                </span>
                <span className="font-mono font-bold ch-text text-[11px] truncate ml-2">
                  {efficiencyStats.peakWindowLabel}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl ch-glass-subtle">
                <span className="ch-text-muted">14-Day Consistency</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {efficiencyStats.consistencyDays}/14d ({efficiencyStats.consistencyPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl ch-glass-subtle">
                <span className="ch-text-muted">Best Focus Day</span>
                <span className="font-mono font-bold ch-text tabular-nums">
                  {efficiencyStats.bestDayText}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl ch-glass-subtle">
                <span className="ch-text-muted">Avg Sprint Length</span>
                <span className="font-mono font-bold ch-text tabular-nums">
                  {efficiencyStats.avgSprintMins} mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session History Log Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 ch-text-muted" />
            <h3 className="text-sm font-semibold ch-text">Study Session History</h3>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 ch-text-muted" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1 text-xs ch-input rounded-lg"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl ch-glass-card">
          <div className="max-h-80 overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[540px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b ch-border ch-glass-subtle ch-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date &amp; Time</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Mode</th>
                  <th className="py-2.5 px-4">Session Notes</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10 font-mono">
                {filteredSessions.slice(0, visibleHistoryCount).map((s) => {
                  const dateObj = new Date(s.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateFormatted = dateObj.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });
                  const style = getSubjectStyle(s.subject, subjects);

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="py-2.5 px-4 ch-text-secondary tabular-nums">
                        {dateFormatted} · {timeFormatted}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`font-sans font-semibold text-xs ${style.text}`}>
                          {s.subject}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold ch-text tabular-nums">
                        {s.durationMinutes} min
                      </td>
                      <td className="py-2.5 px-4 ch-text-muted font-sans capitalize text-xs">
                        {s.phase}
                      </td>
                      <td className="py-2.5 px-4 ch-text-secondary font-sans text-xs max-w-xs truncate">
                        {s.notes || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteSession(s.id)}
                          className="p-1 ch-text-muted hover:text-rose-500 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center ch-text-muted font-sans">
                      No matching deep work sessions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {(filteredSessions.length > visibleHistoryCount || hasMoreCloudSessions) && (
            <div className="p-3 border-t ch-border ch-glass-subtle flex flex-wrap items-center justify-center gap-2">
              {filteredSessions.length > visibleHistoryCount && (
                <button
                  type="button"
                  onClick={() => setVisibleHistoryCount((n) => n + 30)}
                  className="px-3.5 py-1.5 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
                >
                  Show 30 More ({filteredSessions.length - visibleHistoryCount} remaining)
                </button>
              )}
              {hasMoreCloudSessions && onLoadMoreCloudSessions && (
                <button
                  type="button"
                  onClick={onLoadMoreCloudSessions}
                  disabled={isSyncingSessions}
                  className="px-3.5 py-1.5 text-xs font-semibold ch-accent-soft rounded-xl cursor-pointer disabled:opacity-60"
                >
                  {isSyncingSessions ? 'Loading History...' : 'Load Earlier From Cloud'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
