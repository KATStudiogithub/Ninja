import React, { useId } from 'react';

interface AppIconProps {
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ className = 'w-12 h-12', size }) => {
  const uid = useId().replace(/:/g, '');

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-xl select-none shrink-0 bg-indigo-950 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Ikon Aplikasi Ninja Sifir 3D"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-full h-full block"
      >
        <defs>
          <radialGradient id={`bgGrad-${uid}`} cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="55%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>

          <linearGradient id={`goldRim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <radialGradient id={`moonGrad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#fde047" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`hood3D-${uid}`} cx="38%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="78%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          <linearGradient id={`mask3D-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <radialGradient id={`skin3D-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="65%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fdba74" />
          </radialGradient>

          <linearGradient id={`redBand-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="45%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          <linearGradient id={`katanaBlade-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <radialGradient id={`irisGrad-${uid}`} cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>

          <linearGradient id={`silverPlate-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>

        {/* 1. App Icon Base Squircle & Gold Border */}
        <rect
          x="8"
          y="8"
          width="496"
          height="496"
          rx="112"
          fill={`url(#bgGrad-${uid})`}
          stroke={`url(#goldRim-${uid})`}
          strokeWidth="14"
        />

        {/* Subtle Inner Top Gloss */}
        <path
          d="M 55 24 Q 256 6 457 24 Q 492 50 492 120 Q 256 65 20 120 Q 20 50 55 24 Z"
          fill="#ffffff"
          opacity="0.1"
        />

        {/* 2. Mystical Full Moon Halo */}
        <circle cx="256" cy="210" r="185" fill={`url(#moonGrad-${uid})`} />
        <circle cx="256" cy="195" r="128" fill="#fef9c3" opacity="0.16" />

        {/* Sparkle Stars */}
        <g fill="#fef08a" opacity="0.9">
          <circle cx="88" cy="108" r="6" />
          <circle cx="424" cy="96" r="7" />
          <circle cx="72" cy="285" r="5" />
          <circle cx="440" cy="275" r="6" />
          <path d="M110 68 L114 80 L126 84 L114 88 L110 100 L106 88 L94 84 L106 80 Z" />
          <path d="M402 64 L405 74 L415 77 L405 80 L402 90 L399 80 L389 77 L399 74 Z" />
        </g>

        {/* 3. Crossed 3D Katanas Behind Ninja */}
        <g>
          <g transform="translate(256, 235) rotate(-38)">
            <path
              d="M -18 -230 L 18 -205 L 14 90 L -14 90 Z"
              fill={`url(#katanaBlade-${uid})`}
              stroke="#e0f2fe"
              strokeWidth="3"
            />
            <rect
              x="-34"
              y="85"
              width="68"
              height="16"
              rx="8"
              fill={`url(#goldRim-${uid})`}
              stroke="#78350f"
              strokeWidth="2"
            />
            <rect
              x="-13"
              y="101"
              width="26"
              height="85"
              rx="8"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="2"
            />
            <circle cx="0" cy="186" r="15" fill={`url(#goldRim-${uid})`} />
          </g>

          <g transform="translate(256, 235) rotate(38)">
            <path
              d="M -18 -230 L 18 -205 L 14 90 L -14 90 Z"
              fill={`url(#katanaBlade-${uid})`}
              stroke="#e0f2fe"
              strokeWidth="3"
            />
            <rect
              x="-34"
              y="85"
              width="68"
              height="16"
              rx="8"
              fill={`url(#goldRim-${uid})`}
              stroke="#78350f"
              strokeWidth="2"
            />
            <rect
              x="-13"
              y="101"
              width="26"
              height="85"
              rx="8"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="2"
            />
            <circle cx="0" cy="186" r="15" fill={`url(#goldRim-${uid})`} />
          </g>
        </g>

        {/* 4. Flowing Red Headband Tails */}
        <path d="M 380 185 Q 455 155 482 195 Q 455 225 415 215 Z" fill={`url(#redBand-${uid})`} />
        <path d="M 390 205 Q 465 205 476 248 Q 435 262 395 230 Z" fill="#b91c1c" />

        {/* 5. 3D Pixar Chibi Ninja Head */}
        <g>
          <ellipse cx="256" cy="232" rx="152" ry="146" fill={`url(#hood3D-${uid})`} />
          <ellipse
            cx="215"
            cy="128"
            rx="78"
            ry="32"
            fill="#ffffff"
            opacity="0.18"
            transform="rotate(-12 215 128)"
          />

          {/* Warm Peach Face Opening */}
          <rect
            x="128"
            y="172"
            width="256"
            height="106"
            rx="52"
            fill={`url(#skin3D-${uid})`}
            stroke="#1e293b"
            strokeWidth="4"
          />

          {/* Cute Rosy Blush Cheeks */}
          <ellipse cx="156" cy="252" rx="18" ry="10" fill="#fb7185" opacity="0.65" />
          <ellipse cx="356" cy="252" rx="18" ry="10" fill="#fb7185" opacity="0.65" />

          {/* Big Expressive Pixar Left Eye */}
          <g transform="translate(194, 224)">
            <ellipse cx="0" cy="0" rx="30" ry="34" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
            <ellipse cx="4" cy="2" rx="20" ry="24" fill={`url(#irisGrad-${uid})`} />
            <circle cx="5" cy="2" r="12" fill="#090d16" />
            <circle cx="-4" cy="-9" r="7.5" fill="#ffffff" />
            <circle cx="11" cy="10" r="3.5" fill="#ffffff" />
          </g>

          {/* Big Expressive Pixar Right Eye */}
          <g transform="translate(318, 224)">
            <ellipse cx="0" cy="0" rx="30" ry="34" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
            <ellipse cx="-4" cy="2" rx="20" ry="24" fill={`url(#irisGrad-${uid})`} />
            <circle cx="-5" cy="2" r="12" fill="#090d16" />
            <circle cx="-11" cy="-9" r="7.5" fill="#ffffff" />
            <circle cx="4" cy="10" r="3.5" fill="#ffffff" />
          </g>

          {/* Heroic Eyebrows */}
          <path d="M 156 188 Q 195 192 226 206" fill="none" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" />
          <path d="M 356 188 Q 317 192 286 206" fill="none" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" />

          {/* 3D Lower Face Mask Curve */}
          <path d="M 110 250 Q 256 292 402 250 Q 392 372 256 378 Q 120 372 110 250 Z" fill={`url(#mask3D-${uid})`} />
          <path
            d="M 135 262 Q 256 298 377 262"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Crimson Red Headband */}
          <path
            d="M 104 155 Q 256 192 408 155 L 404 202 Q 256 236 108 202 Z"
            fill={`url(#redBand-${uid})`}
            stroke="#7f1d1d"
            strokeWidth="3"
          />

          {/* Silver Forehead Plate with Multiplication Emblem */}
          <rect
            x="202"
            y="158"
            width="108"
            height="44"
            rx="14"
            fill={`url(#silverPlate-${uid})`}
            stroke="#0f172a"
            strokeWidth="3.5"
          />
          <circle cx="218" cy="180" r="4" fill="#475569" />
          <circle cx="294" cy="180" r="4" fill="#475569" />
          <path d="M 244 168 L 268 192 M 268 168 L 244 192" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* 6. 3D Golden Sifir Banner at Bottom */}
        <g>
          <rect
            x="88"
            y="366"
            width="336"
            height="96"
            rx="34"
            fill={`url(#goldRim-${uid})`}
            stroke="#ffffff"
            strokeWidth="6"
          />
          <rect x="100" y="376" width="312" height="76" rx="26" fill="#0f172a" />
          <text
            x="256"
            y="431"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontWeight="900"
            fontSize="52"
            fill="#fef08a"
            textAnchor="middle"
          >
            7 × 8 = 56
          </text>
        </g>
      </svg>
    </div>
  );
};
