import React, { useId, useState, useEffect, useRef } from 'react';
import { Crown, Shield, Flame, Award, Sparkles, Star, Compass } from 'lucide-react';
import {
  getStoreAvatarById,
  getStoreBackgroundById,
  getStoreFrameById,
  getScholarRank,
} from '../utils/storage';
import { BannerArtworkKey, FrameOrnamentKey, StoreAvatarItem } from '../types';

const ProtectedCosmeticImage: React.FC<{
  src: string;
  className: string;
  style?: React.CSSProperties;
  shimmerClassName?: string;
  showShimmer?: boolean;
}> = ({ src, className, style, shimmerClassName = 'bg-white/10', showShimmer = true }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <>
      {showShimmer && !loaded && (
        <div
          className={`absolute inset-0 animate-pulse pointer-events-none ${shimmerClassName}`}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={style}
      />
    </>
  );
};

export const AvatarEmblemSvg: React.FC<{
  emblemKey: StoreAvatarItem['emblemKey'];
  accentHex: string;
  className?: string;
}> = ({ emblemKey, accentHex, className = 'w-8 h-8' }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  switch (emblemKey) {
    case 'owl':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M16 18L24 23C27 21.5 37 21.5 40 23L48 18L46 32C46 43 39 51 32 53C25 51 18 43 18 32L16 18Z"
            stroke={accentHex}
            strokeWidth="2.8"
            fill="rgba(255,255,255,0.08)"
          />
          <circle cx="25" cy="31" r="4.5" stroke={accentHex} strokeWidth="2.4" />
          <circle cx="39" cy="31" r="4.5" stroke={accentHex} strokeWidth="2.4" />
          <circle cx="25" cy="31" r="1.6" fill={accentHex} />
          <circle cx="39" cy="31" r="1.6" fill={accentHex} />
          <path d="M29.5 36L32 40L34.5 36H29.5Z" fill={accentHex} />
        </svg>
      );
    case 'chronomancer':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="19" stroke={accentHex} strokeWidth="2.6" />
          <circle cx="32" cy="32" r="13" stroke={accentHex} strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M32 18V32L41 37" stroke={accentHex} strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2.6" fill={accentHex} />
          <path d="M32 8V13M32 51V56M8 32H13M51 32H56" stroke={accentHex} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'knight':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M32 10L48 16V31C48 42.5 40.5 50 32 54C23.5 50 16 42.5 16 31V16L32 10Z"
            stroke={accentHex}
            strokeWidth="2.8"
            fill="rgba(255,255,255,0.08)"
          />
          <path d="M22 26H42M32 17V45M24 34L32 38L40 34" stroke={accentHex} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'phoenix':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M32 13C35 20 35 25 32 30C29 25 29 20 32 13Z" fill={accentHex} />
          <path
            d="M12 22C19 22 24 27 28 35C22 36 16 32 12 22Z"
            stroke={accentHex}
            strokeWidth="2.5"
            fill="rgba(251,113,133,0.18)"
          />
          <path
            d="M52 22C45 22 40 27 36 35C42 36 48 32 52 22Z"
            stroke={accentHex}
            strokeWidth="2.5"
            fill="rgba(251,113,133,0.18)"
          />
          <path d="M24 44L32 52L40 44L32 34L24 44Z" stroke={accentHex} strokeWidth="2.5" />
        </svg>
      );
    case 'wolf':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M15 16L25 24H39L49 16L46 35L32 52L18 35L15 16Z"
            stroke={accentHex}
            strokeWidth="2.7"
            fill="rgba(45,212,191,0.12)"
          />
          <path d="M22 31L28 33M42 31L36 33" stroke={accentHex} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M29 41L32 45L35 41H29Z" fill={accentHex} />
        </svg>
      );
    case 'samurai':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M14 28C14 19 22 14 32 14C42 14 50 19 50 28L53 38H11L14 28Z"
            stroke={accentHex}
            strokeWidth="2.5"
            fill="rgba(232,121,249,0.14)"
          />
          <path d="M21 15L32 23L43 15" stroke={accentHex} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M21 43L27 51H37L43 43" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 32H40" stroke={accentHex} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'dragon':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M16 14L24 22L32 12L40 22L48 14L45 33L32 52L19 33L16 14Z"
            stroke={accentHex}
            strokeWidth="2.7"
            fill="rgba(250,204,21,0.16)"
          />
          <path d="M23 30L29 33M41 30L35 33" stroke={accentHex} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M28 41L32 37L36 41L32 46L28 41Z" fill={accentHex} />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="20" stroke={accentHex} strokeWidth="2.4" />
          <path
            d="M32 12L37 27L52 32L37 37L32 52L27 37L12 32L27 27L32 12Z"
            stroke={accentHex}
            strokeWidth="2.4"
            fill="rgba(125,211,252,0.16)"
          />
          <circle cx="32" cy="32" r="3" fill={accentHex} />
        </svg>
      );
    case 'falcon':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M10 22L24 18L32 12L40 18L54 22L44 35L32 52L20 35L10 22Z"
            stroke={accentHex}
            strokeWidth="2.6"
            fill="rgba(52,211,153,0.15)"
          />
          <path d="M23 26L32 32L41 26" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M29 38L32 46L35 38H29Z" fill={accentHex} />
        </svg>
      );
    case 'lion':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M20 14L27 20H37L44 14L50 26L46 42L32 52L18 42L14 26L20 14Z"
            stroke={accentHex}
            strokeWidth="2.6"
            fill="rgba(253,224,71,0.16)"
          />
          <path d="M24 29L29 31M40 29L35 31" stroke={accentHex} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M27 38L32 42L37 38" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'celestial':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="18" stroke={accentHex} strokeWidth="2.4" />
          <path
            d="M36 16C28 19 23 26 24 34C25 42 32 47 40 46C33 50 22 47 18 39C14 31 18 20 26 16C29 14.5 33 14.5 36 16Z"
            fill={accentHex}
            opacity="0.85"
          />
          <circle cx="42" cy="24" r="3.5" fill={accentHex} />
        </svg>
      );
    case 'lotus':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M32 12C37 21 38 32 32 42C26 32 27 21 32 12Z"
            stroke={accentHex}
            strokeWidth="2.4"
            fill="rgba(249,168,212,0.22)"
          />
          <path
            d="M19 21C25 24 29 33 32 42C23 40 17 32 19 21Z"
            stroke={accentHex}
            strokeWidth="2.2"
            fill="rgba(249,168,212,0.12)"
          />
          <path
            d="M45 21C39 24 35 33 32 42C41 40 47 32 45 21Z"
            stroke={accentHex}
            strokeWidth="2.2"
            fill="rgba(249,168,212,0.12)"
          />
          <path
            d="M12 34C19 35 25 39 32 45C22 47 14 43 12 34Z"
            stroke={accentHex}
            strokeWidth="2.2"
          />
          <path
            d="M52 34C45 35 39 39 32 45C42 47 50 43 52 34Z"
            stroke={accentHex}
            strokeWidth="2.2"
          />
          <path d="M20 50H44" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'alchemist':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M25 13H39M28 13V22L15 44C13.5 47 15.5 51 19.5 51H44.5C48.5 51 50.5 47 49 44L36 22V13" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 40H45L47.5 44.5C48.5 46.5 47 49 44.5 49H19.5C17 49 15.5 46.5 16.5 44.5L19 40Z" fill={accentHex} opacity="0.28" />
          <circle cx="32" cy="36" r="6" stroke={accentHex} strokeWidth="2" />
          <path d="M32 30L37 39H27L32 30Z" stroke={accentHex} strokeWidth="1.6" />
        </svg>
      );
    case 'spartan':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M21 15C26 9 38 9 43 15L46 21C41 18 23 18 18 21L21 15Z"
            fill={accentHex}
            opacity="0.32"
            stroke={accentHex}
            strokeWidth="2.2"
          />
          <path
            d="M17 24C17 18 47 18 47 24L45 45L36 53V36H32H28V53L19 45L17 24Z"
            stroke={accentHex}
            strokeWidth="2.6"
            fill="rgba(255,255,255,0.06)"
            strokeLinejoin="round"
          />
          <path d="M21 31L29 33M43 31L35 33" stroke={accentHex} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'kitsune':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M16 12L26 24H38L48 12L49 33L32 52L15 33L16 12Z"
            stroke={accentHex}
            strokeWidth="2.6"
            fill="rgba(253,164,175,0.14)"
            strokeLinejoin="round"
          />
          <path d="M21 30L28 33L22 35Z" fill={accentHex} />
          <path d="M43 30L36 33L42 35Z" fill={accentHex} />
          <path d="M24 41L29 43M40 41L35 43M32 23V28" stroke={accentHex} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'pegasus':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 24C18 17 26 17 31 24C27 29 20 31 12 24Z"
            stroke={accentHex}
            strokeWidth="2.3"
            fill="rgba(147,197,253,0.18)"
          />
          <path
            d="M52 24C46 17 38 17 33 24C37 29 44 31 52 24Z"
            stroke={accentHex}
            strokeWidth="2.3"
            fill="rgba(147,197,253,0.18)"
          />
          <path
            d="M28 16L32 10L36 16L39 36L32 52L25 36L28 16Z"
            stroke={accentHex}
            strokeWidth="2.5"
            fill="rgba(255,255,255,0.08)"
          />
          <circle cx="32" cy="27" r="2.2" fill={accentHex} />
        </svg>
      );
    case 'griffin':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M12 18L24 23L20 34L12 18ZM52 18L40 23L44 34L52 18Z" stroke={accentHex} strokeWidth="2.4" fill="rgba(253,224,71,0.16)" />
          <path
            d="M25 14L32 20L39 14L43 32L32 51L21 32L25 14Z"
            stroke={accentHex}
            strokeWidth="2.6"
            fill="rgba(253,224,71,0.12)"
          />
          <path d="M27 32L32 39L37 32L32 29L27 32Z" fill={accentHex} />
        </svg>
      );
    case 'anim-chronocore':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <g className="ch-anim-spin-slow">
            <circle cx="32" cy="32" r="20" stroke={accentHex} strokeWidth="2.4" strokeDasharray="5 3" />
            <circle cx="32" cy="32" r="14" stroke="#fde68a" strokeWidth="1.4" />
          </g>
          <g className="ch-anim-spin-rev">
            <polygon
              points="32,16 37,26 48,32 37,38 32,48 27,38 16,32 27,26"
              stroke={accentHex}
              strokeWidth="1.8"
              fill="rgba(251,191,36,0.14)"
            />
          </g>
          <g className="ch-anim-spin-fast">
            <line x1="32" y1="32" x2="32" y2="15" stroke="#fef08a" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <circle cx="32" cy="32" r="3.2" fill="#fef08a" />
        </svg>
      );
    case 'anim-reactor':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <g className="ch-anim-spin-slow">
            <ellipse cx="32" cy="32" rx="22" ry="9" stroke={accentHex} strokeWidth="2" />
            <circle cx="54" cy="32" r="2.2" fill="#a5f3fc" />
          </g>
          <g className="ch-anim-spin-rev">
            <ellipse
              cx="32"
              cy="32"
              rx="22"
              ry="9"
              transform="rotate(60 32 32)"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <ellipse
              cx="32"
              cy="32"
              rx="22"
              ry="9"
              transform="rotate(-60 32 32)"
              stroke="#34d399"
              strokeWidth="1.8"
            />
          </g>
          <circle cx="32" cy="32" r="7.5" fill="rgba(34,211,238,0.28)" stroke={accentHex} strokeWidth="2" className="ch-anim-pulse" />
          <circle cx="32" cy="32" r="3" fill="#ecfeff" />
        </svg>
      );
    case 'anim-phoenixfire':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <circle cx="32" cy="34" r="19" stroke="#fb923c" strokeWidth="1.8" strokeDasharray="4 4" className="ch-anim-pulse" />
          <g className="ch-anim-float">
            <path d="M32 11C36 19 36 25 32 31C28 25 28 19 32 11Z" fill="#fde047" />
            <path
              d="M11 22C19 22 25 28 29 37C21 38 15 33 11 22Z"
              stroke={accentHex}
              strokeWidth="2.4"
              fill="rgba(244,63,94,0.26)"
            />
            <path
              d="M53 22C45 22 39 28 35 37C43 38 49 33 53 22Z"
              stroke={accentHex}
              strokeWidth="2.4"
              fill="rgba(244,63,94,0.26)"
            />
            <path d="M25 43L32 52L39 43L32 33L25 43Z" fill="rgba(251,191,36,0.3)" stroke="#fde047" strokeWidth="2.2" />
          </g>
          <circle cx="19" cy="44" r="1.8" fill="#fde047" className="ch-anim-ember" />
          <circle cx="45" cy="42" r="1.8" fill="#fb7185" className="ch-anim-ember" style={{ animationDelay: '1.1s' }} />
        </svg>
      );
    case 'anim-singularity':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <g className="ch-anim-spin-slow">
            <circle cx="32" cy="32" r="22" stroke={accentHex} strokeWidth="1.8" strokeDasharray="6 4" />
            <circle cx="32" cy="10" r="2.5" fill="#fef08a" />
            <circle cx="32" cy="54" r="2.5" fill="#e879f9" />
          </g>
          <g className="ch-anim-spin-rev">
            <polygon
              points="32,14 37,27 50,32 37,37 32,50 27,37 14,32 27,27"
              stroke="#e879f9"
              strokeWidth="2"
              fill="rgba(168,85,247,0.2)"
            />
          </g>
          <circle cx="32" cy="32" r="6" fill="#090617" stroke="#fde047" strokeWidth="2.4" className="ch-anim-pulse" />
          <circle cx="32" cy="32" r="2.2" fill="#fef08a" />
        </svg>
      );
    case 'face-scholar':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fsch-skin-${uid}`} x1="20" y1="16" x2="44" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde0c2" />
              <stop offset="100%" stopColor="#eab38c" />
            </linearGradient>
            <linearGradient id={`fsch-hood-${uid}`} x1="12" y1="42" x2="52" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Warm ambient desk glow */}
          <circle cx="32" cy="30" r="26" fill={accentHex} opacity="0.14" />
          {/* Hoodie & Neck */}
          <path d="M10 64C12 50 20 45 32 45C44 45 52 50 54 64H10Z" fill={`url(#fsch-hood-${uid})`} stroke="#475569" strokeWidth="1.2" />
          <path d="M26 42H38V50C38 52 35 53 32 53C29 53 26 52 26 50V42Z" fill="#dfa57e" />
          <path d="M21 47C25 53 39 53 43 47" stroke={accentHex} strokeWidth="1.4" strokeOpacity="0.7" strokeLinecap="round" />
          {/* Headphone Band */}
          <path d="M14 33C14 17 22 10 32 10C42 10 50 17 50 33" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M14 33C14 17 22 10 32 10C42 10 50 17 50 33" stroke={accentHex} strokeWidth="1.2" strokeLinecap="round" />
          {/* Face */}
          <path d="M19 26C19 17 24.5 13 32 13C39.5 13 45 17 45 26C45 36.5 39.5 44.5 32 45.5C24.5 44.5 19 36.5 19 26Z" fill={`url(#fsch-skin-${uid})`} />
          {/* Hair */}
          <path d="M18.5 27C17.5 17 23.5 10.5 32 10.5C40.5 10.5 46.5 17 45.5 27C43.5 21 40 19 35 20.5C31 16.5 24.5 19.5 21.5 24C20.2 25 19.3 26 18.5 27Z" fill="#1e1b2e" />
          <path d="M25 17.5C28 19.5 31 20.5 35 19" stroke="#312e4a" strokeWidth="1.3" strokeLinecap="round" />
          {/* Headphone Earcups */}
          <rect x="13" y="25" width="6.5" height="13" rx="3" fill="#1e293b" stroke={accentHex} strokeWidth="1.4" />
          <rect x="44.5" y="25" width="6.5" height="13" rx="3" fill="#1e293b" stroke={accentHex} strokeWidth="1.4" />
          {/* Eyebrows & Eyes */}
          <path d="M22.5 25.5Q26 23.8 29 25.2" stroke="#1e1b2e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M35 25.2Q38 23.8 41.5 25.5" stroke="#1e1b2e" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="26" cy="29.5" r="2" fill="#0f172a" />
          <circle cx="38" cy="29.5" r="2" fill="#0f172a" />
          <circle cx="26.7" cy="28.8" r="0.7" fill="#ffffff" />
          <circle cx="38.7" cy="28.8" r="0.7" fill="#ffffff" />
          {/* Round Amber-lit Glasses */}
          <circle cx="26" cy="29.5" r="5" fill="rgba(251,191,36,0.12)" stroke={accentHex} strokeWidth="1.5" />
          <circle cx="38" cy="29.5" r="5" fill="rgba(251,191,36,0.12)" stroke={accentHex} strokeWidth="1.5" />
          <path d="M31 29.5H33M23.5 27L25 28.5M35.5 27L37 28.5" stroke={accentHex} strokeWidth="1.3" strokeLinecap="round" />
          {/* Nose & Calm Smile */}
          <path d="M32 30.5V34.5L33.5 35.5" stroke="#c88d68" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28.5 39C30.5 40.5 33.8 40.5 35.5 39" stroke="#9a5c44" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'face-booyah':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fby-skin-${uid}`} x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8d8bc" />
              <stop offset="100%" stopColor="#dda27b" />
            </linearGradient>
            <linearGradient id={`fby-visor-${uid}`} x1="18" y1="25" x2="36" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          {/* Tactical jacket & crimson battle scarf */}
          <path d="M8 64L16 45H48L56 64H8Z" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
          <path d="M27 40H37V48H27V40Z" fill="#cb8f6a" />
          <path d="M18 45C22 50 42 50 46 45L49 55C40 59 24 59 15 55L18 45Z" fill="#be123c" stroke="#fb7185" strokeWidth="1.1" />
          {/* Ears */}
          <path d="M18 28C16 28 16 34 18.5 34.5" fill="#dda27b" />
          <path d="M46 28C48 28 48 34 45.5 34.5" fill="#dda27b" />
          {/* Sharp jawline face */}
          <path d="M19 24C19 16 25 13 32 13C39 13 45 16 45 24L43.5 36.5L32 45L20.5 36.5L19 24Z" fill={`url(#fby-skin-${uid})`} />
          {/* Swept Silver-Frost Hair */}
          <path d="M17 27C15 17 21 8.5 33 8.5C43 8.5 49 15 47 26L44 21L38 23.5L35 17.5L26 24L20 20L17 27Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.9" />
          <path d="M25 13L31 19M35 11.5L39 19" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
          {/* Right Natural Eye + Fierce Brow */}
          <path d="M35 25L42 23.5" stroke="#1e293b" strokeWidth="1.7" strokeLinecap="round" />
          <ellipse cx="38" cy="28.5" rx="2.3" ry="1.8" fill="#0f172a" />
          <circle cx="38.8" cy="28" r="0.7" fill="#ffffff" />
          {/* Left Glowing Cyber Eye-Visor */}
          <path d="M17 25.5L31.5 25.5L30 32.5H19L17 25.5Z" fill={`url(#fby-visor-${uid})`} stroke="#a5f3fc" strokeWidth="1.2" />
          <line x1="21" y1="29" x2="28" y2="29" stroke="#ecfeff" strokeWidth="1.1" strokeLinecap="round" />
          {/* Nose & Gritty Smirk */}
          <path d="M32 29.5V34L33.5 35" stroke="#ba7e5a" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M28 38.5C30.5 39.5 34.5 39 36.5 37.5" stroke="#854534" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'face-maharaja':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fmah-skin-${uid}`} x1="20" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e5ae82" />
              <stop offset="100%" stopColor="#ba7b4f" />
            </linearGradient>
            <linearGradient id={`fmah-turb-${uid}`} x1="14" y1="8" x2="50" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          {/* Royal Sherwani Collar */}
          <path d="M10 64C12 51 20 46 32 46C44 46 52 51 54 64H10Z" fill="#581c87" stroke="#fde047" strokeWidth="1.5" />
          <path d="M25 46L32 54L39 46" stroke="#fde047" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="32" cy="57" r="2.2" fill="#10b981" stroke="#fde047" strokeWidth="1" />
          {/* Face */}
          <path d="M20 26C20 19 25 16 32 16C39 16 44 19 44 26C44 37 39 46 32 47C25 46 20 37 20 26Z" fill={`url(#fmah-skin-${uid})`} />
          {/* Sculpted Beard & Regal Mustache */}
          <path d="M20 33C20 42 25.5 47.5 32 48.5C38.5 47.5 44 42 44 33C42 36 38.5 39 32 39C25.5 39 22 36 20 33Z" fill="#18181b" />
          <path d="M23 36.5C27 34.5 30 35.5 32 36.5C34 35.5 37 34.5 41 36.5" stroke="#27272a" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M29 40.5H35" stroke="#c2835c" strokeWidth="1.4" strokeLinecap="round" />
          {/* Eyes & Brows */}
          <path d="M23 26.5Q26.5 24.5 29.5 26" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M34.5 26Q37.5 24.5 41 26.5" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="26.5" cy="29.5" r="1.9" fill="#09090b" />
          <circle cx="37.5" cy="29.5" r="1.9" fill="#09090b" />
          <circle cx="27.2" cy="28.9" r="0.65" fill="#ffffff" />
          <circle cx="38.2" cy="28.9" r="0.65" fill="#ffffff" />
          <path d="M32 29.5V34" stroke="#9e623c" strokeWidth="1.3" strokeLinecap="round" />
          {/* Crimson & Gold Turban */}
          <path d="M15 24C14 14 22 8 32 8C42 8 50 14 49 24C44 21 38 20 32 21.5C26 20 20 21 15 24Z" fill={`url(#fmah-turb-${uid})`} stroke="#fde047" strokeWidth="1.4" />
          <path d="M17 20C24 14 38 14 47 20" stroke="#fde047" strokeWidth="1.4" strokeDasharray="3 2" />
          {/* Kalgi Plume & Emerald Jewel */}
          <path d="M32 14C34 6 41 4 44 7C41 11 36 13 32 14Z" fill="#fef3c7" stroke="#fde047" strokeWidth="1.1" />
          <polygon points="32,11 35,15.5 32,20 29,15.5" fill="#10b981" stroke="#fde047" strokeWidth="1.2" />
        </svg>
      );

    case 'face-kunoichi':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fkun-skin-${uid}`} x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde8d7" />
              <stop offset="100%" stopColor="#ebb89d" />
            </linearGradient>
          </defs>
          {/* Katana Hilt behind shoulder */}
          <path d="M44 46L56 26" stroke="#fde047" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="47" y1="36" x2="53" y2="40" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" />
          {/* Kimono Battle Collar */}
          <path d="M10 64L18 46L32 54L46 46L54 64H10Z" fill="#1e1b4b" stroke="#e11d48" strokeWidth="1.4" />
          <path d="M27 42H37V49L32 53L27 49V42Z" fill="#e1a98b" />
          {/* Face */}
          <path d="M20 25C20 17 25 13 32 13C39 13 44 17 44 25C44 35.5 38.5 43.5 32 45C25.5 43.5 20 35.5 20 25Z" fill={`url(#fkun-skin-${uid})`} />
          {/* Sleek Indigo Hair */}
          <path d="M17.5 35C16 20 22 9 32 9C42 9 48 20 46.5 35L44 24L38 22L32 17L25 22L20 24L17.5 35Z" fill="#0f172a" />
          {/* Flowing Crimson Headband */}
          <path d="M18 19.5C24 17.5 40 17.5 46 19.5V23C40 21 24 21 18 23V19.5Z" fill="#e11d48" stroke="#fda4af" strokeWidth="0.8" />
          <path d="M46 21L56 17M46 22.5L55 26" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="28" y="18.5" width="8" height="3.8" rx="1" fill="#e2e8f0" />
          {/* Fierce Amber Eyes */}
          <path d="M22.5 27.5L29 29M41.5 27.5L35 29" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="26" cy="30.5" rx="2.2" ry="1.8" fill="#d97706" />
          <ellipse cx="38" cy="30.5" rx="2.2" ry="1.8" fill="#d97706" />
          <circle cx="26" cy="30.5" r="1" fill="#09090b" />
          <circle cx="38" cy="30.5" r="1" fill="#09090b" />
          <circle cx="26.7" cy="29.8" r="0.65" fill="#ffffff" />
          <circle cx="38.7" cy="29.8" r="0.65" fill="#ffffff" />
          <path d="M29 39.5C31 40.5 33 40.5 35 39.5" stroke="#9f1239" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'face-chrono-hacker':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fch-skin-${uid}`} x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f5d5bb" />
              <stop offset="100%" stopColor="#d39e7a" />
            </linearGradient>
            <linearGradient id={`fch-ar-${uid}`} x1="17" y1="25" x2="47" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.88" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.88" />
            </linearGradient>
          </defs>
          {/* Cyber Tech Jacket Collar */}
          <path d="M9 64L16 45L25 49H39L48 45L55 64H9Z" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.3" />
          <path d="M27 41H37V49H27V41Z" fill="#c78d69" />
          {/* Face */}
          <path d="M19.5 25C19.5 17 24.8 13 32 13C39.2 13 44.5 17 44.5 25C44.5 35.5 39 44 32 45C25 44 19.5 35.5 19.5 25Z" fill={`url(#fch-skin-${uid})`} />
          {/* Swept Hair */}
          <path d="M18 25C17 15 23 9 32 9C41 9 47 15 46 25C42 18 36 16 30 18.5C25 16.5 20.5 20 18 25Z" fill="#082f49" />
          <path d="M23 13C27 11 35 11 39 14" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
          {/* Ear Transceiver */}
          <rect x="44" y="26" width="4.5" height="9" rx="2" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.2" />
          {/* Panoramic AR Holographic Visor */}
          <path d="M17.5 25.5H46.5L44.5 33.5H19.5L17.5 25.5Z" fill={`url(#fch-ar-${uid})`} stroke="#a5f3fc" strokeWidth="1.3" />
          <path d="M22 29.5H28M35 28H42M37 31H41" stroke="#ecfeff" strokeWidth="1.2" strokeLinecap="round" />
          {/* Smirk & Chin line */}
          <path d="M28 38.5C30.5 40 34 40 36 38" stroke="#7c4734" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'anim-face-alok':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fal-skin-${uid}`} x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d99b6c" />
              <stop offset="100%" stopColor="#a46941" />
            </linearGradient>
          </defs>
          {/* Pulsing Stage Aura */}
          <circle cx="32" cy="30" r="26" stroke={accentHex} strokeWidth="1.4" strokeDasharray="4 3" className="ch-anim-spin-slow" />
          {/* DJ Commander Collar */}
          <path d="M8 64L16 44L25 49H39L48 44L56 64H8Z" fill="#4c1d95" stroke="#fde047" strokeWidth="1.5" />
          <path d="M27 41H37V49H27V41Z" fill="#a46941" />
          {/* Face */}
          <path d="M19.5 25C19.5 17.5 25 13.5 32 13.5C39 13.5 44.5 17.5 44.5 25C44.5 35.5 39 44 32 45C25 44 19.5 35.5 19.5 25Z" fill={`url(#fal-skin-${uid})`} />
          {/* Tapered Commander Hair */}
          <path d="M18.5 24C18 14 24 8.5 32 8.5C40 8.5 46 14 45.5 24C42 18 37 16 32 16C27 16 22 18 18.5 24Z" fill="#18181b" />
          <path d="M24 12.5L28 15.5M36 12.5L32 15.5" stroke="#fde047" strokeWidth="1.4" strokeLinecap="round" />
          {/* Studio Headset + Boom Mic */}
          <rect x="14" y="25" width="5.5" height="11" rx="2.5" fill="#1e293b" stroke="#fde047" strokeWidth="1.2" />
          <path d="M17 35C18 39 22 41 28 40.5" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="28.5" cy="40.5" r="1.4" fill="#fde047" />
          {/* Pulsing Golden EQ Sunglasses */}
          <rect x="19" y="25.5" width="11.5" height="7" rx="2" fill="#09090b" stroke="#fde047" strokeWidth="1.3" />
          <rect x="33.5" y="25.5" width="11.5" height="7" rx="2" fill="#09090b" stroke="#fde047" strokeWidth="1.3" />
          <line x1="30.5" y1="28.5" x2="33.5" y2="28.5" stroke="#fde047" strokeWidth="1.5" />
          <g className="ch-anim-pulse">
            <path d="M22 30V27.5M25 30.5V27M28 30V28M36 30V28M39 30.5V27M42 30V27.5" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          {/* Confident Smile */}
          <path d="M28.5 38C30.5 39.8 34 39.8 36 38" stroke="#fef3c7" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'anim-booyah-dragon':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`fdr-skin-${uid}`} x1="20" y1="18" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7d3b4" />
              <stop offset="100%" stopColor="#c98c63" />
            </linearGradient>
          </defs>
          {/* Spiked Armor Pauldrons */}
          <path d="M6 64L14 44L25 48H39L50 44L58 64H6Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1.5" />
          <path d="M12 46L6 39L19 44M52 46L58 39L45 44" fill="#fbbf24" />
          <path d="M27 41H37V49H27V41Z" fill="#b87d56" />
          {/* Face */}
          <path d="M20 26C20 18 25 14 32 14C39 14 44 18 44 26C44 36.5 39 44.5 32 45.5C25 44.5 20 36.5 20 26Z" fill={`url(#fdr-skin-${uid})`} />
          {/* Hair + Grandmaster Horned Crown */}
          <path d="M18 25C17 15 23 10 32 10C41 10 47 15 46 25C42 20 37 19 32 20.5C27 19 22 20 18 25Z" fill="#18181b" />
          <path d="M16 17L21 8L27 15L32 5L37 15L43 8L48 17L32 19.5L16 17Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1" strokeLinejoin="round" />
          <polygon points="32,10.5 34.5,14 32,17.5 29.5,14" fill="#f43f5e" />
          {/* Glowing Amber Warrior Eyes */}
          <path d="M22.5 27L29.5 29M41.5 27L34.5 29" stroke="#18181b" strokeWidth="1.7" strokeLinecap="round" />
          <ellipse cx="26" cy="30" rx="2.3" ry="1.6" fill="#fde047" className="ch-anim-pulse" />
          <ellipse cx="38" cy="30" rx="2.3" ry="1.6" fill="#fde047" className="ch-anim-pulse" />
          <circle cx="26" cy="30" r="0.8" fill="#7f1d1d" />
          <circle cx="38" cy="30" r="0.8" fill="#7f1d1d" />
          {/* Fierce Grin + Rising Embers */}
          <path d="M28.5 38.5H35.5" stroke="#7f1d1d" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="13" cy="32" r="1.5" fill="#fde047" className="ch-anim-ember" />
          <circle cx="51" cy="30" r="1.5" fill="#fb7185" className="ch-anim-ember" style={{ animationDelay: '0.9s' }} />
        </svg>
      );

    case 'carrom-queen':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={`cq-disc-${uid}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="55%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
          </defs>
          {/* Red Queen Carrom Coin */}
          <circle cx="32" cy="32" r="22" fill={`url(#cq-disc-${uid})`} stroke="#fde68a" strokeWidth="2.4" />
          <circle cx="32" cy="32" r="16.5" stroke="#fecdd3" strokeWidth="1.1" strokeDasharray="3 2.5" />
          {/* Golden Striker Crown Overlay */}
          <circle cx="32" cy="32" r="11" fill="rgba(251,191,36,0.22)" stroke="#fde047" strokeWidth="2" />
          <path
            d="M32 17L35.5 26.5L45.5 26.5L37.5 32.5L40.5 42L32 36L23.5 42L26.5 32.5L18.5 26.5L28.5 26.5Z"
            fill="#fef08a"
            stroke="#92400e"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="31.5" r="2.6" fill="#dc2626" />
        </svg>
      );

    case 'ff-heroic-wing':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          {/* Layered Swept Battle Wings */}
          <path d="M6 21L21 25L18 33L9 30L6 21ZM58 21L43 25L46 33L55 30L58 21Z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M10 31L22 33L20 40L13 38L10 31ZM54 31L42 33L44 40L51 38L54 31Z" fill="#e11d48" stroke="#fda4af" strokeWidth="1.1" strokeLinejoin="round" />
          {/* Heroic Crown Shield */}
          <path d="M23 15L28 10L32 14L36 10L41 15L39 20H25L23 15Z" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.2" />
          <path d="M21 21H43L41 39L32 51L23 39L21 21Z" fill="#be123c" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 23V47M25 29L32 35L39 29" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'focus-mandala':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <g className="ch-anim-spin-slow">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path
                key={deg}
                d="M32 8C35.5 15 35.5 21 32 25C28.5 21 28.5 15 32 8Z"
                fill="rgba(52,211,153,0.22)"
                stroke={accentHex}
                strokeWidth="1.4"
                transform={`rotate(${deg} 32 32)`}
              />
            ))}
          </g>
          <g className="ch-anim-spin-rev">
            <circle cx="32" cy="32" r="14" stroke="#fde047" strokeWidth="1.5" strokeDasharray="4 3" />
          </g>
          {/* Eye of Unbroken Focus */}
          <path d="M19 32C24 25.5 40 25.5 45 32C40 38.5 24 38.5 19 32Z" fill="#064e3b" stroke="#fde047" strokeWidth="1.8" />
          <circle cx="32" cy="32" r="4.5" fill={accentHex} className="ch-anim-pulse" />
          <circle cx="32" cy="32" r="1.8" fill="#fef08a" />
        </svg>
      );

    case 'pack-av-sunset-traveler':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbst-sky-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="46%" stopColor="#e87979" />
              <stop offset="82%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbst-sky-${uid})`} />
          <circle cx="44" cy="40" r="11" fill="#fef08a" opacity="0.55" />
          <path d="M0 36C12 31 24 38 38 33C48 29 56 33 64 31V48H0Z" fill="#f9a8d4" opacity="0.28" />
          <path d="M0 44C14 40 28 45 44 41C52 39 59 42 64 41V64H0Z" fill="#432359" opacity="0.52" />
          {/* Backpack Traveler Silhouette looking toward horizon */}
          <path d="M12 64C14 47 21 40 31 40C40 40 46 47 48 64H12Z" fill="#0f172a" />
          <rect x="13" y="42" width="16" height="20" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          <path d="M16 48H26M18 42V39H24V42" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M29 36H36V42H29V36Z" fill="#d49b76" />
          <circle cx="34" cy="27" r="7.5" fill="#eab38f" />
          {/* Dark windblown hair */}
          <path d="M25 29C24 20 30 16 37 17C42 18 44 23 42 29C39 24 35 23 31 26L28 31L25 29Z" fill="#0f172a" />
          <path d="M25 23L20 21M26 26L21 26" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M36 27.5C38 27.5 39 29 38.5 31" stroke="#c78a64" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case 'pack-av-desk-writer':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbdw-bg-${uid}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#090d1c" />
              <stop offset="60%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <radialGradient id={`pbdw-lamp-${uid}`} cx="78%" cy="56%" r="55%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbdw-bg-${uid})`} />
          <rect width="64" height="64" fill={`url(#pbdw-lamp-${uid})`} />
          {/* Brass Desk Lamp Right */}
          <path d="M48 31L58 38H44L48 31Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1.1" />
          <path d="M53 33C55 28 57 38 56 54" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          {/* Desk & Glowing Notebook */}
          <rect x="0" y="52" width="64" height="12" fill="#291408" />
          <polygon points="18,52 44,49 48,57 16,58" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.9" />
          {/* Scholar leaning over desk in headphones & glasses */}
          <path d="M8 64C10 47 18 40 28 40C35 40 39 45 41 53H8Z" fill="#1e293b" />
          <path d="M22 45L33 52" stroke="#d99f77" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M22 25C22 18 28 15 34 17C38 18 40 23 39 29C39 34 35 37 30 37C25 37 22 32 22 25Z" fill="#eab38c" />
          <path d="M20 27C19 18 26 12 34 14C39 15 41 20 40 24C36 20 31 20 27 24L23 30L20 27Z" fill="#18181b" />
          {/* Round Amber Glasses & Headphones */}
          <circle cx="34" cy="27" r="3.2" fill="rgba(253,224,71,0.22)" stroke="#fde047" strokeWidth="1.1" />
          <path d="M21 26C21 17 26 13 33 13" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <rect x="20" y="24" width="5" height="8" rx="2.5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.1" />
        </svg>
      );

    case 'pack-av-moonlit-peak':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbmp-sky-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="65%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbmp-sky-${uid})`} />
          {/* Twinkling Night Stars */}
          {[
            [11, 13, 1],
            [24, 9, 1.3],
            [33, 18, 0.9],
            [16, 26, 1.1],
            [52, 29, 1],
            [8, 36, 0.9],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#e0f2fe" opacity="0.85" />
          ))}
          {/* Crescent Moon */}
          <circle cx="46" cy="18" r="7.5" fill="#e0f2fe" />
          <circle cx="43.5" cy="16" r="6.8" fill="#071127" />
          {/* Misty Mountain Ridges */}
          <path d="M0 50L14 40L28 48L46 37L64 49V64H0Z" fill="#091124" />
          <path d="M0 56L22 49L44 55L64 47V64H0Z" fill="#030712" />
          {/* Reflective Scholar Silhouette */}
          <path d="M21 64C22 50 26 44 31 44C36 44 40 50 41 64H21Z" fill="#020617" stroke="#38bdf8" strokeOpacity="0.32" strokeWidth="0.9" />
          <circle cx="31" cy="34" r="6.2" fill="#020617" stroke="#7dd3fc" strokeOpacity="0.45" strokeWidth="0.9" />
          <path d="M25 32C25 27 36 27 37 33" stroke="#020617" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'pack-av-bloodmoon-shinobi':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbbm-bg-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#090609" />
              <stop offset="60%" stopColor="#3b0712" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbbm-bg-${uid})`} />
          {/* Crimson Blood Moon */}
          <circle cx="37" cy="24" r="14" fill="#dc2626" opacity="0.9" />
          <circle cx="39" cy="22" r="9" fill="#ef4444" opacity="0.45" />
          {/* Katana Scabbard Crossing Back */}
          <line x1="12" y1="22" x2="49" y2="57" stroke="#09090b" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="12" y1="22" x2="49" y2="57" stroke="#fb7185" strokeWidth="0.9" strokeLinecap="round" />
          {/* Hooded Shinobi Silhouette & Crimson Scarf */}
          <path d="M13 64L20 40L32 36L44 40L51 64H13Z" fill="#090609" />
          <path d="M21 28C21 17 26 12 32 12C38 12 43 17 43 28L45 38H19L21 28Z" fill="#991b1b" stroke="#f43f5e" strokeWidth="1.2" />
          <path d="M25 24C25 19 28 17 32 17C36 17 39 19 39 24L37 32H27L25 24Z" fill="#090609" />
          {/* Glowing Eyes */}
          <path d="M27.5 25L30.5 26M36.5 25L33.5 26" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
          {/* Flowing Crimson Scarf & Embers */}
          <path d="M22 36C28 41 38 40 48 45L42 52C34 46 26 46 19 42Z" fill="#be123c" />
          <circle cx="15" cy="48" r="1.4" fill="#fb7185" />
          <circle cx="50" cy="36" r="1.2" fill="#fde047" />
        </svg>
      );

    case 'pack-av-sky-dreamer':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbsd-sky-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="65%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbsd-sky-${uid})`} />
          {/* Billowing White Clouds */}
          <circle cx="52" cy="18" r="9" fill="#ffffff" opacity="0.88" />
          <circle cx="44" cy="21" r="7" fill="#ffffff" opacity="0.82" />
          <circle cx="14" cy="44" r="11" fill="#ffffff" opacity="0.72" />
          <circle cx="54" cy="48" r="10" fill="#ffffff" opacity="0.78" />
          {/* Dark Hoodie Shoulders */}
          <path d="M16 64C18 50 24 44 33 44C41 44 46 50 48 64H16Z" fill="#0f172a" />
          <path d="M27 38L34 39V47L26 45Z" fill="#e2b394" />
          {/* Profile Looking Upward */}
          <path d="M26 25C27 19 33 17 38 20C42 23 43 28 40 34C38 38 33 39 29 37C26 35 25 30 26 25Z" fill="#fde0c8" />
          <path d="M39 27L42 28.5L39.5 31" fill="#fde0c8" />
          <circle cx="36.5" cy="26.5" r="1.5" fill="#0284c7" />
          {/* Wind-Swept Silver-White Hair */}
          <path d="M21 31C19 20 26 11 36 12C43 13 46 18 44 23C40 19 35 19 32 23L27 33L21 31Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.9" />
          <path d="M24 18L19 16M22 23L17 23" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'pack-av-twilight-citadel':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbtc-sky-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e1065" />
              <stop offset="52%" stopColor="#be185d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbtc-sky-${uid})`} />
          {/* Twilight Mosque Domes & Minarets */}
          <path d="M6 52V32L8 25L10 32V52H6Z" fill="#1e1b4b" />
          <path d="M54 52V30L56 23L58 30V52H54Z" fill="#1e1b4b" />
          <path d="M16 52V40C16 32 24 27 32 27C40 27 48 32 48 40V52H16Z" fill="#1e1b4b" />
          <path d="M24 41C24 34 28 30 32 27C36 30 40 34 40 41H24Z" fill="#312e81" />
          <rect x="0" y="50" width="64" height="14" fill="#090617" />
          {/* Warm Lit Palace Windows */}
          <circle cx="24" cy="44" r="1.5" fill="#fde047" />
          <circle cx="40" cy="44" r="1.5" fill="#fde047" />
          <circle cx="32" cy="43" r="1.8" fill="#fbbf24" />
          {/* Lone Foreground Scholar Silhouette */}
          <path d="M25 64C26 52 28 48 32 48C36 48 38 52 39 64H25Z" fill="#030712" />
          <circle cx="32" cy="41.5" r="4.8" fill="#030712" />
        </svg>
      );

    case 'pack-av-cyber-skyline':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbcs-sky-${uid}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#090d26" />
              <stop offset="55%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#9d174d" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbcs-sky-${uid})`} />
          {/* Neon City Towers */}
          <rect x="6" y="24" width="10" height="40" fill="#111827" />
          <rect x="44" y="18" width="12" height="46" fill="#0f172a" />
          <rect x="55" y="28" width="9" height="36" fill="#1e1b4b" />
          {[24, 30, 36, 42].map((y) => (
            <React.Fragment key={y}>
              <rect x="47" y={y} width="2.5" height="2" fill="#38bdf8" className="ch-anim-twinkle" />
              <rect x="51" y={y + 2} width="2.5" height="2" fill="#f472b6" />
              <rect x="9" y={y + 4} width="3" height="2" fill="#fbbf24" />
            </React.Fragment>
          ))}
          {/* Headphones Scholar in Sharp Profile */}
          <path d="M12 64C14 48 20 42 29 42C37 42 42 48 44 64H12Z" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.45" strokeWidth="1" />
          <path d="M22 25C22 17 28 14 34 15C38 16 40 21 39 27C39 34 34 38 28 37C24 36 22 31 22 25Z" fill="#eab692" />
          <path d="M38 25L41 27.5L38.5 30" fill="#eab692" />
          <path d="M19 29C18 18 25 11 34 12C39 13 42 17 40 22C36 18 32 18 28 22L24 32L19 29Z" fill="#0f172a" />
          {/* Neon Headphones */}
          <path d="M25 12C29 10 34 12 36 17" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="22" y="22" width="6.5" height="10.5" rx="3.2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
          <circle cx="25.2" cy="27.2" r="1.8" fill="#f472b6" />
        </svg>
      );

    case 'pack-av-sakura-reader':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbsr-sky-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#701a49" />
              <stop offset="55%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbsr-sky-${uid})`} />
          {/* Overhead Cherry Blossom Canopy */}
          <circle cx="14" cy="14" r="14" fill="#fbcfe8" opacity="0.88" />
          <circle cx="32" cy="10" r="16" fill="#f9a8d4" opacity="0.92" />
          <circle cx="52" cy="15" r="14" fill="#fbcfe8" opacity="0.88" />
          <circle cx="24" cy="20" r="9" fill="#fdf2f8" opacity="0.72" />
          <path d="M0 10C18 15 36 18 58 8" stroke="#4c0519" strokeWidth="2.4" strokeLinecap="round" />
          {/* Ground & Seated Student Reading Book */}
          <path d="M0 53Q32 48 64 53V64H0Z" fill="#1f0a17" />
          <path d="M21 56C22 45 27 40 31 40C35 40 37 45 38 56H21Z" fill="#09090b" />
          <circle cx="30" cy="34" r="5" fill="#09090b" />
          {/* Open Glowing Book */}
          <polygon points="34,47 45,44 43,51 33,52" fill="#fdf2f8" stroke="#f472b6" strokeWidth="0.9" />
          {/* Drifting Blossom Petals */}
          <ellipse cx="16" cy="36" rx="2.2" ry="1.2" transform="rotate(-24 16 36)" fill="#fdf2f8" className="ch-anim-float" />
          <ellipse cx="48" cy="34" rx="2" ry="1.1" transform="rotate(28 48 34)" fill="#fbcfe8" className="ch-anim-float" style={{ animationDelay: '0.8s' }} />
        </svg>
      );

    case 'pack-av-clinical-scholar':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbcs2-bg-${uid}`} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="52%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbcs2-bg-${uid})`} />
          {/* Lit Architectural Corridor Pillars */}
          <rect x="6" y="6" width="12" height="58" fill="#0c4a6e" opacity="0.45" />
          <rect x="46" y="6" width="12" height="58" fill="#0c4a6e" opacity="0.45" />
          <rect x="24" y="8" width="16" height="4" rx="2" fill="#e0f2fe" opacity="0.7" />
          {/* Crisp White Lab Coat + Teal Tie */}
          <path d="M12 64L18 42L27 39H37L46 42L52 64H12Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <path d="M26 39L32 54L38 39Z" fill="#0284c7" />
          <path d="M30.5 41H33.5L33 52H31Z" fill="#0f172a" />
          {/* Stethoscope Around Collar */}
          <path d="M23 41C23 49 27 52 32 52C37 52 41 49 41 41" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="40" cy="54" r="2.6" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" />
          {/* Clean Hair & Facial Silhouette */}
          <path d="M24 26C24 18 28 15 32 15C36 15 40 18 40 26C40 33 36.5 38 32 39C27.5 38 24 33 24 26Z" fill="#1e293b" />
          <path d="M23 27C22 17 26 11 32 11C38 11 42 17 41 27C38 22 35 20 32 21C29 20 26 22 23 27Z" fill="#090d16" />
          <path d="M28 29L30.5 29.5M36 29L33.5 29.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'pack-av-milkyway-gazer':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <defs>
            <linearGradient id={`pbmw-sky-${uid}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id={`pbmw-band-${uid}`} x1="20" y1="0" x2="38" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#e879f9" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill={`url(#pbmw-sky-${uid})`} />
          {/* Luminous Milky Way Core */}
          <path d="M28 -4C23 16 19 32 17 54L33 54C35 32 39 16 44 -4Z" fill={`url(#pbmw-band-${uid})`} />
          {[
            [11, 14],
            [27, 12],
            [33, 24],
            [49, 16],
            [54, 34],
            [14, 32],
            [25, 38],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 2 === 0 ? 1.1 : 0.8}
              fill="#f8fafc"
              className={i % 3 === 0 ? 'ch-anim-twinkle' : undefined}
            />
          ))}
          {/* Horizon Ridge */}
          <path d="M0 53L14 48L28 53L46 49L64 54V64H0Z" fill="#030712" />
          {/* Side Profile Stargazer Silhouette */}
          <path d="M24 64C25 51 29 45 35 45C41 45 45 51 46 64H24Z" fill="#020617" />
          <path d="M29 33C29 27 33 24 37 25C41 26 43 31 41 37C39 41 34 42 30 39C29 37 29 35 29 33Z" fill="#020617" stroke="#a78bfa" strokeOpacity="0.4" strokeWidth="0.9" />
          <path d="M41 33L43 35L40.5 36.5" fill="#020617" />
        </svg>
      );

    default:
      return null;
  }
};

export const FrameOrnamentSvg: React.FC<{
  ornamentKey: FrameOrnamentKey;
  badgeColor: string;
}> = ({ ornamentKey, badgeColor }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  if (ornamentKey === 'none') return null;

  return (
    <svg
      viewBox="-14 -14 128 128"
      className="w-full h-full overflow-visible pointer-events-none"
      fill="none"
      aria-hidden="true"
    >
      {ornamentKey === 'battlement' && (
        <g stroke={badgeColor} strokeWidth="2.8" strokeLinejoin="round">
          <path d="M-2 16V-2H16M84 -2H102V16M-2 84V102H16M84 102H102V84" strokeWidth="4" />
          <rect x="44" y="-6" width="12" height="7" rx="1.5" fill={badgeColor} />
          <rect x="44" y="99" width="12" height="7" rx="1.5" fill={badgeColor} />
          <circle cx="4" cy="4" r="2.6" fill="#fef3c7" stroke="none" />
          <circle cx="96" cy="4" r="2.6" fill="#fef3c7" stroke="none" />
          <circle cx="4" cy="96" r="2.6" fill="#fef3c7" stroke="none" />
          <circle cx="96" cy="96" r="2.6" fill="#fef3c7" stroke="none" />
        </g>
      )}

      {ornamentKey === 'sakura' && (
        <g>
          <path
            d="M2 22C2 8 8 2 22 2M78 98C92 98 98 92 98 78"
            stroke="#fbcfe8"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {[
            { cx: 8, cy: 8, scale: 1 },
            { cx: 92, cy: 90, scale: 0.9 },
          ].map((b, idx) => (
            <g key={idx} transform={`translate(${b.cx} ${b.cy}) scale(${b.scale})`}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-6.5"
                  rx="3.6"
                  ry="5.5"
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth="1.2"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="2.6" fill="#f59e0b" />
            </g>
          ))}
        </g>
      )}

      {ornamentKey === 'crystal' && (
        <g stroke="#e0f2fe" strokeWidth="1.8" strokeLinejoin="round">
          <polygon points="50,-11 56,1 50,5 44,1" fill="#38bdf8" />
          <polygon points="50,111 56,99 50,95 44,99" fill="#38bdf8" />
          <polygon points="-11,50 1,44 5,50 1,56" fill="#38bdf8" />
          <polygon points="111,50 99,44 95,50 99,56" fill="#38bdf8" />
          <polygon points="-5,-5 10,1 6,8 1,10" fill="#bae6fd" />
          <polygon points="105,-5 90,1 94,8 99,10" fill="#bae6fd" />
          <polygon points="-5,105 10,99 6,92 1,90" fill="#bae6fd" />
          <polygon points="105,105 90,99 94,92 99,90" fill="#bae6fd" />
        </g>
      )}

      {ornamentKey === 'zardozi' && (
        <g>
          <rect
            x="-2.5"
            y="-2.5"
            width="105"
            height="105"
            rx="24"
            stroke="#fde047"
            strokeWidth="2.4"
            strokeDasharray="5 3"
          />
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="21"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />
          {/* Embroidered golden corner paisley motifs */}
          {[
            'M-3 18 C-6 2, 2 -6, 18 -3 C10 3, 3 10, -3 18 Z',
            'M103 18 C106 2, 98 -6, 82 -3 C90 3, 97 10, 103 18 Z',
            'M-3 82 C-6 98, 2 106, 18 103 C10 97, 3 90, -3 82 Z',
            'M103 82 C106 98, 98 106, 82 103 C90 97, 97 90, 103 82 Z',
          ].map((d, i) => (
            <path key={i} d={d} fill="#facc15" stroke="#7f1d1d" strokeWidth="1.3" />
          ))}
          {[28, 50, 72].map((x) => (
            <React.Fragment key={x}>
              <circle cx={x} cy="-2.5" r="2.2" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
              <circle cx={x} cy="102.5" r="2.2" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
            </React.Fragment>
          ))}
        </g>
      )}

      {ornamentKey === 'viper' && (
        <g>
          <path d="M14 -7L20 6L26 -3M86 -7L80 6L74 -3" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-5 36L2 43L-5 50L2 57L-5 64" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M105 36L98 43L105 50L98 57L105 64" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <polygon points="50,107 56,98 50,94 44,98" fill="#6ee7b7" stroke="#065f46" strokeWidth="1.4" />
        </g>
      )}

      {ornamentKey === 'tourbillon' && (
        <g>
          <circle cx="50" cy="50" r="56" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3.6" />
          <rect
            x="-3"
            y="-3"
            width="106"
            height="106"
            rx="24"
            stroke="#fbbf24"
            strokeWidth="2.2"
          />
          <circle cx="50" cy="-6" r="4" fill="#dc2626" stroke="#fde68a" strokeWidth="1.5" />
          <circle cx="50" cy="106" r="4" fill="#dc2626" stroke="#fde68a" strokeWidth="1.5" />
          <path d="M-8 50H-1M101 50H108" stroke="#fde68a" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      )}

      {ornamentKey === 'titanium' && (
        <g stroke="#818cf8" strokeWidth="3" strokeLinecap="square">
          <path d="M-3 20V-3H20" />
          <path d="M80 -3H103V20" />
          <path d="M-3 80V103H20" />
          <path d="M80 103H103V80" />
          <circle cx="4" cy="4" r="2.2" fill="#e2e8f0" stroke="none" />
          <circle cx="96" cy="4" r="2.2" fill="#e2e8f0" stroke="none" />
          <circle cx="4" cy="96" r="2.2" fill="#e2e8f0" stroke="none" />
          <circle cx="96" cy="96" r="2.2" fill="#e2e8f0" stroke="none" />
          <path d="M36 -3H64M36 103H64" stroke="#cbd5e1" strokeWidth="2.2" />
        </g>
      )}

      {ornamentKey === 'kintsugi' && (
        <g>
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#f59e0b" strokeWidth="1.6" strokeOpacity="0.65" />
          <path
            d="M-5 24L5 14L12 18L22 4L30 -6"
            stroke="#fde047"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 106L82 95L88 99L98 84L106 76"
            stroke="#fde047"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 18L20 23M88 99L80 90" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="88" cy="10" r="3.4" fill="#dc2626" stroke="#fde047" strokeWidth="1.2" />
        </g>
      )}

      {ornamentKey === 'crimson' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M1 32L-10 22L-4 40L-11 49L1 56"
            fill="#e11d48"
            stroke="#fda4af"
            strokeWidth="1.6"
          />
          <path
            d="M99 32L110 22L104 40L111 49L99 56"
            fill="#e11d48"
            stroke="#fda4af"
            strokeWidth="1.6"
          />
          <path d="M40 -2L50 -12L60 -2L50 5Z" fill="#f59e0b" stroke="#fecdd3" strokeWidth="1.6" />
        </g>
      )}

      {ornamentKey === 'crown' && (
        <g>
          <path
            d="M30 -1L35 -11L44 -3L50 -14L56 -3L65 -11L70 -1Z"
            fill="#fbbf24"
            stroke="#fef3c7"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="-6" r="2.4" fill="#9333ea" />
          <circle cx="35" cy="-5" r="1.6" fill="#a855f7" />
          <circle cx="65" cy="-5" r="1.6" fill="#a855f7" />
          <path d="M-3 14C-3 2 2 -3 14 -3M86 -3C98 -3 103 2 103 14" stroke="#fde68a" strokeWidth="2.4" />
        </g>
      )}

      {ornamentKey === 'laurel' && (
        <g fill="#facc15" stroke="#854d0e" strokeWidth="1">
          {[18, 34, 50, 66, 82].map((y, idx) => (
            <React.Fragment key={y}>
              <ellipse
                cx="-4"
                cy={y}
                rx="3.4"
                ry="6.5"
                transform={`rotate(${-28 + idx * 4} -4 ${y})`}
              />
              <ellipse
                cx="104"
                cy={y}
                rx="3.4"
                ry="6.5"
                transform={`rotate(${28 - idx * 4} 104 ${y})`}
              />
            </React.Fragment>
          ))}
          <path d="M34 100L50 107L66 100" fill="none" stroke="#facc15" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {ornamentKey === 'circuit' && (
        <g stroke="#a3e635" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 -1V-9H32M82 -1V-9H68" />
          <path d="M-1 26H-8V40M101 26H108V40" />
          <path d="M18 101V108H34M82 101V108H66" />
          <circle cx="33" cy="-9" r="2.6" fill="#22d3ee" />
          <circle cx="67" cy="-9" r="2.6" fill="#22d3ee" />
          <circle cx="-8" cy="41" r="2.6" fill="#a3e635" />
          <circle cx="108" cy="41" r="2.6" fill="#a3e635" />
        </g>
      )}

      {ornamentKey === 'jaali' && (
        <g>
          <path
            d="M32 0C37 -8 45 -5 50 -13C55 -5 63 -8 68 0"
            fill="#1e3a8a"
            stroke="#fde047"
            strokeWidth="2.2"
          />
          <circle cx="50" cy="-6" r="2.2" fill="#fde047" />
          <rect
            x="-2"
            y="-2"
            width="104"
            height="104"
            rx="23"
            stroke="#fde047"
            strokeWidth="1.6"
            strokeDasharray="2 4"
          />
          <path d="M-4 50L2 44L8 50L2 56Z M92 50L98 44L104 50L98 56Z" fill="#fde047" stroke="#1e3a8a" strokeWidth="1" />
        </g>
      )}

      {ornamentKey === 'nebula' && (
        <g>
          <defs>
            <linearGradient id={`neb-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <ellipse
            cx="50"
            cy="50"
            rx="60"
            ry="24"
            transform="rotate(-24 50 50)"
            stroke={`url(#neb-${uid})`}
            strokeWidth="1.8"
            strokeDasharray="8 4"
          />
          {[
            [6, 6],
            [94, 94],
            [94, 6],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y - 6}L${x + 1.8} ${y - 1.8}L${x + 6} ${y}L${x + 1.8} ${y + 1.8}L${x} ${y + 6}L${x - 1.8} ${y + 1.8}L${x - 6} ${y}L${x - 1.8} ${y - 1.8}Z`}
              fill="#fef08a"
            />
          ))}
        </g>
      )}

      {ornamentKey === 'nova' && (
        <g>
          <path d="M-4 32C-10 10, 10 -10, 32 -4M104 68C110 90, 90 110, 68 104" stroke="#e879f9" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M68 -4C90 -10, 110 10, 104 32M32 104C10 110, -10 90, -4 68" stroke="#f43f5e" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="50,-11 54,-4 50,1 46,-4" fill="#fde047" />
          <polygon points="-11,50 -4,46 1,50 -4,54" fill="#c084fc" />
          <polygon points="111,50 104,46 99,50 104,54" fill="#c084fc" />
        </g>
      )}

      {ornamentKey === 'astrolabe' && (
        <g>
          <circle cx="50" cy="50" r="56" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="61" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.65" />
          <polygon points="50,-12 53,-1 47,-1" fill="#fde047" />
          <polygon points="50,112 53,101 47,101" fill="#fde047" />
          <polygon points="-12,50 -1,47 -1,53" fill="#fde047" />
          <polygon points="112,50 101,47 101,53" fill="#fde047" />
        </g>
      )}

      {ornamentKey === 'conqueror' && (
        <g strokeLinejoin="round">
          <path
            d="M4 34C-11 22, -12 4, -2 -7C-2 6, 4 14, 10 18Z"
            fill="#fbbf24"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          <path
            d="M96 34C111 22, 112 4, 102 -7C102 6, 96 14, 90 18Z"
            fill="#fbbf24"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          <path
            d="M34 -2L41 -10L50 -15L59 -10L66 -2L50 4Z"
            fill="#ef4444"
            stroke="#fef08a"
            strokeWidth="1.8"
          />
          <circle cx="50" cy="-5" r="3" fill="#fef08a" />
          <path d="M18 100L50 107L82 100" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}

      {ornamentKey === 'anim-chrono' && (
        <g>
          <g className="ch-anim-spin-slow">
            <circle cx="50" cy="50" r="56" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="5 3.5" />
            <circle cx="50" cy="-6" r="3.4" fill="#dc2626" stroke="#fef08a" strokeWidth="1.4" />
            <circle cx="50" cy="106" r="3.4" fill="#dc2626" stroke="#fef08a" strokeWidth="1.4" />
          </g>
          <g className="ch-anim-spin-rev">
            <circle cx="50" cy="50" r="61" stroke="#fde68a" strokeWidth="1.3" strokeDasharray="10 6" strokeOpacity="0.8" />
            <polygon points="-11,50 -2,46 1,50 -2,54" fill="#fbbf24" />
            <polygon points="111,50 102,46 99,50 102,54" fill="#fbbf24" />
          </g>
        </g>
      )}

      {ornamentKey === 'anim-aurora' && (
        <g>
          <defs>
            <linearGradient id={`animaur-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <g className="ch-anim-spin-slow">
            <circle
              cx="50"
              cy="50"
              r="57"
              stroke={`url(#animaur-${uid})`}
              strokeWidth="2.4"
              strokeDasharray="14 6"
            />
            <circle cx="50" cy="-7" r="3" fill="#6ee7b7" />
            <circle cx="107" cy="50" r="3" fill="#38bdf8" />
          </g>
          <g className="ch-anim-pulse">
            <polygon points="50,-13 54,-4 50,1 46,-4" fill="#a5f3fc" />
            <polygon points="50,113 54,104 50,99 46,104" fill="#6ee7b7" />
            <polygon points="-13,50 -4,46 1,50 -4,54" fill="#818cf8" />
            <polygon points="113,50 104,46 99,50 104,54" fill="#2dd4bf" />
          </g>
        </g>
      )}

      {ornamentKey === 'anim-inferno' && (
        <g>
          <g className="ch-anim-spin-rev">
            <circle cx="50" cy="50" r="57" stroke="#fb923c" strokeWidth="2.2" strokeDasharray="8 4" />
            <path d="M50 -10L54 -2L50 2L46 -2Z" fill="#fde047" />
            <path d="M50 110L54 102L50 98L46 102Z" fill="#f43f5e" />
          </g>
          <g className="ch-anim-float">
            <path
              d="M34 -2L42 -11L50 -16L58 -11L66 -2L50 4Z"
              fill="#f43f5e"
              stroke="#fde047"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </g>
          <g className="ch-anim-pulse">
            <path d="M2 30L-11 22L-4 40L-12 52L2 60" stroke="#fb923c" strokeWidth="2.2" fill="rgba(244,63,94,0.35)" />
            <path d="M98 30L111 22L104 40L112 52L98 60" stroke="#fb923c" strokeWidth="2.2" fill="rgba(244,63,94,0.35)" />
          </g>
        </g>
      )}

      {ornamentKey === 'anim-orrery' && (
        <g>
          <g className="ch-anim-spin-slow">
            <circle cx="50" cy="50" r="56" stroke="#fde047" strokeWidth="2.2" strokeDasharray="6 3" />
            <circle cx="50" cy="-6" r="3.5" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.2" />
            <circle cx="50" cy="106" r="3.5" fill="#38bdf8" stroke="#fef08a" strokeWidth="1.2" />
          </g>
          <g className="ch-anim-spin-rev">
            <ellipse
              cx="50"
              cy="50"
              rx="63"
              ry="28"
              transform="rotate(-24 50 50)"
              stroke="#e879f9"
              strokeWidth="1.6"
              strokeDasharray="8 4"
            />
          </g>
          <g className="ch-anim-float">
            <path
              d="M34 -3L42 -12L50 -17L58 -12L66 -3L50 4Z"
              fill="#fbbf24"
              stroke="#fef08a"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="-6" r="2.6" fill="#e879f9" />
          </g>
        </g>
      )}

      {ornamentKey === 'carrom-maharaja' && (
        <g>
          <defs>
            <linearGradient id={`cmh-brass-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          {/* Carved Burmese teak double bezel */}
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#451a03" strokeWidth="4.2" />
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke={`url(#cmh-brass-${uid})`} strokeWidth="1.6" />
          {/* Four sculpted brass corner pocket brackets */}
          {[
            'M-5 20V2C-5 -2 -2 -5 2 -5H20L14 1H3C1 1 1 1 1 3V14L-5 20Z',
            'M80 -5H98C102 -5 105 -2 105 2V20L99 14V3C99 1 99 1 97 1H86L80 -5Z',
            'M-5 80L1 86V97C1 99 1 99 3 99H14L20 105H2C-2 105 -5 102 -5 98V80Z',
            'M105 80V98C105 102 102 105 98 105H80L86 99H97C99 99 99 99 99 97V86L105 80Z',
          ].map((d, idx) => (
            <path key={idx} d={d} fill={`url(#cmh-brass-${uid})`} stroke="#451a03" strokeWidth="1" />
          ))}
          {/* Corner Carrom pocket medallions */}
          {[
            [3, 3],
            [97, 3],
            [3, 97],
            [97, 97],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="5.2" fill="#1c0d04" stroke="#fbbf24" strokeWidth="1.4" />
              <circle cx={cx} cy={cy} r="1.8" fill="#fef3c7" />
            </g>
          ))}
          {/* Mother-of-pearl cardinal diamonds */}
          <polygon points="50,-6.5 54,-1.5 50,3.5 46,-1.5" fill="#fef3c7" stroke="#b45309" strokeWidth="1.1" />
          <polygon points="50,96.5 54,101.5 50,106.5 46,101.5" fill="#fef3c7" stroke="#b45309" strokeWidth="1.1" />
          <polygon points="-6.5,50 -1.5,46 3.5,50 -1.5,54" fill="#fef3c7" stroke="#b45309" strokeWidth="1.1" />
          <polygon points="96.5,50 101.5,46 106.5,50 101.5,54" fill="#fef3c7" stroke="#b45309" strokeWidth="1.1" />
        </g>
      )}

      {ornamentKey === 'carrom-queen' && (
        <g>
          <defs>
            <linearGradient id={`crq-gold-${uid}`} x1="0" y1="-12" x2="100" y2="108" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
          {/* Crimson lacquer inner court trim */}
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#7f1d1d" strokeWidth="3.2" />
          <rect x="0.5" y="0.5" width="99" height="99" rx="20" stroke={`url(#crq-gold-${uid})`} strokeWidth="1.4" />
          {/* Top Mughal Kundan arch & Red Queen cabochon */}
          <path
            d="M28 0C34 -7 42 -6 50 -13C58 -6 66 -7 72 0C64 2 57 3.5 50 3.5C43 3.5 36 2 28 0Z"
            fill="#991b1b"
            stroke="#fde047"
            strokeWidth="1.6"
          />
          <circle cx="50" cy="-5" r="4.2" fill="#e11d48" stroke="#fef08a" strokeWidth="1.4" />
          <circle cx="50" cy="-5" r="1.4" fill="#ffe4e6" />
          {/* Twin Sculpted Red Queen Striker Coins on left & right axes */}
          {[
            [-3, 50],
            [103, 50],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="6.8" fill="#be123c" stroke="#fde047" strokeWidth="1.6" />
              <circle cx={cx} cy={cy} r="3.4" stroke="#fecdd3" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="1.3" fill="#fef08a" />
            </g>
          ))}
          {/* Draped bottom pearl finial */}
          <path d="M24 100Q50 110 76 100" stroke="#fde047" strokeWidth="1.6" />
          {[36, 50, 64].map((x) => (
            <circle key={x} cx={x} cy={x === 50 ? 105 : 103} r={x === 50 ? 2.6 : 1.8} fill="#fef3c7" stroke="#991b1b" strokeWidth="1" />
          ))}
        </g>
      )}

      {ornamentKey === 'ff-heroic' && (
        <g strokeLinejoin="round">
          <defs>
            <linearGradient id={`ffh-wing-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="55%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          {/* Armored dark steel & scarlet rim */}
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#1e293b" strokeWidth="3.5" />
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#fb7185" strokeWidth="1.3" />
          {/* Layered Multi-Blade Wings Left & Right */}
          <path d="M1 24L-13 15L-6 31L-13 38L-4 45L-11 52L1 58Z" fill={`url(#ffh-wing-${uid})`} stroke="#fef08a" strokeWidth="1.2" />
          <path d="M99 24L113 15L106 31L113 38L104 45L111 52L99 58Z" fill={`url(#ffh-wing-${uid})`} stroke="#fef08a" strokeWidth="1.2" />
          {/* Spiked Heroic Crown Crest */}
          <path
            d="M32 -1L39 -10L45 -4L50 -13.5L55 -4L61 -10L68 -1L50 5Z"
            fill="#e11d48"
            stroke="#fde047"
            strokeWidth="1.6"
          />
          <polygon points="50,-8.5 53,-3.5 50,1 47,-3.5" fill="#fef08a" />
          {/* Bottom Tactical V-Chevron */}
          <path d="M26 100L50 107.5L74 100L65 98L50 103L35 98Z" fill="#fbbf24" stroke="#7f1d1d" strokeWidth="1" />
        </g>
      )}

      {ornamentKey === 'carrom-champ' && (
        <g>
          <defs>
            <linearGradient id={`ccp-gold-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          {/* Tournament emerald & champagne-gold court bezel */}
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#064e3b" strokeWidth="4" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#ccp-gold-${uid})`} strokeWidth="1.8" />
          {/* 4 Sculpted Emerald Pocket Shields */}
          {[
            [2, 2],
            [98, 2],
            [2, 98],
            [98, 98],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <rect x={cx - 5.5} y={cy - 5.5} width="11" height="11" rx="3.5" fill="#065f46" stroke="#fde047" strokeWidth="1.4" />
              <polygon
                points={`${cx},${cy - 3.2} ${cx + 3.2},${cy} ${cx},${cy + 3.2} ${cx - 3.2},${cy}`}
                fill="#34d399"
              />
            </g>
          ))}
          {/* Peacock Filigree Plumes Flanking Bottom & Sides */}
          <path d="M-4 34C-11 40 -11 60 -4 66" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M104 34C111 40 111 60 104 66" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="-8.5" cy="50" r="2.8" fill="#fde047" stroke="#064e3b" strokeWidth="1" />
          <circle cx="108.5" cy="50" r="2.8" fill="#fde047" stroke="#064e3b" strokeWidth="1" />
          {/* Top Grand Trophy Crown */}
          <path
            d="M34 0L40 -10L46 -3L50 -13L54 -3L60 -10L66 0L50 4.5Z"
            fill={`url(#ccp-gold-${uid})`}
            stroke="#064e3b"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="-4.5" r="2.4" fill="#ef4444" stroke="#fef08a" strokeWidth="1" />
          <path d="M22 101L50 108L78 101" stroke={`url(#ccp-gold-${uid})`} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {ornamentKey === 'ff-booyah' && (
        <g>
          {/* Tactical HUD chamfered brackets */}
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#0f172a" strokeWidth="3.6" />
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#22d3ee" strokeWidth="1.4" />
          <path d="M-5 20V-5H20M80 -5H105V20M-5 80V105H20M80 105H105V80" stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="square" />
          {/* Swept Cyber Gold Wing Fins */}
          <path d="M0 32L-12 24L-8 42L-13 50L0 58Z" fill="#0284c7" stroke="#a5f3fc" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M100 32L112 24L108 42L113 50L100 58Z" fill="#0284c7" stroke="#a5f3fc" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M-2 38L-9 34M-2 46L-9 44M102 38L109 34M102 46L109 44" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
          {/* Apex Booyah Visor Crest */}
          <path d="M32 -2L41 -11L50 -13L59 -11L68 -2L50 4Z" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.7" strokeLinejoin="round" />
          <polygon points="50,-9.5 55,-3.5 50,1 45,-3.5" fill="#fbbf24" />
          {/* Bottom Tactical Bar */}
          <rect x="30" y="99" width="40" height="5.5" rx="2" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.3" />
          <line x1="36" y1="101.8" x2="64" y2="101.8" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="6 3" />
        </g>
      )}

      {ornamentKey === 'ff-cobra' && (
        <g strokeLinejoin="round" strokeLinecap="round">
          <defs>
            <linearGradient id={`ffc-scale-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="50%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          {/* Obsidian & Crimson Rim */}
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke={`url(#ffc-scale-${uid})`} strokeWidth="3.2" />
          {/* Twin Coiled Cobras Left & Right */}
          <path
            d="M2 84C-9 70 -2 54 -8 38C-12 24 -7 10 4 4C8 10 6 18 1 22C-2 29 3 40 -1 54C-3 66 4 74 2 84Z"
            fill="#991b1b"
            stroke="#fbbf24"
            strokeWidth="1.4"
          />
          <path
            d="M98 84C109 70 102 54 108 38C112 24 107 10 96 4C92 10 94 18 99 22C102 29 97 40 101 54C103 66 96 74 98 84Z"
            fill="#991b1b"
            stroke="#fbbf24"
            strokeWidth="1.4"
          />
          {/* Glowing Serpent Eyes */}
          <circle cx="-1.5" cy="12" r="1.5" fill="#fde047" />
          <circle cx="101.5" cy="12" r="1.5" fill="#fde047" />
          {/* Razor Ivory Venom Fangs Framing Top */}
          <path d="M16 -2L21 8L25 -2M84 -2L79 8L75 -2" fill="#f8fafc" stroke="#f43f5e" strokeWidth="1.1" />
          {/* Central Crimson Fang Jewel */}
          <polygon points="50,-11 56,-2 50,5 44,-2" fill="#e11d48" stroke="#fde047" strokeWidth="1.4" />
          <polygon points="50,95 55,102 50,108 45,102" fill="#e11d48" stroke="#fde047" strokeWidth="1.4" />
        </g>
      )}

      {ornamentKey === 'anim-ff-grandmaster' && (
        <g strokeLinejoin="round">
          <defs>
            <linearGradient id={`ffgm-gold-${uid}`} x1="0" y1="-14" x2="100" y2="108" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          {/* Stationary Forged Battle Bezel */}
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#450a0a" strokeWidth="4" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#ffgm-gold-${uid})`} strokeWidth="1.8" />
          {/* Breathing Multi-Feather Flame Wings Left & Right */}
          <g className="ch-anim-wing-breathe">
            <path
              d="M1 22L-13 10L-6 27L-14 33L-5 41L-12 48L-3 55L1 64Z"
              fill="#dc2626"
              stroke="#fde047"
              strokeWidth="1.4"
            />
            <path d="M0 28L-9 22M0 39L-9 36M0 50L-8 49" stroke="#fef08a" strokeWidth="1.4" strokeLinecap="round" />
            <path
              d="M99 22L113 10L106 27L114 33L105 41L112 48L103 55L99 64Z"
              fill="#dc2626"
              stroke="#fde047"
              strokeWidth="1.4"
            />
            <path d="M100 28L109 22M100 39L109 36M100 50L108 49" stroke="#fef08a" strokeWidth="1.4" strokeLinecap="round" />
          </g>
          {/* Top Grandmaster Horned Crown */}
          <path
            d="M27 0L34 -12L42 -4L50 -14L58 -4L66 -12L73 0L50 5Z"
            fill={`url(#ffgm-gold-${uid})`}
            stroke="#fef9c3"
            strokeWidth="1.4"
          />
          <polygon points="50,-9 54,-3 50,2 46,-3" fill="#e11d48" stroke="#fef08a" strokeWidth="1" className="ch-anim-twinkle" />
          {/* Bottom Shield Clasp & Rising Embers */}
          <path d="M26 99L50 108L74 99L65 96L50 102L35 96Z" fill="#fbbf24" stroke="#7f1d1d" strokeWidth="1.1" />
          <circle cx="-7" cy="64" r="1.8" fill="#fde047" className="ch-anim-ember" />
          <circle cx="107" cy="62" r="1.8" fill="#fb7185" className="ch-anim-ember" style={{ animationDelay: '1.1s' }} />
        </g>
      )}

      {ornamentKey === 'anim-carrom-imperium' && (
        <g>
          <defs>
            <linearGradient id={`cri-gold-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          {/* Stationary Imperial Velvet & Gold Filigree Court Bezel */}
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#1e1b4b" strokeWidth="4" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#cri-gold-${uid})`} strokeWidth="1.8" />
          <rect x="2" y="2" width="96" height="96" rx="19" stroke="#fde047" strokeWidth="0.9" strokeDasharray="3 3" strokeOpacity="0.65" />
          {/* Mughal Top Kundan Arch */}
          <path
            d="M24 0C32 -8 42 -6 50 -14C58 -6 68 -8 76 0C66 3 58 4 50 4C42 4 34 3 24 0Z"
            fill="#831843"
            stroke="#fde047"
            strokeWidth="1.5"
          />
          <polygon points="50,-10 54.5,-4 50,2 45.5,-4" fill="#fef08a" className="ch-anim-twinkle" />
          <circle cx="34" cy="-2" r="2.2" fill="#f43f5e" stroke="#fde047" strokeWidth="0.9" className="ch-anim-twinkle" style={{ animationDelay: '0.6s' }} />
          <circle cx="66" cy="-2" r="2.2" fill="#f43f5e" stroke="#fde047" strokeWidth="0.9" className="ch-anim-twinkle" style={{ animationDelay: '1.2s' }} />
          {/* Symmetrical Floating Gold Carrom Strikers */}
          {[
            [-4, 50],
            [104, 50],
          ].map(([cx, cy], idx) => (
            <g key={idx} className="ch-anim-wing-breathe">
              <circle cx={cx} cy={cy} r="7.2" fill="#1e1b4b" stroke="#fde047" strokeWidth="1.8" />
              <circle cx={cx} cy={cy} r="3.6" fill="#be123c" stroke="#fef08a" strokeWidth="1" />
              <circle cx={cx} cy={cy} r="1.3" fill="#fef9c3" />
            </g>
          ))}
          {/* Bottom Lotus Finial */}
          <path d="M30 100Q50 110 70 100" stroke="#fde047" strokeWidth="1.6" />
          <polygon points="50,100 54,106 50,111 46,106" fill="#fbbf24" stroke="#831843" strokeWidth="1" />
          {/* Metallic Shimmer Line */}
          <line x1="16" y1="-2" x2="42" y2="-2" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" className="ch-anim-shimmer-glint" />
        </g>
      )}

      {ornamentKey === 'pack-forest-vine' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#14532d" strokeWidth="3.8" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#4ade80" strokeWidth="1.5" />
          {/* Winding Botanical Ivy Vines */}
          <path d="M18 -3C4 -3 -3 6 -3 22V78C-3 94 4 103 22 103" stroke="#22c55e" strokeWidth="2.2" />
          <path d="M82 -3C96 -3 103 6 103 22V78C103 94 96 103 78 103" stroke="#22c55e" strokeWidth="2.2" />
          {[
            [-5, 22, -35],
            [-6, 48, -20],
            [-5, 74, -45],
            [105, 22, 35],
            [106, 48, 20],
            [105, 74, 45],
            [24, -4, 15],
            [76, -4, -15],
            [34, 104, 165],
            [66, 104, -165],
          ].map(([x, y, rot], idx) => (
            <path
              key={idx}
              d={`M${x} ${y}C${x - 4} ${y - 6}, ${x + 4} ${y - 10}, ${x + 6} ${y - 2}C${x + 4} ${y + 3}, ${x - 2} ${y + 3}, ${x} ${y}Z`}
              fill={idx % 2 === 0 ? '#4ade80' : '#84cc16'}
              stroke="#052e16"
              strokeWidth="1"
              transform={`rotate(${rot} ${x} ${y})`}
            />
          ))}
        </g>
      )}

      {ornamentKey === 'pack-laurel-crown' && (
        <g strokeLinejoin="round">
          <defs>
            <linearGradient id={`plc-gold-${uid}`} x1="0" y1="-12" x2="100" y2="108" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#78350f" strokeWidth="3.6" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#plc-gold-${uid})`} strokeWidth="1.8" />
          {/* Golden Laurel Leaf Sprays Flanking Rounded Sides */}
          {[22, 38, 54, 70, 84].map((y, idx) => (
            <React.Fragment key={y}>
              <ellipse
                cx="-4.5"
                cy={y}
                rx="4.2"
                ry="6.8"
                transform={`rotate(${-32 + idx * 4} -4.5 ${y})`}
                fill={`url(#plc-gold-${uid})`}
                stroke="#713f12"
                strokeWidth="1"
              />
              <ellipse
                cx="104.5"
                cy={y}
                rx="4.2"
                ry="6.8"
                transform={`rotate(${32 - idx * 4} 104.5 ${y})`}
                fill={`url(#plc-gold-${uid})`}
                stroke="#713f12"
                strokeWidth="1"
              />
            </React.Fragment>
          ))}
          {/* Top Imperial Crown */}
          <path
            d="M32 0L37 -10L44 -3L50 -13L56 -3L63 -10L68 0L50 4Z"
            fill={`url(#plc-gold-${uid})`}
            stroke="#fef9c3"
            strokeWidth="1.4"
          />
          <circle cx="50" cy="-5" r="2.2" fill="#f59e0b" stroke="#fef9c3" strokeWidth="0.9" />
          {/* Bottom Laurel Clasp */}
          <polygon points="50,96 55,102 50,108 45,102" fill="#fde047" stroke="#713f12" strokeWidth="1.1" />
        </g>
      )}

      {ornamentKey === 'pack-sakura-wreath' && (
        <g>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#831843" strokeWidth="3.4" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#f9a8d4" strokeWidth="1.4" />
          <path d="M12 -2C0 -2 -3 8 -3 24V76" stroke="#9d174d" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M88 102C100 102 103 92 103 76V24" stroke="#9d174d" strokeWidth="2.2" strokeLinecap="round" />
          {[
            { cx: 8, cy: 10, s: 1.05 },
            { cx: -3, cy: 52, s: 0.85 },
            { cx: 92, cy: 14, s: 0.9 },
            { cx: 103, cy: 56, s: 0.9 },
            { cx: 90, cy: 92, s: 1.05 },
            { cx: 14, cy: 92, s: 0.85 },
          ].map((b, idx) => (
            <g key={idx} transform={`translate(${b.cx} ${b.cy}) scale(${b.s})`}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-5.8"
                  rx="3.4"
                  ry="5.2"
                  fill="#fbcfe8"
                  stroke="#ec4899"
                  strokeWidth="1.1"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="2.3" fill="#fbbf24" />
            </g>
          ))}
        </g>
      )}

      {ornamentKey === 'pack-amethyst-shard' && (
        <g strokeLinejoin="round">
          <defs>
            <linearGradient id={`pam-gem-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#2e1065" strokeWidth="3.8" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#c084fc" strokeWidth="1.6" />
          {/* Faceted Corner Amethyst Clusters */}
          {[
            [4, 4, -45],
            [96, 4, 45],
            [4, 96, -135],
            [96, 96, 135],
          ].map(([cx, cy, rot], idx) => (
            <g key={idx} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
              <polygon points="0,-13 5,-4 0,2 -5,-4" fill={`url(#pam-gem-${uid})`} stroke="#f5d0fe" strokeWidth="1.2" />
              <polygon points="-6,-9 -2,-2 -7,2 -9,-4" fill="#a855f7" stroke="#f5d0fe" strokeWidth="0.9" />
              <polygon points="6,-9 9,-4 7,2 2,-2" fill="#a855f7" stroke="#f5d0fe" strokeWidth="0.9" />
            </g>
          ))}
          {/* Cardinal Crystal Pips & Twinkling Arcane Sparks */}
          <polygon points="50,-9 54,-2 50,4 46,-2" fill="#e879f9" stroke="#fae8ff" strokeWidth="1.1" className="ch-anim-twinkle" />
          <polygon points="50,96 54,102 50,109 46,102" fill="#e879f9" stroke="#fae8ff" strokeWidth="1.1" className="ch-anim-twinkle" style={{ animationDelay: '0.8s' }} />
          <circle cx="-6" cy="50" r="2" fill="#f0abfc" className="ch-anim-twinkle" style={{ animationDelay: '0.4s' }} />
          <circle cx="106" cy="50" r="2" fill="#f0abfc" className="ch-anim-twinkle" style={{ animationDelay: '1.1s' }} />
        </g>
      )}

      {ornamentKey === 'pack-cyber-cyan' && (
        <g strokeLinecap="square">
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#082f49" strokeWidth="3.6" />
          <rect x="-1.5" y="-1.5" width="103" height="103" rx="22" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="14 6 4 6" />
          {/* Segmented Corner HUD Brackets */}
          <path d="M-5 22V-5H22M78 -5H105V22M-5 78V105H22M78 105H105V78" stroke="#67e8f9" strokeWidth="2.6" />
          <path d="M36 -5H64M36 105H64M-5 36V64M105 36V64" stroke="#06b6d4" strokeWidth="2.2" />
          {/* Telemetry Nodes */}
          <circle cx="22" cy="-5" r="2" fill="#a5f3fc" />
          <circle cx="78" cy="-5" r="2" fill="#a5f3fc" />
          <circle cx="22" cy="105" r="2" fill="#a5f3fc" />
          <circle cx="78" cy="105" r="2" fill="#a5f3fc" />
          <line x1="26" y1="-1.5" x2="54" y2="-1.5" stroke="#ecfeff" strokeWidth="1.8" strokeLinecap="round" className="ch-anim-shimmer-glint" />
        </g>
      )}

      {ornamentKey === 'pack-crescent-cloud' && (
        <g>
          <defs>
            <linearGradient id={`pcc-moon-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#1e293b" strokeWidth="3.6" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#fbbf24" strokeWidth="1.6" />
          {/* Glowing Golden Crescent Moon at Top-Left Curve */}
          <path
            d="M12 -11C2 -7 -4 3 -2 14C0 25 9 32 19 31C11 29 6 21 6 12C6 3 11 -5 19 -8C17 -10 14 -11 12 -11Z"
            fill={`url(#pcc-moon-${uid})`}
            stroke="#fef9c3"
            strokeWidth="1.1"
          />
          {/* Billowy Cloud Cluster Along Bottom */}
          <path
            d="M6 103C3 97 8 92 14 94C17 88 26 88 29 94C35 93 40 98 37 103Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1.1"
          />
          <path
            d="M63 103C60 98 65 93 71 94C74 88 83 88 86 94C92 92 97 97 94 103Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1.1"
          />
          {/* Twinkling Night Starlets */}
          <polygon points="88,-6 90,-1 95,1 90,3 88,8 86,3 81,1 86,-1" fill="#fef08a" className="ch-anim-twinkle" />
          <circle cx="104" cy="24" r="2" fill="#fde047" className="ch-anim-twinkle" style={{ animationDelay: '0.7s' }} />
        </g>
      )}

      {ornamentKey === 'pack-azure-dragon' && (
        <g strokeLinejoin="round" strokeLinecap="round">
          <defs>
            <linearGradient id={`pad-icy-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#082f49" strokeWidth="3.8" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#pad-icy-${uid})`} strokeWidth="2" />
          {/* Coiled Azure Dragon Body & Ice Crest */}
          <g className="ch-anim-wing-breathe">
            <path
              d="M16 4C4 6 -5 18 -4 34C-8 48 0 64 -4 80C0 94 12 103 28 103C16 99 6 91 3 78C7 62 2 46 4 30C4 18 10 10 20 6Z"
              fill="#0284c7"
              stroke="#bae6fd"
              strokeWidth="1.3"
            />
            {/* Sculpted Dragon Head + Horns Top-Left */}
            <path d="M12 -4L22 -12L26 -4L34 -7L28 3L16 5Z" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.2" />
            <circle cx="22" cy="-2" r="1.4" fill="#fef08a" />
            {/* Frost Tail Sweep Right Side */}
            <path
              d="M84 4C96 8 104 20 103 38C107 52 99 70 103 84C98 96 86 103 72 103C84 99 94 90 96 76C94 60 99 44 96 28C94 16 88 10 80 6Z"
              fill="#0369a1"
              stroke="#7dd3fc"
              strokeWidth="1.2"
            />
          </g>
          <circle cx="-6" cy="48" r="1.8" fill="#e0f2fe" className="ch-anim-twinkle" />
          <circle cx="106" cy="52" r="1.8" fill="#38bdf8" className="ch-anim-twinkle" style={{ animationDelay: '0.8s' }} />
        </g>
      )}

      {ornamentKey === 'pack-valkyrie-wing' && (
        <g strokeLinejoin="round">
          <defs>
            <linearGradient id={`pvw-silv-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#1e293b" strokeWidth="3.6" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#pvw-silv-${uid})`} strokeWidth="1.8" />
          {/* Sweeping Sculpted Silver Wings */}
          <g className="ch-anim-wing-breathe">
            <path
              d="M2 74C-8 62 -12 42 -11 22L-3 36L-9 44L-1 52L-8 60L4 84Z"
              fill={`url(#pvw-silv-${uid})`}
              stroke="#f8fafc"
              strokeWidth="1.2"
            />
            <path
              d="M98 74C108 62 112 42 111 22L103 36L109 44L101 52L108 60L96 84Z"
              fill={`url(#pvw-silv-${uid})`}
              stroke="#f8fafc"
              strokeWidth="1.2"
            />
          </g>
          {/* Bottom Sapphire Diamond Crest */}
          <path d="M26 100L50 109L74 100L64 96L50 102L36 96Z" fill={`url(#pvw-silv-${uid})`} stroke="#f8fafc" strokeWidth="1" />
          <polygon points="50,95 55,102 50,109 45,102" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.2" />
          <circle cx="50" cy="-3" r="2.6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
        </g>
      )}

      {ornamentKey === 'pack-inferno-flame' && (
        <g strokeLinejoin="round">
          <defs>
            <linearGradient id={`pif-fire-${uid}`} x1="0" y1="100" x2="100" y2="-10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="48%" stopColor="#ef4444" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#450a0a" strokeWidth="4" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#pif-fire-${uid})`} strokeWidth="2.2" />
          {/* Surging Magma Flame Tongues */}
          <g className="ch-anim-wing-breathe">
            <path
              d="M28 0C32 -9 40 -7 44 -13C49 -7 54 -14 58 -5C63 -10 69 -5 72 0C62 3 38 3 28 0Z"
              fill={`url(#pif-fire-${uid})`}
              stroke="#fef08a"
              strokeWidth="1.1"
            />
            <path
              d="M0 30C-9 22 -12 34 -4 42C-11 48 -9 58 0 64Z"
              fill="#dc2626"
              stroke="#fb923c"
              strokeWidth="1.2"
            />
            <path
              d="M100 30C109 22 112 34 104 42C111 48 109 58 100 64Z"
              fill="#dc2626"
              stroke="#fb923c"
              strokeWidth="1.2"
            />
          </g>
          {/* Rising Flame Embers */}
          <circle cx="-6" cy="22" r="2" fill="#fde047" className="ch-anim-ember" />
          <circle cx="106" cy="20" r="2" fill="#fb7185" className="ch-anim-ember" style={{ animationDelay: '0.8s' }} />
          <circle cx="50" cy="104" r="2.6" fill="#f97316" stroke="#fde047" strokeWidth="1" />
        </g>
      )}

      {ornamentKey === 'pack-saturn-cosmos' && (
        <g>
          <defs>
            <linearGradient id={`psc-gold-${uid}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke="#1e1b4b" strokeWidth="3.6" />
          <rect x="-2" y="-2" width="104" height="104" rx="23" stroke={`url(#psc-gold-${uid})`} strokeWidth="1.8" />
          {/* Twinkling 4-point Compass Stars */}
          <polygon points="10,-9 12,-2 19,0 12,2 10,9 8,2 1,0 8,-2" fill="#fef08a" className="ch-anim-twinkle" />
          <polygon points="88,-7 90,-1 96,1 90,3 88,9 86,3 80,1 86,-1" fill="#fde047" className="ch-anim-twinkle" style={{ animationDelay: '0.6s' }} />
          <circle cx="-6" cy="54" r="2" fill="#c084fc" className="ch-anim-twinkle" style={{ animationDelay: '1s' }} />
          {/* Ringed Cosmic Saturn Planet Bottom-Right Corner */}
          <g transform="translate(88 88) rotate(-22)">
            <circle cx="0" cy="0" r="9.5" fill="#4c1d95" stroke="#fde047" strokeWidth="1.4" />
            <path d="M-8 -3Q0 -8 8 -3" stroke="#c084fc" strokeWidth="1.3" strokeOpacity="0.8" />
            <ellipse cx="0" cy="0" rx="17" ry="4.5" stroke="#fef08a" strokeWidth="1.8" fill="none" />
          </g>
        </g>
      )}
    </svg>
  );
};

interface ScholarAvatarProps {
  displayName: string;
  photoURL?: string;
  frameId?: string;
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFrameBadge?: boolean;
  staticPreview?: boolean;
}

const preventAssetCopy = (e: React.SyntheticEvent) => {
  e.preventDefault();
};

export const ScholarAvatar: React.FC<ScholarAvatarProps> = React.memo(({
  displayName,
  photoURL,
  frameId = 'default',
  avatarId = 'default',
  size = 'md',
  showFrameBadge = false,
  staticPreview = false,
}) => {
  const frame = getStoreFrameById(frameId);
  const avatar = getStoreAvatarById(avatarId);

  const dims = {
    xs: {
      outer: 'w-8 h-8 p-[2px] rounded-xl',
      inner: 'rounded-[10px]',
      text: 'text-xs',
      svg: 'w-5 h-5',
      ornamentInset: '-inset-[3px]',
      imageFrameMargin: 'mx-1 my-0.5',
    },
    sm: {
      outer: 'w-10 h-10 p-[2.5px] rounded-xl',
      inner: 'rounded-[9px]',
      text: 'text-sm',
      svg: 'w-6 h-6',
      ornamentInset: '-inset-[4px]',
      imageFrameMargin: 'mx-1.5 my-1',
    },
    md: {
      outer: 'w-12 h-12 p-[3px] rounded-2xl',
      inner: 'rounded-[13px]',
      text: 'text-base',
      svg: 'w-7 h-7',
      ornamentInset: '-inset-[5px]',
      imageFrameMargin: 'mx-2 my-1.5',
    },
    lg: {
      outer: 'w-16 h-16 p-[3.5px] rounded-2xl',
      inner: 'rounded-[13px]',
      text: 'text-2xl',
      svg: 'w-10 h-10',
      ornamentInset: '-inset-[6px]',
      imageFrameMargin: 'mx-3 my-2',
    },
    xl: {
      outer: 'w-20 h-20 p-[4px] rounded-3xl',
      inner: 'rounded-[20px]',
      text: 'text-3xl',
      svg: 'w-12 h-12',
      ornamentInset: '-inset-[7px]',
      imageFrameMargin: 'mx-4 my-2.5',
    },
  }[size];

  const hasCustomAvatar = avatar.id !== 'default' && (avatar.emblemKey !== 'default' || Boolean(avatar.imageUrl));
  const hasCustomFrame = frame.id !== 'default';
  const hasImageFrame = Boolean(frame.imageUrl);
  const ornamentKey: FrameOrnamentKey = frame.ornamentKey || 'none';
  const shouldSpinRing = Boolean(!staticPreview && frame.isAnimated && !frame.noSpinRing && !hasImageFrame);

  return (
    <div
      className={`relative inline-flex shrink-0 overflow-visible ch-protected-asset ${
        hasImageFrame ? dims.imageFrameMargin : ''
      } ${staticPreview ? 'ch-static-preview' : ''}`}
      onContextMenu={preventAssetCopy}
      onDragStart={preventAssetCopy}
    >
      <div
        className={`relative ${dims.outer} ${
          hasImageFrame ? '!rounded-full !p-0' : ''
        } flex items-center justify-center shrink-0 transition-transform`}
        style={{
          boxShadow: hasCustomFrame && !hasImageFrame ? frame.glowShadow : undefined,
        }}
      >
        {!hasImageFrame && (
          <div
            className={`absolute inset-0 rounded-[inherit] ${shouldSpinRing ? 'ch-anim-spin-slow' : ''}`}
            style={{ background: frame.ringBackground }}
          />
        )}
        <div
          className={`relative z-[1] w-full h-full ${
            hasImageFrame ? 'rounded-full' : dims.inner
          } overflow-hidden flex items-center justify-center font-mono font-bold`}
          style={{
            background: hasCustomAvatar ? avatar.bgCss : 'var(--ch-subtle)',
            color: hasCustomAvatar ? avatar.accentHex : 'var(--ch-accent-text)',
          }}
        >
          {avatar.imageUrl ? (
            <ProtectedCosmeticImage
              src={avatar.imageUrl}
              className="w-full h-full object-cover pointer-events-none select-none"
              style={avatar.imageScale ? { transform: `scale(${avatar.imageScale})` } : undefined}
              shimmerClassName="bg-white/12 rounded-[inherit]"
            />
          ) : hasCustomAvatar ? (
            <AvatarEmblemSvg
              emblemKey={avatar.emblemKey}
              accentHex={avatar.accentHex}
              className={avatar.isPortrait ? 'w-full h-full' : dims.svg}
            />
          ) : photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none select-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className={dims.text}>{(displayName || 'S')[0].toUpperCase()}</span>
          )}
        </div>
      </div>

      {hasImageFrame && frame.imageUrl && (
        <div
          className="absolute inset-0 pointer-events-none select-none z-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <ProtectedCosmeticImage
            src={frame.imageUrl}
            showShimmer={false}
            className="w-full h-full object-contain pointer-events-none select-none"
            style={{
              transform: `scale(${frame.imageScale || 1.66})`,
              filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.55))',
            }}
          />
        </div>
      )}

      {!hasImageFrame && hasCustomFrame && ornamentKey !== 'none' && (
        <div className={`absolute ${dims.ornamentInset} pointer-events-none z-10`}>
          <FrameOrnamentSvg ornamentKey={ornamentKey} badgeColor={frame.badgeColor} />
        </div>
      )}

      {/* Transparent anti-copy shield */}
      <div
        className="absolute inset-0 z-[15] rounded-[inherit] select-none"
        onContextMenu={preventAssetCopy}
        onDragStart={preventAssetCopy}
        aria-hidden="true"
      />

      {showFrameBadge && hasCustomFrame && frame.badgeLabel && (
        <span
          className={`absolute ${
            hasImageFrame ? '-bottom-4' : '-bottom-2'
          } left-1/2 -translate-x-1/2 z-20 px-1.5 py-[1px] rounded text-[8px] font-mono font-black tracking-wider text-neutral-950 shadow-sm whitespace-nowrap`}
          style={{ backgroundColor: frame.badgeColor }}
        >
          {frame.badgeLabel}
        </span>
      )}
    </div>
  );
});

const BannerVectorLayer: React.FC<{ artworkKey: BannerArtworkKey; accentHex: string }> = ({
  artworkKey,
  accentHex,
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  if (artworkKey === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Tiled textile / embroidery / geometric surface SVG pattern */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          {artworkKey === 'blueprint' && (
            <pattern id={`pat-${uid}`} width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
              <path d="M16 0V32M0 16H32" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="0.7" />
              <circle cx="0" cy="0" r="1.4" fill="rgba(125,211,252,0.4)" />
            </pattern>
          )}
          {artworkKey === 'sakura' && (
            <pattern id={`pat-${uid}`} width="44" height="44" patternUnits="userSpaceOnUse">
              <path
                d="M22 0L44 11V33L22 44L0 33V11Z"
                fill="none"
                stroke="rgba(244,114,182,0.14)"
                strokeWidth="0.9"
              />
              <path d="M22 0V44M0 11L44 33M44 11L0 33" stroke="rgba(244,114,182,0.07)" strokeWidth="0.7" />
            </pattern>
          )}
          {artworkKey === 'zardozi' && (
            <pattern id={`pat-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M24 2L46 24L24 46L2 24Z"
                fill="none"
                stroke="rgba(251,191,36,0.22)"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <circle cx="24" cy="24" r="5" fill="none" stroke="rgba(253,224,71,0.26)" strokeWidth="1.2" />
              <circle cx="24" cy="24" r="1.6" fill="rgba(253,224,71,0.45)" />
              <circle cx="0" cy="0" r="2.2" fill="rgba(245,158,11,0.35)" />
              <circle cx="48" cy="0" r="2.2" fill="rgba(245,158,11,0.35)" />
              <circle cx="0" cy="48" r="2.2" fill="rgba(245,158,11,0.35)" />
              <circle cx="48" cy="48" r="2.2" fill="rgba(245,158,11,0.35)" />
            </pattern>
          )}
          {artworkKey === 'horology' && (
            <pattern id={`pat-${uid}`} width="36" height="18" patternUnits="userSpaceOnUse">
              <path
                d="M0 9Q9 0 18 9T36 9"
                fill="none"
                stroke="rgba(245,158,11,0.16)"
                strokeWidth="1.1"
              />
              <path
                d="M0 18Q9 9 18 18T36 18"
                fill="none"
                stroke="rgba(245,158,11,0.1)"
                strokeWidth="0.9"
              />
            </pattern>
          )}
          {artworkKey === 'kintsugi' && (
            <pattern id={`pat-${uid}`} width="64" height="64" patternUnits="userSpaceOnUse">
              <path
                d="M0 20L24 30L36 10L64 24M24 30L18 64M36 10L44 0"
                fill="none"
                stroke="rgba(250,204,21,0.14)"
                strokeWidth="1"
              />
            </pattern>
          )}
          {artworkKey === 'circuit' && (
            <pattern id={`pat-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M0 12H16L24 20H48M10 48V32L20 22M34 0V10L42 18V48"
                fill="none"
                stroke="rgba(74,222,128,0.22)"
                strokeWidth="1.2"
              />
              <circle cx="16" cy="12" r="2" fill="rgba(74,222,128,0.4)" />
              <circle cx="24" cy="20" r="2" fill="rgba(163,230,53,0.45)" />
              <circle cx="10" cy="32" r="1.8" fill="rgba(74,222,128,0.35)" />
            </pattern>
          )}
          {artworkKey === 'damask' && (
            <pattern id={`pat-${uid}`} width="60" height="72" patternUnits="userSpaceOnUse">
              <path
                d="M30 4C38 14, 48 22, 48 36C48 50, 38 58, 30 68C22 58, 12 50, 12 36C12 22, 22 14, 30 4Z"
                fill="none"
                stroke="rgba(234,179,8,0.28)"
                strokeWidth="1.2"
              />
              <path
                d="M30 16C34 24, 39 29, 39 36C39 43, 34 48, 30 56C26 48, 21 43, 21 36C21 29, 26 24, 30 16Z"
                fill="rgba(234,179,8,0.09)"
                stroke="rgba(250,204,21,0.32)"
                strokeWidth="1"
              />
              <path
                d="M0 36C8 30, 8 42, 0 36ZM60 36C52 30, 52 42, 60 36Z"
                fill="rgba(234,179,8,0.2)"
              />
            </pattern>
          )}
          {artworkKey === 'citadel' && (
            <pattern id={`pat-${uid}`} width="32" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M0 14C0 23, 16 28, 16 28C16 28, 32 23, 32 14"
                fill="none"
                stroke="rgba(251,113,133,0.22)"
                strokeWidth="1.4"
              />
              <path
                d="M-16 0C-16 9, 0 14, 0 14C0 14, 16 9, 16 0M16 0C16 9, 32 14, 32 14C32 14, 48 9, 48 0"
                fill="none"
                stroke="rgba(244,63,94,0.2)"
                strokeWidth="1.4"
              />
            </pattern>
          )}
          {artworkKey === 'artdeco' && (
            <pattern id={`pat-${uid}`} width="56" height="44" patternUnits="userSpaceOnUse">
              {[26, 20, 14, 8].map((r) => (
                <path
                  key={r}
                  d={`M${28 - r} 44 A${r} ${r} 0 0 1 ${28 + r} 44`}
                  fill="none"
                  stroke="rgba(253,224,71,0.26)"
                  strokeWidth="1.2"
                />
              ))}
              {[20, 14].map((r) => (
                <React.Fragment key={r}>
                  <path
                    d={`M0 ${22 - r} A${r} ${r} 0 0 1 ${r} 22`}
                    fill="none"
                    stroke="rgba(253,224,71,0.18)"
                    strokeWidth="1.1"
                  />
                  <path
                    d={`M${56 - r} 22 A${r} ${r} 0 0 1 56 ${22 - r}`}
                    fill="none"
                    stroke="rgba(253,224,71,0.18)"
                    strokeWidth="1.1"
                  />
                </React.Fragment>
              ))}
              <path d="M28 44L14 22M28 44L28 18M28 44L42 22" stroke="rgba(253,224,71,0.15)" strokeWidth="0.9" />
            </pattern>
          )}
          {artworkKey === 'jaali' && (
            <pattern id={`pat-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <rect
                x="10"
                y="10"
                width="28"
                height="28"
                fill="none"
                stroke="rgba(125,211,252,0.26)"
                strokeWidth="1.2"
              />
              <rect
                x="10"
                y="10"
                width="28"
                height="28"
                transform="rotate(45 24 24)"
                fill="none"
                stroke="rgba(253,224,71,0.24)"
                strokeWidth="1.2"
              />
              <circle cx="24" cy="24" r="4.5" fill="none" stroke="rgba(253,224,71,0.34)" strokeWidth="1" />
              <circle cx="0" cy="0" r="3" fill="none" stroke="rgba(125,211,252,0.25)" strokeWidth="1" />
              <circle cx="48" cy="0" r="3" fill="none" stroke="rgba(125,211,252,0.25)" strokeWidth="1" />
              <circle cx="0" cy="48" r="3" fill="none" stroke="rgba(125,211,252,0.25)" strokeWidth="1" />
              <circle cx="48" cy="48" r="3" fill="none" stroke="rgba(125,211,252,0.25)" strokeWidth="1" />
            </pattern>
          )}
          {artworkKey === 'glacier' && (
            <pattern id={`pat-${uid}`} width="64" height="56" patternUnits="userSpaceOnUse">
              <polygon points="0,0 32,20 0,56" fill="rgba(186,230,253,0.06)" stroke="rgba(186,230,253,0.22)" strokeWidth="1" />
              <polygon points="32,20 64,0 64,38" fill="rgba(56,189,248,0.08)" stroke="rgba(186,230,253,0.22)" strokeWidth="1" />
              <polygon points="32,20 64,38 22,56" fill="rgba(14,165,233,0.06)" stroke="rgba(125,211,252,0.2)" strokeWidth="1" />
            </pattern>
          )}
          {artworkKey === 'botanical' && (
            <pattern id={`pat-${uid}`} width="56" height="56" patternUnits="userSpaceOnUse">
              <path
                d="M14 48C14 34, 24 26, 28 16C32 26, 42 34, 42 48"
                fill="none"
                stroke="rgba(52,211,153,0.24)"
                strokeWidth="1.2"
              />
              <path
                d="M28 14C20 12, 16 4, 28 4C40 4, 36 12, 28 14Z"
                fill="rgba(250,204,21,0.14)"
                stroke="rgba(250,204,21,0.32)"
                strokeWidth="1"
              />
              <path
                d="M8 26C16 24, 18 32, 10 35M48 26C40 24, 38 32, 46 35"
                fill="none"
                stroke="rgba(52,211,153,0.28)"
                strokeWidth="1.2"
              />
            </pattern>
          )}
          {artworkKey === 'damascus' && (
            <pattern id={`pat-${uid}`} width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 8C20 0, 30 16, 50 8C65 2, 72 12, 80 8" fill="none" stroke="rgba(251,146,60,0.22)" strokeWidth="1.3" />
              <path d="M0 18C22 10, 34 26, 54 18C68 12, 74 22, 80 18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.1" />
              <path d="M0 28C18 20, 30 36, 48 28C64 21, 72 32, 80 28" fill="none" stroke="rgba(251,191,36,0.18)" strokeWidth="1.1" />
              <path d="M0 38C20 30, 34 44, 52 38C66 33, 74 41, 80 38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </pattern>
          )}
          {artworkKey === 'anim-quantum' && (
            <pattern id={`pat-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M0 12H16L24 20H48M10 48V32L20 22M34 0V10L42 18V48"
                fill="none"
                stroke="rgba(56,189,248,0.25)"
                strokeWidth="1.2"
              />
              <circle cx="16" cy="12" r="2" fill="rgba(56,189,248,0.5)" />
              <circle cx="24" cy="20" r="2" fill="rgba(165,243,252,0.55)" />
            </pattern>
          )}
          {artworkKey === 'anim-forge' && (
            <pattern id={`pat-${uid}`} width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 8C20 0, 30 16, 50 8C65 2, 72 12, 80 8" fill="none" stroke="rgba(251,146,60,0.24)" strokeWidth="1.3" />
              <path d="M0 24C22 14, 34 30, 54 22C68 16, 74 26, 80 22" fill="none" stroke="rgba(253,224,71,0.16)" strokeWidth="1.1" />
            </pattern>
          )}
          {artworkKey === 'carrom-arena' && (
            <pattern id={`pat-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M0 0H48V48H0Z" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="0.9" />
              <circle cx="24" cy="24" r="6" fill="none" stroke="rgba(251,191,36,0.18)" strokeWidth="1" />
              <circle cx="0" cy="0" r="4" fill="none" stroke="rgba(253,224,71,0.2)" strokeWidth="1" />
              <circle cx="48" cy="48" r="4" fill="none" stroke="rgba(253,224,71,0.2)" strokeWidth="1" />
            </pattern>
          )}
          {artworkKey === 'ff-booyah-zone' && (
            <pattern id={`pat-${uid}`} width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M0 22H44M22 0V44" fill="none" stroke="rgba(251,146,60,0.1)" strokeWidth="0.8" strokeDasharray="3 3" />
              <path d="M16 16L22 10L28 16" fill="none" stroke="rgba(251,146,60,0.2)" strokeWidth="1" />
            </pattern>
          )}
          {artworkKey === 'focus-observatory' && (
            <pattern id={`pat-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="12" y1="0" x2="4" y2="18" stroke="rgba(148,163,184,0.16)" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="32" y1="18" x2="24" y2="36" stroke="rgba(148,163,184,0.12)" strokeWidth="0.9" strokeLinecap="round" />
            </pattern>
          )}
          {artworkKey === 'ff-cobra-temple' && (
            <pattern id={`pat-${uid}`} width="40" height="36" patternUnits="userSpaceOnUse">
              <polygon points="20,2 38,11 38,25 20,34 2,25 2,11" fill="none" stroke="rgba(244,63,94,0.2)" strokeWidth="1" />
              <circle cx="20" cy="18" r="1.5" fill="rgba(244,63,94,0.35)" />
            </pattern>
          )}
          {artworkKey === 'anim-booyah-inferno' && (
            <pattern id={`pat-${uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M0 48L24 0L48 48" fill="none" stroke="rgba(251,191,36,0.14)" strokeWidth="1" />
            </pattern>
          )}
          {artworkKey === 'anim-carrom-palace' && (
            <pattern id={`pat-${uid}`} width="52" height="52" patternUnits="userSpaceOnUse">
              <rect x="14" y="14" width="24" height="24" fill="none" stroke="rgba(250,204,21,0.18)" strokeWidth="1" />
              <rect x="14" y="14" width="24" height="24" transform="rotate(45 26 26)" fill="none" stroke="rgba(244,114,182,0.16)" strokeWidth="1" />
            </pattern>
          )}
        </defs>
        {(artworkKey === 'blueprint' ||
          artworkKey === 'sakura' ||
          artworkKey === 'zardozi' ||
          artworkKey === 'horology' ||
          artworkKey === 'kintsugi' ||
          artworkKey === 'circuit' ||
          artworkKey === 'damask' ||
          artworkKey === 'citadel' ||
          artworkKey === 'artdeco' ||
          artworkKey === 'jaali' ||
          artworkKey === 'glacier' ||
          artworkKey === 'botanical' ||
          artworkKey === 'damascus' ||
          artworkKey === 'anim-quantum' ||
          artworkKey === 'anim-forge' ||
          artworkKey === 'carrom-arena' ||
          artworkKey === 'ff-booyah-zone' ||
          artworkKey === 'focus-observatory' ||
          artworkKey === 'ff-cobra-temple' ||
          artworkKey === 'anim-booyah-inferno' ||
          artworkKey === 'anim-carrom-palace') && (
          <rect width="100%" height="100%" fill={`url(#pat-${uid})`} />
        )}
      </svg>

      {/* Right-anchored focal composition SVG (keeps left side crisp for avatar/typography) */}
      <svg
        viewBox="0 0 800 220"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {artworkKey === 'blueprint' && (
          <g stroke="rgba(125,211,252,0.34)" fill="none">
            <circle cx="660" cy="110" r="82" strokeDasharray="6 4" strokeWidth="1.5" />
            <circle cx="660" cy="110" r="56" strokeWidth="1.2" />
            <circle cx="660" cy="110" r="24" strokeDasharray="2 3" strokeWidth="1" />
            <path d="M550 110H770M660 12V208" strokeWidth="1" />
            <path d="M24 206H776" strokeOpacity="0.45" strokeDasharray="1 15" strokeWidth="6" />
          </g>
        )}

        {artworkKey === 'sakura' && (
          <g>
            {/* Hanging Kyoto Lantern & curved plum branch */}
            <path d="M780 30C710 50, 645 62, 575 108" stroke="#fbcfe8" strokeOpacity="0.45" strokeWidth="3.2" fill="none" />
            <path d="M685 52C675 28, 650 18, 632 14" stroke="#fbcfe8" strokeOpacity="0.35" strokeWidth="2" fill="none" />
            <line x1="712" y1="0" x2="712" y2="38" stroke="#fde68a" strokeOpacity="0.5" strokeWidth="1.5" />
            <rect x="694" y="38" width="36" height="46" rx="14" fill="rgba(244,114,182,0.22)" stroke="#fbcfe8" strokeOpacity="0.55" strokeWidth="1.6" />
            {[
              [592, 98, 9],
              [642, 68, 11],
              [632, 16, 8],
              [744, 42, 10],
            ].map(([cx, cy, r], i) => (
              <g key={i} transform={`translate(${cx} ${cy})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy={-r * 0.65}
                    rx={r * 0.42}
                    ry={r * 0.62}
                    fill="#fbcfe8"
                    fillOpacity="0.55"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.2" fill="#f59e0b" />
              </g>
            ))}
          </g>
        )}

        {artworkKey === 'zardozi' && (
          <g fill="none">
            {/* Embroidered golden top & bottom lace border */}
            <path
              d="M0 10Q20 22 40 10T80 10T120 10T160 10T200 10T240 10T280 10T320 10T360 10T400 10T440 10T480 10T520 10T560 10T600 10T640 10T680 10T720 10T760 10T800 10"
              stroke="#fde047"
              strokeOpacity="0.45"
              strokeWidth="1.6"
              strokeDasharray="4 2"
            />
            <path
              d="M0 210Q20 198 40 210T80 210T120 210T160 210T200 210T240 210T280 210T320 210T360 210T400 210T440 210T480 210T520 210T560 210T600 210T640 210T680 210T720 210T760 210T800 210"
              stroke="#fde047"
              strokeOpacity="0.45"
              strokeWidth="1.6"
              strokeDasharray="4 2"
            />
            {/* Royal embroidered paisley mandala focal medallion */}
            <circle cx="670" cy="110" r="76" stroke="#fde047" strokeOpacity="0.32" strokeWidth="1.8" strokeDasharray="5 3" />
            <circle cx="670" cy="110" r="54" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1.4" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <path
                key={deg}
                d="M670 40C684 58, 684 74, 670 86C656 74, 656 58, 670 40Z"
                fill="rgba(253,224,71,0.14)"
                stroke="#fde047"
                strokeOpacity="0.48"
                strokeWidth="1.3"
                transform={`rotate(${deg} 670 110)`}
              />
            ))}
            <circle cx="670" cy="110" r="14" fill="rgba(220,38,38,0.45)" stroke="#fde047" strokeWidth="2" />
          </g>
        )}

        {artworkKey === 'horology' && (
          <g fill="none" stroke="#fbbf24">
            <circle cx="665" cy="112" r="74" strokeOpacity="0.38" strokeWidth="2.4" strokeDasharray="10 5" />
            <circle cx="665" cy="112" r="58" strokeOpacity="0.28" strokeWidth="1.6" />
            <circle cx="665" cy="112" r="16" strokeOpacity="0.5" strokeWidth="2" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="665"
                y1="112"
                x2="665"
                y2="54"
                strokeOpacity={deg % 90 === 0 ? '0.45' : '0.2'}
                strokeWidth={deg % 90 === 0 ? '2' : '1'}
                transform={`rotate(${deg} 665 112)`}
              />
            ))}
            <circle cx="575" cy="156" r="36" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="575" cy="156" r="12" strokeOpacity="0.35" strokeWidth="1.4" />
          </g>
        )}

        {artworkKey === 'kintsugi' && (
          <g fill="none">
            <path
              d="M420 0L490 54L565 44L632 108L718 96L800 155"
              stroke="#fde047"
              strokeOpacity="0.72"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M565 44L604 0M632 108L590 172L624 220M490 54L448 118L478 220"
              stroke="#f59e0b"
              strokeOpacity="0.52"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Vermilion lacquer hanko seal stamp */}
            <rect x="728" y="162" width="28" height="28" rx="4" fill="rgba(220,38,38,0.65)" stroke="#fca5a5" strokeOpacity="0.5" strokeWidth="1.2" />
            <path d="M735 170H749M742 170V183M736 177H748" stroke="#fef3c7" strokeOpacity="0.85" strokeWidth="1.6" />
          </g>
        )}

        {artworkKey === 'aurora' && (
          <g>
            <path
              d="M0 190L130 140L240 172L390 112L520 155L650 88L800 142V220H0Z"
              fill="rgba(4,47,46,0.65)"
              stroke="rgba(45,212,191,0.28)"
              strokeWidth="1.4"
            />
            <path
              d="M180 220L340 145L470 185L610 120L760 180L800 162V220Z"
              fill="rgba(15,23,42,0.8)"
            />
            <path
              d="M360 24C440 85, 530 12, 625 65C700 105, 745 35, 800 50"
              fill="none"
              stroke="rgba(45,212,191,0.48)"
              strokeWidth="14"
              strokeLinecap="round"
              style={{ filter: 'blur(6px)' }}
            />
            {[
              [540, 38],
              [620, 26],
              [705, 48],
              [760, 28],
              [480, 62],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8" fill="#fef08a" fillOpacity="0.7" />
            ))}
          </g>
        )}

        {artworkKey === 'circuit' && (
          <g fill="none" stroke="#4ade80">
            <rect x="640" y="64" width="84" height="84" rx="10" fill="rgba(5,46,22,0.75)" strokeOpacity="0.55" strokeWidth="2.2" />
            <rect x="658" y="82" width="48" height="48" rx="6" stroke="#a3e635" strokeOpacity="0.6" strokeWidth="1.6" />
            <path d="M640 86H560L530 56H440M640 106H510M640 126H565L535 156H465" strokeOpacity="0.42" strokeWidth="2" />
            <path d="M724 86H790M724 106H795M724 126H790" strokeOpacity="0.42" strokeWidth="2" />
            <circle cx="510" cy="106" r="4" fill="#a3e635" fillOpacity="0.7" />
            <circle cx="440" cy="56" r="4" fill="#4ade80" fillOpacity="0.7" />
          </g>
        )}

        {artworkKey === 'damask' && (
          <g fill="none">
            <rect x="10" y="10" width="780" height="200" rx="14" stroke="#eab308" strokeOpacity="0.26" strokeWidth="1.5" strokeDasharray="6 4" />
            <path
              d="M675 30C705 55, 725 82, 725 110C725 138, 705 165, 675 190C645 165, 625 138, 625 110C625 82, 645 55, 675 30Z"
              fill="rgba(234,179,8,0.1)"
              stroke="#facc15"
              strokeOpacity="0.45"
              strokeWidth="1.6"
            />
            <path
              d="M675 56C690 74, 700 92, 700 110C700 128, 690 146, 675 164C660 146, 650 128, 650 110C650 92, 660 74, 675 56Z"
              stroke="#fde047"
              strokeOpacity="0.52"
              strokeWidth="1.4"
            />
          </g>
        )}

        {artworkKey === 'citadel' && (
          <g fill="none" stroke="#fb7185">
            <path
              d="M665 34L724 58V114C724 152, 696 178, 665 192C634 178, 606 152, 606 114V58L665 34Z"
              fill="rgba(159,18,57,0.28)"
              strokeOpacity="0.5"
              strokeWidth="2.2"
            />
            <path d="M624 88L665 114L706 88M624 114L665 140L706 114" stroke="#fda4af" strokeOpacity="0.45" strokeWidth="2.4" />
          </g>
        )}

        {artworkKey === 'artdeco' && (
          <g fill="none" stroke="#fde047">
            <line x1="0" y1="14" x2="800" y2="14" strokeOpacity="0.35" strokeWidth="1.2" />
            <line x1="0" y1="206" x2="800" y2="206" strokeOpacity="0.35" strokeWidth="1.2" />
            {[90, 68, 46, 24].map((r) => (
              <path
                key={r}
                d={`M${680 - r} 206 A${r} ${r} 0 0 1 ${680 + r} 206`}
                strokeOpacity="0.4"
                strokeWidth="1.8"
              />
            ))}
            {[-60, -35, -15, 0, 15, 35, 60].map((deg) => (
              <line
                key={deg}
                x1="680"
                y1="206"
                x2="680"
                y2="90"
                strokeOpacity="0.3"
                strokeWidth="1.4"
                transform={`rotate(${deg} 680 206)`}
              />
            ))}
          </g>
        )}

        {artworkKey === 'jaali' && (
          <g fill="none">
            <path
              d="M555 210V116C555 76, 605 56, 665 26C725 56, 775 76, 775 116V210"
              stroke="#fde047"
              strokeOpacity="0.42"
              strokeWidth="2.2"
            />
            <path
              d="M575 210V122C575 88, 616 70, 665 44C714 70, 755 88, 755 122V210"
              stroke="#7dd3fc"
              strokeOpacity="0.38"
              strokeWidth="1.5"
            />
            <rect x="633" y="92" width="64" height="64" stroke="#fde047" strokeOpacity="0.45" strokeWidth="1.6" />
            <rect x="633" y="92" width="64" height="64" transform="rotate(45 665 124)" stroke="#7dd3fc" strokeOpacity="0.5" strokeWidth="1.6" />
          </g>
        )}

        {artworkKey === 'observatory' && (
          <g fill="none">
            <circle cx="665" cy="110" r="82" stroke="#fde047" strokeOpacity="0.34" strokeWidth="1.6" />
            <ellipse cx="665" cy="110" rx="94" ry="34" transform="rotate(-22 665 110)" stroke="#c4b5fd" strokeOpacity="0.42" strokeWidth="1.5" />
            <ellipse cx="665" cy="110" rx="94" ry="34" transform="rotate(28 665 110)" stroke="#c4b5fd" strokeOpacity="0.3" strokeWidth="1.2" />
            <path d="M510 56L568 88L614 48L665 110L732 76" stroke="#fde047" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 3" />
            {[
              [510, 56],
              [568, 88],
              [614, 48],
              [665, 110],
              [732, 76],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="#fef08a" fillOpacity="0.85" />
            ))}
          </g>
        )}

        {artworkKey === 'glacier' && (
          <g fill="none" stroke="#bae6fd">
            <polygon points="590,200 655,34 720,200" fill="rgba(186,230,253,0.12)" strokeOpacity="0.48" strokeWidth="1.8" />
            <polygon points="655,34 715,92 720,200 676,120" fill="rgba(56,189,248,0.16)" strokeOpacity="0.35" strokeWidth="1.4" />
            <polygon points="530,200 578,86 626,200" fill="rgba(125,211,252,0.1)" strokeOpacity="0.38" strokeWidth="1.5" />
          </g>
        )}

        {artworkKey === 'botanical' && (
          <g fill="none">
            <path d="M775 215C735 160, 705 110, 650 38" stroke="#34d399" strokeOpacity="0.42" strokeWidth="2.2" />
            {[
              [690, 96, -32],
              [725, 142, -18],
              [658, 52, -45],
            ].map(([x, y, rot], i) => (
              <path
                key={i}
                d={`M${x} ${y}L${x - 24} ${y - 26}C${x - 6} ${y - 36}, ${x + 12} ${y - 30}, ${x + 22} ${y - 16}Z`}
                fill="rgba(250,204,21,0.18)"
                stroke="#fde047"
                strokeOpacity="0.48"
                strokeWidth="1.4"
                transform={`rotate(${rot} ${x} ${y})`}
              />
            ))}
          </g>
        )}

        {artworkKey === 'damascus' && (
          <g fill="none">
            {[0, 14, 28, 42, 56].map((offset) => (
              <path
                key={offset}
                d={`M380 ${20 + offset}C470 ${offset - 12}, 545 ${58 + offset}, 645 ${24 + offset}C710 ${offset}, 755 ${48 + offset}, 800 ${28 + offset}`}
                stroke={offset % 28 === 0 ? '#fb923c' : '#e2e8f0'}
                strokeOpacity={offset % 28 === 0 ? '0.38' : '0.2'}
                strokeWidth="1.6"
              />
            ))}
          </g>
        )}

        {artworkKey === 'singularity' && (
          <g fill="none">
            <circle cx="670" cy="110" r="34" fill="#030014" stroke="#f43f5e" strokeOpacity="0.8" strokeWidth="3" />
            <circle cx="670" cy="110" r="46" stroke="#c084fc" strokeOpacity="0.5" strokeWidth="1.8" strokeDasharray="10 5" />
            <ellipse cx="670" cy="110" rx="98" ry="20" transform="rotate(-14 670 110)" stroke="#e879f9" strokeOpacity="0.55" strokeWidth="2.2" />
            <path d="M510 110H800M670 10V210" stroke="#a855f7" strokeOpacity="0.28" strokeWidth="1.2" />
          </g>
        )}

        {artworkKey === 'eclipse' && (
          <g fill="none">
            <circle cx="670" cy="110" r="38" fill="#090607" stroke="#fbbf24" strokeWidth="3.5" />
            <circle cx="670" cy="110" r="64" stroke="#f59e0b" strokeOpacity="0.38" strokeWidth="1.6" strokeDasharray="5 4" />
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
              <line
                key={deg}
                x1="670"
                y1="64"
                x2="670"
                y2={deg % 40 === 0 ? '20' : '40'}
                stroke="#fde047"
                strokeOpacity={deg % 40 === 0 ? '0.52' : '0.26'}
                strokeWidth={deg % 40 === 0 ? '2' : '1.1'}
                transform={`rotate(${deg} 670 110)`}
              />
            ))}
          </g>
        )}

        {artworkKey === 'anim-quantum' && (
          <g fill="none">
            <rect x="626" y="56" width="104" height="104" rx="14" stroke="#38bdf8" strokeOpacity="0.45" strokeWidth="2" />
            <g className="ch-anim-spin-slow">
              <circle cx="678" cy="108" r="34" stroke="#a5f3fc" strokeOpacity="0.58" strokeWidth="2" strokeDasharray="8 5" />
            </g>
            <g className="ch-anim-spin-rev">
              <circle cx="678" cy="108" r="22" stroke="#818cf8" strokeOpacity="0.7" strokeWidth="1.8" strokeDasharray="5 3" />
            </g>
            <circle cx="678" cy="108" r="6" fill="#38bdf8" className="ch-anim-pulse" />
            <path d="M510 108H626M540 72H626M540 144H626" stroke="#38bdf8" strokeOpacity="0.38" strokeWidth="1.6" />
          </g>
        )}

        {artworkKey === 'anim-boreal' && (
          <g>
            <path
              d="M0 195L150 135L280 175L420 112L560 156L690 88L800 142V220H0Z"
              fill="rgba(4,47,46,0.68)"
              stroke="rgba(45,212,191,0.34)"
              strokeWidth="1.5"
            />
            <g className="ch-anim-wave">
              <path
                d="M280 34C380 96, 485 18, 600 66C685 102, 745 28, 810 48"
                fill="none"
                stroke="rgba(45,212,191,0.52)"
                strokeWidth="16"
                strokeLinecap="round"
                style={{ filter: 'blur(7px)' }}
              />
              <path
                d="M360 16C450 68, 560 8, 665 54C730 82, 770 30, 815 36"
                fill="none"
                stroke="rgba(167,139,250,0.42)"
                strokeWidth="12"
                strokeLinecap="round"
                style={{ filter: 'blur(6px)' }}
              />
            </g>
            {[
              [520, 38, '0s'],
              [608, 24, '0.7s'],
              [696, 46, '1.3s'],
              [754, 26, '0.4s'],
            ].map(([x, y, delay], i) => (
              <circle
                key={i}
                cx={Number(x)}
                cy={Number(y)}
                r="2.4"
                fill="#fef08a"
                className="ch-anim-pulse"
                style={{ animationDelay: String(delay) }}
              />
            ))}
          </g>
        )}

        {artworkKey === 'anim-forge' && (
          <g fill="none">
            {[0, 16, 32, 48].map((offset) => (
              <path
                key={offset}
                d={`M390 ${34 + offset}C480 ${offset + 2}, 555 ${72 + offset}, 655 ${38 + offset}C720 ${offset + 14}, 765 ${62 + offset}, 805 ${42 + offset}`}
                stroke={offset % 32 === 0 ? '#fb923c' : '#fde047'}
                strokeOpacity={offset % 32 === 0 ? '0.45' : '0.24'}
                strokeWidth="1.8"
              />
            ))}
            {[
              [540, 175, '0s'],
              [585, 190, '0.6s'],
              [632, 165, '1.2s'],
              [674, 185, '0.3s'],
              [718, 170, '0.9s'],
              [758, 188, '1.5s'],
            ].map(([x, y, delay], idx) => (
              <circle
                key={idx}
                cx={Number(x)}
                cy={Number(y)}
                r={idx % 2 === 0 ? '3.2' : '2.2'}
                fill={idx % 2 === 0 ? '#fde047' : '#fb923c'}
                className="ch-anim-ember"
                style={{ animationDelay: String(delay) }}
              />
            ))}
          </g>
        )}

        {artworkKey === 'anim-cosmos' && (
          <g fill="none">
            <g className="ch-anim-spin-slow">
              <circle cx="670" cy="110" r="80" stroke="#fde047" strokeOpacity="0.45" strokeWidth="1.8" strokeDasharray="8 5" />
              <circle cx="750" cy="110" r="5" fill="#fde047" fillOpacity="0.9" />
            </g>
            <g className="ch-anim-spin-rev">
              <circle cx="670" cy="110" r="56" stroke="#c084fc" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="5 4" />
              <circle cx="614" cy="110" r="4" fill="#38bdf8" fillOpacity="0.9" />
            </g>
            <ellipse cx="670" cy="110" rx="96" ry="26" transform="rotate(-18 670 110)" stroke="#e879f9" strokeOpacity="0.45" strokeWidth="1.4" />
            <circle cx="670" cy="110" r="14" fill="rgba(251,191,36,0.28)" stroke="#fde047" strokeWidth="2.2" className="ch-anim-pulse" />
          </g>
        )}

        {artworkKey === 'carrom-arena' && (
          <g fill="none">
            {/* Rosewood Carrom board corner & center Queen striker rosette */}
            <rect x="520" y="14" width="265" height="192" rx="14" stroke="#fbbf24" strokeOpacity="0.38" strokeWidth="2" />
            <circle cx="538" cy="32" r="12" fill="#090604" stroke="#f59e0b" strokeOpacity="0.65" strokeWidth="2" />
            <circle cx="767" cy="32" r="12" fill="#090604" stroke="#f59e0b" strokeOpacity="0.65" strokeWidth="2" />
            <circle cx="538" cy="188" r="12" fill="#090604" stroke="#f59e0b" strokeOpacity="0.65" strokeWidth="2" />
            <circle cx="767" cy="188" r="12" fill="#090604" stroke="#f59e0b" strokeOpacity="0.65" strokeWidth="2" />
            <line x1="560" y1="32" x2="745" y2="32" stroke="#fde68a" strokeOpacity="0.32" strokeWidth="1.4" />
            <line x1="560" y1="188" x2="745" y2="188" stroke="#fde68a" strokeOpacity="0.32" strokeWidth="1.4" />
            <circle cx="652" cy="110" r="56" stroke="#fde047" strokeOpacity="0.35" strokeWidth="1.6" />
            <circle cx="652" cy="110" r="24" fill="rgba(220,38,38,0.45)" stroke="#fde047" strokeWidth="2" />
            <circle cx="652" cy="110" r="8" fill="#fef08a" fillOpacity="0.7" />
          </g>
        )}

        {artworkKey === 'ff-booyah-zone' && (
          <g fill="none">
            {/* Tactical contour arcs & airdrop flare crate */}
            <path d="M510 186L610 106L685 138L800 54" stroke="#fb923c" strokeOpacity="0.45" strokeWidth="2.2" />
            <path d="M535 210L630 132L710 162L800 94" stroke="#fbbf24" strokeOpacity="0.28" strokeWidth="1.4" strokeDasharray="5 4" />
            <polygon points="682,42 718,56 718,98 682,112 646,98 646,56" fill="rgba(251,146,60,0.16)" stroke="#fb923c" strokeOpacity="0.6" strokeWidth="2" />
            <path d="M646 72L682 86L718 72" stroke="#fde047" strokeOpacity="0.7" strokeWidth="1.8" />
            <line x1="682" y1="0" x2="682" y2="42" stroke="#fb923c" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="4 3" />
          </g>
        )}

        {artworkKey === 'focus-observatory' && (
          <g fill="none">
            {/* Arched nocturnal study window & warm brass lamp halo */}
            <path d="M575 215V98C575 48 618 22 668 22C718 22 761 48 761 98V215" stroke="#94a3b8" strokeOpacity="0.38" strokeWidth="2.4" />
            <line x1="668" y1="22" x2="668" y2="215" stroke="#94a3b8" strokeOpacity="0.28" strokeWidth="1.6" />
            <line x1="575" y1="114" x2="761" y2="114" stroke="#94a3b8" strokeOpacity="0.28" strokeWidth="1.6" />
            <circle cx="716" cy="64" r="14" fill="rgba(253,224,71,0.22)" stroke="#fde047" strokeOpacity="0.55" strokeWidth="1.4" />
            {/* Desk Lamp Shade + Warm Glow */}
            <path d="M616 146L638 126L658 146Z" fill="rgba(251,191,36,0.4)" stroke="#fde047" strokeWidth="1.6" />
            <path d="M638 126V176H660" stroke="#f59e0b" strokeOpacity="0.65" strokeWidth="2.2" />
            <polygon points="616,146 658,146 676,220 598,220" fill="rgba(251,191,36,0.12)" />
          </g>
        )}

        {artworkKey === 'ff-cobra-temple' && (
          <g fill="none">
            <path d="M585 210C585 130 622 72 670 36C718 72 755 130 755 210" stroke="#f43f5e" strokeOpacity="0.48" strokeWidth="2.4" />
            <path d="M618 210C618 148 642 104 670 76C698 104 722 148 722 210" stroke="#fde047" strokeOpacity="0.42" strokeWidth="1.8" />
            {/* Glowing Serpent Crest Totem */}
            <polygon points="670,84 698,118 670,152 642,118" fill="rgba(244,63,94,0.26)" stroke="#fb7185" strokeWidth="2" />
            <path d="M654 106L666 116M686 106L674 116" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M663 132L670 144L677 132" stroke="#f8fafc" strokeWidth="1.8" />
          </g>
        )}

        {artworkKey === 'anim-booyah-inferno' && (
          <g fill="none">
            {/* Heroic Winged Crest Focal */}
            <g className="ch-anim-wing-breathe">
              <path d="M565 82L632 96L618 124L572 110Z" fill="rgba(251,191,36,0.25)" stroke="#fde047" strokeWidth="1.8" />
              <path d="M775 82L708 96L722 124L768 110Z" fill="rgba(251,191,36,0.25)" stroke="#fde047" strokeWidth="1.8" />
              <path d="M636 74L670 54L704 74L694 140L670 166L646 140Z" fill="rgba(225,29,72,0.45)" stroke="#fde047" strokeWidth="2.2" />
            </g>
            {[
              [555, 178, '0s'],
              [615, 192, '0.7s'],
              [725, 184, '0.4s'],
              [768, 170, '1.2s'],
            ].map(([x, y, delay], idx) => (
              <circle
                key={idx}
                cx={Number(x)}
                cy={Number(y)}
                r="2.8"
                fill={idx % 2 === 0 ? '#fde047' : '#fb7185'}
                className="ch-anim-ember"
                style={{ animationDelay: String(delay) }}
              />
            ))}
          </g>
        )}

        {artworkKey === 'anim-carrom-palace' && (
          <g fill="none">
            <path d="M565 210V116C565 76 610 56 670 26C730 56 775 76 775 116V210" stroke="#fde047" strokeOpacity="0.45" strokeWidth="2.2" />
            <circle cx="670" cy="116" r="52" stroke="#f472b6" strokeOpacity="0.42" strokeWidth="1.6" strokeDasharray="5 4" />
            <circle cx="670" cy="116" r="24" fill="rgba(220,38,38,0.38)" stroke="#fde047" strokeWidth="2" />
            {[
              [596, 78, '0s'],
              [744, 78, '0.6s'],
              [670, 48, '1.2s'],
              [620, 152, '0.9s'],
              [720, 152, '0.3s'],
            ].map(([x, y, delay], idx) => (
              <circle
                key={idx}
                cx={Number(x)}
                cy={Number(y)}
                r="3.2"
                fill="#fef08a"
                className="ch-anim-twinkle"
                style={{ animationDelay: String(delay) }}
              />
            ))}
          </g>
        )}

        {artworkKey === 'pack-bg-alpine-sunrise' && (
          <g>
            <defs>
              <linearGradient id={`pbas-sun-${uid}`} x1="560" y1="20" x2="560" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="565" cy="96" r="46" fill={`url(#pbas-sun-${uid})`} opacity="0.85" />
            {/* Majestic Sunrise Peak Right-Center */}
            <path d="M350 155L455 110L535 128L610 56L700 120L800 84V220H350Z" fill="#3b1f4b" opacity="0.72" />
            <path d="M610 56L648 94L622 106L610 56Z" fill="#fb923c" opacity="0.45" />
            {/* Sea of Lavender-Pink Clouds */}
            <path d="M0 176C90 144 170 174 260 148C345 126 420 158 510 134C605 112 695 152 800 124V220H0Z" fill="#c084fc" opacity="0.22" />
            <path d="M0 194C110 164 210 192 315 168C425 144 525 180 640 156C720 140 765 162 800 150V220H0Z" fill="#1e1b4b" opacity="0.82" />
            <path d="M460 220L520 185L575 220L635 178L710 220L760 186L800 220Z" fill="#090617" />
          </g>
        )}

        {artworkKey === 'pack-bg-dusk-peaks' && (
          <g>
            {/* Pastel Dawn Clouds */}
            <path d="M420 42C480 28 545 50 610 34C675 18 740 42 800 28" stroke="#f9a8d4" strokeOpacity="0.35" strokeWidth="14" strokeLinecap="round" fill="none" />
            {/* Snow-Draped Alpine Range */}
            <path d="M290 190L390 124L475 164L575 74L665 142L745 86L800 126V220H290Z" fill="#1e1b4b" opacity="0.88" />
            <path d="M575 74L606 106L578 112L566 96Z" fill="#fbcfe8" opacity="0.55" />
            <path d="M745 86L774 114L746 118L732 104Z" fill="#e0f2fe" opacity="0.55" />
            <path d="M0 202L140 162L285 190L435 144L595 188L730 148L800 172V220H0Z" fill="#090d1a" />
          </g>
        )}

        {artworkKey === 'pack-bg-forest-stream' && (
          <g>
            {/* Diagonal Golden Canopy Sunbeams */}
            <polygon points="560,0 640,0 740,220 620,220" fill="#bef264" opacity="0.12" />
            <polygon points="680,0 755,0 800,190 745,220" fill="#fde047" opacity="0.1" />
            {/* Woodland Tree Trunks */}
            <rect x="520" y="0" width="16" height="175" fill="#022c22" opacity="0.72" />
            <rect x="615" y="0" width="22" height="162" fill="#064e3b" opacity="0.75" />
            <rect x="740" y="0" width="20" height="175" fill="#022c22" opacity="0.8" />
            {/* Mossy Banks & Turquoise Winding Brook */}
            <path d="M380 220C450 185 520 185 585 152C650 122 720 132 800 112V220Z" fill="#065f46" opacity="0.78" />
            <path d="M530 220C585 184 640 178 690 156C730 138 765 142 800 134V162C755 168 710 184 650 220Z" fill="#38bdf8" opacity="0.48" />
            <path d="M590 212H635M665 186H700M735 160H772" stroke="#e0f2fe" strokeOpacity="0.65" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {artworkKey === 'pack-bg-sakura-breeze' && (
          <g>
            {/* Fluffy Clouds & Blossoming Sakura Branch Sweeping Center-Right */}
            <circle cx="690" cy="184" r="44" fill="#ffffff" opacity="0.22" />
            <circle cx="755" cy="176" r="52" fill="#ffffff" opacity="0.28" />
            <path d="M290 0C410 38 545 58 765 36" stroke="#3f1d2b" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M480 42C550 72 625 94 715 112" stroke="#3f1d2b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {[
              [445, 34, 14],
              [525, 44, 17],
              [608, 48, 16],
              [690, 42, 18],
              [755, 36, 15],
              [585, 84, 14],
              [665, 98, 16],
            ].map(([cx, cy, r], i) => (
              <g key={i} transform={`translate(${cx} ${cy})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy={-r * 0.6}
                    rx={r * 0.42}
                    ry={r * 0.58}
                    fill="#fbcfe8"
                    fillOpacity="0.88"
                    stroke="#f472b6"
                    strokeWidth="0.9"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.8" fill="#fbbf24" />
              </g>
            ))}
            <ellipse cx="490" cy="134" rx="5" ry="2.6" transform="rotate(-24 490 134)" fill="#fdf2f8" opacity="0.78" className="ch-anim-float" />
            <ellipse cx="635" cy="154" rx="4.5" ry="2.4" transform="rotate(20 635 154)" fill="#fbcfe8" opacity="0.82" className="ch-anim-float" style={{ animationDelay: '0.9s' }} />
          </g>
        )}

        {artworkKey === 'pack-bg-warm-library' && (
          <g>
            {/* Warm Mahogany Surface & Candlelit Book Stack */}
            <rect x="0" y="168" width="800" height="52" fill="#241207" opacity="0.72" />
            {/* Stacked Leatherbound Volumes */}
            <rect x="470" y="102" width="110" height="18" rx="3" fill="#5c2810" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            <rect x="462" y="122" width="124" height="22" rx="3" fill="#451a03" stroke="#f59e0b" strokeOpacity="0.45" strokeWidth="1.2" />
            <rect x="454" y="146" width="136" height="22" rx="3" fill="#78350f" stroke="#fde047" strokeOpacity="0.35" strokeWidth="1.2" />
            {/* Open Parchment Book & Brass Reading Glasses */}
            <path d="M555 158C595 142 630 144 655 156C680 144 715 142 755 158L745 196C710 184 680 186 655 198C630 186 600 184 565 196Z" fill="#fef3c7" fillOpacity="0.88" stroke="#b45309" strokeWidth="1.4" />
            <circle cx="690" cy="176" r="14" fill="none" stroke="#d97706" strokeWidth="2.4" />
            <circle cx="726" cy="172" r="14" fill="none" stroke="#d97706" strokeWidth="2.4" />
            <path d="M704 174H712" stroke="#d97706" strokeWidth="2.2" />
          </g>
        )}

        {artworkKey === 'pack-bg-rainy-study' && (
          <g>
            {/* Nocturnal Study Window & Rain Streaks */}
            <rect x="455" y="14" width="215" height="148" rx="8" fill="#070d1e" stroke="#475569" strokeWidth="3" />
            <line x1="562" y1="14" x2="562" y2="162" stroke="#334155" strokeWidth="2.5" />
            <line x1="455" y1="88" x2="670" y2="88" stroke="#334155" strokeWidth="2.5" />
            {[
              [485, 34],
              [535, 58],
              [605, 42],
              [642, 68],
              [512, 118],
              [628, 126],
            ].map(([x, y], i) => (
              <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 18} stroke="#93c5fd" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
            ))}
            {/* Windowsill Potted Plant & Brass Study Lamp */}
            <rect x="0" y="162" width="800" height="58" fill="#1e140c" opacity="0.88" />
            <polygon points="484,162 508,162 504,140 488,140" fill="#b45309" />
            <path d="M496 140C486 126 482 114 494 114C502 114 504 128 496 140Z" fill="#22c55e" opacity="0.82" />
            <polygon points="565,176 635,166 648,186 558,194" fill="#fef3c7" opacity="0.9" />
            <path d="M695 106L745 126H685Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
            <path d="M722 110C738 118 742 150 726 176H706" stroke="#d97706" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <polygon points="685,126 745,126 772,220 658,220" fill="#fde047" opacity="0.14" className="ch-anim-pulse" />
          </g>
        )}

        {artworkKey === 'pack-bg-twilight-dome' && (
          <g>
            {/* Twin Golden Crescent Moons */}
            <path d="M498 34C488 38 486 50 494 58C502 66 514 64 520 56C510 58 500 50 500 40C500 37 499 35 498 34Z" fill="#fef08a" opacity="0.88" />
            <path d="M538 56C532 59 531 66 536 71C541 76 548 74 552 69C545 70 539 65 539 59Z" fill="#fde047" opacity="0.7" />
            {/* Grand Palace Domes & Minarets Silhouette */}
            <path d="M420 220V145L428 106L436 145V220H420Z" fill="#160a28" />
            <path d="M735 220V116L744 64L753 116V220H735Z" fill="#160a28" />
            <path d="M485 220V162C485 126 535 102 590 102C645 102 695 126 695 162V220H485Z" fill="#160a28" />
            <path d="M550 132C550 106 570 88 590 76C610 88 630 106 630 132Z" fill="#220f3c" />
            {[535, 562, 590, 618, 645].map((x) => (
              <circle key={x} cx={x} cy="176" r="3" fill="#fde047" opacity="0.85" />
            ))}
          </g>
        )}

        {artworkKey === 'pack-bg-fullmoon-clouds' && (
          <g>
            {/* Luminous Silver Full Moon */}
            <circle cx="565" cy="74" r="38" fill="#e2e8f0" opacity="0.95" />
            <circle cx="556" cy="66" r="10" fill="#cbd5e1" opacity="0.55" />
            <circle cx="578" cy="84" r="7" fill="#94a3b8" opacity="0.45" />
            {/* Dramatic Storm Cloud Peaks */}
            <path d="M260 220C325 162 405 154 475 184C530 128 615 124 675 168C720 134 768 148 800 170V220Z" fill="#0f172a" opacity="0.92" />
            <path d="M350 184C400 156 445 164 475 184M530 162C580 130 635 138 675 168" stroke="#bae6fd" strokeOpacity="0.4" strokeWidth="2.2" fill="none" />
            <path d="M0 198C120 172 240 198 370 182C510 168 650 202 800 178V220H0Z" fill="#020617" />
          </g>
        )}

        {artworkKey === 'pack-bg-autumn-maple' && (
          <g>
            {/* Golden Autumn Sunrays */}
            <polygon points="620,0 710,0 785,220 675,220" fill="#fef08a" opacity="0.14" />
            <polygon points="520,0 595,0 640,220 550,220" fill="#fbbf24" opacity="0.11" />
            {/* Maple Branches & Drifting Amber Maple Leaves */}
            <path d="M280 0C380 44 480 56 595 36" stroke="#291206" strokeWidth="4.5" fill="none" />
            {[
              [420, 48, 1.15, -18],
              [500, 62, 1.3, 12],
              [620, 78, 1.25, -25],
              [705, 54, 1.1, 22],
              [560, 148, 0.95, 36],
              [675, 162, 1.05, -30],
            ].map(([x, y, s, rot], idx) => (
              <path
                key={idx}
                d="M0,-14 L4,-5 L13,-7 L7,1 L12,9 L2,6 L0,14 L-2,6 L-12,9 L-7,1 L-13,-7 L-4,-5 Z"
                transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}
                fill={idx % 2 === 0 ? '#ea580c' : '#f59e0b'}
                stroke="#fed7aa"
                strokeWidth="0.7"
                className={idx >= 4 ? 'ch-anim-float' : undefined}
              />
            ))}
          </g>
        )}

        {artworkKey === 'pack-bg-milkyway-comet' && (
          <g>
            {/* Diagonal Luminous Milky Way Nebula */}
            <path
              d="M260 210C370 140 480 86 640 -20L740 -20C590 96 465 156 360 220Z"
              fill="#a78bfa"
              opacity="0.22"
            />
            <path
              d="M310 210C410 144 510 94 670 -10L705 -10C555 100 445 154 345 215Z"
              fill="#e879f9"
              opacity="0.18"
            />
            {/* Shooting Star / Silver Comet */}
            <line x1="650" y1="62" x2="742" y2="30" stroke="#e0f2fe" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="650" cy="62" r="3.4" fill="#ffffff" className="ch-anim-twinkle" />
            {/* Twinkling Stars */}
            {[
              [430, 52],
              [520, 36],
              [590, 96],
              [720, 88],
              [760, 44],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8" fill="#f8fafc" className="ch-anim-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
            {/* Dark Alpine Silhouette Ridge */}
            <path d="M0 198L140 164L280 192L445 150L585 186L705 148L800 176V220H0Z" fill="#020617" />
          </g>
        )}
      </svg>

      {/* Traveling spotlight beam overlay for Quantum & Booyah Inferno banners */}
      {(artworkKey === 'anim-quantum' || artworkKey === 'anim-booyah-inferno') && (
        <div
          className="absolute inset-y-0 w-1/3 ch-anim-sweep pointer-events-none"
          style={{
            background:
              artworkKey === 'anim-booyah-inferno'
                ? 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.22) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.22) 50%, transparent 100%)',
          }}
        />
      )}

      {/* Subtle accent top edge specular highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[1.5px] opacity-55"
        style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
      />
    </div>
  );
};

export const ProfileBannerBackdrop: React.FC<{
  backgroundId?: string;
  className?: string;
  scrimClassName?: string;
  staticPreview?: boolean;
}> = React.memo(({ backgroundId = 'default', className = '', scrimClassName, staticPreview = false }) => {
  const bg = getStoreBackgroundById(backgroundId);
  if (bg.id === 'default') return null;

  const artworkKey: BannerArtworkKey = bg.artworkKey || 'none';

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ch-protected-asset ${
        staticPreview ? 'ch-static-preview' : ''
      } ${className}`}
      onContextMenu={preventAssetCopy}
      onDragStart={preventAssetCopy}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-95" style={{ backgroundImage: bg.gradientCss }} />
      {bg.imageUrl ? (
        <ProtectedCosmeticImage
          src={bg.imageUrl}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={bg.imagePosition ? { objectPosition: bg.imagePosition } : undefined}
          shimmerClassName="bg-white/10"
        />
      ) : (
        <>
          {bg.patternCss && (
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: bg.patternCss,
                backgroundSize: '24px 24px',
              }}
            />
          )}
          <BannerVectorLayer artworkKey={artworkKey} accentHex={bg.accentHex} />
        </>
      )}
      <div
        className={
          scrimClassName ||
          'absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20'
        }
      />
    </div>
  );
});

export const getMajorTierIcon = (majorTier: string, className: string = 'w-3.5 h-3.5') => {
  switch (majorTier) {
    case 'Conqueror':
      return <Crown className={className} />;
    case 'Ace':
      return <Star className={className} />;
    case 'Heroic':
      return <Flame className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'Diamond':
      return <Sparkles className={className} />;
    case 'Platinum':
    case 'Gold':
      return <Shield className={className} />;
    case 'Silver':
      return <Award className={className} />;
    default:
      return <Compass className={className} />;
  }
};

export const RankTierBadge: React.FC<{
  totalPointsEarned?: number;
  rankTierOverride?: string;
  compact?: boolean;
  showLevel?: boolean;
}> = ({ totalPointsEarned = 0, rankTierOverride, compact = false, showLevel = true }) => {
  const rank = getScholarRank(totalPointsEarned);
  const displayTier = rankTierOverride || rank.tier;
  const inferredMajor = displayTier.split(' ')[0] || rank.majorTier;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border font-mono font-bold whitespace-nowrap ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      } ${rank.badgeColor}`}
    >
      {getMajorTierIcon(inferredMajor, compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0')}
      <span>{displayTier}</span>
      {showLevel && <span className="opacity-80">· Lv.{rank.level}</span>}
    </span>
  );
};
