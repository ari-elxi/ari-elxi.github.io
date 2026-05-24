const wordCursor = document.getElementById("wordCursor");
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
const defaultCursorText =
  "placeholder stream text for now this loops until my real poetic longform arrives";
const cursorText = wordCursor?.dataset.cursorText?.trim() || defaultCursorText;
const cursorWords = cursorText.split(/\s+/).filter(Boolean);
let cursorWordIndex = 0;

function spawnTrailWord(x, y, word) {
  const trail = document.createElement("span");
  trail.className = "word-trail";
  trail.textContent = word;
  trail.style.left = `${x}px`;
  trail.style.top = `${y}px`;
  document.body.append(trail);
  trail.addEventListener("animationend", () => trail.remove());
}

function tickCursorWord() {
  if (!hasFinePointer || !wordCursor) return;
  wordCursor.textContent = cursorWords[cursorWordIndex];
  cursorWordIndex = (cursorWordIndex + 1) % cursorWords.length;
}

if (hasFinePointer && wordCursor) {
  let lastTrailAt = 0;
  tickCursorWord();
  setInterval(tickCursorWord, 500);
  window.addEventListener("mousemove", (event) => {
    wordCursor.style.left = `${event.clientX}px`;
    wordCursor.style.top = `${event.clientY}px`;
    wordCursor.classList.add("visible");
    const now = performance.now();
    if (now - lastTrailAt > 130) {
      const word = cursorWords[(cursorWordIndex - 1 + cursorWords.length) % cursorWords.length];
      spawnTrailWord(event.clientX, event.clientY, word);
      lastTrailAt = now;
    }
  });
  document.addEventListener("mouseleave", () => wordCursor.classList.remove("visible"));
}
