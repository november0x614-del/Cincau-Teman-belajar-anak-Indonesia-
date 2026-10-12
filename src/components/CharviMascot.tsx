import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharviEmotion, LookTarget, MascotTheme } from '../types';

interface CharviMascotProps {
  variant?: 'large-bottom' | 'compact-header';
  emotion?: CharviEmotion;
  lookTarget?: LookTarget;
  isTalking?: boolean;
  isListening?: boolean;
  isInteracting?: boolean;
  theme?: MascotTheme;
  className?: string;
  onClick?: () => void;
  onAnnoyedChange?: (isAnnoyed: boolean) => void;
  onEmotionChange?: (emotion: CharviEmotion) => void;
}

const getEmotionGradient = (emo: CharviEmotion, theme: MascotTheme = 'cyan-jelly') => {
  switch (emo) {
    case 'happy':
      return 'url(#charviYellowJelly)';
    case 'angry':
    case 'pouty':
    case 'annoyed':
      return 'url(#charviRedJelly)';
    case 'excited':
    case 'surprised':
      return 'url(#charviPinkJelly)';
    case 'sad':
      return 'url(#charviBlueJelly)';
    case 'bored':
      return 'url(#charviPurpleJelly)';
    case 'idle':
    default:
      switch (theme) {
        case 'classic-orange':
          return 'url(#charviOrangeJelly)';
        case 'emerald-mint':
          return 'url(#charviEmeraldJelly)';
        case 'berry-purple':
          return 'url(#charviBerryJelly)';
        case 'sunny-banana':
          return 'url(#charviBananaJelly)';
        case 'cyan-jelly':
        default:
          return 'url(#charviCyanJelly)';
      }
  }
};

const isDopamineEmotion = (emo: CharviEmotion) => {
  return emo === 'happy' || emo === 'excited' || emo === 'angry' || emo === 'pouty' || emo === 'annoyed' || emo === 'surprised';
};

const getEmotionGlow = (emo: CharviEmotion, theme: MascotTheme = 'cyan-jelly') => {
  switch (emo) {
    case 'happy':
      return '#f59e0b';
    case 'angry':
    case 'pouty':
    case 'annoyed':
      return '#f43f5e';
    case 'excited':
    case 'surprised':
      return '#d946ef';
    case 'sad':
      return '#0284c7';
    case 'bored':
      return '#8b5cf6';
    case 'idle':
    default:
      switch (theme) {
        case 'classic-orange':
          return '#ea580c';
        case 'emerald-mint':
          return '#10b981';
        case 'berry-purple':
          return '#8b5cf6';
        case 'sunny-banana':
          return '#f59e0b';
        case 'cyan-jelly':
        default:
          return '#00e5ff';
      }
  }
};

export const CharviMascot: React.FC<CharviMascotProps> = ({
  variant = 'large-bottom',
  emotion = 'idle',
  lookTarget = { x: 0.3, y: -0.7 },
  isTalking = false,
  isListening = false,
  isInteracting = false,
  theme = 'cyan-jelly',
  className = '',
  onClick,
  onAnnoyedChange,
  onEmotionChange,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [talkingFrame, setTalkingFrame] = useState(0);

  // Rapid tap & Pouty/Annoyed state
  const [tapCount, setTapCount] = useState(0);
  const [isRapidTapAnnoyed, setIsRapidTapAnnoyed] = useState(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity Idle Boredom state (after 15s)
  const [isLongIdleBored, setIsLongIdleBored] = useState(false);
  const boredTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle rapid tap (>5 times)
  const handleMascotTap = () => {
    // Touching immediately wakes up from boredom
    if (isLongIdleBored) {
      setIsLongIdleBored(false);
      if (onEmotionChange) onEmotionChange('idle');
    }

    setTapCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 5 && !isRapidTapAnnoyed) {
        setIsRapidTapAnnoyed(true);
        if (onAnnoyedChange) onAnnoyedChange(true);
        if (onEmotionChange) onEmotionChange('angry');
      }
      return nextCount;
    });

    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setTimeout(() => {
      setIsRapidTapAnnoyed(false);
      setTapCount(0);
      if (onAnnoyedChange) onAnnoyedChange(false);
      if (onEmotionChange) onEmotionChange('idle');
    }, 2800);

    if (onClick) onClick();
  };

  // 15-second long idle timeout detector for BORED state
  useEffect(() => {
    if (isInteracting || isRapidTapAnnoyed || emotion !== 'idle') {
      setIsLongIdleBored(false);
      if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
      return;
    }

    if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
    boredTimerRef.current = setTimeout(() => {
      setIsLongIdleBored(true);
      if (onEmotionChange) onEmotionChange('bored');
    }, 15000);

    return () => {
      if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
    };
  }, [isInteracting, isRapidTapAnnoyed, emotion, onEmotionChange]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (boredTimerRef.current) clearTimeout(boredTimerRef.current);
    };
  }, []);

  // Determine current active emotion
  const activeEmotion: CharviEmotion = useMemo(() => {
    if (isRapidTapAnnoyed) return 'angry';
    if (isLongIdleBored && emotion === 'idle') return 'bored';
    return emotion;
  }, [isRapidTapAnnoyed, isLongIdleBored, emotion]);

  const isBored = activeEmotion === 'bored';
  const isAngry = activeEmotion === 'angry' || activeEmotion === 'pouty' || activeEmotion === 'annoyed';
  const isHappy = activeEmotion === 'happy';
  const isExcited = activeEmotion === 'excited';
  const isSad = activeEmotion === 'sad';

  // DUAL-LAYER JELLY WAVE TRANSITION SYSTEM
  // Base layer is ALWAYS 100% full, solid translucent jelly.
  // Incoming layer sweeps UP (for dopamine) or DOWN (for depression/rest) across the body.
  const [baseEmotion, setBaseEmotion] = useState<CharviEmotion>('idle');
  const [incomingEmotion, setIncomingEmotion] = useState<CharviEmotion | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down'>('up');
  const [transitionKey, setTransitionKey] = useState(0);
  const prevEmotionRef = useRef<CharviEmotion>('idle');

  useEffect(() => {
    if (activeEmotion === prevEmotionRef.current) return;
    const isDopamine = isDopamineEmotion(activeEmotion);
    const direction = isDopamine ? 'up' : 'down';

    setTransitionDirection(direction);
    setIncomingEmotion(activeEmotion);
    setTransitionKey((prev) => prev + 1);

    // Handoff base emotion once wave has fully submerged the body (at 740ms)
    const baseTimer = setTimeout(() => {
      setBaseEmotion(activeEmotion);
    }, 740);

    // Unmount incoming layer cleanly once wave animation reaches peak (at 820ms)
    const cleanupTimer = setTimeout(() => {
      setIncomingEmotion(null);
    }, 820);

    prevEmotionRef.current = activeEmotion;
    return () => {
      clearTimeout(baseTimer);
      clearTimeout(cleanupTimer);
    };
  }, [activeEmotion]);

  // 8-Second Breathing-Aligned Blinking Loop (active when not interacting and not bored/angry)
  useEffect(() => {
    if (isInteracting || isBored || isAngry) {
      setIsBlinking(false);
      return;
    }

    let blinkTimeout: NodeJS.Timeout;
    let cycleInterval: NodeJS.Timeout;

    const runBlinkCycle = () => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 160);
    };

    const initialDelay = setTimeout(() => {
      runBlinkCycle();
      cycleInterval = setInterval(runBlinkCycle, 8000);
    }, 4000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(blinkTimeout);
      clearInterval(cycleInterval);
      setIsBlinking(false);
    };
  }, [isInteracting, isBored, isAngry]);

  // Talking mouth animation loop
  useEffect(() => {
    if (!isTalking) return;
    const interval = setInterval(() => {
      setTalkingFrame((prev) => (prev + 1) % 4);
    }, 130);
    return () => clearInterval(interval);
  }, [isTalking]);

  // Dynamic eye pupil offsets based on lookTarget (-1 to 1)
  const pupilOffsetX = useMemo(() => {
    if (isBored) return 4;
    const raw = (lookTarget?.x ?? 0) * 12;
    return Math.max(-14, Math.min(14, raw));
  }, [lookTarget?.x, isBored]);

  const pupilOffsetY = useMemo(() => {
    if (isBored) return 10; // gazing slightly down when bored/sleepy
    const raw = (lookTarget?.y ?? 0) * 14;
    return Math.max(-16, Math.min(16, raw));
  }, [lookTarget?.y, isBored]);

  const isLarge = variant === 'large-bottom';

  // Physical body lean towards cursor/finger
  const bodyTiltX = useMemo(() => {
    if (!isInteracting || isBored || isAngry) return 0;
    return (lookTarget?.x ?? 0) * 6; // Max 6 degrees tilt
  }, [lookTarget?.x, isInteracting, isBored, isAngry]);

  const bodyLeanY = useMemo(() => {
    if (!isInteracting || isBored || isAngry) return 0;
    return (lookTarget?.y ?? 0) * 5; // Max 5px vertical lean
  }, [lookTarget?.y, isInteracting, isBored, isAngry]);

  return (
    <motion.div
      onClick={handleMascotTap}
      whileTap={{
        scaleY: 0.93,
        scaleX: 1.07,
        transition: { type: 'spring', damping: 10, stiffness: 350 },
      }}
      className={`relative select-none transition-transform cursor-pointer ${className}`}
    >
      <motion.svg
        viewBox={isLarge ? '0 50 360 255' : '0 0 360 280'}
        className="w-full h-full overflow-visible drop-shadow-md"
        animate={
          isListening
            ? {
                y: [0, -5, 0],
                scaleY: [1, 1.03, 0.98, 1],
                scaleX: [1, 0.98, 1.02, 1],
                rotate: [0, 0.8, -0.8, 0],
              }
            : isAngry
            ? {
                // Annoyed indignant jelly jiggle
                y: [0, -3, 0, -2, 0],
                rotate: [0, -2, 2, -1.5, 1.5, 0],
                scaleY: [1, 0.97, 1.03, 0.98, 1],
                scaleX: [1, 1.03, 0.97, 1.02, 1],
              }
            : (isExcited || activeEmotion === 'surprised')
            ? {
                // Excited energetic jelly bounce
                y: [0, -10, 0, -6, 0],
                scaleY: [1, 1.06, 0.95, 1.03, 1],
                scaleX: [1, 0.95, 1.05, 0.97, 1],
                rotate: [0, 2, -2, 1, 0],
              }
            : isHappy
            ? {
                // Happy cheerful bob
                y: [0, -7, 0],
                scaleY: [1, 1.045, 0.965, 1],
                scaleX: [1, 0.965, 1.035, 1],
                rotate: [0, 1.2, -1.2, 0],
              }
            : isSad
            ? {
                // Sad subtle droop
                y: [0, 3, 0],
                scaleY: [1, 0.975, 1],
                scaleX: [1, 1.02, 1],
                rotate: [0, -0.4, 0.4, 0],
              }
            : {
                // Organic Jelly Squash & Stretch Floating Rhythm (8-second cycle)
                y: [0, -5.5, -2, 2.5, 0],
                scaleY: [1, 1.035, 1.01, 0.982, 1],
                scaleX: [1, 0.972, 0.993, 1.022, 1],
                rotate: [0, 0.7, -0.5, 0.3, 0],
              }
        }
        transition={{
          repeat: Infinity,
          duration: isListening
            ? 1.6
            : isAngry
            ? 0.7
            : isExcited
            ? 1.4
            : isHappy
            ? 2.4
            : isBored
            ? 9.5
            : isSad
            ? 5.0
            : 8.0,
          ease: 'easeInOut',
        }}
        style={{
          transformOrigin: '50% 100%',
        }}
      >
        <defs>
          {/* 1. CYAN JELLY TRANSLUCENT GRADIENT (IDLE / CALM) */}
          <linearGradient id="charviCyanJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="25%" stopColor="#00e5ff" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* 2. HAPPY JELLY TRANSLUCENT GRADIENT (GOLDEN YELLOW / AMBER) */}
          <linearGradient id="charviYellowJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* 3. ANGRY JELLY TRANSLUCENT GRADIENT (FIERY CRIMSON RED) */}
          <linearGradient id="charviRedJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="25%" stopColor="#f43f5e" />
            <stop offset="70%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* 4. EXCITED JELLY TRANSLUCENT GRADIENT (MAGENTA / FUCHSIA-PINK) */}
          <linearGradient id="charviPinkJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="25%" stopColor="#e879f9" />
            <stop offset="70%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#86198f" />
          </linearGradient>

          {/* 5. SAD JELLY TRANSLUCENT GRADIENT (OCEAN BLUE) */}
          <linearGradient id="charviBlueJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>

          {/* 6. BORED JELLY TRANSLUCENT GRADIENT (LAVENDER / SOFT VIOLET) */}
          <linearGradient id="charviPurpleJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="25%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          {/* 7. EMERALD MINT THEME GRADIENT */}
          <linearGradient id="charviEmeraldJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="25%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* 8. BERRY PURPLE THEME GRADIENT */}
          <linearGradient id="charviBerryJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="25%" stopColor="#8b5cf6" />
            <stop offset="70%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          {/* 9. SUNNY BANANA THEME GRADIENT */}
          <linearGradient id="charviBananaJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* 10. CLASSIC ORANGE THEME GRADIENT */}
          <linearGradient id="charviOrangeJelly" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="440">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="25%" stopColor="#ff5500" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          {/* Liquid Wave Highlight crest */}
          <linearGradient id="liquidWaveRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>

          {/* Soft translucent bubble gradient */}
          <radialGradient id="bubbleGloss" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
          </radialGradient>

          <filter id="jellyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor={getEmotionGlow(baseEmotion, theme)} floodOpacity="0.32" />
          </filter>

          {/* Clip path for pupils so they stay inside the white eyeballs */}
          <clipPath id="leftEyeClip">
            <ellipse cx="126" cy="155" rx="30" ry="46" />
          </clipPath>
          <clipPath id="rightEyeClip">
            <ellipse cx="234" cy="155" rx="30" ry="46" />
          </clipPath>

          {/* Clip path for Large Body Liquid Filling */}
          <clipPath id="largeBodyClip">
            <path
              d="
                M 0, 95
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                q 20,-34 40,0
                L 360, 480
                L 0, 480
                Z
              "
            />
          </clipPath>

          {/* Clip path for Compact Body Liquid Filling */}
          <clipPath id="compactBodyClip">
            <path
              d="
                M 10, 80
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                q 18.8,-28 37.7,0
                C 355, 170 340, 245 285, 260
                C 230, 275 130, 275 75, 260
                C 20, 245 5, 170 10, 80
                Z
              "
            />
          </clipPath>
        </defs>

        {/* Listening wave halo if listening */}
        {isListening && (
          <motion.ellipse
            cx="180"
            cy="150"
            rx="170"
            ry="140"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="3.5"
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: [0.8, 0, 0.8], scale: [0.95, 1.15, 0.95] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
          />
        )}
        {/* MASCOT PHYSICAL TRACKING WRAPPER: Tilts and leans whole body towards cursor/finger */}
        <motion.g
          animate={{
            rotate: bodyTiltX,
            x: (lookTarget?.x ?? 0) * 12, // Physical follow translation
            y: bodyLeanY,
          }}
          transition={{ type: 'spring', damping: 22, stiffness: 140 }}
          style={{ transformOrigin: '50% 100%' }}
        >
          {/* MASCOT BODY WITH PRESERVED SCALLOPED/WAVY TOP */}
          {isLarge ? (
            <g>
              {/* 1. Base Layer: ALWAYS 100% full, rich, translucent solid jelly */}
              <path
                d="
                  M 0, 95
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  q 20,-34 40,0
                  L 360, 480
                  L 0, 480
                  Z
                "
                fill={getEmotionGradient(baseEmotion, theme)}
                filter="url(#jellyGlow)"
              />

              {/* 2. DYNAMIC INCOMING TRANSITION WAVE LAYER (SWEEPS UP FOR DOPAMINE, SWEEPS DOWN FOR DEPRESSION) */}
              {incomingEmotion && (
                <g clipPath="url(#largeBodyClip)">
                  {transitionDirection === 'up' ? (
                    // DOPAMINE WAVE: Sweeps RISING UP from bottom to top (520 -> -75)
                    <motion.g
                      key={`up-${transitionKey}`}
                      initial={{ y: 520 }}
                      animate={{
                        y: -75,
                      }}
                      transition={{
                        y: { duration: 0.76, ease: [0.22, 1, 0.36, 1] },
                      }}
                    >
                      <motion.path
                        d="
                          M -60, 0
                          q 55, -14 110, 0
                          q 55, 14 110, 0
                          q 55, -14 110, 0
                          q 55, 14 110, 0
                          q 55, -14 110, 0
                          L 490, 600
                          L -60, 600
                          Z
                        "
                        fill={getEmotionGradient(incomingEmotion, theme)}
                        filter="url(#jellyGlow)"
                        animate={{ x: [-35, 15, -35] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      />
                      {/* Organic liquid crest rim line with smooth fade-out at peak */}
                      <motion.path
                        d="
                          M -60, 0
                          q 55, -14 110, 0
                          q 55, 14 110, 0
                          q 55, -14 110, 0
                          q 55, 14 110, 0
                          q 55, -14 110, 0
                        "
                        fill="none"
                        stroke="url(#liquidWaveRim)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        animate={{
                          x: [-35, 15, -35],
                          opacity: [1, 1, 0.7, 0],
                        }}
                        transition={{
                          x: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
                          opacity: { duration: 0.76, times: [0, 0.65, 0.85, 1], ease: 'easeOut' },
                        }}
                      />
                    </motion.g>
                  ) : (
                    // DEPRESSION WAVE: Sweeps FALLING DOWN from top to bottom (-520 -> 130)
                    <motion.g
                      key={`down-${transitionKey}`}
                      initial={{ y: -520 }}
                      animate={{
                        y: 130,
                      }}
                      transition={{
                        y: { duration: 0.78, ease: [0.35, 0, 0.25, 1] },
                      }}
                    >
                      <motion.path
                        d="
                          M -60, -100
                          L 490, -100
                          L 490, 450
                          q -55, 14 -110, 0
                          q -55, -14 -110, 0
                          q -55, 14 -110, 0
                          q -55, -14 -110, 0
                          q -55, 14 -110, 0
                          Z
                        "
                        fill={getEmotionGradient(incomingEmotion, theme)}
                        filter="url(#jellyGlow)"
                        animate={{ x: [15, -35, 15] }}
                        transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                      />
                      <motion.path
                        d="
                          M 490, 450
                          q -55, 14 -110, 0
                          q -55, -14 -110, 0
                          q -55, 14 -110, 0
                          q -55, -14 -110, 0
                          q -55, 14 -110, 0
                        "
                        fill="none"
                        stroke="url(#liquidWaveRim)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        animate={{
                          x: [15, -35, 15],
                          opacity: [1, 1, 0.7, 0],
                        }}
                        transition={{
                          x: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' },
                          opacity: { duration: 0.85, times: [0, 0.65, 0.85, 1], ease: 'easeOut' },
                        }}
                      />
                    </motion.g>
                  )}
                </g>
              )}

              {/* 3. TRANSLUCENT JELLY MICRO-BUBBLES (ALWAYS VISIBLE IN SOLID JELLY) */}
              <g opacity="0.36">
                {/* Bubble 1 (lower left) */}
                <motion.circle
                  cx="50"
                  cy="290"
                  r="9"
                  fill="url(#bubbleGloss)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                />
                <circle cx="47" cy="287" r="2.2" fill="#ffffff" opacity="0.5" />

                {/* Bubble 2 (lower right) */}
                <motion.circle
                  cx="310"
                  cy="300"
                  r="11"
                  fill="url(#bubbleGloss)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                  animate={{ y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut', delay: 0.5 }}
                />
                <circle cx="307" cy="296" r="2.6" fill="#ffffff" opacity="0.5" />

                {/* Bubble 3 (deep bottom left) */}
                <motion.circle
                  cx="75"
                  cy="390"
                  r="12"
                  fill="url(#bubbleGloss)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.9 }}
                />
                <circle cx="72" cy="386" r="2.8" fill="#ffffff" opacity="0.4" />

                {/* Bubble 4 (deep bottom right) */}
                <motion.circle
                  cx="285"
                  cy="395"
                  r="10"
                  fill="url(#bubbleGloss)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4.0, ease: 'easeInOut', delay: 1.3 }}
                />
                <circle cx="282" cy="392" r="2.4" fill="#ffffff" opacity="0.4" />
              </g>
            </g>
          ) : (
            // Compact header mascot
            <g>
              {/* 1. Base Layer: ALWAYS 100% full, rich, translucent solid jelly */}
              <path
                d="
                  M 10, 80
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  q 18.8,-28 37.7,0
                  C 355, 170 340, 245 285, 260
                  C 230, 275 130, 275 75, 260
                  C 20, 245 5, 170 10, 80
                  Z
                "
                fill={getEmotionGradient(baseEmotion, theme)}
                filter="url(#jellyGlow)"
              />

              {/* 2. DYNAMIC INCOMING TRANSITION WAVE LAYER FOR COMPACT MASCOT */}
              {incomingEmotion && (
                <g clipPath="url(#compactBodyClip)">
                  {transitionDirection === 'up' ? (
                    // DOPAMINE WAVE: Sweeps RISING UP (340 -> -40)
                    <motion.g
                      key={`up-c-${transitionKey}`}
                      initial={{ y: 340 }}
                      animate={{
                        y: -40,
                      }}
                      transition={{
                        y: { duration: 0.76, ease: [0.22, 1, 0.36, 1] },
                      }}
                    >
                      <motion.path
                        d="
                          M -60, 0
                          q 55, -12 110, 0
                          q 55, 12 110, 0
                          q 55, -12 110, 0
                          q 55, 12 110, 0
                          q 55, -12 110, 0
                          L 490, 420
                          L -60, 420
                          Z
                        "
                        fill={getEmotionGradient(incomingEmotion, theme)}
                        filter="url(#jellyGlow)"
                        animate={{ x: [-35, 15, -35] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      />
                      <motion.path
                        d="
                          M -60, 0
                          q 55, -12 110, 0
                          q 55, 12 110, 0
                          q 55, -12 110, 0
                          q 55, 12 110, 0
                          q 55, -12 110, 0
                        "
                        fill="none"
                        stroke="url(#liquidWaveRim)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        animate={{
                          x: [-35, 15, -35],
                          opacity: [1, 1, 0.7, 0],
                        }}
                        transition={{
                          x: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
                          opacity: { duration: 0.76, times: [0, 0.65, 0.85, 1], ease: 'easeOut' },
                        }}
                      />
                    </motion.g>
                  ) : (
                    // DEPRESSION WAVE: Sweeps FALLING DOWN (-340 -> 95)
                    <motion.g
                      key={`down-c-${transitionKey}`}
                      initial={{ y: -340 }}
                      animate={{
                        y: 95,
                      }}
                      transition={{
                        y: { duration: 0.78, ease: [0.35, 0, 0.25, 1] },
                      }}
                    >
                      <motion.path
                        d="
                          M -60, -80
                          L 490, -80
                          L 490, 280
                          q -55, 12 -110, 0
                          q -55, -12 -110, 0
                          q -55, 12 -110, 0
                          q -55, -12 -110, 0
                          q -55, 12 -110, 0
                          Z
                        "
                        fill={getEmotionGradient(incomingEmotion, theme)}
                        filter="url(#jellyGlow)"
                        animate={{ x: [15, -35, 15] }}
                        transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                      />
                      <motion.path
                        d="
                          M 490, 280
                          q -55, 12 -110, 0
                          q -55, -12 -110, 0
                          q -55, 12 -110, 0
                          q -55, -12 -110, 0
                          q -55, 12 -110, 0
                        "
                        fill="none"
                        stroke="url(#liquidWaveRim)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        animate={{
                          x: [15, -35, 15],
                          opacity: [1, 1, 0.7, 0],
                        }}
                        transition={{
                          x: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' },
                          opacity: { duration: 0.85, times: [0, 0.65, 0.85, 1], ease: 'easeOut' },
                        }}
                      />
                    </motion.g>
                  )}
                </g>
              )}

              {/* Subtle transparent bubbles inside compact header mascot */}
              <g opacity="0.28">
                <circle cx="50" cy="210" r="6" fill="url(#bubbleGloss)" />
                <circle cx="48" cy="208" r="1.5" fill="#ffffff" opacity="0.6" />
                <circle cx="310" cy="215" r="7" fill="url(#bubbleGloss)" />
                <circle cx="308" cy="213" r="1.8" fill="#ffffff" opacity="0.6" />
              </g>
            </g>
          )}

          {/* LEFT EYE */}
          <g id="leftEye">
            {/* White eyeball */}
            <ellipse
              cx="126"
              cy="155"
              rx="30"
              ry="46"
              fill="#ffffff"
            />

            {/* Eye Contents: Pupil + Eyelid Shutter */}
            <g clipPath="url(#leftEyeClip)">
              {/* Tracking Pupil */}
              <motion.g
                animate={{
                  x: pupilOffsetX,
                  y: pupilOffsetY,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              >
                <ellipse
                  cx="126"
                  cy="155"
                  rx={isExcited ? 21 : isBored ? 16 : 18}
                  ry={isExcited ? 29 : isBored ? 20 : 26}
                  fill="#0f172a"
                />
                <circle cx="120" cy="144" r={isExcited ? 7 : 5.5} fill="#ffffff" opacity="0.95" />
                <circle cx="132" cy="164" r={isExcited ? 3.5 : 2.8} fill="#ffffff" opacity="0.8" />
              </motion.g>

              {/* Eyelid Shutter: glides top-down for blink, or rests halfway for BORED sleepy eyes */}
              <motion.g
                initial={false}
                animate={{
                  y: isBlinking ? 35 : isBored ? -35 : -125,
                }}
                transition={{
                  duration: isBlinking ? 0.12 : 0.25,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <path
                  d="M 90, 60 L 162, 60 L 162, 175 Q 126, 188 90, 175 Z"
                  fill={getEmotionGradient(activeEmotion, theme)}
                />
                <path
                  d="M 90, 175 Q 126, 188 162, 175"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth={isBored ? '4' : '3.5'}
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Angry inward slanted eyelid crease */}
              {isAngry && (
                <path
                  d="M 92, 125 L 160, 150"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}

              {/* Sad outward slanted eyelid crease */}
              {isSad && (
                <path
                  d="M 92, 148 L 158, 126"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>

          {/* RIGHT EYE */}
          <g id="rightEye">
            {/* White eyeball */}
            <ellipse
              cx="234"
              cy="155"
              rx="30"
              ry="46"
              fill="#ffffff"
            />

            {/* Eye Contents: Pupil + Eyelid Shutter */}
            <g clipPath="url(#rightEyeClip)">
              {/* Tracking Pupil */}
              <motion.g
                animate={{
                  x: pupilOffsetX,
                  y: pupilOffsetY,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              >
                <ellipse
                  cx="234"
                  cy="155"
                  rx={isExcited ? 21 : isBored ? 16 : 18}
                  ry={isExcited ? 29 : isBored ? 20 : 26}
                  fill="#0f172a"
                />
                <circle cx="228" cy="144" r={isExcited ? 7 : 5.5} fill="#ffffff" opacity="0.95" />
                <circle cx="240" cy="164" r={isExcited ? 3.5 : 2.8} fill="#ffffff" opacity="0.8" />
              </motion.g>

              {/* Eyelid Shutter: glides top-down for blink, or rests halfway for BORED sleepy eyes */}
              <motion.g
                initial={false}
                animate={{
                  y: isBlinking ? 35 : isBored ? -35 : -125,
                }}
                transition={{
                  duration: isBlinking ? 0.12 : 0.25,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <path
                  d="M 198, 60 L 270, 60 L 270, 175 Q 234, 188 198, 175 Z"
                  fill={getEmotionGradient(activeEmotion, theme)}
                />
                <path
                  d="M 198, 175 Q 234, 188 270, 175"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth={isBored ? '4' : '3.5'}
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Angry inward slanted eyelid crease */}
              {isAngry && (
                <path
                  d="M 268, 125 L 200, 150"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}

              {/* Sad outward slanted eyelid crease */}
              {isSad && (
                <path
                  d="M 268, 148 L 202, 126"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>

          {/* MOUTH & EXPRESSIONS */}
          <g id="mouth">
            {isTalking ? (
              talkingFrame % 2 === 0 ? (
                <path
                  d="M 170, 234 Q 192, 258 214, 222 Q 192, 234 170, 234 Z"
                  fill="#0f172a"
                />
              ) : (
                <path
                  d="M 172, 230 Q 192, 245 214, 218"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                />
              )
            ) : isAngry ? (
              // Angry downturned pouty mouth (centered between eyes)
              <motion.path
                d="M 168, 236 Q 193, 222 218, 236"
                fill="none"
                stroke="#0f172a"
                strokeWidth="7.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2 }}
              />
            ) : isBored ? (
              // Bored flat horizontal mouth line (centered between eyes)
              <motion.path
                d="M 174, 234 L 210, 234"
                fill="none"
                stroke="#0f172a"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2 }}
              />
            ) : isHappy ? (
              // Happy wide open joyful mouth with pink tongue (shifted to center between eyes)
              <g>
                <path
                  d="M 166, 224 Q 192, 262 218, 224 Q 192, 234 166, 224 Z"
                  fill="#0f172a"
                />
                <path
                  d="M 180, 240 Q 192, 256 204, 240 Z"
                  fill="#ff4081"
                />
              </g>
            ) : isExcited ? (
              // Excited open cheering mouth (shifted to center between eyes)
              <g>
                <path
                  d="M 166, 222 Q 192, 264 218, 222 Z"
                  fill="#0f172a"
                />
                <path
                  d="M 180, 240 Q 192, 258 204, 240 Z"
                  fill="#ff4081"
                />
              </g>
            ) : activeEmotion === 'surprised' ? (
              // Surprised small round "O" mouth
              <circle
                cx="192"
                cy="238"
                r="10"
                fill="#0f172a"
              />
            ) : isSad ? (
              // Sad downturned trembling mouth (centered between eyes)
              <path
                d="M 168, 238 Q 192, 222 216, 238"
                fill="none"
                stroke="#0f172a"
                strokeWidth="7"
                strokeLinecap="round"
              />
            ) : (
              // Default iconic cheeky smirk curve (balanced toward center)
              <path
                d="M 186, 232 Q 216, 239 238, 214"
                fill="none"
                stroke="#0f172a"
                strokeWidth="7.5"
                strokeLinecap="round"
              />
            )}
          </g>
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};
