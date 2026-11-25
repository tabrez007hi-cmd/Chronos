export interface PipState {
  isActive: boolean;
  type: 'document' | 'video' | null;
  mode: string;
  timeString: string;
  subText: string;
  progress: number;
  isRunning: boolean;
}

class PictureInPictureService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private animFrameId: number | null = null;
  private pipWindow: Window | null = null;
  private onStateChangeCallback: ((active: boolean) => void) | null = null;

  // Cached state for canvas rendering
  private currentTitle: string = 'FOCUS SESSION';
  private currentTime: string = '25:00';
  private currentSubtitle: string = 'Deep Work';
  private currentProgress: number = 0;
  private currentRunning: boolean = false;
  private currentModeColor: string = '#f59e0b';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initCanvas();
    }
  }

  private initCanvas() {
    if (this.canvas && this.video) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = 440;
    this.canvas.height = 240;
    this.ctx = this.canvas.getContext('2d');

    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');
    this.video.style.position = 'fixed';
    this.video.style.top = '-9999px';
    this.video.style.left = '-9999px';
    this.video.style.width = '1px';
    this.video.style.height = '1px';
    this.video.style.opacity = '0';
    this.video.style.pointerEvents = 'none';

    // Append to body so the browser allows requestPictureInPicture
    if (typeof document !== 'undefined' && document.body && !document.body.contains(this.video)) {
      document.body.appendChild(this.video);
    }

    // Listen for OS PiP exit
    this.video.addEventListener('leavepictureinpicture', () => {
      this.stopCanvasLoop();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false);
      }
    });

    // Draw initial frame
    this.drawCanvas();
  }

  public setListener(callback: (active: boolean) => void) {
    this.onStateChangeCallback = callback;
  }

  public updateData(options: {
    title: string;
    time: string;
    subtitle: string;
    progress: number;
    isRunning: boolean;
    color?: string;
  }) {
    this.currentTitle = options.title;
    this.currentTime = options.time;
    this.currentSubtitle = options.subtitle;
    this.currentProgress = Math.max(0, Math.min(1, options.progress));
    this.currentRunning = options.isRunning;
    if (options.color) {
      this.currentModeColor = options.color;
    }

    // If Document PiP is open, update its DOM elements
    if (this.pipWindow && !this.pipWindow.closed) {
      try {
        const timeEl = this.pipWindow.document.getElementById('pip-time');
        const subEl = this.pipWindow.document.getElementById('pip-subtitle');
        const titleEl = this.pipWindow.document.getElementById('pip-title');
        const progressEl = this.pipWindow.document.getElementById('pip-progress-bar');
        const statusEl = this.pipWindow.document.getElementById('pip-status');

        if (timeEl) timeEl.textContent = this.currentTime;
        if (subEl) subEl.textContent = this.currentSubtitle;
        if (titleEl) titleEl.textContent = this.currentTitle;
        if (progressEl) progressEl.style.width = `${this.currentProgress * 100}%`;
        if (statusEl) {
          statusEl.textContent = this.currentRunning ? 'RUNNING' : 'PAUSED';
          statusEl.className = this.currentRunning ? 'status-pill running' : 'status-pill paused';
        }
      } catch {
        // Window might be closing
      }
    }
  }

  private drawCanvas() {
    if (!this.ctx || !this.canvas) return;
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, width, height);

    // Subtle radial glow behind timer
    const grad = ctx.createRadialGradient(width / 2, height / 2 + 10, 10, width / 2, height / 2, width / 2);
    grad.addColorStop(0, `${this.currentModeColor}25`);
    grad.addColorStop(1, '#0a0a0c00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Top Header bar
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(16, 16, width - 32, 34);

    // Header Title
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.currentTitle.toUpperCase(), 28, 38);

    // Status pill
    const statusText = this.currentRunning ? 'RUNNING' : 'PAUSED';
    const statusColor = this.currentRunning ? '#10b981' : '#f59e0b';
    ctx.fillStyle = statusColor;
    ctx.font = '700 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(statusText, width - 28, 38);

    // Primary Giant Time
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 68px "JetBrains Mono", monospace, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.currentTime, width / 2, height / 2 + 10);

    // Subtitle / Subject Tag
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.currentSubtitle, width / 2, height - 42);

    // Progress bar track
    ctx.fillStyle = '#27272a';
    ctx.fillRect(24, height - 20, width - 48, 6);

    // Progress bar fill
    if (this.currentProgress > 0) {
      ctx.fillStyle = this.currentModeColor;
      const fillW = Math.max(4, (width - 48) * this.currentProgress);
      ctx.fillRect(24, height - 20, fillW, 6);
    }
  }

  private startCanvasLoop() {
    this.stopCanvasLoop();
    this.drawCanvas();
    this.animFrameId = window.setInterval(() => {
      this.drawCanvas();
    }, 500);
  }

  private stopCanvasLoop() {
    if (this.animFrameId !== null) {
      window.clearInterval(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Request native floating Picture-in-Picture window over other applications!
   * Returns true if OS window was created, false if rejected or not supported.
   */
  public async requestPip(handlers?: {
    onTogglePlay?: () => void;
    onReset?: () => void;
    onSkip?: () => void;
  }): Promise<boolean> {
    this.initCanvas();
    this.drawCanvas();

    // 1. Try Document Picture-in-Picture (Chromium Desktop)
    const nav = window as unknown as {
      documentPictureInPicture?: {
        requestWindow: (options: { width: number; height: number }) => Promise<Window>;
      };
    };

    if (nav.documentPictureInPicture && typeof nav.documentPictureInPicture.requestWindow === 'function') {
      try {
        const pipWin = await nav.documentPictureInPicture.requestWindow({
          width: 380,
          height: 240,
        });
        this.pipWindow = pipWin;

        const doc = pipWin.document;
        doc.head.innerHTML = `
          <meta charset="utf-8">
          <title>Chronos Floating Timer</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              background: #09090b;
              color: #fafafa;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              height: 100vh;
              padding: 16px;
              user-select: none;
              justify-content: space-between;
              overflow: hidden;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              letter-spacing: 0.05em;
              font-weight: 600;
              color: #a1a1aa;
            }
            .status-pill {
              font-size: 10px;
              font-weight: 700;
              font-family: monospace;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .status-pill.running { background: rgba(16,185,129,0.2); color: #34d399; }
            .status-pill.paused { background: rgba(245,158,11,0.2); color: #fbbf24; }
            .center-display {
              text-align: center;
              margin: auto 0;
            }
            .time-display {
              font-size: 52px;
              font-weight: 800;
              font-family: "JetBrains Mono", ui-monospace, monospace;
              letter-spacing: -0.02em;
              color: #ffffff;
              line-height: 1;
            }
            .sub-title {
              font-size: 13px;
              color: #a1a1aa;
              margin-top: 8px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .progress-track {
              height: 4px;
              background: #27272a;
              border-radius: 999px;
              overflow: hidden;
              margin-top: 10px;
            }
            .progress-fill {
              height: 100%;
              background: ${this.currentModeColor};
              width: ${this.currentProgress * 100}%;
              transition: width 0.3s ease;
            }
            .controls {
              display: flex;
              gap: 8px;
              justify-content: center;
              margin-top: 10px;
            }
            button {
              background: #27272a;
              color: #f4f4f5;
              border: none;
              padding: 6px 14px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            }
            button:hover { background: #3f3f46; }
            button.primary { background: #f59e0b; color: #18181b; }
            button.primary:hover { background: #fbbf24; }
          </style>
        `;

        doc.body.innerHTML = `
          <div class="header">
            <span id="pip-title">${this.currentTitle.toUpperCase()}</span>
            <span id="pip-status" class="status-pill ${this.currentRunning ? 'running' : 'paused'}">
              ${this.currentRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
          <div class="center-display">
            <div id="pip-time" class="time-display">${this.currentTime}</div>
            <div id="pip-subtitle" class="sub-title">${this.currentSubtitle}</div>
            <div class="progress-track">
              <div id="pip-progress-bar" class="progress-fill"></div>
            </div>
          </div>
          <div class="controls">
            <button id="pip-btn-play" class="primary">${this.currentRunning ? 'Pause' : 'Start'}</button>
            <button id="pip-btn-reset">Reset</button>
            <button id="pip-btn-skip">Skip</button>
          </div>
        `;

        doc.getElementById('pip-btn-play')?.addEventListener('click', () => {
          if (handlers?.onTogglePlay) handlers.onTogglePlay();
        });
        doc.getElementById('pip-btn-reset')?.addEventListener('click', () => {
          if (handlers?.onReset) handlers.onReset();
        });
        doc.getElementById('pip-btn-skip')?.addEventListener('click', () => {
          if (handlers?.onSkip) handlers.onSkip();
        });

        pipWin.addEventListener('pagehide', () => {
          this.pipWindow = null;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        });

        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
        return true;
      } catch (err) {
        console.warn('Document PiP request failed:', err);
      }
    }

    // 2. Try Video Canvas Stream PiP (Universal across desktop/tablet browsers)
    try {
      if (!this.canvas || !this.video) {
        this.initCanvas();
      }

      const canvas = this.canvas!;
      this.drawCanvas(); // ensure canvas has content
      this.startCanvasLoop();

      const stream = (canvas as HTMLCanvasElement & { captureStream?: (fps: number) => MediaStream }).captureStream
        ? (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(30)
        : null;

      if (!stream) {
        this.stopCanvasLoop();
        return false;
      }

      const video = this.video!;
      video.srcObject = stream;
      await video.play();

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }

      await video.requestPictureInPicture();
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      return true;
    } catch (err) {
      console.warn('Video PiP failed:', err);
      this.stopCanvasLoop();
      return false;
    }
  }

  public async exitPip(): Promise<void> {
    if (this.pipWindow && !this.pipWindow.closed) {
      this.pipWindow.close();
      this.pipWindow = null;
    }
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // ignore
      }
    }
    this.stopCanvasLoop();
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  public isPipActive(): boolean {
    return Boolean(
      (this.pipWindow && !this.pipWindow.closed) ||
      document.pictureInPictureElement
    );
  }
}

export const pipManager = new PictureInPictureService();
