import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Download,
  Copy,
  ExternalLink,
  Check,
  TrendingDown,
  TrendingUp,
  LayoutTemplate,
  Clock,
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';

export const StopwatchView: React.FC = () => {
  const {
    swElapsedMs,
    getSwElapsedMsNow,
    swIsRunning,
    swStartedAt,
    swLaps,
    toggleSwRunning,
    resetSw,
    recordSwLap,
    updateSwLapNote,
    activeSubject,
    launchOsPip,
    isOsPipActive,
    setShowInAppPip,
    setActiveMode,
  } = useTimer();

  const [copied, setCopied] = useState<boolean>(false);
  const timeDisplayRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');
    const hStr = hundredths.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mStr}:${sStr}.${hStr}`;
    }
    return `${mStr}:${sStr}.${hStr}`;
  };

  // Direct 60fps DOM text update for running stopwatch (zero React VDOM diffing)
  useEffect(() => {
    if (!swIsRunning) {
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatTime(swElapsedMs);
      }
      return;
    }

    let rafId: number | null = null;
    const renderFrame = () => {
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatTime(getSwElapsedMsNow());
      }
      rafId = requestAnimationFrame(renderFrame);
    };
    rafId = requestAnimationFrame(renderFrame);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [swIsRunning, getSwElapsedMsNow, swElapsedMs]);

  let fastestLapId = '';
  let slowestLapId = '';
  if (swLaps.length >= 2) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    swLaps.forEach((l) => {
      if (l.lapDurationMs < minTime) {
        minTime = l.lapDurationMs;
        fastestLapId = l.id;
      }
      if (l.lapDurationMs > maxTime) {
        maxTime = l.lapDurationMs;
        slowestLapId = l.id;
      }
    });
  }

  const copyLaps = () => {
    const text = swLaps
      .map(
        (l) =>
          `Lap ${l.lapNumber}: ${formatTime(l.lapDurationMs)} (Overall: ${formatTime(l.totalTimeMs)})${
            l.note ? ` - ${l.note}` : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportLapsCSV = () => {
    const header = 'Lap Number,Lap Time (Formatted),Lap Time (ms),Total Time (ms),Notes\n';
    const rows = swLaps
      .map(
        (l) =>
          `${l.lapNumber},"${formatTime(l.lapDurationMs)}",${l.lapDurationMs},${l.totalTimeMs},"${(
            l.note || ''
          ).replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chronos_stopwatch_laps_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startedAtLabel = swStartedAt
    ? new Date(swStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight ch-text">Study Stopwatch &amp; Splits</h2>
            <span className="text-xs ch-text-muted">· Precision Laps</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Wall-clock anchored timing continues counting accurately even if you close the tab
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveMode('stopwatch');
              setShowInAppPip(true);
            }}
            className="ch-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
            title="Open in-app floating stopwatch widget"
          >
            <LayoutTemplate className="w-3.5 h-3.5 ch-text-muted" />
            <span>Mini Widget</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('stopwatch');
              launchOsPip();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isOsPipActive
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-sm'
                : 'ch-btn-secondary'
            }`}
            title="Pop out floating stopwatch over other applications"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isOsPipActive ? 'Floating (Active)' : 'Float (PiP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Stopwatch Face */}
      <div className="relative overflow-hidden rounded-3xl ch-glass-card p-6 sm:p-10 flex flex-col items-center justify-center text-center">
        <div className="text-xs font-semibold ch-text-muted mb-2 flex items-center gap-2 flex-wrap justify-center">
          <span>{activeSubject}</span>
          <span>·</span>
          <span>Chronos Stopwatch</span>
          {startedAtLabel && (
            <>
              <span>·</span>
              <span className="text-emerald-500 font-mono inline-flex items-center gap-1 tabular-nums">
                <Clock className="w-3 h-3" /> Started {startedAtLabel}
              </span>
            </>
          )}
        </div>

        <div
          ref={timeDisplayRef}
          className="my-4 font-mono text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight ch-text tabular-nums"
        >
          {formatTime(swElapsedMs)}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-4">
          <button
            onClick={recordSwLap}
            disabled={!swIsRunning && swElapsedMs === 0}
            className="ch-btn-secondary flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flag className="w-4 h-4" />
            <span>Split Lap</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('stopwatch');
              toggleSwRunning();
            }}
            className={`flex items-center gap-2 px-7 sm:px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${
              swIsRunning
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/35'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
            }`}
          >
            {swIsRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={resetSw}
            disabled={swElapsedMs === 0}
            className="ch-btn-secondary p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset & Log Study Session (>= 2m)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Laps Table */}
      {swLaps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold ch-text">Logged Laps ({swLaps.length})</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLaps}
                className="ch-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={exportLapsCSV}
                className="ch-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl ch-glass-card">
            <div className="max-h-72 overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[460px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b ch-border ch-glass-subtle ch-text-muted font-semibold">
                    <th className="py-2.5 px-4 w-16">Lap</th>
                    <th className="py-2.5 px-4">Lap Time</th>
                    <th className="py-2.5 px-4">Overall Elapsed</th>
                    <th className="py-2.5 px-4">Performance Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y ch-border font-mono">
                  {swLaps.map((lap) => {
                    const isFastest = lap.id === fastestLapId;
                    const isSlowest = lap.id === slowestLapId;

                    return (
                      <tr
                        key={lap.id}
                        className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                          isFastest ? 'bg-emerald-500/5' : isSlowest ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-bold ch-text-muted tabular-nums">
                          #{lap.lapNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold tabular-nums ${
                                isFastest
                                  ? 'text-emerald-500'
                                  : isSlowest
                                  ? 'text-rose-500'
                                  : 'ch-text'
                              }`}
                            >
                              {formatTime(lap.lapDurationMs)}
                            </span>
                            {isFastest && (
                              <span className="flex items-center gap-0.5 text-[11px] text-emerald-500 font-sans">
                                <TrendingDown className="w-3 h-3" /> Fastest
                              </span>
                            )}
                            {isSlowest && (
                              <span className="flex items-center gap-0.5 text-[11px] text-rose-500 font-sans">
                                <TrendingUp className="w-3 h-3" /> Slowest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 ch-text-muted tabular-nums">
                          {formatTime(lap.totalTimeMs)}
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={lap.note || ''}
                            onChange={(e) => updateSwLapNote(lap.id, e.target.value)}
                            placeholder="Add question/section note..."
                            className="w-full bg-transparent border-b border-transparent hover:border-[var(--ch-border-strong)] focus:border-emerald-500 ch-text-secondary font-sans text-xs py-0.5 focus:outline-none transition-colors"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
