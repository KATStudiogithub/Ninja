export enum GameMode {
  ADVENTURE = 'ADVENTURE',
  SPECIFIC_TABLE = 'SPECIFIC_TABLE',
  WEAKNESS_TRAINING = 'WEAKNESS_TRAINING',
  ENDLESS = 'ENDLESS'
}

export enum Difficulty {
  EASY = 'EASY',     // -10 HP
  NORMAL = 'NORMAL', // -20 HP
  HARD = 'HARD'      // -30 HP
}

export enum GameState {
  MENU = 'MENU',
  LEVEL_SELECT = 'LEVEL_SELECT',
  TABLE_SELECT = 'TABLE_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_CLEAR = 'LEVEL_CLEAR',
  GAME_OVER = 'GAME_OVER',
  STATS = 'STATS',
  GUIDE = 'GUIDE'
}

export interface QuestionData {
  id: string;
  factor1: number;
  factor2: number;
  correctAnswer: number;
  distractors: number[];
  options: number[];
}

export interface EnemyEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  number: number;
  isCorrect: boolean;
  hp: number;
  maxHp: number;
  type: 'SHADOW' | 'MASKED' | 'RUNE' | 'MINIBOSS' | 'BOSS';
  color: string;
  isDead: boolean;
  deathAnimTimer: number;
  hitFlash: number;
}

export interface HeroEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  facing: 1 | -1;
  invulnerableTimer: number;
  state: 'IDLE' | 'RUN' | 'JUMP' | 'SLASH' | 'DASH' | 'HURT';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  bgTheme: 'FOREST' | 'VILLAGE' | 'BAMBOO' | 'CAVE' | 'FORTRESS' | 'VALLEY' | 'TOWER' | 'CITY' | 'CASTLE' | 'THRONE';
  tables: number[];
  questionCount: number;
  enemyCountPerQuestion: number;
  enemySpeedBase: number;
  hasBoss: boolean;
  bossName?: string;
  bossHp?: number;
}

export interface UserStats {
  highScore: number;
  levelsUnlocked: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  tableStats: Record<number, { correct: number; wrong: number }>;
}
