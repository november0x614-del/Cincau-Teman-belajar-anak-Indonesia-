export type CharviEmotion = 
  | 'idle' 
  | 'happy' 
  | 'bored' 
  | 'sad' 
  | 'angry' 
  | 'excited' 
  | 'thinking' 
  | 'confused' 
  | 'encouraging' 
  | 'listening' 
  | 'talking' 
  | 'annoyed' 
  | 'pouty'
  | 'surprised';

export type CincauEmotion = CharviEmotion;

export type AppView = 'onboarding' | 'living-room' | 'bedroom' | 'outdoor' | 'home';

export type MascotTheme = 'cyan-jelly' | 'classic-orange' | 'emerald-mint' | 'berry-purple' | 'sunny-banana';

export interface LookTarget {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (up) to 1 (down)
}

export interface ChildProfile {
  name: string;
  fase: 'A' | 'B' | 'C';
  favoriteSubject: string;
  age?: number;
  learningGoals?: string[];
  playDuration?: string;
  skills?: string[];
  hasOwnDevice?: boolean;
  voiceInteractionEnabled?: boolean;
  parentEmail?: string;
  isRegistered?: boolean;
  createdAt?: string;
}

export interface PlayCardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeColor: string;
  headerBg: string;
  cardBorder: string;
  reward: string;
  rewardColor: string;
  btnBg: string;
}

export interface LearnCardItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badgeColor: string;
  illustrationType: 'art' | 'history' | 'science' | 'math' | 'literacy' | 'custom';
  headerBg: string;
  cardBorder: string;
  bodyBg: string;
  reward: string;
  accentColor: string;
}
