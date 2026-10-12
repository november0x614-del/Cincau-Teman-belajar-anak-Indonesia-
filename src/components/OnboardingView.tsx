/* =========================================================================
   [LOCKED DESIGN] ONBOARDING VIEW
   INSTRUKSI USER: "Mohon design onboard di kunci agar kamu tidak merubahnya tanpa persetujuan ku"
   DESAIN INI DIKUNCI DAN TIDAK BOLEH DIUBAH TANPA PERSETUJUAN EKSPLISIT USER
   ========================================================================= */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharviMascot } from './CharviMascot';
import { Sparkles } from 'lucide-react';
import { MascotTheme, CharviEmotion, LookTarget, ChildProfile } from '../types';
import { CincauFeedingOverlay } from './CincauFeedingOverlay';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { getThemeStyle } from '../utils/themeColors';
import { HabitatWorlds } from './HabitatWorlds';
import { AppleCatchMinigame } from './AppleCatchMinigame';
import { useDraggableCarousel } from '../hooks/useDraggableCarousel';
import { useTamagotchi } from '../hooks/useTamagotchi';
import { PLAY_CARDS, LEARN_CARDS } from '../data/cards';
import { PlayCard } from './cards/PlayCard';
import { LearnCard } from './cards/LearnCard';

interface OnboardingViewProps {
  mascotTheme: MascotTheme;
  onToggleTheme: () => void;
  onStart?: () => void;
  childProfile?: ChildProfile | null;
  onOpenRegistration?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  mascotTheme,
  childProfile,
  onOpenRegistration,
}) => {
  // Global View Index (0: Onboarding, 1: Rumah Cincau, 2: Luar Ruangan)
  const [viewIndex, setViewIndex] = useState<number>(0);
  const [bounceKey, setBounceKey] = useState<number>(0);
  const [selectedMode, setSelectedMode] = useState<'learn' | 'play' | null>(null);
  
  // Mascot States
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mouseLookTarget, setMouseLookTarget] = useState<LookTarget>({ x: 0, y: 0.3 });
  const [mascotEmotionOverride, setMascotEmotionOverride] = useState<CharviEmotion | null>(null);
  const [dragLookTarget, setDragLookTarget] = useState<LookTarget | null>(null);
  const [isBubbleMenuOpen, setIsBubbleMenuOpen] = useState(false);
  const [isFeedingOpen, setIsFeedingOpen] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<'apple-catch' | null>(null);

  // Persistence & State Hook
  const { 
    energy, 
    foodStock, 
    starPoints, 
    feed, 
    addMisiRewards, 
    gainStars, 
    getEmotion 
  } = useTamagotchi();

  // Carousel Hooks
  const playCarousel = useDraggableCarousel();
  const learnCarousel = useDraggableCarousel();

  // Refs
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emotionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const mascotContainerRef = useRef<HTMLDivElement | null>(null);

  // Interaction Handlers
  const registerInteraction = () => {
    setIsInteracting(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    registerInteraction();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseLookTarget({ x: x * 0.9, y: y * 0.9 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    registerInteraction();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseLookTarget({ x: x * 0.9, y: y * 0.9 });
  };

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFeedingOpen) setIsFeedingOpen(false);
        else if (isBubbleMenuOpen) setIsBubbleMenuOpen(false);
        else if (selectedMode) setSelectedMode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFeedingOpen, isBubbleMenuOpen, selectedMode]);

  const handleOutsideClick = () => {
    if (isFeedingOpen) setIsFeedingOpen(false);
    if (isBubbleMenuOpen) setIsBubbleMenuOpen(false);
    if (selectedMode !== null) setSelectedMode(null);
  };

  const handleSelectMode = (e: React.MouseEvent, mode: 'learn' | 'play') => {
    e.stopPropagation();
    registerInteraction();
    playPopSound();
    if (selectedMode === mode) {
      travelToView(mode === 'learn' ? 1 : 2);
    } else {
      setSelectedMode(mode);
    }
  };

  const travelToView = (targetIndex: number) => {
    playPopSound();
    setViewIndex(targetIndex);
    setBounceKey((k) => k + 1);
    setMascotEmotionOverride('excited');
    setTimeout(() => setMascotEmotionOverride(null), 2600);
  };

  const handleCincauTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    registerInteraction();
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;

    if (timeSinceLastTap > 40 && timeSinceLastTap < 420) {
      setIsBubbleMenuOpen(true);
      setMascotEmotionOverride('happy');
      playPopSound();
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
    }
  };

  // UI Compute
  const { lookTarget, mascotEmotion } = useMemo<{
    lookTarget: LookTarget;
    mascotEmotion: CharviEmotion;
  }>(() => {
    const baseEmotion = getEmotion();
    if (dragLookTarget) return { lookTarget: dragLookTarget, mascotEmotion: mascotEmotionOverride || baseEmotion };
    if (mascotEmotionOverride) return { lookTarget: { x: 0, y: -0.75 }, mascotEmotion: mascotEmotionOverride };
    if (isFeedingOpen) return { lookTarget: { x: 0, y: -0.9 }, mascotEmotion: 'happy' };
    if (isBubbleMenuOpen) return { lookTarget: { x: 0, y: -0.95 }, mascotEmotion: 'excited' };
    if (isInteracting || isHovered) return { lookTarget: mouseLookTarget, mascotEmotion: baseEmotion };
    return { lookTarget: { x: 0.28, y: -0.75 }, mascotEmotion: baseEmotion };
  }, [dragLookTarget, mascotEmotionOverride, isFeedingOpen, isBubbleMenuOpen, isHovered, isInteracting, mouseLookTarget, getEmotion]);

  return (
    <div
      onClick={handleOutsideClick}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={registerInteraction}
      className="relative w-full h-full min-h-screen bg-white text-neutral-900 flex flex-col justify-between overflow-hidden select-none cursor-default"
    >
      <HabitatWorlds viewIndex={viewIndex} />

      {/* Top Status Bar Placeholder */}
      <div className="w-full pt-3 px-6 flex items-center justify-between text-xs text-neutral-700 z-20">
        <span className="font-bold text-neutral-900 tracking-wide">9:41</span>
      </div>

      {/* Floating Navigation */}
      <div className="px-6 pt-2 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-neutral-500 font-semibold tracking-wide">ID</span>
          <button
            onClick={() => {
              playPopSound();
              if (onOpenRegistration) onOpenRegistration();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-neutral-200/80 shadow-2xs text-xs font-bold text-neutral-700 hover:border-sky-300 hover:text-sky-700 active:scale-95 transition-all cursor-pointer"
            title="Profil Anak / Registrasi"
          >
            <span>🧒</span>
            <span className="max-w-[80px] truncate">{childProfile?.name || 'Daftar'}</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <motion.button
            onClick={() => travelToView(0)}
            animate={{ 
              y: viewIndex === 0 ? [0, -3, 0] : 0,
              scale: viewIndex === 0 ? 1.15 : 0.9,
              rotate: viewIndex === 0 ? [0, 8, 0] : 0
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
              rotate: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 300, damping: 15 }
            }}
            className={`p-2 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${
              viewIndex === 0
                ? 'bg-amber-100 border-amber-400 text-amber-600 shadow-md'
                : 'bg-white/80 border-neutral-100 text-neutral-400 hover:border-neutral-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal Sliding UI Track */}
      <div className="w-full overflow-hidden relative z-20 pt-1 pb-2">
        <motion.div
          animate={{
            x: `${-(viewIndex * 100) / 3}%`,
            y: isFeedingOpen ? -180 : 0,
            opacity: isFeedingOpen ? 0 : 1,
            scale: isFeedingOpen ? 0.9 : 1,
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 120 }}
          style={{ width: '300%' }}
          className="flex pointer-events-auto"
        >
          {/* SLIDE 0: MAIN MENU */}
          <div className="w-1/3 flex-shrink-0 px-6 max-w-sm mx-auto flex flex-col items-start relative">
            <motion.div
              onClick={(e) => handleSelectMode(e, 'learn')}
              animate={{
                y: selectedMode === 'learn' ? 4 : 0,
                rotate: selectedMode === 'learn' ? -1.5 : -3.5,
                scale: selectedMode === 'learn' ? 1.05 : selectedMode === 'play' ? 0.95 : 1,
              }}
              className={`relative inline-block text-white px-5 py-1.5 rounded-xl font-extrabold text-3xl tracking-tight transition-all duration-200 cursor-pointer select-none bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 shadow-md ${
                selectedMode === 'learn' ? 'ring-4 ring-offset-2 ring-amber-400 shadow-xl' : ''
              } ${selectedMode === 'play' ? 'opacity-70' : 'opacity-100'}`}
            >
              Belajar
            </motion.div>

            <motion.div
              onClick={(e) => handleSelectMode(e, 'play')}
              animate={{
                y: selectedMode === 'play' ? 4 : 0,
                rotate: selectedMode === 'play' ? 2 : 2.5,
                scale: selectedMode === 'play' ? 1.05 : selectedMode === 'learn' ? 0.95 : 1,
              }}
              className={`relative mt-2 ml-10 inline-block text-white px-5 py-1.5 rounded-xl font-extrabold text-3xl tracking-tight transition-all duration-200 cursor-pointer select-none bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-md ${
                selectedMode === 'play' ? 'ring-4 ring-offset-2 ring-emerald-400 shadow-xl' : ''
              } ${selectedMode === 'learn' ? 'opacity-70' : 'opacity-100'}`}
            >
              Bermain
            </motion.div>

            <div className="mt-5 min-h-[72px] flex flex-col justify-center w-full">
              <AnimatePresence mode="wait">
                {selectedMode === null ? (
                  <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="font-handwriting">
                    <span className="text-xl sm:text-2xl font-bold text-neutral-600 block">apa yang kamu mau lakukan hari ini,</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight block mt-0.5">{childProfile?.name || 'Budi'}? 🌟</span>
                  </motion.div>
                ) : (
                  <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="font-handwriting">
                    <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight block">
                      {selectedMode === 'learn' ? 'ayo kita belajar' : 'kamu yakin ingin bermain?'}
                    </span>
                    <motion.button
                      onClick={() => travelToView(selectedMode === 'learn' ? 1 : 2)}
                      className={`mt-2.5 px-4 py-2 bg-gradient-to-r ${selectedMode === 'learn' ? 'from-amber-500 to-orange-500 border-amber-300' : 'from-emerald-500 to-teal-500 border-emerald-300'} text-white rounded-2xl font-black text-sm shadow-md flex items-center gap-1.5 border-2 cursor-pointer`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{selectedMode === 'learn' ? 'Masuk ke Dunia Cincau!' : 'Masuk Arena Bermain!'} ▶</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SLIDE 1: LEARNING HUB */}
          <div className="w-1/3 flex-shrink-0 px-5 max-w-sm mx-auto flex flex-col items-start relative pointer-events-auto">
            <div className="w-full mb-2.5">
              <span className="text-[11px] font-extrabold text-amber-800 tracking-wider uppercase block">rumah cincau • materi belajar</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight block">Mau Belajar Apa, {childProfile?.name || 'Budi'}? 📖</h2>
            </div>

            <div className="w-full relative z-20">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900/80 px-1 mb-1.5">
                <span className="flex items-center gap-1.5"><span>📚</span><span>Materi Pilihan</span></span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold bg-white/80 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                  <span>Geser</span><span className="animate-pulse">➔</span>
                </span>
              </div>

              <div
                ref={learnCarousel.carouselRef}
                onMouseDown={learnCarousel.handleMouseDown}
                onMouseMove={learnCarousel.handleMouseMove}
                onMouseUp={learnCarousel.handleMouseUp}
                onMouseLeave={learnCarousel.handleMouseUp}
                className="w-full flex gap-3 overflow-x-auto pb-3 pt-1 px-1 snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none no-scrollbar"
              >
                {LEARN_CARDS.map((card) => (
                  <LearnCard 
                    key={card.id} 
                    card={card} 
                    onClick={() => {
                      playPopSound();
                      setMascotEmotionOverride('excited');
                      setTimeout(() => setMascotEmotionOverride(null), 2600);
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SLIDE 2: PLAY ARENA */}
          <div className="w-1/3 flex-shrink-0 px-5 max-w-sm mx-auto flex flex-col items-start relative pointer-events-auto">
            <div className="w-full mb-2.5">
              <span className="text-[11px] font-extrabold text-emerald-800 tracking-wider uppercase block">petualangan luar ruangan</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight block">Arena Bermain! 🌳</h2>
            </div>

            <div className="w-full relative z-20">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900/80 px-1 mb-1.5">
                <span className="flex items-center gap-1.5"><span>🎮</span><span>Pilih Permainan</span></span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold bg-white/80 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  <span>Geser</span><span className="animate-pulse">➔</span>
                </span>
              </div>

              <div
                ref={playCarousel.carouselRef}
                onMouseDown={playCarousel.handleMouseDown}
                onMouseMove={playCarousel.handleMouseMove}
                onMouseUp={playCarousel.handleMouseUp}
                onMouseLeave={playCarousel.handleMouseUp}
                className="w-full flex gap-3 overflow-x-auto pb-3 pt-1 px-1 snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none no-scrollbar"
              >
                {PLAY_CARDS.map((card) => (
                  <PlayCard 
                    key={card.id} 
                    card={card} 
                    onClick={() => {
                      playPopSound();
                      if (card.id === 'fruit-catch') {
                        setActiveMinigame('apple-catch');
                        return;
                      }
                      setMascotEmotionOverride('excited');
                      setTimeout(() => setMascotEmotionOverride(null), 2600);
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mascot Feeding Overlay */}
      <CincauFeedingOverlay
        isMenuOpen={isBubbleMenuOpen}
        isFeedingOpen={isFeedingOpen}
        onOpenMenu={() => setIsBubbleMenuOpen(true)}
        onCloseMenu={() => setIsBubbleMenuOpen(false)}
        onOpenFeeding={() => { setIsBubbleMenuOpen(false); setIsFeedingOpen(true); }}
        onCloseFeeding={() => setIsFeedingOpen(false)}
        onFeedSuccess={() => {
          if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
          setMascotEmotionOverride('excited');
          feed();
          emotionTimerRef.current = setTimeout(() => setMascotEmotionOverride(null), 8000);
        }}
        onPetMascot={() => {
          if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
          setMascotEmotionOverride('excited');
          emotionTimerRef.current = setTimeout(() => setMascotEmotionOverride(null), 8000);
        }}
        onHpChange={() => {}} // Hook handles internal HP/Energy
        hp={energy}
        setHp={() => {}}
        onMascotEmotionChange={(emo) => setMascotEmotionOverride(emo)}
        onLookTargetChange={(target) => setDragLookTarget(target)}
        mascotContainerRef={mascotContainerRef}
      />

      {/* Persistent Mascot */}
      <motion.div
        ref={mascotContainerRef}
        onClick={handleCincauTap}
        onTouchEnd={handleCincauTap}
        className="relative w-full flex-1 flex flex-col justify-end items-center pointer-events-auto cursor-pointer z-10"
      >
        <motion.div
          key={`mascot-bounce-${bounceKey}`}
          animate={{ y: [0, -32, 0] }}
          transition={{ duration: 0.48, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="w-full -mb-1 flex justify-center overflow-visible"
        >
          <CharviMascot
            variant="large-bottom"
            theme={mascotTheme}
            emotion={mascotEmotion}
            isInteracting={isInteracting || isHovered || selectedMode !== null || isFeedingOpen || isBubbleMenuOpen}
            lookTarget={lookTarget}
            className="w-full h-auto drop-shadow-xl"
          />
        </motion.div>
      </motion.div>

      {/* Minigame Overlay */}
      <AnimatePresence>
        {activeMinigame === 'apple-catch' && (
          <AppleCatchMinigame
            mascotTheme={mascotTheme}
            onClose={(earnedFood, earnedStars) => {
              setActiveMinigame(null);
              addMisiRewards(earnedFood, earnedStars);
              if (earnedFood > 0 || earnedStars > 0) {
                playCheerSound();
                setMascotEmotionOverride('excited');
                setTimeout(() => setMascotEmotionOverride(null), 3000);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
