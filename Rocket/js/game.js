import { makeStars } from "./utils.js";
import { aabb } from "./collision.js";
import {
  createPlayer, createBullet,
  updatePlayer, updateEnemy, updateBullets
} from "./entities.js";
import { createSpawner, updateSpawner } from "./spawner.js";

export function createGame(canvas){
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const state = {
    W, H, ctx,
    stars: makeStars(W, H),
    player: createPlayer(W, H),
    bullets: [],
    enemies: [],
    enemyBullets: [],
    particles: [],
    score: 0,
    level: 1,
    running: false,
    gameOver: false,
    spawner: createSpawner(W),
  };

  return state;
}

export function resetGame(g){
  g.player.x = g.W/2; g.player.y = g.H-80;
  g.player.hp = 10; g.player.shootCd = 0; g.player.invuln = 0;
  g.bullets = []; g.enemies = []; g.enemyBullets = []; g.particles = [];
  g.score = 0; g.level = 1;
  g.gameOver = false;
  g.spawner.timer = 0;
}

function burst(g, x, y, colorA="#7df9ff", colorB="#ff5a7a"){
  for (let i=0;i<14;i++){
    g.particles.push({
      x, y,
      vx:(Math.random()*2-1)*220,
      vy:(Math.random()*2-1)*220,
      life: 0.18 + Math.random()*0.28,
      t: 0,
      c: Math.random()<0.6?colorA:colorB,
      s: Math.random()<0.7?3:2
    });
  }
}

export function update(g, input, dt){
  // stars
  for (const s of g.stars){
    s.y += s.v*dt;
    if (s.y > g.H){ s.y = -5; s.x = Math.random()*g.W; }
  }

  if (g.gameOver) return;

  // level up by score
  const nextLevel = 1 + Math.floor(g.score / 200);
  g.level = Math.max(g.level, nextLevel);

  // player
  updatePlayer(g.player, input, dt, g.W, g.H);

  // shoot
  if (input.shoot() && g.player.shootCd <= 0){
    g.bullets.push(createBullet(g.player.x, g.player.y-22, -720, "player"));
    g.player.shootCd = 0.12;
  }

  // spawn enemies
  updateSpawner(g.spawner, g.enemies, dt, g.level);

  // enemies update + enemy fire
  for (const e of g.enemies){
    updateEnemy(e, dt, g.W, g.level);

    // ยิงลงมา (โอกาสตาม level)
    const p = (0.25 + g.level*0.04) * dt;
    if (Math.random() < p){
      g.enemyBullets.push(createBullet(e.x, e.y+20, 320 + g.level*25, "enemy"));
    }
  }

  // bullets update
  updateBullets(g.bullets, dt);
  updateBullets(g.enemyBullets, dt);

  // cleanup bullets
  g.bullets = g.bullets.filter(b => b.y > -60);
  g.enemyBullets = g.enemyBullets.filter(b => b.y < g.H + 80);

  // bullet vs enemy
  for (let i=g.bullets.length-1;i>=0;i--){
    const b = g.bullets[i];
    for (let j=g.enemies.length-1;j>=0;j--){
      const e = g.enemies[j];
      if (aabb(b.x-2,b.y-6,4,12, e.x-e.w/2,e.y-e.h/2,e.w,e.h)){
        g.bullets.splice(i,1);
        e.hp -= 1;
        burst(g, e.x, e.y, "#ffd86b", "#ff5a7a");
        if (e.hp <= 0){
          g.enemies.splice(j,1);
          g.score += (e.type==="tank"?30 : e.type==="fast"?18 : e.type==="zigzag"?16 : 12);
        } else {
          g.score += 3;
        }
        break;
      }
    }
  }

  // enemy bullet vs player
  if (g.player.invuln <= 0){
    for (let i=g.enemyBullets.length-1;i>=0;i--){
      const b = g.enemyBullets[i];
      if (aabb(b.x-2,b.y-6,4,12, g.player.x-17,g.player.y-17,34,34)){
        g.enemyBullets.splice(i,1);
        burst(g, g.player.x, g.player.y);
        damage(g, 1);
        break;
      }
    }
  }

  // enemy touches player OR enemy reaches bottom
  for (let i=g.enemies.length-1;i>=0;i--){
    const e = g.enemies[i];

    if (e.y > g.H + 60){
      g.enemies.splice(i,1);
      damage(g, 1);
      continue;
    }

    if (g.player.invuln <= 0 && aabb(e.x-e.w/2,e.y-e.h/2,e.w,e.h, g.player.x-17,g.player.y-17,34,34)){
      g.enemies.splice(i,1);
      burst(g, g.player.x, g.player.y);
      damage(g, 1);
      break;
    }
  }

  // particles
  for (const p of g.particles){
    p.t += dt;
    p.x += p.vx*dt;
    p.y += p.vy*dt;
  }
  g.particles = g.particles.filter(p => p.t < p.life);
}

function damage(g, amount){
  g.player.hp -= amount;
  g.player.invuln = 1.0;
  if (g.player.hp <= 0){
    g.gameOver = true;
  }
}

export function render(g){
  const { ctx, W, H } = g;
  ctx.clearRect(0,0,W,H);

  // bg
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fillRect(0,0,W,H);

  // stars
  ctx.fillStyle = "rgba(255,255,255,.7)";
  for (const s of g.stars){
    ctx.globalAlpha = 0.35;
    ctx.fillRect(s.x, s.y, s.s, s.s);
    ctx.globalAlpha = 1;
  }

  // player (blink if invuln)
  if (g.player.invuln > 0){
    const blink = Math.floor(performance.now()/80)%2===0;
    if (blink) drawPlayer(ctx, g.player.x, g.player.y);
  } else {
    drawPlayer(ctx, g.player.x, g.player.y);
  }

  // enemies
  for (const e of g.enemies) drawEnemy(ctx, e);

  // bullets
  for (const b of g.bullets) drawBullet(ctx, b, true);
  for (const b of g.enemyBullets) drawBullet(ctx, b, false);

  // particles
  for (const p of g.particles){
    const a = 1 - (p.t/p.life);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.s, p.s);
    ctx.globalAlpha = 1;
  }
}

function drawPlayer(ctx, x, y){
  // pixel-ish ship
  ctx.fillStyle = "#c7b3ff"; ctx.fillRect(x-10,y-6,20,18);
  ctx.fillStyle = "#7df9ff"; ctx.fillRect(x-6,y-14,12,10);
  ctx.fillStyle = "#8a66ff"; ctx.fillRect(x-18,y-4,8,10); ctx.fillRect(x+10,y-4,8,10);
  ctx.fillStyle = "#ffcf6a"; ctx.fillRect(x-3,y+12,6,8);
  ctx.fillStyle = "#ff5a7a"; ctx.fillRect(x-2,y+18,4,8);
}

function drawEnemy(ctx, e){
  const x=e.x, y=e.y;

  if (e.type==="fast"){
    ctx.fillStyle="#7df9ff"; ctx.fillRect(x-10,y-10,20,20);
    ctx.fillStyle="#14082a"; ctx.fillRect(x-6,y-2,12,6);
    return;
  }

  if (e.type==="tank"){
    ctx.fillStyle="#ffd86b"; ctx.fillRect(x-16,y-16,32,32);
    ctx.fillStyle="#14082a"; ctx.fillRect(x-10,y-4,20,10);
    ctx.fillStyle="rgba(255,255,255,.2)"; ctx.fillRect(x-16,y-16,32,2);
    return;
  }

  // basic/zigzag
  ctx.fillStyle="#ffd86b"; ctx.fillRect(x-12,y-12,24,24);
  ctx.fillStyle="#14082a"; ctx.fillRect(x-8,y-6,16,10);
  ctx.fillStyle="#7df9ff"; ctx.fillRect(x-6,y-4,4,4); ctx.fillRect(x+2,y-4,4,4);
  ctx.fillStyle="rgba(255,255,255,.12)"; ctx.fillRect(x-13,y-13,26,2);
}

function drawBullet(ctx, b, isPlayer){
  ctx.fillStyle = isPlayer ? "#7df9ff" : "#ff5a7a";
  ctx.fillRect(b.x-2, b.y-6, 4, 12);
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.fillRect(b.x-1, b.y-4, 2, 8);
}
