import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Globe, Plus, Trash2, Sun, Moon } from 'lucide-react';
import { ClockStyle, WorldClockCity, AnalogTheme } from '../types';
import { loadWorldCities, saveWorldCities } from '../utils/storage';

interface ClockViewProps {
  is24Hour: boolean;
  onToggle24Hour: () => void;
}

const AVAILABLE_TIMEZONES = [
  { name: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { name: 'New York', country: 'United States', timezone: 'America/New_York' },
  { name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { name: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich' },
  { name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { name: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles' },
  { name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
  { name: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai' },
  { name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
  { name: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
  { name: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
];

export const ClockView: React.FC<ClockViewProps> = ({ is24Hour, onToggle24Hour }) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [clockStyle, setClockStyle] = useState<ClockStyle>('analog');
  const [analogTheme, setAnalogTheme] = useState<AnalogTheme>('obsidian');
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [cities, setCities] = useState<WorldClockCity[]>(() => loadWorldCities());
  const [showAddCityModal, setShowAddCityModal] = useState<boolean>(false);

  const secHandRef = useRef<SVGGElement | null>(null);
  const subdialSecRef = useRef<SVGLineElement | null>(null);

  // 1Hz React tick for digital readout, date & World Clocks (avoids 29fps full-component + Intl re-renders)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // True 60fps hardware sweep hand update directly on SVG transform attribute (zero React re-renders)
  useEffect(() => {
    if (clockStyle !== 'analog' || !showSeconds) return;

    let rafId: number | null = null;
    const updateSweep = () => {
      const d = new Date();
      const angle = (d.getSeconds() + d.getMilliseconds() / 1000) * 6;
      if (secHandRef.current) {
        secHandRef.current.setAttribute('transform', `rotate(${angle} 200 200)`);
      }
      if (subdialSecRef.current) {
        subdialSecRef.current.setAttribute('transform', `rotate(${angle} 200 274)`);
      }
      rafId = requestAnimationFrame(updateSweep);
    };
    rafId = requestAnimationFrame(updateSweep);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [clockStyle, showSeconds]);

  const formatMainTime = () => {
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    let ampm = '';

    if (!is24Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes,
      seconds,
      ampm,
    };
  };

  const { hours, minutes, seconds, ampm } = formatMainTime();

  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateKey]
  );

  const cityFormatterCache = useRef<Record<string, Intl.DateTimeFormat>>({});

  const getCityTime = (timezone: string) => {
    try {
      let fmt = cityFormatterCache.current[timezone];
      if (!fmt) {
        fmt = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        cityFormatterCache.current[timezone] = fmt;
      }
      const parts = fmt.formatToParts(now);
      const hourPart = parts.find((p) => p.type === 'hour')?.value || '00';
      const minPart = parts.find((p) => p.type === 'minute')?.value || '00';
      let h = parseInt(hourPart, 10) % 24;
      const isNight = h < 6 || h >= 19;
      let meridiem = '';
      if (!is24Hour) {
        meridiem = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
      }
      const hourStr = h.toString().padStart(2, '0');
      return { timeStr: `${hourStr}:${minPart}`, meridiem, isNight };
    } catch {
      return { timeStr: '--:--', meridiem: '', isNight: false };
    }
  };

  const handleAddCity = (city: typeof AVAILABLE_TIMEZONES[0]) => {
    if (cities.some((c) => c.timezone === city.timezone)) {
      setShowAddCityModal(false);
      return;
    }
    const updated = [
      ...cities,
      {
        id: `city-${Date.now()}`,
        name: city.name,
        country: city.country,
        timezone: city.timezone,
      },
    ];
    setCities(updated);
    saveWorldCities(updated);
    setShowAddCityModal(false);
  };

  const handleRemoveCity = (id: string) => {
    const updated = cities.filter((c) => c.id !== id);
    setCities(updated);
    saveWorldCities(updated);
  };

  const secValue = now.getSeconds();
  const secAngle = secValue * 6;
  const minValue = now.getMinutes() + secValue / 60;
  const minAngle = minValue * 6;
  const hrValue = (now.getHours() % 12) + minValue / 60;
  const hrAngle = hrValue * 30;
  const hour24Value = now.getHours() + minValue / 60;
  const hour24Angle = hour24Value * 15;

  const dayOfMonth = now.getDate();
  const dayNameShort = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateKey]
  );

  const themeConfig = {
    obsidian: {
      name: 'Obsidian & Gold Chronometer',
      bezelOuter: '#2d2518',
      bezelMid: '#d97706',
      bezelHighlight: '#fbbf24',
      dialCenter: '#191a20',
      dialEdge: '#09090b',
      trackStroke: '#3f3f46',
      majorTick: '#f59e0b',
      minorTick: '#52525b',
      numeralColor: '#f4f4f5',
      hourHandGradStart: '#fef08a',
      hourHandGradEnd: '#b45309',
      minHandGradStart: '#fef9c3',
      minHandGradEnd: '#d97706',
      lumeColor: '#fef3c7',
      secHandColor: '#fbbf24',
      secTailColor: '#fbbf24',
      subdialRing: '#27272a',
      subdialBg: '#0f1013',
      subdialHand: '#f59e0b',
      apertureBorder: '#b45309',
      apertureBg: '#050507',
      apertureText: '#fbbf24',
      badgeClass: 'ch-text-accent',
    },
    flieger: {
      name: 'Aviation Flieger Pilot (Lume)',
      bezelOuter: '#27272a',
      bezelMid: '#3f3f46',
      bezelHighlight: '#10b981',
      dialCenter: '#0d1010',
      dialEdge: '#040505',
      trackStroke: '#1f2937',
      majorTick: '#10b981',
      minorTick: '#22543d',
      numeralColor: '#e6fffa',
      hourHandGradStart: '#a7f3d0',
      hourHandGradEnd: '#059669',
      minHandGradStart: '#6ee7b7',
      minHandGradEnd: '#047857',
      lumeColor: '#34d399',
      secHandColor: '#f97316',
      secTailColor: '#f97316',
      subdialRing: '#134e4a',
      subdialBg: '#051814',
      subdialHand: '#10b981',
      apertureBorder: '#059669',
      apertureBg: '#03140f',
      apertureText: '#34d399',
      badgeClass: 'text-emerald-500',
    },
    bauhaus: {
      name: 'Bauhaus Modern Minimalist',
      bezelOuter: '#334155',
      bezelMid: '#64748b',
      bezelHighlight: '#38bdf8',
      dialCenter: '#131b2e',
      dialEdge: '#070b14',
      trackStroke: '#1e293b',
      majorTick: '#38bdf8',
      minorTick: '#475569',
      numeralColor: '#f8fafc',
      hourHandGradStart: '#ffffff',
      hourHandGradEnd: '#94a3b8',
      minHandGradStart: '#ffffff',
      minHandGradEnd: '#cbd5e1',
      lumeColor: '#38bdf8',
      secHandColor: '#ef4444',
      secTailColor: '#ef4444',
      subdialRing: '#1e293b',
      subdialBg: '#0c1220',
      subdialHand: '#38bdf8',
      apertureBorder: '#0284c7',
      apertureBg: '#030712',
      apertureText: '#38bdf8',
      badgeClass: 'text-sky-500',
    },
  }[analogTheme];

  const hourNumerals = [
    { num: '12', hour: 12 },
    { num: '1', hour: 1 },
    { num: '2', hour: 2 },
    { num: '3', hour: 3 },
    { num: '4', hour: 4 },
    { num: '5', hour: 5 },
    { num: '6', hour: 6 },
    { num: '7', hour: 7 },
    { num: '8', hour: 8 },
    { num: '9', hour: 9 },
    { num: '10', hour: 10 },
    { num: '11', hour: 11 },
  ].map(({ num, hour }) => {
    const rad = (hour * 30 * Math.PI) / 180;
    const r = 144;
    return {
      num,
      hour,
      x: 200 + r * Math.sin(rad),
      y: 200 - r * Math.cos(rad) + 5,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b ch-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight ch-text">Global Study Clock</h2>
            <span className="text-xs ch-text-muted">· Precision Horology</span>
          </div>
          <p className="text-xs ch-text-muted mt-0.5">
            Synchronized astronomical time, calibrated vector Swiss dial, and world study timezones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 ch-glass-card rounded-xl">
            {(['analog', 'modern', 'flip', 'oled'] as ClockStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setClockStyle(style)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                  clockStyle === style ? 'ch-accent-soft font-bold' : 'ch-text-muted hover:ch-text'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {clockStyle === 'analog' && (
            <div className="flex items-center p-1 ch-glass-card rounded-xl">
              {(['obsidian', 'flieger', 'bauhaus'] as AnalogTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setAnalogTheme(thm)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                    analogTheme === thm ? 'ch-accent-soft' : 'ch-text-muted hover:ch-text'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onToggle24Hour}
            className="ch-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-xl"
          >
            {is24Hour ? '24-Hour' : '12-Hour'}
          </button>

          <button
            onClick={() => setShowSeconds(!showSeconds)}
            className={`px-3 py-1.5 text-xs font-medium border rounded-xl transition-colors ${
              showSeconds ? 'ch-accent-soft' : 'ch-btn-secondary'
            }`}
          >
            {showSeconds ? 'Sweep On' : 'Sweep Off'}
          </button>
        </div>
      </div>

      {/* Main Clock Showcase */}
      <div className="relative overflow-hidden rounded-3xl ch-glass-card p-5 sm:p-8 flex flex-col items-center justify-center text-center">
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="text-xs sm:text-sm font-medium tracking-wide ch-text-muted mb-2">
            {formattedDate}
          </div>

          {/* Analog Swiss Vector Dial (Hardware face preserves rich watch contrast across themes) */}
          {clockStyle === 'analog' && (
            <div className="my-2 flex flex-col items-center w-full">
              <div className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px] aspect-square flex items-center justify-center p-2 select-none">
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full overflow-visible"
                  style={{ shapeRendering: 'geometricPrecision' }}
                >
                  <defs>
                    <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={themeConfig.dialCenter} />
                      <stop offset="70%" stopColor={themeConfig.dialCenter} />
                      <stop offset="100%" stopColor={themeConfig.dialEdge} />
                    </radialGradient>

                    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={themeConfig.bezelHighlight} />
                      <stop offset="50%" stopColor={themeConfig.bezelMid} />
                      <stop offset="100%" stopColor={themeConfig.bezelOuter} />
                    </linearGradient>

                    <linearGradient id="hourHandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={themeConfig.hourHandGradStart} />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor={themeConfig.hourHandGradEnd} />
                    </linearGradient>

                    <linearGradient id="minHandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={themeConfig.minHandGradStart} />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor={themeConfig.minHandGradEnd} />
                    </linearGradient>

                    <radialGradient id="hubGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#e4e4e7" />
                      <stop offset="100%" stopColor="#52525b" />
                    </radialGradient>
                  </defs>

                  <circle cx="200" cy="200" r="198" fill="#09090b" stroke="#18181b" strokeWidth="2" />
                  <circle cx="200" cy="200" r="192" fill="none" stroke="url(#bezelGrad)" strokeWidth="8" />
                  <circle cx="200" cy="200" r="185" fill="none" stroke="#27272a" strokeWidth="1" />
                  <circle cx="200" cy="200" r="184" fill="url(#dialGrad)" />
                  <circle cx="200" cy="200" r="168" fill="none" stroke={themeConfig.trackStroke} strokeWidth="0.8" strokeDasharray="1 3" />
                  <circle cx="200" cy="200" r="120" fill="none" stroke={themeConfig.trackStroke} strokeWidth="0.5" opacity="0.4" />

                  {Array.from({ length: 60 }).map((_, i) => {
                    const isMajor = i % 5 === 0;
                    const isQuarter = i % 15 === 0;
                    const angle = i * 6;
                    return (
                      <line
                        key={i}
                        x1="200"
                        y1={isMajor ? 24 : 27}
                        x2="200"
                        y2={isMajor ? (isQuarter ? 42 : 38) : 32}
                        stroke={isMajor ? themeConfig.majorTick : themeConfig.minorTick}
                        strokeWidth={isMajor ? (isQuarter ? 3.5 : 2.5) : 1}
                        strokeLinecap="round"
                        transform={`rotate(${angle} 200 200)`}
                      />
                    );
                  })}

                  <g id="subdial-24h">
                    <circle
                      cx="200"
                      cy="126"
                      r="32"
                      fill={themeConfig.subdialBg}
                      stroke={themeConfig.subdialRing}
                      strokeWidth="1.2"
                    />
                    <circle cx="200" cy="126" r="30" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="1 2" />
                    <g transform="translate(193, 100)">
                      <circle cx="7" cy="7" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="1" />
                      <line x1="7" y1="0.5" x2="7" y2="2" stroke="#f59e0b" strokeWidth="1" />
                      <line x1="7" y1="12" x2="7" y2="13.5" stroke="#f59e0b" strokeWidth="1" />
                      <line x1="0.5" y1="7" x2="2" y2="7" stroke="#f59e0b" strokeWidth="1" />
                      <line x1="12" y1="7" x2="13.5" y2="7" stroke="#f59e0b" strokeWidth="1" />
                    </g>
                    <text x="200" y="148" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
                      24H
                    </text>
                    <text x="175" y="129" textAnchor="middle" fill="#52525b" fontSize="6" fontFamily="monospace">
                      18
                    </text>
                    <text x="225" y="129" textAnchor="middle" fill="#52525b" fontSize="6" fontFamily="monospace">
                      6
                    </text>
                    <text x="200" y="112" textAnchor="middle" fill="#52525b" fontSize="6" fontFamily="monospace">
                      12
                    </text>
                    <line
                      x1="200"
                      y1="126"
                      x2="200"
                      y2="103"
                      stroke={themeConfig.subdialHand}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      transform={`rotate(${hour24Angle} 200 126)`}
                    />
                    <circle cx="200" cy="126" r="2.5" fill="#71717a" />
                  </g>

                  <g id="subdial-chrono">
                    <circle
                      cx="200"
                      cy="274"
                      r="32"
                      fill={themeConfig.subdialBg}
                      stroke={themeConfig.subdialRing}
                      strokeWidth="1.2"
                    />
                    <circle cx="200" cy="274" r="30" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="1 2" />
                    <text x="200" y="253" textAnchor="middle" fill="#71717a" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                      60
                    </text>
                    <text x="223" y="276" textAnchor="middle" fill="#52525b" fontSize="6" fontFamily="monospace">
                      15
                    </text>
                    <text x="200" y="299" textAnchor="middle" fill="#52525b" fontSize="6" fontFamily="monospace">
                      30
                    </text>
                    <text x="177" y="276" textAnchor="middle" fill="#52525b" fontSize="6" fontFamily="monospace">
                      45
                    </text>
                    <line
                      ref={subdialSecRef}
                      x1="200"
                      y1="274"
                      x2="200"
                      y2="251"
                      stroke={themeConfig.secHandColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      transform={`rotate(${secAngle} 200 274)`}
                    />
                    <circle cx="200" cy="274" r="2.5" fill="#71717a" />
                  </g>

                  <g id="date-aperture">
                    <rect
                      x="266"
                      y="188"
                      width="48"
                      height="24"
                      rx="3"
                      fill={themeConfig.apertureBg}
                      stroke={themeConfig.apertureBorder}
                      strokeWidth="1.2"
                    />
                    <line x1="267" y1="189" x2="313" y2="189" stroke="#000000" strokeWidth="1" opacity="0.6" />
                    <text
                      x="281"
                      y="204"
                      textAnchor="middle"
                      fill={themeConfig.apertureText}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {dayOfMonth.toString().padStart(2, '0')}
                    </text>
                    <text
                      x="302"
                      y="204"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="8"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {dayNameShort}
                    </text>
                  </g>

                  <g id="brand-wordmark" opacity="0.9">
                    <text
                      x="142"
                      y="199"
                      textAnchor="middle"
                      fill="#e4e4e7"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="800"
                      letterSpacing="2.5"
                    >
                      CHRONOS
                    </text>
                    <text
                      x="142"
                      y="208"
                      textAnchor="middle"
                      fill="#71717a"
                      fontSize="5.5"
                      fontFamily="monospace"
                      letterSpacing="1.2"
                    >
                      OFFICIAL STUDY
                    </text>
                  </g>

                  {hourNumerals.map(({ num, hour, x, y }) => {
                    if (analogTheme === 'flieger' && hour === 12) {
                      return (
                        <g key={hour} transform="translate(192, 50)">
                          <polygon points="8,0 0,16 16,16" fill="#10b981" />
                          <circle cx="-3" cy="4" r="2" fill="#10b981" />
                          <circle cx="19" cy="4" r="2" fill="#10b981" />
                        </g>
                      );
                    }
                    return (
                      <text
                        key={hour}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={themeConfig.numeralColor}
                        fontSize={hour % 3 === 0 ? '14' : '12'}
                        fontWeight={hour % 3 === 0 ? '800' : '600'}
                        fontFamily="monospace"
                        className="tabular-nums"
                      >
                        {num}
                      </text>
                    );
                  })}

                  <g id="hour-hand" transform={`rotate(${hrAngle} 200 200)`}>
                    <polygon points="196,218 204,218 205,200 195,200" fill="#27272a" />
                    <polygon
                      points="195,200 197,112 200,102 203,112 205,200"
                      fill="url(#hourHandGrad)"
                      stroke="#27272a"
                      strokeWidth="0.8"
                    />
                    <line
                      x1="200"
                      y1="184"
                      x2="200"
                      y2="116"
                      stroke={themeConfig.lumeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>

                  <g id="minute-hand" transform={`rotate(${minAngle} 200 200)`}>
                    <polygon points="197,224 203,224 204,200 196,200" fill="#27272a" />
                    <polygon
                      points="196,200 198,66 200,54 202,66 204,200"
                      fill="url(#minHandGrad)"
                      stroke="#27272a"
                      strokeWidth="0.8"
                    />
                    <line
                      x1="200"
                      y1="186"
                      x2="200"
                      y2="72"
                      stroke={themeConfig.lumeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>

                  {showSeconds && (
                    <g id="second-hand" ref={secHandRef} transform={`rotate(${secAngle} 200 200)`}>
                      <line
                        x1="200"
                        y1="236"
                        x2="200"
                        y2="34"
                        stroke={themeConfig.secHandColor}
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="200"
                        cy="222"
                        r="4.5"
                        fill="#09090b"
                        stroke={themeConfig.secTailColor}
                        strokeWidth="1.5"
                      />
                      <circle cx="200" cy="52" r="2.2" fill={themeConfig.secHandColor} />
                    </g>
                  )}

                  <circle cx="200" cy="200" r="7" fill="url(#hubGrad)" stroke="#18181b" strokeWidth="1.5" />
                  <circle cx="200" cy="200" r="2.5" fill="#09090b" />
                </svg>
              </div>

              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="font-mono text-sm sm:text-base font-bold ch-text tabular-nums">
                  {hours}:{minutes} {showSeconds && `:${seconds}`} {!is24Hour && ampm}
                </span>
                <span className="ch-text-muted">·</span>
                <span className={`text-xs font-semibold ${themeConfig.badgeClass}`}>
                  {themeConfig.name}
                </span>
              </div>
            </div>
          )}

          {/* Modern Digital Face */}
          {clockStyle === 'modern' && (
            <div className="flex items-baseline justify-center gap-2 md:gap-4 my-6">
              <span className="font-mono text-5xl @sm/main:text-7xl @xl/main:text-8xl @3xl/main:text-9xl font-bold tracking-tight ch-text tabular-nums">
                {hours}:{minutes}
              </span>
              {showSeconds && (
                <span className="font-mono text-2xl @sm/main:text-4xl @xl/main:text-5xl font-semibold ch-text-accent tabular-nums">
                  :{seconds}
                </span>
              )}
              {!is24Hour && (
                <span className="text-base @sm/main:text-2xl font-bold ch-text-muted ml-1">{ampm}</span>
              )}
            </div>
          )}

          {/* Flip Clock Face */}
          {clockStyle === 'flip' && (
            <div className="flex items-center justify-center gap-2 @sm/main:gap-3 @xl/main:gap-4 my-6 flex-wrap">
              <div className="flex flex-col items-center">
                <div className="relative ch-glass-panel rounded-2xl px-3.5 py-2.5 @sm/main:px-5 @sm/main:py-4 @xl/main:px-6 @xl/main:py-5">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/15 dark:bg-white/10" />
                  <span className="font-mono text-4xl @sm/main:text-6xl @xl/main:text-7xl font-extrabold ch-text tabular-nums">
                    {hours}
                  </span>
                </div>
                <span className="text-[11px] font-semibold ch-text-muted mt-2">Hours</span>
              </div>

              <span className="font-mono text-3xl @sm/main:text-4xl ch-text-muted font-bold">:</span>

              <div className="flex flex-col items-center">
                <div className="relative ch-glass-panel rounded-2xl px-3.5 py-2.5 @sm/main:px-5 @sm/main:py-4 @xl/main:px-6 @xl/main:py-5">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/15 dark:bg-white/10" />
                  <span className="font-mono text-4xl @sm/main:text-6xl @xl/main:text-7xl font-extrabold ch-text tabular-nums">
                    {minutes}
                  </span>
                </div>
                <span className="text-[11px] font-semibold ch-text-muted mt-2">Minutes</span>
              </div>

              {showSeconds && (
                <>
                  <span className="font-mono text-3xl @sm/main:text-4xl ch-text-muted font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <div className="relative ch-accent-soft rounded-2xl px-3.5 py-2.5 @sm/main:px-5 @sm/main:py-4 @xl/main:px-6 @xl/main:py-5">
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/10 dark:bg-white/10" />
                      <span className="font-mono text-4xl @sm/main:text-6xl @xl/main:text-7xl font-extrabold ch-text-accent tabular-nums">
                        {seconds}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold ch-text-accent mt-2">Seconds</span>
                  </div>
                </>
              )}

              {!is24Hour && (
                <div className="ml-1 px-3 py-2 ch-glass-subtle rounded-xl text-base @sm/main:text-lg font-bold ch-text-secondary">
                  {ampm}
                </div>
              )}
            </div>
          )}

          {/* Zero Eye Strain OLED */}
          {clockStyle === 'oled' && (
            <div className="my-8">
              <span className="font-mono text-5xl @sm/main:text-7xl @2xl/main:text-8xl font-light ch-text tracking-wider tabular-nums">
                {hours}:{minutes}
              </span>
              <div className="text-xs ch-text-muted font-mono tracking-widest mt-2 uppercase">
                Zero Eye Strain Mode
              </div>
            </div>
          )}

          <div className="mt-3 text-xs ch-text-muted flex items-center gap-2 flex-wrap justify-center">
            <span>Local Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            <span>·</span>
            <span>Horological Study Engine Active</span>
          </div>
        </div>
      </div>

      {/* World Clock Cities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 ch-text-accent" />
            <h3 className="text-sm font-semibold ch-text">World Study Clocks</h3>
            <span className="text-xs ch-text-muted">· {cities.length} timezones</span>
          </div>
          <button
            onClick={() => setShowAddCityModal(true)}
            className="ch-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Timezone
          </button>
        </div>

        <div className="grid grid-cols-1 @md/main:grid-cols-2 @3xl/main:grid-cols-3 gap-3">
          {cities.map((city) => {
            const { timeStr, meridiem, isNight } = getCityTime(city.timezone);
            return (
              <div
                key={city.id}
                className="group relative flex items-center justify-between p-4 ch-glass-card hover:border-[var(--ch-border-strong)] rounded-2xl transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold ch-text truncate">{city.name}</span>
                    {isNight ? (
                      <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs ch-text-secondary truncate">{city.country}</div>
                  <div className="text-[11px] ch-text-muted font-mono mt-0.5 truncate">{city.timezone}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold ch-text tabular-nums">{timeStr}</div>
                    {!is24Hour && (
                      <div className="text-[10px] font-semibold ch-text-muted uppercase">{meridiem}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCity(city.id)}
                    title="Remove timezone"
                    className="opacity-70 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 ch-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add City Modal */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col ch-glass-modal rounded-3xl p-5 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b ch-border pb-3">
              <h4 className="text-sm font-bold ch-text">Add International Timezone</h4>
              <button
                onClick={() => setShowAddCityModal(false)}
                className="text-xs ch-text-muted hover:ch-text"
              >
                Close
              </button>
            </div>
            <p className="text-xs ch-text-muted">
              Select a study partner, exam schedule, or lecture location timezone to monitor:
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {AVAILABLE_TIMEZONES.filter((tz) => !cities.some((c) => c.timezone === tz.timezone)).map(
                (tz) => (
                  <button
                    key={tz.timezone}
                    onClick={() => handleAddCity(tz)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl ch-glass-subtle hover:border-[var(--ch-border-strong)] text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium ch-text">{tz.name}</div>
                      <div className="text-xs ch-text-muted">{tz.country}</div>
                    </div>
                    <span className="text-xs ch-text-muted font-mono">{tz.timezone}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
