export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => Math.random() * (b - a) + a;
export const chance = (p) => Math.random() < p;

export function makeStars(W, H, n = 140){
  return Array.from({length:n}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    s: rand(1,3),
    v: rand(20,90)
  }));
}
