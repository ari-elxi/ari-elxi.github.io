(function () {
  const STORAGE_KEY = "arielsie-site-clicks";
  const THRESHOLD = 20;
  const script = document.currentScript;
  if (!script) return;

  // Browsers reject custom cursors larger than ~128px — use the small asset.
  const siteRoot = new URL(".", script.src);
  const mouseUrl = new URL("visuals/mouse-cursor.png", siteRoot).href;
  const mouseAuto = `url("${mouseUrl}") 16 16, auto`;
  const mousePointer = `url("${mouseUrl}") 16 16, pointer`;

  function unlockMouse() {
    const root = document.documentElement;
    root.classList.add("mouse-unlocked");
    root.style.setProperty("--site-mouse-cursor", mouseAuto);
    root.style.setProperty("--site-mouse-cursor-pointer", mousePointer);
  }

  function readCount() {
    // sessionStorage: survives subpage navigations in this tab, resets on a new visit
    const n = parseInt(sessionStorage.getItem(STORAGE_KEY) || "0", 10);
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
      try {
        sessionStorage.setItem(STORAGE_KEY, String(count));
      } catch (_) {
        /* private mode / blocked storage */
      }
      if (count > THRESHOLD) {
        unlockMouse();
      }
    },
    true
  );
})();
