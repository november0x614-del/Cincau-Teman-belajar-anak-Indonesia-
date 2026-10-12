import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MascotTheme } from '../types';
import { X, Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';

interface AppleCatchMinigameProps {
  mascotTheme: MascotTheme;
  onClose: (earnedFood: number, earnedStars: number) => void;
}

export const AppleCatchMinigame: React.FC<AppleCatchMinigameProps> = ({
  mascotTheme,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // HUD & Menu React states
  const [gameState, setGameState] = React.useState<'menu' | 'play' | 'pause' | 'over'>('menu');
  const [mode, setMode] = React.useState<'classic' | 'learn'>('classic');
  const [score, setScore] = React.useState<number>(0);
  const [lives, setLives] = React.useState<number>(3);
  const [level, setLevel] = React.useState<number>(1);
  const [combo, setCombo] = React.useState<number>(0);
  const [questionText, setQuestionText] = React.useState<string>('');
  const [muted, setMuted] = React.useState<boolean>(false);
  const [finalStars, setFinalStars] = React.useState<number>(1);

  // Refs for game loop access
  const gameRef = useRef({
    mode: 'classic',
    st: 'menu',
    score: 0,
    lives: 3,
    lvl: 1,
    got: 0,
    combo: 0,
    spawn: 0,
    ans: 0,
    bx: 0,
    tx: 0,
    X: 6,
    top: 14,
    hw: 8,
    shake: 0,
    bs: 1,
    muted: false,
  });

  gameRef.current.muted = muted;
  gameRef.current.mode = mode;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let AC: AudioContext | null = null;

    const tone = (f: number, d = 0.12, type: OscillatorType = 'sine', v = 0.14, slide = 0, delay = 0) => {
      if (gameRef.current.muted || !AC) return;
      try {
        const t = AC.currentTime + delay;
        const o = AC.createOscillator();
        const g = AC.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
        g.gain.setValueAtTime(v, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g).connect(AC.destination);
        o.start(t);
        o.stop(t + d);
      } catch (e) {
        // AudioContext error handling
      }
    };

    const SFX = {
      good: () => { tone(660, 0.1, 'triangle'); tone(880, 0.14, 'triangle', 0.14, 0, 0.08); },
      gold: () => [784, 988, 1318, 1568].forEach((f, i) => tone(f, 0.16, 'triangle', 0.14, 0, i * 0.07)),
      bad: () => tone(240, 0.35, 'sawtooth', 0.1, -150),
      ok: () => [523, 659, 784].forEach((f, i) => tone(f, 0.15, 'triangle', 0.14, 0, i * 0.09)),
      lvl: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, 'square', 0.07, 0, i * 0.1)),
      miss: () => tone(180, 0.12, 'sine', 0.06, -60),
      over: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', 0.14, 0, i * 0.18)),
    };

    const rd = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    rd.setClearColor(0, 0);
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    sc.add(new THREE.HemisphereLight(0xffffff, 0x7bbf6a, 0.95));
    const dl = new THREE.DirectionalLight(0xfff2cc, 0.8);
    dl.position.set(4, 10, 8);
    sc.add(dl);

    const L = (c: number, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o));
    const ground = new THREE.Mesh(new THREE.BoxGeometry(80, 1, 24), L(0x6fcf5a));
    ground.position.set(0, -0.5, -6);
    sc.add(ground);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(80, 0.05, 3), L(0x5bbd49));
    strip.position.set(0, 0.03, 1.5);
    sc.add(strip);

    [[-14, -14, 6], [0, -18, 8], [14, -15, 7]].forEach(([x, z, s]) => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(s, 24, 12), L(0x8ddc7a));
      h.position.set(x, -s * 0.55, z);
      sc.add(h);
    });

    const scenery: THREE.Group[] = [];
    [-9, -5.5, 6, 9.5].forEach((x, i) => {
      const g = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 2.2, 10), L(0x8a5a35));
      tr.position.y = 1.1;
      const cr = new THREE.Mesh(new THREE.SphereGeometry(1.5 + (i % 2) * 0.4, 16, 12), L(0x3f9e4d));
      cr.position.y = 3.1;
      g.add(tr, cr);
      g.position.set(x, 0, -5 - (i % 2) * 2);
      sc.add(g);
    });

    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      [[0, 0, 1], [1.1, -0.2, 0.8], [-1.1, -0.2, 0.8]].forEach(([x, y, s]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 8), L(0xffffff));
        m.position.set(x, y, 0);
        m.scale.y = 0.65;
        g.add(m);
      });
      g.position.set(Math.random() * 28 - 14, Math.random() * 6 + 9, -12 - i);
      g.userData.v = Math.random() * 0.25 + 0.15;
      sc.add(g);
      scenery.push(g);
    }

    // Basket
    const basket = new THREE.Group();
    const bm = L(0xc98a3d, { side: THREE.DoubleSide });
    basket.add(new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1, 1, 20, 1, true), bm));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.1, 8, 24), L(0x9c6420));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.5;
    basket.add(rim);
    const bot = new THREE.Mesh(new THREE.CircleGeometry(1, 16), bm);
    bot.rotation.x = -Math.PI / 2;
    bot.position.y = -0.45;
    basket.add(bot);
    basket.position.y = 0.5;
    sc.add(basket);

    const bsh = new THREE.Mesh(
      new THREE.CircleGeometry(1.3, 20),
      new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.22 })
    );
    bsh.rotation.x = -Math.PI / 2;
    bsh.position.y = 0.06;
    sc.add(bsh);

    // Text texture helper
    const texC: Record<string, THREE.CanvasTexture> = {};
    const tx = (s: string) => {
      if (texC[s]) return texC[s];
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x = c.getContext('2d');
      if (x) {
        x.font = '700 84px Fredoka, Arial, sans-serif';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.lineWidth = 12;
        x.strokeStyle = '#2b2140';
        x.strokeText(s, 64, 70);
        x.fillStyle = '#fff';
        x.fillText(s, 64, 70);
      }
      return (texC[s] = new THREE.CanvasTexture(c));
    };

    // Apples pool
    const MAT = {
      red: L(0xe53935),
      gold: new THREE.MeshStandardMaterial({ color: 0xffc83d, emissive: 0x7a5200, metalness: 0.4, roughness: 0.3 }),
      rot: L(0x7d6a3a),
    };
    const stemM = L(0x6b4423), leafM = L(0x3fb26b);
    const sg = new THREE.SphereGeometry(0.5, 20, 16);
    const shg = new THREE.CircleGeometry(0.5, 14);
    const shm = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.2 });

    const apples: any[] = [];
    for (let i = 0; i < 16; i++) {
      const g = new THREE.Group();
      const b = new THREE.Mesh(sg, MAT.red);
      b.scale.set(1, 0.92, 1);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 6), stemM);
      st.position.y = 0.5;
      const lf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), leafM);
      lf.scale.set(1, 0.3, 0.6);
      lf.position.set(0.16, 0.58, 0);
      lf.rotation.z = 0.4;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }));
      sp.position.z = 0.62;
      sp.scale.set(0.95, 0.95, 1);
      g.add(b, st, lf, sp);
      g.visible = false;
      sc.add(g);

      const sh = new THREE.Mesh(shg, shm);
      sh.rotation.x = -Math.PI / 2;
      sh.position.y = 0.05;
      sh.visible = false;
      sc.add(sh);

      apples.push({ g, b, sp, sh, on: false, type: 'red', num: 0, vy: 0, spin: 0, ph: 0 });
    }

    // Particles
    const NP = 120;
    const pp = new Float32Array(NP * 3).fill(-50);
    const pc = new Float32Array(NP * 3);
    const pv = new Float32Array(NP * 3);
    const pl = new Float32Array(NP);
    let pi = 0;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.32, vertexColors: true }));
    pts.frustumCulled = false;
    sc.add(pts);

    const burst = (x: number, y: number, hex: number, n = 14) => {
      const color = new THREE.Color(hex);
      for (let k = 0; k < n; k++) {
        const i = pi++ % NP;
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 4 + 2;
        pp.set([x, y, 0.4], i * 3);
        pv.set([Math.cos(a) * s, Math.sin(a) * s + 3, Math.random() * 2 - 1], i * 3);
        pc.set([color.r, color.g, color.b], i * 3);
        pl[i] = Math.random() * 0.4 + 0.5;
      }
    };

    const tickP = (dt: number) => {
      for (let i = 0; i < NP; i++) {
        if (pl[i] > 0) {
          pl[i] -= dt;
          pv[i * 3 + 1] -= 10 * dt;
          for (let k = 0; k < 3; k++) pp[i * 3 + k] += pv[i * 3 + k] * dt;
          if (pl[i] <= 0) pp[i * 3 + 1] = -50;
        }
      }
      pg.attributes.position.needsUpdate = true;
      pg.attributes.color.needsUpdate = true;
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const a = w / h;
      rd.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rd.setSize(w, h, false);
      cam.aspect = a;
      const z = Math.min(22, Math.max(15, 5.5 / (0.414 * a)));
      cam.position.set(0, 5.2, z);
      cam.lookAt(0, 5, 0);
      cam.updateProjectionMatrix();
      gameRef.current.hw = 0.414 * z * a;
      gameRef.current.X = Math.min(gameRef.current.hw, 8.5) - 1.3;
      gameRef.current.top = 5 + 0.414 * z + 1;
    };
    window.addEventListener('resize', resize);
    resize();

    // Floating text pops (handled via React or DOM overlay if needed)
    const pop = (t: string, x: number, y: number, col = '#fff') => {
      const v = new THREE.Vector3(x, y, 0).project(cam);
      const d = document.createElement('div');
      d.className = 'absolute font-bold text-lg pointer-events-none transition-all duration-700 select-none z-40';
      d.textContent = t;
      d.style.color = col;
      d.style.textShadow = '0 2px 4px rgba(0,0,0,0.6)';
      d.style.left = `${(v.x * 0.5 + 0.5) * window.innerWidth}px`;
      d.style.top = `${(-v.y * 0.5 + 0.5) * window.innerHeight}px`;
      d.style.transform = 'translate(-50%, -50%)';
      containerRef.current?.appendChild(d);
      setTimeout(() => {
        d.style.transform = 'translate(-50%, -180%)';
        d.style.opacity = '0';
      }, 50);
      setTimeout(() => d.remove(), 900);
    };

    // Game loop logic functions
    const newQ = () => {
      const G = gameRef.current;
      const mx = G.lvl < 3 ? 5 : G.lvl < 5 ? 10 : 15;
      let a, b, t;
      if (G.lvl < 3 || Math.random() < 0.6) {
        a = Math.floor(Math.random() * mx) + 1;
        b = Math.floor(Math.random() * mx) + 1;
        G.ans = a + b;
        t = `${a} + ${b} = ?`;
      } else {
        G.ans = Math.floor(Math.random() * mx);
        b = Math.floor(Math.random() * mx) + 1;
        a = G.ans + b;
        t = `${a} − ${b} = ?`;
      }
      setQuestionText(t);
    };

    const spawn = () => {
      const G = gameRef.current;
      const a = apples.find((o) => !o.on);
      if (!a) return;
      let type = 'red';
      let num = 0;
      const r = Math.random();
      if (G.mode === 'learn') {
        num = r < 0.4 ? G.ans : Math.max(0, G.ans + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 4) + 1));
        if (num === G.ans && r >= 0.4) num = G.ans + 5;
      } else {
        type = r < 0.06 ? 'gold' : r < Math.min(0.22, 0.07 + 0.015 * G.lvl) + 0.06 ? 'rot' : 'red';
      }

      Object.assign(a, {
        on: true,
        type,
        num,
        vy: 2.8 + G.lvl * 0.45 + Math.random() * 0.8,
        spin: Math.random() * 4 - 2,
        ph: Math.random() * 6.28,
      });
      a.b.material = MAT[type === 'rot' ? 'rot' : type === 'gold' ? 'gold' : 'red'];
      const lab = G.mode === 'learn' ? String(num) : type === 'rot' ? '🐛' : '';
      a.sp.visible = !!lab;
      if (lab) {
        a.sp.material.map = tx(lab);
        a.sp.material.needsUpdate = true;
      }
      a.g.scale.setScalar(type === 'gold' ? 1.15 : 1);
      a.g.position.set(Math.random() * (G.X * 2) - G.X, G.top, 0);
      a.g.visible = a.sh.visible = true;
    };

    const caught = (a: any) => {
      const G = gameRef.current;
      const x = a.g.position.x;
      const y = a.g.position.y;
      a.on = false;
      a.g.visible = a.sh.visible = false;
      G.bs = 0.7;

      if (G.mode === 'learn') {
        const good = a.num === G.ans;
        if (good) {
          G.combo++;
          const ptsVal = 10 * Math.min(5, 1 + Math.floor(G.combo / 5));
          G.score += ptsVal;
          setScore(G.score);
          setCombo(G.combo);
          pop('+' + ptsVal, x, y + 0.8, '#b9ffcf');
          newQ();
          SFX.ok();
          burst(x, y, 0x3fb26b, 18);
          G.got++;
          if (G.got % 4 === 0) {
            G.lvl++;
            setLevel(G.lvl);
            SFX.lvl();
            pop('Level ' + G.lvl + '!', 0, 7, '#ffe066');
          }
        } else {
          G.lives--;
          G.combo = 0;
          setLives(G.lives);
          setCombo(0);
          G.shake = 0.4;
          SFX.bad();
          burst(x, y, 0x7d6a3a, 16);
          pop('Coba lagi!', x, y + 0.8, '#ffd0d0');
          if (G.lives <= 0) setTimeout(() => endGame(), 350);
        }
      } else {
        if (a.type === 'rot') {
          G.lives--;
          G.combo = 0;
          setLives(G.lives);
          setCombo(0);
          G.shake = 0.4;
          SFX.bad();
          burst(x, y, 0x7d6a3a, 16);
          if (G.lives <= 0) setTimeout(() => endGame(), 350);
        } else {
          G.combo++;
          const ptsVal = (a.type === 'gold' ? 50 : 10) * Math.min(5, 1 + Math.floor(G.combo / 5));
          G.score += ptsVal;
          setScore(G.score);
          setCombo(G.combo);
          pop('+' + ptsVal, x, y + 0.8, a.type === 'gold' ? '#ffe066' : '#fff');
          a.type === 'gold' ? SFX.gold() : SFX.good();
          burst(x, y, a.type === 'gold' ? 0xffd43b : 0xff5a4f, a.type === 'gold' ? 24 : 12);
          G.got++;
          if (G.got % 6 === 0) {
            G.lvl++;
            setLevel(G.lvl);
            SFX.lvl();
            pop('Level ' + G.lvl + '!', 0, 7, '#ffe066');
          }
        }
      }
    };

    const endGame = () => {
      gameRef.current.st = 'over';
      setGameState('over');
      SFX.over();
      const finalSc = gameRef.current.score;
      const starsCount = finalSc >= 300 ? 3 : finalSc >= 120 ? 2 : 1;
      setFinalStars(starsCount);
    };

    // Controls
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameRef.current.st === 'play') {
          gameRef.current.st = 'pause';
          setGameState('pause');
        } else if (gameRef.current.st === 'pause') {
          gameRef.current.st = 'play';
          setGameState('play');
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handlePointerMove = (e: PointerEvent) => {
      if (gameRef.current.st === 'play') {
        gameRef.current.tx = ((e.clientX / window.innerWidth) * 2 - 1) * gameRef.current.hw;
      }
    };
    window.addEventListener('pointermove', handlePointerMove);

    // Animation Loop
    const clk = new THREE.Clock();
    let animId: number;
    let sway = 0;

    const frame = () => {
      animId = requestAnimationFrame(frame);
      const dt = Math.min(clk.getDelta(), 0.05);
      const G = gameRef.current;

      if (G.st === 'play') {
        const k = (keys['ArrowRight'] || keys['KeyD'] ? 1 : 0) - (keys['ArrowLeft'] || keys['KeyA'] ? 1 : 0);
        G.tx += k * 15 * dt;
        G.tx = Math.max(-G.X, Math.min(G.X, G.tx));
        G.bx += (G.tx - G.bx) * Math.min(1, dt * 14);

        G.spawn -= dt;
        if (G.spawn <= 0) {
          spawn();
          G.spawn = Math.max(0.45, 1.15 - G.lvl * 0.07) + Math.random() * 0.3;
        }

        for (const a of apples) {
          if (!a.on) continue;
          const p = a.g.position;
          p.y -= a.vy * dt;
          a.ph += dt * 3;
          a.g.rotation.z = Math.sin(a.ph) * 0.25;
          a.g.rotation.y += a.spin * dt;
          a.sh.position.x = p.x;
          const s = Math.max(0.3, 1 - (p.y / G.top) * 0.7);
          a.sh.scale.setScalar(s);

          if (p.y < 1.75 && p.y > 0.6 && Math.abs(p.x - G.bx) < 1.35) {
            caught(a);
            continue;
          }
          if (p.y < 0.45) {
            a.on = false;
            a.g.visible = a.sh.visible = false;
            burst(p.x, 0.3, a.type === 'rot' ? 0x7d6a3a : 0xc84b3a, 6);
            if (G.mode === 'classic' && a.type !== 'rot') {
              G.combo = 0;
              setCombo(0);
              SFX.miss();
            }
          }
        }
      }

      G.bs += (1 - G.bs) * Math.min(1, dt * 12);
      basket.position.x = bsh.position.x = G.bx;
      basket.scale.set(1 + (1 - G.bs) * 0.8, G.bs, 1);
      bsh.scale.set(1 + (1 - G.bs) * 0.4, 1, 1);
      basket.rotation.z = (G.tx - G.bx) * -0.04;

      if (!reduce) {
        scenery.forEach((c) => {
          c.position.x += c.userData.v * dt;
          if (c.position.x > 18) c.position.x = -18;
        });
        sway += (G.bx * 0.12 - sway) * dt * 2;
        G.shake = Math.max(0, G.shake - dt);
        cam.position.x = sway + (G.shake ? (Math.random() * 2 - 1) * G.shake * 0.4 : 0);
      }

      tickP(dt);
      rd.render(sc, cam);
    };

    animId = requestAnimationFrame(frame);

    // Expose start game function to component scope
    (window as any).__startThreeGame = (selectedMode: 'classic' | 'learn') => {
      setMode(selectedMode);
      gameRef.current.mode = selectedMode;
      Object.assign(gameRef.current, {
        st: 'play',
        score: 0,
        lives: 3,
        lvl: 1,
        got: 0,
        combo: 0,
        spawn: 0.6,
        bx: 0,
        tx: 0,
        shake: 0,
      });
      setScore(0);
      setLives(3);
      setLevel(1);
      setCombo(0);
      apples.forEach((a) => {
        a.on = false;
        a.g.visible = a.sh.visible = false;
      });
      if (selectedMode === 'learn') newQ();
      setGameState('play');
      if (!AC) {
        AC = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (AC && AC.state === 'suspended') AC.resume();
    };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointermove', handlePointerMove);
      rd.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 bg-[#8fd3ff] overflow-hidden flex flex-col justify-between select-none touch-none"
    >
      {/* Sky Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6cc4ff] via-[#c9ecff] to-[#fff6d6] pointer-events-none" />

      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* HUD Header */}
      {gameState === 'play' && (
        <div className="relative z-30 pt-4 px-4 flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-lg shadow-md border border-neutral-200">
            ⭐ <span id="sc">{score}</span>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-lg shadow-md border border-neutral-200">
            Level {level}
          </div>
          <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-lg shadow-md border border-neutral-200 flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < lives ? 'text-red-500' : 'text-neutral-300'}>
                ♥
              </span>
            ))}
          </div>
          <span className="flex-1" />
          {combo >= 3 && (
            <div className="bg-amber-400 text-white px-3 py-1 rounded-full font-black text-sm shadow-md animate-bounce">
              🔥 x{Math.min(5, 1 + Math.floor(combo / 5))}
            </div>
          )}
          <button
            onClick={() => {
              gameRef.current.st = 'pause';
              setGameState('pause');
            }}
            className="w-11 h-11 rounded-full bg-white/90 shadow-md border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold hover:bg-white cursor-pointer"
          >
            <Pause className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="w-11 h-11 rounded-full bg-white/90 shadow-md border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold hover:bg-white cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Math Question Overlay in Learn Mode */}
      {gameState === 'play' && mode === 'learn' && questionText && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-white/95 border-4 border-amber-300 rounded-2xl px-6 py-2 text-3xl font-black shadow-lg text-neutral-800">
          {questionText}
        </div>
      )}

      {/* Main Menu Overlay */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-amber-50 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl border-4 border-amber-300 space-y-4">
            <h1 className="text-4xl font-black text-amber-900">🍎 Tangkap Apel!</h1>
            <p className="text-neutral-600 font-medium text-sm">
              Geser keranjang untuk menangkap apel segar. Jauhi ulat dan apel busuk!
            </p>
            <button
              onClick={() => (window as any).__startThreeGame('classic')}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white font-extrabold text-xl shadow-md hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
            >
              🍎 Main Klasik
            </button>
            <button
              onClick={() => (window as any).__startThreeGame('learn')}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              ➕ Belajar Berhitung
            </button>
            <button
              onClick={() => onClose(0, 0)}
              className="w-full py-3 rounded-2xl bg-neutral-200 text-neutral-700 font-bold text-base hover:bg-neutral-300 transition-all cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {gameState === 'pause' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl border-4 border-emerald-300 space-y-4">
            <h2 className="text-3xl font-black text-neutral-900">Jeda</h2>
            <p className="text-neutral-600">Istirahat dulu ya!</p>
            <button
              onClick={() => {
                gameRef.current.st = 'play';
                setGameState('play');
              }}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-md hover:bg-emerald-700 cursor-pointer"
            >
              Lanjut Main
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="w-full py-3 rounded-2xl bg-purple-200 text-purple-900 font-bold text-base hover:bg-purple-300 cursor-pointer"
            >
              Menu Utama
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'over' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl border-4 border-emerald-400 space-y-4">
            <h2 className="text-3xl font-black text-neutral-900">Hebat! 🎉</h2>
            <div className="text-4xl tracking-widest my-2">
              {'⭐'.repeat(finalStars)}
              {'☆'.repeat(3 - finalStars)}
            </div>
            <p className="text-neutral-600 font-semibold text-lg">Skor Akhir: {score}</p>
            <button
              onClick={() => (window as any).__startThreeGame(mode)}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white font-extrabold text-lg shadow-md hover:bg-orange-600 cursor-pointer"
            >
              Main Lagi
            </button>
            <button
              onClick={() => onClose(score, score >= 120 ? 10 : 5)}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 cursor-pointer"
            >
              Simpan & Kembali ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
