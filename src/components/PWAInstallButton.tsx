import React, { useState } from 'react';
import { Download, Smartphone, Share, X, Maximize, Minimize } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'panel' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isFullscreen, install, toggleFullscreen } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  if (isInstalled) {
    if (variant === 'header') {
      return (
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 text-xs font-semibold rounded-xl ch-btn-secondary transition-colors shrink-0 whitespace-nowrap cursor-pointer ${className}`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
        >
          {isFullscreen ? (
            <>
              <Minimize className="w-3.5 h-3.5 ch-text-accent" />
              <span className="hidden xl:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize className="w-3.5 h-3.5 ch-text-accent" />
              <span className="hidden xl:inline">Fullscreen</span>
            </>
          )}
        </button>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl ch-accent-soft transition-all shrink-0 whitespace-nowrap cursor-pointer ${className}`}
          title="Install Chronos to Home Screen (Fullscreen Study App)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Install App</span>
        </button>
      )}

      {variant === 'panel' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl ch-btn-primary text-xs transition-all cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install App to Home Screen</span>
        </button>
      )}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-sm ch-glass-modal rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b ch-border pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon.svg"
                  alt="Chronos Icon"
                  className="w-8 h-8 rounded-lg shadow-sm border ch-border"
                />
                <div>
                  <h4 className="text-sm font-bold ch-text">Install Chronos</h4>
                  <p className="text-[11px] ch-text-muted">Fullscreen Home Screen App</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 ch-text-muted hover:ch-text rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs ch-text-secondary">
                <p className="ch-text-muted text-[11px]">
                  iOS Safari requires adding to home screen through the Share menu:
                </p>
                <div className="flex items-start gap-3 p-2.5 rounded-xl ch-glass-subtle">
                  <div className="w-6 h-6 rounded-full ch-accent-soft flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-semibold ch-text">Tap the Share button</span>
                    <p className="text-[11px] ch-text-muted mt-0.5 flex items-center gap-1">
                      Located in Safari toolbar (<Share className="w-3 h-3 ch-text-accent" /> icon)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl ch-glass-subtle">
                  <div className="w-6 h-6 rounded-full ch-accent-soft flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-semibold ch-text">Select &quot;Add to Home Screen&quot;</span>
                    <p className="text-[11px] ch-text-muted mt-0.5">
                      Scroll down in the share sheet and tap the plus icon.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl ch-glass-subtle">
                  <div className="w-6 h-6 rounded-full ch-accent-soft flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-semibold ch-text">Tap &quot;Add&quot;</span>
                    <p className="text-[11px] ch-text-muted mt-0.5">
                      Chronos will launch in true standalone fullscreen with no browser bars!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs ch-text-secondary">
                <p className="ch-text-muted text-[11px]">To install Chronos on your device:</p>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await install();
                      if (res) setShowGuideModal(false);
                    }}
                    className="w-full py-2.5 px-4 ch-btn-primary rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Now</span>
                  </button>
                ) : (
                  <div className="space-y-2 p-3 rounded-xl ch-glass-subtle text-[11px] ch-text-muted">
                    <div className="flex items-center gap-2 font-semibold ch-text">
                      <Smartphone className="w-3.5 h-3.5 ch-text-accent" />
                      <span>Browser Menu Installation</span>
                    </div>
                    <p>
                      1. Open your browser menu (<strong>⋮</strong> or <strong>Share</strong>).
                      <br />
                      2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                      <br />
                      3. Confirm to install Chronos as a fullscreen application.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
