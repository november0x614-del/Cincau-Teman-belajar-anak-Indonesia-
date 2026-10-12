import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FruitBasketIcon } from './FruitBasketIcon';
import { HoneyBottleItem, RedAppleItem, WatermelonSliceItem } from './CincauFoodItems';
import {
  playPopSound,
  playMunchSound,
  playCheerSound,
  playPurrSound,
} from '../utils/audioEffects';
import { Sparkles, Heart, Settings, X, RefreshCw, Volume2, Hand } from 'lucide-react';
import { CharviEmotion, LookTarget } from '../types';

export interface FoodInventory {
  honey: number;
  apple: number;
  watermelon: number;
}

export type FoodType = 'honey' | 'apple' | 'watermelon';

interface Particle {
  id: number;
  x: number;
  y: number;
  icon: string;
  color: string;
  scale: number;
  rotation: number;
  vy: number;
  vx: number;
}

interface CincauFeedingOverlayProps {
  isMenuOpen: boolean;
  isFeedingOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onOpenFeeding: () => void;
  onCloseFeeding: () => void;
  onFeedSuccess: (food: FoodType, message: string) => void;
  onPetMascot: () => void;
  onHpChange?: (hp: number) => void;
  onMascotEmotionChange?: (emotion: CharviEmotion) => void;
  onLookTargetChange?: (target: LookTarget | null) => void;
  mascotContainerRef: React.RefObject<HTMLDivElement | null>;
  hp?: number;
  setHp?: React.Dispatch<React.SetStateAction<number>>;
}

export const CincauFeedingOverlay: React.FC<CincauFeedingOverlayProps> = ({
  isMenuOpen,
  isFeedingOpen,
  onOpenMenu,
  onCloseMenu,
  onOpenFeeding,
  onCloseFeeding,
  onFeedSuccess,
  onPetMascot,
  onHpChange,
  onMascotEmotionChange,
  onLookTargetChange,
  mascotContainerRef,
  hp: externalHp,
  setHp: externalSetHp,
}) => {
  // Internal HP fallback if parent doesn't provide hp or setHp
  const [internalHp, setInternalHp] = useState<number>(75);

  const currentHp = typeof externalHp === 'number' && !isNaN(externalHp) ? externalHp : internalHp;

  const updateHp = useCallback((updater: number | ((prev: number) => number)) => {
    if (externalSetHp) {
      externalSetHp(updater);
    }
    setInternalHp((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return isNaN(next) ? 75 : next;
    });
  }, [externalSetHp]);

  // Floating HP gained badge (+6 HP or +30 HP)
  const [floatingHpText, setFloatingHpText] = useState<{ id: number; text: string } | null>(null);

  // Sync HP back to parent if needed for legacy components (optional)
  useEffect(() => {
    if (onHpChange) onHpChange(currentHp);
  }, [currentHp, onHpChange]);

  // HP menyurut (gradual depletion like a healthbar over time, min 15 so Cincau stays alive)
  useEffect(() => {
    const decayTimer = setInterval(() => {
      updateHp((prev) => Math.max(15, prev - 1));
    }, 12000);
    return () => clearInterval(decayTimer);
  }, [updateHp]);

  // Inventory state for rewards
  const [inventory, setInventory] = useState<FoodInventory>({
    honey: 1,
    apple: 1,
    watermelon: 1,
  });

  // Sound toggle state for the playful settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Dragging state
  const [activeDraggingFood, setActiveDraggingFood] = useState<FoodType | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isOverMascotDropZone, setIsOverMascotDropZone] = useState(false);

  // Particles for feeding celebrations
  const [particles, setParticles] = useState<Particle[]>([]);

  // Dialog bubble message for Cincau
  const [cincauSpeech, setCincauSpeech] = useState<string | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalFoodCount = inventory.honey + inventory.apple + inventory.watermelon;

  const showSpeech = useCallback((text: string, durationMs = 3800) => {
    setCincauSpeech(text);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => {
      setCincauSpeech(null);
    }, durationMs);
  }, []);

  // Spawn fun particles when Cincau eats or gets petted
  const spawnParticles = useCallback((originX: number, originY: number, type: 'food' | 'pet') => {
    const icons = type === 'food' ? ['✨', '❤️', '🌟', '🍯', '🍎', '🍉', '💖'] : ['💖', '✨', '🐾', '🥰', '⭐'];
    const newParticles: Particle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: originX + (Math.random() - 0.5) * 60,
      y: originY + (Math.random() - 0.5) * 30,
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: type === 'food' ? '#F59E0B' : '#EC4899',
      scale: 0.8 + Math.random() * 0.8,
      rotation: (Math.random() - 0.5) * 60,
      vy: -4 - Math.random() * 5,
      vx: (Math.random() - 0.5) * 6,
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1200);
  }, []);

  // Feeding action logic
  const handleFeedFood = useCallback((food: FoodType, dropX?: number, dropY?: number) => {
    if (inventory[food] <= 0) return;

    if (soundEnabled) {
      playMunchSound();
      setTimeout(playCheerSound, 250);
    }

    // Decrement inventory
    setInventory((prev) => ({
      ...prev,
      [food]: Math.max(0, prev[food] - 1),
    }));

    // Trigger mascot reaction
    if (onMascotEmotionChange) {
      onMascotEmotionChange('excited');
      setTimeout(() => {
        onMascotEmotionChange('happy');
      }, 1600);
    }

    // HP calculation for food: Giving food restores significantly more HP than petting (+25 to +35 HP)
    const hpGain = food === 'honey' ? 35 : food === 'apple' ? 30 : 25;
    updateHp((prev) => Math.min(100, prev + hpGain));
    setFloatingHpText({ id: Date.now(), text: `+${hpGain} HP` });
    setTimeout(() => setFloatingHpText(null), 1400);

    let speech = '';
    if (food === 'honey') {
      speech = `Nyam! Madu Hutan manis sekali! (+${hpGain} HP) Tenaga Cincau pulih! 🍯✨`;
    } else if (food === 'apple') {
      speech = `Kriuk! Apel merahnya segar! (+${hpGain} HP) Cincau kenyang & kuat! 🍎✨`;
    } else {
      speech = `Slurp! Semangkanya manis dan segar! (+${hpGain} HP) Dahaga hilang! 🍉✨`;
    }

    showSpeech(speech);
    onFeedSuccess(food, speech);

    // Particle burst at mascot mouth / drop position
    const posX = dropX ?? (window.innerWidth / 2);
    const posY = dropY ?? (window.innerHeight * 0.72);
    spawnParticles(posX, posY, 'food');
  }, [inventory, soundEnabled, onMascotEmotionChange, onFeedSuccess, showSpeech, spawnParticles, updateHp]);

  // Pointer drag events for food items
  const handlePointerDown = (e: React.PointerEvent, food: FoodType) => {
    e.stopPropagation();
    e.preventDefault();
    if (inventory[food] <= 0) return;

    if (soundEnabled) playPopSound();
    setActiveDraggingFood(food);
    setDragPosition({ x: e.clientX, y: e.clientY });

    // Look at food while dragging
    if (onLookTargetChange) {
      const normX = ((e.clientX / window.innerWidth) - 0.5) * 2;
      const normY = ((e.clientY / window.innerHeight) - 0.5) * 2;
      onLookTargetChange({ x: normX, y: normY });
    }
  };

  useEffect(() => {
    if (!activeDraggingFood) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });

      // Update look target to follow the food
      if (onLookTargetChange) {
        const normX = ((e.clientX / window.innerWidth) - 0.5) * 2;
        const normY = ((e.clientY / window.innerHeight) - 0.5) * 2;
        onLookTargetChange({ x: normX, y: normY });
      }

      // Check collision with Cincau's stage container
      if (mascotContainerRef.current) {
        const rect = mascotContainerRef.current.getBoundingClientRect();
        const isInMascotZone =
          e.clientX >= rect.left - 20 &&
          e.clientX <= rect.right + 20 &&
          e.clientY >= rect.top - 40 &&
          e.clientY <= rect.bottom + 50;

        setIsOverMascotDropZone(isInMascotZone);
        if (isInMascotZone && onMascotEmotionChange) {
          onMascotEmotionChange('happy');
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (activeDraggingFood) {
        let fed = false;
        if (mascotContainerRef.current) {
          const rect = mascotContainerRef.current.getBoundingClientRect();
          const isInMascotZone =
            e.clientX >= rect.left - 30 &&
            e.clientX <= rect.right + 30 &&
            e.clientY >= rect.top - 60 &&
            e.clientY <= rect.bottom + 60;

          if (isInMascotZone) {
            fed = true;
            handleFeedFood(activeDraggingFood, e.clientX, e.clientY);
          }
        }

        if (!fed) {
          // If released elsewhere, reset gaze
          if (onLookTargetChange) onLookTargetChange(null);
        }
      }

      setActiveDraggingFood(null);
      setIsOverMascotDropZone(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [activeDraggingFood, mascotContainerRef, handleFeedFood, onLookTargetChange, onMascotEmotionChange]);

  // Handle petting Cincau from the menu (+6 HP, smaller gain than food)
  const handlePetAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) playPurrSound();
    if (onMascotEmotionChange) {
      onMascotEmotionChange('excited');
      setTimeout(() => onMascotEmotionChange('happy'), 1500);
    }

    const loveHpGain = 6;
    updateHp((prev) => Math.min(100, prev + loveHpGain));
    setFloatingHpText({ id: Date.now(), text: `+${loveHpGain} HP 💕` });
    setTimeout(() => setFloatingHpText(null), 1200);

    const speechText =
      currentHp + loveHpGain >= 100
        ? 'Wahhh Cincau senang banget! HP Cincau Penuh 100%! 🥰💖'
        : `Aww, geli tapi enak! (+${loveHpGain} HP) Cincau sayang kamu! 🥰💖`;
    showSpeech(speechText, 3200);
    showSpeech(speechText, 3200);

    const rect = mascotContainerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height * 0.4 : window.innerHeight * 0.7;
    spawnParticles(cx, cy, 'pet');
    onPetMascot();
  };

  // Refill rewards if all food is finished
  const handleRefillRewards = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) playCheerSound();
    setInventory({ honey: 1, apple: 1, watermelon: 1 });
    showSpeech('Horeee! Keranjang hadiah terisi kembali! 🎉🍓', 3000);
  };

  return (
    <>
      {/* 1. HORIZONTAL BUBBLE MENU ABOVE CINCAU (Triggered by double-tap) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-[360px] sm:bottom-[400px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.16)] border-2 border-amber-200/90 pointer-events-auto"
          >
            {/* Bubble pointer tail at bottom */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-amber-200/90" />

            {/* Item 1: Keranjang Hadiah / Reward Basket (Primary Action) */}
            <motion.button
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                if (soundEnabled) playPopSound();
                onCloseMenu();
                onOpenFeeding();
              }}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linear-to-r from-amber-400 to-orange-400 text-white font-bold text-xs shadow-md shadow-orange-400/30 cursor-pointer active:scale-95 transition-all group"
              title="Buka Keranjang Hadiah Makanan"
            >
              <div className="relative">
                <FruitBasketIcon className="w-6 h-6 drop-shadow group-hover:scale-110 transition-transform" />
                {totalFoodCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-2xs animate-bounce">
                    {totalFoodCount}
                  </span>
                )}
              </div>
              <span className="tracking-tight text-white drop-shadow-xs">Hadiah Buah</span>
            </motion.button>

            {/* Item 2: Icon Love & Radial Healthbar (Lingkaran pink lebih tua yang menyurut seperti healthbar) */}
            <div className="relative flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePetAction}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-pink-50/90 hover:bg-pink-100 transition-all cursor-pointer shadow-xs group ${
                  currentHp <= 30 ? 'animate-pulse ring-2 ring-pink-400 ring-offset-1' : ''
                }`}
                title={`HP Cincau: ${Math.round(currentHp)}% (Tekan Love: +6 HP, Beri Makan: +30 HP)`}
              >
                {/* SVG Radial Healthbar Gauge: Warna pink yang lebih tua (#db2777 / #be185d) */}
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 40 40"
                >
                  {/* Background Track Circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="transparent"
                    stroke="#fce7f3"
                    strokeWidth="3"
                  />
                  {/* Depleting Healthbar Ring (Warna pink lebih tua yang menyurut) */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="transparent"
                    stroke="#db2777"
                    strokeWidth="3.2"
                    strokeDasharray={100.53}
                    strokeDashoffset={100.53 * (1 - Math.max(0, Math.min(100, typeof currentHp === 'number' && !isNaN(currentHp) ? currentHp : 75)) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                {/* Love Icon (Warna pink lebih tua) */}
                <Heart className="w-4 h-4 fill-[#db2777] text-[#db2777] drop-shadow-2xs group-hover:scale-115 transition-transform" />

                {/* Indikator Angka HP Mini */}
                <span className="absolute -bottom-1 -right-1 bg-[#be185d] text-white text-[8.5px] font-black px-1 rounded-full border border-white shadow-2xs leading-tight">
                  {Math.round(currentHp)}
                </span>
              </motion.button>

              {/* Floating +HP Toast Animation */}
              <AnimatePresence>
                {floatingHpText && (
                  <motion.div
                    key={floatingHpText.id}
                    initial={{ opacity: 1, y: 0, scale: 0.85 }}
                    animate={{ opacity: 0, y: -26, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap px-1.5 py-0.5 rounded-full bg-linear-to-r from-rose-500 to-pink-600 text-white font-black text-[10px] shadow-md shadow-pink-500/30 flex items-center gap-0.5 z-50 border border-white"
                  >
                    <span>{floatingHpText.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Item 3: Pengaturan Ceria / Suara */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                if (soundEnabled) playPopSound();
                setShowSettingsModal(true);
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer shadow-xs"
              title="Pengaturan Suara & Aplikasi"
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            {/* Item 4: Tutup Menu */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                onCloseMenu();
              }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors cursor-pointer ml-0.5"
              title="Tutup Menu"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FEEDING MODE: EXPANDED BASKET & SPLASHED FOOD ITEMS */}
      <AnimatePresence>
        {isFeedingOpen && (
          <motion.div
            key="feeding-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              // Only clicking the basket image closes the menu as requested
              e.stopPropagation();
            }}
            className="absolute inset-0 z-35 flex flex-col items-center justify-start pointer-events-auto select-none"
          >
            {/* Subtle soft backdrop overlay (allows clicking outside to close) */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />

            {/* EXPANDED CENTER BASKET (Zoomed into center stage with playful pop) */}
            <motion.div
              initial={{ scale: 0.3, y: 80, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
              }}
              exit={{ scale: 0.3, y: 60, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 18,
                stiffness: 240,
                mass: 0.9,
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-14 flex flex-col items-center relative z-25"
            >
              {/* Golden Sunburst / Glow behind basket */}
              <div className="absolute -inset-10 bg-radial from-amber-300/35 via-orange-200/20 to-transparent blur-xl pointer-events-none animate-pulse" />

              {/* Enlarged Basket Icon (Click to close menu) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (soundEnabled) playPopSound();
                  onCloseFeeding();
                }}
                className="relative cursor-pointer filter drop-shadow-xl hover:scale-105 transition-transform"
                title="Klik gambar keranjang untuk menutup menu makanan"
              >
                <FruitBasketIcon className="w-24 h-24 sm:w-28 sm:h-28" />

                {/* Sparkling open badge */}
                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white flex items-center gap-1">
                  <span>Terbuka</span>
                  <span>✨</span>
                </div>
              </div>

              <div className="mt-1 text-center flex flex-col items-center">
                <p className="text-xs font-extrabold text-neutral-800">
                  Keranjang Hadiah Cincau
                </p>
                <div className="mt-0.5 flex items-center justify-center gap-2">
                  <p className="text-[11px] font-medium text-neutral-500">
                    {totalFoodCount > 0
                      ? `Tersedia ${totalFoodCount} makanan lezat`
                      : 'Semua makanan sudah habis dimakan!'}
                  </p>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 shadow-2xs">
                    <Heart className="w-3 h-3 fill-[#db2777] text-[#db2777]" />
                    <span className="text-[10px] font-bold text-[#be185d]">HP {Math.round(typeof currentHp === 'number' && !isNaN(currentHp) ? currentHp : 75)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SPLASHED FOOD ITEMS SPREAD IN THE EMPTY AREA BELOW */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm px-6 mt-6 flex justify-around items-center z-30"
            >
              {/* 1. Botol Madu Hutan */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, y: -40, rotate: -20 }}
                  animate={{
                    scale: 1,
                    y: [0, -6, 0],
                    rotate: [-3, 3, -3],
                  }}
                  transition={{
                    scale: { type: 'spring', damping: 15, stiffness: 220, delay: 0.1 },
                    y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.1 },
                    rotate: { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.1 },
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'honey')}
                  onClick={() => handleFeedFood('honey')}
                  className={`relative p-2 rounded-2xl cursor-grab active:cursor-grabbing transition-transform touch-none ${
                    inventory.honey > 0
                      ? 'bg-amber-50/90 border-2 border-amber-300 shadow-md shadow-amber-500/20 hover:scale-110 active:scale-95'
                      : 'opacity-40 grayscale border border-neutral-300 cursor-not-allowed'
                  }`}
                  title="1 Botol Madu Hutan - Tarik ke Cincau!"
                >
                  <HoneyBottleItem className="w-16 h-16 drop-shadow-md" />
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {inventory.honey}
                  </span>
                </motion.div>
                <span className="mt-1.5 text-[11px] font-bold text-neutral-700 text-center">
                  Madu Hutan
                </span>
                <span className="text-[9px] text-amber-700/80 font-semibold">1 Botol</span>
              </div>

              {/* 2. Apel Merah */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, y: -40, rotate: 15 }}
                  animate={{
                    scale: 1,
                    y: [0, -7, 0],
                    rotate: [2, -2, 2],
                  }}
                  transition={{
                    scale: { type: 'spring', damping: 15, stiffness: 220, delay: 0.18 },
                    y: { repeat: Infinity, duration: 3.1, ease: 'easeInOut', delay: 0.4 },
                    rotate: { repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.3 },
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'apple')}
                  onClick={() => handleFeedFood('apple')}
                  className={`relative p-2 rounded-2xl cursor-grab active:cursor-grabbing transition-transform touch-none ${
                    inventory.apple > 0
                      ? 'bg-red-50/90 border-2 border-red-300 shadow-md shadow-red-500/20 hover:scale-110 active:scale-95'
                      : 'opacity-40 grayscale border border-neutral-300 cursor-not-allowed'
                  }`}
                  title="1 Apel Merah - Tarik ke Cincau!"
                >
                  <RedAppleItem className="w-16 h-16 drop-shadow-md" />
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {inventory.apple}
                  </span>
                </motion.div>
                <span className="mt-1.5 text-[11px] font-bold text-neutral-700 text-center">
                  Apel Merah
                </span>
                <span className="text-[9px] text-red-700/80 font-semibold">1 Buah</span>
              </div>

              {/* 3. Potong Semangka */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, y: -40, rotate: -15 }}
                  animate={{
                    scale: 1,
                    y: [0, -6, 0],
                    rotate: [-3, 2, -3],
                  }}
                  transition={{
                    scale: { type: 'spring', damping: 15, stiffness: 220, delay: 0.25 },
                    y: { repeat: Infinity, duration: 2.9, ease: 'easeInOut', delay: 0.7 },
                    rotate: { repeat: Infinity, duration: 3.4, ease: 'easeInOut', delay: 0.5 },
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'watermelon')}
                  onClick={() => handleFeedFood('watermelon')}
                  className={`relative p-2 rounded-2xl cursor-grab active:cursor-grabbing transition-transform touch-none ${
                    inventory.watermelon > 0
                      ? 'bg-emerald-50/90 border-2 border-emerald-300 shadow-md shadow-emerald-500/20 hover:scale-110 active:scale-95'
                      : 'opacity-40 grayscale border border-neutral-300 cursor-not-allowed'
                  }`}
                  title="1 Potong Semangka - Tarik ke Cincau!"
                >
                  <WatermelonSliceItem className="w-16 h-16 drop-shadow-md" />
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {inventory.watermelon}
                  </span>
                </motion.div>
                <span className="mt-1.5 text-[11px] font-bold text-neutral-700 text-center">
                  Semangka Segar
                </span>
                <span className="text-[9px] text-emerald-700/80 font-semibold">1 Potong</span>
              </div>
            </div>

            {/* Refill Button if empty */}
            {totalFoodCount === 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleRefillRewards}
                className="mt-4 px-4 py-2 bg-linear-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-full shadow-md shadow-orange-400/25 flex items-center gap-1.5 cursor-pointer z-30 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Isi Ulang Hadiah (Refill)</span>
              </motion.button>
            )}


          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. ACTIVE DRAGGING FOOD GHOST (Follows pointer / finger smoothly) */}
      {activeDraggingFood && (
        <div
          style={{
            position: 'fixed',
            left: dragPosition.x,
            top: dragPosition.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="scale-125 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] animate-pulse"
        >
          {activeDraggingFood === 'honey' && <HoneyBottleItem className="w-20 h-20" />}
          {activeDraggingFood === 'apple' && <RedAppleItem className="w-20 h-20" />}
          {activeDraggingFood === 'watermelon' && <WatermelonSliceItem className="w-20 h-20" />}
        </div>
      )}

      {/* 4. DROP TARGET HIGHLIGHT OVER CINCAU (Appears when dragging over Cincau zone) */}
      <AnimatePresence>
        {isOverMascotDropZone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[300px] h-[220px] rounded-[48px] border-4 border-dashed border-amber-400 bg-amber-400/15 pointer-events-none z-30 flex items-center justify-center backdrop-blur-[1px]"
          >
            <div className="bg-white/95 px-4 py-1.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1.5 -mt-20">
              <span className="text-sm">😋</span>
              <span className="text-xs font-black text-amber-900 tracking-tight">
                Lepas di sini untuk menyuapi Cincau!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. CINCAU SPEECH BUBBLE (Feedback when eating or interacting) */}
      <AnimatePresence>
        {cincauSpeech && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-[280px] px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-amber-200 text-center pointer-events-auto"
          >
            {/* Bubble pointer at the TOP pointing up to Cincau */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l-2 border-t-2 border-amber-200" />
            <p className="text-xs sm:text-sm font-extrabold text-neutral-800 leading-snug">
              {cincauSpeech}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. PARTICLE BURST (Hearts, stars, sparkles rising up) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: p.x,
            y: p.y,
            scale: 0,
            opacity: 1,
            rotate: p.rotation,
          }}
          animate={{
            x: p.x + p.vx * 15,
            y: p.y + p.vy * 22,
            scale: [0, p.scale, 0],
            opacity: [1, 1, 0],
            rotate: p.rotation + 90,
          }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9998 }}
          className="text-xl sm:text-2xl filter drop-shadow-sm select-none"
        >
          {p.icon}
        </motion.div>
      ))}

      {/* 7. SETTINGS MODAL (Playful audio toggle & about) */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowSettingsModal(false);
            }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-1">Pengaturan Cincau</h3>
              <p className="text-xs text-neutral-500 mb-5">
                Sesuaikan suara dan keseruan permainan Cincau
              </p>

              {/* Sound Toggle */}
              <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-4">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-neutral-600" />
                  <span className="text-xs font-bold text-neutral-800">Efek Suara Lucu</span>
                </div>
                <button
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? 'bg-amber-500' : 'bg-neutral-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: soundEnabled ? 22 : 2 }}
                    className="w-5 h-5 rounded-full bg-white shadow-xs"
                  />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-full bg-neutral-900 text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
