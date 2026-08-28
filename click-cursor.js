(function () {
  const STORAGE_KEY = "arielsie-site-clicks";
  const THRESHOLD = 20;
  const script = document.currentScript;
  if (!script) return;

  const siteRoot = new URL(".", script.src);
  const mouseUrl = new URL("visuals/mouse.png", siteRoot).href;
  const mouseAuto = `url("${mouseUrl}") 16 16, auto`;
  const mousePointer = `url("${mouseUrl}") 16 16, pointer`;

  function unlockMouse() {
    const root = document.documentElement;
    root.classList.add("mouse-unlocked");
    root.style.setProperty("--site-mouse-cursor", mouseAuto);
    root.style.setProperty("--site-mouse-cursor-pointer", mousePointer);
  }

  function readCount() {
    const n = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }

  let count = readCount();
  if (count > THRESHOLD) {
    unlockMouse();
  }

  document.addEventListener(
    "click",
    () => {
      count += 1;
      localStorage.setItem(STORAGE_KEY, String(count));
      if (count > THRESHOLD) {
        unlockMouse();
      }
    },
    true
  );
})();
