import MindElixir from "mind-elixir";
import { generateSvg } from "./painter";

function insertCss() {
  const style = document.createElement("style");
  style.innerText = `
form {
  display: none;
}

.map-container .map-canvas root tpc #input-box:not(selected) {
  color: #35ac8b !important;
}
  `;
  document.head.appendChild(style);
}

function init() {
  insertCss();
  let container = document.getElementById("map");
  if (!container) {
    container = document.createElement("div");
    container.id = "map";
    container.style.height = "100vh";
    document.body.appendChild(container);
  }

  function getData() {
    try {
      const form = document.querySelector("form");
      const formData = new FormData(form);
      const svg = decodeURIComponent(formData.get("openedSvg"));
      const res = /content="(.*?)"/.exec(svg);
      const content = decodeURIComponent(res[1]);
      return JSON.parse(content);
    } catch (err) {
      return MindElixir.new("New topic");
    }
  }

  setTimeout(() => {
    const data = getData();
    let mind = new MindElixir({
      el: "#map",
      direction: data.direction || MindElixir.RIGHT,
      // create new map data
      data: data,
      draggable: true, // default true
      contextMenu: true, // default true
      toolBar: true, // default true
      nodeMenu: true, // default true
      keypress: true, // default true
    });

    function syncToForm() {
      const svg = generateSvg();
      const data = mind.getAllData();
      data.direction = mind.direction;
      const encodedData = encodeURIComponent(JSON.stringify(data));
      const withData = svg.replace("<svg", `<svg content="${encodedData}"`);
      const input = document.getElementById("savedSvg");
      input.value = withData;
    }

    mind.bus.addListener("operation", (operation) => {
      syncToForm();
    });

    mind.init();

    syncToForm();
  }, 0);

  // 防止按 Enter 和 ESC 关闭弹窗
  document.body.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === "Esc") {
      ev.stopPropagation();
      ev.preventDefault();
    }
  });
}

init();
