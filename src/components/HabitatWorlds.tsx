import React from 'react';
import { motion } from 'motion/react';

interface HabitatWorldsProps {
  viewIndex: number; // 0: Onboarding, 1: Home, 2: Outdoor
}

export const HabitatWorlds: React.FC<HabitatWorldsProps> = ({ viewIndex }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <motion.div
        animate={{ x: `${-(viewIndex * 100) / 3}%` }}
        transition={{ type: 'spring', damping: 26, stiffness: 120 }}
        className="flex h-full w-[300%]"
      >
        {/* DUNIA 0: ONBOARDING (Soft clouds and floating jelly-bits) */}
        <div className="w-1/3 h-full relative bg-white overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50/70 via-amber-50/30 to-emerald-50/40" />

          {/* Sunbeams */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[320px] h-[320px] bg-gradient-radial from-amber-200/40 via-sky-100/20 to-transparent rounded-full blur-2xl animate-pulse" />

          {/* Floating Jelly Clouds */}
          <motion.div
            animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="absolute top-16 left-6 w-28 h-12 bg-sky-100/60 rounded-full blur-md border border-white/70 shadow-xs"
          />
          <motion.div
            animate={{ y: [0, -10, 0], x: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
            className="absolute top-24 right-8 w-36 h-14 bg-amber-100/50 rounded-full blur-md border border-white/60 shadow-xs"
          />

          {/* Floating Jelly Bits */}
          <div className="absolute top-1/3 left-10 text-amber-400 text-lg animate-bounce">✨</div>
          <div className="absolute top-1/2 right-12 text-cyan-400 text-base animate-pulse">🌟</div>
          <div className="absolute top-2/3 left-16 text-emerald-400 text-sm animate-ping [animation-delay:1.5s]">💫</div>
        </div>

        {/* DUNIA 1: RUMAH CINCAU (Giant Crystal Bowl interior, Leaf-study desk, Glowing star shelves) */}
        <div className="w-1/3 h-full relative bg-white overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100/70 via-amber-50/50 to-emerald-50/40" />

          {/* Giant Crystal Bowl Wall Rim */}
          <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-radial from-amber-200/50 via-amber-100/30 to-transparent blur-lg" />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[92%] h-[78%] border-t-8 border-amber-300/40 rounded-t-full blur-[1px] shadow-inner" />

          {/* Arched Window in the Center showing Outside Nature */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-36 h-24 bg-sky-100/80 rounded-t-full border-4 border-amber-200 shadow-md flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-sky-200/90 to-emerald-100/70 relative">
              <span className="absolute top-2 left-3 text-xs">☁️</span>
              <span className="absolute top-1 right-3 text-xs">☀️</span>
            </div>
          </div>

          {/* Leaf Study Desk Silhouette on Left */}
          <div className="absolute bottom-28 left-4 w-36 h-20 bg-emerald-200/50 rounded-2xl border-2 border-emerald-300/60 shadow-xs backdrop-blur-xs flex items-center justify-center">
            <div className="text-xs text-emerald-900 font-extrabold flex items-center gap-1">
              <span>📖</span>
              <span>Meja Belajar</span>
            </div>
          </div>


          {/* Firefly Lanterns */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-amber-400/90 rounded-full blur-xs animate-ping" />
          <div className="absolute top-28 right-10 w-3.5 h-3.5 bg-yellow-300/90 rounded-full blur-xs animate-ping [animation-delay:1.2s]" />
        </div>

        {/* DUNIA 2: LUAR RUANGAN (SWAYING NATURE & BREATHING JUNGLE) */}
        <div className="w-1/3 h-full relative bg-white overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/80 via-teal-50/50 to-lime-100/60" />

          {/* 1. Pulsing Sunbeams in Canopy */}
          <motion.div
            animate={{
              opacity: [0.35, 0.7, 0.35],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            className="absolute -top-16 left-1/4 w-72 h-72 bg-gradient-radial from-amber-200/60 via-lime-100/30 to-transparent rounded-full blur-2xl"
          />

          {/* 2. Swaying Giant Emerald Leaves (Left Corner Leaf) */}
          <motion.div
            animate={{
              rotate: [-5, 6, -5],
              scale: [1, 1.03, 1],
            }}
            transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom left' }}
            className="absolute -bottom-8 -left-12 w-64 h-64 bg-emerald-400/30 rounded-[60%_40%_70%_30%] blur-xl border-t-4 border-emerald-300/40"
          />

          {/* 3. Swaying Giant Emerald Leaves (Right Canopy Leaf) */}
          <motion.div
            animate={{
              rotate: [4, -5, 4],
              scale: [1, 1.04, 1],
            }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.5 }}
            style={{ transformOrigin: 'top right' }}
            className="absolute -top-10 -right-16 w-80 h-80 bg-lime-400/30 rounded-[40%_60%_30%_70%] blur-2xl border-b-4 border-lime-300/40"
          />

          {/* 4. Dripping Dew Drop Animation */}
          <motion.div
            animate={{
              y: [0, 80],
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.4],
            }}
            transition={{ repeat: Infinity, duration: 3.8, ease: 'easeIn', delay: 1 }}
            className="absolute top-28 left-16 w-2.5 h-3.5 bg-sky-200 rounded-full border border-white shadow-xs"
          />

          {/* 5. Fluttering Forest Butterfly Animation */}
          <motion.div
            animate={{
              x: [0, 25, -15, 0],
              y: [0, -30, -15, 0],
              rotate: [-8, 12, -6, -8],
            }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
            className="absolute top-1/3 right-1/4 text-lg filter drop-shadow-sm select-none"
          >
            🦋
          </motion.div>


          {/* 7. Organic Swaying Jungle Foliage SVG Overlay */}
          <motion.svg
            animate={{
              y: [0, -4, 0],
              skewX: [-1.5, 1.5, -1.5],
            }}
            transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 text-emerald-950"
            viewBox="0 0 400 200"
          >
            <path d="M-50,200 Q50,40 150,200 Z" fill="currentColor" />
            <path d="M80,200 Q180,60 280,200 Z" fill="currentColor" />
            <path d="M220,200 Q320,80 420,200 Z" fill="currentColor" />
          </motion.svg>
        </div>
      </motion.div>
    </div>
  );
};
