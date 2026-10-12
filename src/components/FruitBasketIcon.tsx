import React from 'react';

interface FruitBasketIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const FruitBasketIcon: React.FC<FruitBasketIconProps> = ({
  className = 'w-10 h-10',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Gradients for juicy fruits and basket */}
        <linearGradient id="basketGrad" x1="16" y1="36" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="basketRimGrad" x1="12" y1="32" x2="52" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="appleGrad" x1="18" y1="16" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="40%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        <linearGradient id="orangeGrad" x1="32" y1="20" x2="48" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id="grapeGrad" x1="10" y1="28" x2="22" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        <linearGradient id="bananaGrad" x1="36" y1="12" x2="52" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id="leafGrad" x1="22" y1="12" x2="30" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
      </defs>

      {/* Basket Handle (behind fruits) */}
      <path
        d="M 18 36 C 18 16, 46 16, 46 36"
        fill="none"
        stroke="#D97706"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 18 36 C 18 18, 46 18, 46 36"
        fill="none"
        stroke="#FDE68A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 2"
      />

      {/* --- FRUITS (Behind basket front rim) --- */}

      {/* Banana peeking top right */}
      <path
        d="M 36 18 C 42 16, 51 22, 51 32 C 48 30, 42 26, 36 28 C 34 24, 34 20, 36 18 Z"
        fill="url(#bananaGrad)"
        stroke="#A16207"
        strokeWidth="1"
      />
      {/* Banana tip */}
      <circle cx="36" cy="18" r="1" fill="#713F12" />

      {/* Red Apple (left-center) */}
      <g>
        {/* Apple stem */}
        <path
          d="M 25 18 C 25 14, 28 13, 29 12"
          fill="none"
          stroke="#78350F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Apple leaf */}
        <path
          d="M 28 14 C 33 13, 34 17, 30 18 C 28 18, 27 16, 28 14 Z"
          fill="url(#leafGrad)"
        />
        {/* Apple body */}
        <path
          d="M 25 19 C 23 18, 17 20, 16 26 C 15 32, 21 38, 25 38 C 29 38, 35 32, 34 26 C 33 20, 27 18, 25 19 Z"
          fill="url(#appleGrad)"
          stroke="#991B1B"
          strokeWidth="1"
        />
        {/* Apple highlight sheen */}
        <path
          d="M 18 24 C 18 21, 21 20, 23 20"
          fill="none"
          stroke="#FECACA"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* Orange (right-center) */}
      <g>
        {/* Orange leaf */}
        <path
          d="M 42 21 C 46 20, 46 24, 43 25 C 41 25, 41 23, 42 21 Z"
          fill="url(#leafGrad)"
        />
        {/* Orange body */}
        <circle
          cx="41"
          cy="29"
          r="8"
          fill="url(#orangeGrad)"
          stroke="#C2410C"
          strokeWidth="1"
        />
        {/* Orange highlight */}
        <path
          d="M 37 25 C 39 23, 42 23, 44 24"
          fill="none"
          stroke="#FFEDD5"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* Grapes (bunch on left edge) */}
      <g>
        <circle cx="16" cy="30" r="3.2" fill="url(#grapeGrad)" stroke="#581C87" strokeWidth="0.8" />
        <circle cx="13" cy="34" r="3.2" fill="url(#grapeGrad)" stroke="#581C87" strokeWidth="0.8" />
        <circle cx="18" cy="35" r="3.2" fill="url(#grapeGrad)" stroke="#581C87" strokeWidth="0.8" />
        <circle cx="15" cy="39" r="3" fill="url(#grapeGrad)" stroke="#581C87" strokeWidth="0.8" />
        {/* Grape highlights */}
        <circle cx="15" cy="29" r="0.8" fill="#F3E8FF" />
        <circle cx="12" cy="33" r="0.8" fill="#F3E8FF" />
        <circle cx="17" cy="34" r="0.8" fill="#F3E8FF" />
      </g>

      {/* Cute Strawberry in the front/center */}
      <g>
        <path
          d="M 28 32 C 26 31, 24 33, 24 36 C 24 40, 28 43, 28.5 43 C 29 43, 33 40, 33 36 C 33 33, 31 31, 28 32 Z"
          fill="#DC2626"
          stroke="#991B1B"
          strokeWidth="0.8"
        />
        {/* Calyx (leaves) */}
        <path
          d="M 26 31.5 L 28.5 33 L 31 31.5 L 29.5 34 L 28.5 32 L 27.5 34 Z"
          fill="#22C55E"
        />
        {/* Strawberry seed dots */}
        <circle cx="27" cy="35" r="0.5" fill="#FEF08A" />
        <circle cx="30" cy="35" r="0.5" fill="#FEF08A" />
        <circle cx="28.5" cy="38" r="0.5" fill="#FEF08A" />
        <circle cx="27" cy="40" r="0.4" fill="#FEF08A" />
        <circle cx="30" cy="40" r="0.4" fill="#FEF08A" />
      </g>

      {/* --- BASKET (Front & Body) --- */}

      {/* Basket Main Body */}
      <path
        d="M 15 36 L 20 54 C 20.5 56, 23 57, 26 57 L 38 57 C 41 57, 43.5 56, 44 54 L 49 36 Z"
        fill="url(#basketGrad)"
        stroke="#92400E"
        strokeWidth="1.5"
      />

      {/* Woven Basket Weave Texture (Hatched curved lines) */}
      <g stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.85">
        {/* Horizontal ribs */}
        <path d="M 16.5 41 C 24 43, 40 43, 47.5 41" fill="none" />
        <path d="M 18 46 C 25 48, 39 48, 46 46" fill="none" />
        <path d="M 19.5 51 C 26 53, 38 53, 44.5 51" fill="none" />

        {/* Diagonal weave cross patterns */}
        <path d="M 22 37 L 27 57" fill="none" />
        <path d="M 32 37 L 32 57" fill="none" />
        <path d="M 42 37 L 37 57" fill="none" />
      </g>

      {/* Basket Rim / Lip */}
      <rect
        x="12"
        y="33"
        width="40"
        height="5.5"
        rx="2.75"
        fill="url(#basketRimGrad)"
        stroke="#92400E"
        strokeWidth="1.5"
      />

      {/* Basket Rim Braided Texture */}
      <path
        d="M 15 35.75 Q 18 33.5, 21 35.75 Q 24 38, 27 35.75 Q 30 33.5, 33 35.75 Q 36 38, 39 35.75 Q 42 33.5, 45 35.75 Q 48 38, 51 35.75"
        fill="none"
        stroke="#92400E"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Basket Bottom Base Shadow/Trim */}
      <path
        d="M 23 57 C 27 58, 37 58, 41 57"
        stroke="#78350F"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* --- GAMIFIED SPARKLES / STARS --- */}
      {/* Top right magic twinkle star */}
      <g transform="translate(52, 12)">
        <path
          d="M 0 -4 Q 0 0, 4 0 Q 0 0, 0 4 Q 0 0, -4 0 Q 0 0, 0 -4 Z"
          fill="#FBBF24"
        />
      </g>
      {/* Small sparkle top left */}
      <g transform="translate(10, 18) scale(0.75)">
        <path
          d="M 0 -4 Q 0 0, 4 0 Q 0 0, 0 4 Q 0 0, -4 0 Q 0 0, 0 -4 Z"
          fill="#FDE047"
        />
      </g>
    </svg>
  );
};
