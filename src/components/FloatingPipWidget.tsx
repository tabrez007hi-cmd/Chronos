import React, { useState } from 'react';
import { Play, Pause, X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

interface FloatingPipWidgetProps {
  onExpandToMain: () => void;
}

export const FloatingPipWidget: React.FC<FloatingPipWidgetProps> = ({ onExpandToMain }) => {
  const {
    currentDisplayTime,
    currentIsRunning,
    currentTitle,
    currentSubtitle,
    toggleCurrentRunning,
    resetCurrent,
    setShowInAppPip,
    launchOsPip,
  } = useTimer();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-40 max-w-[calc(100vw-1.5rem)] animate-fade-in">
      <div className="ch-glass-modal rounded-2xl overflow-hidden w-72 sm:w-80 max-w-full">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 ch-glass-subtle border-b ch-border">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                currentIsRunning ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider ch-text-secondary truncate max-w-[140px]">
              {currentTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => launchOsPip()}
              title="Pop out over other apps (OS Window)"
              className="p-1 ch-text-muted hover:ch-text-accent rounded transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 ch-text-muted hover:ch-text rounded transition-colors cursor-pointer"
              title={isMinimized ? 'Expand widget' : 'Minimize widget'}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowInAppPip(false)}
              className="p-1 ch-text-muted hover:text-rose-500 rounded transition-colors cursor-pointer"
              title="Close floating widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized ? (
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold ch-text tracking-tight tabular-nums">
              {currentDisplayTime}
            </div>
            <div className="text-xs ch-text-muted mt-1 truncate max-w-[240px]">
              {currentSubtitle}
            </div>

            <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
              <button
                type="button"
                onClick={toggleCurrentRunning}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  currentIsRunning ? 'ch-accent-soft' : 'ch-btn-primary'
                }`}
              >
                {currentIsRunning ? 'Pause' : 'Start'}
              </button>
              <button
                type="button"
                onClick={resetCurrent}
                className="py-2 px-3 ch-btn-secondary rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onExpandToMain}
                className="py-2 px-3 ch-btn-secondary rounded-xl text-xs font-semibold cursor-pointer"
                title="Open main view"
              >
                Expand
              </button>
            </div>
          </div>
        ) : (
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <span className="font-mono text-lg font-bold ch-text tabular-nums">
              {currentDisplayTime}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleCurrentRunning}
                className="p-1.5 ch-btn-primary rounded-lg cursor-pointer"
              >
                {currentIsRunning ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={onExpandToMain}
                className="p-1.5 ch-text-muted hover:ch-text cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
