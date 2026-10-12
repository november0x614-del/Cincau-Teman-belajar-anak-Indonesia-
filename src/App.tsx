import React, { useState, useEffect } from 'react';
import { OnboardingView } from './components/OnboardingView';
import { KidsRegistrationModal } from './components/KidsRegistrationModal';
import { MascotTheme, ChildProfile } from './types';

export default function App() {
  const [mascotTheme, setMascotTheme] = useState<MascotTheme>('cyan-jelly');
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);

  // Load saved child profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cincau_child_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setChildProfile(parsed);
      } else {
        setIsRegistrationOpen(true);
      }
    } catch {
      setIsRegistrationOpen(true);
    }
  }, []);

  const themes: MascotTheme[] = ['cyan-jelly', 'classic-orange', 'emerald-mint', 'berry-purple', 'sunny-banana'];
  const toggleMascotTheme = () => {
    setMascotTheme((prev) => {
      const idx = themes.indexOf(prev);
      return themes[(idx + 1) % themes.length];
    });
  };

  const handleRegistrationComplete = (profile: ChildProfile) => {
    setChildProfile(profile);
    setIsRegistrationOpen(false);
  };

  return (
    <main className="min-h-screen w-full bg-[#f0f4f8] flex items-center justify-center sm:py-6 sm:px-4">
      {/* 
        Fully Adaptive & Responsive Container for all devices & orientations:
        - Mobile (<640px): Full screen w-full min-h-screen.
        - Tablet & Desktop (>=640px): Fluid max-w container with auto height & vertical scroll, perfectly adapting to portrait & landscape screens.
      */}
      <div className="w-full min-h-screen sm:min-h-0 sm:h-auto sm:max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white sm:rounded-[36px] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.1)] sm:border-[6px] sm:border-neutral-200/90 flex flex-col relative text-neutral-900 transition-all duration-300">
        <OnboardingView
          mascotTheme={mascotTheme}
          onToggleTheme={toggleMascotTheme}
          onStart={() => {}}
          childProfile={childProfile}
          onOpenRegistration={() => setIsRegistrationOpen(true)}
        />

        {/* Kids Registration Onboarding Modal */}
        <KidsRegistrationModal
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onComplete={handleRegistrationComplete}
          mascotTheme={mascotTheme}
          initialProfile={childProfile}
        />
      </div>
    </main>
  );
}
