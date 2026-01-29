import { clamp, rand } from "./utils.js";

export function createPlayer(W, H){
  return {
    x: W/2, y: H-80,
    w: 34, h: 34,
    speed: 420,
    hp: 3,
    shootCd: 0,
    invuln: 0
  };
}

export function createBullet(x, y, vy, kind){
  return { x, y, vy, kind, w: 4, h: 12 };
}

// enemy types:
// 1) "basic": ลงตรง ๆ
// 2) "zigzag": ลงพร้อมส่ายซ้ายขวา
// 3) "fast": เร็วกว่า เล็กกว่า
// 4) "tank": ช้า แต่ hp 3
export function createEnemy(type, x, y, level){
  const base = { type, x, y, t: rand(0, 999) };

  if (type === "basic"){
    return { ...base, w:34, h:34, hp:1+Math.floor(level/4), speed: 110 + level*6 };
  }
  if (type === "zigzag"){
    return { ...base, w:34, h:34, hp:1, speed: 95 + level*6, amp: 80, freq: 2.2 };
  }
  if (type === "fast"){
    return { ...base, w:28, h:28, hp:1, speed: 170 + level*10 };
  }
  // tank
  return { ...base, w:38, h:38, hp:3, speed: 70 + level*4 };
}

export function updatePlayer(player, input, dt, W, H){
  const mx = input.moveX();
  const my = input.moveY();
  const len = Math.hypot(mx, my) || 1;
  const nx = mx / len;
  const ny = my / len;

  player.x += nx * player.speed * dt;
  player.y += ny * player.speed * dt;

  player.x = clamp(player.x, 20, W-20);
  player.y = clamp(player.y, 40, H-30);

  player.shootCd = Math.max(0, player.shootCd - dt);
  player.invuln = Math.max(0, player.invuln - dt);
}

export function updateEnemy(e, dt, W, level){
  e.t += dt;

  if (e.type === "basic" || e.type === "fast" || e.type === "tank"){
    e.y += e.speed * dt;
  } else if (e.type === "zigzag"){
    e.y += e.speed * dt;
    e.x += Math.sin(e.t * e.freq) * e.amp * dt;
    e.x = clamp(e.x, 20, W-20);
  }
}

export function updateBullets(arr, dt){
  for (const b of arr) b.y += b.vy * dt;
}
