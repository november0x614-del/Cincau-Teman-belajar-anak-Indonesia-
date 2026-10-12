import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronLeft, 
  Check, 
  Star, 
  ShieldCheck, 
  Mic, 
  Volume2, 
  BookOpen, 
  Gamepad2, 
  Brain, 
  Bell, 
  Lock, 
  Mail, 
  ArrowRight,
  Smile,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CharviMascot } from './CharviMascot';
import { ChildProfile, MascotTheme, CharviEmotion } from '../types';
import { playPopSound, playCheerSound } from '../utils/audioEffects';
import { getThemeStyle } from '../utils/themeColors';

interface KidsRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: ChildProfile) => void;
  mascotTheme?: MascotTheme;
  initialProfile?: ChildProfile | null;
}

export const KidsRegistrationModal: React.FC<KidsRegistrationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  mascotTheme = 'cyan-jelly',
  initialProfile,
}) => {
  const [step, setStep] = useState<number>(0);
  const themeStyle = getThemeStyle(mascotTheme);

  // Form State
  const [childName, setChildName] = useState<string>(initialProfile?.name || '');
  const [fase, setFase] = useState<'A' | 'B' | 'C'>(initialProfile?.fase || 'A');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    initialProfile?.learningGoals || ['Berhitung & Logika Cepat', 'Membaca Cerita & Kosakata']
  );
  const [playDuration, setPlayDuration] = useState<string>(initialProfile?.playDuration || '15 - 30 Menit');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialProfile?.skills || ['Mengenal huruf & mengeja kata', 'Menghitung angka 1-20']
  );
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initialProfile?.voiceInteractionEnabled ?? true);
  const [hasOwnDevice, setHasOwnDevice] = useState<boolean | null>(initialProfile?.hasOwnDevice ?? null);
  const [parentEmail, setParentEmail] = useState<string>(initialProfile?.parentEmail || '');
  const [parentPassword, setParentPassword] = useState<string>('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState<boolean>(true);

  // Dynamic Personalization Animation state
  const [personalizeProgress, setPersonalizeProgress] = useState<number>(10);
  const [showDeviceQuestion, setShowDeviceQuestion] = useState<boolean>(false);

  // Mascot dynamic state in the modal
  const [mascotEmotion, setMascotEmotion] = useState<CharviEmotion>('happy');

  const totalSteps = 13; // 0 to 13

  // Confetti trigger
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#00e5ff', '#10b981', '#f59e0b', '#ec4899']
      });
    } catch {
      // ignore in environments without canvas
    }
  };

  // Step 10 Personalization progress simulation
  useEffect(() => {
    if (step === 10) {
      setMascotEmotion('thinking');
      setPersonalizeProgress(12);
      setShowDeviceQuestion(false);

      const t1 = setTimeout(() => {
        setPersonalizeProgress(38);
      }, 700);

      const t2 = setTimeout(() => {
        setPersonalizeProgress(52);
        setShowDeviceQuestion(true);
      }, 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [step]);

  // When device question answered, finish personalization
  const handleDeviceAnswer = (hasDevice: boolean) => {
    playPopSound();
    setHasOwnDevice(hasDevice);
    setShowDeviceQuestion(false);
    setPersonalizeProgress(78);
    setMascotEmotion('excited');

    setTimeout(() => {
      setPersonalizeProgress(100);
      setTimeout(() => {
        playCheerSound();
        triggerConfetti();
        setStep(11); // celebration step
        setMascotEmotion('excited');
      }, 600);
    }, 800);
  };

  const handleNext = () => {
    playPopSound();
    if (step === 11) {
      // From celebration to parent sign up
      setStep(12);
      setMascotEmotion('happy');
      return;
    }
    if (step === 13) {
      // Complete!
      finishRegistration();
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    playPopSound();
    if (step > 0) {
      setStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const finishRegistration = () => {
    playCheerSound();
    triggerConfetti();
    const finalProfile: ChildProfile = {
      name: childName.trim() || 'Budi',
      fase,
      favoriteSubject: selectedGoals[0] || 'Matematika & Logika',
      learningGoals: selectedGoals,
      playDuration,
      skills: selectedSkills,
      hasOwnDevice: hasOwnDevice ?? false,
      voiceInteractionEnabled: voiceEnabled,
      parentEmail,
      isRegistered: true,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('cincau_child_profile', JSON.stringify(finalProfile));
    } catch {
      // storage unavailable
    }

    onComplete(finalProfile);
    onClose();
  };

  const toggleGoal = (goal: string) => {
    playPopSound();
    setSelectedGoals((prev) => 
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleSkill = (skill: string) => {
    playPopSound();
    setSelectedSkills((prev) => 
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none">
      {/* Modal Phone Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full h-full sm:h-auto sm:min-h-[640px] sm:max-h-[92vh] sm:max-w-[420px] bg-gradient-to-b from-sky-50/90 via-white to-sky-50/50 sm:rounded-[38px] shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border-4 sm:border-white/80"
      >
        {/* Top Header Bar */}
        <div className="w-full px-5 pt-4 pb-2 flex items-center justify-between shrink-0 z-20">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-sky-100 flex items-center justify-center text-neutral-600 hover:text-sky-600 active:scale-95 transition-all cursor-pointer"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Progress Bar (Visible from step 1 to 13) */}
          {step > 0 && step < 11 && (
            <div className="flex-1 max-w-[200px] mx-3">
              <div className="w-full h-2.5 bg-sky-100 rounded-full overflow-hidden p-0.5 border border-sky-200/60 shadow-inner">
                <motion.div
                  initial={false}
                  animate={{ width: `${Math.min(100, (step / 10) * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Skip / Close Button */}
          <button
            onClick={() => {
              playPopSound();
              if (step === 0) {
                onClose();
              } else {
                finishRegistration();
              }
            }}
            className="text-xs font-bold text-neutral-400 hover:text-neutral-700 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {step === 0 ? 'Tutup' : 'Lewati'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 w-full overflow-y-auto px-6 py-2 flex flex-col justify-between no-scrollbar">
          <AnimatePresence mode="wait">
            {/* ================= STEP 0: SPLASH / HERO INTRO ================= */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col items-center justify-between py-2 text-center"
              >
                {/* Brand Pill */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white shadow-xs border border-sky-100 text-sky-700 text-xs font-extrabold tracking-wide uppercase mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kid Companion • Cincau</span>
                </div>

                {/* Mascot Visual */}
                <div className="relative w-48 h-48 my-2 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/50 to-cyan-100/30 rounded-full filter blur-xl animate-pulse" />
                  <CharviMascot
                    variant="compact-header"
                    emotion="excited"
                    theme={mascotTheme}
                    className="w-40 h-40 drop-shadow-lg"
                  />
                </div>

                {/* Main Hero Copy */}
                <div>
                  <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                    Waktu Layar Seimbang & Edukatif! 🌟
                  </h1>
                  <p className="text-xs text-neutral-500 mt-2 font-medium px-4 leading-relaxed">
                    Aplikasi pendamping belajar & bermain interaktif untuk anak usia SD yang aman, cerdas, dan menyenangkan.
                  </p>
                </div>

                {/* Trust Highlights */}
                <div className="w-full space-y-2 mt-4 text-left">
                  <div className="flex items-center gap-3 p-3 bg-white/90 rounded-2xl border border-sky-100 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Bermain yang Mereka Sukai</h4>
                      <p className="text-[11px] text-neutral-500">Mini game interaktif dengan musik & pantulan fisika seru.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/90 rounded-2xl border border-sky-100 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Pembelajaran yang Dipercaya</h4>
                      <p className="text-[11px] text-neutral-500">Kurikulum literasi, numerasi & sains sesuai fase sekolah.</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="w-full pt-4 space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Mulai Pendaftaran Anak</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={() => {
                      playPopSound();
                      setStep(12); // jump to sign in
                    }}
                    className="w-full py-2.5 text-xs font-bold text-neutral-500 hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    Sudah memiliki akun? <span className="text-sky-600 underline">Masuk di sini</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 1: MASCOT SPEECH INTRO ================= */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col items-center justify-between py-4 text-center"
              >
                <div className="w-full flex justify-center pt-2">
                  <div className="bg-white px-4 py-3 rounded-2xl border-2 border-sky-100 shadow-sm max-w-xs relative">
                    <p className="text-sm font-bold text-neutral-800 leading-snug">
                      "Ceritakan tentang si kecil — aku yang siapkan petualangan serunya! 🌟"
                    </p>
                    {/* Speech tail */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-sky-100 transform rotate-45" />
                  </div>
                </div>

                <div className="w-44 h-44 my-auto flex items-center justify-center">
                  <CharviMascot
                    variant="compact-header"
                    emotion="talking"
                    theme={mascotTheme}
                    className="w-40 h-40 drop-shadow-xl"
                  />
                </div>

                <div className="w-full">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Ayo, Mulai!</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: NAMA ANAK ================= */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2"
              >
                {/* Chat bubble prompt */}
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 p-1 shrink-0 shadow-xs flex items-center justify-center">
                    <CharviMascot
                      variant="compact-header"
                      emotion={childName ? 'excited' : 'listening'}
                      theme={mascotTheme}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border-2 border-sky-100 shadow-xs max-w-[270px]">
                    <p className="text-xs font-extrabold text-sky-800">Cincau Bertanya:</p>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      Siapa nama panggilan anakmu? 🧒
                    </p>
                  </div>
                </div>

                {/* Input Field */}
                <div className="my-auto w-full space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => {
                        setChildName(e.target.value);
                        setMascotEmotion(e.target.value ? 'happy' : 'listening');
                      }}
                      placeholder="Ketik nama anak..."
                      autoFocus
                      className="w-full text-center text-2xl font-black text-neutral-900 bg-white border-3 border-sky-200 focus:border-sky-500 rounded-3xl py-4 px-4 outline-none shadow-sm transition-all placeholder:text-neutral-300"
                    />
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-neutral-400">Contoh:</span>
                    {['Budi', 'Alya', 'Kenzo', 'Nadia'].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => {
                          playPopSound();
                          setChildName(sample);
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={!childName.trim()}
                    onClick={handleNext}
                    className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      childName.trim()
                        ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white shadow-sky-500/25 border border-sky-300'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: USIA & FASE ================= */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2"
              >
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 p-1 shrink-0 shadow-xs flex items-center justify-center">
                    <CharviMascot
                      variant="compact-header"
                      emotion="happy"
                      theme={mascotTheme}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border-2 border-sky-100 shadow-xs max-w-[270px]">
                    <p className="text-xs font-extrabold text-sky-800">Cincau Bertanya:</p>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      Berapa usia atau kelas {childName || 'anakmu'}? 🎒
                    </p>
                  </div>
                </div>

                {/* Fase Cards */}
                <div className="my-auto space-y-2.5 w-full">
                  {[
                    {
                      id: 'A' as const,
                      title: 'Fase A (Kelas 1 - 2 SD)',
                      age: '6 - 7 Tahun',
                      desc: 'Mengenal huruf, membaca lancar, angka dasar & motorik halus.',
                      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                    },
                    {
                      id: 'B' as const,
                      title: 'Fase B (Kelas 3 - 4 SD)',
                      age: '8 - 9 Tahun',
                      desc: 'Logika matematika, sains eksploratif & kosakata kaya.',
                      color: 'border-amber-200 bg-amber-50/50 text-amber-800'
                    },
                    {
                      id: 'C' as const,
                      title: 'Fase C (Kelas 5 - 6 SD)',
                      age: '10 - 12 Tahun',
                      desc: 'Pemecahan masalah, nalar kritis & proyek kreatif mandiri.',
                      color: 'border-sky-200 bg-sky-50/50 text-sky-800'
                    }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        playPopSound();
                        setFase(item.id);
                      }}
                      className={`w-full p-3.5 rounded-2xl text-left border-2 transition-all flex items-start justify-between cursor-pointer ${
                        fase === item.id
                          ? 'border-sky-500 bg-white ring-3 ring-sky-200 shadow-md'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-neutral-900">{item.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                            {item.age}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${
                        fase === item.id ? 'bg-sky-500 border-sky-500 text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {fase === item.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 4: SOCIAL PROOF / TRUST CARD ================= */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2 text-center"
              >
                <div className="flex items-start gap-3 mt-2 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 p-1 shrink-0 shadow-xs flex items-center justify-center">
                    <CharviMascot
                      variant="compact-header"
                      emotion="happy"
                      theme={mascotTheme}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border-2 border-sky-100 shadow-xs max-w-[270px]">
                    <p className="text-sm font-bold text-neutral-800">
                      "Aku tahu apa yang paling cocok untuk {childName || 'anakmu'}! ✨"
                    </p>
                  </div>
                </div>

                {/* Big Trust Badge Card */}
                <div className="my-auto bg-white p-5 rounded-3xl border-2 border-sky-100 shadow-sm space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center mx-auto shadow-md">
                    <Star className="w-8 h-8 fill-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-neutral-900">100.000+ Anak</h3>
                    <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                      telah belajar & aktif berkreasi bersama Cincau
                    </p>
                  </div>

                  <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 text-left">
                    <p className="text-xs italic text-neutral-700 leading-relaxed font-medium">
                      "Anak saya sekarang lebih suka belajar matematika sambil bermain dibanding cuma nonton video pasif!"
                    </p>
                    <p className="text-[10px] font-bold text-sky-800 mt-2">
                      — Bunda Ratna & Daffa (7 tahun)
                    </p>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 5: TARGET & GOALS ================= */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2"
              >
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 p-1 shrink-0 shadow-xs flex items-center justify-center">
                    <CharviMascot
                      variant="compact-header"
                      emotion="thinking"
                      theme={mascotTheme}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border-2 border-sky-100 shadow-xs max-w-[270px]">
                    <p className="text-xs font-extrabold text-sky-800">Cincau Bertanya:</p>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      Apa fokus yang paling ingin dikembangkan untuk {childName}? 🎯
                    </p>
                  </div>
                </div>

                {/* Goals Multi-Select List */}
                <div className="my-auto space-y-2 w-full max-h-[300px] overflow-y-auto no-scrollbar py-1">
                  {[
                    'Berhitung & Logika Cepat',
                    'Membaca Cerita & Kosakata',
                    'Kreativitas & Seni Visual',
                    'Sains & Eksplorasi Alam',
                    'Fokus, Disiplin & Kemandirian',
                  ].map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`w-full p-3 rounded-2xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/50 shadow-xs font-bold text-sky-900'
                            : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-xs">{goal}</span>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border-2 ${
                          isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-neutral-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 6: DURASI BERMAIN MANDIRI ================= */}
            {step === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2"
              >
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 p-1 shrink-0 shadow-xs flex items-center justify-center">
                    <CharviMascot
                      variant="compact-header"
                      emotion="listening"
                      theme={mascotTheme}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border-2 border-sky-100 shadow-xs max-w-[270px]">
                    <p className="text-xs font-extrabold text-sky-800">Cincau Bertanya:</p>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      Berapa lama {childName} biasanya bisa fokus bermain mandiri? ⏱️
                    </p>
                  </div>
                </div>

                {/* Single Choice Cards */}
                <div className="my-auto space-y-2.5 w-full">
                  {[
                    { label: '10 - 15 Menit', desc: 'Sesi singkat & terarah' },
                    { label: '15 - 30 Menit', desc: 'Durasi seimbang yang ideal' },
                    { label: 'Lebih dari 30 Menit', desc: 'Eksplorasi mendalam' },
                  ].map((dur) => (
                    <button
                      key={dur.label}
                      onClick={() => {
                        playPopSound();
                        setPlayDuration(dur.label);
                      }}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                        playDuration === dur.label
                          ? 'border-sky-500 bg-white ring-3 ring-sky-200 shadow-md font-bold'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-extrabold text-neutral-900">{dur.label}</h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{dur.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        playDuration === dur.label ? 'bg-sky-500 border-sky-500 text-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {playDuration === dur.label && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 7: KETERAMPILAN SAAT INI ================= */}
            {step === 7 && (
              <motion.div
                key="step-7"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2"
              >
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 p-1 shrink-0 shadow-xs flex items-center justify-center">
                    <CharviMascot
                      variant="compact-header"
                      emotion="happy"
                      theme={mascotTheme}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border-2 border-sky-100 shadow-xs max-w-[270px]">
                    <p className="text-xs font-extrabold text-sky-800">Cincau Bertanya:</p>
                    <p className="text-sm font-bold text-neutral-800 mt-0.5">
                      Keterampilan apa saja yang sudah dimiliki {childName}? 🗣️
                    </p>
                  </div>
                </div>

                <div className="my-auto space-y-2 w-full">
                  {[
                    'Mengenal huruf & mengeja kata',
                    'Menghitung angka 1-20',
                    'Menyukai teka-teki logika',
                    'Berbicara dalam kalimat lengkap',
                  ].map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`w-full p-3 rounded-2xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/50 shadow-xs font-bold text-sky-900'
                            : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-xs">{skill}</span>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border-2 ${
                          isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-neutral-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 8: SCIENCE-BACKED PEDAGOGY ================= */}
            {step === 8 && (
              <motion.div
                key="step-8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2 text-center"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Metode Berbasis Riset</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                    Aktivitas Tervalidasi Ilmiah 🔬
                  </h2>
                </div>

                <div className="my-auto space-y-2.5 text-left w-full">
                  <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-xs">
                    <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-sky-500" />
                      Stimulasi Kognitif Seimbang
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Mencegah kelelahan mata dan kecanduan layar berkat ritme jeda alami.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-xs">
                    <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Prinsip Bermain Sambil Belajar
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Menyalurkan rasa ingin tahu anak lewat misi interaktif tanpa tekanan ujian.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-xs">
                    <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      100% Aman & Bebas Iklan
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Lingkungan terproteksi penuh tanpa tautan luar atau pembelian tanpa izin orang tua.
                    </p>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 9: FITUR SUARA / MIKROFON ================= */}
            {step === 9 && (
              <motion.div
                key="step-9"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col items-center justify-between py-2 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 mt-2">
                  <Mic className="w-10 h-10 animate-pulse" />
                </div>

                <div className="my-auto px-2">
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                    Ayo Buat {childName || 'Anak'} Aktif Bersuara! 🎙️
                  </h2>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Dengan izin interaksi suara, Cincau dapat menyapa dan mendengarkan latihan pelafalan kata bahasa serta membaca bersama.
                  </p>

                  <div className="mt-4 p-3 bg-white rounded-2xl border border-sky-100 shadow-2xs text-left flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-sky-500 shrink-0" />
                    <span className="text-[11px] font-medium text-neutral-600">
                      Privasi diutamakan: Suara tidak pernah disimpan atau dibagikan ke server luar.
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-2 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setVoiceEnabled(true);
                      handleNext();
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Aktifkan Interaksi Suara</span>
                    <Sparkles className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={() => {
                      setVoiceEnabled(false);
                      handleNext();
                    }}
                    className="w-full py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    Nanti Saja
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 10: ANIMASI PERSONALISASI ================= */}
            {step === 10 && (
              <motion.div
                key="step-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col items-center justify-between py-2 text-center relative"
              >
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                    Menyiapkan Cincau untuk {childName}... ⚙️
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Menyusun pengalaman belajar personal khusus si kecil
                  </p>
                </div>

                {/* Mascot Center Animation */}
                <div className="relative w-44 h-44 my-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-sky-200/40 rounded-full filter blur-xl animate-spin" />
                  <CharviMascot
                    variant="compact-header"
                    emotion={mascotEmotion}
                    theme={mascotTheme}
                    className="w-36 h-36 drop-shadow-lg"
                  />
                </div>

                {/* Checklist & Progress Indicator */}
                <div className="w-full space-y-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-xs text-left">
                  <div className="flex items-center justify-between text-xs font-extrabold text-sky-900">
                    <span>Mempersiapkan Materi</span>
                    <span>{personalizeProgress}%</span>
                  </div>

                  <div className="w-full h-3 bg-sky-100 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      style={{ width: `${personalizeProgress}%` }}
                      className="h-full bg-gradient-to-r from-sky-400 via-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1 text-[11px] font-semibold text-neutral-600">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        personalizeProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-400'
                      }`}>
                        ✓
                      </div>
                      <span>Menyusun kurikulum {fase === 'A' ? 'Fase A' : fase === 'B' ? 'Fase B' : 'Fase C'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        personalizeProgress >= 60 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-400'
                      }`}>
                        ✓
                      </div>
                      <span>Menyesuaikan mini game & target fokus</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        personalizeProgress >= 90 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-400'
                      }`}>
                        ✓
                      </div>
                      <span>Mengaktifkan profil mandiri Cincau</span>
                    </div>
                  </div>
                </div>

                {/* Device Prompt Popup overlay (as in video) */}
                <AnimatePresence>
                  {showDeviceQuestion && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-x-4 bottom-8 bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-sky-300 shadow-2xl z-30 text-center"
                    >
                      <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Pertanyaan Cepat</h4>
                      <p className="text-sm font-extrabold text-neutral-900 mt-1">
                        Apakah {childName} memiliki perangkat sendiri? 📱
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 mt-3">
                        <button
                          onClick={() => handleDeviceAnswer(false)}
                          className="py-2.5 px-3 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                        >
                          Milik Bersama
                        </button>
                        <button
                          onClick={() => handleDeviceAnswer(true)}
                          className="py-2.5 px-3 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 active:scale-95 transition-all cursor-pointer shadow-sm"
                        >
                          Punya Sendiri
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ================= STEP 11: CELEBRATION READY ================= */}
            {step === 11 && (
              <motion.div
                key="step-11"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-between py-4 text-center"
              >
                <div className="pt-2">
                  <span className="text-3xl">🎉</span>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
                    Dunia Belajar {childName} Sudah Siap!
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Cincau sudah tidak sabar untuk mulai bermain dan belajar bersama!
                  </p>
                </div>

                <div className="w-48 h-48 my-auto flex items-center justify-center">
                  <CharviMascot
                    variant="compact-header"
                    emotion="excited"
                    theme={mascotTheme}
                    className="w-44 h-44 drop-shadow-2xl animate-bounce"
                  />
                </div>

                <div className="w-full space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer border border-emerald-300"
                  >
                    <span>Langkah Terakhir</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 12: ORANG TUA / SIGN UP TRACK ================= */}
            {step === 12 && (
              <motion.div
                key="step-12"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col justify-between py-2"
              >
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight text-center">
                    Langkah Terakhir! 🔐
                  </h2>
                  <p className="text-xs text-neutral-500 text-center mt-1">
                    Daftarkan akun untuk memantau grafik tumbuh kembang {childName}.
                  </p>
                </div>

                {/* Form fields */}
                <div className="my-auto space-y-3 w-full">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Email Orang Tua</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5" />
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="contoh: ayah.bunda@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-neutral-200 focus:border-sky-500 rounded-2xl text-xs font-bold text-neutral-800 outline-none shadow-2xs transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Kata Sandi Akun</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5" />
                      <input
                        type="password"
                        value={parentPassword}
                        onChange={(e) => setParentPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-neutral-200 focus:border-sky-500 rounded-2xl text-xs font-bold text-neutral-800 outline-none shadow-2xs transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subscribeNewsletter}
                      onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 accent-sky-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium text-neutral-600">
                      Kirimkan saya ringkasan mingguan capaian anak
                    </span>
                  </label>
                </div>

                <div className="w-full space-y-2 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer border border-sky-300"
                  >
                    <span>Mulai Pantau Progres</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 13: FREE TRIAL / TRIAL REMINDER ================= */}
            {step === 13 && (
              <motion.div
                key="step-13"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex-1 flex flex-col items-center justify-between py-2 text-center"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Bell className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                    Pengingat Masa Uji Coba 🔔
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 px-3">
                    Kami akan mengirimkan notifikasi sebelum masa uji coba gratis berakhir.
                  </p>
                </div>

                <div className="w-full bg-white p-4 rounded-3xl border border-sky-100 shadow-xs space-y-2 text-left my-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[11px]">✓</span>
                    <span>100% Akses Penuh Mini Game & Belajar</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[11px]">✓</span>
                    <span>Laporan & Rekomendasi Mingguan</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[11px]">✓</span>
                    <span>Tanpa tagihan saat ini • Batalkan kapan saja</span>
                  </div>

                  <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200/60 mt-3 text-center">
                    <span className="text-xs font-extrabold text-sky-800">Uji Coba 7 Hari: Rp 0,-</span>
                  </div>
                </div>

                <div className="w-full space-y-2 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={finishRegistration}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-base shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer border border-emerald-300"
                  >
                    <span>Mulai Uji Coba Gratis</span>
                    <Sparkles className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={finishRegistration}
                    className="w-full py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    Langsung Masuk ke Dunia Cincau
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
