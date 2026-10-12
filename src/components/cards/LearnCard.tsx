import React from 'react';
import { motion } from 'motion/react';
import { LearnCardItem } from '../../types';

interface LearnCardProps {
  card: LearnCardItem;
  onClick: () => void;
}

export const LearnCard: React.FC<LearnCardProps> = ({ card, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`w-[172px] sm:w-[185px] shrink-0 snap-start rounded-[24px] bg-white/95 backdrop-blur-xs border-2 ${card.cardBorder} shadow-lg shadow-amber-950/5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all group`}
    >
      <div className={`h-22 bg-gradient-to-br ${card.headerBg} relative flex flex-col items-center justify-center p-2 overflow-hidden border-b border-black/5`}>
        <span className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/90 shadow-2xs border border-white/60 ${card.badgeColor}`}>
          {card.category}
        </span>

        {card.illustrationType === 'math' ? (
          <div className="text-2xl font-black text-orange-950/75 tracking-widest flex items-center gap-2 mt-2">
            <span>×</span>
            <span>÷</span>
            <span>+</span>
            <span>−</span>
          </div>
        ) : card.illustrationType === 'literacy' ? (
          <div className="text-2xl font-black text-amber-950/80 tracking-wider flex items-center gap-1.5 font-serif mt-2">
            <span>a</span>
            <span>s</span>
            <span>d</span>
            <span>f</span>
          </div>
        ) : card.illustrationType === 'custom' ? (
          <div className="text-3xl text-sky-700/80 drop-shadow-sm mt-2">
            ✦
          </div>
        ) : card.illustrationType === 'art' ? (
          <div className="text-3xl drop-shadow-md group-hover:scale-115 transition-transform duration-200 mt-2">
            🎨
          </div>
        ) : card.illustrationType === 'history' ? (
          <div className="text-3xl drop-shadow-md group-hover:scale-115 transition-transform duration-200 mt-2">
            🏛️
          </div>
        ) : (
          <div className="text-3xl drop-shadow-md group-hover:scale-115 transition-transform duration-200 mt-2">
            🪐
          </div>
        )}
      </div>

      <div className={`p-3 flex-1 flex flex-col justify-between ${card.bodyBg}`}>
        <div>
          <h4 className="font-black text-sm text-neutral-900 leading-tight">
            {card.title}
          </h4>
          <p className="text-[10px] text-neutral-600 font-medium mt-1 leading-snug line-clamp-2">
            {card.subtitle}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white shadow-2xs border border-neutral-100 text-neutral-700">
            {card.reward}
          </span>
          <span className={`text-[11px] font-black ${card.accentColor} flex items-center gap-0.5 group-hover:translate-x-1 transition-transform`}>
            <span>Buka</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
