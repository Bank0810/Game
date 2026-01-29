import { createInput } from "./input.js";
import { createGame, resetGame, update, render } from "./game.js";

const canvas = document.getElementById("game");
const input = createInput();
const g = createGame(canvas);

// UI
const elScore = document.getElementById("score");
const elHp = document.getElementById("hp");
const elLevel = document.getElementById("level");
const overlay = document.getElementById("overlay");
const panel = document.getElementById("panel");
const btnStart = document.getElementById("btnStart");
const btnHelp = document.getElementById("btnHelp");
const help = document.getElementById("help");

btnHelp.onclick = () => help.style.display = (help.style.display==="none") ? "block" : "none";

btnStart.onclick = () => {
  overlay.style.display = "none";
  start();
};

function hud(){
  elScore.textContent = g.score;
  elHp.textContent = g.player.hp;
  elLevel.textContent = g.level;
}

function showGameOver(){
  overlay.style.display = "grid";
  panel.innerHTML = `
    <h1 style="letter-spacing:2px;"><span style="color:#ff5a7a;font-weight:900;">GAME OVER</span></h1>
    <p>Score: <b style="color:#ffd86b">${g.score}</b> • Level: <b>${g.level}</b></p>
    <p>กด Start เพื่อเริ่มใหม่</p>
    <div class="row">
      <button id="btnRestart">Start</button>
      <button class="secondary" id="btnTips">Help</button>
    </div>
    <div class="hint" id="tips" style="display:none">
      • เดินได้ 4 ทิศ • ยิงด้วย Space<br/>
      • Level สูงขึ้น: ศัตรูเกิดถี่/เร็ว + ยิงถี่ขึ้น
    </div>
  `;
  document.getElementById("btnRestart").onclick = () => {
    overlay.style.display = "none";
    start();
  };
  document.getElementById("btnTips").onclick = () => {
    const tips = document.getElementById("tips");
    tips.style.display = (tips.style.display==="none") ? "block" : "none";
  };
}

function start(){
  resetGame(g);
  g.running = true;
  g.gameOver = false;
  last = 0;
  requestAnimationFrame(loop);
}

let last = 0;
function loop(ts){
  if (!g.running) return;

  const dt = Math.min(0.033, (ts - last)/1000 || 0);
  last = ts;

  update(g, input, dt);
  render(g);
  hud();

  if (g.gameOver){
    g.running = false;
    showGameOver();
    return;
  }

  requestAnimationFrame(loop);
}
