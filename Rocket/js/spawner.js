import { rand, chance } from "./utils.js";
import { createEnemy } from "./entities.js";

export function createSpawner(W){
  return {
    timer: 0,
    interval: 0.85, // จะถูกลดลงตาม level
    spawn(enemies, level){
      // ปรับความถี่เกิดตาม level
      const interval = Math.max(0.28, 0.85 - level*0.05);

      this.timer -= interval;
      // type distribution
      // level น้อย: basic เยอะ
      // level สูง: zigzag/fast/tank เพิ่ม
      const r = Math.random();
      let type = "basic";
      if (level >= 2 && r > 0.65) type = "zigzag";
      if (level >= 3 && r > 0.78) type = "fast";
      if (level >= 5 && r > 0.92) type = "tank";

      const x = rand(40, W-40);
      const y = -30;

      enemies.push(createEnemy(type, x, y, level));

      // บางทีเกิด 2 ตัวติดกัน
      if (level >= 4 && chance(0.20)){
        enemies.push(createEnemy(type, rand(40, W-40), -60, level));
      }
    }
  };
}

export function updateSpawner(spawner, enemies, dt, level){
  spawner.timer += dt;

  const interval = Math.max(0.28, 0.85 - level*0.05);
  while (spawner.timer >= interval){
    spawner.spawn(enemies, level);
  }
}
