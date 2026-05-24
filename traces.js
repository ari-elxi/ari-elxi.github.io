const TRACE_KEY = "kcg_traces_v4";
const flow = document.getElementById("tracesFlow");

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

function render() {
  const traces = loadTraces();
  flow.innerHTML = "";

  if (!traces.length) {
    const empty = document.createElement("p");
    empty.className = "trace-line";
    empty.textContent = "no traces yet";
    flow.append(empty);
    return;
  }

  traces.forEach((trace) => {
    const block = document.createElement("article");
    block.className = "trace-block";
    const maxX = Math.max(0, flow.clientWidth - 360);
    const maxY = Math.max(0, traces.length * 120);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    block.style.left = `${x}px`;
    block.style.top = `${y}px`;

    if (trace.type === "drawing" && trace.dataUrl) {
      const img = document.createElement("img");
      img.className = "trace-image";
      img.src = trace.dataUrl;
      img.alt = "trace drawing";
      block.append(img);
      flow.append(block);
      return;
    }

    if (trace.type === "writing" && trace.text) {
      const line = document.createElement("p");
      line.className = "trace-line";
      line.textContent = trace.text;
      block.append(line);
      flow.append(block);
    }
  });

  flow.style.minHeight = `${Math.max(760, traces.length * 130)}px`;
}

render();
