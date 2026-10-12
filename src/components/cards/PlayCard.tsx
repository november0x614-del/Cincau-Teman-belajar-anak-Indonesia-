import React from 'react';
import { motion } from 'motion/react';
import { PlayCardItem } from '../../types';

interface PlayCardProps {
  card: PlayCardItem;
  onClick: () => void;
}

export const PlayCard: React.FC<PlayCardProps> = ({ card, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`w-[172px] sm:w-[185px] shrink-0 snap-start rounded-[24px] bg-white/95 backdrop-blur-xs border-2 ${card.cardBorder} shadow-lg shadow-emerald-950/5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all group`}
    >
      <div className={`h-22 bg-gradient-to-br ${card.headerBg} relative flex flex-col items-center justify-center p-2 overflow-hidden border-b border-black/5`}>
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/20 rounded-full blur-xs pointer-events-none" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white/20 rounded-full blur-xs pointer-events-none" />

        <span className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/90 shadow-2xs border border-white/60 ${card.badgeColor}`}>
          {card.badge}
        </span>

        <div className="text-3xl drop-shadow-md group-hover:scale-115 transition-transform duration-200 mt-2">
          {card.icon}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-black text-xs text-neutral-900 leading-tight">
            {card.title}
          </h4>
          <p className="text-[10px] text-neutral-500 font-medium mt-0.5 leading-snug line-clamp-1">
            {card.subtitle}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${card.rewardColor}`}>
            {card.reward}
          </span>
          <span className={`text-[10px] font-black text-white px-2.5 py-1 rounded-xl shadow-xs ${card.btnBg} group-hover:shadow-md transition-all`}>
            Main ▶
          </span>
        </div>
      </div>
    </motion.div>
  );
};
