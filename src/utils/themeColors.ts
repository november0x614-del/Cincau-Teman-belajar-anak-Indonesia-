import { MascotTheme } from '../types';

export interface ThemeStyle {
  primaryBg: string;
  primaryHover: string;
  ringColor: string;
  shadowColor: string;
  dotColor: string;
  borderColor: string;
  textColor: string;
  gradientBg: string;
}

export const getThemeStyle = (theme: MascotTheme): ThemeStyle => {
  switch (theme) {
    case 'classic-orange':
      return {
        primaryBg: 'bg-[#ff5500]',
        primaryHover: 'hover:bg-[#ea580c]',
        ringColor: 'ring-orange-400',
        shadowColor: 'shadow-orange-500/30',
        dotColor: 'bg-[#ff5500] shadow-sm shadow-orange-400',
        borderColor: 'border-orange-300/60',
        textColor: 'text-[#ff5500]',
        gradientBg: 'from-orange-50/80 to-white',
      };
    case 'emerald-mint':
      return {
        primaryBg: 'bg-[#059669]',
        primaryHover: 'hover:bg-[#047857]',
        ringColor: 'ring-emerald-400',
        shadowColor: 'shadow-emerald-500/30',
        dotColor: 'bg-[#10b981] shadow-sm shadow-emerald-400',
        borderColor: 'border-emerald-300/60',
        textColor: 'text-[#059669]',
        gradientBg: 'from-emerald-50/80 to-white',
      };
    case 'berry-purple':
      return {
        primaryBg: 'bg-[#7c3aed]',
        primaryHover: 'hover:bg-[#6d28d9]',
        ringColor: 'ring-purple-400',
        shadowColor: 'shadow-purple-500/30',
        dotColor: 'bg-[#8b5cf6] shadow-sm shadow-purple-400',
        borderColor: 'border-purple-300/60',
        textColor: 'text-[#7c3aed]',
        gradientBg: 'from-purple-50/80 to-white',
      };
    case 'sunny-banana':
      return {
        primaryBg: 'bg-[#d97706]',
        primaryHover: 'hover:bg-[#b45309]',
        ringColor: 'ring-amber-400',
        shadowColor: 'shadow-amber-500/30',
        dotColor: 'bg-[#f59e0b] shadow-sm shadow-amber-400',
        borderColor: 'border-amber-300/60',
        textColor: 'text-[#d97706]',
        gradientBg: 'from-amber-50/80 to-white',
      };
    case 'cyan-jelly':
    default:
      return {
        primaryBg: 'bg-[#0284c7]',
        primaryHover: 'hover:bg-[#0369a1]',
        ringColor: 'ring-sky-400',
        shadowColor: 'shadow-sky-500/30',
        dotColor: 'bg-[#00e5ff] shadow-sm shadow-cyan-400',
        borderColor: 'border-sky-300/80',
        textColor: 'text-[#0284c7]',
        gradientBg: 'from-sky-50/90 to-white',
      };
  }
};
