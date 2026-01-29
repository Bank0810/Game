export function createInput(){
  const keys = new Set();

  window.addEventListener("keydown", (e) => {
    const k = e.key;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d","W","A","S","D"].includes(k)) {
      e.preventDefault();
    }
    keys.add(k);
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key));

  return {
    down: (k) => keys.has(k),
    moveX: () => (keys.has("ArrowRight")||keys.has("d")||keys.has("D") ? 1 : 0)
              - (keys.has("ArrowLeft")||keys.has("a")||keys.has("A") ? 1 : 0),
    moveY: () => (keys.has("ArrowDown")||keys.has("s")||keys.has("S") ? 1 : 0)
              - (keys.has("ArrowUp")||keys.has("w")||keys.has("W") ? 1 : 0),
    shoot: () => keys.has(" ") || keys.has("Spacebar")
  };
}
