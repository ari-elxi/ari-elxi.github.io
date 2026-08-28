const gate = document.getElementById("landing");
const home = document.getElementById("home");
const gateTitle = document.getElementById("gateTitle");
const gateDescription = document.getElementById("gateDescription");
const gateHint = document.getElementById("gateHint");
const methodArea = document.getElementById("methodArea");

const TRACE_KEY = "kcg_traces_v4";
const MAX_TRACES = 12;

let entered = false;

function setHint(message) {
  gateHint.textContent = message;
}

function loadTraces() {
  try {
    const raw = localStorage.getItem(TRACE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTraces(traces) {
  localStorage.setItem(TRACE_KEY, JSON.stringify(traces.slice(0, MAX_TRACES)));
}

function addTrace(item) {
  const traces = loadTraces();
  const next = [{ ...item, createdAt: Date.now() }, ...traces].slice(0, MAX_TRACES);
  saveTraces(next);
}

function openPortal() {
  if (entered) return;
  entered = true;
  document.body.classList.add("home-active");
  document.body.classList.remove("gate-dark");
  gate.classList.add("fade-out");
  setTimeout(() => {
    gate.style.display = "none";
    home.classList.remove("hidden");
  }, 700);
}

function createEnterButton(label = "Enter") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost-button quiet-enter";
  button.textContent = label;
  button.style.visibility = "hidden";
  button.style.opacity = "0";
  button.style.pointerEvents = "none";
  button.addEventListener("click", openPortal);
  return button;
}

function setEnterReady(button, ready) {
  button.style.visibility = ready ? "visible" : "hidden";
  button.style.opacity = ready ? "1" : "0";
  button.style.pointerEvents = ready ? "auto" : "none";
}

function setupHoldMethod() {
  let holdProgress = 0;
  let holdLastFrame = 0;
  let holdIsActive = false;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "ghost-button";
  button.innerHTML =
    '<span>Hold to open</span><span class="progress-ring" aria-hidden="true"></span>';
  methodArea.append(button);

  const holdTargetMs = 1700;
  const renderProgress = () => button.style.setProperty("--progress", holdProgress.toFixed(3));

  const frame = (timestamp) => {
    if (!holdLastFrame) holdLastFrame = timestamp;
    const delta = timestamp - holdLastFrame;
    holdLastFrame = timestamp;

    if (holdIsActive && !entered) {
      holdProgress += delta / holdTargetMs;
      if (holdProgress >= 1) {
        holdProgress = 1;
        renderProgress();
        openPortal();
      } else {
        renderProgress();
        setHint(`Stabilizing... ${Math.round(holdProgress * 100)}%`);
      }
    } else if (!holdIsActive && !entered && holdProgress > 0) {
      holdProgress = Math.max(0, holdProgress - delta / 900);
      renderProgress();
      if (holdProgress === 0) setHint("Press and hold.");
    }

    if (!entered) requestAnimationFrame(frame);
  };

  button.addEventListener("pointerdown", () => {
    holdIsActive = true;
    setHint("Stabilizing...");
  });
  window.addEventListener("pointerup", () => {
    holdIsActive = false;
  });
  window.addEventListener("pointercancel", () => {
    holdIsActive = false;
  });
  window.addEventListener("blur", () => {
    holdIsActive = false;
  });

  renderProgress();
  requestAnimationFrame(frame);
}

function setupTypeMethod() {
  const input = document.createElement("input");
  input.className = "inline-input";
  input.placeholder = "Type OPEN and press Enter";
  input.setAttribute("aria-label", "Type the unlock word");
  methodArea.append(input);

  setHint("Type OPEN to unlock.");
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (input.value.trim().toUpperCase() === "OPEN") openPortal();
    else setHint("Not quite. Try OPEN.");
  });
}

function setupClickMethod() {
  const dotWrap = document.createElement("div");
  dotWrap.className = "target-dots";
  const dots = [];
  for (let i = 0; i < 4; i += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "target-dot";
    dot.setAttribute("aria-label", `Sequence step ${i + 1}`);
    dots.push(dot);
    dotWrap.append(dot);
  }
  methodArea.append(dotWrap);

  let progress = 0;
  setHint("Click the 4 dots in order.");
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (index === progress) {
        dot.classList.add("active");
        progress += 1;
        if (progress === dots.length) openPortal();
      } else {
        progress = 0;
        dots.forEach((item) => item.classList.remove("active"));
        setHint("Sequence reset. Start from the first dot.");
      }
    });
  });
}

function setupDragMethod() {
  const track = document.createElement("div");
  track.className = "orb-track";
  const orb = document.createElement("div");
  orb.className = "orb";
  track.append(orb);
  methodArea.append(track);

  setHint("Drag the orb all the way right.");
  const maxX = () => track.clientWidth - orb.clientWidth - 8;
  let dragOffset = 0;
  let currentX = 8;
  const setOrbX = (x) => {
    currentX = Math.max(8, Math.min(x, maxX()));
    orb.style.left = `${currentX}px`;
  };

  orb.addEventListener("pointerdown", (event) => {
    orb.classList.add("dragging");
    orb.setPointerCapture(event.pointerId);
    dragOffset = event.clientX - currentX;
  });
  orb.addEventListener("pointermove", (event) => {
    if (!orb.classList.contains("dragging")) return;
    setOrbX(event.clientX - dragOffset);
  });
  const release = () => {
    if (!orb.classList.contains("dragging")) return;
    orb.classList.remove("dragging");
    if (currentX >= maxX() - 4) return openPortal();
    setHint("Almost. Drag further right.");
    setOrbX(8);
  };
  orb.addEventListener("pointerup", release);
  orb.addEventListener("pointercancel", release);
}

function setupDrawForNextVisitorMethod() {
  document.body.classList.add("gate-dark");
  setHint("");

  const shell = document.createElement("div");
  shell.className = "draw-shell";
  const toolbar = document.createElement("div");
  toolbar.className = "draw-toolbar";
  const penLabel = document.createElement("label");
  penLabel.textContent = "Pen";
  penLabel.style.fontSize = "0.85rem";
  penLabel.style.color = "#fff";
  const sizePicker = document.createElement("input");
  sizePicker.type = "range";
  sizePicker.min = "1";
  sizePicker.max = "12";
  sizePicker.value = "3";

  const textLabel = document.createElement("label");
  textLabel.textContent = "Text";
  textLabel.style.fontSize = "0.85rem";
  textLabel.style.color = "#fff";
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.maxLength = 40;
  textInput.placeholder = "optional";
  textInput.className = "draw-text-input";
  const textButton = document.createElement("button");
  textButton.type = "button";
  textButton.className = "ghost-button draw-text-button";
  textButton.textContent = "add text";

  penLabel.append(sizePicker);
  textLabel.append(textInput);
  toolbar.append(penLabel, textLabel, textButton);

  const canvas = document.createElement("canvas");
  canvas.className = "draw-canvas";
  const textLayer = document.createElement("div");
  textLayer.className = "draw-text-layer";
  const meter = document.createElement("div");
  meter.className = "draw-meter";
  const enterButton = createEnterButton("Enter");
  const drawStage = document.createElement("div");
  drawStage.className = "draw-stage";
  drawStage.append(canvas, textLayer);
  shell.append(toolbar, drawStage, meter, enterButton);
  methodArea.append(shell);

  const ctx = canvas.getContext("2d");
  const drawTarget = 1100;
  let drawing = false;
  let drawnDistance = 0;
  let lastX = 0;
  let lastY = 0;
  let draggingTextEl = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
  };
  resize();
  window.addEventListener("resize", resize);

  const updateMeter = () => {
    const pct = Math.min(100, Math.round((drawnDistance / drawTarget) * 100));
    meter.textContent = `${pct}%`;
    if (drawnDistance >= drawTarget) {
      setEnterReady(enterButton, true);
    }
  };
  updateMeter();

  const getPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDraw = (event) => {
    const pt = getPoint(event);
    if (event.target.classList.contains("draw-text-mark")) {
      draggingTextEl = event.target;
      const left = Number(draggingTextEl.dataset.x);
      const top = Number(draggingTextEl.dataset.y);
      dragOffsetX = pt.x - left;
      dragOffsetY = pt.y - top;
      return;
    }
    drawing = true;
    lastX = pt.x;
    lastY = pt.y;
  };

  const moveDraw = (event) => {
    const pt = getPoint(event);
    if (draggingTextEl) {
      const x = Math.max(8, Math.min(canvas.width - 20, pt.x - dragOffsetX));
      const y = Math.max(16, Math.min(canvas.height - 8, pt.y - dragOffsetY));
      draggingTextEl.dataset.x = String(x);
      draggingTextEl.dataset.y = String(y);
      draggingTextEl.style.left = `${x}px`;
      draggingTextEl.style.top = `${y}px`;
      return;
    }
    if (!drawing) return;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Number(sizePicker.value);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    const dx = pt.x - lastX;
    const dy = pt.y - lastY;
    drawnDistance += Math.sqrt(dx * dx + dy * dy);
    lastX = pt.x;
    lastY = pt.y;
    updateMeter();
  };

  const stopDraw = () => {
    drawing = false;
    draggingTextEl = null;
  };

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  canvas.addEventListener("pointerup", stopDraw);
  canvas.addEventListener("pointerleave", stopDraw);
  canvas.addEventListener("pointercancel", stopDraw);
  textLayer.addEventListener("pointerdown", startDraw);
  textLayer.addEventListener("pointermove", moveDraw);
  textLayer.addEventListener("pointerup", stopDraw);
  textLayer.addEventListener("pointercancel", stopDraw);

  textButton.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) return;
    const mark = document.createElement("span");
    mark.className = "draw-text-mark";
    mark.textContent = text;
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    mark.dataset.x = String(x);
    mark.dataset.y = String(y);
    mark.style.left = `${x}px`;
    mark.style.top = `${y}px`;
    textLayer.append(mark);
    drawnDistance += 90;
    updateMeter();
  });

  enterButton.addEventListener("click", () => {
    const marks = textLayer.querySelectorAll(".draw-text-mark");
    marks.forEach((mark) => {
      ctx.fillStyle = "#ffffff";
      ctx.font = "18px Space Grotesk, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(mark.textContent || "", Number(mark.dataset.x), Number(mark.dataset.y));
    });
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");
    exportCtx.drawImage(canvas, 0, 0);
    const imageData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
    const px = imageData.data;
    for (let i = 0; i < px.length; i += 4) {
      const brightness = Math.max(px[i], px[i + 1], px[i + 2]);
      px[i] = 255;
      px[i + 1] = 255;
      px[i + 2] = 255;
      px[i + 3] = brightness;
    }
    exportCtx.putImageData(imageData, 0, 0);
    addTrace({ type: "drawing", dataUrl: exportCanvas.toDataURL("image/png") });
  });
}

function setupRandomMethod() {
  methodArea.innerHTML = "";
  document.body.classList.remove("gate-dark");

  gateTitle.textContent = "hello";
  gateDescription.textContent = "draw something for the next visitor";
  setupDrawForNextVisitorMethod();
}

if (window.location.hash === "#home") {
  entered = true;
  gate.style.display = "none";
  home.classList.remove("hidden");
  document.body.classList.add("home-active");
} else {
  setupRandomMethod();
}

const SPRAY_COLORS = ["#a855f7", "#ec4899", "#60a5fa", "#ffffff"];

function setupDraggableCan() {
  const can = document.querySelector(".home-can");
  const homeEl = document.getElementById("home");
  const belowSpray = homeEl?.querySelector(".home-below-spray");
  if (!can || !homeEl || !belowSpray) return;

  const canvas = document.createElement("canvas");
  canvas.id = "sprayTrace";
  canvas.setAttribute("aria-hidden", "true");
  belowSpray.insertAdjacentElement("afterend", canvas);
  const ctx = canvas.getContext("2d");

  const canWrap = document.querySelector(".home-can-wrap");
  const canSpacer = document.querySelector(".home-can-spacer");
  let userMovedCan = false;

  function syncCanWrapToSpacer() {
    if (!canWrap || !canSpacer || userMovedCan) return;
    const r = canSpacer.getBoundingClientRect();
    canWrap.style.position = "fixed";
    canWrap.style.left = `${r.left}px`;
    canWrap.style.top = `${r.top}px`;
    canWrap.style.width = `${r.width}px`;
    canWrap.style.height = `${r.height}px`;
    canWrap.style.zIndex = "20";
  }

  syncCanWrapToSpacer();
  requestAnimationFrame(syncCanWrapToSpacer);
  window.addEventListener("resize", syncCanWrapToSpacer);
  if (typeof ResizeObserver !== "undefined" && canSpacer) {
    const ro = new ResizeObserver(syncCanWrapToSpacer);
    ro.observe(canSpacer);
  }
  document.fonts?.ready?.then(() => syncCanWrapToSpacer());

  let sprayColorIndex = 0;

  function resizeSprayCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width === w && canvas.height === h) return;
    const prev = document.createElement("canvas");
    prev.width = canvas.width;
    prev.height = canvas.height;
    if (canvas.width > 0 && canvas.height > 0) {
      prev.getContext("2d").drawImage(canvas, 0, 0);
    }
    canvas.width = w;
    canvas.height = h;
    if (prev.width > 0) {
      ctx.drawImage(prev, 0, 0);
    }
  }

  function clearSprayCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  resizeSprayCanvas();
  window.addEventListener("resize", resizeSprayCanvas);

  function currentSprayColor() {
    return SPRAY_COLORS[sprayColorIndex % SPRAY_COLORS.length];
  }

  function cycleSprayColor() {
    sprayColorIndex = (sprayColorIndex + 1) % SPRAY_COLORS.length;
  }

  function sprayBlob(cx, cy, color) {
    const radius = 22 + Math.random() * 14;
    const count = 20 + Math.floor(Math.random() * 16);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const jitter = 0.35 + Math.random() * 0.65;
      const x = cx + Math.cos(angle) * r * jitter;
      const y = cy + Math.sin(angle) * r * jitter;
      const size = 0.4 + Math.random() * 2.2;
      ctx.globalAlpha = 0.12 + Math.random() * 0.28;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function sprayAlongSegment(x1, y1, x2, y2, color) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(dist / 6));
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      sprayBlob(x, y, color);
    }
  }

  function getCanCenter() {
    const r = can.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  const DRAG_THRESHOLD_PX = 8;

  let pointerActive = false;
  let startClientX = 0;
  let startClientY = 0;
  let hasDragged = false;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let lastSprayX = 0;
  let lastSprayY = 0;

  function applyFixedFromPointer(event) {
    const rect = can.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    can.style.width = `${rect.width}px`;
    can.style.height = `${rect.height}px`;
    can.style.position = "fixed";
    can.style.left = `${rect.left}px`;
    can.style.top = `${rect.top}px`;
    can.style.margin = "0";
    can.classList.add("is-dragging");
  }

  function moveCanToPointer(event) {
    const margin = 8;
    const w = can.offsetWidth;
    const h = can.offsetHeight;
    let left = event.clientX - offsetX;
    let top = event.clientY - offsetY;
    left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - h - margin));
    can.style.left = `${left}px`;
    can.style.top = `${top}px`;
  }

  function onWindowPointerMove(event) {
    if (!pointerActive) return;
    const dx = event.clientX - startClientX;
    const dy = event.clientY - startClientY;
    if (!hasDragged && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

    if (!hasDragged) {
      hasDragged = true;
      userMovedCan = true;
      const fromCenter = getCanCenter();
      applyFixedFromPointer(event);
      moveCanToPointer(event);
      try {
        can.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      dragging = true;
      const c = getCanCenter();
      sprayAlongSegment(fromCenter.x, fromCenter.y, c.x, c.y, currentSprayColor());
      lastSprayX = c.x;
      lastSprayY = c.y;
      event.preventDefault();
      return;
    }

    if (!dragging) return;
    event.preventDefault();
    moveCanToPointer(event);
    const c = getCanCenter();
    sprayAlongSegment(lastSprayX, lastSprayY, c.x, c.y, currentSprayColor());
    lastSprayX = c.x;
    lastSprayY = c.y;
  }

  function onWindowPointerUp(event) {
    if (!pointerActive) return;
    const wasColorTap = !hasDragged;
    pointerActive = false;
    window.removeEventListener("pointermove", onWindowPointerMove);
    window.removeEventListener("pointerup", onWindowPointerUp);
    window.removeEventListener("pointercancel", onWindowPointerUp);

    if (wasColorTap) {
      cycleSprayColor();
    }

    if (dragging) {
      dragging = false;
      can.classList.remove("is-dragging");
      try {
        if (event.pointerId != null) can.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }

    hasDragged = false;
  }

  can.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    pointerActive = true;
    hasDragged = false;
    startClientX = event.clientX;
    startClientY = event.clientY;
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);
  });

  function isEmptySpaceDoubleClickTarget(target) {
    if (!target || target.nodeType !== Node.ELEMENT_NODE) return true;
    if (target.closest(".home-can, .home-can-wrap")) return false;
    if (target.closest("a[href], button, input, textarea, select, label, [role='button']")) {
      return false;
    }
    if (target.closest("#methodArea, .ghost-button, .target-dot, .inline-input, .orb-track")) {
      return false;
    }
    return true;
  }

  document.addEventListener(
    "dblclick",
    (event) => {
      if (!isEmptySpaceDoubleClickTarget(event.target)) return;
      clearSprayCanvas();
    },
    true
  );
}

setupDraggableCan();

async function setupSelfConvo() {
  const btn = document.querySelector(".home-self-btn");
  const bubble = document.querySelector(".home-convo-bubble");
  const bubbleText = document.querySelector(".home-convo-bubble__text");
  if (!btn || !bubble || !bubbleText) return;

  const FADE_MS = 400;
  const HOLD_MS = 1300;
  let hideTimer = null;
  let facts = [];

  try {
    const response = await fetch("funFacts.txt");
    if (response.ok) {
      const raw = await response.text();
      facts = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    }
  } catch {
    facts = [];
  }

  if (!facts.length) {
    facts = ["Hello, welcome to my website!"];
  }

  let factIndex = 0;
  let lastLineRepeatsLeft = 0;

  function nextFact() {
    const lastIndex = facts.length - 1;

    if (lastLineRepeatsLeft > 0) {
      lastLineRepeatsLeft -= 1;
      if (lastLineRepeatsLeft === 0) {
        factIndex = 0;
      }
      return facts[lastIndex];
    }

    const fact = facts[factIndex];
    if (factIndex === lastIndex) {
      lastLineRepeatsLeft = 4;
      factIndex = 0;
    } else {
      factIndex += 1;
    }
    return fact;
  }

  btn.addEventListener("click", () => {
    clearTimeout(hideTimer);
    bubbleText.textContent = nextFact();
    bubble.classList.add("is-visible");
    hideTimer = setTimeout(() => {
      bubble.classList.remove("is-visible");
    }, FADE_MS + HOLD_MS);
  });
}

setupSelfConvo();
