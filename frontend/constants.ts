import { LevelConfig } from './types';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 440;
export const GRAVITY = 0.65;
export const JUMP_FORCE = -14.5;
export const HERO_SPEED = 5.5;
export const DASH_SPEED = 14;

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    levelNumber: 1,
    title: 'Hutan Bayangan',
    subtitle: 'Asas Sifir 2 & 3',
    bgTheme: 'FOREST',
    tables: [2, 3],
    questionCount: 5,
    enemyCountPerQuestion: 2,
    enemySpeedBase: 1.6,
    hasBoss: false
  },
  {
    levelNumber: 2,
    title: 'Kampung Ninja',
    subtitle: 'Kekuatan Sifir 2 hingga 4',
    bgTheme: 'VILLAGE',
    tables: [2, 3, 4],
    questionCount: 6,
    enemyCountPerQuestion: 3,
    enemySpeedBase: 1.8,
    hasBoss: false
  },
  {
    levelNumber: 3,
    title: 'Laluan Buluh',
    subtitle: 'Ketangkasan Sifir 3 hingga 5',
    bgTheme: 'BAMBOO',
    tables: [3, 4, 5],
    questionCount: 7,
    enemyCountPerQuestion: 3,
    enemySpeedBase: 2.0,
    hasBoss: false
  },
  {
    levelNumber: 4,
    title: 'Gua Gelap',
    subtitle: 'Fokus Sifir 4 hingga 6',
    bgTheme: 'CAVE',
    tables: [4, 5, 6],
    questionCount: 8,
    enemyCountPerQuestion: 3,
    enemySpeedBase: 2.2,
    hasBoss: false
  },
  {
    levelNumber: 5,
    title: 'Kubu Besi',
    subtitle: 'Ujian Sifir 5 - 7 & Minibos Penjaga',
    bgTheme: 'FORTRESS',
    tables: [5, 6, 7],
    questionCount: 8,
    enemyCountPerQuestion: 3,
    enemySpeedBase: 2.3,
    hasBoss: true,
    bossName: 'Penjaga Gerbang Besi',
    bossHp: 3
  },
  {
    levelNumber: 6,
    title: 'Lembah Ribut',
    subtitle: 'Kelajuan Sifir 6 hingga 8',
    bgTheme: 'VALLEY',
    tables: [6, 7, 8],
    questionCount: 8,
    enemyCountPerQuestion: 4,
    enemySpeedBase: 2.5,
    hasBoss: false
  },
  {
    levelNumber: 7,
    title: 'Menara Bayangan',
    subtitle: 'Gelombang Sifir 7 hingga 9',
    bgTheme: 'TOWER',
    tables: [7, 8, 9],
    questionCount: 9,
    enemyCountPerQuestion: 4,
    enemySpeedBase: 2.7,
    hasBoss: false
  },
  {
    levelNumber: 8,
    title: 'Kota Terlarang',
    subtitle: 'Cabaran Tajam Sifir 8 hingga 10',
    bgTheme: 'CITY',
    tables: [8, 9, 10],
    questionCount: 9,
    enemyCountPerQuestion: 4,
    enemySpeedBase: 2.8,
    hasBoss: false
  },
  {
    levelNumber: 9,
    title: 'Istana Kegelapan',
    subtitle: 'Keganasan Sifir 9 hingga 12',
    bgTheme: 'CASTLE',
    tables: [9, 10, 11, 12],
    questionCount: 10,
    enemyCountPerQuestion: 4,
    enemySpeedBase: 3.0,
    hasBoss: false
  },
  {
    levelNumber: 10,
    title: 'Takhta Raja Bayangan',
    subtitle: 'Pertarungan Terhebat Sifir 2 hingga 12',
    bgTheme: 'THRONE',
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    questionCount: 12,
    enemyCountPerQuestion: 4,
    enemySpeedBase: 3.2,
    hasBoss: true,
    bossName: 'Raja Bayangan Purba',
    bossHp: 5
  }
];
