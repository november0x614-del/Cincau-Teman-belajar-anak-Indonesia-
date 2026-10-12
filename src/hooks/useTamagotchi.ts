import { useState, useEffect, useCallback } from 'react';
import { CharviEmotion } from '../types';

export interface TamagotchiState {
  energy: number; // 0-100
  foodStock: number;
  starPoints: number;
  lastFed: number; // timestamp
}

const STORAGE_KEY = 'cincau_tamagotchi_state';

export const useTamagotchi = () => {
  const [state, setState] = useState<TamagotchiState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      energy: 80,
      foodStock: 3,
      starPoints: 12,
      lastFed: Date.now(),
    };
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Natural decay of energy over time
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - 0.5) // slowly decrease energy
      }));
    }, 1000 * 60 * 5); // every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const feed = useCallback(() => {
    if (state.foodStock > 0 && state.energy < 100) {
      setState(prev => ({
        ...prev,
        foodStock: prev.foodStock - 1,
        energy: Math.min(100, prev.energy + 25),
        lastFed: Date.now()
      }));
      return true;
    }
    return false;
  }, [state.foodStock, state.energy]);

  const addMisiRewards = useCallback((food: number, stars: number) => {
    setState(prev => ({
      ...prev,
      foodStock: prev.foodStock + food,
      starPoints: prev.starPoints + stars,
      energy: Math.min(100, prev.energy + 5) // a bit of boost for learning!
    }));
  }, []);

  const gainStars = useCallback((stars: number) => {
    setState(prev => ({
      ...prev,
      starPoints: prev.starPoints + stars,
    }));
  }, []);

  const getEmotion = useCallback((): CharviEmotion => {
    if (state.energy >= 80) return 'happy';
    if (state.energy >= 50) return 'idle';
    if (state.energy >= 30) return 'bored';
    return 'sad';
  }, [state.energy]);

  const getMascotDialog = useCallback(() => {
    if (state.energy >= 80) return "Wah, terima kasih makanannya! Cincau siap belajar lagi! ✨";
    if (state.energy >= 50) return "Cincau segar dan siap menemani harimu. 🌟";
    if (state.energy >= 30) return "Hmm, perut Cincau mulai keroncongan... 🥣";
    return "Cincau lapar dan rindu belajar bareng kamu... yuk buka 1 misi! 🥺";
  }, [state.energy]);

  return {
    ...state,
    feed,
    addMisiRewards,
    gainStars,
    getEmotion,
    getMascotDialog
  };
};
