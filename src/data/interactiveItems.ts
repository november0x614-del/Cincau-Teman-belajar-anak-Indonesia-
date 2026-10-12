export interface InteractiveItem {
  id: string;
  type: 'bookshelf' | 'arcade' | 'kitchen' | 'starplant' | 'rug' | 'lantern' | 'clock' | 'aquarium';
  name: string;
  description: string;
  category: 'activity' | 'decor';
  x: number; // percentage 5% to 90% across stage
  y: number; // percentage from bottom 8% to 65%
  scale: number;
  actionType: 'learn' | 'play' | 'feed' | 'none';
  badge: string;
  cost: number; // star points cost
  isDefaultUnlocked: boolean;
}

export const INITIAL_ROOM_ITEMS: InteractiveItem[] = [
  {
    id: 'item_bookshelf',
    type: 'bookshelf',
    name: 'Rak Buku Pintar',
    description: 'Klik untuk memulai Misi Belajar Kurikulum Merdeka!',
    category: 'activity',
    x: 18,
    y: 26,
    scale: 1,
    actionType: 'learn',
    badge: '📖 Belajar',
    cost: 0,
    isDefaultUnlocked: true,
  },
  {
    id: 'item_arcade',
    type: 'arcade',
    name: 'Mesin Game Arkade Jeli',
    description: 'Klik untuk bermain game arkade 2D Tangkap Buah!',
    category: 'activity',
    x: 82,
    y: 25,
    scale: 1,
    actionType: 'play',
    badge: '🎮 Bermain',
    cost: 0,
    isDefaultUnlocked: true,
  },
  {
    id: 'item_kitchen',
    type: 'kitchen',
    name: 'Meja Makan & Kulkas Madu',
    description: 'Klik untuk menyuapi dan merawat Cincau!',
    category: 'activity',
    x: 48,
    y: 24,
    scale: 1,
    actionType: 'feed',
    badge: '🥣 Suapi Cincau',
    cost: 0,
    isDefaultUnlocked: true,
  },
  {
    id: 'item_starplant',
    type: 'starplant',
    name: 'Pot Buah Bintang',
    description: 'Tanaman ajaib yang bersinar setiap kali kamu belajar.',
    category: 'decor',
    x: 34,
    y: 20,
    scale: 0.95,
    actionType: 'none',
    badge: '🌿 Dekorasi',
    cost: 0,
    isDefaultUnlocked: true,
  },
  {
    id: 'item_rug',
    type: 'rug',
    name: 'Karpet Kenyal Cincau',
    description: 'Karpet empuk tempat Cincau bersantai.',
    category: 'decor',
    x: 50,
    y: 10,
    scale: 1.1,
    actionType: 'none',
    badge: '🛋️ Dekorasi',
    cost: 0,
    isDefaultUnlocked: true,
  },
  {
    id: 'item_lantern',
    type: 'lantern',
    name: 'Lentera Kunang-kunang',
    description: 'Lampu gantung hangat berisikan kunang-kunang hutan.',
    category: 'decor',
    x: 68,
    y: 65,
    scale: 0.9,
    actionType: 'none',
    badge: '✨ Dekorasi',
    cost: 0,
    isDefaultUnlocked: true,
  },
];

export const SHOP_DECOR_CATALOG: InteractiveItem[] = [
  {
    id: 'shop_clock',
    type: 'clock',
    name: 'Jam Dinding Cincau',
    description: 'Jam dinding berbentuk jeli yang berdetak riang.',
    category: 'decor',
    x: 28,
    y: 66,
    scale: 0.85,
    actionType: 'none',
    badge: '⏰ Jam Lucu',
    cost: 10,
    isDefaultUnlocked: false,
  },
  {
    id: 'shop_aquarium',
    type: 'aquarium',
    name: 'Akuarium Ikan Cupang',
    description: 'Akuarium bulat dengan ikan cupang warna-warni berenang.',
    category: 'decor',
    x: 72,
    y: 28,
    scale: 0.9,
    actionType: 'none',
    badge: '🐠 Hewan Lucu',
    cost: 15,
    isDefaultUnlocked: false,
  },
];
