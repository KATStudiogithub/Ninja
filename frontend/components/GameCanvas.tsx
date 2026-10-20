import React, { useRef, useEffect } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../constants';
import { HeroEntity, EnemyEntity, FloatingText, Particle, QuestionData } from '../types';

interface GameCanvasProps {
  hero: HeroEntity;
  enemies: EnemyEntity[];
  floatingTexts: FloatingText[];
  particles: Particle[];
  currentQuestion: QuestionData | null;
  bgTheme: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  hero,
  enemies,
  floatingTexts,
  particles,
  currentQuestion,
  bgTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Background based on bgTheme
    drawParallaxBackground(ctx, bgTheme, hero.x);

    // 2. Draw Ground
    drawGround(ctx, bgTheme);

    // 3. Draw Particles (Blood, sparks, slash effects)
    drawParticles(ctx, particles);

    // 4. Draw Enemies
    enemies.forEach((enemy) => {
      drawEnemy(ctx, enemy);
    });

    // 5. Draw Hero
    drawHero(ctx, hero);

    // 6. Draw Floating Texts (Combat feedback like "+100 TEPAT!", "-50 SALAH!")
    drawFloatingTexts(ctx, floatingTexts);

  }, [hero, enemies, floatingTexts, particles, currentQuestion, bgTheme]);

  return (
    <div className="relative w-full aspect-[16/9] max-w-[960px] mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block object-contain"
      />
    </div>
  );
};

// ----------------- Procedural Art Helpers ----------------- //

function drawParallaxBackground(ctx: CanvasRenderingContext2D, theme: string, heroX: number) {
  const pOffset = heroX * 0.15;

  let skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  if (theme === 'FOREST' || theme === 'BAMBOO') {
    skyGradient.addColorStop(0, '#061325');
    skyGradient.addColorStop(0.7, '#0f293d');
    skyGradient.addColorStop(1, '#1b3b3a');
  } else if (theme === 'VALLEY' || theme === 'TOWER') {
    skyGradient.addColorStop(0, '#1a0b2e');
    skyGradient.addColorStop(0.7, '#2f164f');
    skyGradient.addColorStop(1, '#4c1d95');
  } else if (theme === 'CASTLE' || theme === 'THRONE') {
    skyGradient.addColorStop(0, '#1c0505');
    skyGradient.addColorStop(0.7, '#3b0d0c');
    skyGradient.addColorStop(1, '#5c1412');
  } else {
    // Village / Fortress / Cave
    skyGradient.addColorStop(0, '#090d16');
    skyGradient.addColorStop(0.7, '#131d2e');
    skyGradient.addColorStop(1, '#1e293b');
  }
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Distant Moon
  ctx.save();
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 160, 110, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.restore();

  // Distant Mountains / Pagoda silhouette
  ctx.fillStyle = '#080c14';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= CANVAS_WIDTH; x += 120) {
    const peakH = 140 + Math.sin((x + pOffset) * 0.015) * 50;
    ctx.lineTo(x, GROUND_Y - peakH);
  }
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Mid-ground trees or torii gates
  ctx.fillStyle = '#0b1120';
  for (let i = 0; i < 7; i++) {
    const treeX = ((i * 180 - pOffset * 0.6) % (CANVAS_WIDTH + 80)) - 40;
    ctx.fillRect(treeX, GROUND_Y - 90, 12, 90);
    ctx.beginPath();
    ctx.arc(treeX + 6, GROUND_Y - 95, 32, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, theme: string) {
  // Ground Top Edge highlight
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 3);

  // Ground soil
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  groundGrad.addColorStop(0, '#111827');
  groundGrad.addColorStop(1, '#030712');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y + 3, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  // Decorative stone tiles
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < CANVAS_WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 3);
    ctx.lineTo(x + 20, CANVAS_HEIGHT);
    ctx.stroke();
  }
}

function drawHero(ctx: CanvasRenderingContext2D, hero: HeroEntity) {
  ctx.save();
  ctx.translate(hero.x + hero.width / 2, hero.y + hero.height / 2);
  if (hero.facing === -1) {
    ctx.scale(-1, 1);
  }

  // Invulnerability flicker
  if (hero.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Dash ghost effect
  if (hero.isDashing) {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
  }

  // Head & Mask (Midnight Black + Crimson Scarf)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -18, 14, 0, Math.PI * 2);
  ctx.fill();

  // Ninja Eye Visor slit
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(2, -21, 9, 4);
  ctx.fillStyle = '#ef4444'; // Red pupil glow
  ctx.fillRect(6, -20, 3, 2);

  // Flowing Crimson Ninja Scarf
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-4, -14);
  ctx.lineTo(-24 - (hero.vx * 2), -10 + Math.sin(Date.now() * 0.015) * 4);
  ctx.lineTo(-18, -6);
  ctx.lineTo(2, -10);
  ctx.closePath();
  ctx.fill();

  // Torso / Kimono
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-10, -5, 20, 24);
  // Red Belt
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-11, 7, 22, 4);

  // Legs (Running or Idle)
  ctx.fillStyle = '#0f172a';
  const legOffset = hero.state === 'RUN' ? Math.sin(Date.now() * 0.02) * 8 : 0;
  ctx.fillRect(-8, 19, 7, 16 + legOffset);
  ctx.fillRect(2, 19, 7, 16 - legOffset);

  // Katana & Slash Arc
  if (hero.isAttacking) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(14, 4, 38, -Math.PI * 0.35, Math.PI * 0.45);
    ctx.stroke();

    // Katana Blade
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(36, 12);
    ctx.stroke();
    ctx.restore();
  } else {
    // Sheathed Katana on back
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.lineTo(-4, 14);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyEntity) {
  if (enemy.isDead && enemy.deathAnimTimer <= 0) return;

  ctx.save();
  ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

  // Death fade out
  if (enemy.isDead) {
    ctx.globalAlpha = Math.max(0, enemy.deathAnimTimer / 20);
    ctx.scale(1.2, 0.6); // squish on death
  }

  // Hit Flash
  if (enemy.hitFlash > 0) {
    ctx.filter = 'brightness(2.2)';
  }

  const isBoss = enemy.type === 'BOSS' || enemy.type === 'MINIBOSS';

  // Body
  ctx.fillStyle = enemy.color;
  ctx.fillRect(-enemy.width / 2, -enemy.height / 2 + 10, enemy.width, enemy.height - 10);

  // Mask / Helmet
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -enemy.height / 2 + 8, isBoss ? 20 : 13, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Eyes (Amber or Purple)
  ctx.fillStyle = enemy.isCorrect ? '#fbbf24' : '#a855f7';
  ctx.fillRect(-8, -enemy.height / 2 + 6, 4, 3);
  ctx.fillRect(4, -enemy.height / 2 + 6, 4, 3);

  // Weapon
  ctx.strokeStyle = isBoss ? '#f43f5e' : '#cbd5e1';
  ctx.lineWidth = isBoss ? 4 : 2;
  ctx.beginPath();
  ctx.moveTo(-enemy.width / 2 - 8, 4);
  ctx.lineTo(-enemy.width / 2, 22);
  ctx.stroke();

  ctx.restore();

  // ----------------- NUMBER BADGE / BANNER ----------------- //
  // Draw clear, high-contrast mathematical number badge above enemy head
  const badgeY = enemy.y - 28;
  const badgeX = enemy.x + enemy.width / 2;

  ctx.save();
  ctx.translate(badgeX, badgeY);

  // Badge Background Shield
  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = enemy.isCorrect ? '#38bdf8' : '#e2e8f0'; // Subtle border (doesn't give away directly unless noticed)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-22, -16, 44, 30, 8);
  ctx.fill();
  ctx.stroke();

  // Little Pointer down to enemy
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(-6, 14);
  ctx.lineTo(6, 14);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fill();

  // Bold Answer Number Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.fillText(`${enemy.number}`, 0, -1);

  ctx.restore();
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.save();
  texts.forEach((ft) => {
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = '900 17px system-ui, sans-serif';
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, ft.x, ft.y);
  });
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  particles.forEach((p) => {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}
