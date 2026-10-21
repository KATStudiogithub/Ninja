import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, Difficulty, GameState, QuestionData, HeroEntity, EnemyEntity, FloatingText, UserStats } from './types';
import { CANVAS_WIDTH, GROUND_Y, GRAVITY, JUMP_FORCE, HERO_SPEED, DASH_SPEED, LEVEL_CONFIGS } from './constants';
import { MathService } from './services/mathService';
import { StorageService } from './services/storageService';
import { audioService } from './services/audioService';
import { HUD } from './components/HUD';
import { ThreeArena } from './components/ThreeArena';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { StatsModal } from './components/StatsModal';
import { PwaGuideModal, BeforeInstallPromptEvent } from './components/PwaGuideModal';
import { ArrowLeft, RotateCcw, Play, CheckCircle2, Skull } from 'lucide-react';

export default function App() {
  // Game Configuration State
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.ADVENTURE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [selectedTable, setSelectedTable] = useState<number>(2);

  // Stats & Sound
  const [stats, setStats] = useState<UserStats>(() => StorageService.loadStats());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Gameplay Run State
  const [score, setScore] = useState<number>(0);
  const [hp, setHp] = useState<number>(100);
  const [combo, setCombo] = useState<number>(0);
  const [rageMeter, setRageMeter] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState<number>(0);

  // Active Round State
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [, setQuestionsCompletedInLevel] = useState<number>(0);

  // Modals & PWA Install Prompt
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [guidePlatform, setGuidePlatform] = useState<'ANDROID' | 'IOS'>('ANDROID');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleOpenDownloadModal = async (platform: 'ANDROID' | 'IOS') => {
    if (platform === 'ANDROID' && deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setGuidePlatform(platform);
    setShowGuideModal(true);
  };

  // React State for Frame-by-Frame Rendering
  const [heroState, setHeroState] = useState<HeroEntity>({
    x: 120,
    y: GROUND_Y - 50,
    vx: 0,
    vy: 0,
    isGrounded: true,
    isAttacking: false,
    attackTimer: 0,
    attackCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    facing: 1,
    invulnerableTimer: 0,
    state: 'IDLE'
  });

  const [enemiesState, setEnemiesState] = useState<EnemyEntity[]>([]);
  const [floatingTextsState, setFloatingTextsState] = useState<FloatingText[]>([]);

  // Mutable references for smooth 60fps calculation
  const heroRef = useRef<HeroEntity>(heroState);
  const enemiesRef = useRef<EnemyEntity[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const nextTextId = useRef<number>(1);
  const animFrameRef = useRef<number | null>(null);

  const damagePerHit = difficulty === Difficulty.EASY ? 10 : difficulty === Difficulty.NORMAL ? 20 : 30;

  // ----------------- SPAWN QUESTION WAVE ----------------- //

  const spawnQuestionWave = useCallback((lvlIdx: number, mode: GameMode) => {
    let allowedTables: number[];
    let enemyCount: number;
    let baseSpeed: number;

    if (mode === GameMode.SPECIFIC_TABLE) {
      allowedTables = [selectedTable];
      enemyCount = 3;
      baseSpeed = 2.0;
    } else if (mode === GameMode.WEAKNESS_TRAINING) {
      allowedTables = MathService.getWeakestTables(stats.tableStats);
      enemyCount = 3;
      baseSpeed = 2.2;
    } else if (mode === GameMode.ENDLESS) {
      allowedTables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      enemyCount = 3 + Math.floor(Math.random() * 2);
      baseSpeed = 2.0 + Math.min(2.5, score * 0.001);
    } else {
      const config = LEVEL_CONFIGS[lvlIdx];
      allowedTables = config.tables;
      enemyCount = config.enemyCountPerQuestion;
      baseSpeed = config.enemySpeedBase;
    }

    const question = MathService.generateQuestion(allowedTables, currentQuestion || undefined);
    setCurrentQuestion(question);

    const newEnemies: EnemyEntity[] = [];
    const shuffledChoices = [...question.options].slice(0, enemyCount);
    if (!shuffledChoices.includes(question.correctAnswer)) {
      shuffledChoices[0] = question.correctAnswer;
      shuffledChoices.sort(() => Math.random() - 0.5);
    }

    shuffledChoices.forEach((num, index) => {
      const isCorrect = num === question.correctAnswer;
      const spawnX = CANVAS_WIDTH + 60 + index * 145;
      const speed = baseSpeed + (Math.random() * 0.3 - 0.15);

      newEnemies.push({
        id: Date.now() + index + Math.floor(Math.random() * 1000),
        x: spawnX,
        y: GROUND_Y - 48,
        vx: -speed,
        number: num,
        isCorrect,
        hp: 1,
        maxHp: 1,
        type: isCorrect ? 'RUNE' : 'SHADOW',
        color: isCorrect ? '#2563eb' : '#475569',
        isDead: false,
        deathAnimTimer: 0,
        hitFlash: 0
      });
    });

    enemiesRef.current = newEnemies;
    setEnemiesState([...newEnemies]);
  }, [selectedTable, stats.tableStats, score, currentQuestion]);

  // ----------------- START LEVEL ----------------- //

  const startLevel = useCallback((lvlIndex: number, mode: GameMode) => {
    setCurrentLevelIndex(lvlIndex);
    setGameMode(mode);
    setHp(100);
    setScore(0);
    setCombo(0);
    setRageMeter(0);
    setQuestionsCompletedInLevel(0);
    setFeedbackMessage(null);
    setScreenShake(0);

    const initHero: HeroEntity = {
      x: 130,
      y: GROUND_Y - 50,
      vx: 0,
      vy: 0,
      isGrounded: true,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      facing: 1,
      invulnerableTimer: 0,
      state: 'IDLE'
    };

    heroRef.current = initHero;
    setHeroState(initHero);

    enemiesRef.current = [];
    setEnemiesState([]);
    floatingTextsRef.current = [];
    setFloatingTextsState([]);

    setGameState(GameState.PLAYING);
    spawnQuestionWave(lvlIndex, mode);
  }, [spawnQuestionWave]);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    const newText = {
      id: nextTextId.current++,
      x,
      y,
      text,
      color,
      life: 45,
      maxLife: 45,
      vy: -1.6
    };
    floatingTextsRef.current.push(newText);
  };

  // ----------------- ACTIONS (SLASH, JUMP, DASH, SPECIAL) ----------------- //

  const handleHeroSlash = useCallback(() => {
    const hero = heroRef.current;
    if (hero.attackCooldown > 0 || hero.isDashing || gameState !== GameState.PLAYING) return;

    hero.isAttacking = true;
    hero.attackTimer = 16;
    hero.attackCooldown = 18;
    hero.state = 'SLASH';
    audioService.playSlash();

    const reach = 95;
    const slashBox = {
      x: hero.facing === 1 ? hero.x + 15 : hero.x - reach,
      y: hero.y - 25,
      width: reach,
      height: 95
    };

    enemiesRef.current.forEach((enemy) => {
      if (enemy.isDead) return;

      const hit =
        slashBox.x < enemy.x + 45 &&
        slashBox.x + slashBox.width > enemy.x &&
        slashBox.y < enemy.y + 65 &&
        slashBox.y + slashBox.height > enemy.y;

      if (hit) {
        if (enemy.isCorrect) {
          enemy.isDead = true;
          enemy.deathAnimTimer = 20;
          enemy.hitFlash = 12;
          audioService.playHitCorrect();
          setScreenShake(6);

          setCombo((prev) => {
            const newCombo = prev + 1;
            const pointsGained = 100 + (newCombo >= 3 ? 50 : 0);
            setScore((s) => {
              const updated = s + pointsGained;
              StorageService.recordAnswer(currentQuestion?.factor1 || 2, true, updated);
              return updated;
            });

            addFloatingText(`TEPAT! +${pointsGained}`, enemy.x, enemy.y - 15, '#38bdf8');
            return newCombo;
          });

          setRageMeter((r) => Math.min(100, r + 25));

          if (currentQuestion) {
            setFeedbackMessage(`Tepat! ${currentQuestion.factor1} × ${currentQuestion.factor2} = ${currentQuestion.correctAnswer}!`);
          }

          setTimeout(() => {
            setQuestionsCompletedInLevel((qCount) => {
              const nextCount = qCount + 1;
              const lvlConfig = LEVEL_CONFIGS[currentLevelIndex];

              if (gameMode === GameMode.ADVENTURE && nextCount >= lvlConfig.questionCount) {
                setGameState(GameState.LEVEL_CLEAR);
                audioService.playVictory();
                const updatedStats = StorageService.unlockLevel(currentLevelIndex + 2);
                setStats(updatedStats);
              } else {
                spawnQuestionWave(currentLevelIndex, gameMode);
              }
              return nextCount;
            });
          }, 350);

        } else {
          enemy.isDead = true;
          enemy.deathAnimTimer = 20;
          enemy.hitFlash = 12;
          audioService.playWrongHit();
          setScreenShake(4);

          setScore((s) => Math.max(0, s - 50));
          setCombo(0);
          addFloatingText('SALAH SASARAN! -50', enemy.x, enemy.y - 15, '#f87171');

          if (currentQuestion) {
            setFeedbackMessage(`Salah! Itu bukan jawapan ${currentQuestion.factor1} × ${currentQuestion.factor2}.`);
            StorageService.recordAnswer(currentQuestion.factor1, false, score);
          }
        }
      }
    });
  }, [gameState, currentQuestion, currentLevelIndex, gameMode, score, spawnQuestionWave]);

  const handleHeroJump = useCallback(() => {
    const hero = heroRef.current;
    if (hero.isGrounded && gameState === GameState.PLAYING) {
      hero.vy = JUMP_FORCE;
      hero.isGrounded = false;
      hero.state = 'JUMP';
      audioService.playJump();
    }
  }, [gameState]);

  const handleHeroDash = useCallback(() => {
    const hero = heroRef.current;
    if (hero.dashCooldown <= 0 && !hero.isDashing && gameState === GameState.PLAYING) {
      hero.isDashing = true;
      hero.dashTimer = 10;
      hero.dashCooldown = 32;
      hero.state = 'DASH';
      audioService.playDash();
    }
  }, [gameState]);

  const handleActivateSpecialJutsu = useCallback(() => {
    if (rageMeter < 100 || gameState !== GameState.PLAYING) return;
    setRageMeter(0);
    audioService.playSpecialJutsu();
    setScreenShake(12);

    enemiesRef.current.forEach((enemy) => {
      if (enemy.isCorrect && !enemy.isDead) {
        enemy.isDead = true;
        enemy.deathAnimTimer = 25;
        addFloatingText('RAGE JUTSU! +150', enemy.x, enemy.y - 25, '#fbbf24');
        setScore((s) => s + 150);

        setTimeout(() => {
          setQuestionsCompletedInLevel((q) => {
            const nextQ = q + 1;
            const lvlConfig = LEVEL_CONFIGS[currentLevelIndex];
            if (gameMode === GameMode.ADVENTURE && nextQ >= lvlConfig.questionCount) {
              setGameState(GameState.LEVEL_CLEAR);
              audioService.playVictory();
              StorageService.unlockLevel(currentLevelIndex + 2);
            } else {
              spawnQuestionWave(currentLevelIndex, gameMode);
            }
            return nextQ;
          });
        }, 300);
      }
    });
  }, [rageMeter, gameState, currentLevelIndex, gameMode, spawnQuestionWave]);

  // ----------------- KEYBOARD INPUTS ----------------- //

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        handleHeroJump();
      }
      if (e.code === 'KeyJ' || e.code === 'KeyZ') handleHeroSlash();
      if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'ShiftLeft') handleHeroDash();
      if (e.code === 'KeyL' || e.code === 'KeyU') handleActivateSpecialJutsu();
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState((prev) => (prev === GameState.PLAYING ? GameState.PAUSED : prev === GameState.PAUSED ? GameState.PLAYING : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleHeroJump, handleHeroSlash, handleHeroDash, handleActivateSpecialJutsu]);

  // ----------------- 60FPS GAME LOOP ----------------- //

  useEffect(() => {
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop);
      if (gameState !== GameState.PLAYING) return;

      const hero = heroRef.current;

      // 1. Movement
      if (hero.dashTimer > 0) {
        hero.dashTimer--;
        hero.vx = hero.facing * DASH_SPEED;
      } else {
        hero.isDashing = false;
        if (keysRef.current.left) {
          hero.vx = -HERO_SPEED;
          hero.facing = -1;
        } else if (keysRef.current.right) {
          hero.vx = HERO_SPEED;
          hero.facing = 1;
        } else {
          hero.vx = 0;
        }
      }

      hero.x += hero.vx;
      if (hero.x < 40) hero.x = 40;
      if (hero.x > CANVAS_WIDTH - 60) hero.x = CANVAS_WIDTH - 60;

      // Gravity & Ground
      hero.vy += GRAVITY;
      hero.y += hero.vy;
      if (hero.y >= GROUND_Y - 50) {
        hero.y = GROUND_Y - 50;
        hero.vy = 0;
        hero.isGrounded = true;
      }

      // Timers
      if (hero.attackCooldown > 0) hero.attackCooldown--;
      if (hero.attackTimer > 0) {
        hero.attackTimer--;
        if (hero.attackTimer === 0) hero.isAttacking = false;
      }
      if (hero.dashCooldown > 0) hero.dashCooldown--;
      if (hero.invulnerableTimer > 0) hero.invulnerableTimer--;

      // State determination
      if (hero.isAttacking) hero.state = 'SLASH';
      else if (hero.isDashing) hero.state = 'DASH';
      else if (!hero.isGrounded) hero.state = 'JUMP';
      else if (Math.abs(hero.vx) > 0.5) hero.state = 'RUN';
      else hero.state = 'IDLE';

      // 2. Enemies Movement & Collision
      enemiesRef.current.forEach((enemy) => {
        if (enemy.isDead) {
          if (enemy.deathAnimTimer > 0) enemy.deathAnimTimer--;
          return;
        }
        if (enemy.hitFlash > 0) enemy.hitFlash--;

        enemy.x += enemy.vx;

        const isColliding =
          hero.x < enemy.x + 36 &&
          hero.x + 36 > enemy.x &&
          hero.y < enemy.y + 50 &&
          hero.y + 50 > enemy.y;

        // ONLY correct answer enemy damages hero!
        if (isColliding && enemy.isCorrect && hero.invulnerableTimer <= 0) {
          hero.invulnerableTimer = 60;
          audioService.playHeroHurt();
          setScreenShake(8);
          addFloatingText(`-${damagePerHit} HP AWAS!`, hero.x, hero.y - 15, '#ef4444');
          setCombo(0);

          setHp((prev) => {
            const nextHp = prev - damagePerHit;
            if (nextHp <= 0) {
              setGameState(GameState.GAME_OVER);
              audioService.playGameOver();
              return 0;
            }
            return nextHp;
          });
        }

        if (enemy.x < -60) {
          if (enemy.isCorrect && hero.invulnerableTimer <= 0) {
            setHp((h) => Math.max(0, h - 10));
            addFloatingText('TERLEPAS! -10 HP', hero.x, hero.y - 15, '#f59e0b');
            spawnQuestionWave(currentLevelIndex, gameMode);
          }
        }
      });

      // 3. Floating Texts & Screen Shake Decay
      floatingTextsRef.current.forEach((ft) => {
        ft.y += ft.vy;
        ft.life--;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life > 0);

      setScreenShake((s) => (s > 0.2 ? s * 0.88 : 0));

      setHeroState({ ...hero });
      setEnemiesState([...enemiesRef.current]);
      setFloatingTextsState([...floatingTextsRef.current]);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, damagePerHit, currentLevelIndex, gameMode, spawnQuestionWave]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioService.setMute(nextMute);
  };

  const currentLevelConfig = LEVEL_CONFIGS[currentLevelIndex];

  return (
    <div className="relative w-screen h-[100dvh] bg-slate-950 text-slate-100 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* FULLSCREEN MOBILE-OPTIMIZED 3D PLAYING SCREEN */}
      {gameState === GameState.PLAYING && (
        <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
          <HUD
            hp={hp}
            maxHp={100}
            score={score}
            combo={combo}
            levelNumber={currentLevelConfig.levelNumber}
            levelTitle={currentLevelConfig.title}
            currentQuestion={currentQuestion}
            rageMeter={rageMeter}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onPause={() => setGameState(GameState.PAUSED)}
            onActivateJutsu={handleActivateSpecialJutsu}
            onOpenDownload={() => handleOpenDownloadModal('ANDROID')}
            feedbackMessage={feedbackMessage}
          />

          {/* Edge-to-Edge Three.js 3D Pixar Arena */}
          <ThreeArena
            hero={heroState}
            enemies={enemiesState}
            floatingTexts={floatingTextsState}
            bgTheme={currentLevelConfig.bgTheme}
            shakeIntensity={screenShake}
            currentQuestion={currentQuestion}
          />

          <TouchControls
            onMoveLeftStart={() => { keysRef.current.left = true; }}
            onMoveLeftEnd={() => { keysRef.current.left = false; }}
            onMoveRightStart={() => { keysRef.current.right = true; }}
            onMoveRightEnd={() => { keysRef.current.right = false; }}
            onJump={handleHeroJump}
            onSlash={handleHeroSlash}
            onDash={handleHeroDash}
            onSpecial={handleActivateSpecialJutsu}
            isSpecialReady={rageMeter >= 100}
          />
        </div>
      )}

      {/* Main Menu */}
      {gameState === GameState.MENU && (
        <div className="w-full h-full overflow-y-auto flex items-center justify-center p-3">
          <MainMenu
            stats={stats}
            difficulty={difficulty}
            onSetDifficulty={setDifficulty}
            onStartAdventure={() => setGameState(GameState.LEVEL_SELECT)}
            onStartTableSelect={() => setGameState(GameState.TABLE_SELECT)}
            onStartWeaknessMode={() => startLevel(0, GameMode.WEAKNESS_TRAINING)}
            onStartEndless={() => startLevel(9, GameMode.ENDLESS)}
            onOpenStats={() => setShowStatsModal(true)}
            onOpenDownload={handleOpenDownloadModal}
          />
        </div>
      )}

      {/* Level Select */}
      {gameState === GameState.LEVEL_SELECT && (
        <div className="w-[94%] max-w-2xl bg-slate-900/95 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90dvh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <button
              onClick={() => setGameState(GameState.MENU)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={15} /> KEMBALI
            </button>
            <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
              PILIH LEVEL (1 - 10)
            </h2>
            <div className="text-xs text-amber-400 font-bold">
              {stats.levelsUnlocked}/10
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {LEVEL_CONFIGS.map((lvl, index) => {
              const isLocked = lvl.levelNumber > stats.levelsUnlocked;
              return (
                <button
                  key={lvl.levelNumber}
                  disabled={isLocked}
                  onClick={() => startLevel(index, GameMode.ADVENTURE)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600 text-white shadow-md active:scale-95'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-black text-amber-400">LEVEL {lvl.levelNumber}</div>
                    <div className="text-sm font-bold">{lvl.title}</div>
                    <div className="text-[10px] text-slate-400">{lvl.subtitle}</div>
                  </div>
                  {isLocked ? (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">TERKUNCI</span>
                  ) : (
                    <Play size={18} className="text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Specific Table Select */}
      {gameState === GameState.TABLE_SELECT && (
        <div className="w-[94%] max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col text-center max-h-[90dvh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <button
              onClick={() => setGameState(GameState.MENU)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={15} /> KEMBALI
            </button>
            <h2 className="text-sm sm:text-base font-black text-white uppercase">PILIH SIFIR KHUSUS</h2>
            <div className="w-10" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setSelectedTable(num);
                  startLevel(0, GameMode.SPECIFIC_TABLE);
                }}
                className="py-3.5 rounded-xl bg-slate-800/90 hover:bg-red-600/90 border border-slate-700 hover:border-red-400 text-white font-black text-base transition shadow-md active:scale-95 flex flex-col items-center justify-center"
              >
                <span className="text-[10px] text-slate-300">SIFIR</span>
                <span className="text-2xl text-amber-300">{num}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {gameState === GameState.PAUSED && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
            <h2 className="text-xl font-black text-amber-400">PERMAINAN DIJEDA</h2>
            <p className="text-xs text-slate-400">Latihan sifir sedang dihentikan seketika.</p>

            <button
              onClick={() => setGameState(GameState.PLAYING)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-sm transition"
            >
              SAMBUNG PERMAINAN
            </button>

            <button
              onClick={() => startLevel(currentLevelIndex, gameMode)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs transition"
            >
              MAIN SEMULA LEVEL INI
            </button>

            <button
              onClick={() => setGameState(GameState.MENU)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-400 text-xs transition"
            >
              KEMBALI KE MENU UTAMA
            </button>
          </div>
        </div>
      )}

      {/* Level Clear Screen */}
      {gameState === GameState.LEVEL_CLEAR && (
        <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={44} className="text-emerald-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">LEVEL SELESAI!</h2>
            <p className="text-xs text-slate-300">
              Tahniah, anda berjaya menewaskan sasaran sifir dengan tepat!
            </p>

            <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 my-1 flex justify-around">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Skor</div>
                <div className="text-xl font-black text-amber-400">{score}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Baki HP</div>
                <div className="text-xl font-black text-emerald-400">{hp}/100</div>
              </div>
            </div>

            {currentLevelIndex < 9 ? (
              <button
                onClick={() => startLevel(currentLevelIndex + 1, GameMode.ADVENTURE)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide transition shadow-lg"
              >
                TERUSKAN KE LEVEL {currentLevelIndex + 2}
              </button>
            ) : (
              <div className="p-3 bg-amber-950/60 border border-amber-500 rounded-xl text-xs text-amber-300 font-bold">
                🎉 TAHNIAH! ANDA TELAH MENAMATKAN SEMUA 10 LEVEL NINJA SIFIR!
              </div>
            )}

            <button
              onClick={() => setGameState(GameState.MENU)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              MENU UTAMA
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-red-600 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
            <Skull size={44} className="text-red-500 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-black text-red-500">HERO TUMBANG!</h2>
            <p className="text-xs text-slate-400">
              HP anda telah habis. Pastikan anda hanya menyerang musuh yang membawa nombor jawapan betul!
            </p>

            <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 my-1">
              <div className="text-xs text-slate-400 font-bold uppercase">Skor Dicapai:</div>
              <div className="text-2xl font-black text-amber-400">{score}</div>
            </div>

            <button
              onClick={() => startLevel(currentLevelIndex, gameMode)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>CUBA LAGI</span>
            </button>

            <button
              onClick={() => setGameState(GameState.MENU)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              KEMBALI KE MENU
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showStatsModal && <StatsModal stats={stats} onClose={() => setShowStatsModal(false)} />}
      {showGuideModal && (
        <PwaGuideModal
          initialPlatform={guidePlatform}
          deferredPrompt={deferredPrompt}
          onClearPrompt={() => setDeferredPrompt(null)}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}
